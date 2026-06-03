# PRAXIS Workbench — UI Quality Upgrade Design Spec

**Date:** 2026-04-07
**Author:** Emmanuel Nene Odjidja + Claude
**Status:** Draft — reviewed by UI/UX, design systems, and accessibility experts
**Scope:** Visual quality elevation across all 9 stations, shell components, and landing page
**Live URL:** https://emmaodjidja-sys.github.io/praxis/workbench/

---

## 1. Problem Statement

The PRAXIS Workbench is functionally complete — all 9 stations work, data flows between them, demo data loads correctly, staleness tracking and auto-resume are operational. But the visual quality does not match the institutional ambition. Stations 6, 7, and 8 were built with heavy inline styles and hard-coded hex values. The TopBar uses mostly inline styles. Typography hierarchy is inconsistent across stations. Spacing lacks rhythm. The overall impression is "functional prototype" rather than "institutional-grade evaluation platform."

### Root causes identified in audit

| Area | Issue | Severity |
|---|---|---|
| Station 6 (Analysis Framework) | ~850 lines, almost entirely inline styles, hard-coded hex everywhere, no shared card variants | Critical |
| Station 7 (Report Builder) | ~620 lines, inline-heavy, progress bar/status dots/order controls all raw-styled | Critical |
| Station 8 (Deck Generator) | ~615 lines, slide content renderers entirely inline, duplicate CRITERION_COLORS | Critical |
| TopBar | Almost all inline styles, hard-coded `#2EC4B6` instead of `var(--teal)` | High |
| Station 5 (Instruments) | Skip logic card uses raw inline padding/background | Medium |
| Shell.js | Fallback empty state mixes inline and classes | Low |
| StationRail | SVG hard-coded fill color | Low |

### Gold standard (what works)

- **StationHeader.js** — Pure CSS classes, zero inline styles. This is the pattern.
- **Phase1Programme.js** — CSS classes throughout (`wb-form-grid`, `wb-select-card`, `wb-chip`, `wb-guidance`)
- **Phase3Assessment.js** — Uses `wb-score`, `wb-dimension`, `wb-score-band` classes correctly
- **Station2.js** — Clean orchestration, consistent class usage

---

## 2. Design Principles (Reaffirmed)

These are from the original rebuild spec and remain the governing standard:

1. **Institutional grade, not demo quality** — Every screen must look like it belongs next to Microsoft AI for Good Lab or Bloomberg Terminal
2. **The table IS the deliverable** — What exports is what's on screen
3. **Hybrid Authority** — Dark compact rail + white content panels
4. **DM Sans + JetBrains Mono** — No other fonts. Fraunces is for the PRAXIS landing page only, not the workbench.
5. **No emoji icons** — Colored dots, typed badges, clean typography only

---

## 3. Upgrade Strategy: CSS-First Consolidation

### 3.1 Approach

**Do not rewrite station logic.** The JS behavior is correct. The upgrade is purely visual:

1. **Extract** all inline styles from Stations 6, 7, 8 and TopBar into named CSS classes in `stations.css` and `components.css`
2. **Consolidate** duplicate patterns (CRITERION_COLORS appears in 3 files, summary bar cards appear in 2 files)
3. **Elevate** spacing, typography hierarchy, and visual rhythm to match the quality of Stations 0-2
4. **Polish** micro-interactions, hover states, focus rings, and transition timing

### 3.2 No new files

All CSS changes go into existing files:
- `css/tokens.css` — New design tokens only
- `css/components.css` — Shared component classes
- `css/stations.css` — Station-specific classes
- `css/layout.css` — Shell/layout changes (minimal)

### 3.3 No new dependencies

No new libraries, no build tools, no CSS preprocessors. Pure CSS custom properties and classes, same as today.

---

## 4. Design Token Additions

Add to `tokens.css`:

