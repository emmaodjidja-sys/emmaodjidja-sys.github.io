Now I have a complete picture of every tool. I can design the complete architecture. Let me now write the definitive blueprint:

---

# PRAXIS Workbench — Complete Architecture Blueprint

## Section 1: Tech Stack Recommendation

**Decision: Option B — React 18 via CDN (no build step)**

The constraint analysis is deterministic:

- All five existing tools use React 18 via unpkg CDN with `@babel/standalone` for JSX transpilation. This is not a compromise — it is the established pattern for the entire PRAXIS toolkit.
- GitHub Pages serves static files only. A build step (Vite) would require a CI/CD pipeline or manual `dist/` commits. Neither is appropriate for a solo practitioner deploying from Windows.
- The offline-first requirement is a service worker concern, not a framework concern. A CDN-loaded React app can be fully cached by a service worker on first load.
- The "shared React state tree" specified in the spec maps exactly to a single top-level `useState`/`useReducer` in the workbench's `App` component.

The only genuine cost of this choice: no tree-shaking, no TypeScript, slightly slower first load (~200KB React + Babel). All are acceptable given the constraints.

**One important clarification on "React via CDN":** `@babel/standalone` transpiles JSX at runtime in the browser. This is fine for development but adds ~200ms parse overhead. For the workbench, which will be larger than individual tools, use `React.createElement` calls directly (like the sample size calculator already does) for the core orchestration layer, and allow individual station panels to use JSX where complexity justifies it.

---

## Section 2: Patterns and Conventions Found

From reading the five existing tools:

**CSS Variables (all tools):** `--navy: #0B1A2E`, `--teal: #2EC4B6`, `--teal-dark: #1a9e92`, `--bg: #F1F5F9`, `--surface: #FFFFFF`, `--border: #E2E8F0`, `--text: #0F172A`, `--slate: #64748B`. These must be preserved exactly in the workbench design tokens.

**Font:** `DM Sans` (400/500/600/700) loaded from Google Fonts. Monospace: `JetBrains Mono` used in indicator-bank and data-explorer.

**State pattern:** All tools use `useState` + `useReducer` or a custom `useUndoReducer`. No external state library. The ToC Builder has the most sophisticated pattern (undo/redo history stack). The workbench will adopt the same `useReducer` pattern at the top level.

**LocalStorage pattern:** Each tool independently saves to a namespaced `localStorage` key (e.g. `praxis-eval-matrix-draft`, a key in indicator-bank). The workbench will replace this with a single `praxis-workbench-context` key that serializes the entire `.praxis` JSON object.

**No inter-tool communication exists.** None of the tools use `postMessage`, `BroadcastChannel`, or any shared state mechanism. Integration is zero — the workbench must build the bridge layer from scratch.

**Tool data exports are well-structured JSON.** The ToC Builder exports: `{title, narrative, nodes, connections, knowledge_sources}`. The eval-matrix-builder exports: `{version, context, toc, matrix}`. These map directly to the `.praxis` schema fields.

**React without JSX (sample-size-calculator):** Uses `var h = React.createElement` throughout. This is the recommended pattern for performance-critical or deeply nested components in the workbench shell.

---

## Section 3: Schema Contract — The `.praxis` JSON Object

This is the canonical type definition every station reads from and writes to:

```
{
  "version": "1.0",
  "schema": "praxis-workbench",
  "created_at": "<ISO 8601>",
  "updated_at": "<ISO 8601>",

  "project_meta": {
    "title": "",
    "programme_name": "",
    "organisation": "",
    "country": "",
    "sector_template": "",          // from eval-matrix-builder: SECTOR_TEMPLATES keys
    "health_areas": [],             // eval-matrix-builder: HEALTH_AREAS keys
    "frameworks": [],               // eval-matrix-builder: FRAMEWORKS keys
    "evaluation_type": "",          // eval-matrix-builder: EVAL_TYPES id
    "operating_context": "",        // "stable" | "fragile" | "humanitarian"
    "budget": "",                   // "low" | "medium" | "high"
    "timeline": "",                 // "short" | "medium" | "long"
    "programme_maturity": "",       // "pilot" | "scaling" | "mature" | "completed"
    "languages": ["en"]
  },

  "protection": {
    "sensitivity": "standard",      // "standard" | "sensitive" | "highly_sensitive"
    "ai_permitted": true,
    "sharing_guidance": "",
    "encryption_recommended": false,
    "access_notes": ""
  },

  "tor_constraints": {
    "raw_text": "",
    "evaluation_purpose": [],       // from Design Advisor: QUESTIONS[0].options values
    "causal_inference_level": "",   // "attribution" | "contribution" | "description"
    "comparison_feasibility": "",   // "randomisable" | "natural" | "threshold" | "none"
    "data_available": "",           // "baseline_endline" | "timeseries" | "routine_only" | "minimal"
    "unit_of_intervention": "",     // "individual" | "cluster" | "system"
    "programme_complexity": "",     // "simple" | "complicated" | "complex"
    "geographic_scope": "",
    "target_population": "",
    "evaluation_questions_raw": []  // free-text EQs from ToR if any
  },

  "evaluability": {
    "score": null,                  // 0-100
    "data_readiness": null,         // "none" | "partial" | "good"
    "toc_clarity": null,            // "none" | "partial" | "good"
    "stakeholder_access": null,     // "none" | "partial" | "good"
    "timeline_adequate": null,      // boolean
    "blockers": [],
    "recommendations": [],
    "completed_at": null
  },

  "toc": {
    // Directly from ToC Builder exportJSON() format
    "title": "",
    "narrative": {
      "description": "",
      "context": "",
      "theory": "",
      "systemAssumptions": []       // [{id, text, status, knowledge_source}]
    },
    "nodes": [],                    // [{id, title, description, level, x, y,
                                    //   indicators, assumptions, timeframe,
                                    //   knowledge_source, traceability_code}]
    "connections": [],              // [{id, sourceId, targetId, evidence,
                                    //   assumptions, bidirectional, traceability_code}]
    "knowledge_sources": {},
    "completed_at": null
  },

  "evaluation_matrix": {
    // Directly from eval-matrix-builder exportJSON() format
    "context": {                    // eval-matrix-builder defaultContext shape
      "programmeName": "",
      "sectorTemplate": "",
      "healthAreas": [],
      "frameworks": [],
      "evaluationType": "",
      "operatingContext": "",
      "dacCriteria": []
    },
    "toc_summary": {                // eval-matrix-builder defaultToc shape
      "goal": "",
      "outcomes": [],
      "assumptions": [],
      "inputMode": "structured",
      "freeText": ""
    },
    "rows": [],                     // matrix array: [{id, criterion, question,
                                    //   subQuestions, indicators, dataSources,
                                    //   disaggregation, judgementCriteria,
                                    //   rationale, _outcomeText, _isEquity}]
    "completed_at": null
  },

  "design_recommendation": {
    // From Design Advisor scoreDesigns() output
    "answers": {},                  // QUESTIONS id -> selected value
    "ranked_designs": [],           // [{id, name, family, score, reasons, ...}]
    "selected_design": null,        // id of chosen design
    "justification": "",
    "completed_at": null
  },

  "sample_parameters": {
    // From Sample Size Calculator state
    "design_id": "",                // DESIGNS[].id (e.g. "clusterRCT")
    "params": {},                   // DEFAULT_PARAMS shape for chosen design_id
    "result": {},                   // calc output object (primary, label, etc.)
    "qualitative_plan": {
      "purpose": "",
      "methods": [],
      "contexts": {},               // access, scope, heterogeneity, sensitivity, resources, depth
      "breakdown": []               // [{method, count, notes}]
    },
    "completed_at": null
  },

  "instruments": {
    "items": [],                    // [{id, title, type, linked_eq_ids,
                                    //   linked_indicator_ids, questions, status}]
    "completed_at": null
  },

  "analysis_plan": {
    "quantitative": [],             // [{eq_id, method, software, notes}]
    "qualitative": [],              // [{eq_id, approach, notes}]
    "completed_at": null
  },

  "report_structure": {
    "sections": [],                 // [{id, title, linked_eq_ids, notes}]
    "completed_at": null
  },

  "presentation": {
    "slides": [],
    "completed_at": null
  },

  "staleness": {
    // Tracks which stations are stale (upstream changed since downstream was last completed)
    "0": false,
    "1": false,
    "2": false,
    "3": false,
    "4": false,
    "5": false,
    "6": false,
    "7": false,
    "8": false
  },

  "reviews": []                     // [{station_id, reviewer, timestamp, notes, approved}]
}
```

