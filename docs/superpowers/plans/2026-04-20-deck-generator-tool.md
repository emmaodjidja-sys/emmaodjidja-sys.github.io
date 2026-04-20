# PRAXIS Deck Generator Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone browser-based presentation tool at `/praxis/tools/deck-generator/` that turns a PRAXIS Workbench evaluation into a topnotch live-presenter deck with two templates (Inception Brief, Findings Brief), PDF export, and demo-data fallback for portfolio visitors.

**Architecture:** Single-file HTML app (React 18 + Babel Standalone via unpkg, no build step). Reads workbench data from sessionStorage, falls back to inline `DEMO_CONTEXT` when standalone. Inline edits persist via localStorage. Vanilla SVG for three "earn its keep" data visualisations (ToC tree, sampling bars, evaluability radar). Matches existing PRAXIS tool pattern (toc-builder, eval-matrix-builder).

**Tech Stack:** React 18 (UMD), ReactDOM 18 (UMD), Babel Standalone (JSX in-browser), inline CSS with PRAXIS design tokens, vanilla SVG, browser Fullscreen API.

**Spec reference:** `docs/superpowers/specs/2026-04-20-deck-generator-tool-design.md`

**Testing model:** No automated test harness (matches existing PRAXIS tools). Each task ends with a **reproducible manual verification** against spec acceptance criteria, performed via local HTTP server at `http://localhost:8765/praxis/tools/deck-generator/` (already running; restart with `python -m http.server 8765 --directory ~/deploy-site` if not).

**Anchor comment convention:** Since everything lives in one ~2,500-line file, use HTML comment anchors to navigate: `<!-- ══ SECTION: Slide Library — Inception ══ -->`. All tasks below reference anchors for insertion points.

---

## Task 1: Skeleton, CDN bootstrap, top-bar chrome

**Files:**
- Create: `praxis/tools/deck-generator/index.html`

- [ ] **Step 1: Create the file with full HTML boilerplate, CDNs, and design tokens**

Write this to `praxis/tools/deck-generator/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Deck Generator — PRAXIS Evaluation Toolkit</title>
<meta name="description" content="Live-presenter evaluation deck generator. Inception and Findings briefs with keyboard-driven presenter mode, PDF export, and smart data viz.">
<link rel="icon" type="image/svg+xml" href="../../logo.svg">
<link rel="alternate icon" type="image/png" href="../../logo-32.png">
<meta name="theme-color" content="#0B1A2E">
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
/* ══ SECTION: Design tokens ══ */
:root{
  --navy:#0B1A2E; --navy-mid:#122240; --navy-light:#1a3050;
  --teal:#2EC4B6; --teal-dark:#1FA89B; --teal-light:#E8F8F6; --teal-glow:rgba(46,196,182,0.15);
  --slate:#64748B; --slate-light:#94A3B8;
  --bg:#F8FAFC; --surface:#FFFFFF; --border:#E2E8F0;
  --text:#0F172A; --text-muted:#475569;
  --amber:#F59E0B; --red:#EF4444; --green:#10B981;
  --shadow:0 2px 8px rgba(11,26,46,0.08);
  --shadow-lg:0 4px 20px rgba(11,26,46,0.12);
}
*{margin:0;padding:0;box-sizing:border-box}
html,body{height:100%}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);line-height:1.5;-webkit-font-smoothing:antialiased}
button{font-family:inherit;cursor:pointer;border:none;background:none}
input,textarea,select{font-family:inherit;color:inherit}
a{color:var(--teal-dark);text-decoration:none}

/* ══ SECTION: Top bar ══ */
.topbar{position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:10px 20px;background:rgba(248,250,252,0.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--border);font-size:13px}
.topbar .brand{display:flex;align-items:center;gap:8px;font-weight:700;color:var(--navy);letter-spacing:0.04em}
.topbar .brand-badge{font-size:9px;font-weight:700;letter-spacing:0.14em;color:var(--teal-dark);text-transform:uppercase}
.topbar .sep{color:var(--slate-light);font-weight:300}
.topbar .page{color:var(--slate);font-weight:500}
.topbar .nav-right{display:flex;align-items:center;gap:14px}
.topbar .nav-right a{font-size:12px;color:var(--slate)}
.topbar .nav-right a:hover{color:var(--navy)}
</style>
</head>
<body>
<div class="topbar">
  <div class="brand">
    <span class="brand-badge">PRAXIS</span>
    <span class="sep">/</span>
    <span class="page">Deck Generator</span>
  </div>
  <div class="nav-right">
    <a href="/praxis/workbench/">← Workbench</a>
    <a href="/praxis/tools/">All tools</a>
  </div>
</div>
<div id="root"></div>

<script type="text/babel" data-type="module">
/* ══ SECTION: App entry ══ */
const { useState, useEffect, useCallback, useMemo, useRef } = React;

function App() {
  return <div style={{padding:40,textAlign:'center',color:'var(--slate)'}}>
    <h1 style={{fontFamily:'Fraunces,serif',color:'var(--navy)',fontSize:28,fontWeight:600,marginBottom:8}}>Deck Generator</h1>
    <p>Loading…</p>
  </div>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
</script>
</body>
</html>
```

- [ ] **Step 2: Verify file loads in browser**

Open: `http://localhost:8765/praxis/tools/deck-generator/`
Expected: Top bar with "PRAXIS / Deck Generator" visible. Body shows "Deck Generator" heading and "Loading…" subtitle. No console errors.

- [ ] **Step 3: Commit**

```bash
cd ~/deploy-site
git add praxis/tools/deck-generator/index.html
git commit -m "feat(deck-generator): skeleton with React/Babel CDN and top-bar chrome"
```

---

## Task 2: Data layer — sessionStorage read, DEMO_CONTEXT, localStorage override merge

**Files:**
- Modify: `praxis/tools/deck-generator/index.html` (insert before `function App()`)

- [ ] **Step 1: Add DEMO_CONTEXT constant inside the `<script type="text/babel">` block, just after `const { useState, ... } = React;`**

Insert this block:

```javascript
/* ══ SECTION: DEMO_CONTEXT ══ */
const DEMO_CONTEXT = {
  project_meta: {
    organisation: "Ministry of Public Health, Niger",
    programme_name: "Maternal Health Quality Improvement Programme",
    country: "Niger",
    health_areas: ["maternal_health","child_health"],
    operating_context: "fragile_humanitarian",
    budget: "usd_5m_to_20m",
    programme_maturity: "early_implementation",
    timeline: "36_months",
    sector: "health"
  },
  tor_constraints: {
    evaluation_purpose: ["accountability","learning"],
    causal_inference_level: "attribution",
    geographic_scope: "14 health districts across Tillabéri and Maradi regions",
    target_population: "Pregnant women and newborns (≈ 180,000 annually)",
    comparison_feasibility: "matched_comparison"
  },
  toc: {
    nodes: [
      {id:"i1", level:"impact", title:"Reduced maternal and neonatal mortality"},
      {id:"o1", level:"outcome", title:"Improved quality of antenatal care"},
      {id:"o2", level:"outcome", title:"Increased facility-based deliveries"},
      {id:"o3", level:"outcome", title:"Strengthened referral systems"},
      {id:"op1", level:"output", title:"Providers trained in EmONC"},
      {id:"op2", level:"output", title:"Facilities equipped with WHO minimum package"},
      {id:"op3", level:"output", title:"Community health workers deployed"},
      {id:"op4", level:"output", title:"Referral protocols revised and adopted"},
      {id:"a1", level:"activity", title:"EmONC training curriculum delivered"},
      {id:"a2", level:"activity", title:"Equipment procurement and distribution"},
      {id:"a3", level:"activity", title:"Community sensitisation campaigns"},
      {id:"a4", level:"activity", title:"Referral network mapping"}
    ]
  },
  evaluation_matrix: {
    rows: [
      {id:"eq1", number:1, criterion:"relevance", question:"To what extent does the programme respond to the priorities of pregnant women, newborns, and health providers in Niger?", dataSources:["household_survey","kii_providers"]},
      {id:"eq2", number:2, criterion:"effectiveness", question:"What changes in antenatal care coverage and quality can be attributed to the programme?", dataSources:["hmis","facility_audit"]},
      {id:"eq3", number:3, criterion:"effectiveness", question:"Has the programme strengthened the functioning of referral systems between health centres and district hospitals?", dataSources:["facility_audit","kii_providers"]},
      {id:"eq4", number:4, criterion:"impact", question:"What is the effect of the programme on maternal and neonatal mortality at the district level?", dataSources:["hmis","household_survey"]},
      {id:"eq5", number:5, criterion:"sustainability", question:"To what extent are the capacity gains and equipment practices likely to be maintained after programme closure?", dataSources:["kii_providers","document_review"]},
      {id:"eq6", number:6, criterion:"efficiency", question:"Are the programme's results commensurate with the resources invested, and how do costs compare with alternative approaches?", dataSources:["document_review"]}
    ]
  },
  design_recommendation: {
    selected_design: "did_matched",
    ranked_designs: [
      {id:"did_matched", name:"Difference-in-Differences with Matched Controls", family:"Quasi-experimental", score:87.2}
    ],
    justification: "Staggered district rollout creates natural variation in treatment timing. Propensity-score matching on baseline HMIS indicators yields a credible comparison group. Design is feasible under the stated budget and aligns with the attribution requirement in the ToR.",
    answers: {comparison:"matched_districts"}
  },
  sample_parameters: {
    design_id: "did_matched",
    result: {primary:1842, label:"DiD with matched districts, α=0.05, power=0.80, MDE=5pp"},
    qualitative_plan: {
      breakdown: [
        {method:"Key informant interviews (providers)", count:32},
        {method:"Focus groups (pregnant women)", count:12},
        {method:"Focus groups (community health workers)", count:8},
        {method:"Observation (facility audits)", count:28}
      ]
    }
  },
  instruments: {
    items: [
      {id:"i1", title:"Household Survey", type:"quantitative", questions:new Array(64).fill(null)},
      {id:"i2", title:"Facility Audit Checklist", type:"observation", questions:new Array(48).fill(null)},
      {id:"i3", title:"Provider KII Guide", type:"qualitative", questions:new Array(22).fill(null)},
      {id:"i4", title:"Pregnant Women FGD Guide", type:"qualitative", questions:new Array(18).fill(null)},
      {id:"i5", title:"HMIS Data Extraction Template", type:"administrative", questions:new Array(34).fill(null)}
    ]
  },
  analysis_plan: {
    rows: [
      {eq_label:"EQ1", method:"Thematic analysis + descriptive stats", software:"NVivo + R"},
      {eq_label:"EQ2", method:"DiD regression with district FE", software:"R / Stata"},
      {eq_label:"EQ3", method:"Mixed-methods triangulation", software:"NVivo + R"},
      {eq_label:"EQ4", method:"DiD + matching sensitivity analysis", software:"R"},
      {eq_label:"EQ5", method:"Framework analysis", software:"NVivo"},
      {eq_label:"EQ6", method:"Cost-effectiveness (cost per DALY averted)", software:"Excel + R"}
    ]
  },
  evaluability: {
    score: 74,
    dimensions: [
      {id:"d1", label:"Programme logic", system_score:17, max:20},
      {id:"d2", label:"Data availability", system_score:12, max:20},
      {id:"d3", label:"Stakeholder engagement", system_score:16, max:20},
      {id:"d4", label:"Utility of findings", system_score:15, max:20},
      {id:"d5", label:"Ethics & protection", system_score:14, max:20}
    ],
    blockers: [
      "Baseline HMIS completeness below 80% in 3 of 14 districts",
      "Security access restrictions in Tillabéri district require mitigation plan"
    ]
  }
};

/* ══ SECTION: Storage helpers ══ */
const SESSION_KEY = "praxis-deck-context";
const TEMPLATE_KEY = "praxis-deck-template";
function overrideKey(programme, template){ return `praxis-deck-overrides:${programme||"untitled"}:${template}`; }

function loadContext() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) return { context: JSON.parse(raw), isDemo: false };
  } catch (e) { console.warn("Failed to parse sessionStorage context:", e); }
  return { context: DEMO_CONTEXT, isDemo: true };
}

function loadOverrides(programme, template) {
  try {
    const raw = localStorage.getItem(overrideKey(programme, template));
    if (raw) return JSON.parse(raw);
  } catch (e) { console.warn("Failed to parse overrides:", e); }
  return {};
}

function saveOverrides(programme, template, overrides) {
  try {
    localStorage.setItem(overrideKey(programme, template), JSON.stringify(overrides));
  } catch (e) { console.warn("Failed to save overrides:", e); }
}

function loadLastTemplate() {
  try { return localStorage.getItem(TEMPLATE_KEY) || null; } catch (e) { return null; }
}

function saveLastTemplate(template) {
  try { localStorage.setItem(TEMPLATE_KEY, template); } catch (e) {}
}
```

- [ ] **Step 2: Replace the placeholder `function App()` with a version that loads context and shows it**

Replace the existing `function App()` block with:

```javascript
function App() {
  const [{context, isDemo}] = useState(() => loadContext());
  const programme = context.project_meta?.programme_name || "Untitled programme";
  return <div style={{padding:40,fontFamily:'DM Sans,sans-serif'}}>
    <h1 style={{fontFamily:'Fraunces,serif',color:'var(--navy)',fontSize:28,fontWeight:600,marginBottom:8}}>Deck Generator</h1>
    <p style={{color:'var(--slate)',fontSize:14,marginBottom:16}}>
      Data source: <strong>{isDemo ? "Demo (no workbench session)" : "Workbench session"}</strong>
    </p>
    <p style={{color:'var(--text)',fontSize:14}}>Programme: <strong>{programme}</strong></p>
    <p style={{color:'var(--text)',fontSize:12,marginTop:8,fontFamily:'JetBrains Mono,monospace'}}>
      EQs: {context.evaluation_matrix?.rows?.length || 0} · ToC nodes: {context.toc?.nodes?.length || 0} · Evaluability: {context.evaluability?.score ?? "—"}/100
    </p>
  </div>;
}
```

- [ ] **Step 3: Verify in browser**

Open: `http://localhost:8765/praxis/tools/deck-generator/`
Expected:
- Data source: "Demo (no workbench session)"
- Programme: "Maternal Health Quality Improvement Programme"
- EQs: 6 · ToC nodes: 12 · Evaluability: 74/100
- No console errors

- [ ] **Step 4: Commit**

```bash
git add praxis/tools/deck-generator/index.html
git commit -m "feat(deck-generator): data layer — DEMO_CONTEXT, session/local storage helpers"
```

---

## Task 3: Template picker entry screen

**Files:**
- Modify: `praxis/tools/deck-generator/index.html`

- [ ] **Step 1: Add template picker CSS after the top-bar CSS**

Insert inside the main `<style>` block, after the topbar section:

```css
/* ══ SECTION: Template picker ══ */
.picker-wrap{max-width:900px;margin:40px auto;padding:0 24px}
.picker-banner{background:var(--teal-light);border:1px solid var(--teal);border-left:4px solid var(--teal);border-radius:8px;padding:14px 18px;margin-bottom:32px;display:flex;align-items:center;justify-content:space-between;gap:16px}
.picker-banner .bmsg{font-size:13px;color:var(--navy)}
.picker-banner .bmsg strong{color:var(--navy);font-weight:700}
.picker-banner a{color:var(--teal-dark);font-weight:600;font-size:12px;white-space:nowrap}
.picker-banner .bclose{font-size:18px;color:var(--slate);background:none;border:none;cursor:pointer;padding:4px 8px;line-height:1}
.picker-banner .bclose:hover{color:var(--navy)}
.picker-hero h1{font-family:'Fraunces',serif;font-size:42px;font-weight:600;color:var(--navy);margin-bottom:12px;letter-spacing:-0.01em;line-height:1.05}
.picker-hero p{font-size:15px;color:var(--text-muted);margin-bottom:32px;max-width:640px;line-height:1.5}
.picker-programme{display:inline-block;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:var(--teal-dark);font-weight:700;background:var(--teal-light);padding:4px 10px;border-radius:4px;margin-bottom:16px}
.picker-cards{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px}
.picker-card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:24px;cursor:pointer;transition:all 0.18s;text-align:left;display:flex;flex-direction:column}
.picker-card:hover{border-color:var(--teal);box-shadow:var(--shadow-lg);transform:translateY(-2px)}
.picker-card-badge{font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:var(--slate);font-weight:700;margin-bottom:10px}
.picker-card h3{font-size:20px;font-weight:700;color:var(--navy);margin-bottom:6px}
.picker-card .card-sub{font-size:13px;color:var(--text-muted);margin-bottom:16px;line-height:1.5;flex:1}
.picker-card .card-meta{display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid var(--border)}
.picker-card .card-meta .slides{font-size:11px;color:var(--slate);font-weight:600}
.picker-card .card-meta .arrow{color:var(--teal);font-size:18px;font-weight:600}
.picker-footer{text-align:center;color:var(--slate);font-size:12px;padding-top:16px}
.picker-footer kbd{display:inline-block;padding:1px 6px;border-radius:3px;font-size:10px;background:var(--bg);border:1px solid var(--border);font-family:'JetBrains Mono',monospace;color:var(--text)}
```

