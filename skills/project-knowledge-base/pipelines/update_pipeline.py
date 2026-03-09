"""Update pipeline: Approach A — single LLM call for incremental PKB update."""

from __future__ import annotations

import asyncio
from typing import Any

from sources.gmail import GmailSource
from sources.google_drive import GoogleDriveSource
from sources.mootem import MooTeamSource
from sources.obsidian_notes import ObsidianNotesSource
from sources.telegram_dm import TelegramDMSource
from sources.telegram_group import TelegramGroupSource
from utils.llm_processor import LLMProcessor
from utils.models import SourceResult
from utils.pkb_writer import PKBWriter

ALL_SOURCES = ["google_drive", "gmail", "tg_group", "tg_dm", "mootem", "obsidian"]


def _has_new_items(source: str, data: list) -> bool:
    """Return True only if the source result contains actual new items."""
    if not data:
        return False
    if source == "mootem":
        entry = data[0] if isinstance(data[0], dict) else {}
        return bool(entry.get("tasks") or entry.get("comments"))
    return True


async def _collect_one(name: str, coro) -> SourceResult:
    try:
        data = await coro
        items = data if isinstance(data, list) else [data]
        return SourceResult(source=name, data=items, status="success")
    except Exception as exc:
        return SourceResult(source=name, data=[], status="error", error_message=str(exc))


async def run_update(
    config: dict,
    force_sources: list[str] | None,
    logger: Any,
) -> None:
    # Dict is built inside the function so class lookups resolve at call time,
    # allowing test patches to intercept correctly.
    source_classes: dict[str, Any] = {
        "google_drive": GoogleDriveSource,
        "gmail": GmailSource,
        "tg_group": TelegramGroupSource,
        "tg_dm": TelegramDMSource,
        "mootem": MooTeamSource,
        "obsidian": ObsidianNotesSource,
    }

    writer = PKBWriter(config)
    last_sync = writer.get_last_sync()
    project_name = config["project_name"]
    active = force_sources or ALL_SOURCES

    collection_tasks = [
        _collect_one(name, source_classes[name](config).fetch_async(since_date=last_sync))
        for name in active
        if name in source_classes
    ]

    results: list[SourceResult] = await asyncio.gather(*collection_tasks)

    for r in results:
        logger.log_source(r)

    raw_data = {r.source: r.data for r in results if r.is_ok and _has_new_items(r.source, r.data)}

    if not raw_data:
        print("[update] Новых данных нет.")
        return

    current_pkb = writer.read()
    llm = LLMProcessor()
    updated = await llm.update_pkb(
        current_pkb=current_pkb,
        raw_data=raw_data,
        project_name=project_name,
    )

    writer.write(updated)
    writer.update_sync_timestamp()
