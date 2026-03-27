# PRAXIS Workbench — Plan A: Foundation + Shell

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete workbench infrastructure and shell — design tokens, state management, routing, i18n, and the Hybrid Authority shell with entry landing, top bar, station rail, and context drawer. At the end of this plan, a user can open the workbench, see the full landing page, start a new project, navigate between 9 empty station stubs, and save/load `.praxis` files.

**Architecture:** React 18 via CDN (no build step), single `useReducer` at app level, hash-based routing, localStorage persistence. All workbench CSS prefixed with `.wb-` to avoid conflict with embedded tools. The shell uses `React.createElement` directly (no JSX/Babel) for performance.

**Tech Stack:** React 18 + ReactDOM 18 (unpkg CDN), DM Sans + JetBrains Mono (Google Fonts), vanilla CSS with custom properties, no build tools.

**Prereqs:** None. This is Plan A of 3.

**Reference docs:**
- Design spec: `docs/superpowers/specs/2026-03-26-praxis-workbench-rebuild-design.md`
- Architecture blueprint: `docs/workbench-architecture-blueprint.md`
- Mockups: `.superpowers/brainstorm/2077-1774557242/`

**CRITICAL — Read before implementing:** The previous workbench implementation was scrapped. 26 files exist at `praxis/workbench/`. Task 1 clears these. Do NOT reuse any existing code — start fresh from the spec.

---

## File Map

All paths relative to `C:\Users\emmao\deploy-site\praxis\workbench\`.

### Files to CREATE (Phase 1 — Foundation, no React):
| File | Responsibility |
|------|---------------|
| `css/tokens.css` | CSS custom properties — all design tokens |
| `css/layout.css` | Shell layout: topbar + rail + panel + drawer |
| `css/components.css` | Reusable UI: buttons, badges, modals, forms, toasts |
| `css/stations.css` | Station panel layouts and empty states |
| `css/sensitivity.css` | Sensitivity tier visual overlays |
| `js/schema.js` | `.praxis` schema factory, station metadata constants |
| `js/utils.js` | Pure utilities: uid, debounce, deepMerge, file I/O |
| `js/staleness.js` | Dependency graph, staleness computation |
| `js/protection.js` | Sensitivity level utilities |
| `js/i18n.js` | Translation loader with `t(key, vars)` |
| `js/router.js` | Hash-based router |
| `lang/en.json` | English strings (shell + Station 0 labels for now) |
| `index.html` | Entry point — loads CDN deps, CSS, JS, mounts root |
| `test/foundation.test.html` | Browser-based tests for Phase 1 pure functions |

### Files to CREATE (Phase 2 — Shell + App Core):
| File | Responsibility |
|------|---------------|
| `js/context.js` | Reducer, ACTION_TYPES, state shape |
| `js/shell/EntryLanding.js` | Full-page dark landing (4 entry modes + tier selection) |
| `js/shell/TopBar.js` | 44px nav: brand, project title, tier pill, save |
| `js/shell/StationRail.js` | 48px left rail: 9 station buttons with state indicators |
| `js/shell/Shell.js` | Outer layout: topbar + rail + panel + drawer |
| `js/shell/ContextDrawer.js` | Right drawer: context tree + staleness view |
| `js/components/StationHeader.js` | Station number, title, staleness badge |
| `js/components/StalenessWarning.js` | "Upstream changed" banner |
| `js/components/SensitivityBanner.js` | Amber/red sensitivity banner |
| `js/components/Modal.js` | Generic modal wrapper |
| `js/components/FileDropZone.js` | Drag-and-drop .praxis file import |
| `js/components/ProgressRing.js` | Completion % ring |
| `js/components/ToastNotification.js` | Transient feedback messages |
| `js/app.js` | Root component: useReducer, renders Landing or Shell |
| `test/shell.test.html` | Browser-based tests for Phase 2 components |

### Files to DELETE (scrapped implementation):
All 26 existing files under `praxis/workbench/`. Clean slate.

---

## Task 1: Clean Slate

**Files:**
- Delete: all files under `praxis/workbench/`
- Create: `praxis/workbench/` directory structure

- [ ] **Step 1: Delete the scrapped implementation**

```bash
cd C:/Users/emmao/deploy-site
rm -rf praxis/workbench/*
```

- [ ] **Step 2: Create directory structure**

```bash
mkdir -p praxis/workbench/{css,js/{shell,stations/{station0,station1,station2,station3,station4,station5,station6,station7,station8},components},lang,data,test}
```

- [ ] **Step 3: Commit clean slate**

```bash
git add -A praxis/workbench/
git commit -m "chore: remove scrapped workbench implementation for rebuild"
```

---

## Task 2: CSS Foundation — Design Tokens & Layout

**Files:**
- Create: `css/tokens.css`
- Create: `css/layout.css`
- Create: `css/components.css`
- Create: `css/stations.css`
- Create: `css/sensitivity.css`

- [ ] **Step 1: Write `css/tokens.css`**

All CSS custom properties. Source of truth for every color, size, and spacing value in the workbench. Values come from design spec §3.2.

```css
/* praxis/workbench/css/tokens.css */
:root {
  /* ── Inherited from PRAXIS tools (must match exactly) ── */
  --navy: #0B1A2E;
  --navy-mid: #122240;
  --navy-light: #1a3050;
  --teal: #2EC4B6;
  --teal-dark: #1a9e92;
  --teal-light: #d0f0ed;
  --teal-glow: rgba(46,196,182,0.15);
  --slate: #64748B;
  --slate-light: #94A3B8;
  --bg: #F1F5F9;
  --surface: #FFFFFF;
  --border: #E2E8F0;
  --text: #0F172A;
  --text-muted: #64748B;
  --amber: #F59E0B;
  --amber-light: #FEF3C7;
  --red: #EF4444;
  --red-light: #FEE2E2;
  --green: #10B981;
  --green-light: #D1FAE5;
  --blue: #3B82F6;
  --blue-light: #DBEAFE;
  --purple: #8B5CF6;
  --purple-light: #EDE9FE;

  /* ── Workbench-specific tokens (spec §3.2) ── */
  --wb-rail-bg: #0a1525;
  --wb-rail-width: 48px;
  --wb-topbar-height: 44px;
  --wb-topbar-bg: #081420;
  --wb-drawer-width-collapsed: 44px;
  --wb-drawer-width-expanded: 320px;

  /* Tier colors */
  --tier-foundation: #10B981;
  --tier-foundation-bg: rgba(16,185,129,0.12);
  --tier-practitioner: #3B82F6;
  --tier-practitioner-bg: rgba(59,130,246,0.12);
  --tier-advanced: #8B5CF6;
  --tier-advanced-bg: rgba(139,92,246,0.12);

  /* Status */
  --stale-color: #F59E0B;
  --stale-bg: #FEF3C7;

  /* Sensitivity */
  --sens-sensitive-bg: #FEF3C7;
  --sens-sensitive-border: #FDE68A;
  --sens-highly-bg: #FEE2E2;
  --sens-highly-border: #FECACA;

  /* Selection/editing */
  --edit-color: #3B82F6;
  --edit-bg: #EFF6FF;

  /* Typography */
  --font-sans: 'DM Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Radii */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 10px;
  --radius-xl: 12px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(11,26,46,0.06);
  --shadow-md: 0 2px 8px rgba(11,26,46,0.08);
  --shadow-lg: 0 4px 20px rgba(11,26,46,0.12);
  --shadow-xl: 0 24px 80px rgba(0,0,0,0.4);
}
```

- [ ] **Step 2: Write `css/layout.css`**

Shell layout: Hybrid Authority pattern (spec §5). Topbar + rail + panel + drawer. Use the 48px rail width and 44px topbar height from spec (overrides blueprint's 64px/48px).

```css
/* praxis/workbench/css/layout.css */
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: var(--font-sans);
  background: var(--bg);
  color: var(--text);
  overflow: hidden;
  height: 100vh;
}