---

## Section 4: Complete File Tree

Every file that will exist at `C:\Users\emmao\deploy-site\praxis\workbench\`:

```
praxis/workbench/
│
├── index.html                    # Single entry point. Loads all scripts, mounts React root.
│
├── sw.js                         # Service worker. Precaches all workbench assets. Network-first for CDN, cache-first for local.
│
├── manifest.json                 # PWA manifest for installability.
│
├── css/
│   ├── tokens.css                # CSS custom properties. Single source for all design tokens.
│   ├── layout.css                # Shell layout: sidebar rail, station panel, header.
│   ├── components.css            # Reusable UI: buttons, badges, modals, toasts, forms.
│   ├── stations.css              # Station-specific overrides and panel styles.
│   └── sensitivity.css           # Sensitivity layer styles (amber/red banners, overlays).
│
├── js/
│   ├── schema.js                 # PRAXIS_SCHEMA constant. Default empty .praxis object factory.
│   │                             # Also exports STALENESS_MAP (which stations depend on which).
│   │
│   ├── context.js                # PraxisContext: the shared state container.
│   │                             # Exports: createStore(), reducer(), ACTION_TYPES.
│   │                             # Handles: load/save to localStorage, .praxis file I/O,
│   │                             # staleness propagation on every station write.
│   │
│   ├── staleness.js              # UPSTREAM_DEPS map. computeStaleness(stationId, context).
│   │                             # Called by reducer on every SAVE_STATION action.
│   │
│   ├── protection.js             # Sensitivity utilities. isSensitive(), isHighlySensitive(),
│   │                             # getAiPermission(), getSharingGuidance().
│   │                             # Sensitivity gate component factory.
│   │
│   ├── i18n.js                   # Locale loader. Loads lang/en.json (or fr.json).
│   │                             # Exports: t(key) translation function.
│   │
│   ├── router.js                 # Hash-based router. Parses #station=N&mode=X.
│   │                             # Exports: getRoute(), navigate().
│   │
│   ├── utils.js                  # uid(), debounce(), formatDate(), deepMerge(),
│   │                             # downloadFile(), readFileAsJSON().
│   │
│   │── app.js                    # Root App component (React.createElement only, no JSX).
│   │                             # Owns the top-level useReducer. Renders Shell.
│   │
│   ├── shell/
│   │   ├── Shell.js              # Outer layout: TopBar + StationRail + ActivePanel + ContextDrawer.
│   │   ├── TopBar.js             # Project title, sensitivity badge, file ops, user tier selector.
│   │   ├── StationRail.js        # Left nav: 9 station icons with staleness indicators.
│   │   ├── ContextDrawer.js      # Right panel: shows live .praxis context summary.
│   │   │                         # Togglable. Shows staleness tree.
│   │   └── EntryModal.js         # First-launch modal: New / Open / Enter Station N / Quick Mode.
│   │
│   ├── stations/
│   │   ├── station0/
│   │   │   ├── Station0.js       # Evaluability & Scoping. PRIORITY BUILD.
│   │   │   │                     # Reads: project_meta, tor_constraints.
│   │   │   │                     # Writes: evaluability (score, data_readiness, blockers).
│   │   │   │                     # Also populates project_meta from intake form.
│   │   │   └── EvaluabilityScorer.js  # Scoring logic. Produces 0-100 evaluability score.
│   │   │
│   │   ├── station1/
│   │   │   ├── Station1.js       # ToC Builder wrapper. INTEGRATION.
│   │   │   │                     # Reads: toc (to pre-populate if returning).
│   │   │   │                     # Writes: toc (on save/export events from embedded tool).
│   │   │   ├── TocBridge.js      # Bridge between the iframe-embedded ToC tool and .praxis context.
│   │   │   │                     # Listens for postMessage from iframe. Translates ToC exportJSON()
│   │   │   │                     # format to praxis.toc schema. Writes back on "Import to Workbench".
│   │   │   └── TocInline.js      # Alternative: lightweight inline ToC editor for simple ToCs.
│   │   │                         # Used when user doesn't need the full canvas tool.
│   │   │
│   │   ├── station2/
│   │   │   ├── Station2.js       # Evaluation Matrix Generator. PRIORITY BUILD. THE SPINE.
│   │   │   │                     # Reads: project_meta, toc, tor_constraints, evaluability.
│   │   │   │                     # Writes: evaluation_matrix.
│   │   │   │                     # Embeds the full eval-matrix-builder logic directly (not iframe).
│   │   │   ├── MatrixGrid.js     # The interactive EQ grid (card and table views).
│   │   │   ├── MatrixGenerator.js# Port of generateMatrix() and generateEvaluationQuestions()
│   │   │   │                     # from eval-matrix-builder. Receives context from .praxis.
│   │   │   ├── IndicatorSelector.js  # Port of IndicatorBankModal from eval-matrix-builder.
│   │   │   └── MatrixExport.js   # Excel, Word, JSON export. Ports of exportExcel/exportWord/exportJSON.
│   │   │
│   │   ├── station3/
│   │   │   ├── Station3.js       # Design Advisor wrapper. INTEGRATION.
│   │   │   │                     # Reads: tor_constraints (pre-fills 8 of 10 answers automatically).
│   │   │   │                     # Writes: design_recommendation.
│   │   │   └── DesignBridge.js   # Translates tor_constraints fields to QUESTIONS answer format.
│   │   │                         # Maps: purpose->evaluation_purpose, causal->causal_inference_level,
│   │   │                         # comparison->comparison_feasibility, data->data_available, etc.
│   │   │
│   │   ├── station4/
│   │   │   ├── Station4.js       # Sample Size Calculator wrapper. INTEGRATION.
│   │   │   │                     # Reads: design_recommendation (selects design_id),
│   │   │   │                     # evaluation_matrix (for context params).
│   │   │   │                     # Writes: sample_parameters.
│   │   │   └── SampleBridge.js   # Translates design_recommendation.selected_design to
│   │   │                         # Sample Calculator design_id. Writes result back on save.
│   │   │
│   │   ├── station5/
│   │   │   ├── Station5.js       # Instrument Builder. PRIORITY BUILD.
│   │   │   │                     # Reads: evaluation_matrix (for EQs and indicators).
│   │   │   │                     # Writes: instruments.
│   │   │   ├── InstrumentEditor.js   # Question editor with EQ/indicator linking.
│   │   │   └── InstrumentExport.js   # Export instrument as Word/PDF/KoboXLSForm-style JSON.
│   │   │
│   │   ├── station6/
│   │   │   └── Station6.js       # Analysis Framework. PLANNED stub.
│   │   │                         # Reads: evaluation_matrix, instruments, sample_parameters.
│   │   │                         # Writes: analysis_plan. Shows "coming soon" with structure preview.
│   │   │
│   │   ├── station7/
│   │   │   └── Station7.js       # Report Builder. PLANNED stub.
│   │   │                         # Reads: evaluation_matrix, analysis_plan.
│   │   │                         # Writes: report_structure. Shows "coming soon" with structure preview.
│   │   │
│   │   └── station8/
│   │       ├── Station8.js       # Deck Generator. INTEGRATION.
│   │       │                     # Reads: evaluation_matrix, design_recommendation, sample_parameters.
│   │       │                     # Writes: presentation.
│   │       └── DeckBridge.js     # Translates workbench context to deck tool format.
│   │
│   └── components/
│       ├── StationHeader.js      # Reusable: station number, title, staleness badge, save button.
│       ├── ContextSummary.js     # Mini read-only panel of upstream data feeding into current station.
│       ├── StalenessWarning.js   # Banner shown when upstream data changed since this station was saved.
│       ├── SensitivityBanner.js  # Amber/red banner based on protection.sensitivity.
│       ├── ProgressRing.js       # Completion % for the overall workbench package.
│       ├── ExperienceTierBadge.js# Foundation/Practitioner/Advanced selector.
│       ├── ToastNotification.js  # Transient feedback messages.
│       ├── Modal.js              # Generic modal wrapper.
│       ├── FileDropZone.js       # .praxis file import via drag-and-drop or click.
│       └── HelpSidebar.js        # Context-sensitive guidance panel. Tier-aware content.
│
├── lang/
│   ├── en.json                   # English strings. All UI text. Keyed by component.key.
│   └── fr.json                   # French strings (partial to start, can be expanded).
│
└── data/
    └── indicator_bank.js         # Extracted INDICATOR_BANK constant from eval-matrix-builder.
                                  # Single source of truth, imported by Station2 and Station5.
