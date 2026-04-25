class ContextManager {
  constructor() {
    this.contexts = new Map(); // threadId -> context
  }

  getContext(threadId) {
    if (!this.contexts.has(threadId)) {
      this.contexts.set(threadId, {
        threadId,
        messages: [],
        createdAt: new Date(),
        lastActivity: new Date(),
        metadata: {}
      });
    }
    return this.contexts.get(threadId);
  }

  addMessage(threadId, role, content) {
    const context = this.getContext(threadId);
    context.messages.push({
      role,
      content,
      timestamp: new Date()
    });
    context.lastActivity = new Date();
  }

  getMessages(threadId, limit = 50) {
    const context = this.getContext(threadId);
    return context.messages.slice(-limit);
  }

  clearContext(threadId) {
    this.contexts.delete(threadId);
  }

  setMetadata(threadId, key, value) {
    const context = this.getContext(threadId);
    context.metadata[key] = value;
  }

  getMetadata(threadId, key) {
    const context = this.getContext(threadId);
    return context.metadata[key];
  }

  // Cleanup old contexts (older than 24 hours)
  cleanup(maxAge = 86400000) {
    const now = Date.now();
    for (const [threadId, context] of this.contexts.entries()) {
      if (now - context.lastActivity.getTime() > maxAge) {
        this.contexts.delete(threadId);
      }
    }
  }

  getStats() {
    return {
      totalContexts: this.contexts.size,
      contexts: Array.from(this.contexts.values()).map(ctx => ({
        threadId: ctx.threadId,
        messageCount: ctx.messages.length,
        createdAt: ctx.createdAt,
        lastActivity: ctx.lastActivity
      }))
    };
  }
}

module.exports = ContextManager;
