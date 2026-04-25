class FeedbackCollector {
  constructor(bot, contextManager) {
    this.bot = bot;
    this.contextManager = contextManager;
    this.feedback = new Map(); // messageId -> feedback data
    this.setupReactionListener();
  }

  setupReactionListener() {
    // Listen for message reactions (callback queries)
    this.bot.on('callback_query', async (query) => {
      await this.handleReaction(query);
    });
  }

  async handleReaction(query) {
    const { message, data } = query;
    const messageId = message.message_id;
    const userId = query.from.id;

    // Parse reaction data (format: "feedback:positive" or "feedback:negative")
    if (!data || !data.startsWith('feedback:')) return;

    const feedbackType = data.split(':')[1];

    const feedback = {
      messageId,
      userId,
      type: feedbackType, // positive, negative, neutral
      timestamp: new Date(),
      messageText: message.text,
      contextId: `${message.chat.id}-${message.message_thread_id || ''}`
    };

    this.feedback.set(messageId, feedback);

    // Store in context metadata
    this.contextManager.setMetadata(
      feedback.contextId,
      `feedback_${messageId}`,
      feedback
    );

    console.log(`Feedback collected: ${feedbackType} for message ${messageId}`);

    // Acknowledge
    await this.bot.answerCallbackQuery(query.id, {
      text: feedbackType === 'positive' ? '✅ Thanks!' : '❌ Noted, will improve'
    });
  }

  recordEdit(messageId, originalText, editedText, contextId) {
    const edit = {
      messageId,
      originalText,
      editedText,
      timestamp: new Date(),
      contextId
    };

    this.feedback.set(`edit_${messageId}`, edit);

    // Store in context metadata
    this.contextManager.setMetadata(
      contextId,
      `edit_${messageId}`,
      edit
    );

    console.log(`Edit recorded for message ${messageId}`);
  }

  getFeedback(messageId) {
    return this.feedback.get(messageId);
  }

  getFeedbackStats() {
    const all = Array.from(this.feedback.values());
    return {
      total: all.length,
      positive: all.filter(f => f.type === 'positive').length,
      negative: all.filter(f => f.type === 'negative').length,
      edits: all.filter(f => f.editedText).length
    };
  }

  getRecentFeedback(limit = 10) {
    return Array.from(this.feedback.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }
}

module.exports = FeedbackCollector;
