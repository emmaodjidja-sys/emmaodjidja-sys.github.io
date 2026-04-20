# PRAXIS Deck Generator — Design Spec

**Date:** 2026-04-20
**Owner:** Emmanuel Nene Odjidja
**Status:** Approved for implementation
**Path on site:** `/praxis/tools/deck-generator/`

---

## 1. Summary

A standalone, browser-based presentation tool that turns a PRAXIS Workbench evaluation into a topnotch live-presenter deck. Two templates: **Inception Brief** (~16 slides, pre-fieldwork, donor inception meeting) and **Findings Brief** (~13–16 slides, post-fieldwork, results presentation). Single engine, zero build step, works offline after first load, no data leaves the browser.

Replaces the broken `Open Deck Tool ↗` link in Workbench Station 8 (currently 404s).

## 2. Goals & non-goals

**Goals:**
- Live presenter mode with keyboard navigation, fullscreen, speaker view
- Print-quality PDF export via browser print (one slide per page, navy preserved)
- Auto-populate from Station 8 sessionStorage bridge; demo data when standalone
- Inline editing for fields the workbench can't supply (timeline, team, findings)
- Three "earns its keep" data visualisations (ToC tree, sampling bars, evaluability radar)
- Match PRAXIS aesthetic so the tool feels native to the site

**Non-goals (explicitly out of scope):**
- PowerPoint (.pptx) export — browser libraries are inadequate, low demo value
- Server-side persistence — everything stays in the browser (sessionStorage + localStorage)
- Custom slide builder — only the two fixed templates
- Real-time collaboration
- Image upload / custom backgrounds beyond the PRAXIS palette
- Charting library dependencies — visuals are vanilla SVG

## 3. Architecture

Single-file HTML app at `/praxis/tools/deck-generator/index.html` matching the pattern of existing PRAXIS tools (toc-builder, eval-matrix-builder).

```
deck-generator/
└── index.html            # ~2,000–2,500 lines, self-contained
```

**Stack:**
- React 18 + ReactDOM 18 (UMD via unpkg, like other PRAXIS tools)
- Babel Standalone (JSX in-browser, no build)
- Inline `<style>` block using PRAXIS design tokens (navy `#0B1A2E`, teal `#2EC4B6`, slate `#64748B`, etc.)
- Fonts: DM Sans (body), Fraunces (cover/dividers), JetBrains Mono (code/numbers)
- All slide rendering: vanilla React + SVG (no Chart.js, no D3)

**Why single file:** matches existing PRAXIS tools, no build step, easy to deploy via `git push`, easy for visitors to view-source as a portfolio artifact.

## 4. Data flow

```
                ┌─────────────────────┐
                │  Workbench Station 8 │
                │   "Open Deck Tool ↗" │
                └──────────┬───────────┘
                           │ writes sessionStorage
                           │ key: "praxis-deck-context"
                           ▼
        ┌──────────────────────────────────────┐
        │  /praxis/tools/deck-generator/       │
        │                                       │
        │   1. On mount, read sessionStorage   │
        │   2. If absent → load DEMO_CONTEXT   │
        │   3. Pick template (Inception/Find)  │
        │   4. Build slides from context       │
        │   5. Merge user edits from           │
        │      localStorage (per programme)    │
        └──────────────────────────────────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │  Presenter view  │
                  │  + PDF export    │
                  │  + JSON export   │
                  └──────────────────┘
```

**Storage keys:**

| Key | Source | Purpose | Lifetime |
|---|---|---|---|
| `sessionStorage["praxis-deck-context"]` | Station 8 | Workbench data bridge | Tab session |
| `localStorage["praxis-deck-overrides:<programme>:<template>"]` | Deck tool | User edits (cover, findings text, etc.) | Persistent |
| `localStorage["praxis-deck-template"]` | Deck tool | Last-picked template | Persistent |

**Override merge rule:** workbench data is the base; user overrides take precedence per field. "Reset to data" button clears the override key for the current programme+template.

## 5. Slide library

### 5a. Inception Brief (16 slides, fixed)

