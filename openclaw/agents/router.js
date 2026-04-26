const path = require('path');

/**
 * AgentRouter — hybrid routing: trigger keywords → LLM fallback.
 *
 * Level 1: Trigger matching from SKILL.md frontmatter (0ms, free)
 * Level 2: Task type matching from agent.json task_types_supported (0ms, free)
 * Level 3: LLM classification (1-3s, 1 API call) — only if levels 1-2 fail
 *
 * Returns: { agent, method, confidence } or null (manager handles directly)
 */
class AgentRouter {
  constructor(registry, callAIFn) {
    this.registry = registry;
    this.callAI = callAIFn; // async (messages, maxTokens) => string
  }

  /**
   * Route a user message to the best matching agent.
   * Returns routing result or null if no agent matches.
   */
  async route(message) {
    const lower = message.toLowerCase();

    // Level 1: Trigger keyword matching (from SKILL.md frontmatter `trigger:` field)
    const triggerMatch = this.routeByTriggers(lower);
    if (triggerMatch) {
      console.log(`[Router] L1 trigger: "${triggerMatch.trigger}" → ${triggerMatch.agent.name} (conf=0.85)`);
      return { agent: triggerMatch.agent, method: 'trigger', confidence: 0.85, trigger: triggerMatch.trigger };
    }

    // Level 2: Task type keyword matching (from agent.json task_types_supported)
    const taskMatch = this.routeByTaskTypes(lower);
    if (taskMatch) {
      console.log(`[Router] L2 task_type: "${taskMatch.taskType}" → ${taskMatch.agent.name} (conf=0.80)`);
      return { agent: taskMatch.agent, method: 'task_type', confidence: 0.80, trigger: taskMatch.taskType };
    }

    // Level 3: LLM classification — only for ambiguous cases
    const agents = this.registry.getAll().filter(a => a.role && a.role !== 'brain' && a.name !== 'orchestrator');
    if (agents.length > 0) {
      const llmMatch = await this.routeByLLM(message, agents);
      if (llmMatch && llmMatch.confidence >= 0.6) {
        console.log(`[Router] L3 LLM: "${llmMatch.agent.name}" (conf=${llmMatch.confidence})`);
        return llmMatch;
      }
    }

    // No match — manager or Naval handles directly
    console.log(`[Router] No match for: "${message.substring(0, 60)}..."`);
    return null;
  }

  /**
   * Match against triggers[] array on each agent (parsed from SKILL.md frontmatter).
   */
  routeByTriggers(lower) {
    for (const agent of this.registry.getAll()) {
      const triggers = agent.triggers || [];
      for (const trigger of triggers) {
        if (lower.includes(trigger.toLowerCase())) {
          return { agent, trigger };
        }
      }
    }
    return null;
  }

  /**
   * Match against task_types_supported from agent.json.
   * Converts underscore_format to space format for matching.
   */
  routeByTaskTypes(lower) {
    for (const agent of this.registry.getAll()) {
      const taskTypes = agent.task_types_supported || [];
      for (const tt of taskTypes) {
        const readable = tt.replace(/_/g, ' ');
        if (lower.includes(readable)) {
          return { agent, taskType: tt };
        }
      }
    }
    return null;
  }

  /**
   * LLM-based classification as fallback.
   * Asks the AI to pick the best agent from the list.
   */
  async routeByLLM(message, agents) {
    const agentList = agents
      .map(a => `- ${a.name}: ${a.description || a.role || 'no description'}`)
      .join('\n');

    const classifyPrompt = `You are a routing classifier. Pick the BEST agent for this user request.

Available agents:
${agentList}

User request: "${message}"

Rules:
- Only pick an agent if it clearly matches the request
- If none match, respond with "none"
- Respond ONLY with JSON, nothing else

Response format: {"agent": "agent-name", "confidence": 0.0-1.0}
If no match: {"agent": "none", "confidence": 0}`;

    try {
      const response = await this.callAI([{ role: 'user', content: classifyPrompt }], 80);
      // Extract JSON from response (handle cases with extra text)
      const jsonMatch = response.match(/\{[^}]+\}/);
      if (!jsonMatch) return null;

      const result = JSON.parse(jsonMatch[0]);
      if (result.agent === 'none' || !result.agent) return null;

      const agent = this.registry.get(result.agent);
      if (!agent) return null;

      return { agent, method: 'llm', confidence: result.confidence || 0.7 };
    } catch (e) {
      console.error('[Router] LLM routing error:', e.message);
      return null;
    }
  }
}

module.exports = AgentRouter;
