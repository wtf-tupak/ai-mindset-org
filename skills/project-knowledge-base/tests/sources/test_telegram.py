# tests/sources/test_telegram.py
import asyncio

import pytest

from sources.telegram_dm import TelegramDMSource


@pytest.fixture
def config():
    return {
        "project_name": "Урологическая клиника",
        "keywords": ["урология", "клиника"],
        "domains": ["urology-spb.ru"],
        "channels": {
            "telegram_dm_contacts": ["user1"],
            "moo_team_workspace_path_part": "WStest",
            "moo_team_project_id": 123,
        },
    }


def test_dm_relevance_filter_keyword(config):
    src = TelegramDMSource(config)
    assert src._is_relevant("обсудили вопрос по урологии сегодня")


def test_dm_relevance_filter_domain(config):
    src = TelegramDMSource(config)
    assert src._is_relevant("зайди на urology-spb.ru")


def test_dm_relevance_filter_moo_link(config):
    src = TelegramDMSource(config)
    url = "new-app.moo.team/WStest/projects/123/tasks?modal=task-view&taskId=1"
    assert src._is_relevant(url)


def test_dm_relevance_filter_moo_link_backward_compat_slug():
    src = TelegramDMSource(
        {
            "project_name": "Урологическая клиника",
            "keywords": ["урология", "клиника"],
            "domains": ["urology-spb.ru"],
            "channels": {
                "telegram_dm_contacts": ["user1"],
                "moo_team_workspace_slug": "WStest",
                "moo_team_project_id": 123,
            },
        }
    )
    url = "new-app.moo.team/WStest/projects/123/tasks?modal=task-view&taskId=1"
    assert src._is_relevant(url)


def test_dm_relevance_filter_rejects_noise(config):
    src = TelegramDMSource(config)
    assert not src._is_relevant("привет, как дела? напиши когда будешь свободен")


def test_dm_relevance_filter_case_insensitive(config):
    src = TelegramDMSource(config)
    assert src._is_relevant("УРОЛОГИЯ — важная тема")


def test_group_source_returns_empty_without_group_id():
    """TelegramGroupSource returns [] immediately if no group_id configured."""
    from sources.telegram_group import TelegramGroupSource

    config = {"channels": {}}
    src = TelegramGroupSource(config)
    result = asyncio.run(src.fetch_async())
    assert result == []


def test_dm_source_returns_empty_without_contacts():
    """TelegramDMSource returns [] immediately if no contacts configured."""
    config = {
        "project_name": "Test",
        "keywords": [],
        "domains": [],
        "channels": {"telegram_dm_contacts": []},
    }
    src = TelegramDMSource(config)
    result = asyncio.run(src.fetch_async())
    assert result == []
