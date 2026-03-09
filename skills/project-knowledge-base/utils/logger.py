from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from pathlib import Path

from utils.models import SourceResult

_STATUS_ICON = {"success": "✅", "partial": "⚠️", "error": "❌"}


class PKBLogger:
    def __init__(self, project_id: str) -> None:
        self._project_id = project_id
        self._results: list[SourceResult] = []

        logs_dir = Path(os.environ.get("PKB_LOGS_DIR", "./logs"))
        run_dir = logs_dir / project_id
        run_dir.mkdir(parents=True, exist_ok=True)

        timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S")
        log_file = run_dir / f"{timestamp}.log"

        self._log = logging.getLogger(f"pkb.{project_id}.{timestamp}")
        self._log.setLevel(logging.INFO)
        self._log.propagate = False
        self._log.handlers.clear()

        formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(message)s")
        file_handler = logging.FileHandler(log_file, encoding="utf-8")
        file_handler.setFormatter(formatter)
        stream_handler = logging.StreamHandler()
        stream_handler.setFormatter(formatter)

        self._log.addHandler(file_handler)
        self._log.addHandler(stream_handler)

    def log_source(self, result: SourceResult) -> None:
        self._results.append(result)
        icon = _STATUS_ICON.get(result.status, "?")
        if result.is_ok:
            self._log.info("%s %s — %d items", icon, result.source, result.items_count)
        else:
            self._log.error("%s %s — %s", icon, result.source, result.error_message)

    def print_summary(self) -> None:
        print("\n─── Сводка синхронизации ───")
        for r in self._results:
            icon = _STATUS_ICON.get(r.status, "?")
            if r.is_ok:
                print(f"  {icon} {r.source:<20} — {r.items_count} items")
            else:
                print(f"  {icon} {r.source:<20} — {r.error_message}")
        failed = [r.source for r in self._results if not r.is_ok]
        if failed:
            print(f"\n⚠️  PKB обновлён без: {', '.join(failed)}")
            print(f"   Повтор: python skill.py update <id> --force-sources {' '.join(failed)}")
        print()
