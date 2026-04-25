class IssueTrigger {
  constructor(chatId, topicId) {
    this.chatId = chatId;
    this.topicId = topicId;
  }

  async shouldTrigger(eventType, eventData) {
    if (eventType !== 'github_issue') return false;

    const { action, issue } = eventData;

    // Trigger on issue opened
    if (action === 'opened') return true;

    // Trigger on issue labeled with specific labels
    if (action === 'labeled') {
      const label = eventData.label?.name;
      return ['ready', 'in-progress', 'epic'].includes(label);
    }

    return false;
  }

  async getAction(eventData) {
    const { action, issue, repository, label } = eventData;
    const issueUrl = issue.html_url;
    const issueNumber = issue.number;
    const issueTitle = issue.title;
    const repo = repository.full_name;

    let message = '';

    if (action === 'opened') {
      message = `🤖 **Proactive Suggestion**

New issue detected: **${issueTitle}** (#${issueNumber})
${repo}

💡 **Suggestions:**
• Use \`/plan\` to decompose into sub-tasks
• Use \`/specify\` to clarify requirements
• Add labels: \`spec\`, \`plan\`, \`ready\`

🔗 [View Issue](${issueUrl})`;
    } else if (action === 'labeled' && label?.name === 'ready') {
      message = `🚀 **Ready to Implement**

Issue **${issueTitle}** (#${issueNumber}) is labeled \`ready\`

💡 **Next steps:**
• Use \`/implement\` to start coding
• Create branch and begin work
• Link commits to issue #${issueNumber}

🔗 [View Issue](${issueUrl})`;
    } else if (action === 'labeled' && label?.name === 'epic') {
      message = `🎯 **Epic Detected**

Epic: **${issueTitle}** (#${issueNumber})

💡 **Suggestions:**
• Use \`/plan\` to break into stories
• Define acceptance criteria
• Estimate effort and timeline

🔗 [View Issue](${issueUrl})`;
    }

    return {
      type: 'send_message',
      chatId: this.chatId,
      messageThreadId: this.topicId,
      message
    };
  }
}

module.exports = IssueTrigger;
