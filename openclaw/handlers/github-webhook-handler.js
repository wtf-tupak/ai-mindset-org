class GitHubWebhookHandler {
  constructor(bot, forumGroupId, forumTopicId) {
    this.bot = bot;
    this.forumGroupId = forumGroupId;
    this.forumTopicId = forumTopicId;
    this.proactiveEngine = null;
  }

  setProactiveEngine(engine) {
    this.proactiveEngine = engine;
  }

  async handleIssueEvent(payload) {
    const { action, issue, repository } = payload;

    // Only handle opened, closed, reopened, labeled
    if (!['opened', 'closed', 'reopened', 'labeled'].includes(action)) {
      console.log(`Ignoring issue action: ${action}`);
      return;
    }

    const message = this.formatIssueMessage(action, issue, repository);

    // Send to forum topic if configured, otherwise to user DM
    const chatId = this.forumGroupId || this.bot.options.polling.params.chat_id;
    const options = this.forumTopicId ? { message_thread_id: this.forumTopicId } : {};

    try {
      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        ...options
      });
      console.log(`Sent ${action} notification for issue #${issue.number}`);
    } catch (error) {
      console.error('Error sending GitHub notification:', error);
    }

    // Feed event to proactive engine
    if (this.proactiveEngine) {
      await this.proactiveEngine.processEvent('github_issue', payload);
    }
  }

  formatIssueMessage(action, issue, repository, label = null) {
    const emoji = {
      opened: '🆕',
      closed: '✅',
      reopened: '🔄',
      labeled: '🏷️'
    }[action];

    const actionText = action.charAt(0).toUpperCase() + action.slice(1);
    const labelText = label ? ` (${label.name})` : '';

    return `${emoji} **Issue ${actionText}${labelText}**

**${issue.title}** (#${issue.number})
${repository.full_name}

${issue.body ? issue.body.substring(0, 200) + (issue.body.length > 200 ? '...' : '') : 'No description'}

🔗 [View Issue](${issue.html_url})`;
  }
}

module.exports = GitHubWebhookHandler;
