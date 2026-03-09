# Workflow 3: Test with AI Personas

**Purpose:** Протестировать intro через симуляцию 3 типов аудитории (AI-персоны с stream of consciousness)

**When to Use:**
- Написан intro (из workflow 2)
- Нужна быстрая валидация идеи
- Хочешь понять как зайдёт контент ДО публикации
- Нужен фидбэк от разных точек зрения

**Why This Instead of Real Testing:**
- ⚡ **Скорость:** 2 минуты vs 24+ часов реального теста
- 🔄 **Итерации:** Можно тестить 5-10 вариантов за сессию
- 💡 **Детальный фидбэк:** Почему зацепило/не зацепило
- 🎯 **Множественные точки зрения:** Core/Skeptical/Novice архетипы

**Prerequisites:**
- State файл с intro (из workflow 2)
- Понимание целевой аудитории
- Готовность к stream of consciousness фидбэку

---

## Workflow Steps

### Step 1: Load Intro from State

**Description:** Загрузи intro который будем тестировать

**Actions:**

1. Прочитай state файл:
```bash
~/.claude/skills/writing-content/state/current-article.json
```

2. Извлеки intro и контекст:
```json
{
  "idea": {
    "refinedIdea": "...",
    "audience": "...",
    "problem": "..."
  },
  "intro": {
    "fullIntro": "..."
  }
}
```

3. Покажи пользователю что тестируем:
```
Отлично! Протестируем intro на AI-персонах:

━━━━━━━━━━━━━━━━━
[fullIntro]
━━━━━━━━━━━━━━━━━

Сейчас создам 3 типа персон из твоей целевой аудитории
и симулирую как они читают этот intro.

Поехали! 🚀
```

**Expected Outcome:** Intro загружен, пользователь понимает что будет происходить

---

### Step 2: Audience Discovery

**Description:** Уточни детали целевой аудитории для создания реалистичных персон

**Actions:**

Задай уточняющие вопросы (если не хватает данных из state):

**Вопрос 1: Базовая демография**
```
Уточним твою целевую аудиторию:
- Возраст? (диапазон)
- Профессия/роль?
- Уровень экспертизы в теме? (новичок/intermediate/эксперт)
```

**Вопрос 2: Контекст чтения**
```
Где они обычно читают такой контент?
- Платформа? (LinkedIn, Twitter, Telegram, блог)
- Устройство? (mobile, desktop)
- Время/ситуация? (в дороге, за обедом, утром на работе)
```

**Вопрос 3: Психография**
```
Что их мотивирует?
- Какую проблему пытаются решить?
- Чего боятся больше всего в этом контексте?
- Что хотят получить от контента?
```

**Expected Outcome:**
```json
{
  "audience": {
    "age": "28-40",
    "profession": "B2B маркетер в SaaS",
    "platform": "LinkedIn",
    "device": "mobile",
    "context": "Scrolling в обед, ищут идеи",
    "pain": "Тратят время на контент который игнорируют",
    "desire": "Хотят чтобы контент читали и реагировали",
    "fear": "Боятся что их считают неэффективными",
    "expertise": "intermediate"
  }
}
```

---

### Step 3: Generate 3 Persona Archetypes

**Description:** Автоматически создай 3 архетипа персон на основе аудитории

**Actions:**

Объясни какие персоны создаём:
```
На основе твоей аудитории создаю 3 архетипа персон:

👤 Core Persona — твоя целевая аудитория (intermediate)
👤 Skeptical Persona — скептик/эксперт (expert)
👤 Novice Persona — новичок в теме (beginner)
```

**Автоматически генерируй персоны:**

**PERSONA 1: Core (Целевая аудитория)**
```json
{
  "archetype": "core",
  "name": "[Генерируй русское имя]",
  "age": "[средний возраст из диапазона]",
  "profession": "[из audience data]",
  "context": {
    "where": "[платформа] + конкретная ситуация",
    "device": "[mobile/desktop]",
    "mood": "Ищет решение проблемы",
    "time_available": "2-3 минуты",
    "attention_level": "medium"
  },
  "psychographics": {
    "pain": "[конкретная боль из audience data]",
    "desire": "[конкретное желание]",
    "fear": "[конкретный страх]",
    "expertise": "intermediate"
  },
  "reading_style": "Быстро скролит, останавливается только если зацепило",
  "skepticism_level": "medium",
  "openness_to_new_ideas": "high"
}
```

