class PromptAdapter {
  constructor(preferenceStore, feedbackCollector) {
    this.preferenceStore = preferenceStore;
    this.feedbackCollector = feedbackCollector;
  }

  adaptPersonaPrompt(userId, basePrompt, personaName) {
    // Get user preferences
    const tone = this.preferenceStore.get(userId, 'tone', 'balanced');
    const verbosity = this.preferenceStore.get(userId, 'verbosity', 'medium');
    const language = this.preferenceStore.get(userId, 'language', 'en');

    // Adapt prompt based on preferences
    let adapted = basePrompt;

    // Tone adaptation
    if (tone === 'casual') {
      adapted += `\n\nTone: Be more casual and friendly. Use conversational language.`;
    } else if (tone === 'formal') {
      adapted += `\n\nTone: Be more formal and professional. Use precise language.`;
    }

    // Verbosity adaptation
    if (verbosity === 'short') {
      adapted += `\n\nLength: Keep responses very brief (1-2 sentences max).`;
    } else if (verbosity === 'long') {
      adapted += `\n\nLength: Provide detailed, comprehensive responses.`;
    }

    // Language adaptation
    if (language !== 'en') {
      adapted += `\n\nLanguage: Respond in ${this.getLanguageName(language)}.`;
    }

    return adapted;
  }

  adaptAgentPrompt(userId, basePrompt, agentName) {
    // Get feedback patterns for this agent
    const recentFeedback = this.feedbackCollector.getRecentFeedback(20);
    const agentFeedback = recentFeedback.filter(f =>
      f.messageText?.includes(agentName)
    );

    const positiveCount = agentFeedback.filter(f => f.type === 'positive').length;
    const negativeCount = agentFeedback.filter(f => f.type === 'negative').length;

    let adapted = basePrompt;

    // If mostly negative feedback, add correction
    if (negativeCount > positiveCount && negativeCount > 2) {
      adapted += `\n\nIMPORTANT: Recent feedback suggests users want different output. Be more careful and thorough.`;
    }

    // User-specific preferences
    const detailLevel = this.preferenceStore.get(userId, `${agentName}_detail`, 'medium');
    if (detailLevel === 'high') {
      adapted += `\n\nProvide extra detail and explanation in your output.`;
    } else if (detailLevel === 'low') {
      adapted += `\n\nBe concise. Provide only essential information.`;
    }

    return adapted;
  }

  learnFromFeedback(userId, messageId, feedbackType) {
    const feedback = this.feedbackCollector.getFeedback(messageId);
    if (!feedback) return;

    // Adjust preferences based on feedback
    if (feedbackType === 'positive') {
      // Reinforce current settings
      this.preferenceStore.increment(userId, 'positive_feedback_count');
    } else if (feedbackType === 'negative') {
      // Try to adjust
      this.preferenceStore.increment(userId, 'negative_feedback_count');

      // If too many negatives, suggest verbosity change
      const negCount = this.preferenceStore.get(userId, 'negative_feedback_count', 0);
      if (negCount > 3) {
        const currentVerbosity = this.preferenceStore.get(userId, 'verbosity', 'medium');
        const newVerbosity = currentVerbosity === 'short' ? 'medium' : 'short';
        this.preferenceStore.set(userId, 'verbosity', newVerbosity);
        console.log(`Adapted verbosity for user ${userId}: ${currentVerbosity} → ${newVerbosity}`);
      }
    }
  }

  getLanguageName(code) {
    const languages = {
      'en': 'English',
      'ru': 'Russian (русский)',
      'uk': 'Ukrainian (українська)',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German'
    };
    return languages[code] || code;
  }

  getUserAdaptations(userId) {
    return {
      tone: this.preferenceStore.get(userId, 'tone', 'balanced'),
      verbosity: this.preferenceStore.get(userId, 'verbosity', 'medium'),
      language: this.preferenceStore.get(userId, 'language', 'en'),
      positiveFeedback: this.preferenceStore.get(userId, 'positive_feedback_count', 0),
      negativeFeedback: this.preferenceStore.get(userId, 'negative_feedback_count', 0)
    };
  }
}

module.exports = PromptAdapter;
