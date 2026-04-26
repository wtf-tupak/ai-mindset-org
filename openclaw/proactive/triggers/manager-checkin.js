class ManagerCheckin {
  constructor(bot, chatId, topicId, githubContextProvider) {
    this.bot = bot;
    this.chatId = chatId;
    this.topicId = topicId;
    this.githubContextProvider = githubContextProvider;
    this.lastCheckin = null;
    this.interval = 14400000; // 4 hours
    this.enabled = true;
  }

  async shouldTrigger(eventType, eventData) {
    // This trigger is time-based, not event-based
    // Called by proactive engine periodically
    if (!this.enabled) return false;

    const now = Date.now();
    if (!this.lastCheckin || now - this.lastCheckin > this.interval) {
      return true;
    }

    return false;
  }

  async getAction(eventData) {
    try {
      const context = await this.githubContextProvider.getContext();

      // Skip check-in if no changes detected (COO recommendation)
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
    } catch (error) {
      console.error('Manager check-in error:', error);
      return null;
    }
  }

  shouldSkipCheckin(context) {
    // NEVER skip — always send check-in for autonomous behavior
    // User wants OpenClaw to be proactive, not silent
    return false;
  }

  formatCheckinMessage(context) {
    const parts = [];

    parts.push('🎯 **Manager Check-in**\n');

    // Progress summary
    if (context.inProgress.length > 0) {
      parts.push('**In Progress:**');
      context.inProgress.slice(0, 3).forEach(issue => {
        const age = this.getTimeSince(issue.updatedAt);
        parts.push(`• #${issue.number}: ${issue.title} (${age})`);
      });
      parts.push('');
    }

    // Blockers
    if (context.blocked.length > 0) {
      parts.push('⚠️ **Blocked:**');
      context.blocked.forEach(issue => {
        parts.push(`• #${issue.number}: ${issue.title}`);
      });
      parts.push('');
    }

    // Stale issues (no activity > 2 hours)
    const staleIssues = this.findStaleIssues(context.inProgress);
    if (staleIssues.length > 0) {
      parts.push('⏰ **No Recent Activity:**');
      staleIssues.forEach(issue => {
        const age = this.getTimeSince(issue.updatedAt);
        parts.push(`• #${issue.number}: ${issue.title} (${age})`);
      });
      parts.push('');
    }

    // Focus question
    parts.push('**Focus Question:**');
    if (context.blocked.length > 0) {
      parts.push('What\'s blocking you? Can I help unblock anything?');
    } else if (staleIssues.length > 0) {
      parts.push('What are you working on right now?');
    } else if (context.inProgress.length > 0) {
      parts.push('How\'s progress on current tasks?');
    } else {
      parts.push('What\'s the next priority?');
    }

    return parts.join('\n');
  }

  findStaleIssues(inProgress) {
    const twoHoursAgo = Date.now() - 7200000; // 2 hours
    return inProgress.filter(issue => {
      const updated = new Date(issue.updatedAt).getTime();
      return updated < twoHoursAgo;
    });
  }

  getTimeSince(dateString) {
    const now = new Date();
    const then = new Date(dateString);
    const diffMs = now - then;
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
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

module.exports = ManagerCheckin;
