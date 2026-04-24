const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class GithubExecutor {
  async execute(task) {
    const { operation, repo, issue_number, data } = task;

    try {
      let command;

      switch (operation) {
        case 'create_issue':
          command = `gh issue create --repo ${repo} --title "${data.title}" --body "${data.body}"`;
          if (data.labels) {
            command += ` --label "${data.labels.join(',')}"`;
          }
          break;

        case 'view_issue':
          command = `gh issue view ${issue_number} --repo ${repo} --json title,body,labels,state`;
          break;

        case 'comment':
          command = `gh issue comment ${issue_number} --repo ${repo} --body "${data.comment}"`;
          break;

        case 'edit_labels':
          if (data.add_labels) {
            command = `gh issue edit ${issue_number} --repo ${repo} --add-label "${data.add_labels.join(',')}"`;
          }
          if (data.remove_labels) {
            command += ` --remove-label "${data.remove_labels.join(',')}"`;
          }
          break;

        default:
          throw new Error(`Unknown GitHub operation: ${operation}`);
      }

      const { stdout, stderr } = await execAsync(command);

      return {
        status: 'success',
        output: stdout,
        stderr: stderr || null
      };

    } catch (error) {
      return {
        status: 'failed',
        output: error.stdout || null,
        stderr: error.stderr || null,
        reason: error.message
      };
    }
  }
}

module.exports = GithubExecutor;
