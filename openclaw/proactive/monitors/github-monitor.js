class GitHubMonitor {
  constructor(contextManager) {
    this.contextManager = contextManager;
    this.issueActivity = new Map(); // issueId -> { lastActivity, actionCount }
  }

  async process(eventType, eventData) {
    if (eventType !== 'github_issue') return;

    const { action, issue, repository } = eventData;
    const issueId = `${repository.full_name}#${issue.number}`;

    // Track activity
    if (!this.issueActivity.has(issueId)) {
      this.issueActivity.set(issueId, {
        lastActivity: new Date(),
        actionCount: 0,
        labels: issue.labels?.map(l => l.name) || []
      });
    }

    const activity = this.issueActivity.get(issueId);
    activity.lastActivity = new Date();
    activity.actionCount++;
    activity.labels = issue.labels?.map(l => l.name) || [];

    console.log(`GitHub activity tracked: ${issueId} - ${action}`);
  }

  getIssueActivity(issueId) {
    return this.issueActivity.get(issueId);
  }

  getStaleIssues(maxAge = 259200000) { // 3 days default
    const now = Date.now();
    const stale = [];

    for (const [issueId, activity] of this.issueActivity.entries()) {
      const age = now - activity.lastActivity.getTime();
      if (age > maxAge) {
        stale.push({ issueId, age, ...activity });
      }
    }

    return stale;
  }

  cleanup(maxAge = 604800000) { // 7 days
    const now = Date.now();
    for (const [issueId, activity] of this.issueActivity.entries()) {
      if (now - activity.lastActivity.getTime() > maxAge) {
        this.issueActivity.delete(issueId);
      }
    }
  }
}

module.exports = GitHubMonitor;
