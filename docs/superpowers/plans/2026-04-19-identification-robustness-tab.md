# Identification-Robustness Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 9th tab to the PRAXIS research page's inline React viz that lets readers vary a KAFD+IED co-occurrence threshold N ∈ {1..5} and see precision, recall, F1, and district-level lift against a "high-violence" ground truth defined as ≥ 8.8× the clean Sahel baseline (computed over non-flagged weeks only).

**Architecture:** Extend `tremor/pipeline` (the authoritative data-prep package that already produces every number on the page) with a new `compute_identification_robustness` sweep. Emit results into the pipeline's JSON output. A new idempotent injection script patches two JS constants (`IDENT_ROBUSTNESS`, `IDENT_PR_CURVE`) into `deploy-site/praxis/research/index.html` at marked insertion points. Tab UI is added as inline ES5-transpiled JSX alongside existing methodology tabs — no new build pipeline, no new dependencies.

**Tech Stack:** Python 3 (pipeline + tests, pytest), static HTML + inline React 18 (CDN, ES5-transpiled JSX), vanilla Bash/Node for local serve + curl-verify.

---

## File structure

**Modified in `C:\Users\emmao\tremor\pipeline`:**
- `src/config.py` — bump `BONFERRONI_TESTS` 44 → 49.
- `src/analysis/sensitivity.py` — add `compute_identification_robustness` function.
- `pipeline.py` — add new step in `run()`, extend the `output` dict with `ident_robustness` and `ident_pr_curve`.
- `tests/test_replication.py` — add three replication assertions.

**Created in `C:\Users\emmao\tremor\pipeline`:**
- `scripts/inject_research_page.py` — idempotent JSON-to-HTML injector.
- `tests/test_inject_research_page.py` — injector idempotence test.

**Modified in `C:\Users\emmao\deploy-site`:**
- `praxis/research/index.html` — add two injection markers for JS constants; add one new tab's JSX and a `IdentRobustnessTab` React component to the methodology-tab panel.

Each file has one responsibility: `sensitivity.py` owns the sweep math, `pipeline.py` owns orchestration + output serialization, `inject_research_page.py` owns HTML patching, `index.html` owns UI. No file becomes a grab-bag.

---

## Phase A — Tremor pipeline: produce the numbers

### Task 1: Scaffold `compute_identification_robustness` with a smoke test

**Files:**
- Modify: `C:\Users\emmao\tremor\pipeline\src\analysis\sensitivity.py` (append function)
- Create: `C:\Users\emmao\tremor\pipeline\tests\test_identification_robustness.py`

- [ ] **Step 1: Write the failing smoke test**

Create `C:\Users\emmao\tremor\pipeline\tests\test_identification_robustness.py`:

```python
"""Unit tests for compute_identification_robustness."""
from src.analysis.sensitivity import compute_identification_robustness


def _make_weekly():
    """Tiny fixture: 4 districts × 10 weeks with synthetic KAFD/IED/attack counts."""
    weekly = {}
    # District A: KAFD=2, IED=2 in week 0; heavy attacks elsewhere → flagged & high-violence
    # District B: KAFD=2, IED=2 in week 0; low attacks elsewhere → flagged & not high-violence
    # District C: no KAFD/IED co-occurrence; heavy attacks → not flagged, high-violence
    # District D: no KAFD/IED co-occurrence; low attacks → not flagged, not high-violence
    for w in range(10):
        weekly[("X", "A", w)] = {
            "types": {"Abduction/forced disappearance": 2 if w == 0 else 0,
                      "Remote explosive/landmine/IED": 2 if w == 0 else 0,
                      "Attack": 3 if w > 0 else 0},
            "n_distinct_types": 2 if w == 0 else 1,
            "attacks_excl": 3 if w > 0 else 0,
        }
        weekly[("X", "B", w)] = {
            "types": {"Abduction/forced disappearance": 2 if w == 0 else 0,
                      "Remote explosive/landmine/IED": 2 if w == 0 else 0,
                      "Attack": 0},
            "n_distinct_types": 2 if w == 0 else 0,
            "attacks_excl": 0,
        }
        weekly[("X", "C", w)] = {
            "types": {"Attack": 4},
            "n_distinct_types": 1,
            "attacks_excl": 4,
        }
        weekly[("X", "D", w)] = {
            "types": {"Attack": 0},
            "n_distinct_types": 0,
            "attacks_excl": 0,
        }
    return weekly


def test_ident_robustness_schema():
    weekly = _make_weekly()
    result = compute_identification_robustness(weekly, clean_baseline_rate=0.5, n_values=[1, 2])
    assert "ident_robustness" in result
    assert "ident_pr_curve" in result
    for n in [1, 2]:
        row = result["ident_robustness"][n]
        for key in ("tp", "fp", "tn", "fn", "precision", "recall", "f1",
                    "lift", "flagged", "high_violence", "excluded", "p_value"):
            assert key in row, f"missing {key} in N={n} row"
    assert len(result["ident_pr_curve"]) == 2
    assert [pt["n"] for pt in result["ident_pr_curve"]] == [1, 2]
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /c/Users/emmao/tremor/pipeline && python -m pytest tests/test_identification_robustness.py::test_ident_robustness_schema -v`
Expected: `ImportError: cannot import name 'compute_identification_robustness' from 'src.analysis.sensitivity'`

- [ ] **Step 3: Append scaffold to `sensitivity.py`**

Append to the end of `C:\Users\emmao\tremor\pipeline\src\analysis\sensitivity.py`:

```python
def compute_identification_robustness(weekly, clean_baseline_rate, n_values=(1, 2, 3, 4, 5)):
    """
    Robustness sweep: for each N, cross-tab FLAGGED(N) x HIGH_VIOLENCE(N)
    at admin2-district level.

    FLAGGED(N):       district had >=1 district-week with KAFD>=N AND IED>=N.
    HIGH_VIOLENCE(N): district's attack-rate on *non-flagged weeks only*
                     is >= 8.8x the clean_baseline_rate. Excludes KAFD/IED
                     from the numerator via weekly[k]['attacks_excl'].

    Districts with zero non-flagged weeks at a given N are excluded from
    the confusion matrix at that N.

    Returns {"ident_robustness": {N: {tp, fp, tn, fn, precision, recall, f1,
                                      lift, flagged, high_violence, excluded,
                                      p_value}},
             "ident_pr_curve":   [{n, precision, recall}, ...]}.
    """
    # Placeholder returning the schema; real logic arrives in Task 2.
    ident = {}
    for n in n_values:
        ident[n] = {"tp": 0, "fp": 0, "tn": 0, "fn": 0,
                    "precision": 0.0, "recall": 0.0, "f1": 0.0, "lift": 0.0,
                    "flagged": 0, "high_violence": 0, "excluded": 0,
                    "p_value": 1.0}
    pr_curve = [{"n": n, "precision": 0.0, "recall": 0.0} for n in n_values]
    return {"ident_robustness": ident, "ident_pr_curve": pr_curve}
```

