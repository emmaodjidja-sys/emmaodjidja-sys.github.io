# PRAXIS Workbench — Plan C: Integrations + Polish

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the workbench by adding iframe bridges for Stations 1/3/4 (embedding existing tools), stubs for Stations 6/7/8, French translations, service worker for offline support, and end-to-end polish. At the end of this plan, all 9 stations are functional or stubbed, the workbench works offline, and the shell + Station 0 are available in French.

**Architecture:** Stations 1/3/4 use a Bridge pattern: existing tools loaded in same-origin iframes with `postMessage` communication. Small additions (~20-25 lines) to each existing tool enable the bridge. Stations 6/7/8 are functional stubs with structured data previews and "coming soon" badges.

**Tech Stack:** Same as Plans A/B. No new dependencies.

**Prereqs:** Plans A and B must be complete.

**Reference docs:**
- Design spec: `docs/superpowers/specs/2026-03-26-praxis-workbench-rebuild-design.md` (§7, §9, §10, §12, §13)
- Architecture blueprint: `docs/workbench-architecture-blueprint.md` (§7 Tier B/C integration, §8 bridge descriptions)
- Existing tools: `praxis/tools/toc-builder/`, `praxis/tools/evaluation-design-advisor/`, `praxis/tools/sample-size-calculator/`

---

## File Map

### Station 1 (ToC Builder Integration):
| File | Change |
|------|--------|
| `praxis/tools/toc-builder/index.html` | ADD: ~25 lines postMessage bridge |
| `js/stations/station1/Station1.js` | CREATE: Landing view + iframe overlay + inline editor |
| `js/stations/station1/TocBridge.js` | CREATE: postMessage hook |
| `js/stations/station1/TocInline.js` | CREATE: Lightweight text-based ToC editor |

### Station 3 (Design Advisor Integration):
| File | Change |
|------|--------|
| `praxis/tools/evaluation-design-advisor/index.html` | ADD: ~20 lines postMessage bridge |
| `js/stations/station3/Station3.js` | CREATE: Pre-filled advisor view |
| `js/stations/station3/DesignBridge.js` | CREATE: tor_constraints → answers mapping |

### Station 4 (Sample Size Integration):
| File | Change |
|------|--------|
| `praxis/tools/sample-size-calculator/index.html` | ADD: ~25 lines postMessage bridge |
| `js/stations/station4/Station4.js` | CREATE: Design-aware calculator wrapper |
| `js/stations/station4/SampleBridge.js` | CREATE: Design ID mapping |

### Stubs (Stations 6/7/8):
| File | Responsibility |
|------|---------------|
| `js/stations/station6/Station6.js` | Analysis Framework stub |
| `js/stations/station7/Station7.js` | Report Builder stub |
| `js/stations/station8/Station8.js` | Deck Generator stub |

### Polish:
| File | Responsibility |
|------|---------------|
| `lang/fr.json` | French translations (shell + Station 0) |
| `js/components/ExperienceTierBadge.js` | Tier switching dropdown |
| `js/components/HelpSidebar.js` | Context-sensitive guidance |
| `sw.js` | Service worker with precaching |
| `manifest.json` | PWA manifest |

---

## Task 1: Station 1 — ToC Builder Bridge

**Files:**
- Modify: `praxis/tools/toc-builder/index.html`
- Create: `js/stations/station1/TocBridge.js`
- Create: `js/stations/station1/TocInline.js`
- Create: `js/stations/station1/Station1.js`

- [ ] **Step 1: Add postMessage bridge to toc-builder**

Add at the bottom of the `<script type="text/babel">` block in `toc-builder/index.html`, before the closing `</script>`:

```javascript
// ── PRAXIS Workbench Bridge ──
(function() {
  if (window.self === window.top) return; // Not in iframe, skip

  // Signal ready to parent
  window.parent.postMessage({ type: 'TOC_READY' }, '*');

  // Listen for init data from workbench
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'PRAXIS_INIT' && e.data.payload) {
      // Hydrate state with incoming ToC data
      // The toc-builder has a dispatch function available in its React scope
      // This requires access to the dispatch — see implementation note below
    }
  });

  // Add "Save to Workbench" button visibility
  // The button calls: window.parent.postMessage({ type: 'TOC_EXPORT', payload: exportJSON(state) }, '*')
})();
```

