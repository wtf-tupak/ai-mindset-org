from unittest.mock import AsyncMock, MagicMock, patch

import pytest


@pytest.mark.asyncio
async def test_init_pipeline_runs_all_sources():
    """All 6 sources are called and LLM build_pkb_from_summaries is called."""
    with (
        patch("pipelines.init_pipeline.GoogleDriveSource") as mock_drive,
        patch("pipelines.init_pipeline.GmailSource") as mock_gmail,
        patch("pipelines.init_pipeline.TelegramGroupSource") as mock_tg_group,
        patch("pipelines.init_pipeline.TelegramDMSource") as mock_tg_dm,
        patch("pipelines.init_pipeline.MooTeamSource") as mock_moo,
        patch("pipelines.init_pipeline.ObsidianNotesSource") as mock_obs,
        patch("pipelines.init_pipeline.LLMProcessor") as mock_llm,
        patch("pipelines.init_pipeline.PKBWriter") as mock_writer,
    ):
        for m in [mock_drive, mock_gmail, mock_tg_group, mock_tg_dm]:
            m.return_value.fetch_async = AsyncMock(return_value=[{"id": "1"}])
        # mootem returns dict
        mock_moo.return_value.fetch_async = AsyncMock(
            return_value={"tasks": [], "comments": {}, "workspace_slug": "ws"}
        )
        mock_obs.return_value.fetch_async = AsyncMock(return_value=[{"filename": "note.md", "content": "text"}])

        llm_instance = MagicMock()
        llm_instance.summarize_source = AsyncMock(return_value="summary text")
        llm_instance.build_pkb_from_summaries = AsyncMock(return_value="# PKB Content")
        mock_llm.return_value = llm_instance

        writer_instance = MagicMock()
        writer_instance.load_template.return_value = "# Template"
        mock_writer.return_value = writer_instance

        logger = MagicMock()
        logger.log_source = MagicMock()

        config = {
            "project_id": "test",
            "project_name": "Тест",
            "obsidian_path": "p",
            "channels": {
                "google_drive_folder_id": "1",
                "gmail_label": "l",
                "telegram_group_id": -1,
                "telegram_dm_contacts": ["u"],
                "moo_team_project_id": 1,
                "moo_team_workspace_slug": "ws",
            },
            "keywords": [],
            "domains": [],
        }

        from pipelines.init_pipeline import run_init

        await run_init(config, history_days=30, logger=logger)

        assert mock_drive.return_value.fetch_async.called
        assert mock_gmail.return_value.fetch_async.called
        assert mock_tg_group.return_value.fetch_async.called
        assert mock_tg_dm.return_value.fetch_async.called
        assert mock_moo.return_value.fetch_async.called
        assert mock_obs.return_value.fetch_async.called
        assert llm_instance.build_pkb_from_summaries.called
        assert writer_instance.write.called
        assert writer_instance.update_sync_timestamp.called


