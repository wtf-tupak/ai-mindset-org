# pos-print — AI-First Agency Output Layer

**Project Type:** CLI visualization, terminal aesthetic, automation  
**Lifecycle Phase:** Active execution  
**Owner:** wtf-tupak

---

## Quick Links

| Resource | Location |
|----------|----------|
| **Project Board** | https://github.com/users/wtf-tupak/projects/1 |
| **Active Work** | [`work/`](work/) — task artifacts |
| **Research** | [`research-corp/`](research-corp/) — conventions, patterns |
| **Canonical** | [`AGENTS.md`](AGENTS.md), [`CLAUDE.md`](CLAUDE.md) |
| **Structure** | [`STRUCTURE.md`](STRUCTURE.md) — how this repo is organized |

---

## What This Is

This repo is the **output layer** of Personal Corp — AI-native agency infrastructure.

- **Not a web app** — no src/, no app/, no pages/
- **Collection of:** Claude Code skills, Python scripts, automation workflows
- **Purpose:** Generate dashboards, reports, CLI tools for agency operations

---

## Repository Structure

```
pos-print/
├── ROOT/                    # Canonical files only
│   ├── AGENTS.md           # Agent registry
│   ├── CLAUDE.md           # Project rules
│   ├── README.md           # This file
│   └── STRUCTURE.md        # Lifecycle documentation
│
├── research-corp/          # Research, conventions, patterns
│   ├── naming-convention/
│   ├── orchestration/
│   ├── context-storage/
│   └── session-management/
│
├── work/                   # Active execution
│   ├── issue-2-agency-infra/
│   ├── issue-1-cmo-agent/
│   └── issue-3-template-repo/
│
├── skills/                 # Claude Code skills (40+)
│   ├── business-analyst-toolkit/
│   ├── seo-strategist/
│   └── ...
│
└── .github/workflows/      # Automation
```

**Organized by lifecycle, not topic.** See [STRUCTURE.md](STRUCTURE.md) for rationale.

---

## Active Issues

| Issue | Folder | Status |
|-------|--------|--------|
| #2 | [`work/issue-2-agency-infra/`](work/issue-2-agency-infra/) | Agency infrastructure |
| #1 | [`work/issue-1-cmo-agent/`](work/issue-1-cmo-agent/) | CMO Agent dev |
| #3 | [`work/issue-3-template-repo/`](work/issue-3-template-repo/) | Template repository |

---

## Skills Overview

Selected skills for agency operations:

| Skill | Purpose |
|-------|---------|
| [`skills/business-analyst-toolkit/`](skills/business-analyst-toolkit/) | 7 scripts: charter, gap analysis, RACI, KPI, etc. |
| [`skills/seo-strategist/`](skills/seo-strategist/) | 3 scripts: keyword research, roadmap, tech audit |
| [`skills/product-strategist/`](skills/product-strategist/) | 2 scripts: OKR cascade, lifecycle |
| [`skills/deck/`](skills/deck/) | HTML presentation generator |

Full list: see [`AGENTS.md`](AGENTS.md).

---

## Automation

GitHub Actions workflows:

| Workflow | Trigger | Action |
|----------|---------|--------|
| `auto-project.yml` | Issue created | Add to GitHub Project |
| `auto-status.yml` | Label changed | Move project column |
| `auto-reference.yml` | Push with (#N) | Comment on issue |
| `auto-epic.yml` | Epic labeled | Decomposition comment |

---

## Commands

```bash
# View project health
/orchestrator

# Daily standup
/standup-prep

# Create issue in correct repo
/task-routing

# Save session context
/session-save {name}
```

---

## Contributing

1. Work happens in `work/issue-{n}-{name}/`
2. Research goes to `research-corp/{topic}/`
3. Canonical files updated directly
4. Commit with issue reference: `feat: description (#2)`

---

**Last Updated:** 2026-04-21  
**Framework:** Personal Corp v1.0
