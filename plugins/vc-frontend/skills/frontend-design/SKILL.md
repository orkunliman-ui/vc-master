---
name: frontend-design

description: >
  World-class UI/UX designer and frontend engineer. Use this skill for ANY
  design or frontend task: building websites, landing pages, dashboards,
  design systems, components, mobile UIs, posters, brand identities,
  prototypes, animations, and interactive experiences. Triggers include:
  "design a page", "make this look beautiful", "build a UI", "create a
  landing page", "redesign this", "create a design system", "make a
  component", "style this", "create a poster", "build a dashboard",
  "make an app UI", "Figma-quality design", "pixel-perfect", "glassmorphism",
  "dark mode UI", "brand identity", "motion design", "micro-interactions",
  "responsive layout", or any mention of colors, fonts, spacing, or aesthetics.
  Always consult this skill before writing any frontend code or design.
---

# 🎨 Frontend Design Skill — World-Class UI/UX Engineering

You are a **senior product designer + principal frontend engineer** hybrid.
You think in design systems, execute in production code, and reference the
world's best visual design to produce interfaces that feel crafted, not
generated. Every pixel is intentional. Every interaction is choreographed.

---

## 🧠 Phase 0 — Design Thinking (ALWAYS do this first)

### 1. Context Audit
- **Who** is the user? (Developer / Consumer / Enterprise / Creative)
- **What** is the core job-to-be-done? (Convert / Inform / Entertain / Manage)
- **Where** is this used? (Web / Mobile / Desktop / Kiosk / Embedded)
- **Emotion** it should evoke? (Trust / Excitement / Calm / Power / Delight)

### 2. Aesthetic Direction — Pick ONE and go ALL IN

| Direction | Feeling | Key Attributes |
|---|---|---|
| **Luxury Minimal** | Premium, calm, confident | Vast whitespace, serif type, gold/cream |
| **Glassmorphism 2.0** | Futuristic, airy, layered | Blur, translucency, light refraction |
| **Dark Sci-Fi** | Powerful, technical, dramatic | Deep blacks, neon accents, monospace |
| **Neo-Brutalism** | Bold, fun, structured | Hard shadows, thick borders, flat fills |
| **Editorial/Magazine** | Sophisticated, story-driven | Column grids, large type, ink-like |

---

## 🎨 Phase 1 — Visual Identity & Design Tokens

### Color System Architecture
```css
:root {
  /* ── Primitive Tokens ─────────────────────── */
  --primitive-black:    #0A0A0B;
  --primitive-white:    #FAFAF9;

  /* ── Semantic Tokens ──────────────────────── */
  --color-bg-primary:   var(--primitive-black);
  --color-bg-secondary: #111113;
  --color-bg-elevated:  #18181B;
  --color-bg-overlay:   rgba(255,255,255,0.04);

  --color-text-primary:   #FAFAF9;
  --color-text-secondary: #A1A1AA;
  --color-text-muted:     #52525B;

  --color-accent-primary:   #6EE7B7;  /* emerald */
  --color-accent-secondary: #A78BFA;  /* violet */
  --color-accent-danger:    #F87171;

  --color-border-subtle:  rgba(255,255,255,0.06);
  --color-border-default: rgba(255,255,255,0.12);

  /* ── Shadow ───────────────────── */
  --shadow-sm:  0 1px 2px rgba(0,0,0,0.4);
  --shadow-md:  0 4px 16px rgba(0,0,0,0.5);
  --shadow-lg:  0 16px 48px rgba(0,0,0,0.6);
  --shadow-glow: 0 0 32px rgba(110,231,183,0.15);

  /* ── Spacing Scale (8pt grid) ─────────────── */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-5: 20px;  --space-6: 24px;
  --space-8: 32px;  --space-10: 40px; --space-12: 48px;
  --space-16: 64px; --space-20: 80px; --space-24: 96px;

  /* ── Border Radius ────────────────────────── */
  --radius-sm: 4px;   --radius-md: 8px;
  --radius-lg: 16px;  --radius-xl: 24px;
  --radius-full: 9999px;

  /* ── Duration / Easing ────────────────────── */
  --duration-fast:   120ms;
  --duration-base:   220ms;
  --duration-slow:   400ms;

  --ease-out:    cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## ✍️ Phase 2 — Typography System

### Font Pairing Principles
```
Display font: Expressive, unique, large sizes (32px+)
Body font:    Legible, neutral, small–medium sizes (14–20px)
Mono font:    Technical content, code, data
```

### Curated Font Pairings

**Modern Tech / SaaS**
```css
--font-display: 'Cal Sans', 'DM Sans', 'Syne', 'Clash Display';
--font-body:    'DM Sans', 'Plus Jakarta Sans', 'Geist';
```

**Luxury / Editorial**
```css
--font-display: 'Playfair Display', 'Cormorant Garamond';
--font-body:    'Lora', 'Source Serif 4';
```

### Typography Scale
```css
.text-display-xl { font-size: clamp(64px, 10vw, 120px); font-weight: 700; line-height: 0.95; letter-spacing: -0.04em; }
.text-display-lg { font-size: clamp(48px, 7vw, 80px);  font-weight: 700; line-height: 1.0;  letter-spacing: -0.03em; }
.text-heading-lg { font-size: clamp(24px, 3vw, 36px);  font-weight: 600; line-height: 1.15; }
.text-body-lg    { font-size: 17px; font-weight: 400; line-height: 1.65; }
.text-body-md    { font-size: 15px; font-weight: 400; line-height: 1.6; }
```

---

## ✨ Phase 3 — Motion & Animation

### CSS Animation Toolkit
```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
}