@pytest.mark.asyncio
async def test_init_pipeline_continues_on_source_error():
    """One source error does not abort the pipeline."""
    with (
        patch("pipelines.init_pipeline.GoogleDriveSource") as mock_drive,
        patch("pipelines.init_pipeline.GmailSource") as mock_gmail,
        patch("pipelines.init_pipeline.TelegramGroupSource") as mock_tg_group,
        patch("pipelines.init_pipeline.TelegramDMSource") as mock_tg_dm,
        patch("pipelines.init_pipeline.MooTeamSource") as mock_moo,
        patch("pipelines.init_pipeline.ObsidianNotesSource") as mock_obs,
        patch("pipelines.init_pipeline.LLMProcessor") as mock_llm,
        patch("pipelines.init_pipeline.PKBWriter") as mock_writer,
    ):
        # Gmail fails
        mock_gmail.return_value.fetch_async = AsyncMock(side_effect=Exception("SMTP error"))
        for m in [mock_drive, mock_tg_group, mock_tg_dm, mock_obs]:
            m.return_value.fetch_async = AsyncMock(return_value=[{"id": "1"}])
        mock_moo.return_value.fetch_async = AsyncMock(
            return_value={"tasks": [], "comments": {}, "workspace_slug": "ws"}
        )

        llm_instance = MagicMock()
        llm_instance.summarize_source = AsyncMock(return_value="summary")
        llm_instance.build_pkb_from_summaries = AsyncMock(return_value="# PKB")
        mock_llm.return_value = llm_instance

        writer_instance = MagicMock()
        writer_instance.load_template.return_value = "# Template"
        mock_writer.return_value = writer_instance

        logger = MagicMock()

        config = {
            "project_id": "test",
            "project_name": "Тест",
            "obsidian_path": "p",
            "channels": {
                "google_drive_folder_id": "1",
                "gmail_label": "l",
                "telegram_group_id": -1,
                "telegram_dm_contacts": ["u"],
                "moo_team_project_id": 1,
                "moo_team_workspace_slug": "ws",
            },
            "keywords": [],
            "domains": [],
        }

        from pipelines.init_pipeline import run_init

        # Must NOT raise
        await run_init(config, history_days=30, logger=logger)

        # Still writes PKB
        assert writer_instance.write.called
        # Gmail error was logged
        logger.log_source.assert_called()


@pytest.mark.asyncio
async def test_mootem_not_summarized_by_llm():
    """moo.team data is formatted as Markdown table without LLM call."""
    with (
        patch("pipelines.init_pipeline.GoogleDriveSource") as mock_drive,
        patch("pipelines.init_pipeline.GmailSource") as mock_gmail,
        patch("pipelines.init_pipeline.TelegramGroupSource") as mock_tg_group,
        patch("pipelines.init_pipeline.TelegramDMSource") as mock_tg_dm,
        patch("pipelines.init_pipeline.MooTeamSource") as mock_moo,
        patch("pipelines.init_pipeline.ObsidianNotesSource") as mock_obs,
        patch("pipelines.init_pipeline.LLMProcessor") as mock_llm,
        patch("pipelines.init_pipeline.PKBWriter") as mock_writer,
    ):
        for m in [mock_drive, mock_gmail, mock_tg_group, mock_tg_dm, mock_obs]:
            m.return_value.fetch_async = AsyncMock(return_value=[])
        mock_moo.return_value.fetch_async = AsyncMock(
            return_value={
                "tasks": [
                    {
                        "taskId": 1,
                        "header": "Задача",
                        "creator": {"firstname": "А", "lastname": "Б"},
                        "user": {"firstname": "В", "lastname": "Г"},
                        "taskStatus": {"name": "В работе"},
                        "startDate": "",
                        "endDate": "2026-03-01",
                        "task_url": "https://moo.team/task/1",
                    }
                ],
                "comments": {},
                "workspace_slug": "ws",
            }
        )

        llm_instance = MagicMock()
        llm_instance.summarize_source = AsyncMock(return_value="summary")
        llm_instance.build_pkb_from_summaries = AsyncMock(return_value="# PKB")
        mock_llm.return_value = llm_instance

        writer_instance = MagicMock()
        writer_instance.load_template.return_value = "# Template"
        mock_writer.return_value = writer_instance

        config = {
            "project_id": "test",
            "project_name": "Тест",
            "obsidian_path": "p",
            "channels": {
                "google_drive_folder_id": "1",
                "gmail_label": "l",
                "telegram_group_id": -1,
                "telegram_dm_contacts": [],
                "moo_team_project_id": 1,
                "moo_team_workspace_slug": "ws",
            },
            "keywords": [],
            "domains": [],
        }
        logger = MagicMock()

        from pipelines.init_pipeline import run_init

        await run_init(config, history_days=30, logger=logger)

        # LLM should NOT have been called for mootem source
        for call in llm_instance.summarize_source.call_args_list:
            assert call.args[0] != "mootem", "LLM was called for mootem — should format without LLM"