```css
:root {
  /* ── Surface variants (tokenize recurring greys) ── */
  --surface-raised: #F8FAFC;   /* card headers, modal headers, slide headers */
  --surface-muted: #FAFBFC;    /* panel footers, hover states, talking points */

  /* ── Spacing scale (4px base, doubling rhythm) ── */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 32px;
  --space-8: 40px;
  --space-9: 48px;

  /* ── Type scale (bumped +1px from original — legibility for long sessions) ── */
  --text-xs: 11px;
  --text-sm: 12px;
  --text-base: 13px;
  --text-md: 14px;
  --text-lg: 15px;
  --text-xl: 16px;
  --text-2xl: 20px;
  --text-3xl: 24px;

  /* ── Line heights ── */
  --leading-tight: 1.2;
  --leading-normal: 1.5;
  --leading-relaxed: 1.6;

  /* ── Transition ── */
  --ease-default: 0.15s ease;
  --ease-slow: 0.25s ease;

  /* ── Focus ring ── */
  --focus-ring: 0 0 0 2px var(--surface), 0 0 0 4px var(--teal);
  --focus-ring-dark: 0 0 0 2px var(--navy), 0 0 0 4px rgba(255,255,255,0.5);

  /* ── Depth layers ── */
  --shadow-inset: inset 0 1px 2px rgba(11,26,46,0.06);
}
```

> **Design review note:** Type scale floor raised by 1px across the board (UI/UX review: "DM Sans at 10px on a standard laptop is borderline illegible for hours-long evaluation sessions"). `--shadow-float` removed — use existing `--shadow-lg`. Surface greys tokenized per design systems review. Dark focus ring variant added per accessibility review.

---

## 5. Component Upgrades

### 5.1 Analysis Card (Station 6)

Currently: Inline-styled `div` blocks with hard-coded colors per criterion.

**New classes:**

```css
/* Analysis card — wraps one EQ's analysis plan */
.wb-analysis-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-4);
  overflow: hidden;
}
.wb-analysis-card-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border);
  background: var(--surface-raised);
}
.wb-analysis-card-body {
  padding: var(--space-5);
}
.wb-analysis-card-section {
  margin-bottom: var(--space-5);
}
.wb-analysis-card-section:last-child {
  margin-bottom: 0;
}
.wb-analysis-card-section-title {
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--slate);
  margin-bottom: var(--space-2);
}
.wb-analysis-card-section-text {
  font-size: var(--text-md);
  color: var(--text);
  line-height: var(--leading-relaxed);
}
```

**Rendering pattern:** Each EQ gets one `.wb-analysis-card`. The header shows EQ number + question text + criterion badge (using existing `.wb-criterion--*` classes). The body contains labeled sections: Method, Analytical Steps, Software, Validity Threats.

### 5.2 Summary Stats Bar (Station 6)

Currently: Inline flexbox with hard-coded padding and colors.

**New classes:**

```css
.wb-summary-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}
.wb-summary-stat {
  padding: var(--space-4);
  background: var(--bg);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  text-align: center;
}
.wb-summary-stat-value {
  font-size: var(--text-2xl);
  font-weight: 800;
  color: var(--navy);
  font-variant-numeric: tabular-nums;
  line-height: 1;
  margin-bottom: var(--space-1);
}

/* ── Shared overline class (replaces .wb-summary-stat-label and .wb-param-label) ── */
.wb-overline {
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--slate);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
```

### 5.3 Disaggregation Chips (Station 6)

Currently: Inline-styled spans.

**Reuse existing `.wb-chip`** classes from `components.css`. The current chip component already handles selected/unselected states correctly. Station 6 just needs to use the class instead of inline styles.

### 5.4 Validity Threats Panel (Station 6)

Currently: Inline amber background with custom padding.

**Reuse `.wb-guidance--signal`** which already exists in `stations.css` and provides exactly this pattern (amber background, amber border, dark amber text). Station 6 should use it directly.

### 5.5 Section Cards (Station 7)

Currently: Mix of `.wb-section-card` classes and inline overrides.

**Upgrades:**

