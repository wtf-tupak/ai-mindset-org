# Workflow 7: Generate Visual

**Purpose:** Создать визуал для статьи через интеграцию с art skill

**When to Use:**
- Статья завершена (после workflow 6)
- Нужна иллюстрация/диаграмма к статье
- Хочешь визуально усилить ключевую концепцию

**Prerequisites:**
- State файл с финальной статьёй
- Art skill доступен
- Понимание какой тип визуала нужен

---

## Workflow Steps

### Step 1: Ask if Visual is Needed

**Description:** Спроси нужен ли визуал (это опциональный этап)

**Actions:**

```
Статья готова! 🎉

Хочешь создать визуал для статьи?

Визуал может:
- Проиллюстрировать ключевую концепцию
- Сделать статью более shareableв соцсетях
- Добавить visual break в длинном тексте

OPTIONS:
- "Да, создать визуал" → продолжаем
- "Нет, пропустить" → сохраняем статью и завершаем
```

**IF "Нет":**
```
✅ Отлично! Статья завершена и сохранена.

📄 Финальная статья готова к публикации!
🎨 Без AI-slop
✅ Human voice

Успехов с публикацией! 🚀
```

**IF "Да" → продолжаем**

**Expected Outcome:** Решение создавать или пропустить визуал

---

### Step 2: Analyze Article for Visual Opportunities

**Description:** Проанализируй статью и найди что визуализировать

**Actions:**

```
Отлично! Давай создадим визуал.

Анализирую статью...

КЛЮЧЕВЫЕ КОНЦЕПЦИИ:
1. [Main concept from idea]
2. [Core framework/process if present]
3. [Key insight/novelty]

Что будем визуализировать?
OPTIONS:
- "Концепция 1: [...]"
- "Концепция 2: [...]"
- "Процесс/фреймворк"
- "Свой вариант: ..."
```

**Expected Outcome:** Выбрана концепция для визуализации

---

### Step 3: Choose Visual Type

**Description:** Определи какой тип визуала подходит

**Actions:**

Предложи типы визуалов:

```
Какой тип визуала подойдёт для "[chosen concept]"?

1️⃣ EDITORIAL ILLUSTRATION — Концептуальная иллюстрация
   Когда: Нужна метафора или абстрактная концепция
   Пример: "AI как коллега, а не замена" → иллюстрация человека + AI

2️⃣ TECHNICAL DIAGRAM — Блок-схема или flowchart
   Когда: Есть процесс или последовательность шагов
   Пример: "The Pipeline: идея → intro → test → статья"

3️⃣ MERMAID DIAGRAM — Excalidraw-style диаграмма
   Когда: Нужна структура или взаимосвязи
   Пример: "Как связаны novelty × resonance"

4️⃣ VISUAL TAXONOMY — Категоризация или таксономия
   Когда: Есть типы/виды чего-то
   Пример: "5 типов novelty"

5️⃣ FRAMEWORK VISUALIZATION — Визуализация фреймворка
   Когда: Есть фреймворк или модель
   Пример: "Writing Quality = Novelty × Resonance"

6️⃣ COMPARISON — Сравнение до/после или разных подходов
   Когда: Показываешь контраст или трансформацию
   Пример: "С AI vs Без AI"

7️⃣ TIMELINE — Временная последовательность
   Когда: Есть этапы или эволюция
   Пример: "Эволюция маркетинга: 2010 → 2020 → 2025"

Какой тип выбираешь?
```

**Expected Outcome:** Тип визуала выбран

---

### Step 4: Prepare Context for Art Skill

**Description:** Собери всю информацию для передачи в art skill

**Actions:**

Подготовь контекст:

```json
{
  "article_context": {
    "title": "[article title]",
    "main_idea": "[refined idea from state]",
    "key_concept_to_visualize": "[chosen concept]",
    "target_audience": "[audience from state]",
    "tone": "[tone of article]",
    "novelty_type": "[novelty types from state]"
  },
  "visual_request": {
    "type": "[chosen visual type]",
    "purpose": "Illustrate [concept] for [audience]",
    "style_preference": "Clean, modern, professional"
  }
}
```

