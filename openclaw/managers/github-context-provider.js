const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class GitHubContextProvider {
  constructor(repo = 'wtf-tupak/ai-mindset-org') {
    this.repo = repo;
    this.cache = null;
    this.cacheTime = null;
    this.cacheDuration = 300000; // 5 minutes
  }

  async getContext() {
    // Check cache
    if (this.cache && this.cacheTime && Date.now() - this.cacheTime < this.cacheDuration) {
      return this.cache;
    }

    try {
      const [openIssues, inProgress, blocked, recentActivity] = await Promise.all([
        this.getOpenIssues(),
        this.getInProgress(),
        this.getBlocked(),
        this.getRecentActivity()
      ]);

      const context = {
        openIssues,
        inProgress,
        blocked,
        recentActivity,
        summary: this.generateSummary(openIssues, inProgress, blocked),
        timestamp: new Date()
      };

      // Cache result
      this.cache = context;
      this.cacheTime = Date.now();

      return context;
    } catch (error) {
      console.error('GitHub context provider error:', error);
      // Return cached data if available, even if stale
      return this.cache || this.getEmptyContext();
    }
  }

  async getOpenIssues() {
    try {
      const { stdout } = await execAsync(
        `gh issue list --repo ${this.repo} --state open --limit 20 --json number,title,labels,createdAt,updatedAt`
      );
      return JSON.parse(stdout);
    } catch (error) {
      console.error('Error fetching open issues:', error);
      return [];
    }
  }

  async getInProgress() {
    try {
      const { stdout } = await execAsync(
        `gh issue list --repo ${this.repo} --label "in-progress" --state open --limit 10 --json number,title,assignees,updatedAt`
      );
      return JSON.parse(stdout);
    } catch (error) {
      console.error('Error fetching in-progress issues:', error);
      return [];
    }
  }

  async getBlocked() {
    try {
      const { stdout } = await execAsync(
        `gh issue list --repo ${this.repo} --label "blocked" --state open --limit 10 --json number,title,labels,updatedAt`
      );
      return JSON.parse(stdout);
    } catch (error) {
      console.error('Error fetching blocked issues:', error);
      return [];
    }
  }

  async getRecentActivity() {
    try {
      const { stdout } = await execAsync(
        `gh issue list --repo ${this.repo} --state all --limit 10 --json number,title,state,updatedAt --search "sort:updated-desc"`
      );
      return JSON.parse(stdout);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  generateSummary(openIssues, inProgress, blocked) {
    const parts = [];

    parts.push(`📊 Project Status:`);
    parts.push(`• Open issues: ${openIssues.length}`);
    parts.push(`• In progress: ${inProgress.length}`);
    parts.push(`• Blocked: ${blocked.length}`);

    if (blocked.length > 0) {
      parts.push(`\n⚠️ Blocked Issues:`);
      blocked.slice(0, 3).forEach(issue => {
        parts.push(`• #${issue.number}: ${issue.title}`);
      });
    }

    if (inProgress.length > 0) {
      parts.push(`\n🔨 In Progress:`);
      inProgress.slice(0, 3).forEach(issue => {
        const assignee = issue.assignees?.[0]?.login || 'unassigned';
        parts.push(`• #${issue.number}: ${issue.title} (${assignee})`);
      });
    }

    if (openIssues.length > 0) {
      parts.push(`\n📋 Recent Open:`);
      openIssues.slice(0, 5).forEach(issue => {
        const age = this.getAge(issue.createdAt);
        parts.push(`• #${issue.number}: ${issue.title} (${age})`);
      });
    }

    const summary = parts.join('\n');

    // Limit to 2000 chars as per CTO recommendation
    return summary.length > 2000 ? summary.substring(0, 1997) + '...' : summary;
  }

  getAge(dateString) {
    const now = new Date();
    const created = new Date(dateString);
    const diffMs = now - created;
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'just now';
  }

  getEmptyContext() {
    return {
      openIssues: [],
      inProgress: [],
      blocked: [],
      recentActivity: [],
      summary: '📊 No GitHub data available (using fallback)',
      timestamp: new Date()
    };
  }

  clearCache() {
    this.cache = null;
    this.cacheTime = null;
  }
}

module.exports = GitHubContextProvider;
