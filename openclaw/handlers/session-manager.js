const fs = require('fs').promises;
const path = require('path');

class SessionManager {
  constructor() {
    this.workspaceDir = path.join(__dirname, '..');
    this.sessionState = null;
    this.workingBuffer = [];
    this.isLoaded = false;
  }

  // Session Start: Load all workspace files
  async loadSession() {
    console.log('[SessionManager] Loading session...');

    try {
      // Load all workspace files (per Proactive Agent spec)
      const [onboarding, user, soul, sessionState, agents, memory, heartbeat, tools] = await Promise.all([
        this.readFile('ONBOARDING.md'),
        this.readFile('USER.md'),
        this.readFile('SOUL.md'),
        this.readFile('SESSION-STATE.md'),
        this.readFile('AGENTS.md'),
        this.readFile('MEMORY.md'),
        this.readFile('HEARTBEAT.md'),
        this.readFile('TOOLS.md')
      ]);

      this.sessionState = {
        onboarding,
        user,
        soul,
        state: sessionState,
        agents,
        memory,
        heartbeat,
        tools,
        loadedAt: new Date().toISOString()
      };

      this.isLoaded = true;
      console.log('[SessionManager] Session loaded successfully');
      console.log(`[SessionManager] Loaded: ONBOARDING (${onboarding.length} chars), USER (${user.length} chars), SOUL (${soul.length} chars), SESSION-STATE (${sessionState.length} chars)`);
      console.log(`[SessionManager] Loaded: AGENTS (${agents.length} chars), MEMORY (${memory.length} chars), HEARTBEAT (${heartbeat.length} chars), TOOLS (${tools.length} chars)`);

      return this.sessionState;
    } catch (error) {
      console.error('[SessionManager] Error loading session:', error.message);
      this.isLoaded = false;
      return null;
    }
  }

  // WAL Protocol: Write critical details BEFORE responding
  async writeAheadLog(type, data) {
    console.log(`[SessionManager] WAL: ${type}`);

    const entry = {
      timestamp: new Date().toISOString(),
      type, // 'correction' | 'decision' | 'preference' | 'proper_noun' | 'value'
      data
    };

    // Add to working buffer
    this.workingBuffer.push(entry);

    // Immediately write to SESSION-STATE.md
    await this.updateSessionState(entry);

    console.log(`[SessionManager] WAL written: ${type} - ${JSON.stringify(data).substring(0, 100)}`);
  }

  // Update SESSION-STATE.md with new entry
  async updateSessionState(entry) {
    try {
      const sessionStatePath = path.join(this.workspaceDir, 'SESSION-STATE.md');
      let content = await fs.readFile(sessionStatePath, 'utf-8');

      // Find "## Important Details (WAL)" section
      const walSection = '\n## Important Details (WAL)\n';
      const walIndex = content.indexOf(walSection);

      if (walIndex !== -1) {
        // Insert after WAL header
        const insertPoint = walIndex + walSection.length;
        const newEntry = `\n**${entry.timestamp}** [${entry.type}]: ${JSON.stringify(entry.data)}\n`;
        content = content.slice(0, insertPoint) + newEntry + content.slice(insertPoint);
      } else {
        // Append at end if section doesn't exist
        content += `\n## Important Details (WAL)\n\n**${entry.timestamp}** [${entry.type}]: ${JSON.stringify(entry.data)}\n`;
      }

      // Update "Last Updated" timestamp
      content = content.replace(/\*\*Last Updated:\*\* .+/, `**Last Updated:** ${entry.timestamp}`);

      await fs.writeFile(sessionStatePath, content, 'utf-8');
      console.log('[SessionManager] SESSION-STATE.md updated');
    } catch (error) {
      console.error('[SessionManager] Error updating SESSION-STATE:', error.message);
    }
  }