```

---

## Section 5: Component Hierarchy

```
index.html
└── App [app.js]
    ├── State: useReducer(reducer, initialState)
    ├── State: activeStation (0-8)
    ├── State: experienceTier ("foundation"|"practitioner"|"advanced")
    ├── State: drawerOpen (boolean)
    │
    ├── EntryModal [shell/EntryModal.js]  — shown only on first load, dismissed to Shell
    │
    └── Shell [shell/Shell.js]
        ├── SensitivityBanner [components/SensitivityBanner.js]
        │
        ├── TopBar [shell/TopBar.js]
        │   ├── Brand / project title (editable inline)
        │   ├── ExperienceTierBadge [components/ExperienceTierBadge.js]
        │   ├── ProgressRing [components/ProgressRing.js]
        │   ├── FileDropZone / open-file button [components/FileDropZone.js]
        │   └── Save / Export buttons
        │
        ├── StationRail [shell/StationRail.js]
        │   └── StationButton × 9
        │       ├── Station number badge
        │       ├── Station icon (SVG inline)
        │       ├── Staleness dot (amber if stale)
        │       └── Completion checkmark
        │
        ├── ActivePanel (the currently visible station)
        │   └── [One of Station0 through Station8]
        │       ├── StationHeader [components/StationHeader.js]
        │       │   ├── Station N label
        │       │   ├── Station title
        │       │   ├── StalenessWarning [components/StalenessWarning.js]
        │       │   └── Save-to-context button
        │       │
        │       ├── ContextSummary [components/ContextSummary.js]
        │       │   └── Read-only cards showing upstream data fields relevant to this station
        │       │
        │       └── [Station-specific content]
        │
        └── ContextDrawer [shell/ContextDrawer.js]  — collapsible right panel
            ├── Full .praxis JSON tree view (collapsible sections)
            ├── Staleness tree visualization
            └── Export .praxis file button
```

---

## Section 6: Data Flow Diagram

```
USER INPUT
    │
    ▼
┌──────────────────────────────────────────────────────┐
│  EntryModal                                          │
│  Mode A: New Project  →  blank .praxis schema        │
│  Mode B: Open .praxis →  deserialize JSON → state    │
│  Mode C: Enter station N directly                    │
│  Mode D: Quick Mode (station only, no project)       │
└──────────────────────┬───────────────────────────────┘
                       │ dispatch(INIT_CONTEXT, payload)
                       ▼
┌──────────────────────────────────────────────────────┐
│  App-level useReducer state                          │
│  { context: PraxisContext, ui: UIState }             │
│                                                      │
│  reducer(state, action):                             │
│    SAVE_STATION(stationId, payload)                  │
│      → merge payload into state.context[field]       │
│      → run computeStaleness(stationId, context)      │
│      → update state.context.staleness                │
│      → update state.context.updated_at               │
│    SET_SENSITIVITY(level)                            │
│      → update protection.*                           │
│    SET_TIER(tier)                                    │
│      → update ui.experienceTier                      │
└──────────────────────┬───────────────────────────────┘
                       │ context passed as prop to Shell
                       ▼
┌─────────────────────────────────┐
│  localStorage auto-persist      │
│  key: "praxis-workbench"        │
│  debounced 500ms on state change│
└─────────────────────────────────┘

STATION DATA FLOW (top-down, read-only from upstream):

project_meta ──────────────────────────────────────────────────────────┐
     │                                                                 │
     ├──► Station 0 (Evaluability)                                     │
     │        READS: project_meta, tor_constraints                     │
     │        WRITES: evaluability                                     │
     │                                                                 │
     │        evaluability ──────────────────────────────────────────┐ │
     │                                                               │ │
tor_constraints ──────────────────────────────────────────────────┐  │ │
     │                                                            │  │ │
     ├──► Station 1 (ToC Builder)                                 │  │ │
     │        READS: project_meta.title                           │  │ │
     │        WRITES: toc                                         │  │ │
     │                                                            │  │ │
     │        toc ─────────────────────────────────────────────┐ │  │ │
     │                                                         │ │  │ │
     ├──► Station 2 (Evaluation Matrix) ◄── THE SPINE          │ │  │ │
     │        READS: project_meta, toc ◄──────────────────────-┘ │  │ │
     │                tor_constraints ◄──────────────────────────┘  │ │
     │                evaluability ◄─────────────────────────────────┘ │
     │        WRITES: evaluation_matrix                                 │
     │                                                                  │
     │        evaluation_matrix ─────────────────────────────────────┐ │
     │                                                               │ │
     ├──► Station 3 (Design Advisor)                                 │ │
     │        READS: tor_constraints ◄───────────────────────────────┘ │
     │               project_meta ◄──────────────────────────────────  │
     │        WRITES: design_recommendation                             │
     │                                                                  │
     │        design_recommendation ─────────────────────────────────┐ │
     │                                                               │ │
     ├──► Station 4 (Sample Size)                                    │ │
     │        READS: design_recommendation ◄─────────────────────────┘ │
     │               evaluation_matrix                                  │
     │        WRITES: sample_parameters                                 │
     │                                                                  │
     │        sample_parameters + instruments (below) ───────────────┐  │
     │                                                               │  │
     ├──► Station 5 (Instrument Builder)                             │  │
     │        READS: evaluation_matrix ◄────────────────────────────┘  │
     │               (linked EQs, indicators per row)                   │
     │        WRITES: instruments                                       │
     │                                                                  │
     ├──► Station 6 (Analysis Framework)                               │
     │        READS: evaluation_matrix, instruments, sample_parameters  │
     │        WRITES: analysis_plan                                     │
     │                                                                  │
     ├──► Station 7 (Report Builder)                                   │
     │        READS: evaluation_matrix, analysis_plan                   │
     │        WRITES: report_structure                                  │
     │                                                                  │
     └──► Station 8 (Deck Generator)                                   │
              READS: evaluation_matrix, design_recommendation,          │
                     sample_parameters, report_structure                │
              WRITES: presentation                                      │
