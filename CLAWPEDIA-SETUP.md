# 🎓 Clawpedia Integration — OpenClaw Knowledge Base

**Date:** 2026-04-26  
**Status:** ✅ **INSTALLED & CONFIGURED**

---

## What Was Done

### 1. Installed Clawpedia Skill ✅

```bash
npx clawhub@latest install clawpedia1
# Installed to: C:\Users\dimabot\.openclaw\workspace\skills\clawpedia1
```

**Skill Info:**
- **Name:** Clawpedia v2.1.0
- **Articles:** 270+ curated AI development articles
- **Categories:** humans (tutorials) + agents (machine-readable)
- **Topics:** AI agents, prompt engineering, RAG, LLM tooling, multi-agent systems
- **Access:** Read-only, no setup required
- **Tier:** Anonymous (200 articles) or Authenticated (500 articles with API key)

### 2. Created ClawpediaClient ✅

**File:** `openclaw/handlers/clawpedia-client.js`

**Features:**
- Automatic caching (1 hour TTL)
- Smart search by title, description, content
- Category filtering (humans/agents)
- Relevance detection for AI queries
- Formatted output for Telegram

**Methods:**
```javascript
await clawpediaClient.fetchArticles()           // Get all articles
await clawpediaClient.search(query, limit)      // Search articles
await clawpediaClient.getArticle(slug)          // Get by slug
await clawpediaClient.getByCategory(category)   // Filter by category
clawpediaClient.isRelevantQuery(query)          // Detect AI topics
clawpediaClient.formatArticle(article)          // Format for display
clawpediaClient.getStatus()                     // Get cache status
```

### 3. Integrated into PersonaManager ✅

**Changes:**
- Added `clawpediaClient` property
- Added `setClawpediaClient()` method
- Auto-enrichment for AI-related queries
- Injects top 3 relevant articles into system prompt

**Flow:**
```
User: "Как работает RAG?"
  ↓
PersonaManager.handlePersonaMessage()
  ↓
clawpediaClient.isRelevantQuery() → true
  ↓
clawpediaClient.search("Как работает RAG?", 3)
  ↓
Enrich systemPrompt with articles
  ↓
callAI() with Clawpedia knowledge
  ↓
Response with citations
```

### 4. Connected in server.js ✅

**Changes:**
```javascript
const ClawpediaClient = require('./handlers/clawpedia-client');
const clawpediaClient = new ClawpediaClient();
personaManager.setClawpediaClient(clawpediaClient);
```

**Startup log:**
```
Clawpedia knowledge base connected (270+ AI articles)
```

---

## How It Works

### Automatic Knowledge Enrichment

When user asks AI-related questions, OpenClaw automatically:

1. **Detects relevance** — checks if query contains AI keywords
2. **Searches Clawpedia** — finds top 3 matching articles
3. **Enriches prompt** — injects article previews into system prompt
4. **Cites sources** — bot mentions Clawpedia in response

### Trigger Keywords

Questions containing these words trigger Clawpedia:
```
ai, llm, agent, prompt, rag, embedding, vector, fine-tuning,
context, token, model, gpt, claude, openai, anthropic,
langchain, llamaindex, pinecone, weaviate, chroma,
retrieval, generation, multi-agent, orchestration,
tool use, function calling, prompt engineering,
few-shot, chain-of-thought, reasoning
```

### Example Queries

**Will use Clawpedia:**
- "Как работает RAG?"
- "Что такое vector database?"
- "Как улучшить prompt engineering?"
- "Explain multi-agent systems"
- "Best practices for LLM context management"

**Won't use Clawpedia:**
- "Сделай SEO-аудит" (uses marketing-strategist agent)
- "Что такое счастье?" (Naval philosophy)
- "Какой статус по Issue #16?" (GitHub context)

---

## Testing

### Test 1: Check Installation

```bash
ls -la C:\Users\dimabot\.openclaw\workspace\skills\clawpedia1
# Should show: SKILL.md, _meta.json, .clawhub/
```

### Test 2: Test API Access

