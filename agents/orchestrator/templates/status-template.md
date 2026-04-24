# Status Template — Orchestrator v2

> Этот файл = **короткая память** оркестратора. Обновляется на каждом шаге.
> При recovery (новая сессия) — агент читает status.md чтобы понять "где я остановился".

---

## Формат

```markdown
# Status

## Current
- **Step:** {N} of {total}
- **Description:** {что делаю прямо сейчас}
- **Agent:** {agent-name | orchestrator}
- **Started:** {ISO timestamp}
- **Last Updated:** {ISO timestamp}

## Progress
{Краткое описание что уже сделано и текущее состояние}

## Blockers
{Если есть блокеры — описать. Если нет — "None"}

## Next
{Следующий шаг после текущего}
```

---

## Правила

1. **Обновляй status.md** при каждой смене шага
2. **Не храни историю** — только текущее состояние (история в plan.md)
3. **Blockers** — записывай сразу, не жди
4. **Last Updated** — всегда актуальный timestamp
5. **При recovery** — status.md = первый файл для чтения

## Recovery Protocol

При старте новой сессии:
```
1. Read status.md → что делал? на каком шаге?
2. Read plan.md → весь план, что осталось?
3. Check GitHub Issue → актуальный публичный статус
4. Continue from current step
```
