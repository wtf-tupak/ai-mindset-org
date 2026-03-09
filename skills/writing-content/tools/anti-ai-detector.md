# Anti-AI Detector - Детекция AI-подобных паттернов

## Purpose

Обнаружить AI-like паттерны в тексте и предложить конкретные фиксы для более человеческого звучания.

**Почему это важно:**
- AI-generated текст звучит безлично и скучно
- Читатели чувствуют когда текст написан AI
- Human voice = доверие и связь с аудиторией
- Conversion зависит от authenticity

---

## Usage

### Load patterns reference:

```markdown
READ: ~/.claude/skills/writing-content/references/ai-slop-patterns.md
```

Этот файл содержит полный список AI паттернов (lexical, structural, tonal) с примерами.

---

### Detection Algorithm:

#### Step 1: Lexical Scan

**Ищем слова-маркеры:**

**Red Flags (99% AI):**
- "delve into"
- "meticulous" / "meticulously"
- "navigating"
- "complexities"
- "realm"
- "landscape of"
- "testament to"
- "pivotal"
- "robust"
- "intricate"

**Каждый = -1.0 к score**

**Yellow Flags (80%+ AI):**
- "utilize" (вместо "use")
- "leverage" (вместо "use")
- "it's important to note that"
- "it's worth noting"
- "in today's digital landscape"
- "revolutionize"
- "game-changer"
- "seamless"
- "optimize"
- "facilitate"

**Каждый = -0.5 к score**

---

#### Step 2: Structural Scan

**Ищем структурные паттерны:**

**Perfect Structure:**
```
Intro → Body 1 → Body 2 → Body 3 → Conclusion
```
(слишком идеальная структура = AI)

**Penalty:** -0.5

**Transition Overload:**
- "Furthermore," в каждом параграфе
- "Moreover,"
- "Additionally,"
- Если 5+ таких transitions = AI

**Penalty:** -0.5

**List Mania:**
- Слишком много numbered lists
- Всегда одинаковой длины (5 items, 7 items)

**Penalty:** -0.3

---

#### Step 3: Tonal Scan

**Ищем тональные маркеры:**

**Безликость:**
- Нет "я" / "мы"
- Нет личного опыта
- Абстрактные примеры ("a company might...")

**Penalty:** -0.5

**Чрезмерная формальность:**
- Нет сокращений вообще
- "It is" вместо "It's"
- "Do not" вместо "Don't"

**Penalty:** -0.5

**Fake Enthusiasm:**
- Много восклицаний!!! но безличный тон

**Penalty:** -0.3

---

#### Step 4: Sentence Pattern Scan

**Ищем типичные AI sentence patterns:**

**Contrast Framing Overload:**
- "It's not about X, it's about Y" (5+ раз)

**Penalty:** -0.3

**-ing Verb Overuse:**
- "Ensuring quality..."
- "Providing value..."
- "Leveraging technology..."
(начало предложений с -ing verbs)

**Penalty:** -0.3 за каждые 3 случая

**Vague Hedging:**
- "It's worth considering..."
- "One might argue..."
- "Some experts believe..."

**Penalty:** -0.3 за каждые 2 случая

---

#### Step 5: Calculate Final Score

**Старт:** 5.0 (perfect human score)

**Вычитаем все penalties**

**Финал:** 0-5 score

**Интерпретация:**
- **5.0** = 100% human, perfect
- **4.0-4.9** = Very natural (minor AI hints)
- **3.0-3.9** = Acceptable (some AI patterns)
- **2.0-2.9** = Noticeable AI (many patterns)
- **1.0-1.9** = Obviously AI (typical AI style)
- **0-0.9** = 100% AI slop

---

## Output Format:

```json
{
  "ai_slop_score": 3.0,
  "detected_patterns": [
    {
      "type": "lexical",
      "pattern": "utilize",
      "count": 3,
      "locations": ["paragraph 1 line 2", "paragraph 3 line 1", "paragraph 5 line 3"],
      "severity": "yellow_flag",
      "penalty": -1.5
    },
    {
      "type": "lexical",
      "pattern": "delve into",
      "count": 1,
      "locations": ["paragraph 2 line 4"],
      "severity": "red_flag",
      "penalty": -1.0
    },
    {
      "type": "structural",
      "pattern": "transition_overload",
      "count": 5,
      "evidence": "Furthermore x3, Moreover x2 в каждом параграфе",
      "severity": "moderate",
      "penalty": -0.5
    },
    {
      "type": "tonal",
      "pattern": "no_contractions",
      "count": 8,
      "evidence": "It is, do not, cannot (no it's, don't, can't)",
      "severity": "moderate",
      "penalty": -0.5
    }
  ],
  "suggestions": [
    {
      "issue": "utilize (3 instances)",
      "fix": "Замени на 'use' во всех случаях",
      "locations": ["p1 l2", "p3 l1", "p5 l3"],
      "impact": "+1.5 к score"
    },
    {
      "issue": "delve into (1 instance)",
      "fix": "Замени на простое 'explore' или убери вообще",
      "locations": ["p2 l4"],
      "impact": "+1.0 к score"
    },
    {
      "issue": "No contractions",
      "fix": "Добавь сокращения: it is → it's, do not → don't, cannot → can't",
      "locations": ["везде"],
      "impact": "+0.5 к score"
    },
    {
      "issue": "Transition overload",
      "fix": "Убери 'Furthermore' и 'Moreover'. Используй простые связки: And, But, So",
      "locations": ["p2, p3, p4, p5, p6"],
      "impact": "+0.5 к score"
    }
  ],
  "rewrite_needed": true,
  "estimated_score_after_fixes": 4.5
}
```