```

**Staleness propagation rule:** `UPSTREAM_DEPS` in `staleness.js` maps each station to the context fields it reads. When `SAVE_STATION(N, payload)` fires, all stations M where `UPSTREAM_DEPS[M]` intersects with the fields written by station N get flagged `staleness[M] = true`. Station N itself gets `staleness[N] = false`.

---

## Section 7: Integration Strategy for Existing Tools

Each live tool is a standalone HTML page. The integration strategy uses **three tiers** depending on the tool's complexity:

**Tier A — Full Port into Station (Station 2: Eval Matrix Builder)**

The eval-matrix-builder logic is already modular. Its three script blocks (INDICATOR_BANK constants, the pure JS `generateMatrix()`/`flattenMatrixForExport()` functions, and the React JSX components) are separated by comment blocks. Extract them into:
- `data/indicator_bank.js` (the INDICATOR_BANK array, OECD_DAC, HEALTH_AREAS, FRAMEWORKS, EVAL_TYPES, SECTOR_TEMPLATES constants)
- `js/stations/station2/MatrixGenerator.js` (the pure functions: `generateMatrix`, `generateEvaluationQuestions`, `matchIndicators`, `generateJudgementCriteria`, `flattenMatrixForExport`)
- `js/stations/station2/MatrixGrid.js` (the React components: EQ card, table view, indicator bank modal)
- `js/stations/station2/MatrixExport.js` (the export functions: Excel, Word, JSON)

The context seed for `generateMatrix(toc, context)` comes directly from `.praxis.project_meta` and `.praxis.toc`. Station 2 constructs the `context` object as: `{ programmeName: praxis.project_meta.programme_name, healthAreas: praxis.project_meta.health_areas, frameworks: praxis.project_meta.frameworks, evaluationType: praxis.project_meta.evaluation_type, operatingContext: praxis.project_meta.operating_context, dacCriteria: praxis.tor_constraints.dac_criteria || all_6 }`.

**Tier B — Embedded Panel with Bridge (Stations 1, 3, 4)**

The ToC Builder, Design Advisor, and Sample Size Calculator are complex canvas/multi-step tools. Rewriting them is unnecessary and risky. Use a Bridge pattern:

1. Load the tool inside a same-origin iframe: `<iframe src="/praxis/tools/toc-builder/" id="toc-frame">`.
2. On mount, inject context via `postMessage` to the iframe: `frame.contentWindow.postMessage({type:'PRAXIS_INIT', payload: praxis.toc}, '*')`.
3. The tool needs a small addition: a `window.addEventListener('message', handler)` that accepts `PRAXIS_INIT` and hydrates its state, and a `PRAXIS_EXPORT` trigger that posts back its current JSON export.
4. The bridge component listens for `PRAXIS_EXPORT` messages and dispatches `SAVE_STATION` to the workbench reducer.

**This requires one small addition to each live tool** — a `postMessage` listener/emitter block of ~15 lines. The existing tools are otherwise untouched.

For Station 3 (Design Advisor), the bridge pre-answers as many of the 10 questions as possible from `tor_constraints`, passing an initial `answers` object. The user reviews and can override before the advisor scores designs.

For Station 4 (Sample Size Calculator), the bridge pre-selects the design type from `design_recommendation.selected_design` and passes the evaluation context.

**Tier C — Stub with External Link (Station 8: Deck Generator)**

Station 8 is marked as LIVE but the deck generator tool has different UX requirements. For now, Station 8 renders a structured data summary drawn from the workbench context, plus an "Open Deck Generator" button that navigates to `/praxis/tools/deck-generator/` in a new tab, with context passed via URL query parameters or `sessionStorage`.

---

## Section 8: Implementation Map — Every File with Detailed Change Descriptions

### Files to CREATE:

**`/praxis/workbench/index.html`**
Single HTML file. Contains: DOCTYPE, meta tags, service worker registration, CDN script tags (React 18, ReactDOM 18, optionally Babel standalone, XLSX for station 2), Google Fonts link, CSS link tags for all 5 CSS files, one `<div id="root">`, then `<script>` tags loading js files in dependency order: schema.js, utils.js, i18n.js, staleness.js, protection.js, context.js, router.js, data/indicator_bank.js, then all component files, then app.js which calls `ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App))`.

**`/praxis/workbench/sw.js`**
Service worker using the Cache-first strategy for local files, network-first for CDN resources. Precaches: index.html, all CSS, all JS, lang/*.json, data/indicator_bank.js, logo.svg. Cache name: `praxis-workbench-v1`. On activate: delete old caches. On fetch: for same-origin requests, try cache first; for CDN requests (unpkg.com, fonts.googleapis.com), try network first with cache fallback.

**`/praxis/workbench/manifest.json`**
PWA manifest: `name: "PRAXIS Workbench"`, `short_name: "PRAXIS"`, `start_url: "/praxis/workbench/"`, `display: "standalone"`, `background_color: "#0B1A2E"`, `theme_color: "#2EC4B6"`, `icons: [{ src: "/praxis/logo.svg", sizes: "any", type: "image/svg+xml" }]`.

**`/praxis/workbench/css/tokens.css`**
All CSS custom properties. Extend existing tool tokens with workbench-specific additions: `--wb-rail-width: 64px`, `--wb-drawer-width: 320px`, `--wb-station-header-height: 56px`, `--wb-topbar-height: 48px`, tier-specific tokens: `--tier-foundation: #10B981`, `--tier-practitioner: #3B82F6`, `--tier-advanced: #8B5CF6`, staleness tokens: `--stale-color: #F59E0B`, sensitivity tokens: `--sens-sensitive-bg: #FEF3C7`, `--sens-highly-bg: #FEE2E2`.

**`/praxis/workbench/css/layout.css`**
`.wb-app`: full viewport, flex column. `.wb-shell`: flex row, height calc(100vh - var(--wb-topbar-height)). `.wb-rail`: fixed width 64px, flex column, navy background. `.wb-main`: flex 1, overflow hidden. `.wb-panel`: flex 1, overflow-y auto, padding. `.wb-drawer`: fixed width 320px, right panel, collapsible with transform transition. Responsive breakpoints: rail collapses to bottom bar on mobile.