- [ ] **Step 2: Add a `TemplatePicker` component just above `function App()`**

Insert:

```javascript
/* ══ SECTION: Template picker ══ */
function TemplatePicker({ context, isDemo, onPick, onDismissBanner, bannerDismissed }) {
  const programme = context.project_meta?.programme_name || "Untitled programme";
  const org = context.project_meta?.organisation || "";
  const eqCount = context.evaluation_matrix?.rows?.length || 0;
  const criterionCount = new Set((context.evaluation_matrix?.rows || []).map(r => r.criterion).filter(Boolean)).size;
  const findingsTotal = 10 + criterionCount;

  return <div className="picker-wrap">
    {isDemo && !bannerDismissed && <div className="picker-banner">
      <div className="bmsg">
        <strong>Sample deck.</strong> This is the "{programme}" demo.{" "}
        Build yours in the <a href="/praxis/workbench/">Workbench →</a>
      </div>
      <button className="bclose" onClick={onDismissBanner} aria-label="Dismiss">×</button>
    </div>}
    <div className="picker-hero">
      <span className="picker-programme">{org || "Evaluation Deck"}</span>
      <h1>{programme}</h1>
      <p>Pick the deck you're presenting. Both templates share the same engine — live presenter mode, PDF export, and speaker-notes view on a second screen.</p>
    </div>
    <div className="picker-cards">
      <button className="picker-card" onClick={() => onPick('inception')}>
        <div className="picker-card-badge">Pre-fieldwork</div>
        <h3>Inception Brief</h3>
        <div className="card-sub">Donor inception meeting. Cover, Theory of Change, evaluation questions, methodology, sampling, timeline, team, risks.</div>
        <div className="card-meta"><span className="slides">16 slides</span><span className="arrow">→</span></div>
      </button>
      <button className="picker-card" onClick={() => onPick('findings')}>
        <div className="picker-card-badge">Post-fieldwork</div>
        <h3>Findings Brief</h3>
        <div className="card-sub">Results presentation. Headline findings, criterion-by-criterion results, recommendations, lessons learned.</div>
        <div className="card-meta"><span className="slides">{findingsTotal} slides · {criterionCount || "?"} criteria</span><span className="arrow">→</span></div>
      </button>
    </div>
    <div className="picker-footer">
      Tip: once inside the deck, press <kbd>P</kbd> to start presenting · <kbd>Ctrl+P</kbd> for PDF · <kbd>?</kbd> for all shortcuts
    </div>
  </div>;
}
```

- [ ] **Step 3: Replace the placeholder `App` with a version that shows the picker**

Replace the existing `App()` block:

```javascript
function App() {
  const [{context, isDemo}] = useState(() => loadContext());
  const [template, setTemplate] = useState(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  if (!template) {
    return <TemplatePicker
      context={context}
      isDemo={isDemo}
      bannerDismissed={bannerDismissed}
      onDismissBanner={() => setBannerDismissed(true)}
      onPick={(t) => { saveLastTemplate(t); setTemplate(t); }}
    />;
  }
  // Template picked — render stub until Task 4 lands
  return <div style={{padding:40}}>
    <p>Template: <strong>{template}</strong></p>
    <button style={{marginTop:12,padding:'6px 12px',background:'var(--teal)',color:'#fff',borderRadius:4}} onClick={() => setTemplate(null)}>← Change template</button>
  </div>;
}
```

- [ ] **Step 4: Verify in browser**

Open: `http://localhost:8765/praxis/tools/deck-generator/`
Expected:
- Top banner: "Sample deck. This is the 'Maternal Health Quality Improvement Programme' demo…"
- Hero: eyebrow "Ministry of Public Health, Niger", H1 "Maternal Health Quality Improvement Programme"
- Two cards: "Inception Brief (16 slides)" and "Findings Brief (16 slides · 5 criteria)" (DEMO_CONTEXT has 5 distinct criteria in the 6 EQs)
- Click a card → shows "Template: inception" with back button
- Click × on banner → banner hides
- No console errors

- [ ] **Step 5: Commit**

```bash
git add praxis/tools/deck-generator/index.html
git commit -m "feat(deck-generator): template picker entry screen with demo banner"
```

---

## Task 4: Slide canvas component (16:9 scale-to-fit)

**Files:**
- Modify: `praxis/tools/deck-generator/index.html`

- [ ] **Step 1: Add slide canvas CSS after the picker CSS**

Insert inside the main `<style>` block:

```css
/* ══ SECTION: Slide canvas ══ */
.slide-canvas{
  width:1280px; height:720px;
  background:var(--bg); color:var(--text);
  display:flex; flex-direction:column;
  position:relative; overflow:hidden;
  border-radius:8px; box-shadow:var(--shadow-lg);
  transform-origin:top left;
  font-family:'DM Sans',sans-serif;
}
.slide-canvas.section-divider{ background:var(--navy); color:#fff; justify-content:center; align-items:center; text-align:center; padding:0 120px }
.slide-canvas .header-bar{
  background:var(--navy); color:#fff;
  padding:16px 40px; display:flex; align-items:center; gap:20px;
  flex-shrink:0;
}
.slide-canvas .header-bar .hnum{ color:var(--teal); font-size:13px; font-weight:700; letter-spacing:0.08em; font-family:'JetBrains Mono',monospace }
.slide-canvas .header-bar .htitle{ color:#fff; font-size:20px; font-weight:600; letter-spacing:-0.01em }
.slide-canvas .body{ flex:1; padding:36px 48px 56px 48px; display:flex; flex-direction:column; min-height:0 }
.slide-canvas .slide-footer{
  position:absolute; bottom:14px; left:48px; right:48px;
  display:flex; justify-content:space-between; align-items:center;
  font-size:10px; color:var(--slate-light); letter-spacing:0.1em; text-transform:uppercase; font-weight:600;
}
.slide-canvas.section-divider .slide-footer{ left:120px; right:120px; color:rgba(255,255,255,0.4) }
.slide-canvas .praxis-mark{ position:absolute; top:14px; right:20px; font-size:9px; font-weight:700; letter-spacing:0.18em; color:var(--teal); text-transform:uppercase; z-index:2 }

/* Section divider typography */
.section-divider h2{ font-family:'Fraunces',serif; font-size:52px; font-weight:600; line-height:1.1; letter-spacing:-0.015em; margin-bottom:16px }
.section-divider .section-rule{ width:64px; height:3px; background:var(--teal); margin:0 auto 20px }
.section-divider .section-eyebrow{ font-size:11px; font-weight:700; letter-spacing:0.18em; color:var(--teal); text-transform:uppercase; margin-bottom:16px }
.section-divider .section-sub{ font-size:16px; color:rgba(255,255,255,0.65); max-width:640px; line-height:1.5 }

/* Editor mode (stack of slides) */
.editor-wrap{ max-width:1440px; margin:0 auto; padding:24px 20px 80px }
.editor-toolbar{ position:sticky; top:56px; z-index:10; background:rgba(248,250,252,0.92); backdrop-filter:blur(8px); display:flex; align-items:center; gap:10px; padding:12px 16px; margin-bottom:20px; border:1px solid var(--border); border-radius:8px }
.editor-toolbar .tbtn{ padding:7px 13px; border-radius:6px; background:var(--surface); border:1px solid var(--border); font-size:12px; font-weight:600; color:var(--text); transition:all 0.15s; display:inline-flex; align-items:center; gap:6px }
.editor-toolbar .tbtn:hover{ border-color:var(--teal); color:var(--teal-dark) }
.editor-toolbar .tbtn.primary{ background:var(--navy); color:#fff; border-color:var(--navy) }
.editor-toolbar .tbtn.primary:hover{ background:var(--navy-mid); color:#fff }
.editor-toolbar .tbtn.teal{ background:var(--teal); color:#fff; border-color:var(--teal) }
.editor-toolbar .tbtn.teal:hover{ background:var(--teal-dark) }
.editor-toolbar .tsep{ width:1px; height:20px; background:var(--border) }
.editor-toolbar .tspacer{ flex:1 }
.editor-toolbar .tcount{ font-size:12px; color:var(--slate); font-weight:600 }

.slide-wrap{ display:flex; flex-direction:column; gap:10px; margin-bottom:28px }
.slide-meta{ display:flex; align-items:center; gap:10px; font-size:11px; color:var(--slate) }
.slide-meta .snum{ font-family:'JetBrains Mono',monospace; font-weight:700; color:var(--navy) }
.slide-scale{ display:flex; justify-content:center }
.slide-scale-inner{ transform-origin:top left }
```

- [ ] **Step 2: Add a `SlideCanvas` component and a `SlideHeader` helper just above `TemplatePicker`**

Insert:

```javascript
/* ══ SECTION: Slide canvas ══ */
function SlideHeader({ num, total, title, programme }) {
  return <>
    <div className="praxis-mark">PRAXIS</div>
    <div className="header-bar">
      <span className="hnum">{String(num).padStart(2,'0')}</span>
      <span className="htitle">{title}</span>
    </div>
  </>;
}

function SlideFooter({ programme, num, total }) {
  return <div className="slide-footer">
    <span>{programme}</span>
    <span>{String(num).padStart(2,'0')} / {String(total).padStart(2,'0')}</span>
  </div>;
}

function SlideCanvas({ children, isDivider, num, total, title, programme, className = "" }) {
  return <div className={`slide-canvas ${isDivider ? 'section-divider' : ''} ${className}`}>
    {!isDivider && <SlideHeader num={num} total={total} title={title} programme={programme} />}
    {isDivider ? children : <div className="body">{children}</div>}
    <SlideFooter programme={programme} num={num} total={total} />
  </div>;
}

// Scaled slide wrapper for editor mode — renders the 1280×720 canvas at a target width
function ScaledSlide({ children, maxWidth = 1100 }) {
  const scale = maxWidth / 1280;
  return <div className="slide-scale">
    <div className="slide-scale-inner" style={{ width: 1280, height: 720, transform: `scale(${scale})`, marginBottom: (720 * scale) - 720 }}>
      {children}
    </div>
  </div>;
}
```

- [ ] **Step 3: Add a demonstration preview inside `App` when a template is selected**

Replace the post-picker branch of `App` with:

```javascript
  // Template picked
  const programme = context.project_meta?.programme_name || "Untitled programme";
  return <div className="editor-wrap">
    <div className="editor-toolbar">
      <button className="tbtn" onClick={() => setTemplate(null)}>← Change template</button>
      <div className="tsep"/>
      <span className="tcount">{template === 'inception' ? 'Inception Brief' : 'Findings Brief'}</span>
      <div className="tspacer"/>
      <button className="tbtn primary">▶ Present</button>
    </div>
    {/* Canvas preview — real slide library lands in Task 5+ */}
    <div className="slide-wrap">
      <div className="slide-meta"><span className="snum">01</span> · Cover (preview)</div>
      <ScaledSlide>
        <SlideCanvas isDivider={true} num={1} total={16} title="Cover" programme={programme}>
          <div className="section-eyebrow">{context.project_meta?.organisation || ""}</div>
          <h2>{programme}</h2>
          <div className="section-rule"></div>
          <div className="section-sub">{template === 'inception' ? "Evaluation Design Brief" : "Findings Brief"}</div>
        </SlideCanvas>
      </ScaledSlide>
    </div>
  </div>;
```

- [ ] **Step 4: Verify in browser**

Open: `http://localhost:8765/praxis/tools/deck-generator/`
Click "Inception Brief".
Expected:
- Sticky toolbar at top with "← Change template", "Inception Brief" label, and "▶ Present" button
- One scaled 16:9 slide preview below: dark navy, large Fraunces "Maternal Health Quality Improvement Programme" title, teal horizontal rule, "Evaluation Design Brief" subtitle
- Slide fits width without horizontal scroll
- "← Change template" returns to picker

- [ ] **Step 5: Commit**

```bash
git add praxis/tools/deck-generator/index.html
git commit -m "feat(deck-generator): slide canvas component with 16:9 scale-to-fit"
```

---

## Task 5: Override model (merge, edit, reset helpers) and editor toolbar wiring

**Files:**
- Modify: `praxis/tools/deck-generator/index.html`

- [ ] **Step 1: Add override helpers and a `useDeckState` hook just below the storage helpers**

Insert after the `saveLastTemplate` function:

```javascript
/* ══ SECTION: Deck state hook ══ */
function useDeckState(programme, template) {
  const [overrides, setOverrides] = useState(() => loadOverrides(programme, template));

  // Debounced save — save 300ms after last change
  useEffect(() => {
    const t = setTimeout(() => saveOverrides(programme, template, overrides), 300);
    return () => clearTimeout(t);
  }, [programme, template, overrides]);

  const setOverride = useCallback((path, value) => {
    setOverrides(prev => {
      const next = { ...prev };
      if (value === null || value === undefined || value === "") delete next[path];
      else next[path] = value;
      return next;
    });
  }, []);

  const getOverride = useCallback((path, fallback) => {
    if (overrides[path] !== undefined) return overrides[path];
    return fallback;
  }, [overrides]);

  const resetAll = useCallback(() => setOverrides({}), []);

  return { overrides, setOverride, getOverride, resetAll, hasOverrides: Object.keys(overrides).length > 0 };
}
```

- [ ] **Step 2: Add an `InlineEditable` component for auto-pull + override fields**

Insert after `useDeckState`:

```javascript
/* ══ SECTION: Inline editable ══ */
function InlineEditable({ path, value, setOverride, getOverride, multiline, placeholder, as = "span", className, style }) {
  const current = getOverride(path, value);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(current);
  const isOverridden = current !== value;

  useEffect(() => { if (!editing) setDraft(current); }, [current, editing]);

  function commit() {
    setEditing(false);
    const trimmed = (draft || "").trim();
    if (trimmed === value) setOverride(path, null);
    else setOverride(path, trimmed);
  }

  if (editing) {
    if (multiline) return <textarea
      autoFocus value={draft} onChange={e => setDraft(e.target.value)} onBlur={commit}
      placeholder={placeholder}
      className={className}
      style={{width:'100%',resize:'vertical',minHeight:60,padding:'6px 8px',border:`1.5px solid var(--teal)`,borderRadius:4,fontFamily:'inherit',fontSize:'inherit',lineHeight:'inherit',color:'inherit',background:'var(--surface)',...style}}
    />;
    return <input
      autoFocus value={draft} onChange={e => setDraft(e.target.value)} onBlur={commit} onKeyDown={e => {if(e.key==='Enter'){commit()}else if(e.key==='Escape'){setEditing(false);setDraft(current)}}}
      placeholder={placeholder}
      className={className}
      style={{padding:'2px 6px',border:`1.5px solid var(--teal)`,borderRadius:4,fontFamily:'inherit',fontSize:'inherit',color:'inherit',background:'var(--surface)',...style}}
    />;
  }

  const Tag = as;
  const handleClick = () => setEditing(true);
  return <Tag
    className={className}
    style={{...style, cursor:'text', borderBottom: isOverridden ? '1.5px dashed var(--teal)' : 'none'}}
    onClick={handleClick}
    title={isOverridden ? "Edited — click to change" : "Click to edit"}
  >{current || <span style={{color:'var(--slate-light)',fontStyle:'italic'}}>{placeholder || "Click to add…"}</span>}</Tag>;
}
```

- [ ] **Step 3: Wire `useDeckState` into `App` and pass down to the canvas preview**

In `App()`, after `const programme = …`, add:

```javascript
  const deckState = useDeckState(programme, template);
```

Then update the toolbar to include a "Reset" button when there are overrides, and an export/present stub:

```javascript
    <div className="editor-toolbar">
      <button className="tbtn" onClick={() => setTemplate(null)}>← Change template</button>
      <div className="tsep"/>
      <span className="tcount">{template === 'inception' ? 'Inception Brief' : 'Findings Brief'}</span>
      <div className="tspacer"/>
      {deckState.hasOverrides && <button className="tbtn" onClick={deckState.resetAll} title="Discard all inline edits">↺ Reset edits</button>}
      <button className="tbtn" onClick={() => window.print()}>⎙ PDF</button>
      <button className="tbtn primary">▶ Present</button>
    </div>
```

