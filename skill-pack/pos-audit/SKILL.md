---
name: pos-audit
description: Scan your POS infrastructure — CLAUDE.md, skills, MCP servers, memory, hooks, settings. Score 0-12 with gap analysis and next steps.
version: 2.0
user_invocable: true
---

# POS Audit — Infrastructure Scanner

Scan your entire Claude Code setup, cross-reference components, and report a scored assessment with actionable gaps.

## Step 0: Discover MCP Servers

Read MCP configuration to build a capability map BEFORE scanning anything else.

```bash
cat ~/.claude/mcp.json 2>/dev/null
cat .claude/mcp.json 2>/dev/null
```

Parse the JSON and extract server names. Build a map:

| Category | Server Examples | POS Function |
|----------|----------------|--------------|
| Calendar | krisp, google-calendar | Time awareness |
| Tasks | linear, jira | Work tracking |
| Messaging | telegram, slack | Communication |
| Search | exa, context7 | Research & docs |
| Files | filesystem | Extended file access |
| Notes | notion, obsidian | Knowledge base |
| Browser | playwright | Web interaction |
| Other | custom servers | Domain-specific |

**Capability score**: count how many CATEGORIES are covered, not just server count.

## Step 1: CLAUDE.md Analysis (Constitution)

```bash
# Global rules
cat ~/.claude/CLAUDE.md 2>/dev/null | wc -l

# Project-level rules
find . -name "CLAUDE.md" -maxdepth 2 2>/dev/null

# AGENTS.md
find . -name "AGENTS.md" -maxdepth 2 2>/dev/null
```

**Deep analysis** — don't just count lines. Parse and report:

| Section | What to look for |
|---------|-----------------|
| Rules | Naming conventions, formatting standards |
| Tools | MCP references, skill mentions |
| Integrations | API keys, service references |
| Workflows | Pipelines, automation patterns |
| Context mgmt | Handoff protocol, memory rules |

**Cross-reference**: check if tools/skills mentioned in CLAUDE.md actually exist as installed files.

## Step 2: Skills Inventory

```bash
# Global skills (folder-based)
ls ~/.claude/skills/*/SKILL.md 2>/dev/null

# Global skills (flat files)
ls ~/.claude/skills/*.md 2>/dev/null

# Project skills
ls .claude/skills/*/SKILL.md 2>/dev/null
ls .claude/skills/*.md 2>/dev/null
```

For each skill found:
- Read first 5 lines to get `name:` and `description:` from YAML frontmatter
- Categorize: `utility` | `content` | `workflow` | `integration` | `infrastructure`
- Flag skills referenced in CLAUDE.md but not installed (ghosts)
- Flag skills installed but not referenced anywhere (orphans)

## Step 3: MCP Capability Matrix

Using the server list from Step 0, build a matrix:

```
  MCP CAPABILITY MATRIX
  ├─ krisp              calendar, meetings    ✓ loaded
  ├─ linear             tasks, projects       ✓ loaded
  ├─ telegram           messaging             ✓ loaded
  ├─ exa                web search            ✓ loaded
  ├─ filesystem         file access           ✓ loaded
  └─ context7           library docs          ✓ loaded
```

Test each server by checking if ToolSearch can find its tools:

```
ToolSearch: "+{server_name}"
```

Report: `✓ loaded` | `✗ config only` (configured but not responding)

## Step 4: Memory Files

```bash
# Auto memory — all project memories
find ~/.claude/projects -name "MEMORY.md" 2>/dev/null

# Count all memory files across projects
find ~/.claude/projects -path "*/memory/*" -type f 2>/dev/null | wc -l

# Total size
du -sh ~/.claude/projects/*/memory/ 2>/dev/null

# Episodic memory plugin
find ~/.claude -path "*episodic*" -type d 2>/dev/null
```

Report: project count with memory, total file count, total size, most recently updated.

## Step 5: Hooks

```bash
cat ~/.claude/hooks.json 2>/dev/null
cat .claude/hooks.json 2>/dev/null
```

