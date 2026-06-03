# PRAXIS Landing Page Redesign — Design Specification

**Date:** 2026-04-03
**Status:** Approved
**Target file:** `praxis/index.html`
**Live URL:** https://www.emmanuelneneodjidja.org/praxis/

---

## Design Direction

**Aesthetic:** Dark hero, light body. Cinematic opening that transitions to clean professional content. Microsoft AI for Good gravity with practitioner-led authenticity.

**Positioning:** PRAXIS AI for Good Lab — a global initiative. The Sahel is the proof-of-concept, not the frame. The methodology applies wherever ACLED operates (230+ countries).

**Voice:** Institutional, third-person. No first-person ("I") on the landing page. Same facts as before, different framing. "Built by a practitioner with 12 years across 6 conflict-affected countries" not "I spent years..."

---

## Palette

```css
:root {
  --navy: #0B1A2E;
  --navy-deep: #060c17;
  --navy-mid: #132238;
  --teal: #2EC4B6;
  --teal-dim: rgba(46,196,182,0.12);
  --amber: #E8A838;
  --amber-dim: rgba(232,168,56,0.12);
  --slate: #8899AA;
  --slate-light: #A4B3C2;
  --off-white: #E8ECF0;
  --warm: #FAFBFC;
  --surface: #FFFFFF;
}
```

**Semantic usage:**
- Teal = action, baseline, links, CTAs
- Amber = urgency, stats, credential numbers, escalation
- The teal-to-amber gradient = baseline-to-crisis (used in staircase, globe particles, and data viz)

## Typography

```
Fraunces (serif)    — headings, hero, display numbers. Weight 300 for hero, 400 for sections.
DM Sans (sans)      — body text, UI, descriptions
JetBrains Mono      — overlines, stats, data labels, nav brand, code references
```

**Key rules:**
- Fraunces at weight 300 for hero headline (light, editorial, confident — not 600)
- JetBrains Mono tracked overlines (11px, 0.15em letter-spacing, uppercase) above every section
- No IBM Plex anywhere — DM Sans replaces it inside data visualizations too

## Container System

```
720px   — prose content (problem statement, about text)
1080px  — standard sections (tracks, tools, credentials)
1200px  — wide sections (hero, stats bar, evidence)
```

Widths alternate as user scrolls to create cinematic pacing.

---

## Page Structure (7 sections)

### 1. Nav (sticky, dark)
- Dark navy background with backdrop-filter blur
- Height: 56px
- Left: PRAXIS logo in JetBrains Mono teal
- Right: Lab (active), EWS, Evaluation, Tools, 360, GitHub (teal button)
- Mobile: hamburger menu

### 2. Hero (dark, split layout)
- **Background:** Navy gradient with subtle teal/amber radial gradient atmosphere
- **Layout:** Two-column grid — text left (1fr), canvas globe right (0.8fr)
- **Content left:**
  - Overline: "AI FOR GOOD LAB" (JetBrains Mono, teal)
  - Headline: "Predicting violence before it satisfies. *Evaluating what prevents it.*" (Fraunces 300, white + teal italic)
  - Subtitle: "Open-source AI tools for programme evaluation and conflict early warning. Built by a practitioner, not a product team." (DM Sans, slate-light)
  - CTAs: "Explore Tools" (teal solid) + "Early Warning System" (outline)
- **Content right:** Canvas particle globe animation (see Interactive Elements below)
- **Stats bar:** Full-width, 4 columns, anchored at bottom of hero
  - 100,184 / conflict events analyzed
  - 230+ / countries addressable
  - 29 / peer-reviewed papers
  - MIT / open source license
  - Numbers in JetBrains Mono amber. Count-up animation on page load.

