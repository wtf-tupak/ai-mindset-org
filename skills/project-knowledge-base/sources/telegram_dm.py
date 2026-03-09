"""Telegram source: DMs with employees, filtered by project relevance."""

from __future__ import annotations

import re
from datetime import datetime

from telethon import TelegramClient
from telethon.tl.types import Message

from .telegram_utils import TelegramCredentials, resolve_offset, serialize_message


class TelegramDMSource:
    def __init__(self, config: dict):
        creds = TelegramCredentials.from_env()
        self._api_id = creds.api_id
        self._api_hash = creds.api_hash
        self._session = creds.session

        channels = config["channels"]
        self._dm_contacts: list[str] = channels.get("telegram_dm_contacts", [])

        workspace_path_part = channels.get("moo_team_workspace_path_part") or channels.get(
            "moo_team_workspace_slug", ""
        )
        project_id = channels.get("moo_team_project_id", "")
        self._moo_pattern = (
            re.compile(
                rf"new-app\.moo\.team/{re.escape(str(workspace_path_part))}/projects/{project_id}/",
                re.IGNORECASE,
            )
            if workspace_path_part and project_id
            else None
        )

        raw_keywords: list[str] = (
            config.get("keywords", [])
            + config.get("domains", [])
            + [w for w in config.get("project_name", "").split() if len(w) > 2]
        )
        self._keywords: list[str] = list(dict.fromkeys(raw_keywords))

    def _is_relevant(self, text: str) -> bool:
        if self._moo_pattern and self._moo_pattern.search(text):
            return True
        text_lower = text.lower()
        if any(kw.lower() in text_lower for kw in self._keywords if kw):
            return True
        # Stem-prefix matching for inflected forms (e.g. Russian morphology)
        words = text_lower.split()
        for kw in self._keywords:
            if not kw:
                continue
            stem = kw.lower()[: max(4, len(kw) - 2)]
            if any(w.startswith(stem) for w in words):
                return True
        return False

    async def fetch_async(
        self,
        since_date: datetime | None = None,
        history_days: int = 180,
    ) -> list[dict]:
        if not self._dm_contacts:
            return []

        offset = resolve_offset(since_date, history_days)
        messages: list[dict] = []

        async with TelegramClient(self._session, self._api_id, self._api_hash) as client:
            for username in self._dm_contacts:
                async for msg in client.iter_messages(username, offset_date=offset, reverse=True):
                    if isinstance(msg, Message) and msg.text and self._is_relevant(msg.text):
                        messages.append(serialize_message(msg, source=f"dm:{username}"))

        return messages
