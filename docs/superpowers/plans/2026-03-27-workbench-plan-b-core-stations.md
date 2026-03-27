# PRAXIS Workbench — Plan B: Core Stations (0, 2, 5)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the three priority stations that demonstrate the workbench's value: Station 0 (Evaluability & Scoping — 3-phase assessment with professional judgment overrides), Station 2 (Evaluation Matrix — table-first with inline editor and auto-suggested EQs), and Station 5 (Instrument Builder — structured configurator with XLSForm export). At the end of this plan, a user can complete an evaluability assessment, generate an evaluation matrix, and build data collection instruments.

**Architecture:** Stations are React components rendered by the Shell based on `state.ui.activeStation`. Each station reads upstream context and dispatches `SAVE_STATION` to write its output. Station 0 has a 3-phase internal flow. Station 2 ports pure functions from the existing eval-matrix-builder. Station 5 is new functionality built from scratch.

**Tech Stack:** Same as Plan A. Station 2 additionally uses the `INDICATOR_BANK` data extracted from the existing eval-matrix-builder tool. Station 5 uses SheetJS for `.xlsx` export.

**Prereqs:** Plan A must be complete (shell, state management, all foundation JS).

**Reference docs:**
- Design spec: `docs/superpowers/specs/2026-03-26-praxis-workbench-rebuild-design.md` (§6, §8, §11)
- Architecture blueprint: `docs/workbench-architecture-blueprint.md` (§7 Tier A port, §8 file descriptions)
- Existing eval-matrix-builder source: `praxis/tools/eval-matrix-builder/index.html`

---

## File Map

