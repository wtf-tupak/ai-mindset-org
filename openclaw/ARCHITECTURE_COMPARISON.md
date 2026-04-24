# GitHub Issues Integration — Comparison

## 🔴 Наша текущая схема (не работает полностью)

```
GitHub Issue Event (issues.opened/closed)
    ↓
    ❌ Webhook не настроен (нет публичного URL)
    ↓
    ⏸️  Событие не доходит до OpenClaw
    ↓
OpenClaw Bot (localhost:3000)
    ├─ Webhook endpoint готов: /webhook/github
    ├─ Handler готов: github-webhook-handler.js
    └─ ❌ Не получает события от GitHub
```

**Проблема:** GitHub не может достучаться до localhost:3000

---

## 🟢 Схема автора воркшопа (работает)

```
GitHub Issue Event (issues.opened/closed)
    ↓
GitHub Actions Workflow (.github/workflows/telegram-notify.yml)
    ├─ Триггер: on: issues (opened, closed, reopened)
    ├─ Читает: $GITHUB_EVENT_PATH (payload события)
    ├─ Формирует HTML-сообщение
    └─ Отправляет через Telegram Bot API
        ↓
Telegram Bot API
    ├─ TELEGRAM_BOT_TOKEN (из secrets)
    ├─ TELEGRAM_CHAT_ID=-1003816721915
    └─ message_thread_id=4
        ↓
Telegram Forum Topic (ai-native-os)
    └─ Сообщение появляется в topic
        ↓
OpenClaw Bot (локально)
    ├─ Слушает тот же чат
    ├─ Видит сообщения в topic
    └─ Может реагировать как агент
```

**Ключевое отличие:** Используют GitHub Actions вместо webhook!

---

## 🎯 Почему их схема лучше

| Аспект | Наша схема | Их схема |
|--------|-----------|----------|
| **Публичный URL** | ❌ Требуется | ✅ Не нужен |
| **Deployment** | ❌ Нужен сервер | ✅ GitHub Actions бесплатно |
| **Надёжность** | ⚠️ Зависит от uptime | ✅ GitHub инфраструктура |
| **Настройка** | ⚠️ Webhook + ngrok/cloud | ✅ Просто workflow файл |
| **Безопасность** | ⚠️ Webhook secret | ✅ GitHub Secrets |

---

## 🔧 Что нужно добавить к нашей схеме

### Вариант A: GitHub Actions (как у автора)

Создать `.github/workflows/telegram-notify.yml`:

```yaml
name: Telegram Notify

on:
  issues:
    types: [opened, closed, reopened]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Send to Telegram
        env:
          TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          TELEGRAM_CHAT_ID: -1001979197532
          TELEGRAM_TOPIC_ID: 963
        run: |
          ACTION="${{ github.event.action }}"
          ISSUE_NUMBER="${{ github.event.issue.number }}"
          ISSUE_TITLE="${{ github.event.issue.title }}"
          ISSUE_URL="${{ github.event.issue.html_url }}"
          REPO="${{ github.repository }}"
          
          case $ACTION in
            opened) EMOJI="🆕" ;;
            closed) EMOJI="✅" ;;
            reopened) EMOJI="🔄" ;;
          esac
          
          MESSAGE="$EMOJI <b>Issue ${ACTION^}</b>

<b>${ISSUE_TITLE}</b> (#${ISSUE_NUMBER})
${REPO}

🔗 <a href=\"${ISSUE_URL}\">View Issue</a>"
          
          curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
            -H "Content-Type: application/json" \
            -d "{
              \"chat_id\": \"${TELEGRAM_CHAT_ID}\",
              \"message_thread_id\": ${TELEGRAM_TOPIC_ID},
              \"text\": \"${MESSAGE}\",
              \"parse_mode\": \"HTML\"
            }"
```

**Плюсы:**
- ✅ Не нужен публичный URL
- ✅ Работает сразу
- ✅ Бесплатно
- ✅ Надёжно

**Минусы:**
- ⚠️ OpenClaw webhook endpoint не используется
- ⚠️ Дублирование логики (в workflow + в OpenClaw)

---

### Вариант B: Гибридная схема (лучшее из обоих)

```
GitHub Issue Event
    ↓
GitHub Actions Workflow
    ├─ Отправляет в Telegram topic (как у автора)
    └─ Отправляет в OpenClaw webhook (если доступен)
        ↓
OpenClaw Bot
    ├─ Получает через webhook (если есть публичный URL)
    ├─ ИЛИ видит сообщение в Telegram topic
    └─ Обрабатывает и реагирует
```

**Workflow с двойной отправкой:**

```yaml
- name: Notify Telegram and OpenClaw
  run: |
    # 1. Отправить в Telegram topic
    curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" ...
    
    # 2. Попробовать отправить в OpenClaw webhook (если доступен)
    curl -X POST "${OPENCLAW_WEBHOOK_URL}/webhook/github" \
      -H "X-GitHub-Event: issues" \
      -d "$GITHUB_EVENT_PATH" || true
```

---

## 🎯 Рекомендация

**Используй Вариант A (GitHub Actions)** — это то, что работает у автора воркшопа.

**Почему:**
1. Не нужен публичный URL
2. Работает из коробки
3. OpenClaw всё равно видит сообщения в topic
4. Можно добавить webhook позже для расширенной логики

**Следующий шаг:**
Создать `.github/workflows/telegram-notify.yml` в репозитории.

---

## 📊 Итоговая схема (рекомендуемая)

```
GitHub Issue Event (opened/closed/reopened)
    ↓
GitHub Actions Workflow
    ├─ Читает event payload
    ├─ Форматирует сообщение
    └─ Отправляет через Telegram Bot API
        ↓
Telegram Forum Topic (pos-print, ID: 963)
    ├─ Уведомление появляется
    └─ OpenClaw Bot видит сообщение
        ↓
OpenClaw Bot (localhost)
    ├─ Может реагировать на уведомления
    ├─ Может выполнять задачи в том же topic
    └─ Webhook endpoint остаётся для будущего использования
```

**Результат:** Полная интеграция без публичного URL, как у автора воркшопа.
