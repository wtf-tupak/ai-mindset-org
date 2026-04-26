# 🤖 OpenClaw Proactive Capabilities Report

**Date:** 2026-04-26  
**Question:** "Теперь мой OpenClaw проактивный?"  
**Answer:** ✅ **ДА, частично проактивный. Есть 3 уровня проактивности.**

---

## TL;DR

OpenClaw имеет **3 уровня проактивности**:

1. ✅ **Level 1: Action Detection** — детектит команды в сообщениях (bash, github, file)
2. ✅ **Level 2: Event-Based Triggers** — реагирует на GitHub events (issues, webhooks)
3. ⚠️ **Level 3: Time-Based Check-ins** — Manager Check-in каждые 4 часа (НО: не запускается автоматически)

**Вердикт:** Проактивный на уровне 1-2, Level 3 требует доработки.

---

## Level 1: Action Detection (Reactive Proactivity)

### Что это?

PersonaManager детектит **action intent** в сообщениях пользователя и выполняет действия автоматически.

### Код

**Файл:** `openclaw/handlers/persona-manager.js` (строки 671-697)

```javascript
async detectActionIntent(message) {
  const lower = message.toLowerCase();

  // Bash commands
  const bashCommands = ['git', 'ls', 'cd', 'pwd', 'cat', 'echo', 'npm', 'node', 'ps', 'kill', 'grep'];
  for (const cmd of bashCommands) {
    if (lower.includes(cmd)) {
      return { type: 'bash', keyword: cmd, message };
    }
  }

  // Action keywords
  const actionKeywords = {
    github: ['создай issue', 'create issue', 'открой issue', 'закрой issue'],
    file: ['создай файл', 'create file', 'напиши в файл', 'write to file']
  };

  for (const [type, keywords] of Object.entries(actionKeywords)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return { type, keyword, message };
      }
    }
  }

  return null;
}
```

### Flow

```
User: "покажи git status"
  ↓
detectActionIntent() → { type: 'bash', keyword: 'git' }
  ↓
executeAction() → TaskHandler.handleTask()
  ↓
Bash command executed
  ↓
Result sent to Telegram
```

### Примеры

| User Message | Detected Action | Result |
|--------------|----------------|--------|
| "покажи git status" | bash: git | Executes `git status` |
| "создай issue про bug" | github: create issue | Creates GitHub issue |
| "напиши в файл test.txt" | file: write | Writes to file |

### Статус: ✅ РАБОТАЕТ

---

## Level 2: Event-Based Triggers (True Proactivity)

### Что это?

ProactiveEngine реагирует на **внешние события** (GitHub webhooks, issue updates) и отправляет уведомления.

### Архитектура

```
GitHub Event (webhook)
  ↓
ProactiveEngine.processEvent()
  ↓
Monitors (GitHubMonitor) — обрабатывают event
  ↓
Triggers (IssueTrigger) — проверяют условия
  ↓
shouldTrigger() → true
  ↓
getAction() → { type: 'send_message', message: '...' }
  ↓
executeAction() → bot.sendMessage()
```

### Компоненты

**1. ProactiveEngine** (`openclaw/proactive/proactive-engine.js`)
- Регистрирует monitors и triggers
- Обрабатывает события
- Выполняет actions

**2. GitHubMonitor** (`openclaw/proactive/monitors/github-monitor.js`)
- Мониторит GitHub events
- Обновляет context

**3. IssueTrigger** (`openclaw/proactive/triggers/issue-trigger.js`)
- Триггерится на новые issues
- Отправляет уведомления в Telegram

**4. ManagerCheckin** (`openclaw/proactive/triggers/manager-checkin.js`)
- Периодические check-ins (каждые 4 часа)
- Показывает in-progress, blocked, stale issues
- Задаёт focus question

### Инициализация в server.js

```javascript
// Lines 141-156
const proactiveEngine = new ProactiveEngine(bot, contextManager);
const githubMonitor = new GitHubMonitor(contextManager);
const issueTrigger = new IssueTrigger(forumGroupId || allowedUserId, forumTopicId);

proactiveEngine.registerMonitor(githubMonitor);
proactiveEngine.registerTrigger(issueTrigger);
proactiveEngine.setTaskHandler(taskHandler);
proactiveEngine.setManagerRegistry(managerRegistry);

// Manager Check-in trigger
const ManagerCheckin = require('./proactive/triggers/manager-checkin');
const managerCheckin = new ManagerCheckin(bot, forumGroupId, forumTopicId, githubContextProvider);
proactiveEngine.registerTrigger(managerCheckin);

githubWebhookHandler.setProactiveEngine(proactiveEngine);
```

