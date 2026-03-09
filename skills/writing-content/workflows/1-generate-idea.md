# Workflow 1: Generate Idea

**Purpose:** Интерактивно помочь пользователю найти и проработать идею для статьи по Julian Shapiro framework

**When to Use:**
- Пользователь не знает о чём писать
- Есть размытая идея, которую нужно доработать
- Нужно валидировать идею перед началом написания
- Хочет убедиться что идея "зайдёт"

**Prerequisites:**
- Понимание 5 типов novelty (Julian Shapiro)
- Готовность задавать уточняющие вопросы
- State файл для сохранения результата

---

## Workflow Steps

### Step 1: Initial Discovery

**Description:** Узнай что пользователь хочет написать и собери базовый контекст

**Actions:**

1. Приветствие и объяснение процесса:
```
Отлично! Давай найдём зацепляющую идею для твоей статьи.

Я задам несколько вопросов, чтобы помочь сформулировать идею,
которая будет и интересной (novelty) и близкой аудитории (resonance).

Готов? 🚀
```

2. Задай первый вопрос:
```
О чём хочешь написать? (даже если пока не очень понятно)
```

**Expected Outcome:** Получить первичную идею от пользователя (может быть размытой)

---

### Step 2: Audience Discovery

**Description:** Выясни для кого статья и какую проблему решает

**Actions:**

Задай 3 уточняющих вопроса:

**Вопрос 1: Аудитория**
```
Для кого эта статья?
- Кто твоя целевая аудитория? (возраст, профессия, контекст)
- Где они обычно читают контент? (LinkedIn, Twitter, блог, Telegram)
```

**Вопрос 2: Проблема**
```
Какую проблему они пытаются решить?
- С чем они сейчас борются?
- Что их бесит/раздражает/тормозит?
```

**Вопрос 3: Инсайт**
```
Что интересного/неожиданного ты можешь рассказать?
- Есть ли counter-intuitive подход?
- Может быть против популярного мнения?
- Есть неожиданная статистика/результат?
```

**Expected Outcome:**
```json
{
  "audience": "B2B маркетеры в SaaS, 28-40 лет, читают LinkedIn",
  "problem": "Пишут много email но никто не читает",
  "insight": "Думают что главное - контент, но на самом деле главное - первая строка"
}
```

---

### Step 3: Idea Formulation

**Description:** Помоги сформулировать идею в одно предложение

**Actions:**

1. Собери всё что узнал и предложи формулировку:
```
Основываясь на том что ты рассказал, вот возможная формулировка идеи:

💡 "[Идея в 1 предложение]"

Например:
"Большинство маркетеров пишут email неправильно - они думают главное это информация,
но на самом деле главное это первая строка."

Это близко к тому что ты хочешь сказать?
```

2. Дай возможность доработать:
```
OPTIONS:
- "Да, именно это!" → переходим к валидации
- "Почти, но..." → уточни что изменить
- "Нет, не то" → начнём с другого угла
```

**Expected Outcome:** Чёткая формулировка идеи в 1 предложение, одобренная пользователем

---

### Step 4: Research & Gap Analysis

**Description:** Провести research для валидации новизны идеи

**Actions:**

Объясни зачем research:
```
Перед тем как оценивать идею, давай проверим что УЖЕ есть на эту тему.

Сейчас сделаю research чтобы:
- Найти что уже написано
- Определить gap (чего нет или освещено плохо)
- Обосновать новизну фактами

Используем Perplexity поиск (fallback к WebSearch если недоступен).
```

**Research Execution:**

1. **Формируй queries:**
```
На основе идеи "[refinedIdea]" создаю 2-3 search queries:

Query 1: "[main topic] best practices"
Query 2: "[specific angle] how to"
Query 3: "[counter-intuitive element] myths"

Запускаю поиск...
```

2. **Execute search:**
- Try Perplexity first (если доступен MCP server)
- Fallback to WebSearch if Perplexity unavailable
- Collect top 10-15 results

