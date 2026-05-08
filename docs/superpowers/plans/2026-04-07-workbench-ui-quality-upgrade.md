# Workbench UI Quality Upgrade — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate the visual quality of PRAXIS Workbench from "functional prototype" to "institutional-grade evaluation platform" by extracting all inline styles into CSS classes, adding design tokens, and enforcing a consistent typographic hierarchy across all 9 stations.

**Architecture:** CSS-first consolidation. No JS logic changes — purely visual. Extract inline styles from Stations 6/7/8 and TopBar into named CSS classes in existing CSS files. Add spacing/type/surface tokens to `tokens.css`. Enforce consistent typography via the spec's hierarchy table.

**Tech Stack:** Vanilla CSS custom properties, React `createElement` (no JSX), no build tools.

---

## File Map

All changes go into existing files:

| File | Role | Change scope |
|---|---|---|
| `css/tokens.css` | Design tokens | Add ~30 new tokens (spacing, type scale, transitions, focus rings, surfaces, shadows) |
| `css/components.css` | Shared components | Add `.wb-progress-bar`, `.wb-status-dot`, `.wb-reorder-btn`, `.wb-toggle`, `.wb-overline`, `.wb-tab-bar/.wb-tab`, `.wb-topbar-*`, `.wb-word-guide`, `.wb-btn:disabled`, `.wb-input--error` |
| `css/stations.css` | Station-specific | Add `.wb-analysis-card-*`, `.wb-summary-bar/.wb-summary-stat`, `.wb-slide-talking-*`, `.wb-slide--excluded`, `.wb-card--muted`; update `.wb-station-label/title/desc` tokens; add focus rings, scrollbar styling |
| `css/layout.css` | Shell layout | Minor: scrollbar styling on `.wb-panel-content` |
| `js/shell/TopBar.js` | Top bar | Replace all inline styles with `.wb-topbar-*` classes |
| `js/shell/Shell.js` | Shell router | Remove inline styles from fallback empty state |
| `js/shell/StationRail.js` | Station rail | Remove inline styles, use `currentColor` for SVG |
| `js/stations/station6/Station6.js` | Analysis Framework | Replace ~23 inline style objects with CSS classes |
| `js/stations/station7/Station7.js` | Report Builder | Replace inline styles, remove `CRITERION_COLORS`, use CSS classes |
| `js/stations/station8/Station8.js` | Deck Generator | Replace inline styles, remove `CRITERION_COLORS`, use CSS classes |
| `js/stations/station5/Station5.js` | Instrument Builder | Replace skip logic card inline styles with `.wb-card--muted` |

**Base path for all files:** `C:\Users\emmao\deploy-site\praxis\workbench\`

---

## Task 1: Add Design Tokens to `tokens.css`

**Files:**
- Modify: `css/tokens.css:1-78`

- [ ] **Step 1: Add new tokens after existing `:root` content**

Add these tokens inside the existing `:root` block, before the closing `}` on line 78. Insert after line 77 (`--shadow-xl`) and before the closing `}`:

```css
  /* ── Surface variants ── */
  --surface-raised: #F8FAFC;
  --surface-muted: #FAFBFC;

  /* ── Spacing scale (4px base) ── */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 32px;
  --space-8: 40px;
  --space-9: 48px;

  /* ── Type scale (+1px floor for legibility) ── */
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

  /* ── Transitions ── */
  --ease-default: 0.15s ease;
  --ease-slow: 0.25s ease;

  /* ── Focus rings ── */
  --focus-ring: 0 0 0 2px var(--surface), 0 0 0 4px var(--teal);
  --focus-ring-dark: 0 0 0 2px var(--navy), 0 0 0 4px rgba(255,255,255,0.5);

  /* ── Depth ── */
  --shadow-inset: inset 0 1px 2px rgba(11,26,46,0.06);
```

- [ ] **Step 2: Verify tokens.css loads correctly**

Open `https://emmaodjidja-sys.github.io/praxis/workbench/` locally or run a quick check that the file parses (no syntax errors). Visually confirm the workbench still renders — token additions should not change anything visually yet.

- [ ] **Step 3: Commit**

```bash
git add praxis/workbench/css/tokens.css
git commit -m "feat(workbench): add spacing, type scale, surface, and focus ring tokens"
```

---

## Task 2: Add Shared Component Classes to `components.css`

**Files:**
- Modify: `css/components.css:1-201` (append after line 201)

- [ ] **Step 1: Add shared component classes**

Append the following after the last line of `components.css` (after the `.wb-phase` rules):

```css
/* ── Overline (shared uppercase label pattern) ── */
.wb-overline {
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--slate);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* ── Progress bar ── */
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

/* ── Status dot ── */
.wb-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.wb-status-dot--draft { background: var(--slate-light); }
.wb-status-dot--partial { background: var(--amber); }
.wb-status-dot--complete { background: var(--green); }

/* ── Reorder controls ── */
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

/* ── Toggle ── */
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

/* ── Tab bar ── */
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
  background: none;
  border-top: none;
  border-left: none;
  border-right: none;
}
.wb-tab:hover { color: var(--text); }
.wb-tab--active {
  color: var(--navy);
  border-bottom-color: var(--teal);
}

/* ── Word count guide ── */
.wb-word-guide {
  font-size: var(--text-xs);
  color: var(--slate);
  font-variant-numeric: tabular-nums;
}

/* ── TopBar components ── */
.wb-topbar-logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1;
  min-width: 0;
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

/* ── Button disabled state ── */
.wb-btn:disabled {
  opacity: 0.4;
  cursor: default;
  pointer-events: none;
}

/* ── Input error state ── */
.wb-input--error {
  border-color: var(--red);
  background: #FEF2F2;
}
.wb-input--error:focus {
  border-color: var(--red);
  box-shadow: 0 0 0 2px var(--surface), 0 0 0 4px var(--red);
}

/* ── Focus rings on interactive elements ── */
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
.wb-topbar-title-input:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring-dark);
}
```

- [ ] **Step 2: Verify no visual regressions**

Reload the workbench. The new classes aren't used yet, so nothing should change. Confirm no CSS parse errors in the browser console.

- [ ] **Step 3: Commit**

```bash
git add praxis/workbench/css/components.css
git commit -m "feat(workbench): add shared component classes — progress bar, toggle, tab bar, topbar, focus rings"
```

---

## Task 3: Add Station-Specific Classes to `stations.css`

**Files:**
- Modify: `css/stations.css:1-578`

- [ ] **Step 1: Update station header tokens (lines 7-19)**

Replace the existing `.wb-station-label`, `.wb-station-title`, `.wb-station-desc` rules with tokenized versions:

