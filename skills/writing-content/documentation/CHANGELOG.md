# Changelog — writing-content Skill

All notable changes to the writing-content skill.

---

## [2.0.0] - 2025-11-26

### 🎯 Major Update: Research, Scoring, Detection & Export

This release transforms the writing-content skill from a standard workflow system to a comprehensive content creation platform with built-in research, evaluation, and quality control.

---

### ✨ New Features

#### 1. Research & Gap Analysis (Workflow 1)
- **Perplexity Integration** — Automatic research before writing
- **WebSearch Fallback** — If Perplexity unavailable
- **Gap Identification** — Identifies unique angle vs existing content
- **State Tracking** — `idea.research` object stores method, queries, summary, gap

**Use Case:** Before writing, system researches topic to find content gaps and ensure novelty.

#### 2. 0-5 Scoring System (Workflows 1, 2)
- **Replaces Binary Evaluation** — No more yes/no, now 0-5 scale
- **4 Required Fields:**
  - `score` (0-5 number)
  - `reasoning` (2-3 sentences with concrete details)
  - `evidence` (facts, data, quotes from text or research)
  - `improvement` (actionable, specific recommendations)
- **Decision Thresholds:**
  - >= 4 both (Novelty + Resonance): Strong Proceed
  - >= 3 both: Proceed
  - < 3 either: Revise/Rethink
- **State Storage:** `idea.scoring.novelty`, `idea.scoring.resonance`

**Use Case:** Provides concrete, actionable feedback instead of vague "good/bad" judgments.

#### 3. 3 Intro Variants with Self-Scoring (Workflow 2)
- **3 Hook Types Generated:**
  - Variant 1: Question Hook
  - Variant 2: Narrative Hook
  - Variant 3: Argument Hook
- **Each Variant Independently Scored:**
  - Hook Strength (0-5)
  - Clarity (0-5)
  - AI-Slop Score (0-5)
  - Overall (average)
- **User Selection** — Choose best variant based on scores + recommendation
- **State Storage:** `intro.variants[]` array with 3 objects

**Use Case:** Gives user options instead of single intro, increases chances of finding perfect hook.

#### 4. AI-Slop Detection (4 Layers, Workflows 2, 4, 5, 6)
- **Layer 1: Lexical Scan**
  - Red Flags (17): "delve into", "meticulous", "navigating", "complexities", "realm", etc.
  - Yellow Flags (15): "utilize", "leverage", "it's important to note", "optimize", etc.
- **Layer 2: Structural Scan**
  - Perfect structure detection
  - Transition overload (Furthermore, Moreover, Additionally)
  - List mania
- **Layer 3: Tonal Scan**
  - Безликость (no personality)
  - Excessive formality
  - Fake enthusiasm
- **Layer 4: Sentence Patterns**
  - Contrast framing ("While X is true, Y is also valid")
  - Present-ing verbs overuse
  - Hedging language
- **Threshold:** >= 4/5 mandatory for all workflows
- **Critical Check (Workflow 5):** Ensures rewriting doesn't ADD AI patterns

**Use Case:** Prevents AI-sounding text at every stage, ensuring human voice throughout.

#### 5. Progressive Markdown Export (All Workflows)
- **File Creation:** `writing-session-{YYYY-MM-DD-HHMMSS}.md` in current directory
- **Append-Only:** Each workflow appends its section
- **6 Sections:**
  1. Idea (research + scoring + improvements)
  2. Intro (all 3 variants + scores + selected)
  3. Testing (persona results)
  4. Drafting (objective + outline + draft + AI check)
  5. Rewriting (stats + rewritten text + AI check)
  6. Polishing (AI-Slop fixes + style improvements + final text)
- **State Tracking:** `article.markdown_export` object
- **Sync Status:**
  - `in_progress` — Workflow still running
  - `synced` — Latest changes written
  - `complete` — All workflows done (Workflow 6 finishes)

**Use Case:** User can see all intermediate results in human-readable format, not just final output.