| # | Slide | Data source | Inline editable? |
|---|---|---|---|
| 1 | Cover | Programme name, organisation, country (workbench) | Title override only |
| 2 | Agenda | Auto-generated from slides 3–16 titles | No |
| 3 | Programme Overview | `project_meta` (sectors, budget, timeline, maturity) | No |
| 4 | Evaluation Purpose & Users | `tor_constraints` (purpose, causal level, scope, population) | No |
| 5 | Theory of Change | `toc.nodes` rendered as SVG tree (Impact ← Outcome ← Output ← Activity) | No |
| 6 | Evaluation Questions | `evaluation_matrix.rows` with DAC criterion badges | No |
| 7 | Methodology | `design_recommendation` (top design, family, score, justification) | No |
| 8 | Sampling Strategy | `sample_parameters` rendered as horizontal stacked bars | No |
| 9 | Data Collection | `instruments.items` table (title, type, question count) | No |
| 10 | Analysis Approach | `analysis_plan.rows` (method × EQ × software) | No |
| 11 | Evaluability Assessment | `evaluability` rendered as SVG radar chart | No |
| 12 | Timeline | Placeholder Gantt grid (4 phases × 12 months) | Full inline edit |
| 13 | Team & Roles | Placeholder grid (Team Lead, Methodologist, Field Coord, etc.) | Full inline edit |
| 14 | Risks & Mitigations | Placeholder table (4 rows: Risk, Likelihood, Impact, Mitigation) | Full inline edit |
| 15 | Deliverables Schedule | Placeholder list (Inception Report, Tools, Field Plan, Findings, Final) | Full inline edit |
| 16 | Q&A / Thank You | Programme name + presenter contact line | Contact override |

### 5b. Findings Brief (10 fixed + 3–6 criterion slides = 13–16 total)

| # | Slide | Data source | Inline editable? |
|---|---|---|---|
| 1 | Cover | Programme name + "Findings" label + evaluation period | Period typed |
| 2 | Agenda | Auto-generated | No |
| 3 | Programme Recap | `project_meta` (compact one-slide version) | No |
| 4 | Methodology Recap | Design + planned sample (workbench) + achieved sample (typed) | Achieved values |
| 5 | Headline Findings | 3 large takeaways | Full inline edit |
| 6+ | Findings by Criterion | One slide per DAC criterion present in `evaluation_matrix.rows`. Each shows the EQs under that criterion + key findings + supporting evidence | Findings + evidence typed |
| N+1 | Cross-cutting Findings | Gender, equity, do-no-harm | Full inline edit |
| N+2 | Evidence Quality & Limitations | — | Full inline edit |
| N+3 | Recommendations | Table: Recommendation, Priority, Owner, Timeline | Full inline edit (rows) |
| N+4 | Lessons Learned & Next Steps | — | Full inline edit |
| N+5 | Q&A / Thank You | Same as Inception #16 | Contact override |

**Criterion-aware slide count:** the deck builds a finding slide for every DAC criterion that appears in the workbench's evaluation matrix. Typical evaluations use 3–6 criteria (Relevance, Coherence, Effectiveness, Efficiency, Impact, Sustainability), giving 13–16 total findings slides.

## 6. Visual design

**Aesthetic:** Hybrid PRAXIS-native (locked in via brainstorm mockup choice).
- **Section dividers** (cover, criterion intros): full-bleed dark navy `#0B1A2E`, large Fraunces serif, teal accent rule
- **Content slides:** `#F8FAFC` body, navy header bar (`#0B1A2E`) with teal slide number + white title, white card panels with teal left-border (3px) for data callouts
- **Footer:** programme name (left) · slide N/Total (right), `#94A3B8` 9pt uppercase

**Type scale (16:9 slides at 1280×720):**
- Cover title: Fraunces 56px / 600
- Section divider: Fraunces 44px / 600
- Slide title (header bar): DM Sans 18px / 600 white
- Slide H2 (within body): DM Sans 28px / 700
- Lede: DM Sans 14px / 400 `#334155`
- Body: DM Sans 13px / 400
- Data callout label: DM Sans 9px / 700 uppercase letter-spacing 0.12em
- Data callout value: DM Sans 13px / 600

