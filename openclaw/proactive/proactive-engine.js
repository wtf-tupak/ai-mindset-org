class ProactiveEngine {
  constructor(bot, contextManager) {
    this.bot = bot;
    this.contextManager = contextManager;
    this.monitors = [];
    this.triggers = [];
    this.enabled = true;
  }

  registerMonitor(monitor) {
    this.monitors.push(monitor);
    console.log(`Registered monitor: ${monitor.constructor.name}`);
  }

  registerTrigger(trigger) {
    this.triggers.push(trigger);
    console.log(`Registered trigger: ${trigger.constructor.name}`);
  }

  async processEvent(eventType, eventData) {
    if (!this.enabled) return;

    console.log(`Processing event: ${eventType}`);

    // Pass event to all monitors
    for (const monitor of this.monitors) {
      try {
        await monitor.process(eventType, eventData);
      } catch (error) {
        console.error(`Monitor ${monitor.constructor.name} error:`, error);
      }
    }

    // Check all triggers
    for (const trigger of this.triggers) {
      try {
        const shouldTrigger = await trigger.shouldTrigger(eventType, eventData);
        if (shouldTrigger) {
          const action = await trigger.getAction(eventData);
          await this.executeAction(action);
        }
      } catch (error) {
        console.error(`Trigger ${trigger.constructor.name} error:`, error);
      }
    }
  }

  async executeAction(action) {
    const { type, chatId, messageThreadId, message, task } = action;

    switch (type) {
      case 'send_message':
        await this.bot.sendMessage(chatId, message, {
          message_thread_id: messageThreadId,
          parse_mode: 'Markdown'
        });
        break;

      case 'execute_task':
        // Delegate to task handler
        if (this.taskHandler) {
          await this.taskHandler.handleTask(chatId, task, messageThreadId);
        }
        break;

      default:
        console.warn(`Unknown action type: ${type}`);
    }
  }

  setTaskHandler(taskHandler) {
    this.taskHandler = taskHandler;
  }

  enable() {
    this.enabled = true;
    console.log('Proactive engine enabled');
  }

  disable() {
    this.enabled = false;
    console.log('Proactive engine disabled');
  }

  getStatus() {
    return {
      enabled: this.enabled,
      monitors: this.monitors.length,
      triggers: this.triggers.length
    };
  }
}

module.exports = ProactiveEngine;