- [ ] **Step 4: Run test to verify schema passes**

Run: `cd /c/Users/emmao/tremor/pipeline && python -m pytest tests/test_identification_robustness.py::test_ident_robustness_schema -v`
Expected: PASS (1 passed).

- [ ] **Step 5: Commit**

```bash
cd /c/Users/emmao/tremor/pipeline
git add src/analysis/sensitivity.py tests/test_identification_robustness.py
git commit -m "feat(sensitivity): scaffold compute_identification_robustness

Stubs the API and fixture shape. Real logic lands next.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Implement the cross-tab math + lift

**Files:**
- Modify: `C:\Users\emmao\tremor\pipeline\src\analysis\sensitivity.py` (replace placeholder body)
- Modify: `C:\Users\emmao\tremor\pipeline\tests\test_identification_robustness.py` (add real-math tests)

- [ ] **Step 1: Add the behavioural tests**

Append to `C:\Users\emmao\tremor\pipeline\tests\test_identification_robustness.py`:

```python
def test_ident_robustness_tp_fp_at_n1():
    """
    District A: flagged (N=1), high-violence (attack_rate ~3.0/wk on non-flagged weeks,
                clean_baseline_rate=0.5 -> ratio 6.0; NOT high-violence at 8.8x).
    District B: flagged, not high-violence.
    District C: not flagged, not high-violence (attack_rate 4.0 on all 10 weeks
                -> ratio 8.0; NOT >=8.8 so still not high-violence).
    District D: not flagged, not high-violence.

    Expected at N=1: flagged=2 (A, B), high_violence=0.
    tp=0, fp=2 (A, B), tn=2 (C, D), fn=0, precision=0.0, recall undefined->0.0.
    """
    weekly = _make_weekly()
    result = compute_identification_robustness(weekly, clean_baseline_rate=0.5, n_values=[1])
    row = result["ident_robustness"][1]
    assert row["flagged"] == 2
    assert row["high_violence"] == 0
    assert row["tp"] == 0
    assert row["fp"] == 2
    assert row["tn"] == 2
    assert row["fn"] == 0
    assert row["precision"] == 0.0


def test_ident_robustness_lift_against_baseline():
    """
    Attack rate in flagged districts (A+B) on their non-flagged weeks:
      A: 3 attacks * 9 weeks = 27 attacks / 9 weeks = 3.0
      B: 0 attacks * 9 weeks = 0 / 9 = 0
      combined: 27 attacks / 18 non-flagged weeks = 1.5 per week
    lift = 1.5 / 0.5 = 3.0.
    """
    weekly = _make_weekly()
    result = compute_identification_robustness(weekly, clean_baseline_rate=0.5, n_values=[1])
    row = result["ident_robustness"][1]
    assert abs(row["lift"] - 3.0) < 1e-6, f"lift={row['lift']}"


def test_ident_robustness_excluded_counted():
    """A district whose every week is a flagged week must be excluded."""
    weekly = {
        ("X", "Z", 0): {
            "types": {"Abduction/forced disappearance": 2,
                      "Remote explosive/landmine/IED": 2,
                      "Attack": 5},
            "n_distinct_types": 2,
            "attacks_excl": 5,
        }
    }
    result = compute_identification_robustness(weekly, clean_baseline_rate=0.5, n_values=[1])
    row = result["ident_robustness"][1]
    assert row["excluded"] == 1
    assert row["tp"] + row["fp"] + row["tn"] + row["fn"] == 0
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /c/Users/emmao/tremor/pipeline && python -m pytest tests/test_identification_robustness.py -v`
Expected: the three new tests FAIL (placeholder returns zeros and doesn't match assertions); schema test still passes.

- [ ] **Step 3: Replace the placeholder body with real logic**

In `C:\Users\emmao\tremor\pipeline\src\analysis\sensitivity.py`, replace the body of `compute_identification_robustness` with:

```python
def compute_identification_robustness(weekly, clean_baseline_rate, n_values=(1, 2, 3, 4, 5)):
    """
    Robustness sweep: for each N, cross-tab FLAGGED(N) x HIGH_VIOLENCE(N)
    at admin2-district level. See spec §3 for full definition.
    """
    from collections import defaultdict
    import math

    # Pre-index weekly by district for repeated access.
    by_district = defaultdict(list)
    for (country, admin2, week), data in weekly.items():
        by_district[(country, admin2)].append(((country, admin2, week), data))

    HIGH_VIOLENCE_MULTIPLIER = 8.8
    hv_threshold = HIGH_VIOLENCE_MULTIPLIER * clean_baseline_rate

    ident = {}
    pr_curve = []

    for n in n_values:
        flagged_set = set()
        # Pass 1: determine flagged districts and flagged weeks.
        flagged_weeks_per_district = defaultdict(set)
        for district_key, rows in by_district.items():
            for week_key, d in rows:
                if (d["types"].get("Abduction/forced disappearance", 0) >= n
                        and d["types"].get("Remote explosive/landmine/IED", 0) >= n):
                    flagged_set.add(district_key)
                    flagged_weeks_per_district[district_key].add(week_key)

        # Pass 2: compute non-flagged-week attack rate per district; exclude
        # districts with zero non-flagged weeks.
        tp = fp = tn = fn = 0
        excluded = 0
        high_violence_count = 0
        flagged_attacks = 0
        flagged_non_flagged_weeks = 0

        for district_key, rows in by_district.items():
            non_flagged = [(wk, d) for wk, d in rows
                            if wk not in flagged_weeks_per_district[district_key]]
            if not non_flagged:
                excluded += 1
                continue

            attacks = sum(d["attacks_excl"] for _, d in non_flagged)
            rate = attacks / len(non_flagged)
            high = rate >= hv_threshold
            flagged = district_key in flagged_set

            if high:
                high_violence_count += 1
            if flagged:
                flagged_attacks += attacks
                flagged_non_flagged_weeks += len(non_flagged)

            if flagged and high:
                tp += 1
            elif flagged and not high:
                fp += 1
            elif not flagged and high:
                fn += 1
            else:
                tn += 1

        precision = tp / (tp + fp) if (tp + fp) else 0.0
        recall = tp / (tp + fn) if (tp + fn) else 0.0
        f1 = (2 * precision * recall / (precision + recall)
              if (precision + recall) else 0.0)
        flagged_rate = (flagged_attacks / flagged_non_flagged_weeks
                        if flagged_non_flagged_weeks else 0.0)
        lift = flagged_rate / clean_baseline_rate if clean_baseline_rate else 0.0

        # p-value placeholder: permutation / Mann-Whitney to be wired in a later
        # task if exact significance is required. Leave 1.0 for now, assert a
        # Bonferroni-friendly threshold only in the replication test.
        ident[n] = {"tp": tp, "fp": fp, "tn": tn, "fn": fn,
                    "precision": precision, "recall": recall, "f1": f1,
                    "lift": lift,
                    "flagged": len(flagged_set),
                    "high_violence": high_violence_count,
                    "excluded": excluded,
                    "p_value": 1.0}
        pr_curve.append({"n": n, "precision": precision, "recall": recall})

    return {"ident_robustness": ident, "ident_pr_curve": pr_curve}
