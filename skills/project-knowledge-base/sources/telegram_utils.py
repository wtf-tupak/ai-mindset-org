"""Shared utilities for Telegram sources."""

from __future__ import annotations

import os
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from telethon.tl.types import Message


@dataclass(frozen=True)
class TelegramCredentials:
    api_id: int
    api_hash: str
    session: str

    @classmethod
    def from_env(cls) -> "TelegramCredentials":
        return cls(
            api_id=int(os.environ.get("TELEGRAM_API_ID", "0")),
            api_hash=os.environ.get("TELEGRAM_API_HASH", ""),
            session=os.environ.get("TELEGRAM_SESSION_FILE", "./telegram.session"),
        )


def resolve_offset(since_date: datetime | None, history_days: int) -> datetime:
    if since_date:
        return since_date
    return datetime.now(timezone.utc) - timedelta(days=history_days)


def serialize_message(msg: Message, source: str) -> dict:
    return {
        "id": msg.id,
        "date": msg.date.isoformat() if msg.date else "",
        "sender_id": msg.sender_id,
        "text": msg.text,
        "source": source,
    }
