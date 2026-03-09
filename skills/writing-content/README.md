# Julian Shapiro AI Writer

**Интерактивный фреймворк для написания текстов в Claude Code на основе методологии Julian Shapiro**

![Version](https://img.shields.io/badge/version-2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Что это

Скилл для Claude Code, который превращает идеи в качественный контент через 7 последовательных воркфлоу. Основан на фреймворке **Качество = Новизна × Резонанс** от Julian Shapiro.

**Ключевые фичи:**
- Research & Gap Analysis (Perplexity/WebSearch)
- Система оценки 0-5 для идей и текстов
- 3 варианта intro с разными типами хуков
- AI-Slop Detection (10 паттернов AI-подобного текста)
- AI-Persona тестирование (мгновенная валидация на 3 типах читателей)
- Автосохранение в JSON + Markdown

---

## Установка

```bash
cd ~/.claude/skills/
git clone https://github.com/Diffuzmetall/julian-shapiro-ai-writer.git writing-content
```

## Использование

Просто скажи Claude:

```
"напиши статью про [тема]"
"улучши текст"
"продолжить статью"
```

Claude автоматически проведёт через воркфлоу:

```
1. Генерация идеи → Research → Оценка новизны/резонанса
2. Написание 3 вариантов intro → Выбор лучшего
3. AI-Persona тестирование → Фидбек от 3 архетипов
4. Полная статья → Outline + драфт
5. Переписывание → Ясность + краткость + интрига
6. Полировка → Голос + живость + стиль
7. Визуал (опционально) → Через art skill
```

---

## Фреймворк

### Новизна (5 типов)
1. **Counter-intuitive** — против интуиции
2. **Counter-narrative** — против популярного мнения
3. **Shock and awe** — неожиданные факты
4. **Elegant articulation** — красиво сформулированный инсайт
5. **Make feel seen** — "ты описал что я чувствую"

### Резонанс
- Истории вместо абстракций
- Аналогии для сложного
- Конкретные примеры
- Аутентичный голос

---

## AI-Slop Detection

Обнаруживает 10 паттернов AI-текста:
- Слова-маркеры ("delve into", "meticulous", "realm")
- Идеальная структура (всё по три)
- Безликий тон
- Contrast framing ("While X, Y is also true")
- Present-ing глаголы
- Фальшивый энтузиазм

**Порог:** ≥4/5 обязателен для всех воркфлоу.

---

## Структура

```
workflows/         # 7 воркфлоу (1-generate-idea → 7-generate-visual)
tools/             # Scoring, AI-Slop detector, markdown exporter
references/        # Hooks database, AI patterns, criteria
state/             # JSON state + Markdown export
documentation/     # Changelog, schema, validation
```

---

## Пример работы

```
Вы: "Хочу написать про email-маркетинг"

Claude:
  → Вопросы (аудитория, проблема, инсайт)
  → Research: "Никто не объясняет почему первая строка важнее subject"
  → Оценка: Новизна 4/5, Резонанс 5/5 → PROCEED
  → 3 intro варианта → Выбираете лучший
  → AI-персоны: 78% → PROCEED
  → Полная статья → Переписывание → Полировка
  → Результат: writing-session-2025-11-27.md
```

---

## Благодарности

- **Julian Shapiro** — [Writing Handbook](https://www.julian.com/guide/write/)
- **Claude Code** — [PAI Skills System](https://github.com/anthropics/claude-code)

---

## Лицензия

MIT

---

**Готовы писать?** `"напиши статью"` или `"write an article"`
