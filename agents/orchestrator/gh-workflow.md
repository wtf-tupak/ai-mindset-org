# GitHub Issues Workflow — Orchestrator

## Принцип

**GitHub Issues = Source of Truth** для всех задач в Personal Corp.
Каждая значимая задача агента должна быть отражена в Issues.

---

## Labels (настроить один раз)

```bash
# Создать labels для роутинга
gh label create "agent-task" --repo wtf-tupak/pos-print --color "0E8A16" --description "Задача для агента"
gh label create "agent:prompt-architect" --repo wtf-tupak/pos-print --color "1D76DB" --description "Делегировано prompt-architect"
gh label create "agent:marketing" --repo wtf-tupak/pos-print --color "D93F0B" --description "Делегировано marketing"
gh label create "agent:vendor" --repo wtf-tupak/pos-print --color "FBCA04" --description "Делегировано vendor-manager"
gh label create "agent:analyst" --repo wtf-tupak/pos-print --color "5319E7" --description "Делегировано business-analyst"
gh label create "agent:orchestrator" --repo wtf-tupak/pos-print --color "B60205" --description "Orchestrator делает сам"
gh label create "status:in-progress" --repo wtf-tupak/pos-print --color "FEF2C0" --description "В работе"
gh label create "status:done" --repo wtf-tupak/pos-print --color "0E8A16" --description "Завершено"
gh label create "status:blocked" --repo wtf-tupak/pos-print --color "E4E669" --description "Заблокировано"
gh label create "priority:critical" --repo wtf-tupak/pos-print --color "B60205" --description "Критический приоритет"
gh label create "priority:high" --repo wtf-tupak/pos-print --color "D93F0B" --description "Высокий приоритет"
```

---

## Workflow Commands

### Создание задачи
```bash
gh issue create \
  --repo wtf-tupak/pos-print \
  --title "[Agent] Описание задачи" \
  --body "## Task
Подробное описание задачи.

## Context
Контекст из разговора с юзером.

## Agent
Назначен: {agent-name}

## Plan
- [ ] Step 1
- [ ] Step 2
- [ ] Step 3

## Status
🟡 In Progress" \
  --label "agent-task,agent:{agent-name},status:in-progress"
```

### Просмотр активных задач
```bash
# Все задачи агентов
gh issue list --repo wtf-tupak/pos-print --label "agent-task" --state open

# Задачи конкретного агента
gh issue list --repo wtf-tupak/pos-print --label "agent:prompt-architect" --state open

# Критические задачи
gh issue list --repo wtf-tupak/pos-print --label "priority:critical" --state open
```

### Обновление прогресса
```bash
gh issue comment {N} --repo wtf-tupak/pos-print \
  --body "**Progress Update**
- Step: {current_step}/{total_steps}
- Agent: {agent-name}
- Quality so far: {score}/100
- Next: {next_step_description}
- Updated: $(date -Iseconds)"
```

### Эскалация
```bash
gh issue comment {N} --repo wtf-tupak/pos-print \
  --body "⚠️ **Escalation**
- Agent: {agent-name} failed {attempt_count}x
- Reason: {failure_reason}
- Action: Orchestrator takes over (self-handle)
- Updated: $(date -Iseconds)"

# Перенести label
gh issue edit {N} --repo wtf-tupak/pos-print \
  --remove-label "agent:{agent-name}" \
  --add-label "agent:orchestrator"
```

### Закрытие задачи
```bash
gh issue close {N} --repo wtf-tupak/pos-print \
  --comment "✅ **Completed**
- Agent: {agent-used}
- Quality: {score}/100
- Result: {brief_summary}
- Completed: $(date -Iseconds)"

# Обновить label
gh issue edit {N} --repo wtf-tupak/pos-print \
  --remove-label "status:in-progress" \
  --add-label "status:done"
```

---

## Issue Template

При создании issue через оркестратор, использовать этот формат:

```markdown
## Task
{Что нужно сделать}

## Context  
{Откуда задача, связанные ресурсы}

## Agent
{Назначенный агент или "orchestrator (self)"}

## Acceptance Criteria
- [ ] Критерий 1
- [ ] Критерий 2

## Plan
- [ ] Step 1: {описание}
- [ ] Step 2: {описание}

## Status
🟡 In Progress | 🟢 Done | 🔴 Blocked | ⚠️ Escalated

## Quality
Score: —/100
```

---

## Automation Ideas (Фаза 3)

1. **Webhook → Telegram**: GitHub Issue created → уведомление в Telegram
2. **Auto-assign**: Issue с label `agent:X` → автоматически назначить агенту
3. **Daily digest**: Утром показать все open issues с `agent-task`
4. **Stale detection**: Issue без обновлений > 24h → уведомление