**PERSONA 2: Skeptical (Скептик/Эксперт)**
```json
{
  "archetype": "skeptical",
  "name": "[Генерируй русское имя]",
  "age": "[возраст +5-10 лет]",
  "profession": "[более senior позиция]",
  "context": {
    "where": "[платформа] + multitasking",
    "device": "desktop",
    "mood": "Уже видел много подобного контента",
    "time_available": "1-2 минуты",
    "attention_level": "low"
  },
  "psychographics": {
    "pain": "Уже пробовал разные решения, ничего не сработало",
    "desire": "Хочет proof и конкретные данные",
    "fear": "Боится потратить время на очередной generic совет",
    "expertise": "expert"
  },
  "reading_style": "Сканирует текст, ищет proof и конкретику",
  "skepticism_level": "very high",
  "openness_to_new_ideas": "low"
}
```

**PERSONA 3: Novice (Новичок)**
```json
{
  "archetype": "novice",
  "name": "[Генерируй русское имя]",
  "age": "[возраст -5-10 лет]",
  "profession": "[более junior позиция]",
  "context": {
    "where": "[платформа] + учится новому",
    "device": "mobile",
    "mood": "Excited про новую тему",
    "time_available": "5-10 минут",
    "attention_level": "high"
  },
  "psychographics": {
    "pain": "Не знает с чего начать",
    "desire": "Хочет простое объяснение без жаргона",
    "fear": "Боится что не поймёт",
    "expertise": "beginner"
  },
  "reading_style": "Читает медленно и внимательно",
  "skepticism_level": "low",
  "openness_to_new_ideas": "very high"
}
```

Покажи созданные персоны:
```
━━━━━━━━━━━━━━━━━
Создал 3 персоны:

👤 [Имя] (Core) — [возраст], [профессия]
   Context: [где читает, на чём, в какой ситуации]
   Pain: [конкретная боль]

👤 [Имя] (Skeptical) — [возраст], [профессия]
   Context: [контекст]
   Pain: [боль]

👤 [Имя] (Novice) — [возраст], [профессия]
   Context: [контекст]
   Pain: [боль]
━━━━━━━━━━━━━━━━━

Сейчас каждая персона прочитает intro и подумает вслух.
```

**Expected Outcome:** 3 реалистичные персоны созданы с полным контекстом

---

### Step 4: Stream of Consciousness Reading

**Description:** КРИТИЧНО - персоны думают вслух пока читают intro (НЕ оценивают метрики)

**Actions:**

Для каждой персоны выполни:

**ВАЖНО:** Персона НЕ говорит "hook strength 8/10" - она ЕСТЕСТВЕННО думает вслух пока читает.

**Format для каждой персоны:**

```
━━━━━━━━━━━━━━━━━
👤 ПЕРСОНА: [Имя] ([Archetype])
📍 КОНТЕКСТ: [где, устройство, ситуация]

[Показываем intro построчно]

💭 МЫСЛИ ВСЛУХ:
```

**Stream of Consciousness Rules:**
1. **Читай построчно** — реагируй на каждую фразу
2. **Думай как человек** — "хм", "ок", "блин", "wait", "о"
3. **Цитируй фразы** — "Ок, 'Большинство маркетеров пишут email неправильно'..."
4. **Показывай эмоции** — "Интересно!", "Да точно!", "Не верю", "Хм, спорно"
5. **Делай связи** — "Я так делаю", "Это про меня", "Никогда так не думал"
6. **Будь естественным** — как думаешь в голове, не formal evaluation

**Example Stream of Consciousness:**

```
💭 МЫСЛИ ВСЛУХ:
"Ок, scrolling LinkedIn в обеденный перерыв...
Вижу пост '[первая строка hook]'...

Хм, bold claim. Я что, неправильно пишу? [personal connection]
Интересно... [hook зацепил]

Читаю дальше: '[вторая строка]'
Да, блин, это точно про меня. Я именно так делаю. [resonance]

'[третья строка]'
О, это counter-intuitive. Никогда так не думал... [novelty moment]
Wait, это имеет смысл. [cognitive shift]

'[четвёртая строка - intrigue]'
Ок, теперь мне НУЖНО прочитать это. [hooked]
Хочу узнать как это работает. [desire to continue]

[Дошёл до конца intro]

Хм... Зацепило. Это релевантно для меня,
показали что я думаю неправильно,
и обещали решение.

Буду читать дальше? Да, определённо."

━━━━━━━━━━━━━━━━━
✅ РЕШЕНИЕ: Буду читать дальше
📊 Эмоция: Intrigued
🎯 Причина: Релевантно + counter-intuitive + обещание решения
```

