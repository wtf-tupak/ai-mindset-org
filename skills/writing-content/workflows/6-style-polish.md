# Workflow 6: Style & Polish + AI-Slop Detection

**Purpose:** Добавить voice, vividness, poetry + удалить все AI red flags

**When to Use:**
- Rewriting завершён (из workflow 5)
- Нужно добавить personality и style
- КРИТИЧНО: Убрать все признаки AI-generated текста

**Prerequisites:**
- State файл с rewritten статьёй
- Понимание своего authentic voice
- Готовность удалить AI-slop

---

## Workflow Steps

### Step 1: Load Rewritten Article

**Description:** Загрузи статью после rewriting

**Actions:**

```
Финальный этап! Style & Polish + AI-Slop Detection 🎨

Загружаю rewritten статью...
Слов: [count]

Сейчас сделаем два прохода:

1. ❌ AI-SLOP DETECTION — Найдём и уберём все AI red flags (10 типов)
2. ✅ STYLE POLISH — Добавим voice, vividness, poetry

Начинаем с AI-slop detection (это критично!)
```

**Expected Outcome:** Статья загружена, план понятен

---

### Step 2: AI-Slop Detection (10 Red Flags)

**Description:** КРИТИЧНО - найди и исправь все 10 типов AI-generated паттернов

**Actions:**

Объясни что ищем:
```
━━━━━━━━━━━━━━━━━
🚨 AI-SLOP DETECTION

AI оставляет характерные следы в тексте.
Сейчас проверим твою статью на 10 red flags и исправим ВСЁ.

Это НЕ опционально - это обязательная проверка.
━━━━━━━━━━━━━━━━━
```

---

#### **RED FLAG #1: Contrast Framing Overload**

**Pattern:**
```
❌ "Marketing isn't about selling, it's about connecting"
❌ "Success isn't luck, it's preparation"
❌ "It's not about X, it's about Y"
```

**Check:**
```
Ищу contrast framing в статье...

НАЙДЕНО: [count] случаев

Пример:
❌ "[найденная фраза]"

Humans don't speak in constant opposites.
```

**Fix:**
```
Было:
❌ "Marketing isn't about selling, it's about connecting"

Стало:
✅ "Marketing works when you connect with people"

Или будь более direct и конкретен:
✅ "Here's how I connect with my audience: [concrete details]"
```

**Apply fixes and ask approval**

---

#### **RED FLAG #2: Rule of Three Overuse**

**Pattern:**
```
❌ "Efficient, effective, and reliable"
❌ "Save time, reduce costs, increase ROI"
❌ "Simple, powerful, transformative"
```

**Check:**
```
Ищу rule of three patterns...

НАЙДЕНО: [count] случаев

Don't let AI turn your writing into a jingle.
```

**Fix:**
```
Было:
❌ "This approach is efficient, effective, and reliable"

Стало:
✅ "This approach works. Here's proof: [concrete example]"

Или используй rule of three СПАРАДИЧЕСКИ, не везде:
✅ Keep only 1-2 instances where it genuinely adds value
```

---

#### **RED FLAG #3: Cringe Transition Questions**

**Pattern:**
```
❌ "The catch?"
❌ "The kicker?"
❌ "The brutal truth?"
❌ "But wait, there's more!"
```

**Check:**
```
Ищу cringe transitions...

НАЙДЕНО: [count] случаев

They smell of bad infomercial language.
```

**Fix:**
```
Было:
❌ "The catch? It takes time."

Стало:
✅ "This takes time. Here's why that's okay..."

Или просто say it directly:
✅ "One problem: this takes 3 months to work"
```

---

#### **RED FLAG #4: Present-ing Verbs**

**Pattern:**
```
❌ "...highlighting key benefits..."
❌ "...emphasizing the importance..."
❌ "...facilitating enhanced collaboration..."
```

**Check:**
```
Ищу corporate -ing verbs...

НАЙДЕНО: [count] случаев

Corporate-sounding -ing verbs make your writing sound like a business manual.
```

