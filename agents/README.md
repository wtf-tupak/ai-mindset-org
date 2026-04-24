# Agents Registry — Personal Corp v2

AI-First Agency agents. **Orchestrator v2** (Supervisor Pattern) управляет через Task tool + GitHub Issues.

## Архитектура (Supervisor Pattern)

```
Оператор (wtf-tupak)
  ↓
Orchestrator v2 (Supervisor — мозг)
  ├── plan.md + status.md     ← долгая память
  ├── GitHub Issues            ← source of truth
  │
  ├── C-Suite (стратегический уровень)
  │   ├── CEO → orchestrator/SKILL.md
  │   ├── CMO → marketing-strategist + seo
  │   ├── COO → business-analyst-toolkit
  │   ├── CTO → learning-loop
  │   └── CFO → roi-razvitie-draft
  │
  └── Execution Agents (делегированные)
      ├── prompt-architect     → skills/writing-content
      ├── marketing-strategist → skills/seo-strategist
      ├── vendor-manager       → skills/find-vendor
      ├── business-analyst     → skills/business-analyst-toolkit
      ├── product-strategist   → skills/product-strategist
      └── presentation-agent   → skills/deck
```

## Source of Truth

**GitHub Issues** — каждая задача агента = GitHub Issue.

| Action | Command |
|--------|---------|
| Создать | `gh issue create --repo wtf-tupak/pos-print --label "agent-task"` |
| Обновить | `gh issue comment {N} --repo wtf-tupak/pos-print` |
| Закрыть | `gh issue close {N} --repo wtf-tupak/pos-print` |
| Все задачи | `gh issue list --repo wtf-tupak/pos-print --label "agent-task"` |

Полный workflow: `agents/orchestrator/gh-workflow.md`

## C-Suite (Top Level)

| Agent | Role | Skill Source |
|-------|------|-------------|
| `ceo` | Стратегия, эскалации | skills/orchestrator |
| `cmo` | Маркетинг, SEO, контент | skills/marketing-strategist + seo-strategist |
| `coo` | Операции, процессы | skills/business-analyst-toolkit |
| `cto` | Технологии, архитектура | skills/learning-loop |
| `cfo` | Финансы, ROI | skills/roi-razvitie-draft |

## Execution Agents (Delegated)

| Agent | Role | Skill Source |
|-------|------|-------------|
| `prompt-architect` | Тексты (Julian Shapiro) | skills/writing-content |
| `marketing-strategist` | SEO + контент-план | skills/seo-strategist |
| `vendor-manager` | Поиск подрядчиков | skills/find-vendor |
| `business-analyst` | Бизнес-анализ | skills/business-analyst-toolkit |
| `product-strategist` | OKR, стратегия | skills/product-strategist |

## Orchestrator Delegation Table

| Тип задачи | Агент | Когда |
|------------|-------|-------|
| Посты, статьи | `prompt-architect` | Любой текстовый контент |
| SEO, контент-план | `marketing-strategist` | SEO-стратегия |
| Поиск подрядчиков | `vendor-manager` | Найти специалиста |
| Бизнес-анализ | `business-analyst` | Процессы, GAP, аналитика |
| Презентации | `presentation-agent` | Слайды, деки |
| Стратегия, OKR | `product-strategist` | Продуктовые решения |
| **Архитектура** | **Orchestrator сам** | Системные решения |
| **Оценка качества** | **Orchestrator сам** | Review результатов |
| **Мелочь < 30 сек** | **Orchestrator сам** | Не тратить overhead |

## Agent Interface (Standard)

**Input** → `agent.json.input_schema`
**Output** → `agent.json.output_schema`

```json
{
  "result": "...",
  "status": "success|escalation|failed",
  "quality_score": 0-100,
  "agent_used": "agent-name",
  "reason": "если escalation или failed"
}
```

## Context Management

| Файл | Назначение | Когда |
|------|-----------|-------|
| `plan.md` | Долгая память — весь план задачи | Задачи > 5 мин |
| `status.md` | Короткая память — текущий шаг | Всегда при plan.md |
| GitHub Issue | Source of truth — публичный статус | Каждая значимая задача |

**Recovery:** plan.md + status.md → продолжить с текущего шага.

## Добавление нового агента

1. Создать `agents/{name}/SKILL.md`
2. Создать `agents/{name}/agent.json`
3. Добавить в Orchestrator delegation table
4. Создать label `agent:{name}` в GitHub

## Skill Sources

- `writing-content` → `skills/writing-content/SKILL.md`
- `seo-strategist` → `skills/seo-strategist/SKILL.md`
- `product-strategist` → `skills/product-strategist/SKILL.md`
- `business-analyst-toolkit` → `skills/business-analyst-toolkit/SKILL.md`
- `find-vendor` → `skills/find-vendor/SKILL.md`
- `deck` → `skills/deck/SKILL.md`
