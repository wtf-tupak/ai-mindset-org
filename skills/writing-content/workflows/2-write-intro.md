# Workflow 2: Write Intro

**Purpose:** Написать зацепляющий первый абзац с hook по структуре Julian Shapiro

**When to Use:**
- Идея валидирована (из workflow 1)
- Нужно написать начало статьи
- Хочешь протестировать идею в коротком формате
- Нужен hook для поста

**Prerequisites:**
- State файл с валидированной идеей (из workflow 1)
- Понимание 4 типов hooks (question, narrative, research, argument)
- Готовность к итерации

---

## Workflow Steps

### Step 1: Load Idea from State

**Description:** Загрузи идею из предыдущего workflow

**Actions:**

1. Прочитай state файл:
```bash
~/.claude/skills/writing-content/state/current-article.json
```

2. Извлеки ключевые данные:
```json
{
  "idea": {
    "refinedIdea": "...",
    "audience": "...",
    "problem": "...",
    "noveltyTypes": [...]
  }
}
```

3. Напомни пользователю про идею:
```
Отлично! Теперь напишем зацепляющий intro для твоей идеи:

💡 "[refinedIdea]"
🎯 Аудитория: [audience]

Intro состоит из:
1. HOOK — первая строка которая зацепит
2. CONTEXT — почему это важно
3. INTRIGUE — незавершённая история (хочется читать дальше)

Поехали! 🚀
```

**Expected Outcome:** Идея загружена, пользователь понимает структуру intro

---

### Step 2: Load Hooks Database

**Description:** Загрузи hooks database для генерации вариантов

**Prerequisites:**
```
READ: ~/.claude/skills/writing-content/references/hooks-database.md
```

**Actions:**

Объясни что сейчас будет:
```
Загружаю hooks database с готовыми шаблонами из Julian Shapiro framework...

✅ Loaded: 4 hook types + 20 viral patterns + 3 формулы

Сейчас создам 3 варианта intro используя РАЗНЫЕ hook types.
Каждый вариант будет оценён по 3 критериям (0-5):
- Hook Strength
- Clarity
- AI-Slop Score

Поехали!
```

**Expected Outcome:** Hooks database загружена

---

### Step 3: Generate 3 Intro Variants

**Description:** Создай 3 варианта intro с разными hook types

**Prerequisites:**
```
READ: ~/.claude/skills/writing-content/tools/scoring-system.md
READ: ~/.claude/skills/writing-content/tools/anti-ai-detector.md
READ: ~/.claude/skills/writing-content/tools/russian-quality-check.md (для русских текстов)
READ: ~/.claude/skills/writing-content/references/scoring-criteria.md
READ: ~/.claude/skills/writing-content/references/ai-slop-patterns.md
```

**Actions:**

Используя hooks database, создай 3 варианта:

**Variant 1: Question Hook**

Используя шаблон из `hooks-database.md` (Question section):

```
━━━━━━━━━━━━━━━━━
ВАРИАНТ 1: QUESTION HOOK

[Сгенерируй question hook на основе идеи из state]

Пример шаблона:
"Почему [проблема]?"
"Как [достичь желаемого результата] если [ограничение]?"

Полный intro (3-5 предложений):
[Hook sentence - вопрос]

[Context - почему проблема]
[Context - последствия]

[Intrigue - намёк на решение]
━━━━━━━━━━━━━━━━━
```

**Variant 2: Narrative Hook**

Используя шаблон из `hooks-database.md` (Narrative section):

```
━━━━━━━━━━━━━━━━━
ВАРИАНТ 2: NARRATIVE HOOK

[Сгенерируй narrative hook - история/ситуация]

Пример шаблона:
"Вчера я [действие]. [Неожиданный результат]."
"[Временная точка] я [ситуация]. Сегодня [контраст]."

Полный intro (3-5 предложений):
[Hook sentence - история]

[Context - развитие истории]
[Context - почему важно]

[Intrigue - что узнал/открыл]
━━━━━━━━━━━━━━━━━
```

**Variant 3: Argument Hook**

