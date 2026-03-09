---
name: writing-content
description: |
  Интерактивный процесс написания текстов для вайб-маркетинга на основе Julian Shapiro framework.

  **Новые возможности (v2.0):**
  - Research & Gap Analysis (Perplexity → WebSearch fallback)
  - Scoring 0-5 вместо binary (Novelty + Resonance + Hook + Clarity)
  - AI-Slop Detection на всех этапах (10 типов patterns)
  - 3 варианта intro с self-scoring
  - Markdown export всех промежуточных результатов

  **Русские triggers:** "напиши пост по шапиро", "написать статью по фреймворку шапиро",
  "создай текст в стиле julian shapiro", "помоги написать контент по методу shapiro",
  "контент по julian shapiro фреймворку", "пост по julian shapiro", "напиши в стиле шапиро"

  **English triggers:** "write content using julian shapiro framework", "create post with shapiro method",
  "write article shapiro style", "help with julian shapiro writing"

  **Generic triggers:** "напиши статью", "помоги написать контент", "создай текст",
  "начать писать", "хочу написать пост", "нужна помощь с текстом", "write content",
  "write article", "создай контент", "придумай идею для статьи", or requests help
  with content creation process.
---

# Writing Content — Интерактивное написание текстов

## Workflow Routing (SYSTEM PROMPT)

**CRITICAL: This section routes EVERY workflow. Always read the appropriate workflow file.**

### Этап 1: Генерация идеи (v2 - с Research + Scoring 0-5)
**Когда пользователь говорит:**
Examples: "придумай идею", "о чём писать", "start writing", "начать писать", "хочу написать о...", "нужна идея для статьи", "помоги с темой", "что написать"

→ **READ:** `~/.claude/skills/writing-content/workflows/1-generate-idea.md`
→ **PREREQUISITES:**
  - `tools/scoring-system.md` (scoring methodology)
  - `references/scoring-criteria.md` (0-5 criteria with examples)

→ **EXECUTE:**
  1. Интерактивная генерация идеи
  2. **Research & Gap Analysis** (NEW)
     - Perplexity search (fallback к WebSearch)
     - Identify content gap
  3. **Scoring 0-5** (NEW вместо binary)
     - Novelty: 0-5 с reasoning + evidence + improvement
     - Resonance: 0-5 с reasoning + evidence + improvement
     - Overall recommendation (strong proceed | proceed | revise | rethink)
  4. **Markdown Export** (NEW)
     - Создать `writing-session-{timestamp}.md` в current directory
     - Section: "Идея" с research + scoring + improvements
  5. Decision: proceed/revise/rethink based on scores

---

### Этап 2: Написание intro (v2 - 3 варианта + AI-Slop Check)
**Когда пользователь говорит:**
Examples: "напиши первый абзац", "создай intro", "write hook", "напиши вступление", "сделай зацепляющее начало", "начало статьи"

→ **READ:** `~/.claude/skills/writing-content/workflows/2-write-intro.md`
→ **PREREQUISITES:**
  - `references/hooks-database.md` (4 hook types + viral patterns)
  - `tools/scoring-system.md`
  - `tools/anti-ai-detector.md`
  - `references/ai-slop-patterns.md`

→ **EXECUTE:**
  1. Load hooks database
  2. **Generate 3 variants** (NEW вместо 1)
     - Variant 1: Question Hook
     - Variant 2: Narrative Hook
     - Variant 3: Argument Hook
  3. **Self-Score каждый вариант** (NEW)
     - Hook Strength: 0-5
     - Clarity: 0-5
     - AI-Slop Score: 0-5 (detection + fixes)
     - Overall: average
  4. **AI-Slop Fixes** (NEW)
     - Threshold: >= 4/5 mandatory
     - Apply fixes if needed, re-score
  5. Present all 3 variants with scores + recommendation
  6. **Markdown Export** (NEW)
     - Append section: "Intro" (all 3 variants + selected)

