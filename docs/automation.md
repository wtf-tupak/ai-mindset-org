# Automation & IssueOps

Автоматизация через GitHub hooks и IssueOps для агентства.

## Hooks

Агенты настроены в `~/.claude/hooks.json`:

| Hook | Trigger | Purpose |
|------|---------|---------|
| `github-issues-startup` | SessionStart | Show in-progress issues |
| `issue-ops-handler` | PostToolUse:Bash | Detect /plan, /specify, /implement |
| `github-issues-push` | PostToolUse:Bash | Remind to update issues on push |
| `session-log` | SessionEnd | Log session summary |
| `obsidian-open` | PostToolUse:Write | Auto-open .md files |

## Workflows

### Auto Label on Commit

Файл: `.github/workflows/auto-label.yml`

Работает на: `push` (main), `pull_request` (opened, synchronize)

Автоматически находит `#N` в commit message и добавляет label `in-review` к issue.

```bash
# Example commit
feat: add C-Suite agents (#10)

# Will add label "in-review" to issue #10
```

### IssueOps Commands

| Command | Action |
|---------|--------|
| `/plan` | Decompose into sub-issues |
| `/specify` | Write requirements |
| `/implement` | Start coding, create branch |
| `/review` | Review PR |

## Standup Automation

Для генерации ежедневного standup:

```bash
gh issue list --repo wtf-tupak/ai-mindset-org \
  --assignee @me \
  --label in-progress \
  --json number,title,updatedAt
```

## Weekly Report

Генерируется через `/standup-prep` или:

```bash
gh issue list --state all \
  --since="2026-04-15" \
  --json number,title,labels,closedAt
```

## Project Board Automation

GitHub Project: https://github.com/users/wtf-tupak/projects/1

Columns map to labels:
- Backlog → unlabelled
- Spec → `spec`
- Plan → `plan`
- Ready → `ready`
- In Progress → `in-progress`
- Review → `review`
- Done → `done`

---

*AI-First Agency v1.0*