And change the Cover preview subtitle to use `InlineEditable`:

```javascript
        <SlideCanvas isDivider={true} num={1} total={16} title="Cover" programme={programme}>
          <div className="section-eyebrow">{context.project_meta?.organisation || ""}</div>
          <h2>{programme}</h2>
          <div className="section-rule"></div>
          <InlineEditable
            as="div" className="section-sub"
            path="cover.subtitle"
            value={template === 'inception' ? "Evaluation Design Brief" : "Findings Brief"}
            setOverride={deckState.setOverride} getOverride={deckState.getOverride}
            placeholder="Subtitle…"
          />
        </SlideCanvas>
```

- [ ] **Step 4: Verify in browser**

Open: `http://localhost:8765/praxis/tools/deck-generator/`
- Click Inception Brief
- Click the "Evaluation Design Brief" subtitle — it becomes an editable input
- Type "Inception Brief — April 2026" and click elsewhere
- Reload the page, click Inception again — the custom subtitle persists
- Click the subtitle, clear it, Enter — reverts to default
- Hard-reload: default subtitle shows again with no underline
- When overridden, a "↺ Reset edits" button appears in the toolbar; clicking it removes the override

- [ ] **Step 5: Commit**

```bash
git add praxis/tools/deck-generator/index.html
git commit -m "feat(deck-generator): override model with localStorage and inline editable fields"
```

---

## Task 6: Slide registry — define the full slide list (stubs)

**Files:**
- Modify: `praxis/tools/deck-generator/index.html`

- [ ] **Step 1: Add a slide registry just before `function App()`**

Insert:

```javascript
/* ══ SECTION: Slide registry ══ */
// Each slide: { id, title, isDivider?, type, render: (ctx) => ReactElement }
function buildInceptionSlides(context, deckState) {
  const slides = [
    { id:"cover",     title:"Cover",                      isDivider:true,  type:"cover" },
    { id:"agenda",    title:"Agenda",                     type:"agenda" },
    { id:"programme", title:"Programme Overview",         type:"programme" },
    { id:"purpose",   title:"Evaluation Purpose & Users", type:"purpose" },
    { id:"toc",       title:"Theory of Change",           type:"toc" },
    { id:"eqs",       title:"Evaluation Questions",       type:"eqs" },
    { id:"method",    title:"Methodology",                type:"methodology" },
    { id:"sampling",  title:"Sampling Strategy",          type:"sampling" },
    { id:"datacoll",  title:"Data Collection",            type:"datacoll" },
    { id:"analysis",  title:"Analysis Approach",          type:"analysis" },
    { id:"evalabil",  title:"Evaluability Assessment",    type:"evaluability" },
    { id:"timeline",  title:"Timeline",                   type:"timeline" },
    { id:"team",      title:"Team & Roles",               type:"team" },
    { id:"risks",     title:"Risks & Mitigations",        type:"risks" },
    { id:"deliverab", title:"Deliverables Schedule",      type:"deliverables" },
    { id:"qa",        title:"Q&A",                        isDivider:true, type:"qa" }
  ];
  return slides.map((s, i) => ({ ...s, num: i + 1, total: slides.length }));
}

function buildFindingsSlides(context, deckState) {
  const criteria = Array.from(new Set((context.evaluation_matrix?.rows || []).map(r => r.criterion).filter(Boolean)));
  const criterionOrder = ["relevance","coherence","effectiveness","efficiency","impact","sustainability"];
  const sortedCriteria = criteria.sort((a,b) => criterionOrder.indexOf(a) - criterionOrder.indexOf(b));

  const fixed = [
    { id:"cover",     title:"Cover",                      isDivider:true, type:"cover-findings" },
    { id:"agenda",    title:"Agenda",                     type:"agenda" },
    { id:"prgrecap",  title:"Programme Recap",            type:"programme-recap" },
    { id:"methrecap", title:"Methodology Recap",          type:"methodology-recap" },
    { id:"headline",  title:"Headline Findings",          type:"headline-findings" }
  ];
  const criterionSlides = sortedCriteria.map(cr => ({
    id:`finding-${cr}`, title:`Findings — ${cr.charAt(0).toUpperCase()+cr.slice(1)}`, type:"finding-criterion", criterion:cr
  }));
  const tail = [
    { id:"crosscut", title:"Cross-cutting Findings",      type:"cross-cutting" },
    { id:"evidence", title:"Evidence Quality & Limits",   type:"evidence" },
    { id:"recs",     title:"Recommendations",             type:"recommendations" },
    { id:"lessons",  title:"Lessons & Next Steps",        type:"lessons" },
    { id:"qa",       title:"Q&A",                         isDivider:true, type:"qa" }
  ];
  const all = [...fixed, ...criterionSlides, ...tail];
  return all.map((s, i) => ({ ...s, num: i + 1, total: all.length }));
}
```

- [ ] **Step 2: Add a `renderSlide(slide, ctx, deckState, programme)` dispatcher that returns a `SlideCanvas` for each type**

Insert after the registry builders:

```javascript
/* ══ SECTION: Slide dispatcher ══ */
function renderSlide(slide, ctx, deckState, programme) {
  const sharedProps = { num: slide.num, total: slide.total, title: slide.title, programme };
  switch (slide.type) {
    case "cover":
      return <SlideCanvas {...sharedProps} isDivider>
        <div className="section-eyebrow">{ctx.project_meta?.organisation || ""}</div>
        <h2>{programme}</h2>
        <div className="section-rule"></div>
        <InlineEditable as="div" className="section-sub" path="cover.subtitle" value="Evaluation Design Brief"
          setOverride={deckState.setOverride} getOverride={deckState.getOverride} placeholder="Subtitle…" />
      </SlideCanvas>;
    case "cover-findings":
      return <SlideCanvas {...sharedProps} isDivider>
        <div className="section-eyebrow">{ctx.project_meta?.organisation || ""}</div>
        <h2>{programme}</h2>
        <div className="section-rule"></div>
        <InlineEditable as="div" className="section-sub" path="cover.subtitle" value="Findings Brief"
          setOverride={deckState.setOverride} getOverride={deckState.getOverride} placeholder="e.g. Mid-term Findings · April 2026" />
      </SlideCanvas>;
    case "qa":
      return <SlideCanvas {...sharedProps} isDivider>
        <div className="section-eyebrow">Questions</div>
        <h2>Thank you</h2>
        <div className="section-rule"></div>
        <InlineEditable as="div" className="section-sub" path="qa.contact" value={ctx.project_meta?.organisation || ""}
          setOverride={deckState.setOverride} getOverride={deckState.getOverride} placeholder="Contact — email@org · +…" />
      </SlideCanvas>;
    default:
      // Stub — real renderers land in Tasks 7–14
      return <SlideCanvas {...sharedProps}>
        <div style={{color:'var(--slate)',fontSize:14,fontFamily:'JetBrains Mono,monospace',padding:20,background:'var(--teal-light)',borderRadius:6,border:'1px dashed var(--teal)'}}>
          <strong>[Stub: {slide.type}]</strong> — implemented in a later task.
        </div>
      </SlideCanvas>;
  }
}
```

- [ ] **Step 3: Update `App`'s rendered section to loop over the full registry**

Replace the `slide-wrap` block in `App` with:

```javascript
    {(() => {
      const slides = template === 'inception' ? buildInceptionSlides(context, deckState) : buildFindingsSlides(context, deckState);
      return slides.map(slide => <div key={slide.id} className="slide-wrap">
        <div className="slide-meta"><span className="snum">{String(slide.num).padStart(2,'0')}</span> · {slide.title}</div>
        <ScaledSlide>{renderSlide(slide, context, deckState, programme)}</ScaledSlide>
      </div>);
    })()}
```

- [ ] **Step 4: Verify in browser**

Open: `http://localhost:8765/praxis/tools/deck-generator/`
- Click Inception Brief
- Expected: 16 scaled slide previews in order. Slides 1 (Cover) and 16 (Q&A) are dark navy dividers. Slides 2–15 show "[Stub: <type>]" dashed teal box with their title in the header bar.
- Slide numbering in header: "01", "02", … "16"
- Slide footer shows programme name and "NN / 16"
- Back to picker, click Findings Brief
- Expected: 15 slides (5 fixed + 5 criterion slides + 5 tail = 15; DEMO_CONTEXT has 5 criteria: relevance, effectiveness, impact, sustainability, efficiency). Criterion slides titled "Findings — Relevance", "Findings — Effectiveness", etc.

- [ ] **Step 5: Commit**

```bash
git add praxis/tools/deck-generator/index.html
git commit -m "feat(deck-generator): slide registry and dispatcher with cover/Q&A renderers"
```

---

## Task 7: Inception renderers — Agenda, Programme Overview, Purpose

**Files:**
- Modify: `praxis/tools/deck-generator/index.html` (extend `renderSlide` dispatcher)

- [ ] **Step 1: Add shared slide CSS for H2, lede, param grids**

Insert inside the main `<style>` block, after the slide canvas section:

```css
/* ══ SECTION: Slide content typography ══ */
.slide-canvas .body h2.big{ font-size:30px; font-weight:700; color:var(--navy); letter-spacing:-0.01em; line-height:1.15; margin-bottom:10px }
.slide-canvas .body .lede{ font-size:15px; color:var(--text-muted); line-height:1.55; margin-bottom:22px; max-width:980px }
.slide-canvas .body .param-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:14px }
.slide-canvas .body .param-grid.cols-2{ grid-template-columns:1fr 1fr }
.slide-canvas .body .param-grid.cols-4{ grid-template-columns:repeat(4,1fr) }
.slide-canvas .body .param{ background:var(--surface); border:1px solid var(--border); border-left:3px solid var(--teal); border-radius:6px; padding:12px 14px }
.slide-canvas .body .param .k{ font-size:10px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:var(--slate); margin-bottom:4px }
.slide-canvas .body .param .v{ font-size:15px; font-weight:600; color:var(--text); line-height:1.35 }
.slide-canvas .body ul.agenda{ list-style:none; display:grid; grid-template-columns:1fr 1fr; column-gap:48px; row-gap:10px; font-size:15px; margin-top:8px }
.slide-canvas .body ul.agenda li{ padding:10px 0; border-bottom:1px solid var(--border); display:flex; align-items:baseline; gap:14px }
.slide-canvas .body ul.agenda li .an{ font-family:'JetBrains Mono',monospace; font-weight:700; color:var(--teal-dark); font-size:12px; letter-spacing:0.04em; min-width:28px }
.slide-canvas .body ul.agenda li .at{ color:var(--text); font-weight:500 }
```

- [ ] **Step 2: Add a `fmt()` helper near the top of the script block**

Insert just after the `saveLastTemplate` helper:

```javascript
function fmt(id) {
  if (id === null || id === undefined || id === "") return "Not specified";
  return String(id).replace(/[_-]/g,' ').replace(/\b\w/g, c => c.toUpperCase());
}
function safe(v, fallback) { return (v !== null && v !== undefined && v !== "") ? v : (fallback || "Not specified"); }
```

- [ ] **Step 3: Add three new cases to the `renderSlide` switch (above `default:`)**

Insert:

```javascript
    case "agenda": {
      // Build from sibling slides — needs the full list, so pass it through
      return <SlideCanvas {...sharedProps}>
        <h2 className="big">Agenda</h2>
        <p className="lede">Order and focus for today's discussion.</p>
        <ul className="agenda">
          {(slide._siblings || []).filter(s => s.id !== slide.id && !s.isDivider).map(s =>
            <li key={s.id}><span className="an">{String(s.num).padStart(2,'0')}</span><span className="at">{s.title}</span></li>
          )}
        </ul>
      </SlideCanvas>;
    }
    case "programme": {
      const m = ctx.project_meta || {};
      const params = [
        { k:"Country / Region", v: safe(m.country) },
        { k:"Sectors", v: (m.health_areas||[]).map(fmt).join(', ') || safe(m.sector) },
        { k:"Operating Context", v: fmt(m.operating_context) },
        { k:"Budget", v: fmt(m.budget) },
        { k:"Programme Maturity", v: fmt(m.programme_maturity) },
        { k:"Timeline", v: fmt(m.timeline) }
      ];
      return <SlideCanvas {...sharedProps}>
        <h2 className="big">{safe(m.programme_name, "Programme Overview")}</h2>
        <p className="lede">{safe(m.organisation, "")} — programme context at a glance.</p>
        <div className="param-grid">
          {params.map((p,i) => <div key={i} className="param"><div className="k">{p.k}</div><div className="v">{p.v}</div></div>)}
        </div>
      </SlideCanvas>;
    }
    case "purpose": {
      const t = ctx.tor_constraints || {};
      const purposes = (t.evaluation_purpose || []).map(fmt);
      const params = [
        { k:"Evaluation Purpose", v: purposes.length ? purposes.join(', ') : "Not specified" },
        { k:"Causal Inference Level", v: fmt(t.causal_inference_level) },
        { k:"Geographic Scope", v: safe(t.geographic_scope), wide:true },
        { k:"Target Population", v: safe(t.target_population), wide:true }
      ];
      return <SlideCanvas {...sharedProps}>
        <h2 className="big">Evaluation Purpose & Users</h2>
        <p className="lede">What this evaluation is for, and who will use the findings.</p>
        <div className="param-grid cols-2">
          {params.map((p,i) => <div key={i} className="param" style={p.wide ? {gridColumn:'1 / -1'} : {}}><div className="k">{p.k}</div><div className="v">{p.v}</div></div>)}
        </div>
      </SlideCanvas>;
    }
```

- [ ] **Step 4: Pass siblings to the agenda renderer**

Update the `.map(slide => ...)` in `App` where `renderSlide` is called, so the agenda renderer has access to the full list. Change the loop to:

```javascript
    {(() => {
      const slides = template === 'inception' ? buildInceptionSlides(context, deckState) : buildFindingsSlides(context, deckState);
      return slides.map(slide => {
        const slideWithSiblings = { ...slide, _siblings: slides };
        return <div key={slide.id} className="slide-wrap">
          <div className="slide-meta"><span className="snum">{String(slide.num).padStart(2,'0')}</span> · {slide.title}</div>
          <ScaledSlide>{renderSlide(slideWithSiblings, context, deckState, programme)}</ScaledSlide>
        </div>;
      });
    })()}
```

- [ ] **Step 5: Verify in browser**

Open: `http://localhost:8765/praxis/tools/deck-generator/` → Inception Brief
- Slide 2 "Agenda": shows two-column list with numbered entries "02 Agenda" is skipped (self-filtered), shows 03 Programme Overview, 04 Purpose, etc. Section dividers (Cover, Q&A) are also filtered out.
- Slide 3 "Programme Overview": large title "Maternal Health Quality Improvement Programme", lede with organisation, 6 teal-left-bordered cards showing Country (Niger), Sectors (Maternal Health, Child Health), Operating Context (Fragile Humanitarian), Budget (Usd 5M To 20M), Programme Maturity (Early Implementation), Timeline (36 Months).
- Slide 4 "Evaluation Purpose & Users": 4 cards; Purpose and Causal Inference Level in top row; Geographic Scope and Target Population full-width below.

- [ ] **Step 6: Commit**

```bash
git add praxis/tools/deck-generator/index.html
git commit -m "feat(deck-generator): inception renderers — agenda, programme overview, purpose"
```

---

## Task 8: Theory of Change SVG tree (Slide 5 — first "earns its keep" viz)

**Files:**
- Modify: `praxis/tools/deck-generator/index.html`

- [ ] **Step 1: Add ToC tree CSS**

Insert inside the main `<style>` block:

```css
/* ══ SECTION: ToC tree viz ══ */
.toc-tree{ width:100%; height:100%; }
.toc-tree .col-label{ font-size:10px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; fill:var(--slate) }
.toc-tree .col-title{ font-size:12px; font-weight:700; fill:var(--navy) }
.toc-tree .node-box{ fill:var(--surface); stroke:var(--border); stroke-width:1 }
.toc-tree .node-box.impact{ fill:var(--navy); stroke:var(--navy) }
.toc-tree .node-box.outcome{ fill:var(--teal-light); stroke:var(--teal) }
.toc-tree .node-box.output{ fill:#FFF7ED; stroke:#FDBA74 }
.toc-tree .node-box.activity{ fill:var(--bg); stroke:var(--border) }
.toc-tree .node-text{ font-size:11px; font-weight:500; fill:var(--text) }
.toc-tree .node-text.light{ fill:#fff }
.toc-tree .node-text.center{ text-anchor:middle }
.toc-tree .link{ stroke:var(--slate-light); stroke-width:1; fill:none }
.toc-tree .overflow-chip{ fill:var(--bg); stroke:var(--border); stroke-width:1 }
.toc-tree .overflow-text{ font-size:10px; font-weight:600; fill:var(--slate); font-style:italic }
```

