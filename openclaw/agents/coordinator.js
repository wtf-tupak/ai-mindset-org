const { v4: uuidv4 } = require('uuid');

class AgentCoordinator {
  constructor(registry, contextManager, agentExecutor) {
    this.registry = registry;
    this.contextManager = contextManager;
    this.agentExecutor = agentExecutor;
    this.workflows = new Map();
    this.initializeWorkflows();
  }

  initializeWorkflows() {
    // Implement workflow: spec → plan → code → review
    this.workflows.set('implement', {
      name: 'implement',
      description: 'Full implementation workflow',
      steps: [
        { agent: 'spec-agent', action: 'clarify' },
        { agent: 'plan-agent', action: 'decompose' },
        { agent: 'code-agent', action: 'implement' },
        { agent: 'review-agent', action: 'review' }
      ]
    });

    // Spec workflow: just clarification
    this.workflows.set('spec', {
      name: 'spec',
      description: 'Requirements clarification only',
      steps: [
        { agent: 'spec-agent', action: 'clarify' }
      ]
    });

    // Plan workflow: spec → plan
    this.workflows.set('plan', {
      name: 'plan',
      description: 'Specification and planning',
      steps: [
        { agent: 'spec-agent', action: 'clarify' },
        { agent: 'plan-agent', action: 'decompose' }
      ]
    });

    console.log(`Initialized ${this.workflows.size} workflows`);
  }

  async executeWorkflow(workflowName, initialPrompt, context = {}) {
    const workflow = this.workflows.get(workflowName);
    if (!workflow) {
      throw new Error(`Unknown workflow: ${workflowName}`);
    }

    const executionId = uuidv4();
    const executionContext = {
      executionId,
      workflow: workflowName,
      startTime: new Date(),
      steps: [],
      context: { ...context }
    };

    console.log(`Starting workflow: ${workflowName} (${executionId})`);

    let currentPrompt = initialPrompt;
    const results = [];

    for (const step of workflow.steps) {
      const agent = this.registry.get(step.agent);
      if (!agent) {
        throw new Error(`Agent not found: ${step.agent}`);
      }

      console.log(`Executing step: ${step.agent} - ${step.action}`);

      // Build prompt with context from previous steps
      const stepPrompt = this.buildStepPrompt(agent, step.action, currentPrompt, results);

      // Execute agent
      const result = await this.agentExecutor.execute(
        step.agent,
        stepPrompt,
        executionContext.context
      );

      // Store result
      const stepResult = {
        agent: step.agent,
        action: step.action,
        prompt: stepPrompt,
        result: result.result,
        status: result.status,
        timestamp: new Date()
      };

      results.push(stepResult);
      executionContext.steps.push(stepResult);

      // Update prompt for next step with previous result
      if (result.status === 'success' && result.result) {
        currentPrompt = `Previous step (${step.agent}): ${result.result}\n\nNow continue with your task.`;
      }

      // Stop on failure
      if (result.status === 'failed') {
        console.error(`Workflow failed at step: ${step.agent}`);
        break;
      }
    }

    executionContext.endTime = new Date();
    executionContext.duration = executionContext.endTime - executionContext.startTime;

    return {
      executionId,
      workflow: workflowName,
      status: results.every(r => r.status === 'success') ? 'success' : 'failed',
      results,
      duration: executionContext.duration
    };
  }

  buildStepPrompt(agent, action, originalPrompt, previousResults) {
    let prompt = `${agent.systemPrompt}\n\n`;
    prompt += `**Your task:** ${action}\n\n`;
    prompt += `**Original request:** ${originalPrompt}\n\n`;

    if (previousResults.length > 0) {
      prompt += `**Context from previous steps:**\n`;
      previousResults.forEach(result => {
        prompt += `- ${result.agent}: ${result.result?.substring(0, 200) || 'No output'}\n`;
      });
      prompt += `\n`;
    }

    prompt += `Now perform your task based on the above context.`;

    return prompt;
  }

  getWorkflow(name) {
    return this.workflows.get(name);
  }

  listWorkflows() {
    return Array.from(this.workflows.values());
  }
}

module.exports = AgentCoordinator;
