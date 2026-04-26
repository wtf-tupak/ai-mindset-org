const fs = require('fs').promises;
const path = require('path');

class SessionContextManager {
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || path.join(__dirname, '../..');
    this.cache = null;
    this.cacheTime = null;
    this.cacheDuration = options.cacheDuration || 300000; // 5 minutes
  }

  async getSessionContext() {
    // Check cache
    if (this.cache && this.cacheTime && Date.now() - this.cacheTime < this.cacheDuration) {
      return this.cache;
    }

    try {
      const [sessionState, memory, soul] = await Promise.all([
        this.readSessionState(),
        this.readMemory(),
        this.readSoul()
      ]);

      const context = {
        currentTask: this.extractCurrentTask(sessionState),
        blockers: this.extractBlockers(sessionState),
        decisions: this.extractDecisions(sessionState),
        principles: this.extractPrinciples(soul),
        recentActivity: this.extractRecentActivity(sessionState),
        summary: this.generateSummary(sessionState, memory, soul),
        timestamp: new Date()
      };

      // Cache result
      this.cache = context;
      this.cacheTime = Date.now();

      return context;
    } catch (error) {
      console.error('SessionContextManager error:', error);
      return this.getEmptyContext();
    }
  }

  async getCurrentTask() {
    const context = await this.getSessionContext();
    return context.currentTask;
  }

  async getBlockers() {
    const context = await this.getSessionContext();
    return context.blockers;
  }

  async readSessionState() {
    try {
      const sessionStatePath = path.join(this.projectRoot, 'SESSION-STATE.md');
      const content = await fs.readFile(sessionStatePath, 'utf-8');
      return content;
    } catch (error) {
      console.error('Error reading SESSION-STATE.md:', error);
      return '';
    }
  }

  async readMemory() {
    try {
      const memoryPath = path.join(this.projectRoot, 'MEMORY.md');
      const content = await fs.readFile(memoryPath, 'utf-8');
      return content;
    } catch (error) {
      console.error('Error reading MEMORY.md:', error);
      return '';
    }
  }

  async readSoul() {
    try {
      const soulPath = path.join(this.projectRoot, 'SOUL.md');
      const content = await fs.readFile(soulPath, 'utf-8');
      return content;
    } catch (error) {
      console.error('Error reading SOUL.md:', error);
      return '';
    }
  }

  extractCurrentTask(sessionState) {
    const taskMatch = sessionState.match(/## Current Task\s+([\s\S]*?)(?=\n##|$)/);
    if (!taskMatch) return null;

    const taskSection = taskMatch[1];
    const goalMatch = taskSection.match(/\*\*Goal:\*\*\s*(.+)/);
    const statusMatch = taskSection.match(/\*\*Status:\*\*\s+([\s\S]*?)(?=\n\*\*|---|\n##|$)/);

    return {
      goal: goalMatch ? goalMatch[1].trim() : null,
      status: statusMatch ? statusMatch[1].trim() : null
    };
  }

  extractBlockers(sessionState) {
    const blockersMatch = sessionState.match(/## Blockers\s+([\s\S]*?)(?=\n##|---|\n\*This file|$)/);
    if (!blockersMatch) return [];

    const blockersSection = blockersMatch[1].trim();
    if (blockersSection.toLowerCase().includes('none')) return [];

    const blockerLines = blockersSection.split('\n').filter(line => line.trim().startsWith('-'));
    return blockerLines.map(line => line.replace(/^-\s*/, '').trim());
  }

  extractDecisions(sessionState) {
    const decisionsMatch = sessionState.match(/## Active Decisions\s+([\s\S]*?)(?=\n##|---|\n\*This file|$)/);
    if (!decisionsMatch) return [];

    const decisionsSection = decisionsMatch[1];
    const decisions = [];

    const lines = decisionsSection.split('\n');
    let currentDecision = null;

    for (const line of lines) {
      if (line.startsWith('**') && line.includes(':')) {
        if (currentDecision) decisions.push(currentDecision);
        currentDecision = { title: line.replace(/\*\*/g, '').trim(), details: [] };
      } else if (currentDecision && line.trim().startsWith('-')) {
        currentDecision.details.push(line.replace(/^-\s*/, '').trim());
      }
    }

    if (currentDecision) decisions.push(currentDecision);
    return decisions;
  }

  extractPrinciples(soul) {
    const principlesMatch = soul.match(/## Core Principles\s+([\s\S]*?)(?=\n##|---|\n\*|$)/);
    if (!principlesMatch) return [];

    const principlesSection = principlesMatch[1];
    const principles = [];

    const sections = principlesSection.split(/###\s+/).filter(s => s.trim());
    for (const section of sections) {
      const lines = section.split('\n');
      const title = lines[0].trim();
      const content = lines.slice(1).join('\n').trim();
      principles.push({ title, content });
    }

    return principles;
  }

  extractRecentActivity(sessionState) {
    const activityMatch = sessionState.match(/## Today's Actions.*?\*\*Completed:\*\*\s+([\s\S]*?)(?=\n\*\*In Progress|\n\*\*Next:|---|\n##|$)/);
    if (!activityMatch) return [];

    const activitySection = activityMatch[1];
    const activityLines = activitySection.split('\n').filter(line => line.trim().startsWith('-'));
    return activityLines.map(line => line.replace(/^-\s*[✅✓]\s*/, '').trim());
  }

  generateSummary(sessionState, memory, soul) {
    const parts = [];

    const currentTask = this.extractCurrentTask(sessionState);
    if (currentTask && currentTask.goal) {
      parts.push(`Current Goal: ${currentTask.goal}`);
    }

    const blockers = this.extractBlockers(sessionState);
    if (blockers.length > 0) {
      parts.push(`Blockers: ${blockers.length}`);
    }

    const recentActivity = this.extractRecentActivity(sessionState);
    if (recentActivity.length > 0) {
      parts.push(`Recent Activity: ${recentActivity.length} items completed`);
    }

    const summary = parts.join(' | ');
    return summary.length > 500 ? summary.substring(0, 497) + '...' : summary;
  }

  getEmptyContext() {
    return {
      currentTask: null,
      blockers: [],
      decisions: [],
      principles: [],
      recentActivity: [],
      summary: 'No session context available',
      timestamp: new Date()
    };
  }

  clearCache() {
    this.cache = null;
    this.cacheTime = null;
  }
}

module.exports = SessionContextManager;