---

### Этап 3: Тестирование через AI-персоны
**Когда пользователь говорит:**
Examples: "протестируй intro", "test intro", "проверь идею", "оцени intro", "как зайдёт этот текст", "протестируй на аудитории", "проверь как зацепит"

→ **READ:** `~/.claude/skills/writing-content/workflows/3-test-with-personas.md`
→ **EXECUTE:** Создание 3 AI-персон (core/skeptical/novice) и симуляция чтения intro

---

### Этап 4: Полная статья (v2 - с AI-Slop Check)
**Когда пользователь говорит:**
Examples: "напиши полную статью", "expand to article", "write full post", "сделай большой текст", "разверни в статью", "пиши полностью"

→ **READ:** `~/.claude/skills/writing-content/workflows/4-write-full-article.md`
→ **PREREQUISITES:**
  - `tools/anti-ai-detector.md`
  - `references/ai-slop-patterns.md`

→ **EXECUTE:**
  1. Create outline (supporting/resulting points)
  2. Draft section by section
  3. **AI-Slop Check** (NEW)
     - Run detection on draft
     - Apply fixes if score < 4
  4. **Markdown Export** (NEW)
     - Append section: "Drafting" (objective + outline + draft + AI check)

---

### Этап 5: Переписывание для ясности (v2 - с AI-Slop Check)
**Когда пользователь говорит:**
Examples: "улучши текст", "rewrite", "сделай понятнее", "переписать", "упрости язык", "сделай короче и яснее"

→ **READ:** `~/.claude/skills/writing-content/workflows/5-rewrite-clarity.md`
→ **PREREQUISITES:**
  - `tools/anti-ai-detector.md`

→ **EXECUTE:**
  1. Clarity pass
  2. Succinctness pass (verbal summary)
  3. Intrigue pass (dopamine hits)
  4. **AI-Slop Check After Rewrite** (NEW)
     - CRITICAL: Check if rewrite made text MORE AI-like
     - Compare original vs rewritten scores
     - Revert problematic changes if needed
  5. **Markdown Export** (NEW)
     - Append section: "Rewriting" (stats + rewritten text + AI check)

---

### Этап 6: Стиль и полировка (v2 - усиленный AI-Slop Detection)
**Когда пользователь говорит:**
Examples: "добавь стиль", "polish", "финальная версия", "сделай красиво", "добавь личности", "улучши voice"

→ **READ:** `~/.claude/skills/writing-content/workflows/6-style-polish.md`
→ **PREREQUISITES:**
  - `tools/anti-ai-detector.md`
  - `references/ai-slop-patterns.md`

→ **EXECUTE:**
  1. **AI-Slop Detection** (10 red flags - УСИЛЕННАЯ ПРОВЕРКА)
     - Contrast framing, Rule of three, Cringe transitions
     - Present-ing verbs, Vague opinions, Formal language
     - Emoji explosion, Extra em dashes, Symbolic language, Fake personas
     - **Threshold: >= 4/5 MANDATORY**
  2. Voice check (authentic, conversational)
  3. Vividness (живые детали, метафоры)
  4. Poetry (optional, second-order descriptions)
  5. **Markdown Export** (NEW)
     - Append final section: "Polishing" (AI-Slop fixes + style improvements + final text)
     - **sync_status: "complete"**

---

### Этап 7: Генерация визуала (v2 - unchanged from v1, integrated with art skill)
**Когда пользователь говорит:**
Examples: "создай картинку", "нужен визуал", "generate image", "add visual", "сделай иллюстрацию", "нужна картинка к статье"

→ **READ:** `~/.claude/skills/writing-content/workflows/7-generate-visual.md`
→ **EXECUTE:**
  1. Активация art skill для создания визуала
  2. Сохранение в state
  3. (Markdown export если markdown файл уже создан)

---