**Implementation note:** The exact integration point depends on how the toc-builder's React state is exposed. Read the tool's source to find the `dispatch` function and the `exportJSON` utility. The bridge needs to call `dispatch({ type: 'IMPORT', json: payload })` for hydration and wrap the existing `exportJSON` for export.

- [ ] **Step 2: Write `TocBridge.js`**

Custom React hook: `useTocBridge(frameRef, onExport)`. Handles the postMessage handshake (TOC_READY → send PRAXIS_INIT) and export reception (TOC_EXPORT → call onExport).

- [ ] **Step 3: Write `TocInline.js`**

Lightweight text-based ToC editor for Foundation tier users. Structured input: goal (text), outcomes (list of texts), outputs per outcome (nested list). Produces the same `.praxis.toc` schema as the full ToC Builder.

- [ ] **Step 4: Write `Station1.js`**

Landing view: if ToC exists, show summary (node count, level breakdown) + "Edit" button. If empty, show two options: Guided Builder (TocInline) and Full Canvas (iframe overlay).

Full Canvas mode: renders `<iframe src="/praxis/tools/toc-builder/">` in a full-page overlay (`position:fixed, inset:0, z-index:200`). Uses TocBridge hook. "Save to Workbench" button dispatches `SAVE_STATION(1, { toc })`.

- [ ] **Step 5: Wire into Shell + index.html, browser verify, commit**

```bash
git commit -m "feat(workbench): add Station 1 — ToC Builder integration with iframe bridge + inline editor"
```

---

## Task 2: Station 3 — Design Advisor Bridge

**Files:**
- Modify: `praxis/tools/evaluation-design-advisor/index.html`
- Create: `js/stations/station3/DesignBridge.js`
- Create: `js/stations/station3/Station3.js`

- [ ] **Step 1: Add postMessage bridge to evaluation-design-advisor**

Same pattern as Station 1: PRAXIS_INIT listener (hydrates `answers` state), DESIGN_EXPORT emitter (posts `{ answers, ranked_designs }`), "Save to Workbench" button visible only in iframe.

- [ ] **Step 2: Write `DesignBridge.js`**

`torToDesignAnswers(torConstraints, projectMeta)` — maps 8 of 10 questions (spec §9.3):
- purpose, causal, comparison, data, context, budget, timeline, maturity

Returns partial `answers` object. The two unmapped questions (`complexity`, `unit`) are left null.

- [ ] **Step 3: Write `Station3.js`**

Landing view: "8 of 10 questions pre-filled from your evaluability assessment." Shows pre-answered questions in read-only with edit affordance. Two unfilled questions (complexity, unit) highlighted with amber border and "Your input needed" label.

"Review & Score" button opens the Design Advisor in iframe with pre-filled answers via PRAXIS_INIT. On DESIGN_EXPORT: dispatches `SAVE_STATION(3, { design_recommendation })`.

- [ ] **Step 4: Wire, verify, commit**

```bash
git commit -m "feat(workbench): add Station 3 — Design Advisor integration with pre-filled bridge (8/10 questions)"
```

---

## Task 3: Station 4 — Sample Size Bridge

**Files:**
- Modify: `praxis/tools/sample-size-calculator/index.html`
- Create: `js/stations/station4/SampleBridge.js`
- Create: `js/stations/station4/Station4.js`

- [ ] **Step 1: Add postMessage bridge to sample-size-calculator**

Same pattern: PRAXIS_INIT (hydrates design_id + params), SAMPLE_EXPORT (posts design_id, params, result, qualitative_plan).

- [ ] **Step 2: Write `SampleBridge.js`**

`designRecommendationToCalculatorDesign(designRec)` — maps Design Advisor IDs to Sample Calculator IDs (spec §10.1): rct→twoProportions, clusterRCT→clusterRCT, steppedWedge→steppedWedge, did→did, its→its, others→twoProportions.

- [ ] **Step 3: Write `Station4.js`**

