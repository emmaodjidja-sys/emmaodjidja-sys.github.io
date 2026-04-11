# Workbench Station UI Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade all 9 workbench station interiors from flat/generic to institutional-grade productivity UI with summary bars, section cards, refined forms/tables/scoring, and consistent visual rhythm.

**Architecture:** CSS-first approach. New design tokens and component styles in CSS, two new shared React components (SummaryBar, SectionCard), then station-by-station refactoring to use the new system. No build step — all vanilla `React.createElement`.

**Tech Stack:** React 18 (no JSX), vanilla CSS, no bundler. All files loaded via `<script>` tags in `index.html`.

**Testing:** No test framework. Each task ends with browser verification (load demo, check station visually) and a git commit.

---

## File Map

**New files:**
- `js/components/SummaryBar.js` — Station summary bar component
- `js/components/SectionCard.js` — Section card wrapper component

**Modified CSS files:**
- `css/tokens.css` — New tokens (compact input, summary bar, section card)
- `css/components.css` — Button, input, option card, checkbox, toggle upgrades
- `css/stations.css` — Table, scoring, dimension, section card layout upgrades
- `css/layout.css` — Summary bar positioning in panel

**Modified JS files (station refactors):**
- `js/stations/station0/Phase1Programme.js` — Wrap in section cards
- `js/stations/station0/Phase2ToR.js` — Wrap in section cards
- `js/stations/station0/Phase3Assessment.js` — Section cards + scoring redesign
- `js/stations/station0/PhaseReview.js` — Section card wrapper
- `js/stations/station0/Station0.js` — Add SummaryBar
- `js/stations/station2/Station2.js` — Section cards + summary bar
- `js/stations/station2/MatrixTable.js` — Table CSS class upgrades
- `js/stations/station2/MatrixInlineEditor.js` — Compact input variant
- `js/stations/station3/Station3.js` — Section cards + summary bar
- `js/stations/station4/Station4.js` — Section cards + summary bar
- `js/stations/station5/Station5.js` — Section cards + summary bar
- `js/stations/station5/InstrumentEditor.js` — Section card per instrument
- `js/stations/station6/Station6.js` — Section cards + summary bar
- `js/stations/station7/Station7.js` — Section cards + summary bar
- `js/stations/station8/Station8.js` — Section cards + summary bar
- `js/components/StationHeader.js` — Minor: remove context badges (moved to summary bar)
- `js/shell/Shell.js` — Wire SummaryBar rendering
- `index.html` — Add script tags for new components

---

### Task 1: CSS Token & Component Foundation

Add new design tokens and upgrade all base component styles (buttons, inputs, option cards, toggles, checkboxes). This is the foundation everything else builds on.

**Files:**
- Modify: `praxis/workbench/css/tokens.css`
- Modify: `praxis/workbench/css/components.css`

- [ ] **Step 1: Add new tokens to tokens.css**

Add these at the end of the `:root` block, before the closing `}`:

```css
  /* ── Summary bar ── */
  --wb-summary-bg: #1a3050;
  --wb-summary-height: 40px;

  /* ── Section card ── */
  --wb-card-header-bg: #F8FAFC;
  --wb-card-accent: var(--teal);
  --wb-card-accent-warning: var(--amber);
  --wb-card-accent-complete: var(--green);

  /* ── Input variants ── */
  --wb-input-border: #CBD5E1;
  --wb-input-focus-ring: rgba(46,196,182,0.2);
  --wb-input-compact-padding: 6px 10px;

  /* ── Typography hierarchy (spec reference) ── */
  --wb-text-primary: #334155;
  --wb-text-secondary: #64748B;
  --wb-text-heading: #0F172A;
```

- [ ] **Step 2: Upgrade button styles in components.css**

Replace the entire button section (`.wb-btn` through `.wb-btn-sm`) with:

```css
/* ── Buttons ── */
.wb-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 10px 20px; border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 600; border: none;
  transition: all 0.15s; white-space: nowrap;
  width: auto; cursor: pointer;
}
.wb-btn:disabled, .wb-btn[disabled] {
  opacity: 0.4; pointer-events: none; cursor: not-allowed;
}
.wb-btn-primary { background: var(--navy); color: white; }
.wb-btn-primary:hover { background: var(--navy-mid); }
.wb-btn-teal { background: var(--teal); color: white; }
.wb-btn-teal:hover { background: var(--teal-dark); }
.wb-btn-outline {
  background: transparent; color: var(--wb-text-primary, #334155);
  border: 1px solid var(--wb-input-border, #CBD5E1);
  font-weight: 500;
}
.wb-btn-outline:hover { background: var(--wb-card-header-bg, #F8FAFC); }
.wb-btn-ghost {
  background: transparent; color: var(--teal); font-weight: 500;
}
.wb-btn-ghost:hover { background: rgba(46,196,182,0.08); }
.wb-btn-danger {
  background: transparent; color: var(--red);
  border: 1px solid var(--red);
}
.wb-btn-danger:hover { background: var(--red); color: white; }
.wb-btn-sm { padding: 6px 14px; font-size: 12px; }
```

- [ ] **Step 3: Upgrade form input styles in components.css**

Replace the form elements section (`.wb-label` through `.wb-helper`) with:

```css
/* ── Form elements ── */
.wb-label {
  display: block; font-size: 11px; font-weight: 600;
  color: var(--wb-text-secondary, #64748B); margin-bottom: 6px;
  letter-spacing: 0.08em; text-transform: uppercase;
}
.wb-input {
  width: 100%; padding: 10px 12px; border-radius: var(--radius-sm);
  border: 1px solid var(--wb-input-border, #CBD5E1);
  font-size: 13px; font-family: var(--font-sans);
  background: var(--surface); color: var(--wb-text-primary, #334155);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.wb-input:focus {
  outline: none; border-color: var(--teal);
  box-shadow: 0 0 0 2px var(--wb-input-focus-ring, rgba(46,196,182,0.2));
}
.wb-input:disabled {
  opacity: 0.5; pointer-events: none; cursor: not-allowed;
  border-color: var(--border);
}
.wb-input::placeholder { font-style: italic; color: var(--slate-light); }
.wb-input--compact { padding: var(--wb-input-compact-padding, 6px 10px); }
.wb-textarea { resize: vertical; min-height: 60px; }
.wb-helper { font-size: 10px; color: var(--slate-light); margin-top: 4px; }

/* Custom select */
.wb-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748B' d='M2.5 4.5L6 8l3.5-3.5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
}
```

