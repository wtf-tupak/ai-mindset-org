---
name: pos-skill-factory
description: Create a new Claude Code skill from a description. Generates SKILL.md from 4 template patterns, validates quality, installs to chosen location.
version: 2.0
user_invocable: true
arguments:
  - name: idea
    description: "What the skill should do (natural language)"
    required: true
---

# POS Skill Factory — Build Skills from Ideas

Create a production-quality Claude Code skill from a natural language description. Uses template patterns, validates against a quality checklist, and installs to the right location.

## Step 1: Understand the Idea

Parse the user's `{idea}` and determine:

1. **What it does** — core action (scan, generate, send, transform, aggregate, analyze)
2. **What it needs** — inputs (files, MCP data, user input, context, CLI args)
3. **What it outputs** — result format (terminal text, file, message, HTML, structured data)
4. **What tools it uses** — Read/Write, Bash, Grep, Glob, MCP servers, ToolSearch, Task (sub-agents)
5. **Which template pattern fits** — see Step 2

## Step 2: Select Template Pattern

Every good skill fits one of 4 patterns. Pick the closest match:

### Pattern A: Audit (scan + score + suggest)

**When**: the skill examines a system, counts things, produces a score.
**Structure**: scan sources → aggregate → score → suggest gaps.
**Examples**: pos-audit, security-check, dependency-review.

```
## Step 0: Discover sources
## Step 1-N: Scan each source
## Output: scored report with gaps
## Scoring table
```

### Pattern B: Pipeline (gather + synthesize + output)

**When**: the skill pulls from multiple sources and produces a synthesized result.
**Structure**: detect integrations → gather from each → synthesize → output in format.
**Examples**: pos-morning, weekly-review, daily-recap.

```
## Step 0: Detect integrations (read mcp.json)
## Step 1: Gather from each source (with degradation chain)
## Step 2: Synthesize (derive insight)
## Step 3: Output (multiple format options)
```

### Pattern C: Generator (input + transform + write)

**When**: the skill takes input and produces a file or artifact.
**Structure**: parse input → apply template/rules → write output → verify.
**Examples**: pos-dashboard-gen, deck, report-gen.

```
## Step 1: Parse input (args or interactive)
## Step 2: Build artifact (HTML, markdown, etc.)
## Step 3: Write and verify
## Design system (if visual output)
```

### Pattern D: Integrator (detect + connect + execute)

**When**: the skill wraps an external service with opinionated defaults.
**Structure**: ToolSearch to load MCP → build payload → execute → confirm.
**Examples**: linear-action, telegram-send, calendar-add.

```
## Step 0: Load MCP tools via ToolSearch
## Step 1: Build payload (pre-fill from context)
## Step 2: Show preview → confirm
## Step 3: Execute and report
```

## Step 3: Generate Skill Name

Rules (strict):
- **Lowercase, hyphenated**: `morning-brief`, `weekly-review`, `task-sorter`
- **2-3 words maximum**: never more than 3
- **Verb-noun preferred**: `check-tasks`, `send-digest`, `scan-vault`
- **No generic verbs**: avoid `do-`, `run-`, `make-` — be specific
- **No project prefix**: user adds their own prefix if needed (e.g., `aim-`)

**Validation**: the name must complete the sentence "I want to _____" naturally.
- Good: "I want to `check-tasks`" / "I want to `send-digest`"
- Bad: "I want to `task-thing`" / "I want to `do-stuff`"

## Step 4: Generate SKILL.md

Follow the Claude Code skill spec exactly:

