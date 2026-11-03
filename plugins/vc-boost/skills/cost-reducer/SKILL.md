---
name: cost-reducer

description: >
  Token economist and API cost optimizer for Claude Code and Anthropic API
  usage. Use this skill for ANY situation where cost, token usage, or
  efficiency matters: before starting a large task, when a codebase is getting
  expensive to process, when prompts feel bloated, when context windows fill
  up fast, when switching models, when architecting multi-agent pipelines, or
  when auditing an existing Claude Code setup. Triggers include: "reduce
  costs", "save tokens", "optimize my prompts", "context window too large",
  "API bill too high", "compress this", "make this cheaper", "trim context",
  "efficient Claude usage", "batch requests", "which model is cheapest".
---

# 💰 Cost Reducer Skill — Token Economics & API Optimization

You are a **principal AI infrastructure engineer** specializing in LLM cost
architecture. Your job is to extract maximum value from every token spent
while cutting every token wasted.

---

## 🧠 Mental Model: Where Money Goes

```
Total Cost = (Input Tokens × Input Price) + (Output Tokens × Output Price)

Input Tokens  = System prompt + Conversation history + Context files + User message
Output Tokens = Model's response

Cache Hit     = Input tokens served from cache at ~10% of full price
Cache Miss    = Full input token price charged
```

**Key insight**: Input tokens dominate cost in most workloads.

---

## 📊 Model Pricing (2025)

| Model | Input $/MTok | Output $/MTok | Cache Read |
|-------|--------------|---------------|------------|
| claude-opus-4-5 | $15.00 | $75.00 | $1.50 |
| claude-sonnet-4-5 | $3.00 | $15.00 | $0.30 |
| claude-haiku-4-5 | $0.80 | $4.00 | $0.08 |

**Ratio Haiku vs Opus: ~90× cheaper on input**

---

## 🏷️ Phase 1 — Model Selection (Biggest Lever)

### Model Selection Matrix

| Use Case | Best Model | Why |
|---|---|---|
| Simple Q&A, classification, extraction | **Haiku** | 90% cheaper, fast |
| Code generation, summarization | **Sonnet** | Best cost/quality |
| Complex reasoning, architecture | **Opus** | Only when needed |
| Routing / triage decisions | **Haiku** | Cheap classifier |
| Batch, non-realtime | **Any + Batch API** | 50% discount |

### Two-Stage Pattern (Triage → Execute)

```python
async def two_stage_completion(user_input: str) -> str:
    # Stage 1: Haiku decides complexity (~$0.0001)
    triage_response = await client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=10,
        messages=[{
            "role": "user",
            "content": f"""Classify complexity. Reply: SIMPLE | MEDIUM | COMPLEX
Task: {user_input[:200]}"""
        }]
    )
    complexity = triage_response.content[0].text.strip().upper()

    # Stage 2: Route to right model
    model_map = {
        "SIMPLE":  "claude-haiku-4-5-20251001",
        "MEDIUM":  "claude-sonnet-4-6",
        "COMPLEX": "claude-opus-4-6",
    }
    model = model_map.get(complexity, "claude-sonnet-4-6")

    response = await client.messages.create(
        model=model,
        max_tokens=2048,
        messages=[{"role": "user", "content": user_input}]
    )
    return response.content[0].text
```

---

## 🗜️ Phase 2 — System Prompt Compression

### Compression Rules

**Rule 1: Remove filler language**
```
❌ "You are an incredibly helpful AI assistant that is always ready..."
✅ "Helpful AI. Concise answers."
Savings: ~80 tokens → ~8 tokens (90% reduction)
```

**Rule 2: Use structured formats**
```
❌ "When the user asks about code, you should first explain..."
✅ "For code: 1. Explain 2. Bugs 3. Improve"
Savings: ~40 tokens → ~15 tokens
```

**Rule 3: Remove redundant constraints**
```
❌ "Never be rude. Always be professional. Don't use offensive language..."
✅ "Be professional."
Savings: ~30 tokens → ~3 tokens
```

---

## 💾 Phase 3 — Prompt Caching (Up to 90% Input Cost Reduction)

### What to Cache

```
✅ ALWAYS CACHE:
  - System prompts
  - Large codebase sections
  - Few-shot examples
  - Conversation history prefix

❌ NEVER CACHE:
  - Current user message
  - Real-time data
  - Session-specific state
```

### Implementation

```python
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    system=[
        {
            "type": "text",
            "text": "Your large, static system prompt here...",
            "cache_control": {"type": "ephemeral"}  # Cache this block
        }
    ],
    messages=[{"role": "user", "content": user_message}]
)
```

⚠️ **NEVER use `betas` parameter** — use native `cache_control` only.