- [ ] **Step 2: Add a `ToCTreeSVG` component just above `renderSlide`**

Insert:

```javascript
/* ══ SECTION: ToC tree SVG ══ */
function ToCTreeSVG({ nodes }) {
  const W = 1184, H = 560;
  const levels = [
    { key:"impact",   label:"Impact" },
    { key:"outcome",  label:"Outcomes" },
    { key:"output",   label:"Outputs" },
    { key:"activity", label:"Activities" }
  ];
  const COL_W = W / 4;
  const MAX_PER_COL = 6; // per-level cap
  const boxW = COL_W - 28, boxH = 46, gap = 10;

  const grouped = levels.map((L, ci) => {
    const all = (nodes || []).filter(n => n.level === L.key);
    const shown = all.slice(0, MAX_PER_COL);
    const overflow = all.length - shown.length;
    const totalH = shown.length * boxH + (shown.length - 1) * gap + (overflow > 0 ? (boxH + gap) : 0);
    const startY = 80 + (H - 100 - totalH) / 2;
    const x = ci * COL_W + 14;
    return {
      level: L, col: ci, x, shown, overflow,
      boxes: shown.map((n, i) => ({ node:n, x, y: startY + i * (boxH + gap), cx: x + boxW/2, cy: startY + i * (boxH + gap) + boxH/2 })),
      overflowBox: overflow > 0 ? { x, y: startY + shown.length * (boxH + gap), cx: x + boxW/2, cy: startY + shown.length * (boxH + gap) + boxH/2 } : null
    };
  });

  // Links between adjacent columns: each child -> average of parent column's boxes
  const links = [];
  for (let ci = 1; ci < levels.length; ci++) {
    const parents = grouped[ci-1];
    const children = grouped[ci];
    children.boxes.forEach(child => {
      parents.boxes.forEach(parent => {
        links.push({ x1: parent.x + boxW, y1: parent.cy, x2: child.x, y2: child.cy });
      });
    });
  }

  return <svg className="toc-tree" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
    {/* Column headers */}
    {levels.map((L, ci) => <g key={L.key}>
      <text x={ci*COL_W + COL_W/2} y={36} className="col-label" textAnchor="middle">{L.label}</text>
      <text x={ci*COL_W + COL_W/2} y={56} className="col-title" textAnchor="middle">
        {(nodes || []).filter(n => n.level === L.key).length} element{(nodes || []).filter(n => n.level === L.key).length === 1 ? '' : 's'}
      </text>
    </g>)}

    {/* Links */}
    {links.map((L, i) => <path key={i} className="link" d={`M ${L.x1} ${L.y1} C ${(L.x1+L.x2)/2} ${L.y1}, ${(L.x1+L.x2)/2} ${L.y2}, ${L.x2} ${L.y2}`}/>)}

    {/* Boxes */}
    {grouped.flatMap(g => [
      ...g.boxes.map(b => <g key={b.node.id}>
        <rect className={`node-box ${g.level.key}`} x={b.x} y={b.y} width={boxW} height={boxH} rx={4}/>
        <foreignObject x={b.x + 6} y={b.y + 4} width={boxW - 12} height={boxH - 8}>
          <div xmlns="http://www.w3.org/1999/xhtml" style={{font:'500 11px DM Sans,sans-serif',color: g.level.key === 'impact' ? '#fff' : '#0F172A',display:'flex',alignItems:'center',height:'100%',lineHeight:1.25,overflow:'hidden'}}>
            {b.node.title}
          </div>
        </foreignObject>
      </g>),
      g.overflowBox && <g key={`of-${g.level.key}`}>
        <rect className="overflow-chip" x={g.overflowBox.x} y={g.overflowBox.y} width={boxW} height={boxH} rx={4}/>
        <text className="overflow-text" x={g.overflowBox.x + boxW/2} y={g.overflowBox.y + boxH/2 + 4} textAnchor="middle">+{g.overflow} more</text>
      </g>
    ])}
  </svg>;
}
```

- [ ] **Step 3: Add the "toc" case to `renderSlide`**

Insert before `default:`:

```javascript
    case "toc": {
      const nodes = ctx.toc?.nodes || [];
      if (!nodes.length) {
        return <SlideCanvas {...sharedProps}>
          <h2 className="big">Theory of Change</h2>
          <p className="lede" style={{fontStyle:'italic'}}>No Theory of Change captured in the workbench yet.</p>
        </SlideCanvas>;
      }
      return <SlideCanvas {...sharedProps}>
        <p className="lede" style={{marginBottom:10}}>How activities cascade into impact — the causal pathway this evaluation will test.</p>
        <div style={{flex:1,minHeight:0,display:'flex',alignItems:'stretch'}}>
          <ToCTreeSVG nodes={nodes} />
        </div>
      </SlideCanvas>;
    }
```

- [ ] **Step 4: Verify in browser**

Open: `http://localhost:8765/praxis/tools/deck-generator/` → Inception Brief → scroll to slide 5 (Theory of Change).
Expected:
- 4 columns (Impact, Outcomes, Outputs, Activities) with counts (1 element, 3 elements, 4 elements, 4 elements)
- Impact node (navy fill) with white text "Reduced maternal and neonatal mortality"
- Teal-tinted outcome boxes ("Improved quality of antenatal care", "Increased facility-based deliveries", "Strengthened referral systems")
- Amber-tinted output boxes (4 of them)
- Slate activity boxes (4 of them)
- Curved connecting lines between adjacent columns
- No overflow chip (under 6 per level in demo data)

- [ ] **Step 5: Commit**

```bash
git add praxis/tools/deck-generator/index.html
git commit -m "feat(deck-generator): slide 5 — theory of change SVG tree viz"
```

---

## Task 9: Inception renderers — Evaluation Questions, Methodology

**Files:**
- Modify: `praxis/tools/deck-generator/index.html`

- [ ] **Step 1: Add criterion badge CSS**

Insert inside the main `<style>` block:

```css
/* ══ SECTION: EQ criterion badges ══ */
.slide-canvas .body .eq-list{ display:flex; flex-direction:column; gap:8px }
.slide-canvas .body .eq-row{ display:grid; grid-template-columns:36px 96px 1fr; gap:12px; align-items:start; padding:9px 12px; background:var(--surface); border:1px solid var(--border); border-radius:6px; font-size:13px; line-height:1.45 }
.slide-canvas .body .eq-row .eq-num{ font-family:'JetBrains Mono',monospace; font-weight:700; color:var(--navy); font-size:13px }
.slide-canvas .body .crit-badge{ display:inline-block; font-size:10px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; padding:3px 7px; border-radius:3px; text-align:center; white-space:nowrap }
.crit-relevance    { background:#DBEAFE; color:#1E40AF }
.crit-coherence    { background:#E0E7FF; color:#3730A3 }
.crit-effectiveness{ background:#D1FAE5; color:#065F46 }
.crit-efficiency   { background:#FEF3C7; color:#92400E }
.crit-impact       { background:#FCE7F3; color:#9D174D }
.crit-sustainability{ background:#CCFBF1; color:#115E59 }
```

- [ ] **Step 2: Add two new cases to `renderSlide`**

Insert before `default:`:

```javascript
    case "eqs": {
      const rows = ctx.evaluation_matrix?.rows || [];
      if (!rows.length) return <SlideCanvas {...sharedProps}><h2 className="big">Evaluation Questions</h2><p className="lede" style={{fontStyle:'italic'}}>Complete the Evaluation Matrix station to populate this slide.</p></SlideCanvas>;
      return <SlideCanvas {...sharedProps}>
        <h2 className="big">Evaluation Questions</h2>
        <p className="lede">{rows.length} question{rows.length === 1 ? '' : 's'} across {new Set(rows.map(r => r.criterion).filter(Boolean)).size} OECD-DAC criteria.</p>
        <div className="eq-list">
          {rows.map((eq, i) => <div key={eq.id || i} className="eq-row">
            <span className="eq-num">{String(eq.number || i+1).padStart(2,'0')}</span>
            <span className={`crit-badge crit-${eq.criterion || 'relevance'}`}>{fmt(eq.criterion || "—")}</span>
            <span>{eq.question || "—"}</span>
          </div>)}
        </div>
      </SlideCanvas>;
    }
    case "methodology": {
      const dr = ctx.design_recommendation || {};
      const top = dr.ranked_designs?.[0] || (dr.selected_design ? { id: dr.selected_design } : null);
      if (!top) return <SlideCanvas {...sharedProps}><h2 className="big">Methodology</h2><p className="lede" style={{fontStyle:'italic'}}>Complete the Design Advisor station to select an evaluation design.</p></SlideCanvas>;
      const params = [
        { k:"Design", v: safe(top.name, fmt(top.id)) },
        { k:"Family", v: safe(top.family, "Not classified") },
        top.score != null ? { k:"Score", v: (typeof top.score === 'number' ? top.score.toFixed(1) : top.score) + " / 100" } : null,
        { k:"Comparison Strategy", v: fmt(ctx.tor_constraints?.comparison_feasibility || dr.answers?.comparison) }
      ].filter(Boolean);
      return <SlideCanvas {...sharedProps}>
        <h2 className="big">{safe(top.name, fmt(top.id))}</h2>
        <p className="lede">{dr.justification || "Design selected by the workbench advisor based on causal-inference needs, timeline, and ToR constraints."}</p>
        <div className="param-grid cols-4" style={{marginTop:'auto'}}>
          {params.map((p,i) => <div key={i} className="param"><div className="k">{p.k}</div><div className="v">{p.v}</div></div>)}
        </div>
      </SlideCanvas>;
    }
```

- [ ] **Step 3: Verify in browser**

Open: `http://localhost:8765/praxis/tools/deck-generator/` → Inception → slides 6 and 7.
Expected:
- Slide 6 "Evaluation Questions": lede says "6 questions across 5 OECD-DAC criteria". Six rows each with number, coloured criterion badge (blue for Relevance, green for Effectiveness, pink for Impact, teal for Sustainability, amber for Efficiency), and the question text.
- Slide 7 "Methodology": H2 "Difference-in-Differences with Matched Controls", justification as lede, 4 param cards at the bottom (Design, Family Quasi-Experimental, Score 87.2/100, Comparison Strategy Matched Comparison).

- [ ] **Step 4: Commit**

```bash
git add praxis/tools/deck-generator/index.html
git commit -m "feat(deck-generator): slides 6-7 — evaluation questions with criterion badges, methodology"
```

---

## Task 10: Sampling SVG bars (Slide 8 — second "earns its keep" viz)

**Files:**
- Modify: `praxis/tools/deck-generator/index.html`

- [ ] **Step 1: Add sampling viz CSS**

Insert inside the main `<style>` block:

```css
/* ══ SECTION: Sampling viz ══ */
.sampling-viz{ display:flex; flex-direction:column; gap:16px; padding-top:6px }
.sampling-viz .section-label{ font-size:10px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:var(--slate) }
.sampling-bar-row{ display:grid; grid-template-columns:180px 1fr 72px; align-items:center; gap:12px; padding:8px 0; border-bottom:1px solid var(--border); font-size:13px }
.sampling-bar-row .method{ font-weight:500; color:var(--text) }
.sampling-bar-row .bar{ position:relative; height:14px; background:var(--bg); border-radius:7px; overflow:hidden }
.sampling-bar-row .bar-fill{ position:absolute; top:0; left:0; height:100%; border-radius:7px; background:linear-gradient(90deg,var(--teal),var(--teal-dark)) }
.sampling-bar-row .count{ font-family:'JetBrains Mono',monospace; font-weight:700; color:var(--navy); text-align:right }
.sampling-hero{ display:grid; grid-template-columns:1fr 1fr; gap:24px }
.sampling-hero .num-card{ background:var(--surface); border:1px solid var(--border); border-left:3px solid var(--teal); border-radius:6px; padding:18px 20px }
.sampling-hero .num-card .k{ font-size:10px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:var(--slate); margin-bottom:6px }
.sampling-hero .num-card .v{ font-size:28px; font-weight:800; color:var(--navy); font-family:'JetBrains Mono',monospace; letter-spacing:-0.02em }
.sampling-hero .num-card .sv{ font-size:13px; color:var(--text-muted); margin-top:3px }
```

- [ ] **Step 2: Add the "sampling" case to `renderSlide`**

Insert before `default:`:

```javascript
    case "sampling": {
      const sp = ctx.sample_parameters || {};
      const quant = sp.result?.primary;
      const quantLabel = sp.result?.label;
      const qual = sp.qualitative_plan?.breakdown || [];
      const qualTotal = qual.reduce((s,b) => s + (b.count || 0), 0);
      const maxQual = Math.max(1, ...qual.map(b => b.count || 0));
      if (!quant && !qual.length) return <SlideCanvas {...sharedProps}><h2 className="big">Sampling Strategy</h2><p className="lede" style={{fontStyle:'italic'}}>Complete the Sample Size station to populate this slide.</p></SlideCanvas>;
      return <SlideCanvas {...sharedProps}>
        <h2 className="big">Sampling Strategy</h2>
        <div className="sampling-viz">
          <div className="sampling-hero">
            <div className="num-card">
              <div className="k">Quantitative Sample</div>
              <div className="v">{quant != null ? quant.toLocaleString() : "—"}</div>
              <div className="sv">{quantLabel || "—"}</div>
            </div>
            <div className="num-card">
              <div className="k">Qualitative Touchpoints</div>
              <div className="v">{qualTotal}</div>
              <div className="sv">{qual.length} method{qual.length === 1 ? '' : 's'}</div>
            </div>
          </div>
          {qual.length > 0 && <div>
            <div className="section-label" style={{marginBottom:6}}>Qualitative breakdown</div>
            {qual.map((b, i) => <div key={i} className="sampling-bar-row">
              <span className="method">{b.method}</span>
              <div className="bar"><div className="bar-fill" style={{width: `${(b.count / maxQual) * 100}%`}}></div></div>
              <span className="count">{b.count}</span>
            </div>)}
          </div>}
        </div>
      </SlideCanvas>;
    }
```

- [ ] **Step 3: Verify in browser**

Open: `http://localhost:8765/praxis/tools/deck-generator/` → Inception → slide 8.
Expected:
- H2 "Sampling Strategy"
- Two big number cards side-by-side: "Quantitative Sample 1,842" with the DID label; "Qualitative Touchpoints 80" with "4 methods"
- Below: 4 horizontal bars with method labels, teal gradient fills sized proportionally, counts on the right (32, 12, 8, 28)

- [ ] **Step 4: Commit**

```bash
git add praxis/tools/deck-generator/index.html
git commit -m "feat(deck-generator): slide 8 — sampling strategy SVG bars"
```

---

## Task 11: Inception renderers — Data Collection, Analysis

**Files:**
- Modify: `praxis/tools/deck-generator/index.html`

- [ ] **Step 1: Add data collection / analysis CSS**

Insert inside the main `<style>` block:

```css
/* ══ SECTION: Data collection + analysis lists ══ */
.slide-canvas .body .instr-row{ display:grid; grid-template-columns:1fr 110px 80px; gap:12px; align-items:center; padding:9px 12px; border-bottom:1px solid var(--border); font-size:13px }
.slide-canvas .body .instr-row:last-child{ border-bottom:none }
.slide-canvas .body .instr-row .iname{ font-weight:600; color:var(--text) }
.slide-canvas .body .instr-row .itype{ font-size:11px; font-weight:600; color:var(--slate); text-transform:uppercase; letter-spacing:0.06em }
.slide-canvas .body .instr-row .iqcount{ font-family:'JetBrains Mono',monospace; font-weight:700; color:var(--navy); text-align:right; font-size:12px }
.slide-canvas .body .instr-summary{ display:flex; gap:22px; padding-bottom:12px; border-bottom:2px solid var(--border); margin-bottom:8px }
.slide-canvas .body .instr-summary .is-item .k{ font-size:9px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:var(--slate) }
.slide-canvas .body .instr-summary .is-item .v{ font-size:22px; font-weight:800; color:var(--navy); font-family:'JetBrains Mono',monospace; letter-spacing:-0.02em; line-height:1.1 }
.slide-canvas .body .analysis-row{ display:grid; grid-template-columns:60px 1fr 200px; gap:12px; align-items:start; padding:9px 12px; border-bottom:1px solid var(--border); font-size:13px }
.slide-canvas .body .analysis-row .aeq{ font-family:'JetBrains Mono',monospace; font-weight:700; color:var(--navy) }
.slide-canvas .body .analysis-row .ameth{ color:var(--text); font-weight:500 }
.slide-canvas .body .analysis-row .asoft{ color:var(--slate); font-size:11px; font-family:'JetBrains Mono',monospace }
```