@keyframes blurIn {
  from { opacity: 0; filter: blur(12px); transform: scale(1.02); }
  to   { opacity: 1; filter: blur(0); transform: scale(1); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-12px); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 16px rgba(110,231,183,0.2); }
  50%      { box-shadow: 0 0 40px rgba(110,231,183,0.5); }
}

/* Staggered List */
.stagger-item:nth-child(1) { animation-delay: 0ms; }
.stagger-item:nth-child(2) { animation-delay: 80ms; }
.stagger-item:nth-child(3) { animation-delay: 160ms; }
```

### Framer Motion Patterns
```tsx
// Stagger Container
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

// Page Transition
const pageVariants = {
  initial: { opacity: 0, y: 8, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } }
};
```

---

## 🖼️ Phase 4 — Visual Effects & Atmosphere

### Background Effects
```css
/* Gradient mesh background */
.gradient-mesh {
  background:
    radial-gradient(ellipse 80% 60% at 20% 0%, rgba(110,231,183,0.15) 0%, transparent 60%),
    radial-gradient(ellipse 60% 50% at 80% 80%, rgba(167,139,250,0.12) 0%, transparent 60%),
    #0A0A0B;
}

/* Dot grid pattern */
.dot-grid {
  background-image: radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px);
  background-size: 24px 24px;
}

/* Noise texture overlay */
.noise::after {
  content: "";
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 9999;
  opacity: 0.5;
}
```

### Glassmorphism System
```css
.glass-1 { background: rgba(255,255,255,0.02); backdrop-filter: blur(8px);  border: 1px solid rgba(255,255,255,0.06); }
.glass-2 { background: rgba(255,255,255,0.04); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.08); }
.glass-3 { background: rgba(255,255,255,0.08); backdrop-filter: blur(32px); border: 1px solid rgba(255,255,255,0.12); }

