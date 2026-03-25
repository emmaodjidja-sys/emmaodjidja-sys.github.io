# PRAXIS Website Redesign Spec

## For: Claude Code implementation
## Author: Emmanuel Nene Odjidja
## Date: March 2026

---

## 1. Problem Statement

The PRAXIS website (emmanuelneneodjidja.org/praxis/) currently positions the lab as an evaluation toolkit. The strategic direction has shifted: PRAXIS is now an AI for Good lab with two major tracks, evaluation infrastructure AND conflict early warning. The website needs to reflect this dual identity, with the conflict prediction work receiving equal or greater prominence, especially ahead of the AI for Good Summit submission (July 2026).

A secondary but important problem: the site currently reads as AI-generated. The design patterns (gradient cards, symmetrical grids, counter animations, "three pillars" framing, emoji-style Unicode symbols) are recognisable AI output. The redesign must eliminate these tells.

---

## 2. Current Site Architecture

```
/praxis/                  -- Main landing page (the "Lab" page)
/praxis/tools/            -- Evaluation toolkit listing (6 tools)
/praxis/360/              -- PRAXIS 360 pre-launch page (Glocal 2026)
/praxis/tools/[each-tool] -- Individual tool pages (sample size calc, design advisor, etc.)
```

### Current landing page sections (top to bottom):
1. Hero: "PRAXIS -- Open-source AI tools for evaluation and global health research"
2. Counter bar: 6 tools, 161 indicators, 16 eval approaches, 7 health sub-skills
3. "Why PRAXIS Exists" -- practitioner-built positioning
4. "Three pillars, one methodology" -- AI Evaluation Skills / Practitioner Tools / PRAXIS 360
5. "Free evaluation tools" -- 6 tool cards
6. "PRAXIS Health" -- health-specific depth section
7. "Roadmap" -- timeline with status badges
8. Footer CTA

### Current nav: Lab | Tools | 360 | About | GitHub

---

## 3. Target Architecture

```
/praxis/                  -- Redesigned landing page (the Lab as a whole)
/praxis/ews/              -- NEW: PRAXIS EWS (Early Warning System) track page
/praxis/evaluation/       -- MOVED: Current landing page content reorganised here
/praxis/tools/            -- Unchanged (evaluation toolkit)
/praxis/360/              -- Unchanged (Glocal 2026 pre-launch)
```

### New nav: Lab | EWS | Evaluation | Tools | 360 | GitHub

---

## 4. Page-by-Page Specs

### 4.1 /praxis/ (Redesigned Landing Page)

This page introduces PRAXIS as a lab, not as an evaluation toolkit. It must work for two audiences: (a) an AI for Good Summit committee member clicking through from a submission about conflict prediction, and (b) an evaluator who already knows PRAXIS from the tools.

#### Hero

- Headline: "PRAXIS AI for Good Lab" (keep)
- Subline: Replace "Open-source AI tools for evaluation and global health research" with something that captures both tracks. Suggested direction: "Open-source AI for early warning and programme evaluation. Built by a practitioner, not a product team."
- Two CTA buttons: "PRAXIS EWS" (links to /praxis/ews/) and "Evaluation Tools" (links to /praxis/evaluation/ or /praxis/tools/)
- Remove the animated counter bar entirely. It is a generic AI-site pattern and the numbers (6 tools, 161 indicators) are low enough that displaying them prominently does not help.

#### "What PRAXIS Does" section

Replace the "three pillars" framing. Instead, present two research tracks side by side:

**Track 1: PRAXIS EWS (Early Warning System)**
- One paragraph. Core message: PRAXIS applies epidemiological surveillance logic and econometric methods to ACLED event data to predict escalation in violent extremism before it hits. The current research uses a stacked event study design to show that kidnapping spikes predict subsequent VE surges in the Central Sahel, with spatial spillover quantified at specific radii. The platform translates these signals into actionable alerts for P/CVE programme managers, humanitarian agencies, and security coordination bodies.
- Key stats to surface (inline, not in flashy counter widgets): beta coefficients from the KFR research, 230+ countries of ACLED coverage, 5 robustness checks.
- Link to /praxis/ews/ for full detail.

**Track 2: Programme Evaluation**
- One paragraph. Core message: PRAXIS encodes 12 years of field evaluation experience into free, open-source browser tools covering the full evaluation lifecycle. Six live tools, 298 indicators, 11 sectors. Every tool runs client-side with zero data transmission.
- Link to /praxis/evaluation/ or /praxis/tools/.