```css
/* Progress bar (replaces inline implementation) */
.wb-progress-bar {
  height: 4px;
  background: var(--border);
  border-radius: 2px;
  overflow: hidden;
  margin: var(--space-3) 0;
}
.wb-progress-bar-fill {
  height: 100%;
  background: var(--teal);
  border-radius: 2px;
  transition: width var(--ease-slow);
}
.wb-progress-bar-fill--low { background: var(--red); }
.wb-progress-bar-fill--mid { background: var(--amber); }
.wb-progress-bar-fill--high { background: var(--green); }

/* Status indicator */
.wb-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.wb-status-dot--draft { background: var(--slate-light); }
.wb-status-dot--partial { background: var(--amber); }
.wb-status-dot--complete { background: var(--green); }

/* Reorder controls */
.wb-reorder-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--slate);
  cursor: pointer;
  font-size: var(--text-base);
  transition: all var(--ease-default);
}
.wb-reorder-btn:hover {
  border-color: var(--navy);
  color: var(--navy);
  background: var(--bg);
}
.wb-reorder-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

/* Word count guidance */
.wb-word-guide {
  font-size: var(--text-xs);
  color: var(--slate);
  font-variant-numeric: tabular-nums;
}
```

### 5.6 Slide Cards (Station 8)

Currently: Mix of `.wb-slide` class and heavy inline body content.

**Upgrades:**

```css
/* Slide talking points */
.wb-slide-talking-points {
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--border);
  background: var(--surface-muted);
}
.wb-slide-talking-point {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  font-size: var(--text-base);
  color: var(--text);
  line-height: var(--leading-normal);
  margin-bottom: var(--space-2);
}
.wb-slide-talking-point:last-child { margin-bottom: 0; }
.wb-slide-talking-point-bullet {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--teal);
  margin-top: 6px;
  flex-shrink: 0;
}

/* Toggle (shared component — used for slide include/exclude, but reusable) */
.wb-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--slate);
  cursor: pointer;
}
.wb-toggle-track {
  width: 28px;
  height: 16px;
  border-radius: 8px;
  background: var(--border);
  position: relative;
  transition: background var(--ease-default);
}
.wb-toggle-track--on { background: var(--teal); }
.wb-toggle-track--disabled { background: var(--bg); cursor: default; }
.wb-toggle-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--surface);
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform var(--ease-default);
  box-shadow: 0 1px 2px rgba(0,0,0,0.15);
}
.wb-toggle-track--on .wb-toggle-thumb {
  transform: translateX(12px);
}
```

### 5.7 TopBar Cleanup

Currently: Almost all inline styles.

**Changes:**

```css
/* TopBar additions */
.wb-topbar-logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}
.wb-topbar-brand {
  color: var(--teal);
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.1em;
}
.wb-topbar-sep {
  color: rgba(255,255,255,0.2);
  font-size: var(--text-xs);
}
.wb-topbar-title-input {
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: var(--text-md);
  font-weight: 500;
  flex: 1;
  min-width: 0;
  padding: 2px var(--space-1);
}
.wb-topbar-title-input::placeholder {
  color: rgba(255,255,255,0.3);
}
.wb-topbar-title-input:focus {
  background: rgba(255,255,255,0.04);
  border-radius: var(--radius-sm);
}
.wb-topbar-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.wb-topbar-save {
  color: rgba(255,255,255,0.7);
  font-size: var(--text-sm);
}
.wb-topbar-save:hover {
  color: rgba(255,255,255,0.95);
}
```

---

## 6. Typography Elevation

### 6.1 Consistent hierarchy across all stations

Every station MUST use this exact typographic stack:

| Element | Size | Weight | Color | Spacing |
|---|---|---|---|---|
| Station label | `--text-xs` (11px) | 800 | `--teal-dark` | 0.1em tracking, uppercase |
| Station title | `clamp(18px, 2.5vw, 24px)` | 700 | `--navy` | none |
| Station description | `--text-base` (13px) | 400 | `--slate` | 1.5 line height |
| Section heading | `--text-lg` (15px) | 600 | `--text` | none |
| Field label | `--text-sm` (12px) | 600 | `--text` | 0.01em tracking |
| Helper text | `--text-xs` (11px) | 400 | `--slate` | none |
| Data value | `--text-md` (14px) | 600 | `--text` | tabular-nums |
| Overline/category | `--text-xs` (11px) | 700 | `--slate` | 0.04em tracking, uppercase |
| Table header | `--text-xs` (11px) | 700 | `--slate` | 0.04em tracking, uppercase |
| Table cell | `--text-base` (13px) | 400 | `--text` | 1.5 line height |

