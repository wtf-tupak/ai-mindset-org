# Workflow 5: Rewrite for Clarity

**Purpose:** Переписать статью для clarity, succinctness, intrigue (Julian Shapiro rewriting)

**When to Use:**
- Черновик написан (из workflow 4)
- Нужно сделать текст яснее и короче
- Хочешь увеличить dopamine hits

**Prerequisites:**
- State файл с draft
- Готовность к честному редактированию
- Понимание что "kill your darlings"

---

## Workflow Steps

### Step 1: Load Draft from State

**Description:** Загрузи черновик для переписывания

**Actions:**

```
Отлично! Переходим к rewriting для clarity, succinctness, intrigue.

Загружаю черновик...
Слов: [count]
Секций: [count]

По Julian Shapiro, rewriting это три прохода:
1. CLARITY — Простой язык (13-летний поймёт логику?)
2. SUCCINCTNESS — Убрать лишнее (каждое слово оправдывает существование?)
3. INTRIGUE — Dopamine hits (novel insights + withholding info)

Поехали! 🚀
```

**Expected Outcome:** Draft загружен, пользователь понимает процесс

---

### Step 2: Clarity Pass

**Description:** Упрости язык и сделай логику прозрачной

**Actions:**

Объясни clarity test:
```
━━━━━━━━━━━━━━━━━
CLARITY TEST (Julian Shapiro)

Вопрос: Может ли 13-летний понять ЛОГИКУ твоего аргумента?
(Не все термины, но логику — почему A ведёт к B)

Красные флаги clarity:
❌ Abstract phrases без примеров
❌ Несколько идей в одном предложении
❌ Сложные слова где можно проще
❌ Отсутствие примеров
━━━━━━━━━━━━━━━━━
```

Для каждой секции:

1. **Показать original:**
```
ORIGINAL:
[Параграф из черновика]

Проблемы:
- [Найденные проблемы с clarity]
```

2. **Показать rewritten:**
```
REWRITTEN:
[Упрощённая версия]

Что изменили:
- Проще слова: "[сложное]" → "[простое]"
- Убрали abstract: добавили пример
- Разбили предложение: 1 идея = 1 предложение
```

3. **Спросить одобрение:**
```
OPTIONS:
- "Принять" → сохраняем rewritten
- "Доработать" → уточни что
- "Оставить original"
```

**Expected Outcome:** Весь текст проверен на clarity

---

### Step 3: Succinctness Pass

**Description:** Убери лишние слова (verbal summary technique)

**Actions:**

Объясни verbal summary:
```
━━━━━━━━━━━━━━━━━
VERBAL SUMMARY (Julian Shapiro technique)

Метод: Перескажи секцию из памяти в 2-3 предложениях.
То что ты НЕ вспомнил = не важно для аргумента.

Результат: Каждое предложение оправдывает своё существование.
━━━━━━━━━━━━━━━━━
```

Для каждой секции:

1. **Покажи original**
2. **Сделай verbal summary:**
```
VERBAL SUMMARY (из памяти):
[2-3 предложения — суть секции]
```

3. **Сравни:**
```
Original: 250 слов
Verbal summary: 80 слов
Разница: 170 слов filler

Что убрали:
- Повторы одной мысли
- Filler words ("в принципе", "так сказать")
- Unnecessary qualifiers ("достаточно", "весьма")
```

4. **Предложи rewritten:**
```
REWRITTEN (на основе verbal summary):
[Короткая версия]

Потеряли ли мы что-то важное?
```

**Expected Outcome:** Текст стал короче без потери смысла

---

### Step 4: Intrigue Pass

**Description:** Добавь dopamine hits и withholding

**Actions:**

Объясни intrigue:
```
━━━━━━━━━━━━━━━━━
INTRIGUE = Dopamine Hits + Withholding

DOPAMINE HITS — Novel insights которые читатель не ожидал
Count: Сколько раз читатель думает "О, интересно!" или "Никогда так не думал"

Цель: 1 dopamine hit каждые 1-2 параграфа

WITHHOLDING — Не раскрывай всё сразу
Создавай anticipation: "Вот почему..." "Вот как..." "Есть одна проблема..."
━━━━━━━━━━━━━━━━━
```