```css
/* ── Station header ─────────────────────────────────────── */
.wb-station-label {
  font-size: var(--text-xs); font-weight: 800; color: var(--teal-dark);
  letter-spacing: 0.1em; text-transform: uppercase;
  margin-bottom: 2px;
}
.wb-station-title {
  font-size: clamp(18px, 2.5vw, 24px); font-weight: 700; color: var(--navy);
  line-height: var(--leading-tight); margin-bottom: 2px;
}
.wb-station-desc {
  font-size: var(--text-base); color: var(--slate); margin-bottom: var(--space-3);
  line-height: var(--leading-normal); max-width: 600px;
}
```

Key changes:
- `.wb-station-label`: `10px` -> `var(--text-xs)` (11px), `var(--teal)` -> `var(--teal-dark)` (contrast fix)
- `.wb-station-title`: `clamp(16px, 2vw, 20px)` -> `clamp(18px, 2.5vw, 24px)` (wider authority)
- `.wb-station-desc`: `12px` -> `var(--text-base)` (13px), `12px` margin -> `var(--space-3)`

- [ ] **Step 2: Add analysis card classes (append before responsive section)**

Insert before the `@media (max-width: 640px)` block (line 572):

```css
/* ── Analysis card (Station 6) ─────────────────────────── */
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
  padding: var(--space-4) var(--space-6);
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

/* ── Summary stats bar (Station 6) ─────────────────────── */
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

/* ── Slide talking points (Station 8) ──────────────────── */
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

/* ── Excluded slide state (Station 8) ──────────────────── */
.wb-slide--excluded {
  opacity: 0.5;
  filter: grayscale(0.3);
}
.wb-slide--excluded .wb-slide-header {
  background: var(--bg);
}

/* ── Muted card variant ────────────────────────────────── */
.wb-card--muted {
  background: var(--bg);
  border-color: var(--border);
}

/* ── Scrollbar styling ─────────────────────────────────── */
.wb-panel-content {
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}
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

- [ ] **Step 3: Verify no visual regressions**

Reload, confirm all existing station styling is intact. The header tokens (station-label, title, desc) will show subtle changes: slightly larger text, teal-dark instead of teal for labels.

- [ ] **Step 4: Commit**

```bash
git add praxis/workbench/css/stations.css
git commit -m "feat(workbench): add analysis card, summary bar, slide, scrollbar CSS classes; fix station header contrast"
```

---

## Task 4: Upgrade TopBar — Replace Inline Styles

**Files:**
- Modify: `js/shell/TopBar.js:1-67`

- [ ] **Step 1: Replace TopBar render with class-based version**

Replace the entire `return` statement (lines 35-62) with:

```js
    return h('div', { className: 'wb-topbar' },
      h('div', { className: 'wb-topbar-logo' },
        logo,
        h('span', { className: 'wb-topbar-brand' }, 'PRAXIS'),
        h('span', { className: 'wb-topbar-sep' }, '\u00B7'),
        h('input', {
          ref: titleRef,
          type: 'text',
          className: 'wb-topbar-title-input',
          value: title,
          placeholder: 'Untitled evaluation',
          onChange: function(e) { setTitle(e.target.value); },
          onBlur: handleBlur
        })
      ),
      h('div', { className: 'wb-topbar-actions' },
        h(ExperienceTierBadge, { tier: state.ui.experienceTier, dispatch: dispatch }),
        h('button', {
          className: 'wb-btn wb-btn-ghost wb-btn-sm wb-topbar-save',
          onClick: handleSave
        }, 'Save')
      )
    );
```

- [ ] **Step 2: Replace hard-coded SVG color**

On line 31, change `stroke: '#2EC4B6'` to `stroke: 'currentColor'` (both instances). The SVG is inside `.wb-topbar-logo` which inherits `--teal` color from the parent.

Actually — the SVG needs explicit teal. Change both `stroke: '#2EC4B6'` to `stroke: 'var(--teal)'`:

```js
    var logo = h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none' },
      h('circle', { cx: 12, cy: 12, r: 10, stroke: 'var(--teal)', strokeWidth: 2 }),
      h('path', { d: 'M8 12l3 3 5-5', stroke: 'var(--teal)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' })
    );
```

Note: inline SVG `stroke` via React props uses the style attribute under the hood, so `var(--teal)` works here. If it doesn't render correctly, use `style: { stroke: 'var(--teal)' }` instead. Test both approaches.

- [ ] **Step 3: Verify TopBar renders correctly**

Reload. Confirm:
- PRAXIS brand text is teal, uppercase, spaced
- Title input is editable, shows placeholder when empty
- Save button shows on hover
- Focus ring appears on the title input when tabbed to

- [ ] **Step 4: Commit**

```bash
git add praxis/workbench/js/shell/TopBar.js
git commit -m "refactor(workbench): replace TopBar inline styles with CSS classes"
```

---

## Task 5: Clean Up Shell.js and StationRail.js

**Files:**
- Modify: `js/shell/Shell.js:55-62`
- Modify: `js/shell/StationRail.js:58-77`

- [ ] **Step 1: Remove Shell.js fallback inline styles**

Replace lines 55-62 (the `else` fallback block):

```js
      stationContent = h('div', { className: 'wb-station-empty' },
        h('h3', { className: 'wb-station-empty-title' },
          'Station ' + activeStation + ': ' + stationName
        ),
        h('p', { className: 'wb-station-empty-desc' },
          'This station will be available soon.'
        )
      );
```

This removes the inline `style: { textAlign: 'center', padding: '64px 24px' }` on the container, the inline `style: { fontSize: '16px', fontWeight: 600, color: '#1F2937', marginBottom: 8 }` on the h3, and the inline `style: { fontSize: '13px', color: '#6B7280' }` on the p. The existing `.wb-station-empty`, `.wb-station-empty-title`, and `.wb-station-empty-desc` CSS classes already provide all this styling.

- [ ] **Step 2: Remove StationRail.js inline styles**

Replace line 58 (the button's style prop):
```js
            style: { position: 'relative' },
```
The `.wb-rail-btn` class already has `position: relative`. Remove this style prop entirely:
```js
            // No style prop needed — .wb-rail-btn has position: relative
```

Replace line 61 (station number span):
```js
            h('span', { style: { fontSize: '10px', fontWeight: 700 } }, String(id)),
```
with (the rail-btn already styles its children via font inheritance, but we need the explicit small text):
```js
            h('span', null, String(id)),
```

Actually — `.wb-rail-btn` sets `font-size: 10px; font-weight: 600` on itself, but the span overrides to `fontWeight: 700`. Since the spec says station numbers should be weight 700, update the `.wb-rail-btn` in `components.css` from `font-weight: 600` to `font-weight: 700` (line 138), then remove the inline style from StationRail:

In `css/components.css`, change line 138:
```css
  font-size: 10px; font-weight: 700; color: #475569;
