---
description: Project structure by lifecycle, not topic
author: wtf-tupak
date: 2026-04-21
---

# Project Structure — Lifecycle-Based

This project is organized by **lifecycle phase**, not by topic.

## Quick Navigation

```
pos-print/
├── 📁 ROOT/          # Canonical files only
├── 📁 research-corp/ # Research & discovery
├── 📁 work/          # Active execution
│   ├── archive/      # Completed
│   └── issue-*/      # By GitHub issue
├── 📁 skills/        # Claude Code skills
└── 📁 .github/       # CI/CD workflows
```

---

## ROOT/ — Canonical Files

**Only reference/authority files.** Long-lived, stable, authoritative.

| File | Purpose |
|------|---------|
| `AGENTS.md` | Agent registry (canonical) |
| `CLAUDE.md` | Project rules (canonical) |
| `README.md` | Project overview (canonical) |
| `.windsurfrules` | IDE rules (canonical) |

**No work artifacts here.** No temporary files. No drafts.

---

## research-corp/ — Research & Discovery

**Lifecycle: Pre-work, learning, preparation.**

| Folder | Contents |
|--------|----------|
| `naming-convention/` | File naming standards |
| `orchestration/` | Model orchestration rules |
| `context-storage/` | Context storage research |
| `session-management/` | Session protocols |

**Rule:** If it's research, convention, or exploration → it goes here.

---

## work/ — Active Execution

**Lifecycle: In progress, task artifacts, deliverables.**

### Structure

```
work/
├── archive/               # Completed work
│   └── 2026-04-{date}/
├── issue-2-agency-infra/  # Epic: Agency infrastructure
├── issue-1-cmo-agent/     # Task: CMO Agent
└── issue-3-template-repo/ # Task: Template repo
```

### Naming Convention

```
work/issue-{number}-{short-name}/
```

### Contents

Each `issue-*/` folder contains:
- `data.md` — Data artifacts
- `product.md` — Product specs
- `*.js` — Scripts
- `assets/` — Images, files
- Any artifacts related to this issue

**Rule:** When issue closes → move to `work/archive/{date}/`

---

## skills/ — Claude Code Skills

**Lifecycle: Reusable tools.**

Skills are installed to `~/.claude/skills/` but documented here.

Each skill:
- Has its own folder
- Contains `SKILL.md`
- May have `scripts/` folder

---

## .github/ — Automation

**Lifecycle: CI/CD, always active.**

GitHub Actions workflows:
- `auto-project.yml` — Add issues to project
- `auto-status.yml` — Move by labels
- `auto-reference.yml` — Comment on refs
- `auto-epic.yml` — Handle epics

---

## Workflow

### Starting New Work

1. Create GitHub issue
2. Create `work/issue-{n}-{name}/`
3. Work there
4. Close issue → move to `work/archive/`

### Research Phase

1. Put findings in `research-corp/{topic}/`
2. Reference from work/
3. Update if findings change

### Canonical Updates

1. Edit ROOT files directly
2. Commit with `[canon]` prefix
3. Update AGENTS.md if structure changes

---

## Anti-Patterns

| ❌ Don't | ✅ Do |
|----------|-------|
| Put drafts in ROOT/ | Put drafts in work/issue-*/ |
| Mix topics in one folder | Separate by lifecycle |
| Keep completed work in work/ | Move to work/archive/ |
| Put research in work/ | Put in research-corp/ |
| Create topic folders | Create lifecycle folders |

---

## Last Updated

2026-04-21 — Initial lifecycle structure