```markdown
---
name: {skill-name}
description: {ONE line — what it does + when to use. Must fit in a skill listing.}
version: 1.0
user_invocable: true
arguments:          # only if skill takes parameters
  - name: {param}
    description: "{what it controls}"
    required: false
---

# {Skill Title} — {Subtitle}

{2-3 sentences: what this skill does, why it exists, when to use it.}

## Step 0: {Detect/Discover} (if skill uses MCP)

{Read ~/.claude/mcp.json, ToolSearch for required servers}

## Step N: {Action}

{Specific instructions for Claude Code. Include:
- Exact tool calls (Read, Write, Bash, Grep, Glob, ToolSearch)
- Exact MCP function names where relevant
- Degradation chains (try A → try B → skip)
- What to do with the data}

## Output Format

{EXACT format with box-drawing characters:
┌─ ├─ └─ for trees
─── for dividers
Monospace blocks for structured output}

## Principles

- {Key behavior rule}
- {Graceful degradation approach}
- {What to never do}

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| {thing people get wrong} | {correct approach} |
```

### Spec Rules

- **YAML frontmatter**: `name`, `description` (single line), `version`, `user_invocable: true`
- **description**: ONE line that fits a skill listing — not a paragraph
- **arguments**: only add if the skill genuinely needs parameters
- **Box-drawing characters**: `┌ ├ └ ─ │` for all structured output
- **$HOME or ~**: never hardcode personal paths
- **Common Mistakes table**: ALWAYS include at the end (3-6 rows)

## Step 5: Show Preview and Ask Location

**Pre-fill the skill content, then ask:**

```
Generated: /{skill-name}
Pattern: {A|B|C|D} — {pattern name}
Lines: {count}

Preview:
  name: {skill-name}
  description: {description}
  arguments: {list or "none"}
  sections: {list of ## headers}

Where to install?

1. Global (~/.claude/skills/{skill-name}/SKILL.md)
   > available in all projects

2. Project (.claude/skills/{skill-name}/SKILL.md)
   > only in current working directory

3. Just show me the file (don't install)
```

Use `AskUserQuestion` with these 3 options.

## Step 6: Install and Verify

```bash
# Create directory
mkdir -p {chosen_path}/{skill-name}

# Write SKILL.md (use the Write tool, not bash)
```

After writing, verify:

```bash
# Check file exists and has content
wc -l {chosen_path}/{skill-name}/SKILL.md
```

## Step 7: Post-Install

Show:

```
/{skill-name} installed

  path: {full_path}/SKILL.md
  size: {lines} lines
  pattern: {pattern_name}

  test it:  /{skill-name}
  edit:     {full_path}/SKILL.md
```

## Quality Validation Checklist

Before writing the file, validate against all 7 checks:

| # | Check | Criteria |
|---|-------|----------|
| 1 | **Self-contained** | Works without external deps it can't detect |
| 2 | **Graceful degradation** | Missing data source = skip, not error |
| 3 | **Specific output format** | Exact format shown, not "generate a nice report" |
| 4 | **Monospace-first** | Box-drawing characters for all structure |
| 5 | **Tool-aware** | Specifies which Claude Code tools to use |
| 6 | **Concise** | 40-120 lines. Longer = split into multiple skills |
| 7 | **Anonymized paths** | Uses `~` or `$HOME`, never hardcoded user paths |

If any check fails, fix the skill BEFORE showing the preview.

## Examples

| User says | Skill | Pattern | Key feature |
|-----------|-------|---------|-------------|
| "send me a summary of today to telegram" | `daily-recap` | B Pipeline | Session scan → synthesize → telegram send |
| "check my overdue tasks and nag me" | `task-nag` | D Integrator | Linear MCP → filter overdue → format urgent list |
| "generate a weekly review" | `weekly-review` | B Pipeline | Week's JSONL → extract topics → activity report |
| "audit my security setup" | `security-scan` | A Audit | Scan .env, secrets, permissions → scored report |
| "create HTML from markdown" | `md-to-html` | C Generator | Read .md → apply template → write .html |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Description longer than 1 line | Must fit in a skill listing — one sentence max |
| Adding arguments the skill doesn't need | Only add arguments if behavior genuinely changes |
| Vague output: "generate a nice report" | Show the EXACT format with box-drawing chars |
| Missing degradation chains for MCP | Always: try MCP → try file fallback → skip |
| Skills over 150 lines | Split into 2 skills — a skill should do ONE thing well |
| Forgetting Common Mistakes table | Every production skill needs one — 3-6 rows minimum |