- [ ] **Step 2: Add two new cases to `renderSlide`**

Insert before `default:`:

```javascript
    case "datacoll": {
      const items = ctx.instruments?.items || [];
      if (!items.length) return <SlideCanvas {...sharedProps}><h2 className="big">Data Collection</h2><p className="lede" style={{fontStyle:'italic'}}>Complete the Instruments station to populate this slide.</p></SlideCanvas>;
      const totalQ = items.reduce((s, it) => s + (it.questions?.length || 0), 0);
      const typeMap = {};
      items.forEach(it => { const t = it.type || 'other'; typeMap[t] = (typeMap[t] || 0) + 1; });
      return <SlideCanvas {...sharedProps}>
        <h2 className="big">Data Collection</h2>
        <p className="lede">Instruments and touchpoints across the data collection plan.</p>
        <div className="instr-summary">
          <div className="is-item"><div className="k">Instruments</div><div className="v">{items.length}</div></div>
          <div className="is-item"><div className="k">Total Questions</div><div className="v">{totalQ}</div></div>
          <div className="is-item"><div className="k">Types</div><div className="v" style={{fontSize:14,fontFamily:'DM Sans',fontWeight:600,color:'var(--text)'}}>{Object.keys(typeMap).map(t => `${fmt(t)} (${typeMap[t]})`).join(' · ')}</div></div>
        </div>
        {items.map((it, i) => <div key={it.id || i} className="instr-row">
          <span className="iname">{it.title || it.name || "Untitled"}</span>
          <span className="itype">{fmt(it.type || "other")}</span>
          <span className="iqcount">{it.questions?.length || 0} Qs</span>
        </div>)}
      </SlideCanvas>;
    }
    case "analysis": {
      const rows = ctx.analysis_plan?.rows || [];
      const matrixRows = ctx.evaluation_matrix?.rows || [];
      if (!rows.length && !matrixRows.length) return <SlideCanvas {...sharedProps}><h2 className="big">Analysis Approach</h2><p className="lede" style={{fontStyle:'italic'}}>Complete the Analysis station to populate this slide.</p></SlideCanvas>;
      if (!rows.length) {
        return <SlideCanvas {...sharedProps}>
          <h2 className="big">Analysis Approach</h2>
          <p className="lede">Data sources per evaluation question (detailed methods TBD in the workbench).</p>
          {matrixRows.map((eq, i) => <div key={eq.id || i} className="analysis-row">
            <span className="aeq">EQ{eq.number || i+1}</span>
            <span className="ameth">{(eq.dataSources || []).join(', ') || "No sources defined"}</span>
            <span className="asoft"></span>
          </div>)}
        </SlideCanvas>;
      }
      return <SlideCanvas {...sharedProps}>
        <h2 className="big">Analysis Approach</h2>
        <p className="lede">Method and software assignments per evaluation question.</p>
        {rows.map((r, i) => <div key={i} className="analysis-row">
          <span className="aeq">{r.eq_label || `EQ${i+1}`}</span>
          <span className="ameth">{r.method || "Not specified"}</span>
          <span className="asoft">{r.software || ""}</span>
        </div>)}
      </SlideCanvas>;
    }
```

- [ ] **Step 3: Verify in browser**

Inception → slide 9 "Data Collection": summary bar "Instruments 5 · Total Questions 186 · Types Quantitative (1) · Observation (1) · Qualitative (2) · Administrative (1)". Then 5 rows (Household Survey, Facility Audit, etc.) with type + Q count.
Slide 10 "Analysis Approach": lede about methods + software. 6 rows with EQ label, method, and software (NVivo + R, R / Stata, etc.).

- [ ] **Step 4: Commit**

```bash
git add praxis/tools/deck-generator/index.html
git commit -m "feat(deck-generator): slides 9-10 — data collection, analysis approach"
```

---

## Task 12: Evaluability radar SVG (Slide 11 — third "earns its keep" viz)

**Files:**
- Modify: `praxis/tools/deck-generator/index.html`

- [ ] **Step 1: Add radar CSS**

Insert inside the main `<style>` block:

```css
/* ══ SECTION: Evaluability radar ══ */
.eval-layout{ display:grid; grid-template-columns:420px 1fr; gap:32px; align-items:start }
.eval-score-block{ display:flex; flex-direction:column; gap:16px }
.eval-score-hero{ display:flex; align-items:baseline; gap:14px }
.eval-score-hero .sval{ font-size:88px; font-weight:800; color:var(--navy); line-height:1; font-family:'JetBrains Mono',monospace; letter-spacing:-0.04em }
.eval-score-hero .scap{ font-size:16px; color:var(--slate); font-weight:600 }
.eval-band{ display:inline-block; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; padding:5px 10px; border-radius:3px; align-self:flex-start }
.eval-band.high{ background:#D1FAE5; color:#065F46 }
.eval-band.moderate{ background:#FEF3C7; color:#92400E }
.eval-band.low{ background:#FEE2E2; color:#991B1B }
.eval-blockers{ margin-top:6px; padding-top:14px; border-top:1px solid var(--border) }
.eval-blockers .bk{ font-size:10px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:var(--slate); margin-bottom:6px }
.eval-blockers .bitem{ font-size:13px; color:var(--text); padding:4px 0; display:flex; gap:8px; align-items:baseline }
.eval-blockers .bitem::before{ content:"•"; color:var(--amber); font-weight:700 }
.eval-radar svg{ width:100%; height:auto; max-height:480px }
.eval-radar .axis{ stroke:var(--border); stroke-width:1; fill:none }
.eval-radar .ring{ stroke:var(--border); stroke-width:1; stroke-dasharray:3,3; fill:none }
.eval-radar .poly{ fill:var(--teal); fill-opacity:0.2; stroke:var(--teal-dark); stroke-width:1.5 }
.eval-radar .pt{ fill:var(--teal-dark); stroke:var(--surface); stroke-width:2 }
.eval-radar .alabel{ font-size:11px; font-weight:600; fill:var(--navy) }
.eval-radar .ascore{ font-size:10px; font-weight:700; fill:var(--slate); font-family:'JetBrains Mono',monospace }
```

- [ ] **Step 2: Add the radar component and "evaluability" case**

Insert before `renderSlide`:

```javascript
/* ══ SECTION: Evaluability radar SVG ══ */
function EvaluabilityRadar({ dimensions }) {
  const size = 380, cx = size/2, cy = size/2 + 6, r = 130;
  const dims = dimensions || [];
  if (!dims.length) return null;
  const n = dims.length;
  const angleFor = (i) => -Math.PI/2 + (i * 2 * Math.PI / n);
  const pts = dims.map((d, i) => {
    const val = d.adjusted_score != null ? d.adjusted_score : d.system_score;
    const pct = d.max > 0 ? val / d.max : 0;
    const a = angleFor(i);
    return { x: cx + Math.cos(a) * r * pct, y: cy + Math.sin(a) * r * pct, label:d.label, val, max:d.max, angle:a };
  });
  const axisEnds = dims.map((_, i) => {
    const a = angleFor(i);
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, a };
  });
  const labelPos = axisEnds.map(e => ({ x: cx + Math.cos(e.a) * (r + 22), y: cy + Math.sin(e.a) * (r + 22), a:e.a }));
  const polyD = pts.map((p,i) => `${i===0?'M':'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  return <svg viewBox={`0 0 ${size} ${size + 30}`} preserveAspectRatio="xMidYMid meet">
    {[0.25,0.5,0.75,1].map(f => <circle key={f} className="ring" cx={cx} cy={cy} r={r*f}/>)}
    {axisEnds.map((e,i) => <line key={i} className="axis" x1={cx} y1={cy} x2={e.x} y2={e.y}/>)}
    <path className="poly" d={polyD}/>
    {pts.map((p,i) => <circle key={i} className="pt" cx={p.x} cy={p.y} r={4}/>)}
    {labelPos.map((lp,i) => {
      const anchor = Math.abs(lp.a) < 0.1 || Math.abs(Math.abs(lp.a) - Math.PI) < 0.1 ? 'middle' : (Math.cos(lp.a) > 0 ? 'start' : 'end');
      return <g key={i}>
        <text className="alabel" x={lp.x} y={lp.y - 4} textAnchor={anchor}>{pts[i].label}</text>
        <text className="ascore" x={lp.x} y={lp.y + 10} textAnchor={anchor}>{pts[i].val}/{pts[i].max}</text>
      </g>;
    })}
  </svg>;
}
```

Insert before `default:` in `renderSlide`:

```javascript
    case "evaluability": {
      const ev = ctx.evaluability || {};
      const score = ev.score;
      if (score == null) return <SlideCanvas {...sharedProps}><h2 className="big">Evaluability Assessment</h2><p className="lede" style={{fontStyle:'italic'}}>Evaluability assessment not yet completed in the workbench.</p></SlideCanvas>;
      const bandClass = score >= 80 ? 'high' : (score >= 50 ? 'moderate' : 'low');
      const bandLabel = score >= 80 ? 'High' : (score >= 50 ? 'Moderate' : 'Low');
      const blockers = ev.blockers || [];
      return <SlideCanvas {...sharedProps}>
        <h2 className="big">Evaluability Assessment</h2>
        <p className="lede">Is this programme ready to be evaluated? Five-dimension readiness score.</p>
        <div className="eval-layout" style={{flex:1,minHeight:0}}>
          <div className="eval-score-block">
            <div className="eval-score-hero">
              <span className="sval">{score}</span>
              <span className="scap">/ 100</span>
            </div>
            <span className={`eval-band ${bandClass}`}>{bandLabel} evaluability</span>
            {blockers.length > 0 && <div className="eval-blockers">
              <div className="bk">Key constraints</div>
              {blockers.map((b, i) => <div key={i} className="bitem">{typeof b === 'string' ? b : (b.label || b.text || '')}</div>)}
            </div>}
          </div>
          <div className="eval-radar"><EvaluabilityRadar dimensions={ev.dimensions || []}/></div>
        </div>
      </SlideCanvas>;
    }
```

- [ ] **Step 3: Verify in browser**

Inception → slide 11 "Evaluability Assessment".
Expected:
- Left column: big "74" with "/ 100", "Moderate evaluability" amber pill, "Key constraints" subhead, two bullet items (HMIS completeness, Tillabéri security)
- Right column: SVG pentagon radar (5 axes for 5 dimensions), teal-filled polygon, labels outside (Programme Logic 17/20, Data Availability 12/20, Stakeholder Engagement 16/20, Utility of Findings 15/20, Ethics & Protection 14/20)

- [ ] **Step 4: Commit**

```bash
git add praxis/tools/deck-generator/index.html
git commit -m "feat(deck-generator): slide 11 — evaluability assessment SVG radar"
```

---

## Task 13: Inception editable slides — Timeline, Team, Risks, Deliverables

**Files:**
- Modify: `praxis/tools/deck-generator/index.html`

- [ ] **Step 1: Add editable-table CSS**

Insert inside the main `<style>` block:

```css
/* ══ SECTION: Editable tables ══ */
.etable{ display:grid; gap:6px }
.etable .erow{ display:grid; gap:10px; padding:8px 12px; background:var(--surface); border:1px solid var(--border); border-radius:6px; align-items:center }
.etable .erow.header{ background:var(--bg); border-color:var(--border) }
.etable .erow.header .ecell{ font-size:10px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:var(--slate) }
.etable input.ecell, .etable textarea.ecell{ border:1px solid transparent; background:transparent; padding:4px 6px; border-radius:4px; font-size:13px; color:var(--text); width:100%; font-family:inherit }
.etable input.ecell:focus, .etable textarea.ecell:focus{ outline:none; border-color:var(--teal); background:var(--surface) }
.etable input.ecell:hover, .etable textarea.ecell:hover{ background:var(--bg) }
.etable .ecell.static{ font-weight:600; color:var(--navy); font-family:'JetBrains Mono',monospace; font-size:12px }