Используя шаблон из `hooks-database.md` (Argument section):

```
━━━━━━━━━━━━━━━━━
ВАРИАНТ 3: ARGUMENT HOOK

[Сгенерируй argument hook - bold statement]

Пример шаблона:
"[Популярное мнение] — это миф."
"Большинство [аудитория] делают [X] неправильно."

Полный intro (3-5 предложений):
[Hook sentence - bold claim]

[Context - почему claim верен]
[Context - последствия неправильного подхода]

[Intrigue - твой правильный подход]
━━━━━━━━━━━━━━━━━
```

**Expected Outcome:** 3 варианта intro созданы

---

### Step 4: Self-Score Each Variant (0-5)

**Description:** Оцени каждый вариант по 3 критериям используя scoring system

**Actions:**

Для КАЖДОГО из 3 вариантов:

**Критерий 1: Hook Strength (0-5)**

Сверяясь с `references/scoring-criteria.md` (Hook Strength section):

```
Hook Strength: [0-5]

Reasoning:
[2-3 предложения почему такая оценка.
Сравни с примерами из scoring-criteria.md]

Evidence:
[Из текста hook:
- "Релевантно для [аудитория]?"
- "Вызывает любопытство?"
- "Хочется узнать ответ?"]

Improvement:
[Как улучшить до 4-5/5]
```

**Критерий 2: Clarity (0-5)**

Сверяясь с `references/scoring-criteria.md` (Clarity section):

```
Clarity: [0-5]

Reasoning:
[13-летний поймёт логику? Простые слова? Конкретные примеры?]

Evidence:
[Примеры из текста]

Improvement:
[Actionable suggestions]
```

**Критерий 3: AI-Slop Score (0-5)**

Используя `tools/anti-ai-detector.md`:

**Run detection:**
```
🚨 AI-SLOP CHECK для варианта [N]:

Step 1: Lexical Scan
Red Flags найдено: [count] (delve, utilize, etc.)
Yellow Flags найдено: [count] (leverage, optimize, etc.)

Step 2: Structural Scan
Perfect structure: [Да/Нет]
Transition overload: [count]

Step 3: Tonal Scan
Безликость: [Да/Нет] (есть "я"/"мы"?)
No contractions: [count] (it is vs it's)

Step 4: Sentence Pattern Scan
Contrast framing: [count]
-ing verb overuse: [count]

Final Score: [0-5]
```

```
AI-Slop Score: [0-5]

Reasoning:
[Звучит как человек или AI?]

Evidence:
[Detected patterns:
- "Найдено [X] AI red flags"
- Список конкретных patterns]

Improvement:
[Конкретные фиксы:
- "utilize → use"
- "Убрать Furthermore"
- "Добавить сокращения (it's, don't)"]
```

**Критерий 4: Russian Quality Score (0-5)** *(для текстов на русском)*

Используя `tools/russian-quality-check.md`:

**Run detection:**
```
🇷🇺 RUSSIAN QUALITY CHECK для варианта [N]:

Step 1: Порядок слов
Неестественный порядок: [count]
Примеры: [если есть]

Step 2: Разрывы предложений
Искусственные разрывы: [count]
Примеры: [если есть]

Step 3: Примеры и культурный контекст
Неподходящие примеры: [count]
Примеры: [если есть]

Step 4: Кальки с английского
Обнаружено калек: [count]
Примеры: [если есть]

Step 5: Ритм и благозвучие
Проблемы с ритмом: [count]

Final Score: [0-5]
```

```
Russian Quality Score: [0-5]

Reasoning:
[Звучит естественно по-русски или как перевод?]

Evidence:
[Detected issues:
- "Найдено [X] проблем с порядком слов"
- Список конкретных issues]

Improvement:
[Конкретные фиксы:
- "Переставить: 'Я начал работать вчера' → 'Вчера я начал работать'"
- "Объединить короткие предложения"
- "Заменить Walmart → Пятёрочка"]
```

**Overall Score для варианта:**

```
Overall: (hook_strength + clarity + ai_slop_score + russian_quality_score) / 4 = [X.X]/5
```

