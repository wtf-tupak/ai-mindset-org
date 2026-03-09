# State Schema Documentation

**Version:** 2.0
**File:** `~/.claude/skills/writing-content/state/current-article.json`

---

## Overview

The state file serves as the **source of truth** for all article data throughout the writing workflow. It uses a versioned structure with backward compatibility.

**State Management Model:**
- **JSON state** = Structured, programmatic access (this file)
- **Markdown export** = Human-readable, progressive disclosure (separate file)
- **Synchronization** = Automatic after each workflow step

---

## Root Level Structure

```json
{
  "id": "uuid-v4-string",
  "created": "ISO-8601-timestamp",
  "updated": "ISO-8601-timestamp",
  "status": "idea|intro|testing|drafting|rewriting|polishing|complete",
  "idea": { ... },
  "intro": { ... },
  "persona_test_results": { ... },
  "article": { ... },
  "visual": { ... }
}
```

### Root Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string (UUID v4) | Unique identifier for this article session | `"a7b3c5d9-..."` |
| `created` | string (ISO-8601) | Timestamp when article was created | `"2025-11-26T14:30:00Z"` |
| `updated` | string (ISO-8601) | Last modification timestamp | `"2025-11-26T17:45:00Z"` |
| `status` | enum | Current workflow stage | `"intro"` |

**Status Values:**
- `idea` — Step 1 complete (idea generated and scored)
- `intro` — Step 2 complete (intro written with 3 variants)
- `testing` — Step 3 complete (AI-persona testing done)
- `drafting` — Step 4 complete (full article drafted)
- `rewriting` — Step 5 complete (clarity rewrite done)
- `polishing` — Step 6 complete (style polish done)
- `complete` — Step 7 complete (visual generated, if requested)

---

## Idea Section (v2)

**NEW in v2.0:** Added `research` and `scoring` objects

```json
{
  "idea": {
    "rawIdea": "string",
    "refinedIdea": "string",
    "audience": "string",
    "problem": "string",
    "noveltyType": "counter-intuitive|counter-narrative|shock-awe|elegant|make-seen",
    "research": {
      "method": "Perplexity|WebSearch",
      "queries": ["string", "string"],
      "summary": "string",
      "gap_identified": "string",
      "timestamp": "ISO-8601"
    },
    "scoring": {
      "novelty": {
        "score": 0-5,
        "reasoning": "string",
        "evidence": "string",
        "improvement": "string"
      },
      "resonance": {
        "score": 0-5,
        "reasoning": "string",
        "evidence": "string",
        "improvement": "string"
      },
      "overall_recommendation": "strong_proceed|proceed|revise|rethink"
    }
  }
}
```

### Idea Fields (v1 - unchanged)

| Field | Type | Description |
|-------|------|-------------|
| `rawIdea` | string | Original user idea input |
| `refinedIdea` | string | Processed 1-sentence idea |
| `audience` | string | Target audience description |
| `problem` | string | Problem this article solves |
| `noveltyType` | enum | Type of novelty (Julian Shapiro) |

**Novelty Types:**
- `counter-intuitive` — Against common belief
- `counter-narrative` — Against popular narrative
- `shock-awe` — Surprising facts/statistics
- `elegant` — Beautifully articulated idea
- `make-seen` — Describes feelings people can't express

### Research Object (NEW in v2.0)

| Field | Type | Description |
|-------|------|-------------|
| `method` | string | Search method used |
| `queries` | array[string] | Search queries executed |
| `summary` | string | Key findings summary |
| `gap_identified` | string | Content gap found |
| `timestamp` | string | When research was done |

**Purpose:** Identify if idea has been covered elsewhere and what unique angle exists.

### Scoring Object (NEW in v2.0)

**Structure:** Each parameter (novelty, resonance) has 4 fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `score` | number (0-5) | ✅ | Numerical score |
| `reasoning` | string | ✅ | 2-3 sentences explaining score |
| `evidence` | string | ✅ | Facts, data, quotes from research |
| `improvement` | string | ✅ | Actionable suggestions |

**Overall Recommendation:**
- `strong_proceed` — Both scores >= 4
- `proceed` — Both scores >= 3
- `revise` — One score < 3
- `rethink` — Both scores < 3

---

## Intro Section (v2)

**NEW in v2.0:** Changed from single variant to 3 variants array

```json
{
  "intro": {
    "version": 2,
    "variants": [
      {
        "hook": "string",
        "hookType": "question|narrative|research|argument",
        "fullIntro": "string",
        "scoring": {
          "hook_strength": { "score": 0-5, "reasoning": "...", "evidence": "...", "improvement": "..." },
          "clarity": { "score": 0-5, "reasoning": "...", "evidence": "...", "improvement": "..." },
          "ai_slop_score": { "score": 0-5, "reasoning": "...", "evidence": "...", "improvement": "..." },
          "overall": 0-5
        },
        "ai_slop_fixes": {
          "detected_patterns": ["string"],
          "fixes_applied": ["string"],
          "before_score": 0-5,
          "after_score": 0-5
        }
      },
      { /* Variant 2 */ },
      { /* Variant 3 */ }
    ],
    "selected_variant": 0|1|2|null,
    "createdAt": "ISO-8601"
  }
}
```

