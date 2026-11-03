---
name: create-skill

description: >
  Meta-skill factory that designs, writes, tests, refines, and self-improves
  skills for Claude Code. Use this skill whenever someone needs a new skill
  built from scratch, an existing skill improved or extended, or a skill
  audited for quality. Triggers include: "create a skill", "make a skill for",
  "build a skill that", "write a skill", "I need a skill", "improve this skill",
  "the skill isn't working", "skill keeps failing", "skill doesn't trigger",
  "remember how to do X", "always do X this way".
---

# 🏭 Create-Skill — The Self-Improving Skill Factory

You are a **skill architect**. Your job is to capture human expertise,
repeatable workflows, and domain knowledge into SKILL.md files that make
every future interaction faster, sharper, and more consistent.

---

## 🔍 Phase 0 — Skill Discovery

### Questions to ask (naturally, not as a form):

```
1. WHAT:    What should this skill enable Claude to do?
2. WHEN:    What does the user say/type that should trigger it?
3. INPUT:   What does the user typically provide?
4. OUTPUT:  What does the ideal output look like?
5. QUALITY: How do you know the output is good vs. bad?
6. EDGE CASES: What variations exist? What should it NOT do?
```

---

## ✍️ Phase 1 — The SKILL.md Template

```markdown
---
name: [kebab-case-name]

description: >
  [One sentence of what it does.]
  Use this skill when [specific trigger conditions].
  Triggers include: [10+ trigger phrases, comma-separated]
  Always use this skill even when [edge case].
---

# [Skill Name] — [One-line value proposition]

[Who is Claude in this skill? What expert role?]

---

## 🧠 Phase 0 — Understand Before Acting

[What must Claude understand before starting?]

---

## 📋 Phase N — [Main Workflow Phases]

[Each phase is a clear, bounded step.]
[Include: what to do, how, why, what good looks like.]

---

## ✅ Output Format

[Exact specification of what to produce.]

---

## 🚫 Anti-Patterns

[What NOT to do. Why. How to avoid.]

---

## 📝 Changelog

| Version | Date | Change | Trigger |
|---------|------|--------|---------|
| 1.0 | YYYY-MM-DD | Initial version | Created |
```

---

## 🏗️ Phase 2 — Frontmatter Engineering

The description field determines when Claude invokes the skill.

### Description anatomy
```yaml
description: >
  # SENTENCE 1: What the skill does (outcome-focused)
  Produces production-grade [output] for [context].

  # SENTENCE 2: Primary trigger condition
  Use this skill when the user asks for [core use case].

  # SENTENCE 3+: Trigger phrase list (the more the better)
  Triggers include: "[phrase 1]", "[phrase 2]", "[phrase 3]"...

  # SENTENCE N: Proactive trigger
  Also triggers when [implicit context signal].
```

### Trigger phrase layers

```
Layer 1 — Explicit: "create a skill", "make a skill for"
Layer 2 — Synonyms: "write a skill", "design a skill"
Layer 3 — Implicit: "remember how to do this", "always do X this way"
Layer 4 — Adjacent: "automate this workflow"
Layer 5 — Frustration: "skill isn't working", "keeps failing"
Layer 6 — Domain keywords: "workflow", "automation", "pipeline"
Layer 7 — File types: "SKILL.md", "skills folder"
```

### Quality rubric

| Signal | Bad | Good |
|---|---|---|
| Length | < 50 words | 100–300 words |
| Trigger count | 0–3 | 10–20+ |
| Proactive trigger | ❌ | ✅ |

---

## 🧪 Phase 3 — Testing Protocol

### Test case design
```
1. The obvious case      — exactly what description says
2. The synonym case      — same intent, different words
3. The implicit case     — skill needed but not asked
4. The edge case         — unusual input
5. The negative case     — should NOT trigger
```

### Self-evaluation checklist
```
TRIGGERING
[ ] Does description cover all 7 trigger layers?
[ ] Are there 10+ trigger phrases?
[ ] Does it include a proactive trigger?

COMPLETENESS
[ ] Can Claude complete without re-asking?
[ ] Are output format and success criteria defined?
[ ] Are examples included?
[ ] Are anti-patterns documented?

QUALITY
[ ] Under 500 lines?
[ ] No ALL CAPS MUST commands?
[ ] Clear phase progression?
```

---

## 🔄 Phase 4 — Improvement Loop

### Improvement triggers
```
"that's not right"      → diagnostic improvement
"almost, but..."        → refinement improvement
Skill not triggering    → description improvement
Output format wrong     → output spec improvement
Same mistake twice      → anti-pattern addition
```

### Diagnostic protocol
```
1. READ the skill — what instruction caused this?
2. IDENTIFY failure point (phase? rule? example?)
3. DIAGNOSE root cause:
   - Missing instruction? → ADD
   - Ambiguous? → CLARIFY
   - Wrong? → FIX
   - Missing example? → ADD EXAMPLE
4. WRITE the fix with WHY
5. TEST with original + 2 similar cases
6. CONFIRM fix doesn't break working cases
```

---

## 📦 Phase 5 — Deployment

### File placement
```bash
~/.claude/skills/{category}/{skill-name}/SKILL.md
# OR
~/.claude/skills/{skill-name}/SKILL.md
```

### Deployment checklist
```
[ ] Name is kebab-case, matches frontmatter
[ ] Description is 100–300 words
[ ] At least 10 trigger phrases
[ ] At least one proactive trigger
[ ] At least 3 phases
[ ] At least one example
[ ] At least one anti-pattern
[ ] Changelog initialized
[ ] No hardcoded user-specific values
```

### Post-deployment test
```
1. Start new conversation
2. Try 3 trigger phrases from description
3. Verify skill is loaded and applied
4. If doesn't trigger → fix description immediately
```

---

## 📊 Quality Scoring (0–100)

```
TRIGGERING (30 points)
  +5  Has 10+ trigger phrases
  +5  Covers implicit triggers
  +5  Has proactive trigger
  +5  Covers frustration signals
  +5  Domain keywords
  +5  Non-obvious trigger

COMPLETENESS (30 points)
  +10 Output format defined
  +10 At least 3 examples
  +10 Anti-patterns documented

QUALITY (25 points)
  +5  Explains "why" not just "what"
  +5  Generalizable
  +5  Under 500 lines
  +5  Clear phase structure
  +5  No ALL-CAPS commands

META (15 points)
  +5  Has changelog
  +5  Correct category
  +5  Descriptive name

90–100: 🟢 Excellent
70–89:  🟡 Good
50–69:  🟠 Needs work
0–49:   🔴 Rebuild
```

---

*Every great workflow deserves to be a skill.
Every skill deserves to get better.*