**NOTE:** Для текстов НЕ на русском языке, пропускаем Russian Quality Check и считаем:
```
Overall: (hook_strength + clarity + ai_slop_score) / 3 = [X.X]/5
```

**Repeat для всех 3 вариантов**

**Expected Outcome:** Все 3 варианта оценены 0-5 по 3 критериям

---

### Step 5: Apply AI-Slop Fixes and Russian Quality Fixes (if needed)

**Description:** Если AI-Slop score < 4 ИЛИ Russian Quality < 4 для любого варианта, применить фиксы

**Actions:**

**A) Для каждого варианта где AI-Slop < 4:**

```
⚠️ ВАРИАНТ [N]: AI-Slop Score [X]/5 < 4

Применяю фиксы...

BEFORE:
[original text]

Detected patterns:
- [pattern 1]: [fix]
- [pattern 2]: [fix]

AFTER:
[fixed text]

New AI-Slop Score: [Y]/5 ✅
```

**B) Для каждого варианта на русском где Russian Quality < 4:**

```
⚠️ ВАРИАНТ [N]: Russian Quality Score [X]/5 < 4

Применяю фиксы для русского языка...

BEFORE:
[original text]

Detected issues:
- [issue 1]: [fix - например, "Переставить порядок слов"]
- [issue 2]: [fix - например, "Объединить короткие предложения"]
- [issue 3]: [fix - например, "Заменить культурно-неподходящий пример"]

AFTER:
[fixed text]

New Russian Quality Score: [Y]/5 ✅
```

Re-score после фиксов:
- Hook Strength (может измениться)
- Clarity (может измениться)
- AI-Slop Score (должен быть >= 4)
- Russian Quality Score [если русский текст] (должен быть >= 4)
- Overall

**Thresholds:**
- Все варианты должны иметь AI-Slop >= 4
- Все варианты на русском должны иметь Russian Quality >= 4

**Expected Outcome:** Все 3 варианта human-sounding и естественно звучат на своём языке

---

### Step 6: Present All 3 Variants with Scores

**Description:** Покажи все 3 варианта с оценками и рекомендацией

**Actions:**

```
✅ Готово! Вот 3 варианта intro с оценками:

━━━━━━━━━━━━━━━━━
📝 ВАРИАНТ 1: QUESTION HOOK

[Full intro text]

📊 Оценка:
Hook Strength: [X]/5 — [short reasoning]
Clarity: [Y]/5 — [short reasoning]
AI-Slop: [Z]/5 — [short reasoning]
━━━━━━━━━━━━━━━━━
OVERALL: [XX]/5

━━━━━━━━━━━━━━━━━
📝 ВАРИАНТ 2: NARRATIVE HOOK

[Full intro text]

📊 Оценка:
Hook Strength: [X]/5
Clarity: [Y]/5
AI-Slop: [Z]/5
━━━━━━━━━━━━━━━━━
OVERALL: [XX]/5

━━━━━━━━━━━━━━━━━
📝 ВАРИАНТ 3: ARGUMENT HOOK

[Full intro text]

📊 Оценка:
Hook Strength: [X]/5
Clarity: [Y]/5
AI-Slop: [Z]/5
━━━━━━━━━━━━━━━━━
OVERALL: [XX]/5

━━━━━━━━━━━━━━━━━
🎯 РЕКОМЕНДАЦИЯ: Вариант [N] (overall [XX]/5)

Почему: [reasoning based on scores]

Какой вариант выбираешь?
OPTIONS:
- "Вариант 1|2|3"
- "Улучшить вариант [N]" → применяем improvement suggestions
- "Переписать все заново"
```

**Expected Outcome:** Пользователь видит все 3 варианта + scores + рекомендацию

---

### Step 7: Hook Type Selection (OLD - DEPRECATED)

**Description:** Помоги выбрать тип hook который лучше подходит для идеи

**Note:** Этот step заменён на Step 3-6 (генерация 3 вариантов + scoring). Оставлен для reference.

**Actions:**