**`/praxis/workbench/css/components.css`**
All shared component styles: `.wb-btn-*`, `.wb-badge-*`, `.wb-modal-*`, `.wb-toast`, `.wb-form-*`, `.wb-card`, `.wb-progress-ring`, `.wb-tier-pill`. Must be non-conflicting with existing tool styles (all workbench classes use `.wb-` prefix).

**`/praxis/workbench/css/stations.css`**
Station panel layouts. `.station-0` through `.station-8`. Each has: `.station-panel` (full height flex column), `.station-content` (flex 1, overflow-y auto), `.station-empty-state` (centered content for unstarted stations).

**`/praxis/workbench/css/sensitivity.css`**
`.sensitivity-banner-sensitive`: amber top bar. `.sensitivity-banner-highly`: red top bar with pulse animation. `.sensitivity-overlay`: red border overlay for highly sensitive mode. `.ai-blocked-notice`: shown when AI features are suppressed.

**`/praxis/workbench/js/schema.js`**
Exports: `PRAXIS_VERSION = "1.0"`, `createEmptyContext()` — returns the full empty `.praxis` object (matches schema contract above). `STATION_FIELDS` map — which context keys each station writes. `STATION_LABELS` array — human names for stations 0-8.

**`/praxis/workbench/js/staleness.js`**
`UPSTREAM_DEPS` object: maps station id (0-8) to array of context field paths it reads. Example: `{ 2: ["project_meta", "toc", "tor_constraints", "evaluability"], 3: ["tor_constraints", "project_meta"], 4: ["design_recommendation", "evaluation_matrix"] }`. Exports `computeStaleness(changedStationId, context)` — returns updated `staleness` object with downstream stations flagged.

**`/praxis/workbench/js/context.js`**
The Redux-style store for the workbench. `ACTION_TYPES` object. `reducer(state, action)` handles: `INIT`, `LOAD_FILE`, `SAVE_STATION`, `SET_SENSITIVITY`, `SET_TIER`, `SET_ACTIVE_STATION`, `TOGGLE_DRAWER`, `UPDATE_PROJECT_META`, `CLEAR_PROJECT`. Auto-persists to `localStorage.setItem('praxis-workbench', JSON.stringify(state.context))` inside a debounced effect in `app.js`.

**`/praxis/workbench/js/protection.js`**
Pure functions. `isSensitive(context)` returns true if `protection.sensitivity !== 'standard'`. `isHighlySensitive(context)` returns true if `protection.sensitivity === 'highly_sensitive'`. `getAiPermission(context)` returns `protection.ai_permitted`. `getSharingGuidance(context)` returns a guidance string. `SENSITIVITY_LEVELS` constant with labels and display properties.

**`/praxis/workbench/js/i18n.js`**
Synchronous module. Loads lang JSON via XMLHttpRequest (synchronous, small files). Exports `t(key, vars)` translation function. Falls back to English if key not found. `setLocale(lang)` function reloads strings.

**`/praxis/workbench/js/router.js`**
Hash-based routing. `getRoute()` parses `window.location.hash` into `{station, mode, params}`. `navigate(station, mode, params)` updates hash. Exports `ROUTES` object. On hash change, fires `dispatchRouteChange` custom event.

**`/praxis/workbench/js/utils.js`**
`uid(prefix)` — generates `prefix + Date.now().toString(36) + Math.random().toString(36).slice(2)`. `debounce(fn, ms)`. `formatDate(iso)`. `deepMerge(target, source)` — for merging partial station payloads into context. `downloadJSON(obj, filename)`. `downloadBlob(blob, filename)`. `readFileAsJSON(file)` — returns Promise. `clamp(val, min, max)`.

**`/praxis/workbench/js/app.js`**
Root React component. `const [state, dispatch] = React.useReducer(reducer, getInitialState())`. `getInitialState()` tries localStorage, else returns `{context: createEmptyContext(), ui: defaultUI}`. `useEffect` for localStorage auto-persist (debounced 500ms). Renders: if `!state.ui.projectLoaded`, renders `EntryModal`. Else renders `Shell`. Passes `{state, dispatch}` as props down. Mounts with `ReactDOM.createRoot`.

**`/praxis/workbench/js/shell/Shell.js`**
Renders the outer layout. Computes: `const isHighlySensitive = protection.isHighlySensitive(state.context)`. Renders `SensitivityBanner` if sensitive/highly-sensitive. Renders `TopBar`, `StationRail`, active station panel, `ContextDrawer`.

**`/praxis/workbench/js/shell/TopBar.js`**
48px height, navy background. Left: PRAXIS logo + "Workbench" label, separator, editable project title (inline text input). Center: ProgressRing. Right: ExperienceTierBadge, sensitivity badge pill, "Save .praxis" button, "Open file" button.

**`/praxis/workbench/js/shell/StationRail.js`**
64px wide column. 9 station buttons. Each: 48x48px icon area, station number badge (top-left), amber dot if `staleness[N]`, green checkmark if `completed_at` is set. Active station highlighted with teal left border. Overflow: "Help" icon at bottom, "Settings" icon at bottom.

**`/praxis/workbench/js/shell/ContextDrawer.js`**
320px right drawer. Toggled via `drawerOpen` state. Shows: project meta summary at top, then collapsible sections for each context field that has been populated. A "staleness tree" showing dependency arrows. "Export .praxis" button at bottom.

**`/praxis/workbench/js/shell/EntryModal.js`**
Shown on first load when no project is active. Four cards: "New Project" (initializes blank context, goes to Station 0), "Open .praxis" (FileDropZone, loads file), "Enter Station" (dropdown 0-8, enters quick mode), "Continue" (if localStorage has a saved context, shows project title and continues). Handles the experience tier selector.

**`/praxis/workbench/js/stations/station0/Station0.js`**
Station 0: Evaluability and Scoping. Multi-step form. Step 1: Project intake (programme name, sector, country, operating context). Step 2: ToR constraints (all fields from `tor_constraints` schema). Step 3: Evaluability assessment (runs EvaluabilityScorer, shows score with breakdown). Step 4: Recommendations. On save: dispatches `SAVE_STATION(0, {project_meta: {...}, tor_constraints: {...}, evaluability: {...}})`.

**`/praxis/workbench/js/stations/station0/EvaluabilityScorer.js`**
Pure function `scoreEvaluability(torConstraints, projectMeta)`. Scoring rubric (0-100): data availability (25 pts: +25 baseline_endline, +15 timeseries/routine_only, +5 minimal), ToC clarity (+20 if toc has nodes), timeline adequacy (+20 short with complex design = penalty, long with simple = bonus), operating context (+15 stable, 0 fragile, -10 humanitarian with experimental design), comparison feasibility (+20 randomisable/natural/threshold, 0 none). Returns `{score, data_readiness, toc_clarity, stakeholder_access, timeline_adequate, blockers[], recommendations[]}`.

**`/praxis/workbench/js/stations/station1/Station1.js`**
Station 1 panel. If `context.toc.nodes.length > 0`, shows ToC summary (node count, level breakdown) with "Edit in ToC Builder" button and "Use inline editor" button. If empty, shows "Build your Theory of Change" CTA with same two options. The full-canvas option opens the ToC Builder in an iframe overlay. The inline option renders `TocInline.js`.