#### "Built by a Practitioner" section

Keep the essence of the current "Why PRAXIS Exists" section but tighten it. Remove the four credential cards (12+ years, peer-reviewed, section editor, specialised methods) and fold that information into the prose. The cards are a classic AI layout pattern. A single paragraph with a photo is more human. Mention that the conflict work comes from someone who actually designs and manages P/CVE evaluations in the Sahel, not from a university lab or a tech company.

#### Roadmap

Restructure to reflect both tracks. Current roadmap items to keep: PRAXIS Core + Health Module (Live), Browser Toolkit (Live), PRAXIS 360 Workbench (In Progress), French Translation (In Progress). Add new items:

- KFR Research Paper (In Progress) -- econometric analysis of kidnapping-to-VE escalation in Central Sahel
- ACLED Data Pipeline (In Progress) -- automated ingestion and alert generation from ACLED API
- PRAXIS EWS Platform v1 (Planned) -- predict-alert-respond system for FCV contexts
- PVE Evaluation Module (Planned) -- keep existing item
- ML Extension (Planned) -- XGBoost on multi-source event features, actor-network analysis, temporal sequence modelling

Remove status badge styling if it uses coloured pills (green/amber/grey). Use plain text labels instead.

#### Footer

Keep minimal. GitHub link, Publications link, personal site link.

---

### 4.2 /praxis/ews/ (New Page: PRAXIS EWS)

This is the page the AI for Good Summit submission should link to. It needs to tell the predict-alert-respond story clearly and credibly. The name "EWS" is deliberately plain: Early Warning System. No branding poetry. The plainness is intentional and distinguishes it from every AI-generated project name in the submission pile.

#### Hero

- Headline: "PRAXIS EWS" with "Early Warning System" as a smaller descriptor below
- Subline: One sentence. Something like: "Econometric research and open-source tooling to detect escalation signals in ACLED conflict data and translate them into protection decisions."

#### The Research section

Present the KFR (kidnapping-for-recruitment) study. This is the credibility anchor. Include:

- The research question: Does a district-level spike in abduction-style human trafficking predict a subsequent surge in violent extremist events?
- The method: Stacked event study with two-way fixed effects on ACLED geocoded data (2015--2023), admin-2 level, Central Sahel (Burkina Faso, Mali, Niger)
- Key findings: Summarise the core results. Beta coefficients, the lag structure, spatial spillover at specific radii, placebo permutation results, the five robustness checks.
- A static image or embedded chart showing the event study plot (if available; if not, describe a placeholder). Do not build a live interactive chart here -- a clean static figure is more credible for this audience.
- Status: manuscript in preparation; methodology presented at [if applicable, name any presentations].

#### The Platform section

Present the three-layer architecture:

**Layer 1: Predict** -- Automated detection of escalation signals from ACLED API data. Stacked event study model applied to rolling windows. Outputs a risk score at admin-2 level.

**Layer 2: Alert** -- Signal translation into structured alerts for defined stakeholder groups. Severity classification. Geographic targeting.

**Layer 3: Respond** -- Decision pathways for different users:
- Community protection activation for local actors
- Programme adaptation for P/CVE implementers
- Pre-positioning for humanitarian agencies
- Threat briefings for security coordination

Be honest about status: Layer 1 is grounded in completed research. The integrated platform is under development. The summit audience is selecting speakers, not shipping products.

#### The Science section

Brief section establishing methodological credibility. Mention:
- Classical econometrics (interpretable, peer-reviewable) as the current foundation
- ML extension planned: XGBoost on multi-source event features, actor-network analysis, temporal sequence modelling
- Open-source commitment
- Wherever ACLED operates (230+ countries) is the addressable scope; the Sahel is the proof of concept, not the ceiling

#### "Who Built This" closer

One paragraph. "Built by a P/CVE practitioner working in the Sahel." Not a lab, not a startup. Someone who designs and manages evaluations of PVE programmes across Burkina Faso, Mali, and Niger. 12 years in the field. 29 publications. The gap between people who study conflict and people who work in conflict zones is what PRAXIS exists to close.

---

### 4.3 /praxis/evaluation/ (Reorganised from current landing page)

Move the current evaluation-focused content here. This includes:

