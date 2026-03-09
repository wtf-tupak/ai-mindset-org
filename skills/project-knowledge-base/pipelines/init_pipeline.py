"""Init pipeline: Approach B — two-stage LLM pipeline for PKB initialization."""

from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone
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


async def _collect_one(name: str, coro) -> SourceResult:
    try:
        data = await coro
        items = data if isinstance(data, list) else [data]
        return SourceResult(source=name, data=items, status="success")
    except Exception as exc:
        return SourceResult(source=name, data=[], status="error", error_message=str(exc))


def _format_mootem(raw: dict) -> str:
    """Format moo.team tasks as Markdown table — no LLM needed."""
    tasks = raw.get("tasks", [])
    if not tasks:
        return ""
    lines = [
        "| Задача | Постановщик | Ответственный | Статус | Дедлайн | Ссылка |",
        "|--------|-------------|---------------|--------|---------|--------|",
    ]
    for t in tasks:
        creator = f"{t.get('creator', {}).get('firstname', '')} {t.get('creator', {}).get('lastname', '')}".strip()
        executor = f"{t.get('user', {}).get('firstname', '')} {t.get('user', {}).get('lastname', '')}".strip()
        lines.append(
            f"| {t.get('header', '')} | {creator} | {executor} "
            f"| {t.get('taskStatus', {}).get('name', '')} "
            f"| {t.get('endDate', '')} | [↗]({t.get('task_url', '')}) |"
        )
    return "\n".join(lines)


async def run_init(config: dict, history_days: int, logger: Any) -> None:
    since = datetime.now(timezone.utc) - timedelta(days=history_days)

    # Stage 1: parallel collection
    results = await asyncio.gather(
        _collect_one("google_drive", GoogleDriveSource(config).fetch_async(since_date=since)),
        _collect_one("gmail", GmailSource(config).fetch_async(since_date=since)),
        _collect_one("tg_group", TelegramGroupSource(config).fetch_async(since_date=since)),
        _collect_one("tg_dm", TelegramDMSource(config).fetch_async(since_date=since)),
        _collect_one("mootem", MooTeamSource(config).fetch_async(since_date=since)),
        _collect_one("obsidian", ObsidianNotesSource(config).fetch_async(since_date=since)),
    )

    for r in results:
        logger.log_source(r)

    llm = LLMProcessor()
    writer = PKBWriter(config)
    template = writer.load_template()
    project_name = config["project_name"]
    source_map = {r.source: r for r in results}

    # Stage 2: parallel LLM summarization (skip mootem — formatted directly)
    summarize_keys = [r.source for r in results if r.is_ok and r.data and r.source != "mootem"]
    summarize_coros = [llm.summarize_source(key, source_map[key].data, project_name) for key in summarize_keys]
    summaries_list = await asyncio.gather(*summarize_coros, return_exceptions=True)

    summaries: dict[str, str] = {}
    for key, summary in zip(summarize_keys, summaries_list):
        if isinstance(summary, BaseException):
            logger.log_source(SourceResult(source=f"{key}:llm", data=[], status="error", error_message=str(summary)))
        else:
            summaries[key] = summary

    # moo.team: format as Markdown table without LLM
    mootem_result = source_map.get("mootem")
    if mootem_result and mootem_result.is_ok and mootem_result.data:
        raw_mootem = mootem_result.data[0] if isinstance(mootem_result.data[0], dict) else {}
        formatted = _format_mootem(raw_mootem)
        if formatted:
            summaries["mootem"] = formatted

    # Stage 3: single LLM call to build PKB
    pkb_content = await llm.build_pkb_from_summaries(
        summaries=summaries,
        template=template,
        project_name=project_name,
    )

    writer.write(pkb_content)
    writer.update_sync_timestamp()
