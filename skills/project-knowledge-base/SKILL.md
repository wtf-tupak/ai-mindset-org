---
name: project-knowledge-base
description: Collects, structures and maintains a Project Knowledge Base (PKB.md) in Obsidian for a marketing agency. Aggregates data from Google Drive, Gmail, Telegram (group chat and DMs via MTProto), moo.team tasks/comments, and local Obsidian meeting transcripts. Uses async parallel collection and a two-stage LLM pipeline for init. Use when the user wants to initialize, update or enrich a project's knowledge base, mentions PKB, project knowledge base, синхронизация проекта, база знаний проекта, init_project_knowledge, update_project_knowledge, or ad_hoc_add_context.
---

# Project Knowledge Base Skill

Manages structured Markdown knowledge-base cards for marketing agency projects stored in Obsidian.

**Sources (collected in parallel):** Google Drive · Gmail · Telegram group · Telegram DMs · moo.team · Obsidian transcripts

## Privacy warning

This skill processes potentially sensitive client and agency data.

- Data collected from Google Drive, Gmail, Telegram, moo.team, and Obsidian may contain private project information.
- PKB generation and update send source data to the selected external LLM provider (`OpenAI` or `Anthropic`).
- Use this skill only when you are allowed to transfer that data to third-party AI APIs under your internal policy and client agreements.
- Public repositories must contain only the skill code, docs, templates, and tests. Never publish runtime auth artifacts, logs, or real project data.

## Setup (first run)

1. Use Python `3.11` (repo pin: root `.python-version`)
2. Copy `.env.example` → `.env` and fill in all values (local file only, do not commit)
3. Explicitly set `LLM_PROVIDER` to `openai` or `anthropic`
4. Install runtime deps: `pip install -r requirements.txt`
5. Install dev deps (quality gates + tests): `pip install -r requirements-dev.txt`
6. Ensure `_projects_index.yaml` exists at `$OBSIDIAN_VAULT_PATH/$PROJECTS_INDEX_PATH`
7. Run once to complete Google OAuth: `python skill.py init <project_id> --history-days 1`

## Commands

### Initialize a new PKB from scratch
```bash
python skill.py init <project_id> [--history-days 180]
```
Uses **two-stage LLM pipeline**: collect all sources in parallel → summarize each source in parallel → single LLM call to build PKB.

### Incrementally update an existing PKB
```bash
python skill.py update <project_id> [--force-sources tg_group tg_dm ...]
```
Reads `last_sync_at` from frontmatter; collects only newer data → single LLM call.

Available `--force-sources` values: `google_drive`, `gmail`, `tg_group`, `tg_dm`, `mootem`, `obsidian`

### Add ad-hoc context manually
```bash
python skill.py add-context <project_id> \
  --type text|file_path|gmail_message_id|telegram_messages|mootem_task_id \
  --data "<content or identifier>"
```
Does **not** update `last_sync_at`.

## File structure

```
project-knowledge-base/
├── SKILL.md
├── skill.py                      # entry point / CLI
├── pytest.ini                    # asyncio_mode = auto
├── pipelines/
│   ├── init_pipeline.py          # Approach B: collect → summarize per source → build PKB
│   └── update_pipeline.py        # Approach A: collect → single LLM update
├── sources/
│   ├── google_drive.py           # Google Drive API v3
│   ├── gmail.py                  # Gmail API
│   ├── telegram_group.py         # Group chat (async Telethon)
│   ├── telegram_dm.py            # DMs with relevance filter (async Telethon)
│   ├── telegram_utils.py         # Shared: TelegramCredentials, resolve_offset, serialize_message
│   ├── mootem.py                 # moo.team REST API
│   └── obsidian_notes.py         # Local .md transcripts
├── utils/
│   ├── models.py                 # SourceResult dataclass
│   ├── logger.py                 # PKBLogger → logs/{project_id}/{timestamp}.log
│   ├── project_index.py          # _projects_index.yaml parser
│   ├── pkb_writer.py             # Atomic write via os.replace()
│   └── llm_processor.py          # Claude API: summarize_source / build_pkb_from_summaries / update_pkb
├── tests/
│   ├── sources/                  # test_telegram.py, test_sources_async.py
│   ├── pipelines/                # test_init_pipeline.py, test_update_pipeline.py
│   └── utils/                   # test_models.py, test_logger.py, test_pkb_writer.py, test_llm_processor.py
├── logs/                         # {project_id}/{timestamp}.log (auto-created)
├── template/
│   └── pkb_template.md
├── .env.example
└── requirements.txt
```