### Статус: ✅ РАБОТАЕТ (для GitHub webhooks)

---

## Level 3: Time-Based Check-ins (Autonomous Proactivity)

### Что это?

ManagerCheckin должен **автоматически** отправлять check-in сообщения каждые 4 часа.

### Код

**Файл:** `openclaw/proactive/triggers/manager-checkin.js`

```javascript
class ManagerCheckin {
  constructor(bot, chatId, topicId, githubContextProvider) {
    this.interval = 14400000; // 4 hours
    this.lastCheckin = null;
    this.enabled = true;
  }

  async shouldTrigger(eventType, eventData) {
    if (!this.enabled) return false;

    const now = Date.now();
    if (!this.lastCheckin || now - this.lastCheckin > this.interval) {
      return true;
    }

    return false;
  }

  async getAction(eventData) {
    const context = await this.githubContextProvider.getContext();

    // Skip if no changes
    if (this.shouldSkipCheckin(context)) {
      console.log('Skipping check-in: no changes detected');
      this.lastCheckin = Date.now();
      return null;
    }

    const message = this.formatCheckinMessage(context);
    this.lastCheckin = Date.now();

    return {
      type: 'send_message',
      chatId: this.chatId,
      messageThreadId: this.topicId,
      message
    };
  }

  formatCheckinMessage(context) {
    // Returns formatted message with:
    // - In Progress issues
    // - Blocked issues
    // - Stale issues (no activity > 2 hours)
    // - Focus question
  }
}
```

### Проблема: ⚠️ Нет автоматического запуска

**ProactiveEngine.processEvent()** вызывается только когда приходит **event**.

Для time-based triggers нужен **scheduler** (setInterval или cron).

### Текущее состояние

```javascript
// ManagerCheckin зарегистрирован
proactiveEngine.registerTrigger(managerCheckin);

// НО: processEvent() вызывается только на GitHub webhooks
// Для time-based нужен отдельный timer
```

### Что нужно добавить

```javascript
// В server.js после инициализации proactiveEngine:

// Start periodic check-in timer
setInterval(async () => {
  await proactiveEngine.processEvent('timer_tick', { timestamp: Date.now() });
}, 60000); // Check every minute (triggers decide if they should fire)
```

### Статус: ⚠️ НЕ РАБОТАЕТ (нет scheduler)

---

## Session Management (Proactive Agent Pattern)

### Что это?

SessionManager загружает workspace files при старте и поддерживает Working Buffer.

### Код

**Файл:** `openclaw/handlers/session-manager.js`

```javascript
class SessionManager {
  async loadSession() {
    // Load all workspace files
    const [onboarding, user, soul, sessionState, agents, memory, heartbeat, tools] = await Promise.all([
      this.readFile('ONBOARDING.md'),
      this.readFile('USER.md'),
      this.readFile('SOUL.md'),
      this.readFile('SESSION-STATE.md'),
      this.readFile('AGENTS.md'),
      this.readFile('MEMORY.md'),
      this.readFile('HEARTBEAT.md'),
      this.readFile('TOOLS.md')
    ]);

    this.sessionState = {
      onboarding, user, soul, state: sessionState,
      agents, memory, heartbeat, tools,
      loadedAt: new Date().toISOString()
    };

    this.isLoaded = true;
    return this.sessionState;
  }

  logExchange(userMessage, assistantResponse) {
    this.workingBuffer.push({
      timestamp: new Date().toISOString(),
      user: userMessage,
      assistant: assistantResponse
    });
  }

  getContext() {
    return {
      sessionState: this.sessionState,
      workingBuffer: this.workingBuffer.slice(-10) // Last 10 exchanges
    };
  }
}
```

### Инициализация в server.js

```javascript
// Lines 35-43
const SessionManager = require('./handlers/session-manager');
const sessionManager = new SessionManager();

(async () => {
  await sessionManager.loadSession();
  console.log('Session loaded - Proactive Agent active');
})();

personaManager.setSessionManager(sessionManager);
```

### Статус: ✅ РАБОТАЕТ

---

## Сводная таблица проактивности