**Повтори для всех 3 персон:**
- Core (intermediate expertise)
- Skeptical (expert, high bar)
- Novice (beginner, needs simplicity)

**Expected Outcome:** 3 естественных монолога о чтении intro

---

### Step 5: Extract Metrics from Natural Language

**Description:** Автоматически извлеки метрики из естественных монологов персон

**Actions:**

Для каждой персоны проанализируй монолог и извлеки:

**Metrics to Extract:**

1. **Hook Strength** (0-100)
   - Зацепила ли первая строка?
   - Signals: "интересно", "о", "хм bold claim", "это про меня"
   - 80-100: Strong hook ("зацепило с первой строки")
   - 50-79: Medium ("интересно но не wow")
   - 0-49: Weak ("пролистал бы")

2. **Curiosity** (0-100)
   - Хочется ли читать дальше?
   - Signals: "хочу узнать", "нужно прочитать", "интересно как"
   - 80-100: High ("НУЖНО прочитать")
   - 50-79: Medium ("может прочитаю")
   - 0-49: Low ("не интересно")

3. **Relevance** (0-100)
   - Релевантно ли для персоны?
   - Signals: "это про меня", "я так делаю", "моя проблема"
   - 80-100: Very relevant ("прямо про меня")
   - 50-79: Somewhat relevant ("похоже на мою ситуацию")
   - 0-49: Not relevant ("не для меня")

4. **Skepticism** (0-100)
   - Есть ли сомнения?
   - Signals: "не верю", "нужен proof", "спорно", "слышал это раньше"
   - 80-100: Very skeptical ("не куплюсь")
   - 50-79: Somewhat skeptical ("нужно доказать")
   - 0-49: Low skepticism ("верю")

5. **Emotional State**
   - boring | intrigued | excited | skeptical | confused
   - Из общего тона монолога

6. **Will Read Further**
   - YES | NO | MAYBE
   - Explicit statement или inferred from enthusiasm

**Automated Scoring:**

```json
{
  "persona": "Алексей (Core)",
  "metrics": {
    "hook_strength": 85,
    "curiosity": 90,
    "relevance": 95,
    "skepticism": 20,
    "emotional_state": "excited",
    "will_read": "yes"
  },
  "key_quotes": [
    "Это точно про меня",
    "Никогда так не думал",
    "НУЖНО прочитать это"
  ],
  "aggregate_score": 88
}
```

**Calculate Aggregate Score:**
```
aggregate_score = (
  hook_strength * 0.3 +
  curiosity * 0.3 +
  relevance * 0.25 +
  (100 - skepticism) * 0.15
)
```

**Expected Outcome:** Метрики извлечены из естественного фидбэка каждой персоны

---

### Step 6: Aggregated Results & Recommendations

**Description:** Покажи результаты всех 3 персон и дай рекомендацию

**Actions:**

Покажи результаты в читаемом формате:

```
━━━━━━━━━━━━━━━━━
📊 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ INTRO

👤 [Имя Core] (Core Audience) — [score]%
━━━━━━━━━━━━━━━━━
💭 Ключевые мысли:
   "[quote 1]"
   "[quote 2]"

✅ Зацепило: [почему]
📊 Will read: [YES/NO/MAYBE]
🎯 Сильные стороны: [что сработало]
⚠️ Слабые стороны: [что не сработало]

━━━━━━━━━━━━━━━━━
👤 [Имя Skeptical] (Skeptic/Expert) — [score]%
━━━━━━━━━━━━━━━━━
💭 Ключевые мысли:
   "[quote]"

🤔 Зацепило: [почему или почему нет]
📊 Will read: [YES/NO/MAYBE]
🎯 Что сработало: [...]
⚠️ Что насторожило: [lack of proof, generic advice, etc.]

━━━━━━━━━━━━━━━━━
👤 [Имя Novice] (Beginner) — [score]%
━━━━━━━━━━━━━━━━━
💭 Ключевые мысли:
   "[quote]"

✅ Зацепило: [почему]
📊 Will read: [YES/NO/MAYBE]
🎯 Что понравилось: [clarity, simplicity]
⚠️ Что непонятно: [if anything]

━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 ОБЩАЯ ОЦЕНКА: [average]% ([Excellent/Good/Needs Work])

✅ Будут читать: [X]/3 персон
🎯 Сильнейшая сторона: [что зацепило больше всего]
⚠️ Главная слабость: [если есть]

━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Recommendation Logic:**

```
IF average_score >= 75:
   "✅ ОТЛИЧНЫЙ INTRO! Можно переходить к написанию полной статьи."

