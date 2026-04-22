# Agents Registry

Агенты для AI-First Агентства. Orchestrator (CEO) управляет через JSON interface.

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

## Организационная структура

```
CEO (Orchestrator)
├── CMO
│   ├── prompt-architect
│   └── marketing-strategist
├── COO
│   ├── business-analyst
│   └── vendor-manager
├── CTO
│   └── learning-loop
└── CFO
    └── roi-razvitie-draft
```

## Интерфейс

Все агенты реализуют стандартный интерфейс:

**Input** → `agent.json.input_schema`
**Output** → `agent.json.output_schema`

```json
{
  "result": "...",
  "status": "success|escalation|failed",
  "quality_score": 0-100,
  "reason": "если escalation или failed"
}
```

## Orchestrator Delegation Table

| Агент | Типы задач |
|-------|------------|
| `prompt-architect` | посты, статьи, тексты |
| `marketing-strategist` | SEO, контент-план |
| `vendor-manager` | поиск подрядчиков |
| `business-analyst` | процессы, GAP, аналитика |
| `presentation-agent` | презентации |
| `product-strategist` | OKR, стратегия |

## Добавление нового агента

1. Создать `agents/{name}/SKILL.md`
2. Создать `agents/{name}/agent.json`
3. Добавить в Orchestrator delegation table

## Skill Sources

- `writing-content` → `skills/writing-content/SKILL.md`
- `seo-strategist` → `skills/seo-strategist/SKILL.md`
- `product-strategist` → `skills/product-strategist/SKILL.md`
- `business-analyst-toolkit` → `skills/business-analyst-toolkit/SKILL.md`
- `find-vendor` → `skills/find-vendor/SKILL.md`

