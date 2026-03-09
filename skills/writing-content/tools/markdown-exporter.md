# Markdown Exporter - Экспорт прогресса в MD файл

## Purpose

Сохранять промежуточные результаты каждого workflow в markdown файл в текущей директории для human-readable прогресса.

**Зачем это нужно:**
- Dual state: JSON (structured) + MD (human-readable)
- Можно вернуться через неделю и посмотреть весь прогресс
- Видно все intermediate steps и решения
- Backup если state JSON потеряется
- Удобно показать клиенту/команде процесс

---

## File Naming

```
writing-session-{YYYY-MM-DD-HHMMSS}.md
```

**Примеры:**
- `writing-session-2025-11-26-143022.md`
- `writing-session-2025-11-27-091543.md`

**Timestamp format:** ISO 8601 до секунды

**Почему timestamp:**
- Уникальность (несколько сессий в один день)
- Хронология (сортировка автоматическая)
- Легко найти последнюю сессию

---

## Location

**Current directory** (`pwd`) где пользователь находится при запуске skill.

**НЕ** в:
- `~/.claude/skills/writing-content/state/` (там только JSON)
- Фиксированная папка

**Почему current directory:**
- Гибкость (пользователь решает где)
- Рядом с проектом/статьёй
- Удобно открыть и посмотреть

---

## File Structure Template