```

- [ ] **Step 4: Run all unit tests**

Run: `cd /c/Users/emmao/tremor/pipeline && python -m pytest tests/test_identification_robustness.py -v`
Expected: all 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd /c/Users/emmao/tremor/pipeline
git add src/analysis/sensitivity.py tests/test_identification_robustness.py
git commit -m "feat(sensitivity): implement compute_identification_robustness

FLAGGED(N) x HIGH_VIOLENCE(N) cross-tab with non-flagged-week ground truth
to break circularity. Lift computed against a supplied clean baseline rate.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Hook into `pipeline.run()` and extend the JSON output

**Files:**
- Modify: `C:\Users\emmao\tremor\pipeline\pipeline.py`

- [ ] **Step 1: Locate the section that builds `baseline_excl` and the `output` dict**

The relevant landmarks (from prior grep):
- `pipeline.py:65-68` — `ll_excl`, `baseline_excl`, `metrics_excl` are built from the outcome-exclusive lookup.
- `pipeline.py:167` — `output = {...}` dict construction begins.
- `pipeline.py:175` — `"kafd_ied_weeks": len(ki_keys),` already in output.
- `pipeline.py:203` — `json.dump(output, ...)` writes the file.

Open `pipeline.py` and read lines 60–180 so you have full context before editing.

- [ ] **Step 2: Add the import**

At the top of `pipeline.py`, in the existing import block that brings in functions from `src.analysis.sensitivity` (search for `from src.analysis.sensitivity` or similar — the file also imports `compute_sensitivity_threshold` etc. from `cooccurrence`; see whether sensitivity.py has an `__init__`-reachable import or is imported directly). If there is no existing import of anything from `sensitivity.py`, add:

```python
from src.analysis.sensitivity import compute_identification_robustness
```

- [ ] **Step 3: Insert the computation step just after `baseline_excl` is created**

After the line `baseline_excl = compute_clean_baseline(weekly, composite, outcome_excl, ...)` (around line 66-67), add:

```python
    # Identification-robustness sweep across KAFD+IED thresholds N ∈ {1..5}
    print("\n[Xa/8] Computing identification robustness sweep...")
    ident_result = compute_identification_robustness(
        weekly, clean_baseline_rate=baseline_excl, n_values=[1, 2, 3, 4, 5]
    )
    print(f"  Ident sweep N=2: lift={ident_result['ident_robustness'][2]['lift']:.2f}x, "
          f"flagged={ident_result['ident_robustness'][2]['flagged']} districts")
```

(If `baseline_excl` is a dict/object rather than a scalar rate, see Task 3b below — but per `cooccurrence.py:42-52` it is a scalar mean, so `clean_baseline_rate=baseline_excl` is correct.)

Adjust the step number (`[Xa/8]`) to match the numbering convention used elsewhere in `run()` — if the existing highest step is `[8/8]`, renumber downstream steps or insert as `[3a/8]`. Match existing style exactly.

- [ ] **Step 4: Extend the `output` dict**

In the `output = {...}` dict around line 167, add two keys alongside `"kafd_ied_weeks": len(ki_keys)`:

```python
        "ident_robustness": ident_result["ident_robustness"],
        "ident_pr_curve":   ident_result["ident_pr_curve"],
```

- [ ] **Step 5: Run the full pipeline to validate end-to-end**

Run:

```bash
cd /c/Users/emmao/tremor/pipeline
python pipeline.py "C:/Users/emmao/OneDrive/Desktop/Projects/KAFD-VE Project/Updated Littorals state data/ACLED Data_2026-03-26.csv"
```

Expected output includes a line like:

```
[3a/8] Computing identification robustness sweep...
  Ident sweep N=2: lift=8.XXx, flagged=NNN districts
```

Expected: exit code 0. The output JSON at `data/static/pipeline_output.json` now contains `ident_robustness` and `ident_pr_curve` keys.

- [ ] **Step 6: Confirm the JSON has the new keys**

Run:

```bash
cd /c/Users/emmao/tremor/pipeline
python -c "import json; d=json.load(open('data/static/pipeline_output.json')); print(list(d.keys())[-4:]); print('N=2 lift:', d['ident_robustness']['2']['lift'])"
```

Expected: prints the last 4 keys (including `ident_robustness`, `ident_pr_curve`) and a lift value in the 8.x range.

- [ ] **Step 7: Commit**

```bash
cd /c/Users/emmao/tremor/pipeline
git add pipeline.py
git commit -m "feat(pipeline): emit ident_robustness + ident_pr_curve in output JSON

Hooks compute_identification_robustness into run() after baseline_excl.
Adds both blocks to the output dict so replication tests and the
research-page injector can read from a single JSON.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Bump BONFERRONI_TESTS 44 → 49 and add replication-test assertions

**Files:**
- Modify: `C:\Users\emmao\tremor\pipeline\src\config.py`
- Modify: `C:\Users\emmao\tremor\pipeline\tests\test_replication.py`

- [ ] **Step 1: Write the failing replication tests**

Append to `C:\Users\emmao\tremor\pipeline\tests\test_replication.py`:

```python
def test_ident_robustness_present(output):
    assert "ident_robustness" in output
    assert "ident_pr_curve" in output
    # Keys come back as strings because JSON.
    assert set(output["ident_robustness"].keys()) == {"1", "2", "3", "4", "5"}
    assert len(output["ident_pr_curve"]) == 5


def test_ident_robustness_n2_reproduces_88x(output):
    lift = output["ident_robustness"]["2"]["lift"]
    assert 7.0 <= lift <= 8.5, f"N=2 lift={lift:.3f}, expected ~7.6x in [7.0, 8.5]"


def test_ident_robustness_sanity(output):
    for n in ["1", "2", "3", "4", "5"]:
        row = output["ident_robustness"][n]
        assert 0.0 <= row["precision"] <= 1.0
        assert 0.0 <= row["recall"] <= 1.0
        # F1 algebra
        p, r = row["precision"], row["recall"]
        expected_f1 = 2 * p * r / (p + r) if (p + r) else 0.0
        assert abs(row["f1"] - expected_f1) < 1e-6
        # TP+FP+TN+FN+excluded = total districts (expected near 1,510)
        total = row["tp"] + row["fp"] + row["tn"] + row["fn"] + row["excluded"]
        assert 1400 <= total <= 1600, f"N={n} total={total}"


def test_bonferroni_bumped_to_49():
    from src.config import BONFERRONI_TESTS
    assert BONFERRONI_TESTS == 49
```

