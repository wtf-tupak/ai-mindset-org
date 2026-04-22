# Client Repository Template

Шаблон репозитория для клиентских проектов. Клонируется при онбординге нового клиента.

## Структура

```
{client-name}/
├── README.md              # Client overview, contacts, project scope
├── CLAUDE.md              # AI rules for this client project
├── .github/
│   ├── context-template.md  # Client-specific context
│   └── workflows/
│       ├── standup.yml      # Daily standup automation
│       └── weekly-report.yml # Weekly report generation
├── AGENTS.md              # Client agent assignments
├── STRUCTURE.md           # Project structure documentation
├── docs/                  # Client documentation
│   ├── onboarding.md      # Client onboarding guide
│   ├── contacts.md        # Team contacts
│   └── processes.md       # Client-specific processes
└── reports/               # Automated reports
```

## Использование

1. Создать новый репозиторий из этого шаблона
2. Заменить `{client-name}` на имя клиента
3. Заполнить `README.md`, `docs/contacts.md`
4. Настроить GitHub Project для клиента
5. Онбординг завершён (~5 минут)

## GitHub Project Integration

Each client gets:
- Own GitHub Project board
- Labels: spec, plan, ready, in-progress, review, blocked, done
- Automated weekly report via workflow

## SLA Metrics

| Metric | Target |
|--------|--------|
| Task creation → first comment | < 2 hours |
| Standup generated | daily 9:00 AM |
| Weekly report | every Monday |

## Automation

```yaml
# .github/workflows/standup.yml
name: Daily Standup
on:
  schedule:
    - cron: '0 6 * * *'  # 9 AM client time
```

---

*Template for AI-first agency client repos*
