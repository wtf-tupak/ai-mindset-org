---
name: pos-dashboard-gen
description: Generate a personal HTML dashboard from your POS context. Auto-detects MCP servers, gathers data, builds single-file terminal-aesthetic page.
version: 2.0
user_invocable: true
arguments:
  - name: panels
    description: "Comma-separated panels: focus,calendar,tasks,sessions,skills,docs,metrics (default: all available)"
    required: false
  - name: theme
    description: "dark (default) or light"
    required: false
  - name: output
    description: "Output path (default: /tmp/pos-dashboard.html)"
    required: false
---

# POS Dashboard Generator

Generate a self-contained HTML dashboard from your current POS context. Auto-detects available integrations, gathers data from each, and builds a single-file page with terminal aesthetic. No server needed — snapshot at generation time, opens directly in browser.

## Step 0: Detect Integrations

Same pattern as `/pos-morning` — read MCP config first:

```bash
cat ~/.claude/mcp.json 2>/dev/null
```

Build available sources map. Only gather data from detected sources.

## Step 1: Gather Data

For each panel, try to fetch data. **Skip panels where data is unavailable** — an empty panel is worse than no panel.

### Focus Panel
- Read memory files for today's focus: `find ~/.claude/projects -name "MEMORY.md" -type f 2>/dev/null`
- Or extract from recent `/pos-morning` output
- Or extract from CLAUDE.md project description
- Fallback text: "run /pos-morning to set focus"

### Calendar Panel
**Degradation chain:**
1. Krisp MCP (if detected): `ToolSearch: "+krisp meetings"` → `mcp__krisp__list_upcoming_meetings`
2. gcal script: `[ -x "$HOME/.claude/scripts/gcal-smart.sh" ] && "$HOME/.claude/scripts/gcal-smart.sh" today`
3. Skip panel entirely

Format: `[{time: "10:00", title: "Team standup", duration: "30m"}]`

### Tasks Panel
**Degradation chain:**
1. Linear MCP: `ToolSearch: "+linear list_issues"` → `mcp__linear__list_issues(assignee: "me", status: "started")`
2. Linear cache: `find ~/.claude/projects -name "linear-tracking.md" -type f 2>/dev/null | head -1`
3. Local TODO: `find . -maxdepth 2 -name "TODO.md" 2>/dev/null`
4. Skip panel

Format: `[{id: "AIM-123", title: "Task name", priority: "high", status: "IP"}]`

### Sessions Panel
```bash
touch -t $(date +%Y%m%d)0000 /tmp/pos-today-marker 2>/dev/null
find ~/.claude/projects -name "*.jsonl" -newer /tmp/pos-today-marker -maxdepth 3 2>/dev/null | head -8
```

For each, extract: project (from path), first user message (topic), line count (activity proxy).

Format: `[{project: "notes", topic: "Dashboard gen", lines: 450, time: "09:30"}]`

### Skills Panel
```bash
# Global skills
ls ~/.claude/skills/*/SKILL.md 2>/dev/null
ls ~/.claude/skills/*.md 2>/dev/null

# Project skills
ls .claude/skills/*/SKILL.md 2>/dev/null
```

Extract skill names from paths.

Format: `["pos-audit", "pos-morning", "research", ...]`

### Documents Panel
```bash
find . -name "*.md" -mmin -720 \
  -not -path "./.obsidian/*" \
  -not -path "./.trash/*" \
  -not -path "./node_modules/*" \
  2>/dev/null | head -8
```

Format: `[{name: "file.md", modified: "2h ago"}]`

### Metrics Panel
Computed from gathered data:
- `sessions`: count of today's sessions
- `tasks_ip`: count of in-progress tasks
- `tasks_todo`: count of todo tasks
- `skills`: count of installed skills
- `files_today`: count of recently modified files
- `mcp_servers`: count of configured MCP servers

## Step 2: Build HTML

Generate a **single self-contained HTML file** with these specs:

### CSS Design System

```css
:root {
  /* Dark theme (default) */
  --bg: #0d1117;
  --bg2: #161b22;
  --bg3: #1c2128;
  --border: rgba(48, 54, 61, 0.6);
  --accent: #55aa88;
  --accent-dim: #3d8066;
  --blue: #4488cc;
  --amber: #d4a843;
  --red: #cc4444;
  --text: #c9d1d9;
  --text-dim: #8b949e;
  --text-bright: #e6edf3;
  --mono: 'JetBrains Mono', 'SF Mono', 'Cascadia Code', monospace;
  --r: 6px;
}

/* Light theme override */
.light {
  --bg: #ffffff;
  --bg2: #f6f8fa;
  --bg3: #f0f2f5;
  --border: #d0d7de;
  --accent: #2d8659;
  --text: #1f2328;
  --text-dim: #656d76;
  --text-bright: #1f2328;
}
```

### Layout Structure

