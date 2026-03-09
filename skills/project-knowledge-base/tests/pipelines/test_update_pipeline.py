from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest


@pytest.mark.asyncio
async def test_update_pipeline_skips_when_no_new_data():
    """When all sources return empty data, LLM is NOT called and PKB is NOT written."""
    with (
        patch("pipelines.update_pipeline.GoogleDriveSource") as mock_drive,
        patch("pipelines.update_pipeline.GmailSource") as mock_gmail,
        patch("pipelines.update_pipeline.TelegramGroupSource") as mock_tg_group,
        patch("pipelines.update_pipeline.TelegramDMSource") as mock_tg_dm,
        patch("pipelines.update_pipeline.MooTeamSource") as mock_moo,
        patch("pipelines.update_pipeline.ObsidianNotesSource") as mock_obs,
        patch("pipelines.update_pipeline.LLMProcessor") as mock_llm,
        patch("pipelines.update_pipeline.PKBWriter") as mock_writer,
    ):
        for m in [mock_drive, mock_gmail, mock_tg_group, mock_tg_dm, mock_obs]:
            m.return_value.fetch_async = AsyncMock(return_value=[])
        mock_moo.return_value.fetch_async = AsyncMock(
            return_value={"tasks": [], "comments": {}, "workspace_slug": "ws"}
        )

        llm_instance = MagicMock()
        llm_instance.update_pkb = AsyncMock(return_value="# Updated PKB")
        mock_llm.return_value = llm_instance

        writer_instance = MagicMock()
        writer_instance.get_last_sync.return_value = datetime(2026, 1, 1, tzinfo=timezone.utc)
        writer_instance.read.return_value = "# Old PKB"
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

        from pipelines.update_pipeline import run_update

        await run_update(config, force_sources=None, logger=logger)

        assert not llm_instance.update_pkb.called
        assert not writer_instance.write.called


@pytest.mark.asyncio
async def test_update_pipeline_calls_llm_when_has_data():
    """When at least one source has new data, LLM is called and PKB is written."""
    with (
        patch("pipelines.update_pipeline.GoogleDriveSource") as mock_drive,
        patch("pipelines.update_pipeline.GmailSource") as mock_gmail,
        patch("pipelines.update_pipeline.TelegramGroupSource") as mock_tg_group,
        patch("pipelines.update_pipeline.TelegramDMSource") as mock_tg_dm,
        patch("pipelines.update_pipeline.MooTeamSource") as mock_moo,
        patch("pipelines.update_pipeline.ObsidianNotesSource") as mock_obs,
        patch("pipelines.update_pipeline.LLMProcessor") as mock_llm,
        patch("pipelines.update_pipeline.PKBWriter") as mock_writer,
    ):
        mock_gmail.return_value.fetch_async = AsyncMock(return_value=[{"id": "1", "body": "new"}])
        for m in [mock_drive, mock_tg_group, mock_tg_dm, mock_obs]:
            m.return_value.fetch_async = AsyncMock(return_value=[])
        mock_moo.return_value.fetch_async = AsyncMock(
            return_value={"tasks": [], "comments": {}, "workspace_slug": "ws"}
        )

        llm_instance = MagicMock()
        llm_instance.update_pkb = AsyncMock(return_value="# Updated PKB")
        mock_llm.return_value = llm_instance

        writer_instance = MagicMock()
        writer_instance.get_last_sync.return_value = datetime(2026, 1, 1, tzinfo=timezone.utc)
        writer_instance.read.return_value = "# Old PKB"
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

        from pipelines.update_pipeline import run_update

        await run_update(config, force_sources=None, logger=logger)

        assert llm_instance.update_pkb.called
        assert writer_instance.write.called
        assert writer_instance.update_sync_timestamp.called


@pytest.mark.asyncio
async def test_update_pipeline_respects_force_sources():
    """force_sources limits which sources are queried."""
    with (
        patch("pipelines.update_pipeline.GoogleDriveSource") as mock_drive,
        patch("pipelines.update_pipeline.GmailSource") as mock_gmail,
        patch("pipelines.update_pipeline.TelegramGroupSource") as mock_tg_group,
        patch("pipelines.update_pipeline.TelegramDMSource") as mock_tg_dm,
        patch("pipelines.update_pipeline.MooTeamSource") as mock_moo,
        patch("pipelines.update_pipeline.ObsidianNotesSource") as mock_obs,
        patch("pipelines.update_pipeline.LLMProcessor") as mock_llm,
        patch("pipelines.update_pipeline.PKBWriter") as mock_writer,
    ):
        mock_gmail.return_value.fetch_async = AsyncMock(return_value=[{"id": "1"}])
        for m in [mock_drive, mock_tg_group, mock_tg_dm, mock_moo, mock_obs]:
            m.return_value.fetch_async = AsyncMock(return_value=[])

        llm_instance = MagicMock()
        llm_instance.update_pkb = AsyncMock(return_value="# Updated PKB")
        mock_llm.return_value = llm_instance

        writer_instance = MagicMock()
        writer_instance.get_last_sync.return_value = datetime(2026, 1, 1, tzinfo=timezone.utc)
        writer_instance.read.return_value = "# Old PKB"
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

        from pipelines.update_pipeline import run_update

        await run_update(config, force_sources=["gmail"], logger=logger)

        # Only gmail should be called
        assert mock_gmail.return_value.fetch_async.called
        for m in [mock_drive, mock_tg_group, mock_tg_dm, mock_moo, mock_obs]:
            assert not m.return_value.fetch_async.called
