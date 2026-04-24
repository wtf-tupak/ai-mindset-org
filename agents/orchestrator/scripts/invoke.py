#!/usr/bin/env python3
"""
Agent Invocation Layer for Personal Corp Orchestrator

Routes tasks to specialized agents based on agent.json configuration.
Chooses execution method: Agent tool (Claude Code) or OpenClaw (future).
"""

import json
import sys
import os
from pathlib import Path


def load_agent_config(agent_name):
    """Load agent configuration from agent.json"""
    agent_dir = Path(__file__).parent.parent.parent / agent_name
    config_path = agent_dir / "agent.json"

    if not config_path.exists():
        raise FileNotFoundError(f"Agent config not found: {config_path}")

    with open(config_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def load_skill_content(skill_path):
    """Load skill SKILL.md content if it exists"""
    if not skill_path:
        return None

    # Try project skills first
    project_skill = Path.cwd() / "skills" / skill_path / "SKILL.md"
    if project_skill.exists():
        with open(project_skill, 'r', encoding='utf-8') as f:
            return f.read()

    # Try global skills
    global_skill = Path.home() / ".claude" / "skills" / skill_path / "SKILL.md"
    if global_skill.exists():
        with open(global_skill, 'r', encoding='utf-8') as f:
            return f.read()

    return None


def build_agent_prompt(agent_name, agent_config, task, context=None):
    """Build structured prompt for agent execution"""

    # Load skill content if available
    skill_source = agent_config.get('skill_source')
    skill_content = load_skill_content(skill_source) if skill_source else None

    prompt = f"""You are {agent_name} agent for Personal Corp.

**Role:** {agent_config.get('description', 'No description')}
"""

    if skill_source:
        prompt += f"**Skill Source:** {skill_source}\n"

    if skill_content:
        prompt += f"\n**Skill Instructions:**\n{skill_content[:2000]}\n"  # Limit to 2000 chars

    prompt += f"""
**Task:** {task}
"""

    if context:
        prompt += f"\n**Context:** {json.dumps(context, indent=2)}\n"

    prompt += """
**Output Format (JSON):**
{
  "result": "your output here",
  "status": "success|escalation|failed",
  "quality_score": 0-100,
  "reason": "if escalation or failed, explain why"
}

Execute the task and return structured JSON output.
"""

    return prompt


def choose_execution_method(agent_config):
    """Choose execution method based on agent model"""
    model = agent_config.get('model', 'sonnet').lower()

    if model == 'opus':
        return 'agent_tool_opus'
    elif model == 'sonnet':
        return 'agent_tool_sonnet'
    elif model == 'haiku':
        return 'agent_tool_haiku'
    else:
        return 'agent_tool_sonnet'  # default


def format_agent_tool_call(method, prompt):
    """Format as Claude Code Agent tool call"""

    if method == 'agent_tool_opus':
        subagent_type = 'general-purpose'
        model = 'opus'
    elif method == 'agent_tool_sonnet':
        subagent_type = 'general-purpose'
        model = 'sonnet'
    elif method == 'agent_tool_haiku':
        subagent_type = 'Explore'
        model = 'haiku'
    else:
        subagent_type = 'general-purpose'
        model = 'sonnet'

    return {
        'tool': 'Agent',
        'subagent_type': subagent_type,
        'model': model,
        'prompt': prompt
    }


def invoke_agent(agent_name, task, context=None):
    """Main invocation function"""

    try:
        # Load agent config
        agent_config = load_agent_config(agent_name)

        # Build prompt
        prompt = build_agent_prompt(agent_name, agent_config, task, context)

        # Choose execution method
        method = choose_execution_method(agent_config)

        # Format tool call
        tool_call = format_agent_tool_call(method, prompt)

        # Output as JSON for Claude Code to execute
        result = {
            'agent': agent_name,
            'method': method,
            'tool_call': tool_call,
            'prompt_preview': prompt[:200] + '...'
        }

        print(json.dumps(result, indent=2))
        return 0

    except FileNotFoundError as e:
        print(json.dumps({
            'error': 'agent_not_found',
            'message': str(e)
        }), file=sys.stderr)
        return 1

    except Exception as e:
        print(json.dumps({
            'error': 'invocation_failed',
            'message': str(e)
        }), file=sys.stderr)
        return 2


def main():
    """CLI entry point"""
    if len(sys.argv) < 3:
        print("Usage: invoke.py <agent_name> <task> [context_json]", file=sys.stderr)
        return 1

    agent_name = sys.argv[1]
    task = sys.argv[2]
    context = json.loads(sys.argv[3]) if len(sys.argv) > 3 else None

    return invoke_agent(agent_name, task, context)


if __name__ == '__main__':
    sys.exit(main())