Объясни 4 типа hooks:

```
По Julian Shapiro есть 4 типа hooks. Выбери какой лучше зацепит твою аудиторию:
```

**1. Question Hook**
```
❓ QUESTION HOOK — Задаёшь вопрос который аудитория задаёт себе

Когда использовать:
- Аудитория сталкивается с этим вопросом
- Вопрос вызывает "да, я тоже это хочу знать!"

Пример:
"Почему люди не читают твои email?"
"Как писать контент который действительно продаёт?"
"Зачем нужен personal brand если ты не продаёшь?"

Твой вопрос может быть: "[сгенерируй на основе идеи]"
```

**2. Narrative Hook**
```
📖 NARRATIVE HOOK — Начинаешь с истории/ситуации

Когда использовать:
- У тебя есть история которая иллюстрирует проблему
- Хочешь чтобы читатель узнал себя

Пример:
"Вчера я отправил 100 email. Открыли 5. Ответил 1."
"Три года назад я потратил $50K на рекламу и получил 0 клиентов."
"Мой первый пост набрал 2 лайка. Один из них был я сам."

Твоя история может быть: "[сгенерируй на основе контекста]"
```

**3. Research Hook**
```
📊 RESEARCH HOOK — Начинаешь с факта/статистики/исследования

Когда использовать:
- Есть шокирующая статистика
- Есть counter-intuitive данные
- Данные делают bold claim

Пример:
"Исследование показало: 80% email удаляют не читая первую строку."
"95% AI-контента выглядит как AI-контент. Вот почему."
"Средний человек тратит 2 секунды на email. Что делать с этими 2 секундами?"

Твой research hook может быть: "[сгенерируй если есть данные]"
```

**4. Argument Hook**
```
💥 ARGUMENT HOOK — Делаешь bold statement/claim

Когда использовать:
- Хочешь сразу показать свою позицию
- Идея counter-intuitive или counter-narrative
- Хочешь спровоцировать реакцию

Пример:
"Большинство маркетеров пишут email неправильно."
"Personal brand — это не про тебя. Это про аудиторию."
"AI не сделает тебя лучшим писателем. Наоборот — хуже."

Твой argument hook может быть: "[сгенерируй на основе novelty]"
```

**Present Options:**
```
На основе твоей идеи, вот 3 варианта hook:

1️⃣ QUESTION: "[вопрос]"
2️⃣ NARRATIVE: "[история]"
3️⃣ ARGUMENT: "[bold statement]"

Какой зацепит твою аудиторию?
OPTIONS:
- "Вариант 1|2|3"
- "Комбинация нескольких"
- "Свой вариант: ..."
```

**Expected Outcome:** Hook выбран или кастомизирован

---

### Step 3: Write Full Intro

**Description:** Напиши полный intro на основе выбранного hook

**Actions:**

Структура intro (3-5 предложений):

**Sentence 1: HOOK**
```
[Выбранный hook]
```

**Sentence 2-3: CONTEXT**
```
Почему это важно?
- Объясни последствия проблемы
- Покажи почему читатель должен обращать внимание
- Можешь добавить supporting data
```

**Sentence 4-5: INTRIGUE**
```
Создай незавершённость:
- Намекни на решение но НЕ раскрывай полностью
- Используй phrases: "Вот как...", "Вот почему...", "Вот что я узнал..."
- Withhold информацию чтобы человек хотел читать дальше
```

**Example Template:**
```
[HOOK - question/narrative/research/argument]

[CONTEXT - почему это проблема]
[CONTEXT - последствия или усиление проблемы]

[INTRIGUE - намёк на решение]
[INTRIGUE - обещание инсайта]
```

**Present Draft:**
```
Вот первый вариант intro:

━━━━━━━━━━━━━━━━━
[Hook sentence]

[Context sentence 1]
[Context sentence 2]

[Intrigue sentence 1]
[Intrigue sentence 2]
━━━━━━━━━━━━━━━━━

Что скажешь?
OPTIONS:
- "Отлично, идём дальше"
- "Переписать hook" → вернуться к Step 2
- "Изменить context/intrigue" → уточни что именно
- "Начать с нуля" → вернуться к workflow 1
```