> **Design review changes:**
> - **Type scale bumped +1px** across the board. Station title clamp widened to 18-24px for proper authority.
> - **Station label color changed from `--teal` to `--teal-dark`** (#1a9e92, ~4.6:1 contrast on white) — teal (#2EC4B6) on white is only ~2.8:1, failing WCAG AA. Reserve pure teal for decorative use and dark backgrounds only.
> - **Helper text color changed from `--slate-light` to `--slate`** — `--slate-light` (#94A3B8) on white is ~2.5:1, failing WCAG AA. All text carrying meaning must use `--slate` (4.6:1) or darker.

This stack already exists in the CSS — Stations 0-2 follow it. Stations 6, 7, 8 hard-code font sizes inline and drift from these values. The fix is replacing inline `fontSize` with the correct class or token.

### 6.2 Section spacing rhythm

Within station content panels, use this vertical rhythm:

- Between major sections: `var(--space-6)` (24px)
- Between subsections: `var(--space-4)` (16px)
- Between form fields: `var(--space-5)` (20px) — already set via `.wb-form-grid` gap
- Between cards in a list: `var(--space-3)` (12px)
- Padding inside cards: `var(--space-4) var(--space-6)` (16px 24px) — bumped horizontal padding for readability with dense evaluation content

---

## 7. Interaction Polish

### 7.1 Focus rings

See Section 11.3 for the complete focus-visible rule list (expanded after accessibility review).

### 7.2 Transition consistency

All hover/state transitions use `var(--ease-default)` (0.15s ease). No more mixed timing values.

### 7.3 Scrollbar styling

See Section 11.4 for the cross-browser scrollbar rules (includes Firefox fallback per accessibility review).

---

## 8. Station-by-Station Changes

### Station 0 (Evaluability & Scoping)
- **Status:** Already well-styled. Minor fixes only.
- Fix: Phase indicator bar `marginBottom: 20` inline → use `var(--space-5)` via class

### Station 1 (Theory of Change)
- **Status:** Bridge component, mostly self-contained. No changes needed.

### Station 2 (Evaluation Matrix)
- **Status:** Clean. No changes needed beyond adding focus rings to export menu items.

### Station 3 (Design Advisor)
- **Status:** Well-styled with `.wb-question-card`, `.wb-design-result` classes. No changes needed.

### Station 4 (Sample Size)
- **Status:** Bridge component. No changes needed.

### Station 5 (Instrument Builder)
- Fix: Skip logic card section — replace inline background/padding with `.wb-card` variant
- Add `.wb-card--muted` for the lighter informational card style

### Station 6 (Analysis Framework) — **Major rework**
- Replace all inline styles in `SummaryBar` with `.wb-summary-bar` / `.wb-summary-stat` classes
- Replace all inline styles in `AnalysisCard` with `.wb-analysis-card` classes
- Replace inline `DisaggChip` with existing `.wb-chip` classes
- Replace inline validity threats panel with `.wb-guidance--signal`
- Move `CRITERION_COLORS` to CSS (`.wb-criterion--*` classes already exist)
- Extract tab bar (Quantitative/Qualitative toggle) into `.wb-tab-bar` / `.wb-tab` classes
- Replace all hard-coded hex values with CSS custom properties
- Target: reduce inline styles by 90%+

### Station 7 (Report Builder) — **Major rework**
- Replace inline progress bar with `.wb-progress-bar` / `.wb-progress-bar-fill` classes
- Replace inline status dots with `.wb-status-dot` classes
- Replace bare button reorder controls with `.wb-reorder-btn` classes
- Replace inline `typeBadge` function with existing `.wb-criterion--*` badge classes
- Move `CRITERION_COLORS` inline object to CSS class references
- Replace inline `SectionCard` layout with enhanced `.wb-section-card` classes
- Add word count guidance badge using `.wb-word-guide`
- Target: reduce inline styles by 80%+

### Station 8 (Deck Generator) — **Major rework**
- Replace inline slide content renderers with `.wb-slide-fields`, `.wb-param-label`, `.wb-param-value`
- Add `.wb-slide-talking-points` / `.wb-slide-talking-point` classes
- Replace inline toggle with `.wb-toggle` classes (shared component, not slide-specific)
- Move `CRITERION_COLORS` to CSS class references (third duplicate)
- Replace inline toolbar styling with existing `.wb-toolbar` classes
- Target: reduce inline styles by 80%+

### TopBar — **Moderate rework**
- Replace all inline styles with `.wb-topbar-*` classes
- Replace `#2EC4B6` with `var(--teal)`
- Add focus state for title input
- Add placeholder styling

### Shell / StationRail — **Minor**
- Replace hard-coded SVG fill with `currentColor`
- Clean up fallback empty state inline/class mixing

---

## 9. Tab Bar Component (New Shared Component)

Station 6 has a Quantitative/Qualitative toggle. Station 7 could benefit from a similar pattern for Draft/Preview modes. Extract to a shared component:

```css
.wb-tab-bar {
  display: flex;
  border-bottom: 2px solid var(--border);
  margin-bottom: var(--space-5);
}
.wb-tab {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--slate);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all var(--ease-default);
}
.wb-tab:hover { color: var(--text); }
.wb-tab--active {
  color: var(--navy);
  border-bottom-color: var(--teal);
}
```

---

## 10. Missing States (from expert review)

These states were absent from the initial draft. All must be implemented.

### 10.1 Disabled button state

```css
.wb-btn:disabled {
  opacity: 0.4;
  cursor: default;
  pointer-events: none;
}
```

### 10.2 Input error state

```css
.wb-input--error {
  border-color: var(--red);
  background: #FEF2F2;
}
.wb-input--error:focus {
  border-color: var(--red);
  box-shadow: 0 0 0 2px var(--surface), 0 0 0 4px var(--red);
}
```

### 10.3 Excluded slide state

```css
.wb-slide--excluded {
  opacity: 0.5;
  filter: grayscale(0.3);
}
.wb-slide--excluded .wb-slide-header {
  background: var(--bg);
}
```

### 10.4 Muted card variant (Station 5 skip logic, informational panels)

```css
.wb-card--muted {
  background: var(--bg);
  border-color: var(--border);
}
```

### 10.5 Toggle component (renamed from `.wb-slide-toggle` to `.wb-toggle` for reuse)

All toggle classes use `.wb-toggle` prefix instead of `.wb-slide-toggle`:

```css
.wb-toggle { /* wrapper */ }
.wb-toggle-track { /* track */ }
.wb-toggle-track--on { background: var(--teal); }
.wb-toggle-track--disabled { background: var(--bg); cursor: default; }
.wb-toggle-thumb { /* thumb */ }
```

Add `:focus-visible` ring:

```css
.wb-toggle:focus-visible .wb-toggle-track {
  box-shadow: var(--focus-ring);
}
```

---

## 11. Accessibility Requirements

### 11.1 Contrast-safe color rules

| Context | Use | Do NOT use |
|---|---|---|
| Text on white/light backgrounds | `--teal-dark` (#1a9e92, ~4.6:1) | `--teal` (#2EC4B6, ~2.8:1) |
| Helper/secondary text | `--slate` (#64748B, ~4.6:1) | `--slate-light` (#94A3B8, ~2.5:1) |
| Teal on dark backgrounds (topbar, rail) | `--teal` (passes on navy) | N/A |
| Decorative elements (dots, fills, borders) | `--teal` or `--slate-light` OK | N/A |

**Rule: `--slate-light` and `--teal` are decorative-only on light backgrounds. Never use them for text that conveys meaning.**

### 11.2 ARIA attributes

Progress bars must include accessibility attributes:
```js
// In JS when rendering progress bars:
role: 'progressbar',
'aria-valuenow': percentage,
'aria-valuemin': 0,
'aria-valuemax': 100,
'aria-label': 'Section completion'
```

Status dots must have an accessible label on their container:
```js
// In JS when rendering status dots:
'aria-label': status + ' status'  // e.g., "complete status"
```

### 11.3 Focus rings on all interactive elements

Expand the focus-visible rule list to include new components:

```css
.wb-btn:focus-visible,
.wb-input:focus-visible,
.wb-select-card:focus-visible,
.wb-chip:focus-visible,
.wb-reorder-btn:focus-visible,
.wb-tab:focus-visible,
.wb-toggle:focus-visible .wb-toggle-track,
.wb-slide:focus-visible,
.wb-export-menu-item:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

/* Dark background variant */
.wb-topbar-title-input:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring-dark);
}
```

### 11.4 Scrollbar cross-browser

```css
/* Firefox */
.wb-panel-content {
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}
/* Webkit (Chrome, Edge, Safari) */
.wb-panel-content::-webkit-scrollbar { width: 6px; }
.wb-panel-content::-webkit-scrollbar-track { background: transparent; }
.wb-panel-content::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}
.wb-panel-content::-webkit-scrollbar-thumb:hover {
  background: var(--slate-light);
}
```

### 11.5 Color-alone information

The following elements use color to convey state. Each MUST also have a non-color indicator:

| Element | Color signal | Required supplement |
|---|---|---|
| `.wb-status-dot` | Green/amber/grey | `aria-label` on container with text status |
| `.wb-progress-bar-fill` | Red/amber/green | `aria-valuenow` + optional text percentage |
| `.wb-criterion--*` badges | Color-coded | Already include text label — OK |
| `.wb-rail-btn` stale dot | Amber dot | Already has tooltip — OK |

---

## 12. Quality Gates

### 12.1 Before declaring any station "done"

1. Zero inline `style=` attributes for layout, color, or spacing (data-driven conditional styles like progress bar width are acceptable as inline `style`)
2. All colors reference CSS custom properties, never hex literals
3. Typography follows Section 6.1 hierarchy exactly
4. All interactive elements have `:focus-visible` rings
5. All hover states use `var(--ease-default)` timing
6. No duplicate constant objects (CRITERION_COLORS, etc.)
7. All progress bars have `role="progressbar"` and `aria-valuenow/min/max`
8. All status dots have `aria-label` on container
9. No use of `--teal` or `--slate-light` for text on light backgrounds (contrast failures)
10. Existing `.wb-param-label` references migrated to `.wb-overline`

### 12.2 Cross-station consistency check

After all stations are updated, verify:
- Same section heading size/weight across all stations
- Same card padding across all stations
- Same field label treatment across all stations
- Same button hierarchy across all stations (primary = navy, secondary = outline, ghost = transparent)

---

## 13. What This Spec Does NOT Cover

1. **Tier-gating** — Content changes per tier are a separate feature
2. **French translations** — i18n is a separate effort
3. **Service worker** — Remains disabled during development
4. **New features** — No new functionality. This is purely visual.
5. **Responsive redesign** — Current responsive breakpoints are adequate. No mobile-first rework.

---

## 14. Implementation Sequence

Recommended order (dependencies flow left to right):

```
tokens.css → components.css → stations.css → TopBar → Station 6 → Station 7 → Station 8 → Station 5 → Shell cleanup → Cross-station audit
```

**Rationale:** CSS changes first (no JS breakage risk), then progressively update JS files from most-broken to least-broken. Final cross-station audit catches any remaining inconsistencies.

---

## 15. Success Criteria

When this upgrade is complete:

1. A screenshot of any station should be indistinguishable in quality from a Bloomberg Terminal or World Bank data portal
2. The CSS codebase has zero hard-coded hex values in JS files (all colors via CSS custom properties)
3. All 9 stations share the same typographic hierarchy and spacing rhythm
4. The `components.css` and `stations.css` files are the single source of truth for visual appearance
5. The workbench feels like a single cohesive application, not 9 separate prototypes stitched together
6. All text passes WCAG AA contrast (4.5:1 minimum for normal text)
7. All interactive elements have visible focus indicators
8. No information conveyed by color alone
