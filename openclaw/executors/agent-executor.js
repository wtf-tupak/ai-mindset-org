/**
 * AgentExecutor — real LLM execution for agent tasks.
 *
 * Replaced stub (invoke.py + hardcoded quality_score: 85) with direct callAI() calls.
 * callAI is injected via setCallAI() after initialization (to avoid circular deps).
 *
 * Used by AgentCoordinator for workflow steps (spec/plan/code/review pipelines).
 * For direct agent delegation from PersonaManager, use PersonaManager.delegateToAgent() instead.
 */
class AgentExecutor {
  constructor() {
    this._callAI = null; // injected via setCallAI()
  }

  /**
   * Inject the callAI function from PersonaManager.
   * Must be called before execute() is used.
   *
   * @param {Function} fn - async (messages, maxTokens?) => string
   */
  setCallAI(fn) {
    this._callAI = fn;
  }

  /**
   * Execute an agent task using the agent's systemPrompt + user task.
   *
   * @param {string} agentName - agent name (for logging)
   * @param {string} prompt - user task prompt
   * @param {Object} context - additional context { systemPrompt?, maxTokens? }
   * @returns {{ status, result, quality_score, agent }}
   */
  async execute(agentName, prompt, context = {}) {
    if (!this._callAI) {
      console.error('[AgentExecutor] callAI not injected. Call setCallAI() first.');
      return {
        status: 'failed',
        result: null,
        quality_score: 0,
        agent: agentName,
        reason: 'AgentExecutor not initialized: callAI not set'
      };
    }

    const systemPrompt = context.systemPrompt || `You are a specialized agent: ${agentName}. Complete the given task thoroughly and autonomously.`;
    const maxTokens = context.maxTokens || 2000;

    const messages = [
      {
        role: 'user',
        content: `${systemPrompt}\n\n## TASK\n${prompt}\n\n## EXECUTION RULE\nComplete this task in ONE response. Do not ask clarifying questions. Make reasonable assumptions if information is missing and state them explicitly.`
      }
    ];

    try {
      const startTime = Date.now();
      const result = await this._callAI(messages, maxTokens);
      const durationMs = Date.now() - startTime;

      console.log(`[AgentExecutor] ✅ "${agentName}" completed in ${durationMs}ms, output: ${result.length} chars`);

      return {
        status: 'success',
        result,
        quality_score: this._estimateQuality(result, prompt),
        agent: agentName,
        duration_ms: durationMs
      };
    } catch (error) {
      console.error(`[AgentExecutor] ❌ "${agentName}" failed:`, error.message);
      return {
        status: 'failed',
        result: null,
        quality_score: 0,
        agent: agentName,
        reason: `Execution error: ${error.message}`
      };
    }
  }

  /**
   * Simple quality heuristic based on output characteristics.
   * Not LLM-as-judge (that's in PersonaManager for delegated agents).
   * Returns 0-100.
   */
  _estimateQuality(result, prompt) {
    if (!result || result.length < 50) return 10;

    let score = 50; // base

    // Length bonus (more content = more work done)
    if (result.length > 200) score += 10;
    if (result.length > 500) score += 10;
    if (result.length > 1000) score += 5;

    // Structure bonus (markdown headers, lists)
    if (result.includes('#')) score += 5;
    if (result.includes('- ') || result.includes('* ')) score += 5;
    if (result.includes('1.') || result.includes('2.')) score += 5;

    // Not a stub/error response
    if (result.includes('stub') || result.includes('placeholder')) score -= 30;
    if (result.includes('cannot') || result.includes('unable to')) score -= 10;

    return Math.min(95, Math.max(0, score));
  }
}

module.exports = AgentExecutor;