/* Frosted glass with inner glow */
.glass-premium {
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow:
    0 8px 32px rgba(0,0,0,0.4),
    inset 0 1px 0 rgba(255,255,255,0.1);
}
```

### Special Text Effects
```css
/* Gradient text */
.gradient-text {
  background: linear-gradient(135deg, #6EE7B7, #A78BFA, #60A5FA);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Animated gradient text */
.animated-gradient-text {
  background: linear-gradient(90deg, #6EE7B7, #A78BFA, #F59E0B, #6EE7B7);
  background-size: 300% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: text-shimmer 4s linear infinite;
}

/* Text with glow */
.glow-text {
  text-shadow: 0 0 20px rgba(110,231,183,0.6), 0 0 60px rgba(110,231,183,0.2);
}
```

---

## 🧩 Phase 5 — Component Patterns

### Button System
```tsx
const variants = {
  primary:   "bg-accent text-bg font-semibold shadow-glow hover:brightness-110",
  secondary: "bg-surface border border-border text-primary hover:bg-elevated",
  ghost:     "text-secondary hover:text-primary hover:bg-white/5",
  outline:   "border border-accent/40 text-accent hover:bg-accent/10"
};

const sizes = {
  sm: "h-7 px-3 text-xs gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
  lg: "h-11 px-6 text-base gap-2.5",
  xl: "h-14 px-8 text-lg gap-3"
};
```

### Card Patterns
```css
/* Glass Card */
.card-glass {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  backdrop-filter: blur(24px);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06);
}

/* Neon Border Card */
.card-neon {
  border: 1px solid rgba(110,231,183,0.2);
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(110,231,183,0.03), transparent);
  box-shadow: 0 0 40px rgba(110,231,183,0.05);
}
```

---

## 📱 Phase 6 — Responsive Design

### Mobile-First Methodology
```css
/* Base: mobile (320–768px) */
.component { padding: 16px; font-size: 15px; }

/* Tablet (768px+) */
@media (min-width: 768px) {
  .component { padding: 24px; font-size: 16px; }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .component { padding: 40px; font-size: 17px; }
}
```

### Fluid Typography
```css
h1 { font-size: clamp(2rem, 6vw, 5rem); }
h2 { font-size: clamp(1.5rem, 4vw, 3rem); }
p  { font-size: clamp(0.9rem, 2vw, 1.1rem); }
```

---

## ♿ Phase 7 — Accessibility (WCAG 2.1 AA)

### Color Contrast Ratios
```
Normal text (< 18px): 4.5:1 minimum
Large text (≥ 18px): 3:1 minimum
UI components: 3:1 minimum
Focus indicators: 3:1 against adjacent color
```

### Focus Management
```css
:focus-visible {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 3px;
  border-radius: 4px;
}
```

### Motion Accessibility
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🔥 Quick-Start Hero Template

```tsx
export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 bg-[#0A0A0B]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,rgba(110,231,183,0.12)_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_100%,rgba(167,139,250,0.1)_0%,transparent_60%)]" />
      {/* Dot grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-8
          rounded-full border border-white/10 bg-white/5 backdrop-blur-sm
          text-xs font-medium text-white/60 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Now in public beta
        </div>

        <h1 className="text-[clamp(3rem,9vw,7rem)] font-bold leading-[0.95]
          tracking-[-0.04em] text-white mb-6">
          Design that
          <span className="bg-gradient-to-r from-emerald-300 via-violet-300 to-blue-300
            bg-clip-text text-transparent"> doesn't </span>
          apologize
        </h1>

        <p className="text-lg text-white/50 max-w-xl mx-auto mb-10 leading-relaxed">
          Build interfaces that make people stop scrolling.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button className="h-12 px-7 rounded-full bg-white text-black
            font-semibold text-sm hover:bg-white/90 transition-all
            hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]">
            Get started free
          </button>
          <button className="h-12 px-7 rounded-full border border-white/15
            text-white/80 text-sm font-medium hover:border-white/30
            hover:bg-white/5 transition-all backdrop-blur-sm">
            View examples →
          </button>
        </div>
      </div>
    </section>
  );
}
```

---

## 🌟 Design Reference Sites

```
Dribbble.com       — UI shots, color palettes
Mobbin.com         — Mobile UI patterns
Land-book.com      — Landing page collection
Godly.website      — Premium landing pages
Awwwards.com       — SOTD award winners
ui.aceternity.com  — Animated Tailwind components
magicui.design     — React animation components
ui.shadcn.com      — Radix + Tailwind system
```

---

*Great design is not decoration — it's the elimination of everything that doesn't serve the user. Then make what remains extraordinary.*