### Продолжение работы
**Когда пользователь говорит:**
Examples: "продолжить статью", "где мы остановились", "continue writing", "что дальше", "вернуться к статье"

→ **LOAD STATE:** `~/.claude/skills/writing-content/state/current-article.json`
→ **EXECUTE:** Загрузить контекст и продолжить с последнего этапа

---

## Architecture & Design

### Skill Type Classification
**Complex Archetype** — Sophisticated multi-workflow system with external integrations and progressive state management

**Canonical Reference:** `~/.claude/skills/CORE/SKILL-STRUCTURE-AND-ROUTING.md`

### Core Innovation (v2.0)
This skill combines three frameworks:
1. **Julian Shapiro Writing Framework** (Novelty × Resonance = Quality)
2. **AI-Slop Detection System** (10-layer pattern recognition across 4 dimensions)
3. **Progressive Markdown Export** (Dual state: JSON + human-readable markdown)

### Integration Architecture

**State Management Model:**
```
Source of Truth:    state/current-article.json (v2 structure)
                           ↓
                    (synchronization)
                           ↓
Human Interface:    writing-session-{timestamp}.md (progressive append)
```

**State Evolution:**
- **v1 → v2 migration:** Added research, 0-5 scoring, 3 intro variants, markdown export tracking
- **Backward compatibility:** v1 state files still readable (progressive disclosure)
- **Sync mechanism:** Automatic after each workflow step completion

### Workflow Dependency Graph

```
Prerequisites (read first):
├── references/
│   ├── hooks-database.md         → Workflow 2 (intro generation)
│   ├── scoring-criteria.md       → Workflows 1, 2 (0-5 criteria)
│   └── ai-slop-patterns.md       → Workflows 2, 4, 5, 6 (detection)
├── tools/
│   ├── scoring-system.md         → Workflows 1, 2 (methodology)
│   ├── anti-ai-detector.md       → Workflows 2, 4, 5, 6 (algorithm)
│   └── markdown-exporter.md      → Workflows 1, 2, 4, 5, 6 (export)
└── state/
    └── README.md                 → All workflows (state structure)

Workflow execution order:
1-generate-idea (v2) → 2-write-intro (v2) → 3-test-personas →
4-write-article (v2) → 5-rewrite-clarity (v2) → 6-style-polish (v2) →
7-generate-visual
```

### Key v2.0 Additions

**1. Research & Gap Analysis (Workflow 1)**
- **Method:** Perplexity search → WebSearch fallback
- **Purpose:** Identify content gaps before writing
- **Output:** `idea.research` object in state

**2. 0-5 Scoring System (Workflows 1, 2)**
- **Replaces:** Binary yes/no evaluation
- **Parameters:** Novelty, Resonance, Hook Strength, Clarity, AI-Slop Score
- **Structure:** `{ score: 0-5, reasoning: string, evidence: string, improvement: string }`
- **Decision Thresholds:**
  - >= 4 both: Strong Proceed
  - >= 3 both: Proceed
  - < 3 either: Revise/Rethink

**3. 3 Intro Variants with Self-Scoring (Workflow 2)**
- **Variants:** Question Hook, Narrative Hook, Argument Hook
- **Each scored independently:** Hook Strength, Clarity, AI-Slop
- **Selection:** User chooses based on scores + recommendation
- **State:** `intro.variants[]` array with 3 objects

**4. AI-Slop Detection (4 Layers, All Workflows)**
- **Layer 1: Lexical Scan** — Red/Yellow flag words (32 patterns)
- **Layer 2: Structural Scan** — Perfect structure, transition overload, list mania
- **Layer 3: Tonal Scan** — Безликость, formality, fake enthusiasm
- **Layer 4: Sentence Patterns** — Contrast framing, -ing verbs, hedging
- **Threshold:** >= 4/5 mandatory for all workflows
- **Critical Check (Workflow 5):** Ensures rewriting doesn't ADD AI patterns