- [ ] **Step 4: Upgrade option card styles in components.css**

Replace the `.wb-option-card` section with:

```css
/* ── Option card selector ── */
.wb-option-card {
  flex: 1; padding: 10px; border-radius: var(--radius-md);
  border: 2px solid var(--wb-input-border, #CBD5E1);
  text-align: center; position: relative;
  cursor: pointer; transition: all 0.15s;
}
.wb-option-card:hover {
  border-color: var(--navy);
  transform: scale(1.01);
}
.wb-option-card--selected {
  border-color: var(--navy); background: var(--navy); color: white;
}
.wb-option-card--selected::after {
  content: ''; position: absolute; top: 6px; right: 6px;
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--teal);
}
.wb-option-card--amber.wb-option-card--selected {
  border-color: #D97706; background: #FFFBEB; color: #92400E;
}
.wb-option-card--red.wb-option-card--selected {
  border-color: var(--red); background: var(--red-light); color: #991B1B;
}
```

Also replace the `.wb-select-card` section in stations.css with the same 2px border treatment:

```css
.wb-select-card {
  flex: 1; min-width: 120px;
  padding: 10px 14px; border-radius: 5px;
  border: 2px solid var(--wb-input-border, #CBD5E1);
  background: var(--surface);
  cursor: pointer; transition: all 0.15s;
  text-align: left; position: relative;
}
.wb-select-card:hover {
  border-color: var(--navy); background: #FAFBFC;
  transform: scale(1.01);
}
.wb-select-card--active {
  border-color: var(--navy); background: var(--navy);
  color: white;
}
.wb-select-card--active::after {
  content: ''; position: absolute; top: 6px; right: 6px;
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--teal);
}
```

- [ ] **Step 5: Add custom checkbox and toggle styles to components.css**

Append after the form elements section:

```css
/* ── Custom checkbox ── */
.wb-checkbox {
  appearance: none; width: 16px; height: 16px;
  border: 1px solid var(--wb-input-border, #CBD5E1);
  border-radius: 3px; background: var(--surface);
  cursor: pointer; position: relative;
  transition: all 0.15s; flex-shrink: 0;
}
.wb-checkbox:checked {
  background: var(--teal); border-color: var(--teal);
}
.wb-checkbox:checked::after {
  content: ''; position: absolute;
  left: 4.5px; top: 1.5px; width: 5px; height: 9px;
  border: solid white; border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* ── Toggle switch ── */
.wb-toggle {
  appearance: none; width: 32px; height: 18px;
  border-radius: 9px; background: var(--wb-input-border, #CBD5E1);
  cursor: pointer; position: relative;
  transition: background 0.15s ease; flex-shrink: 0;
  border: none;
}
.wb-toggle:checked { background: var(--teal); }
.wb-toggle::after {
  content: ''; position: absolute;
  top: 2px; left: 2px; width: 14px; height: 14px;
  border-radius: 50%; background: white;
  transition: transform 0.15s ease;
}
.wb-toggle:checked::after { transform: translateX(14px); }

/* ── Teal link ── */
.wb-link {
  color: var(--teal); text-decoration: none; cursor: pointer;
  transition: color 0.15s;
}
.wb-link:hover { color: var(--teal-dark); }
```

- [ ] **Step 6: Verify in browser and commit**

Open `https://emmaodjidja-sys.github.io/praxis/workbench/` locally or via dev server. Load the demo project. Check:
- Buttons have updated padding (10px 20px) and font size (13px)
- Inputs show teal focus ring on click
- Option cards in Station 0 Phase 1 have 2px borders with no layout shift when selecting
- Selected cards show teal dot top-right

```bash
cd /c/Users/emmao/deploy-site
git add praxis/workbench/css/tokens.css praxis/workbench/css/components.css praxis/workbench/css/stations.css
git commit -m "style(workbench): upgrade CSS foundation — tokens, buttons, inputs, option cards, toggles"
```

---

### Task 2: SummaryBar Component

Create the shared SummaryBar component that renders a dark navy strip with station-specific metrics.

**Files:**
- Create: `praxis/workbench/js/components/SummaryBar.js`
- Modify: `praxis/workbench/css/stations.css` — Add summary bar styles
- Modify: `praxis/workbench/index.html` — Add script tag

- [ ] **Step 1: Add summary bar CSS to stations.css**

Add after the station header section (after `.wb-station-desc`):

```css
/* ── Summary bar ── */
.wb-summary-bar {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--wb-summary-bg, #1a3050);
  border-radius: var(--radius-md);
  padding: 0 16px; height: 40px;
  margin-bottom: 20px;
}
.wb-summary-primary {
  font-size: 14px; font-weight: 700; color: white;
  font-family: var(--font-mono); line-height: 1.15;
}
.wb-summary-label {
  font-size: 10px; font-weight: 600; color: var(--teal);
  text-transform: uppercase; letter-spacing: 0.08em;
  margin-right: 8px;
}
.wb-summary-stats {
  display: flex; align-items: center; gap: 12px;
}
.wb-summary-stat {
  display: flex; align-items: center; gap: 4px;
  padding: 3px 8px; border-radius: 4px;
  background: rgba(255,255,255,0.08);
  font-size: 11px; color: rgba(255,255,255,0.85);
  font-family: var(--font-mono); line-height: 1.15;
}
.wb-summary-stat-label {
  font-size: 9px; font-weight: 600; color: rgba(255,255,255,0.5);
  text-transform: uppercase; letter-spacing: 0.06em;
}
.wb-summary-empty {
  font-size: 11px; color: rgba(255,255,255,0.4);
  font-style: italic;
}
```