- The "Why PRAXIS Exists" positioning (evaluation-specific version)
- The three-pillar ecosystem description (AI Evaluation Skills, Practitioner Tools, PRAXIS 360) -- this framing still works for the evaluation track specifically
- The six tool cards
- The PRAXIS Health section
- The worked examples

Adjust the hero to reflect that this is the evaluation track of a broader lab: "Programme Evaluation Tools" or "Evaluation Infrastructure" as the headline. Link back to the main /praxis/ page and to /praxis/ews/ for the other track.

---

### 4.4 /praxis/tools/ and /praxis/360/

No structural changes. Only apply the anti-AI design fixes described in Section 5 below.

---

## 5. Anti-AI Design Fixes (Apply Across All Pages)

These are specific patterns on the current site that read as AI-generated. Each one needs to be addressed.

### 5.1 Typography

**Problem:** The site likely uses a safe, generic font stack (Inter, system-ui, or similar). Every AI-generated site uses these.

**Fix:** Choose a distinctive, characterful font pairing. Suggestions:
- Display/headings: Something with personality. Not Space Grotesk (overused by AI). Consider Instrument Serif, Fraunces, Bricolage Grotesque, General Sans, or Satoshi. Load from Google Fonts or self-host.
- Body: A clean readable face that is not Inter, Roboto, or system-ui. Consider IBM Plex Sans, Source Serif 4, Literata, or Figtree.
- The key principle: the fonts should feel chosen by a human with taste, not defaulted to by an algorithm.

### 5.2 Layout Symmetry

**Problem:** The current site uses perfectly symmetrical grids everywhere: three credential cards in a row, three pillar cards in a row, six tool cards in a 3x2 grid, four roadmap items in a column. This grid-of-identical-cards pattern is the single most recognisable AI design tell.

**Fix:**
- Break the grid. Use asymmetric layouts: a large featured item next to two smaller ones, a single wide card followed by a two-column row, text on one side with a figure on the other.
- Vary card sizes and content density. Not every card needs the same structure (icon + title + description + tags + link).
- Consider a magazine-style layout for the tools section rather than a uniform card grid.
- On the EWS page, use flowing prose sections rather than cards at all. The content is narrative, not a feature list.

### 5.3 Decorative Unicode Symbols

**Problem:** The current site uses Unicode symbols as pseudo-icons (diamond for AI Skills, gear for Tools, arrows for 360). This is a known AI shortcut.

**Fix:** Either use a proper icon library (Lucide, Phosphor, Heroicons) or remove icons entirely and let typography and hierarchy do the work. For a research lab site, no icons is often better than decorative ones.

### 5.4 Animated Counters

**Problem:** The "0 to 6 Live Tools" animated counter bar in the hero is a startup landing page pattern that AI loves to generate. It also draws attention to small numbers.

**Fix:** Remove counter animations entirely. If you want to surface key numbers, put them inline in prose: "Six live tools covering 298 indicators across 11 sectors." Numbers in context are more credible than numbers in animation.

### 5.5 Gradient and Glow Effects

**Problem:** If the site uses gradient backgrounds, glowing borders, or glassmorphism effects, these are AI aesthetic cliches (especially purple/blue gradients).

**Fix:** Use flat, confident colours. A dark background with high-contrast text, or a clean light background with a single strong accent colour. The Sahel/conflict context suggests warm, grounded tones (deep navy, warm stone, muted terracotta, dry ochre) rather than tech-startup neon.

### 5.6 Status Badges

**Problem:** The roadmap uses coloured status pills (green "Live", amber "In Progress", grey "Planned"). This is a product-launch page pattern.

**Fix:** Use plain text labels or a simple timeline layout. The content is a research roadmap, not a SaaS changelog.

### 5.7 "Three Pillars" / "Three X, One Y" Headings

**Problem:** "Three pillars, one methodology" is a heading structure that AI produces compulsively. Same for "Why X Exists" as a section header.

**Fix:** Use section headings that are specific to the content rather than structural labels. Instead of "Three pillars, one methodology," just describe what the ecosystem does. Instead of "Why PRAXIS Exists," open with the actual argument.

### 5.8 Hover Cards and Equal-Height Grids

**Problem:** If every card has the same hover effect (scale up, shadow lift, border glow), that is AI-generated CSS.

**Fix:** Use subtle, varied interactions. A colour shift on one element, a text underline on another. Or no hover effects at all -- many serious research sites have none.

### 5.9 Copy Patterns

