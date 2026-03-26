# PRAXIS Workbench Phase 1: Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the foundation layer of the PRAXIS Workbench: schema, utilities, CSS design system, shell skeleton, and .praxis file save/load. At the end of this phase, an evaluator can open the workbench, see a working entry modal, navigate between empty station panels, and save/load .praxis project files.

**Architecture:** Single `index.html` loads React 18 + ReactDOM via unpkg CDN. All application code is vanilla JS using `React.createElement` (no JSX, no Babel, no build step). A `useReducer` at the App level owns the shared `.praxis` context object. CSS uses custom properties with a `wb-` prefix to avoid conflicts with existing tool styles.

**Tech Stack:** React 18 via CDN, vanilla JS, CSS custom properties, no build step, GitHub Pages deployment.

**References:**
- Architecture blueprint: `docs/workbench-architecture-blueprint.md`
- Spec: `docs/praxis-website-redesign-spec.md` (Section on 360/Workbench)
- Full spec: The user's 50-page architecture spec (provided in conversation)

---

## File Structure

Files to create in `praxis/workbench/`:

| File | Responsibility |
|---|---|
| `js/schema.js` | `.praxis` empty context factory, station field map, station labels, version constant |
| `js/utils.js` | uid(), debounce(), deepMerge(), downloadJSON(), readFileAsJSON() |
| `js/staleness.js` | UPSTREAM_DEPS map, computeStaleness() function |
| `js/protection.js` | Sensitivity level utilities: isSensitive(), getAiPermission(), getSharingGuidance() |
| `js/i18n.js` | Translation loader with t(key) function |
| `js/router.js` | Hash-based station router |
| `js/context.js` | Reducer, ACTION_TYPES, localStorage auto-persist |
| `js/app.js` | Root App component, useReducer, mounts Shell or EntryModal |
| `js/shell/Shell.js` | Outer layout: TopBar + StationRail + ActivePanel |
| `js/shell/TopBar.js` | Project title, file ops, tier selector, sensitivity badge |
| `js/shell/StationRail.js` | Left nav with 9 station buttons, staleness/completion indicators |
| `js/shell/EntryModal.js` | First-launch: New Project / Open .praxis / Continue |
| `js/components/SensitivityBanner.js` | Amber/red banner for sensitive evaluations |
| `js/components/Modal.js` | Generic modal wrapper |
| `js/components/FileDropZone.js` | Drag-and-drop .praxis file import |
| `css/tokens.css` | All CSS custom properties |
| `css/layout.css` | Shell layout: topbar, rail, panel, responsive |
| `css/components.css` | Buttons, badges, modals, forms |
| `css/sensitivity.css` | Sensitivity-specific styles |
| `lang/en.json` | All English UI strings |
| `index.html` | Entry point, loads CDN + all CSS/JS |
| `test/schema.test.html` | Browser-based schema validation tests |

---

### Task 1: Create directory structure and index.html skeleton

**Files:**
- Create: `praxis/workbench/index.html`
- Create: `praxis/workbench/css/tokens.css`
- Create: `praxis/workbench/css/layout.css`
- Create: `praxis/workbench/css/components.css`
- Create: `praxis/workbench/css/sensitivity.css`

- [ ] **Step 1: Create the directory structure**

```bash
mkdir -p praxis/workbench/css praxis/workbench/js/shell praxis/workbench/js/stations praxis/workbench/js/components praxis/workbench/lang praxis/workbench/data praxis/workbench/test
```

- [ ] **Step 2: Create index.html**

The entry point. Loads React 18 from CDN, all CSS files, and all JS files in dependency order. Contains a single `<div id="root">`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PRAXIS Workbench</title>
  <meta name="description" content="PRAXIS Workbench: intelligent evaluation design workspace. Build complete evaluation packages with full traceability from Theory of Change through to findings.">
  <link rel="icon" type="image/svg+xml" href="../logo.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/layout.css">
  <link rel="stylesheet" href="css/components.css">
  <link rel="stylesheet" href="css/sensitivity.css">
</head>
<body>
  <div id="root"></div>

  <!-- React 18 via CDN -->
  <script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>

  <!-- PRAXIS Workbench: load in dependency order -->
  <script src="js/schema.js"></script>
  <script src="js/utils.js"></script>
  <script src="js/staleness.js"></script>
  <script src="js/protection.js"></script>
  <script src="js/i18n.js"></script>
  <script src="js/router.js"></script>
  <script src="js/context.js"></script>

  <!-- Components -->
  <script src="js/components/Modal.js"></script>
  <script src="js/components/FileDropZone.js"></script>
  <script src="js/components/SensitivityBanner.js"></script>

  <!-- Shell -->
  <script src="js/shell/TopBar.js"></script>
  <script src="js/shell/StationRail.js"></script>
  <script src="js/shell/EntryModal.js"></script>
  <script src="js/shell/Shell.js"></script>

  <!-- App (must be last) -->
  <script src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 3: Create tokens.css**

All CSS custom properties. Uses the existing PRAXIS tool palette (navy, teal) plus workbench-specific tokens.

