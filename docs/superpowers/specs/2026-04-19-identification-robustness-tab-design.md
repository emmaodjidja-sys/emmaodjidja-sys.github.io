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

### 3.1 Strategy: extend the Tremor pipeline, do not duplicate it

The page's authoritative data-prep pipeline is `C:\Users\emmao\tremor\pipeline\`. It is a full Python package (pipeline.py + src/analysis/*, src/ingest/etl.py, config.py, tests/) that produces every number on the research page via a single `pipeline.run(acled_path)` entry point. The inline JS constants on the research page (`KI`, `THREE`, `BASE_LINE`, etc.) are the serialized output of this pipeline.

All new numbers for this tab are produced by extending the pipeline, not by writing a parallel script. This guarantees methodology parity, reuses the replication-test harness, and keeps a single source of truth for the page's figures.

### 3.2 File targets

- **New function:** `compute_identification_robustness(...)` added to `tremor/pipeline/src/analysis/sensitivity.py` alongside `_compute_sensitivity_period` and `_compute_sensitivity_pair_type`.
- **Pipeline hook:** new step in `tremor/pipeline/pipeline.py run()` that calls the new function and merges `ident_robustness` and `ident_pr_curve` into the JSON output blob.
- **Replication test:** new test in `tremor/pipeline/tests/test_replication.py` asserting N=2 lift reproduces the 8.8× headline within tolerance.
- **Build step:** a small script (location TBD in the plan phase — likely `tremor/pipeline/scripts/inject_research_page.py` or similar) that reads the pipeline JSON output, formats `IDENT_ROBUSTNESS` and `IDENT_PR_CURVE` as JS constants, and patches them into `deploy-site/praxis/research/index.html` at a marked insertion point.
- **HTML target:** `deploy-site/praxis/research/index.html` — inline `<script>` block (constants inserted near existing `KI`, `THREE`, `BASE_LINE`) and one new tab's JSX inside the methodology-tab component.

### 3.3 Authoritative taxonomy (from `tremor/pipeline/src/config.py`)