**Problem:** Phrases like "Practitioner-built, not prompt-engineered" and "Built for field conditions, not just textbook scenarios" use a "X, not Y" contrastive structure that AI overproduces. The "Every tool runs entirely in your browser. No accounts, no data collection, no server calls" staccato pattern is also characteristic.

**Fix:** Rewrite these in natural voice. Vary rhythm. Some sentences long, some short. Use first person where appropriate ("I built this because..."). Avoid the temptation to make every sentence a slogan.

### 5.10 Section Dividers and Decorative Lines

**Problem:** If sections are separated by decorative horizontal lines, gradient dividers, or excessive whitespace with centred labels (like "// THE PIPELINE" on the 360 page), these are AI layout patterns.

**Fix:** Use natural content flow with clear typographic hierarchy. A well-sized heading with adequate margin above it is all the separation a section needs. Remove the "// SECTION NAME" monospace labels entirely.

### 5.11 The "Before/After" Illustrative Data Widget

**Problem:** On the main personal site, the PRAXIS section includes a "Before PRAXIS / After PRAXIS" bar chart with numbers like "Relevance 2.1 to 4.3." This is labelled "Illustrative data" which means it is fabricated. Fabricated data on a researcher's website is a credibility risk, and the widget itself is a classic AI-generated element.

**Fix:** Remove this widget entirely from the main site's PRAXIS section. Replace with a brief description of an actual use case, or nothing.

---

## 6. Colour and Visual Identity Direction

Current site likely uses a neutral/dark palette. For the redesign:

- **Primary dark:** Deep navy or charcoal (#1a1f2e or similar)
- **Accent warm:** Muted terracotta or dry amber (#c4704b or #d4923a) -- references the Sahel context without being decorative
- **Accent cool:** Teal or muted green (#2a7d6e) -- for the evaluation track
- **Text:** Off-white on dark (#e8e4df), dark charcoal on light (#2c2c2c)
- **Avoid:** Purple gradients, neon blues, glassmorphism, anything that says "AI startup"

The palette should feel grounded, serious, and warm. Think research institute, not product launch.

---

## 7. Content to Write / Rewrite

The following copy needs to be written or rewritten. Whoever implements this should write in first person where appropriate, vary sentence length, avoid the banned words and phrases in the style guide (see memory edits), never use em dashes, and keep the tone direct and specific rather than sloganeering.

1. **New landing page hero subline** -- one sentence capturing both tracks
2. **EWS track summary paragraph** for the landing page
3. **Evaluation track summary paragraph** for the landing page
4. **Full /praxis/ews/ page copy** -- research section, platform section, science section, "who built this" closer
5. **Revised "Why PRAXIS Exists" copy** -- tighter, in prose, no credential cards
6. **Revised roadmap items** -- include EWS track milestones
7. **Revised main site PRAXIS section** (emmanuelneneodjidja.org/) -- update to reflect dual-track positioning, remove the fabricated data widget

---

## 8. Technical Notes

- The site appears to be static HTML/CSS (possibly with minimal JS for counters and animations). Maintain this approach. No React framework needed for a content site.
- All pages should be responsive and work on mobile.
- Load fonts from Google Fonts CDN or self-host for performance.
- Keep the existing tool pages functional; they do not need redesign, only the anti-AI CSS fixes.
- If the site uses a static site generator (Hugo, Jekyll, 11ty), maintain that workflow. If it is hand-coded HTML, that is fine too.
- The /praxis/ews/ page should be buildable as a standalone HTML file following the same structure as /praxis/360/.

---

## 9. Priority Order for Implementation

1. Build /praxis/ews/ page (highest priority -- needed for summit submission link)
2. Redesign /praxis/ landing page to reflect dual-track positioning
3. Apply anti-AI design fixes across all pages (typography, layout, colour)
4. Move evaluation content to /praxis/evaluation/ (or keep at /praxis/tools/ and update the landing page links)
5. Update main site PRAXIS section (emmanuelneneodjidja.org/)

---

## 10. What Success Looks Like

A summit committee member reads the PRAXIS EWS submission. They click through to the website. They land on a page that tells them: this is a research lab that predicts where violent extremism will escalate, built on real econometric science, by someone who works in the Sahel. They can see the methodology, the data source, and the platform architecture. They can also see that PRAXIS has a parallel track of live evaluation tools that are already being used. They leave with the impression that this is a serious, credible operation with both research depth and working software. Nothing on the page makes them think "this was made by an AI."