**Fix:**
```
Было:
❌ "This approach is highlighting the importance of clarity"

Стало:
✅ "This approach shows why clarity matters"

Simple, active verbs:
- highlighting → shows, points to
- emphasizing → stresses, makes clear
- facilitating → helps, enables
```

---

#### **RED FLAG #5: Vague Glazing Opinions**

**Pattern:**
```
❌ "It's worth considering..."
❌ "It's important to note that..."
❌ "You're really getting at something special here..."
```

**Check:**
```
Ищу throat-clearing phrases...

НАЙДЕНО: [count] случаев

Just give your opinion and get rid of the throat-clearing.
```

**Fix:**
```
Было:
❌ "It's worth considering that email subject lines matter"

Стало:
✅ "Email subject lines matter. Here's why..."

Или just be direct:
✅ "Subject lines are overrated. First line matters more."
```

---

#### **RED FLAG #6: Formality First Language**

**Pattern:**
```
❌ "Utilize" → "use"
❌ "Execute" → "do"
❌ "Facilitate" → "help"
❌ "Expedite" → "speed up"
❌ "Address" → "fix" / "talk about"
❌ "Synergy" → "working together"
❌ "Implement" → "start" / "put in place"
❌ "Optimize" → "improve" / "make better"
```

**Check:**
```
Ищу 4-dollar words...

НАЙДЕНО: [list of fancy words found]

Write like YOU talk. Unless you're talking to middle-management consultant.
```

**Fix:**
```
Замени все:
❌ "We will utilize this framework to optimize performance"
✅ "We'll use this framework to make things better"

Complete replacement list:
[Show all found instances and their simple replacements]
```

---

#### **RED FLAG #7: Emoji Explosion**

**Pattern:**
```
❌ 🚀 Boost your productivity!
❌ ✨ Transform your business today!
❌ 💡 Here's a brilliant idea!
❌ Using emoji in every 🐶 sentence like a dog 🦴 with a bone 🐽
```

**Check:**
```
Подсчитываю emojis...

НАЙДЕНО: [count] emojis

ChatGPT goes to town with emojis. Use them sparingly.
```

**Fix:**
```
Правило: Максимум 2-3 emojis на всю статью, только где реально усиливают смысл.

Было:
❌ "Here are 3️⃣ tips 💡 to improve 🚀 your writing ✍️"

Стало:
✅ "Here are 3 tips to improve your writing"

Keep only strategic emojis (e.g., one in title if needed).
```

---

#### **RED FLAG #8: Extra Em Dashes**

**Pattern:**
```
❌ Too many em dashes (—) in text
Mix up your punctuation.
```

**Check:**
```
Подсчитываю em dashes...

НАЙДЕНО: [count] em dashes (—)

If more than 3-4 per article → это AI giveaway.
```

**Fix:**
```
Было:
❌ "This approach — which I discovered last year — works because — and this is key — it's simple."

Стало:
✅ "This approach works because it's simple. I discovered it last year."

Mix it up:
- Use commas
- Split into two sentences
- Use parentheses occasionally
- Keep only 2-3 em dashes max
```

---

#### **RED FLAG #9: Everything Is "Symbolic"**

**Pattern:**
```
❌ "This represents..."
❌ "This emphasizes..."
❌ "This indicates..."
❌ "This reflects..."
❌ "This symbolizes..."
```

**Check:**
```
Ищу symbolic language...

НАЙДЕНО: [count] случаев

AI loves to tell you what things represent rather than just stating facts.
```

**Fix:**
```
Было:
❌ "This case study represents the importance of testing"

Стало:
✅ "We tested this approach. Here's what happened..."

Replace "symbol" with what actually happened:
- represents → [state the fact]
- emphasizes → [show why it matters]
- reflects → [describe what you saw]
```

---

#### **RED FLAG #10: The Mysterious "Sarah Chen"**

**Pattern:**
```
❌ Made-up names: "Sarah Chen", "John Smith", "Marketing Manager at TechCorp"
AI invents fake personas when lacking real examples.
```

