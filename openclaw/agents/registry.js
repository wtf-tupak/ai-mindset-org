class AgentRegistry {
  constructor() {
    this.agents = new Map();
    this.initializeAgents();
  }

  initializeAgents() {
    // Spec Agent - Requirements clarification
    this.register({
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
    });

    // Plan Agent - Task decomposition
    this.register({
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
    });

    // Code Agent - Implementation
    this.register({
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
    });

    // Review Agent - Code review
    this.register({
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
    });

    console.log(`Registered ${this.agents.size} agents`);
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
      agent.capabilities.includes(capability)
    );
  }

  exists(name) {
    return this.agents.has(name);
  }
}

module.exports = AgentRegistry;