**Expected Outcome:** Intro написан и одобрен пользователем

---

### Step 4: Quality Check

**Description:** Проверь intro по чек-листу Julian Shapiro

**Actions:**

Объясни что будешь проверять:
```
Давай проверим intro по чек-листу Julian Shapiro:
```

**Check 1: Hook Strength**
```
✅ HOOK TEST
❓ Первая строка зацепляет?
❓ Хочется узнать ответ/продолжение?
❓ Релевантно для целевой аудитории?

[Проверяем hook]

Verdict: [Strong ✅ | Weak ❌ | Medium 🤔]
```

**Check 2: Context Clarity**
```
✅ CONTEXT TEST
❓ Понятно почему это важно?
❓ Есть ли stakes (что потеряют если не прочитают)?
❓ Достаточно ли context чтобы не потерять новичка?

[Проверяем context]

Verdict: [Clear ✅ | Unclear ❌ | Needs work 🤔]
```

**Check 3: Intrigue Present**
```
✅ INTRIGUE TEST
❓ Есть ли незавершённость (хочется узнать что дальше)?
❓ Obещание решения присутствует?
❓ Не раскрыли ли слишком много?

[Проверяем intrigue]

Verdict: [Good ✅ | Missing ❌ | Too much revealed 🤔]
```

**Overall Assessment:**
```
━━━━━━━━━━━━━━━━━
📊 INTRO QUALITY CHECK

Hook: [Strong/Weak/Medium]
Context: [Clear/Unclear/Needs work]
Intrigue: [Good/Missing/Too much]

ОБЩАЯ ОЦЕНКА: [Excellent ✅ | Good 🤔 | Needs revision ❌]
```

**IF любой пункт ❌ или 🤔:**
```
Рекомендую улучшить:
- [Конкретные советы по каждому слабому пункту]

OPTIONS:
- "Переписать" → указываешь что именно переписать
- "Продолжить как есть" → сохраняем и идём дальше
```

**Expected Outcome:** Intro проверен, рекомендации даны

---

### Step 5: Iterate or Proceed

**Description:** Дай пользователю выбор — улучшать intro или двигаться к тестированию

**Actions:**

**IF intro quality = Excellent ✅:**
```
🎉 Отличный intro! Готов к тестированию.

Что дальше?
OPTIONS:
- "Протестировать на AI-персонах" → workflow 3-test-with-personas.md
- "Сохранить и вернуться позже" → сохраняем в state
- "Ещё немного доработать" → возвращаемся к Step 3
```

**IF intro quality = Good 🤔:**
```
Хороший intro, но может быть ещё лучше.

Рекомендую:
[Конкретные советы]

OPTIONS:
- "Улучшить по рекомендациям" → возвращаемся к Step 3
- "Протестировать как есть" → workflow 3
- "Полностью переписать" → возвращаемся к Step 2
```

**IF intro quality = Needs revision ❌:**
```
Intro нуждается в доработке.

Проблемы:
[Список проблем]

OPTIONS:
- "Переписать intro" → возвращаемся к Step 3
- "Изменить hook" → возвращаемся к Step 2
- "Пересмотреть идею" → возвращаемся к workflow 1
```

**Expected Outcome:** Решение двигаться дальше или улучшать intro

---

### Step 8: Save to State + Markdown Export

**Description:** Сохрани все 3 варианта в state и обнови markdown файл

**Prerequisites:**
```
READ: ~/.claude/skills/writing-content/tools/markdown-exporter.md
```

**Actions:**

**Part 1: Update State File (v2 structure)**

Обнови state файл с 3 вариантами:

