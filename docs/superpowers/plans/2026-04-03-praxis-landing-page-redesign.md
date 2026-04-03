# PRAXIS Landing Page Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the PRAXIS landing page from a text-heavy personal blog layout into a tier-one research institution page with dark hero, canvas globe, escalation staircase, and tool micro-previews.

**Architecture:** Single HTML file rewrite (`praxis/index.html`). The existing TREMORViz React component + all data arrays are extracted to a new `praxis/research/index.html` page. The landing page becomes pure vanilla JS + HTML + CSS with three interactive elements: canvas particle globe, animated counter, and escalation staircase. No React dependency on the landing page.

**Tech Stack:** HTML5, CSS3 (custom properties, grid, clamp), vanilla JavaScript (Canvas 2D API, IntersectionObserver, requestAnimationFrame). No libraries.

**Spec:** `docs/superpowers/specs/2026-04-03-praxis-landing-page-redesign.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `praxis/index.html` | Rewrite | Landing page — all 9 sections, canvas globe, staircase, counters |
| `praxis/research/index.html` | Create | Research explorer — receives TREMORViz React component + all data arrays |

The landing page is a single self-contained HTML file (CSS in `<style>`, JS in `<script>`). No external stylesheets, no build step.

---

### Task 1: Extract TREMORViz to Research Page

**Files:**
- Create: `praxis/research/index.html`
- Modify: `praxis/index.html` (remove lines 635-1988)

This task preserves the existing React visualization by moving it to its own page before we rewrite the landing page.

- [ ] **Step 1: Create the research page scaffold**

Create `praxis/research/index.html` with the nav, the same navy/teal palette, and a container for the viz. Copy the full `<script>` block containing React CDN links, all data arrays (D, TS_R, TS_K, TS_F, SIGNALS, REGS, CN, ACTOR_TACTICS, TACTIC_LABELS, TACTIC_COLORS, JNIM_RATIO, ACTOR_SIGNAL, BF_ARC), and the entire TREMORViz component from `praxis/index.html` lines 635-1988.

The page structure:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Same meta, favicon, fonts as landing page -->
  <title>PRAXIS Research — Composite Co-occurrence Analysis</title>
  <!-- Nav CSS + showcase CSS from current index.html lines 52-78, 146-211 -->
  <!-- Dark page background: body { background: var(--navy); color: var(--off-white); } -->
</head>
<body>
  <!-- Nav (same as landing page) -->
  <nav>...</nav>

  <main style="max-width:1080px;margin:0 auto;padding:80px 40px;">
    <p class="overline" style="color:var(--teal);">RESEARCH</p>
    <h1 style="font-family:'Fraunces',serif;font-size:2.2rem;font-weight:400;color:white;margin:16px 0 12px;">
      No single event type predicts violence. <em style="color:var(--teal);">Co-occurrence does.</em>
    </h1>
    <p style="color:var(--slate-light);max-width:600px;margin-bottom:40px;">
      Analysis of 100,184 ACLED conflict events across 13 countries (2010-2025).
    </p>

    <div id="tremor-root" style="background:var(--navy);border:1px solid rgba(46,196,182,0.1);padding:24px 20px 16px;margin-bottom:24px;">
      Loading visualization...
    </div>

    <!-- Stats and caption from current index.html lines 434-456 -->
  </main>

  <!-- React CDN scripts -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <!-- All data arrays + TREMORViz component + ReactDOM.createRoot mount -->
  <script>
    // Entire JS block from current index.html lines 636-1988
  </script>

  <footer>...</footer>
</body>
</html>
```

- [ ] **Step 2: Verify the research page renders correctly**

Open `praxis/research/index.html` in browser. Verify:
- All 5 tabs render (15-year escalation, Geographic hotspots, The finding, Regional replication, Actor signatures)
- Hover tooltips work
- Tab switching works
- Charts render with correct colors

- [ ] **Step 3: Strip the TREMORViz from the landing page**

In `praxis/index.html`, remove:
- The React CDN script tags (line 19-20)
- The entire `<script>` block containing TREMORViz (lines 635-1988)
- The `#tremor-root` div and surrounding showcase-stats/caption markup (lines 432-456)

Keep everything else intact for now — we'll rewrite the full page in the next tasks.

- [ ] **Step 4: Commit**

```bash
git add praxis/research/index.html praxis/index.html
git commit -m "refactor: extract TREMORViz to dedicated research page"
```

---

### Task 2: Landing Page — HTML Structure (All 9 Sections)

**Files:**
- Rewrite: `praxis/index.html`

This is the core rewrite. Create the complete HTML structure with all content, but CSS and JS come in subsequent tasks. Write semantic HTML with class names matching the spec.

