"""Obsidian source: local .md meeting transcripts."""

from __future__ import annotations

import asyncio
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path


class ObsidianNotesSource:
    PKB_FILENAME = "Project Knowledge Base.md"

    def __init__(self, config: dict):
        vault = os.environ.get("OBSIDIAN_VAULT_PATH")
        if not vault:
            raise EnvironmentError("OBSIDIAN_VAULT_PATH не задан в .env")
        self._notes_dir = Path(vault) / config["obsidian_path"]

    def fetch(
        self,
        since_date: datetime | None = None,
        history_days: int = 180,
    ) -> list[dict]:
        if since_date is None:
            since_date = datetime.now(timezone.utc) - timedelta(days=history_days)

        if not self._notes_dir.exists():
            return []

        notes: list[dict] = []
        for md_file in sorted(self._notes_dir.glob("*.md")):
            if md_file.name == self.PKB_FILENAME:
                continue
            mtime = datetime.fromtimestamp(md_file.stat().st_mtime, tz=timezone.utc)
            if mtime >= since_date:
                notes.append(
                    {
                        "filename": md_file.name,
                        "modified": mtime.isoformat(),
                        "content": md_file.read_text(encoding="utf-8"),
                    }
                )

        return notes

    async def fetch_async(
        self,
        since_date: datetime | None = None,
        history_days: int = 180,
    ) -> list[dict]:
        return await asyncio.to_thread(self.fetch, since_date=since_date, history_days=history_days)
