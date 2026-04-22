# Client Onboarding — AI-First Agency

Процесс онбординга нового клиента. Цель: создать репозиторий за 5 минут.

## Timeline

| Step | Time | Action |
|------|------|--------|
| 1 | 2 min | Create repo from template |
| 2 | 1 min | Rename and configure |
| 3 | 1 min | Set up GitHub Project |
| 4 | 1 min | Invite client to repo |
| 5 | — | Initial AI analysis (automatic) |

## Step-by-Step

### 1. Create Repository

```bash
# Clone template
gh repo clone wtf-tupak/client-template {client-name}
cd {client-name}
gh repo edit --delete-branch-on-close false
```

Or use GitHub UI: Create from template `client-template`

### 2. Configure

- [ ] Update `README.md` with client info
- [ ] Update `docs/contacts.md`
- [ ] Update `CLAUDE.md` if client has special rules
- [ ] Update `AGENTS.md` with client-specific agents

### 3. GitHub Project

```bash
# Create client project board
gh project create --name "{Client} Board" --owner wtf-tupak

# Add columns: Backlog, Spec, Plan, Ready, In Progress, Review, Blocked, Done
```

### 4. Invite Client

- [ ] Add client GitHub account to repo
- [ ] Add client to project board
- [ ] Send welcome message with repo link

### 5. AI Analysis (Automatic)

After repo creation, Orchestrator:
1. Creates initial issue with client overview
2. Runs `/standup-prep` for first report
3. Assigns appropriate C-Suite agent

## Client Repository Template Location

```
wtf-tupak/client-template
```

## Validation

Checklist для верификации онбординга:

- [ ] Repo exists and is accessible to client
- [ ] README.md filled with client info
- [ ] GitHub Project created and configured
- [ ] Initial issue created by AI
- [ ] Client notified

## Time Tracking

| Client | Date | Time to Complete |
|--------|-------|-----------------|
| Template | 2026-04-22 | ~5 min (manual) |

---

*AI-First Agency v1.0*