### Intro Fields (v2)

| Field | Type | Description |
|-------|------|-------------|
| `version` | number | Schema version (2) |
| `variants` | array[object] | 3 intro variants |
| `selected_variant` | number\|null | Index of chosen variant (0-2) |
| `createdAt` | string | Timestamp |

### Variant Object

| Field | Type | Description |
|-------|------|-------------|
| `hook` | string | Opening sentence/question |
| `hookType` | enum | Type of hook used |
| `fullIntro` | string | Complete intro (3-5 sentences) |
| `scoring` | object | 3 scores + overall |
| `ai_slop_fixes` | object | Detection + fixes |

**Hook Types:**
- `question` — Provocative question
- `narrative` — Story/anecdote
- `research` — Data/statistics
- `argument` — Bold claim

**Scoring Parameters:**
- `hook_strength` — How compelling is the hook? (0-5)
- `clarity` — How clear is the intro? (0-5)
- `ai_slop_score` — How human does it sound? (0-5, higher = more human)
- `overall` — Average of the 3 scores

**AI-Slop Fixes:**
- `detected_patterns` — Which AI patterns found (e.g., "delve into")
- `fixes_applied` — What was changed
- `before_score` — AI-Slop score before fixes
- `after_score` — AI-Slop score after fixes (must be >= 4)

---

## Persona Test Results Section

**Unchanged from v1**

```json
{
  "persona_test_results": {
    "personas": [
      {
        "name": "string",
        "archetype": "core|skeptical|novice",
        "background": "string",
        "stream_of_consciousness": "string",
        "hooked": true|false,
        "score": 0-100
      }
    ],
    "aggregate_score": 0-100,
    "recommendation": "proceed|revise|rethink",
    "timestamp": "ISO-8601"
  }
}
```

---

## Article Section (v2)

**NEW in v2.0:** Added `markdown_export` object

```json
{
  "article": {
    "objective": "string",
    "outline": ["string"],
    "sections": [
      {
        "title": "string",
        "content": "string",
        "wordCount": 0
      }
    ],
    "draft": "string",
    "rewritten": "string",
    "final": "string",
    "wordCount": 0,
    "rewritingStats": {
      "originalWordCount": 0,
      "rewrittenWordCount": 0,
      "clarityIssuesFixed": 0,
      "fillerRemoved": 0,
      "dopamineHitsAdded": 0
    },
    "markdown_export": {
      "file_path": "/path/to/writing-session-{timestamp}.md",
      "created_at": "ISO-8601",
      "last_updated": "ISO-8601",
      "sections_written": ["idea", "intro", "drafting", "rewriting", "polishing"],
      "sync_status": "in_progress|synced|complete"
    },
    "createdAt": "ISO-8601",
    "rewrittenAt": "ISO-8601",
    "polishedAt": "ISO-8601"
  }
}
```

### Article Fields (v1 - unchanged)

| Field | Type | Description |
|-------|------|-------------|
| `objective` | string | What reader should DO after reading |
| `outline` | array[string] | Supporting/resulting points |
| `sections` | array[object] | Individual sections of article |
| `draft` | string | Full drafted text |
| `rewritten` | string | After clarity rewrite |
| `final` | string | After style polish |
| `wordCount` | number | Total word count |
| `rewritingStats` | object | Before/after metrics |

### Markdown Export Object (NEW in v2.0)

| Field | Type | Description |
|-------|------|-------------|
| `file_path` | string | Absolute path to markdown file |
| `created_at` | string | When markdown file was created |
| `last_updated` | string | Last sync timestamp |
| `sections_written` | array[string] | Which sections are in markdown |
| `sync_status` | enum | Current sync state |

**Sync Status:**
- `in_progress` — Workflow still running
- `synced` — Latest changes written to markdown
- `complete` — All workflows done, markdown finalized

**Sections Written:** Tracks which workflow stages have been exported
- `"idea"` — Workflow 1 complete
- `"intro"` — Workflow 2 complete
- `"testing"` — Workflow 3 complete
- `"drafting"` — Workflow 4 complete
- `"rewriting"` — Workflow 5 complete
- `"polishing"` — Workflow 6 complete

---

## Visual Section

**Unchanged from v1**

```json
{
  "visual": {
    "requested": true|false,
    "type": "illustration|diagram|infographic|meme",
    "prompt": "string",
    "image_url": "string",
    "alt_text": "string",
    "createdAt": "ISO-8601"
  }
}
```