- **KAFD** = `sub_event_type == "Abduction/forced disappearance"`
- **IED** = `sub_event_type == "Remote explosive/landmine/IED"`
- **OUTCOME_TYPES** (page's "attack-type" set) = `{Armed clash, Attack, Remote explosive/landmine/IED, Suicide bomb, Shelling/artillery/missile attack}`
- **Outcome-exclusive (N4 decontamination)** = OUTCOME_TYPES minus KAFD and IED = `{Armed clash, Attack, Suicide bomb, Shelling/artillery/missile attack}`. KAFD is not in OUTCOME_TYPES to begin with, so only IED is actually removed in the OUTCOME side; the stripping applies at the district-week level for both.
- **CLEAN_BASELINE_SAMPLE** = 8,000 district-weeks sampled with `CLEAN_BASELINE_SEED = 42`. The page's "Sahel-wide clean baseline" is this random sample, not the full universe. Our lift denominator must use the same sample via the pipeline's existing `compute_clean_baseline` helper.
- **COMPOSITE_MIN_TYPES** = 2 (page's existing composite-threshold default, not directly used here but shared context).

### 3.4 Universe & unit of analysis

- **Unit:** admin2 district.
- **Universe:** all admin2 zones in the 13 countries listed in `config.COUNTRIES`, with ≥1 ACLED event, 2010-01-01 to 2025-03-26. Expected count: **1,510** (matches page).
- **Total district-weeks:** ~1.17 million across the universe.

### 3.5 Labels

Two binary labels per district.

**`FLAGGED(N)`** — district had at least one district-week where KAFD ≥ N AND IED ≥ N. N ∈ {1, 2, 3, 4, 5}.

**`HIGH_VIOLENCE(N)`** — district's outcome-exclusive attack rate on **non-flagged weeks only** is ≥ 8.8× the clean-baseline rate produced by `compute_clean_baseline(weekly, composite, outcome_excl)`.

- Rationale: using the page's 8.8× threshold keeps the tab's ground truth aligned with the page headline. Restricting to *non-flagged weeks* breaks the circularity that would otherwise exist. The question this label asks is: "in their ordinary weeks — weeks where the signal is not ringing — are these districts still violent enough to clear the 8.8× bar?"
- Label is **dependent on N** because "non-flagged weeks" depends on which weeks got flagged at that N. Recomputed per N.
- A district with zero non-flagged weeks (every week was a signal week at that N) is excluded from TP/FP/TN/FN at that N; count of excluded districts disclosed per-N in the footnote.

### 3.6 Metrics (per N)

For each N, cross-tabulate `FLAGGED(N)` × `HIGH_VIOLENCE(N)` → {TP, FP, TN, FN}. Derive:

| Metric | Formula |
|---|---|
| Precision | TP / (TP + FP) |
| Recall | TP / (TP + FN) |
| F1 | 2·P·R / (P + R) |
| Lift (district) | flagged-district outcome-exclusive attack rate / `baseline_excl` rate |

`baseline_excl` is produced by the existing `compute_clean_baseline` helper, same object used by `compute_two_metrics` to produce the page's 8.8× figure. Using the same helper guarantees methodological parity.

### 3.7 Output schema (inside pipeline JSON, before HTML injection)

```json
{
  "ident_robustness": {
    "1": {"n": 1, "tp": 0, "fp": 0, "tn": 0, "fn": 0,
          "precision": 0.000, "recall": 0.000, "f1": 0.000, "lift": 0.0,
          "flagged": 0, "high_violence": 0, "excluded": 0, "p_value": 0.0},
    "2": {...},
    "3": {...},
    "4": {...},
    "5": {...}
  },
  "ident_pr_curve": [
    {"n": 1, "precision": 0.000, "recall": 0.000},
    {"n": 2, "precision": 0.000, "recall": 0.000},
    {"n": 3, "precision": 0.000, "recall": 0.000},
    {"n": 4, "precision": 0.000, "recall": 0.000},
    {"n": 5, "precision": 0.000, "recall": 0.000}
  ]
}
```

The build step serializes these as the JS constants `IDENT_ROBUSTNESS` (object) and `IDENT_PR_CURVE` (array) and injects them into the HTML.

### 3.8 Significance

Page-level Bonferroni threshold lives in `config.BONFERRONI_TESTS = 44` → `BONFERRONI_THRESHOLD = 0.05 / 44 ≈ 0.001136`. This tab's 5 additional specifications tighten the conservative threshold to `0.05 / 49 ≈ 0.001020`. The spec updates `config.BONFERRONI_TESTS` to `49` in the same commit so both page and tab read from a single source. Per-N p-values are computed via the same Mann-Whitney U pattern already used elsewhere in the pipeline, reported against the updated threshold.

### 3.9 Spot-check gates (before HTML injection)

Must pass in `tests/test_replication.py`:

1. **Lift at N=2 reproduces 8.8× ± 0.3.** Exact same computation path as `P1.5 KAFD+IED exclusive dist_id ~8.8x`, restricted to the dyadic (K=1, I=1) case.
2. **Flagged-district count at N=1 covers the `kafd_ied_weeks` host-district set** (the distinct admin2 count underlying the 292-ish core district-weeks, exposed as `output["kafd_ied_weeks"]` in the pipeline).
3. **Precision, recall ∈ [0,1]; F1 = 2·P·R/(P+R) within 1e-6; TP+FP+TN+FN + excluded = 1,510 for every N.** Pure sanity, asserted in the test.

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

### 6.1 Pre-publish Python checks (new tests in `tremor/pipeline/tests/test_replication.py`)

- Precision ∈ [0, 1] for every N.
- Recall ∈ [0, 1] for every N.
- F1 = 2·P·R/(P+R) within 1e-6 for every N.
- TP + FP + TN + FN + excluded = 1,510 for every N.
- Lift at N=2 ∈ [8.5, 9.1] (matches 8.8× ± 0.3).
- `ident_pr_curve` has exactly 5 entries, one per N, in increasing order.
- Build step is idempotent: running it twice against the same pipeline JSON produces a zero diff on `deploy-site/praxis/research/index.html`.

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

- **R1.** If our N=2 lift does not reproduce 8.8×, we have either a code bug or a definition drift from `compute_two_metrics`. Because we reuse the pipeline's own helpers, this should be caught by the new replication test before HTML injection. Halt and diff rather than paper over.
- **R2.** ~~Classification rules unrecoverable.~~ Resolved: authoritative taxonomy located at `tremor/pipeline/src/config.py`.
- **R3.** `HIGH_VIOLENCE` label uses "non-flagged weeks only" to avoid circularity. A district where every week is a signal week gets excluded at that N. If exclusion counts grow large at high N, recall becomes hard to interpret. Footnote discloses exclusions per N; if exclusions exceed 10% of the flagged pool at any N, flag it to Emmanuel before publishing.
- **R4.** `config.BONFERRONI_TESTS` is bumped from 44 → 49 as part of this change. The page's existing disclosure "Bonferroni correction at p = 0.0011 across 44 specifications" becomes slightly stale (should read "49 specifications, p < 0.00102"). That copy update is out of scope for this tab's commit but should be noted as a follow-up.
- **R5.** The build step that injects constants into `deploy-site/praxis/research/index.html` must be idempotent (rerunnable without producing diffs when inputs are unchanged) and must use a clearly marked insertion region. Design of the injection markers is deferred to the implementation plan.
- **R6.** The tab adds ~250 lines to the ~2,000-line self-contained HTML file. Mild maintainability concern. Not blocking.

## 8. Commit plan

Two commits across two repos, in order:

**1. `tremor/pipeline`** (authoritative methodology):

```
feat(sensitivity): add identification-robustness sweep across KAFD+IED thresholds

- compute_identification_robustness(): FLAGGED(N) × HIGH_VIOLENCE(N) cross-tab
  for N in {1..5}, reusing compute_clean_baseline + outcome_excl helpers
- Hook into pipeline.run() as a new step; emit ident_robustness +
  ident_pr_curve in the JSON output
- Replication test: N=2 lift reproduces the 8.8x headline within ±0.3
- Bump BONFERRONI_TESTS 44 → 49 to cover the 5 new specifications
```

**2. `deploy-site`** (page surface):

```
feat(research): add identification-robustness tab to composite co-occurrence viz

- New 9th methodology tab: confusion matrix + PR curve + threshold slider
- Injection markers in the inline <script> block for IDENT_ROBUSTNESS and
  IDENT_PR_CURVE constants (populated from tremor pipeline JSON output)
- Tests robustness of 8.8x district-identification claim across N in {1..5}
- No predictive language; consistent with DETECT framing
- No changes to other tabs, stat cards, or page copy
```

Both commits land only after the replication test passes and the spot-check lift at N=2 reproduces the 8.8× headline.
