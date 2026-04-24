const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class BashExecutor {
  async execute(command, options = {}) {
    const timeout = options.timeout || 60000; // 60s default
    const cwd = options.cwd || process.cwd();

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd,
        timeout,
        maxBuffer: 1024 * 1024 // 1MB
      });

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

module.exports = BashExecutor;
