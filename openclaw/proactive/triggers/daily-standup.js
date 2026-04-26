/**
 * DailyStandup — автономный daily standup каждое утро
 *
 * Отправляет ежедневный отчёт:
 * - Что было сделано вчера
 * - Что в плане на сегодня
 * - Есть ли блокеры
 * - Рекомендации по приоритетам
 */
class DailyStandup {
  constructor(bot, chatId, topicId, githubContextProvider) {
    this.bot = bot;
    this.chatId = chatId;
    this.topicId = topicId;
    this.githubContextProvider = githubContextProvider;
    this.lastStandup = null;
    this.standupHour = 9; // 9:00 AM local time
    this.enabled = true;
  }

  async shouldTrigger(eventType, eventData) {
    if (!this.enabled) return false;

    const now = new Date();
    const currentHour = now.getHours();

    // Trigger once per day at standupHour
    if (currentHour === this.standupHour) {
      // Check if already sent today
      if (this.lastStandup) {
        const lastDate = new Date(this.lastStandup);
        if (lastDate.toDateString() === now.toDateString()) {
          return false; // Already sent today
        }
      }
      return true;
    }

    return false;
  }

  async getAction(eventData) {
    try {
      const context = await this.githubContextProvider.getContext();
      const message = this.formatStandupMessage(context);

      this.lastStandup = Date.now();

      return {
        type: 'send_message',
        chatId: this.chatId,
        messageThreadId: this.topicId,
        message
      };
    } catch (error) {
      console.error('[DailyStandup] Error:', error.message);
      return null;
    }
  }

  formatStandupMessage(context) {
    const parts = [];

    parts.push('☀️ **Daily Standup**\n');
    parts.push(`📅 ${new Date().toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n`);

    // Yesterday's activity
    const yesterday = this.getYesterdayActivity(context);
    if (yesterday.length > 0) {
      parts.push('\n**✅ Вчера:**');
      yesterday.forEach(item => parts.push(`• ${item}`));
    } else {
      parts.push('\n**✅ Вчера:** Нет активности');
    }

    // Today's plan
    parts.push('\n**📋 Сегодня в плане:**');
    if (context.inProgress.length > 0) {
      context.inProgress.slice(0, 3).forEach(issue => {
        parts.push(`• #${issue.number}: ${issue.title}`);
      });
    } else if (context.openIssues.length > 0) {
      parts.push(`• Начать работу над #${context.openIssues[0].number}: ${context.openIssues[0].title}`);
    } else {
      parts.push('• Нет открытых задач — время для планирования!');
    }

    // Blockers
    if (context.blocked.length > 0) {
      parts.push('\n**⚠️ Блокеры:**');
      context.blocked.forEach(issue => {
        parts.push(`• #${issue.number}: ${issue.title}`);
      });
    }

    // Recommendations
    parts.push('\n**💡 Рекомендации:**');
    if (context.blocked.length > 0) {
      parts.push('• Приоритет: разблокировать задачи');
    } else if (context.inProgress.length > 3) {
      parts.push('• Слишком много задач в работе — сфокусируйся на 1-2');
    } else if (context.inProgress.length === 0 && context.openIssues.length > 0) {
      parts.push('• Начни с самой приоритетной задачи');
    } else {
      parts.push('• Продолжай в том же духе!');
    }

    return parts.join('\n');
  }

  getYesterdayActivity(context) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const activity = [];

    // Check recent activity from last 24 hours
    context.recentActivity.forEach(item => {
      const itemDate = new Date(item.updatedAt);
      if (itemDate >= yesterday) {
        activity.push(`${item.title} (${item.action})`);
      }
    });

    return activity.slice(0, 5);
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  setStandupHour(hour) {
    this.standupHour = hour;
  }
}

module.exports = DailyStandup;
