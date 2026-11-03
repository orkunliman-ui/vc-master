---
name: self-improving-agent

description: >
  Capture learnings, corrections, failures, and feature requests in .learnings/
  so other sessions can reuse fixes and promote durable guidance into CLAUDE.md.
  Use this skill after any error, correction, or discovered pattern.
  Triggers include: "log this error", "remember this fix", "that was wrong",
  "I corrected you", "don't do that again", "this approach is better",
  "feature request", "this broke", "external API failed".
---

# 🔄 Self-Improving Agent — Learning from Every Session

Capture learnings, corrections, failures, and feature requests in `.learnings/`
so other sessions (or future-you) can reuse fixes and promote durable guidance
into CLAUDE.md, AGENTS.md, etc.

---

## 📁 Workspace Setup

```bash
mkdir -p .learnings
touch .learnings/LEARNINGS.md .learnings/ERRORS.md .learnings/FEATURE_REQUESTS.md
```

Add to CLAUDE.md:
```markdown
After each chunk of work, evaluate whether a learning should be logged
in .learnings/ (self-improving-agent).
```

---

## ⚡ When to Log

| Situation | Action |
|---|---|
| Command/tool fails | Append to `.learnings/ERRORS.md` |
| User corrects you | `.learnings/LEARNINGS.md` category: correction |
| Knowledge was outdated | `.learnings/LEARNINGS.md` category: knowledge_gap |
| Better approach discovered | `.learnings/LEARNINGS.md` category: best_practice |
| Feature missing / user request | `.learnings/FEATURE_REQUESTS.md` |
| External API broke | `.learnings/ERRORS.md` with integration name |

---

## 📝 Entry Formats

### Learning (.learnings/LEARNINGS.md)

```markdown
## [LRN-YYYYMMDD-XXX] category

**Logged**: 2026-03-26T16:20:00Z
**Priority**: low | medium | high | critical
**Status**: pending
**Area**: frontend | backend | infra | tests | docs | config

### Summary
One-line description

### Details
Context, what went wrong, what's correct now

### Suggested Action
Concrete next step / automation / guardrail

### Metadata
- Source: conversation | error | user_feedback
- Related Files: path/to/file
- Tags: …
- See Also: LRN-...
```

### Error (.learnings/ERRORS.md)

```markdown
## [ERR-YYYYMMDD-XXX] skill_or_command

**Logged**: …
**Priority**: high
**Status**: pending
**Area**: …

### Summary
Short failure description

### Error
<actual output / stack trace>

### Context
Command, parameters, environment

### Suggested Fix
What to try next

### Metadata
- Reproducible: yes | no | unknown
- Related Files: …
```

### Feature Request (.learnings/FEATURE_REQUESTS.md)

```markdown
## [FEAT-YYYYMMDD-XXX] capability

**Logged**: …
**Priority**: medium
**Status**: pending
**Area**: …

### Requested Capability
What the user asked for

### User Context
Why they need it / problem being solved

### Complexity Estimate
simple | medium | complex

### Suggested Implementation
Rough idea

### Metadata
- Frequency: first_time | recurring
- Related Features: …
```

---

## 🔄 Promotion & Review Loop

### When to promote

When an entry becomes broadly applicable:
1. Set `Status: promoted`
2. Add a "Resolution" block with date, commit/PR, notes
3. Move to:
   - **CLAUDE.md** — project facts, conventions
   - **AGENTS.md** — multi-agent workflows
   - **.github/copilot-instructions.md** — Copilot hints

### Regular hygiene

```bash
# Count pending items
grep -h "Status**: pending" .learnings/*.md | wc -l

# Find high priority
grep -B5 "Priority**: high" .learnings/*.md

# Link duplicates with See Also
# Bump Recurrence-Count, update Last-Seen
```

---

## 🎯 Best Practices

1. **Log immediately** — memory is freshest right after debugging
2. **Be specific and actionable** — summary + details + next action
3. **Link related entries** — track recurrence
4. **Promote aggressively** — if in doubt, add to CLAUDE.md
5. **Before new work** — scan `.learnings/` filtered by Area
6. **For promoted items** — rewrite as short prevention rules
7. **Use as idea backlog** — future skills can come from learnings

---

## 🔧 Hooks (Optional)

`.claude/settings.json`:
```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "./scripts/error-detector.sh"
      }]
    }]
  }
}
```

`error-detector.sh` parses CLAUDE_TOOL_OUTPUT for failed commands.

---

*Every correction is a learning. Every learning makes you better.*