3. **Analyze findings:**
```
📊 RESEARCH RESULTS:

Найдено материалов: [count]

Частые темы:
- [Theme 1]: [X] статей
- [Theme 2]: [Y] статей
- [Theme 3]: [Z] статей

GAP IDENTIFIED:
✅ "[Что НЕ освещено или освещено плохо]"

Твоя идея попадает в этот gap? [Да/Частично/Нет]
```

**Expected Outcome:** Research выполнен, gap идентифицирован

---

### Step 5: Idea Scoring (0-5 Scale)

**Description:** Оцени идею по шкале 0-5 вместо binary yes/no

**Prerequisites:** Загрузи scoring system и criteria:
```
READ: ~/.claude/skills/writing-content/tools/scoring-system.md
READ: ~/.claude/skills/writing-content/references/scoring-criteria.md
```

**Actions:**

Объясни scoring approach:
```
Сейчас оценим идею по 2 критериям по шкале 0-5:

1. NOVELTY (Новизна) — Насколько свежая/неожиданная идея
2. RESONANCE (Резонанс) — Насколько зацепит целевую аудиторию

Для каждого критерия дам:
- Score (0-5)
- Reasoning (почему такая оценка с конкретикой)
- Evidence (факты из research)
- Improvement (как улучшить до 4-5/5)

Это НЕ "хорошо/плохо", это нюансированная обратная связь.
```

**Оцени Novelty:**

Сверяясь с `references/scoring-criteria.md` (Novelty section):

```
📊 NOVELTY EVALUATION

Score: [0-5]

Reasoning:
[2-3 предложения объясняющие почему такая оценка.
Сравни с примерами из scoring-criteria.md для этого уровня]

Evidence:
[Конкретные факты из research:
- "Найдено [X] статей на похожую тему"
- "Gap: никто не акцентирует [специфический угол]"
- "Counter-intuitive элемент: [что]"]

Improvement:
[Actionable рекомендации как довести до 4-5/5:
- "Добавь counter-intuitive формулировку: '[пример]'"
- "Усиль шокирующий элемент данными"
- Etc.]
```

**Оцени Resonance:**

Сверяясь с `references/scoring-criteria.md` (Resonance section):

```
📊 RESONANCE EVALUATION

Score: [0-5]

Reasoning:
[2-3 предложения о том насколько аудитория узнает себя.
Сравни с примерами из scoring-criteria для этого уровня]

Evidence:
[Конкретные факты:
- "Целевая аудитория: [кто]"
- "Их боль: [что]"
- "Эта идея решает: [как]"]

Improvement:
[Как усилить resonance до 4-5/5:
- "Добавь личную историю драмы в начале"
- "Покажи конкретные цифры боли"
- Etc.]
```

**Overall Recommendation:**

Используя decision logic из `tools/scoring-system.md`:

```
━━━━━━━━━━━━━━━━━
📊 ИТОГОВАЯ ОЦЕНКА

Novelty: [X]/5
Resonance: [Y]/5

РЕКОМЕНДАЦИЯ:
[STRONG PROCEED | PROCEED | REVISE | RETHINK]

Обоснование:
[Согласно thresholds из scoring-system.md]

Следующие шаги:
[Если >= 3 обоих → двигаемся дальше]
[Если < 3 один → конкретные улучшения]
[Если < 3 оба → нужна новая идея]
━━━━━━━━━━━━━━━━━
```

**Expected Outcome:** Идея оценена 0-5 с конкретными рекомендациями

---

### Step 6: Novelty Validation (Legacy - Keep for Context)

**Description:** Валидируй идею по 5 типам novelty (Julian Shapiro)

**Note:** Этот step сохранён для дополнительного контекста. Основная оценка теперь через Step 5 Scoring.

**Actions:**

Объясни что такое novelty:
```
Отлично! Теперь проверим идею на "novelty" - насколько она неожиданная/интересная.

По Julian Shapiro есть 5 типов novelty. Твоя идея должна попадать минимум в один:
```

Проверь каждый тип:

**1. Counter-Intuitive (Против интуиции)**
```
❓ Это противоречит тому что люди обычно думают?

Пример: "Работать меньше = больше результата" (против интуиции что больше работы = больше результата)

Твоя идея counter-intuitive? [Да/Нет/Частично]
```