/* Timeline Gantt grid */
.gantt{ display:grid; grid-template-columns:180px repeat(12,1fr); gap:2px; margin-top:10px }
.gantt .gh{ padding:6px 4px; font-size:10px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:var(--slate); text-align:center }
.gantt .gh.label-col{ text-align:left; padding-left:10px }
.gantt .phase-label{ padding:8px 10px; font-size:12px; font-weight:600; color:var(--text); display:flex; align-items:center; background:var(--surface); border-radius:4px }
.gantt .phase-cell{ height:32px; background:var(--bg); border-radius:2px; cursor:pointer; transition:all 0.15s }
.gantt .phase-cell:hover{ background:var(--teal-glow) }
.gantt .phase-cell.on{ background:var(--teal); }
.gantt .phase-cell.on:hover{ background:var(--teal-dark) }
```

- [ ] **Step 2: Add an `EditableCell` helper just after `InlineEditable`**

```javascript
function EditableCell({ path, value, setOverride, getOverride, placeholder, multiline, style }) {
  const current = getOverride(path, value);
  const [local, setLocal] = useState(current);
  useEffect(() => setLocal(current), [current]);
  function commit() {
    const trimmed = (local || "").trim();
    if (trimmed === value) setOverride(path, null);
    else setOverride(path, trimmed);
  }
  if (multiline) return <textarea className="ecell" value={local} onChange={e => setLocal(e.target.value)} onBlur={commit} placeholder={placeholder} style={{resize:'vertical',minHeight:32,...style}}/>;
  return <input className="ecell" value={local} onChange={e => setLocal(e.target.value)} onBlur={commit} placeholder={placeholder} style={style}/>;
}
```

- [ ] **Step 3: Add four new cases to `renderSlide`**

Insert before `default:`:

```javascript
    case "timeline": {
      const phases = [
        { id:"inception", label:"Inception" },
        { id:"fieldwork", label:"Fieldwork" },
        { id:"analysis",  label:"Analysis" },
        { id:"reporting", label:"Reporting" }
      ];
      const defaults = {
        "timeline.inception": "1,2,3",
        "timeline.fieldwork": "4,5,6,7,8",
        "timeline.analysis":  "8,9,10",
        "timeline.reporting": "10,11,12"
      };
      function monthsSet(phaseId){
        const raw = deckState.getOverride(`timeline.${phaseId}`, defaults[`timeline.${phaseId}`]);
        return new Set(String(raw).split(',').map(s => parseInt(s.trim(),10)).filter(n => n >= 1 && n <= 12));
      }
      function toggleMonth(phaseId, m){
        const current = monthsSet(phaseId);
        if (current.has(m)) current.delete(m); else current.add(m);
        const sorted = Array.from(current).sort((a,b)=>a-b).join(',');
        deckState.setOverride(`timeline.${phaseId}`, sorted === defaults[`timeline.${phaseId}`] ? null : sorted);
      }
      return <SlideCanvas {...sharedProps}>
        <h2 className="big">Timeline</h2>
        <p className="lede">12-month evaluation schedule. Click cells to adjust phase coverage.</p>
        <div className="gantt">
          <div className="gh label-col">Phase</div>
          {Array.from({length:12}, (_,i) => <div key={i} className="gh">M{i+1}</div>)}
          {phases.map(p => <React.Fragment key={p.id}>
            <div className="phase-label">{p.label}</div>
            {Array.from({length:12},(_,i) => i+1).map(m => {
              const on = monthsSet(p.id).has(m);
              return <div key={m} className={`phase-cell ${on ? 'on' : ''}`} onClick={() => toggleMonth(p.id, m)}/>;
            })}
          </React.Fragment>)}
        </div>
      </SlideCanvas>;
    }
    case "team": {
      const defaults = [
        { role:"Team Leader", name:"Dr. [Name]", resp:"Overall direction, donor liaison, final report" },
        { role:"Senior Methodologist", name:"[Name]", resp:"Quant design, DiD modelling, sampling" },
        { role:"Qualitative Lead", name:"[Name]", resp:"KII/FGD design, thematic analysis, fieldwork oversight" },
        { role:"Field Coordinator", name:"[Name]", resp:"Enumerator training, logistics, data quality" },
        { role:"M&E Specialist", name:"[Name]", resp:"HMIS integration, indicator validation" }
      ];
      return <SlideCanvas {...sharedProps}>
        <h2 className="big">Team & Roles</h2>
        <p className="lede">Core evaluation team and division of responsibilities.</p>
        <div className="etable">
          <div className="erow header" style={{gridTemplateColumns:'220px 220px 1fr'}}>
            <span className="ecell">Role</span><span className="ecell">Name</span><span className="ecell">Responsibilities</span>
          </div>
          {defaults.map((d, i) => <div key={i} className="erow" style={{gridTemplateColumns:'220px 220px 1fr'}}>
            <EditableCell path={`team.${i}.role`} value={d.role} setOverride={deckState.setOverride} getOverride={deckState.getOverride}/>
            <EditableCell path={`team.${i}.name`} value={d.name} setOverride={deckState.setOverride} getOverride={deckState.getOverride}/>
            <EditableCell path={`team.${i}.resp`} value={d.resp} setOverride={deckState.setOverride} getOverride={deckState.getOverride} multiline/>
          </div>)}
        </div>
      </SlideCanvas>;
    }
    case "risks": {
      const defaults = [
        { risk:"Security deterioration in target districts", like:"Medium", impact:"High", mit:"Remote enumeration protocol; drop non-accessible districts from sample" },
        { risk:"HMIS data incompleteness at baseline", like:"High", impact:"Medium", mit:"Triangulate with facility audit; sensitivity analysis" },
        { risk:"Enumerator attrition during fieldwork", like:"Medium", impact:"Medium", mit:"Oversample + rolling training; daily data quality checks" },
        { risk:"Government counterpart changes mid-evaluation", like:"Low", impact:"Medium", mit:"Documented ToR; quarterly stakeholder briefings" }
      ];
      return <SlideCanvas {...sharedProps}>
        <h2 className="big">Risks & Mitigations</h2>
        <p className="lede">Top risks and planned responses. Adjust before the inception meeting.</p>
        <div className="etable">
          <div className="erow header" style={{gridTemplateColumns:'2fr 90px 90px 3fr'}}>
            <span className="ecell">Risk</span><span className="ecell">Likelihood</span><span className="ecell">Impact</span><span className="ecell">Mitigation</span>
          </div>
          {defaults.map((d, i) => <div key={i} className="erow" style={{gridTemplateColumns:'2fr 90px 90px 3fr'}}>
            <EditableCell path={`risks.${i}.risk`} value={d.risk} setOverride={deckState.setOverride} getOverride={deckState.getOverride} multiline/>
            <EditableCell path={`risks.${i}.like`} value={d.like} setOverride={deckState.setOverride} getOverride={deckState.getOverride}/>
            <EditableCell path={`risks.${i}.impact`} value={d.impact} setOverride={deckState.setOverride} getOverride={deckState.getOverride}/>
            <EditableCell path={`risks.${i}.mit`} value={d.mit} setOverride={deckState.setOverride} getOverride={deckState.getOverride} multiline/>
          </div>)}
        </div>
      </SlideCanvas>;
    }
    case "deliverables": {
      const defaults = [
        { name:"Inception Report", due:"Month 2" },
        { name:"Data Collection Tools (finalised)", due:"Month 3" },
        { name:"Fieldwork Plan & Training Package", due:"Month 4" },
        { name:"Preliminary Findings Note", due:"Month 8" },
        { name:"Draft Evaluation Report", due:"Month 10" },
        { name:"Final Evaluation Report + Dissemination Materials", due:"Month 12" }
      ];
      return <SlideCanvas {...sharedProps}>
        <h2 className="big">Deliverables Schedule</h2>
        <p className="lede">Key outputs and target delivery dates.</p>
        <div className="etable">
          <div className="erow header" style={{gridTemplateColumns:'1fr 140px'}}>
            <span className="ecell">Deliverable</span><span className="ecell">Due</span>
          </div>
          {defaults.map((d, i) => <div key={i} className="erow" style={{gridTemplateColumns:'1fr 140px'}}>
            <EditableCell path={`deliverables.${i}.name`} value={d.name} setOverride={deckState.setOverride} getOverride={deckState.getOverride}/>
            <EditableCell path={`deliverables.${i}.due`} value={d.due} setOverride={deckState.setOverride} getOverride={deckState.getOverride}/>
          </div>)}
        </div>
      </SlideCanvas>;
    }
```

- [ ] **Step 4: Verify in browser**

Inception → slides 12–15.
- Slide 12 Timeline: 4-row × 12-column Gantt, teal cells on default months. Click cells → toggle. Reload → selections persist via localStorage.
- Slide 13 Team: 3-column table (Role, Name, Responsibilities) with editable inputs. Type into Role cell → persists on reload.
- Slide 14 Risks: 4-column table (Risk, Likelihood, Impact, Mitigation) with editable cells.
- Slide 15 Deliverables: 2-column table (Deliverable, Due).

- [ ] **Step 5: Commit**

```bash
git add praxis/tools/deck-generator/index.html
git commit -m "feat(deck-generator): inception editable slides — timeline, team, risks, deliverables"
```

---

## Task 14: Findings renderers — Programme Recap, Methodology Recap, Headline Findings

**Files:**
- Modify: `praxis/tools/deck-generator/index.html`

- [ ] **Step 1: Add findings-specific CSS**

Insert inside the main `<style>` block:

```css
/* ══ SECTION: Findings ══ */
.slide-canvas .body .headline-grid{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:18px; margin-top:10px; flex:1 }
.slide-canvas .body .headline-card{ background:var(--surface); border:1px solid var(--border); border-top:4px solid var(--teal); border-radius:8px; padding:20px; display:flex; flex-direction:column }
.slide-canvas .body .headline-card .hn{ font-family:'JetBrains Mono',monospace; font-weight:800; color:var(--teal-dark); font-size:32px; letter-spacing:-0.03em; margin-bottom:6px }
.slide-canvas .body .headline-card .ht{ font-size:15px; font-weight:700; color:var(--navy); margin-bottom:8px; line-height:1.25 }
.slide-canvas .body .headline-card textarea.hbody, .slide-canvas .body .headline-card .hbody{ font-size:13px; color:var(--text-muted); line-height:1.5; flex:1 }
.slide-canvas .body .sample-compare{ display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:12px }
.slide-canvas .body .sample-compare .sc-card{ background:var(--surface); border:1px solid var(--border); border-radius:6px; padding:14px 16px }
.slide-canvas .body .sample-compare .sc-card.planned{ border-left:3px solid var(--slate-light) }
.slide-canvas .body .sample-compare .sc-card.achieved{ border-left:3px solid var(--teal) }
.slide-canvas .body .sc-card .k{ font-size:10px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:var(--slate); margin-bottom:4px }
.slide-canvas .body .sc-card .v{ font-size:26px; font-weight:800; color:var(--navy); font-family:'JetBrains Mono',monospace }
.slide-canvas .body .sc-card .sv{ font-size:12px; color:var(--text-muted); margin-top:2px }
```

- [ ] **Step 2: Add three cases to `renderSlide`**

Insert before `default:`:

```javascript
    case "programme-recap": {
      // Compact single-slide recap for findings deck
      const m = ctx.project_meta || {};
      return <SlideCanvas {...sharedProps}>
        <h2 className="big">{safe(m.programme_name, "Programme")}</h2>
        <p className="lede">{safe(m.organisation, "")} · {safe(m.country, "")} — {fmt(m.operating_context)} context, {fmt(m.timeline)} duration, budget {fmt(m.budget)}.</p>
        <div className="param-grid cols-4" style={{marginTop:'auto'}}>
          <div className="param"><div className="k">Sectors</div><div className="v">{(m.health_areas||[]).map(fmt).join(', ') || safe(m.sector)}</div></div>
          <div className="param"><div className="k">Target</div><div className="v" style={{fontSize:13}}>{safe(ctx.tor_constraints?.target_population, "Not specified")}</div></div>
          <div className="param"><div className="k">EQs</div><div className="v">{(ctx.evaluation_matrix?.rows || []).length} questions</div></div>
          <div className="param"><div className="k">ToC depth</div><div className="v">{new Set((ctx.toc?.nodes || []).map(n => n.level)).size} levels</div></div>
        </div>
      </SlideCanvas>;
    }
    case "methodology-recap": {
      const dr = ctx.design_recommendation || {};
      const top = dr.ranked_designs?.[0] || (dr.selected_design ? { id: dr.selected_design } : null);
      const quant = ctx.sample_parameters?.result?.primary;
      const qualTotal = (ctx.sample_parameters?.qualitative_plan?.breakdown || []).reduce((s,b) => s + (b.count||0), 0);
      return <SlideCanvas {...sharedProps}>
        <h2 className="big">Methodology Recap</h2>
        <p className="lede">Design used: <strong>{top ? safe(top.name, fmt(top.id)) : "Not specified"}</strong>. Sample achieved vs planned.</p>
        <div className="sample-compare">
          <div className="sc-card planned">
            <div className="k">Quant — planned</div>
            <div className="v">{quant != null ? quant.toLocaleString() : "—"}</div>
            <div className="sv">{ctx.sample_parameters?.result?.label || ""}</div>
          </div>
          <div className="sc-card achieved">
            <div className="k">Quant — achieved</div>
            <div className="v">
              <EditableCell path="findings.sample.quant_achieved" value={quant != null ? String(quant) : "—"} setOverride={deckState.setOverride} getOverride={deckState.getOverride} style={{fontSize:26,fontWeight:800,fontFamily:'JetBrains Mono',color:'var(--navy)',textAlign:'left'}}/>
            </div>
            <div className="sv">
              <EditableCell path="findings.sample.quant_notes" value="Response rate, attrition notes…" setOverride={deckState.setOverride} getOverride={deckState.getOverride} placeholder="e.g. 92% response rate, 3 districts under-sampled"/>
            </div>
          </div>
          <div className="sc-card planned">
            <div className="k">Qual — planned</div>
            <div className="v">{qualTotal}</div>
            <div className="sv">{(ctx.sample_parameters?.qualitative_plan?.breakdown || []).length} methods</div>
          </div>
          <div className="sc-card achieved">
            <div className="k">Qual — achieved</div>
            <div className="v">
              <EditableCell path="findings.sample.qual_achieved" value={String(qualTotal)} setOverride={deckState.setOverride} getOverride={deckState.getOverride} style={{fontSize:26,fontWeight:800,fontFamily:'JetBrains Mono',color:'var(--navy)',textAlign:'left'}}/>
            </div>
            <div className="sv">
              <EditableCell path="findings.sample.qual_notes" value="Completion vs plan, substitutions…" setOverride={deckState.setOverride} getOverride={deckState.getOverride} placeholder="e.g. all methods completed"/>
            </div>
          </div>
        </div>
      </SlideCanvas>;
    }
    case "headline-findings": {
      const defaults = [
        { title:"Finding 1", body:"Key finding for the headline — 2–3 sentences, lead with the most surprising or policy-relevant result." },
        { title:"Finding 2", body:"Second headline finding — focus on the evaluation's core attribution question." },
        { title:"Finding 3", body:"Third headline finding — often the surprise or null result, or the cross-cutting insight." }
      ];
      return <SlideCanvas {...sharedProps}>
        <h2 className="big">Headline Findings</h2>
        <p className="lede">Three takeaways. If audience remembers nothing else, these are the three.</p>
        <div className="headline-grid">
          {defaults.map((d, i) => <div key={i} className="headline-card">
            <div className="hn">0{i+1}</div>
            <EditableCell path={`headline.${i}.title`} value={d.title} setOverride={deckState.setOverride} getOverride={deckState.getOverride} style={{fontSize:15,fontWeight:700,color:'var(--navy)',marginBottom:8,lineHeight:1.25}}/>
            <EditableCell path={`headline.${i}.body`} value={d.body} setOverride={deckState.setOverride} getOverride={deckState.getOverride} multiline style={{fontSize:13,color:'var(--text-muted)',lineHeight:1.5,flex:1}}/>
          </div>)}
        </div>
      </SlideCanvas>;
    }