```
┌─ Terminal Strip ─────────────────────────────────┐
│  scrolling log entries (CSS animation)           │
├─ Header ─────────────────────────────────────────┤
│  > POS DASHBOARD    {date}    LIVE {clock}       │
├──────────────────────────────────────────────────┤
│ Focus     │ Calendar   │ Tasks      │ Skills     │
│           │            │            │            │
├───────────┼────────────┼────────────┼────────────┤
│ Sessions  │ Documents  │ Metrics    │            │
│           │            │            │            │
└──────────────────────────────────────────────────┘
```

Grid: `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`
Responsive: auto-reflows at any screen width.

### Terminal Strip (top)

Scrolling text bar with CSS `@keyframes` marquee:

```html
<div class="terminal-strip">
  <div class="strip-scroll">
    {timestamp} pos-morning ✓ · {timestamp} linear sync 4 tasks ·
    {timestamp} session started · {timestamp} vault: 12 files modified ·
  </div>
</div>
```

CSS: `animation: scroll-left 30s linear infinite`

### Panel Template

```html
<div class="panel" data-panel="{name}">
  <div class="panel-head">
    <span class="panel-icon">></span>
    <span class="panel-title">{NAME}</span>
    <span class="panel-badge">{count}</span>
  </div>
  <div class="panel-body">
    <!-- items -->
  </div>
</div>
```

Panel styles:
- `panel-head`: uppercase title, border-bottom accent, `font-size: 0.72rem`
- `panel-body`: padding 12px, `font-size: 0.8rem`
- `panel-badge`: pill shape, accent background, count number

### Data Injection

Embed gathered data as JS constants at the top of `<script>`:

```javascript
const POS = {
  generated: "{ISO timestamp}",
  theme: "{dark|light}",
  focus: "{focus sentence}",
  calendar: [{time, title, duration}],
  tasks: [{id, title, priority, status}],
  sessions: [{project, topic, lines, time}],
  skills: ["{name}", ...],
  docs: [{name, modified}],
  metrics: {sessions, tasks_ip, tasks_todo, skills, files_today, mcp_servers}
};
```

### Panel-Specific Rendering

**Focus**: large text, accent color, full-width top panel.

**Calendar**: time-sorted list, `{time}` in monospace dim, `{title}` bright.

**Tasks**: priority dot (red=urgent, amber=high, blue=medium, dim=low), `{id}` as dim prefix, `{title}` bright. Group by status.

**Sessions**: `{time}` dim, `{project}` accent, `{topic}` text, `{lines}` as activity bar (thin inline bar proportional to lines).

**Skills**: chip grid, each clickable (copies `/{name}` to clipboard via JS).

**Documents**: filename + "modified {time ago}" in dim.

**Metrics**: 2x3 grid of big numbers with labels below. Accent color for numbers.

### Must-Have Features

- **Live clock**: `setInterval` updating every 30s in header
- **Terminal strip**: CSS marquee animation with real data
- **Monospace everything**: JetBrains Mono from Google Fonts CDN
- **Skill chips**: click to copy skill name to clipboard
- **Task priority dots**: colored circles before each task
- **No external JS**: everything inline in single HTML file
- **Google Fonts fallback**: `font-family: 'JetBrains Mono', 'SF Mono', monospace` — works without CDN

### HTML Size Target

The generated HTML should be **400-700 lines**. If data is sparse, fewer panels = shorter file.

## Step 3: Write and Open

```bash
# Default output path
OUTPUT="${output:-/tmp/pos-dashboard.html}"

# Write file (use Write tool)
# Then open in browser
open "$OUTPUT"
```

Show confirmation:

```
dashboard generated

  path: {output_path}
  panels: {list of panels included}
  data: {summary of what was gathered}
  theme: {dark|light}

  → open {output_path}
```

## Principles

- **Snapshot, not live**: data is static at generation time — run again to refresh
- **Zero runtime dependencies**: Google Fonts CDN is optional (degrades to system monospace)
- **Terminal aesthetic**: dark bg, green accent, monospace, box-drawing
- **Portable**: can be shared as a file, opened on any machine with a browser
- **Only show panels with data**: empty panel = don't render it at all
- **Single file**: everything inline — CSS, JS, data, fonts fallback

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Rendering empty panels | If no data gathered for a panel, skip it entirely |
| External JS/CSS dependencies | Everything must be inline in single HTML file |
| Hardcoded personal data in template | All data comes from POS context gathering, not hardcoded |
| Fixed grid that breaks on mobile | Use `auto-fit, minmax(280px, 1fr)` for responsive reflow |
| Generating 1000+ line HTML | Target 400-700 lines — strip unnecessary whitespace |
| Forgetting Google Fonts fallback | Always include system monospace in font stack |
| Live data fetching in HTML | Dashboard is a snapshot — no fetch/XHR calls in generated HTML |
