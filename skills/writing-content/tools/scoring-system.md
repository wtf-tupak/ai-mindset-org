# Scoring System - Система оценок 0-5

## Purpose

Единая система оценки идей, intro, текстов по шкале 0-5 вместо бинарного да/нет.

**Почему 0-5 вместо да/нет:**
- Нюансированная обратная связь
- Видно насколько хорошо/плохо
- Конкретные рекомендации по улучшению
- Прогресс tracking (3→4→5)

---

## Usage

### Load criteria:

```markdown
READ: ~/.claude/skills/writing-content/references/scoring-criteria.md
```

Этот файл содержит детальные описания каждого уровня (0-5) для каждого критерия с примерами.

---

### Score format:

```json
{
  "criterion_name": {
    "score": 0-5,
    "reasoning": "Почему такая оценка (2-3 предложения с конкретикой)",
    "evidence": "Конкретные примеры из текста или research",
    "improvement": "Как улучшить до 4-5/5 (конкретные действия)"
  }
}
```

**Поля обязательны ВСЕ:**
- `score` - число 0-5
- `reasoning` - объяснение (не менее 2 предложений)
- `evidence` - факты, данные, цитаты
- `improvement` - actionable recommendations

---

## Workflows где используется:

### Workflow 1 (Generate Idea):

**Критерии:**
- Novelty (новизна идеи)
- Resonance (резонанс с аудиторией)

**Пример оценки:**

```json
{
  "novelty": {
    "score": 3,
    "reasoning": "Идея встречается в контенте, но предлагаемый угол свежий. Есть 10+ статей на похожую тему, но никто не акцентирует внимание на этой конкретной перспективе.",
    "evidence": "Perplexity search показал: 12 статей про 'email subject lines', 0 статей про 'email body first line importance'. Gap identified.",
    "improvement": "Добавить counter-intuitive элемент: сформулировать как 'Subject line это миф — первая строка body решает всё'. Усилит новизну до 4/5."
  },
  "resonance": {
    "score": 4,
    "reasoning": "Сильный резонанс с целевой аудиторией (B2B маркетеры). Они все сталкиваются с проблемой низкой конверсии email в реальное чтение.",
    "evidence": "Решает их главную боль: 'открывают email, но не читают'. Это болит каждому email-маркетеру.",
    "improvement": "Добавить личную историю в начале для эмоциональной связи. Например: 'Вчера отправил 100 email, открыли 40, прочитали 5.' Поднимет до 5/5."
  }
}
```

**Threshold для Workflow 1:**
- Оба >= 3 → **PROCEED**
- Оба >= 4 → **STRONG PROCEED**
- Любой < 3 → **REVISE or RETHINK**

---

### Workflow 2 (Write Intro) - для каждого из 3 вариантов:

**Критерии:**
- Hook Strength (сила хука)
- Clarity (ясность)
- AI-Slop Score (человечность)

**Пример оценки (для одного варианта):**

```json
{
  "variant_1": {
    "hook_strength": {
      "score": 4,
      "reasoning": "Question hook эффективно вызывает любопытство. Прямо бьёт в боль аудитории — открывают но не читают.",
      "evidence": "Вопрос 'Почему люди открывают email но не читают?' релевантен для 90%+ B2B маркетеров.",
      "improvement": "Добавить конкретную статистику в вопрос: 'Почему 40% открывают ваш email, но только 5% читают?' Усилит до 5/5."
    },
    "clarity": {
      "score": 5,
      "reasoning": "Простой язык без жаргона. Логика понятна 13-летнему. Конкретные примеры вместо абстракций.",
      "evidence": "Нет сложных терминов. Короткие предложения. Используются простые слова (открывают, читают, проблема).",
      "improvement": "N/A - уже 5/5, clarity идеальная"
    },
    "ai_slop_score": {
      "score": 3,
      "reasoning": "Есть AI паттерны которые снижают человечность. Формальность присутствует.",
      "evidence": "Detected: 'it's important to note' (2 раза), нет сокращений (it is вместо it's), безликий тон (нет 'я'/'мы').",
      "improvement": "Убрать 'it's important to note', добавить сокращения (it's, don't), добавить личный голос ('Я тратил час на subject lines...'). Поднимет до 4/5."
    },
    "overall": 4.0
  }
}
```

**Threshold для Workflow 2:**
- Overall >= 3.5 для каждого варианта
- AI-Slop >= 4 (critical - должен звучать по-человечески)
- Если все 3 варианта < 3.5 overall → **regenerate**

---

### Workflow 6 (Final Check):

**Критерий:**
- AI-Slop Score (финальная проверка человечности)

**Threshold:**
- Score >= 4 → PASS
- Score < 4 → REWRITE проблемные части