- [ ] **Step 2: Create SummaryBar.js**

```javascript
(function() {
  'use strict';
  var h = React.createElement;

  /**
   * SummaryBar — dark navy context strip per station.
   * Props:
   *   stationId: number
   *   context: object (full workbench context)
   */
  function SummaryBar(props) {
    var stationId = props.stationId;
    var ctx = props.context || {};
    var meta = ctx.project_meta || {};
    var evb = ctx.evaluability || {};
    var toc = ctx.toc || {};
    var matrix = ctx.evaluation_matrix || {};
    var design = ctx.design_recommendation || {};
    var sample = ctx.sample_parameters || {};
    var instr = ctx.instruments || {};
    var analysis = ctx.analysis_plan || {};
    var report = ctx.report_structure || {};
    var presentation = ctx.presentation || {};

    var primary = null;
    var stats = [];

    if (stationId === 0) {
      var score = evb.score;
      if (score != null) {
        primary = score + '/100';
        var dims = evb.dimensions || [];
        var overrideCount = dims.filter(function(d) { return d.adjusted_score != null; }).length;
        stats.push({ label: 'Dimensions', value: dims.length + ' scored' });
        if (overrideCount > 0) stats.push({ label: 'Overrides', value: String(overrideCount) });
      }
    } else if (stationId === 1) {
      var nodes = (toc.nodes || []);
      if (nodes.length > 0) {
        primary = nodes.length + ' nodes';
        var levels = {};
        nodes.forEach(function(n) { var l = n.level || 'other'; levels[l] = (levels[l] || 0) + 1; });
        var levelCount = Object.keys(levels).length;
        stats.push({ label: 'Levels', value: String(levelCount) });
      }
    } else if (stationId === 2) {
      var rows = matrix.rows || [];
      if (rows.length > 0) {
        primary = rows.length + ' EQs';
        var indCount = rows.reduce(function(s, r) { return s + (r.indicators || []).length; }, 0);
        var critSet = {};
        rows.forEach(function(r) { if (r.criterion) critSet[r.criterion] = true; });
        stats.push({ label: 'Criteria', value: Object.keys(critSet).length + ' mapped' });
        stats.push({ label: 'Indicators', value: String(indCount) });
      }
    } else if (stationId === 3) {
      var ranked = design.ranked_designs || [];
      if (ranked.length > 0) {
        var top = ranked[0];
        primary = top.name || top.id || 'Selected';
        if (top.score != null) stats.push({ label: 'Confidence', value: Math.round(top.score) + '%' });
        stats.push({ label: 'Alternatives', value: String(ranked.length - 1) });
      }
    } else if (stationId === 4) {
      var result = sample.result || {};
      if (result.primary) {
        primary = 'n = ' + result.primary;
        var params = sample.params || {};
        if (params.power) stats.push({ label: 'Power', value: params.power });
        if (params.effect_size) stats.push({ label: 'Effect', value: params.effect_size });
      }
    } else if (stationId === 5) {
      var items = (instr.items || []);
      if (items.length > 0) {
        primary = items.length + ' instrument' + (items.length !== 1 ? 's' : '');
        var totalQ = items.reduce(function(s, inst) { return s + (inst.questions ? inst.questions.length : 0); }, 0);
        stats.push({ label: 'Questions', value: String(totalQ) });
      }
    } else if (stationId === 6) {
      var aRows = (analysis.rows || []);
      if (aRows.length > 0) {
        primary = aRows.length + ' methods mapped';
        var coveredEqs = {};
        aRows.forEach(function(r) { if (r.eq_id) coveredEqs[r.eq_id] = true; });
        stats.push({ label: 'EQs covered', value: String(Object.keys(coveredEqs).length) });
      }
    } else if (stationId === 7) {
      var sections = (report.sections || []);
      if (sections.length > 0) {
        primary = sections.length + ' sections';
        var findings = sections.filter(function(s) { return s.type === 'finding'; }).length;
        var recs = sections.filter(function(s) { return s.sectionType === 'recommendations'; }).length;
        stats.push({ label: 'Findings', value: String(findings) });
        if (recs > 0) stats.push({ label: 'Recs', value: String(recs) });
      }
    } else if (stationId === 8) {
      var slides = (presentation.slides || []);
      if (slides.length > 0) {
        primary = slides.length + ' slides';
        var included = slides.filter(function(s) { return s.included !== false; }).length;
        stats.push({ label: 'Included', value: String(included) });
      }
    }

    // Empty state
    if (!primary) {
      return h('div', { className: 'wb-summary-bar' },
        h('span', { className: 'wb-summary-empty' }, 'Complete this station to see summary')
      );
    }

    return h('div', { className: 'wb-summary-bar' },
      h('div', { style: { display: 'flex', alignItems: 'center' } },
        h('span', { className: 'wb-summary-label' },
          (PraxisSchema.STATION_LABELS && PraxisSchema.STATION_LABELS[stationId]) || ('Station ' + stationId)),
        h('span', { className: 'wb-summary-primary' }, primary)
      ),
      stats.length > 0
        ? h('div', { className: 'wb-summary-stats' },
            stats.map(function(s, i) {
              return h('span', { key: i, className: 'wb-summary-stat' },
                h('span', { className: 'wb-summary-stat-label' }, s.label),
                ' ', s.value
              );
            })
          )
        : null
    );
  }

  window.SummaryBar = SummaryBar;
})();
```

- [ ] **Step 3: Add script tag to index.html**

Add after `StationNav.js` and before `TopBar.js`:

```html
<script src="js/components/SummaryBar.js"></script>
```

- [ ] **Step 4: Wire SummaryBar into Shell.js**