Проверь каждую секцию:

**Dopamine count:**
```
Секция 1: [content]
Dopamine hits: [count] ("counter-intuitive point", "unexpected data")
Нужно ли больше?
```

**Withholding check:**
```
Есть ли моменты где создаётся anticipation?
- Setup → Payoff structure?
- Withhold решения до последнего момента?
```

**Expected Outcome:** Intrigue усилен

---

### Step 5: AI-Slop Check After Rewrite (NEW)

**Description:** КРИТИЧНО - проверь что rewrite не сделал текст MORE AI-like

**Prerequisites:**
```
READ: ~/.claude/skills/writing-content/tools/anti-ai-detector.md
```

**Actions:**

```
🚨 AI-SLOP CHECK после rewriting...

ВАЖНО: Иногда rewriting добавляет AI patterns!

Comparing:
- Original draft AI-Slop: [X]/5
- Rewritten AI-Slop: [Y]/5

IF rewritten score < original score:
  ⚠️ WARNING: Rewrite сделал текст MORE AI-like!

  Detected new patterns:
  [Список patterns которых не было в original]

  Reverting problematic changes...

ELSE IF rewritten score >= 4:
  ✅ Rewrite OK, human voice preserved

ELSE:
  ⚠️ Score < 4, applying fixes...
```

**Expected Outcome:** Rewritten текст human-sounding (score >= 4)

---

### Step 6: Assembly & Comparison

**Description:** Покажи до/после всей статьи

**Actions:**

```
✅ Rewriting завершён!

━━━━━━━━━━━━━━━━━
📊 РЕЗУЛЬТАТЫ:

BEFORE:
Слов: 1800
Clarity issues: 12
Filler: ~25%
Dopamine hits: 3
AI-Slop: [X]/5

AFTER:
Слов: 1350 (-25%)
Clarity: ✅ All fixed
Filler: ~5%
Dopamine hits: 8
AI-Slop: [Y]/5 ✅

━━━━━━━━━━━━━━━━━

OPTIONS:
- "Показать полный rewritten текст"
- "Показать side-by-side comparison"
- "Переходим к style polish" → workflow 6
```

**Expected Outcome:** Rewritten статья готова и AI-free

---

### Step 7: Save to State + Markdown Export

**Prerequisites:**
```
READ: ~/.claude/skills/writing-content/tools/markdown-exporter.md
```

**Actions:**

**Part 1: Update State**

```json
{
  "article": {
    "draft": "...",
    "rewritten": "[rewritten full text]",
    "rewritingStats": {
      "originalWordCount": 1800,
      "rewrittenWordCount": 1350,
      "clarityIssuesFixed": 12,
      "fillerRemoved": 450,
      "dopamineHitsAdded": 5
    },
    "markdown_export": {
      "file_path": "/path/to/writing-session-2025-11-26-160000.md",
      "last_updated": "2025-11-26T17:30:00Z",
      "sections_written": ["idea", "intro", "drafting", "rewriting"],
      "sync_status": "synced"
    },
    "rewrittenAt": "timestamp"
  }
}
```

**Part 2: Append to Markdown File**

```markdown
## Этап 5: Rewriting для Clarity

### Stats

**BEFORE:**
- Слов: [originalWordCount]
- Clarity issues: [count]
- Filler: ~25%
- Dopamine hits: [count]
- AI-Slop: [X]/5

**AFTER:**
- Слов: [rewrittenWordCount] (-[%]%)
- Clarity: ✅ All fixed
- Filler: ~5%
- Dopamine hits: [count]
- AI-Slop: [Y]/5 ✅

### Rewritten Text

[article.rewritten]

---

*Следующий этап: Style & Polish (workflow 6)*
```

**Part 3: Update markdown_export**

```json
"sections_written": ["idea", "intro", "drafting", "rewriting"]
```

**Expected Outcome:**
- Rewritten версия сохранена
- Markdown файл обновлён
- AI-Slop check passed

---

## Related Workflows

- **4-write-full-article.md** — Предыдущий шаг (draft)
- **6-style-polish.md** — Следующий шаг (style + voice)

---

**Last Updated:** 2025-11-25