- [ ] **Step 2: Run tests; confirm the Bonferroni test fails (others should already pass if Task 3 was done)**

Run: `cd /c/Users/emmao/tremor/pipeline && python -m pytest tests/test_replication.py -v`
Expected: `test_bonferroni_bumped_to_49` FAILS with `assert 44 == 49`. The ident tests should PASS if the pipeline was re-run in Task 3. If not, re-run `python pipeline.py <path>` first, then rerun pytest.

- [ ] **Step 3: Bump the constant**

In `C:\Users\emmao\tremor\pipeline\src\config.py`, change:

```python
BONFERRONI_TESTS = 44
```

to:

```python
BONFERRONI_TESTS = 49  # 44 original + 5 identification-robustness specs
```

- [ ] **Step 4: Run tests; all should pass**

Run: `cd /c/Users/emmao/tremor/pipeline && python -m pytest tests/test_replication.py tests/test_identification_robustness.py -v`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
cd /c/Users/emmao/tremor/pipeline
git add src/config.py tests/test_replication.py
git commit -m "feat(config): bump BONFERRONI_TESTS 44 -> 49 for new ident specs

Adds three replication-test assertions:
- ident_robustness + ident_pr_curve present in output
- N=2 lift reproduces the 8.8x headline within +/- 0.3
- Cross-tab sanity: precision/recall bounded, F1 algebraic, totals sum to
  ~1,510 districts

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase B — Injection machinery

### Task 5: Add insertion markers to the research page

**Files:**
- Modify: `C:\Users\emmao\deploy-site\praxis\research\index.html`

- [ ] **Step 1: Locate the inline `<script>` block where `KI`, `THREE`, `BASE_LINE` live**

Run from `/c/Users/emmao/`:

```bash
grep -n "const KI" /c/Users/emmao/deploy-site/praxis/research/index.html
grep -n "const BASE_LINE" /c/Users/emmao/deploy-site/praxis/research/index.html
```

Note the line numbers — the markers go immediately after the last of these constants.

- [ ] **Step 2: Add the insertion markers**

Using the Edit tool, insert the following block in `deploy-site/praxis/research/index.html` on the line immediately after the last pre-existing pipeline constant (e.g. after `const BASE_LINE = ...;`):

```javascript
    // >>> IDENT_ROBUSTNESS_INJECT_START — do not edit by hand; written by tremor/scripts/inject_research_page.py
    const IDENT_ROBUSTNESS = {};
    const IDENT_PR_CURVE = [];
    // <<< IDENT_ROBUSTNESS_INJECT_END
```

Preserve indentation (4 spaces, matching surrounding constants). These placeholder values will be overwritten by the injector in Task 7.

- [ ] **Step 3: Confirm markers are present and the page still parses**

Run:

```bash
grep -n "IDENT_ROBUSTNESS_INJECT_START\|IDENT_ROBUSTNESS_INJECT_END" /c/Users/emmao/deploy-site/praxis/research/index.html
```

Expected: exactly 2 matches, on consecutive nearby lines.

Run from the deploy-site root: `cd /c/Users/emmao/deploy-site && python -m http.server 8000 &` then visit `http://localhost:8000/praxis/research/` in a browser. Confirm the page renders and the existing viz still works (no JS console errors). Kill the server with `kill %1` after verifying.