- [ ] **Step 1: Write the complete HTML structure**

Rewrite `praxis/index.html` from scratch. The file structure:

```
<!DOCTYPE html>
<html lang="en">
<head>
  Meta tags (charset, viewport, title, description, OG tags, twitter card)
  Favicon links (logo.svg, logo-32.png)
  Theme-color: #0B1A2E
  Google Fonts link (Fraunces, DM Sans, JetBrains Mono)
  <style>/* Task 3 */</style>
</head>
<body>
  <nav> ... </nav>

  <section class="hero"> ... </section>            <!-- Dark: split layout + globe + stats -->
  <section class="problem"> ... </section>          <!-- Light: narrow container -->
  <section class="tracks"> ... </section>           <!-- Light: 2-column cards -->
  <section class="evidence"> ... </section>         <!-- Dark: staircase -->
  <section class="tools"> ... </section>            <!-- Light: 2x2 micro-preview grid -->
  <section class="credentials"> ... </section>      <!-- Light: text + stats grid -->
  <section class="vision"> ... </section>           <!-- Dark: forward-looking CTA -->
  <footer> ... </footer>

  <script>/* Tasks 4-6 */</script>
</body>
</html>
```

Key content for each section (from spec):

**Nav:** Same links as current. Dark bg. PRAXIS brand left. Lab/EWS/Evaluation/Tools/360/GitHub right. Hamburger on mobile.

**Hero:**
```html
<section class="hero">
  <div class="hero-inner">
    <div class="hero-text">
      <p class="overline teal">AI FOR GOOD LAB</p>
      <h1>Predicting violence before it satisfies.<br><em>Evaluating what prevents it.</em></h1>
      <p class="hero-sub">Open-source AI tools for programme evaluation and conflict early warning. Built by a practitioner, not a product team.</p>
      <div class="hero-ctas">
        <a href="./tools/" class="btn btn-teal">Explore Tools</a>
        <a href="./ews/" class="btn btn-outline">Early Warning System</a>
      </div>
    </div>
    <div class="globe-wrap">
      <canvas id="globe" width="800" height="800"></canvas>
    </div>
  </div>
  <div class="stats-bar">
    <div class="stat-cell"><div class="stat-value" data-target="100184">0</div><div class="stat-label">conflict events analyzed</div></div>
    <div class="stat-cell"><div class="stat-value" data-target="230">0</div><div class="stat-label">countries addressable</div></div>
    <div class="stat-cell"><div class="stat-value" data-target="29">0</div><div class="stat-label">peer-reviewed papers</div></div>
    <div class="stat-cell"><div class="stat-value" data-suffix="">MIT</div><div class="stat-label">open source license</div></div>
  </div>
</section>
```

**Problem:**
```html
<section class="problem">
  <div class="section-narrow reveal">
    <p class="overline amber">THE GAP</p>
    <p class="problem-text">Evaluation tools designed for stable contexts fail in conflict zones. Early warning systems that detect individual threats miss the compound signals that actually predict violence. PRAXIS was built to close both gaps — with methods tested in the field, not the lab.</p>
  </div>
</section>
```

**Tracks:** Two cards (Evaluation with teal top border, Early Warning with amber top border). Content from spec section 4.

**Evidence:**
```html
<section class="evidence">
  <div class="section-wide reveal">
    <p class="overline amber">FEATURED RESEARCH</p>
    <h2>No single event type predicts violence.<br><em>Co-occurrence does.</em></h2>
    <p class="evidence-sub">When individual conflict event types occur in isolation, next-week attack rates drop to baseline. When two or more types co-occur in the same district-week, lethal violence follows within 7 days.</p>
    <div class="staircase" id="staircase">
      <div class="stair" data-height="40" data-value="1x" data-label="Baseline"></div>
      <div class="stair" data-height="80" data-value="2.3x" data-label="2 types"></div>
      <div class="stair" data-height="130" data-value="4.0x" data-label="3 types"></div>
      <div class="stair" data-height="180" data-value="5.7x" data-label="4 types"></div>
      <div class="stair" data-height="240" data-value="7.5x" data-label="5+ types"></div>
    </div>
    <p class="evidence-note">100,184 events. 13 countries. 15 years. All p &lt; 0.001 after Bonferroni correction.</p>
    <a href="./research/" class="evidence-link">Explore the full dataset &rarr;</a>
  </div>
</section>
```

**Tools:** 2x2 grid. First 3 cards have `.tool-preview` (dark) + `.tool-body` (light). Fourth card is "+3 more tools" with list. Content from spec section 6. Each preview shows static HTML mocking real tool output (sample size numbers, ToC chain, eval matrix table).