```

Then in StationRail.js line 61:
```js
            h('span', null, String(id)),
```

Same change for the help button on line 77:
```js
    }, h('span', null, '?'));
```

And line 75, remove the inline style:
```js
      style: { marginTop: 'auto' },
```
Keep `marginTop: 'auto'` — this pushes the help button to the bottom of the rail. This is layout behavior that belongs in CSS. Add to `components.css`:
```css
.wb-rail-btn--help { margin-top: auto; }
```
Then in StationRail.js line 69-77:
```js
    var helpBtn = h('button', {
      key: 'help',
      className: 'wb-rail-btn wb-rail-btn--help',
      onClick: function() {
        if (props.onHelpToggle) props.onHelpToggle();
      },
      title: 'Help'
    }, h('span', null, '?'));
```

- [ ] **Step 3: Verify Shell and StationRail render correctly**

Reload. Confirm:
- Station numbers visible in rail, help button at bottom
- Fallback empty state shows proper text styling
- Active/completed/stale indicators still work

- [ ] **Step 4: Commit**

```bash
git add praxis/workbench/js/shell/Shell.js praxis/workbench/js/shell/StationRail.js praxis/workbench/css/components.css
git commit -m "refactor(workbench): remove inline styles from Shell and StationRail"
```

---

## Task 6: Upgrade Station 6 — Analysis Framework

**Files:**
- Modify: `js/stations/station6/Station6.js:273-852`

This is the largest single task. Station 6 has ~23 inline style objects. We replace them with CSS classes from Tasks 1-3.

- [ ] **Step 1: Replace DisaggChip inline styles (lines 275-285)**

Replace:
```js
  function DisaggChip(props) {
    var active = props.active;
    var label = props.label;
    var onToggle = props.onToggle;
    return h('button', {
      type: 'button',
      className: 'wb-chip' + (active ? ' wb-chip--selected' : ''),
      onClick: onToggle
    }, label);
  }
```

This switches from `wb-btn wb-btn-xs` with inline overrides to the existing `.wb-chip` / `.wb-chip--selected` classes, which already handle selected/unselected states.

- [ ] **Step 2: Replace AnalysisCard inline styles (lines 289-473)**

Replace the entire `AnalysisCard` function. Key changes:
- Container: `className: 'wb-card'` with `style: { marginBottom: '12px' }` -> `className: 'wb-analysis-card'` (no style)
- Header bar: inline toolbar -> `className: 'wb-analysis-card-header'`
- EQ number: remove inline `style: { fontSize: '14px', fontWeight: 700, color: 'var(--navy)'... }`
- Type badge (QUANT/QUAL): inline styles with hard-coded colors -> use `wb-criterion` class pattern
- Question text: remove inline style, use `className: 'wb-analysis-card-section-text'`
- Two-column grid: inline `style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }` -> `className: 'wb-form-grid'` (already provides 1fr 1fr grid)
- Field labels: already use `wb-field-label` class. Remove redundant inline `style: { marginBottom: '10px' }` by using `wb-analysis-card-section`
- Indicator list items: inline badge styles -> use CSS criterion pattern
- Analytical steps display: inline background/border -> add `className: 'wb-card--muted'` with a small padding class
- Validity threats: inline amber panel -> use `wb-guidance--signal` classes
- All `marginBottom: '10px'` wrappers -> `className: 'wb-analysis-card-section'`

Here is the full replacement for lines 289-473:

```js
  function AnalysisCard(props) {
    var card = props.card;
    var index = props.index;
    var onUpdate = props.onUpdate;

    var _threatsOpen = useState(false);
    var threatsOpen = _threatsOpen[0];
    var setThreatsOpen = _threatsOpen[1];

    var toggleDisagg = useCallback(function (disaggId) {
      var current = card.disaggregations || [];
      var next = current.indexOf(disaggId) >= 0
        ? current.filter(function (d) { return d !== disaggId; })
        : current.concat([disaggId]);
      onUpdate(index, 'disaggregations', next);
    }, [card.disaggregations, index, onUpdate]);

    var eqLabel = (typeof card.eqNumber === 'string' && card.eqNumber.indexOf('eq_') === 0)
      ? card.eqNumber.replace('eq_', '')
      : card.eqNumber;

    var typeBadgeCls = card.analysisType === 'quantitative'
      ? 'wb-criterion wb-criterion--relevance'
      : 'wb-criterion wb-criterion--impact';
    var typeLabel = card.analysisType === 'quantitative' ? 'QUANT' : 'QUAL';

    return h('div', { className: 'wb-analysis-card' },
      // Header
      h('div', { className: 'wb-analysis-card-header' },
        h('span', { style: { fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--navy)' } },
          'EQ ' + eqLabel),
        h('span', {
          className: 'wb-criterion wb-criterion--' + (card.criterion || 'effectiveness')
        }, (card.criterion || '').charAt(0).toUpperCase() + (card.criterion || '').slice(1)),
        h('span', { className: 'wb-toolbar-spacer' }),
        h('span', { className: typeBadgeCls }, typeLabel)
      ),

      // Body
      h('div', { className: 'wb-analysis-card-body' },
        // Question text
        h('p', { className: 'wb-analysis-card-section-text', style: { marginBottom: 'var(--space-4)' } },
          card.question),

        // Two-column detail grid
        h('div', { className: 'wb-form-grid' },

          // Left column
          h('div', null,
            // Indicators
            h('div', { className: 'wb-analysis-card-section' },
              h('label', { className: 'wb-analysis-card-section-title' }, 'Linked Indicators'),
              (card.indicators && card.indicators.length > 0)
                ? h('ul', { style: { margin: '4px 0 0 0', paddingLeft: 'var(--space-4)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)', color: 'var(--text)' } },
                    card.indicators.map(function (ind, j) {
                      return h('li', { key: j },
                        h('span', { style: { fontWeight: 500 } }, ind.code ? '[' + ind.code + '] ' : ''),
                        ind.name,
                        h('span', {
                          className: 'wb-criterion wb-criterion--' + (ind.indType === 'quantitative' ? 'relevance' : 'impact'),
                          style: { marginLeft: 'var(--space-2)', fontSize: '9px' }
                        }, ind.indType === 'quantitative' ? 'NUM' : 'QUAL')
                      );
                    })
                  )
                : h('span', { className: 'wb-td--meta' }, 'No indicators linked')
            ),

            // Data Sources
            h('div', { className: 'wb-analysis-card-section' },
              h('label', { className: 'wb-analysis-card-section-title' }, 'Data Sources'),
              (card.dataSources && card.dataSources.length > 0)
                ? h('ul', { style: { margin: '4px 0 0 0', paddingLeft: 'var(--space-4)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)', color: 'var(--text)' } },
                    card.dataSources.map(function (ds, j) {
                      return h('li', { key: j }, ds);
                    })
                  )
                : h('span', { className: 'wb-td--meta' }, 'No data sources specified')
            )
          ),

          // Right column
          h('div', null,
            // Method
            h('div', { className: 'wb-analysis-card-section' },
              h('label', { className: 'wb-analysis-card-section-title' }, 'Suggested Method'),
              h('textarea', {
                className: 'wb-input wb-textarea',
                rows: 2,
                value: card.method,
                onChange: function (e) { onUpdate(index, 'method', e.target.value); }
              })
            ),

            // Analytical steps
            card.steps ? h('div', { className: 'wb-analysis-card-section' },
              h('label', { className: 'wb-analysis-card-section-title' }, 'Analytical Steps'),
              h('div', { className: 'wb-card wb-card--muted', style: { padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-xs)', lineHeight: 'var(--leading-relaxed)' } },
                card.steps)
            ) : null,

            // Validity threats (collapsible)
            card.threats ? h('div', { className: 'wb-analysis-card-section' },
              h('button', {
                type: 'button',
                className: 'wb-analysis-card-section-title',
                onClick: function () { setThreatsOpen(!threatsOpen); },
                style: {
                  display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                  width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                  color: 'var(--amber-dark)'
                }
              },
                h('span', { style: { transition: 'transform var(--ease-default)', transform: threatsOpen ? 'rotate(90deg)' : 'rotate(0deg)', display: 'inline-block' } }, '\u25B6'),
                'Validity Threats (' + card.threats.split('\n').length + ')'
              ),
              threatsOpen ? h('div', { className: 'wb-guidance--signal' },
                card.threats.split('\n').map(function (threat, ti) {
                  return h('div', { key: ti, className: 'wb-guidance--signal-text' },
                    '\u26A0 ' + threat
                  );
                })
              ) : null
            ) : null,

            // Software & tools
            h('div', { className: 'wb-analysis-card-section' },
              h('label', { className: 'wb-analysis-card-section-title' }, 'Software & Tools'),
              h('textarea', {
                className: 'wb-input wb-textarea',
                rows: 2,
                value: card.software,
                onChange: function (e) { onUpdate(index, 'software', e.target.value); },
                style: { fontSize: 'var(--text-xs)' }
              })
            ),

            // Disaggregation chips
            h('div', { className: 'wb-analysis-card-section' },
              h('label', { className: 'wb-analysis-card-section-title' }, 'Disaggregation Dimensions'),
              h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginTop: 'var(--space-1)' } },
                DEFAULT_DISAGGREGATIONS.map(function (dim) {
                  var active = (card.disaggregations || []).indexOf(dim.id) >= 0;
                  return h(DisaggChip, {
                    key: dim.id,
                    label: dim.label,
                    active: active,
                    onToggle: function () { toggleDisagg(dim.id); }
                  });
                })
              )
            ),

            // Notes
            h('div', { className: 'wb-analysis-card-section' },
              h('label', { className: 'wb-analysis-card-section-title' }, 'Notes'),
              h('input', {
                className: 'wb-input',
                value: card.notes,
                placeholder: 'Analysis notes...',
                onChange: function (e) { onUpdate(index, 'notes', e.target.value); }
              })
            )
          )
        )
      )
    );
  }
