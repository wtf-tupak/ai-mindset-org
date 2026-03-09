# State Management - Описание структуры

## Назначение

Этот файл описывает структуру state для writing-content skill, хранящуюся в `current-article.json`.

State управляет всеми данными article workflow от идеи до финальной публикации.

---

## Структура полей

### Root Level

```json
{
  "id": "uuid or custom identifier",
  "created": "ISO timestamp when article workflow started",
  "updated": "ISO timestamp of last update",
  "status": "empty | idea | intro | testing | drafting | rewriting | polishing | complete"
}
```

---

## Секция: `idea`

### Базовые поля (существующие):

- **rawIdea**: Исходная идея от пользователя
- **refinedIdea**: Отредактированная идея после анализа
- **audience**: Целевая аудитория
- **problem**: Проблема которую решает статья
- **insight**: Ключевой инсайт
- **noveltyTypes**: Типы новизны (array)
- **noveltyScore**: Оценка новизны (legacy, 0-10)
- **validated**: Boolean флаг валидации

### Новые поля (v2):

#### `research` (object)

Research результаты для валидации идеи:

```json
"research": {
  "method": "perplexity | websearch",
  "queries": ["query 1", "query 2", "query 3"],
  "summary": "Краткое резюме findings",
  "gap_identified": "Описание gap который мы нашли в существующем контенте",
  "timestamp": "ISO timestamp"
}
```

**Когда заполняется:** Workflow 1 (Generate Idea) после research step

**Назначение:** Перед тем как оценивать идею, нужно провести research чтобы:
- Понять что уже есть на эту тему
- Найти gap (то чего нет или освещено плохо)
- Обосновать новизну фактами

---

#### `scoring` (object)

Оценка идеи по шкале 0-5 вместо binary yes/no:

```json
"scoring": {
  "novelty": {
    "score": 0-5,
    "reasoning": "Почему такая оценка (2-3 предложения с конкретикой)",
    "evidence": "Конкретные примеры из research или текста",
    "improvement": "Как улучшить до 4-5/5 (actionable suggestions)"
  },
  "resonance": {
    "score": 0-5,
    "reasoning": "...",
    "evidence": "...",
    "improvement": "..."
  },
  "overall_recommendation": "proceed | revise | rethink"
}
```

**Когда заполняется:** Workflow 1 после research

**Критерии оценки:** Подробные описания каждого уровня 0-5 в `references/scoring-criteria.md`

**Thresholds:**
- Оба параметра >= 4 → STRONG PROCEED (отличная идея)
- Оба >= 3 → PROCEED (хорошая идея)
- Один < 3 → REVISE (доработать слабый параметр)
- Оба < 3 → RETHINK (нужна новая идея)

**Назначение:**
- Честная критическая оценка идеи
- Конкретные рекомендации по улучшению
- Прогресс tracking (3 → 4 → 5 после revisions)

---

## Секция: `intro`

### Структура изменена с одного варианта на 3 (v2):

**Старая структура (v1):**
```json
"intro": {
  "hook": "...",
  "hookType": "...",
  "fullIntro": "...",
  "version": 1,
  "qualityCheck": {...}
}
```

**Новая структура (v2):**
```json
"intro": {
  "variants": [
    {
      "number": 1,
      "hookType": "question | narrative | research | argument",
      "hook": "Первая строка hook",
      "fullIntro": "Полный intro текст",
      "scoring": {
        "hook_strength": {
          "score": 0-5,
          "reasoning": "...",
          "evidence": "...",
          "improvement": "..."
        },
        "clarity": {
          "score": 0-5,
          "reasoning": "...",
          "evidence": "...",
          "improvement": "..."
        },
        "ai_slop_score": {
          "score": 0-5,
          "reasoning": "...",
          "evidence": "...",
          "improvement": "..."
        },
        "overall": "(hook_strength + clarity + ai_slop_score) / 3"
      },
      "createdAt": "ISO timestamp"
    },
    {...variant 2},
    {...variant 3}
  ],
  "selected_variant": 1 | 2 | 3 | null,
  "version": 2
}
```

**Когда заполняется:** Workflow 2 (Write Intro)

**Назначение:**
- Генерировать 3 разных варианта intro с разными hook types
- Оценивать каждый вариант по 3 критериям (0-5 scale)
- Позволить пользователю выбрать лучший вариант (или Claude рекомендует)

**Threshold:**
- Overall >= 3.5 для каждого варианта
- AI-Slop >= 4 (critical - должен звучать по-человечески)

---

## Секция: `persona_test_results`

Без изменений в v2. Используется для Workflow 3 (Test Intro with Personas).

---

## Секция: `article`

### Новые поля (v2):

#### `markdown_export` (object)

Tracking markdown файла для экспорта всех промежуточных результатов:

```json
"markdown_export": {
  "file_path": "/absolute/path/to/writing-session-YYYY-MM-DD-HHMMSS.md",
  "created_at": "ISO timestamp когда создан файл",
  "last_updated": "ISO timestamp последнего append",
  "sections_written": ["idea", "intro", "testing", "drafting", "rewriting", "polishing"],
  "sync_status": "not_started | in_progress | synced | error"
}
```

