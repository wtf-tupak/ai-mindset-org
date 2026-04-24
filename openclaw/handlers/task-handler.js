const { v4: uuidv4 } = require('uuid');
const AgentExecutor = require('../executors/agent-executor');
const BashExecutor = require('../executors/bash-executor');
const GithubExecutor = require('../executors/github-executor');

class TaskHandler {
  constructor(bot, threadManager) {
    this.bot = bot;
    this.threadManager = threadManager;
    this.agentExecutor = new AgentExecutor();
    this.bashExecutor = new BashExecutor();
    this.githubExecutor = new GithubExecutor();
  }

  async handleTask(chatId, task, messageThreadId = null) {
    const { task_id, type, agent, prompt, command, context } = task;

    // Create thread
    const threadId = this.threadManager.createThread(task_id, type, task);

    // Send acknowledgment
    const sendOptions = messageThreadId ? { message_thread_id: messageThreadId } : {};
    await this.bot.sendMessage(chatId, `🔧 Task received: ${task_id}\n📋 Type: ${type}\n🧵 Thread: ${threadId}\n\nExecuting...`, sendOptions);

    try {
      let result;

      // Route to appropriate executor
      switch (type) {
        case 'agent':
          if (!agent || !prompt) {
            throw new Error('Agent tasks require "agent" and "prompt" fields');
          }
          result = await this.agentExecutor.execute(agent, prompt, context);
          break;

        case 'bash':
          if (!command) {
            throw new Error('Bash tasks require "command" field');
          }
          result = await this.bashExecutor.execute(command);
          break;

        case 'github':
          if (!task.operation) {
            throw new Error('GitHub tasks require "operation" field');
          }
          result = await this.githubExecutor.execute(task);
          break;

        default:
          throw new Error(`Unknown task type: ${type}`);
      }

      // Update thread status
      this.threadManager.completeThread(threadId, result);

      // Send result
      const response = {
        task_id,
        status: result.status || 'success',
        result: result.result || result.output,
        quality_score: result.quality_score || null,
        reason: result.reason || null
      };

      await this.bot.sendMessage(chatId, `✅ Task completed: ${task_id}\n\n\`\`\`json\n${JSON.stringify(response, null, 2)}\n\`\`\``, {
        parse_mode: 'Markdown',
        ...sendOptions
      });

    } catch (error) {
      // Update thread with error
      this.threadManager.failThread(threadId, error.message);

      // Send error
      const errorResponse = {
        task_id,
        status: 'failed',
        error: error.message
      };

      await this.bot.sendMessage(chatId, `❌ Task failed: ${task_id}\n\n\`\`\`json\n${JSON.stringify(errorResponse, null, 2)}\n\`\`\``, {
        parse_mode: 'Markdown',
        ...sendOptions
      });
    }
  }
}

module.exports = TaskHandler;
