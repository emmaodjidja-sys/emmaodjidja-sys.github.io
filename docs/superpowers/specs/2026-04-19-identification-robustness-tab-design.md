# Identification-Robustness Tab — Design Spec

**Date:** 2026-04-19
**Author:** Emmanuel Odjidja (with Claude)
**Status:** Draft for review
**Target file:** `deploy-site/praxis/research/index.html`
**Live URL after deploy:** https://www.emmanuelneneodjidja.org/praxis/research/

---

## 1. Problem & goal

The PRAXIS research page now leads with the DETECT framing: *the composite co-occurrence signal identifies **where** persistent violence concentrates; it does not forecast **when**.* The headline result is 8.8× district-level lift vs. a clean Sahel-wide baseline (N=292 district-weeks, p < 0.001, KAFD and IED excluded from the outcome count per N4 decontamination).

The page currently presents that result as a single point estimate. A skeptical reader has no way to see how robust the identification claim is to the threshold chosen for what counts as a "composite signal" week. A live demo viewer has no way to manipulate the threshold and watch the identification metrics move.

**Goal:** add a 9th tab to the inline React visualization that lets the reader move a threshold and see how the district-identification result holds up — precision, recall, F1, and district-level lift — across alternative definitions of the signal.

This is the *where*-claim analogue of a classical ML precision-recall analysis. It is explicitly not a predictive hit-rate tab. It fits the DETECT framing exactly and adds the one piece of analytical rigour that reviewers will ask for on the 8.8× headline: *does the number move when you vary the knob?*

## 2. Scope & constraints

**In scope:**
- One additional tab in the existing methodology-tab panel of the inline React viz inside `deploy-site/praxis/research/index.html`.
- One new Python build-time script under `scripts/` that reads the ACLED CSV and emits two JS constants to be pasted into the HTML `<script>` block alongside `KI`, `THREE`, `BASE_LINE`, etc.
- Footnote content matching the methodology conventions already established on the page.

**Out of scope** (deferred to future tabs):
- Actor-filtered identification (e.g., ISWAP-only, JNIM-only).
- Region-stratified curves (Central Sahel vs. Lake Chad Basin vs. Coastal).
- Alternative ground-truth labels (fatality-based, year-normalised, population-weighted).
- Any temporal / next-week element — this tab is strictly district-level.

**Do not touch:**
- Nav bar, footer, principal researcher card, hero stats bar, key findings cards, citation block.
- Existing tabs, their data arrays, or their React components.
- CSS, palette, fonts, SVG icons.
- Data loading logic for existing tabs.

## 3. Architecture & data pipeline

### 3.1 File targets

- **Python:** `scripts/compute_identification_robustness.py` (new).
- **Data source:** `C:\Users\emmao\OneDrive\Desktop\Projects\KAFD-VE Project\Updated Littorals state data\ACLED Data_2026-03-26.csv` (utf-8-sig).
- **HTML target:** `deploy-site/praxis/research/index.html`, inline `<script>` block.
- **Output constants:** `IDENT_ROBUSTNESS`, `IDENT_PR_CURVE`.

### 3.2 Universe & unit of analysis

- **Unit:** admin2 district.
- **Universe:** all admin2 zones with ≥1 ACLED event, 2010-01-01 to 2025-03-26. Expected count: **1,510** (matches page).
- **Total district-weeks:** ~1.17 million across the universe.

### 3.3 Labels

Two binary labels per district.

**`FLAGGED(N)`** — district had at least one district-week with `kafd_events ≥ N` AND `ied_events ≥ N`.

- N ∈ {1, 2, 3, 4, 5}.
- KAFD/IED classification reuses the exact keyword-matching rules already embedded in the viz JS (see §3.7).

**`HIGH_VIOLENCE`** — district sits in the top quartile by attack-type event count over 2010–2025.

- Attack-type events defined per ACLED sub-event taxonomy, with **KAFD and IED events stripped from the count** to match N4 decontamination.
- Label is fixed across all N (not dependent on threshold).
- Expected count: ~378 districts (25% of 1,510).

### 3.4 Metrics

For each N, cross-tabulate `FLAGGED(N)` × `HIGH_VIOLENCE` → {TP, FP, TN, FN}. Derive:

| Metric | Formula |
|---|---|
| Precision | TP / (TP + FP) |
| Recall | TP / (TP + FN) |
| F1 | 2·P·R / (P + R) |
| Lift (district) | (attack rate in flagged districts) / (Sahel-wide clean baseline attack rate) |

**Lift methodology matches the page's 8.8× headline:** flagged-district attack rate is computed over all district-weeks in flagged districts, with KAFD and IED events stripped from the numerator. Denominator is the Sahel-wide attack rate over all district-weeks in the universe, also with KAFD/IED stripped.

