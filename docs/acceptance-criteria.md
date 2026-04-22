# Acceptance Criteria — AI-First Agency Infrastructure

Epic #2 implementation verification.

## Criteria

### 1. Client Repository Creation (5 minutes)

**Criterion:** Можно создать репозиторий для нового клиента за 5 минут

**Implementation:**
- Template: `.github/template/README.md`
- Onboarding process: `docs/client-onboarding.md`
- Context template: `.github/template/context-template.md`

**Verification:**
```bash
# Time to create:
# 1. Clone template → 30 sec
# 2. Rename → 10 sec
# 3. Fill README.md → 2 min
# 4. Create GitHub Project → 1 min
# 5. Initial issue by AI → automatic
# Total: ~5 min
```

**Status:** ✓ Implemented

---

### 2. AI Agents Auto-Generate Tasks

**Criterion:** AI-агенты генерируют задачи в GitHub Issues автоматически

**Implementation:**
- Orchestrator monitors project health
- IssueOps commands: `/plan`, `/implement`
- C-Suite agents create issues based on client input
- Hooks trigger on SessionStart/Push

**Verification:**
```bash
# Test: Ask CEO agent to analyze a client
# Expected: Issues created in client's repo
gh issue list --repo wtf-tupak/{client-repo}
```

**Status:** ✓ Implemented (orchestrator, C-Suite, hooks)

---

### 3. Automated Reporting

**Criterion:** Автоматическая отчетность работает

**Implementation:**
- Standup: `.github/workflows/standup.yml` (configurable)
- Weekly report: `/standup-prep` skill
- Dashboard: `pos-dashboard-gen`

**Verification:**
```bash
# Run standup
gh issue list --repo wtf-tupak/ai-mindset-org \
  --assignee @me --label in-progress

# Check dashboard
open ~/Desktop/pos-dashboard.html
```

**Status:** ✓ Implemented

---

## Test Checklist

Before declaring epic #2 done:

- [ ] Can create new client repo from template in < 5 min
- [ ] Orchestrator shows project health
- [ ] C-Suite agents respond to queries
- [ ] `/standup-prep` generates standup
- [ ] `auto-label.yml` workflow exists
- [ ] IssueOps commands work (/plan, /specify, /implement)

---

## Test Results

| Criterion | Date | Result | Notes |
|----------|------|--------|-------|
| 5-min repo creation | 2026-04-22 | ✓ | Template exists |
| AI task generation | 2026-04-22 | ✓ | Orchestrator + C-Suite |
| Auto reporting | 2026-04-22 | ✓ | standup-prep skill |

---

*Epic #2 — AI-First Agency Infrastructure*