```json
{
  "id": "existing-uuid",
  "updated": "2025-11-26T16:30:00Z",
  "status": "intro",
  "idea": {
    // existing idea data with research + scoring
  },
  "intro": {
    "variants": [
      {
        "number": 1,
        "hookType": "question",
        "hook": "[Первая строка question hook]",
        "fullIntro": "[Полный intro текст варианта 1]",
        "scoring": {
          "hook_strength": {
            "score": 4,
            "reasoning": "...",
            "evidence": "...",
            "improvement": "..."
          },
          "clarity": {
            "score": 5,
            "reasoning": "...",
            "evidence": "...",
            "improvement": "..."
          },
          "ai_slop_score": {
            "score": 4,
            "reasoning": "...",
            "evidence": "...",
            "improvement": "..."
          },
          "overall": 4.3
        },
        "createdAt": "2025-11-26T16:30:00Z"
      },
      {
        "number": 2,
        "hookType": "narrative",
        "hook": "[Первая строка narrative hook]",
        "fullIntro": "[Полный intro текст варианта 2]",
        "scoring": {
          "hook_strength": { "score": 5, "reasoning": "...", "evidence": "...", "improvement": "..." },
          "clarity": { "score": 5, "reasoning": "...", "evidence": "...", "improvement": "..." },
          "ai_slop_score": { "score": 5, "reasoning": "...", "evidence": "...", "improvement": "..." },
          "overall": 5.0
        },
        "createdAt": "2025-11-26T16:30:00Z"
      },
      {
        "number": 3,
        "hookType": "argument",
        "hook": "[Первая строка argument hook]",
        "fullIntro": "[Полный intro текст варианта 3]",
        "scoring": {
          "hook_strength": { "score": 4, "reasoning": "...", "evidence": "...", "improvement": "..." },
          "clarity": { "score": 4, "reasoning": "...", "evidence": "...", "improvement": "..." },
          "ai_slop_score": { "score": 4, "reasoning": "...", "evidence": "...", "improvement": "..." },
          "overall": 4.0
        },
        "createdAt": "2025-11-26T16:30:00Z"
      }
    ],
    "selected_variant": 2,
    "version": 2
  },
  "article": {
    "markdown_export": {
      "file_path": "/path/to/writing-session-2025-11-26-160000.md",
      "last_updated": "2025-11-26T16:30:00Z",
      "sections_written": ["idea", "intro"],
      "sync_status": "synced"
    }
  }
}
```

**Part 2: Append to Markdown File**

Следуя `tools/markdown-exporter.md`, append секцию "Intro":

```markdown
## Этап 2: Написание Intro

### Вариант 1: Question Hook - Оценка: [X.X]/5

**Hook Type:** question

**Текст:**
[fullIntro для варианта 1]

**Scoring:**
- Hook Strength: [X]/5 — [reasoning]
- Clarity: [Y]/5 — [reasoning]
- AI-Slop: [Z]/5 — [reasoning]
- **Overall: [XX]/5**

---

### Вариант 2: Narrative Hook - Оценка: [X.X]/5

**Hook Type:** narrative

**Текст:**
[fullIntro для варианта 2]

**Scoring:**
- Hook Strength: [X]/5
- Clarity: [Y]/5
- AI-Slop: [Z]/5
- **Overall: [XX]/5**

---

### Вариант 3: Argument Hook - Оценка: [X.X]/5

**Hook Type:** argument

**Текст:**
[fullIntro для варианта 3]

**Scoring:**
- Hook Strength: [X]/5
- Clarity: [Y]/5
- AI-Slop: [Z]/5
- **Overall: [XX]/5**

---

### Выбранный вариант

✅ **Вариант [N]** (overall [XX]/5)

**Почему:** [reasoning based on scores]

**Финальный intro:**

━━━━━━━━━━━━━━━━━
[fullIntro выбранного варианта]
━━━━━━━━━━━━━━━━━

---

*Следующий этап: Тестирование на персонах (workflow 3)*
```

**Part 3: Update markdown_export in state**

```json
"markdown_export": {
  "file_path": "/absolute/path",
  "last_updated": "2025-11-26T16:30:00Z",
  "sections_written": ["idea", "intro"],
  "sync_status": "synced"
}
```