### 3.5 Output schema

```js
const IDENT_ROBUSTNESS = {
  1: {n: 1, tp: ..., fp: ..., tn: ..., fn: ...,
      precision: 0.xxx, recall: 0.xxx, f1: 0.xxx, lift: x.x,
      flagged: ..., high_violence: 378},
  2: {...},
  3: {...},
  4: {...},
  5: {...}
};

const IDENT_PR_CURVE = [
  {n: 1, precision: 0.xxx, recall: 0.xxx},
  {n: 2, precision: 0.xxx, recall: 0.xxx},
  {n: 3, precision: 0.xxx, recall: 0.xxx},
  {n: 4, precision: 0.xxx, recall: 0.xxx},
  {n: 5, precision: 0.xxx, recall: 0.xxx}
];
```

Pasted into the existing inline `<script>` block near `KI`, `THREE`, `BASE_LINE`.

### 3.6 Significance

Page already discloses a Bonferroni correction at p = 0.0011 across 44 specifications. Adding 5 new specifications (one per N) brings the total to 49 → conservative threshold p < 0.0000204. The tab footer discloses the revised Bonferroni threshold and reports per-N p-values against it.

### 3.7 KAFD / IED / attack-type classification

The page's underlying classification rules are not visible in `deploy-site/praxis/research/index.html` itself — the inline JS only carries the pre-computed output arrays (`KI`, `THREE`, etc.), not the Python or R code that produced them. The authoritative classification lives wherever the page's original pipeline lives. Before running our script we will:

1. Locate the page's data-prep script (likely under the KAFD-VE Project folder on OneDrive, alongside the ACLED CSV) and read off the exact KAFD and IED keyword lists / sub_event_type filters.
2. Read off the exact definition of "attack-type event" used to build the page's 8.8× denominator and numerator.
3. Use those same lists in our Python script — no re-invented taxonomy.