button { font-family: inherit; cursor: pointer; }
input, textarea, select { font-family: inherit; }

/* ── App root ── */
.wb-app { display: flex; flex-direction: column; height: 100vh; }

/* ── Entry landing (full page, replaces shell) ── */
.wb-landing {
  height: 100vh;
  background: var(--navy);
  display: flex;
  color: white;
}
.wb-landing-left {
  width: 55%;
  padding: 60px 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.wb-landing-right {
  width: 45%;
  background: rgba(255,255,255,0.03);
  border-left: 1px solid rgba(255,255,255,0.06);
  padding: 48px 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
}

/* ── Top bar ── */
.wb-topbar {
  height: var(--wb-topbar-height);
  background: var(--wb-topbar-bg);
  display: flex;
  align-items: center;
  padding: 0 14px;
  gap: 8px;
  flex-shrink: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

/* ── Shell body (below topbar) ── */
.wb-shell { display: flex; height: calc(100vh - var(--wb-topbar-height)); }

/* ── Station rail ── */
.wb-rail {
  width: var(--wb-rail-width);
  background: var(--wb-rail-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 10px;
  gap: 4px;
  flex-shrink: 0;
  border-right: 1px solid rgba(255,255,255,0.04);
  overflow-y: auto;
}

/* ── Main content area ── */
.wb-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* ── Station panel ── */
.wb-panel {
  flex: 1;
  background: var(--surface);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.wb-panel-header {
  padding: 14px 20px 0;
  flex-shrink: 0;
}
.wb-panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 20px;
}
.wb-panel-footer {
  padding: 12px 20px;
  border-top: 1px solid var(--border);
  background: #FAFBFC;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* ── Context drawer ── */
.wb-drawer {
  width: var(--wb-drawer-width-collapsed);
  background: #F8FAFC;
  border-left: 1px solid var(--border);
  flex-shrink: 0;
  transition: width 0.2s ease;
  overflow: hidden;
}
.wb-drawer.wb-drawer--open {
  width: var(--wb-drawer-width-expanded);
}

/* ── Responsive: rail becomes bottom bar on mobile ── */
@media (max-width: 768px) {
  .wb-shell { flex-direction: column-reverse; }
  .wb-rail {
    width: 100%;
    height: 56px;
    flex-direction: row;
    padding: 0 8px;
    gap: 2px;
    overflow-x: auto;
    border-right: none;
    border-top: 1px solid rgba(255,255,255,0.04);
  }
  .wb-drawer { display: none; }
}
```

- [ ] **Step 3: Write `css/components.css`**

Shared component styles — buttons, badges, pills, form elements, cards. All prefixed `.wb-`. See spec §3.3 for conventions.

```css
/* praxis/workbench/css/components.css */

/* ── Buttons ── */
.wb-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: var(--radius-sm);
  font-size: 12px; font-weight: 600; border: none;
  transition: all 0.15s; white-space: nowrap;
}
.wb-btn-primary { background: var(--navy); color: white; }
.wb-btn-primary:hover { background: var(--navy-light); }
.wb-btn-teal { background: var(--teal); color: white; }
.wb-btn-teal:hover { background: var(--teal-dark); }
.wb-btn-outline { background: var(--surface); color: var(--text); border: 1px solid var(--border); }
.wb-btn-outline:hover { border-color: var(--navy); background: #F5F5F5; }
.wb-btn-ghost { background: transparent; color: var(--slate); }
.wb-btn-ghost:hover { background: rgba(0,0,0,0.04); }
.wb-btn-sm { padding: 5px 12px; font-size: 11px; }
.wb-btn-danger { background: var(--red-light); color: var(--red); border: 1px solid #FECACA; }

/* ── Badges & Pills ── */
.wb-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 2px 8px; border-radius: 10px;
  font-size: 9px; font-weight: 700; letter-spacing: 0.04em;
}
.wb-badge-navy { background: var(--navy); color: white; }
.wb-badge-teal { background: var(--teal-glow); color: var(--teal); }
.wb-badge-green { background: var(--green-light); color: var(--green); }
.wb-badge-amber { background: var(--amber-light); color: #92400E; }
.wb-badge-red { background: var(--red-light); color: var(--red); }

.wb-pill {
  padding: 3px 8px; border-radius: 5px;
  background: var(--bg); border: 1px solid var(--border);
  font-size: 9px;
}

/* ── Tier pill (spec §5.1) ── */
.wb-tier-pill {
  padding: 3px 8px; border-radius: 8px;
  font-size: 9px; font-weight: 700; letter-spacing: 0.04em;
}
.wb-tier-pill[data-tier="foundation"] { background: var(--tier-foundation-bg); color: var(--tier-foundation); }
.wb-tier-pill[data-tier="practitioner"] { background: var(--tier-practitioner-bg); color: var(--tier-practitioner); }
.wb-tier-pill[data-tier="advanced"] { background: var(--tier-advanced-bg); color: var(--tier-advanced); }

/* ── Form elements ── */
.wb-label {
  display: block; font-size: 11px; font-weight: 600;
  color: var(--slate); margin-bottom: 6px;
  letter-spacing: 0.03em; text-transform: uppercase;
}
.wb-input {
  width: 100%; padding: 8px 12px; border-radius: var(--radius-sm);
  border: 1.5px solid var(--border); font-size: 13px;
  background: #F8FAFC; color: var(--text); transition: border-color 0.15s;
}
.wb-input:focus { outline: none; border-color: var(--teal); }
.wb-textarea { resize: vertical; min-height: 60px; }
.wb-helper { font-size: 10px; color: var(--slate-light); margin-top: 4px; }

/* ── Chip (multi-select pills) ── */
.wb-chip {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 5px 12px; border-radius: 16px;
  font-size: 11px; font-weight: 500;
  border: 1.5px solid var(--border); background: var(--surface);
  cursor: pointer; transition: all 0.15s; user-select: none;
}
.wb-chip:hover { border-color: var(--teal); background: var(--teal-light); }
.wb-chip.wb-chip--selected {
  background: var(--navy); color: white; border-color: var(--navy); font-weight: 600;
}

/* ── Cards ── */
.wb-card {
  background: var(--surface); border-radius: var(--radius-md);
  border: 1px solid var(--border); padding: 14px 16px;
  transition: all 0.15s;
}
.wb-card--interactive { cursor: pointer; }
.wb-card--interactive:hover { border-color: var(--navy); box-shadow: var(--shadow-sm); }
.wb-card--selected { border: 2px solid var(--navy); background: var(--bg); }

/* ── Option card selector (3-way selectors like Operating Context) ── */
.wb-option-card {
  flex: 1; padding: 10px; border-radius: var(--radius-md);
  border: 1.5px solid var(--border); text-align: center;
  cursor: pointer; transition: all 0.15s;
}
.wb-option-card:hover { border-color: var(--navy); }
.wb-option-card--selected { border: 2px solid var(--navy); background: var(--bg); }
.wb-option-card--amber { border-color: var(--amber); background: #FFFBEB; }
.wb-option-card--red { border-color: var(--red); background: var(--red-light); }

/* ── Modal ── */
.wb-modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 200;
}
.wb-modal {
  background: var(--surface); border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl); max-width: 90vw; max-height: 90vh;
  overflow: hidden; display: flex; flex-direction: column;
}
.wb-modal-header {
  padding: 14px 18px; border-bottom: 1px solid var(--border);
  background: #F8FAFC; display: flex; align-items: center;
  justify-content: space-between;
}
.wb-modal-body { padding: 18px; overflow-y: auto; flex: 1; }
.wb-modal-footer {
  padding: 12px 18px; border-top: 1px solid var(--border);
  background: #FAFBFC; display: flex; justify-content: flex-end; gap: 8px;
}

/* ── Toast ── */
.wb-toast-container { position: fixed; bottom: 20px; right: 20px; z-index: 300; display: flex; flex-direction: column; gap: 8px; }
.wb-toast {
  padding: 10px 16px; border-radius: var(--radius-md);
  background: var(--navy); color: white; font-size: 12px; font-weight: 500;
  box-shadow: var(--shadow-lg); animation: wb-toast-in 0.2s ease;
}
@keyframes wb-toast-in { from { opacity: 0; transform: translateY(10px); } }

/* ── Progress ring ── */
.wb-progress-ring { display: inline-flex; align-items: center; justify-content: center; position: relative; }
.wb-progress-ring svg { transform: rotate(-90deg); }
.wb-progress-ring-text {
  position: absolute; font-size: 9px; font-weight: 700; color: var(--teal);
}

/* ── Station rail button (spec §3.4) ── */
.wb-rail-btn {
  width: 32px; height: 32px; border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  border: none; background: transparent; position: relative;
  font-size: 10px; font-weight: 600; color: #475569;
  cursor: pointer; transition: all 0.15s;
}
.wb-rail-btn:hover { background: rgba(255,255,255,0.04); }
.wb-rail-btn--active {
  background: rgba(46,196,182,0.12);
  border-left: 2px solid var(--teal);
  color: var(--teal); font-weight: 700;
}
.wb-rail-btn--completed .wb-rail-check {
  position: absolute; top: 1px; right: 1px;
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--green);
  display: flex; align-items: center; justify-content: center;
}
.wb-rail-btn--stale .wb-rail-stale-dot {
  position: absolute; top: 2px; right: 2px;
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--stale-color);
}

/* ── Upstream context badges ── */
.wb-context-badges { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
.wb-context-badge {
  padding: 3px 8px; border-radius: 5px;
  background: var(--bg); border: 1px solid var(--border);
  font-size: 9px;
}

/* ── Guidance banner (dismissible, spec §6.3) ── */
.wb-guidance {
  background: #F0FDF9; border: 1px solid #BBF7D0;
  border-radius: var(--radius-md); padding: 8px 14px;
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 16px;
}
.wb-guidance-text { flex: 1; font-size: 11px; color: #166534; line-height: 1.4; }
.wb-guidance-dismiss { font-size: 9px; color: #6EE7B7; cursor: pointer; white-space: nowrap; }
.wb-guidance-close { color: #86EFAC; cursor: pointer; font-size: 14px; line-height: 1; background: none; border: none; }

/* ── Phase indicator bar (spec §6.2) ── */
.wb-phases { display: flex; align-items: center; margin-bottom: 16px; }
.wb-phase {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 14px; font-size: 11px;
}
.wb-phase:first-child { border-radius: var(--radius-md) 0 0 var(--radius-md); }
.wb-phase:last-child { border-radius: 0 var(--radius-md) var(--radius-md) 0; }
.wb-phase--current { background: var(--navy); color: white; font-weight: 600; }
.wb-phase--completed { background: var(--green-light); color: #059669; font-weight: 600; cursor: pointer; }
.wb-phase--upcoming {
  background: var(--bg); color: #CBD5E1;
  border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
}
.wb-phase:last-child.wb-phase--upcoming { border-right: 1px solid var(--border); }
.wb-phase-num {
  width: 18px; height: 18px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 9px; font-weight: 800;
}
.wb-phase--current .wb-phase-num { background: var(--teal); color: var(--navy); }
.wb-phase--completed .wb-phase-num { background: var(--green); color: white; }
.wb-phase--upcoming .wb-phase-num { border: 1.5px solid #CBD5E1; color: #CBD5E1; }
```

- [ ] **Step 4: Write `css/stations.css`**

```css
/* praxis/workbench/css/stations.css */
.wb-station-label {
  font-size: 10px; font-weight: 800; color: var(--teal);
  letter-spacing: 0.08em; text-transform: uppercase;
}
.wb-station-title {
  font-size: 15px; font-weight: 700; color: var(--navy);
}
.wb-station-desc {
  font-size: 11px; color: var(--slate); margin-bottom: 10px;
}

/* Empty state for unbuilt stations */
.wb-station-empty {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  min-height: 300px; text-align: center; padding: 40px;
}
.wb-station-empty-title {
  font-size: 16px; font-weight: 700; color: var(--navy); margin-bottom: 8px;
}
.wb-station-empty-desc {
  font-size: 12px; color: var(--slate); max-width: 400px; line-height: 1.5;
}

/* Station panel grid layouts */
.wb-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.wb-form-grid-full { grid-column: 1 / -1; }
```

- [ ] **Step 5: Write `css/sensitivity.css`**

```css
/* praxis/workbench/css/sensitivity.css */
.wb-sensitivity-banner {
  padding: 6px 14px; font-size: 11px; font-weight: 600;
  display: flex; align-items: center; gap: 8px;
  flex-shrink: 0;
}
.wb-sensitivity-banner--sensitive {
  background: var(--sens-sensitive-bg); border-bottom: 1px solid var(--sens-sensitive-border);
  color: #92400E;
}
.wb-sensitivity-banner--highly {
  background: var(--sens-highly-bg); border-bottom: 1px solid var(--sens-highly-border);
  color: #991B1B; animation: wb-sens-pulse 3s ease-in-out infinite;
}
@keyframes wb-sens-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.85; }
}
.wb-sensitivity-overlay {
  border: 2px solid var(--red); border-radius: var(--radius-md);
}
```

- [ ] **Step 6: Commit CSS foundation**

```bash
git add praxis/workbench/css/
git commit -m "feat(workbench): add CSS foundation — tokens, layout, components, stations, sensitivity"
```

---

## Task 3: JavaScript Foundation — Schema, Utils, Staleness, Protection

**Files:**
- Create: `js/schema.js`
- Create: `js/utils.js`
- Create: `js/staleness.js`
- Create: `js/protection.js`
- Create: `js/i18n.js`
- Create: `js/router.js`
- Test: `test/foundation.test.html`

- [ ] **Step 1: Write `js/schema.js`**

The `.praxis` schema factory. Returns the canonical empty context object. Must match the schema contract in architecture blueprint §3, with the evaluability schema extension from design spec §6.6.

```javascript
// praxis/workbench/js/schema.js
(function() {
  'use strict';

  var PRAXIS_VERSION = '1.0';

  // Station metadata
  var STATION_LABELS = [
    'Evaluability & Scoping',
    'Theory of Change',
    'Evaluation Matrix',
    'Design Advisor',
    'Sample Size',
    'Instrument Builder',
    'Analysis Framework',
    'Report Builder',
    'Deck Generator'
  ];

  // Which context keys each station writes (used by staleness system)
  var STATION_FIELDS = {
    0: ['project_meta', 'tor_constraints', 'evaluability', 'protection'],
    1: ['toc'],
    2: ['evaluation_matrix'],
    3: ['design_recommendation'],
    4: ['sample_parameters'],
    5: ['instruments'],
    6: ['analysis_plan'],
    7: ['report_structure'],
    8: ['presentation']
  };

  function createEmptyContext() {
    return {
      version: PRAXIS_VERSION,
      schema: 'praxis-workbench',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),

      project_meta: {
        title: '',
        programme_name: '',
        organisation: '',
        country: '',
        sector_template: '',
        sectors: [],
        primary_sector: null,
        health_areas: [],
        frameworks: [],
        evaluation_type: '',
        operating_context: '',
        budget: '',
        timeline: '',
        programme_maturity: '',
        languages: ['en']
      },

      protection: {
        sensitivity: 'standard',
        ai_permitted: true,
        sharing_guidance: '',
        encryption_recommended: false,
        access_notes: ''
      },

      tor_constraints: {
        raw_text: '',
        evaluation_purpose: [],
        causal_inference_level: '',
        comparison_feasibility: '',
        data_available: '',
        unit_of_intervention: '',
        programme_complexity: '',
        geographic_scope: '',
        target_population: '',
        evaluation_questions_raw: []
      },

      evaluability: {
        score: null,
        dimensions: [
          { id: 'data', label: 'Data Availability', max: 25, system_score: null, adjusted_score: null, justification: null },
          { id: 'toc', label: 'ToC Clarity', max: 20, system_score: null, adjusted_score: null, justification: null },
          { id: 'timeline', label: 'Timeline Adequacy', max: 20, system_score: null, adjusted_score: null, justification: null },
          { id: 'context', label: 'Operating Context', max: 15, system_score: null, adjusted_score: null, justification: null },
          { id: 'comparison', label: 'Comparison Feasibility', max: 20, system_score: null, adjusted_score: null, justification: null }
        ],
        blockers: [],
        recommendations: [],
        completed_at: null
      },

      toc: {
        title: '',
        narrative: { description: '', context: '', theory: '', systemAssumptions: [] },
        nodes: [],
        connections: [],
        knowledge_sources: {},
        completed_at: null
      },

      evaluation_matrix: {
        context: { programmeName: '', sectorTemplate: '', healthAreas: [], frameworks: [], evaluationType: '', operatingContext: '', dacCriteria: [] },
        toc_summary: { goal: '', outcomes: [], assumptions: [], inputMode: 'structured', freeText: '' },
        rows: [],
        completed_at: null
      },

      design_recommendation: {
        answers: {},
        ranked_designs: [],
        selected_design: null,
        justification: '',
        completed_at: null
      },

      sample_parameters: {
        design_id: '',
        params: {},
        result: {},
        qualitative_plan: { purpose: '', methods: [], contexts: {}, breakdown: [] },
        completed_at: null
      },

      instruments: { items: [], completed_at: null },
      analysis_plan: { quantitative: [], qualitative: [], completed_at: null },
      report_structure: { sections: [], completed_at: null },
      presentation: { slides: [], completed_at: null },

      staleness: { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false },
      reviews: []
    };
  }

  // Expose globally (no module system)
  window.PraxisSchema = {
    PRAXIS_VERSION: PRAXIS_VERSION,
    STATION_LABELS: STATION_LABELS,
    STATION_FIELDS: STATION_FIELDS,
    createEmptyContext: createEmptyContext
  };
})();
```

- [ ] **Step 2: Write `js/utils.js`**

```javascript
// praxis/workbench/js/utils.js
(function() {
  'use strict';

  function uid(prefix) {
    return (prefix || '') + Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  function debounce(fn, ms) {
    var timer;
    return function() {
      var args = arguments, ctx = this;
      clearTimeout(timer);
      timer = setTimeout(function() { fn.apply(ctx, args); }, ms);
    };
  }

  function formatDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function deepMerge(target, source) {
    var result = Object.assign({}, target);
    Object.keys(source).forEach(function(key) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
        result[key] = deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    });
    return result;
  }

  function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }

  function downloadJSON(obj, filename) {
    var blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    downloadBlob(blob, filename);
  }

  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function readFileAsJSON(file) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onload = function(e) {
        try { resolve(JSON.parse(e.target.result)); }
        catch (err) { reject(new Error('Invalid JSON file')); }
      };
      reader.onerror = function() { reject(new Error('Failed to read file')); };
      reader.readAsText(file);
    });
  }

  function estimateJSONSize(obj) {
    return new Blob([JSON.stringify(obj)]).size;
  }

  window.PraxisUtils = {
    uid: uid, debounce: debounce, formatDate: formatDate,
    deepMerge: deepMerge, clamp: clamp,
    downloadJSON: downloadJSON, downloadBlob: downloadBlob,
    readFileAsJSON: readFileAsJSON, estimateJSONSize: estimateJSONSize
  };
})();
```

- [ ] **Step 3: Write `js/staleness.js`**

```javascript
// praxis/workbench/js/staleness.js
(function() {
  'use strict';

  // Maps each station to the context fields it READS (not writes).
  // When a station saves, any downstream station whose read-fields
  // intersect with the saved fields gets flagged stale.
  var UPSTREAM_DEPS = {
    0: [],  // Station 0 reads nothing upstream
    1: ['project_meta'],
    2: ['project_meta', 'toc', 'tor_constraints', 'evaluability'],
    3: ['tor_constraints', 'project_meta'],
    4: ['design_recommendation', 'evaluation_matrix'],
    5: ['evaluation_matrix'],
    6: ['evaluation_matrix', 'instruments', 'sample_parameters'],
    7: ['evaluation_matrix', 'analysis_plan'],
    8: ['evaluation_matrix', 'design_recommendation', 'sample_parameters', 'report_structure']
  };

  /**
   * Given that station `changedStationId` just saved, compute which
   * downstream stations should be flagged stale.
   * Returns a new staleness object.
   */
  function computeStaleness(changedStationId, currentStaleness) {
    var writtenFields = PraxisSchema.STATION_FIELDS[changedStationId];
    if (!writtenFields) return currentStaleness;

    var newStaleness = Object.assign({}, currentStaleness);
    // The station that just saved is no longer stale
    newStaleness[changedStationId] = false;

    // Check every other station
    for (var stationId = 0; stationId <= 8; stationId++) {
      if (stationId === changedStationId) continue;
      var deps = UPSTREAM_DEPS[stationId];
      // If any of this station's read-deps intersect with the written fields, flag stale
      for (var i = 0; i < deps.length; i++) {
        if (writtenFields.indexOf(deps[i]) !== -1) {
          newStaleness[stationId] = true;
          break;
        }
      }
    }
    return newStaleness;
  }

  window.PraxisStaleness = {
    UPSTREAM_DEPS: UPSTREAM_DEPS,
    computeStaleness: computeStaleness
  };
})();
```

- [ ] **Step 4: Write `js/protection.js`**

```javascript
// praxis/workbench/js/protection.js
(function() {
  'use strict';

  var SENSITIVITY_LEVELS = [
    { id: 'standard', label: 'Standard', desc: 'No special handling required' },
    { id: 'sensitive', label: 'Sensitive', desc: 'Contains personal or programme-sensitive data' },
    { id: 'highly_sensitive', label: 'Highly Sensitive', desc: 'Contains protection-critical or conflict-sensitive data' }
  ];

  function isSensitive(context) {
    return context.protection.sensitivity !== 'standard';
  }

  function isHighlySensitive(context) {
    return context.protection.sensitivity === 'highly_sensitive';
  }

  function getAiPermission(context) {
    return context.protection.ai_permitted;
  }

  function getSharingGuidance(context) {
    var level = context.protection.sensitivity;
    if (level === 'standard') return '';
    if (level === 'sensitive') return 'This file contains sensitive programme data. Share only with authorised evaluation team members.';
    return 'HIGHLY SENSITIVE. Encryption recommended for storage and transmission. Do not share outside the core evaluation team without explicit authorisation.';
  }

  window.PraxisProtection = {
    SENSITIVITY_LEVELS: SENSITIVITY_LEVELS,
    isSensitive: isSensitive,
    isHighlySensitive: isHighlySensitive,
    getAiPermission: getAiPermission,
    getSharingGuidance: getSharingGuidance
  };
})();
```

- [ ] **Step 5: Write `js/i18n.js`**

```javascript
// praxis/workbench/js/i18n.js
(function() {
  'use strict';

  var strings = {};
  var currentLocale = 'en';

  function loadLocale(locale) {
    var xhr = new XMLHttpRequest();
    var path = (window.PRAXIS_BASE_PATH || '') + 'lang/' + locale + '.json';
    xhr.open('GET', path, false); // synchronous — small file
    xhr.send();
    if (xhr.status === 200) {
      strings = JSON.parse(xhr.responseText);
      currentLocale = locale;
    }
  }

  function t(key, vars) {
    var str = strings[key] || key;
    if (vars) {
      Object.keys(vars).forEach(function(k) {
        str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
      });
    }
    return str;
  }

  function setLocale(locale) {
    loadLocale(locale);
  }

  function getLocale() { return currentLocale; }

  // Auto-load English on script load
  try { loadLocale('en'); } catch (e) { /* will fall back to key as string */ }

  window.PraxisI18n = { t: t, setLocale: setLocale, getLocale: getLocale };
})();
```

- [ ] **Step 6: Write `js/router.js`**

```javascript
// praxis/workbench/js/router.js
(function() {
  'use strict';

  function getRoute() {
    var hash = window.location.hash.slice(1);
    var params = {};
    hash.split('&').forEach(function(pair) {
      var parts = pair.split('=');
      if (parts[0]) params[parts[0]] = decodeURIComponent(parts[1] || '');
    });
    return {
      station: params.station !== undefined ? parseInt(params.station, 10) : null,
      mode: params.mode || null,
      params: params
    };
  }

  function navigate(station, mode, extra) {
    var parts = [];
    if (station !== null && station !== undefined) parts.push('station=' + station);
    if (mode) parts.push('mode=' + encodeURIComponent(mode));
    if (extra) {
      Object.keys(extra).forEach(function(k) {
        if (k !== 'station' && k !== 'mode') parts.push(k + '=' + encodeURIComponent(extra[k]));
      });
    }
    window.location.hash = parts.join('&');
  }

  window.PraxisRouter = { getRoute: getRoute, navigate: navigate };
})();
```

- [ ] **Step 7: Write `lang/en.json`**

Shell strings + Station 0 labels (minimum for Plan A). Additional station strings added in Plan B.

```json
{
  "shell.brand": "PRAXIS",
  "shell.workbench": "Workbench",
  "shell.save": "Save .praxis",
  "shell.open": "Open",
  "shell.export": "Export",

  "tier.foundation": "FOUNDATION",
  "tier.practitioner": "PRACTITIONER",
  "tier.advanced": "ADVANCED",

  "landing.title": "Evaluation Workbench",
  "landing.subtitle": "Design a complete evaluation from scoping to final report. Nine integrated stations guide you through the full evaluation lifecycle.",
  "landing.new": "New Evaluation",
  "landing.new_desc": "Start from scratch with guided intake",
  "landing.open": "Open .praxis File",
  "landing.open_desc": "Resume from a saved evaluation package",
  "landing.quick": "Quick Mode",
  "landing.quick_desc": "Jump to a single station without a full project",
  "landing.continue": "Continue",
  "landing.last_edited": "Last edited {time} · Station {station}",

  "landing.tier_title": "Choose your experience level",
  "landing.tier_foundation": "Plain language, guided experience. Recommended if this is your first evaluation design or you want the clearest explanations.",
  "landing.tier_practitioner": "Standard M&E terminology. For evaluators familiar with DAC criteria, ToC frameworks, and mixed methods.",
  "landing.tier_advanced": "Full technical detail. Assumes familiarity with econometric methods, advanced sampling, and XLSForm structure.",

  "station.0.name": "Evaluability & Scoping",
  "station.0.desc": "Assess whether this programme can be meaningfully evaluated",
  "station.1.name": "Theory of Change",
  "station.1.desc": "Map the causal logic connecting activities to outcomes",
  "station.2.name": "Evaluation Matrix",
  "station.2.desc": "Build evaluation questions, indicators, and data sources",
  "station.3.name": "Design Advisor",
  "station.3.desc": "Select the most appropriate evaluation design",
  "station.4.name": "Sample Size",
  "station.4.desc": "Calculate sample requirements for your design",
  "station.5.name": "Instrument Builder",
  "station.5.desc": "Build data collection instruments from the matrix",
  "station.6.name": "Analysis Framework",
  "station.6.desc": "Plan your analytical approach",
  "station.7.name": "Report Builder",
  "station.7.desc": "Structure your evaluation report",
  "station.8.name": "Deck Generator",
  "station.8.desc": "Generate presentation materials",

  "staleness.warning": "Upstream data changed since this station was last saved.",
  "staleness.review": "Review changes",
  "staleness.dismiss": "Dismiss",

  "sensitivity.standard": "Standard",
  "sensitivity.sensitive": "Sensitive data — handle with care",
  "sensitivity.highly": "HIGHLY SENSITIVE — encryption recommended",

  "empty.title": "Station {n}: {name}",
  "empty.desc": "This station will be available soon.",

  "common.save_draft": "Save Draft",
  "common.continue": "Continue",
  "common.cancel": "Cancel",
  "common.back": "Back",
  "common.next": "Next"
}
```

- [ ] **Step 8: Commit JS foundation**

```bash
git add praxis/workbench/js/schema.js praxis/workbench/js/utils.js praxis/workbench/js/staleness.js praxis/workbench/js/protection.js praxis/workbench/js/i18n.js praxis/workbench/js/router.js praxis/workbench/lang/en.json
git commit -m "feat(workbench): add JS foundation — schema, utils, staleness, protection, i18n, router"
```

- [ ] **Step 9: Write `test/foundation.test.html` and verify**

Browser-based test page for the pure functions. Open in browser to verify.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Workbench Foundation Tests</title>
<style>
body { font-family: monospace; padding: 20px; background: #0B1A2E; color: #2EC4B6; }
.pass { color: #10B981; } .fail { color: #EF4444; }
h2 { color: white; margin-top: 20px; }
</style>
</head>
<body>
<h1>PRAXIS Workbench — Foundation Tests</h1>
<div id="results"></div>
<script src="../js/schema.js"></script>
<script src="../js/utils.js"></script>
<script src="../js/staleness.js"></script>
<script src="../js/protection.js"></script>
<script>
var results = document.getElementById('results');
var pass = 0, fail = 0;

function assert(name, condition) {
  if (condition) { pass++; log(name, true); }
  else { fail++; log(name, false); }
}

function log(name, ok) {
  var el = document.createElement('div');
  el.className = ok ? 'pass' : 'fail';
  el.textContent = (ok ? '✓ ' : '✗ ') + name;
  results.appendChild(el);
}

function section(name) {
  var el = document.createElement('h2');
  el.textContent = name;
  results.appendChild(el);
}

// ── Schema tests ──
section('Schema');
var ctx = PraxisSchema.createEmptyContext();
assert('createEmptyContext returns object', typeof ctx === 'object');
assert('version is 1.0', ctx.version === '1.0');
assert('has project_meta', typeof ctx.project_meta === 'object');
assert('has evaluability with dimensions array', Array.isArray(ctx.evaluability.dimensions));
assert('evaluability has 5 dimensions', ctx.evaluability.dimensions.length === 5);
assert('comparison dimension max is 20', ctx.evaluability.dimensions[4].max === 20);
assert('staleness object has 9 stations', Object.keys(ctx.staleness).length === 9);
assert('STATION_LABELS has 9 entries', PraxisSchema.STATION_LABELS.length === 9);
assert('STATION_FIELDS[0] includes project_meta', PraxisSchema.STATION_FIELDS[0].indexOf('project_meta') !== -1);
assert('STATION_FIELDS[2] includes evaluation_matrix', PraxisSchema.STATION_FIELDS[2].indexOf('evaluation_matrix') !== -1);

// Verify two distinct calls produce independent objects
var ctx2 = PraxisSchema.createEmptyContext();
ctx2.project_meta.title = 'Test';
assert('createEmptyContext returns independent objects', ctx.project_meta.title === '');

// ── Utils tests ──
section('Utils');
assert('uid generates unique strings', PraxisUtils.uid('t_') !== PraxisUtils.uid('t_'));
assert('uid has prefix', PraxisUtils.uid('test_').indexOf('test_') === 0);
assert('clamp low', PraxisUtils.clamp(-5, 0, 100) === 0);
assert('clamp high', PraxisUtils.clamp(150, 0, 100) === 100);
assert('clamp normal', PraxisUtils.clamp(50, 0, 100) === 50);
assert('deepMerge shallow', PraxisUtils.deepMerge({a: 1}, {b: 2}).b === 2);
assert('deepMerge preserves', PraxisUtils.deepMerge({a: 1}, {b: 2}).a === 1);
assert('deepMerge nested', PraxisUtils.deepMerge({a: {x: 1, y: 2}}, {a: {y: 3}}).a.x === 1);
assert('deepMerge nested override', PraxisUtils.deepMerge({a: {x: 1, y: 2}}, {a: {y: 3}}).a.y === 3);
assert('deepMerge does not mutate', function() { var o = {a: 1}; PraxisUtils.deepMerge(o, {b: 2}); return o.b === undefined; }());
assert('formatDate handles null', PraxisUtils.formatDate(null) === '');

// ── Staleness tests ──
section('Staleness');
var fresh = { 0:false, 1:false, 2:false, 3:false, 4:false, 5:false, 6:false, 7:false, 8:false };

// Station 0 writes project_meta, tor_constraints, evaluability, protection
var after0 = PraxisStaleness.computeStaleness(0, fresh);
assert('Station 0 save: Station 0 not stale', after0[0] === false);
assert('Station 0 save: Station 1 stale (reads project_meta)', after0[1] === true);
assert('Station 0 save: Station 2 stale (reads project_meta, tor_constraints, evaluability)', after0[2] === true);
assert('Station 0 save: Station 3 stale (reads tor_constraints, project_meta)', after0[3] === true);
assert('Station 0 save: Station 5 not stale (reads evaluation_matrix only)', after0[5] === false);

// Station 2 writes evaluation_matrix
var after2 = PraxisStaleness.computeStaleness(2, fresh);
assert('Station 2 save: Station 4 stale (reads evaluation_matrix)', after2[4] === true);
assert('Station 2 save: Station 5 stale (reads evaluation_matrix)', after2[5] === true);
assert('Station 2 save: Station 1 not stale', after2[1] === false);

// ── Protection tests ──
section('Protection');
var stdCtx = PraxisSchema.createEmptyContext();
assert('standard context is not sensitive', PraxisProtection.isSensitive(stdCtx) === false);
assert('standard context is not highly sensitive', PraxisProtection.isHighlySensitive(stdCtx) === false);
assert('standard context allows AI', PraxisProtection.getAiPermission(stdCtx) === true);
assert('standard guidance is empty', PraxisProtection.getSharingGuidance(stdCtx) === '');

var sensCtx = PraxisSchema.createEmptyContext();
sensCtx.protection.sensitivity = 'sensitive';
assert('sensitive context is sensitive', PraxisProtection.isSensitive(sensCtx) === true);
assert('sensitive context is not highly sensitive', PraxisProtection.isHighlySensitive(sensCtx) === false);
assert('sensitive guidance is non-empty', PraxisProtection.getSharingGuidance(sensCtx).length > 0);

var highCtx = PraxisSchema.createEmptyContext();
highCtx.protection.sensitivity = 'highly_sensitive';
assert('highly sensitive context is sensitive', PraxisProtection.isSensitive(highCtx) === true);
assert('highly sensitive context is highly sensitive', PraxisProtection.isHighlySensitive(highCtx) === true);

// ── Summary ──
section('Summary');
var summary = document.createElement('div');
summary.style.fontSize = '16px';
summary.style.marginTop = '10px';
summary.innerHTML = '<span class="pass">' + pass + ' passed</span> / <span class="fail">' + fail + ' failed</span> / ' + (pass + fail) + ' total';
results.appendChild(summary);
</script>
</body>
</html>
```

Open `praxis/workbench/test/foundation.test.html` in browser. Expected: all tests pass (green), 0 failures.

- [ ] **Step 10: Commit foundation tests**

```bash
git add praxis/workbench/test/foundation.test.html
git commit -m "test(workbench): add foundation test suite — schema, utils, staleness, protection"
```

---

## Task 4: index.html — Entry Point

**Files:**
- Create: `index.html`

- [ ] **Step 1: Write `index.html`**

Single entry point. Loads CDN dependencies, all CSS, all JS in dependency order, mounts React root. Uses specific versioned CDN URLs for service worker caching (spec §14).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PRAXIS Evaluation Workbench</title>
<meta name="description" content="Design a complete evaluation from scoping to reporting. Nine integrated stations guide you through the full evaluation lifecycle.">
<link rel="icon" type="image/svg+xml" href="../logo.svg">

<!-- Fonts -->
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

<!-- React 18 (specific versions for SW caching) -->
<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>

<!-- SheetJS for Excel/XLSForm export (Station 2 + Station 5) -->
<script src="https://unpkg.com/xlsx@0.18.5/dist/xlsx.full.min.js"></script>

<!-- Workbench CSS -->
<link rel="stylesheet" href="css/tokens.css">
<link rel="stylesheet" href="css/layout.css">
<link rel="stylesheet" href="css/components.css">
<link rel="stylesheet" href="css/stations.css">
<link rel="stylesheet" href="css/sensitivity.css">
</head>
<body>
<div id="root"></div>

<!-- Foundation JS (dependency order) -->
<script src="js/schema.js"></script>
<script src="js/utils.js"></script>
<script src="js/staleness.js"></script>
<script src="js/protection.js"></script>
<script src="js/i18n.js"></script>
<script src="js/router.js"></script>

<!-- State management -->
<script src="js/context.js"></script>

<!-- Shell components (React.createElement, no JSX) -->
<script src="js/components/Modal.js"></script>
<script src="js/components/FileDropZone.js"></script>
<script src="js/components/ToastNotification.js"></script>
<script src="js/components/ProgressRing.js"></script>
<script src="js/components/StationHeader.js"></script>
<script src="js/components/StalenessWarning.js"></script>
<script src="js/components/SensitivityBanner.js"></script>
<script src="js/shell/TopBar.js"></script>
<script src="js/shell/StationRail.js"></script>
<script src="js/shell/ContextDrawer.js"></script>
<script src="js/shell/Shell.js"></script>
<script src="js/shell/EntryLanding.js"></script>

<!-- Station scripts (added in Plan B/C) -->
<!-- <script src="js/stations/station0/EvaluabilityScorer.js"></script> -->
<!-- <script src="js/stations/station0/Station0.js"></script> -->
<!-- ... etc ... -->

<!-- Root app (must be last) -->
<script src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add praxis/workbench/index.html
git commit -m "feat(workbench): add index.html entry point with CDN deps and script loading order"
```

---

## Task 5: State Management — context.js

**Files:**
- Create: `js/context.js`

The Redux-style reducer for the entire workbench. Every UI component reads from and dispatches to this single state tree. Design spec §14 + blueprint §8.

- [ ] **Step 1: Write `js/context.js`**

```javascript
// praxis/workbench/js/context.js
(function() {
  'use strict';
  var h = React.createElement;

  var ACTION_TYPES = {
    INIT: 'INIT',
    LOAD_FILE: 'LOAD_FILE',
    SAVE_STATION: 'SAVE_STATION',
    SET_SENSITIVITY: 'SET_SENSITIVITY',
    SET_TIER: 'SET_TIER',
    SET_ACTIVE_STATION: 'SET_ACTIVE_STATION',
    TOGGLE_DRAWER: 'TOGGLE_DRAWER',
    UPDATE_PROJECT_META: 'UPDATE_PROJECT_META',
    SET_PROJECT_LOADED: 'SET_PROJECT_LOADED',
    CLEAR_PROJECT: 'CLEAR_PROJECT',
    SHOW_TOAST: 'SHOW_TOAST',
    DISMISS_TOAST: 'DISMISS_TOAST'
  };

  var defaultUI = {
    projectLoaded: false,
    activeStation: 0,
    experienceTier: 'foundation',
    drawerOpen: false,
    toasts: []
  };

  function reducer(state, action) {
    switch (action.type) {

      case ACTION_TYPES.INIT:
        return {
          context: action.context || PraxisSchema.createEmptyContext(),
          ui: Object.assign({}, defaultUI, { projectLoaded: true, experienceTier: action.tier || 'foundation' })
        };

      case ACTION_TYPES.LOAD_FILE:
        return {
          context: action.context,
          ui: Object.assign({}, state.ui, { projectLoaded: true })
        };

      case ACTION_TYPES.SAVE_STATION:
        var newContext = PraxisUtils.deepMerge(state.context, action.payload);
        newContext.updated_at = new Date().toISOString();
        newContext.staleness = PraxisStaleness.computeStaleness(action.stationId, newContext.staleness);
        return { context: newContext, ui: state.ui };

      case ACTION_TYPES.SET_SENSITIVITY:
        var sensContext = PraxisUtils.deepMerge(state.context, {
          protection: { sensitivity: action.level }
        });
        return { context: sensContext, ui: state.ui };

      case ACTION_TYPES.SET_TIER:
        return { context: state.context, ui: Object.assign({}, state.ui, { experienceTier: action.tier }) };

      case ACTION_TYPES.SET_ACTIVE_STATION:
        return { context: state.context, ui: Object.assign({}, state.ui, { activeStation: action.station }) };

      case ACTION_TYPES.TOGGLE_DRAWER:
        return { context: state.context, ui: Object.assign({}, state.ui, { drawerOpen: !state.ui.drawerOpen }) };

      case ACTION_TYPES.UPDATE_PROJECT_META:
        var metaContext = PraxisUtils.deepMerge(state.context, { project_meta: action.meta });
        metaContext.updated_at = new Date().toISOString();
        return { context: metaContext, ui: state.ui };

      case ACTION_TYPES.SET_PROJECT_LOADED:
        return { context: state.context, ui: Object.assign({}, state.ui, { projectLoaded: action.loaded }) };

      case ACTION_TYPES.CLEAR_PROJECT:
        localStorage.removeItem('praxis-workbench');
        return {
          context: PraxisSchema.createEmptyContext(),
          ui: Object.assign({}, defaultUI)
        };

      case ACTION_TYPES.SHOW_TOAST:
        var toasts = state.ui.toasts.concat([{ id: PraxisUtils.uid('toast_'), message: action.message, type: action.toastType || 'info' }]);
        return { context: state.context, ui: Object.assign({}, state.ui, { toasts: toasts }) };

      case ACTION_TYPES.DISMISS_TOAST:
        return { context: state.context, ui: Object.assign({}, state.ui, {
          toasts: state.ui.toasts.filter(function(t) { return t.id !== action.id; })
        })};

      default:
        return state;
    }
  }

  function getInitialState() {
    try {
      var saved = localStorage.getItem('praxis-workbench');
      if (saved) {
        var context = JSON.parse(saved);
        if (context && context.schema === 'praxis-workbench') {
          return { context: context, ui: Object.assign({}, defaultUI, { projectLoaded: true }) };
        }
      }
    } catch (e) { /* corrupt localStorage, start fresh */ }
    return { context: PraxisSchema.createEmptyContext(), ui: Object.assign({}, defaultUI) };
  }

  window.PraxisContext = {
    ACTION_TYPES: ACTION_TYPES,
    reducer: reducer,
    getInitialState: getInitialState,
    defaultUI: defaultUI
  };
})();
```

- [ ] **Step 2: Commit**

```bash
git add praxis/workbench/js/context.js
git commit -m "feat(workbench): add context.js — reducer, action types, localStorage persistence"
```

---

## Task 6: Shell Components

**Files:**
- Create: `js/components/Modal.js`
- Create: `js/components/FileDropZone.js`
- Create: `js/components/ToastNotification.js`
- Create: `js/components/ProgressRing.js`
- Create: `js/components/StationHeader.js`
- Create: `js/components/StalenessWarning.js`
- Create: `js/components/SensitivityBanner.js`

All components use `React.createElement` (no JSX). Each is a pure function component receiving props.

- [ ] **Step 1: Write all 7 component files**

Each file follows this pattern:
```javascript
// js/components/ComponentName.js
(function() {
  'use strict';
  var h = React.createElement;

  function ComponentName(props) {
    // ... render logic using h()
  }

  window.ComponentName = ComponentName;
})();
```

**`Modal.js`**: Renders overlay + centered modal with header/body/footer slots. Props: `isOpen`, `onClose`, `title`, `width`, `children`.

**`FileDropZone.js`**: Drag-and-drop area + click-to-browse for `.praxis` files. Props: `onFile(jsonData)`. Uses `PraxisUtils.readFileAsJSON`.

**`ToastNotification.js`**: Renders `state.ui.toasts` as stacked messages in bottom-right. Auto-dismisses after 4 seconds via `useEffect`.

**`ProgressRing.js`**: SVG circle with progress stroke. Props: `percent`, `size` (default 24). Shows percentage text in center.

**`StationHeader.js`**: Station label (teal), title (navy), description (slate). Props: `stationId`, `context`. Renders upstream context badges from the station's `UPSTREAM_DEPS`.

**`StalenessWarning.js`**: Amber banner: "Upstream data changed since this station was last saved." Props: `stationId`, `staleness`, `onDismiss`. Only renders if `staleness[stationId]` is true.

**`SensitivityBanner.js`**: Amber or red banner below topbar based on `context.protection.sensitivity`. Only renders for non-standard sensitivity.

Write each file with complete `React.createElement` calls. Keep each file under 80 lines.

- [ ] **Step 2: Commit**

```bash
git add praxis/workbench/js/components/
git commit -m "feat(workbench): add shared components — Modal, FileDropZone, Toast, ProgressRing, StationHeader, StalenessWarning, SensitivityBanner"
```

---

## Task 7: Shell — TopBar, StationRail, ContextDrawer, Shell

**Files:**
- Create: `js/shell/TopBar.js`
- Create: `js/shell/StationRail.js`
- Create: `js/shell/ContextDrawer.js`
- Create: `js/shell/Shell.js`

- [ ] **Step 1: Write `js/shell/TopBar.js`**

44px navy bar. Left: PRAXIS logo SVG (inline) + brand text + separator + editable project title. Right: tier pill + save button. Spec §5.1.

Props: `state`, `dispatch`. Uses `ACTION_TYPES.SET_TIER`, `ACTION_TYPES.UPDATE_PROJECT_META`.

The project title is an inline-editable text field (`contentEditable` or a text input styled to look like plain text that switches to an input on click).

- [ ] **Step 2: Write `js/shell/StationRail.js`**

48px vertical rail with 9 station buttons. Each button shows: station number, active/completed/stale states per spec §3.4. Clicking dispatches `SET_ACTIVE_STATION`.

Props: `activeStation`, `context`, `dispatch`.

Render each button with conditional CSS classes: `.wb-rail-btn--active` for current, checkmark SVG for completed (check `context[stationField].completed_at`), amber dot for stale.

- [ ] **Step 3: Write `js/shell/ContextDrawer.js`**

Collapsed (44px): shows `{ }` toggle button. Expanded (320px): shows project meta summary, collapsible context sections, staleness tree, export button.

Props: `state`, `dispatch`. Toggle dispatches `TOGGLE_DRAWER`.

- [ ] **Step 4: Write `js/shell/Shell.js`**

Outer layout composition. Renders:
1. `SensitivityBanner` (if sensitive)
2. `TopBar`
3. `.wb-shell` wrapper containing:
   - `StationRail`
   - `.wb-main` > `.wb-panel` with the active station content
   - `ContextDrawer`

For now, the active station renders a placeholder empty state: "Station N: [Name] — This station will be available soon."

Props: `state`, `dispatch`.

- [ ] **Step 5: Commit**

```bash
git add praxis/workbench/js/shell/
git commit -m "feat(workbench): add shell — TopBar, StationRail, ContextDrawer, Shell layout"
```

---

## Task 8: Entry Landing + App Root

**Files:**
- Create: `js/shell/EntryLanding.js`
- Create: `js/app.js`

- [ ] **Step 1: Write `js/shell/EntryLanding.js`**

Full-page dark landing. Spec §4. Two-panel layout (left 55% / right 45%). Left: PRAXIS logo, "Evaluation Workbench" title, subtitle, station preview list (9 stations with numbers, fading opacity). Right: action cards (New, Open, Quick, Continue).

On "New Evaluation": show tier selection (3 cards from spec §4.3), then dispatch `INIT` with selected tier.
On "Open .praxis File": render `FileDropZone`, on file load dispatch `LOAD_FILE`.
On "Quick Mode": render station dropdown (0-8), dispatch `INIT` + `SET_ACTIVE_STATION`.
On "Continue": dispatch `SET_PROJECT_LOADED(true)` to resume from localStorage.

Props: `state`, `dispatch`.

- [ ] **Step 2: Write `js/app.js`**

Root React component. Mounts to `#root`.

```javascript
// praxis/workbench/js/app.js
(function() {
  'use strict';
  var h = React.createElement;

  function App() {
    var stateAndDispatch = React.useReducer(PraxisContext.reducer, null, PraxisContext.getInitialState);
    var state = stateAndDispatch[0];
    var dispatch = stateAndDispatch[1];

    // Auto-persist to localStorage (debounced 500ms)
    var persistRef = React.useRef(PraxisUtils.debounce(function(ctx) {
      try {
        var size = PraxisUtils.estimateJSONSize(ctx);
        if (size > 4 * 1024 * 1024) {
          dispatch({ type: PraxisContext.ACTION_TYPES.SHOW_TOAST, message: 'Project data is large. Consider downloading your .praxis file.', toastType: 'warning' });
        }
        localStorage.setItem('praxis-workbench', JSON.stringify(ctx));
      } catch (e) { /* quota exceeded */ }
    }, 500));

    React.useEffect(function() {
      if (state.ui.projectLoaded) {
        persistRef.current(state.context);
      }
    }, [state.context, state.ui.projectLoaded]);

    // Render entry landing or shell
    if (!state.ui.projectLoaded) {
      return h(EntryLanding, { state: state, dispatch: dispatch });
    }
    return h('div', { className: 'wb-app' },
      h(Shell, { state: state, dispatch: dispatch }),
      h(ToastNotification, { toasts: state.ui.toasts, dispatch: dispatch })
    );
  }

  // Mount
  var root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(h(App));
})();
```

- [ ] **Step 3: Verify in browser**

Open `praxis/workbench/index.html` in browser. Expected:
1. Full-page dark landing appears
2. "New Evaluation" card is clickable
3. After selecting tier and clicking New, the shell loads with topbar, rail, and empty station panel
4. Clicking station numbers in the rail switches the active station
5. The project title is editable in the top bar
6. Refresh preserves state (localStorage)

- [ ] **Step 4: Commit**

```bash
git add praxis/workbench/js/shell/EntryLanding.js praxis/workbench/js/app.js
git commit -m "feat(workbench): add EntryLanding + App root — complete Plan A shell"
```

---

## Task 9: Integration Test

- [ ] **Step 1: Manual integration test checklist**

Open `praxis/workbench/index.html` in browser and verify:

1. ☐ Landing page appears with dark background, PRAXIS branding, 9 station preview
2. ☐ "New Evaluation" → tier selection → shell loads
3. ☐ "Open .praxis File" → file picker works (test with any valid JSON)
4. ☐ "Continue" card appears only when localStorage has saved data
5. ☐ Shell: topbar shows brand, project title (editable), tier pill
6. ☐ Shell: rail shows 9 stations with numbers, active state highlights
7. ☐ Shell: clicking stations changes the panel content (empty state for now)
8. ☐ Shell: context drawer toggle works (collapsed/expanded)
9. ☐ Shell: sensitivity banner appears when setting sensitivity via console: `dispatch({type:'SET_SENSITIVITY', level:'sensitive'})`
10. ☐ Persistence: refresh page, shell reloads with saved state
11. ☐ Mobile: resize to 768px, rail becomes bottom bar
12. ☐ Save .praxis: clicking save downloads a `.praxis` JSON file

- [ ] **Step 2: Fix any issues found**

- [ ] **Step 3: Final commit for Plan A**

```bash
git add -A praxis/workbench/
git commit -m "feat(workbench): Plan A complete — foundation + shell with entry landing, navigation, persistence"
```

---

## Plan A Complete — Next Steps

Plan A produces a navigable workbench with:
- Full Hybrid Authority shell (dark rail + white panels)
- Entry landing page with 4 modes
- 9 empty station stubs
- State management with localStorage persistence
- Staleness propagation system
- Sensitivity/protection framework
- Responsive layout

**Next:** Plan B (Core Stations 0, 2, 5) builds the three priority stations on top of this foundation.