ELIF average_score >= 60:
   "🤔 ХОРОШИЙ INTRO, но можно усилить. Рекомендую:
   - [Конкретные советы на основе слабых мест]"

ELIF average_score >= 40:
   "⚠️ INTRO СЛАБОВАТ. Нужна доработка:
   - [Конкретные проблемы]
   - [Как исправить]"

ELSE:
   "❌ INTRO НЕ ЗАЦЕПИЛ. Рекомендую переписать:
   - [Что не работает]
   - [С чего начать переписывание]"
```

**Expected Outcome:** Ясная картина как intro воспринимается разными архетипами аудитории

---

### Step 7: Decision Branch

**Description:** Дай пользователю выбор что делать дальше на основе результатов

**Actions:**

**IF average_score >= 75:**
```
✅ Отличный результат! Intro зацепил аудиторию.

Что дальше?
OPTIONS:
- "Пишем полную статью" → workflow 4-write-full-article.md
- "Ещё немного улучшить intro" → остаёмся в этом workflow, возвращаемся к workflow 2
- "Протестировать другой вариант hook" → workflow 2-write-intro.md
```

**IF average_score 60-74:**
```
🤔 Хороший intro, но можно сделать сильнее.

На основе фидбэка персон, рекомендую:
[Конкретные советы - например:]
- Core персона зацепился но Skeptic нужен proof → добавь конкретный пример/цифру
- Novice запутался в терминологии → упрости язык
- Hook не достаточно provocative → сделать более bold

OPTIONS:
- "Улучшить по рекомендациям" → workflow 2 с конкретными правками
- "Продолжить как есть" → workflow 4
- "Полностью переписать intro" → workflow 2 с нуля
```

**IF average_score 40-59:**
```
⚠️ Intro нуждается в серьёзной доработке.

Проблемы:
[Конкретные проблемы из фидбэка персон]

OPTIONS:
- "Переписать intro" → workflow 2
- "Изменить угол идеи" → workflow 1 (пересмотреть novelty)
- "Попробовать другой hook type" → workflow 2 с другим типом hook
```

**IF average_score < 40:**
```
❌ Intro не зацепил аудиторию. Нужен новый подход.

Что не сработало:
[Детальный разбор почему не зацепило]

Рекомендую:
1. Вернуться к идее и найти более strong novelty угол (workflow 1)
2. Или полностью переписать intro с другим hook (workflow 2)

OPTIONS:
- "Пересмотреть идею" → workflow 1
- "Переписать intro с нуля" → workflow 2
```

**Expected Outcome:** Пользователь принял решение двигаться дальше или улучшать intro

---

### Step 8: Save Test Results to State

**Description:** Сохрани результаты тестирования в state файл

**Actions:**

Обнови state файл:

```json
{
  "id": "existing-uuid",
  "updated": "2025-11-25T17:00:00Z",
  "status": "tested",
  "intro": {
    // existing intro data
  },
  "persona_test_results": {
    "timestamp": "2025-11-25T17:00:00Z",
    "personas": [
      {
        "archetype": "core",
        "name": "Алексей",
        "profession": "B2B маркетер",
        "age": 32,
        "context": {...},
        "monologue": "[полный stream of consciousness]",
        "metrics": {
          "hook_strength": 85,
          "curiosity": 90,
          "relevance": 95,
          "skepticism": 20,
          "emotional_state": "excited",
          "will_read": "yes"
        },
        "aggregate_score": 88,
        "key_quotes": [...]
      },
      {
        "archetype": "skeptical",
        "name": "Мария",
        // ... similar structure
      },
      {
        "archetype": "novice",
        "name": "Дмитрий",
        // ... similar structure
      }
    ],
    "aggregate_score": 78,
    "will_read_count": "3/3",
    "strongest_aspect": "Релевантность + counter-intuitive угол",
    "weakest_aspect": "Skeptic needs more proof",
    "recommendation": "proceed_to_article"
  }
}
```

Сообщи результат:
```
✅ Результаты тестирования сохранены!