---

## Version Migration

### v1 → v2 Migration

**Backward Compatibility:** v1 state files are still readable. Missing v2 fields are treated as `null`.

**New Required Fields in v2:**
- `idea.research` → Defaults to `null` if missing
- `idea.scoring` → Defaults to `null` if missing
- `intro.version` → Defaults to `1` if missing
- `intro.variants` → If missing, convert `intro` (v1) to single variant in array
- `article.markdown_export` → Defaults to `null` if missing

**Example v1 → v2 conversion:**

```json
// v1 intro (single variant)
{
  "intro": {
    "hook": "Why do people ignore your emails?",
    "hookType": "question",
    "fullIntro": "Why do people ignore your emails? ..."
  }
}

// Converts to v2 (variants array)
{
  "intro": {
    "version": 2,
    "variants": [
      {
        "hook": "Why do people ignore your emails?",
        "hookType": "question",
        "fullIntro": "Why do people ignore your emails? ...",
        "scoring": null,
        "ai_slop_fixes": null
      }
    ],
    "selected_variant": 0
  }
}
```

---

## Workflow Integration

**Which workflows update which fields:**

| Workflow | Updates |
|----------|---------|
| 1-generate-idea | `idea.*`, `idea.research`, `idea.scoring`, `article.markdown_export` (create) |
| 2-write-intro | `intro.variants[]`, `intro.selected_variant`, `article.markdown_export.sections_written` |
| 3-test-personas | `persona_test_results.*` |
| 4-write-article | `article.objective`, `article.outline`, `article.draft`, `article.markdown_export.sections_written` |
| 5-rewrite-clarity | `article.rewritten`, `article.rewritingStats`, `article.markdown_export.sections_written` |
| 6-style-polish | `article.final`, `article.polishedAt`, `article.markdown_export.sync_status = "complete"` |
| 7-generate-visual | `visual.*` |

---

## Best Practices

### When Reading State

1. **Always check `status` first** to know current workflow stage
2. **Check `intro.version`** to handle v1/v2 differences
3. **Validate presence** of v2 fields (research, scoring, markdown_export) before using

### When Writing State

1. **Update `updated` timestamp** on every write
2. **Update `status`** when workflow stage changes
3. **Sync markdown export** after state changes
4. **Set `sync_status`** appropriately:
   - `"in_progress"` during workflow
   - `"synced"` after markdown append
   - `"complete"` when workflow 6 finishes

### State File Location

**Absolute path:** `~/.claude/skills/writing-content/state/current-article.json`

**Alternative paths for multi-article support (future):**
- `state/articles/{uuid}.json` — Individual article states
- `state/current-article.json` — Symlink to active article

---

## Example Full State (v2)