#### 6. Russian Triggers
Added 7 Russian trigger phrases to skill description:
- "напиши пост по шапиро"
- "написать статью по фреймворку джулиана"
- "создай текст в стиле julian shapiro"
- "помоги написать контент по методу shapiro"
- "контент по julian shapiro фреймворку"
- "пост по julian shapiro"
- "напиши в стиле шапиро"

**Use Case:** Native Russian speakers can activate skill naturally.

---

### 📂 New Files

#### References
- **`references/hooks-database.md`** — Comprehensive database of Julian Shapiro hooks
  - 4 hook types (Question, Narrative, Research, Argument)
  - 20 viral patterns
  - 3 formula templates
  - Selection guides by audience/topic/goal

- **`references/scoring-criteria.md`** — Detailed 0-5 scoring criteria
  - 6 levels for each parameter (Novelty, Resonance, Clarity, Hook Strength, AI-Slop)
  - Concrete examples for each level

- **`references/ai-slop-patterns.md`** — AI pattern detection reference
  - 17 Red Flags (99% AI)
  - 15 Yellow Flags (80%+ AI)
  - Structural patterns
  - Tonal patterns
  - Sentence patterns
  - Detection algorithm with scoring

#### Tools
- **`tools/scoring-system.md`** — Unified scoring methodology
  - Score format specification
  - Decision logic for workflows
  - Threshold definitions

- **`tools/anti-ai-detector.md`** — AI detection and fixing tool
  - 4-step algorithm (Lexical → Structural → Tonal → Sentence)
  - JSON output format
  - Fix recommendations
  - Threshold enforcement (>= 4/5)

- **`tools/markdown-exporter.md`** — Markdown file creation system
  - File naming convention
  - Structure template for 6 workflow sections
  - Check-Create-Append workflow
  - State synchronization logic

#### State
- **`state/README.md`** — State structure documentation
  - Complete v2 structure explanation
  - Field-by-field descriptions
  - Workflow integration mapping
  - Usage examples

#### Documentation
- **`documentation/state-schema.md`** — Detailed state schema reference
  - Root level structure
  - Idea section (v1 + v2 fields)
  - Intro section (v1 → v2 migration)
  - Article section (markdown export)
  - Version migration guide
  - Workflow integration table
  - Example full state

- **`documentation/CHANGELOG.md`** — This file

---

### 🔄 Modified Files

#### State File
- **`state/current-article.json`**
  - Added `idea.research` object
  - Added `idea.scoring` object (novelty + resonance)
  - Changed `intro` from single object to `intro.variants[]` array
  - Added `intro.version` field (1 or 2)
  - Added `intro.selected_variant` field
  - Added `article.markdown_export` object

#### Workflows
- **`workflows/1-generate-idea.md`**
  - Added Step 4: Research & Gap Analysis (Perplexity → WebSearch)
  - Added Step 5: Idea Scoring (0-5 Scale)
  - Updated Step 7: Decision Point (now based on 0-5 scores)
  - Added Step 8: Save to State + Markdown Export

- **`workflows/2-write-intro.md`**
  - Added Step 2: Load Hooks Database
  - Added Step 3: Generate 3 Intro Variants
  - Added Step 4: Self-Score Each Variant (0-5)
  - Added Step 5: Apply AI-Slop Fixes (threshold >= 4)
  - Added Step 6: Present All 3 Variants with Scores
  - Deprecated old Steps 2-5 (marked as OLD - DEPRECATED)
  - Updated Step 8: Save to State + Markdown Export

- **`workflows/4-write-full-article.md`**
  - Added Step 6: AI-Slop Check (NEW)
  - Renamed old Step 6 to Step 7: Assembly & Review
  - Updated Step 8: Save to State + Markdown Export

- **`workflows/5-rewrite-clarity.md`**
  - Added Step 5: AI-Slop Check After Rewrite (NEW)
  - CRITICAL: Checks if rewrite made text MORE AI-like
  - Renamed old Step 5 to Step 6: Assembly & Comparison
  - Updated Step 7: Save to State + Markdown Export

- **`workflows/6-style-polish.md`**
  - Updated Step 8: Save Final Version to State + Markdown Export
  - Enhanced markdown export with AI-Slop fixes summary (all 10 types)
  - Sets `markdown_export.sync_status: "complete"`