**5. Progressive Markdown Export (All Workflows)**
- **File:** `writing-session-{YYYY-MM-DD-HHMMSS}.md` in current directory
- **Sections:** Idea → Intro → Testing → Drafting → Rewriting → Polishing
- **Append-only:** Each workflow appends its section
- **Sync tracking:** `article.markdown_export.sections_written[]` array
- **Completion:** `sync_status: "complete"` when workflow 6 finishes

### External Integrations

**Skills:**
- **art skill** — Visual generation (Workflow 7)
- **research skill** (optional) — Enhanced data gathering

**Search Services:**
- **Perplexity** (primary) — Research & gap analysis
- **WebSearch** (fallback) — If Perplexity unavailable

### Capabilities Matrix

| Capability | Workflows | New in v2.0 |
|------------|-----------|-------------|
| Idea Generation | 1 | ✅ Research + 0-5 scoring |
| Hook Creation | 2 | ✅ 3 variants + self-scoring |
| AI-persona Testing | 3 | (unchanged) |
| Full Drafting | 4 | ✅ AI-Slop detection |
| Clarity Rewriting | 5 | ✅ AI-Slop check after rewrite |
| Style Polishing | 6 | ✅ Enhanced 10-pattern detection |
| Visual Generation | 7 | (unchanged) |
| State Persistence | All | ✅ Dual JSON + Markdown |
| Progress Tracking | All | ✅ Markdown export sync |

---

## When to Activate This Skill

### Direct Writing Requests (Categories 1-4)
- "напиши статью", "write article", "создай контент", "write post"
- "помоги написать", "нужна помощь с текстом", "assist with writing"
- "начать писать", "start writing", "создать текст", "compose content"
- "напиши о [тема]", "write about [topic]", "статья про [тема]"

### Idea Generation (Category 5)
- "придумай идею", "generate idea", "о чём писать", "what to write about"
- "нужна тема для статьи", "find topic", "help with topic"
- "что написать", "suggest topic", "мне нужна идея"

### Content Testing (Category 6)
- "протестируй контент", "test content", "проверь текст", "validate idea"
- "как зайдёт текст", "оцени intro", "evaluate hook"
- "проверь на аудитории", "test with audience"

### Content Improvement (Category 7)
- "улучши текст", "improve writing", "rewrite", "переписать"
- "сделай понятнее", "make clearer", "упрости", "simplify"
- "добавь стиль", "add style", "polish", "финальная версия"

### Visual Content (Category 8)
- "создай картинку", "generate visual", "нужна иллюстрация"
- "add image", "create diagram", "сделай визуал"

---

## Core Capabilities

**Что даёт этот skill:**

1. **Генерация идей** — Интерактивная помощь в поиске темы с валидацией по 5 типам novelty (Julian Shapiro)
2. **Написание hooks** — Создание зацепляющих первых абзацев по проверенной структуре
3. **AI-тестирование** — Симуляция реакции 3 типов аудитории за 2 минуты (vs 24+ часов реального теста)
4. **Полная статья** — Структурированное написание с outline, supporting/resulting points
5. **Переписывание** — Улучшение clarity, succinctness, intrigue
6. **Стилизация** — Добавление voice, vividness, authentic tone
7. **Визуальный контент** — Интеграция с art skill для генерации иллюстраций

---

## Core Principles (Julian Shapiro Framework)

### Writing Quality = Novelty × Resonance

**Novelty (Draft 1):**
- **Counter-intuitive** — То, что противоречит общепринятому
- **Counter-narrative** — Против популярного нарратива
- **Shock and awe** — Неожиданные факты/статистика
- **Elegant articulations** — Красиво сформулированные идеи
- **Make someone feel seen** — Описать чувство, которое человек испытывает но не может выразить

**Resonance (Draft 2+):**
- **Stories** — Истории делают идеи запоминающимися
- **Analogies** — Сравнения помогают понять сложное
- **Examples** — Конкретные примеры вместо абстракций
- **Authentic voice** — Пиши как говоришь с другом

