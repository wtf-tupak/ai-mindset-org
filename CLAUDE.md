# ai-mindset-org — AI-First Agency Infrastructure

## Role

Infrastructure, documentation, and agent system for AI-first agency.

## Architecture

```
User/CEO
  └── Orchestrator (мозг)
        ├── prompt-architect      → writing-content
        ├── marketing-strategist  → seo-strategist + product-strategist
        ├── vendor-manager       → find-vendor
        └── business-analyst     → business-analyst-toolkit
```

## Agents

Агенты живут в `agents/` директории:

| Agent | Role | Skill Source |
|-------|------|--------------|
| `orchestrator` | Мозг: планирует, делегирует, оценивает | — |
| `prompt-architect` | Тексты по Julian Shapiro | `skills/writing-content` |
| `marketing-strategist` | SEO + контент | `skills/seo-strategist` |
| `vendor-manager` | Поиск подрядчиков | `skills/find-vendor` |
| `business-analyst` | Бизнес-анализ | `skills/business-analyst-toolkit` |

Подробнее: `agents/README.md`

## Workflow

1. Задача от юзера → Orchestrator
2. Orchestrator анализирует → выбирает агента
3. Агент выполняет через свой скилл
4. Возвращает `{ result, status, quality_score }`
5. Orchestrator оценивает → ok / retry / escalate

## Orchestrator Rules

- **Делает сам:** архитектура, оценка, стратегия, мелочи < 30 сек
- **Делегирует:** тексты, SEO, поиск, анализ
- **Эскалация:** subagent failed 2x → делает сам

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
