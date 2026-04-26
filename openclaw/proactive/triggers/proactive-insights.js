/**
 * ProactiveInsights — автономные инсайты и рекомендации
 *
 * Анализирует состояние проекта и проактивно предлагает действия:
 * - Обнаруживает stale issues (нет активности > 3 дней)
 * - Предлагает следующие шаги
 * - Напоминает о важных задачах
 * - Даёт контекстные советы
 */
class ProactiveInsights {
  constructor(bot, chatId, topicId, githubContextProvider) {
    this.bot = bot;
    this.chatId = chatId;
    this.topicId = topicId;
    this.githubContextProvider = githubContextProvider;
    this.lastInsight = null;
    this.interval = 7200000; // 2 hours
    this.enabled = true;
  }

  async shouldTrigger(eventType, eventData) {
    if (!this.enabled) return false;

    const now = Date.now();
    if (!this.lastInsight || now - this.lastInsight > this.interval) {
      return true;
    }

    return false;
  }

  async getAction(eventData) {
    try {
      const context = await this.githubContextProvider.getContext();
      const insight = this.generateInsight(context);

      if (!insight) {
        console.log('[ProactiveInsights] No actionable insights at this time');
        this.lastInsight = Date.now();
        return null;
      }

      this.lastInsight = Date.now();

      return {
        type: 'send_message',
        chatId: this.chatId,
        messageThreadId: this.topicId,
        message: insight
      };
    } catch (error) {
      console.error('[ProactiveInsights] Error:', error.message);
      return null;
    }
  }

  generateInsight(context) {
    // Priority 1: Blocked issues
    if (context.blocked.length > 0) {
      return this.insightBlockedIssues(context.blocked);
    }

    // Priority 2: Stale in-progress issues (no activity > 3 days)
    const staleIssues = this.findStaleIssues(context.inProgress, 3);
    if (staleIssues.length > 0) {
      return this.insightStaleIssues(staleIssues);
    }

    // Priority 3: High-priority open issues not started
    const highPriorityOpen = context.openIssues.filter(i =>
      i.labels && i.labels.some(l => l.name === 'priority' || l.name === 'urgent')
    );
    if (highPriorityOpen.length > 0) {
      return this.insightHighPriorityOpen(highPriorityOpen);
    }

    // Priority 4: Too many in-progress issues
    if (context.inProgress.length > 5) {
      return this.insightTooManyInProgress(context.inProgress);
    }

    // Priority 5: No activity for a while
    if (context.recentActivity.length === 0) {
      return this.insightNoActivity();
    }

    // No actionable insights
    return null;
  }

  insightBlockedIssues(blocked) {
    const parts = [];
    parts.push('🚨 **Proactive Insight: Blocked Issues**\n');
    parts.push(`У вас ${blocked.length} заблокированных задач:\n`);

    blocked.slice(0, 3).forEach(issue => {
      parts.push(`• #${issue.number}: ${issue.title}`);
    });

    parts.push('\n**Рекомендация:**');
    parts.push('Разблокировка задач — приоритет #1. Что мешает продвижению?');

    return parts.join('\n');
  }

  insightStaleIssues(stale) {
    const parts = [];
    parts.push('⏰ **Proactive Insight: Stale Issues**\n');
    parts.push(`${stale.length} задач без активности > 3 дней:\n`);

    stale.slice(0, 3).forEach(issue => {
      const age = this.getTimeSince(issue.updatedAt);
      parts.push(`• #${issue.number}: ${issue.title} (${age})`);
    });

    parts.push('\n**Рекомендация:**');
    parts.push('Обнови статус или закрой если не актуально.');

    return parts.join('\n');
  }

  insightHighPriorityOpen(issues) {
    const parts = [];
    parts.push('🎯 **Proactive Insight: High Priority**\n');
    parts.push(`${issues.length} приоритетных задач ждут начала:\n`);

    issues.slice(0, 3).forEach(issue => {
      parts.push(`• #${issue.number}: ${issue.title}`);
    });

    parts.push('\n**Рекомендация:**');
    parts.push('Начни с самой важной задачи сегодня.');

    return parts.join('\n');
  }

  insightTooManyInProgress(inProgress) {
    const parts = [];
    parts.push('⚡ **Proactive Insight: Focus**\n');
    parts.push(`У вас ${inProgress.length} задач в работе одновременно.\n`);
    parts.push('**Рекомендация:**');
    parts.push('Сфокусируйся на 1-2 задачах для быстрого прогресса.');

    return parts.join('\n');
  }

  insightNoActivity() {
    const parts = [];
    parts.push('💤 **Proactive Insight: No Activity**\n');
    parts.push('Давно не было активности в проекте.\n');
    parts.push('**Рекомендация:**');
    parts.push('Время для weekly planning или retro?');

    return parts.join('\n');
  }

  findStaleIssues(issues, daysThreshold) {
    const threshold = Date.now() - (daysThreshold * 24 * 60 * 60 * 1000);
    return issues.filter(issue => {
      const updated = new Date(issue.updatedAt).getTime();
      return updated < threshold;
    });
  }

  getTimeSince(dateString) {
    const now = new Date();
    const then = new Date(dateString);
    const diffMs = now - then;
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

    if (diffDays > 0) return `${diffDays}d ago`;
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'just now';
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  setInterval(milliseconds) {
    this.interval = milliseconds;
  }
}

module.exports = ProactiveInsights;