```

- [ ] **Step 3: Replace SummaryBar inline styles (lines 478-511)**

Replace:
```js
  function SummaryBar(props) {
    var cards = props.cards;
    var quantCount = 0;
    var qualCount = 0;
    var allDisaggs = {};

    cards.forEach(function (c) {
      if (c.analysisType === 'quantitative') quantCount++;
      else qualCount++;
      (c.disaggregations || []).forEach(function (d) { allDisaggs[d] = true; });
    });

    var disaggCount = Object.keys(allDisaggs).length;

    return h('div', { className: 'wb-summary-bar' },
      h('div', { className: 'wb-summary-stat' },
        h('div', { className: 'wb-summary-stat-value' }, String(cards.length)),
        h('div', { className: 'wb-overline' }, 'Evaluation Questions')
      ),
      h('div', { className: 'wb-summary-stat' },
        h('div', { className: 'wb-summary-stat-value' }, String(quantCount)),
        h('div', { className: 'wb-overline' }, 'Quantitative')
      ),
      h('div', { className: 'wb-summary-stat' },
        h('div', { className: 'wb-summary-stat-value' }, String(qualCount)),
        h('div', { className: 'wb-overline' }, 'Qualitative')
      ),
      h('div', { className: 'wb-summary-stat' },
        h('div', { className: 'wb-summary-stat-value' }, String(disaggCount)),
        h('div', { className: 'wb-overline' }, 'Disaggregation Dims')
      )
    );
  }
```

- [ ] **Step 4: Replace TabButton inline styles (lines 606-621)**

Replace:
```js
  function TabButton(props) {
    var active = props.active;
    var label = props.label;
    var count = props.count;
    var onClick = props.onClick;

    return h('button', {
      type: 'button',
      className: 'wb-tab' + (active ? ' wb-tab--active' : ''),
      onClick: onClick
    },
      label + ' (' + count + ')'
    );
  }
```

- [ ] **Step 5: Replace tab bar rendering in Station6 (lines 787-801)**

Replace the tab buttons wrapper:
```js
              // Tab buttons
              h('div', { className: 'wb-tab-bar' },
                h(TabButton, {
                  active: activeTab === 'quantitative',
                  label: 'Quantitative',
                  count: quantCards.length,
                  onClick: function () { setActiveTab('quantitative'); }
                }),
                h(TabButton, {
                  active: activeTab === 'qualitative',
                  label: 'Qualitative',
                  count: qualCards.length,
                  onClick: function () { setActiveTab('qualitative'); }
                })
              ),
```

- [ ] **Step 6: Replace panel heading inline styles (lines 805-813)**

Replace:
```js
              // Panel heading
              h('div', { className: 'wb-overline', style: { marginBottom: 'var(--space-3)', color: activeTab === 'quantitative' ? '#1E40AF' : '#9D174D' } },
                activeTab === 'quantitative'
                  ? 'Quantitative Analysis Methods \u2014 statistical and numerical approaches'
                  : 'Qualitative Analysis Methods \u2014 interpretive and thematic approaches'),
```

- [ ] **Step 7: Replace "no cards" empty state (lines 825-831)**

Replace:
```js
                : h('div', { className: 'wb-station-empty', style: { padding: 'var(--space-7)' } },
                    h('p', { className: 'wb-station-empty-desc' },
                      'No ' + activeTab + ' evaluation questions in this analysis plan.'))