### 3. The Problem (light, narrow container)
- **Background:** warm (#FAFBFC)
- **Overline:** "THE GAP" (amber)
- **Content:** Single paragraph in Fraunces 400, ~1.75rem, max-width 680px:
  > "Evaluation tools designed for stable contexts fail in conflict zones. Early warning systems that detect individual threats miss the compound signals that actually predict violence. PRAXIS was built to close both gaps — with methods tested in the field, not the lab."
- No attribution. No quotes. Institutional voice.

### 4. Two Tracks (light, standard container)
- **Overline:** "WHAT THE LAB DOES" (teal)
- **Layout:** 2-column grid of cards
- **Card 1 (Evaluation):** Teal top-border. Track 1 label. "Programme Evaluation" heading. Description of 6 tools, 298 indicators, offline capability. "Open the toolkit →" link.
- **Card 2 (Early Warning):** Amber top-border. Track 2 label. "Conflict Early Warning" heading. Composite model, ACLED data, 230+ countries. "PRAXIS EWS →" link.
- Each card: white background, off-white border, 32px padding.

### 5. The Evidence (dark, wide container)
- **Background:** Navy with subtle radial gradient atmosphere
- **Overline:** "FEATURED RESEARCH" (amber)
- **Headline:** "No single event type predicts violence. *Co-occurrence does.*" (Fraunces 400, white + teal italic)
- **Subtitle:** One paragraph explaining the core finding (district-week co-occurrence → 7-day violence prediction)
- **Escalation Staircase:** (see Interactive Elements below)
  - 5 stepped bars: Baseline (1x) → 2 types (2.3x) → 3 types (4.0x) → 4 types (5.7x) → 5+ types (7.5x)
  - Teal-to-amber gradient transition matching the hero globe particle colors exactly
  - Numbers rendered large inside each bar (JetBrains Mono)
  - Dark container with subtle teal border
- **Evidence line:** "100,184 events. 13 countries. 15 years. All p < 0.001 after Bonferroni correction."
- **Link:** "Explore the full dataset →" (links to /ews/ or future /research page)

### 6. Tools (light, standard container)
- **Overline:** "OPEN-SOURCE TOOLKIT" (teal)
- **Heading:** "6 tools. Free. Offline capable."
- **Subheading:** "Built for evaluators working where connectivity is unreliable and generic frameworks don't fit."
- **Layout:** 2x2 grid of tool cards with micro-previews
- **Card structure:** Dark preview panel (navy bg, showing static mock of real tool output) + white body (name, description, "Try it →" link)
- **Cards shown:**
  1. **Sample Size Calculator** — preview shows: Cluster-RCT design tag, "24 clusters / 30 per cluster / 80% power" in amber/teal
  2. **Theory of Change Builder** — preview shows: Input→Activity→Output→Outcome→Impact chain, programme pathway
  3. **Evaluation Matrix** — preview shows: 3-row table with EQ, criteria, indicators, methods
  4. **+3 more tools** — plain card listing Design Advisor, Indicator Bank, Data Explorer with "View all tools →"
- All previews are static HTML (no iframes, no JS). Fast loading.
- Cards have hover state: border transitions to teal.

### 7. The Lab / Credentials (light, standard container)
- **Overline:** "THE LAB" (navy)
- **Layout:** 2-column — text left, stats grid right (300px)
- **Text:**
  - Heading: "Built from field reality"
  - Paragraph: 12 years across conflict-affected settings (Burkina Faso, Mali, Niger, South Sudan, Burundi). Epidemiology, econometrics, applied M&E.
  - Bio line: "**Emmanuel Nene Odjidja, MPH** — Founder and Director. Section Editor, Journal of MultiDisciplinary Evaluation. 29 peer-reviewed publications."
  - Links: Publications → | Google Scholar →
- **Stats grid:** 2x2 grid of stat cards
  - 12+ / years in the field
  - 29 / publications
  - 6 / countries
  - MIT / open source
  - Numbers in Fraunces 300, 2rem, amber color

### 8. Open Source + Vision (dark)
- **Background:** Navy with subtle teal radial gradient
- **Overline:** "OPEN SOURCE" (teal)
- **Heading:** "Where PRAXIS is going"
- **Text:** "The Sahel is the proof of concept. The methodology transfers wherever ACLED operates — roughly 230 countries. The evaluation tools are MIT licensed and built to be forked, adapted, and extended. This is an open invitation."
- **CTAs:** "View on GitHub" (teal solid) + "Read the methodology" (outline)

### 9. Footer (dark)
- **Background:** navy-deep (#060c17)
- Simple flex row: links (GitHub, Publications, emmanuelneneodjidja.org) + copyright
- "2026 PRAXIS. Open source. MIT licensed. ACLED data used under license."

---

## Interactive Elements

### Canvas Particle Globe
- **Technology:** 2D canvas, no libraries (no three.js, no WebGL)
- **Concept:** Inspired by the "Currents of Foresight" vision image. A stylized world map outline (subtle, low-opacity) with particles flowing along curved Bezier paths emanating from the Sahel region outward across continents.
- **Particles:** 200-400 particles, 2-3px circles with radial gradient glow
- **Colors:** Teal (#2EC4B6) and amber (#E8A838) particles. Teal dominant near the Sahel, amber as they reach further out.
- **Animation:** Smooth `requestAnimationFrame` loop. Particles flow continuously. CSS `filter: blur(0.5px)` for soft glow.
- **World map:** Very subtle continental outline at ~5% opacity. Not a detailed map — just recognizable shapes.
- **Size:** Circular container, max 400px diameter, aspect-ratio: 1
- **Performance:** Must run at 60fps. Keep particle count under 400. Use `will-change: transform` on the canvas. Lazy-init: only start animation when hero is in viewport.

### Animated Counter (Stats Bar)
- **Trigger:** Page load (IntersectionObserver on stats bar)
- **Animation:** Each number counts from 0 to final value over 1.8s with easeOutCubic
- **Implementation:** ~20 lines vanilla JS, `requestAnimationFrame`
- **Numbers:** 100,184 (with comma formatting), 230, 29, "MIT" (no animation for MIT, just appears)

### Escalation Staircase
- **Trigger:** Scroll into viewport (IntersectionObserver)
- **Animation:** Bars grow sequentially left to right, 200ms stagger between each. Width/height transition from 0 to final. Multiplier numbers count up as each bar reaches full height.
- **Colors:** Gradient from teal (baseline) through intermediate to amber (5+ types). MUST match the exact teal-to-amber gradient used in the hero globe particles for visual continuity.
- **Implementation:** CSS transitions triggered by adding a `.visible` class. ~30 lines vanilla JS.

### Scroll Reveal
- **Existing pattern preserved:** IntersectionObserver adds `.visible` class
- **Animation:** opacity 0→1, translateY 12px→0, 0.6s ease
- **Applied to:** Each section, tool cards (staggered by 100ms)

---

## What Gets Preserved From Current Page

1. **The TREMORViz React component** — the full 5-tab interactive visualization (15-year trends, geographic hotspots, the finding, regional replication, actor signatures). However, it does NOT stay on the landing page. It moves to a dedicated `/research` or `/methodology` page. The landing page only shows the escalation staircase.
2. **All data arrays** (D, TS_R, TS_K, TS_F, SIGNALS, REGS, CN, ACTOR_TACTICS, etc.) — preserved, moved with TREMORViz.
3. **The favicon** (logo.svg + logo-32.png) — preserved.
4. **The font stack** (Fraunces + DM Sans + JetBrains Mono) — preserved.
5. **The palette** — preserved and extended with amber accent.
6. **The nav structure** — preserved (same links: Lab, EWS, Evaluation, Tools, 360, GitHub).

## What Gets Removed From Current Page

1. The pull-quote section ("I spent years looking for evaluation tools...")
2. The full TREMORViz React component (moved to /research)
3. The three showcase-stat blocks (replaced by stats bar in hero)
4. The long prose descriptions in "What the lab works on" (replaced by cards)
5. The autobiographical "Who built this" paragraphs (replaced by institutional credentials)
6. The 9-item roadmap list (replaced by "Where PRAXIS is going" vision section)
7. React + ReactDOM CDN scripts (no longer needed on landing page)

## What's New

1. Canvas particle globe animation
2. Animated counter in stats bar
3. Escalation staircase visualization
4. Problem statement section
5. Tool cards with dark micro-previews
6. Amber accent color throughout
7. Alternating container widths
8. Ambient radial gradient atmospheres on dark sections

---

## Mobile Responsive

- **< 640px:**
  - Hero: single column, globe below text (or hidden)
  - Tracks: single column stack
  - Tools: single column stack
  - Credentials: single column, stats below text
  - Stats bar: 2x2 grid instead of 4-column
  - Nav: hamburger menu (existing pattern)
- **640px - 1024px:**
  - Hero: text takes more width, globe smaller
  - Tools: 2-column preserved
  - Reduced padding (56px sections instead of 80px)

## Performance

- **No React on landing page** — pure vanilla JS + HTML/CSS
- **Canvas globe:** lazy-init via IntersectionObserver. ~200-400 particles at 60fps.
- **Fonts:** Consider self-hosting Fraunces subset (Latin, weights 300/400) as WOFF2 to eliminate render-blocking request. DM Sans and JetBrains Mono can stay on Google Fonts with `display=swap`.
- **Total JS:** ~150-200 lines (counter + staircase + globe + scroll reveal). No libraries.
- **Target:** First meaningful paint < 1.5s on 3G.

## Social Sharing / OG Image

- Render the escalation staircase as a standalone 1200x630px image for Open Graph meta tags
- Dark background, self-contained with "PRAXIS AI for Good Lab" watermark
- Every URL share becomes a billboard for the co-occurrence finding

---

## File Changes Summary

| File | Action |
|------|--------|
| `praxis/index.html` | Complete rewrite — new page structure, all sections, canvas globe, staircase |
| `praxis/research/index.html` | NEW — dedicated page for TREMORViz (receives the React component + all data arrays) |
| `praxis/logo.svg` | Keep as-is |
| `praxis/logo-32.png` | Keep as-is |