---

## Thresholds:

### Interpretation:

- **5/5** → Идеально человеческий ✅✅
  - Proceed
  - Нет изменений нужно

- **4/5** → Очень хорошо ✅
  - Proceed with minor tweaks
  - Можно улучшить, но не критично

- **3/5** → Приемлемо ⚠️
  - Можно proceed, но стоит улучшить
  - Следуй suggestions

- **2/5** → Заметно AI ⚠️⚠️
  - Rewrite нужен
  - Много AI patterns

- **1/5** → Очевидно AI ❌
  - Обязательный rewrite
  - Типичный AI style

- **0/5** → 100% AI слоп ❌❌
  - Полный rewrite
  - Нечитабельно

### For Workflows:

**Workflow 2 (Write Intro):**
- Threshold: >= 4
- Если < 4 → rewrite этот вариант

**Workflow 4-5 (Article drafting/rewriting):**
- Threshold: >= 4
- Если < 4 → apply fixes

**Workflow 6 (Final check):**
- Threshold: >= 4
- Если < 4 → mandatory rewrite

---

## Integration Points:

### Workflow 2: Write Intro
Проверить каждый из 3 вариантов intro отдельно

**Использование:**
```
FOR each variant (1, 2, 3):
  READ: tools/anti-ai-detector.md
  READ: references/ai-slop-patterns.md
  RUN detection on variant text

  IF ai_slop_score < 4:
    REWRITE variant with fixes applied
```

---

### Workflow 4: Write Full Article
Проверить draft перед сохранением

**Использование:**
```
AFTER drafting article:
  RUN detection on full draft

  IF ai_slop_score < 4:
    SHOW detected patterns
    APPLY fixes
    RE-CHECK
```

---

### Workflow 5: Rewrite Clarity
Проверить rewritten версию

**Использование:**
```
AFTER rewriting:
  RUN detection on rewritten text

  IF ai_slop_score < previous_score:
    WARNING: Rewrite made it MORE AI-like
    REVERT and try different approach
```

---

### Workflow 6: Style & Polish
Final check перед финализацией

**Note:** Workflow 6 уже имеет AI-slop detection (10 типов). Интегрировать с этим tool для консистентности.

**Использование:**
```
BEFORE finalizing:
  RUN detection on final text

  IF ai_slop_score < 4:
    MANDATORY REWRITE
    Cannot finalize with AI-like text
```

---

## Fix Strategies:

### Lexical Fixes:

**Pattern:** "utilize" → "use"

**BEFORE:**
"We need to utilize this approach to leverage our capabilities and optimize performance."

**AFTER:**
"We should use this approach to improve performance."

**Impact:** +1.0 к score (убрали 2 yellow flags)

---

**Pattern:** "delve into" → "explore" / убрать

**BEFORE:**
"Let's delve into the complexities of this approach."

**AFTER:**
"Let's explore this approach."

**Impact:** +1.0 к score (убрали red flag)

---

**Pattern:** "it's important to note that" → простое statement

**BEFORE:**
"It's important to note that results may vary."

**AFTER:**
"Results vary."

**Impact:** +0.5 к score

---

### Structural Fixes:

**Pattern:** Transition overload

**BEFORE:**
```
Furthermore, we see significant improvements.
Moreover, this indicates positive trends.
Additionally, the data shows growth.
```

**AFTER:**
```
We see big improvements.
This shows positive trends.
And the data confirms growth.
```

**Impact:** +0.5 к score

---

**Pattern:** Perfect structure → break it

**BEFORE:**
```
Introduction
Body paragraph 1
Body paragraph 2
Body paragraph 3
Conclusion
```

**AFTER:**
```
Hook (no formal intro)
Short paragraph
Long detailed paragraph
Quick point
Another angle
Wrap up (no "In conclusion")
```

**Impact:** +0.5 к score

---

### Tonal Fixes:

**Pattern:** No contractions → add them

**BEFORE:**
"It is essential that one must consider the implications before proceeding. Do not hesitate to contact us."

**AFTER:**
"It's essential to think through implications before starting. Don't hesitate to contact us."

**Impact:** +0.5 к score

---

**Pattern:** Безликость → add personality

