"""Tests that fetch_async methods are proper coroutines and delegate to fetch()."""

import asyncio
from unittest.mock import AsyncMock, patch

import pytest

from sources.gmail import GmailSource
from sources.google_drive import GoogleDriveSource
from sources.mootem import MooTeamSource
from sources.obsidian_notes import ObsidianNotesSource


@pytest.mark.asyncio
async def test_gmail_fetch_async_is_coroutine():
    assert asyncio.iscoroutinefunction(GmailSource.fetch_async)


@pytest.mark.asyncio
async def test_gdrive_fetch_async_is_coroutine():
    assert asyncio.iscoroutinefunction(GoogleDriveSource.fetch_async)


@pytest.mark.asyncio
async def test_mootem_fetch_async_is_coroutine():
    assert asyncio.iscoroutinefunction(MooTeamSource.fetch_async)


@pytest.mark.asyncio
async def test_obsidian_fetch_async_is_coroutine():
    assert asyncio.iscoroutinefunction(ObsidianNotesSource.fetch_async)


@pytest.mark.asyncio
async def test_gmail_fetch_async_delegates_to_fetch(monkeypatch):
    config = {"channels": {"gmail_label": "test"}}
    src = GmailSource(config)
    expected = [{"id": "1"}]
    with patch("asyncio.to_thread", new=AsyncMock(return_value=expected)) as mock_thread:
        result = await src.fetch_async(since_date=None, history_days=30)
    assert result == expected
    mock_thread.assert_called_once_with(src.fetch, since_date=None, history_days=30)


@pytest.mark.asyncio
async def test_obsidian_fetch_async_delegates_to_fetch(monkeypatch):
    config = {"obsidian_path": "test"}
    monkeypatch.setenv("OBSIDIAN_VAULT_PATH", "/tmp")
    src = ObsidianNotesSource(config)
    expected = [{"filename": "note.md"}]
    with patch("asyncio.to_thread", new=AsyncMock(return_value=expected)) as mock_thread:
        result = await src.fetch_async(since_date=None, history_days=30)
    assert result == expected
    mock_thread.assert_called_once_with(src.fetch, since_date=None, history_days=30)