---

## Принципы честной оценки:

### 1. Будь критичным

❌ **Не делай так:**
"Отличная идея! 5/5!"

✅ **Делай так:**
"Идея хорошая, но встречается часто. 3/5. Нужен более свежий угол."

**Правило:** Если плохо → скажи честно. Не завышай оценки. 2/5 это нормально если действительно слабо.

---

### 2. Обоснуй

❌ **Не делай так:**
```json
{
  "novelty": {
    "score": 2,
    "reasoning": "Плохо",
    "evidence": "Не нравится",
    "improvement": "Сделай лучше"
  }
}
```

✅ **Делай так:**
```json
{
  "novelty": {
    "score": 2,
    "reasoning": "Идея распространённая - есть 50+ статей на эту тему за последний год. Новый угол не обнаружен.",
    "evidence": "WebSearch показал: 'email subject lines tips' = 500+ результатов, большинство covering те же 10 техник",
    "improvement": "Вместо 'как писать subject lines' фокус на 'почему subject lines не работают' (counter-intuitive). Или найти gap: что НЕ освещено в существующих материалах."
  }
}
```

**Правило:**
- Reasoning минимум 2-3 предложения с деталями
- Evidence из текста/research/данных
- Не "плохо потому что плохо"

---

### 3. Помоги улучшить

❌ **Не делай так:**
```
"improvement": "Сделай лучше"
"improvement": "Улучши качество"
"improvement": "Добавь больше деталей"
```

✅ **Делай так:**
```
"improvement": "Добавь counter-intuitive угол: сформулируй как 'Subject line это миф email-маркетинга'. Поддержи данными: 'Исследование показало: открываемость 40%, read rate 5%'. Усилит новизну до 4/5."
```

**Правило:**
- Improvement всегда **actionable** (конкретные действия)
- Не "сделай лучше" - а "добавь X, убери Y, используй Z"
- Покажи КАК улучшить, не только ЧТО

---

### 4. Используй criteria reference

**Всегда загружай и сверяйся:**
```
READ: references/scoring-criteria.md
```

**Почему:**
- Примеры в criteria показывают что = 5/5, что = 2/5
- Консистентность оценок между разными сессиями
- Понимание нюансов каждого уровня

**Как использовать:**
1. Прочитай criteria для нужного параметра
2. Сравни текст с примерами каждого уровня
3. Определи closest match
4. Оцени

---

## Output format

### Для пользователя (human-readable):

```
📊 ОЦЕНКА ИДЕИ

Novelty: 3/5 ⚠️
├─ Идея встречается часто, но угол свежий
├─ Research: 10+ похожих статей, но gap найден
└─ Улучшение: Добавь counter-intuitive формулировку

Resonance: 4/5 ✅
├─ Сильный резонанс с B2B маркетерами
├─ Решает их главную боль (низкая конверсия email)
└─ Улучшение: Личная история → 5/5

РЕКОМЕНДАЦИЯ: PROCEED (обе оценки >= 3)
```

**Элементы:**
- Визуальная структура (├─, └─)
- Эмоджи индикаторы (⚠️, ✅, ❌)
- Краткие формулировки
- Финальная рекомендация

---

### Для state (JSON):

```json
{
  "scoring": {
    "timestamp": "2025-11-26T14:30:00Z",
    "novelty": {
      "score": 3,
      "reasoning": "...",
      "evidence": "...",
      "improvement": "..."
    },
    "resonance": {
      "score": 4,
      "reasoning": "...",
      "evidence": "...",
      "improvement": "..."
    },
    "overall_recommendation": "proceed"
  }
}
```

**Поля:**
- `timestamp` - когда оценено
- Все criteria с полной структурой
- `overall_recommendation`: "proceed" | "revise" | "rethink"

---

## Decision Logic

### Workflow 1 (Generate Idea):

```
IF novelty >= 4 AND resonance >= 4:
  → STRONG PROCEED (отличная идея, можно сразу писать)

ELSE IF novelty >= 3 AND resonance >= 3:
  → PROCEED (хорошая идея, можно продолжать)

ELSE IF novelty >= 3 OR resonance >= 3:
  → REVISE (один параметр слабый, доработать его)

ELSE:
  → RETHINK (оба параметра < 3, нужна новая идея)
```

---

### Workflow 2 (Write Intro):

```
FOR each variant (1, 2, 3):
  overall = (hook_strength + clarity + ai_slop_score) / 3

  IF overall < 3.5:
    → REGENERATE этот вариант

  IF ai_slop_score < 4:
    → REWRITE для улучшения человечности

AFTER all 3 variants:
  IF all 3 < 3.5:
    → REGENERATE все заново (что-то не так с подходом)

  ELSE:
    → SHOW all 3 to user с рекомендацией лучшего
```