```

- [ ] **Step 8: Replace design context banner inline styles (lines 742-751)**

Replace:
```js
      selectedDesign ? h('div', { className: 'wb-guidance wb-guidance--neutral' },
        h('span', { className: 'wb-guidance-text' },
          h('strong', null, 'Evaluation design: '),
          selectedDesign.toUpperCase(),
          ' \u2014 analysis method suggestions are tailored to this design.'
        )
      ) : null,
```

Remove inline `style: { padding: '10px 16px', marginBottom: '16px', borderRadius: '6px', border: '1px solid var(--border)' }` — the `.wb-guidance` class already provides padding, margin, border-radius, and border.

- [ ] **Step 9: Verify Station 6 renders correctly**

Reload. Navigate to Station 6. Confirm:
- Summary bar shows grid of stat cards (not inline flex)
- Tab bar has bottom border with active indicator
- Analysis cards have proper header/body separation
- Disaggregation chips use the standard chip style
- Validity threats panel uses amber guidance styling
- No hard-coded hex colors visible in DOM inspector

- [ ] **Step 10: Commit**

```bash
git add praxis/workbench/js/stations/station6/Station6.js
git commit -m "refactor(workbench): replace Station 6 inline styles with CSS classes"
```

---

## Task 7: Upgrade Station 7 — Report Builder

**Files:**
- Modify: `js/stations/station7/Station7.js:1-619`

- [ ] **Step 1: Remove CRITERION_COLORS constant (lines 22-29)**

Delete the `CRITERION_COLORS` object. Station 7 uses it only for the `SectionCard` border-left color — we'll replace that with the CSS `.wb-criterion--*` pattern instead.

- [ ] **Step 2: Replace ProgressBar inline styles (lines 273-295)**

Replace:
```js
  function ProgressBar(props) {
    var sections = props.sections;
    var withContent = sections.filter(function (s) { return s.draftContent && s.draftContent.trim().length > 0; }).length;
    var total = sections.length;
    var pct = total > 0 ? Math.round((withContent / total) * 100) : 0;
    var isComplete = withContent === total;

    return h('div', { className: 'wb-card', style: { padding: 'var(--space-3) var(--space-4)', marginBottom: 'var(--space-3)' } },
      h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' } },
        h('span', { style: { fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text)' } },
          'Report completeness'),
        h('span', { style: { fontSize: 'var(--text-xs)', fontWeight: 700, color: isComplete ? 'var(--green-dark)' : 'var(--slate)' } },
          withContent + ' of ' + total + ' sections have draft content')
      ),
      h('div', {
        className: 'wb-progress-bar',
        role: 'progressbar',
        'aria-valuenow': pct,
        'aria-valuemin': 0,
        'aria-valuemax': 100,
        'aria-label': 'Report completion'
      },
        h('div', {
          className: 'wb-progress-bar-fill' + (isComplete ? ' wb-progress-bar-fill--high' : ''),
          style: { width: pct + '%' }
        })
      )
    );
  }
```

- [ ] **Step 3: Replace typeBadge inline styles (lines 299-326)**

Replace:
```js
  function typeBadge(sectionType) {
    var labels = {
      executive_summary: 'Standard',
      introduction: 'Standard',
      methodology: 'Standard',
      finding: 'Finding',
      conclusions: 'Standard',
      recommendations: 'Standard',
      annexes: 'Annex'
    };
    var clsMap = {
      standard: '',
      finding: ' wb-criterion--relevance',
      annex: ' wb-criterion--coherence'
    };
    var type = sectionType === 'finding' ? 'finding' : (sectionType === 'annexes' ? 'annex' : 'standard');
    var label = labels[sectionType] || 'Standard';

    return h('span', {
      className: 'wb-criterion' + (clsMap[type] || '')
    }, label);
  }
