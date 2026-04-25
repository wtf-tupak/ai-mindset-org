class TokenTracker {
  constructor() {
    this.dailyUsage = new Map(); // date -> usage stats
    this.currentDay = this.getDateKey();
    this.initializeDay();
  }

  getDateKey(date = new Date()) {
    return date.toISOString().split('T')[0];
  }

  initializeDay() {
    const today = this.getDateKey();
    if (!this.dailyUsage.has(today)) {
      this.dailyUsage.set(today, {
        date: today,
        totalTokens: 0,
        requests: 0,
        byThread: new Map(),
        byType: {
          agent: 0,
          bash: 0,
          github: 0,
          persona: 0
        },
        startTime: new Date(),
        lastUpdate: new Date()
      });
    }
  }

  trackUsage(threadId, type, tokens) {
    const today = this.getDateKey();
    this.initializeDay();

    const stats = this.dailyUsage.get(today);
    stats.totalTokens += tokens;
    stats.requests += 1;
    stats.lastUpdate = new Date();

    // Track by thread
    if (!stats.byThread.has(threadId)) {
      stats.byThread.set(threadId, 0);
    }
    stats.byThread.set(threadId, stats.byThread.get(threadId) + tokens);

    // Track by type
    if (stats.byType[type] !== undefined) {
      stats.byType[type] += tokens;
    }
  }

  getDailySummary(date = null) {
    const dateKey = date ? this.getDateKey(new Date(date)) : this.getDateKey();
    const stats = this.dailyUsage.get(dateKey);

    if (!stats) {
      return null;
    }

    const topThreads = Array.from(stats.byThread.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      date: stats.date,
      totalTokens: stats.totalTokens,
      requests: stats.requests,
      avgTokensPerRequest: Math.round(stats.totalTokens / stats.requests),
      byType: stats.byType,
      topThreads: topThreads.map(([id, tokens]) => ({ threadId: id, tokens })),
      duration: Math.round((stats.lastUpdate - stats.startTime) / 1000 / 60), // minutes
      tokensPerMinute: Math.round(stats.totalTokens / ((stats.lastUpdate - stats.startTime) / 1000 / 60))
    };
  }

  formatSummary(summary) {
    if (!summary) {
      return 'No data for this date.';
    }

    return `📊 **Daily Token Usage Summary**
📅 Date: ${summary.date}

**Overview:**
🔢 Total tokens: ${summary.totalTokens.toLocaleString()}
📨 Requests: ${summary.requests}
📈 Avg per request: ${summary.avgTokensPerRequest}
⏱️ Active time: ${summary.duration} min
⚡ Rate: ${summary.tokensPerMinute} tokens/min

**By Type:**
🤖 Agent: ${summary.byType.agent.toLocaleString()}
💻 Bash: ${summary.byType.bash.toLocaleString()}
🐙 GitHub: ${summary.byType.github.toLocaleString()}
👤 Persona: ${summary.byType.persona.toLocaleString()}

**Top Threads:**
${summary.topThreads.map((t, i) =>
  `${i + 1}. ${t.threadId}: ${t.tokens.toLocaleString()} tokens`
).join('\n')}`;
  }

  cleanup(daysToKeep = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffKey = this.getDateKey(cutoffDate);

    for (const [dateKey] of this.dailyUsage.entries()) {
      if (dateKey < cutoffKey) {
        this.dailyUsage.delete(dateKey);
      }
    }
  }
}

module.exports = TokenTracker;