### The Process
1. **Choose topic + objective** — Что хочешь донести?
2. **Write intro with hook** — Зацепи с первой строки
3. **Test with AI personas** — Мгновенная валидация на 3 типах аудитории
4. **Write full article** — Outline → draft по структуре
5. **Rewrite** — Clarity + succinctness + intrigue
6. **Polish** — Voice + vividness + poetry
7. **Add visual** (optional) — Иллюстрация через art skill

---

## Workflow Overview

**Последовательные этапы:**

1. **1-generate-idea.md** — Генерация и валидация идеи
   - Интервью с пользователем (аудитория, проблема, инсайт)
   - Валидация по 5 типам novelty
   - Формулировка идеи в 1 предложение

2. **2-write-intro.md** — Написание зацепляющего intro
   - Выбор типа hook (question/narrative/research/argument)
   - Создание 3 вариантов hooks
   - Написание полного intro (3-5 предложений)

3. **3-test-with-personas.md** — Тестирование через AI-персоны
   - Создание 3 архетипов (Core/Skeptical/Novice)
   - Stream of consciousness reading (естественные мысли при чтении)
   - Aggregated score + рекомендации

4. **4-write-full-article.md** — Написание полной статьи
   - Создание outline (supporting/resulting points)
   - Drafting по секциям
   - Conclusion с takeaway

5. **5-rewrite-clarity.md** — Переписывание для ясности
   - Clarity (простой язык для 13-летнего)
   - Succinctness (verbal summary, убрать filler)
   - Intrigue (dopamine hits, withholding info)

6. **6-style-polish.md** — Финальная стилизация
   - Voice (authentic, как говоришь с другом)
   - Vividness (живые детали, метафоры)
   - Poetry (second-order descriptions)

7. **7-generate-visual.md** — Генерация визуала
   - Выбор типа визуала
   - Интеграция с art skill
   - Сохранение результата

---

## State Management

**Все данные сохраняются в:**
`~/.claude/skills/writing-content/state/current-article.json`

**Структура state:**
```json
{
  "id": "uuid",
  "created": "timestamp",
  "updated": "timestamp",
  "status": "idea|intro|testing|drafting|rewriting|polishing|complete",
  "idea": {
    "rawIdea": "string",
    "refinedIdea": "string",
    "audience": "string",
    "problem": "string",
    "noveltyType": "counter-intuitive|counter-narrative|shock-awe|elegant|make-seen"
  },
  "intro": {
    "hook": "string",
    "hookType": "question|narrative|research|argument",
    "fullIntro": "string",
    "version": 1
  },
  "persona_test_results": {
    "personas": [...],
    "aggregate_score": 0-100,
    "recommendation": "proceed|revise|rethink"
  },
  "article": {
    "objective": "string",
    "outline": ["string"],
    "draft": "string",
    "rewritten": "string",
    "final": "string"
  },
  "visual": {
    "requested": true,
    "type": "string",
    "image_url": "string",
    "alt_text": "string"
  }
}
```

**Можно продолжить в любой момент:**
- "продолжить статью"
- "где мы остановились?"
- "continue writing"

---

## Examples

### Example 1: От идеи до тестирования

**User:** "Хочу написать статью про email-маркетинг"

**Claude:** [Загружает workflow 1-generate-idea.md]
```
Отлично! Давай проработаем идею.

1. Для кого эта статья? (твоя целевая аудитория)
2. Какую проблему они пытаются решить?
3. Какой инсайт/неожиданный подход ты можешь дать?
```

**User:** "Для маркетеров B2B SaaS. Они пишут emails но люди не читают."

**Claude:**
```
Хм, интересно. Что если...

💡 Идея: "Большинство маркетеров пишут email неправильно - они думают главное это информация, но на самом деле главное это первая строка."

Это counter-intuitive ✅ (против того что все думают)

Хочешь доработать или двигаемся дальше?
```

