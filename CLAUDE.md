# ai-mindset-org — AI-First Agency Infrastructure

## Role

Infrastructure, documentation, and agent system for AI-first agency.

## Architecture (Supervisor Pattern)

```
Оператор (wtf-tupak)
  ↓ задача
Orchestrator v2 (Supervisor — лучшая модель)
  ├── plan.md + status.md (долгая память)
  ├── GitHub Issues (source of truth)
  │
  ├── prompt-architect      → skills/writing-content
  ├── marketing-strategist  → skills/seo-strategist + product-strategist
  ├── vendor-manager        → skills/find-vendor
  ├── business-analyst      → skills/business-analyst-toolkit
  └── product-strategist    → skills/product-strategist
```

**Принцип:** Orchestrator = мозг (планирует, оценивает). Subagents = руки (выполняют).

## 7 Слоёв POS

| # | Слой | Реализация |
|---|------|-----------|
| 1 | Оператор | wtf-tupak |
| 2 | Стратегия | Orchestrator (Opus/лучшая модель) |
| 3 | Долгая память | plan.md + status.md + CLAUDE.md |
| 4 | Координация | GitHub Issues (source of truth) |
| 5 | Правила | AGENTS.md |
| 6 | Рабочая среда | VS Code + Terminal + Telegram |
| 7 | Исполнение | Subagents через Task tool |

## Agents

Агенты живут в `agents/` директории:

| Agent | Role | Skill Source |
|-------|------|-------------|
| `orchestrator` | Мозг: планирует, делегирует, оценивает | agents/orchestrator/SKILL.md |
| `prompt-architect` | Тексты по Julian Shapiro | `skills/writing-content` |
| `marketing-strategist` | SEO + контент | `skills/seo-strategist` |
| `vendor-manager` | Поиск подрядчиков | `skills/find-vendor` |
| `business-analyst` | Бизнес-анализ | `skills/business-analyst-toolkit` |

Подробнее: `agents/README.md`

## Workflow

1. Задача от юзера → Orchestrator
2. Orchestrator анализирует → выбирает агента (Delegation Table)
3. Создаёт GitHub Issue (source of truth)
4. Создаёт plan.md + status.md (для задач > 5 мин)
5. Агент выполняет через свой скилл (Task tool)
6. Возвращает `{ result, status, quality_score }`
7. Orchestrator оценивает → ok / retry / escalate
8. Обновляет GitHub Issue → закрывает

## Orchestrator Rules

- **Делает сам:** архитектура, оценка, стратегия, мелочи < 30 сек
- **Делегирует:** тексты, SEO, поиск, анализ
- **Эскалация:** subagent failed 2x → делает сам
- **GitHub Issues:** каждая задача = issue, каждый шаг = комментарий

## Context Management

```
plan.md   = долгая память (весь план задачи)
status.md = короткая память (что делаю прямо сейчас)
GitHub Issue = source of truth (публичный статус)
```

**Recovery:** При старте сессии → читай plan.md + status.md → продолжай с текущего шага.

## Issue Workflow

```
/plan     → decompose issue → sub-issues
/implement → create branch, commit, PR
/review   → review PR
```

## Commits

```
feat: description (#issue)
fix: description (#issue)
```