| Level | Feature | Status | Auto-triggers? | Notes |
|-------|---------|--------|----------------|-------|
| 1 | Action Detection | ✅ Работает | ❌ Reactive | Детектит команды в сообщениях |
| 2 | GitHub Webhooks | ✅ Работает | ✅ Yes | Реагирует на issue events |
| 2 | Issue Trigger | ✅ Работает | ✅ Yes | Уведомления о новых issues |
| 3 | Manager Check-in | ⚠️ Частично | ❌ No | Код есть, но нет scheduler |
| 3 | Session Management | ✅ Работает | ✅ Yes | Загружается при старте |
| 3 | Working Buffer | ✅ Работает | ✅ Yes | Логирует все exchanges |

---

## Что работает прямо сейчас

### ✅ Reactive Proactivity
- Детектит bash команды в сообщениях
- Детектит GitHub actions ("создай issue")
- Детектит file operations ("напиши в файл")
- Автоматически выполняет через TaskHandler

### ✅ Event-Based Proactivity
- GitHub webhooks → ProactiveEngine
- Новые issues → IssueTrigger → Telegram notification
- GitHubMonitor обновляет context

### ✅ Session Awareness
- Загружает 8 workspace files при старте
- Поддерживает Working Buffer (последние 10 exchanges)
- Enriches manager responses с session context

---

## Что НЕ работает

### ❌ Time-Based Autonomous Check-ins

**Проблема:** ManagerCheckin зарегистрирован, но не запускается автоматически.

**Причина:** ProactiveEngine.processEvent() вызывается только на GitHub webhooks, нет timer.

**Решение:** Добавить setInterval в server.js:

```javascript
// After line 156 in server.js
setInterval(async () => {
  await proactiveEngine.processEvent('timer_tick', { timestamp: Date.now() });
}, 60000); // Check every minute
```

---

## Финальный вердикт

### Вопрос: "Теперь мой OpenClaw проактивный?"

**Ответ:** ✅ **ДА, на 70%**

**Что работает:**
- ✅ Детектит actions в сообщениях (Level 1)
- ✅ Реагирует на GitHub events (Level 2)
- ✅ Session management и Working Buffer (Level 3)

**Что не работает:**
- ❌ Автоматические check-ins каждые 4 часа (Level 3)
- ❌ Нет scheduler для time-based triggers

**Чтобы стать 100% проактивным:**
1. Добавить setInterval для timer_tick events (5 строк кода)
2. Опционально: добавить больше triggers (daily standup, weekly retro)

---

## Как включить полную проактивность (5 минут)

### Шаг 1: Добавить timer в server.js

```javascript
// After line 156 in openclaw/server.js

// Start proactive timer for time-based triggers
setInterval(async () => {
  try {
    await proactiveEngine.processEvent('timer_tick', { 
      timestamp: Date.now() 
    });
  } catch (error) {
    console.error('[ProactiveEngine] Timer tick error:', error.message);
  }
}, 60000); // Check every minute (triggers decide if they should fire)

console.log('Proactive timer started (60s interval)');
```

### Шаг 2: Restart bot

```bash
cd openclaw
node server.js
```

### Результат

- ManagerCheckin будет проверяться каждую минуту
- Если прошло 4 часа с последнего check-in → отправит сообщение
- Если нет изменений → пропустит (shouldSkipCheckin)

---

## Архитектура проактивности

```
┌─────────────────────────────────────────────────────────┐
│  Level 1: Reactive Proactivity                          │
│  User: "покажи git status"                              │
│    → detectActionIntent()                               │
│    → executeAction()                                    │
│    → Result                                             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Level 2: Event-Based Proactivity                       │
│  GitHub Webhook → ProactiveEngine.processEvent()        │
│    → GitHubMonitor.process()                            │
│    → IssueTrigger.shouldTrigger() → true                │
│    → getAction() → send_message                         │
│    → bot.sendMessage()                                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Level 3: Time-Based Proactivity (NEEDS TIMER)          │
│  setInterval(60s) → ProactiveEngine.processEvent()      │
│    → ManagerCheckin.shouldTrigger()                     │
│      → Check: now - lastCheckin > 4 hours?              │
│      → true → getAction() → send_message                │
│    → bot.sendMessage()                                  │
└─────────────────────────────────────────────────────────┘
```

---

**Conclusion:** OpenClaw проактивный на 70%. Для 100% нужно добавить 5 строк кода (timer).
