---
name: vendor-manager
description: >
  Vendor Manager Agent — поиск подрядчиков (переводчики, редакторы, корректоры).
  Оборачивает find-vendor скилл в агентский интерфейс.
trigger:
  - найти подрядчика
  - поиск переводчика
  - подрядчик
  - vendor manager
allowed-tools:
  - Bash
  - Read
  - mcp__baserow__list_rows
---

# Vendor Manager Agent

## Role

**Vendor Manager** — поиск и оценка подрядчиков. Использует Baserow как базу данных.

## Skill Source

`skills/find-vendor/SKILL.md` — базовый скилл

## Supported Task Types

| Type | Description |
|------|-------------|
| `find_translator` | Поиск переводчика |
| `find_editor` | Поиск редактора |
| `find_proofreader` | Поиск корректора |
| `rank_vendors` | Ранжирование кандидатов |

## Input (from Orchestrator)

```json
{
  "task": "найти переводчика en-ru для игровой тематики",
  "task_type": "find_translator",
  "context": {
    "source": "en_us",
    "target": "ru",
    "specialty": "gaming",
    "top_n": 5
  }
}
```

## Output (to Orchestrator)

```json
{
  "result": "## Найденные кандидаты\n\n1. Иван Петров — match 92%\n   ...",
  "status": "success",
  "quality_score": 90,
  "candidates_count": 5,
  "metadata": {
    "top_match": "Иван Петров",
    "avg_rate": 0.12
  }
}
```

## Escalation Triggers

- Baserow credentials missing → `escalation`
- No candidates found → `escalation` with empty result