Shows selected design name from Station 3 (with link to change). Embeds sample-size-calculator in iframe with pre-selected design. On export: dispatches `SAVE_STATION(4, { sample_parameters })`.

- [ ] **Step 4: Wire, verify, commit**

```bash
git commit -m "feat(workbench): add Station 4 — Sample Size Calculator integration with design-aware bridge"
```

---

## Task 4: Station Stubs (6, 7, 8)

**Files:**
- Create: `js/stations/station6/Station6.js`
- Create: `js/stations/station7/Station7.js`
- Create: `js/stations/station8/Station8.js`

- [ ] **Step 1: Write `Station6.js` (Analysis Framework stub)**

Shows analysis template drawn from evaluation_matrix EQs: editable table with EQ → Method → Software → Notes columns. "Generate Analysis Plan" button creates scaffold. "Full feature coming soon" badge. Saves partial `analysis_plan`. Spec §12.1.

- [ ] **Step 2: Write `Station7.js` (Report Builder stub)**

Editable section list auto-populated from evaluation_matrix EQs. "Generate Outline" button. "Full feature coming soon" badge. Saves partial `report_structure`. Spec §12.2.

- [ ] **Step 3: Write `Station8.js` (Deck Generator stub)**

Structured summary from evaluation_matrix + design_recommendation + sample_parameters. "Open Deck Tool" button links to `/praxis/tools/deck-generator/` with context via sessionStorage. "Download as Summary PDF" via print dialog. Spec §12.3.

- [ ] **Step 4: Wire all stubs into Shell + index.html, commit**

```bash
git commit -m "feat(workbench): add station stubs — Analysis Framework (6), Report Builder (7), Deck Generator (8)"
```

---

## Task 5: French Translations (Minimum Viable)

**Files:**
- Create: `lang/fr.json`

- [ ] **Step 1: Write `lang/fr.json`**

Minimum viable French coverage (spec §13.4): shell chrome, Entry Landing, Station 0 field labels and guidance text, common components (modal titles, buttons, tier names).

```json
{
  "shell.brand": "PRAXIS",
  "shell.workbench": "Atelier",
  "shell.save": "Sauvegarder .praxis",
  "shell.open": "Ouvrir",

  "tier.foundation": "FONDATION",
  "tier.practitioner": "PRATICIEN",
  "tier.advanced": "AVANCÉ",

  "landing.title": "Atelier d'Évaluation",
  "landing.subtitle": "Concevez une évaluation complète, du cadrage au rapport final. Neuf stations intégrées vous guident tout au long du cycle d'évaluation.",
  "landing.new": "Nouvelle Évaluation",
  "landing.new_desc": "Commencer à zéro avec un intake guidé",
  "landing.open": "Ouvrir un fichier .praxis",
  "landing.open_desc": "Reprendre un package d'évaluation sauvegardé",

  "station.0.name": "Évaluabilité et Cadrage",
  "station.0.desc": "Évaluer si ce programme peut être évalué de manière significative",
  "station.1.name": "Théorie du Changement",
  "station.2.name": "Matrice d'Évaluation",
  "station.3.name": "Conseiller de Conception",
  "station.4.name": "Taille de l'Échantillon",
  "station.5.name": "Constructeur d'Instruments",
  "station.6.name": "Cadre d'Analyse",
  "station.7.name": "Constructeur de Rapport",
  "station.8.name": "Générateur de Présentation",

  "common.save_draft": "Sauvegarder le brouillon",
  "common.continue": "Continuer",
  "common.cancel": "Annuler",
  "common.back": "Retour",
  "common.next": "Suivant"
}
```

Include all Station 0 phase labels, field labels, guidance text, review card strings, and evaluability score labels in French.

- [ ] **Step 2: Verify locale switching**

In the browser, open console: `PraxisI18n.setLocale('fr')`. Verify shell labels switch to French. Switch back: `PraxisI18n.setLocale('en')`.

- [ ] **Step 3: Commit**

```bash
git add praxis/workbench/lang/fr.json
git commit -m "feat(workbench): add French translations — shell chrome + Station 0 (minimum viable)"
```

---

## Task 6: Service Worker + PWA

**Files:**
- Create: `sw.js`
- Create: `manifest.json`
- Modify: `index.html` (add SW registration + manifest link)

