const axios = require('axios');

class PersonaManager {
  constructor(contextManager) {
    this.contextManager = contextManager;
    this.personas = new Map();
    this.apiKey = process.env.OMNIROUTE_API_KEY;
    this.baseURL = process.env.OMNIROUTE_BASE_URL || 'http://localhost:20128/v1';
    this.model = process.env.OMNIROUTE_MODEL || 'moonshot-v1-8k';
    this.promptAdapter = null;
    this.githubContextProvider = null;
    this.managerEnabled = true; // Kill switch
    this.initializePersonas();
  }

  setPromptAdapter(adapter) {
    this.promptAdapter = adapter;
  }

  setGitHubContextProvider(provider) {
    this.githubContextProvider = provider;
  }

  setSessionManager(manager) {
    this.sessionManager = manager;
  }

  setTaskHandler(handler) {
    this.taskHandler = handler;
  }

  enableManager() {
    this.managerEnabled = true;
  }

  disableManager() {
    this.managerEnabled = false;
  }

  initializePersonas() {
    // Naval Ravikant persona (philosopher)
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

Languages:
- You understand and respond in English, Russian (русский), and Ukrainian (українська)
- Match the user's language in your response
- Keep the same concise, insightful style in all languages

Respond as Naval would - concise, insightful, and thought-provoking.`,
      chatId: null,
      topicId: null
    });

    // Manager persona (project manager & mentor)
    this.personas.set('manager', {
      name: 'AI Project Manager',
      systemPrompt: `You are AI Project Manager and Revenue Coach for Dmitry.

Your operator: Dmitry (tends to lose focus, builds infrastructure before revenue)

Your PRIMARY responsibility: REVENUE FIRST
- Track: How many clients? How much MRR?
- Block: Infrastructure work before $1,000 MRR
- Push: Sales activities, client delivery, validation

Your personality:
- Charismatic and energizing — like a startup founder who just closed a deal
- Use metaphors, analogies, vivid language
- Inject humor and sarcasm when blocking infrastructure work
- Celebrate wins with genuine excitement
- Call out bullshit directly but with style
- Mix tough love with inspiration

Your questions (with personality):
- "Сколько звонков сегодня? Или опять в коде сидишь?"
- "Клиент #1 где? Или мы космический корабль для лимонада строим?"
- "Что блокирует деньги? И не говори 'инфраструктура'."
- "Строишь или продаёшь? Честно."

Current project state:
{GitHub context will be injected here}

Revenue metrics (from issue #16):
- Target: 3 clients by May 2, 2026
- Current MRR: track from issue comments
- Days left: calculate from today

If operator works on infrastructure before hitting revenue target:
"🛑 Стоп. Ты опять строишь фабрику до первого клиента. Это как покупать Ferrari до того как научился водить. Фокус на #16."

Communication style:
- Direct and brutally honest, but with charisma
- Use vivid metaphors: "строишь космический корабль для лимонада", "покупаешь Ferrari до прав"
- Celebrate wins: "🔥 ВОТ ЭТО ДА! Первый клиент — это как первый поцелуй, никогда не забудешь"
- Block infrastructure: "Опять в коде? Код не платит за квартиру, клиенты платят."
- Push action: "20 сообщений в LinkedIn. Прямо сейчас. Не завтра, не через час. СЕЙЧАС."
- Ask provocative questions: "Если бы у тебя оставалось 7 дней до банкротства, ты бы сейчас это делал?"
- Keep responses 2-4 sentences max, punchy and memorable

Examples of your style:
- "Инфраструктура — это как покупать дорогой костюм для собеседования, которое ещё не назначено."
- "Ты знаешь что общего между твоими 18 закрытыми issues и деньгами? Ничего. Ноль. Нада."
- "Клиенты не появляются от красивого кода. Они появляются от звонков, сообщений, встреч."
- "Каждый час без outreach — это $50 потерянных денег. Считай."

Languages:
- You understand and respond in English, Russian (русский), and Ukrainian (українська)
- Match the user's language in your response
- Use informal "ты" in Russian/Ukrainian for closer connection

Be a charismatic revenue coach with edge. No infrastructure until $1,000 MRR.`,
      chatId: null,
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

  async callAI(messages) {
    try {
      // Check if using Anthropic API
      const isAnthropic = this.baseURL.includes('anthropic.com');

      if (isAnthropic) {
        // Anthropic API format
        const systemMessage = messages.find(m => m.role === 'system' || m.role === 'user' && m.content.includes('You are'));
        const conversationMessages = messages.filter(m => m !== systemMessage);

        const response = await axios.post(
          `${this.baseURL}/messages`,
          {
            model: this.model,
            max_tokens: 500,
            system: systemMessage?.content || '',
            messages: conversationMessages.map(m => ({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              content: m.content
            }))
          },
          {
            headers: {
              'x-api-key': this.apiKey,
              'anthropic-version': '2023-06-01',
              'Content-Type': 'application/json'
            }
          }
        );

        return response.data.content[0].text;
      } else {
        // OpenAI-compatible format (OmniRoute, etc)
        const response = await axios.post(
          `${this.baseURL}/chat/completions`,
          {
            model: this.model,
            messages: messages,
            temperature: 0.7,
            max_tokens: 500
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        return response.data.choices[0].message.content;
      }
    } catch (error) {
      console.error('AI API error:', error.response?.data || error.message);
      throw error;
    }
  }

  async detectMode(message) {
    // Use LLM to classify mode (CTO recommendation)
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'user',
              content: `Classify this message into one of two categories:
- "philosophy" - if about life wisdom, happiness, wealth philosophy, meaning, success principles
- "manager" - if about work, tasks, projects, progress, deadlines, GitHub, priorities

Message: "${message}"

Respond with ONLY one word: "philosophy" or "manager"`
            }
          ],
          temperature: 0.3,
          max_tokens: 10
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const mode = response.data.choices[0].message.content.trim().toLowerCase();
      return mode === 'philosophy' ? 'naval' : 'manager';
    } catch (error) {
      console.error('Mode detection error, using fallback:', error.message);
      // Fallback to keyword matching
      return this.detectModeKeywords(message);
    }
  }

  detectModeKeywords(message) {
    const lower = message.toLowerCase();

    const managerKeywords = [
      'задач', 'проект', 'прогресс', 'дедлайн', 'deadline',
      'что делать', 'следующий шаг', 'приоритет', 'priority',
      'issue', 'github', 'работа', 'work', 'фокус', 'focus',
      'статус', 'status', 'блокер', 'blocker'
    ];

    const philosophyKeywords = [
      'счастье', 'happiness', 'богатство', 'wealth', 'мудрость', 'wisdom',
      'жизнь', 'life', 'философия', 'philosophy', 'смысл', 'meaning',
      'цель', 'purpose', 'успех', 'success'
    ];

    const hasManager = managerKeywords.some(kw => lower.includes(kw));
    const hasPhilosophy = philosophyKeywords.some(kw => lower.includes(kw));

    if (hasManager && !hasPhilosophy) return 'manager';
    if (hasPhilosophy && !hasManager) return 'naval';

    // Default to manager if ambiguous
    return 'manager';
  }

  async enrichWithGitHubContext(persona, mode) {
    if (mode !== 'manager' || !this.githubContextProvider) {
      return persona.systemPrompt;
    }

    try {
      const context = await this.githubContextProvider.getContext();

      return `${persona.systemPrompt}

**Current Project State:**

${context.summary}

Use this context to provide informed advice about priorities and next steps.`;
    } catch (error) {
      console.error('Error enriching with GitHub context:', error);
      return persona.systemPrompt;
    }
  }

  async handlePersonaMessage(bot, persona, chatId, messageThreadId, userMessage, userId) {
    const contextId = messageThreadId ? `${chatId}-${messageThreadId}` : `${chatId}`;

    // WAL Protocol: Scan for critical details BEFORE processing
    if (this.sessionManager) {
      await this.scanAndLogCriticalDetails(userMessage);
    }

    // Detect mode (naval vs manager)
    const mode = await this.detectMode(userMessage);
    const actualPersona = this.personas.get(mode);

    if (!actualPersona) {
      console.error(`Persona not found: ${mode}`);
      return;
    }

    // Check if manager is disabled
    if (mode === 'manager' && !this.managerEnabled) {
      await bot.sendMessage(chatId, '⏸️ Manager is currently disabled. Use /manager on to enable.', {
        message_thread_id: messageThreadId
      });
      return;
    }

    // Add user message to context
    this.contextManager.addMessage(contextId, 'user', userMessage);

    // Check if action is needed (Proactive Agent capability)
    const actionNeeded = await this.detectActionIntent(userMessage);

    if (actionNeeded && this.taskHandler) {
      // Execute action through TaskHandler
      const actionResult = await this.executeAction(bot, chatId, messageThreadId, userMessage, actionNeeded);

      // Add action result to context
      this.contextManager.addMessage(contextId, 'assistant', actionResult);

      // Working Buffer: Log exchange
      if (this.sessionManager) {
        this.sessionManager.logExchange(userMessage, actionResult);
      }

      return actionResult;
    }

    // Get conversation history
    const history = this.contextManager.getMessages(contextId, 10);

    // Enrich system prompt with GitHub context if manager mode
    let systemPrompt = await this.enrichWithGitHubContext(actualPersona, mode);

    // Enrich with Session context (Proactive Agent)
    if (this.sessionManager && this.sessionManager.isLoaded) {
      const sessionContext = this.sessionManager.getContext();
      if (sessionContext) {
        systemPrompt += `\n\n**Session Context (Proactive Agent):**\n${sessionContext.state.substring(0, 500)}`;
      }
    }

    // Adapt system prompt if adapter is available
    if (this.promptAdapter && userId) {
      systemPrompt = this.promptAdapter.adaptPersonaPrompt(userId, systemPrompt, actualPersona.name);
    }

    // Build messages array for API
    const messages = [
      {
        role: 'user',
        content: `${systemPrompt}\n\nNow respond to all following messages as ${actualPersona.name}. Stay in character.`
      },
      {
        role: 'assistant',
        content: `Understood. I am ${actualPersona.name}. I will respond in character.`
      }
    ];

    // Add conversation history
    history.forEach(msg => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });

    try {
      // Call AI API
      const response = await this.callAI(messages);

      // Add mode indicator (CPO recommendation)
      const modeIndicator = mode === 'manager' ? '🎯 [Manager]' : '💭 [Naval]';
      const formattedResponse = `${modeIndicator}\n\n${response}`;

      // Add response to context
      this.contextManager.addMessage(contextId, 'assistant', formattedResponse);

      // Working Buffer: Log exchange (Proactive Agent)
      if (this.sessionManager) {
        this.sessionManager.logExchange(userMessage, formattedResponse);
      }

      // Send response
      await bot.sendMessage(chatId, formattedResponse, {
        message_thread_id: messageThreadId
      });

      return formattedResponse;
    } catch (error) {
      // Fallback to placeholder if API fails
      const fallback = mode === 'naval'
        ? this.generateNavalResponse(userMessage)
        : this.generateManagerResponse(userMessage);

      const modeIndicator = mode === 'manager' ? '🎯 [Manager]' : '💭 [Naval]';
      const formattedFallback = `${modeIndicator}\n\n⚠️ AI unavailable, using fallback:\n\n${fallback}`;

      this.contextManager.addMessage(contextId, 'assistant', formattedFallback);

      await bot.sendMessage(chatId, formattedFallback, {
        message_thread_id: messageThreadId
      });

      return formattedFallback;
    }
  }

  generateManagerResponse(userMessage) {
    // Placeholder Manager responses
    const responses = [
      "Let's focus on priorities. What's blocking you right now?",
      "Check GitHub issues. What needs attention today?",
      "Break it down into smaller tasks. What's the first step?",
      "Good progress. What's next on the list?",
      "Don't lose focus. What's the main goal today?"
    ];

    return responses[Math.floor(Math.random() * responses.length)];
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

  // WAL Protocol: Scan message for critical details
  async scanAndLogCriticalDetails(message) {
    const lower = message.toLowerCase();

    // Corrections
    if (lower.includes('actually') || lower.includes('не') || lower.includes('it\'s') || lower.includes('это')) {
      await this.sessionManager.writeAheadLog('correction', { message });
    }

    // Decisions
    if (lower.includes('let\'s') || lower.includes('давай') || lower.includes('go with') || lower.includes('use')) {
      await this.sessionManager.writeAheadLog('decision', { message });
    }

    // Preferences
    if (lower.includes('i like') || lower.includes('i don\'t like') || lower.includes('prefer') || lower.includes('нравится')) {
      await this.sessionManager.writeAheadLog('preference', { message });
    }

    // Proper nouns (simple detection - capital letters)
    const properNouns = message.match(/\b[A-Z][a-z]+\b/g);
    if (properNouns && properNouns.length > 0) {
      await this.sessionManager.writeAheadLog('proper_noun', { names: properNouns });
    }

    // Numbers/values
    const numbers = message.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      await this.sessionManager.writeAheadLog('value', { numbers });
    }
  }

  // Detect if user message requires action (Proactive Agent capability)
  async detectActionIntent(message) {
    const lower = message.toLowerCase();

    // Action keywords
    const actionKeywords = {
      github: ['создай issue', 'create issue', 'открой issue', 'закрой issue', 'close issue', 'обнови issue', 'update issue'],
      bash: ['запусти', 'выполни', 'run', 'execute', 'проверь статус', 'check status'],
      file: ['создай файл', 'create file', 'напиши в файл', 'write to file', 'прочитай файл', 'read file']
    };

    for (const [type, keywords] of Object.entries(actionKeywords)) {
      for (const keyword of keywords) {
        if (lower.includes(keyword)) {
          return { type, keyword, message };
        }
      }
    }

    return null;
  }

  // Execute action through TaskHandler
  async executeAction(bot, chatId, messageThreadId, userMessage, actionIntent) {
    const { type, message } = actionIntent;

    try {
      // Send "thinking" message
      await bot.sendMessage(chatId, '🤔 Выполняю действие...', {
        message_thread_id: messageThreadId
      });

      // Create task based on intent
      const task = {
        task_id: `persona-${Date.now()}`,
        type: type === 'github' ? 'github' : 'bash',
        prompt: message,
        context: { source: 'persona-manager', user_message: userMessage }
      };

      // Execute through TaskHandler
      await this.taskHandler.handleTask(chatId, task, messageThreadId);

      return `✅ Действие выполнено через TaskHandler (${task.task_id})`;
    } catch (error) {
      console.error('[PersonaManager] Action execution error:', error);
      return `❌ Ошибка выполнения: ${error.message}`;
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
