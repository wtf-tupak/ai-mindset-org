const fs = require('fs').promises;
const path = require('path');

/**
 * AgentRegistry — unified registry for all agents.
 *
 * Sources (in priority order):
 * 1. /agents/{name}/agent.json  — structured config (role, schema, triggers)
 * 2. /agents/{name}/SKILL.md   — full skill prompt + frontmatter triggers
 * 3. /skills/{name}/SKILL.md   — fallback skill prompt via skill_source
 * 4. Hardcoded legacy agents   — spec, plan, code, review (preserved)
 */
class AgentRegistry {
  constructor() {
    this.agents = new Map();
    this._initializeLegacyAgents();
  }

  /**
   * Legacy hardcoded agents — kept for backward compatibility with coordinator/delegation.
   */
  _initializeLegacyAgents() {
    const legacy = [
      {
        name: 'spec-agent',
        role: 'Requirements Analyst',
        capabilities: ['clarify_requirements', 'write_acceptance_criteria', 'ask_questions'],
        description: 'Clarifies requirements and writes acceptance criteria',
        systemPrompt: `You are a requirements analyst. Your job is to:
- Ask clarifying questions about vague requirements
- Identify edge cases and constraints
- Write clear acceptance criteria
- Ensure all stakeholders understand the scope

Be thorough but concise. Focus on what, not how.`
      },
      {
        name: 'plan-agent',
        role: 'Technical Architect',
        capabilities: ['decompose_tasks', 'estimate_effort', 'identify_dependencies'],
        description: 'Breaks down work into actionable tasks',
        systemPrompt: `You are a technical architect. Your job is to:
- Break down features into small, actionable tasks
- Identify dependencies between tasks
- Estimate effort (hours/days)
- Suggest implementation order

Be practical. Each task should be completable in < 1 day.`
      },
      {
        name: 'code-agent',
        role: 'Software Engineer',
        capabilities: ['write_code', 'refactor', 'implement_features'],
        description: 'Implements features and writes code',
        systemPrompt: `You are a software engineer. Your job is to:
- Write clean, working code
- Follow existing patterns in the codebase
- Add minimal comments (only for non-obvious logic)
- Test your code before submitting

Write code that works, not code that impresses.`
      },
      {
        name: 'review-agent',
        role: 'Code Reviewer',
        capabilities: ['review_code', 'suggest_improvements', 'check_quality'],
        description: 'Reviews code for quality and correctness',
        systemPrompt: `You are a code reviewer. Your job is to:
- Check for bugs and edge cases
- Verify code follows project patterns
- Suggest improvements (not nitpicks)
- Approve or request changes

Be constructive. Focus on correctness, not style.`
      }
    ];

    for (const agent of legacy) {
      this.agents.set(agent.name, agent);
    }

    console.log(`[AgentRegistry] Registered ${this.agents.size} legacy agents`);
  }

  /**
   * Auto-load agents from /agents/ directory.
   * Reads agent.json + SKILL.md for each subdirectory.
   * Resolves skill_source paths to load additional prompts.
   *
   * @param {string} agentsDir - absolute path to /agents/ directory
   * @param {string} [projectRoot] - project root for resolving skill_source paths
   */
  async loadFromDirectory(agentsDir, projectRoot) {
    try {
      const entries = await fs.readdir(agentsDir, { withFileTypes: true });
      const dirs = entries.filter(e => e.isDirectory() && !e.name.startsWith('.'));
      let loaded = 0;

      for (const dir of dirs) {
        try {
          await this._loadAgent(agentsDir, dir.name, projectRoot);
          loaded++;
        } catch (err) {
          console.error(`[AgentRegistry] Error loading agent "${dir.name}":`, err.message);
        }
      }

      console.log(`[AgentRegistry] Loaded ${loaded} agents from ${agentsDir}. Total: ${this.agents.size}`);
      return loaded;
    } catch (err) {
      console.error('[AgentRegistry] loadFromDirectory error:', err.message);
      return 0;
    }
  }