**2. Counter-Narrative (Против нарратива)**
```
❓ Это против популярного нарратива в индустрии?

Пример: "SEO мёртв" когда все говорят про важность SEO

Твоя идея counter-narrative? [Да/Нет/Частично]
```

**3. Shock and Awe (Шок и трепет)**
```
❓ Есть ли шокирующий факт/цифра/результат?

Пример: "Я потратил $50K на рекламу и получил 0 клиентов"

Твоя идея shock and awe? [Да/Нет/Частично]
```

**4. Elegant Articulation (Элегантная формулировка)**
```
❓ Это красиво сформулированная мысль, которую все чувствуют но никто не говорил?

Пример: "Выгорание - это не про усталость, это про потерю смысла"

Твоя идея elegant articulation? [Да/Нет/Частично]
```

**5. Make Someone Feel Seen (Человек чувствует себя понятым)**
```
❓ Это описывает чувство/ситуацию которую человек испытывает но не может выразить?

Пример: "Это чувство когда написал идеальный текст, но никто не отреагировал"

Твоя идея makes people feel seen? [Да/Нет/Частично]
```

**Automated Analysis:**

После ответов пользователя сделай вывод:

```
📊 NOVELTY CHECK:

✅ Counter-intuitive: ДА
   "Против интуиции что контент важнее первой строки"

✅ Counter-narrative: ЧАСТИЧНО
   "Многие говорят про важность контента, ты идёшь против"

❌ Shock and awe: НЕТ
   "Нет шокирующего факта"

❌ Elegant articulation: НЕТ

✅ Make someone feel seen: ДА
   "Каждый маркетер испытывал это чувство когда email игнорируют"

━━━━━━━━━━━━━━━━━
РЕЗУЛЬТАТ: 2.5 / 5 типов ✅

Рекомендация: ХОРОШАЯ ИДЕЯ! Попадает в 2+ типа novelty.
```

**Expected Outcome:** Понимание какие типы novelty идея использует

---

### Step 7: Decision Point

**Description:** Определи нужно ли дорабатывать идею или можно двигаться дальше

**Actions:**

Используй Scoring результаты из Step 5:

**IF обе оценки >= 4:**
```
✅✅ STRONG PROCEED! Отличная идея!

Novelty: [X]/5 — [reasoning summary]
Resonance: [Y]/5 — [reasoning summary]

Обе оценки >= 4/5. Это сильная идея, можно сразу писать intro.

Что дальше?
OPTIONS:
- "Пишем intro" → переходим к workflow 2-write-intro.md
- "Сохранить и вернуться позже" → сохраняем в state
```

**IF обе оценки >= 3 (но не обе >= 4):**
```
✅ PROCEED! Хорошая идея, можно продолжать.

Novelty: [X]/5 — [reasoning]
Resonance: [Y]/5 — [reasoning]

Есть потенциал для улучшения:
[Показать improvement suggestions из scoring]

Хочешь улучшить перед написанием или продолжаем?
OPTIONS:
- "Улучшить" → применяем suggestions, переходим к Step 3
- "Продолжаем" → переходим к workflow 2
- "Сохранить и вернуться позже"
```

**IF одна оценка < 3:**
```
🤔 REVISE. Один параметр слабый, стоит доработать.

Novelty: [X]/5
Resonance: [Y]/5

Слабый параметр: [какой]
Почему слабый: [reasoning]

Как улучшить:
[Конкретные actionable suggestions]

OPTIONS:
- "Доработаем" → применяем improvements, возвращаемся к Step 3
- "Продолжаем как есть" (не рекомендуется)
```

**IF обе оценки < 3:**
```
❌ RETHINK. Обе оценки < 3, нужна новая идея или кардинальная переработка.

Novelty: [X]/5 — [reasoning]
Resonance: [Y]/5 — [reasoning]

Проблемы:
- Novelty: [что не так]
- Resonance: [что не так]

Такую статью писать не стоит - никто не будет читать.

OPTIONS:
- "Попробовать другую идею" → возвращаемся к Step 1
- "Кардинально изменить угол" → возвращаемся к Step 3 с фокусом на improvements
```

