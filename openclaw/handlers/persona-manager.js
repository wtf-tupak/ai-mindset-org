const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

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
    this.router = null; // AgentRouter — set via setRouter()
    this.clawpediaClient = null; // ClawpediaClient — set via setClawpediaClient()
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

  setRouter(router) {
    this.router = router;
    console.log('[PersonaManager] AgentRouter attached');
  }

  setClawpediaClient(client) {
    this.clawpediaClient = client;
    console.log('[PersonaManager] ClawpediaClient attached');
  }

  setManagers(managerRegistry) {
    this.managerRegistry = managerRegistry;
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
    return this.callAIForAgent(messages, 500);
  }

  /**
   * callAIForAgent — same as callAI but with configurable max_tokens.
   * Used by delegateToAgent() which needs 4000 tokens for full agent responses.
   *
   * @param {Array} messages - OpenAI-format message array
   * @param {number} maxTokens - max tokens for response (default 500 for chat, 4000 for agents)
   * @returns {Promise<string>}
   */
  async callAIForAgent(messages, maxTokens = 500) {
    try {
      const isAnthropic = this.baseURL.includes('anthropic.com');

      if (isAnthropic) {
        const systemMessage = messages.find(m => m.role === 'system' || m.role === 'user' && m.content.includes('You are'));
        const conversationMessages = messages.filter(m => m !== systemMessage);

        const response = await axios.post(
          `${this.baseURL}/messages`,
          {
            model: this.model,
            max_tokens: maxTokens,
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
            max_tokens: maxTokens
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

  /**
   * delegateToAgent — load SKILL.md prompt and call AI in one-shot autonomous mode.
   *
   * Flow:
   * 1. Find skill prompt: agent._skillPrompt → skill_source paths → /skills/{name}/SKILL.md
   * 2. Build messages with ONE-SHOT AUTONOMOUS preamble (no clarifying questions)
   * 3. Call callAIForAgent() with agent's max_tokens (default 4000)
   *
   * @param {Object} agent - agent config from registry
   * @param {string} userMessage - original user request
   * @returns {Promise<string>} - agent response text
   */
  async delegateToAgent(agent, userMessage) {
    // 1. Get skill prompt
    let skillPrompt = agent._skillPrompt;

    if (!skillPrompt && agent.skill_source) {
      const sources = Array.isArray(agent.skill_source) ? agent.skill_source : [agent.skill_source];
      const parts = [];
      for (const src of sources) {
        try {
          const fullPath = path.join(__dirname, '../../', src);
          parts.push(await fs.readFile(fullPath, 'utf-8'));
        } catch (e) {
          console.warn(`[PersonaManager] Could not load skill_source "${src}":`, e.message);
        }
      }
      if (parts.length > 0) skillPrompt = parts.join('\n\n---\n\n');
    }

    if (!skillPrompt) {
      try {
        const fallbackPath = path.join(__dirname, '../../skills', agent.name, 'SKILL.md');
        skillPrompt = await fs.readFile(fallbackPath, 'utf-8');
      } catch {}
    }

    if (!skillPrompt) {
      console.warn(`[PersonaManager] No SKILL.md found for agent "${agent.name}". Using generic prompt.`);
      skillPrompt = `You are ${agent.name}, a specialized AI agent. Role: ${agent.role || 'assistant'}. ${agent.description || ''}`;
    }

    // 2. Build one-shot messages
    const messages = [
      {
        role: 'user',
        content: `${skillPrompt}\n\n---\n\n## EXECUTION MODE: ONE-SHOT AUTONOMOUS\n\nExecute the following request in ONE complete response.\nDo NOT ask clarifying questions.\nIf information is missing, make reasonable assumptions and state them explicitly at the start.\nProvide a complete, actionable deliverable.\n\n## USER REQUEST:\n${userMessage}`
      }
    ];

    const maxTokens = agent.max_tokens || 4000;
    console.log(`[PersonaManager] Delegating to "${agent.name}" | max_tokens=${maxTokens} | prompt_len=${skillPrompt.length}`);

    return await this.callAIForAgent(messages, maxTokens);
  }

  /**
   * Send a potentially long message to Telegram, splitting at 4096 char limit.
   *
   * @param {Object} bot - TelegramBot instance
   * @param {number} chatId
   * @param {string} text
   * @param {Object} options - e.g. { message_thread_id }
   */
  async sendLongMessage(bot, chatId, text, options = {}) {
    const TELEGRAM_LIMIT = 4000; // slightly under 4096 for safety
    if (text.length <= TELEGRAM_LIMIT) {
      await bot.sendMessage(chatId, text, options);
      return;
    }

    // Split on newlines to avoid cutting mid-word
    const chunks = [];
    let current = '';
    for (const line of text.split('\n')) {
      if ((current + '\n' + line).length > TELEGRAM_LIMIT) {
        if (current) chunks.push(current);
        current = line;
      } else {
        current = current ? current + '\n' + line : line;
      }
    }
    if (current) chunks.push(current);

    for (let i = 0; i < chunks.length; i++) {
      await bot.sendMessage(chatId, chunks[i], options);
      // Small delay between chunks to avoid rate limiting
      if (i < chunks.length - 1) await new Promise(r => setTimeout(r, 300));
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

    // === AGENT ROUTING (manager mode only) ===
    // If router is attached and mode is manager, try to delegate to a specialized agent.
    // This is the orchestrator layer — Naval stays philosophical and never routes.
    if (mode === 'manager' && this.router) {
      try {
        const routeResult = await this.router.route(userMessage);
        if (routeResult) {
          const { agent, method, trigger } = routeResult;
          console.log(`[PersonaManager] Routing to agent "${agent.name}" via ${method} (trigger: "${trigger}")`);

          // Send typing indicator
          await bot.sendMessage(chatId, `🤖 [${agent.name}] Выполняю задачу...`, {
            message_thread_id: messageThreadId
          });

          const agentResult = await this.delegateToAgent(agent, userMessage);

          // Format response with agent attribution
          const header = `🎯 [Manager → ${agent.name}]`;
          const formattedResult = `${header}\n\n${agentResult}`;

          // Send (with chunking for long responses)
          await this.sendLongMessage(bot, chatId, formattedResult, {
            message_thread_id: messageThreadId
          });

          // Add to context
          this.contextManager.addMessage(contextId, 'assistant', formattedResult);
          if (this.sessionManager) {
            this.sessionManager.logExchange(userMessage, `[Delegated to ${agent.name}]`);
          }

          return formattedResult;
        }
      } catch (routeError) {
        console.error('[PersonaManager] Agent routing error:', routeError.message);
        // Fall through to normal manager flow on error
      }
    }
    // === END AGENT ROUTING ===

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

    // Enrich with Clawpedia knowledge if relevant
    if (this.clawpediaClient && this.clawpediaClient.isRelevantQuery(userMessage)) {
      try {
        console.log('[PersonaManager] Clawpedia query detected, searching...');
        const articles = await this.clawpediaClient.search(userMessage, 3);

        if (articles.length > 0) {
          systemPrompt += `\n\n**Clawpedia Knowledge Base:**\n\n`;
          systemPrompt += `You have access to ${articles.length} relevant articles from Clawpedia:\n\n`;

          articles.forEach((article, i) => {
            systemPrompt += `${i + 1}. **${article.title}**\n`;
            systemPrompt += `   ${article.description}\n`;
            systemPrompt += `   Content preview: ${article.content.substring(0, 500)}...\n`;
            systemPrompt += `   [Full article: https://clawpedia.io/${article.slug}]\n\n`;
          });

          systemPrompt += `Use this knowledge to provide accurate, grounded answers. Cite Clawpedia when using this information.\n`;

          console.log(`[PersonaManager] Enriched with ${articles.length} Clawpedia articles`);
        }
      } catch (error) {
        console.error('[PersonaManager] Clawpedia enrichment error:', error.message);
      }
    }

    // Enrich with additional managers if available
    if (this.managerRegistry && mode === 'manager') {
      try {
        if (this.managerRegistry.hasManager('session')) {
          const sessionMgr = this.managerRegistry.getManager('session');
          const sessionCtx = await sessionMgr.getSessionContext();
          if (sessionCtx.currentTask) {
            systemPrompt += `\n\n**Current Task:** ${sessionCtx.currentTask.goal || 'None'}`;
          }
          if (sessionCtx.blockers.length > 0) {
            systemPrompt += `\n**Blockers:** ${sessionCtx.blockers.join(', ')}`;
          }
        }

        if (this.managerRegistry.hasManager('metrics')) {
          const metricsMgr = this.managerRegistry.getManager('metrics');
          const metrics = await metricsMgr.getRevenueMetrics();
          systemPrompt += `\n\n**Revenue Metrics:** ${metrics.summary}`;
        }
      } catch (error) {
        console.error('Error enriching with managers:', error);
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
      await this.sendLongMessage(bot, chatId, formattedResponse, {
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

    // Bash commands - detect actual commands
    const bashCommands = ['git', 'ls', 'cd', 'pwd', 'cat', 'echo', 'npm', 'node', 'ps', 'kill', 'grep'];
    for (const cmd of bashCommands) {
      if (lower.includes(cmd)) {
        return { type: 'bash', keyword: cmd, message };
      }
    }

    // Action keywords for other types
    const actionKeywords = {
      github: ['создай issue', 'create issue', 'открой issue', 'закрой issue', 'close issue', 'обнови issue', 'update issue'],
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
      let task;

      if (type === 'bash') {
        // Extract command - look for actual bash commands
        let command = 'echo "No command found"';

        const lower = message.toLowerCase();

        // Map Russian phrases to commands
        if (lower.includes('статус') && lower.includes('гит')) {
          command = 'git status';
        } else if (lower.includes('git status')) {
          command = 'git status';
        } else if (lower.includes('ls')) {
          command = 'ls -la';
        } else if (lower.includes('pwd')) {
          command = 'pwd';
        } else {
          // Try to extract command directly
          const cmdMatch = message.match(/\b(git|ls|cd|pwd|cat|echo|npm|node|ps|kill|grep)\b.*/i);
          if (cmdMatch) {
            command = cmdMatch[0];
          }
        }

        task = {
          task_id: `persona-${Date.now()}`,
          type: 'bash',
          command: command,
          context: { source: 'persona-manager', user_message: userMessage }
        };
      } else if (type === 'github') {
        task = {
          task_id: `persona-${Date.now()}`,
          type: 'github',
          action: 'create_issue', // or parse from message
          prompt: message,
          context: { source: 'persona-manager', user_message: userMessage }
        };
      } else {
        task = {
          task_id: `persona-${Date.now()}`,
          type: type,
          prompt: message,
          context: { source: 'persona-manager', user_message: userMessage }
        };
      }

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