**Slide canvas:** fixed 16:9 logical canvas (1280×720), scaled to viewport via CSS `transform: scale()`. Letterboxed when viewport aspect ratio differs (black bars top/bottom or left/right rather than scrollbars).

## 7. Presenter UX

**Three modes:**

1. **Editor mode** (default after deck load) — vertical scroll of all slides as cards (1280×720 each), with edit affordances on editable fields. Sticky toolbar: Template switcher, Present, PDF, JSON Export, JSON Import, Reset.

2. **Presenter mode** — one slide fills viewport, keyboard-driven.
   - `→ / Space / PageDown` → next
   - `← / PageUp` → previous
   - `Home / End` → first / last slide
   - `f` → fullscreen toggle (browser Fullscreen API)
   - `s` → toggle speaker view (small slide preview + large speaker notes + next-slide thumb + clock)
   - `o` → overview grid (4-col thumbnails, click to jump)
   - `Esc` → exit presenter mode → back to editor
   - Click right half of slide → next; click left half → previous
   - URL hash sync: `#/inception/6` or `#/findings/4` so deep-links preserve both template and slide position

3. **PDF export mode** — invoked via toolbar button or `Ctrl+P`. Print stylesheet shows all slides one-per-page at A4 landscape, navy header preserved (`-webkit-print-color-adjust: exact; print-color-adjust: exact`), footer with page numbers.

**Speaker notes:** every slide has an optional `speakerNotes` string (rendered in speaker view only, never visible to audience). Editable inline in editor mode via collapsible "Notes" affordance under each slide card.

## 8. Editing model

**Three field types:**

1. **Auto-pulled (read-only):** rendered from sessionStorage workbench data. No edit affordance. If the user wants to change these, they go back to the workbench. Visual treatment: no input chrome.

2. **Override-allowed (auto-pull + override):** rendered from workbench but user can override (cover title, programme name display, contact line). Visual treatment: pencil icon on hover; click to edit inline; "Reset" pill appears when overridden.

3. **Typed (full inline edit):** no workbench source — user types everything (timeline cells, team rows, recommendations, findings text). Visual treatment: persistent textarea/input with placeholder text. M&E-aware placeholders, e.g., *"Key finding for Effectiveness — 2-3 sentences, lead with the most surprising result."*

**Persistence:** all edits debounce-saved (300ms) to `localStorage["praxis-deck-overrides:<programme>:<template>"]`. Refresh restores. "Reset to data" button per slide and globally.

## 9. Export

**PDF (primary):** `window.print()` triggers a print stylesheet. One slide per page, A4 landscape, exact colours preserved. No header/footer chrome from browser (`@page { margin: 0 }`). Tested across Chrome, Firefox, Safari.

**JSON (deck portability):**
- `Export Deck JSON` → downloads `<programme-slug>-<template>-<date>.deck.json` containing template, programme metadata, slide overrides, speaker notes
- `Import Deck JSON` → file input, replaces local state, useful for emailing yourself or version control

**No PPTX export** — explicitly out of scope.

## 10. Standalone & demo data

When the user lands on `/praxis/tools/deck-generator/` directly with no sessionStorage:

1. App detects missing context, loads `DEMO_CONTEXT` (a complete, plausible Niger maternal health programme with all 8 stations populated)
2. Top banner appears: *"Sample deck — 'Maternal Health Programme · Niger'. Build yours in the [Workbench →](/praxis/workbench/)."* (dismissable per-session)
3. All features fully functional with demo data
4. Demo includes meaningful findings text so the Findings template also looks complete

**`DEMO_CONTEXT` lives inline** in `index.html` — ~150 lines of realistic data covering project_meta, tor_constraints, toc, evaluation_matrix, design_recommendation, sample_parameters, instruments, analysis_plan, evaluability.

## 11. File structure