**Credentials:** Two-column. Left: heading + two paragraphs + links. Right: 2x2 stat grid (12+, 29, 6, MIT in amber Fraunces). "Emmanuel Nene Odjidja — Founder and Director. Section Editor, Journal of MultiDisciplinary Evaluation."

**Vision:** Dark. "Where PRAXIS is going" + paragraph + two CTAs (GitHub + methodology).

**Footer:** Dark-deep. Links + copyright.

- [ ] **Step 2: Verify HTML renders (unstyled but structurally correct)**

Open in browser. All text content should be visible. Links should point to correct URLs. No broken markup.

- [ ] **Step 3: Commit**

```bash
git add praxis/index.html
git commit -m "feat(landing): complete HTML structure — all 9 sections"
```

---

### Task 3: Landing Page — CSS (Complete Styling)

**Files:**
- Modify: `praxis/index.html` (fill in the `<style>` block)

- [ ] **Step 1: Write the complete CSS**

All styles go in the single `<style>` tag in `<head>`. Organized by section. Key CSS from the spec:

```css
/* === VARIABLES === */
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

/* === RESET + BASE === */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; scroll-padding-top: 56px; }
body {
  font-family: 'DM Sans', -apple-system, sans-serif;
  color: var(--navy); background: var(--warm);
  -webkit-font-smoothing: antialiased;
  line-height: 1.65; font-size: 16px; overflow-x: hidden;
}
a { text-decoration: none; color: inherit; }
img { max-width: 100%; display: block; }

/* === UTILITY === */
.overline {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; font-weight: 500;
  letter-spacing: 0.15em; text-transform: uppercase;
}
.overline.teal { color: var(--teal); }
.overline.amber { color: var(--amber); }
.section-narrow { max-width: 720px; margin: 0 auto; padding: 0 40px; }
.section-inner { max-width: 1080px; margin: 0 auto; padding: 0 40px; }
.section-wide { max-width: 1200px; margin: 0 auto; padding: 0 40px; }

/* === NAV === */
nav {
  position: sticky; top: 0; z-index: 100;
  background: rgba(6,12,23,0.95);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(46,196,182,0.06);
}
.nav-inner {
  max-width: 1200px; margin: 0 auto; padding: 0 40px;
  height: 56px; display: flex; align-items: center; justify-content: space-between;
}
.nav-brand {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px; font-weight: 600; color: var(--teal);
  letter-spacing: 0.06em; display: flex; align-items: center; gap: 8px;
}
.nav-brand img { width: 22px; height: 22px; }
.nav-links { display: flex; gap: 24px; align-items: center; }
.nav-links a { font-size: 13px; color: var(--slate-light); transition: color 0.2s; }
.nav-links a:hover { color: white; }
.nav-links a.active { color: var(--teal); }
.nav-github {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px; font-weight: 500;
  background: var(--teal); color: var(--navy);
  padding: 5px 14px; transition: opacity 0.2s;
}
.nav-github:hover { opacity: 0.85; }
.hamburger { display: none; background: none; border: none; cursor: pointer; padding: 4px; }
.hamburger svg { width: 22px; height: 22px; stroke: var(--slate-light); stroke-width: 2; fill: none; }

/* === HERO === */
.hero {
  background: linear-gradient(170deg, var(--navy-deep) 0%, var(--navy) 60%, var(--navy-mid) 100%);
  position: relative; overflow: hidden;
}
.hero::before {
  content: ''; position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 600px 500px at 25% 40%, rgba(46,196,182,0.04) 0%, transparent 70%),
    radial-gradient(ellipse 500px 400px at 75% 50%, rgba(232,168,56,0.03) 0%, transparent 70%);
  pointer-events: none;
}
.hero-inner {
  max-width: 1200px; margin: 0 auto; padding: 80px 40px 60px;
  display: grid; grid-template-columns: 1fr 0.8fr; gap: 40px;
  align-items: center; position: relative; z-index: 1;
}
.hero h1 {
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 300; font-size: clamp(2.5rem, 5vw, 3.8rem);
  line-height: 1.08; letter-spacing: -0.025em;
  color: white; margin-bottom: 24px;
}
.hero h1 em { font-style: italic; color: var(--teal); }
.hero-sub {
  font-size: 16px; color: var(--slate-light);
  line-height: 1.7; max-width: 460px; margin-bottom: 32px;
}
.hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; }
.btn {
  display: inline-block; font-family: 'DM Sans', sans-serif;
  font-size: 14px; font-weight: 500; padding: 11px 24px; transition: all 0.2s;
}
.btn-teal { background: var(--teal); color: var(--navy); }
.btn-teal:hover { opacity: 0.85; }
.btn-outline { border: 1px solid rgba(255,255,255,0.15); color: var(--slate-light); }
.btn-outline:hover { border-color: var(--teal); color: var(--teal); }

/* Globe */
.globe-wrap {
  display: flex; align-items: center; justify-content: center;
  position: relative;
}
.globe-wrap canvas {
  width: 100%; max-width: 400px; height: auto; aspect-ratio: 1;
}

/* Stats bar */
.stats-bar {
  display: grid; grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid rgba(46,196,182,0.08);
  position: relative; z-index: 1;
  max-width: 1200px; margin: 0 auto;
}
.stat-cell {
  padding: 20px 40px;
  border-right: 1px solid rgba(46,196,182,0.06);
}
.stat-cell:last-child { border-right: none; }
.stat-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 24px; font-weight: 500; color: var(--amber);
}
.stat-label { font-size: 12px; color: var(--slate); margin-top: 2px; }

/* === PROBLEM === */
.problem { padding: 80px 0; background: var(--warm); border-bottom: 1px solid var(--off-white); }
.problem-text {
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(1.3rem, 2.5vw, 1.75rem);
  font-weight: 400; line-height: 1.45; color: var(--navy);
  max-width: 680px; margin-top: 16px;
}

/* === TRACKS === */
.tracks { padding: 80px 0; background: var(--surface); border-bottom: 1px solid var(--off-white); }
.tracks-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 24px; margin-top: 32px;
}
.track-card {
  background: var(--surface); border: 1px solid var(--off-white);
  padding: 32px; transition: border-color 0.2s;
}
.track-card:hover { border-color: var(--teal); }
.track-card h3 {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.3rem; font-weight: 400; color: var(--navy);
  margin-bottom: 12px;
}
.track-card p { font-size: 15px; color: var(--slate); line-height: 1.75; }
.track-link {
  display: inline-block; margin-top: 16px;
  font-size: 14px; font-weight: 500; color: var(--teal); transition: opacity 0.2s;
}
.track-link:hover { opacity: 0.7; }
.track-card.amber { border-top: 3px solid var(--amber); }
.track-card.teal { border-top: 3px solid var(--teal); }
.track-card.amber .track-link { color: var(--amber); }

/* === EVIDENCE === */
.evidence {
  padding: 80px 0; background: var(--navy); position: relative;
}
.evidence::before {
  content: ''; position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 500px 400px at 30% 50%, rgba(46,196,182,0.04) 0%, transparent 70%),
    radial-gradient(ellipse 400px 300px at 70% 40%, rgba(232,168,56,0.03) 0%, transparent 70%);
  pointer-events: none;
}
.evidence h2 {
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(1.5rem, 3vw, 2.2rem);
  font-weight: 400; color: white; margin: 16px 0 12px;
}
.evidence h2 em { color: var(--teal); font-style: italic; }
.evidence-sub {
  font-size: 15px; color: var(--slate-light);
  max-width: 560px; line-height: 1.7; margin-bottom: 40px;
}

/* Staircase */
.staircase {
  display: flex; align-items: flex-end; gap: 12px;
  min-height: 260px; padding: 24px;
  background: rgba(46,196,182,0.03);
  border: 1px solid rgba(46,196,182,0.08);
  position: relative; z-index: 1;
}
.stair {
  flex: 1; border-radius: 3px 3px 0 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: flex-end;
  padding-bottom: 10px;
  height: 0; /* animated to data-height */
  transition: height 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}
.stair.visible { /* height set via JS from data-height */ }
.stair-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px; font-weight: 600; color: white;
  opacity: 0; transition: opacity 0.3s 0.4s;
}
.stair.visible .stair-value { opacity: 1; }
.stair-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px; color: var(--slate-light);
  margin-top: 4px;
  opacity: 0; transition: opacity 0.3s 0.5s;
}
.stair.visible .stair-label { opacity: 1; }

.evidence-note {
  font-size: 13px; color: var(--slate); margin-top: 16px;
  position: relative; z-index: 1;
}
.evidence-link {
  display: inline-block; margin-top: 20px;
  font-size: 14px; font-weight: 500; color: var(--teal);
  position: relative; z-index: 1; transition: opacity 0.2s;
}
.evidence-link:hover { opacity: 0.7; }

/* === TOOLS === */
.tools { padding: 80px 0; background: var(--warm); border-bottom: 1px solid var(--off-white); }
.tools h2 {
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 400; color: var(--navy); margin: 16px 0 8px;
}
.tools-sub { font-size: 15px; color: var(--slate); margin-bottom: 32px; }
.tools-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.tool-card {
  background: var(--surface); border: 1px solid var(--off-white);
  overflow: hidden; transition: border-color 0.2s;
}
.tool-card:hover { border-color: var(--teal); }
.tool-preview {
  background: var(--navy); padding: 16px;
  min-height: 90px; border-bottom: 1px solid rgba(46,196,182,0.08);
  font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--slate);
}
.tool-body { padding: 16px; }
.tool-body h4 { font-size: 15px; font-weight: 600; color: var(--navy); margin-bottom: 4px; }
.tool-body p { font-size: 13px; color: var(--slate); line-height: 1.6; }
.tool-body .try-link {
  display: inline-block; margin-top: 10px;
  font-size: 13px; font-weight: 500; color: var(--teal); transition: opacity 0.2s;
}
.tool-body .try-link:hover { opacity: 0.7; }

/* === CREDENTIALS === */
.credentials { padding: 80px 0; background: var(--surface); border-bottom: 1px solid var(--off-white); }
.credentials h2 {
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 400; color: var(--navy); margin: 16px 0 24px;
}
.credentials-grid {
  display: grid; grid-template-columns: 1fr 300px; gap: 48px;
}
.credentials-text { font-size: 15px; color: var(--slate); line-height: 1.8; }
.credentials-text strong { color: var(--navy); font-weight: 600; }
.credentials-text p + p { margin-top: 16px; }
.cred-links { margin-top: 24px; display: flex; gap: 24px; }
.cred-links a { font-size: 14px; color: var(--teal); font-weight: 500; transition: opacity 0.2s; }
.cred-links a:hover { opacity: 0.7; }
.credentials-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.cred-stat {
  padding: 20px; border: 1px solid var(--off-white); text-align: center;
}
.cred-stat-num {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 2rem; font-weight: 300; color: var(--amber); line-height: 1;
}
.cred-stat-label { font-size: 12px; color: var(--slate); margin-top: 6px; }

/* === VISION === */
.vision {
  padding: 80px 0; background: var(--navy); position: relative;
}
.vision::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(ellipse 600px 400px at 50% 50%, rgba(46,196,182,0.03) 0%, transparent 70%);
  pointer-events: none;
}
.vision h2 {
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 400; color: white; margin: 16px 0 20px;
}
.vision p { font-size: 15px; color: var(--slate-light); line-height: 1.7; max-width: 600px; }
.vision-ctas { display: flex; gap: 12px; margin-top: 32px; }

/* === FOOTER === */
footer {
  background: var(--navy-deep); padding: 24px 0;
  border-top: 1px solid rgba(46,196,182,0.06);
}
.footer-inner {
  max-width: 1200px; margin: 0 auto; padding: 0 40px;
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;
}
.footer-links { display: flex; gap: 20px; }
.footer-links a { font-size: 13px; color: var(--slate); transition: color 0.2s; }
.footer-links a:hover { color: var(--teal); }
.footer-copy { font-size: 12px; color: var(--slate); }

/* === REVEAL === */
.reveal {
  opacity: 0; transform: translateY(12px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.reveal.visible { opacity: 1; transform: translateY(0); }

/* === MOBILE === */
@media (max-width: 768px) {
  .nav-links { display: none; }
  .nav-links.open {
    display: flex; flex-direction: column;
    position: absolute; top: 56px; left: 0; right: 0;
    background: rgba(6,12,23,0.97);
    padding: 16px 28px; gap: 16px;
    border-bottom: 1px solid rgba(46,196,182,0.06);
  }
  .hamburger { display: block; }
  .hero-inner { grid-template-columns: 1fr; padding: 60px 24px 40px; }
  .globe-wrap { display: none; }
  .stats-bar { grid-template-columns: 1fr 1fr; }
  .stat-cell { padding: 16px 24px; }
  .section-narrow, .section-inner, .section-wide { padding: 0 24px; }
  .tracks-grid { grid-template-columns: 1fr; }
  .tools-grid { grid-template-columns: 1fr; }
  .credentials-grid { grid-template-columns: 1fr; gap: 32px; }
  .problem, .tracks, .evidence, .tools, .credentials, .vision { padding: 56px 0; }
  .hero h1 { font-size: 2rem; }
  .footer-inner { flex-direction: column; align-items: flex-start; padding: 0 24px; }
}
```