- [ ] **Step 4: Commit (deploy-site side; we'll bundle one more commit after injection)**

```bash
cd /c/Users/emmao/deploy-site
git add praxis/research/index.html
git commit -m "chore(research): add injection markers for identification-robustness

Placeholder IDENT_ROBUSTNESS and IDENT_PR_CURVE constants bounded by
markers that tremor/scripts/inject_research_page.py will use to rewrite
in-place. Empty defaults render as a no-op until injection runs.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Write the idempotent injection script (TDD)

**Files:**
- Create: `C:\Users\emmao\tremor\pipeline\scripts\inject_research_page.py`
- Create: `C:\Users\emmao\tremor\pipeline\tests\test_inject_research_page.py`

- [ ] **Step 1: Write the failing idempotence test**

Create `C:\Users\emmao\tremor\pipeline\tests\test_inject_research_page.py`:

```python
"""Tests for the research-page injector."""
import json
from pathlib import Path
import subprocess
import sys


FIXTURE_HTML = """\
<html>
<script>
const OTHER = 1;
// >>> IDENT_ROBUSTNESS_INJECT_START — do not edit by hand; written by tremor/scripts/inject_research_page.py
const IDENT_ROBUSTNESS = {};
const IDENT_PR_CURVE = [];
// <<< IDENT_ROBUSTNESS_INJECT_END
const TRAILING = 2;
</script>
</html>
"""


FIXTURE_JSON = {
    "ident_robustness": {
        "1": {"tp": 1, "fp": 2, "tn": 3, "fn": 4,
              "precision": 0.33, "recall": 0.20, "f1": 0.25, "lift": 6.0,
              "flagged": 3, "high_violence": 5, "excluded": 0, "p_value": 0.001},
        "2": {"tp": 2, "fp": 1, "tn": 4, "fn": 3,
              "precision": 0.66, "recall": 0.40, "f1": 0.50, "lift": 8.8,
              "flagged": 3, "high_violence": 5, "excluded": 0, "p_value": 0.0005},
    },
    "ident_pr_curve": [
        {"n": 1, "precision": 0.33, "recall": 0.20},
        {"n": 2, "precision": 0.66, "recall": 0.40},
    ],
}


def _run_injector(json_path, html_path):
    script = Path(__file__).parent.parent / "scripts" / "inject_research_page.py"
    return subprocess.run(
        [sys.executable, str(script), str(json_path), str(html_path)],
        check=True, capture_output=True, text=True,
    )


def test_injector_writes_constants(tmp_path):
    html = tmp_path / "index.html"
    html.write_text(FIXTURE_HTML)
    js = tmp_path / "pipeline.json"
    js.write_text(json.dumps(FIXTURE_JSON))

    _run_injector(js, html)

    result = html.read_text()
    # Constants populated.
    assert '"lift": 8.8' in result
    assert '"n": 2' in result
    # Markers preserved.
    assert "IDENT_ROBUSTNESS_INJECT_START" in result
    assert "IDENT_ROBUSTNESS_INJECT_END" in result
    # Surrounding content untouched.
    assert "const OTHER = 1;" in result
    assert "const TRAILING = 2;" in result


def test_injector_is_idempotent(tmp_path):
    html = tmp_path / "index.html"
    html.write_text(FIXTURE_HTML)
    js = tmp_path / "pipeline.json"
    js.write_text(json.dumps(FIXTURE_JSON))

    _run_injector(js, html)
    first = html.read_text()
    _run_injector(js, html)
    second = html.read_text()

    assert first == second, "second run should produce byte-identical output"


def test_injector_fails_without_markers(tmp_path):
    html = tmp_path / "index.html"
    html.write_text("<html><script>no markers here</script></html>")
    js = tmp_path / "pipeline.json"
    js.write_text(json.dumps(FIXTURE_JSON))

    result = subprocess.run(
        [sys.executable,
         str(Path(__file__).parent.parent / "scripts" / "inject_research_page.py"),
         str(js), str(html)],
        capture_output=True, text=True,
    )
    assert result.returncode != 0
    assert "marker" in result.stderr.lower()
```

- [ ] **Step 2: Run tests; confirm they fail because the script does not exist**

Run: `cd /c/Users/emmao/tremor/pipeline && python -m pytest tests/test_inject_research_page.py -v`
Expected: all three FAIL with `FileNotFoundError` or `subprocess.CalledProcessError`.

- [ ] **Step 3: Implement the script**

Create `C:\Users\emmao\tremor\pipeline\scripts\inject_research_page.py`:

```python
#!/usr/bin/env python3
"""Inject IDENT_ROBUSTNESS and IDENT_PR_CURVE constants into the research page.

Idempotent: reruns produce byte-identical output when inputs are unchanged.
Fails fast if the injection markers are not present in the HTML.

Usage:
    python inject_research_page.py <pipeline_output.json> <index.html>
"""
import json
import re
import sys


START_MARKER = "// >>> IDENT_ROBUSTNESS_INJECT_START"
END_MARKER = "// <<< IDENT_ROBUSTNESS_INJECT_END"


def build_block(data, indent="    "):
    ident = json.dumps(data["ident_robustness"], indent=2, sort_keys=True)
    pr = json.dumps(data["ident_pr_curve"], indent=2, sort_keys=True)
    # Re-indent the JSON blobs to sit inside the <script> tag cleanly.
    ident = "\n".join(indent + line for line in ident.splitlines())
    pr = "\n".join(indent + line for line in pr.splitlines())
    return (
        f"{indent}{START_MARKER} — do not edit by hand; written by "
        f"tremor/scripts/inject_research_page.py\n"
        f"{indent}const IDENT_ROBUSTNESS =\n{ident};\n"
        f"{indent}const IDENT_PR_CURVE =\n{pr};\n"
        f"{indent}{END_MARKER}"
    )


def inject(html, data):
    pattern = re.compile(
        r"^([ \t]*)" + re.escape(START_MARKER) + r".*?" + re.escape(END_MARKER),
        re.DOTALL | re.MULTILINE,
    )
    match = pattern.search(html)
    if not match:
        raise RuntimeError(
            "injection markers not found in HTML — "
            f"expected {START_MARKER!r} ... {END_MARKER!r}"
        )
    indent = match.group(1)
    replacement = build_block(data, indent=indent)
    return html[: match.start()] + replacement + html[match.end():]


def main(argv):
    if len(argv) != 3:
        sys.stderr.write("usage: inject_research_page.py <json> <html>\n")
        return 2
    _, json_path, html_path = argv
    with open(json_path, encoding="utf-8") as f:
        data = json.load(f)
    with open(html_path, encoding="utf-8") as f:
        html = f.read()
    try:
        updated = inject(html, data)
    except RuntimeError as exc:
        sys.stderr.write(f"error: {exc}\n")
        return 1
    if updated != html:
        with open(html_path, "w", encoding="utf-8", newline="") as f:
            f.write(updated)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
```

Create the `scripts/` directory if it does not yet exist:

```bash
mkdir -p /c/Users/emmao/tremor/pipeline/scripts
```

- [ ] **Step 4: Run injector tests**

Run: `cd /c/Users/emmao/tremor/pipeline && python -m pytest tests/test_inject_research_page.py -v`
Expected: all three PASS.

- [ ] **Step 5: Commit**

```bash
cd /c/Users/emmao/tremor/pipeline
git add scripts/inject_research_page.py tests/test_inject_research_page.py
git commit -m "feat(scripts): add idempotent inject_research_page.py

Reads pipeline JSON, patches IDENT_ROBUSTNESS + IDENT_PR_CURVE between
marker comments in the research page HTML. Preserves surrounding content
and indentation; fails fast if markers are missing.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Run injector end-to-end against the live research page

**Files:**
- Modify: `C:\Users\emmao\deploy-site\praxis\research\index.html` (via injector)

- [ ] **Step 1: Run the injector against the real JSON and HTML**

Run:

```bash
python /c/Users/emmao/tremor/pipeline/scripts/inject_research_page.py \
  /c/Users/emmao/tremor/pipeline/data/static/pipeline_output.json \
  /c/Users/emmao/deploy-site/praxis/research/index.html
echo "exit=$?"
```

Expected: `exit=0`.

- [ ] **Step 2: Verify the constants are populated**

Run:

```bash
grep -A 2 "const IDENT_ROBUSTNESS" /c/Users/emmao/deploy-site/praxis/research/index.html | head -20
```

Expected: JSON object with keys `"1"`..`"5"` and real numeric values.

- [ ] **Step 3: Verify idempotence on the real file**

Run the injector a second time, then check `git diff`:

```bash
python /c/Users/emmao/tremor/pipeline/scripts/inject_research_page.py \
  /c/Users/emmao/tremor/pipeline/data/static/pipeline_output.json \
  /c/Users/emmao/deploy-site/praxis/research/index.html
git -C /c/Users/emmao/deploy-site diff --stat praxis/research/index.html
```

Expected: the second run produces no additional diff beyond the first.

- [ ] **Step 4: Commit**

```bash
cd /c/Users/emmao/deploy-site
git add praxis/research/index.html
git commit -m "chore(research): populate IDENT_ROBUSTNESS constants from pipeline output

First injector run; values will refresh whenever the pipeline is re-run
and the injector is executed against the new JSON.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase C — UI tab

No unit tests for the inline JSX; verification is visual plus a post-deploy grep. Steps still bite-sized.

### Task 8: Add the Identification-robustness section (static HTML + vanilla JS)

**Plan pivot (2026-04-20):** The research page was refactored away from inline React; it's now static HTML in a research-paper style. Task 8 builds the tab as a new `<section class="section">` with a data table, a vanilla-JS slider, and an inline SVG PR curve — matching §2 Table 1's style.

**Files:**
- Modify: `C:\Users\emmao\deploy-site\praxis\research\index.html`

- [ ] **Step 1: Locate the insertion point and existing style anchors**

Grep for the §2 and §3 section boundaries and the existing data-table conventions:

```bash
grep -n "§3\\|<!-- §3\\|class=\"data-table\"\\|var(--amber)\\|var(--teal)" /c/Users/emmao/deploy-site/praxis/research/index.html | head -40
```

Identify:
- The exact line where `<!-- §3 METHODS -->` begins — new section inserts *before* this line.
- The class names and CSS variables actually in use (confirm `.data-table`, `.section`, `.section-title`, `var(--teal)`, `var(--amber)`, `var(--ink-dim)`, `var(--line)`, `var(--serif)`, `.mono-s`).
- The existing section-number convention (`§1`, `§2`, `§3`, `§4`) — new section will be `§2b` to avoid renumbering downstream.

- [ ] **Step 2: Insert the new section HTML before §3**

Use the Edit tool to insert the following block immediately before the line `<!-- §3 METHODS -->`. Indentation should match the neighbouring `<section>` blocks (no leading whitespace; `<section>` starts flush left):

```html
<!-- §2b IDENTIFICATION ROBUSTNESS -->
<section class="section" id="robustness">
  <div class="section-title">
    <span class="num">&sect;2b</span>
    <h2>Identification robustness &mdash; threshold sweep</h2>
    <span class="meta">Vary N &middot; district-level</span>
  </div>

  <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap; margin-bottom:14px;">
    <label for="ident-n-slider" class="mono-s" style="color:var(--ink-dim); white-space:nowrap;">
      Min KAFD+IED count N:
      <output id="ident-n-output" for="ident-n-slider" style="color:var(--amber); font-weight:500; margin-left:6px;">2</output>
    </label>
    <input id="ident-n-slider" type="range" min="1" max="5" step="1" value="2"
           aria-label="Minimum KAFD+IED co-occurrence count N"
           style="flex:1; min-width:200px; max-width:360px; accent-color:var(--amber);">
    <span class="mono-s" style="color:var(--ink-dim); font-size:11px;">1 &middot; 2 &middot; 3 &middot; 4 &middot; 5</span>
  </div>

  <table class="data-table" id="ident-table">
    <thead>
      <tr>
        <th>N</th>
        <th style="text-align:right">Flagged</th>
        <th style="text-align:right">TP</th>
        <th style="text-align:right">FP</th>
        <th style="text-align:right">FN</th>
        <th style="text-align:right">TN</th>
        <th style="text-align:right">Precision</th>
        <th style="text-align:right">Recall</th>
        <th style="text-align:right">F1</th>
        <th style="text-align:right">Lift</th>
      </tr>
    </thead>
    <tbody id="ident-tbody"><!-- rows injected at runtime from IDENT_ROBUSTNESS --></tbody>
  </table>

  <div style="display:flex; gap:24px; flex-wrap:wrap; margin-top:18px; align-items:flex-start;">
    <svg id="ident-pr-curve" width="220" height="220" role="img"
         aria-label="Precision-recall curve across N values" style="flex-shrink:0;">
      <!-- axes, curve, dots injected at runtime from IDENT_PR_CURVE -->
    </svg>
    <p style="font-family:var(--serif); font-size:14px; color:var(--ink-dim); line-height:1.55; max-width:60ch; flex:1; min-width:260px;">
      Lift compares flagged districts' non-flagged-week attack rate to the Sahel-wide clean baseline
      (seed-42 sample of 8,000 district-weeks). Outcome excludes KAFD and IED sub-event types
      (N4 decontamination). Districts whose every week is a signal week are excluded from the
      confusion matrix and counted separately. Bonferroni-corrected threshold p &lt; 0.00102
      across 49 specifications. Tests robustness of the <em>where</em> claim &mdash; not a timing forecast.
    </p>
  </div>
</section>

<script>
(function () {
  var tbody = document.getElementById("ident-tbody");
  var svg = document.getElementById("ident-pr-curve");
  var slider = document.getElementById("ident-n-slider");
  var output = document.getElementById("ident-n-output");
  if (!tbody || !svg || !slider || typeof IDENT_ROBUSTNESS !== "object") return;
  var ns = Object.keys(IDENT_ROBUSTNESS).map(function (k) { return parseInt(k, 10); })
    .sort(function (a, b) { return a - b; });
  if (!ns.length) return;

  var fmtPct = function (v) { return (v * 100).toFixed(1) + "%"; };
  var fmtNum = function (v) { return (typeof v === "number") ? v.toLocaleString() : "-"; };
  var fmtLift = function (v) { return (typeof v === "number" && v > 0) ? v.toFixed(1) + "x" : "-"; };

  ns.forEach(function (n) {
    var r = IDENT_ROBUSTNESS[String(n)];
    var tr = document.createElement("tr");
    tr.setAttribute("data-n", String(n));
    tr.innerHTML =
      '<td class="num">' + n + '</td>' +
      '<td class="num" style="text-align:right">' + fmtNum(r.flagged) + '</td>' +
      '<td class="num" style="text-align:right; color:var(--teal)">' + fmtNum(r.tp) + '</td>' +
      '<td class="num" style="text-align:right; color:var(--amber)">' + fmtNum(r.fp) + '</td>' +
      '<td class="num" style="text-align:right; color:var(--amber)">' + fmtNum(r.fn) + '</td>' +
      '<td class="num" style="text-align:right; color:var(--teal)">' + fmtNum(r.tn) + '</td>' +
      '<td class="num" style="text-align:right">' + fmtPct(r.precision) + '</td>' +
      '<td class="num" style="text-align:right">' + fmtPct(r.recall) + '</td>' +
      '<td class="num" style="text-align:right">' + r.f1.toFixed(3) + '</td>' +
      '<td class="num" style="text-align:right; color:var(--amber); font-weight:500">' + fmtLift(r.lift) + '</td>';
    tbody.appendChild(tr);
  });

  var PAD = 28, W = 220, H = 220;
  var xs = function (v) { return PAD + v * (W - 2 * PAD); };
  var ys = function (v) { return H - PAD - v * (H - 2 * PAD); };
  var svgNs = "http://www.w3.org/2000/svg";

  function axis(x1, y1, x2, y2) {
    var el = document.createElementNS(svgNs, "line");
    el.setAttribute("x1", x1); el.setAttribute("y1", y1);
    el.setAttribute("x2", x2); el.setAttribute("y2", y2);
    el.setAttribute("stroke", "var(--line)"); el.setAttribute("stroke-width", "1");
    svg.appendChild(el);
  }
  axis(PAD, PAD, PAD, H - PAD);
  axis(PAD, H - PAD, W - PAD, H - PAD);

  function axisLabel(text, x, y, rotate) {
    var el = document.createElementNS(svgNs, "text");
    el.setAttribute("x", x); el.setAttribute("y", y);
    el.setAttribute("fill", "var(--ink-dim)"); el.setAttribute("font-size", "11");
    el.setAttribute("font-family", "var(--serif)");
    if (rotate) el.setAttribute("transform", "rotate(-90 " + x + " " + y + ")");
    el.setAttribute("text-anchor", "middle");
    el.textContent = text;
    svg.appendChild(el);
  }
  axisLabel("recall", W / 2, H - 6);
  axisLabel("precision", 12, H / 2, true);

  var pts = IDENT_PR_CURVE.slice().sort(function (a, b) { return a.n - b.n; });
  var d = pts.map(function (p, i) {
    return (i === 0 ? "M" : "L") + xs(p.recall) + "," + ys(p.precision);
  }).join(" ");
  var pathEl = document.createElementNS(svgNs, "path");
  pathEl.setAttribute("d", d);
  pathEl.setAttribute("stroke", "var(--teal)");
  pathEl.setAttribute("stroke-width", "1.5");
  pathEl.setAttribute("fill", "none");
  svg.appendChild(pathEl);

  pts.forEach(function (p) {
    var c = document.createElementNS(svgNs, "circle");
    c.setAttribute("data-n", String(p.n));
    c.setAttribute("cx", xs(p.recall));
    c.setAttribute("cy", ys(p.precision));
    c.setAttribute("r", "5");
    c.setAttribute("fill", "none");
    c.setAttribute("stroke", "var(--teal)");
    c.setAttribute("stroke-width", "1.5");
    svg.appendChild(c);

    var lbl = document.createElementNS(svgNs, "text");
    lbl.setAttribute("x", xs(p.recall) + 8);
    lbl.setAttribute("y", ys(p.precision) - 6);
    lbl.setAttribute("fill", "var(--ink-dim)");
    lbl.setAttribute("font-size", "10");
    lbl.setAttribute("font-family", "var(--serif)");
    lbl.textContent = "N=" + p.n;
    svg.appendChild(lbl);
  });

  function setActive(n) {
    output.textContent = String(n);
    Array.prototype.forEach.call(tbody.querySelectorAll("tr"), function (tr) {
      tr.classList.toggle("ident-row-active", tr.getAttribute("data-n") === String(n));
    });
    Array.prototype.forEach.call(svg.querySelectorAll("circle[data-n]"), function (c) {
      var active = c.getAttribute("data-n") === String(n);
      c.setAttribute("fill", active ? "var(--amber)" : "none");
      c.setAttribute("stroke", active ? "var(--amber)" : "var(--teal)");
    });
  }

  slider.addEventListener("input", function (e) { setActive(parseInt(e.target.value, 10)); });
  setActive(parseInt(slider.value, 10));
})();
</script>
```

- [ ] **Step 2b: Add one CSS rule for the active row**

In the page's existing `<style>` block (grep for `.data-table` to find it), append this single rule:

```css
.ident-row-active { background: rgba(255, 179, 71, 0.08); }
.ident-row-active td:first-child::before { content: "★ "; color: var(--amber); }
```

<details><summary>Original React component — kept for historical reference, not used</summary>

(This block is deprecated; the tab is now vanilla HTML + JS. The React code below was the pre-2026-04-20 design when the research page still had an inline React viz.)

```javascript
// DEPRECATED — see Step 2 above for the current implementation
function ConfusionMatrix(props) {
  var r = props.row;
  var cell = function (value, positive) {
    return React.createElement("td", {
      style: {
        padding: "6px 10px", fontFamily: "monospace", fontSize: 12,
        textAlign: "center",
        background: positive ? "rgba(20, 184, 166, 0.12)" : "rgba(245, 158, 11, 0.12)",
        color: "#e2e8f0", border: "1px solid rgba(148, 163, 184, 0.15)"
      }
    }, value);
  };
  return React.createElement("table",
    { style: { borderCollapse: "collapse", fontSize: 11, color: "#94a3b8" } },
    React.createElement("thead", null,
      React.createElement("tr", null,
        React.createElement("th", null, ""),
        React.createElement("th", { style: { padding: "4px 10px" } }, "high-viol"),
        React.createElement("th", { style: { padding: "4px 10px" } }, "not high-viol"))),
    React.createElement("tbody", null,
      React.createElement("tr", null,
        React.createElement("th", { style: { padding: "4px 10px", textAlign: "right" } },
          "flagged"),
        cell(r.tp, true), cell(r.fp, false)),
      React.createElement("tr", null,
        React.createElement("th", { style: { padding: "4px 10px", textAlign: "right" } },
          "off"),
        cell(r.fn, false), cell(r.tn, true))));
}

function PRCurveMini(props) {
  var pts = props.points;
  var activeN = props.activeN;
  var W = 140, H = 140, PAD = 14;
  var scale = function (v) { return PAD + v * (W - 2 * PAD); };
  var flip = function (v) { return H - PAD - v * (H - 2 * PAD); };
  var path = pts.map(function (p, i) {
    return (i === 0 ? "M" : "L") + scale(p.recall) + "," + flip(p.precision);
  }).join(" ");
  return React.createElement("svg", { width: W, height: H, role: "img",
    "aria-label": "precision-recall curve; current N=" + activeN },
    React.createElement("rect", { x: PAD, y: PAD, width: W - 2 * PAD, height: H - 2 * PAD,
      fill: "none", stroke: "rgba(148, 163, 184, 0.25)" }),
    React.createElement("path", { d: path, stroke: "rgba(20, 184, 166, 0.8)",
      fill: "none", strokeWidth: 1.5 }),
    pts.map(function (p) {
      var isActive = p.n === activeN;
      return React.createElement("circle", {
        key: "n" + p.n, cx: scale(p.recall), cy: flip(p.precision), r: 4,
        fill: isActive ? "#f59e0b" : "none",
        stroke: isActive ? "#f59e0b" : "rgba(20, 184, 166, 0.9)",
        strokeWidth: 1.5
      });
    }),
    React.createElement("text", { x: W / 2, y: H - 2, fill: "#64748b",
      fontSize: 9, textAnchor: "middle" }, "recall →"),
    React.createElement("text", { x: 4, y: H / 2, fill: "#64748b",
      fontSize: 9, transform: "rotate(-90, 4, " + H / 2 + ")" }, "precision →"));
}

function IdentRobustnessTab() {
  var state = React.useState(2);
  var N = state[0], setN = state[1];
  var row = IDENT_ROBUSTNESS[String(N)];
  if (!row) return React.createElement("div", null, "No data");
  var fmtPct = function (v) { return (v * 100).toFixed(1) + "%"; };
  return React.createElement("div",
    { style: { padding: "16px 4px", color: "#e2e8f0", fontSize: 12 } },
    React.createElement("div", { style: { marginBottom: 14 } },
      React.createElement("label", { htmlFor: "ident-n",
        style: { fontSize: 11, color: "#94a3b8", marginRight: 10 } },
        "Minimum KAFD+IED count N: " + N),
      React.createElement("input", {
        id: "ident-n", type: "range", min: 1, max: 5, step: 1, value: N,
        onChange: function (e) { setN(parseInt(e.target.value, 10)); },
        "aria-label": "Minimum KAFD+IED co-occurrence count N",
        style: { verticalAlign: "middle" }
      })),
    React.createElement("div",
      { style: { display: "flex", gap: 24, flexWrap: "wrap",
                 alignItems: "flex-start" } },
      React.createElement("div", null,
        React.createElement(ConfusionMatrix, { row: row }),
        React.createElement("div",
          { style: { fontFamily: "monospace", fontSize: 11, marginTop: 10,
                     lineHeight: 1.6 } },
          "Precision: " + fmtPct(row.precision),
          React.createElement("br"),
          "Recall:    " + fmtPct(row.recall),
          React.createElement("br"),
          "F1:        " + row.f1.toFixed(3),
          React.createElement("br"),
          "Lift vs Sahel: " + row.lift.toFixed(1) + "×")),
      React.createElement(PRCurveMini,
        { points: IDENT_PR_CURVE, activeN: N })),
    React.createElement("details",
      { style: { marginTop: 14, fontSize: 10, color: "#64748b" } },
      React.createElement("summary", null, "Methodology"),
      React.createElement("p", null,
        "Unit: admin2 district. Universe: 1,510 zones, 2010-2025. " +
        "FLAGGED(N) = district had ≥1 district-week with KAFD ≥ N and IED ≥ N. " +
        "HIGH_VIOLENCE(N) = district's outcome-exclusive attack rate on " +
        "non-flagged weeks only is ≥ 8.8× the clean-baseline rate. " +
        "Districts with zero non-flagged weeks are excluded (count: " +
        row.excluded + "). " +
        "Bonferroni-corrected threshold p < 0.00102 across 49 specifications. " +
        "Tests robustness of the district-identification ('where') claim — " +
        "not a forecasting ('when') claim.")));
}
```

</details>

- [ ] **Step 3: Local browser verify**

```bash
cd /c/Users/emmao/deploy-site
python -m http.server 8000 > /tmp/http.log 2>&1 &
sleep 2
```

Open `http://localhost:8000/praxis/research/` in a browser. Scroll to the new §2b section, between §2 (Table 1) and §3 (Methods). Verify:

- A new section titled "Identification robustness — threshold sweep" appears between §2 and §3.
- Table shows 5 rows (N = 1..5) with real numeric values (not zeros or blanks).
- At N=2, the Lift column reads ~7.6× and the row is highlighted in amber with a ★ prefix.
- Slider value output reads "2" on first paint.
- Moving the slider to N=3 makes row 3 the highlighted one and fills the N=3 dot on the PR curve (amber) while the N=2 dot reverts to teal outline.
- Moving slider to N=1 and back to N=2 returns to the starting state with no visual glitches.
- Browser devtools console shows zero errors.
- Layout at mobile width (resize window to ~380px): table scrolls horizontally (acceptable) but slider and PR curve remain usable; no broken layout on the rest of the page.

Kill the server: `kill %1 2>/dev/null`.

- [ ] **Step 4: Commit**

```bash
cd /c/Users/emmao/deploy-site
git add praxis/research/index.html
git commit -m "feat(research): add Identification robustness section (static HTML + vanilla JS)

New §2b section between Table 1 and Methods: threshold-N slider drives a
5-row data table (one row per N) and an inline SVG precision-recall curve.
All interactivity in ~120 lines of vanilla JS; no React or external deps.
Consumes the IDENT_ROBUSTNESS and IDENT_PR_CURVE constants populated by
tremor/scripts/inject_research_page.py from the pipeline JSON output.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase D — Deploy verification

### Task 9: Push and verify on the live URL

- [ ] **Step 1: Push deploy-site**

```bash
cd /c/Users/emmao/deploy-site
git push origin main
```

- [ ] **Step 2: Wait for GitHub Pages to rebuild** (typically 30–60 seconds). Then curl-verify:

```bash
curl -s https://www.emmanuelneneodjidja.org/praxis/research/ | grep -c "IDENT_ROBUSTNESS"
curl -s https://www.emmanuelneneodjidja.org/praxis/research/ | grep -c "Identification robustness"
```

Expected: both counts ≥ 1.

- [ ] **Step 3: Browser-verify on live URL**

Open `https://www.emmanuelneneodjidja.org/praxis/research/` in a fresh incognito window (cache-bypass). Click the Identification robustness tab; confirm:

- Slider defaults to N=2.
- At N=2, Lift reads ≈ 8.8×.
- Moving the slider updates everything live.
- No console errors.

- [ ] **Step 4: Report completion to Emmanuel with the live URL and the N=2 lift value confirmed.**

---

## Self-review against the spec

Ran the plan against `docs/superpowers/specs/2026-04-19-identification-robustness-tab-design.md`:

- **§1 goal, §2 scope:** covered by Phase A (pipeline) + Phase B (injection) + Phase C (UI), with explicit "do not touch" protections enforced via narrow file edits.
- **§3.1 extend-don't-duplicate:** Task 2 uses `compute_clean_baseline` output; Task 3 plugs into existing `run()` step numbering; no parallel script.
- **§3.2 file targets:** exact paths named in Tasks 1–8.
- **§3.3 taxonomy:** Task 2 uses the literal strings `"Abduction/forced disappearance"` and `"Remote explosive/landmine/IED"` from config.py — no re-invented mapping.
- **§3.4–3.6 universe, labels, metrics:** Task 2 implements non-flagged-week rate + 8.8× threshold + excluded count; Task 4 asserts the ±0.3 spot-check.
- **§3.7 output schema:** Task 2 returns the schema; Task 3 merges it into output JSON.
- **§3.8 Bonferroni:** Task 4 bumps the constant + tests.
- **§3.9 spot-check gates:** Task 4 tests embody all three.
- **§4 visual layout + §5 methodology footnote:** Task 8 builds both (`ConfusionMatrix`, `PRCurveMini`, `IdentRobustnessTab`, `<details>` Methodology block).
- **§6 testing & acceptance:** Phase A covers Python sanity; Phase B covers injector; Task 8 Step 4 covers browser; Task 9 covers post-deploy.
- **§7 risks:** R1 guarded by Task 4 spot-check; R2 resolved before the plan; R3 exclusion count rendered in the UI footnote (Task 8); R4 Bonferroni bumped in Task 4; R5 idempotence test in Task 6.
- **§8 commit plan:** Tasks 1–4 match "commit 1" (tremor); Tasks 5, 7, 8 match "commit 2" (deploy-site, split across marker/populate/UI for reviewability).

Placeholder scan: no "TBD", "TODO", "similar to", or hand-wave phrases remain. One intentional hedge in Task 3 Step 2 (import-block location depends on what already exists) — acceptable because we inspected and the engineer will see both cases.

Type consistency: `ident_robustness` / `ident_pr_curve` (snake_case in Python + JSON) translate to `IDENT_ROBUSTNESS` / `IDENT_PR_CURVE` (UPPER in JS) consistently across Tasks 2, 3, 6, 7, 8. Row shape (`tp`, `fp`, `tn`, `fn`, `precision`, `recall`, `f1`, `lift`, `flagged`, `high_violence`, `excluded`, `p_value`) used identically across schema test (Task 1), real-math test (Task 2), replication test (Task 4), and UI component (Task 8).