```

- [ ] **Step 3: Verify in browser**

Findings template → slides 3, 4, 5.
- Slide 3 Programme Recap: single-slide compact summary with 4 param cards at bottom (Sectors, Target, EQs, ToC depth)
- Slide 4 Methodology Recap: 2×2 grid — Quant planned/achieved, Qual planned/achieved. "Achieved" columns have editable numbers and notes with placeholders.
- Slide 5 Headline Findings: 3 cards with "01/02/03", editable title and body per card. Typing in any field → persists on reload.

- [ ] **Step 4: Commit**

```bash
git add praxis/tools/deck-generator/index.html
git commit -m "feat(deck-generator): findings slides 3-5 — programme recap, methodology recap, headline"
```

---

## Task 15: Findings renderers — Criterion slides, Cross-cutting, Evidence, Recommendations, Lessons

**Files:**
- Modify: `praxis/tools/deck-generator/index.html`

- [ ] **Step 1: Add CSS**

Insert inside the main `<style>` block:

```css
/* ══ SECTION: Criterion findings ══ */
.slide-canvas .body .crit-layout{ display:grid; grid-template-columns:1fr 1fr; gap:24px; flex:1; min-height:0 }
.slide-canvas .body .crit-eq-list{ display:flex; flex-direction:column; gap:8px; padding-top:4px }
.slide-canvas .body .crit-eq{ background:var(--surface); border:1px solid var(--border); border-radius:6px; padding:10px 12px; font-size:12px; line-height:1.45 }
.slide-canvas .body .crit-eq .ceqn{ font-family:'JetBrains Mono',monospace; font-weight:700; color:var(--navy); font-size:11px; margin-right:6px }
.slide-canvas .body .crit-findings-col{ display:flex; flex-direction:column; gap:12px }
.slide-canvas .body .crit-box{ background:var(--surface); border:1px solid var(--border); border-radius:6px; padding:14px }
.slide-canvas .body .crit-box .k{ font-size:10px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:var(--teal-dark); margin-bottom:6px }
```

- [ ] **Step 2: Add cases to `renderSlide`**

Insert before `default:`:

```javascript
    case "finding-criterion": {
      const cr = slide.criterion;
      const rows = (ctx.evaluation_matrix?.rows || []).filter(r => r.criterion === cr);
      return <SlideCanvas {...sharedProps}>
        <p className="lede" style={{marginBottom:12}}>
          <span className={`crit-badge crit-${cr}`} style={{marginRight:8}}>{fmt(cr)}</span>
          {rows.length} question{rows.length === 1 ? '' : 's'} under this criterion.
        </p>
        <div className="crit-layout">
          <div>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--slate)',marginBottom:6}}>Evaluation questions</div>
            <div className="crit-eq-list">
              {rows.map((eq, i) => <div key={eq.id || i} className="crit-eq">
                <span className="ceqn">EQ{eq.number || i+1}</span>{eq.question}
              </div>)}
            </div>
          </div>
          <div className="crit-findings-col">
            <div className="crit-box">
              <div className="k">Key findings</div>
              <EditableCell path={`findings.${cr}.key`} value={"Lead with the most policy-relevant finding. Keep to 3–4 sentences. Cite evidence."} setOverride={deckState.setOverride} getOverride={deckState.getOverride} multiline style={{minHeight:90,fontSize:13,lineHeight:1.5}}/>
            </div>
            <div className="crit-box">
              <div className="k">Supporting evidence</div>
              <EditableCell path={`findings.${cr}.evidence`} value={"Reference specific data — effect size, quote, observation — that underpins each finding."} setOverride={deckState.setOverride} getOverride={deckState.getOverride} multiline style={{minHeight:70,fontSize:13,lineHeight:1.5}}/>
            </div>
          </div>
        </div>
      </SlideCanvas>;
    }
    case "cross-cutting": {
      return <SlideCanvas {...sharedProps}>
        <h2 className="big">Cross-cutting Findings</h2>
        <p className="lede">Issues that cut across criteria — typically gender, equity, do-no-harm, human rights.</p>
        <div className="param-grid cols-2" style={{alignItems:'stretch',flex:1}}>
          {[
            { k:"Gender & equity", path:"crosscut.gender", def:"How did the programme affect different gender/age/wealth groups? Where was uptake uneven?" },
            { k:"Do no harm", path:"crosscut.dnh", def:"Any unintended negative effects? Any protection concerns surfaced during fieldwork?" },
            { k:"Human rights", path:"crosscut.rights", def:"Impact on access to services for marginalised or displaced populations." },
            { k:"Environmental / climate", path:"crosscut.env", def:"Applicable climate or environmental considerations surfaced during the evaluation." }
          ].map((c, i) => <div key={i} className="param" style={{display:'flex',flexDirection:'column',gap:6}}>
            <div className="k">{c.k}</div>
            <EditableCell path={c.path} value={c.def} setOverride={deckState.setOverride} getOverride={deckState.getOverride} multiline style={{flex:1,minHeight:60,fontSize:13,lineHeight:1.5}}/>
          </div>)}
        </div>
      </SlideCanvas>;
    }
    case "evidence": {
      return <SlideCanvas {...sharedProps}>
        <h2 className="big">Evidence Quality & Limitations</h2>
        <p className="lede">What we know with confidence, and where the evidence is thinner.</p>
        <div className="param-grid cols-2" style={{flex:1,alignItems:'stretch'}}>
          <div className="param" style={{display:'flex',flexDirection:'column'}}>
            <div className="k">Strengths of the evidence base</div>
            <EditableCell path="evidence.strengths" value={"Large quant sample, triangulated with qualitative. HMIS data coverage across full evaluation period. Baseline comparison group robust."} setOverride={deckState.setOverride} getOverride={deckState.getOverride} multiline style={{flex:1,minHeight:90,fontSize:13,lineHeight:1.5}}/>
          </div>
          <div className="param" style={{display:'flex',flexDirection:'column',borderLeftColor:'var(--amber)'}}>
            <div className="k">Limitations</div>
            <EditableCell path="evidence.limits" value={"Security access in 2 districts reduced sample. Recall bias in self-reported service use. No randomisation limits causal claims."} setOverride={deckState.setOverride} getOverride={deckState.getOverride} multiline style={{flex:1,minHeight:90,fontSize:13,lineHeight:1.5}}/>
          </div>
        </div>
      </SlideCanvas>;
    }
    case "recommendations": {
      const defaults = [
        { rec:"Scale EmONC training to remaining 12 districts over next 18 months.", pri:"High", own:"MoH + implementing partners", tl:"Year 1–2 post-eval" },
        { rec:"Strengthen HMIS completeness targets to 90% before next evaluation.", pri:"High", own:"MoH Planning Unit", tl:"Year 1 post-eval" },
        { rec:"Redesign referral incentive structure based on fieldwork findings.", pri:"Medium", own:"Implementing partner", tl:"Year 1 post-eval" },
        { rec:"Commission follow-up study on equity dimensions in 18 months.", pri:"Medium", own:"Donor + MoH", tl:"Year 2 post-eval" }
      ];
      return <SlideCanvas {...sharedProps}>
        <h2 className="big">Recommendations</h2>
        <p className="lede">Prioritised actions with owners and timelines.</p>
        <div className="etable">
          <div className="erow header" style={{gridTemplateColumns:'3fr 80px 1fr 1fr'}}>
            <span className="ecell">Recommendation</span><span className="ecell">Priority</span><span className="ecell">Owner</span><span className="ecell">Timeline</span>
          </div>
          {defaults.map((d, i) => <div key={i} className="erow" style={{gridTemplateColumns:'3fr 80px 1fr 1fr'}}>
            <EditableCell path={`recs.${i}.rec`} value={d.rec} setOverride={deckState.setOverride} getOverride={deckState.getOverride} multiline/>
            <EditableCell path={`recs.${i}.pri`} value={d.pri} setOverride={deckState.setOverride} getOverride={deckState.getOverride}/>
            <EditableCell path={`recs.${i}.own`} value={d.own} setOverride={deckState.setOverride} getOverride={deckState.getOverride}/>
            <EditableCell path={`recs.${i}.tl`} value={d.tl} setOverride={deckState.setOverride} getOverride={deckState.getOverride}/>
          </div>)}
        </div>
      </SlideCanvas>;
    }
    case "lessons": {
      return <SlideCanvas {...sharedProps}>
        <h2 className="big">Lessons & Next Steps</h2>
        <p className="lede">What this evaluation teaches future programmes, and what happens next.</p>
        <div className="param-grid cols-2" style={{flex:1,alignItems:'stretch'}}>
          <div className="param" style={{display:'flex',flexDirection:'column'}}>
            <div className="k">Lessons for future programming</div>
            <EditableCell path="lessons.future" value={"Three transferable lessons — design, implementation, and measurement — that future similar programmes can apply."} setOverride={deckState.setOverride} getOverride={deckState.getOverride} multiline style={{flex:1,minHeight:100,fontSize:13,lineHeight:1.5}}/>
          </div>
          <div className="param" style={{display:'flex',flexDirection:'column'}}>
            <div className="k">Next steps</div>
            <EditableCell path="lessons.next" value={"Validation workshop, dissemination plan (partners, academic outputs), follow-up studies in 18 months."} setOverride={deckState.setOverride} getOverride={deckState.getOverride} multiline style={{flex:1,minHeight:100,fontSize:13,lineHeight:1.5}}/>
          </div>
        </div>
      </SlideCanvas>;
    }