Покажи пользователю:
```
Готовлю контекст для art skill...

━━━━━━━━━━━━━━━━━
ЧТО ВИЗУАЛИЗИРУЕМ:
Концепция: [concept]
Тип: [visual type]
Для кого: [audience]
━━━━━━━━━━━━━━━━━

Сейчас активирую art skill...
```

**Expected Outcome:** Контекст подготовлен

---

### Step 5: Activate Art Skill

**Description:** Передай контекст в art skill и запусти генерацию

**Actions:**

**Call art skill:**

```
USE SKILL: art

ПЕРЕДАВАЕМЫЙ КОНТЕКСТ:

Задача: Создать [visual type] для статьи

Статья про: [main idea]

Ключевая концепция для визуализации:
[chosen concept]

Аудитория: [target audience]

Tone & Style:
- [article tone]
- Clean, professional
- Modern

Дополнительный контекст:
[Any specific details from article]

Что должен показать визуал:
[Describe what the visual should communicate]
```

**Art skill will:**
1. Помочь уточнить формат
2. Создать промпт для визуала
3. Сгенерировать изображение (или дать инструкции)
4. Вернуть результат

**Expected Outcome:** Art skill возвращает визуал или промпт

---

### Step 6: Review and Save Visual

**Description:** Проверь визуал и сохрани результат

**Actions:**

**Show result from art skill:**

```
✅ Визуал создан!

━━━━━━━━━━━━━━━━━
[Показать визуал если возможно, или описание]

Type: [visual type]
Concept: [concept visualized]
━━━━━━━━━━━━━━━━━

Что скажешь?
OPTIONS:
- "Отлично, сохранить" → сохраняем
- "Переделать" → уточни что изменить
- "Создать другой тип" → возвращаемся к Step 3
```

**IF "Отлично":**

Сохрани в state:
```json
{
  "visual": {
    "requested": true,
    "type": "[visual type]",
    "concept": "[visualized concept]",
    "prompt": "[prompt used]",
    "image_url": "[path or URL if available]",
    "alt_text": "[accessibility description]",
    "created_via": "art skill",
    "createdAt": "timestamp"
  }
}
```

Сообщи:
```
✅ Визуал сохранён!

📄 Статья: Готова ✅
🎨 Визуал: Создан ✅
❌ AI-Slop: Убран ✅

Всё готово к публикации! 🎉
```

**Expected Outcome:** Визуал сохранён в state

---

### Step 7: Final Summary

**Description:** Покажи полный результат работы

**Actions:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 WORK COMPLETED! СТАТЬЯ ГОТОВА К ПУБЛИКАЦИИ

📊 ЧТО СДЕЛАЛИ:

✅ Идея: Валидирована по 5 типам novelty
✅ Intro: Протестирован на 3 AI-персонах ([score]%)
✅ Статья: Написана ([word_count] слов)
✅ Rewriting: Clarity + succinctness + intrigue
✅ Style: Authentic voice, без AI-slop
✅ Визуал: [visual type] создан

━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 МЕТРИКИ:

AI-Slop Fixes: [total] patterns исправлено
Word Count: [count] слов
Dopamine Hits: [count]
Persona Test Score: [score]%

━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 ФАЙЛЫ:

State: ~/.claude/skills/writing-content/state/current-article.json
Визуал: [path if saved]

━━━━━━━━━━━━━━━━━━━━━━━━━━

Готов публиковать! 🚀