📊 Общая оценка: [score]%
✅ Персон зацепило: [X]/3

Теперь можем писать полную статью! (workflow 4)
```

**Expected Outcome:** Результаты тестирования сохранены для будущей reference

---

## Outputs

**What this workflow produces:**
- **3 Persona profiles** — Детальные профили Core/Skeptical/Novice
- **3 Stream of consciousness readings** — Естественный фидбэк от каждой персоны
- **Extracted metrics** — Hook strength, curiosity, relevance, skepticism scores
- **Aggregate score** — Общая оценка intro (0-100%)
- **Actionable recommendations** — Конкретные советы по улучшению
- **Decision guidance** — Продолжать или дорабатывать

**Where outputs are stored:**
- `~/.claude/skills/writing-content/state/current-article.json` (persona_test_results)

---

## Related Workflows

- **2-write-intro.md** — Предыдущий шаг (нужен intro для тестирования)
- **1-generate-idea.md** — Можем вернуться если тест показал слабый novelty
- **4-write-full-article.md** — Следующий шаг если тест успешный

---

## Examples

### Example 1: Excellent Score (88%) - All Personas Hooked

**Input Intro:**
```
Почему люди не читают твои email?

Ты тратишь часы на идеальный контент, но получаешь 5% open rate.
Проблема не в контенте. Проблема в первой строке.

Вот как я пишу email которые всегда читают.
И это не про subject line.
```

**Test Results:**

**Core Persona (Алексей, 32, B2B маркетер):**
```
💭 МЫСЛИ ВСЛУХ:
"Scrolling LinkedIn в обед... Вижу 'Почему люди не читают твои email?'

Блин, это точно про меня. Я именно это чувствую каждый раз. [personal connection]

'Ты тратишь часы на идеальный контент, но получаешь 5% open rate.'
ДА! Это ИМЕННО моя ситуация! [strong resonance]

'Проблема не в контенте. Проблема в первой строке.'
Wait, что? Я всегда думал что главное - контент. [counter-intuitive moment]
Интересно... Хочу узнать почему первая строка.

'Вот как я пишу email которые всегда читают.'
Ок, теперь мне НУЖНО прочитать это. [hooked]

'И это не про subject line.'
О, это другое. Не слышал про это раньше. [novelty confirmed]

Буду читать? Да, 100%. Это релевантно, показали что я думаю неправильно,
и обещали решение."

✅ Will read: YES
📊 Score: 88%
```

**Skeptical Persona (Мария, 38, CMO):**
```
💭 МЫСЛИ ВСЛУХ:
"'Почему люди не читают твои email?'
Слышала это миллион раз. Очередной email guru. [skeptical start]

'Ты тратишь часы... 5% open rate.'
Хм, это правда. Но это не новость. [acknowledges problem]

'Проблема не в контенте. Проблема в первой строке.'
Interesting take. Не совсем то что все говорят. [novelty noted]
Но нужен proof. Почему первая строка?

'Вот как я пишу email которые всегда читают.'
Bold claim. Хочу увидеть доказательства. [needs proof but intrigued]

'И это не про subject line.'
Ок, это уже более specific. Может быть что-то новое. [cautiously interested]

Буду читать? Возможно. Если будет конкретика и proof, а не generic advice."

🤔 Will read: MAYBE
📊 Score: 68%
```

**Novice Persona (Дмитрий, 24, Junior маркетолог):**
```
💭 МЫСЛИ ВСЛУХ:
"'Почему люди не читают твои email?'
О, это про то что я пытаюсь понять! [relevant question]

'Ты тратишь часы... 5% open rate.'
Блин, у меня даже хуже! [relates to problem]

'Проблема не в контенте. Проблема в первой строке.'
Оу, я не знал. Я думал надо писать хороший контент. [learning moment]

'Вот как я пишу email которые всегда читают.'
Хочу научиться! [eager to learn]

'И это не про subject line.'
Хм, интересно. Что же это тогда? [curious]

Буду читать? Да! Это как раз то что мне нужно."