```
deploy-site/
├── praxis/
│   ├── workbench/
│   │   └── js/stations/station8/Station8.js   # already opens /praxis/tools/deck-generator/
│   └── tools/
│       └── deck-generator/
│           └── index.html                      # NEW — this build
└── docs/superpowers/
    ├── specs/
    │   └── 2026-04-20-deck-generator-tool-design.md   # this file
    └── plans/
        └── 2026-04-20-deck-generator-tool.md           # implementation plan (next)
```

## 12. Implementation milestones

Suggested phasing (writing-plans skill will sequence properly):

1. **Skeleton & data layer:** index.html shell, sessionStorage read, `DEMO_CONTEXT`, template picker, localStorage override merge
2. **Editor mode + slide canvas:** 16:9 canvas component, scroll-of-cards layout, slide chrome (header bar, footer)
3. **Inception slide library (16 slides):** all auto-pulled slides first (1–11), then editable slides (12–16)
4. **Three data viz components:** ToC tree (SVG), sampling bars (SVG), evaluability radar (SVG)
5. **Findings slide library (10 fixed + criterion loop):** typed-field components with M&E placeholders
6. **Presenter mode:** keyboard nav, fullscreen, hash sync, click-to-advance
7. **Speaker view:** secondary layout with notes + next-slide preview + clock
8. **Overview grid:** thumbnail jumper
9. **Print stylesheet:** PDF export tuning, cross-browser test
10. **JSON import/export:** file download + upload
11. **Wire Station 8:** verify the existing `Open Deck Tool` button works end-to-end
12. **Polish & QA:** keyboard accessibility, print test on all slides, PR readability check on deck

## 13. Risks & open questions

| ID | Risk | Mitigation |
|---|---|---|
| R1 | sessionStorage may exceed 5MB quota with large workbench contexts | Station 8 already trims context (line 493–504); deck tool reads only required keys |
| R2 | Print fidelity varies across browsers (esp. Safari) | Test in Chrome, Firefox, Safari before ship; document known caveats inline |
| R3 | SVG ToC tree may overflow with 50+ nodes | Cap visible nodes at 24 with "+N more" overflow chip; full list in speaker notes |
| R4 | Inline editing on 16 slides could feel cluttered in editor mode | Default to read-only display, edit-on-click pattern (pencil icon hover) |
| R5 | Demo data drift — schema changes in workbench could break demo deck | Version `DEMO_CONTEXT` with a `praxis_version` field; warn if mismatch |
| R6 | Babel Standalone is large (~3MB) — slow first load | Acceptable for tool pages, matches other PRAXIS tools; not critical-path |
| R7 | URL hash routing collides with browser fragment links | Use `#/<template>/<N>` namespace (not bare `#N`); ignore other fragments |

**Open questions** (defer to implementation):
- Exact PRAXIS logo asset for top-right of slides — use `/praxis/logo.svg` if available, omit if not
- Speaker view secondary-screen detection — use Presentation API where supported, fall back to popup window

## 14. Acceptance criteria

The build is complete when all of these are true:

1. Visiting `/praxis/tools/deck-generator/` in a fresh browser shows a complete demo deck with the dismissable banner — no errors in console
2. Workbench Station 8 → "Open Deck Tool ↗" → opens the deck tool with the actual workbench context, no 404
3. Inception template renders all 16 slides; Findings template renders 10–16 (criterion-aware)
4. ToC slide renders an SVG tree with at least 4 levels visible; sampling slide renders SVG bars; evaluability slide renders SVG radar
5. Presenter mode: arrow keys advance, fullscreen works in Chrome/Firefox/Safari, speaker view shows notes + next-slide + clock
6. PDF export: `Ctrl+P` produces a one-slide-per-page A4 landscape PDF with navy headers preserved
7. Inline edits on Timeline/Team/Risks/Deliverables/Findings persist across page refresh via localStorage
8. JSON export downloads a valid `.deck.json`; JSON import restores state correctly
9. Deck tool works fully offline after first load (workbench-style)
10. Lighthouse accessibility score ≥ 90; keyboard-only navigation works through all editor controls