Хочешь:
- "Показать финальную статью"
- "Показать все версии (intro → draft → rewritten → final)"
- "Начать новую статью" → очистить state и вернуться к workflow 1
```

**Expected Outcome:** Полный summary работы показан

---

## Outputs

**What this workflow produces:**
- **Visual asset** — Иллюстрация/диаграмма для статьи
- **Visual metadata** — Тип, концепция, alt text
- **Complete package** — Статья + визуал готовы к публикации

**Where outputs are stored:**
- `~/.claude/skills/writing-content/state/current-article.json` (visual metadata)
- Visual file: [зависит от art skill output]

---

## Integration with Art Skill

### How It Works

1. **Context Transfer** — Передаём art skill:
   - Article title & main idea
   - Key concept to visualize
   - Target audience
   - Tone & style preferences

2. **Art Skill Processing** — Art skill:
   - Определяет лучший формат
   - Создаёт промпт
   - Генерирует визуал
   - Возвращает результат

3. **Result Integration** — Мы:
   - Получаем визуал от art skill
   - Сохраняем в state
   - Связываем со статьёй

### Visual Types Mapping

**Art skill supports:**
- Editorial illustrations → `art skill: visualize editorial`
- Technical diagrams → `art skill: technical diagram`
- Mermaid diagrams → `art skill: mermaid`
- Visual taxonomies → `art skill: taxonomy`
- Frameworks → `art skill: framework`
- Comparisons → `art skill: comparison`
- Timelines → `art skill: timeline`

---

## Related Workflows

- **6-style-polish.md** — Предыдущий шаг (финальная статья)
- **1-generate-idea.md** — Начать новую статью

---

## Examples

### Example 1: Editorial Illustration for Counter-Intuitive Concept

**Input:**
```
Article: "AI не заменит маркетологов — наоборот, сделает их незаменимыми"
Concept: AI как усилитель человека, не замена
Visual type: Editorial illustration
```

**Process:**
```
USER: "Да, создать визуал"
CLAUDE: "Что визуализировать?"
USER: "Концепцию что AI — это усилитель"

CLAUDE: "Тип визуала?"
USER: "Editorial illustration"

CLAUDE: [Активирует art skill]

ART SKILL:
Creates: Illustration of human with AI-powered tools/armor
Style: Modern, clean, empowering
Colors: Warm + tech blue accents

RESULT: Illustration saved with alt text
```

**Output:**
```
Visual created:
Type: Editorial illustration
Concept: "AI as human amplifier"
Alt text: "Illustration showing a marketer with AI-powered tools, representing augmentation not replacement"
```

---

### Example 2: Framework Visualization

**Input:**
```
Article: "Как писать контент который читают: Novelty × Resonance"
Concept: Writing Quality formula
Visual type: Framework visualization
```

**Process:**
```
CLAUDE: [Активирует art skill]

ART SKILL creates visualization:

┌─────────────────────────────────┐
│  WRITING QUALITY FORMULA        │
├─────────────────────────────────┤
│                                 │
│  Novelty × Resonance = Quality │
│                                 │
│  Novelty:                       │
│  • Counter-intuitive            │
│  • Counter-narrative            │
│  • Shock & Awe                  │
│                                 │
│  Resonance:                     │
│  • Stories                      │
│  • Analogies                    │
│  • Examples                     │
│                                 │
└─────────────────────────────────┘

RESULT: Framework diagram saved
```

---

### Example 3: Technical Diagram (Process Flow)

**Input:**
```
Article: "The Pipeline: от идеи до публикации за 2 часа"
Concept: The 7-step pipeline
Visual type: Technical diagram
```

**Process:**
```
ART SKILL creates Mermaid diagram:

graph LR
    A[Идея] --> B[Intro]
    B --> C[Тест на персонах]
    C --> D{Score > 70%?}
    D -->|Да| E[Полная статья]
    D -->|Нет| B
    E --> F[Rewriting]
    F --> G[Style Polish]
    G --> H[Публикация]

RESULT: Flowchart diagram saved
```

---

## Quality Checklist

Before finalizing visual:

- [ ] Visual illustrates chosen concept clearly
- [ ] Style matches article tone
- [ ] Appropriate for target audience
- [ ] Has alt text for accessibility
- [ ] Saved with metadata in state
- [ ] User approved visual
- [ ] Linked to article in state file

---

**Last Updated:** 2025-11-25