## LLM pipeline: init vs update

| | `init` (180 days) | `update` (since last_sync_at) |
|---|---|---|
| Data volume | Large — full history | Small — only new data |
| Stage 1 | Parallel async collection | Parallel async collection |
| Stage 2 | Parallel LLM summarize per source | — |
| Stage 3 | `build_pkb_from_summaries()` | `update_pkb()` — single call |
| moo.team | Formatted as Markdown table (no LLM) | Same |

## External data processing

When `init`, `update`, or `add-context` calls the LLM layer, the skill sends project content to the configured provider API.

- `init`: raw source payloads are summarized per source, then merged into a full PKB document
- `update`: new raw source payloads are sent together with the current PKB to generate an updated document
- `add-context`: the provided context is sent together with the current PKB

Do not use production client data with this skill unless that transfer is explicitly allowed.

## Error handling

Each source is wrapped in try/except. Failures are logged but do not abort the pipeline.
The run always ends with a summary printed to stdout:

```
─── Сводка синхронизации ───
  ✅ google_drive        — 23 items
  ✅ gmail               — 8 items
  ❌ tg_group            — session expired
  ✅ mootem              — 41 items

⚠️  PKB обновлён без: tg_group
   Повтор: python skill.py update <id> --force-sources tg_group
```

## Source → PKB section mapping

| Source | PKB sections populated |
|--------|----------------------|
| Google Drive | Описание проекта, Цели и KPI, Текущая реклама, Ссылки и артефакты |
| Gmail | История решений, Хронология, Контакты |
| Telegram group | История решений, Хронология, Задачи |
| Telegram DMs | История решений, Тонкости работы с клиентом |
| moo.team | Задачи (таблица), История решений |
| Obsidian transcripts | История решений, Хронология, Тонкости |

## Telegram DM relevance filter

A DM message is included if it matches **any** of:
1. Any word from `project_name` (stem-prefix matching for Russian morphology)
2. Any domain from `domains`
3. Any keyword from `keywords`
4. moo.team task URL regex: `new-app\.moo\.team/{workspace_path_part}/projects/{project_id}/`

Where:
- `workspace_path_part` — path segment from moo.team URL after domain (e.g. `WSbawtbSmV` in `new-app.moo.team/WSbawtbSmV/projects/16390`)
- Config key: `channels.moo_team_workspace_path_part`
- Backward compatibility: `channels.moo_team_workspace_slug` is still supported

## Running tests

```bash
pip install -r requirements-dev.txt
pytest tests/ -v
```

## Quality gates (local)

```bash
ruff check .
ruff format --check .
mypy .
pytest -v
```

## Dependency strategy (pip-tools)

- Source files:
  - `requirements.in` — runtime direct dependencies
  - `requirements-dev.in` — dev tooling + `-r requirements.in`
- Locked files:
  - `requirements.txt`
  - `requirements-dev.txt`
- Regenerate locks:

```bash
PIP_TOOLS_CACHE_DIR=.pip-tools-cache pip-compile --resolver=backtracking requirements.in
PIP_TOOLS_CACHE_DIR=.pip-tools-cache pip-compile --resolver=backtracking requirements-dev.in
```

## Security and secret handling

- Keep only `.env.example` in VCS; real `.env` stays local.
- Keep `google_token.json` and `*.session` local only; never commit runtime auth artifacts.
- Keep `.venv`, `logs/`, `.mypy_cache/`, `.pytest_cache/`, `.ruff_cache/`, and `.pip-tools-cache/` out of VCS.
- Keep the root `.gitignore` from this folder in place; it is part of the security boundary for publication.
- Before first git publication, rotate all active credentials from `.env` and revoke stale OAuth/session tokens.
- Rotation checklist: `docs/plans/2026-03-07-p0-secret-rotation-checklist.md`

## Public repo checklist

Before opening a PR to a public repository:

1. Confirm only code, tests, templates, and documentation are included.
2. Confirm `.env`, `google_token.json`, `*.session`, logs, caches, and local virtualenv files are absent.
3. Confirm no real project cards, meeting notes, mail dumps, Telegram exports, or customer data are present.
4. Rotate active credentials if any secret was ever stored in the skill folder locally.
5. Run local quality gates and review the diff once more for private names, URLs, and workspace-specific paths.