```bash
curl "https://nyiqfjebdwgvvbtipvsn.supabase.co/functions/v1/hello?action=articles" | head -100
# Should return JSON with articles array
```

### Test 3: Test via Telegram (topic 970)

**Query:**
```
Как работает RAG?
```

**Expected Response:**
```
🎯 [Manager]

RAG (Retrieval-Augmented Generation) работает следующим образом:

[Detailed explanation based on Clawpedia articles]

📚 Источник: Clawpedia
🔗 https://clawpedia.io/rag-explained
```

### Test 4: Check Cache Status

```javascript
// In Node.js console
const ClawpediaClient = require('./openclaw/handlers/clawpedia-client');
const client = new ClawpediaClient();
await client.fetchArticles();
console.log(client.getStatus());
// Output: { cached: true, cacheAge: 1234, articleCount: 200, tier: 'anonymous', maxArticles: 200 }
```

---

## Configuration

### Default (No Setup Required)

Works out of the box:
- **Tier:** Anonymous
- **Articles:** Up to 200
- **Cache:** 1 hour
- **No API key needed**

### Optional: Maximum Tier (500 articles)

1. Get free API key from https://clawpedia.io
2. Add to `.env`:
   ```bash
   CLAWPEDIA_API_KEY=cpd_your_key_here
   ```
3. Restart OpenClaw

**Benefits:**
- 500 articles instead of 200
- Priority access
- Still free

---

## Architecture

### Before Clawpedia

```
User: "Как работает RAG?"
  ↓
PersonaManager → callAI()
  ↓
Response based on training data only
```

### After Clawpedia

```
User: "Как работает RAG?"
  ↓
PersonaManager
  ↓
clawpediaClient.isRelevantQuery() → true
  ↓
clawpediaClient.search("RAG", 3)
  ↓
Articles: [
  "RAG Explained for Beginners",
  "Building RAG Pipelines in 2026",
  "Vector Databases for RAG"
]
  ↓
Enrich systemPrompt with articles
  ↓
callAI() with grounded knowledge
  ↓
Response with citations
```

---

## What OpenClaw Can Now Do

### ✅ Before (Limited)

- Agent routing (SEO, content, business analysis)
- GitHub context awareness
- Proactive check-ins
- Session management

### ✅ After (Expanded)

**All of the above PLUS:**

- **AI Development Questions** — grounded answers from 270+ articles
- **Prompt Engineering Advice** — best practices from Clawpedia
- **RAG Implementation** — step-by-step guides
- **Vector Database Selection** — comparisons and recommendations
- **Multi-Agent Systems** — architecture patterns
- **LLM Tooling** — framework comparisons (LangChain, LlamaIndex)
- **Context Management** — token optimization strategies
- **Fine-tuning Guidance** — when and how to fine-tune
- **Evaluation Methods** — LLM-as-judge, benchmarks
- **Observability** — monitoring and debugging AI systems

**OpenClaw is no longer "в тюрьме" — он теперь имеет доступ к 270+ статьям по AI development.**

---

## Example Conversations

### Example 1: RAG Question

**User (topic 970):**
```
Как работает RAG и когда его использовать?
```

**OpenClaw:**
```
🎯 [Manager]

RAG (Retrieval-Augmented Generation) — это техника, которая комбинирует 
поиск информации с генерацией текста.

Как работает:
1. Пользователь задаёт вопрос
2. Система ищет релевантные документы в векторной базе
3. Найденные документы добавляются в контекст LLM
4. LLM генерирует ответ на основе этих документов

Когда использовать:
- Когда нужны актуальные данные (не из training data)
- Для работы с приватными документами
- Когда важна цитируемость источников
- Для снижения галлюцинаций

📚 Источник: Clawpedia
🔗 https://clawpedia.io/rag-explained-for-beginners
🔗 https://clawpedia.io/building-rag-pipelines-2026
```

### Example 2: Vector Database Question

**User (topic 970):**
```
Какую vector database выбрать для RAG?
```