```css
:root {
  /* Base palette (matches existing PRAXIS tools) */
  --wb-navy: #0B1A2E;
  --wb-navy-light: #122240;
  --wb-navy-lighter: #1a3055;
  --wb-teal: #2EC4B6;
  --wb-teal-dark: #1a9e92;
  --wb-teal-dim: rgba(46,196,182,0.10);
  --wb-warm: #c4704b;
  --wb-warm-dim: rgba(196,112,75,0.10);
  --wb-bg: #F1F5F9;
  --wb-surface: #FFFFFF;
  --wb-border: #E2E8F0;
  --wb-text: #0F172A;
  --wb-text-secondary: #475569;
  --wb-text-muted: #94A3B8;
  --wb-slate: #64748B;

  /* Workbench layout */
  --wb-topbar-height: 48px;
  --wb-rail-width: 64px;
  --wb-drawer-width: 320px;

  /* Station phase colors */
  --wb-phase-pre: #8B5CF6;
  --wb-phase-inception: #3B82F6;
  --wb-phase-collect: #F59E0B;
  --wb-phase-analysis: #10B981;

  /* Tier colors */
  --wb-tier-foundation: #10B981;
  --wb-tier-practitioner: #3B82F6;
  --wb-tier-advanced: #8B5CF6;

  /* Staleness */
  --wb-stale: #F59E0B;
  --wb-stale-dim: rgba(245,158,11,0.10);
  --wb-complete: #10B981;

  /* Sensitivity */
  --wb-sens-standard: var(--wb-teal);
  --wb-sens-sensitive: #F59E0B;
  --wb-sens-sensitive-bg: #FEF3C7;
  --wb-sens-highly: #EF4444;
  --wb-sens-highly-bg: #FEE2E2;

  /* Typography */
  --wb-font: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  --wb-font-mono: 'JetBrains Mono', monospace;
  --wb-font-size: 14px;
  --wb-line-height: 1.6;

  /* Spacing */
  --wb-space-xs: 4px;
  --wb-space-sm: 8px;
  --wb-space-md: 16px;
  --wb-space-lg: 24px;
  --wb-space-xl: 32px;
  --wb-space-2xl: 48px;

  /* Radius */
  --wb-radius: 6px;
  --wb-radius-sm: 4px;
}
```

- [ ] **Step 4: Create layout.css**

Shell layout: topbar, station rail, main panel area, responsive breakpoints.

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: var(--wb-font);
  font-size: var(--wb-font-size);
  line-height: var(--wb-line-height);
  color: var(--wb-text);
  background: var(--wb-bg);
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
  height: 100vh;
}