**`/praxis/workbench/js/stations/station1/TocBridge.js`**
React hook `useTocBridge(frameRef, onExport)`. Adds `window.addEventListener('message', handler)` on mount. Handles message types: `TOC_READY` (tool loaded, post back `PRAXIS_INIT` with existing toc data), `TOC_EXPORT` (receives the exportJSON payload, calls `onExport(tocData)`). When user clicks "Save to Workbench" inside the iframe, the tool posts `TOC_EXPORT`. The bridge translates this to dispatch `SAVE_STATION(1, {toc: payload})`.

**`/praxis/workbench/js/stations/station1/TocInline.js`**
Lightweight ToC editor for simple cases. Structured input mode only (no canvas): text fields for goal, outcomes array, outputs per outcome, system assumptions. Produces the same schema as the full ToC Builder's exportJSON (title, narrative, nodes inferred from text, connections inferred from hierarchy). For Foundation tier users who don't need the canvas.

**`/praxis/workbench/js/stations/station2/Station2.js`**
The spine. Receives the full context as prop. On mount, checks if `project_meta.programme_name` is set and `toc.nodes.length > 0`. If not, shows `ContextSummary` with prompts to complete Stations 0/1. If yes, shows the Matrix Generator interface. Manages local `matrixState` (the array of EQ rows). On "Generate Matrix" click, calls `generateMatrix(praxisTocToMatrixToc(context.toc), praxisContextToMatrixContext(context))` from `MatrixGenerator.js`. Renders `MatrixGrid`. On "Save", dispatches `SAVE_STATION(2, {evaluation_matrix: {context, toc_summary, rows: matrix, completed_at}})`.

**`/praxis/workbench/js/stations/station2/MatrixGenerator.js`**
Direct port of the pure JS functions from `eval-matrix-builder/index.html` (lines 550-758): `generateEvaluationQuestions`, `generateJudgementCriteria`, `generateMatrix`, `matchIndicators`, `flattenMatrixForExport`, `KEYWORD_INDICATOR_MAP`. These are pure functions with no DOM dependency. Adapter functions: `praxisTocToMatrixToc(praxisToc)` converts `.praxis.toc` nodes/connections to `{goal, outcomes: [{text, outputs}]}`. `praxisContextToMatrixContext(praxisContext)` converts `.praxis.project_meta` and `.praxis.tor_constraints` to the `defaultContext` shape.

**`/praxis/workbench/js/stations/station2/MatrixGrid.js`**
Port of the React components from `eval-matrix-builder/index.html` (the JSX portion): EQ cards in card and table view, sub-question editing, indicator tag display, data source tags. Receives `matrix` (array) and `onChange(matrix)` as props. Receives `onOpenBank(eqId)` for indicator selection.

**`/praxis/workbench/js/stations/station2/IndicatorSelector.js`**
Port of `IndicatorBankModal` from eval-matrix-builder. Receives `eqId`, `matrix`, `context`, `onAdd`, `onClose`. Imports `INDICATOR_BANK` from `data/indicator_bank.js`.

**`/praxis/workbench/js/stations/station2/MatrixExport.js`**
Port of `exportExcel`, `exportWord`, `exportJSON` from eval-matrix-builder. Adapts to receive the full praxis context. The JSON export function now produces a `.praxis` partial (just the `evaluation_matrix` field) rather than the standalone format.

**`/praxis/workbench/js/stations/station3/Station3.js`**
Station 3 panel. `DesignBridge.js` converts `context.tor_constraints` to the 10-question answer object. Shows the pre-answered answers in a read-only summary ("8 of 10 questions pre-filled from your ToR"). The user can override any answer. Renders the full `scoreDesigns(answers)` ranked results from the Design Advisor logic. "Select this design" button stores `design_recommendation.selected_design = designId`. On save: dispatches `SAVE_STATION(3, {design_recommendation})`.

**`/praxis/workbench/js/stations/station3/DesignBridge.js`**
`torToDesignAnswers(torConstraints, projectMeta)` pure function. Maps: `torConstraints.evaluation_purpose[0] → answers.purpose`, `torConstraints.causal_inference_level → answers.causal`, `torConstraints.comparison_feasibility → answers.comparison`, `torConstraints.data_available → answers.data`, `torConstraints.operating_context → answers.context` (maps from project_meta), `projectMeta.budget → answers.budget`, `torConstraints.timeline → answers.timeline` (from project_meta), `projectMeta.programme_maturity → answers.maturity`, `torConstraints.programme_complexity → answers.complexity`, `torConstraints.unit_of_intervention → answers.unit`. Returns partial `answers` object (may have null values for fields not derivable from context).

**`/praxis/workbench/js/stations/station4/Station4.js`**
Station 4 panel. Shows `design_recommendation.selected_design` name at top (with link to change in Station 3). Maps the selected design ID to the sample calculator's design_id. Renders the relevant parameter panel (ports the specific design's parameter inputs from the sample size calculator). Shows results. On save: dispatches `SAVE_STATION(4, {sample_parameters})`.

**`/praxis/workbench/js/stations/station4/SampleBridge.js`**
`designRecommendationToCalculatorDesign(designRec)` — maps from Design Advisor design IDs to Sample Size Calculator design IDs. The Design Advisor uses IDs like `rct`, `clusterRCT`, `steppedWedge`, `did`, `its`, `psm`, `rdd`, `prePost`. The Sample Calculator uses `twoProportions`, `clusterRCT`, `steppedWedge`, `did`, `its`, `singleProportion`. The mapping handles: `rct → twoProportions`, `clusterRCT → clusterRCT`, `steppedWedge → steppedWedge`, `did → did`, `its → its`, all others → `twoProportions` (default). Returns `{designId, defaultParams}`.

**`/praxis/workbench/js/stations/station5/Station5.js`**
Instrument Builder. Left column: list of EQs from `evaluation_matrix.rows` with their linked indicators. Each EQ can generate instruments. Right column: instrument editor. When user selects an EQ, auto-generates a scaffold instrument based on linked indicator data collection methods. User edits question text, adds questions, sets response types. On save: dispatches `SAVE_STATION(5, {instruments})`.

**`/praxis/workbench/js/stations/station5/InstrumentEditor.js`**
Question list editor. `Question` item: text input, response type selector (Likert 1-5, multiple choice, numeric, open text, date), optional required flag, linked indicator badge. Drag-to-reorder. Add/remove questions. Section breaks.

**`/praxis/workbench/js/stations/station5/InstrumentExport.js`**
`exportInstrumentAsWord(instrument)` — styled Word document. `exportInstrumentAsKoboJSON(instrument)` — XLSForm-compatible JSON for KoboToolbox import. `exportInstrumentAsCSV(instrument)` — flat CSV of questions.

**`/praxis/workbench/js/stations/station6/Station6.js`**
Planned stub. Shows analysis framework template drawn from evaluation_matrix EQs. Table of: EQ → Method → Software → Notes. Editable. "Generate Analysis Plan" button creates scaffold from EQ criteria and indicator types. Shows "Full feature coming soon" badge. Saves partial `analysis_plan`. Foundation tier users see simplified version.

**`/praxis/workbench/js/stations/station7/Station7.js`**
Planned stub. Shows report structure template. Editable section list auto-populated from evaluation_matrix EQs. "Generate Outline" button. Shows "Full feature coming soon" badge. Saves partial `report_structure`.

