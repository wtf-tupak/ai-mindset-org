---
name: "Context Storage Patterns Research"
description: "Best practices for project context storage with API read/write capabilities"
type: research
date: 2026-04-20
status: draft
tags: [context, memory, api, agent, storage]
sources:
  - https://binaryverseai.com/claude-agent-sdk-context-engineering-long-memory/
  - https://orbitalai.in/Orbitalai-memory-management.html
  - https://agentpatterns.ai/context-engineering/context-hub/
  - https://dev.to/sem_pre/building-a-context-api-for-ai-agents-goodbye-github-raw-urls-2ma1
  - https://ultracontext.ai/docs
  - https://www.retaindb.com/context
---

# Исследование: Хранение контекста проекта для AI-агентов

## Executive Summary

Для реализации агента, способного читать и обновлять контекст проекта через API, рекомендуется **гибридная архитектура** с четким разделением на 4 уровня памяти и REST API с поддержкой версионирования и дельта-запросов.

---

## Архитектура памяти (4 уровня)

```
┌─────────────────────────────────────────────────────────┐
│  L1: Working Memory (Context Window)                    │
│  ├── Активный разговор (~200K tokens)                   │
│  └── Немедленный доступ (<1ms)                          │
├─────────────────────────────────────────────────────────┤
│  L2: Session Store (Redis/Key-Value)                    │
│  ├── Текущая сессия, незавершенные задачи               │
│  └── Быстрый доступ (10-100ms)                           │
├─────────────────────────────────────────────────────────┤
│  L3: Vector Store (Pinecone/Weaviate/Qdrant)            │
│  ├── Эмбеддинги для семантического поиска               │
│  └── Поиск по смыслу (50-200ms)                         │
├─────────────────────────────────────────────────────────┤
│  L4: Knowledge Graph (Neo4j/Structured)                  │
│  ├── Сущности, связи, иерархия проекта                  │
│  └── Структурированные запросы                           │
└─────────────────────────────────────────────────────────┘
```

---

## API Design Patterns

### 1. Чтение (Read API)

```http
GET /v1/context/{project}
GET /v1/context/{project}?since={timestamp}    # Delta query
GET /v1/context/{project}/{type}/{key}        # Specific doc
GET /v1/context/{project}/search?q={query}     # Semantic search
```

**Headers:**
```
If-None-Match: {etag}      # Для кэширования
Accept: application/json
```

### 2. Запись (Write API)

```http
POST /v1/context/{project}/sync          # Idempotent sync
PUT /v1/context/{project}/notes/{id}     # Update with versioning
DELETE /v1/context/{project}/notes/{id}  # Soft delete
```

**Request body:**
```json
{
  "content": "string",
  "type": "decision|research|task|note",
  "metadata": {
    "tags": ["auth", "api-design"],
    "importance": 0.8,
    "project_phase": "architecture"
  },
  "known_paths": ["/src/auth.ts", "/docs/api.md"]
}
```

### 3. Версионирование (UltraContext Pattern)

```javascript
// Каждое обновление создает новую версию
{
  "id": "ctx_abc123",
  "version": 7,
  "previous_version": 6,
  "created_at": "2026-04-20T10:30:00Z",
  "content": "...",
  "history": [/* предыдущие версии */]
}
```

---

## File Organization (Рекомендуемая)

```
project/
├── memory/
│   ├── MEMORY.md              # Индекс, быстрые ссылки
│   ├── NOTES.md               # Факты, решения
│   ├── decisions/             # Архитектурные решения
│   │   ├── 001-auth-method.md
│   │   └── 002-database-choice.md
│   ├── research/              # Исследования
│   │   └── api-patterns-2026.md
│   └── sessions/              # Сохраненные сессии
│       └── 2026-04-20-feature-x.md
├── tasks/                     # Текущие задачи (transient)
└── outputs/                   # Сгенерированные артефакты
```

---

## Стратегия ретривала (Hybrid)

### Порядок поиска:

1. **Metadata filtering** — сначала отфильтровать по тегам/типу
2. **Vector search** — семантический поиск по эмбеддингам
3. **Cross-encoder reranking** — фильтрация результатов <0.7 similarity
4. **Limit** — максимум 5-10 наиболее релевантных элементов

### Токен бюджет:

```
┌────────────────────────────────────┐
│ 50%  History + Context             │
│ 15%  System instructions           │
│ 15%  Current query                  │
│ 20%  Response buffer                │
└────────────────────────────────────┘
Target: <30% context-to-total ratio
```

---

## Security & Privacy

| Требование | Реализация |
|------------|-----------|
| Encryption at rest | Per-user keys (AES-256) |
| Encryption in transit | TLS 1.3 |
| Hard deletes | Для GDPR/CCPA compliance |
| No sensitive data | Валидация на входе |
| Retention policy | Auto-delete после 1 года |
| User visibility | Эндпоинт `/v1/context/export` |

---

## Anti-Patterns (Чего избегать)

| Антипаттерн | Почему плохо | Решение |
|-------------|-------------|---------|
| Context rot | Весь история в окне | Summarization + selective retrieval |
| Bloated toolbox | Слишком много операций | CRUD + search минимум |
| Silent errors | Validation failures ignored | Fail fast с явными ошибками |
| No source paths | Непроверяемые утверждения | Всегда указывать file paths |
| Untyped storage | Невозможно фильтровать | Категоризировать (preference/context/decision) |

---

## Рекомендуемый стек для POS

| Компонент | Технология | Причина |
|-----------|-----------|---------|
| API Layer | FastAPI / Express | Простота, async support |
| Session Store | Redis | Скорость, TTL support |
| Vector Store | Qdrant (self-hosted) | Бесплатно, API-first |
| Embeddings | OpenAI text-embedding-3-small | Качество/цена |
| Knowledge Graph | JSON-LD files | Простота, версионируется git |
| Sync | Webhooks + polling | Надежность |

---

## Интеграция с Claude Code

### MCP Server Pattern:

```typescript
// context-server.ts
interface ContextServer {
  // Read
  "context__get": (project: string, key: string) => ContextDoc;
  "context__search": (project: string, query: string) => ContextDoc[];
  "context__list": (project: string, since?: Date) => ContextDoc[];

  // Write
  "context__save": (project: string, doc: ContextDoc) => string; // returns id
  "context__update": (project: string, id: string, doc: Partial<ContextDoc>) => void;
  "context__delete": (project: string, id: string) => void;
}
```

---

## Следующие шаги

1. **POC API** — реализовать базовые CRUD endpoints (FastAPI)
2. **Vector search** — добавить Qdrant для семантического поиска
3. **MCP интеграция** — обернуть в MCP сервер для Claude Code
4. **Гибридный ретривал** — комбинировать metadata + vector search
5. **Версионирование** — добавить git-like versioning

---

## Sources

- [Claude Agent: Context & Memory 2025](https://binaryverseai.com/claude-agent-sdk-context-engineering-long-memory/)
- [Memory Management in AI Agents](https://orbitalai.in/Orbitalai-memory-management.html)
- [Context Hub Pattern](https://agentpatterns.ai/context-engineering/context-hub/)
- [Building Context API for AI Agents](https://dev.to/sem_pre/building-a-context-api-for-ai-agents-goodbye-github-raw-urls-2ma1)
- [UltraContext Docs](https://ultracontext.ai/docs)
- [RetainDB Context Layer](https://www.retaindb.com/context)

---

*Исследование проведено 2026-04-20. Фокус: API-first архитектура для POS context layer.*