---

## 📜 Phase 4 — Conversation History Management

### The Problem: Quadratic Cost Growth

```
Turn 1:   100 tokens  → $0.0003
Turn 10:  1,000 tokens → $0.003
Turn 50:  5,000 tokens → $0.015
Turn 100: 10,000 tokens → $0.030 ← 100× more than turn 1
```

### Strategy 1: Rolling Window

```python
def trim_history(messages, max_turns=10, keep_first=2):
    if len(messages) <= max_turns:
        return messages
    head = messages[:keep_first]
    tail = messages[-(max_turns - keep_first):]
    return head + tail
```

### Strategy 2: Semantic Compression

```python
def compress_history(messages, keep_last_n=4):
    if len(messages) <= keep_last_n:
        return messages

    to_compress = messages[:-keep_last_n]
    recent = messages[-keep_last_n:]

    # Compress with Haiku (cheap)
    history_text = "\n".join(f"{m['role']}: {m['content']}" for m in to_compress)
    summary = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=300,
        messages=[{
            "role": "user",
            "content": f"Summarize in 150 words max:\n{history_text}"
        }]
    ).content[0].text

    compressed = [
        {"role": "user", "content": f"Previous context: {summary}"},
        {"role": "assistant", "content": "Understood."}
    ]
    return compressed + recent
```

---

## 📦 Phase 5 — Batch API (50% Discount)

For non-realtime workloads:

```python
batch_requests = [
    {
        "custom_id": f"doc_{i}",
        "params": {
            "model": "claude-haiku-4-5-20251001",
            "max_tokens": 1024,
            "messages": [{"role": "user", "content": prompt}]
        }
    }
    for i, prompt in enumerate(prompts)
]

batch = client.messages.batches.create(requests=batch_requests)
# 50% off all tokens!
```

---

## ✍️ Phase 6 — Output Token Optimization

Output tokens are **5× more expensive** than input.

### Techniques

**Set max_tokens precisely:**
```python
task_budgets = {
    "classification":   10,
    "yes_no":           5,
    "short_summary":    150,
    "code_snippet":     500,
    "full_analysis":    1000,
}
```

**Explicit length instructions:**
```
❌ "Explain how caching works"
✅ "Explain caching in 3 bullets, max 50 words"
```

**Prefill to skip preamble:**
```python
messages=[
    {"role": "user", "content": "Capital of France?"},
    {"role": "assistant", "content": "Paris"}  # Prefill
]
```

---

## 🔄 Phase 7 — Agentic Loop Cost Control

```python
class CostGuardedAgent:
    def __init__(self, max_tokens=50_000, max_turns=20):
        self.max_tokens = max_tokens
        self.max_turns = max_turns
        self.tokens_used = 0
        self.turns = 0

    def check_budget(self, response) -> bool:
        self.tokens_used += response.usage.input_tokens + response.usage.output_tokens
        self.turns += 1

        if self.tokens_used >= self.max_tokens:
            print(f"🛑 Budget exceeded ({self.tokens_used:,} tokens)")
            return False
        if self.turns >= self.max_turns:
            print(f"🛑 Turn limit ({self.turns} turns)")
            return False
        return True
```

---

## 🏆 Quick Wins Checklist

### Immediate (today)
- [ ] Switch simple tasks to Haiku — 90% cheaper
- [ ] Add `cache_control` to system prompt — 90% off repeated inputs
- [ ] Set `max_tokens` precisely — never 4096 when 200 suffices
- [ ] Enable Batch API for non-realtime — 50% off

### Short-term (this week)
- [ ] Implement rolling window on conversation history
- [ ] Add token budget guard to agentic loops
- [ ] Trim CLAUDE.md to essentials only
- [ ] Implement two-stage routing

### Expected Savings

| Optimization | Typical Saving |
|---|---|
| Model routing (Opus→Haiku) | 70–90% |
| Prompt caching | 50–90% on input |
| Batch API | 50% flat |
| System prompt compression | 30–60% |
| Conversation trimming | 20–50% |
| max_tokens precision | 10–30% |

**Combined: 80–95% cost reduction possible.**

---

## ⚡ Emergency Cost Cut (5 Minutes)

```python
# 1. Swap to Haiku
MODEL = "claude-haiku-4-5-20251001"

# 2. Hard-cap tokens
MAX_TOKENS = 512

# 3. Truncate history
messages = messages[-8:]

# 4. Minimal system prompt
SYSTEM = "Helpful assistant. Be concise."

# 5. Enable caching
CACHE_CONTROL = {"type": "ephemeral"}
```

These 5 changes cut costs by **60–80% immediately**.

---

*Every wasted token is money left on the table.*