In `Shell.js`, inside the `.wb-panel` div, add the SummaryBar between StationHeader and the panel-content div. Replace:

```javascript
h(StationHeader, { stationId: activeStation, context: context }),
h(StalenessWarning, { stationId: activeStation, staleness: context.staleness, onDismiss: handleStaleDismiss }),
h('div', { className: 'wb-panel-content' }, stationContent)
```

With:

```javascript
h(StationHeader, { stationId: activeStation, context: context }),
h(StalenessWarning, { stationId: activeStation, staleness: context.staleness, onDismiss: handleStaleDismiss }),
typeof SummaryBar !== 'undefined'
  ? h('div', { style: { padding: '0 20px' } },
      h(SummaryBar, { stationId: activeStation, context: context }))
  : null,
h('div', { className: 'wb-panel-content' }, stationContent)
```

- [ ] **Step 5: Verify and commit**

Load demo. Each station should show a dark navy bar below the header. Station 0 should display the evaluability score. Stations without data should show the "Complete this station..." empty state.

```bash
git add praxis/workbench/js/components/SummaryBar.js praxis/workbench/css/stations.css praxis/workbench/js/shell/Shell.js praxis/workbench/index.html
git commit -m "feat(workbench): add SummaryBar component — dark navy context strip per station"
```

---

### Task 3: SectionCard Component

Create the shared SectionCard wrapper that groups content into distinct visual containers with headers, left accent borders, and content-type-aware padding.

**Files:**
- Create: `praxis/workbench/js/components/SectionCard.js`
- Modify: `praxis/workbench/css/stations.css` — Add section card styles
- Modify: `praxis/workbench/index.html` — Add script tag

- [ ] **Step 1: Add section card CSS to stations.css**

Replace the existing `.wb-section-card` styles (the report builder ones at line ~200) with a more general system. Keep the old class names as aliases:

```css
/* ── Section card system ── */
.wb-sec {
  background: var(--surface); border-radius: var(--radius-md);
  border: 1px solid var(--border);
  border-left: 3px solid var(--wb-card-accent, var(--teal));
  margin-bottom: 16px;
}
.wb-sec--warning { border-left-color: var(--wb-card-accent-warning, var(--amber)); }
.wb-sec--complete { border-left-color: var(--wb-card-accent-complete, var(--green)); }
.wb-sec--neutral { border-left-color: var(--border); }

.wb-sec-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 20px;
  background: var(--wb-card-header-bg, #F8FAFC);
  border-bottom: 1px solid var(--border);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}
.wb-sec-title {
  font-size: 14px; font-weight: 600; color: var(--wb-text-heading, #0F172A);
  margin: 0;
}
.wb-sec-badge {
  font-size: 11px; font-weight: 600; color: var(--wb-text-secondary, #64748B);
}
.wb-sec-chevron {
  width: 32px; height: 32px; border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  border: none; background: transparent; cursor: pointer;
  color: var(--wb-text-secondary); font-size: 12px;
  transition: all 0.15s;
}
.wb-sec-chevron:hover { background: rgba(0,0,0,0.04); }

.wb-sec-body { padding: 20px; }
.wb-sec-body--table { padding: 12px; }
.wb-sec-body--scoring { padding: 16px; }
.wb-sec-body--empty {
  padding: 32px 20px; text-align: center;
}
.wb-sec-empty-text {
  font-size: 12px; color: var(--wb-text-secondary, #64748B);
  margin-bottom: 12px;
}

/* Content max-widths (left-aligned) */
.wb-sec-body .wb-form-grid { max-width: 800px; }
.wb-sec-body .wb-prose { max-width: 640px; }
```

- [ ] **Step 2: Create SectionCard.js**

```javascript
(function() {
  'use strict';
  var h = React.createElement;

  /**
   * SectionCard — visual container for station content sections.
   * Props:
   *   title: string (required)
   *   badge: string (optional, e.g. "3 of 5")
   *   variant: 'default' | 'warning' | 'complete' | 'neutral' (default: 'default')
   *   bodyType: 'form' | 'table' | 'scoring' | 'empty' (default: 'form')
   *   collapsible: boolean (default: false)
   *   defaultCollapsed: boolean (default: false)
   *   children: React nodes
   */
  function SectionCard(props) {
    var title = props.title;
    var badge = props.badge || null;
    var variant = props.variant || 'default';
    var bodyType = props.bodyType || 'form';
    var collapsible = props.collapsible || false;
    var defaultCollapsed = props.defaultCollapsed || false;
    var children = props.children;

    var collapseState = React.useState(defaultCollapsed);
    var collapsed = collapseState[0];
    var setCollapsed = collapseState[1];

    var cardClass = 'wb-sec' +
      (variant === 'warning' ? ' wb-sec--warning' : '') +
      (variant === 'complete' ? ' wb-sec--complete' : '') +
      (variant === 'neutral' ? ' wb-sec--neutral' : '');

    var bodyClass = 'wb-sec-body' +
      (bodyType === 'table' ? ' wb-sec-body--table' : '') +
      (bodyType === 'scoring' ? ' wb-sec-body--scoring' : '') +
      (bodyType === 'empty' ? ' wb-sec-body--empty' : '');

    return h('div', { className: cardClass },
      // Header
      title ? h('div', { className: 'wb-sec-header' },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
          h('h3', { className: 'wb-sec-title' }, title),
          badge ? h('span', { className: 'wb-sec-badge' }, badge) : null
        ),
        collapsible ? h('button', {
          className: 'wb-sec-chevron',
          onClick: function() { setCollapsed(!collapsed); }
        }, collapsed ? '\u25B6' : '\u25BC') : null
      ) : null,

      // Body
      (!collapsible || !collapsed) ? h('div', { className: bodyClass }, children) : null
    );
  }

  window.SectionCard = SectionCard;
})();
```

- [ ] **Step 3: Add script tag to index.html**

Add after `SummaryBar.js`:

```html
<script src="js/components/SectionCard.js"></script>
```

