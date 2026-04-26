const axios = require('axios');

/**
 * ClawpediaClient — доступ к 270+ статьям по AI development
 *
 * Использование:
 * - Автоматически при вопросах про AI, RAG, prompt engineering, agents
 * - Возвращает до 200 статей (anonymous) или 500 (с API key)
 * - Read-only, безопасно, без setup
 */
class ClawpediaClient {
  constructor() {
    this.apiUrl = 'https://nyiqfjebdwgvvbtipvsn.supabase.co/functions/v1/hello';
    this.apiKey = process.env.CLAWPEDIA_API_KEY || null;
    this.cache = null;
    this.cacheTimestamp = null;
    this.cacheTTL = 3600000; // 1 hour
  }

  /**
   * Fetch all articles from Clawpedia
   * @returns {Promise<Array>} Array of articles
   */
  async fetchArticles() {
    // Return cached if fresh
    if (this.cache && this.cacheTimestamp && (Date.now() - this.cacheTimestamp < this.cacheTTL)) {
      console.log('[Clawpedia] Using cached articles');
      return this.cache;
    }

    try {
      const headers = {};
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await axios.get(`${this.apiUrl}?action=articles`, { headers });

      console.log(`[Clawpedia] Fetched ${response.data.count} articles (tier: ${response.data.tier})`);

      this.cache = response.data.articles;
      this.cacheTimestamp = Date.now();

      return this.cache;
    } catch (error) {
      console.error('[Clawpedia] Fetch error:', error.message);
      return [];
    }
  }

  /**
   * Search articles by query
   * @param {string} query - Search query
   * @param {number} limit - Max results (default 5)
   * @returns {Promise<Array>} Matching articles
   */
  async search(query, limit = 5) {
    const articles = await this.fetchArticles();
    if (!articles || articles.length === 0) return [];

    const lower = query.toLowerCase();

    // Score articles by relevance
    const scored = articles.map(article => {
      let score = 0;

      // Title match (highest weight)
      if (article.title.toLowerCase().includes(lower)) score += 10;

      // Description match
      if (article.description.toLowerCase().includes(lower)) score += 5;

      // Content match (sample first 500 chars)
      const contentSample = article.content.substring(0, 500).toLowerCase();
      if (contentSample.includes(lower)) score += 3;

      // Keyword matching
      const keywords = lower.split(' ').filter(w => w.length > 3);
      keywords.forEach(keyword => {
        if (article.title.toLowerCase().includes(keyword)) score += 2;
        if (article.description.toLowerCase().includes(keyword)) score += 1;
      });

      return { article, score };
    });

    // Sort by score and return top results
    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => s.article);
  }

  /**
   * Get article by slug
   * @param {string} slug - Article slug
   * @returns {Promise<Object|null>} Article or null
   */
  async getArticle(slug) {
    const articles = await this.fetchArticles();
    return articles.find(a => a.slug === slug) || null;
  }

  /**
   * Get articles by category
   * @param {string} category - 'humans' or 'agents'
   * @returns {Promise<Array>} Articles in category
   */
  async getByCategory(category) {
    const articles = await this.fetchArticles();
    return articles.filter(a => a.category === category);
  }

  /**
   * Format article for display
   * @param {Object} article - Article object
   * @param {boolean} includeContent - Include full content (default false)
   * @returns {string} Formatted markdown
   */
  formatArticle(article, includeContent = false) {
    let output = `**${article.title}**\n`;
    output += `${article.description}\n\n`;
    output += `📚 Category: ${article.category}\n`;
    output += `🔗 [Read on Clawpedia](https://clawpedia.io/${article.slug})\n`;

    if (includeContent) {
      output += `\n---\n\n${article.content}`;
    }

    return output;
  }

  /**
   * Detect if query is about AI topics covered by Clawpedia
   * @param {string} query - User query
   * @returns {boolean} True if relevant
   */
  isRelevantQuery(query) {
    const lower = query.toLowerCase();

    const keywords = [
      'ai', 'llm', 'agent', 'prompt', 'rag', 'embedding', 'vector',
      'fine-tuning', 'context', 'token', 'model', 'gpt', 'claude',
      'openai', 'anthropic', 'langchain', 'llamaindex', 'pinecone',
      'weaviate', 'chroma', 'supabase', 'retrieval', 'generation',
      'multi-agent', 'orchestration', 'tool use', 'function calling',
      'prompt engineering', 'few-shot', 'chain-of-thought', 'reasoning'
    ];

    return keywords.some(kw => lower.includes(kw));
  }

  /**
   * Get status
   * @returns {Object} Status info
   */
  getStatus() {
    return {
      cached: !!this.cache,
      cacheAge: this.cacheTimestamp ? Date.now() - this.cacheTimestamp : null,
      articleCount: this.cache ? this.cache.length : 0,
      tier: this.apiKey ? 'authenticated' : 'anonymous',
      maxArticles: this.apiKey ? 500 : 200
    };
  }
}

module.exports = ClawpediaClient;