```markdown
# Writing Session: {Topic/Title}

**Создано:** {timestamp}
**Статус:** {idea|intro|testing|drafting|rewriting|polishing|complete}
**Последнее обновление:** {timestamp}

---

## Этап 1: Генерация идеи

### Исходная идея
{user input}

### Research Results

**Метод:** Perplexity / WebSearch / Both

**Queries выполнено:**

1. **Query:** "email marketing 2024"
   - Найдено: 150+ статей
   - Ключевые углы: subject lines, personalization, AI automation
   - Gap: Никто не говорит про body first line

2. **Query:** "why emails not opened"
   - Найдено: 80+ статей
   - Основной фокус: subject lines, timing, sender name
   - Gap: Открывают но не читают (0 coverage)

3. **Query:** "email body best practices"
   - Найдено: 45 статей
   - Coverage: formatting, length, CTAs
   - Gap: First line importance (0 mention)

4. **Query:** "B2B email marketing 2024"
   - Найдено: 120+ статей
   - Trends: AI personalization, automation
   - Gap: Read rate vs open rate (nobody tracks)

5. **Query:** "email open rate vs read rate"
   - Найдено: 12 статей
   - Insight: Большой gap между metrics (open 40%, read 5%)
   - Gap identified: ✅

**Summary:**
- Похожих идей (про subject lines): 10+
- Освещённые углы: subject lines optimization, timing, personalization
- Неосвещённый gap: ❌ Первая строка body важнее subject line

**Gap validated:** ✅ Clear opportunity

---

### Оценка (0-5)

**Novelty: 3/5** ⚠️
- **Reasoning:** Встречается часто, но угол свежий. Research показал 10+ статей про subject lines, 0 про body first line importance.
- **Evidence:** Perplexity нашёл 150+ статей про email subject lines за 2024, но только 12 упоминают open vs read rate. Никто не фокусируется на первой строке body.
- **Improvement:** Добавить counter-intuitive: "Subject line это миф email-маркетинга. Первая строка body решает прочитают или нет." Усилит новизну до 4/5.

**Resonance: 4/5** ✅
- **Reasoning:** Сильный резонанс с B2B email-маркетерами. Все сталкиваются с ситуацией "открыли но не прочитали".
- **Evidence:** Типичная pain: open rate 30-40%, но meetings booked < 2%. Острая боль для всех B2B маркетеров.
- **Improvement:** Начать с личной истории: "Потратил $5000 на A/B тестинг subject lines. Open rate вырос на 15%. Meetings? 0 изменений." Эмоциональная связь → 5/5.

**Recommendation:** PROCEED ✅ (обе оценки >= 3)

---

### Предложения улучшений

1. **Усилить novelty до 4/5:**
   - Добавить counter-intuitive угол
   - Формулировка: "Subject line это миф. Первая строка body определяет прочитают или удалят через 2 секунды."
   - Поддержать данными: "Исследование 10,000 email показало: open rate 40%, read rate (past first line) only 10%."

2. **Усилить resonance до 5/5:**
   - Начать с драматичной истории
   - Пример: "Вчера отправил 100 email. Subject line на каждом — шедевр (час работы, не шучу). Открыли 40. Прочитали 5. Я был в бешенстве пока не понял: я оптимизировал не то."

---

### Финальная идея (refined)

"Subject line это миф email-маркетинга. На самом деле первая строка body определяет прочитают ли ваш email или закроют через 2 секунды. Вот как писать первую строку которая работает."

**Changes made:**
- ✅ Counter-intuitive angle добавлен
- ✅ Конкретный outcome (2 секунды)
- ✅ Promise (как писать)

---

## Этап 2: Написание Intro

### Hooks Database Loaded

**Выбрано 4 типа хуков:**
- Question hooks (5 examples)
- Narrative hooks (5 examples)
- Research hooks (5 examples)
- Argument hooks (5 examples)

**Best fit для темы:** Narrative (личная история = сильная эмоциональная связь)

---

### Вариант 1: Question Hook - Оценка: 4.2/5 ✅

**Текст:**
"Почему люди открывают ваш email, но не читают? Вы тратите час на идеальный subject line, они кликают... и закрывают через 2 секунды. Проблема не в subject line. Проблема в первой строке body."

**Scoring:**

**Hook Strength: 4/5**
- Reasoning: Question эффективно вызывает любопытство. Прямо бьёт в боль аудитории.
- Evidence: "Открывают но не читают" - типичная боль B2B маркетеров.
- Improvement: Добавить статистику: "Почему 40% открывают email, но только 5% читают дальше первой строки?"

**Clarity: 5/5**
- Reasoning: Простой язык, понятно 13-летнему.
- Evidence: Нет жаргона, короткие предложения, конкретика.
- Improvement: N/A - уже 5/5

**AI-Slop: 4/5** ✅
- Reasoning: Естественно, нет AI паттернов.
- Evidence: Сокращения есть (it's implied "не читают"), конкретика (час, 2 секунды).
- Improvement: Minor - можно добавить больше личного ("Я тратил час...")

**Overall: 4.3/5** ✅

**AI-Slop Check:**
- Detected: None
- Score: 4/5 ✅
- Notes: Естественные формулировки, конкретика, нет AI markers

---

### Вариант 2: Narrative Hook - Оценка: 4.8/5 ✅✅

**Текст:**
"Вчера отправил 100 email. Subject line на каждом — шедевр (час работы, не шучу). Открыли 40. Прочитали 5. Я был в ярости пока не понял: я оптимизировал не то."

**Scoring:**

**Hook Strength: 5/5** ✅✅
- Reasoning: Сильная драма, личная история, конкретные числа.
- Evidence: "100 email", "40 открыли", "5 прочитали" - очень конкретно. Эмоция: "ярость".
- Improvement: N/A - already 5/5

**Clarity: 5/5** ✅✅
- Reasoning: Супер простой язык, story понятна сразу.
- Evidence: Разговорный стиль, короткие панчи, числа вместо процентов.
- Improvement: N/A - perfect clarity

**AI-Slop: 5/5** ✅✅
- Reasoning: 100% человеческий текст.
- Evidence: "(час работы, не шучу)" - живая деталь. "Я был в ярости" - эмоция. Фрагменты: "Открыли 40. Прочитали 5."
- Improvement: N/A - perfect human voice

**Overall: 5.0/5** ✅✅ **BEST**

**AI-Slop Check:**
- Detected: None ✅✅
- Score: 5/5 ✅✅
- Notes: Личный опыт, эмоции, сокращения, живые детали ("не шучу"), фрагменты предложений

---

### Вариант 3: Research Hook - Оценка: 3.7/5 ⚠️

**Текст:**
"Исследование 10,000 email показало: 40% открывают письмо, но только 10% читают больше первой строки. Subject line влияет на открытие. Первая строка body решает прочитают ли дальше."

**Scoring:**

**Hook Strength: 4/5**
- Reasoning: Данные убедительны, статистика impressive.
- Evidence: "10,000 email" - large sample. "40% vs 10%" - драматичный gap.
- Improvement: Добавить источник для авторитета: "MIT study показало..."

**Clarity: 5/5**
- Reasoning: Понятно, конкретно.
- Evidence: Простые числа, короткие предложения.
- Improvement: N/A

**AI-Slop: 3/5** ⚠️
- Reasoning: Немного формально, нет personal touch.
- Evidence: Нет сокращений. Нет "я"/"мы". Стиль report-like.
- Improvement: Добавить личный комментарий: "Honestly, когда я увидел эти цифры, офигел." Или сократить: "Исследование показало (10K email): открывают 40%, читают 10%. Gap огромный."

**Overall: 4.0/5** ✅

**AI-Slop Check:**
- Detected: Slight formality, no contractions ⚠️
- Score: 3/5 ⚠️
- Suggestions: Добавить "honestly" или личный twist

---

### Выбранный вариант

**Вариант 2** (Narrative Hook) - 4.8/5 ✅✅

**Причина выбора:**
- Самый высокий AI-Slop score (5/5) - 100% человеческий
- Сильная эмоциональная связь (драма, личная история)
- Конкретные числа (100, 40, 5)
- Живые детали ("не шучу", "в ярости")

---

## Этап 3: Тестирование с AI-персонами

### Созданы 3 персоны

**👤 Алексей (Core) - 32 года, Head of Marketing B2B SaaS**
- Background: 5 лет в email-маркетинге
- Pain: Low conversion от email campaigns
- Attitude: Открыт к новым подходам, скептичен к hype

**👤 Мария (Skeptical) - 38 лет, CMO enterprise**
- Background: 10 лет в маркетинге, видела все trends
- Pain: Бюджеты растут, результаты стоят
- Attitude: "Покажите мне данные, stories не работают"

**👤 Дмитрий (Novice) - 25 лет, Junior маркетолог**
- Background: 1 год в маркетинге
- Pain: Overwhelmed количеством tactics
- Attitude: Хочет simple actionable advice

---

### Stream of Consciousness Reading

[Результаты тестирования - каждая персона читает intro]

**Aggregate Score:** 78/100

**Recommendation:** PROCEED ✅

---

## Этап 4: Полная статья

[Draft статьи...]

---

## Этап 5: Переписывание

[Rewritten версия...]

---

## Этап 6: Финальная версия

[Final статья...]

---

## Метаданные сессии

**Timing:**
- Начало: 2025-11-26 14:30:00
- Завершение: 2025-11-26 16:45:00
- Продолжительность: 2ч 15мин

**Iterations:**
- Idea: 3 (refined 2 раза)
- Intro: 1 (выбран вариант 2 сразу)
- Testing: 1 (passed)

**Final Scores:**
- Novelty: 4/5 (было 3/5 → improved)
- Resonance: 5/5 (было 4/5 → improved)
- Final AI-Slop: 5/5 (100% human ✅✅)

**Word count:**
- Draft: 1,200 words
- Final: 1,450 words
```