- [ ] **Step 4: Verify and commit**

The component won't be visible yet (no station uses it). Verify there are no console errors when loading.

```bash
git add praxis/workbench/js/components/SectionCard.js praxis/workbench/css/stations.css praxis/workbench/index.html
git commit -m "feat(workbench): add SectionCard component — visual container with header and accent borders"
```

---

### Task 4: Table & Scoring CSS Upgrades

Upgrade the table and dimension/scoring styles to match the spec.

**Files:**
- Modify: `praxis/workbench/css/stations.css`

- [ ] **Step 1: Upgrade table styles**

Replace the `.wb-table` section (from `.wb-table` through `.wb-table tr:hover td`) with:

```css
/* ── Data tables ── */
.wb-table {
  width: 100%; border-collapse: collapse;
  font-size: 13px;
}
.wb-table th {
  text-align: left; padding: 8px 12px;
  font-size: 11px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--wb-text-secondary, #64748B);
  background: var(--wb-card-header-bg, #F8FAFC);
  border-bottom: 1px solid var(--border);
  position: sticky; top: 0; z-index: 1;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.wb-table th.wb-th--numeric { text-align: right; }
.wb-table td {
  padding: 8px 12px; border-bottom: 1px solid #F1F5F9;
  vertical-align: top; line-height: 1.5;
  min-height: 40px;
}
.wb-table td.wb-td--numeric {
  text-align: right; font-family: var(--font-mono);
  font-size: 12px; line-height: 1.15;
}
.wb-table tr:hover td { background: var(--wb-card-header-bg, #F8FAFC); transition: background 0.1s; }

/* Table container with scroll fade */
.wb-table-wrap {
  overflow-x: auto; position: relative;
}
.wb-table-wrap::after {
  content: ''; position: absolute; top: 0; right: 0; bottom: 0;
  width: 24px; pointer-events: none;
  background: linear-gradient(to right, transparent, var(--surface));
  opacity: 0; transition: opacity 0.2s;
}
.wb-table-wrap--scrollable::after { opacity: 1; }
```

- [ ] **Step 2: Upgrade dimension/scoring styles**

Replace the dimension bars section (`.wb-dimension` through `.wb-dimension-score`) with:

```css
/* ── Dimension bars ── */
.wb-dimension {
  display: flex; align-items: center; gap: 12px;
  padding: 0; height: 44px;
  border-bottom: 1px solid #F1F5F9;
}
.wb-dimension:last-child { border-bottom: none; }
.wb-dimension-label {
  width: 160px; font-size: 11px; font-weight: 600;
  color: var(--wb-text-secondary, #64748B);
  text-transform: uppercase; letter-spacing: 0.08em;
  flex-shrink: 0;
}
.wb-dimension-bar {
  flex: 1; height: 8px; background: #E2E8F0;
  border-radius: 4px; overflow: hidden;
  min-width: 120px;
}
.wb-dimension-fill {
  height: 100%; border-radius: 4px;
  transition: width 0.4s ease;
}
.wb-dimension-fill--fast { transition-duration: 0.15s; }
.wb-dimension-score {
  width: 56px; text-align: right;
  font-family: var(--font-mono);
  font-size: 14px; font-weight: 700;
  line-height: 1.15;
  font-variant-numeric: tabular-nums;
}
.wb-dimension-score--green { color: var(--green); }
.wb-dimension-score--amber { color: var(--amber); }
.wb-dimension-score--red { color: var(--red); }

/* Override badge */
.wb-override-badge {
  display: inline-block; padding: 2px 6px;
  border-radius: 3px; font-size: 11px;
  font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--amber); background: rgba(245,158,11,0.12);
  margin-left: 8px;
}

/* Original score (strikethrough) */
.wb-dimension-original {
  font-family: var(--font-mono);
  font-size: 12px; font-weight: 400;
  color: var(--wb-text-secondary, #64748B);
  text-decoration: line-through;
  margin-right: 6px;
}

/* Composite score card */
.wb-composite-card {
  background: var(--navy); border-radius: var(--radius-md);
  padding: 16px 20px; display: flex;
  align-items: center; gap: 16px;
  margin-bottom: 16px; height: 80px;
}
.wb-composite-score {
  font-family: var(--font-mono);
  font-size: 32px; font-weight: 700;
  color: white; line-height: 1.15;
}
.wb-composite-label {
  font-size: 12px; color: var(--teal);
  font-weight: 500;
}
.wb-composite-band {
  margin-left: auto;
}
```

- [ ] **Step 3: Upgrade matrix table row states**

Replace the `.wb-table tr.wb-table-row` section with:

```css
/* ── Matrix table row states ── */
.wb-table tr.wb-table-row { cursor: pointer; border-left: 3px solid transparent; transition: background 0.1s; }
.wb-table tr.wb-table-row--selected {
  border-left-color: var(--teal); background: #F0FDFA !important;
}
.wb-table tr.wb-table-row:not(.wb-table-row--selected):hover { background: var(--wb-card-header-bg, #F8FAFC); }
```

Remove the alternating row color rules (`.wb-table-row:nth-child(even/odd)`) — spec says no alternating backgrounds.

- [ ] **Step 4: Verify and commit**

Load demo, go to Station 0 Phase 3 — dimension bars should be 8px pill-shaped. Go to Station 2 — table rows should not alternate colors, selected row should have teal left border.

```bash
git add praxis/workbench/css/stations.css
git commit -m "style(workbench): upgrade table and scoring CSS — 8px pill bars, 40px rows, teal selection"
```

---

### Task 5: Station 0 — Evaluability & Scoping Refactor

Wrap Station 0's three phases and phase review in section cards. Upgrade the scoring display with the composite card and override badges.

**Files:**
- Modify: `praxis/workbench/js/stations/station0/Phase1Programme.js`
- Modify: `praxis/workbench/js/stations/station0/Phase3Assessment.js`
- Modify: `praxis/workbench/js/stations/station0/PhaseReview.js`