- [ ] **Step 2: Verify all sections render correctly styled**

Open in browser. Check:
- Nav is sticky dark with correct links
- Hero has split layout, dark gradient, teal/amber ambient glows
- Problem section is light with Fraunces text
- Tracks show two cards side by side
- Evidence is dark with staircase placeholder area
- Tools show 2x2 grid with dark previews
- Credentials show 2-column layout with amber stat numbers
- Vision is dark with CTAs
- Footer is dark-deep
- Mobile: test at 375px width — single column, globe hidden

- [ ] **Step 3: Commit**

```bash
git add praxis/index.html
git commit -m "feat(landing): complete CSS styling — all sections"
```

---

### Task 4: Animated Counter + Scroll Reveal JS

**Files:**
- Modify: `praxis/index.html` (add to `<script>` block)

- [ ] **Step 1: Write the scroll reveal + counter JS**

Add this to the `<script>` tag at the bottom of `praxis/index.html`:

```javascript
(function() {
  // === Scroll Reveal ===
  var revealEls = document.querySelectorAll('.reveal');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealEls.forEach(function(el) { el.classList.add('visible'); });
  } else {
    var revealObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealEls.forEach(function(el) { revealObs.observe(el); });
  }

  // === Animated Counter ===
  function animateCounter(el, target, duration) {
    var start = 0;
    var startTime = null;
    var suffix = el.getAttribute('data-suffix') || '';
    var hasPlus = target === 230;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      var current = Math.floor(eased * target);
      el.textContent = current.toLocaleString() + (hasPlus && progress >= 1 ? '+' : '') + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var statValues = document.querySelectorAll('.stat-value[data-target]');
  var statsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-target'), 10);
        if (target) animateCounter(el, target, 1800);
        statsObserver.unobserve(el);
      }
    });
  }, { threshold: 0.3 });
  statValues.forEach(function(el) { statsObserver.observe(el); });

  // === Hamburger Menu ===
  var hamburger = document.querySelector('.hamburger');
  if (hamburger) {
    hamburger.addEventListener('click', function() {
      document.querySelector('.nav-links').classList.toggle('open');
    });
  }
})();
```

