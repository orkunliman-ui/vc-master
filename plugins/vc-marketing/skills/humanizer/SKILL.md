---
name: humanizer

description: >
  Make AI-sounding text read like a specific human wrote it. Use this skill
  when writing emails, marketing content, blog posts, social media, or any
  text that needs to sound authentic and not AI-generated. Triggers include:
  "make this sound human", "humanize this", "less AI-sounding", "more natural",
  "sounds too robotic", "write like a human", "authentic voice", "remove AI
  patterns", "sounds generated", "too formal", "too generic".
---

# ✍️ Humanizer — Kill the AI Voice

Make AI-sounding text read like a specific human wrote it. Detect and remove
common LLM tells across wording, structure, tone, and statistical signals,
while preserving meaning and intended tone.

---

## 🎯 Humanization Checklist

1. Read the draft and identify patterns from the list below
2. Flag suspicious vocabulary (Tier 1 bans, Tier 2 jargon, cliché phrases)
3. Rewrite problematic sections with concrete, personality-driven language
4. Maintain meaning, facts, and intended tone
5. End with something specific — avoid generic "the future looks bright" endings
6. Read aloud mentally — if it feels like a press release, keep editing

---

## 🚫 28 Patterns to Kill

### Content inflation
- "marking a pivotal moment…"
- "...showcasing...highlighting..."
- Name-dropping outlets with no facts
- Sounds like marketing copy

### Promo adjectives
- nestled, breathtaking, stunning, renowned

### Vague attributions
- "Experts believe…", "Studies show…"

### Formulaic resilience
- "Despite challenges… continues to thrive"

### AI vocabulary (see Tier 1 ban list)

### Copula avoidance
- "serves as", "boasts", "features" instead of "is/has"

### Negative parallelism
- "It's not just X, it's Y"

### Rule of three
- "innovation, inspiration, and insights"

### Synonym cycling
- protagonist → main character → central figure

### Style ticks
- Em dash overuse
- Every word Title Cased
- Bold everywhere
- Emoji bucket 🧠🚀✅

### Chatbot artifacts
- "Great question!"
- "I hope this helps!"
- "Let me break it down…"

### Sycophancy / filler
- "In order to"
- "Due to the fact that"
- "At this point in time"

### Over-structuring
- Too many headings/bullets for simple ideas

---

## 🚨 Vocabulary Bans

### Tier 1 — Ban outright

```
delve, tapestry, vibrant, crucial, comprehensive, meticulous,
embark, robust, seamless, groundbreaking, leverage, synergy,
transformative, paramount, multifaceted, myriad, cornerstone,
reimagine, empower, catalyst, invaluable, bustling, nestled,
realm, unpack, actionable, impactful, learnings, bandwidth,
net-net, value-add, thought leader
```

### Tier 2 — Use sparingly

```
furthermore, moreover, paradigm, holistic, utilize, facilitate,
nuanced, illuminate, encompasses, catalyze, proactive, ubiquitous,
quintessential, cadence, best practices
```

### Cliché phrases

```
"In today's digital age…"
"It is worth noting…"
"plays a crucial role…"
"serves as a testament…"
"in the realm of…"
"embark on a journey…"
"pain points"
"move the needle"
"low-hanging fruit"
```

---

## ✅ Core Rewrite Principles

### Write plainly
- "is/has" > "serves as/boasts"
- Cut filler: "in order to" → "to"

### Be specific
- Cite a data point
- Name a source
- Describe what actually happened

### Add viewpoint
- React to facts
- Acknowledge complexity/messiness

### Vary rhythm
- Short fragments next to longer sentences
- Break predictable patterns

### Drop chatbot tone
- No "Great question!"
- No "Let me know if you need anything else"

### End concretely
- ❌ "The future looks bright"
- ✅ "Storage costs $X/kWh — that's the bottleneck"

---

## 📊 Statistical Tells

| Metric | Human target | AI typical |
|--------|--------------|------------|
| Burstiness | 0.5–1.0 | 0.1–0.3 |
| Type-token ratio | 0.5–0.7 | 0.3–0.5 |
| Sentence length variance | High | Low |
| Trigram repetition | <0.05 | >0.10 |

---

## 🔄 Process

1. **Scan** for pattern matches (28-pattern checklist + vocabulary tiers)
2. **List** issues by priority (content inflation, vocabulary, structure)
3. **Rewrite** affected segments with human cadence and specifics
4. **Verify** by reading aloud mentally

---

## 💬 Voice Calibration Examples

**User writes:**
"yo can u help me make this api faster lol its so slow rn"

❌ Wrong:
"Certainly! I'd be happy to help you optimize your API performance. There are several approaches we can consider..."

✅ Right:
"yeah a few things — first, are you caching responses? also what's your DB query time looking like?"

---

**User writes:**
"I need to refactor this authentication module."

❌ Wrong:
"Sure! Let me explain the difference between HS256 and RS256..."

✅ Right:
"RS256 is the right call for multi-service. Here's the migration path..."

---

*The best humanized text is invisible — readers just notice it sounds like a real person wrote it.*