```json
{
  "id": "a7b3c5d9-1e4f-4a2b-8c3d-9f5e6a7b8c9d",
  "created": "2025-11-26T14:30:00Z",
  "updated": "2025-11-26T17:45:00Z",
  "status": "intro",
  "idea": {
    "rawIdea": "Email marketing tips",
    "refinedIdea": "Most marketers focus on email content, but the first line determines if anyone reads it",
    "audience": "B2B SaaS marketers",
    "problem": "Low email open rates",
    "noveltyType": "counter-intuitive",
    "research": {
      "method": "Perplexity",
      "queries": ["email marketing first line importance", "email subject line vs first line"],
      "summary": "Most content focuses on subject lines. Little coverage of first line importance.",
      "gap_identified": "No one explains why first line matters MORE than subject in email preview",
      "timestamp": "2025-11-26T14:35:00Z"
    },
    "scoring": {
      "novelty": {
        "score": 4,
        "reasoning": "Counter-intuitive insight that first line matters more than content. Goes against common belief.",
        "evidence": "Research shows 80% of articles focus on subject lines, not first line.",
        "improvement": "Could strengthen with specific data on first-line impact on open rates."
      },
      "resonance": {
        "score": 4,
        "reasoning": "B2B marketers struggle with this daily. Directly addresses their pain point.",
        "evidence": "User mentioned 'people don't read my emails' as core problem.",
        "improvement": "Add story of specific marketer who improved metrics with this approach."
      },
      "overall_recommendation": "strong_proceed"
    }
  },
  "intro": {
    "version": 2,
    "variants": [
      {
        "hook": "Why do people delete your emails without reading them?",
        "hookType": "question",
        "fullIntro": "Why do people delete your emails without reading them? You spent 2 hours crafting the perfect message. But here's the truth: they never got past the first line. Most marketers obsess over subject lines. They A/B test headlines. They try clever wordplay. But the subject line only gets the email opened. The first line determines if anyone actually reads it.",
        "scoring": {
          "hook_strength": {
            "score": 4,
            "reasoning": "Strong question that touches pain point directly.",
            "evidence": "Addresses core frustration (deleted emails) in first sentence.",
            "improvement": "Could add specific stat (e.g., '93% of emails deleted in 3 seconds')"
          },
          "clarity": {
            "score": 5,
            "reasoning": "Crystal clear. 13-year-old would understand logic.",
            "evidence": "Short sentences. No jargon. Concrete example (2 hours crafting).",
            "improvement": "None needed."
          },
          "ai_slop_score": {
            "score": 5,
            "reasoning": "Sounds human. Natural flow. Conversational tone.",
            "evidence": "No AI red flags detected. Uses contractions. Varied sentence length.",
            "improvement": "None needed."
          },
          "overall": 4.7
        },
        "ai_slop_fixes": {
          "detected_patterns": [],
          "fixes_applied": [],
          "before_score": 5,
          "after_score": 5
        }
      },
      {
        "hook": "I sent 100 emails last week. 5 people replied.",
        "hookType": "narrative",
        "fullIntro": "I sent 100 emails last week. 5 people replied. The other 95? Straight to trash. Here's what I learned: the subject line gets them to open the email. But the first line? That's what keeps them reading. Most marketers never think about this. They write great content buried under a boring first sentence. By the time readers get to the good stuff, they're already gone.",
        "scoring": {
          "hook_strength": {
            "score": 5,
            "reasoning": "Extremely relatable story. Specific numbers create credibility.",
            "evidence": "100 emails, 5 replies = 5% response rate (realistic pain).",
            "improvement": "None needed."
          },
          "clarity": {
            "score": 5,
            "reasoning": "Simple narrative. Easy to follow. No complex concepts.",
            "evidence": "Short sentences. Concrete numbers. Natural progression.",
            "improvement": "None needed."
          },
          "ai_slop_score": {
            "score": 4,
            "reasoning": "Mostly human. Slight formality in 'Here's what I learned'.",
            "evidence": "No major AI patterns. Good use of contractions. One cliché phrase.",
            "improvement": "Replace 'Here's what I learned' with 'Turns out' or 'The problem?'"
          },
          "overall": 4.7
        },
        "ai_slop_fixes": {
          "detected_patterns": ["cliche_opener: 'Here's what I learned'"],
          "fixes_applied": ["Replaced with 'Turns out'"],
          "before_score": 4,
          "after_score": 5
        }
      },
      {
        "hook": "Subject lines don't matter. First lines do.",
        "hookType": "argument",
        "fullIntro": "Subject lines don't matter. First lines do. That's a bold claim, I know. But look at your inbox right now. You can see the first line of every email before you even open it. The subject line gets attention. The first line decides if you keep reading or hit delete. Most email advice is backwards. They tell you to optimize subject lines. They ignore the line that actually matters.",
        "scoring": {
          "hook_strength": {
            "score": 5,
            "reasoning": "Bold, controversial statement. Grabs attention immediately.",
            "evidence": "Contradicts conventional wisdom about subject lines.",
            "improvement": "None needed."
          },
          "clarity": {
            "score": 4,
            "reasoning": "Clear argument. One minor complexity in 'before you even open it'.",
            "evidence": "Most sentences are simple. Good use of proof ('look at your inbox').",
            "improvement": "Could simplify 'before you even open it' to 'in the preview'."
          },
          "ai_slop_score": {
            "score": 4,
            "reasoning": "Good tone. Slight formality in 'That's a bold claim, I know'.",
            "evidence": "Strong voice. No major AI patterns. One slightly formal phrase.",
            "improvement": "Replace 'That's a bold claim, I know' with 'Sounds crazy, right?'"
          },
          "overall": 4.3
        },
        "ai_slop_fixes": {
          "detected_patterns": ["formal_qualifier: 'That's a bold claim, I know'"],
          "fixes_applied": ["Replaced with 'Sounds crazy, right?'"],
          "before_score": 4,
          "after_score": 5
        }
      }
    ],
    "selected_variant": 1,
    "createdAt": "2025-11-26T15:00:00Z"
  },
  "persona_test_results": null,
  "article": {
    "objective": null,
    "outline": [],
    "sections": [],
    "draft": null,
    "rewritten": null,
    "final": null,
    "wordCount": 0,
    "markdown_export": {
      "file_path": "/Users/user/Documents/writing-session-2025-11-26-143000.md",
      "created_at": "2025-11-26T14:30:00Z",
      "last_updated": "2025-11-26T15:05:00Z",
      "sections_written": ["idea", "intro"],
      "sync_status": "synced"
    }
  },
  "visual": {
    "requested": false
  }
}
```

---

**Last Updated:** 2025-11-26
**Related:** `state/README.md`, `tools/markdown-exporter.md`