---

## Usage in Workflows

### Workflow начинается:

**Step 1: Check if file exists**

```bash
# Glob pattern for markdown files in current directory
Glob: writing-session-*.md

# Get current directory
pwd
```

**Step 2: Decision**

```
IF file exists:
  ├─ Load existing file (Read tool)
  ├─ Extract last status
  └─ Append new section

ELSE:
  ├─ Get current timestamp
  ├─ Create new file: writing-session-{timestamp}.md
  ├─ Write header
  └─ Write first section
```

**Step 3: Append pattern**

```markdown
## Этап N: {Workflow Name}

{Content}

---
```

**ВАЖНО:** ВСЕГДА append, НИКОГДА не overwrite!

---

### Header Template:

```markdown
# Writing Session: {Topic extracted from idea}

**Создано:** {ISO 8601 timestamp}
**Статус:** idea
**Последнее обновление:** {ISO 8601 timestamp}

---
```

**Поля:**
- `Topic` - извлекается из идеи пользователя
- `Создано` - timestamp создания файла
- `Статус` - текущий этап (idea | intro | testing | drafting | rewriting | polishing | complete)
- `Последнее обновление` - обновляется при каждом append

---

### Section Templates by Workflow:

#### Workflow 1: Generate Idea

```markdown
## Этап 1: Генерация идеи

### Исходная идея
{user input}

### Research Results
{queries + findings + gap}

### Оценка (0-5)
{novelty + resonance with reasoning}

### Предложения улучшений
{concrete suggestions}

### Финальная идея (refined)
{refined idea}

---
```

---

#### Workflow 2: Write Intro

```markdown
## Этап 2: Написание Intro

### Вариант 1: {Hook Type} - Оценка: {score}/5

**Текст:**
{intro text}

**Scoring:**
- Hook Strength: {score}/5 - {reasoning}
- Clarity: {score}/5 - {reasoning}
- AI-Slop: {score}/5 - {reasoning}

**AI-Slop Check:**
- Detected: {patterns or None}
- Score: {score}/5
- Notes: {observations}

---

### Вариант 2: {Hook Type} - Оценка: {score}/5

[Same structure]

---

### Вариант 3: {Hook Type} - Оценка: {score}/5

[Same structure]

---

### Выбранный вариант

**Вариант {N}** ({Hook Type}) - {score}/5

**Причина выбора:**
{why this one}

---
```

---

#### Workflow 3: Test with Personas