- [ ] **Step 2: Verify counters animate**

Open in browser. Scroll to stats bar. Numbers should count up from 0 to their targets over 1.8s with easeOutCubic. "MIT" cell should just show "MIT" (no animation). "230" should show "230+" when complete.

- [ ] **Step 3: Commit**

```bash
git add praxis/index.html
git commit -m "feat(landing): add animated counters and scroll reveal"
```

---

### Task 5: Escalation Staircase Animation

**Files:**
- Modify: `praxis/index.html` (add to `<script>` block)

- [ ] **Step 1: Write the staircase animation JS**

Append to the existing `<script>` block:

```javascript
(function() {
  var staircase = document.getElementById('staircase');
  if (!staircase) return;

  var stairs = staircase.querySelectorAll('.stair');
  // Set gradient colors: teal → amber transition
  var colors = [
    'rgba(46,196,182,0.3)',                              // baseline (muted teal)
    'linear-gradient(to top, #2EC4B6, rgba(46,196,182,0.8))', // 2 types
    'linear-gradient(to top, #2EC4B6, #E8A838)',              // 3 types
    'linear-gradient(to top, #E8A838, #d4882a)',              // 4 types
    'linear-gradient(to top, #d4882a, #c06a20)'               // 5+ types
  ];

  stairs.forEach(function(stair, i) {
    stair.style.background = colors[i];
    // Create inner elements
    var val = document.createElement('span');
    val.className = 'stair-value';
    val.textContent = stair.getAttribute('data-value');
    var label = document.createElement('span');
    label.className = 'stair-label';
    label.textContent = stair.getAttribute('data-label');
    stair.appendChild(val);
    stair.appendChild(label);
  });

  var staircaseObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        stairs.forEach(function(stair, i) {
          setTimeout(function() {
            stair.style.height = stair.getAttribute('data-height') + 'px';
            stair.classList.add('visible');
          }, i * 200);
        });
        staircaseObs.unobserve(staircase);
      }
    });
  }, { threshold: 0.2 });
  staircaseObs.observe(staircase);
})();
```