#### Skill File
- **`SKILL.md`**
  - Added "Новые возможности (v2.0)" section in frontmatter description
  - Added Russian triggers section
  - Added English triggers section
  - Updated all Workflow Routing sections (1-6) with:
    - (v2) notation
    - PREREQUISITES sections listing required files
    - Detailed EXECUTE steps with NEW markers
  - Added new "Architecture & Design" section:
    - Skill Type Classification (Complex Archetype)
    - Core Innovation explanation
    - Integration Architecture diagram
    - Workflow Dependency Graph
    - Key v2.0 Additions (5 items)
    - External Integrations
    - Capabilities Matrix table
  - Updated Stage 7 routing description

---

### 🔧 Technical Changes

#### State Management
- **Dual State Model:** JSON (source of truth) + Markdown (human interface)
- **Version Field:** `intro.version` (1 or 2) for backward compatibility
- **Progressive Disclosure:** v1 states still readable, missing v2 fields treated as `null`
- **Synchronization:** Automatic after each workflow step

#### Scoring System
- **Mandatory Fields:** score, reasoning, evidence, improvement
- **Consistent Thresholds:** >= 4 for strong proceed, >= 3 for proceed, < 3 for revise
- **Evidence-Based:** All scores must cite facts/data/quotes

#### AI Detection
- **4-Layer Algorithm:** Lexical → Structural → Tonal → Sentence
- **Cumulative Scoring:** Start at 5.0, subtract penalties
- **Threshold Enforcement:** >= 4/5 mandatory (rewrite if < 4)
- **Critical Check:** Workflow 5 compares original vs rewritten scores

#### Markdown Export
- **Naming Convention:** `writing-session-{YYYY-MM-DD-HHMMSS}.md`
- **Location:** Current working directory (not skill directory)
- **Append-Only:** Never overwrites, only appends new sections
- **Section Tracking:** `sections_written[]` array in state

---

### 📊 Statistics

**Files Added:** 8
- 3 references (hooks-database, scoring-criteria, ai-slop-patterns)
- 3 tools (scoring-system, anti-ai-detector, markdown-exporter)
- 1 state (README)
- 2 documentation (state-schema, CHANGELOG)

**Files Modified:** 7
- 1 state (current-article.json)
- 5 workflows (1, 2, 4, 5, 6)
- 1 skill file (SKILL.md)

**Lines of Code Added:** ~3,500+
- References: ~800 lines
- Tools: ~600 lines
- Documentation: ~1,200 lines
- Workflows: ~400 lines (additions)
- SKILL.md: ~150 lines (additions)

**New Capabilities:**
- Research integration (Perplexity/WebSearch)
- 0-5 scoring system (replaces binary)
- 3 intro variants (vs 1 in v1)
- AI-Slop detection (4 layers, 32+ patterns)
- Markdown export (6 workflow sections)
- Russian triggers (7 phrases)

---

### 🔄 Migration Guide

#### For Existing v1 State Files

**Automatic Migration:**
- v1 states are still readable
- Missing v2 fields default to `null`
- `intro` single variant → converts to `variants[0]`

**Manual Migration (Optional):**
To fully upgrade v1 state to v2:

1. Add `idea.research`:
```json
"research": {
  "method": null,
  "queries": [],
  "summary": null,
  "gap_identified": null,
  "timestamp": null
}
```

2. Add `idea.scoring`:
```json
"scoring": {
  "novelty": {
    "score": null,
    "reasoning": null,
    "evidence": null,
    "improvement": null
  },
  "resonance": {
    "score": null,
    "reasoning": null,
    "evidence": null,
    "improvement": null
  },
  "overall_recommendation": null
}
```

3. Convert `intro` to variants array:
```json
// Before (v1)
{
  "intro": {
    "hook": "...",
    "hookType": "question",
    "fullIntro": "..."
  }
}

// After (v2)
{
  "intro": {
    "version": 2,
    "variants": [
      {
        "hook": "...",
        "hookType": "question",
        "fullIntro": "...",
        "scoring": null,
        "ai_slop_fixes": null
      }
    ],
    "selected_variant": 0
  }
}
```