If step 1 or 2 fails to surface an authoritative definition (e.g., the data-prep script isn't recoverable), we halt and surface the choice to Emmanuel rather than guess. Getting this wrong silently would mean our 8.8× spot-check could pass or fail for the wrong reason.

### 3.8 Spot-check gates

Must pass before the numbers are pasted into HTML:

1. **Lift at N=2 reproduces 8.8× ± 0.3.** If not, the page's methodology differs from our reimplementation — stop and reconcile with Emmanuel before publishing.
2. **Flagged-district count at N=1 ≥ the distinct admin2 count underlying the 292 core district-weeks.** Defines a consistency floor with the on-page N=292 sample.
3. **Precision ∈ [0,1], recall ∈ [0,1], F1 matches 2·P·R/(P+R) algebraically, TP+FP+TN+FN = 1,510 for every N.** Pure sanity.

## 4. Visual layout & components

### 4.1 Layout (ASCII)

```
┌─ Identification robustness ─────────────────────┐
│ Min KAFD+IED count N: [1]─●──[5]  (default 2)   │
│                                                 │
│ ┌─ Districts (1,510) ────────┐ ┌─ PR curve ────┐│
│ │         high-viol  not     │ │  •            ││
│ │ flagged   TP       FP      │ │    •          ││
│ │ off       FN       TN      │ │      ●← you   ││
│ │ Precision: xx.x%           │ │        •      ││
│ │ Recall:    xx.x%           │ │          •    ││
│ │ F1:        0.xx            │ │ x: recall     ││
│ │ Lift vs Sahel: x.x×        │ │ y: precision  ││
│ └────────────────────────────┘ └───────────────┘│
│ Universe: 1,510 admin2 · 2010–2025              │
│ High-violence = top quartile by attack count    │
│ Outcome excludes KAFD & IED (N4 decontamination)│
└─────────────────────────────────────────────────┘
```

### 4.2 React components (inline JSX, ES5-transpiled like the rest of the viz)

- **`IdentRobustnessTab`** — stateful wrapper. Holds `N` (1–5, default 2). Reads `IDENT_ROBUSTNESS[N]` and `IDENT_PR_CURVE`.
- **`ConfusionMatrix`** — pure functional. 4 cells + 4 readouts. Pass-through props.
- **`PRCurveMini`** — 5-point SVG path in a unit square. Current `N` rendered as a filled dot in `p-amber`; other 4 as outlined dots. ~140×140 px.
- **Slider** — native `<input type="range" min=1 max=5 step=1>` with tick labels below.

### 4.3 Styling

- Palette: reuse existing `p-navy` / `p-teal` / `p-amber`.
- TP and TN cells: teal tint (`p-teal` @ 15%).
- FP and FN cells: amber tint (`p-amber` @ 15%).
- Current-threshold dot on PR curve: filled `p-amber`.
- Other dots: outlined `p-teal`.
- All text 11–13px inline, matching methodology-tab micro-typography already present on page.

### 4.4 Accessibility

- Slider has `aria-label="Minimum KAFD+IED co-occurrence count N"` and `aria-valuenow`.
- Confusion matrix cells have `role="cell"` and text labels read by screen readers.
- PR curve is decorative (data is also in the matrix); marked `role="img"` with `aria-label` summarising the current state.

## 5. Methodology footnote

Rendered below the tab inside an expandable `<details>` block. Exact copy:

> **Unit of analysis.** admin2 district.
>
> **Universe.** 1,510 admin2 zones with at least one ACLED event, 2010-01-01 to 2025-03-26 (~1.17 million district-weeks total).
>
> **Flag.** `FLAGGED(N)` = the district had at least one district-week in the universe with ≥N KAFD events AND ≥N IED events.
>
> **Ground-truth label.** `HIGH_VIOLENCE` = district in the top quartile by attack-type event count over 2010–2025, with KAFD and IED events stripped from the count (N4 decontamination, matching the page methodology for the 8.8× headline). Label is fixed across all N.
>
> **Lift.** District-level lift = (flagged-district attack rate) / (Sahel-wide clean baseline attack rate). Same denominator as the 8.8× headline on this page, applied at district rather than district-week granularity.
>
> **Significance.** Page-level Bonferroni correction at p = 0.0011 across 44 specifications; this tab's 5 additional specifications tighten the conservative threshold to p < 0.0000204.
>
> **Caveat.** KAFD and IED classification uses keyword matching on `actor1` and `sub_event_type` fields. Attribution is less reliable in frontier zones; the page's existing caveat applies unchanged.
>
> **What this tests.** Robustness of the district-identification ("where") claim to the threshold chosen for the signal. Not a forecasting ("when") claim. No predictive language is used on this tab.

## 6. Testing & acceptance

### 6.1 Pre-publish Python checks

- Precision ∈ [0, 1] for every N.
- Recall ∈ [0, 1] for every N.
- F1 = 2·P·R/(P+R) within 1e-6 for every N.
- TP + FP + TN + FN = 1,510 for every N.
- Lift at N=2 ∈ [8.5, 9.1] (matches 8.8× ± 0.3).

### 6.2 Browser checks

- Slider moves all five readouts and the PR-curve dot in real time.
- Tab renders at mobile widths (≥ 360px) without horizontal scroll.
- No console errors.
- Tab transitions match existing methodology tabs — no style drift.

### 6.3 Post-deploy verification

- `curl https://www.emmanuelneneodjidja.org/praxis/research/ | grep -c IDENT_ROBUSTNESS` returns ≥ 1.
- Visual check in browser on live URL; confirm slider works and numbers render.

### 6.4 Acceptance criteria

- [ ] Exactly one new tab appears in the methodology-tab row, labelled "Identification robustness".
- [ ] Slider defaults to N=2 on first render.
- [ ] At N=2, lift reads 8.8× (± 0.3).
- [ ] No predictive language anywhere in the tab or its footnote.
- [ ] No changes to any other tab, stat card, paragraph, or style on the page.
- [ ] Bonferroni note appears in the footnote.
- [ ] Page still loads under 3s on 4G.

## 7. Risks & open questions

- **R1.** If our N=2 lift does not reproduce 8.8×, the page's exact methodology differs from our reimplementation. Mitigation: halt, diff methodologies with Emmanuel, reconcile before publishing. Do not paper over a discrepancy.
- **R2.** The page's inline JS carries only pre-computed output arrays, not the classification rules that generated them. The authoritative KAFD / IED / attack-type definitions live in a separate data-prep pipeline that must be located before any numbers are produced. If the pipeline is not recoverable, the tab is blocked.
- **R3.** Top-quartile ground truth is one of several defensible choices. An alternative is "≥ 8.8× clean baseline" as a binary label. We use top-quartile because it produces a fixed class balance and is robust to definition of "high violence". Alternative is deferred.
- **R4.** The tab adds ~250 lines to an already ~2,000-line self-contained HTML file. Future maintainability is a mild concern; if the file grows past 2,500 lines we should consider extracting the viz into its own `.js` file with a build step. Not blocking.

## 8. Commit plan

Single commit at the end of implementation:

```
feat(research): add identification-robustness tab to composite co-occurrence viz

- New 9th methodology tab: confusion matrix + PR curve + threshold slider
- Tests robustness of 8.8× district-identification claim across N ∈ {1..5}
- Python build-time script computes IDENT_ROBUSTNESS + IDENT_PR_CURVE constants
- N4-exclusive outcome; Sahel-wide clean baseline denominator (matches headline)
- Bonferroni-corrected significance threshold updated to p < 0.0000204 (49 specs)
- No changes to other tabs, stat cards, or page copy
```