  /**
   * Load a single agent from its directory.
   */
  async _loadAgent(agentsDir, agentName, projectRoot) {
    const agentDir = path.join(agentsDir, agentName);
    let config = { name: agentName };

    // 1. Load agent.json if exists
    try {
      const jsonContent = await fs.readFile(path.join(agentDir, 'agent.json'), 'utf-8');
      const parsed = JSON.parse(jsonContent);
      config = { ...config, ...parsed };
    } catch {
      // No agent.json — will rely on SKILL.md only
    }

    // 2. Load SKILL.md from agent directory (agent-level orchestration rules)
    let agentSkillMd = null;
    try {
      agentSkillMd = await fs.readFile(path.join(agentDir, 'SKILL.md'), 'utf-8');
    } catch {
      // No local SKILL.md
    }

    // 3. Load skill_source prompts (deep skill knowledge from /skills/)
    let skillSourcePrompt = null;
    if (config.skill_source && projectRoot) {
      const sources = Array.isArray(config.skill_source) ? config.skill_source : [config.skill_source];
      const promptParts = [];
      for (const src of sources) {
        try {
          const fullPath = path.join(projectRoot, src);
          const content = await fs.readFile(fullPath, 'utf-8');
          promptParts.push(content);
          console.log(`[AgentRegistry] Loaded skill_source: ${src} for agent "${agentName}"`);
        } catch {
          console.warn(`[AgentRegistry] Could not load skill_source "${src}" for agent "${agentName}"`);
        }
      }
      if (promptParts.length > 0) {
        skillSourcePrompt = promptParts.join('\n\n---\n\n');
      }
    }

    // Merge: agent SKILL.md (orchestration context) + skill_source (deep knowledge)
    // If both exist: combine them. If only one: use it.
    if (agentSkillMd && skillSourcePrompt) {
      config._skillPrompt = `${agentSkillMd}\n\n---\n\n## DEEP SKILL KNOWLEDGE\n\n${skillSourcePrompt}`;
      config._skillSource = `agents/${agentName}/SKILL.md + ${config.skill_source}`;
    } else if (agentSkillMd) {
      config._skillPrompt = agentSkillMd;
      config._skillSource = `agents/${agentName}/SKILL.md`;
    } else if (skillSourcePrompt) {
      config._skillPrompt = skillSourcePrompt;
      config._skillSource = Array.isArray(config.skill_source) ? config.skill_source.join(', ') : config.skill_source;
    }

    // 4. Extract triggers from SKILL.md frontmatter if not in agent.json
    if (!config.triggers && config._skillPrompt) {
      config.triggers = this._extractTriggersFromSkillMd(config._skillPrompt);
    }

    // Ensure capabilities array exists for legacy compatibility
    if (!config.capabilities) {
      config.capabilities = config.task_types_supported || [];
    }

    this.agents.set(agentName, config);
    const triggerCount = (config.triggers || []).length;
    console.log(`[AgentRegistry] ✅ "${agentName}" | triggers: ${triggerCount} | prompt: ${config._skillPrompt ? 'yes' : 'NO'}`);
  }

  /**
   * Parse trigger keywords from SKILL.md YAML frontmatter.
   * Handles both list format and inline array format.
   */
  _extractTriggersFromSkillMd(content) {
    const triggers = [];

    // Match frontmatter block
    const frontmatterMatch = content.match(/^---\s*([\s\S]*?)\s*---/);
    if (!frontmatterMatch) return triggers;

    const frontmatter = frontmatterMatch[1];

    // Find trigger: section
    const triggerSectionMatch = frontmatter.match(/trigger[s]?:\s*\n([\s\S]*?)(?=\n\w|\n---|\s*$)/);
    if (triggerSectionMatch) {
      // List format: "  - keyword"
      const listItems = triggerSectionMatch[1].match(/^\s*-\s*(.+)$/gm);
      if (listItems) {
        for (const item of listItems) {
          const value = item.replace(/^\s*-\s*["']?/, '').replace(/["']?\s*$/, '').trim();
          if (value) triggers.push(value);
        }
      }
    }

    // Also try inline array format: trigger: ["a", "b"]
    const inlineMatch = frontmatter.match(/trigger[s]?:\s*\[([^\]]+)\]/);
    if (inlineMatch && triggers.length === 0) {
      const items = inlineMatch[1].split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
      triggers.push(...items.filter(Boolean));
    }

    return triggers;
  }

  register(agentConfig) {
    this.agents.set(agentConfig.name, agentConfig);
  }

  get(name) {
    return this.agents.get(name);
  }

  getAll() {
    return Array.from(this.agents.values());
  }

  findByCapability(capability) {
    return this.getAll().filter(agent =>
      (agent.capabilities || []).includes(capability)
    );
  }

  exists(name) {
    return this.agents.has(name);
  }

  getStatus() {
    return {
      total: this.agents.size,
      agents: this.getAll().map(a => ({
        name: a.name,
        role: a.role,
        triggers: (a.triggers || []).length,
        hasPrompt: !!a._skillPrompt,
        skillSource: a._skillSource || 'hardcoded'
      }))
    };
  }
}

module.exports = AgentRegistry;
