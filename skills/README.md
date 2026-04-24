# Agents Registry

Агенты для AI-First Агентства. Orchestrator управляет через JSON interface.

## Структура

```
agents/
├── orchestrator/          # Мозг системы
│   ├── SKILL.md
│   └── agent.json
├── prompt-architect/      # Тексты (Julian Shapiro)
│   ├── SKILL.md
│   └── agent.json
├── marketing-strategist/  # SEO + контент
│   ├── SKILL.md
│   └── agent.json
├── vendor-manager/        # Поиск подрядчиков
│   ├── SKILL.md
│   └── agent.json
└── business-analyst/      # Бизнес-анализ
    ├── SKILL.md
    └── agent.json
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