**BEFORE:**
"This approach was implemented and results were achieved."

**AFTER:**
"We tried this approach last month. Results surprised us."

**Impact:** +0.5 к score

---

**Pattern:** Generic examples → specific

**BEFORE:**
"A company implemented this strategy and saw improvements."

**AFTER:**
"Airbnb tried this in 2018 and revenue jumped 40%."

**Impact:** +0.5 к score

---

### Sentence-level Fixes:

**Pattern:** Contrast framing overload

**BEFORE:**
(5 раз в тексте)
- "It's not about X, it's about Y"
- "The key isn't X, but rather Y"
- "Instead of X, focus on Y"

**AFTER:**
(оставить 1-2 раза)
- "It's not about X, it's about Y"
(убрать остальные)

**Impact:** +0.3 к score

---

**Pattern:** -ing verb overuse

**BEFORE:**
"Ensuring quality is important. Providing value to users matters. Leveraging technology helps."

**AFTER:**
"Ensure quality. Provide value to users. Use technology wisely."

**Impact:** +0.3 к score

---

## Пример полного применения:

### Input Text:

```
Email marketing is important in today's digital landscape. It's important to note that utilizing effective subject lines can help optimize open rates. Furthermore, one must consider the timing of emails. Moreover, providing value to recipients is crucial. Additionally, leveraging personalization techniques can facilitate better engagement.
```

---

### Detection Results:

```json
{
  "ai_slop_score": 0.5,
  "detected_patterns": [
    {
      "type": "lexical",
      "pattern": "in today's digital landscape",
      "penalty": -0.5
    },
    {
      "type": "lexical",
      "pattern": "it's important to note that",
      "penalty": -0.5
    },
    {
      "type": "lexical",
      "pattern": "utilizing",
      "penalty": -0.5
    },
    {
      "type": "lexical",
      "pattern": "optimize",
      "penalty": -0.5
    },
    {
      "type": "lexical",
      "pattern": "providing",
      "penalty": -0.3
    },
    {
      "type": "lexical",
      "pattern": "leveraging",
      "penalty": -0.5
    },
    {
      "type": "lexical",
      "pattern": "facilitate",
      "penalty": -0.5
    },
    {
      "type": "structural",
      "pattern": "transition_overload",
      "evidence": "Furthermore, Moreover, Additionally",
      "penalty": -0.5
    },
    {
      "type": "tonal",
      "pattern": "безликость",
      "evidence": "Нет 'я'/'мы', generic statements",
      "penalty": -0.5
    }
  ],
  "total_penalties": -4.5,
  "final_score": 0.5,
  "rewrite_needed": true
}
```

---

### Fixes Applied:

```
Вчера отправил 100 email. Subject lines были хороши. Открыли 40. Прочитали 5.

Проблема? Timing был не важен. Персонализация не помогла.

Важна была первая строка body. Она решает прочитают или нет.
```

---

### After Rewrite Score:

```json
{
  "ai_slop_score": 4.5,
  "detected_patterns": [],
  "improvements_applied": [
    "Добавлено 'я' (personal voice)",
    "Короткие панчи",
    "Конкретные числа (100, 40, 5)",
    "Убраны все AI фразы",
    "Простой язык",
    "Fragments для impact"
  ],
  "rewrite_needed": false
}
```

**Improvement:** 0.5 → 4.5 (+4.0) ✅✅

---

## Quick Check Heuristics:

### 🚨 Instant Red Flags:

Если видишь хотя бы одно:
- "Delve into"
- "Navigate the landscape"
- "Leverage synergies"
- "In today's digital landscape"
- Perfect 5-paragraph structure
- Нет ни одного сокращения

→ **Score автоматически < 2** → Rewrite needed

---

### ✅ Positive Signals:

Если видишь:
- Сокращения (it's, don't, can't) ✅
- Фрагменты предложений ✅
- "Я" / "мы" / personal experience ✅
- Конкретные примеры (Airbnb) ✅
- Эмоции (honestly, блин) ✅

→ **Score likely >= 4** → Good to go

---

## Best Practices:

### DO:
✅ Проверяй ВСЕ тексты перед финализацией
✅ Показывай detected patterns пользователю
✅ Давай конкретные фиксы (не "улучши тон")
✅ Пересчитывай score после фиксов
✅ Сохраняй detection results в markdown export

### DON'T:
❌ Не пропускай проверку ("и так сойдёт")
❌ Не игнорируй score < 4
❌ Не применяй фиксы вслепую (проверь что улучшилось)
❌ Не делай текст слишком casual (баланс важен)

---

## Integration with Markdown Export:

После каждой проверки, сохраняй результаты:

```markdown
**AI-Slop Check:**
- Detected: "utilize" (3x), "Furthermore" (5x)
- Score: 3/5 ⚠️
- Fixes applied: utilize→use, убраны transitions
- New score: 4.5/5 ✅
```

---

**Последнее обновление:** 2025-11-26