---

### Workflow 6 (Final Check):

```
IF ai_slop_score >= 4:
  → PASS (можно финализировать)

ELSE IF ai_slop_score >= 3:
  → SUGGEST IMPROVEMENTS (показать detected patterns, предложить фиксы)

ELSE:
  → MANDATORY REWRITE (слишком AI-like, нужен rewrite)
```

---

## Examples

### Example 1: Хорошая идея (оба 4/5)

```json
{
  "novelty": {
    "score": 4,
    "reasoning": "Свежий counter-intuitive угол на известную тему. Большинство говорят про subject lines, никто не акцентирует body first line.",
    "evidence": "Research: 15 статей про subject lines optimization, 0 про body first line importance. Clear gap.",
    "improvement": "Добавить shocking статистику: '95% маркетеров фокусируются на subject line, игнорируя что решает первая строка body'. Усилит до 5/5."
  },
  "resonance": {
    "score": 4,
    "reasoning": "Прямое попадание в боль B2B email-маркетеров. Все сталкиваются с ситуацией 'открыли но не прочитали'.",
    "evidence": "Типичная ситуация: open rate 30-40%, но meetings booked < 2%. Боль острая и актуальная.",
    "improvement": "Начать с личной истории драмы: 'Потратил $5000 на A/B тестинг subject lines. Open rate вырос на 15%. Meetings booked? 0 изменений.' Эмоциональная связь → 5/5."
  }
}

RECOMMENDATION: STRONG PROCEED ✅✅
```

---

### Example 2: Средняя идея (один параметр слаб)

```json
{
  "novelty": {
    "score": 2,
    "reasoning": "Очень распространённая тема без нового угла. 'How to write email subject lines' - есть сотни материалов covering те же tips.",
    "evidence": "Google search: 500+ статей за 2024, большинство duplicate content (те же 10-15 техник).",
    "improvement": "Полностью сменить угол: вместо 'how to write' → 'why subject lines don't matter' (counter-intuitive). Или найти unexplored niche: 'subject lines для cold outreach to enterprise' (specific)."
  },
  "resonance": {
    "score": 4,
    "reasoning": "Тема релевантна для email-маркетеров, проблема острая.",
    "evidence": "Все маркетеры хотят улучшить email performance, subject lines - известная точка оптимизации.",
    "improvement": "N/A - resonance уже сильный."
  }
}

RECOMMENDATION: REVISE ⚠️ (novelty слишком низкая, нужен fresh angle)
```

---

### Example 3: Слабая идея (оба параметра < 3)

```json
{
  "novelty": {
    "score": 1,
    "reasoning": "Заезженная тема без какой-либо новизны. 'Email marketing is important' - это знают все, нет инсайта.",
    "evidence": "Тысячи статей говорят то же самое. Нет уникальной перспективы, нет данных, нет counter-intuitive элемента.",
    "improvement": "Нужна совершенно новая идея. Текущая не имеет ценности - слишком generic и obvious."
  },
  "resonance": {
    "score": 2,
    "reasoning": "Тема релевантна, но слишком широкая и obvious. Не вызывает 'это про меня!' реакции.",
    "evidence": "Маркетеры уже знают что email важен. Это не решает конкретную боль.",
    "improvement": "Фокус на specific pain point: не 'email важен', а 'почему ваши emails открывают но не читают' (острая боль)."
  }
}

RECOMMENDATION: RETHINK ❌ (оба < 3, нужна новая идея)
```

---

## Best Practices

### DO:
✅ Будь honest и critical
✅ Давай конкретные reasoning с evidence
✅ Предлагай actionable improvements
✅ Сверяйся с criteria reference
✅ Используй 0-5 range полностью (не только 3-5)

### DON'T:
❌ Не завышай оценки ("всё отлично 5/5")
❌ Не давай vague feedback ("плохо", "улучши")
❌ Не игнорируй evidence (оценка без фактов)
❌ Не бойся низких оценок (2/5 это ok если заслуженно)
❌ Не пропускай improvement suggestions

---

## Integration with workflows

Этот tool используется в:
- **Workflow 1:** `1-generate-idea.md` (novelty + resonance scoring)
- **Workflow 2:** `2-write-intro.md` (hook + clarity + AI-slop для 3 вариантов)
- **Workflow 6:** `6-style-polish.md` (final AI-slop check)

**При использовании:**
1. Загрузи этот tool: `READ: tools/scoring-system.md`
2. Загрузи criteria: `READ: references/scoring-criteria.md`
3. Примени scoring к тексту/идее
4. Выведи результат в обоих форматах (human + JSON)
5. Сохрани в state

---

**Последнее обновление:** 2025-11-26