**IF legacy novelty score >= 2:**
```
✅ Отличная идея! Попадает в [X] типов novelty.

Что дальше?
OPTIONS:
- "Пишем intro" → переходим к workflow 2-write-intro.md
- "Доработать идею" → возвращаемся к Step 3
- "Сохранить и вернуться позже" → сохраняем в state
```

**IF novelty score 1-1.5:**
```
🤔 Идея неплохая, но может быть сильнее.

Как усилить novelty:
1. Найти counter-intuitive угол (что люди думают неправильно?)
2. Добавить шокирующий факт/цифру
3. Сформулировать чувство которое все испытывают

Хочешь доработать или продолжим с этой идеей?
OPTIONS:
- "Доработаем" → возвращаемся к Step 3
- "Продолжаем" → переходим к workflow 2
```

**IF novelty score < 1:**
```
❌ Идея слишком обычная. Так писать не стоит - никто не будет читать.

Попробуем с другого угла:
- Что в твоей теме ПРОТИВ интуиции?
- Какой популярный миф можно развенчать?
- Есть ли неожиданный результат из твоего опыта?

OPTIONS:
- "Попробовать другую идею" → возвращаемся к Step 1
- "Изменить угол этой идеи" → возвращаемся к Step 3
```

**Expected Outcome:** Решение двигаться дальше или доработать идею

---

### Step 8: Save to State + Markdown Export

**Description:** Сохрани идею в state и создай markdown файл

**Prerequisites:** Загрузи markdown exporter:
```
READ: ~/.claude/skills/writing-content/tools/markdown-exporter.md
```

**Actions:**

**Part 1: Update State File**

Создай или обнови state файл с новой структурой (v2):

```json
{
  "id": "generated-uuid",
  "created": "2025-11-26T16:00:00Z",
  "updated": "2025-11-26T16:00:00Z",
  "status": "idea",
  "idea": {
    "rawIdea": "Оригинальная идея которую озвучил пользователь",
    "refinedIdea": "Большинство маркетеров пишут email неправильно - они думают главное это информация, но на самом деле главное это первая строка",
    "audience": "B2B маркетеры в SaaS, 28-40 лет, читают LinkedIn",
    "problem": "Пишут много email но никто не читает",
    "insight": "Главное не контент а первая строка",
    "noveltyTypes": [
      "counter-intuitive",
      "make-seen"
    ],
    "noveltyScore": 2.5,
    "validated": true,
    "research": {
      "method": "perplexity",
      "queries": [
        "email marketing subject lines best practices",
        "why people don't read emails",
        "email body first line importance"
      ],
      "summary": "Найдено 15+ статей про subject lines optimization, но 0 статей акцентирующих важность первой строки body",
      "gap_identified": "Никто не фокусируется на том что первая строка body важнее subject line",
      "timestamp": "2025-11-26T16:05:00Z"
    },
    "scoring": {
      "novelty": {
        "score": 4,
        "reasoning": "Свежий counter-intuitive угол на известную тему. Все говорят про subject lines, никто не акцентирует body first line",
        "evidence": "Research показал: 15 статей про subject lines, 0 про body first line. Clear gap identified",
        "improvement": "Добавь shocking статистику: '95% маркетеров фокусируются на subject line, игнорируя что решает первая строка body'"
      },
      "resonance": {
        "score": 4,
        "reasoning": "Прямое попадание в боль B2B email-маркетеров. Все сталкиваются с 'открыли но не прочитали'",
        "evidence": "Типичная ситуация: open rate 30-40%, но meetings booked < 2%. Боль острая и актуальная",
        "improvement": "Начать с личной истории драмы: 'Потратил $5000 на A/B тестинг subject lines. Open rate вырос на 15%. Meetings booked? 0 изменений.'"
      },
      "overall_recommendation": "strong_proceed"
    }
  },
  "article": {
    "markdown_export": {
      "file_path": null,
      "created_at": null,
      "last_updated": null,
      "sections_written": [],
      "sync_status": "not_started"
    }
  }
}
```