4. Add `article.markdown_export`:
```json
"markdown_export": {
  "file_path": null,
  "created_at": null,
  "last_updated": null,
  "sections_written": [],
  "sync_status": null
}
```

---

### ⚠️ Breaking Changes

**None.** All v1 functionality remains intact. v2 is additive.

**However:**
- Workflows 1, 2 now take longer (research + 3 variants vs 1)
- AI-Slop checks add ~30 seconds per workflow (detection + fixes)
- Markdown files created in current directory (may clutter workspace)

---

### 🐛 Bug Fixes

None. This is feature release, not bugfix release.

---

### 📚 Documentation

**New Documentation:**
- `documentation/state-schema.md` — Complete state structure reference
- `documentation/CHANGELOG.md` — This file
- `state/README.md` — State usage guide
- All new references/ and tools/ files include inline documentation

**Updated Documentation:**
- `SKILL.md` — Added Architecture section, updated all routing
- All workflow files — Added new steps with detailed explanations

---

### 🎯 Use Cases Enabled by v2.0

1. **Content Gap Analysis**
   - Research existing content before writing
   - Find unique angle automatically
   - Avoid duplicating what's already out there

2. **Evidence-Based Evaluation**
   - No more vague "this is good/bad"
   - Concrete scores with reasoning + evidence
   - Actionable improvement suggestions

3. **Hook Experimentation**
   - Try 3 different hook types instantly
   - Compare scores to pick best
   - Learn which hooks work for your audience

4. **AI-Free Content**
   - Automatic detection at every stage
   - Prevents AI patterns from creeping in
   - Ensures human voice throughout

5. **Complete Visibility**
   - See all intermediate results in markdown
   - Review research, scoring, variants
   - Share progress with stakeholders

---

### 🚀 Performance

**Workflow Timings (approximate):**

| Workflow | v1 Time | v2 Time | Increase |
|----------|---------|---------|----------|
| 1 (Idea) | 2-3 min | 4-5 min | +2 min (research + scoring) |
| 2 (Intro) | 3-4 min | 8-10 min | +5 min (3 variants + scoring) |
| 3 (Testing) | 5-7 min | 5-7 min | No change |
| 4 (Article) | 15-20 min | 16-22 min | +1-2 min (AI check) |
| 5 (Rewrite) | 10-12 min | 11-13 min | +1 min (AI check) |
| 6 (Polish) | 8-10 min | 9-11 min | +1 min (enhanced AI check) |

**Total End-to-End:**
- v1: ~45-60 min
- v2: ~55-70 min
- Increase: ~10 min (+18%)

**Trade-off:** 10 extra minutes for research, 3 intro options, and guaranteed AI-free text.

---

### 🔮 Future Roadmap (v2.1+)

Potential future additions:

- [ ] Multi-article state management (not just current-article.json)
- [ ] A/B testing framework for hook variants
- [ ] Integration with Hemingway Editor API (readability scoring)
- [ ] Automated publishing to blog platforms
- [ ] Markdown export to Obsidian vault (with backlinks)
- [ ] Voice of Customer analysis (scrape reviews for resonance ideas)
- [ ] SEO keyword optimization layer
- [ ] Social media snippet generation from article

---

### 📞 Support

**Issues:** Report in `~/.claude/skills/writing-content/` directory or project repo

**Documentation:**
- State schema: `documentation/state-schema.md`
- Workflow guides: `workflows/*.md`
- Architecture: `SKILL.md` → Architecture & Design section

---

## [1.0.0] - 2025-11-01

### Initial Release

**Core Features:**
- 7 workflows (idea → intro → testing → article → rewrite → polish → visual)
- Julian Shapiro framework integration
- AI-persona testing (3 archetypes)
- State management (single JSON file)
- Binary idea evaluation (yes/no)
- Single intro variant
- Basic voice/style checks

**Files:**
- `SKILL.md` — Skill definition
- `workflows/*.md` — 7 workflow files
- `state/current-article.json` — State storage

---

**Last Updated:** 2025-11-26
