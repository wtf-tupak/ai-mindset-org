"""Project Knowledge Base — entry point."""

from __future__ import annotations

import argparse
import asyncio
import sys

from dotenv import load_dotenv

load_dotenv()

from pipelines.init_pipeline import run_init
from pipelines.update_pipeline import run_update
from utils.logger import PKBLogger
from utils.pkb_writer import PKBWriter
from utils.project_index import load_project_config


async def _init(project_id: str, history_days: int) -> None:
    config = load_project_config(project_id)
    writer = PKBWriter(config)
    logger = PKBLogger(project_id)

    if writer.exists():
        answer = input(f"PKB уже существует для '{project_id}'. Перезаписать? [y/N]: ")
        if answer.strip().lower() != "y":
            print("Отменено.")
            return

    print(f"[init] Проект: {config['project_name']} | История: {history_days} дней")
    await run_init(config, history_days=history_days, logger=logger)
    logger.print_summary()
    print(f"[init] PKB создан: {writer.path}")


async def _update(project_id: str, force_sources: list[str] | None) -> None:
    config = load_project_config(project_id)
    writer = PKBWriter(config)
    logger = PKBLogger(project_id)

    if not writer.exists():
        print("PKB не найден. Сначала: python skill.py init <project_id>")
        sys.exit(1)

    last_sync = writer.get_last_sync()
    print(f"[update] Проект: {config['project_name']} | Последняя синхр.: {last_sync}")
    await run_update(config, force_sources=force_sources, logger=logger)
    logger.print_summary()
    print(f"[update] PKB обновлён: {writer.path}")


async def _add_context(project_id: str, context_type: str, context_data: str) -> None:
    from utils.llm_processor import LLMProcessor

    config = load_project_config(project_id)
    writer = PKBWriter(config)

    if not writer.exists():
        print("PKB не найден. Сначала: python skill.py init <project_id>")
        sys.exit(1)

    print(f"[add-context] Тип: {context_type} | Проект: {config['project_name']}")
    updated = await LLMProcessor().update_pkb(
        current_pkb=writer.read(),
        raw_data={context_type: context_data},
        project_name=config["project_name"],
    )
    writer.write(updated)
    print(f"[add-context] Контекст добавлен: {writer.path}")


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Project Knowledge Base — управление базой знаний проекта в Obsidian")
    sub = parser.add_subparsers(dest="command", required=True)

    p_init = sub.add_parser("init", help="Инициализировать PKB с нуля")
    p_init.add_argument("project_id")
    p_init.add_argument("--history-days", type=int, default=180, metavar="N")

    p_update = sub.add_parser("update", help="Инкрементально обновить PKB")
    p_update.add_argument("project_id")
    p_update.add_argument(
        "--force-sources",
        nargs="+",
        metavar="SOURCE",
        choices=["google_drive", "gmail", "tg_group", "tg_dm", "mootem", "obsidian"],
    )

    p_adhoc = sub.add_parser("add-context", help="Добавить контекст вручную")
    p_adhoc.add_argument("project_id")
    p_adhoc.add_argument(
        "--type",
        dest="context_type",
        required=True,
        choices=["text", "file_path", "gmail_message_id", "telegram_messages", "mootem_task_id"],
    )
    p_adhoc.add_argument("--data", dest="context_data", required=True)

    return parser


def main() -> None:
    args = _build_parser().parse_args()
    if args.command == "init":
        asyncio.run(_init(args.project_id, args.history_days))
    elif args.command == "update":
        asyncio.run(_update(args.project_id, args.force_sources))
    elif args.command == "add-context":
        asyncio.run(_add_context(args.project_id, args.context_type, args.context_data))


if __name__ == "__main__":
    main()