```

This replaces the inline color/background/padding with the existing `.wb-criterion` base class plus appropriate modifier. Finding -> blue (relevance colors), Annex -> purple (coherence colors), Standard -> plain criterion base.

- [ ] **Step 4: Replace SectionCard inline styles (lines 330-472)**

This is the big one. Replace the entire `SectionCard` function. Key changes:
- Container: Remove inline `style` with display/flex/gap/padding/background/border/borderLeft/borderRadius/transition. The existing `.wb-section-card` class handles most of this. For criterion-colored left border, add a dynamic class.
- Order controls: Replace bare buttons with `.wb-reorder-btn`
- Status dot: Replace inline dot with `.wb-status-dot`
- Auto-content label: Replace inline overline styles with `.wb-overline`
- Draft label: Replace inline overline with `.wb-overline`
- Action buttons: Replace inline button styles with `.wb-btn wb-btn-ghost wb-btn-sm`

```js
  function SectionCard(props) {
    var sec = props.section;
    var index = props.index;
    var total = props.total;
    var isEditing = props.isEditing;
    var onEdit = props.onEdit;
    var onDone = props.onDone;
    var onUpdate = props.onUpdate;
    var onRemove = props.onRemove;
    var onMove = props.onMove;

    var wg = WORD_GUIDANCE[sec.sectionType] || {};
    var hasDraft = sec.draftContent && sec.draftContent.trim().length > 0;

    var cardCls = 'wb-section-card'
      + (isEditing ? ' wb-section-card--editing' : '')
      + (sec.type === 'finding' ? ' wb-section-card--finding' : '');

    return h('div', { className: cardCls, key: sec.id },
      // Order controls
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', flexShrink: 0, alignItems: 'center' } },
        h('button', {
          className: 'wb-reorder-btn',
          onClick: function () { onMove(sec.id, -1); },
          disabled: index === 0, title: 'Move up'
        }, '\u25B2'),
        h('span', { className: 'wb-overline' }, String(index + 1)),
        h('button', {
          className: 'wb-reorder-btn',
          onClick: function () { onMove(sec.id, 1); },
          disabled: index === total - 1, title: 'Move down'
        }, '\u25BC'),
        // Status dot
        h('div', {
          className: 'wb-status-dot' + (hasDraft ? ' wb-status-dot--complete' : ' wb-status-dot--draft'),
          role: 'status',
          'aria-label': hasDraft ? 'complete status' : 'draft status',
          title: hasDraft ? 'Has draft content' : 'No draft content yet',
          style: { marginTop: 'var(--space-1)' }
        })
      ),

      // Main content area
      h('div', { style: { flex: 1, minWidth: 0 } },
        // Header: badges + title
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', flexWrap: 'wrap' } },
          typeBadge(sec.sectionType),
          sec.criterion ? h('span', { className: 'wb-criterion wb-criterion--' + sec.criterion }, sec.criterion) : null,
          wg.label ? h('span', { className: 'wb-word-guide' }, wg.label) : null
        ),

        // Title
        isEditing
          ? h('input', {
              className: 'wb-input',
              style: { fontWeight: 600, fontSize: 'var(--text-base)', marginBottom: 'var(--space-2)' },
              value: sec.title,
              onChange: function (e) { onUpdate(sec.id, 'title', e.target.value); },
              autoFocus: true
            })
          : h('div', {
              style: { fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text)', marginBottom: 'var(--space-2)', cursor: 'pointer' },
              onClick: onEdit
            }, sec.title),

        // Auto-populated content preview (read-only)
        sec.autoContent
          ? h('div', {
              className: 'wb-card wb-card--muted',
              style: {
                padding: 'var(--space-3)',
                marginBottom: 'var(--space-2)',
                fontSize: 'var(--text-xs)', color: 'var(--slate)', lineHeight: 'var(--leading-relaxed)',
                whiteSpace: 'pre-line', maxHeight: isEditing ? 'none' : 120,
                overflow: isEditing ? 'visible' : 'hidden',
                position: 'relative'
              }
            },
              h('div', { className: 'wb-overline', style: { marginBottom: 'var(--space-1)' } }, 'Auto-populated from upstream data'),
              sec.autoContent,
              !isEditing ? h('div', { style: {
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 24,
                background: 'linear-gradient(transparent, var(--bg))'
              } }) : null
            )
          : null,

        // Editable draft content area
        isEditing
          ? h('div', { style: { marginTop: 'var(--space-1)' } },
              h('label', { className: 'wb-overline', style: { display: 'block', marginBottom: 'var(--space-1)' } }, 'Draft content / notes'),
              h('textarea', {
                className: 'wb-input wb-textarea',
                style: { minHeight: 80, fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)' },
                value: sec.draftContent || '',
                onChange: function (e) { onUpdate(sec.id, 'draftContent', e.target.value); },
                placeholder: 'Write your draft content for this section here\u2026'
              })
            )
          : hasDraft
            ? h('div', { style: { fontSize: 'var(--text-xs)', color: 'var(--text)', lineHeight: 'var(--leading-normal)', marginTop: 'var(--space-1)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-2)' } },
                h('span', { className: 'wb-overline', style: { marginRight: 'var(--space-2)' } }, 'Draft'),
                sec.draftContent.length > 200 ? sec.draftContent.substring(0, 200) + '\u2026' : sec.draftContent
              )
            : null,

        // Linked EQs for findings
        sec.type === 'finding' && sec.eqNumber
          ? h('div', { style: { marginTop: 'var(--space-2)', display: 'flex', gap: 'var(--space-1)', alignItems: 'center' } },
              h('span', { className: 'wb-overline' }, 'Linked:'),
              h('span', { className: 'wb-criterion wb-criterion--' + (sec.criterion || 'relevance') },
                'EQ' + sec.eqNumber)
            )
          : null
      ),

      // Actions column
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', flexShrink: 0 } },
        isEditing
          ? h('button', {
              className: 'wb-btn wb-btn-ghost wb-btn-sm',
              style: { color: 'var(--teal)' },
              onClick: onDone
            }, 'Done')
          : h('button', {
              className: 'wb-btn wb-btn-ghost wb-btn-sm',
              onClick: onEdit, title: 'Edit'
            }, '\u270E'),
        h('button', {
          className: 'wb-btn wb-btn-ghost wb-btn-sm wb-btn-danger',
          onClick: function () { onRemove(sec.id); }, title: 'Remove section'
        }, '\u2715')
      )
    );
  }
```

- [ ] **Step 5: Replace header row inline styles in Station7 (lines 577-588)**

Replace:
```js
      h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)', flexWrap: 'wrap', gap: 'var(--space-2)' } },
        h('div', null,
          h('span', { style: { fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text)' } },
            sections.length + ' sections'),
          h('span', { style: { fontSize: 'var(--text-xs)', color: 'var(--slate)', marginLeft: 'var(--space-2)' } },
            standardCount + ' standard \u00B7 ' + findingsCount + ' findings \u00B7 ' + annexCount + ' annex')
        ),
        h('div', { className: 'wb-toolbar' },
          h('button', { className: 'wb-btn wb-btn-sm', onClick: addSection }, '+ Add Section'),
          h('button', { className: 'wb-btn wb-btn-sm', onClick: handleGenerate }, 'Regenerate'),
          h('button', { className: 'wb-btn wb-btn-primary wb-btn-sm', onClick: handleExport }, 'Export Outline')
        )
      ),