Сообщи результат:
```
✅ Все 3 варианта сохранены!

🎯 **Выбранный:** Вариант [N] (overall [XX]/5)

━━━━━━━━━━━━━━━━━
[fullIntro выбранного варианта]
━━━━━━━━━━━━━━━━━

📊 **Оценка:**
- Hook Strength: [X]/5
- Clarity: [Y]/5
- AI-Slop: [Z]/5

💾 **Экспорт:**
Markdown файл обновлён: `[filename]`

Теперь можем протестировать на AI-персонах! (workflow 3)
```

**Expected Outcome:**
- State обновлён с 3 вариантами + scoring + selected variant
- Markdown файл дополнен секцией "Intro" с всеми 3 вариантами
- Пользователь видит выбранный вариант и его оценки

---

## Outputs

**What this workflow produces:**
- **Hook** — Зацепляющая первая строка (question/narrative/research/argument)
- **Full intro** — Полный первый абзац (3-5 предложений)
- **Quality assessment** — Оценка по 3 критериям
- **State update** — Intro сохранён для следующих workflows

**Where outputs are stored:**
- `~/.claude/skills/writing-content/state/current-article.json`

---

## Related Workflows

- **1-generate-idea.md** — Предыдущий шаг (нужна валидированная идея)
- **3-test-with-personas.md** — Следующий шаг (тестирование intro на AI-персонах)
- **5-rewrite-clarity.md** — Если нужно переписать intro позже

---

## Examples

### Example 1: Question Hook для B2B маркетеров

**Input:**
```json
{
  "idea": {
    "refinedIdea": "Большинство маркетеров пишут email неправильно - они думают главное это информация, но на самом деле главное это первая строка",
    "audience": "B2B маркетеры в SaaS, 28-40 лет",
    "noveltyTypes": ["counter-intuitive", "make-seen"]
  }
}
```

**Process:**
```
Claude: Вот 3 варианта hook:

1️⃣ QUESTION: "Почему люди не читают твои email?"
2️⃣ NARRATIVE: "Вчера я отправил 100 email. Открыли 5. Ответил 1."
3️⃣ ARGUMENT: "Большинство маркетеров пишут email неправильно."

User: Вариант 1

Claude: Отлично! Вот intro:

━━━━━━━━━━━━━━━━━
Почему люди не читают твои email?

Ты тратишь часы на идеальный контент, но получаешь 5% open rate.
Проблема не в контенте. Проблема в первой строке.

Вот как я пишу email которые всегда читают.
И это не про subject line.
━━━━━━━━━━━━━━━━━

📊 QUALITY CHECK:
✅ Hook: Strong (релевантный вопрос для аудитории)
✅ Context: Clear (понятна проблема и stakes)
✅ Intrigue: Good (withhold решения)

ОБЩАЯ ОЦЕНКА: Excellent ✅

Протестировать на AI-персонах?
```

**Output:**
```json
{
  "intro": {
    "hook": "Почему люди не читают твои email?",
    "hookType": "question",
    "fullIntro": "Почему люди не читают твои email?\n\nТы тратишь часы на идеальный контент, но получаешь 5% open rate.\nПроблема не в контенте. Проблема в первой строке.\n\nВот как я пишу email которые всегда читают.\nИ это не про subject line.",
    "version": 1,
    "qualityCheck": {
      "hookStrength": "strong",
      "contextClarity": "clear",
      "intriguePresent": "good",
      "overallAssessment": "excellent"
    }
  }
}
```

---

### Example 2: Argument Hook нуждается в доработке

**Input:**
```json
{
  "idea": {
    "refinedIdea": "AI не заменит маркетологов - наоборот, сделает их работу более важной",
    "audience": "Маркетологи 25-40 лет которые боятся AI",
    "noveltyTypes": ["counter-intuitive"]
  }
}
```