- [ ] **Step 1: Wrap Phase1Programme form in a SectionCard**

In `Phase1Programme.js`, replace the return statement's outer `h('div', null, ...)` wrapper. Wrap the guidance + form grid in a SectionCard, and the bottom bar stays outside:

Replace:
```javascript
    return h('div', null,
      // Guidance banner
      showGuide ? h('div', { className: 'wb-guidance' },
```

With:
```javascript
    return h('div', null,
      h(SectionCard, { title: 'Programme Details', badge: data.programme_name ? 'Editing' : 'New' },
        // Guidance banner
        showGuide ? h('div', { className: 'wb-guidance' },
```

And close the SectionCard before the bottom bar. The `h('div', { className: 'wb-panel-footer' }, ...)` at the end should be outside the SectionCard. Add a closing `)` for SectionCard before the panel-footer div.

- [ ] **Step 2: Upgrade Phase3Assessment scoring display**

In `Phase3Assessment.js`, replace the centered score display block (the `h('div', { style: { textAlign: 'center', padding: '20px 0 8px' } }, ...)`) with the composite card:

```javascript
      // Composite score card
      h('div', { className: 'wb-composite-card' },
        h('span', { className: 'wb-composite-score' }, adjustedTotal),
        h('div', null,
          h('div', { className: 'wb-composite-label' }, 'Overall Evaluability'),
          h('div', { style: { fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: 2 } }, 'out of 100')
        ),
        h('div', { className: 'wb-composite-band' },
          h('span', { className: 'wb-score-band ' + band.css }, band.label)
        )
      ),
```

- [ ] **Step 3: Upgrade dimension rows with override badges and justification textareas**

In the dimension map function inside `Phase3Assessment.js`, update each dimension row to:
1. Show the override badge next to the label when an override exists
2. Show the original score as strikethrough when overridden
3. Use threshold-colored score classes
4. Show justification textarea below the row when overridden (not just when expanded)

Replace the dimension row rendering (the `h('div', { className: 'wb-dimension', onClick: ... })` block) with:

```javascript
            h('div', {
              className: 'wb-dimension',
              onClick: function() { setExpandedDim(isExpanded ? null : dim.id); },
              style: { cursor: 'pointer' }
            },
              h('span', {
                style: { fontSize: '10px', color: 'var(--slate)', marginRight: -4,
                  transform: isExpanded ? 'rotate(90deg)' : 'none',
                  transition: 'transform 0.15s', display: 'inline-block' }
              }, '\u25B6'),
              h('span', { className: 'wb-dimension-label' },
                dim.label,
                ov && ov.adjustedScore != null
                  ? h('span', { className: 'wb-override-badge' }, 'Override')
                  : null
              ),
              h('div', { className: 'wb-dimension-bar' },
                h('div', {
                  className: 'wb-dimension-fill' + (ov ? ' wb-dimension-fill--fast' : ''),
                  style: { width: pct + '%', background: dimFillColor(pct) }
                })
              ),
              ov && ov.adjustedScore != null
                ? h('span', null,
                    h('span', { className: 'wb-dimension-original' }, dim.system_score + '/' + dim.max),
                    h('span', {
                      className: 'wb-dimension-score wb-dimension-score--' + (pct > 75 ? 'green' : pct >= 50 ? 'amber' : 'red')
                    }, displayScore + '/' + dim.max)
                  )
                : h('span', {
                    className: 'wb-dimension-score wb-dimension-score--' + (pct > 75 ? 'green' : pct >= 50 ? 'amber' : 'red')
                  }, displayScore + '/' + dim.max)
            ),
```

- [ ] **Step 4: Wrap dimension breakdown and blockers/recommendations in SectionCards**

Wrap the dimension breakdown in:
```javascript
h(SectionCard, { title: 'Dimension Scores', badge: scoringResult.dimensions.length + ' dimensions', bodyType: 'scoring' },
  /* existing dimension map code */
),
```

Wrap the blockers card in:
```javascript
h(SectionCard, { title: 'Constraints', variant: 'warning' },
  /* existing blockers content, without the outer wb-card div */
),
```

Wrap the recommendations card in:
```javascript
h(SectionCard, { title: 'Recommendations', variant: 'complete' },
  /* existing recommendations content, without the outer wb-card div */
),
```

- [ ] **Step 5: Verify and commit**

Load demo. Navigate to Station 0. Phase 1 should be wrapped in a section card. Go through to Phase 3 — check:
- Dark navy composite score card at top
- Dimension bars are 8px pill-shaped with colored scores
- Override badge appears when you adjust a score
- Strikethrough original score shows next to override
- Blockers and recommendations in their own section cards

```bash
git add praxis/workbench/js/stations/station0/Phase1Programme.js praxis/workbench/js/stations/station0/Phase3Assessment.js praxis/workbench/js/stations/station0/PhaseReview.js
git commit -m "feat(workbench): Station 0 — section cards, composite score card, override badges"
```

---

### Task 6: Station 2 — Evaluation Matrix Refactor

Wrap Station 2 content in section cards. Upgrade toolbar and table layout.

**Files:**
- Modify: `praxis/workbench/js/stations/station2/Station2.js`
- Modify: `praxis/workbench/js/stations/station2/MatrixTable.js`

- [ ] **Step 1: Wrap Station 2 generated content in SectionCards**

In `Station2.js`, after the empty state return, wrap the toolbar + table in a SectionCard:

```javascript
    return h('div', null,
      // Matrix table section card
      h(SectionCard, { title: 'Evaluation Matrix', badge: rows.length + ' EQs \u00b7 ' + indCount + ' indicators', bodyType: 'table' },
        h('div', { className: 'wb-toolbar', style: { padding: '0 0 8px', margin: 0 } },
          h('div', { className: 'wb-toolbar-spacer' }),
          h('button', { className: 'wb-btn wb-btn-sm wb-btn-primary', onClick: saveStation }, 'Save Matrix')
        ),
        h(MatrixTable, { rows: rows, selectedId: selectedId, criterionFilter: criterionFilter,
          onSelect: function(id) { setSelectedId(selectedId === id ? null : id); },
          onFilterChange: setCriterionFilter,
          onAdd: function() { setShowAddModal(true); },
          onExport: function() { setShowExport(!showExport); } })
      ),
      /* keep export menu, inline editor, modals, and station nav as-is */
```