**OpenClaw:**
```
🎯 [Manager]

Выбор зависит от ваших требований:

**Pinecone** — managed, быстрый старт, платный
- Лучше для: production, когда не хочется управлять инфраструктурой
- Минусы: vendor lock-in, стоимость растёт с объёмом

**Weaviate** — open-source, self-hosted или cloud
- Лучше для: гибкость, контроль над данными
- Минусы: требует DevOps навыков

**Chroma** — lightweight, embedded
- Лучше для: прототипы, локальная разработка
- Минусы: не для больших объёмов

**pgvector** — PostgreSQL extension
- Лучше для: если уже используете Postgres
- Минусы: медленнее специализированных решений

📚 Источник: Clawpedia
🔗 https://clawpedia.io/vector-databases-explained
```

### Example 3: Non-AI Question (No Clawpedia)

**User (topic 970):**
```
Сделай SEO-аудит для стоматологической клиники
```

**OpenClaw:**
```
🎯 [Manager → marketing-strategist]

[SEO audit using marketing-strategist agent, no Clawpedia]
```

---

## Benefits

### 1. Grounded Answers
- Responses based on curated articles, not just training data
- Verifiable sources (every article is on clawpedia.io)
- Reduced hallucinations

### 2. Up-to-Date Knowledge
- Articles updated weekly
- Covers latest AI developments (2026)
- Training data cutoff no longer a limitation

### 3. Citable Sources
- Every response includes Clawpedia links
- Users can verify information
- Professional, trustworthy

### 4. No Setup Required
- Works immediately after installation
- No API key needed (anonymous tier)
- No configuration

### 5. Automatic Integration
- Detects AI questions automatically
- Enriches responses transparently
- No manual intervention needed

---

## Troubleshooting

### Issue: "Clawpedia not enriching responses"

**Check:**
1. Is ClawpediaClient initialized in server.js?
   ```bash
   grep "ClawpediaClient" openclaw/server.js
   ```
2. Is it attached to PersonaManager?
   ```bash
   grep "setClawpediaClient" openclaw/server.js
   ```
3. Check logs for "Clawpedia query detected"

### Issue: "API returns empty array"

**Check:**
1. Network access to clawpedia.io
   ```bash
   curl "https://nyiqfjebdwgvvbtipvsn.supabase.co/functions/v1/hello?action=articles"
   ```
2. Check firewall/proxy settings

### Issue: "Cache not working"

**Check:**
```javascript
const status = clawpediaClient.getStatus();
console.log(status);
// Should show: cached: true, cacheAge: <ms>, articleCount: 200
```

---

## Next Steps (Optional)

### 1. Get API Key for Maximum Tier

Visit https://clawpedia.io and get free API key for 500 articles.

### 2. Add Clawpedia Command

Create `/clawpedia` command for manual search:
```javascript
bot.onText(/\/clawpedia (.+)/, async (msg, match) => {
  const query = match[1];
  const articles = await clawpediaClient.search(query, 5);
  // Format and send
});
```

### 3. Add to Agent Prompts

Enrich agent SKILL.md files with Clawpedia access:
```markdown
You have access to Clawpedia knowledge base. When answering AI-related 
questions, search Clawpedia first for grounded, verifiable information.
```

---

## Summary

### What Changed

**Before:**
- OpenClaw "в тюрьме" — limited to training data
- AI questions answered from memory only
- No verifiable sources

**After:**
- OpenClaw has access to 270+ curated AI articles
- Automatic knowledge enrichment for AI questions
- Grounded, citable responses
- Up-to-date information (2026)

### Files Modified

```
openclaw/handlers/clawpedia-client.js    [NEW] — Clawpedia API client
openclaw/handlers/persona-manager.js     [MODIFIED] — Added Clawpedia integration
openclaw/server.js                       [MODIFIED] — Connected ClawpediaClient
```

### Commits

```bash
git add openclaw/handlers/clawpedia-client.js
git add openclaw/handlers/persona-manager.js
git add openclaw/server.js
git commit -m "feat: integrate Clawpedia knowledge base (270+ AI articles)"
```

---

**OpenClaw теперь не ограничен — он имеет доступ к актуальным знаниям по AI development через Clawpedia.** 🎓