**Когда заполняется:**
- `file_path`, `created_at`: Workflow 1 (при первом экспорте)
- `last_updated`, `sections_written`: Каждый workflow при добавлении секции
- `sync_status`: Обновляется после каждого markdown append

**Назначение:**
- Сохранять ВСЕ промежуточные результаты в markdown файл (human-readable)
- Прогрессивное наполнение файла по мере прохождения workflows
- Синхронизация JSON state ↔ Markdown file
- Пользователь может видеть процесс в одном файле

**Файл создаётся в:** Current working directory (pwd)

**Naming convention:** `writing-session-{YYYY-MM-DD-HHMMSS}.md`

**Структура markdown файла:** См. `tools/markdown-exporter.md`

---

## Секция: `visual`

Без изменений в v2. Используется для Workflow 7 (Create Visual).

---

## Workflow Integration

### Workflow 1: Generate Idea

**Обновляет:**
- `idea.rawIdea`
- `idea.research` (NEW)
- `idea.scoring` (NEW)
- `idea.refinedIdea`
- `article.markdown_export` (NEW - создание файла)

**Действия:**
1. Сохраняет rawIdea
2. Делает research (Perplexity → WebSearch fallback)
3. Оценивает по scoring system 0-5 (novelty + resonance)
4. Предлагает improvements
5. Сохраняет refined идею
6. Экспортирует в markdown файл секцию "Idea"

---

### Workflow 2: Write Intro

**Обновляет:**
- `intro.variants[]` (NEW - 3 варианта)
- `intro.selected_variant` (NEW)
- `article.markdown_export.sections_written` (добавляет "intro")

**Действия:**
1. Загружает hooks database (`references/hooks-database.md`)
2. Генерирует 3 варианта intro (разные hook types)
3. Оценивает каждый вариант:
   - hook_strength (0-5)
   - clarity (0-5)
   - ai_slop_score (0-5) - используя `tools/anti-ai-detector.md`
4. Вычисляет overall score для каждого
5. Рекомендует лучший вариант
6. Экспортирует все 3 варианта в markdown файл секцию "Intro"

---

### Workflow 3: Test Intro

**Обновляет:**
- `persona_test_results.*`
- `article.markdown_export.sections_written` (добавляет "testing")

**Действия:**
1. Тестирует выбранный intro на personas
2. Экспортирует результаты в markdown секцию "Testing"

---

### Workflow 4: Write Full Article

**Обновляет:**
- `article.draft`
- `article.sections`
- `article.wordCount`
- `article.markdown_export.sections_written` (добавляет "drafting")

**Действия:**
1. Генерирует article draft
2. **AI-Slop Check** (NEW) - проверяет draft на AI паттерны
3. Применяет фиксы если нужно
4. Экспортирует draft в markdown секцию "Drafting"

---

### Workflow 5: Rewrite for Clarity

**Обновляет:**
- `article.rewritten`
- `article.rewritingStats.*`
- `article.markdown_export.sections_written` (добавляет "rewriting")

**Действия:**
1. Rewrite для улучшения clarity
2. **AI-Slop Check** (NEW) - проверяет что rewrite не сделал текст MORE AI-like
3. Экспортирует rewritten версию в markdown секцию "Rewriting"

---

### Workflow 6: Style & Polish

**Обновляет:**
- `article.final`
- `article.aiSlopFixes.*`
- `article.styleImprovements.*`
- `article.markdown_export.sections_written` (добавляет "polishing")

**Действия:**
1. **Усиленный AI-Slop Check** (NEW) - threshold >= 4/5 mandatory
2. Применяет style improvements
3. Финализирует статью
4. Экспортирует final version в markdown секцию "Polishing"

---

### Workflow 7: Create Visual

**Обновляет:**
- `visual.*`
- `article.markdown_export.sync_status` (финализация)

**Действия:**
1. Создаёт visual
2. Финализирует markdown экспорт (все секции завершены)

---

## Best Practices

### Для workflows:

1. **Всегда обновляй state после каждого шага** (не в конце workflow, а сразу)
2. **Синхронизируй markdown файл** после каждого обновления state
3. **Используй ISO timestamps** для всех временных полей
4. **Сохраняй intermediate results** - не только финальные, но и промежуточные варианты
5. **Проверяй ai_slop_score** на всех этапах где генерируется текст

### Для markdown export:

1. **Check-Create-Append логика:**
   - Проверь существует ли файл
   - Если нет → создай с header
   - Если есть → append новую секцию
2. **Не перезаписывай** - только append
3. **Синхронизируй sync_status** в state после каждого append
4. **Handle errors** - если markdown append failed, state должен знать об этом

---

## Versioning

- **v1**: Исходная структура (binary evaluation, single intro variant, no markdown export)
- **v2**: Текущая версия (scoring 0-5, 3 intro variants, research, markdown export)

`intro.version` field указывает на версию intro структуры:
- `version: 1` = старая структура (legacy)
- `version: 2` = новая структура (3 варианта + scoring)

При миграции с v1 → v2 workflows должны проверять `intro.version` и адаптироваться.

---

**Последнее обновление:** 2025-11-26
**Версия state:** 2.0