- [ ] **Step 2: Upgrade MatrixTable for spec-compliant styling**

In `MatrixTable.js`, ensure:
- Table uses `wb-table-wrap` container for scrollable overflow
- Numeric columns use `wb-th--numeric` and `wb-td--numeric` classes
- Remove alternating row backgrounds if present

- [ ] **Step 3: Verify and commit**

Load demo. Station 2 should show the matrix inside a section card with header "Evaluation Matrix" + EQ count badge. Table should have sticky headers, no alternating row colors, teal selected row border.

```bash
git add praxis/workbench/js/stations/station2/Station2.js praxis/workbench/js/stations/station2/MatrixTable.js
git commit -m "feat(workbench): Station 2 — section card wrapper, upgraded table styling"
```

---

### Task 7: Stations 1, 3, 4 — Bridge Stations Refactor

These stations primarily bridge to iframe tools. Lighter touch — wrap content in section cards and ensure consistent styling.

**Files:**
- Modify: `praxis/workbench/js/stations/station1/Station1.js`
- Modify: `praxis/workbench/js/stations/station3/Station3.js`
- Modify: `praxis/workbench/js/stations/station4/Station4.js`

- [ ] **Step 1: Station 1 (Theory of Change)**

Station 1 has two modes: iframe bridge and inline builder. Wrap the mode selector (action cards) in a SectionCard. The canvas overlay stays outside any card.

In `Station1.js`, wrap the initial choice UI (the action cards for "Open ToC Builder" and "Build inline") in:

```javascript
h(SectionCard, { title: 'Theory of Change', badge: tocNodeCount > 0 ? tocNodeCount + ' nodes' : null },
  /* existing action cards or ToC display */
),
```

- [ ] **Step 2: Station 3 (Design Advisor)**

Station 3 has a question grid and design results. Wrap question cards in one SectionCard, results in another:

```javascript
// Questions section
h(SectionCard, { title: 'Design Parameters', badge: answeredCount + ' of ' + totalQuestions },
  /* question cards */
),

// Results section (only when visible)
hasResults ? h(SectionCard, { title: 'Recommended Designs', badge: rankedCount + ' options' },
  /* design result cards */
) : null,
```

- [ ] **Step 3: Station 4 (Sample Size)**

Station 4 bridges to the sample calculator. Wrap the pre-filled parameters display and the calculator launch in a SectionCard:

```javascript
h(SectionCard, { title: 'Sample Parameters' },
  /* parameter grid and calculator launch button */
),
```

- [ ] **Step 4: Verify and commit**

Load demo. Navigate through Stations 1, 3, 4. Each should have content in section cards with appropriate headers.

```bash
git add praxis/workbench/js/stations/station1/Station1.js praxis/workbench/js/stations/station3/Station3.js praxis/workbench/js/stations/station4/Station4.js
git commit -m "feat(workbench): Stations 1, 3, 4 — section card wrappers for bridge stations"
```

---

### Task 8: Station 5 — Instrument Builder Refactor

Station 5 has a scaffold step and per-instrument editors. Each instrument should be its own section card.

**Files:**
- Modify: `praxis/workbench/js/stations/station5/Station5.js`
- Modify: `praxis/workbench/js/stations/station5/InstrumentEditor.js`

- [ ] **Step 1: Wrap scaffold step in SectionCard**

In `Station5.js`, wrap the instrument scaffold (the initial configurator UI) in:

```javascript
h(SectionCard, { title: 'Instrument Configuration' },
  h(InstrumentScaffold, { /* existing props */ })
),
```

- [ ] **Step 2: Wrap each instrument in its own SectionCard**

When listing instruments for editing, each gets its own card:

```javascript
items.map(function(inst, i) {
  return h(SectionCard, {
    key: inst.id,
    title: inst.title || inst.name || 'Instrument ' + (i + 1),
    badge: (inst.questions ? inst.questions.length : 0) + ' questions',
    collapsible: true,
    defaultCollapsed: i > 0
  },
    h(InstrumentEditor, { instrument: inst, /* existing props */ })
  );
})
```

- [ ] **Step 3: Verify and commit**

Load demo. Station 5 should show each instrument in its own collapsible section card.

```bash
git add praxis/workbench/js/stations/station5/Station5.js praxis/workbench/js/stations/station5/InstrumentEditor.js
git commit -m "feat(workbench): Station 5 — section card per instrument, collapsible"
```

---

### Task 9: Stations 6, 7, 8 — Analysis, Report, Deck Refactor

These are the largest stations by line count but follow similar patterns. Wrap main content areas in section cards.

**Files:**
- Modify: `praxis/workbench/js/stations/station6/Station6.js`
- Modify: `praxis/workbench/js/stations/station7/Station7.js`
- Modify: `praxis/workbench/js/stations/station8/Station8.js`

- [ ] **Step 1: Station 6 (Analysis Framework)**

Station 6 has a table-based analysis plan. Read the full file first, then wrap:
- The analysis table in `h(SectionCard, { title: 'Analysis Plan', bodyType: 'table' }, ...)`
- Any method recommendation section in its own card

- [ ] **Step 2: Station 7 (Report Builder)**

Station 7 already has a `ProgressBar` and `SectionCard` components (its own internal ones). Refactor:
- Wrap the ProgressBar + header row in a `h(SectionCard, { title: 'Report Structure', badge: sections.length + ' sections' }, ...)`
- The individual section cards (the internal `SectionCard` component) can stay as-is — they're already well-styled report-specific cards. Just ensure they inherit the updated CSS.