**User:** "Давай напишем intro"

**Claude:** [Автоматически переходит к workflow 2-write-intro.md]
```
Отлично! Выбери тип hook:

1. Question: "Почему люди не читают твои email?"
2. Narrative: "Вчера я отправил 100 email. Открыли 5."
3. Research: "Исследование показало: 80% email удаляют не читая."

Какой зацепит твою аудиторию?
```

**User:** "Давай протестируем intro"

**Claude:** [workflow 3-test-with-personas.md]
```
Создаю 3 персоны для теста...

👤 Алексей (Core) - Head of Marketing, 32 года
👤 Мария (Skeptical) - CMO, опыт 10 лет
👤 Дмитрий (Novice) - Junior маркетолог, 1 год

Симулирую чтение intro...

[Stream of consciousness от каждой персоны]

📊 РЕЗУЛЬТАТ: 78% (ХОРОШО)
✅ Можно переходить к полной статье
```

---

### Example 2: Возврат к незавершённой статье

**User:** "Продолжить статью"

**Claude:** [Загружает state/current-article.json]
```
Нашёл твою статью:

📄 "Email-маркетинг: первая строка решает всё"
📊 Статус: testing (AI-персоны дали 78%)
🎯 Рекомендация: Переходим к написанию полной статьи

Хочешь продолжить?
```

---

### Example 3: Только улучшение текста

**User:** "Переписать текст понятнее" [+ текст]

**Claude:** [workflow 5-rewrite-clarity.md]
```
Анализирую текст...

❌ Проблемы:
- Сложный язык (13-летний не поймёт)
- Много filler words ("в принципе", "так сказать")
- Abstract phrases без примеров

Переписываю...

[Показывает до/после для каждой секции]
```

---

## Extended Context

### Related Skills Integration

**Интеграция с другими skills:**
- **art skill** — Генерация визуалов для статьи (workflow 7)
- **research skill** (если доступен) — Поиск данных/статистики для novelty
- **blogging skill** (если доступен) — Публикация готовой статьи

### Julian Shapiro Resources

Этот skill основан на материалах:
- `Julian Shapiro/1. Writing Handbook - What to Write About`
- `Julian Shapiro/2. Writing First Drafts`
- `Julian Shapiro/3. Rewriting and Editing`
- `Julian Shapiro/4. Writing Style`
- `Julian Shapiro/5. Practicing Writing`

Полный путь: `~/Documents/obsidian-vault/3. projects/Active/Vibemarketing/content-creation/Julian Shapiro/`

### Testing Framework

Оригинальный pipeline тестирования (для справки):
`~/Documents/obsidian-vault/3. projects/Active/Vibemarketing/content-creation/TESTING_CONTENT_IDEAS.md`

Этот skill использует **AI-персоны вместо реального тестирования** для скорости (2 мин vs 24+ часов).

---

## Key Principles

### 1. Интерактивность превыше всего
- Всегда задавай вопросы
- Не делай за пользователя — помогай
- Дай выбор на критичных моментах

### 2. State = память скилла
- Сохраняй после каждого workflow
- Можно вернуться в любой момент
- История изменений (versions)

### 3. Следуй Julian Shapiro строго
- Не изобретай свои методы
- Используй термины из материалов
- Novelty × Resonance — основа качества

### 4. AI-персоны звучат естественно
- Stream of consciousness (думают вслух)
- Filler words ("хм", "ок", "блин")
- Эмоциональные реакции
- Личные связи ("я так делаю")

---

**Related Documentation:**
- `~/.claude/skills/CORE/SKILL-STRUCTURE-AND-ROUTING.md` — Canonical structure guide
- `~/Documents/obsidian-vault/3. projects/Active/Vibemarketing/content-creation/` — Vibemarketing content resources

**Last Updated:** 2025-11-25