**Part 2: Create/Update Markdown File**

Следуя `tools/markdown-exporter.md`:

1. **Check if markdown file exists** in current directory:
```bash
ls writing-session-*.md
```

2. **IF not exists → Create new:**
```markdown
# Writing Session: [Topic from refined idea]

**Создано:** 2025-11-26T16:00:00Z
**Статус:** idea
**Файл:** writing-session-2025-11-26-160000.md

---

## Этап 1: Генерация идеи

### Исходная идея

[rawIdea]

### Research Results

**Method:** perplexity
**Queries:**
- [query 1]
- [query 2]
- [query 3]

**Summary:**
[research.summary]

**Gap Identified:**
✅ [research.gap_identified]

### Оценка (0-5)

**Novelty: [X]/5**
- Reasoning: [scoring.novelty.reasoning]
- Evidence: [scoring.novelty.evidence]
- Improvement: [scoring.novelty.improvement]

**Resonance: [Y]/5**
- Reasoning: [scoring.resonance.reasoning]
- Evidence: [scoring.resonance.evidence]
- Improvement: [scoring.resonance.improvement]

**Рекомендация:** [overall_recommendation]

### Предложения улучшений

[Если есть improvement suggestions из scoring]

### Финальная идея

💡 **[refinedIdea]**

🎯 **Аудитория:** [audience]
❓ **Проблема:** [problem]
✨ **Инсайт:** [insight]
📊 **Novelty:** [score]/5
💖 **Resonance:** [score]/5

---

*Следующий этап: Написание Intro (workflow 2)*
```

3. **IF exists → Append секцию "Idea" к существующему файлу**

4. **Update state with markdown export info:**
```json
"markdown_export": {
  "file_path": "/absolute/path/to/writing-session-2025-11-26-160000.md",
  "created_at": "2025-11-26T16:10:00Z",
  "last_updated": "2025-11-26T16:10:00Z",
  "sections_written": ["idea"],
  "sync_status": "synced"
}
```

Сообщи пользователю:
```
✅ Идея сохранена!

📄 **Твоя идея:** "[refinedIdea]"
🎯 **Аудитория:** [audience]

📊 **Оценка:**
- Novelty: [X]/5 — [short reasoning]
- Resonance: [Y]/5 — [short reasoning]
- **Рекомендация:** [STRONG PROCEED | PROCEED | REVISE | RETHINK]

💾 **Экспорт:**
Markdown файл: `[filename]`

Теперь можем написать зацепляющий intro! (workflow 2)
```

**Expected Outcome:**
- State файл обновлён с research + scoring + markdown export
- Markdown файл создан в pwd с секцией "Idea"
- Пользователь видит оценку 0-5 и рекомендации

---

## Outputs

**What this workflow produces:**
- **Validated idea** — Идея проверенная по Julian Shapiro framework
- **Audience context** — Понимание для кого пишем
- **Problem statement** — Какую проблему решаем
- **Novelty types** — Какие типы novelty использует идея
- **State file** — Всё сохранено для следующих workflows

**Where outputs are stored:**
- `~/.claude/skills/writing-content/state/current-article.json`

---

## Related Workflows

- **2-write-intro.md** — Следующий шаг: написание зацепляющего первого абзаца
- **3-test-with-personas.md** — Можно вернуться сюда если тест покажет что идея слабая

---

## Examples

### Example 1: От размытой идеи к чёткой формулировке

**Input:**
User: "Хочу написать про то что AI не заменит маркетологов"

**Process:**
```
Claude: Для кого эта статья?
User: Для маркетологов которые боятся что их заменят

Claude: Какую проблему они решают?
User: Они переживают что останутся без работы

Claude: Что неожиданного ты можешь сказать?
User: На самом деле AI делает маркетологов ВАЖНЕЕ, не менее важными

Claude: Отлично! Вот формулировка:
💡 "AI не заменит маркетологов - наоборот, сделает их работу ещё более важной,
   потому что теперь главное не исполнение, а стратегия"

Это то что ты хочешь сказать?
User: Да!

Claude: Проверяем novelty...
✅ Counter-intuitive: ДА (против страха замены)
✅ Make someone feel seen: ДА (маркетологи боятся этого)
━━━━━━━━━━━━━━━━━
РЕЗУЛЬТАТ: 2 / 5 типов ✅
Отличная идея! Пишем intro?
```