```

- [ ] **Step 3: Verify in browser**

Findings template → slides 6 through 14.
- Slides 6-10: criterion findings. Each shows its criterion badge, the EQs for that criterion in left column, editable "Key findings" and "Supporting evidence" boxes on right. For DEMO_CONTEXT: Relevance (1 EQ), Effectiveness (2 EQs), Efficiency (1 EQ), Impact (1 EQ), Sustainability (1 EQ) — 5 criterion slides.
- Slide 11 Cross-cutting: 4 editable boxes.
- Slide 12 Evidence Quality: 2 editable boxes (Strengths left teal, Limitations right amber).
- Slide 13 Recommendations: 4 editable rows.
- Slide 14 Lessons & Next Steps: 2 editable boxes.

- [ ] **Step 4: Commit**

```bash
git add praxis/tools/deck-generator/index.html
git commit -m "feat(deck-generator): findings slides 6-14 — criterion findings, cross-cutting, evidence, recs, lessons"
```

---

## Task 16: Presenter mode — keyboard nav, fullscreen, hash routing, click-to-advance

**Files:**
- Modify: `praxis/tools/deck-generator/index.html`

- [ ] **Step 1: Add presenter-mode CSS**

Insert inside the main `<style>` block:

```css
/* ══ SECTION: Presenter mode ══ */
body.presenting{ background:#000; overflow:hidden }
.presenter-root{ position:fixed; inset:0; background:#000; z-index:1000; display:flex; align-items:center; justify-content:center }
.presenter-root .stage{ position:relative; display:flex; align-items:center; justify-content:center; width:100vw; height:100vh }
.presenter-root .click-zone{ position:absolute; top:0; bottom:0; width:50%; z-index:2; cursor:pointer }
.presenter-root .click-zone.left{ left:0 }
.presenter-root .click-zone.right{ right:0 }
.presenter-root .hud{ position:fixed; bottom:16px; left:50%; transform:translateX(-50%); display:flex; align-items:center; gap:10px; padding:8px 14px; background:rgba(15,23,42,0.72); backdrop-filter:blur(12px); border-radius:999px; color:#fff; font-size:12px; font-weight:600; letter-spacing:0.04em; opacity:0; transition:opacity 0.2s; z-index:3; pointer-events:none }
.presenter-root:hover .hud{ opacity:1 }
.presenter-root .hud .hkey{ font-family:'JetBrains Mono',monospace; background:rgba(255,255,255,0.12); padding:2px 6px; border-radius:4px; font-size:10px }
.presenter-root .hud .hsep{ opacity:0.35 }
```

- [ ] **Step 2: Add a `Presenter` component just above `App`**

Insert:

```javascript
/* ══ SECTION: Presenter mode ══ */
function Presenter({ slides, context, deckState, programme, onExit, initialIndex, onIndexChange }) {
  const [idx, setIdx] = useState(initialIndex || 0);
  const rootRef = useRef(null);

  const go = useCallback((delta) => {
    setIdx(prev => Math.min(slides.length - 1, Math.max(0, prev + delta)));
  }, [slides.length]);

  useEffect(() => {
    document.body.classList.add('presenting');
    return () => document.body.classList.remove('presenting');
  }, []);

  useEffect(() => {
    onIndexChange?.(idx);
    // URL hash sync
    const template = slides[0]?.template || (slides[0]?.id === 'cover' ? 'deck' : 'deck');
  }, [idx, slides, onIndexChange]);

  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(-1); }
      else if (e.key === 'Home') { setIdx(0); }
      else if (e.key === 'End') { setIdx(slides.length - 1); }
      else if (e.key === 'f') {
        if (!document.fullscreenElement) rootRef.current?.requestFullscreen?.();
        else document.exitFullscreen?.();
      }
      else if (e.key === 'Escape') { onExit?.(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, onExit, slides.length]);

  // Fit 1280x720 to viewport maintaining aspect, letterboxed
  const [scale, setScale] = useState(1);
  useEffect(() => {
    function resize() {
      const sx = window.innerWidth / 1280;
      const sy = window.innerHeight / 720;
      setScale(Math.min(sx, sy));
    }
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const slide = { ...slides[idx], _siblings: slides };
  return <div className="presenter-root" ref={rootRef}>
    <div className="click-zone left" onClick={() => go(-1)}/>
    <div className="click-zone right" onClick={() => go(1)}/>
    <div className="stage">
      <div style={{ width:1280, height:720, transform:`scale(${scale})`, transformOrigin:'center', flexShrink:0 }}>
        {renderSlide(slide, context, deckState, programme)}
      </div>
    </div>
    <div className="hud">
      <span className="hkey">←→</span> Navigate
      <span className="hsep">·</span>
      <span className="hkey">F</span> Fullscreen
      <span className="hsep">·</span>
      <span className="hkey">Esc</span> Exit
      <span className="hsep">·</span>
      <span>{idx + 1} / {slides.length}</span>
    </div>
  </div>;
}
```

- [ ] **Step 3: Wire Presenter into `App` with hash-routing**

In `App`, after `const deckState = useDeckState(programme, template);`, add:

```javascript
  // Hash routing: #/inception/6 or #/findings/4
  const [presenting, setPresenting] = useState(false);
  const [presentIdx, setPresentIdx] = useState(0);

  useEffect(() => {
    function onHash() {
      const m = (window.location.hash || "").match(/^#\/(inception|findings)\/(\d+)$/);
      if (m) {
        setTemplate(m[1]);
        setPresentIdx(Math.max(0, parseInt(m[2],10) - 1));
        setPresenting(true);
      }
    }
    onHash();
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
```

Wire the Present button:

```javascript
      <button className="tbtn primary" onClick={() => setPresenting(true)}>▶ Present</button>
```

And render Presenter before the `</div>` closing `editor-wrap` (or conditionally at the top of the post-picker branch):

```javascript
  if (presenting) {
    const slides = template === 'inception' ? buildInceptionSlides(context, deckState) : buildFindingsSlides(context, deckState);
    return <Presenter
      slides={slides}
      context={context}
      deckState={deckState}
      programme={programme}
      initialIndex={presentIdx}
      onIndexChange={(i) => { window.location.hash = `#/${template}/${i+1}`; }}
      onExit={() => { setPresenting(false); window.location.hash = ''; }}
    />;
  }
```

- [ ] **Step 4: Verify in browser**

Open: `http://localhost:8765/praxis/tools/deck-generator/` → Inception Brief → ▶ Present.
- Full viewport goes black with centered 16:9 slide
- Arrow Right advances slide; Arrow Left goes back
- `Home` → first slide, `End` → last
- Click right half of screen → next; left half → previous
- Press `f` → browser fullscreen toggles
- Press `Esc` → exits presenter, back to editor
- URL bar updates to `#/inception/3` etc. as you advance
- Paste a URL like `http://localhost:8765/praxis/tools/deck-generator/#/inception/5` in a fresh tab → opens directly in presenter on slide 5
- Hover → HUD with navigation hints appears at bottom

- [ ] **Step 5: Commit**

```bash
git add praxis/tools/deck-generator/index.html
git commit -m "feat(deck-generator): presenter mode — keyboard nav, fullscreen, click-to-advance, hash routing"
```

---

## Task 17: Speaker view and overview grid

**Files:**
- Modify: `praxis/tools/deck-generator/index.html`

- [ ] **Step 1: Add speaker view + overview CSS**

Insert inside the main `<style>` block:

```css
/* ══ SECTION: Speaker view ══ */
.speaker-root{ position:fixed; inset:0; background:#0F172A; z-index:1000; color:#fff; display:grid; grid-template-columns:1.2fr 1fr; grid-template-rows:1fr auto; gap:20px; padding:24px }
.speaker-root .sv-main{ display:flex; align-items:center; justify-content:center }
.speaker-root .sv-main-inner{ transform-origin:center }
.speaker-root .sv-side{ display:flex; flex-direction:column; gap:16px; min-width:0 }
.speaker-root .sv-notes{ background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:18px 22px; flex:1; min-height:0; overflow-y:auto }
.speaker-root .sv-notes-title{ font-size:11px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#2EC4B6; margin-bottom:10px }
.speaker-root .sv-notes-body{ font-size:15px; line-height:1.55; color:#E2E8F0 }
.speaker-root .sv-next{ border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:14px 16px; display:flex; flex-direction:column; gap:8px }
.speaker-root .sv-next .nlab{ font-size:10px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#94A3B8 }
.speaker-root .sv-next .ntitle{ font-size:14px; font-weight:600 }
.speaker-root .sv-bottom{ grid-column:1 / -1; display:flex; justify-content:space-between; align-items:center; color:#94A3B8; font-size:12px; font-family:'JetBrains Mono',monospace }
.speaker-root .sv-clock{ font-size:16px; font-weight:700; color:#fff }

/* ══ SECTION: Overview grid ══ */
.overview-root{ position:fixed; inset:0; background:#0F172A; z-index:1000; display:flex; flex-direction:column; padding:28px }
.overview-title{ color:#fff; font-family:'Fraunces',serif; font-size:22px; font-weight:600; margin-bottom:16px }
.overview-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:16px; overflow-y:auto; padding-bottom:20px }
.overview-thumb{ background:#1E293B; border:2px solid transparent; border-radius:8px; overflow:hidden; cursor:pointer; transition:all 0.15s }
.overview-thumb:hover{ border-color:#2EC4B6 }
.overview-thumb.active{ border-color:#2EC4B6 }
.overview-thumb-inner{ width:1280px; height:720px; transform-origin:top left }
.overview-thumb .olabel{ color:#E2E8F0; font-size:11px; padding:8px 12px; background:#0F172A; border-top:1px solid #1E293B }
.overview-thumb .olabel .on{ color:#2EC4B6; font-family:'JetBrains Mono',monospace; font-weight:700; margin-right:6px }
```

- [ ] **Step 2: Add notes state and `SpeakerView` + `Overview` components inside `Presenter`**

Replace the `Presenter` component body with this expanded version:

```javascript
function Presenter({ slides, context, deckState, programme, onExit, initialIndex, onIndexChange }) {
  const [idx, setIdx] = useState(initialIndex || 0);
  const [mode, setMode] = useState('present'); // 'present' | 'speaker' | 'overview'
  const [clock, setClock] = useState(() => new Date());
  const rootRef = useRef(null);

  const go = useCallback((delta) => {
    setIdx(prev => Math.min(slides.length - 1, Math.max(0, prev + delta)));
  }, [slides.length]);

  useEffect(() => {
    document.body.classList.add('presenting');
    return () => document.body.classList.remove('presenting');
  }, []);

  useEffect(() => { onIndexChange?.(idx); }, [idx, onIndexChange]);

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(-1); }
      else if (e.key === 'Home') { setIdx(0); }
      else if (e.key === 'End') { setIdx(slides.length - 1); }
      else if (e.key === 'f') {
        if (!document.fullscreenElement) rootRef.current?.requestFullscreen?.();
        else document.exitFullscreen?.();
      }
      else if (e.key === 's') { setMode(m => m === 'speaker' ? 'present' : 'speaker'); }
      else if (e.key === 'o') { setMode(m => m === 'overview' ? 'present' : 'overview'); }
      else if (e.key === 'Escape') {
        if (mode !== 'present') setMode('present');
        else onExit?.();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, onExit, slides.length, mode]);

  const [scale, setScale] = useState(1);
  useEffect(() => {
    function resize() {
      setScale(Math.min(window.innerWidth / 1280, window.innerHeight / 720));
    }
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const slide = { ...slides[idx], _siblings: slides };
  const nextSlide = idx < slides.length - 1 ? { ...slides[idx+1], _siblings: slides } : null;
  const notesPath = `notes.${template_id(slides)}.${slide.id}`;
  const notes = deckState.getOverride(notesPath, "");

  if (mode === 'overview') {
    return <div className="overview-root">
      <div className="overview-title">Overview · {slides.length} slides · Click any to jump · Esc to return</div>
      <div className="overview-grid">
        {slides.map((s, i) => {
          const thumbScale = 0.2;
          return <div key={s.id} className={`overview-thumb ${i === idx ? 'active' : ''}`} onClick={() => { setIdx(i); setMode('present'); }}>
            <div style={{width:1280*thumbScale,height:720*thumbScale,overflow:'hidden'}}>
              <div className="overview-thumb-inner" style={{transform:`scale(${thumbScale})`}}>
                {renderSlide({ ...s, _siblings: slides }, context, deckState, programme)}
              </div>
            </div>
            <div className="olabel"><span className="on">{String(s.num).padStart(2,'0')}</span>{s.title}</div>
          </div>;
        })}
      </div>
    </div>;
  }

  if (mode === 'speaker') {
    const mainScale = Math.min((window.innerWidth * 0.55) / 1280, (window.innerHeight * 0.8) / 720);
    const nextScale = 0.15;
    return <div className="speaker-root">
      <div className="sv-main">
        <div className="sv-main-inner" style={{ width:1280, height:720, transform:`scale(${mainScale})` }}>
          {renderSlide(slide, context, deckState, programme)}
        </div>
      </div>
      <div className="sv-side">
        <div className="sv-next">
          <span className="nlab">Up next</span>
          {nextSlide ? <>
            <span className="ntitle">{nextSlide.title}</span>
            <div style={{width:1280*nextScale,height:720*nextScale,overflow:'hidden',borderRadius:4}}>
              <div style={{width:1280,height:720,transformOrigin:'top left',transform:`scale(${nextScale})`}}>
                {renderSlide(nextSlide, context, deckState, programme)}
              </div>
            </div>
          </> : <span className="ntitle" style={{color:'#94A3B8'}}>End of deck</span>}
        </div>
        <div className="sv-notes">
          <div className="sv-notes-title">Speaker notes · slide {idx+1}</div>
          <textarea value={notes} onChange={(e) => deckState.setOverride(notesPath, e.target.value || null)} placeholder="Talking points, reminders, timings…" style={{width:'100%',minHeight:200,background:'transparent',border:'none',color:'#E2E8F0',font:'inherit',resize:'vertical',lineHeight:1.55}}/>
        </div>
      </div>
      <div className="sv-bottom">
        <span>{slide.title} · {idx+1} / {slides.length}</span>
        <span className="sv-clock">{clock.toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit', second:'2-digit'})}</span>
      </div>
    </div>;
  }

  // present mode (default)
  return <div className="presenter-root" ref={rootRef}>
    <div className="click-zone left" onClick={() => go(-1)}/>
    <div className="click-zone right" onClick={() => go(1)}/>
    <div className="stage">
      <div style={{ width:1280, height:720, transform:`scale(${scale})`, transformOrigin:'center', flexShrink:0 }}>
        {renderSlide(slide, context, deckState, programme)}
      </div>
    </div>
    <div className="hud">
      <span className="hkey">←→</span> Nav
      <span className="hsep">·</span>
      <span className="hkey">F</span> Full
      <span className="hsep">·</span>
      <span className="hkey">S</span> Speaker
      <span className="hsep">·</span>
      <span className="hkey">O</span> Overview
      <span className="hsep">·</span>
      <span className="hkey">Esc</span> Exit
      <span className="hsep">·</span>
      <span>{idx + 1} / {slides.length}</span>
    </div>
  </div>;
}

function template_id(slides) {
  // derive template id from the first slide's type for namespacing notes
  return slides[0]?.type === 'cover-findings' ? 'findings' : 'inception';
}
```

- [ ] **Step 3: Verify in browser**

Inception Brief → ▶ Present:
- Press `s` → speaker view: main slide on left (scaled), right column has "Up next" card with next slide thumbnail and speaker notes textarea. Type notes — persist on exit and return.
- Bottom of speaker view: slide title + position (left) and live clock ticking (right)
- Press `s` again → back to present mode
- Press `o` → overview grid with 16 thumbnails. Click any → jumps to that slide + returns to present mode
- Press `Esc` in overview → returns to present mode (not exits)
- Press `Esc` in present → exits to editor

- [ ] **Step 4: Commit**

```bash
git add praxis/tools/deck-generator/index.html
git commit -m "feat(deck-generator): speaker view with notes and clock, overview grid jumper"
```

---

## Task 18: Print stylesheet for PDF export

**Files:**
- Modify: `praxis/tools/deck-generator/index.html`

- [ ] **Step 1: Add `@media print` stylesheet**

Insert inside the main `<style>` block:

```css
/* ══ SECTION: Print stylesheet (PDF export) ══ */
@media print {
  @page { size: A4 landscape; margin: 0 }
  body { background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact }
  .topbar, .editor-toolbar, .picker-wrap, .slide-meta, .hud, .presenter-root .click-zone { display: none !important }
  .editor-wrap { max-width: none; padding: 0; margin: 0 }
  .slide-wrap { margin: 0; break-inside: avoid; page-break-inside: avoid; page-break-after: always }
  .slide-wrap:last-child { page-break-after: auto }
  .slide-scale { margin: 0; padding: 0 }
  .slide-scale-inner { transform: none !important; width: 100%; height: auto; margin-bottom: 0 !important }
  .slide-canvas { width: 100%; height: auto; aspect-ratio: 16 / 9; border-radius: 0; box-shadow: none; page-break-inside: avoid }
  /* Force color preservation */
  .slide-canvas, .slide-canvas *, .header-bar, .section-divider { -webkit-print-color-adjust: exact; print-color-adjust: exact }
  .presenter-root { position: static; background: transparent }
  .presenter-root .hud { display: none }
  .editable[contenteditable], input.ecell, textarea.ecell { border: none !important; background: transparent !important }
}
```

- [ ] **Step 2: Add a "print-ready" render path — when user hits Ctrl+P from editor mode, all slides need to be visible**

The editor already renders every slide as a scaled card, so print is mostly CSS work. But when `presenting`, we render a single slide. Update `App` so Ctrl+P from presenter flashes back to editor briefly? Simpler: disable Ctrl+P default in presenter and route the print through editor mode:

Add to Presenter's onKey handler, above the other cases:

```javascript
      if ((e.key === 'p' || e.key === 'P') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onExit?.();
        // small delay so editor remounts before print
        setTimeout(() => window.print(), 100);
        return;
      }
```

- [ ] **Step 3: Verify in browser**

Open: `http://localhost:8765/praxis/tools/deck-generator/` → Inception Brief → Press `Ctrl+P` (or click the PDF button).
Expected print preview (Chrome):
- 16 pages, one slide per page, A4 landscape
- Navy header bars preserve their colour
- Teal accents on param cards preserve
- No top-bar chrome, no toolbar, no slide numbering labels — just the slides themselves
- Footers intact ("Maternal Health Quality Improvement Programme" · "NN / 16")

Test the presenter mode Ctrl+P: from presenter mode, Ctrl+P exits presenter and prints full deck (not just current slide).

Confirm in Firefox and Safari if available. Otherwise document in risks.

- [ ] **Step 4: Commit**

```bash
git add praxis/tools/deck-generator/index.html
git commit -m "feat(deck-generator): print stylesheet — A4 landscape, one slide per page, color-exact"
```

---

## Task 19: JSON import/export

**Files:**
- Modify: `praxis/tools/deck-generator/index.html`

- [ ] **Step 1: Add import/export helpers**

Insert near the storage helpers:

```javascript
/* ══ SECTION: JSON import/export ══ */
function slugify(s) {
  return String(s || "deck").toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40);
}

function exportDeckJSON(template, programme, context, overrides) {
  const payload = {
    praxis_version: "deck-generator-1.0",
    exported_at: new Date().toISOString(),
    template,
    programme,
    organisation: context.project_meta?.organisation || "",
    overrides
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slugify(programme)}-${template}-${new Date().toISOString().slice(0,10)}.deck.json`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importDeckJSON(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      try {
        const parsed = JSON.parse(fr.result);
        if (!parsed.template || !parsed.overrides) throw new Error("Missing template or overrides in JSON");
        resolve(parsed);
      } catch (e) { reject(e); }
    };
    fr.onerror = () => reject(new Error("Read failed"));
    fr.readAsText(file);
  });
}
```

- [ ] **Step 2: Add import/export buttons to the toolbar and file input handling**

In `App`, replace the `editor-toolbar` block with:

```javascript
    <div className="editor-toolbar">
      <button className="tbtn" onClick={() => setTemplate(null)}>← Change template</button>
      <div className="tsep"/>
      <span className="tcount">{template === 'inception' ? 'Inception Brief' : 'Findings Brief'}</span>
      <div className="tspacer"/>
      {deckState.hasOverrides && <button className="tbtn" onClick={deckState.resetAll} title="Discard all inline edits">↺ Reset edits</button>}
      <button className="tbtn" onClick={() => exportDeckJSON(template, programme, context, deckState.overrides)} title="Download the editable deck state">⇣ Export JSON</button>
      <label className="tbtn" style={{cursor:'pointer'}} title="Load a previously exported deck state">
        ⇡ Import JSON
        <input type="file" accept=".json,.deck.json,application/json" style={{display:'none'}} onChange={async (e) => {
          const f = e.target.files?.[0]; if (!f) return;
          try {
            const parsed = await importDeckJSON(f);
            if (parsed.template && parsed.template !== template) {
              if (!confirm(`This JSON is for "${parsed.template}" — switch template and load?`)) return;
              setTemplate(parsed.template);
            }
            deckState.resetAll();
            // Replace overrides
            Object.entries(parsed.overrides).forEach(([k,v]) => deckState.setOverride(k, v));
          } catch (err) { alert("Import failed: " + err.message); }
          finally { e.target.value = ""; }
        }}/>
      </label>
      <button className="tbtn" onClick={() => window.print()}>⎙ PDF</button>
      <button className="tbtn primary" onClick={() => setPresenting(true)}>▶ Present</button>
    </div>
```

- [ ] **Step 3: Verify in browser**

- Inception Brief → edit slide 13 Team (change role names) → click "⇣ Export JSON"
- File downloads: `maternal-health-quality-improvement-programme-inception-2026-04-20.deck.json`
- Open the file — it should be valid JSON with `template: "inception"`, programme name, overrides object containing your edits
- Reload the tool → overrides persist from localStorage
- Click "↺ Reset edits" → overrides clear
- Click "⇡ Import JSON" → select the file → overrides reload

- [ ] **Step 4: Commit**

```bash
git add praxis/tools/deck-generator/index.html
git commit -m "feat(deck-generator): JSON import/export for deck portability"
```

---

## Task 20: Agenda refinement + Station 8 link verification + final polish

**Files:**
- Modify: `praxis/tools/deck-generator/index.html`
- Verify: `praxis/workbench/js/stations/station8/Station8.js:506`

- [ ] **Step 1: Verify the Station 8 "Open Deck Tool" integration works end-to-end**

The URL already in Station8.js is `window.open('/praxis/tools/deck-generator/', '_blank')`. No change needed — the tool now exists at that path.

Open: `http://localhost:8765/praxis/workbench/`
- Navigate to Station 8 (Deck Generator station)
- Click "Open Deck Tool ↗"
- Expected: new tab opens on `/praxis/tools/deck-generator/` with the actual workbench context (not demo banner).
- If banner shows, sessionStorage context isn't being set — debug Station8.js handleOpenDeckTool.

- [ ] **Step 2: Add a keyboard-shortcuts modal toggled by `?`**

Editor and presenter each have their own keyboard bindings; users need a single reference. Add a `?` shortcut in editor mode that reveals a modal listing all bindings.

Insert inside `App`, after existing `useEffect`s:

```javascript
  const [showShortcuts, setShowShortcuts] = useState(false);
  useEffect(() => {
    function onKey(e) {
      if (e.key === '?' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        setShowShortcuts(s => !s);
      } else if (e.key === 'p' && (e.ctrlKey || e.metaKey)) {
        // Let browser print default run
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
```

Render a small modal when `showShortcuts` is true. Add minimal CSS:

```css
.shortcuts-modal{ position:fixed; inset:0; background:rgba(15,23,42,0.5); z-index:200; display:flex; align-items:center; justify-content:center }
.shortcuts-modal .smbody{ background:var(--surface); border-radius:12px; padding:24px 28px; max-width:420px; width:92%; box-shadow:var(--shadow-lg) }
.shortcuts-modal h3{ font-family:'Fraunces',serif; font-size:20px; color:var(--navy); margin-bottom:16px }
.shortcuts-modal .shrow{ display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--border); font-size:13px }
.shortcuts-modal .shrow:last-child{ border-bottom:none }
.shortcuts-modal kbd{ display:inline-block; padding:2px 8px; border-radius:4px; background:var(--bg); border:1px solid var(--border); font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:600 }
```

And render before the top of the editor wrap:

```javascript
  {showShortcuts && <div className="shortcuts-modal" onClick={() => setShowShortcuts(false)}>
    <div className="smbody" onClick={(e) => e.stopPropagation()}>
      <h3>Keyboard shortcuts</h3>
      <div className="shrow"><span>Present</span><kbd>P</kbd></div>
      <div className="shrow"><span>Navigate slides</span><kbd>←</kbd> <kbd>→</kbd></div>
      <div className="shrow"><span>Fullscreen</span><kbd>F</kbd></div>
      <div className="shrow"><span>Speaker view</span><kbd>S</kbd></div>
      <div className="shrow"><span>Overview grid</span><kbd>O</kbd></div>
      <div className="shrow"><span>Export PDF</span><kbd>Ctrl</kbd>+<kbd>P</kbd></div>
      <div className="shrow"><span>Exit / close</span><kbd>Esc</kbd></div>
      <div className="shrow"><span>Show this</span><kbd>?</kbd></div>
    </div>
  </div>}
```

- [ ] **Step 3: Verify & polish pass**

Run through all 10 acceptance criteria from the spec:

1. ☐ Fresh browser, go to `/praxis/tools/deck-generator/` — demo deck renders with dismissable banner, no console errors
2. ☐ Workbench Station 8 → Open Deck Tool ↗ → opens with workbench context, no 404, no demo banner
3. ☐ Inception template renders all 16 slides; Findings renders 10 fixed + criterion count (DEMO_CONTEXT = 5, so 15 total)
4. ☐ Slide 5 (ToC) shows SVG tree with 4 levels; Slide 8 (Sampling) shows SVG bars; Slide 11 (Evaluability) shows SVG radar
5. ☐ Presenter mode: arrows advance, `f` fullscreens (Chrome/Firefox/Safari), `s` speaker view shows notes + next-slide + clock
6. ☐ `Ctrl+P` from editor → print preview with one slide per A4 landscape page, navy headers preserved
7. ☐ Edits to Timeline/Team/Risks/Deliverables/Findings/Recommendations persist across refresh
8. ☐ Export JSON downloads valid `.deck.json`; Import JSON restores state
9. ☐ Tool works fully offline after first load (test: open in browser, go offline in DevTools, hard-refresh)
10. ☐ Lighthouse a11y ≥ 90 (via Chrome DevTools Lighthouse run, mobile or desktop); keyboard-only nav: `Tab` reaches all editor controls

Fix any failures that surface. Items 9 and 10 may require tweaks — update this plan's final commit to document any workarounds (e.g. sw-cache strategy if offline fails because of unpkg CDN).

- [ ] **Step 4: Commit**

```bash
git add praxis/tools/deck-generator/index.html
git commit -m "feat(deck-generator): keyboard-shortcut modal + final polish pass"
```

- [ ] **Step 5: Push (user approval required per memory preferences)**

Ask the user: *"All 20 tasks complete. 10 acceptance criteria verified on the local server. OK to push to origin/main for GitHub Pages deployment?"*

If yes:

```bash
git push origin HEAD
```

Then verify deployment:

```bash
sleep 60
curl -sI https://www.emmanuelneneodjidja.org/praxis/tools/deck-generator/ | head -5
```

Expected: `HTTP/1.1 200 OK`

Visit `https://www.emmanuelneneodjidja.org/praxis/tools/deck-generator/` in a private window → verify demo deck loads, banner shows, all core functions work.