- [ ] **Step 1: Write `manifest.json`**

```json
{
  "name": "PRAXIS Evaluation Workbench",
  "short_name": "PRAXIS",
  "start_url": "/praxis/workbench/",
  "display": "standalone",
  "background_color": "#0B1A2E",
  "theme_color": "#2EC4B6",
  "icons": [{ "src": "/praxis/logo.svg", "sizes": "any", "type": "image/svg+xml" }]
}
```

- [ ] **Step 2: Write `sw.js`**

Cache-first for local files, network-first for CDN. Precache: all local CSS, JS, lang files, logo. Specific versioned CDN URLs. Fallback offline warning.

- [ ] **Step 3: Add SW registration + manifest to index.html**

```html
<link rel="manifest" href="manifest.json">
<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(function(e) { console.warn('SW registration failed:', e); });
}
</script>
```

- [ ] **Step 4: Test offline**

Load workbench, wait for SW to install (check DevTools > Application > Service Workers). Go offline (DevTools > Network > Offline). Reload. Workbench should load from cache.

- [ ] **Step 5: Commit**

```bash
git add praxis/workbench/sw.js praxis/workbench/manifest.json praxis/workbench/index.html
git commit -m "feat(workbench): add service worker + PWA manifest for offline support"
```

---

## Task 7: Polish Components

**Files:**
- Create: `js/components/ExperienceTierBadge.js`
- Create: `js/components/HelpSidebar.js`
- Modify: `js/shell/TopBar.js` (integrate tier badge dropdown)

- [ ] **Step 1: Write `ExperienceTierBadge.js`**

Clickable tier pill in top bar. On click: dropdown with three tier options + descriptions. Dispatches `SET_TIER`. Tier colors from tokens (green/blue/purple).

- [ ] **Step 2: Write `HelpSidebar.js`**

Context-sensitive guidance panel. Reads current station + tier to show relevant help text. Foundation tier gets more guidance. Toggled via Help icon at bottom of rail.

- [ ] **Step 3: Integrate into TopBar, commit**

```bash
git commit -m "feat(workbench): add ExperienceTierBadge dropdown + HelpSidebar for context-sensitive guidance"
```

---

## Task 8: Final Integration Test

- [ ] **Step 1: Full end-to-end workflow**

1. ☐ Open workbench → Full Landing appears
2. ☐ New Evaluation → tier selection → Station 0
3. ☐ Complete Station 0 (all 3 phases + override)
4. ☐ Station 1: build ToC (inline or full canvas)
5. ☐ Station 2: generate matrix, edit EQs, add suggestions, export Word
6. ☐ Station 3: review pre-filled answers (8/10), answer complexity + unit, score designs
7. ☐ Station 4: verify design pre-selected, adjust sample parameters
8. ☐ Station 5: instruments auto-scaffolded, edit questions, export XLSForm
9. ☐ Station 6/7/8: stubs render with structured previews
10. ☐ Staleness: edit Station 0 → downstream stations show stale
11. ☐ Save/load: download .praxis, clear, re-open
12. ☐ Offline: works after SW install
13. ☐ French: switch locale, shell + Station 0 in French
14. ☐ Tier switching: change tier, verify language changes without layout shift
15. ☐ Sensitivity: set to "sensitive" → amber banner appears
16. ☐ Mobile: resize to 768px, rail becomes bottom bar

- [ ] **Step 2: Fix any issues**

- [ ] **Step 3: Final commit**

```bash
git add -A praxis/workbench/
git commit -m "feat(workbench): Plan C complete — all stations, i18n, PWA, polish"
```

---

## Plan C Complete — Workbench Rebuild Done

All three plans together produce:
- **Plan A:** Foundation (CSS tokens, JS utilities, state management) + Shell (entry landing, topbar, rail, drawer)
- **Plan B:** Station 0 (3-phase evaluability assessment), Station 2 (table-first evaluation matrix), Station 5 (instrument builder with XLSForm export)
- **Plan C:** Station 1/3/4 (iframe bridges), Station 6/7/8 (stubs), French translations, PWA, polish

The workbench is complete and ready for deployment.