✅ Will read: YES
📊 Score: 85%
```

**Aggregate Results:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ INTRO

👤 Алексей (Core) — 88%
✅ Зацепило: Counter-intuitive + сильная релевантность
Will read: ДА

👤 Мария (Skeptical) — 68%
🤔 Зацепило: Интересный угол, но нужен proof
Will read: ВОЗМОЖНО

👤 Дмитрий (Novice) — 85%
✅ Зацепило: Простое объяснение + learning opportunity
Will read: ДА

━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 ОБЩАЯ ОЦЕНКА: 80% (EXCELLENT)

✅ Будут читать: 2.5/3 персон
🎯 Сильнейшая сторона: Counter-intuitive угол + релевантность
⚠️ Главная слабость: Skeptic нужен proof или пример

💡 РЕКОМЕНДАЦИЯ: Можно переходить к полной статье!

Улучшение (optional): Добавь один конкретный пример или цифру
чтобы зацепить skeptics.
━━━━━━━━━━━━━━━━━━━━━━━━━━

Что дальше?
OPTIONS:
- "Пишем полную статью" → workflow 4
- "Добавить proof для skeptics" → workflow 2
```

---

### Example 2: Low Score (42%) - Needs Revision

**Input Intro:**
```
Email маркетинг это важно.

Многие компании используют email для коммуникации с клиентами.
Это эффективный канал.

Вот несколько советов как делать email маркетинг правильно.
```

**Test Results (abbreviated):**

**Core Persona:**
```
"'Email маркетинг это важно.'
Ок, это obvious. Все знают. [not hooked]

'Многие компании используют email...'
Да, и? Это не новость. [boring]

'Это эффективный канал.'
Слышал миллион раз. [no novelty]

'Вот несколько советов...'
Generic советы наверное. Скучно. [not interested]

Буду читать? Нет. Слишком обычное."

❌ Will read: NO
📊 Score: 25%
```

**Skeptical Persona:**
```
"Obvious statement, no novelty, generic advice.
Пропустил бы мгновенно."

❌ Will read: NO
📊 Score: 15%
```

**Novice Persona:**
```
"Может быть полезно, но не зацепило.
Выглядит как обычная статья."

🤔 Will read: MAYBE
📊 Score: 45%
```

**Aggregate:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 ОБЩАЯ ОЦЕНКА: 28% (POOR)

❌ Будут читать: 0.5/3 персон

Проблемы:
- Нет hook (obvious statement)
- Нет novelty (все знают что email важен)
- Generic promise (советы)
- Нет personal connection

━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ INTRO НЕ ЗАЦЕПИЛ. Рекомендую переписать:

1. Найди counter-intuitive угол про email (что люди делают неправильно?)
2. Создай bold/provocative hook
3. Покажи специфичную проблему
4. Сделай обещание более конкретным

OPTIONS:
- "Пересмотреть идею" → workflow 1
- "Переписать intro с нуля" → workflow 2
```

---

## Tips for Realistic Personas

### Making Personas Sound Human

**✅ Good Stream of Consciousness:**
- "Хм, интересно..."
- "Блин, это точно про меня"
- "Wait, что? Никогда так не думал"
- "О, это другое"
- "Да, я именно так делаю"

**❌ Avoid AI-style Evaluation:**
- "Hook strength: 8/10"
- "This intro effectively..."
- "The value proposition is..."
- "Overall assessment: positive"

### Persona Expertise Levels

**Beginner (Novice):**
- Needs simple language
- Excited to learn
- Low skepticism
- Asks "what does this mean?"

**Intermediate (Core):**
- Knows basics, wants advanced insights
- Medium skepticism
- Relates to problems
- Asks "how do I improve?"

**Expert (Skeptical):**
- Seen it all before
- High skepticism
- Needs proof
- Asks "show me data"

---

## Quality Checklist

Before proceeding to next workflow, verify:

- [ ] Intro loaded from state
- [ ] Audience context gathered
- [ ] 3 personas created (Core/Skeptical/Novice)
- [ ] Each persona has full profile (context, psychographics, reading style)
- [ ] Stream of consciousness for each persona (natural language)
- [ ] Metrics extracted from monologues
- [ ] Aggregate score calculated
- [ ] Recommendation provided
- [ ] Decision made (proceed/revise/rethink)
- [ ] Results saved to state

---

**Last Updated:** 2025-11-25