- [ ] **Step 3: Station 8 (Deck Generator)**

Station 8 has a toolbar and slide cards. Wrap:
- Toolbar + slides in `h(SectionCard, { title: 'Presentation Deck', badge: includedCount + ' of ' + slides.length + ' slides', bodyType: 'table' }, ...)`
- Keep the print CSS behavior intact — the `s8-print-root` class must stay on the outermost div.

- [ ] **Step 4: Verify and commit**

Load demo. Navigate to Stations 6, 7, 8. Each should have main content in section cards. Verify Station 8 print still works (Ctrl+P should show slide layout).

```bash
git add praxis/workbench/js/stations/station6/Station6.js praxis/workbench/js/stations/station7/Station7.js praxis/workbench/js/stations/station8/Station8.js
git commit -m "feat(workbench): Stations 6, 7, 8 — section card wrappers for analysis, report, deck"
```

---

### Task 10: Typography & Field Label Normalization

Ensure all field labels across all stations use consistent Level 3 typography (11px, 600 weight, uppercase, 0.08em letter-spacing, slate). Fix inconsistent usage.

**Files:**
- Modify: `praxis/workbench/css/stations.css`
- Modify: `praxis/workbench/css/components.css`

- [ ] **Step 1: Normalize field label CSS**

Ensure `.wb-field-label` in stations.css matches the spec exactly:

```css
.wb-field-label {
  display: block; font-size: 11px; font-weight: 600;
  color: var(--wb-text-secondary, #64748B); margin-bottom: 5px;
  letter-spacing: 0.08em; text-transform: uppercase;
}
```

Also ensure `.wb-label` in components.css has identical values (it's the same semantic role).

- [ ] **Step 2: Normalize helper text**

Ensure `.wb-field-helper` and `.wb-helper` both resolve to:

```css
  font-size: 12px; font-weight: 400; color: var(--wb-text-secondary, #64748B);
  line-height: 1.4; margin-top: 4px;
```

(Up from 10px to 12px per spec — this is the Level 4 secondary text tier.)

- [ ] **Step 3: Normalize JetBrains Mono usage**

Add a utility class:

```css
.wb-mono {
  font-family: var(--font-mono);
  font-size: 12px; line-height: 1.15;
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 4: Verify and commit**

Scan Station 0 Phase 1, Station 2, Station 5 — all field labels should be identical style (11px uppercase slate).

```bash
git add praxis/workbench/css/stations.css praxis/workbench/css/components.css
git commit -m "style(workbench): normalize typography — Level 3 labels, helper text, mono utility"
```

---

### Task 11: Final Polish — Spacing, Responsive, Empty States

Consistency pass across all stations.

**Files:**
- Modify: `praxis/workbench/css/stations.css`
- Modify: `praxis/workbench/css/layout.css`

- [ ] **Step 1: Ensure panel-content padding is consistent**

In layout.css, the `.wb-panel-content` padding should be:

```css
.wb-panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 20px;
}
```

This is already correct. Verify no inline styles override it in station JS files.

- [ ] **Step 2: Ensure empty states use section card pattern**

All gated/empty states (e.g., "Complete Station 0 first") should use:

```javascript
h(SectionCard, { title: 'Station Name', bodyType: 'empty' },
  h('div', { className: 'wb-sec-empty-text' }, 'Complete Station X first to...'),
  h('button', { className: 'wb-btn wb-btn-teal', onClick: goToStation }, 'Go to Station X')
)
```

Check Stations 2 and 5 empty states and refactor if needed.

- [ ] **Step 3: Responsive fixes**

In stations.css, update the responsive breakpoint to handle section cards:

```css
@media (max-width: 640px) {
  .wb-sec-header { padding: 10px 14px; }
  .wb-sec-body { padding: 14px; }
  .wb-sec-body--table { padding: 8px; }
  .wb-summary-bar { flex-direction: column; height: auto; padding: 8px 12px; gap: 4px; }
  .wb-summary-stats { flex-wrap: wrap; }
}
```

- [ ] **Step 4: Full walkthrough and commit**

Load demo. Walk through all 9 stations sequentially:
1. Station 0: summary bar with score, section cards for each phase, composite card, dimension bars
2. Station 1: section card for ToC mode selection
3. Station 2: section card with matrix table, teal selection
4. Station 3: section card for questions, section card for results
5. Station 4: section card for sample parameters
6. Station 5: section card per instrument
7. Station 6: section card for analysis table
8. Station 7: section card for report structure
9. Station 8: section card for deck, print still works

Check: consistent 16px card gaps, no double borders, no broken layouts at narrow widths.

```bash
git add -A praxis/workbench/
git commit -m "polish(workbench): final spacing, responsive fixes, empty state consistency"
```

---

## Summary

| Task | What | Files | Estimated Steps |
|------|------|-------|----------------|
| 1 | CSS Foundation (tokens, buttons, inputs, option cards, toggles) | tokens.css, components.css, stations.css | 6 |
| 2 | SummaryBar component + wiring | SummaryBar.js, stations.css, Shell.js, index.html | 5 |
| 3 | SectionCard component | SectionCard.js, stations.css, index.html | 4 |
| 4 | Table & Scoring CSS | stations.css | 4 |
| 5 | Station 0 refactor | Phase1Programme.js, Phase3Assessment.js, PhaseReview.js | 5 |
| 6 | Station 2 refactor | Station2.js, MatrixTable.js | 3 |
| 7 | Stations 1, 3, 4 refactor | Station1.js, Station3.js, Station4.js | 4 |
| 8 | Station 5 refactor | Station5.js, InstrumentEditor.js | 3 |
| 9 | Stations 6, 7, 8 refactor | Station6.js, Station7.js, Station8.js | 4 |
| 10 | Typography normalization | stations.css, components.css | 4 |
| 11 | Final polish | stations.css, layout.css, various station JS | 4 |
