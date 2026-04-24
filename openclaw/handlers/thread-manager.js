class ThreadManager {
  constructor(bot) {
    this.bot = bot;
    this.threads = new Map();
  }

  createThread(taskId, type, taskData) {
    const threadId = `thread-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.threads.set(threadId, {
      id: threadId,
      taskId,
      type,
      taskData,
      status: 'running',
      startedAt: new Date(),
      completedAt: null,
      result: null,
      error: null
    });

    return threadId;
  }

  completeThread(threadId, result) {
    const thread = this.threads.get(threadId);
    if (!thread) return;

    thread.status = 'completed';
    thread.completedAt = new Date();
    thread.result = result;
  }

  failThread(threadId, error) {
    const thread = this.threads.get(threadId);
    if (!thread) return;

    thread.status = 'failed';
    thread.completedAt = new Date();
    thread.error = error;
  }

  getStatus() {
    const running = Array.from(this.threads.values()).filter(t => t.status === 'running');
    const completed = Array.from(this.threads.values()).filter(t => t.status === 'completed');
    const failed = Array.from(this.threads.values()).filter(t => t.status === 'failed');

    let status = `📊 **Thread Status**\n\n`;
    status += `🟢 Running: ${running.length}\n`;
    status += `✅ Completed: ${completed.length}\n`;
    status += `❌ Failed: ${failed.length}\n`;
    status += `📦 Total: ${this.threads.size}\n\n`;

    if (running.length > 0) {
      status += `**Active Threads:**\n`;
      running.forEach(t => {
        const duration = Math.floor((Date.now() - t.startedAt.getTime()) / 1000);
        status += `• ${t.id} (${t.type}) - ${duration}s\n`;
      });
    }

    return status;
  }

  cleanup(maxAge = 3600000) {
    // Remove threads older than maxAge (default 1 hour)
    const now = Date.now();
    for (const [threadId, thread] of this.threads.entries()) {
      if (thread.completedAt && (now - thread.completedAt.getTime()) > maxAge) {
        this.threads.delete(threadId);
      }
    }
  }
}

module.exports = ThreadManager;
