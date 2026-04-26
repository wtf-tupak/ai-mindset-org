const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class MetricsManager {
  constructor(options = {}) {
    this.repo = options.repo || 'wtf-tupak/ai-mindset-org';
    this.revenueIssueNumber = options.revenueIssueNumber || 16;
    this.targetDate = options.targetDate || '2026-05-02';
    this.targetClients = options.targetClients || 3;
    this.targetMRR = options.targetMRR || 1050;
    this.cache = null;
    this.cacheTime = null;
    this.cacheDuration = options.cacheDuration || 300000; // 5 minutes
  }

  async getRevenueMetrics() {
    // Check cache
    if (this.cache && this.cacheTime && Date.now() - this.cacheTime < this.cacheDuration) {
      return this.cache;
    }

    try {
      const issueData = await this.fetchIssueData();
      const metrics = this.parseMetrics(issueData);

      // Cache result
      this.cache = metrics;
      this.cacheTime = Date.now();

      return metrics;
    } catch (error) {
      console.error('MetricsManager error:', error);
      return this.getEmptyMetrics();
    }
  }

  async fetchIssueData() {
    try {
      const { stdout } = await execAsync(
        `gh issue view ${this.revenueIssueNumber} --repo ${this.repo} --json title,body,comments`
      );
      return JSON.parse(stdout);
    } catch (error) {
      console.error('Error fetching issue data:', error);
      return null;
    }
  }

  parseMetrics(issueData) {
    if (!issueData) return this.getEmptyMetrics();

    const allText = `${issueData.body || ''}\n${issueData.comments?.map(c => c.body).join('\n') || ''}`;

    // Parse clients count
    const clientsMatch = allText.match(/clients?:\s*(\d+)\/(\d+)/i) ||
                        allText.match(/(\d+)\s*\/\s*(\d+)\s*clients?/i);
    const currentClients = clientsMatch ? parseInt(clientsMatch[1]) : 0;
    const targetClients = clientsMatch ? parseInt(clientsMatch[2]) : this.targetClients;

    // Parse MRR
    const mrrMatch = allText.match(/mrr:\s*\$?(\d+)\/\$?(\d+)/i) ||
                    allText.match(/\$?(\d+)\s*\/\s*\$?(\d+)\s*mrr/i);
    const currentMRR = mrrMatch ? parseInt(mrrMatch[1]) : 0;
    const targetMRR = mrrMatch ? parseInt(mrrMatch[2]) : this.targetMRR;

    // Calculate days remaining
    const now = new Date();
    const target = new Date(this.targetDate);
    const daysRemaining = Math.ceil((target - now) / (1000 * 60 * 60 * 24));

    // Calculate progress percentages
    const clientProgress = (currentClients / targetClients) * 100;
    const mrrProgress = (currentMRR / targetMRR) * 100;

    // Calculate conversion rate (if we have outreach data)
    const outreachMatch = allText.match(/outreach:\s*(\d+)/i);
    const totalOutreach = outreachMatch ? parseInt(outreachMatch[1]) : 0;
    const conversionRate = totalOutreach > 0 ? (currentClients / totalOutreach) * 100 : 0;

    return {
      clients: {
        current: currentClients,
        target: targetClients,
        progress: clientProgress,
        remaining: targetClients - currentClients
      },
      mrr: {
        current: currentMRR,
        target: targetMRR,
        progress: mrrProgress,
        remaining: targetMRR - currentMRR
      },
      timeline: {
        targetDate: this.targetDate,
        daysRemaining,
        isOverdue: daysRemaining < 0
      },
      outreach: {
        total: totalOutreach,
        conversionRate: conversionRate.toFixed(2)
      },
      summary: this.generateSummary(currentClients, targetClients, currentMRR, targetMRR, daysRemaining),
      timestamp: new Date()
    };
  }

  generateSummary(currentClients, targetClients, currentMRR, targetMRR, daysRemaining) {
    const parts = [];

    parts.push(`Clients: ${currentClients}/${targetClients}`);
    parts.push(`MRR: $${currentMRR}/$${targetMRR}`);
    parts.push(`Days left: ${daysRemaining}`);

    if (currentClients === 0) {
      parts.push('⚠️ No clients yet');
    } else if (currentClients >= targetClients) {
      parts.push('✅ Target reached!');
    }

    return parts.join(' | ');
  }

  async updateMetrics(data) {
    const { clients, mrr, outreach } = data;

    try {
      const comment = this.formatMetricsUpdate(clients, mrr, outreach);

      await execAsync(
        `gh issue comment ${this.revenueIssueNumber} --repo ${this.repo} --body "${comment}"`
      );

      // Clear cache to force refresh
      this.clearCache();

      return { success: true };
    } catch (error) {
      console.error('Error updating metrics:', error);
      return { success: false, error: error.message };
    }
  }

  formatMetricsUpdate(clients, mrr, outreach) {
    const timestamp = new Date().toISOString();
    const parts = [];

    parts.push(`**Metrics Update** (${timestamp})`);
    parts.push('');

    if (clients !== undefined) {
      parts.push(`- Clients: ${clients}`);
    }

    if (mrr !== undefined) {
      parts.push(`- MRR: $${mrr}`);
    }

    if (outreach !== undefined) {
      parts.push(`- Outreach: ${outreach} messages`);
    }

    return parts.join('\n');
  }

  async getProgress() {
    const metrics = await this.getRevenueMetrics();

    return {
      clientProgress: metrics.clients.progress,
      mrrProgress: metrics.mrr.progress,
      overallProgress: (metrics.clients.progress + metrics.mrr.progress) / 2,
      onTrack: metrics.clients.current > 0 && metrics.timeline.daysRemaining > 0
    };
  }

  getEmptyMetrics() {
    return {
      clients: {
        current: 0,
        target: this.targetClients,
        progress: 0,
        remaining: this.targetClients
      },
      mrr: {
        current: 0,
        target: this.targetMRR,
        progress: 0,
        remaining: this.targetMRR
      },
      timeline: {
        targetDate: this.targetDate,
        daysRemaining: Math.ceil((new Date(this.targetDate) - new Date()) / (1000 * 60 * 60 * 24)),
        isOverdue: false
      },
      outreach: {
        total: 0,
        conversionRate: '0.00'
      },
      summary: 'No metrics data available',
      timestamp: new Date()
    };
  }

  clearCache() {
    this.cache = null;
    this.cacheTime = null;
  }
}

module.exports = MetricsManager;