**`/praxis/workbench/js/stations/station8/Station8.js`**
Deck Generator. Reads: evaluation_matrix, design_recommendation, sample_parameters. Shows a structured summary of: Programme overview, Evaluation approach, Key questions, Sample strategy, Data collection plan. "Open Deck Tool" button navigates to `/praxis/tools/deck-generator/` with `?praxis=<base64-encoded-context>` in the URL. Also provides a "Download as Summary PDF" option using the browser's print dialog.

**`/praxis/workbench/data/indicator_bank.js`**
Extracted constants from eval-matrix-builder. Assigns to `window.PRAXIS_INDICATOR_BANK` (global, since no module system): `INDICATOR_BANK`, `OECD_DAC`, `HEALTH_AREAS`, `FRAMEWORKS`, `EVAL_TYPES`, `SECTOR_TEMPLATES`. These are already fully defined in the eval-matrix-builder source. Copy verbatim.

**`/praxis/workbench/lang/en.json`**
Complete English string map. Keys organized by component: `{"shell.topbar.title": "PRAXIS Workbench", "station.0.name": "Evaluability & Scoping", ...}`. Includes all UI labels, error messages, help text, tier-specific content variants.

**`/praxis/workbench/lang/fr.json`**
French translations. Can start partial (only key station labels and common actions).

### Files to MODIFY (additions only, existing tools untouched except for the postMessage bridge):

**`/praxis/tools/toc-builder/index.html`**
Add at the bottom of the script: a `window.addEventListener('message', ...)` handler that accepts `{type: 'PRAXIS_INIT', payload: tocData}` and calls `dispatch({type: 'IMPORT', json: payload})`. Add a `postMessage` emit on the existing "Export JSON" action path: after `exportJSON(s)` is called, also call `window.parent.postMessage({type: 'TOC_EXPORT', payload: buildExportPayload(s)}, '*')`. Add a "Save to Workbench" button (visible only when `window.self !== window.top`) that triggers this postMessage. Total addition: ~25 lines at the end of the existing script.

**`/praxis/tools/evaluation-design-advisor/index.html`**
Add `window.addEventListener('message', ...)` that accepts `{type: 'PRAXIS_INIT', payload: {answers}}` and initializes the `answers` state. Add a "Save Recommendation to Workbench" button that `postMessage`s `{type: 'DESIGN_EXPORT', payload: {answers, ranked_designs: scoreDesigns(answers)}}`. Total addition: ~20 lines.

**`/praxis/tools/sample-size-calculator/index.html`**
Add `window.addEventListener('message', ...)` that accepts `{type: 'PRAXIS_INIT', payload: {designId, params}}` and sets the active design and parameters. Add "Save to Workbench" button that `postMessage`s `{type: 'SAMPLE_EXPORT', payload: {design_id, params, result, qualitative_plan}}`. Total addition: ~25 lines.

---

## Section 9: Build Sequence

Implement in this order. Dependencies noted.

**Phase 1: Foundation (no React, no stations)**
- [ ] Create `/praxis/workbench/` directory
- [ ] `css/tokens.css` — copy existing tool variables, add workbench tokens
- [ ] `css/layout.css` — shell layout only (topbar + rail + panel placeholders)
- [ ] `css/components.css` — buttons, badges, modals
- [ ] `css/stations.css` — empty station panel styles
- [ ] `css/sensitivity.css` — sensitivity banner styles
- [ ] `js/schema.js` — createEmptyContext(), STATION_FIELDS, STATION_LABELS
- [ ] `js/utils.js` — uid, debounce, deepMerge, downloadJSON, readFileAsJSON
- [ ] `js/staleness.js` — UPSTREAM_DEPS, computeStaleness
- [ ] `js/protection.js` — sensitivity utilities
- [ ] `js/i18n.js` — translation loader
- [ ] `js/router.js` — hash router
- [ ] `lang/en.json` — all English strings
- [ ] `index.html` — bare page, loads all CSS and JS, mounts `<div id="root">`

**Phase 2: Shell and App Core** (depends on Phase 1)
- [ ] `js/context.js` — reducer, ACTION_TYPES, localStorage persistence
- [ ] `js/shell/EntryModal.js` — entry modes, file import
- [ ] `js/shell/TopBar.js` — project title, file ops, tier selector
- [ ] `js/shell/StationRail.js` — 9 station icons with staleness/completion indicators
- [ ] `js/shell/Shell.js` — outer layout composition
- [ ] `js/shell/ContextDrawer.js` — right drawer with context tree
- [ ] `js/components/StationHeader.js`, `StalenessWarning.js`, `SensitivityBanner.js`
- [ ] `js/components/Modal.js`, `ToastNotification.js`, `FileDropZone.js`, `ProgressRing.js`
- [ ] `js/app.js` — root component, useReducer, renders Shell
- [ ] **Test:** Can open workbench, see empty shell, navigate between station stubs

**Phase 3: Station 0 — Evaluability and Scoping** (depends on Phase 2, PRIORITY)
- [ ] `js/stations/station0/EvaluabilityScorer.js` — pure scoring function
- [ ] `js/stations/station0/Station0.js` — 4-step intake form
- [ ] Wire to reducer: SAVE_STATION(0) updates project_meta, tor_constraints, evaluability
- [ ] **Test:** Complete Station 0, verify staleness propagation flags stations 1-8

**Phase 4: Station 2 — Evaluation Matrix** (depends on Phase 3, PRIORITY — THE SPINE)
- [ ] `data/indicator_bank.js` — extract from eval-matrix-builder (copy paste, add window.PRAXIS_INDICATOR_BANK)
- [ ] `js/stations/station2/MatrixGenerator.js` — port pure functions from eval-matrix-builder
- [ ] `js/stations/station2/MatrixGrid.js` — port React components
- [ ] `js/stations/station2/IndicatorSelector.js` — port indicator bank modal
- [ ] `js/stations/station2/MatrixExport.js` — port export functions
- [ ] `js/stations/station2/Station2.js` — wire all together with context adapter functions
- [ ] **Test:** With Station 0 complete, generate matrix, verify it reads from project_meta/toc

**Phase 5: Station 1 — ToC Builder Integration** (depends on Phase 2)
- [ ] Modify `toc-builder/index.html` — add postMessage bridge (~25 lines)
- [ ] `js/stations/station1/TocBridge.js` — useTocBridge hook
- [ ] `js/stations/station1/TocInline.js` — lightweight inline editor
- [ ] `js/stations/station1/Station1.js` — iframe overlay + inline editor switcher
- [ ] **Test:** Open ToC Builder in iframe, build a ToC, save to workbench, verify context.toc populated

**Phase 6: Station 3 — Design Advisor Integration** (depends on Phase 3)
- [ ] Modify `evaluation-design-advisor/index.html` — add postMessage bridge
- [ ] `js/stations/station3/DesignBridge.js` — tor_constraints → answers mapping
- [ ] `js/stations/station3/Station3.js` — pre-fill from context, show advisor, save recommendation
- [ ] **Test:** Verify 8/10 questions are pre-filled from Station 0 data

**Phase 7: Station 4 — Sample Size Integration** (depends on Phase 6)
- [ ] Modify `sample-size-calculator/index.html` — add postMessage bridge
- [ ] `js/stations/station4/SampleBridge.js` — design ID mapping
- [ ] `js/stations/station4/Station4.js` — pre-select design, show calculator, save params
- [ ] **Test:** Verify design pre-selected from Station 3 recommendation