  // Working Buffer: Log exchange (only after 60% context threshold)
  logExchange(userMessage, agentResponse) {
    // Note: 60% threshold detection not implemented in OpenClaw
    // This would require context tracking from Telegram bot
    // For now, log all exchanges for safety

    const entry = {
      timestamp: new Date().toISOString(),
      user: userMessage,
      agent: agentResponse.substring(0, 200) // Summary
    };

    this.workingBuffer.push(entry);
    console.log(`[SessionManager] Buffer: logged exchange (buffer size: ${this.workingBuffer.length})`);
  }

  // Compaction Recovery: Read buffer after context loss
  async recoverFromCompaction() {
    console.log('[SessionManager] Attempting compaction recovery...');

    try {
      // 1. Read working buffer FIRST
      const bufferPath = path.join(this.workspaceDir, 'memory', 'working-buffer.md');
      const bufferContent = await fs.readFile(bufferPath, 'utf-8');

      // 2. Read SESSION-STATE.md SECOND
      await this.loadSession();

      console.log('[SessionManager] Recovery complete - buffer and state loaded');
      return {
        buffer: bufferContent,
        state: this.sessionState
      };
    } catch (error) {
      console.error('[SessionManager] Recovery failed:', error.message);
      return null;
    }
  }

  // Create daily note file
  async createDailyNote(content) {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const dailyPath = path.join(this.workspaceDir, 'memory', `${today}.md`);

      // Append to existing or create new
      let existing = '';
      try {
        existing = await fs.readFile(dailyPath, 'utf-8');
      } catch (err) {
        // File doesn't exist, will create
      }

      const timestamp = new Date().toISOString();
      const entry = `\n## ${timestamp}\n\n${content}\n\n---\n`;

      await fs.writeFile(dailyPath, existing + entry, 'utf-8');
      console.log(`[SessionManager] Daily note updated: ${today}.md`);
    } catch (error) {
      console.error('[SessionManager] Error creating daily note:', error.message);
    }
  }

  // Session End: Commit buffer to SESSION-STATE.md
  async commitSession() {
    console.log('[SessionManager] Committing session...');

    try {
      // Write working buffer to memory/working-buffer.md
      const bufferPath = path.join(this.workspaceDir, 'memory', 'working-buffer.md');
      let bufferContent = `# Working Buffer (Danger Zone Log)\n\n**Status:** ACTIVE\n**Started:** ${this.sessionState?.loadedAt || new Date().toISOString()}\n\n---\n\n`;

      for (const entry of this.workingBuffer) {
        bufferContent += `## ${entry.timestamp} Human\n${entry.user || 'N/A'}\n\n`;
        bufferContent += `## ${entry.timestamp} Agent (summary)\n${entry.agent || 'N/A'}\n\n`;
      }

      await fs.writeFile(bufferPath, bufferContent, 'utf-8');
      console.log(`[SessionManager] Working buffer committed (${this.workingBuffer.length} entries)`);

      // Create daily note with session summary
      if (this.workingBuffer.length > 0) {
        const summary = `Session commit: ${this.workingBuffer.length} exchanges logged`;
        await this.createDailyNote(summary);
      }

      // Update SESSION-STATE.md with final timestamp
      const sessionStatePath = path.join(this.workspaceDir, 'SESSION-STATE.md');
      let content = await fs.readFile(sessionStatePath, 'utf-8');
      content = content.replace(/\*\*Last Updated:\*\* .+/, `**Last Updated:** ${new Date().toISOString()}`);
      await fs.writeFile(sessionStatePath, content, 'utf-8');

      // Clear buffer
      this.workingBuffer = [];
      console.log('[SessionManager] Session committed successfully');
    } catch (error) {
      console.error('[SessionManager] Error committing session:', error.message);
    }
  }

  // Get session context for persona
  getContext() {
    if (!this.isLoaded) {
      return null;
    }

    return {
      user: this.sessionState.user,
      soul: this.sessionState.soul,
      state: this.sessionState.state
    };
  }

  // Helper: Read file
  async readFile(filename) {
    try {
      const filePath = path.join(this.workspaceDir, filename);
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      console.warn(`[SessionManager] Could not read ${filename}: ${error.message}`);
      return '';
    }
  }
}

module.exports = SessionManager;
