"""Telegram source: project group chat via async Telethon."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from telethon import TelegramClient
from telethon.tl.types import Message

from .telegram_utils import TelegramCredentials, resolve_offset, serialize_message


class TelegramGroupSource:
    def __init__(self, config: dict):
        creds = TelegramCredentials.from_env()
        self._api_id = creds.api_id
        self._api_hash = creds.api_hash
        self._session = creds.session
        self._group_id = config["channels"].get("telegram_group_id")

    @staticmethod
    def _id_candidates(group_ref: Any) -> set[int]:
        candidates: set[int] = set()
        try:
            raw = int(str(group_ref))
        except (TypeError, ValueError):
            return candidates

        candidates.add(raw)
        candidates.add(abs(raw))

        raw_str = str(raw)
        if raw_str.startswith("-100"):
            candidates.add(int(raw_str.replace("-100", "", 1)))
        if raw_str.startswith("100"):
            candidates.add(int(raw_str.replace("100", "", 1)))
        return candidates

    async def _resolve_target(self, client: TelegramClient) -> Any:
        group_ref = self._group_id
        try:
            return await client.get_entity(group_ref)
        except Exception:
            pass

        id_candidates = self._id_candidates(group_ref)
        ref_lower = str(group_ref).strip().lower()

        async for dialog in client.iter_dialogs():
            dialog_ids = {
                int(getattr(dialog, "id", 0) or 0),
                int(getattr(getattr(dialog, "entity", None), "id", 0) or 0),
            }
            dialog_ids |= {abs(v) for v in dialog_ids if v}

            if id_candidates and (dialog_ids & id_candidates):
                return dialog.entity

            name = str(getattr(dialog, "name", "")).strip().lower()
            if ref_lower and not id_candidates and name == ref_lower:
                return dialog.entity

        return group_ref

    async def fetch_async(
        self,
        since_date: datetime | None = None,
        history_days: int = 180,
    ) -> list[dict]:
        if not self._group_id:
            return []

        offset = resolve_offset(since_date, history_days)
        messages: list[dict] = []

        async with TelegramClient(self._session, self._api_id, self._api_hash) as client:
            target = await self._resolve_target(client)
            async for msg in client.iter_messages(target, offset_date=offset, reverse=True):
                if isinstance(msg, Message) and msg.text:
                    messages.append(serialize_message(msg, source="group"))

        return messages