**Process:**
```
Claude: Вот варианты hook:

1️⃣ QUESTION: "Боишься что AI заменит тебя?"
2️⃣ ARGUMENT: "AI не заменит маркетологов."

User: Вариант 2

Claude: Вот intro:

━━━━━━━━━━━━━━━━━
AI не заменит маркетологов.

Многие переживают что останутся без работы.
Но на самом деле AI делает маркетологов важнее.

Вот почему.
━━━━━━━━━━━━━━━━━

📊 QUALITY CHECK:
🤔 Hook: Medium (слишком direct, не цепляет)
🤔 Context: Needs work (не показаны stakes)
❌ Intrigue: Missing ("вот почему" слишком generic)

ОБЩАЯ ОЦЕНКА: Needs revision ❌

Рекомендую:
- Hook: Сделать более provocative ("AI не заменит тебя. Наоборот - сделает незаменимым.")
- Context: Добавить что именно меняется
- Intrigue: Конкретнее намекнуть на инсайт

User: Давай переписать

Claude: Вот новая версия:

━━━━━━━━━━━━━━━━━
AI не заменит тебя. Наоборот — сделает незаменимым.

Пока все боятся что AI отберёт работу, умные маркетологи используют его
чтобы делать то, что раньше делали целые команды.

Теперь ты не исполнитель. Ты стратег с суперсилой.
Вот как это работает.
━━━━━━━━━━━━━━━━━

📊 QUALITY CHECK:
✅ Hook: Strong (provocative + counter-intuitive)
✅ Context: Clear (shift explained)
✅ Intrigue: Good (конкретное обещание)

ОБЩАЯ ОЦЕНКА: Excellent ✅

Намного лучше! Протестировать?
```

---

## Tips for Writing Hooks

### Question Hooks - Best Practices

**✅ Good Questions:**
- "Почему люди не читают твои email?" — direct pain point
- "Как писать каждый день если нет времени?" — common struggle
- "Зачем personal brand если ты не продаёшь?" — challenges assumption

**❌ Bad Questions:**
- "Хочешь научиться маркетингу?" — too generic
- "Знаешь ли ты что такое SEO?" — yes/no answer
- "Что такое контент-маркетинг?" — educational, not engaging

**Rule:** Question должен быть **вопрос который аудитория задаёт себе**

---

### Narrative Hooks - Best Practices

**✅ Good Narratives:**
- "Вчера я отправил 100 email. Открыли 5." — конкретные цифры
- "Три года назад я был broke. Сегодня..." — transformation
- "Мой first post набрал 2 лайка. Один был я." — relatable failure

**❌ Bad Narratives:**
- "Однажды я работал в компании..." — too vague
- "Я всегда любил маркетинг..." — not interesting
- "В детстве я мечтал..." — irrelevant backstory

**Rule:** Narrative должна быть **specific, relatable, short**

---

### Research Hooks - Best Practices

**✅ Good Research:**
- "80% email удаляют не читая первую строку" — shocking stat
- "Исследование 1000 маркетологов показало..." — authority
- "95% AI-контента выглядит как AI" — unexpected number

**❌ Bad Research:**
- "Многие люди не читают email" — not specific
- "Некоторые исследования показывают..." — vague
- "По данным..." — boring opener

**Rule:** Research должен быть **shocking, specific, backed by source**

---

### Argument Hooks - Best Practices

**✅ Good Arguments:**
- "Большинство маркетеров пишут email неправильно" — bold claim
- "Personal brand — это не про тебя" — counter-intuitive
- "AI сделает тебя хуже, не лучше" — provocative

**❌ Bad Arguments:**
- "Маркетинг это важно" — obvious
- "Нужно делать контент" — generic advice
- "SEO работает" — not interesting

**Rule:** Argument должен быть **bold, counter-intuitive, provocative**

---

## Quality Checklist

Before moving to next workflow, verify:

- [ ] Hook написан и проверен
- [ ] Hook type выбран осознанно (question/narrative/research/argument)
- [ ] Context объясняет почему это важно
- [ ] Есть stakes (что потеряют если не прочитают)
- [ ] Intrigue создаёт незавершённость
- [ ] Не раскрыли слишком много
- [ ] Intro 3-5 предложений
- [ ] Quality check пройден (все пункты ✅ или 🤔)
- [ ] Пользователь одобрил intro
- [ ] State файл обновлён

---

**Last Updated:** 2025-11-25