**Output:**
```json
{
  "idea": {
    "refinedIdea": "AI не заменит маркетологов - наоборот, сделает их работу ещё более важной, потому что теперь главное не исполнение, а стратегия",
    "noveltyTypes": ["counter-intuitive", "make-seen"],
    "noveltyScore": 2,
    "validated": true
  }
}
```

---

### Example 2: Слабая идея требует доработки

**Input:**
User: "Хочу написать как правильно делать контент-маркетинг"

**Process:**
```
Claude: Для кого?
User: Для всех маркетологов

Claude: Какую проблему они решают?
User: Не знают как делать контент

Claude: Что неожиданного скажешь?
User: Расскажу про процесс и инструменты

Claude: Хм, давай проверим novelty этой идеи...

❌ Counter-intuitive: НЕТ (обычный подход)
❌ Counter-narrative: НЕТ (все так пишут)
❌ Shock and awe: НЕТ (нет шока)
❌ Elegant articulation: НЕТ
❌ Make someone feel seen: НЕТ

━━━━━━━━━━━━━━━━━
РЕЗУЛЬТАТ: 0 / 5 типов ❌

Такую статью не стоит писать - слишком обычная.

Давай найдём novelty угол:
- Может есть НЕПРАВИЛЬНЫЙ способ который все используют?
- Может есть миф про контент-маркетинг который ты можешь развенчать?
- Может у тебя есть неожиданный результат из практики?

User: Да, на самом деле большинство делает контент-маркетинг наоборот - сначала делают контент, потом думают для кого. А надо наоборот!

Claude: ВОТ ЭТО ДРУГОЕ ДЕЛО! ✅
Это counter-intuitive. Давай сформулируем...

💡 "Большинство делает контент-маркетинг наоборот - они создают контент и потом ищут аудиторию. Правильный способ: сначала аудитория, потом контент."

✅ Counter-intuitive: ДА
✅ Make someone feel seen: ДА (многие так делают)
━━━━━━━━━━━━━━━━━
РЕЗУЛЬТАТ: 2 / 5 типов ✅

Теперь НАМНОГО ЛУЧШЕ! Пишем intro?
```

---

## Tips for Interviewers

### Good Questions to Ask

**For finding counter-intuitive angle:**
- "Что люди думают неправильно про [тема]?"
- "Какой популярный совет на самом деле вредит?"
- "Что ты делаешь НАОБОРОТ от всех?"

**For finding shock and awe:**
- "Есть ли неожиданная статистика?"
- "Был ли у тебя surprising результат?"
- "Что удивило тебя в процессе?"

**For finding make-seen:**
- "Что твоя аудитория чувствует но не может выразить?"
- "Какую боль все испытывают но не говорят вслух?"
- "Что бесит твою аудиторию больше всего?"

### Red Flags (слабые идеи)

❌ "Как делать [X]" — обычная how-to статья
❌ "10 способов..." — список без novelty
❌ "Всё про [тема]" — слишком широко
❌ "Моя история..." — без инсайта для читателя
❌ "Советы по [X]" — generic advice

✅ "Большинство делает [X] неправильно, вот почему" — counter-intuitive
✅ "Почему [популярный совет] не работает" — counter-narrative
✅ "Я потратил [X] и вот что я узнал" — shock + learning

---

## Quality Checklist

Before moving to next workflow, verify:

- [ ] Идея сформулирована в 1 ясное предложение
- [ ] Понятна целевая аудитория (кто, где, контекст)
- [ ] Ясна проблема которую решаем
- [ ] Идея попадает минимум в 2 типа novelty
- [ ] Пользователь одобрил формулировку
- [ ] State файл создан и сохранён

---

**Last Updated:** 2025-11-25