For each hook, report:
- Trigger type: `PreToolUse` | `PostToolUse` | `Notification` | `Stop` | `SubagentStop`
- Matcher pattern (tool name or `*`)
- What it does (from command)

## Step 6: Settings & Permissions

```bash
cat ~/.claude/settings.json 2>/dev/null
```

Report:
- Permission mode: `default` | `plan` | `bypassPermissions`
- Allowed tools list
- Custom model preferences
- Any allow/deny patterns

## Output Format

```
┌─────────────────────────────────────────────────────┐
│  POS AUDIT · {date}                                 │
│  dir: {cwd}                                         │
│  mcp: {server_count} servers · {category_count} categories  │
└─────────────────────────────────────────────────────┘

  CONSTITUTION                                    {✓|✗}
  ├─ CLAUDE.md (global)     {lines}L  {sections found}
  ├─ CLAUDE.md (project)    {lines}L  {sections found}
  ├─ AGENTS.md              {status}
  └─ cross-ref              {matched}/{total} skills mentioned

  SKILLS                                          {count}
  ├─ global: {list with categories}
  ├─ project: {list with categories}
  ├─ ghosts: {skills in CLAUDE.md but not installed}
  └─ orphans: {skills installed but not referenced}

  MCP SERVERS                                     {count}
  ├─ {name}  {category}  {status}
  └─ coverage: {categories covered}/{8 possible}

  MEMORY                                          {projects}
  ├─ auto memory     {file_count} files across {project_count} projects
  ├─ total size      {size}
  └─ episodic        {status}

  HOOKS                                           {count}
  └─ {trigger}: {description}

  SETTINGS
  ├─ permissions     {mode}
  └─ model           {model or default}

  ─────────────────────────────────────────────────

  POS SCORE: {score}/12

  ┌─ Scoring Breakdown ──────────────────────────┐
  │ {component}              {pts}/{max}  {note}  │
  └───────────────────────────────────────────────┘

  GAPS (highest impact first):
  1. {gap + specific action to fix}
  2. {gap + specific action to fix}
  3. {gap + specific action to fix}
```

## Scoring (12 points)

| Component | Points | Criteria |
|-----------|--------|----------|
| CLAUDE.md exists | 1 | Any CLAUDE.md (global or project) |
| CLAUDE.md > 50 lines | 1 | Meaningful rules, not boilerplate |
| Skills > 0 | 1 | Has any installed skills |
| Skills > 5 | 1 | Meaningful skill library |
| MCP > 0 | 1 | Has any MCP servers configured |
| MCP diversity | 1 | 3+ categories covered (calendar, tasks, search, etc.) |
| Memory active | 1 | Auto memory exists with content |
| Hooks configured | 1 | Any hooks set up |
| AGENTS.md | 1 | Project has agent index |
| Project CLAUDE.md | 1 | Project-specific rules (not just global) |
| Cross-referencing | 1 | Skills mentioned in CLAUDE.md actually exist (>80% match) |
| Settings configured | 1 | Non-default permission mode or custom settings |

## Gap Suggestions

Based on score range AND specific missing components:

| Score | Suggestion |
|-------|-----------|
| 0-3 | "Minimum viable POS: create `~/.claude/CLAUDE.md` + install 1 skill + add 1 MCP server" |
| 4-6 | "Growing POS: add more skills, connect data sources via MCP, enable auto memory" |
| 7-9 | "Advanced POS: add hooks for automation, set up cross-referencing, configure permissions" |
| 10-12 | "Full POS: consider building a dashboard, sharing your setup, or creating skill packs" |

Always suggest the **single highest-impact next action** as item #1.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Counting MCP servers instead of categories | 5 filesystem servers = 1 category, not 5 points |
| Skipping cross-reference check | Ghost skills waste CLAUDE.md context tokens |
| Not reading SKILL.md frontmatter | Name/description tells you if a skill is real or placeholder |
| Reporting memory dirs without checking content | Empty memory/ dirs score 0 |
| Running `find` with excessive depth | `-maxdepth 2` or `-maxdepth 3` is enough |
| Hardcoded paths in report | Always use `~` or `$HOME` in suggestions |