**Phase 8: Station 5 — Instrument Builder** (depends on Phase 4, PRIORITY)
- [ ] `js/stations/station5/InstrumentEditor.js` — question editor
- [ ] `js/stations/station5/InstrumentExport.js` — Word, KoboJSON, CSV exports
- [ ] `js/stations/station5/Station5.js` — EQ browser + instrument editor
- [ ] **Test:** Select EQ, scaffold instrument, edit questions, export as Word

**Phase 9: Stubs and Service Worker**
- [ ] `js/stations/station6/Station6.js` — analysis plan stub
- [ ] `js/stations/station7/Station7.js` — report builder stub
- [ ] `js/stations/station8/Station8.js` — deck generator + DeckBridge
- [ ] `sw.js` — service worker with precaching
- [ ] `manifest.json` — PWA manifest
- [ ] **Test:** Offline functionality, PWA install

**Phase 10: Polish and i18n**
- [ ] `lang/fr.json` — French translations
- [ ] `js/components/HelpSidebar.js` — context-sensitive guidance
- [ ] `js/components/ExperienceTierBadge.js` — tier switching
- [ ] Tier-gated content throughout all stations (Foundation shows simplified views)
- [ ] Full staleness tree visual in ContextDrawer
- [ ] **Test:** Full end-to-end workflow from Station 0 through Station 5

---

## Section 10: Risk Assessment

**Highest Risk — postMessage Bridge Reliability**
The integration strategy for Stations 1, 3, and 4 depends on `postMessage` communication between the workbench and iframed tools. This has three failure modes: (1) same-origin policy: all tools are on the same domain, so this is fine; (2) the tool must be loaded before the `PRAXIS_INIT` message is sent — need a `TOC_READY` handshake before sending initial data; (3) the ToC Builder uses a complex `useUndoReducer` that may not cleanly accept external `IMPORT` dispatches after user has started editing. **Mitigation:** Implement the `TOC_READY` handshake carefully. For the ToC Builder, the `IMPORT` action path already exists and is tested. The risk is moderate.

**High Risk — Station 2 Port Complexity**
The eval-matrix-builder is split across two `<script>` blocks (one plain JS, one Babel/JSX). The plain JS block has `INDICATOR_BANK` (290+ items) and pure functions. The JSX block has React components. The port requires: (1) extracting all 290+ INDICATOR_BANK entries to `data/indicator_bank.js` verbatim; (2) porting `generateMatrix()` which calls `INDICATOR_BANK` by reference. If `INDICATOR_BANK` is not available in scope when `MatrixGenerator.js` loads, matrix generation silently produces empty indicators. **Mitigation:** Load `data/indicator_bank.js` before `MatrixGenerator.js` in `index.html` script order. Use `window.PRAXIS_INDICATOR_BANK` as the global reference.

**Medium Risk — Staleness Model Correctness**
The staleness propagation must be correct or users will see misleading stale/fresh indicators. The hardest case: Station 2 reads from both `toc` (Station 1) and `tor_constraints` (Station 0). If the user updates Station 0's `tor_constraints` but not `project_meta`, only Station 2 (not Station 3) should go stale. The `UPSTREAM_DEPS` map must be field-level, not station-level. **Mitigation:** Design `UPSTREAM_DEPS` with full field-path precision from the start. Test all staleness scenarios in Phase 3.

**Medium Risk — Iframe Layout in the Panel**
The ToC Builder (`toc-builder/index.html`) uses `overflow:hidden; height:100vh` on `body` — it expects to be the full-page context. When embedded in a 64px-less, topbar-less iframe, the canvas proportions will be off. **Mitigation:** The ToC Builder iframe should be rendered in a full-page overlay modal (`position:fixed, inset:0, z-index:200`) inside the workbench, not as an inline panel section. This preserves the tool's layout expectations entirely.

**Medium Risk — localStorage Size Limits**
A fully populated `.praxis` context with a large ToC (many nodes), a 30-row matrix, and multiple instruments could exceed 5MB localStorage limit. **Mitigation:** In `context.js`, implement size estimation before save. If projected size > 4MB, prompt the user to download the `.praxis` file and clear localStorage. Alternative: Store only the most recently changed station's data in localStorage, requiring the `.praxis` file for full context.

**Low Risk — CDN Availability for Offline**
If the service worker fails to cache `unpkg.com/react@18/umd/react.production.min.js` on first load, the workbench won't work offline. **Mitigation:** In `sw.js`, use a specific CDN URL (versioned, not `@18` floating) and include it explicitly in the precache list. `react@18.3.1` specifically. Also add a fallback: if CDN fetch fails and no cache exists, show a user-friendly offline warning rather than a blank screen.

**Low Risk — Babel Standalone Performance**
If JSX is used in station components, `@babel/standalone` transpilation adds ~200ms per file on first load. With 15+ JS files using JSX, total transpile time could be 1-2 seconds on a slow device. **Mitigation:** Only use JSX in station content components (where template complexity justifies it). Use `React.createElement` directly in `app.js`, `Shell.js`, `StationRail.js`, `TopBar.js` — the high-frequency render paths. Alternatively, write all components as `React.createElement` calls throughout (as the sample-size-calculator does) and eliminate Babel entirely.

**Lowest Risk — ToR-to-Design-Advisor Mapping Gaps**
`DesignBridge.js` maps 8 of 10 Design Advisor questions from `tor_constraints`. The two that cannot be auto-derived are `complexity` (requires human judgment about programme design) and potentially `budget` (often not in the ToR). The advisor will still work with 8/10 pre-filled — users see two unfilled questions highlighted clearly. This is a feature, not a bug.

---

## Key File Paths for Implementation Agents

The most important files to build first, in order:

1. `/C:/Users/emmao/deploy-site/praxis/workbench/js/schema.js` — the contract
2. `/C:/Users/emmao/deploy-site/praxis/workbench/js/context.js` — the state machine
3. `/C:/Users/emmao/deploy-site/praxis/workbench/js/staleness.js` — the dependency graph
4. `/C:/Users/emmao/deploy-site/praxis/workbench/js/app.js` — the root mount
5. `/C:/Users/emmao/deploy-site/praxis/workbench/index.html` — the entry point
6. `/C:/Users/emmao/deploy-site/praxis/workbench/data/indicator_bank.js` — extracted from existing tool at line 262 of eval-matrix-builder
7. `/C:/Users/emmao/deploy-site/praxis/workbench/js/stations/station2/MatrixGenerator.js` — extracted from eval-matrix-builder lines 550-758

The existing tools to read during Station integration work:
- ToC Builder: `/C:/Users/emmao/deploy-site/praxis/tools/toc-builder/index.html` (the `INIT` and `IMPORT` action handlers in `coreReducer`, and the `exportJSON` function)
- Design Advisor: `/C:/Users/emmao/deploy-site/praxis/tools/evaluation-design-advisor/index.html` (the `QUESTIONS` array and `scoreDesigns` function)
- Sample Calculator: `/C:/Users/emmao/deploy-site/praxis/tools/sample-size-calculator/index.html` (the `DESIGNS` array, `DEFAULT_PARAMS`, and `calc` object)
- Eval Matrix Builder: `/C:/Users/emmao/deploy-site/praxis/tools/eval-matrix-builder/index.html` (lines 204-758 for pure JS, lines 761-1432 for React components)