**Check:**
```
Ищу fake personas...

НАЙДЕНО: [list suspicious names]

In absence of real case study, AI makes up people.
```

**Fix:**
```
Было:
❌ "Sarah Chen, a marketing manager, increased her ROI by 300%"

Стало (опции):
✅ "A client increased their ROI by 300%" (generic but honest)
✅ "I worked with a SaaS company that increased ROI 300%" (real but anonymous)
✅ Use real name (with permission): "Maria from Acme Corp increased..."
✅ Use hypothetical: "Imagine you're a marketing manager..."

Best: Use REAL case studies or stories from YOUR life.
```

---

### Step 3: AI-Slop Detection Summary

**Description:** Покажи все найденные и исправленные AI patterns

**Actions:**

```
━━━━━━━━━━━━━━━━━
🚨 AI-SLOP DETECTION РЕЗУЛЬТАТЫ

Red Flag #1 (Contrast Framing): [count] найдено → [count] исправлено
Red Flag #2 (Rule of Three): [count] найдено → [count] исправлено
Red Flag #3 (Cringe Transitions): [count] найдено → [count] исправлено
Red Flag #4 (Present-ing Verbs): [count] найдено → [count] исправлено
Red Flag #5 (Vague Opinions): [count] найдено → [count] исправлено
Red Flag #6 (Formal Language): [count] найдено → [count] исправлено
Red Flag #7 (Emoji Explosion): [count] найдено → [count] убрано
Red Flag #8 (Extra Em Dashes): [count] найдено → [count] заменено
Red Flag #9 (Symbolic Language): [count] найдено → [count] исправлено
Red Flag #10 (Fake Personas): [count] найдено → [count] заменено

━━━━━━━━━━━━━━━━━
✅ ИТОГО: [total_fixes] AI patterns исправлено

Теперь текст звучит как ЧЕЛОВЕК, не как AI.
Переходим к style polish! 🎨
━━━━━━━━━━━━━━━━━
```

**Expected Outcome:** Все AI-slop убран из текста

---

### Step 4: Voice Check

**Description:** Добавь authentic voice (Julian Shapiro style)

**Actions:**

Объясни voice:
```
━━━━━━━━━━━━━━━━━
VOICE — Authentic & Conversational

Вопрос: Читается как ты говоришь с другом?

Tests:
❓ Используешь ли contractions? (you're, don't, it's)
❓ Есть ли personality? (твои мнения, твой tone)
❓ Избегаешь ли corporate speak?
━━━━━━━━━━━━━━━━━
```

Проверь каждую секцию:

**Voice Issues:**
```
Было (corporate):
❌ "One should consider implementing these strategies"

Стало (authentic):
✅ "You should try these strategies"

Или ещё более personal:
✅ "Here's what I do..."
```

**Approve changes**

**Expected Outcome:** Voice authentic, conversational

---

### Step 5: Vividness Check

**Description:** Добавь живые детали и метафоры

**Actions:**

Объясни vividness:
```
━━━━━━━━━━━━━━━━━
VIVIDNESS — Make It Memorable

Добавь:
- Живые детали (specific, not generic)
- Метафоры (помогают понять сложное)
- Evocative descriptions (engage imagination)
━━━━━━━━━━━━━━━━━
```

Найди моменты где можно усилить:

**Add vividness:**
```
Было (bland):
❌ "The process is complicated"

Стало (vivid):
✅ "The process looks like trying to juggle flaming torches while riding a unicycle"

Или конкретные детали:
✅ "The process has 47 steps. I counted."
```

**Expected Outcome:** Статья более vivid и memorable

---

### Step 6: Poetry (Optional)

**Description:** Добавь second-order descriptions (optional advanced technique)

**Actions:**

Объясни poetry:
```
━━━━━━━━━━━━━━━━━
POETRY — Second-Order Descriptions (optional)

Вместо прямого описания, опиши эффект который это производит.

Пример:
❌ First-order: "The music was loud"
✅ Second-order: "The music made my chest vibrate"
━━━━━━━━━━━━━━━━━
```

