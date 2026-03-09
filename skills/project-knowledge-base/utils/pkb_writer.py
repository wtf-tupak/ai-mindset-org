"""Read and write Project Knowledge Base.md with YAML frontmatter."""

from __future__ import annotations

import os
from datetime import datetime, timezone
from pathlib import Path

import frontmatter


class PKBWriter:
    FILENAME = "Project Knowledge Base.md"
    TEMPLATE_PATH = Path(__file__).parent.parent / "template" / "pkb_template.md"

    def __init__(self, config: dict):
        vault = os.environ.get("OBSIDIAN_VAULT_PATH")
        if not vault:
            raise EnvironmentError("OBSIDIAN_VAULT_PATH не задан в .env")
        self._path = Path(vault) / config["obsidian_path"] / self.FILENAME

    @property
    def path(self) -> Path:
        return self._path

    def exists(self) -> bool:
        return self._path.exists()

    def read(self) -> str:
        return self._path.read_text(encoding="utf-8")

    def write(self, content: str) -> None:
        self._path.parent.mkdir(parents=True, exist_ok=True)
        tmp_path = self._path.with_suffix(".tmp")
        tmp_path.write_text(content, encoding="utf-8")
        os.replace(tmp_path, self._path)

    def get_last_sync(self) -> datetime | None:
        if not self.exists():
            return None
        post = frontmatter.load(str(self._path))
        raw = post.get("last_sync_at")
        if raw is None:
            return None
        if isinstance(raw, datetime):
            return raw.replace(tzinfo=timezone.utc) if raw.tzinfo is None else raw
        return datetime.fromisoformat(str(raw))

    def update_sync_timestamp(self) -> None:
        if not self.exists():
            return
        post = frontmatter.load(str(self._path))
        post["last_sync_at"] = datetime.now(timezone.utc).isoformat()
        self._path.write_text(frontmatter.dumps(post), encoding="utf-8")

    def load_template(self) -> str:
        return self.TEMPLATE_PATH.read_text(encoding="utf-8")