```markdown
## Этап 3: Тестирование с AI-персонами

### Созданы 3 персоны
{personas descriptions}

### Stream of Consciousness
{each persona's reading}

### Aggregate Results
- Score: {0-100}
- Recommendation: {proceed|revise|rethink}

---
```

---

#### Workflow 4-6:

```markdown
## Этап {N}: {Workflow Name}

{Content specific to workflow}

**AI-Slop Check:**
- Score: {0-5}
- Detected: {patterns}
- Fixes applied: {list}

---
```

---

### State Sync:

После каждого append, обновить state JSON:

```json
{
  "article": {
    ...
    "markdown_export": {
      "file_path": "/full/path/to/writing-session-2025-11-26-143022.md",
      "created_at": "2025-11-26T14:30:00Z",
      "last_updated": "2025-11-26T14:35:00Z",
      "sections_written": ["idea", "intro"],
      "sync_status": "synced"
    }
  }
}
```

**Поля:**
- `file_path` - полный путь к MD файлу
- `created_at` - когда файл создан
- `last_updated` - последний append
- `sections_written` - какие секции уже записаны
- `sync_status`: "synced" | "pending" | "error"

---

## Error Handling:

### Error 1: File not writable (permissions)

**Fallback:**
```
TRY:
  Write to current directory

CATCH PermissionError:
  Fallback location: ~/.claude/skills/writing-content/state/
  Notify user: "Не могу писать в {pwd}, сохраняю в state/"
```

---

### Error 2: File deleted mid-session

**Recovery:**
```
IF file not found:
  Recreate from state JSON
  Restore all sections from state.article
  Resume from current workflow
  Notify user: "Файл восстановлен из state"
```

---

### Error 3: Disk full

**Handling:**
```
CATCH DiskFullError:
  Save only to state JSON
  Mark markdown_export.sync_status = "error"
  Notify user: "Нет места на диске. Прогресс в state JSON."
```

---

### Error 4: Multiple sessions simultaneously

**Prevention:**
```
Each session = unique filename (timestamp)
No conflicts possible
User может запустить несколько сессий параллельно
```

---

## Best Practices:

### DO:
✅ Всегда append (никогда не overwrite)
✅ Структурируй по этапам (## Этап N)
✅ Сохраняй ВСЕ промежуточные результаты
✅ Обновляй sync status в state JSON
✅ Используй timestamps в header

### DON'T:
❌ Не перезаписывай файл
❌ Не пропускай sections
❌ Не забывай обновлять "Последнее обновление"
❌ Не сохраняй только финальную версию (нужны все intermediate steps)
❌ Не полагайся только на MD (state JSON = source of truth)

---

## Integration Examples:

### Example 1: First workflow (Idea)

```python
# Pseudo-code
current_dir = get_current_directory()
files = glob(f"{current_dir}/writing-session-*.md")

if not files:
    # Create new file
    timestamp = get_timestamp()  # 2025-11-26-143022
    filename = f"writing-session-{timestamp}.md"

    content = generate_header(topic="Email Marketing")
    content += generate_idea_section(idea_data)

    write_file(filename, content)

    update_state({
        "markdown_export": {
            "file_path": f"{current_dir}/{filename}",
            "created_at": timestamp,
            "sections_written": ["idea"]
        }
    })
else:
    # File exists, will append in next workflow
    pass
```

---

### Example 2: Subsequent workflow (Intro)

```python
# Pseudo-code
current_dir = get_current_directory()
files = glob(f"{current_dir}/writing-session-*.md")

if files:
    # Get most recent file
    latest_file = sorted(files)[-1]

    # Read existing content
    existing = read_file(latest_file)

    # Append new section
    new_section = generate_intro_section(intro_data)

    append_to_file(latest_file, new_section)

    # Update state
    update_state({
        "markdown_export": {
            "last_updated": get_timestamp(),
            "sections_written": ["idea", "intro"]  # Add "intro"
        }
    })
```

---

## Testing:

### Test 1: Create new file

```bash
# Expected behavior
1. Check pwd
2. No writing-session-*.md found
3. Create writing-session-2025-11-26-143022.md
4. Write header + first section
5. Update state JSON
```

---

### Test 2: Append to existing

```bash
# Expected behavior
1. Find writing-session-2025-11-26-143022.md
2. Read existing content
3. Append ## Этап 2: ...
4. Update state JSON (sections_written, last_updated)
```

---

### Test 3: Recovery from deletion

```bash
# Scenario: User deleted MD file
1. Check for file
2. Not found
3. Read state JSON
4. Recreate file from state.article
5. Resume
```

---

**Последнее обновление:** 2025-11-26