```

- [ ] **Step 6: Verify Station 7 renders correctly**

Reload. Navigate to Station 7. Confirm:
- Progress bar renders with proper styling and accessibility attributes
- Section cards have proper reorder buttons (not bare text)
- Status dots show green (complete) or grey (draft)
- Type badges use criterion CSS classes
- Word count guide shows as italic slate text
- Finding sections still have colored left borders
- All action buttons are styled properly

- [ ] **Step 7: Commit**

```bash
git add praxis/workbench/js/stations/station7/Station7.js
git commit -m "refactor(workbench): replace Station 7 inline styles with CSS classes, remove CRITERION_COLORS"
```

---

## Task 8: Upgrade Station 8 — Deck Generator

**Files:**
- Modify: `js/stations/station8/Station8.js:1-615`

- [ ] **Step 1: Remove CRITERION_COLORS and dimensionColor (lines 45-58)**

Delete the `CRITERION_COLORS` object (lines 51-58). Station 8 uses it only for EQ criterion badges — which already use the CSS class pattern `wb-criterion wb-criterion--{criterion}` (see line 212). The CRITERION_COLORS object is never actually used for inline background/color in Station 8 (unlike Station 7). Verify by searching: `CRITERION_COLORS[` appears only in the `rows.map` at line 209 where `cc` is used to conditionally render a criterion badge. Replace that with the CSS class.

Keep `dimensionColor` — it's used for the dimension bar fills and the value is set via inline `style: { background: dimensionColor(pct) }` which is a valid data-driven inline style (percentage determines color). The spec allows this: "data-driven conditional styles like progress bar width are acceptable as inline style."

- [ ] **Step 2: Replace slide card inline styles in Station8 render (lines 530-598)**

Replace the slide rendering. Key changes:
- `excluded ? { opacity: 0.45 } : {}` -> use `.wb-slide--excluded` class
- Slide header controls: inline button styles -> `.wb-reorder-btn` or existing `.wb-btn` with `.wb-btn-sm`
- Talking points label: inline overline -> `.wb-overline`
- Talking points textarea: inline border/padding/font -> `.wb-input wb-textarea`

Replace lines 530-598:
```js
      h('div', { style: { display: 'grid', gap: 'var(--space-3)' } },
        slides.map(function (slide, si) {
          var excluded = !slide.included;
          return h('div', {
            key: slide.id,
            className: 'wb-slide s8-slide-card' + (excluded ? ' wb-slide--excluded s8-excluded-slide-screen' : '')
          },
            // Header (screen)
            h('div', { className: 'wb-slide-header s8-no-print' },
              h('div', { style: { display: 'flex', alignItems: 'center', gap: 'var(--space-2)' } },
                h('span', { className: 'wb-slide-num' }, 'Slide ' + (si + 1)),
                h('span', { className: 'wb-slide-title' }, slide.title)
              ),
              h('div', { style: { display: 'flex', alignItems: 'center', gap: 'var(--space-1)' } },
                h('button', {
                  className: 'wb-reorder-btn',
                  onClick: function () { handleMoveUp(si); },
                  disabled: si === 0,
                  title: 'Move up'
                }, '\u25B2'),
                h('button', {
                  className: 'wb-reorder-btn',
                  onClick: function () { handleMoveDown(si); },
                  disabled: si === slides.length - 1,
                  title: 'Move down'
                }, '\u25BC'),
                h('button', {
                  className: 'wb-btn wb-btn-sm' + (slide.included ? ' wb-btn--active' : ''),
                  style: { marginLeft: 'var(--space-1)' },
                  onClick: function () { handleToggleInclude(si); },
                  title: slide.included ? 'Exclude from export' : 'Include in export'
                }, slide.included ? 'Included' : 'Excluded')
              )
            ),

            // Header (print — navy bar)
            h('div', { className: 's8-slide-header-print', style: { display: 'none' } },
              h('span', { className: 's8-slide-num-print' }, String(si + 1)),
              h('span', { className: 's8-slide-title-print' }, slide.title)
            ),

            // Body
            h('div', { className: 'wb-slide-body s8-slide-body-print' },
              slide.content()
            ),

            // Talking points (editable)
            h('div', { className: 'wb-slide-talking-points s8-no-print' },
              h('label', { className: 'wb-overline', style: { display: 'block', marginBottom: 'var(--space-1)' } }, 'Talking Points'),
              h('textarea', {
                className: 'wb-input wb-textarea',
                value: slide.talkingPoints,
                onChange: function (e) { handleTalkingPointsChange(si, e.target.value); },
                placeholder: 'Add presenter notes for this slide\u2026',
                rows: 2
              })
            ),

            // Talking points (print — only if content exists)
            slide.talkingPoints
              ? h('div', { className: 's8-talking-points', style: { display: 'none' } }, slide.talkingPoints)
              : null
          );
        })
      ),
```

- [ ] **Step 3: Replace EQ list criterion badge rendering (around line 209-214)**

Replace inline CRITERION_COLORS lookup with CSS class:
```js
              return h('div', { key: eq.id || i, style: { display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-normal)' } },
                h('span', { style: { fontWeight: 700, color: 'var(--slate)', flexShrink: 0, minWidth: 22 } }, num + '.'),
                eq.criterion ? h('span', { className: 'wb-criterion wb-criterion--' + eq.criterion, style: { flexShrink: 0, marginTop: 1 } }, eq.criterion.substring(0, 5).toUpperCase()) : null,
                h('span', { style: { color: 'var(--text)' } }, eq.question || '')
              );
```

This is already using the CSS class (`wb-criterion wb-criterion--` + eq.criterion) on line 212 of the original. The `CRITERION_COLORS` lookup at line 209 (`var cc = eq.criterion ? CRITERION_COLORS[eq.criterion] : null;`) is computed but never actually used for inline styling — only for the conditional render. So just remove the `cc` variable and the conditional check on `cc`:

```js
                eq.criterion ? h('span', { className: 'wb-criterion wb-criterion--' + eq.criterion, style: { flexShrink: 0, marginTop: 1 } }, eq.criterion.substring(0, 5).toUpperCase()) : null,
```

- [ ] **Step 4: Replace remaining inline typography in slide content functions**

In the slide builder functions (lines 110-413), replace hard-coded font sizes and colors with CSS tokens. These are data-driven content renders, so some inline styles are acceptable (the spec says data-driven conditionals are fine). Focus on:
- `fontSize: 22` -> `fontSize: 'var(--text-3xl)'` (title slide, line 117)
- `fontSize: 14` -> `fontSize: 'var(--text-md)'` (subtitle, line 118)
- `fontSize: 12` -> `fontSize: 'var(--text-sm)'` (list items, various)
- `fontSize: 11` -> `fontSize: 'var(--text-xs)'` (italic hints)
- `color: 'var(--slate)'` is already correct
- `fontStyle: 'italic'` is fine

- [ ] **Step 5: Replace toolbar inline styles (lines 520-527, 602-607)**

Replace:
```js
      // Toolbar
      h('div', { className: 'wb-toolbar s8-no-print' },
        h('span', { style: { fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)' } }, includedCount + ' of ' + slides.length + ' slides included'),
        h('div', { className: 'wb-toolbar-spacer' }),
        h('button', { className: 'wb-btn wb-btn-sm', onClick: handleRegenerate }, '\u21BB Regenerate'),
        h('div', { className: 'wb-toolbar-divider' }),
        h('button', { className: 'wb-btn wb-btn-sm', onClick: handlePrint }, '\u2399 Download PDF'),
        h('button', { className: 'wb-btn wb-btn-primary wb-btn-sm', onClick: handleOpenDeckTool }, 'Open Deck Tool \u2197')
      ),
```

And the bottom toolbar:
```js
      h('div', { className: 'wb-toolbar s8-no-print', style: { marginTop: 'var(--space-4)' } },
        h('button', { className: 'wb-btn wb-btn-teal', onClick: handleSave }, 'Save'),
        h('div', { className: 'wb-toolbar-spacer' }),
        h('p', { style: { margin: 0, fontSize: 'var(--text-xs)', color: 'var(--slate)' } },
          'Data is passed to the Deck Tool via sessionStorage \u2014 nothing leaves your browser.')
      ),
```

- [ ] **Step 6: Verify Station 8 renders correctly**

Reload. Navigate to Station 8. Confirm:
- Slide cards have proper header/body structure
- Reorder buttons use the standard button style
- Included/Excluded toggle works and shows proper active state
- Excluded slides are dimmed with `.wb-slide--excluded`
- Talking points area uses standard input styling
- Print CSS still works (test with Ctrl+P)
- Toolbar buttons are consistently styled

- [ ] **Step 7: Commit**

```bash
git add praxis/workbench/js/stations/station8/Station8.js
git commit -m "refactor(workbench): replace Station 8 inline styles with CSS classes, remove CRITERION_COLORS"
```

---

## Task 9: Upgrade Station 5 Skip Logic Card

**Files:**
- Modify: `js/stations/station5/Station5.js:137-154`

- [ ] **Step 1: Replace skip logic card inline styles**

Replace lines 137-154:
```js
    var skipLogic = h('div', { className: 'wb-card wb-card--muted', style: { marginBottom: 'var(--space-4)' } },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' } },
        h('span', { className: 'wb-field-label', style: { margin: 0 } }, 'Skip Logic & Branching'),
        h('span', { className: 'wb-badge', style: { background: 'var(--bg)', color: 'var(--slate)' } }, 'Handled in KoboToolbox')),
      h('div', { className: 'wb-form-grid', style: { marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' } },
        h('div', { style: { background: 'var(--green-light)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)' } },
          h('strong', { style: { color: '#065F46', fontSize: 'var(--text-xs)' } }, 'What this builder does'),
          h('ul', { style: { margin: '6px 0 0', paddingLeft: 'var(--space-4)', color: 'var(--text)' } },
            h('li', null, 'Structures evaluation questions into survey items'),
            h('li', null, 'Maps indicators to data collection instruments'),
            h('li', null, 'Exports XLSForm-ready question banks'))),
        h('div', { style: { background: 'var(--blue-light)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)' } },
          h('strong', { style: { color: '#1E40AF', fontSize: 'var(--text-xs)' } }, 'Configure in KoboToolbox'),
          h('ul', { style: { margin: '6px 0 0', paddingLeft: 'var(--space-4)', color: 'var(--text)' } },
            h('li', null, 'Skip logic (relevant column)'),
            h('li', null, 'Validation constraints'),
            h('li', null, 'Cascading selects')))),
      h('p', { className: 'wb-field-helper' }, 'The exported XLSForm includes empty relevant and constraint columns, ready for skip logic configuration in KoboToolbox.'));
```

Key changes: `marginBottom: 16` -> `var(--space-4)`, `padding: 12` -> `var(--space-3)`, `fontSize: 12` -> `var(--text-sm)`, `fontSize: 11` -> `var(--text-xs)`. Added `wb-card--muted` class.

- [ ] **Step 2: Verify Station 5 renders correctly**

Reload. Navigate to Station 5. Confirm skip logic card renders with proper muted background.

- [ ] **Step 3: Commit**

```bash
git add praxis/workbench/js/stations/station5/Station5.js
git commit -m "refactor(workbench): replace Station 5 skip logic card inline styles with CSS tokens"
```

---

## Task 10: Cross-Station Quality Audit

**Files:**
- Read all modified files for consistency check

- [ ] **Step 1: Audit station header consistency**

Open each station in the browser and verify:
- Station label: 11px, weight 800, `--teal-dark` color, uppercase
- Station title: 18-24px clamp, weight 700, `--navy` color
- Station description: 13px, `--slate` color

If any station shows the old 10px/16-20px/12px sizes, the `stations.css` update from Task 3 will fix it globally.

- [ ] **Step 2: Audit card padding consistency**

Open DevTools and inspect `.wb-card`, `.wb-analysis-card`, `.wb-section-card` across stations. Verify:
- Standard card padding: 16px 24px (--space-4 --space-6) for dense evaluation content
- Horizontal padding bumped from 16px to 24px per design review

If `.wb-card` currently has `padding: 14px 16px` (it does — components.css line 77), update to:
```css
.wb-card {
  background: var(--surface); border-radius: var(--radius-md);
  border: 1px solid var(--border); padding: var(--space-4) var(--space-6);
  transition: all var(--ease-default);
}
```

- [ ] **Step 3: Audit button hierarchy**

Verify across all stations:
- Primary actions: `.wb-btn-primary` (navy background)
- Secondary actions: `.wb-btn` or `.wb-btn-outline` (border only)
- Accent actions: `.wb-btn-teal` (teal background)
- Ghost actions: `.wb-btn-ghost` (transparent)
- Danger actions: `.wb-btn-danger` (red)

- [ ] **Step 4: Audit focus rings**

Tab through interactive elements in each station. Verify:
- Buttons, inputs, chips, tabs, toggles all show focus ring
- TopBar title input shows dark focus ring variant
- No focus ring on non-interactive elements

- [ ] **Step 5: Audit contrast compliance**

Check with DevTools:
- No `--teal` (#2EC4B6) used as text color on light backgrounds
- No `--slate-light` (#94A3B8) used as text color on light backgrounds
- All text uses `--teal-dark`, `--slate`, or darker

- [ ] **Step 6: Audit ARIA attributes**

Check Station 7's progress bar:
- Has `role="progressbar"`, `aria-valuenow`, `aria-valuemin=0`, `aria-valuemax=100`
- Has `aria-label="Report completion"`

Check Station 7's status dots:
- Have `role="status"` and `aria-label` with text status

- [ ] **Step 7: Audit no remaining hard-coded hex in JS**

Search all modified JS files for hex patterns like `#F8FAFC`, `#DBEAFE`, `#2EC4B6`, `#475569`, `#E2E8F0`. Remaining hex in JS should only be:
- SVG fill/stroke attributes (acceptable)
- Export/print HTML generation (acceptable — not rendered in the workbench UI)
- `dimensionColor()` in Station 8 (acceptable — data-driven)

If any hex values are found in UI rendering code, replace with `var(--token)`.

- [ ] **Step 8: Fix any issues found**

Address any inconsistencies or remaining inline styles found in steps 1-7.

- [ ] **Step 9: Final commit**

```bash
git add -A praxis/workbench/
git commit -m "fix(workbench): cross-station audit — fix card padding, contrast, remaining inline styles"
```

---

## Quality Gates Checklist (from spec Section 12)

Before declaring the upgrade complete, verify ALL of these:

- [ ] Zero inline `style=` for layout/color/spacing in UI code (data-driven width/background OK)
- [ ] All colors reference CSS custom properties, never hex literals in UI code
- [ ] Typography follows spec Section 6.1 hierarchy exactly
- [ ] All interactive elements have `:focus-visible` rings
- [ ] All hover states use `var(--ease-default)` timing
- [ ] No duplicate CRITERION_COLORS objects (removed from Station 7 and 8)
- [ ] All progress bars have `role="progressbar"` + `aria-valuenow/min/max`
- [ ] All status dots have `aria-label` on container
- [ ] No `--teal` or `--slate-light` for text on light backgrounds
- [ ] `.wb-param-label` migrated to `.wb-overline` pattern where appropriate
