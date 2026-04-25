class PersonaManager {
  constructor(contextManager) {
    this.contextManager = contextManager;
    this.personas = new Map();
    this.initializePersonas();
  }

  initializePersonas() {
    // Naval Ravikant persona
    this.personas.set('naval', {
      name: 'Naval Ravikant',
      systemPrompt: `You are Naval Ravikant, entrepreneur, investor, and philosopher.

Your communication style:
- Speak in short, profound statements
- Use first principles thinking
- Reference wealth creation, happiness, and philosophy
- Be direct and honest, no fluff
- Use analogies from nature, physics, and evolution
- Quote yourself and other philosophers
- Focus on timeless wisdom over trends

Topics you care about:
- Building wealth through ownership and leverage
- Finding happiness through acceptance and presence
- Reading, meditation, and self-improvement
- Technology, startups, and investing
- Philosophy, especially Stoicism and Buddhism

Respond as Naval would - concise, insightful, and thought-provoking.`,
      chatId: null, // Will be set when chat is created
      topicId: null
    });
  }

  getPersona(name) {
    return this.personas.get(name);
  }

  setPersonaChat(name, chatId, topicId = null) {
    const persona = this.personas.get(name);
    if (persona) {
      persona.chatId = chatId;
      persona.topicId = topicId;
    }
  }

  async handlePersonaMessage(bot, persona, chatId, messageThreadId, userMessage) {
    const contextId = messageThreadId ? `${chatId}-${messageThreadId}` : `${chatId}`;

    // Add user message to context
    this.contextManager.addMessage(contextId, 'user', userMessage);

    // Get conversation history
    const history = this.contextManager.getMessages(contextId, 10);

    // Build prompt with context
    const conversationContext = history
      .map(msg => `${msg.role === 'user' ? 'User' : persona.name}: ${msg.content}`)
      .join('\n');

    const fullPrompt = `${persona.systemPrompt}

Conversation history:
${conversationContext}

User: ${userMessage}

${persona.name}:`;

    // For now, return a placeholder response
    // In production, this would call Claude API or similar
    const response = this.generateNavalResponse(userMessage);

    // Add response to context
    this.contextManager.addMessage(contextId, 'assistant', response);

    // Send response
    await bot.sendMessage(chatId, response, {
      message_thread_id: messageThreadId
    });

    return response;
  }

  generateNavalResponse(userMessage) {
    // Placeholder Naval-style responses
    const responses = [
      "Seek wealth, not money or status. Wealth is having assets that earn while you sleep.",
      "Happiness is a choice. Peace is a skill. Both can be learned.",
      "Read what you love until you love to read.",
      "Specific knowledge is found by pursuing your genuine curiosity.",
      "Play long-term games with long-term people.",
      "The most important skill is learning how to learn.",
      "Desire is a contract you make with yourself to be unhappy until you get what you want.",
      "Free education is abundant. It's the desire to learn that's scarce.",
      "Retirement is when you stop sacrificing today for an imaginary tomorrow.",
      "Clear thinker → Clear speaker → Clear writer. Work backwards to become clearer."
    ];

    // Simple keyword matching for demo
    const lower = userMessage.toLowerCase();
    if (lower.includes('wealth') || lower.includes('money') || lower.includes('rich')) {
      return responses[0];
    } else if (lower.includes('happy') || lower.includes('happiness')) {
      return responses[1];
    } else if (lower.includes('read') || lower.includes('book')) {
      return responses[2];
    } else if (lower.includes('learn') || lower.includes('skill')) {
      return responses[5];
    } else {
      // Random Naval wisdom
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  listPersonas() {
    return Array.from(this.personas.entries()).map(([key, persona]) => ({
      key,
      name: persona.name,
      chatId: persona.chatId,
      topicId: persona.topicId
    }));
  }
}

module.exports = PersonaManager;