- [ ] **Step 2: Verify staircase animates on scroll**

Open in browser. Scroll to Evidence section. The 5 bars should grow sequentially (200ms stagger), from teal (baseline) to amber (5+ types). Numbers and labels should fade in after bars reach height.

- [ ] **Step 3: Commit**

```bash
git add praxis/index.html
git commit -m "feat(landing): add escalation staircase scroll animation"
```

---

### Task 6: Canvas Particle Globe

**Files:**
- Modify: `praxis/index.html` (add to `<script>` block)

This is the most complex interactive element. A 2D canvas showing a stylized world outline with particles flowing outward from the Sahel.

- [ ] **Step 1: Write the canvas globe**

Append to the `<script>` block:

```javascript
(function() {
  var canvas = document.getElementById('globe');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = 800, H = 800;
  var cx = W / 2, cy = H / 2, R = 340;

  // Simplified continent outlines (longitude, latitude pairs → canvas coords)
  // Project: equirectangular centered on 0,0, clipped to visible globe face
  function project(lon, lat) {
    var radLon = lon * Math.PI / 180;
    var radLat = lat * Math.PI / 180;
    var x = Math.cos(radLat) * Math.sin(radLon);
    var y = -Math.sin(radLat);
    var z = Math.cos(radLat) * Math.cos(radLon);
    if (z < -0.1) return null; // behind globe
    return [cx + x * R, cy + y * R, z];
  }

  // Simplified continent paths (key coastline points only for performance)
  var continents = [
    // Africa
    [[-17,14.7],[-13,12],[0,4],[10,4],[12,0],[10,-2],[12,-5],[40,-12],[50,-25],[35,-34],
     [18,-34],[12,-17],[8,-5],[2,6],[-5,5],[-8,4],[-15,11],[-17,14.7]],
    // Europe
    [[-10,36],[0,36],[3,37],[5,44],[0,43],[-2,47],[3,47],[5,48],[7,54],[10,54],
     [13,52],[24,55],[30,60],[28,70],[15,70],[5,62],[0,58],[-6,54],[-10,44],[-10,36]],
    // Asia (simplified)
    [[30,32],[35,33],[40,37],[50,37],[55,45],[65,40],[75,35],[80,28],[85,22],[90,22],
     [100,20],[105,22],[110,20],[120,23],[125,30],[130,35],[135,35],[140,40],[140,45],
     [135,50],[130,55],[120,55],[90,60],[70,60],[60,55],[50,45],[40,42],[30,36],[30,32]],
    // South America (simplified)
    [[-80,10],[-75,12],[-60,10],[-35,0],[-35,-10],[-40,-22],[-50,-25],[-55,-25],
     [-65,-35],[-70,-40],[-75,-50],[-70,-55],[-65,-52],[-65,-40],[-55,-35],
     [-75,-15],[-80,0],[-80,10]],
    // North America (simplified)
    [[-130,50],[-125,48],[-120,34],[-105,25],[-100,20],[-90,18],[-85,20],[-80,25],
     [-75,35],[-70,42],[-65,45],[-65,50],[-75,55],[-80,60],[-90,55],[-100,60],
     [-120,60],[-140,60],[-165,60],[-168,65],[-140,70],[-130,50]],
  ];

  // Sahel center point (origin of particle flows)
  var sahelLon = 2, sahelLat = 14;

  // Particle system
  var particles = [];
  var PARTICLE_COUNT = 300;

  function createParticle() {
    var angle = Math.random() * Math.PI * 2;
    var speed = 0.3 + Math.random() * 0.8;
    var life = 200 + Math.random() * 300;
    var startProj = project(sahelLon + (Math.random() - 0.5) * 10, sahelLat + (Math.random() - 0.5) * 6);
    if (!startProj) startProj = [cx, cy - 80, 1];
    // Color: mix between teal and amber based on angle
    var t = (Math.sin(angle) + 1) / 2;
    var r = Math.round(46 + t * (232 - 46));
    var g = Math.round(196 + t * (168 - 196));
    var b = Math.round(182 + t * (56 - 182));
    return {
      x: startProj[0], y: startProj[1],
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: life, maxLife: life, age: 0,
      size: 1 + Math.random() * 2,
      r: r, g: g, b: b
    };
  }

  for (var i = 0; i < PARTICLE_COUNT; i++) {
    var p = createParticle();
    p.age = Math.random() * p.maxLife; // stagger start
    particles.push(p);
  }

  // Rotation
  var rotation = 0;

  function drawGlobe() {
    ctx.clearRect(0, 0, W, H);

    // Globe circle (subtle)
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(11,26,46,0.3)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(46,196,182,0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Grid lines (latitude)
    ctx.strokeStyle = 'rgba(46,196,182,0.04)';
    ctx.lineWidth = 0.5;
    for (var lat = -60; lat <= 60; lat += 30) {
      ctx.beginPath();
      for (var lon = -180; lon <= 180; lon += 5) {
        var pt = project(lon + rotation, lat);
        if (pt) {
          if (lon === -180 || !project(lon - 5 + rotation, lat)) ctx.moveTo(pt[0], pt[1]);
          else ctx.lineTo(pt[0], pt[1]);
        }
      }
      ctx.stroke();
    }

    // Continents
    ctx.strokeStyle = 'rgba(46,196,182,0.12)';
    ctx.fillStyle = 'rgba(46,196,182,0.04)';
    ctx.lineWidth = 0.8;
    continents.forEach(function(cont) {
      ctx.beginPath();
      var started = false;
      cont.forEach(function(point) {
        var pt = project(point[0] + rotation, point[1]);
        if (pt) {
          if (!started) { ctx.moveTo(pt[0], pt[1]); started = true; }
          else ctx.lineTo(pt[0], pt[1]);
        }
      });
      if (started) { ctx.fill(); ctx.stroke(); }
    });

    // Sahel region highlight
    var sahelPt = project(sahelLon + rotation, sahelLat);
    if (sahelPt) {
      var grad = ctx.createRadialGradient(sahelPt[0], sahelPt[1], 0, sahelPt[0], sahelPt[1], 60);
      grad.addColorStop(0, 'rgba(232,168,56,0.15)');
      grad.addColorStop(1, 'rgba(232,168,56,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(sahelPt[0], sahelPt[1], 60, 0, Math.PI * 2);
      ctx.fill();
    }

    // Particles
    particles.forEach(function(p) {
      p.age++;
      if (p.age >= p.maxLife) {
        Object.assign(p, createParticle());
        p.age = 0;
      }
      p.x += p.vx;
      p.y += p.vy;

      // Keep within globe
      var dx = p.x - cx, dy = p.y - cy;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > R - 10) {
        Object.assign(p, createParticle());
        p.age = 0;
      }

      var alpha = 1 - (p.age / p.maxLife);
      alpha *= 0.6;
      var fadeIn = Math.min(p.age / 30, 1);
      alpha *= fadeIn;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + p.r + ',' + p.g + ',' + p.b + ',' + alpha + ')';
      ctx.fill();
    });

    // Very slow rotation
    rotation += 0.02;
  }

  // Only animate when visible
  var globeRunning = false;
  var globeObs = new IntersectionObserver(function(entries) {
    globeRunning = entries[0].isIntersecting;
    if (globeRunning) tick();
  }, { threshold: 0.1 });
  globeObs.observe(canvas);

  function tick() {
    if (!globeRunning) return;
    drawGlobe();
    requestAnimationFrame(tick);
  }
})();
```