.wb-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.wb-shell {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.wb-rail {
  width: var(--wb-rail-width);
  background: var(--wb-navy);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow-y: auto;
}

.wb-main {
  flex: 1;
  overflow-y: auto;
  background: var(--wb-bg);
}

.wb-panel {
  max-width: 960px;
  margin: 0 auto;
  padding: var(--wb-space-xl);
}

.wb-topbar {
  height: var(--wb-topbar-height);
  background: var(--wb-navy);
  display: flex;
  align-items: center;
  padding: 0 var(--wb-space-md);
  gap: var(--wb-space-md);
  color: #fff;
  flex-shrink: 0;
}

.wb-topbar-brand {
  display: flex;
  align-items: center;
  gap: var(--wb-space-sm);
  font-family: var(--wb-font-mono);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.wb-topbar-brand img {
  width: 20px;
  height: 20px;
}

.wb-topbar-sep {
  color: var(--wb-text-muted);
  font-weight: 300;
}

.wb-topbar-title {
  flex: 1;
  font-size: 13px;
  color: var(--wb-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wb-topbar-actions {
  display: flex;
  align-items: center;
  gap: var(--wb-space-sm);
}

/* Responsive */
@media (max-width: 768px) {
  .wb-rail {
    width: 100%;
    height: 56px;
    flex-direction: row;
    order: 1;
  }
  .wb-shell {
    flex-direction: column;
  }
}
```

- [ ] **Step 5: Create components.css**

Buttons, badges, modals, forms.

```css
/* Buttons */
.wb-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--wb-space-xs);
  padding: 6px 14px;
  font-family: var(--wb-font);
  font-size: 13px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  border-radius: var(--wb-radius-sm);
}

.wb-btn-primary {
  background: var(--wb-teal);
  color: var(--wb-navy);
}
.wb-btn-primary:hover { background: var(--wb-teal-dark); }

.wb-btn-ghost {
  background: transparent;
  color: var(--wb-text-muted);
  border: 1px solid var(--wb-border);
}
.wb-btn-ghost:hover { border-color: var(--wb-slate); color: var(--wb-text); }

.wb-btn-navy {
  background: var(--wb-navy-light);
  color: #fff;
}
.wb-btn-navy:hover { background: var(--wb-navy-lighter); }

.wb-btn-sm { padding: 4px 10px; font-size: 12px; }

/* Badges */
.wb-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--wb-font-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.04em;
  padding: 2px 8px;
  border-radius: var(--wb-radius-sm);
}

.wb-badge-teal { background: var(--wb-teal-dim); color: var(--wb-teal); }
.wb-badge-stale { background: var(--wb-stale-dim); color: var(--wb-stale); }
.wb-badge-complete { background: rgba(16,185,129,0.1); color: var(--wb-complete); }

/* Modal */
.wb-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(11,26,46,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.wb-modal {
  background: var(--wb-surface);
  border: 1px solid var(--wb-border);
  border-radius: var(--wb-radius);
  padding: var(--wb-space-xl);
  max-width: 520px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.wb-modal-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: var(--wb-space-md);
}

/* Forms */
.wb-input {
  width: 100%;
  padding: 8px 12px;
  font-family: var(--wb-font);
  font-size: 14px;
  border: 1px solid var(--wb-border);
  border-radius: var(--wb-radius-sm);
  background: var(--wb-surface);
  color: var(--wb-text);
  transition: border-color 0.15s;
}
.wb-input:focus {
  outline: none;
  border-color: var(--wb-teal);
}

.wb-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--wb-text-secondary);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* File drop zone */
.wb-dropzone {
  border: 2px dashed var(--wb-border);
  border-radius: var(--wb-radius);
  padding: var(--wb-space-xl);
  text-align: center;
  cursor: pointer;
  transition: all 0.15s;
}
.wb-dropzone:hover,
.wb-dropzone.active {
  border-color: var(--wb-teal);
  background: var(--wb-teal-dim);
}
.wb-dropzone-label {
  font-size: 14px;
  color: var(--wb-text-secondary);
}
```

- [ ] **Step 6: Create sensitivity.css**

```css
.wb-sens-banner {
  padding: 6px var(--wb-space-md);
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  flex-shrink: 0;
}
.wb-sens-banner-sensitive {
  background: var(--wb-sens-sensitive-bg);
  color: #92400E;
}
.wb-sens-banner-highly {
  background: var(--wb-sens-highly-bg);
  color: #991B1B;
}
```

- [ ] **Step 7: Commit**

```bash
git add praxis/workbench/
git commit -m "Phase 1.1: workbench directory structure, index.html, CSS design system"
```

---

### Task 2: Schema and utility modules

**Files:**
- Create: `praxis/workbench/js/schema.js`
- Create: `praxis/workbench/js/utils.js`

- [ ] **Step 1: Create schema.js**

The data contract. Factory function returns an empty `.praxis` context object. Also exports station metadata.

```javascript
// praxis/workbench/js/schema.js
(function(global) {
  'use strict';

  var PRAXIS_VERSION = '1.0';

  var STATION_LABELS = [
    'Evaluability & Scoping',
    'Theory of Change',
    'Evaluation Matrix',
    'Design Advisor',
    'Sample Size',
    'Instrument Builder',
    'Analysis Framework',
    'Report Builder',
    'Presentation'
  ];

  var STATION_PHASES = [
    'pre',        // 0
    'inception',  // 1
    'inception',  // 2
    'inception',  // 3
    'inception',  // 4
    'collection', // 5
    'analysis',   // 6
    'analysis',   // 7
    'analysis'    // 8
  ];

  // Which context fields each station WRITES to
  var STATION_WRITES = {
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
        data_readiness: null,
        toc_clarity: null,
        stakeholder_access: null,
        timeline_adequate: null,
        blockers: [],
        recommendations: [],
        completed_at: null
      },

      toc: {
        title: '',
        narrative: {
          description: '',
          context: '',
          theory: '',
          systemAssumptions: []
        },
        nodes: [],
        connections: [],
        knowledge_sources: {},
        completed_at: null
      },

      evaluation_matrix: {
        context: {
          programmeName: '',
          sectorTemplate: '',
          healthAreas: [],
          frameworks: [],
          evaluationType: '',
          operatingContext: '',
          dacCriteria: []
        },
        toc_summary: {
          goal: '',
          outcomes: [],
          assumptions: [],
          inputMode: 'structured',
          freeText: ''
        },
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
        qualitative_plan: {
          purpose: '',
          methods: [],
          contexts: {},
          breakdown: []
        },
        completed_at: null
      },

      instruments: {
        items: [],
        completed_at: null
      },

      analysis_plan: {
        quantitative: [],
        qualitative: [],
        completed_at: null
      },

      report_structure: {
        sections: [],
        completed_at: null
      },

      presentation: {
        slides: [],
        completed_at: null
      },

      staleness: {
        0: false, 1: false, 2: false, 3: false, 4: false,
        5: false, 6: false, 7: false, 8: false
      },

      reviews: []
    };
  }

  global.PraxisSchema = {
    VERSION: PRAXIS_VERSION,
    STATION_LABELS: STATION_LABELS,
    STATION_PHASES: STATION_PHASES,
    STATION_WRITES: STATION_WRITES,
    createEmptyContext: createEmptyContext
  };

})(window);
```

- [ ] **Step 2: Create utils.js**

```javascript
// praxis/workbench/js/utils.js
(function(global) {
  'use strict';

  function uid(prefix) {
    return (prefix || '') + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function debounce(fn, ms) {
    var timer;
    return function() {
      var args = arguments;
      var ctx = this;
      clearTimeout(timer);
      timer = setTimeout(function() { fn.apply(ctx, args); }, ms);
    };
  }

  function deepMerge(target, source) {
    var result = Object.assign({}, target);
    Object.keys(source).forEach(function(key) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])
          && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
        result[key] = deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    });
    return result;
  }

  function downloadJSON(obj, filename) {
    var blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function readFileAsJSON(file) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onload = function(e) {
        try {
          resolve(JSON.parse(e.target.result));
        } catch (err) {
          reject(new Error('Invalid JSON file'));
        }
      };
      reader.onerror = function() { reject(new Error('Failed to read file')); };
      reader.readAsText(file);
    });
  }

  function formatDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  global.PraxisUtils = {
    uid: uid,
    debounce: debounce,
    deepMerge: deepMerge,
    downloadJSON: downloadJSON,
    readFileAsJSON: readFileAsJSON,
    formatDate: formatDate,
    clamp: clamp
  };

})(window);
```

- [ ] **Step 3: Commit**

```bash
git add praxis/workbench/js/schema.js praxis/workbench/js/utils.js
git commit -m "Phase 1.2: schema.js (data contract) and utils.js"
```

---

### Task 3: Staleness, protection, i18n, and router modules

**Files:**
- Create: `praxis/workbench/js/staleness.js`
- Create: `praxis/workbench/js/protection.js`
- Create: `praxis/workbench/js/i18n.js`
- Create: `praxis/workbench/js/router.js`
- Create: `praxis/workbench/lang/en.json`

- [ ] **Step 1: Create staleness.js**

Maps which context fields each station READS. When a station saves, all downstream stations that read from the same fields are flagged stale.

```javascript
// praxis/workbench/js/staleness.js
(function(global) {
  'use strict';

  // Which context fields each station READS (not writes)
  var UPSTREAM_DEPS = {
    0: [],
    1: ['project_meta'],
    2: ['project_meta', 'toc', 'tor_constraints', 'evaluability'],
    3: ['tor_constraints', 'project_meta'],
    4: ['design_recommendation', 'evaluation_matrix'],
    5: ['evaluation_matrix'],
    6: ['evaluation_matrix', 'instruments', 'sample_parameters'],
    7: ['evaluation_matrix', 'analysis_plan'],
    8: ['evaluation_matrix', 'design_recommendation', 'sample_parameters', 'report_structure']
  };

  function computeStaleness(changedStationId, currentStaleness) {
    var writtenFields = PraxisSchema.STATION_WRITES[changedStationId] || [];
    var newStaleness = Object.assign({}, currentStaleness);

    // The changed station is no longer stale
    newStaleness[changedStationId] = false;

    // Check all other stations
    for (var i = 0; i <= 8; i++) {
      if (i === changedStationId) continue;
      var deps = UPSTREAM_DEPS[i] || [];
      for (var j = 0; j < deps.length; j++) {
        if (writtenFields.indexOf(deps[j]) !== -1) {
          newStaleness[i] = true;
          break;
        }
      }
    }

    return newStaleness;
  }

  global.PraxisStaleness = {
    UPSTREAM_DEPS: UPSTREAM_DEPS,
    computeStaleness: computeStaleness
  };

})(window);
```

- [ ] **Step 2: Create protection.js**

```javascript
// praxis/workbench/js/protection.js
(function(global) {
  'use strict';

  var SENSITIVITY_LEVELS = {
    standard: { label: 'Standard', color: 'var(--wb-sens-standard)' },
    sensitive: { label: 'Sensitive', color: 'var(--wb-sens-sensitive)' },
    highly_sensitive: { label: 'Highly Sensitive', color: 'var(--wb-sens-highly)' }
  };

  function isSensitive(context) {
    return context.protection.sensitivity !== 'standard';
  }

  function isHighlySensitive(context) {
    return context.protection.sensitivity === 'highly_sensitive';
  }

  function getAiPermission(context) {
    if (isHighlySensitive(context)) return false;
    return context.protection.ai_permitted;
  }

  function getSharingGuidance(context) {
    var level = context.protection.sensitivity;
    if (level === 'highly_sensitive') return 'Share only via organisational secure platform. Encrypt before transfer.';
    if (level === 'sensitive') return 'Share via encrypted channels only (Signal, encrypted email).';
    return 'Share with colleagues as needed.';
  }

  global.PraxisProtection = {
    SENSITIVITY_LEVELS: SENSITIVITY_LEVELS,
    isSensitive: isSensitive,
    isHighlySensitive: isHighlySensitive,
    getAiPermission: getAiPermission,
    getSharingGuidance: getSharingGuidance
  };

})(window);
```

- [ ] **Step 3: Create i18n.js**

```javascript
// praxis/workbench/js/i18n.js
(function(global) {
  'use strict';

  var strings = {};
  var loaded = false;

  function loadLocale(lang, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'lang/' + lang + '.json', true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        strings = JSON.parse(xhr.responseText);
        loaded = true;
      }
      if (callback) callback();
    };
    xhr.onerror = function() {
      console.warn('Failed to load locale:', lang);
      if (callback) callback();
    };
    xhr.send();
  }

  function t(key, vars) {
    var str = strings[key] || key;
    if (vars) {
      Object.keys(vars).forEach(function(k) {
        str = str.replace('{{' + k + '}}', vars[k]);
      });
    }
    return str;
  }

  // Load English by default
  loadLocale('en');

  global.PraxisI18n = {
    loadLocale: loadLocale,
    t: t
  };

})(window);
```

- [ ] **Step 4: Create router.js**

```javascript
// praxis/workbench/js/router.js
(function(global) {
  'use strict';

  function getRoute() {
    var hash = window.location.hash.slice(1);
    var params = {};
    hash.split('&').forEach(function(part) {
      var kv = part.split('=');
      if (kv[0]) params[kv[0]] = kv[1] || '';
    });
    return {
      station: params.station != null ? parseInt(params.station, 10) : null,
      mode: params.mode || null
    };
  }

  function navigate(station, mode) {
    var parts = [];
    if (station != null) parts.push('station=' + station);
    if (mode) parts.push('mode=' + mode);
    window.location.hash = parts.join('&');
  }

  global.PraxisRouter = {
    getRoute: getRoute,
    navigate: navigate
  };

})(window);
```

- [ ] **Step 5: Create lang/en.json**

```json
{
  "app.title": "PRAXIS Workbench",
  "app.subtitle": "Evaluation Design Workspace",

  "entry.title": "PRAXIS Workbench",
  "entry.subtitle": "Intelligent evaluation design workspace",
  "entry.new": "New Project",
  "entry.new_desc": "Start a new evaluation from scratch",
  "entry.open": "Open .praxis File",
  "entry.open_desc": "Load an existing project file",
  "entry.continue": "Continue",
  "entry.continue_desc": "Resume your last session",
  "entry.dropzone": "Drop a .praxis file here, or click to browse",

  "topbar.save": "Save",
  "topbar.open": "Open",
  "topbar.export": "Export",
  "topbar.untitled": "Untitled Evaluation",

  "station.0": "Evaluability & Scoping",
  "station.1": "Theory of Change",
  "station.2": "Evaluation Matrix",
  "station.3": "Design Advisor",
  "station.4": "Sample Size",
  "station.5": "Instrument Builder",
  "station.6": "Analysis Framework",
  "station.7": "Report Builder",
  "station.8": "Presentation",

  "station.empty": "This station is not yet started.",
  "station.stale": "Upstream data has changed since this station was last saved.",
  "station.planned": "Coming soon",

  "sensitivity.standard": "Standard",
  "sensitivity.sensitive": "Sensitive Evaluation",
  "sensitivity.highly": "Highly Sensitive Evaluation",
  "sensitivity.banner.sensitive": "This evaluation is classified as sensitive. AI features are disabled by default. Share via encrypted channels only.",
  "sensitivity.banner.highly": "This evaluation is classified as highly sensitive. AI features are disabled. Encrypt before sharing.",

  "tier.foundation": "Foundation",
  "tier.practitioner": "Practitioner",
  "tier.advanced": "Advanced",

  "file.saved": "Project saved",
  "file.loaded": "Project loaded",
  "file.invalid": "Invalid .praxis file",

  "phase.pre": "Pre-Inception",
  "phase.inception": "Inception",
  "phase.collection": "Data Collection",
  "phase.analysis": "Analysis & Reporting"
}
```

- [ ] **Step 6: Commit**

```bash
git add praxis/workbench/js/staleness.js praxis/workbench/js/protection.js praxis/workbench/js/i18n.js praxis/workbench/js/router.js praxis/workbench/lang/en.json
git commit -m "Phase 1.3: staleness, protection, i18n, router modules + English strings"
```

---

### Task 4: Context reducer and app root

**Files:**
- Create: `praxis/workbench/js/context.js`
- Create: `praxis/workbench/js/app.js`

- [ ] **Step 1: Create context.js**

The Redux-style state container. Handles INIT, LOAD_FILE, SAVE_STATION, SET_SENSITIVITY, SET_TIER, SET_ACTIVE_STATION.

```javascript
// praxis/workbench/js/context.js
(function(global) {
  'use strict';

  var ACTION = {
    INIT: 'INIT',
    LOAD_FILE: 'LOAD_FILE',
    SAVE_STATION: 'SAVE_STATION',
    SET_SENSITIVITY: 'SET_SENSITIVITY',
    SET_TIER: 'SET_TIER',
    SET_ACTIVE_STATION: 'SET_ACTIVE_STATION',
    UPDATE_META: 'UPDATE_META',
    CLEAR: 'CLEAR'
  };

  function reducer(state, action) {
    switch (action.type) {

      case ACTION.INIT:
        return {
          context: PraxisSchema.createEmptyContext(),
          ui: Object.assign({}, state.ui, { projectLoaded: true, activeStation: 0 })
        };

      case ACTION.LOAD_FILE:
        return {
          context: action.payload,
          ui: Object.assign({}, state.ui, { projectLoaded: true, activeStation: 0 })
        };

      case ACTION.SAVE_STATION:
        var newContext = PraxisUtils.deepMerge(state.context, action.payload);
        newContext.updated_at = new Date().toISOString();
        newContext.staleness = PraxisStaleness.computeStaleness(
          action.stationId, newContext.staleness
        );
        return { context: newContext, ui: state.ui };

      case ACTION.SET_SENSITIVITY:
        var prot = Object.assign({}, state.context.protection, {
          sensitivity: action.level,
          ai_permitted: action.level !== 'highly_sensitive',
          encryption_recommended: action.level === 'highly_sensitive',
          sharing_guidance: PraxisProtection.getSharingGuidance(
            { protection: { sensitivity: action.level } }
          )
        });
        return {
          context: Object.assign({}, state.context, { protection: prot }),
          ui: state.ui
        };

      case ACTION.SET_TIER:
        return {
          context: state.context,
          ui: Object.assign({}, state.ui, { tier: action.tier })
        };

      case ACTION.SET_ACTIVE_STATION:
        return {
          context: state.context,
          ui: Object.assign({}, state.ui, { activeStation: action.station })
        };

      case ACTION.UPDATE_META:
        return {
          context: Object.assign({}, state.context, {
            project_meta: Object.assign({}, state.context.project_meta, action.payload)
          }),
          ui: state.ui
        };

      case ACTION.CLEAR:
        return {
          context: PraxisSchema.createEmptyContext(),
          ui: { projectLoaded: false, activeStation: 0, tier: 'practitioner', drawerOpen: false }
        };

      default:
        return state;
    }
  }

  function getInitialState() {
    var saved = null;
    try {
      var raw = localStorage.getItem('praxis-workbench');
      if (raw) saved = JSON.parse(raw);
    } catch (e) { /* ignore */ }

    return {
      context: saved || PraxisSchema.createEmptyContext(),
      ui: {
        projectLoaded: !!saved,
        activeStation: 0,
        tier: 'practitioner',
        drawerOpen: false
      }
    };
  }

  global.PraxisContext = {
    ACTION: ACTION,
    reducer: reducer,
    getInitialState: getInitialState
  };

})(window);
```

- [ ] **Step 2: Create app.js**

Root component. Owns the useReducer. Renders EntryModal or Shell. Auto-persists to localStorage.

```javascript
// praxis/workbench/js/app.js
(function() {
  'use strict';

  var h = React.createElement;
  var useReducer = React.useReducer;
  var useEffect = React.useEffect;
  var useRef = React.useRef;

  function App() {
    var ref = useRef(null);
    var result = useReducer(PraxisContext.reducer, null, PraxisContext.getInitialState);
    var state = result[0];
    var dispatch = result[1];

    // Auto-persist to localStorage (debounced)
    var persistRef = useRef(PraxisUtils.debounce(function(ctx) {
      try {
        localStorage.setItem('praxis-workbench', JSON.stringify(ctx));
      } catch (e) {
        console.warn('Failed to persist to localStorage:', e.message);
      }
    }, 500));

    useEffect(function() {
      if (state.ui.projectLoaded) {
        persistRef.current(state.context);
      }
    }, [state.context]);

    if (!state.ui.projectLoaded) {
      return h(PraxisEntryModal, { state: state, dispatch: dispatch });
    }

    return h(PraxisShell, { state: state, dispatch: dispatch });
  }

  // Mount
  var root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(h(App));

})();
```

- [ ] **Step 3: Commit**

```bash
git add praxis/workbench/js/context.js praxis/workbench/js/app.js
git commit -m "Phase 1.4: context reducer and App root with localStorage persistence"
```

---

### Task 5: Shell components (TopBar, StationRail, Shell, EntryModal)

**Files:**
- Create: `praxis/workbench/js/shell/TopBar.js`
- Create: `praxis/workbench/js/shell/StationRail.js`
- Create: `praxis/workbench/js/shell/EntryModal.js`
- Create: `praxis/workbench/js/shell/Shell.js`
- Create: `praxis/workbench/js/components/SensitivityBanner.js`
- Create: `praxis/workbench/js/components/Modal.js`
- Create: `praxis/workbench/js/components/FileDropZone.js`

- [ ] **Step 1: Create SensitivityBanner.js**

```javascript
// praxis/workbench/js/components/SensitivityBanner.js
(function(global) {
  'use strict';
  var h = React.createElement;

  function SensitivityBanner(props) {
    var ctx = props.context;
    if (!PraxisProtection.isSensitive(ctx)) return null;

    var isHighly = PraxisProtection.isHighlySensitive(ctx);
    var cls = 'wb-sens-banner ' + (isHighly ? 'wb-sens-banner-highly' : 'wb-sens-banner-sensitive');
    var key = isHighly ? 'sensitivity.banner.highly' : 'sensitivity.banner.sensitive';

    return h('div', { className: cls }, PraxisI18n.t(key));
  }

  global.PraxisSensitivityBanner = SensitivityBanner;
})(window);
```

- [ ] **Step 2: Create Modal.js**

```javascript
// praxis/workbench/js/components/Modal.js
(function(global) {
  'use strict';
  var h = React.createElement;

  function Modal(props) {
    return h('div', { className: 'wb-modal-overlay', onClick: props.onClose },
      h('div', { className: 'wb-modal', onClick: function(e) { e.stopPropagation(); } },
        props.title ? h('h2', { className: 'wb-modal-title' }, props.title) : null,
        props.children
      )
    );
  }

  global.PraxisModal = Modal;
})(window);
```

- [ ] **Step 3: Create FileDropZone.js**

```javascript
// praxis/workbench/js/components/FileDropZone.js
(function(global) {
  'use strict';
  var h = React.createElement;
  var useState = React.useState;
  var useRef = React.useRef;

  function FileDropZone(props) {
    var ref = useRef(null);
    var active = useState(false);
    var isActive = active[0];
    var setActive = active[1];

    function handleDrop(e) {
      e.preventDefault();
      setActive(false);
      var file = e.dataTransfer.files[0];
      if (file && file.name.endsWith('.praxis')) {
        props.onFile(file);
      }
    }

    function handleClick() {
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = '.praxis,.json';
      input.onchange = function(e) {
        if (e.target.files[0]) props.onFile(e.target.files[0]);
      };
      input.click();
    }

    return h('div', {
      ref: ref,
      className: 'wb-dropzone' + (isActive ? ' active' : ''),
      onDragOver: function(e) { e.preventDefault(); setActive(true); },
      onDragLeave: function() { setActive(false); },
      onDrop: handleDrop,
      onClick: handleClick
    },
      h('p', { className: 'wb-dropzone-label' }, props.label || PraxisI18n.t('entry.dropzone'))
    );
  }

  global.PraxisFileDropZone = FileDropZone;
})(window);
```

- [ ] **Step 4: Create TopBar.js**

```javascript
// praxis/workbench/js/shell/TopBar.js
(function(global) {
  'use strict';
  var h = React.createElement;

  function TopBar(props) {
    var state = props.state;
    var dispatch = props.dispatch;
    var title = state.context.project_meta.title || PraxisI18n.t('topbar.untitled');

    function handleSave() {
      var filename = (state.context.project_meta.title || 'untitled').replace(/\s+/g, '_').toLowerCase() + '.praxis';
      PraxisUtils.downloadJSON(state.context, filename);
    }

    function handleOpen(file) {
      PraxisUtils.readFileAsJSON(file).then(function(data) {
        if (data.schema === 'praxis-workbench') {
          dispatch({ type: PraxisContext.ACTION.LOAD_FILE, payload: data });
        } else {
          alert(PraxisI18n.t('file.invalid'));
        }
      });
    }

    return h('div', { className: 'wb-topbar' },
      h('div', { className: 'wb-topbar-brand' },
        h('img', { src: '../logo.svg', alt: '' }),
        'PRAXIS',
        h('span', { className: 'wb-topbar-sep' }, '/'),
        'Workbench'
      ),
      h('div', { className: 'wb-topbar-title' }, title),
      h('div', { className: 'wb-topbar-actions' },
        h('span', { className: 'wb-badge wb-badge-' + (
          state.ui.tier === 'foundation' ? 'teal' :
          state.ui.tier === 'advanced' ? 'stale' : 'teal'
        )}, PraxisI18n.t('tier.' + state.ui.tier)),
        h('button', { className: 'wb-btn wb-btn-navy wb-btn-sm', onClick: handleSave },
          PraxisI18n.t('topbar.save')
        ),
        h('button', { className: 'wb-btn wb-btn-ghost wb-btn-sm', onClick: function() {
          var input = document.createElement('input');
          input.type = 'file';
          input.accept = '.praxis,.json';
          input.onchange = function(e) { if (e.target.files[0]) handleOpen(e.target.files[0]); };
          input.click();
        }}, PraxisI18n.t('topbar.open'))
      )
    );
  }

  global.PraxisTopBar = TopBar;
})(window);
```

- [ ] **Step 5: Create StationRail.js**

```javascript
// praxis/workbench/js/shell/StationRail.js
(function(global) {
  'use strict';
  var h = React.createElement;

  function StationButton(props) {
    var isActive = props.active;
    var isStale = props.stale;
    var isComplete = props.complete;
    var phase = PraxisSchema.STATION_PHASES[props.index];

    var cls = 'wb-rail-btn' + (isActive ? ' wb-rail-btn-active' : '');

    return h('button', {
      className: cls,
      onClick: function() { props.onClick(props.index); },
      title: PraxisI18n.t('station.' + props.index)
    },
      h('span', { className: 'wb-rail-num' }, props.index),
      isStale ? h('span', { className: 'wb-rail-dot wb-rail-dot-stale' }) : null,
      isComplete ? h('span', { className: 'wb-rail-dot wb-rail-dot-complete' }) : null
    );
  }

  function StationRail(props) {
    var state = props.state;
    var dispatch = props.dispatch;
    var context = state.context;

    var completedFields = [
      'evaluability', 'toc', 'evaluation_matrix', 'design_recommendation',
      'sample_parameters', 'instruments', 'analysis_plan', 'report_structure', 'presentation'
    ];

    var buttons = [];
    for (var i = 0; i <= 8; i++) {
      var field = completedFields[i];
      var isComplete = context[field] && context[field].completed_at;
      buttons.push(h(StationButton, {
        key: i,
        index: i,
        active: state.ui.activeStation === i,
        stale: context.staleness[i],
        complete: !!isComplete,
        onClick: function(idx) {
          dispatch({ type: PraxisContext.ACTION.SET_ACTIVE_STATION, station: idx });
        }
      }));
    }

    return h('nav', { className: 'wb-rail', 'aria-label': 'Stations' }, buttons);
  }

  global.PraxisStationRail = StationRail;
})(window);
```

- [ ] **Step 6: Add rail button styles to layout.css**

Append to `css/layout.css`:

```css
/* Station rail buttons */
.wb-rail-btn {
  width: var(--wb-rail-width);
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--wb-text-muted);
  font-family: var(--wb-font-mono);
  font-size: 13px;
  font-weight: 600;
  transition: all 0.15s;
}
.wb-rail-btn:hover {
  background: var(--wb-navy-light);
  color: #fff;
}
.wb-rail-btn-active {
  color: var(--wb-teal);
  box-shadow: inset 3px 0 0 var(--wb-teal);
}
.wb-rail-num {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.wb-rail-dot {
  position: absolute;
  top: 8px;
  right: 10px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.wb-rail-dot-stale { background: var(--wb-stale); }
.wb-rail-dot-complete { background: var(--wb-complete); }
```

- [ ] **Step 7: Create EntryModal.js**

```javascript
// praxis/workbench/js/shell/EntryModal.js
(function(global) {
  'use strict';
  var h = React.createElement;

  function EntryModal(props) {
    var dispatch = props.dispatch;
    var hasSaved = props.state.context.project_meta.title !== '';

    function handleNew() {
      dispatch({ type: PraxisContext.ACTION.INIT });
    }

    function handleOpen(file) {
      PraxisUtils.readFileAsJSON(file).then(function(data) {
        if (data.schema === 'praxis-workbench') {
          dispatch({ type: PraxisContext.ACTION.LOAD_FILE, payload: data });
        } else {
          alert(PraxisI18n.t('file.invalid'));
        }
      });
    }

    function handleContinue() {
      dispatch({ type: PraxisContext.ACTION.LOAD_FILE, payload: props.state.context });
    }

    return h('div', { className: 'wb-modal-overlay' },
      h('div', { className: 'wb-modal', style: { maxWidth: '480px' } },
        h('div', { style: { textAlign: 'center', marginBottom: '24px' } },
          h('img', { src: '../logo.svg', alt: '', style: { width: '40px', height: '40px', marginBottom: '12px' } }),
          h('h1', { style: { fontSize: '20px', fontWeight: '600', marginBottom: '4px' } },
            PraxisI18n.t('entry.title')
          ),
          h('p', { style: { fontSize: '14px', color: 'var(--wb-text-secondary)' } },
            PraxisI18n.t('entry.subtitle')
          )
        ),

        h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
          h('button', {
            className: 'wb-btn wb-btn-primary',
            style: { width: '100%', justifyContent: 'center', padding: '12px' },
            onClick: handleNew
          }, PraxisI18n.t('entry.new')),

          h(PraxisFileDropZone, { onFile: handleOpen }),

          hasSaved ? h('button', {
            className: 'wb-btn wb-btn-ghost',
            style: { width: '100%', justifyContent: 'center', padding: '12px' },
            onClick: handleContinue
          }, PraxisI18n.t('entry.continue') + ': ' + (props.state.context.project_meta.title || 'Untitled')) : null
        )
      )
    );
  }

  global.PraxisEntryModal = EntryModal;
})(window);
```

- [ ] **Step 8: Create Shell.js**

```javascript
// praxis/workbench/js/shell/Shell.js
(function(global) {
  'use strict';
  var h = React.createElement;

  function StationPlaceholder(props) {
    var idx = props.station;
    var label = PraxisSchema.STATION_LABELS[idx];
    var phase = PraxisSchema.STATION_PHASES[idx];
    var isStale = props.context.staleness[idx];

    return h('div', { className: 'wb-panel' },
      h('div', { style: { marginBottom: '24px' } },
        h('span', { className: 'wb-badge wb-badge-teal', style: { marginBottom: '8px' } },
          PraxisI18n.t('phase.' + phase)
        ),
        h('h2', { style: { fontSize: '24px', fontWeight: '600', marginTop: '8px' } },
          'Station ' + idx + ': ' + label
        ),
        isStale ? h('p', { style: { color: 'var(--wb-stale)', fontSize: '13px', marginTop: '8px' } },
          PraxisI18n.t('station.stale')
        ) : null
      ),
      h('p', { style: { color: 'var(--wb-text-secondary)' } },
        idx <= 4 || idx === 8
          ? PraxisI18n.t('station.empty')
          : PraxisI18n.t('station.planned')
      )
    );
  }

  function Shell(props) {
    var state = props.state;
    var dispatch = props.dispatch;
    var activeStation = state.ui.activeStation;

    return h('div', { className: 'wb-app' },
      h(PraxisSensitivityBanner, { context: state.context }),
      h(PraxisTopBar, { state: state, dispatch: dispatch }),
      h('div', { className: 'wb-shell' },
        h(PraxisStationRail, { state: state, dispatch: dispatch }),
        h('main', { className: 'wb-main' },
          h(StationPlaceholder, { station: activeStation, context: state.context })
        )
      )
    );
  }

  global.PraxisShell = Shell;
})(window);
```

- [ ] **Step 9: Verify in browser**

Open `praxis/workbench/index.html` in browser. Expected:
- Entry modal appears with PRAXIS logo, "New Project" button, file drop zone
- Click "New Project" -> shell appears with navy topbar, station rail on left, placeholder content for Station 0
- Click station numbers 0-8 in the rail -> placeholder content updates
- Title shows "Untitled Evaluation" in topbar

- [ ] **Step 10: Commit**

```bash
git add praxis/workbench/
git commit -m "Phase 1.5: shell components (TopBar, StationRail, EntryModal, Shell) — workbench is navigable"
```

---

### Task 6: Save/load .praxis files end-to-end

**Files:**
- Modify: Components from Task 5 (already handle save/load)
- Create: `praxis/workbench/test/schema.test.html`

- [ ] **Step 1: Create schema.test.html**

Browser-based test page that validates the schema contract.

```html
<!DOCTYPE html>
<html>
<head>
  <title>PRAXIS Schema Tests</title>
  <script src="../js/schema.js"></script>
  <script src="../js/utils.js"></script>
  <script src="../js/staleness.js"></script>
  <script src="../js/protection.js"></script>
  <style>
    body { font-family: monospace; padding: 20px; background: #1a1f2e; color: #e8e4df; }
    .pass { color: #10B981; }
    .fail { color: #EF4444; }
    pre { margin: 4px 0; }
  </style>
</head>
<body>
  <h1>PRAXIS Schema Tests</h1>
  <div id="results"></div>
  <script>
  (function() {
    var results = document.getElementById('results');
    var passed = 0;
    var failed = 0;

    function test(name, fn) {
      try {
        fn();
        results.innerHTML += '<pre class="pass">PASS: ' + name + '</pre>';
        passed++;
      } catch (e) {
        results.innerHTML += '<pre class="fail">FAIL: ' + name + ' — ' + e.message + '</pre>';
        failed++;
      }
    }

    function assert(cond, msg) {
      if (!cond) throw new Error(msg || 'Assertion failed');
    }

    // Tests
    test('createEmptyContext returns valid object', function() {
      var ctx = PraxisSchema.createEmptyContext();
      assert(ctx.version === '1.0', 'version should be 1.0');
      assert(ctx.schema === 'praxis-workbench', 'schema should be praxis-workbench');
      assert(ctx.project_meta.title === '', 'title should be empty');
      assert(ctx.protection.sensitivity === 'standard', 'sensitivity should be standard');
      assert(Array.isArray(ctx.toc.nodes), 'toc.nodes should be array');
      assert(Array.isArray(ctx.evaluation_matrix.rows), 'matrix.rows should be array');
      assert(ctx.staleness[0] === false, 'staleness[0] should be false');
    });

    test('createEmptyContext returns independent copies', function() {
      var a = PraxisSchema.createEmptyContext();
      var b = PraxisSchema.createEmptyContext();
      a.project_meta.title = 'Test';
      assert(b.project_meta.title === '', 'should not share references');
    });

    test('STATION_LABELS has 9 entries', function() {
      assert(PraxisSchema.STATION_LABELS.length === 9, 'should have 9 labels');
    });

    test('STATION_WRITES covers all stations 0-8', function() {
      for (var i = 0; i <= 8; i++) {
        assert(Array.isArray(PraxisSchema.STATION_WRITES[i]), 'station ' + i + ' should have writes');
      }
    });

    test('staleness: saving station 0 flags downstream stations', function() {
      var staleness = { 0:false, 1:false, 2:false, 3:false, 4:false, 5:false, 6:false, 7:false, 8:false };
      var result = PraxisStaleness.computeStaleness(0, staleness);
      assert(result[0] === false, 'station 0 should not be stale after save');
      assert(result[1] === true, 'station 1 reads project_meta, should be stale');
      assert(result[2] === true, 'station 2 reads project_meta, should be stale');
      assert(result[3] === true, 'station 3 reads project_meta, should be stale');
    });

    test('staleness: saving station 2 flags stations 3-8', function() {
      var staleness = { 0:false, 1:false, 2:false, 3:false, 4:false, 5:false, 6:false, 7:false, 8:false };
      var result = PraxisStaleness.computeStaleness(2, staleness);
      assert(result[2] === false, 'station 2 not stale');
      assert(result[4] === true, 'station 4 reads evaluation_matrix');
      assert(result[5] === true, 'station 5 reads evaluation_matrix');
      assert(result[6] === true, 'station 6 reads evaluation_matrix');
      assert(result[7] === true, 'station 7 reads evaluation_matrix');
      assert(result[8] === true, 'station 8 reads evaluation_matrix');
    });

    test('staleness: saving station 4 does not affect station 2', function() {
      var staleness = { 0:false, 1:false, 2:false, 3:false, 4:false, 5:false, 6:false, 7:false, 8:false };
      var result = PraxisStaleness.computeStaleness(4, staleness);
      assert(result[2] === false, 'station 2 should not be stale');
      assert(result[6] === true, 'station 6 reads sample_parameters');
    });

    test('protection: standard is not sensitive', function() {
      var ctx = PraxisSchema.createEmptyContext();
      assert(!PraxisProtection.isSensitive(ctx), 'standard should not be sensitive');
      assert(PraxisProtection.getAiPermission(ctx) === true, 'AI should be permitted');
    });

    test('protection: highly sensitive disables AI', function() {
      var ctx = PraxisSchema.createEmptyContext();
      ctx.protection.sensitivity = 'highly_sensitive';
      assert(PraxisProtection.isHighlySensitive(ctx), 'should be highly sensitive');
      assert(PraxisProtection.getAiPermission(ctx) === false, 'AI should be disabled');
    });

    test('deepMerge preserves nested objects', function() {
      var target = { a: { b: 1, c: 2 }, d: 3 };
      var source = { a: { b: 10 } };
      var result = PraxisUtils.deepMerge(target, source);
      assert(result.a.b === 10, 'b should be updated');
      assert(result.a.c === 2, 'c should be preserved');
      assert(result.d === 3, 'd should be preserved');
    });

    test('uid generates unique values', function() {
      var a = PraxisUtils.uid('test-');
      var b = PraxisUtils.uid('test-');
      assert(a !== b, 'should generate unique IDs');
      assert(a.startsWith('test-'), 'should use prefix');
    });

    test('JSON round-trip preserves context', function() {
      var ctx = PraxisSchema.createEmptyContext();
      ctx.project_meta.title = 'Test Evaluation';
      ctx.protection.sensitivity = 'sensitive';
      ctx.toc.nodes.push({ id: 'n1', title: 'Goal' });
      var json = JSON.stringify(ctx);
      var restored = JSON.parse(json);
      assert(restored.project_meta.title === 'Test Evaluation', 'title preserved');
      assert(restored.protection.sensitivity === 'sensitive', 'sensitivity preserved');
      assert(restored.toc.nodes.length === 1, 'nodes preserved');
      assert(restored.toc.nodes[0].title === 'Goal', 'node title preserved');
    });

    // Summary
    results.innerHTML += '<hr><pre>' + passed + ' passed, ' + failed + ' failed</pre>';
  })();
  </script>
</body>
</html>
```

- [ ] **Step 2: Open test/schema.test.html in browser**

Expected: All tests pass (green). If any fail (red), fix the corresponding module before proceeding.

- [ ] **Step 3: Manual test — save and load .praxis file**

1. Open `praxis/workbench/index.html`
2. Click "New Project"
3. Click "Save" in topbar -> downloads `untitled.praxis`
4. Refresh page
5. File drop zone or "Open" -> load the `.praxis` file
6. Verify: shell appears, station 0 is active

- [ ] **Step 4: Commit**

```bash
git add praxis/workbench/test/schema.test.html
git commit -m "Phase 1.6: schema validation tests — all tests pass, save/load verified"
```