All paths relative to `C:\Users\emmao\deploy-site\praxis\workbench\`.

### Station 0 (Evaluability & Scoping):
| File | Responsibility |
|------|---------------|
| `js/stations/station0/Station0.js` | 3-phase assessment orchestrator |
| `js/stations/station0/Phase1Programme.js` | Phase 1: Programme Details form |
| `js/stations/station0/Phase2ToR.js` | Phase 2: Terms of Reference form |
| `js/stations/station0/Phase3Assessment.js` | Phase 3: Evaluability score display + overrides |
| `js/stations/station0/PhaseReview.js` | Phase transition review card |
| `js/stations/station0/EvaluabilityScorer.js` | Pure scoring function (5 dimensions) |
| `test/station0.test.html` | Tests for scoring rubric |

### Station 2 (Evaluation Matrix — The Spine):
| File | Responsibility |
|------|---------------|
| `data/indicator_bank.js` | Extracted constants from eval-matrix-builder |
| `js/stations/station2/Station2.js` | Table-first matrix with toolbar |
| `js/stations/station2/MatrixGenerator.js` | Port of generateMatrix() and related pure functions |
| `js/stations/station2/MatrixTable.js` | Table view with all 6 columns |
| `js/stations/station2/MatrixInlineEditor.js` | Inline card editor (opens below selected row) |
| `js/stations/station2/AddEQModal.js` | Auto-suggested EQs from ToC × DAC criteria |
| `js/stations/station2/IndicatorSelector.js` | Indicator Bank modal |
| `js/stations/station2/MatrixExport.js` | Word, Excel, JSON export |
| `test/station2.test.html` | Tests for matrix generator and adapter functions |

### Station 5 (Instrument Builder):
| File | Responsibility |
|------|---------------|
| `js/stations/station5/Station5.js` | Instrument overview + coverage matrix |
| `js/stations/station5/InstrumentEditor.js` | Left sidebar + right question editor |
| `js/stations/station5/QuestionConfigurator.js` | Response type selector + type-specific config |
| `js/stations/station5/InstrumentScaffold.js` | Auto-generate instruments from matrix |
| `js/stations/station5/InstrumentExport.js` | XLSForm (.xlsx), Word, PDF export |
| `test/station5.test.html` | Tests for scaffold and XLSForm generation |

### Modifications to existing files:
| File | Change |
|------|--------|
| `index.html` | Uncomment station script tags, add data/indicator_bank.js |
| `js/shell/Shell.js` | Route active station to Station0/Station2/Station5 components |

---

## Task 1: Station 0 — EvaluabilityScorer (Pure Function)

**Files:**
- Create: `js/stations/station0/EvaluabilityScorer.js`
- Create: `test/station0.test.html`

Build the scoring engine first (TDD). The scorer is a pure function with no DOM dependency.

- [ ] **Step 1: Write the test file**

Test the Comparison Feasibility dimension end-to-end (the reference rubric from spec §6.6), then test the full scorer.

```html
<!-- test/station0.test.html -->
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Station 0 Tests — Evaluability Scorer</title>
<style>
body { font-family: monospace; padding: 20px; background: #0B1A2E; color: #2EC4B6; }
.pass { color: #10B981; } .fail { color: #EF4444; }
h2 { color: white; margin-top: 20px; }
</style>
</head>
<body>
<h1>Station 0 Tests</h1>
<div id="results"></div>
<script src="../js/schema.js"></script>
<script src="../js/utils.js"></script>
<script src="../js/staleness.js"></script>
<script src="../js/stations/station0/EvaluabilityScorer.js"></script>
<script>
var results = document.getElementById('results');
var pass = 0, fail = 0;

function assert(name, condition) {
  if (condition) { pass++; } else { fail++; }
  var el = document.createElement('div');
  el.className = condition ? 'pass' : 'fail';
  el.textContent = (condition ? '✓ ' : '✗ ') + name;
  results.appendChild(el);
}
function section(name) {
  var el = document.createElement('h2'); el.textContent = name; results.appendChild(el);
}

// ── Comparison Feasibility rubric (spec §6.6 reference pattern) ──
section('Comparison Feasibility Dimension');

var baseTor = { comparison_feasibility: 'randomisable', data_available: 'baseline_endline', causal_inference_level: 'attribution', evaluation_purpose: [], programme_complexity: '', unit_of_intervention: '', geographic_scope: '', target_population: '', evaluation_questions_raw: [], raw_text: '' };
var baseMeta = { operating_context: 'stable', budget: 'medium', timeline: 'medium', programme_maturity: 'scaling', sectors: [], country: '', programme_name: '', organisation: '', title: '', primary_sector: null, health_areas: [], frameworks: [], evaluation_type: '', sector_template: '', languages: ['en'] };

assert('Randomisable + stable = 20/20',
  EvaluabilityScorer.scoreDimension('comparison', baseTor, baseMeta) === 20);

assert('Randomisable + humanitarian = 17/20 (penalty -3)',
  EvaluabilityScorer.scoreDimension('comparison',
    Object.assign({}, baseTor, { comparison_feasibility: 'randomisable' }),
    Object.assign({}, baseMeta, { operating_context: 'humanitarian' })
  ) === 17);

assert('Natural + stable = 14/20',
  EvaluabilityScorer.scoreDimension('comparison',
    Object.assign({}, baseTor, { comparison_feasibility: 'natural' }),
    baseMeta
  ) === 14);

assert('Natural + fragile + multi-country = 12/20 (penalty -2)',
  EvaluabilityScorer.scoreDimension('comparison',
    Object.assign({}, baseTor, { comparison_feasibility: 'natural' }),
    Object.assign({}, baseMeta, { operating_context: 'fragile', country: 'Burkina Faso, Mali, Niger' })
  ) === 12);

assert('Threshold + baseline_endline = 12/20 (bonus +2)',
  EvaluabilityScorer.scoreDimension('comparison',
    Object.assign({}, baseTor, { comparison_feasibility: 'threshold', data_available: 'baseline_endline' }),
    baseMeta
  ) === 12);

assert('None + description = 5/20 (bonus +2)',
  EvaluabilityScorer.scoreDimension('comparison',
    Object.assign({}, baseTor, { comparison_feasibility: 'none', causal_inference_level: 'description' }),
    baseMeta
  ) === 5);

assert('None + attribution = 3/20 (no bonus)',
  EvaluabilityScorer.scoreDimension('comparison',
    Object.assign({}, baseTor, { comparison_feasibility: 'none' }),
    baseMeta
  ) === 3);

// ── Full scorer ──
section('Full Scorer');
var result = EvaluabilityScorer.score(baseTor, baseMeta);
assert('Returns object with score', typeof result.score === 'number');
assert('Returns dimensions array with 5 entries', result.dimensions.length === 5);
assert('Score is sum of dimension system_scores', result.score === result.dimensions.reduce(function(sum, d) { return sum + d.system_score; }, 0));
assert('Each dimension has id, label, max, system_score', result.dimensions.every(function(d) {
  return d.id && d.label && typeof d.max === 'number' && typeof d.system_score === 'number';
}));
assert('Returns blockers array', Array.isArray(result.blockers));
assert('Returns recommendations array', Array.isArray(result.recommendations));

// Edge: minimal inputs
var minimalTor = Object.assign({}, baseTor, { comparison_feasibility: 'none', data_available: 'minimal', causal_inference_level: 'attribution' });
var minimalMeta = Object.assign({}, baseMeta, { operating_context: 'humanitarian', timeline: 'short' });
var minResult = EvaluabilityScorer.score(minimalTor, minimalMeta);
assert('Minimal inputs produce low score (<40)', minResult.score < 40);
assert('Minimal inputs produce blockers', minResult.blockers.length > 0);

// ── Summary ──
section('Summary');
var s = document.createElement('div');
s.style.fontSize = '16px';
s.innerHTML = '<span class="pass">' + pass + ' passed</span> / <span class="fail">' + fail + ' failed</span>';
results.appendChild(s);
</script>
</body>
</html>
```

- [ ] **Step 2: Run test — verify failures**

Open `test/station0.test.html` in browser. Expected: all tests FAIL (EvaluabilityScorer not defined).

- [ ] **Step 3: Write `EvaluabilityScorer.js`**

Pure scoring function implementing the rubric pattern from spec §6.6. Each dimension follows: base score from primary input → cross-dimension modifiers → clamp to [0, max].

```javascript
// js/stations/station0/EvaluabilityScorer.js
(function() {
  'use strict';

  // Detect multi-country from comma-separated country string
  function isMultiCountry(meta) {
    return (meta.country || '').split(',').filter(function(s) { return s.trim(); }).length > 1;
  }

  var RUBRICS = {
    comparison: function(tor, meta) {
      var base = { randomisable: 20, natural: 14, threshold: 10, none: 3 };
      var score = base[tor.comparison_feasibility] || 3;
      // Cross-dimension modifiers
      if (tor.comparison_feasibility === 'randomisable' && meta.operating_context === 'humanitarian') score -= 3;
      if (tor.comparison_feasibility === 'natural' && meta.operating_context === 'fragile' && isMultiCountry(meta)) score -= 2;
      if (tor.comparison_feasibility === 'threshold' && tor.data_available === 'baseline_endline') score += 2;
      if (tor.comparison_feasibility === 'none' && tor.causal_inference_level === 'description') score += 2;
      return PraxisUtils.clamp(score, 0, 20);
    },

    data: function(tor, meta) {
      var base = { baseline_endline: 25, timeseries: 18, routine_only: 10, minimal: 5 };
      var score = base[tor.data_available] || 5;
      if (tor.data_available === 'routine_only' && meta.programme_maturity === 'mature') score += 3;
      if (tor.data_available === 'minimal' && meta.operating_context === 'humanitarian') score += 2;
      return PraxisUtils.clamp(score, 0, 25);
    },

    toc: function(tor, meta) {
      // ToC clarity is assessed later when ToC nodes exist; for Phase 3 scoring, use a proxy
      var score = 12; // default: partial clarity
      if (tor.evaluation_purpose.length > 0) score += 3;
      if (tor.causal_inference_level === 'attribution' || tor.causal_inference_level === 'contribution') score += 3;
      if (meta.programme_maturity === 'mature' || meta.programme_maturity === 'completed') score += 2;
      return PraxisUtils.clamp(score, 0, 20);
    },

    timeline: function(tor, meta) {
      var base = { long: 20, medium: 15, short: 8 };
      var score = base[meta.timeline] || 12;
      if (meta.timeline === 'short' && tor.comparison_feasibility === 'randomisable') score -= 4;
      if (meta.timeline === 'long' && meta.programme_maturity === 'pilot') score += 2;
      return PraxisUtils.clamp(score, 0, 20);
    },

    context: function(tor, meta) {
      var base = { stable: 15, fragile: 8, humanitarian: 4 };
      var score = base[meta.operating_context] || 10;
      if (meta.operating_context === 'fragile' && tor.comparison_feasibility === 'randomisable') score -= 2;
      if (meta.operating_context === 'humanitarian' && meta.timeline === 'short') score -= 1;
      return PraxisUtils.clamp(score, 0, 15);
    }
  };

  var DIMENSION_META = [
    { id: 'data', label: 'Data Availability', max: 25 },
    { id: 'toc', label: 'ToC Clarity', max: 20 },
    { id: 'timeline', label: 'Timeline Adequacy', max: 20 },
    { id: 'context', label: 'Operating Context', max: 15 },
    { id: 'comparison', label: 'Comparison Feasibility', max: 20 }
  ];

  function scoreDimension(dimensionId, tor, meta) {
    var rubric = RUBRICS[dimensionId];
    return rubric ? rubric(tor, meta) : 0;
  }

  function score(tor, meta) {
    var dimensions = DIMENSION_META.map(function(dim) {
      var systemScore = scoreDimension(dim.id, tor, meta);
      return {
        id: dim.id, label: dim.label, max: dim.max,
        system_score: systemScore, adjusted_score: null, justification: null
      };
    });

    var totalScore = dimensions.reduce(function(sum, d) { return sum + d.system_score; }, 0);

    // Generate blockers
    var blockers = [];
    dimensions.forEach(function(d) {
      var pct = d.system_score / d.max;
      if (pct < 0.4) {
        blockers.push({ dimension: d.id, label: d.label, score: d.system_score, max: d.max });
      }
    });

    // Generate recommendations
    var recommendations = [];
    if (tor.data_available === 'minimal' || tor.data_available === 'routine_only') {
      recommendations.push('Strengthen data readiness by incorporating routine MEAL data from implementing partners.');
    }
    if (tor.comparison_feasibility === 'none' && tor.causal_inference_level !== 'description') {
      recommendations.push('Consider contribution analysis or theory-based approach rather than experimental design.');
    }
    if (meta.operating_context === 'fragile' || meta.operating_context === 'humanitarian') {
      recommendations.push('Adapt methods for the operating context — consider remote data collection and safety protocols.');
    }
    if (meta.timeline === 'short' && tor.comparison_feasibility === 'randomisable') {
      recommendations.push('The short timeline may not allow for a randomised design. Consider quasi-experimental alternatives.');
    }

    return {
      score: totalScore,
      dimensions: dimensions,
      blockers: blockers,
      recommendations: recommendations
    };
  }

  window.EvaluabilityScorer = {
    score: score,
    scoreDimension: scoreDimension,
    DIMENSION_META: DIMENSION_META
  };
})();
```

- [ ] **Step 4: Run tests — verify all pass**

Open `test/station0.test.html` in browser. Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add praxis/workbench/js/stations/station0/EvaluabilityScorer.js praxis/workbench/test/station0.test.html
git commit -m "feat(workbench): add EvaluabilityScorer with 5-dimension rubric and cross-dimension modifiers"
```

---

## Task 2: Station 0 — Phase Components

**Files:**
- Create: `js/stations/station0/Phase1Programme.js`
- Create: `js/stations/station0/Phase2ToR.js`
- Create: `js/stations/station0/Phase3Assessment.js`
- Create: `js/stations/station0/PhaseReview.js`
- Create: `js/stations/station0/Station0.js`

- [ ] **Step 1: Write `Phase1Programme.js`**

Programme Details form (spec §6.3). Two-column grid. Fields: Programme Name, Organisation, Sector (multi-select chips with checkmarks), Country/Region, Budget Range (3-way card selector), Operating Context (3-way with amber for Fragile), Programme Maturity (3-way), Timeline (3-way). Dismissible guidance banner. Bottom bar: "Phase 1 of 3" + "Save Draft" + "Review & Continue →".

Props: `data` (current project_meta), `onChange(field, value)`, `onContinue()`.

Uses `React.createElement` throughout. Each form field renders using the CSS classes from Plan A (`wb-label`, `wb-input`, `wb-chip`, `wb-option-card`).

Multi-select sector chips: render sector list, selected chips get `wb-chip--selected` class + checkmark SVG. "Select all that apply" helper text. At 5+ selections, show prompt: "Would you like to designate a primary sector?" (spec §6.3).

- [ ] **Step 2: Write `Phase2ToR.js`**

ToR constraints form (spec §6.5). Fields: Raw ToR text (textarea), Evaluation purpose (multi-select), Causal inference level (3-way), Comparison feasibility (4-way), Data availability (4-way), Unit of intervention (3-way), Programme complexity (3-way), Geographic scope (text), Target population (text), Evaluation questions from ToR (list with + Add).

Props: `data` (current tor_constraints), `onChange(field, value)`, `onContinue()`, `onBack()`.

- [ ] **Step 3: Write `PhaseReview.js`**

Phase transition review card (spec §6.4). Shows data grid of entered values. "Not yet specified ← Add" for empty fields. Early signal box (amber) with analytical insight. "Edit Phase N" and "Continue" buttons.

Props: `phaseNumber`, `data` (object of field→value), `earlySignals` (array of strings), `onEdit()`, `onContinue()`.

The early signal generator is a small function inside PhaseReview that checks combinations (e.g., fragile + scaling → "Experimental designs may face feasibility constraints").

- [ ] **Step 4: Write `Phase3Assessment.js`**

Score display + expandable accordion dimensions + override mechanism (spec §6.6). Large score number (48px), qualitative band, 5 expandable dimension rows. Each expanded row shows "What drove this score" + "What would improve it" + override panel ("System: X/N → Your assessment: Y/N" + justification textarea).

Override audit trail banner. Constraints box (amber). Recommendations box (green) — placed ABOVE the proceed button. "Save & Proceed to Station 1 →".

Props: `scoringResult` (from EvaluabilityScorer.score()), `overrides` (existing overrides from context), `onOverride(dimensionId, adjustedScore, justification)`, `onSave()`, `onBack()`.

- [ ] **Step 5: Write `Station0.js`**

Orchestrator for the 3-phase flow. Internal state: `currentPhase` (1/2/3), `showReview` (boolean), `phaseData` (accumulated form data). Renders the appropriate phase component based on current state.

On "Review & Continue": shows PhaseReview, then advances to next phase.
On "Save & Proceed": runs EvaluabilityScorer.score(), merges overrides, dispatches `SAVE_STATION(0, { project_meta, tor_constraints, evaluability })`.

- [ ] **Step 6: Wire Station 0 into Shell**

Modify `js/shell/Shell.js`: when `state.ui.activeStation === 0`, render `Station0` instead of the empty state placeholder. Pass `state` and `dispatch`.

- [ ] **Step 7: Update `index.html`**

Uncomment the Station 0 script tags:
```html
<script src="js/stations/station0/EvaluabilityScorer.js"></script>
<script src="js/stations/station0/Phase1Programme.js"></script>
<script src="js/stations/station0/Phase2ToR.js"></script>
<script src="js/stations/station0/Phase3Assessment.js"></script>
<script src="js/stations/station0/PhaseReview.js"></script>
<script src="js/stations/station0/Station0.js"></script>
```

- [ ] **Step 8: Browser verify**

Open workbench, create new project. Station 0 should show Phase 1 form. Complete Phase 1 → Review card with early signal → Phase 2 → Review → Phase 3 with score. Override a score, save, verify context is populated. Navigate to Station 1, verify it shows stale indicator (if Station 0 writes project_meta, Station 1 reads project_meta).

- [ ] **Step 9: Commit**

```bash
git add praxis/workbench/js/stations/station0/ praxis/workbench/js/shell/Shell.js praxis/workbench/index.html
git commit -m "feat(workbench): add Station 0 — 3-phase evaluability assessment with scoring rubric and overrides"
```

---

## Task 3: Station 2 — Indicator Bank Extraction

**Files:**
- Create: `data/indicator_bank.js`
- Source: `praxis/tools/eval-matrix-builder/index.html` (lines ~204-550)

- [ ] **Step 1: Extract constants from eval-matrix-builder**

Open `praxis/tools/eval-matrix-builder/index.html`. Copy the following constants verbatim into `data/indicator_bank.js`:
- `INDICATOR_BANK` array (290+ items)
- `OECD_DAC` array
- `HEALTH_AREAS` array
- `FRAMEWORKS` array
- `EVAL_TYPES` array
- `SECTOR_TEMPLATES` object

Wrap in an IIFE that assigns to `window.PRAXIS_INDICATOR_BANK`:

```javascript
// data/indicator_bank.js
(function() {
  'use strict';
  // ... paste extracted constants here ...
  window.PRAXIS_INDICATOR_BANK = {
    INDICATOR_BANK: INDICATOR_BANK,
    OECD_DAC: OECD_DAC,
    HEALTH_AREAS: HEALTH_AREAS,
    FRAMEWORKS: FRAMEWORKS,
    EVAL_TYPES: EVAL_TYPES,
    SECTOR_TEMPLATES: SECTOR_TEMPLATES
  };
})();
```

**CRITICAL:** Verify the `INDICATOR_BANK` array loads correctly by adding `data/indicator_bank.js` to `index.html` and checking `window.PRAXIS_INDICATOR_BANK.INDICATOR_BANK.length` in the console. Must be > 200.

- [ ] **Step 2: Commit**

```bash
git add praxis/workbench/data/indicator_bank.js
git commit -m "feat(workbench): extract indicator bank constants from eval-matrix-builder"
```

---

## Task 4: Station 2 — MatrixGenerator (Pure Function Port)

**Files:**
- Create: `js/stations/station2/MatrixGenerator.js`
- Create: `test/station2.test.html`

- [ ] **Step 1: Write test file**

Test that the ported generator produces evaluation questions from context + ToC, and that adapter functions correctly translate .praxis schema to eval-matrix-builder format.

```html
<!-- test/station2.test.html - key assertions -->
```

Test assertions:
- `praxisTocToMatrixToc(praxisToc)` converts nodes/connections to `{goal, outcomes: [{text, outputs}]}`
- `praxisContextToMatrixContext(praxisContext)` maps project_meta fields to defaultContext shape
- `generateMatrix(toc, context)` returns array of EQ row objects
- Each row has: id, criterion, question, subQuestions, indicators, dataSources, judgementCriteria, rationale
- `generateEQSuggestions(toc, context, existingRows)` returns uncovered criteria + ToC-derived questions (spec §8.3 rule engine)

- [ ] **Step 2: Run tests — verify failures**

- [ ] **Step 3: Port `MatrixGenerator.js`**

Port the pure JS functions from `eval-matrix-builder/index.html` (lines ~550-758). These are: `generateEvaluationQuestions`, `generateJudgementCriteria`, `generateMatrix`, `matchIndicators`, `flattenMatrixForExport`, `KEYWORD_INDICATOR_MAP`.

Add adapter functions:
- `praxisTocToMatrixToc(praxisToc)` — converts `.praxis.toc` nodes/connections to `{goal, outcomes: [{text, outputs}]}`
- `praxisContextToMatrixContext(praxisContext)` — converts `.praxis.project_meta` + `.praxis.tor_constraints` to the eval-matrix-builder's `defaultContext` shape

Add the EQ suggestion engine (spec §8.3):
- `generateEQSuggestions(toc, context, existingRows)` — template-based rule engine using ToC nodes × DAC criteria. Template: `"To what extent has the programme [VERB_FOR_CRITERION] [OUTCOME_NODE_TEXT]?"`. Filters out questions overlapping with existing matrix rows. Adds normative cross-cutting questions (Gender/Equity, Do No Harm).

- [ ] **Step 4: Run tests — verify pass**

- [ ] **Step 5: Commit**

```bash
git add praxis/workbench/js/stations/station2/MatrixGenerator.js praxis/workbench/test/station2.test.html
git commit -m "feat(workbench): port MatrixGenerator from eval-matrix-builder + add EQ suggestion engine"
```

---

## Task 5: Station 2 — UI Components

**Files:**
- Create: `js/stations/station2/MatrixTable.js`
- Create: `js/stations/station2/MatrixInlineEditor.js`
- Create: `js/stations/station2/AddEQModal.js`
- Create: `js/stations/station2/IndicatorSelector.js`
- Create: `js/stations/station2/MatrixExport.js`
- Create: `js/stations/station2/Station2.js`

- [ ] **Step 1: Write `MatrixTable.js`**

Table view with 6 columns: #, Criterion, Evaluation Question, Indicators, Data Sources, Judgement Criteria (spec §8.1). Sticky header row. Clickable rows (highlight with blue left border). Criterion filter pills in toolbar. Truncated Data Sources and Judgement Criteria with full text on hover (title attribute).

Props: `rows`, `selectedId`, `onSelect(rowId)`, `criterionFilter`, `onFilterChange(criterion)`.

- [ ] **Step 2: Write `MatrixInlineEditor.js`**

Inline card editor below selected table row (spec §8.2). Two-column grid: left (sub-questions + indicators with remove/add), right (data sources textarea + structured judgement criteria with template selector: Threshold/Rubric/Binary/Free text). Footer: ToC node linkages + Cancel + Save.

At Foundation tier: show Threshold as default, "Other formats" expander for Rubric/Binary/Free text.

Props: `row`, `tier`, `onSave(updatedRow)`, `onCancel()`, `onOpenIndicatorBank()`.

- [ ] **Step 3: Write `AddEQModal.js`**

Modal with auto-suggested questions and "Write your own" (spec §8.3). Suggestions from `MatrixGenerator.generateEQSuggestions()`. Each suggestion shows criterion badge, coverage status, question text, ToC linkages. Multi-select with checkboxes. "Write your own" section with text input + criterion dropdown + overlap detection.

Props: `toc`, `context`, `existingRows`, `onAdd(newRows)`, `onClose()`.

- [ ] **Step 4: Write `IndicatorSelector.js`**

Port of IndicatorBankModal from eval-matrix-builder. Search + filter by sector/framework/criterion. Shows indicator cards with source badges. Click to add to current EQ.

Props: `eqId`, `context`, `onAdd(indicator)`, `onClose()`.

- [ ] **Step 5: Write `MatrixExport.js`**

Three export functions:
- `exportMatrixAsWord(rows, context)` — HTML-to-Word table that drops into inception report annex
- `exportMatrixAsExcel(rows, context)` — SheetJS .xlsx with all 6 columns
- `exportMatrixAsJSON(rows, context)` — .praxis partial

- [ ] **Step 6: Write `Station2.js`**

Orchestrator. Checks upstream readiness (project_meta + toc). If not ready, shows context summary with prompts to complete Stations 0/1. If ready, renders:
1. Station header with upstream badges
2. Summary line ("N evaluation questions · M indicators · K DAC criteria")
3. Coverage gap nudge ("2 criteria not yet covered")
4. Toolbar: Table/Cards toggle, criterion filters, + Add EQ, Export ↓
5. MatrixTable (default view)
6. MatrixInlineEditor (opens on row click)

On "Generate Matrix" (first time): calls `MatrixGenerator.generateMatrix()` with adapter functions.
On Save: dispatches `SAVE_STATION(2, { evaluation_matrix: { context, toc_summary, rows, completed_at } })`.

- [ ] **Step 7: Wire into Shell + update `index.html`**

Add Station 2 script tags to `index.html`. Modify Shell.js to render Station2 when `activeStation === 2`.

- [ ] **Step 8: Browser verify**

Complete Station 0, navigate to Station 2. Generate matrix. Verify: table shows all 6 columns, clicking a row opens inline editor, structured judgement criteria templates work, indicator bank opens, + Add EQ shows suggestions. Export to Word/Excel/JSON.

- [ ] **Step 9: Commit**

```bash
git add praxis/workbench/js/stations/station2/ praxis/workbench/index.html praxis/workbench/js/shell/Shell.js
git commit -m "feat(workbench): add Station 2 — table-first evaluation matrix with inline editor, suggestions, export"
```

---

## Task 6: Station 5 — Instrument Scaffold + Export

**Files:**
- Create: `js/stations/station5/InstrumentScaffold.js`
- Create: `js/stations/station5/InstrumentExport.js`
- Create: `test/station5.test.html`

Build the pure logic first (TDD), then the UI.

- [ ] **Step 1: Write test file**

Test scaffold generation (EQs + indicators → instrument sections + questions) and XLSForm export structure.

Key assertions:
- `scaffoldHouseholdSurvey(matrixRows, sampleParams)` returns `{ name, type, sections: [{ label, eqId, questions }] }`
- Each question has: `id`, `text`, `responseType`, `responseConfig`, `linkedIndicatorId`
- `suggestResponseType(indicator)` returns correct type based on indicator measurement type
- `exportAsXLSForm(instrument)` returns a Blob that when read contains `survey`, `choices`, `settings` sheets
- XLSForm survey sheet has columns: `type`, `name`, `label`, `required`, `relevant`, `constraint`
- `relevant` and `constraint` columns are empty (spec §11.4 — skip logic handled in Kobo)
- Likert questions produce `select_one likertN` type with matching choice list

- [ ] **Step 2: Run tests — verify failures**

- [ ] **Step 3: Write `InstrumentScaffold.js`**

Auto-generates instruments from the evaluation matrix. Three instrument types: Household Survey (structured), KII Guide (semi-structured), FGD Guide (semi-structured).

```javascript
// Key function signatures:
// scaffoldInstruments(matrixRows, sampleParams) → [instrument, instrument, ...]
// scaffoldHouseholdSurvey(matrixRows, sampleParams) → instrument
// scaffoldKIIGuide(matrixRows) → instrument
// scaffoldFGDGuide(matrixRows) → instrument
// suggestResponseType(indicator) → { type, config }
```

Response type suggestion logic (spec §11.3):
- Percentage/count indicators → `{ type: 'numeric', config: { min: 0 } }`
- Perception/attitude indicators → `{ type: 'likert', config: { points: 5 } }`
- Binary indicators → `{ type: 'select_one', config: { options: ['Yes', 'No'] } }`
- Qualitative/descriptive → `{ type: 'text', config: {} }`

- [ ] **Step 4: Write `InstrumentExport.js`**

Three export functions:
- `exportAsXLSForm(instrument)` — `.xlsx` file with `survey`, `choices`, `settings` sheets. Uses SheetJS. Correct column structure. Empty `relevant`/`constraint` columns.
- `exportAsWord(instrument)` — Formatted HTML-to-Word document with sections, question numbers, response options
- `exportAsPDF(instrument)` — Opens browser print dialog with a formatted view

- [ ] **Step 5: Run tests — verify pass**

- [ ] **Step 6: Commit**

```bash
git add praxis/workbench/js/stations/station5/InstrumentScaffold.js praxis/workbench/js/stations/station5/InstrumentExport.js praxis/workbench/test/station5.test.html
git commit -m "feat(workbench): add InstrumentScaffold + InstrumentExport with XLSForm generation"
```

---

## Task 7: Station 5 — UI Components

**Files:**
- Create: `js/stations/station5/QuestionConfigurator.js`
- Create: `js/stations/station5/InstrumentEditor.js`
- Create: `js/stations/station5/Station5.js`

- [ ] **Step 1: Write `QuestionConfigurator.js`**

Response type selector with auto-suggestion + type-specific configuration panels (spec §11.3). Likert: scale toggle (5/4/3), editable labels, "Include Don't Know/N/A" checkbox. Multiple Choice: option list editor, single/multi toggle. Numeric: min/max/unit. Open Text: char limit. XLSForm live preview (dark panel with monospace code).

Props: `question`, `suggestedType`, `onChange(updatedQuestion)`.

- [ ] **Step 2: Write `InstrumentEditor.js`**

Two-panel layout (spec §11.3). Left sidebar (240px): instrument name, collapsible sections by EQ, question list with active highlight, export bar (XLSForm/Word/PDF). Right panel: EQ context banner, QuestionConfigurator for active question. Collapsed next-question preview below.

Props: `instrument`, `matrixRows`, `tier`, `onChange(updatedInstrument)`, `onExport(format)`.

- [ ] **Step 3: Write `Station5.js`**

Orchestrator. Landing view: instrument cards with EQ coverage badges + coverage matrix (spec §11.2). Uncovered EQs highlighted in amber. "Add Instrument" button.

On first visit with empty instruments: auto-scaffold from matrix using `InstrumentScaffold.scaffoldInstruments()`.

Clicking an instrument card opens `InstrumentEditor`.

Skip logic boundary section (spec §11.4): "Handled in KoboToolbox" badge + what-we-do / what-Kobo-does boxes + XLSForm column note.

On save: dispatches `SAVE_STATION(5, { instruments })`.

- [ ] **Step 4: Wire into Shell + update `index.html`**

Add Station 5 script tags. Modify Shell.js to render Station5 when `activeStation === 5`.

- [ ] **Step 5: Browser verify**

Complete Station 0 → generate matrix in Station 2 → navigate to Station 5. Verify: instruments auto-scaffolded, coverage matrix shows EQ coverage, clicking instrument opens editor, question configurator works with all response types, XLSForm preview updates live, export produces valid `.xlsx`.

Test XLSForm import: download the `.xlsx`, import into KoboToolbox (or open in Excel and verify sheet structure).

- [ ] **Step 6: Commit**

```bash
git add praxis/workbench/js/stations/station5/ praxis/workbench/index.html praxis/workbench/js/shell/Shell.js
git commit -m "feat(workbench): add Station 5 — instrument builder with structured configurator and XLSForm export"
```

---

## Task 8: Integration Test — End-to-End Flow

- [ ] **Step 1: Full workflow test**

Open workbench → New Evaluation (Foundation tier) → Station 0:
1. ☐ Phase 1: Fill programme details (PVE + Livelihoods sectors, Fragile context, Scaling maturity)
2. ☐ Phase 1 Review: Early signal appears ("Fragile context with scaling programme...")
3. ☐ Phase 2: Fill ToR constraints (contribution analysis, natural comparison, routine data)
4. ☐ Phase 2 Review: Shows all entered values
5. ☐ Phase 3: Evaluability score appears with 5 dimensions
6. ☐ Phase 3: Expand Comparison dimension, override score with justification
7. ☐ Phase 3: Audit trail banner shows "1 score adjusted"
8. ☐ Phase 3: Recommendations appear ABOVE the Save button
9. ☐ Save → Station 1 shows stale indicator in rail

Navigate to Station 2:
10. ☐ Upstream badges show ToC and evaluability data
11. ☐ Generate Matrix → table populates with evaluation questions
12. ☐ All 6 columns visible (including truncated Data Sources and Judgement Criteria)
13. ☐ Click row → inline editor opens with sub-questions, indicators, structured judgement criteria
14. ☐ + Add EQ → suggestions based on ToC × DAC, with coverage gaps highlighted
15. ☐ Export → Word/Excel download successfully

Navigate to Station 5:
16. ☐ Instruments auto-scaffolded from matrix
17. ☐ Coverage matrix shows which EQs are covered
18. ☐ Click instrument → editor opens with sections by EQ
19. ☐ Question configurator: response type suggestion, Likert config, XLSForm preview
20. ☐ Export XLSForm → .xlsx file with correct structure

Cross-cutting:
21. ☐ Staleness: edit Station 0 → Station 2 shows stale warning
22. ☐ Persistence: refresh page → all data preserved
23. ☐ Save .praxis: download file, clear localStorage, re-open file → all data restored

- [ ] **Step 2: Fix any issues**

- [ ] **Step 3: Final commit**

```bash
git add -A praxis/workbench/
git commit -m "feat(workbench): Plan B complete — Station 0, Station 2, Station 5 fully functional"
```

---

## Plan B Complete — Next Steps

Plan B produces a workbench with three functional priority stations:
- **Station 0:** 3-phase evaluability assessment with professional judgment overrides and audit trail
- **Station 2:** Table-first evaluation matrix with inline editor, auto-suggested EQs, structured judgement criteria, Word/Excel/JSON export
- **Station 5:** Instrument builder with structured configurator, response type suggestions, XLSForm/Word/PDF export, coverage matrix

**Next:** Plan C (Integrations + Polish) adds iframe bridges for Stations 1/3/4, stubs for 6/7/8, i18n, and PWA.