- [ ] **Step 2: Verify globe renders and animates**

Open in browser. The globe should show:
- A dark sphere with subtle teal border
- Faint continent outlines that slowly rotate
- Faint latitude grid lines
- An amber glow on the Sahel region
- 300 particles (teal and amber) flowing outward from the Sahel
- Particles fade in and out smoothly
- Animation pauses when scrolled out of view (performance)

- [ ] **Step 3: Commit**

```bash
git add praxis/index.html
git commit -m "feat(landing): add canvas particle globe animation"
```

---

### Task 7: Final Polish + OG Image Meta + Deploy Verification

**Files:**
- Modify: `praxis/index.html` (meta tags, final tweaks)

- [ ] **Step 1: Add/update OG meta tags**

In the `<head>`, ensure these meta tags are present:

```html
<meta property="og:title" content="PRAXIS AI for Good Lab">
<meta property="og:description" content="Open-source AI tools for programme evaluation and conflict early warning. 100,184 events analyzed. 230+ countries. 29 peer-reviewed papers.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://www.emmanuelneneodjidja.org/praxis/">
<meta name="twitter:card" content="summary_large_image">
<meta name="description" content="PRAXIS AI for Good Lab — open-source AI for programme evaluation and conflict early warning. Built by a practitioner, not a product team.">
```

- [ ] **Step 2: Cross-browser and responsive check**

Verify at these widths:
- 1440px (desktop): all sections render correctly, globe visible, 2-column layouts
- 1024px (tablet landscape): still 2-column
- 768px (tablet portrait): switches to single column, globe hidden
- 375px (mobile): all sections single column, stats 2x2, hamburger menu works

- [ ] **Step 3: Performance check**

Verify in browser DevTools:
- No React scripts loaded (check Network tab — no unpkg.com requests)
- Canvas animation stops when scrolled away (check CPU usage)
- Page weight should be under 100KB (HTML + inline CSS + inline JS, excluding fonts)

- [ ] **Step 4: Final commit**

```bash
git add praxis/index.html
git commit -m "feat(landing): add OG meta tags and final polish"
```

- [ ] **Step 5: Deploy and verify live**

```bash
git push origin main
```

After GitHub Pages deploys, verify with curl:
```bash
curl -s https://www.emmanuelneneodjidja.org/praxis/ | head -20
```

Open in incognito browser and verify all sections render, globe animates, counters count, staircase animates on scroll.