Предложи 1-2 места где poetry усилит:

```
Хочешь добавить poetry для более deep impression?
OPTIONS:
- "Да, покажи где"
- "Нет, пропустить"
```

**Expected Outcome:** Poetry добавлен где уместен

---

### Step 7: Final Comparison (Before/After AI-Slop + Style)

**Description:** Покажи финальный результат

**Actions:**

```
✅ Style & Polish + AI-Slop Detection завершён!

━━━━━━━━━━━━━━━━━
📊 ФИНАЛЬНЫЕ РЕЗУЛЬТАТЫ:

AI-SLOP FIXES:
- Contrast framing: [count] исправлено
- Rule of three: [count] убрано
- Cringe transitions: [count] заменено
- Present-ing verbs: [count] упрощено
- Vague opinions: [count] прямых statements
- Formal language: [count] упрощено
- Emojis: [count] убрано
- Em dashes: [count] заменено
- Symbolic language: [count] исправлено
- Fake personas: [count] заменено

STYLE IMPROVEMENTS:
- Voice: ✅ Authentic & conversational
- Vividness: ✅ Добавлены детали и метафоры
- Poetry: ✅ [Added/Skipped]

━━━━━━━━━━━━━━━━━

BEFORE (with AI-slop):
[Показать пример 1-2 параграфов]

AFTER (human voice):
[Показать те же параграфы после fixes]

━━━━━━━━━━━━━━━━━

Теперь текст звучит как ЧЕЛОВЕК пишет, не AI! 🎉

OPTIONS:
- "Показать полную финальную версию"
- "Создать визуал для статьи" → workflow 7
- "Сохранить и завершить"
```

**Expected Outcome:** Финальная версия готова, без AI-slop

---

### Step 8: Save Final Version to State + Markdown Export

**Description:** Сохрани финальную версию с AI-slop fixes и финализируй markdown

**Prerequisites:**
```
READ: ~/.claude/skills/writing-content/tools/markdown-exporter.md
```

**Actions:**

**Part 1: Update State**

```json
{
  "article": {
    "rewritten": "...",
    "final": "[final polished text without AI-slop]",
    "aiSlopFixes": {
      "contrastFraming": 5,
      "ruleOfThree": 8,
      "cringeTransitions": 3,
      "presentIngVerbs": 12,
      "vagueOpinions": 7,
      "formalLanguage": 15,
      "emojis": 23,
      "emDashes": 9,
      "symbolicLanguage": 6,
      "fakePersonas": 2
    },
    "styleImprovements": {
      "voiceFixed": true,
      "vividnessAdded": true,
      "poetryAdded": false
    },
    "markdown_export": {
      "file_path": "/path/to/writing-session-2025-11-26-160000.md",
      "last_updated": "2025-11-26T18:00:00Z",
      "sections_written": ["idea", "intro", "drafting", "rewriting", "polishing"],
      "sync_status": "complete"
    },
    "finalizedAt": "timestamp"
  }
}
```

**Part 2: Append Final Section to Markdown**

```markdown
## Этап 6: Style & Polish + AI-Slop Detection

### AI-Slop Fixes Applied

**Total patterns fixed:** [sum of all aiSlopFixes]

- Contrast Framing: [count]
- Rule of Three: [count]
- Cringe Transitions: [count]
- Present-ing Verbs: [count]
- Vague Opinions: [count]
- Formal Language: [count]
- Emojis: [count]
- Em Dashes: [count]
- Symbolic Language: [count]
- Fake Personas: [count]

### Style Improvements

- Voice: ✅ [voiceFixed ? "Authentic & conversational" : "Needs work"]
- Vividness: ✅ [vividnessAdded ? "Живые детали добавлены" : "No"]
- Poetry: [poetryAdded ? "✅ Added" : "⏭️ Skipped"]

### Final Text

[article.final]

---

## ✅ СТАТЬЯ ЗАВЕРШЕНА

**Статус:** Готова к публикации
**AI-Slop:** Полностью убран
**Style:** Authentic & Human

*Опционально: Создание визуала (workflow 7)*
```

