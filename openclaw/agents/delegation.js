class DelegationSystem {
  constructor(coordinator, contextManager) {
    this.coordinator = coordinator;
    this.contextManager = contextManager;
    this.delegations = new Map(); // taskId -> delegation info
  }

  async delegate(fromAgent, toAgent, task, context = {}) {
    const delegationId = `${fromAgent}->${toAgent}-${Date.now()}`;

    console.log(`Delegation: ${fromAgent} → ${toAgent}`);

    const delegation = {
      id: delegationId,
      from: fromAgent,
      to: toAgent,
      task,
      context,
      status: 'pending',
      createdAt: new Date()
    };

    this.delegations.set(delegationId, delegation);

    try {
      // Execute delegated task
      const result = await this.coordinator.agentExecutor.execute(
        toAgent,
        task,
        context
      );

      delegation.status = result.status;
      delegation.result = result;
      delegation.completedAt = new Date();

      return result;
    } catch (error) {
      delegation.status = 'failed';
      delegation.error = error.message;
      delegation.completedAt = new Date();

      throw error;
    }
  }

  async delegateWorkflow(fromAgent, workflowName, prompt, context = {}) {
    console.log(`Workflow delegation: ${fromAgent} → workflow:${workflowName}`);

    const result = await this.coordinator.executeWorkflow(
      workflowName,
      prompt,
      context
    );

    return result;
  }

  getDelegation(id) {
    return this.delegations.get(id);
  }

  getActiveDelegations() {
    return Array.from(this.delegations.values())
      .filter(d => d.status === 'pending');
  }

  getStats() {
    const all = Array.from(this.delegations.values());
    return {
      total: all.length,
      pending: all.filter(d => d.status === 'pending').length,
      success: all.filter(d => d.status === 'success').length,
      failed: all.filter(d => d.status === 'failed').length
    };
  }
}

module.exports = DelegationSystem;
