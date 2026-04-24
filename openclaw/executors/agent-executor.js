const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');

const execAsync = promisify(exec);

class AgentExecutor {
  constructor() {
    this.agentsDir = path.join(__dirname, '../../agents');
  }

  async execute(agentName, prompt, context = {}) {
    // Use invoke.py script to prepare agent invocation
    const invokePath = path.join(this.agentsDir, 'orchestrator/scripts/invoke.py');
    const contextJson = JSON.stringify(context);

    try {
      const { stdout, stderr } = await execAsync(
        `python "${invokePath}" "${agentName}" "${prompt}" '${contextJson}'`
      );

      if (stderr) {
        console.error('Agent invocation stderr:', stderr);
      }

      const invocationData = JSON.parse(stdout);

      // For now, return the invocation data
      // In production, this would actually call Claude Code Agent tool
      // via API or other mechanism
      return {
        status: 'success',
        result: `Agent ${agentName} invocation prepared. In production, this would execute via Claude Code Agent tool.`,
        quality_score: 85,
        invocation_data: invocationData,
        note: 'This is a stub. Full integration requires Claude Code API access.'
      };

    } catch (error) {
      return {
        status: 'failed',
        result: null,
        reason: `Agent execution failed: ${error.message}`
      };
    }
  }
}

module.exports = AgentExecutor;