**Part 3: Update markdown_export**

```json
"sections_written": ["idea", "intro", "drafting", "rewriting", "polishing"],
"sync_status": "complete"
```

Сообщи:
```
✅ Финальная версия сохранена!

📄 **Статья готова к публикации**
🎨 **Style:** Authentic & Human
❌ **AI-Slop:** Полностью убран ([total_fixes] patterns fixed)

💾 **Экспорт:**
Markdown файл финализирован: `[filename]`
Все этапы сохранены: idea → intro → drafting → rewriting → polishing

Хочешь создать визуал? (workflow 7)
```

**Expected Outcome:**
- Final version сохранена без AI patterns
- Markdown файл полностью завершён со всеми секциями
- sync_status = "complete"

---

## Outputs

**What this workflow produces:**
- **AI-Slop Free Text** — Все 10 типов AI patterns исправлены
- **Authentic Voice** — Conversational, personal tone
- **Vivid Writing** — Живые детали и метафоры
- **Final Polished Article** — Готов к публикации
- **AI-Slop Report** — Сколько каких patterns исправлено

**Where outputs are stored:**
- `~/.claude/skills/writing-content/state/current-article.json`

---

## AI-Slop Detection Reference

### Quick Checklist (10 Red Flags)

Before finalizing any article, check:

- [ ] **Contrast Framing** — "It's not X, it's Y" removed
- [ ] **Rule of Three** — Excessive triads removed
- [ ] **Cringe Transitions** — "The catch?", "The kicker?" removed
- [ ] **Present-ing Verbs** — Corporate -ing verbs simplified
- [ ] **Vague Opinions** — "It's worth considering..." removed
- [ ] **Formal Language** — "Utilize" → "use" etc.
- [ ] **Emoji Explosion** — Max 2-3 emojis total
- [ ] **Extra Em Dashes** — Max 3-4 per article
- [ ] **Symbolic Language** — "This represents..." removed
- [ ] **Fake Personas** — "Sarah Chen" replaced with real examples

---

## Related Workflows

- **5-rewrite-clarity.md** — Предыдущий шаг (rewriting)
- **7-generate-visual.md** — Следующий шаг (optional visual)

---

## Examples

### Example: Before/After AI-Slop Detection

**BEFORE (AI-generated slop):**
```
Marketing isn't about selling, it's about connecting. ❌ [Red Flag #1]

The key is to utilize a strategic approach ❌ [Red Flag #6] that's efficient,
effective, and reliable ❌ [Red Flag #2], emphasizing the importance ❌ [Red Flag #4]
of authentic engagement.

The catch? ❌ [Red Flag #3] It takes time — but it's worth it — and the results
are transformative. ❌ [Multiple Red Flags]

Sarah Chen, a marketing manager, ❌ [Red Flag #10] saw her ROI increase by 300%
by implementing these strategies. ❌ [Red Flag #6] This represents ❌ [Red Flag #9]
a significant shift in how we think about marketing. 💡✨🚀 ❌ [Red Flag #7]
```

**AFTER (Human voice, AI-slop removed):**
```
Marketing works when you connect with people. ✅

Here's the approach: Be authentic. Show up consistently. Listen more than you talk.

One problem: this takes 3 months to work. But here's why that's okay... ✅

I worked with a client who increased ROI by 300% using this approach.
Here's what they did... ✅
```

**AI-Slop Fixes Applied:**
- Contrast framing → Direct statement
- Formal language → Simple words
- Rule of three → Single clear point
- Present-ing verbs → Active verbs
- Cringe transition → Direct statement
- Em dashes → Sentences split
- Symbolic language → Concrete facts
- Fake persona → Real client (anonymous)
- Emojis → Removed

---

**Last Updated:** 2025-11-25
