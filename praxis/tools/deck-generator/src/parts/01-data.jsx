/* PRAXIS Deck Generator v2. Source of truth: src/parts/*.jsx, compiled by src/build.js
   into index.html. Do not edit the compiled bundle in index.html by hand. */
const { useState, useEffect, useCallback, useMemo, useRef, useContext, createContext } = React;

/* ================= Icons (inline SVG only; no unicode glyph buttons) ================= */
function Svg({ size = 14, children, ...rest }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>{children}</svg>;
}
const Icon = {
  arrowRight: (s) => <Svg size={s}><line x1="4" y1="12" x2="20" y2="12"/><polyline points="13 5 20 12 13 19"/></Svg>,
  swap: (s) => <Svg size={s}><polyline points="17 3 21 7 17 11"/><line x1="21" y1="7" x2="7" y2="7"/><polyline points="7 21 3 17 7 13"/><line x1="3" y1="17" x2="17" y2="17"/></Svg>,
  reset: (s) => <Svg size={s}><path d="M3 12a9 9 0 1 0 3-6.7"/><polyline points="3 4 3 9 8 9"/></Svg>,
  download: (s) => <Svg size={s}><path d="M12 3v12"/><polyline points="6 11 12 17 18 11"/><path d="M4 21h16"/></Svg>,
  upload: (s) => <Svg size={s}><path d="M12 17V5"/><polyline points="6 9 12 3 18 9"/><path d="M4 21h16"/></Svg>,
  print: (s) => <Svg size={s}><polyline points="6 9 6 3 18 3 18 9"/><rect x="3" y="9" width="18" height="8" rx="1"/><rect x="6" y="14" width="12" height="7"/></Svg>,
  play: (s) => <Svg size={s}><polygon points="6 4 20 12 6 20" fill="currentColor" stroke="none"/></Svg>,
  question: (s) => <Svg size={s}><circle cx="12" cy="12" r="9"/><path d="M9.2 9a3 3 0 0 1 5.8 1c0 2-3 2.4-3 4"/><line x1="12" y1="17.5" x2="12" y2="17.6"/></Svg>,
  close: (s) => <Svg size={s}><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></Svg>,
  plus: (s) => <Svg size={s}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Svg>,
};

/* ================= Sample programme (worked example) ================= */
const DEMO_CONTEXT = {
  project_meta: {
    organisation: "Ministry of Public Health, Niger",
    programme_name: "Maternal Health Quality Improvement Programme",
    country: "Niger",
    health_areas: ["maternal_health", "child_health"],
    operating_context: "fragile_humanitarian",
    budget: "usd_5m_to_20m",
    programme_maturity: "early_implementation",
    timeline: "36_months",
    sector: "health"
  },
  tor_constraints: {
    evaluation_purpose: ["accountability", "learning"],
    causal_inference_level: "attribution",
    geographic_scope: "14 health districts across Tillabéri and Maradi regions",
    target_population: "Pregnant women and newborns (about 180,000 annually)",
    comparison_feasibility: "matched_comparison"
  },
  toc: {
    nodes: [
      { id: "i1", level: "impact", title: "Reduced maternal and neonatal mortality" },
      { id: "o1", level: "outcome", title: "Improved quality of antenatal care" },
      { id: "o2", level: "outcome", title: "Increased facility-based deliveries" },
      { id: "o3", level: "outcome", title: "Strengthened referral systems" },
      { id: "op1", level: "output", title: "Providers trained in EmONC" },
      { id: "op2", level: "output", title: "Facilities equipped with WHO minimum package" },
      { id: "op3", level: "output", title: "Community health workers deployed" },
      { id: "op4", level: "output", title: "Referral protocols revised and adopted" },
      { id: "a1", level: "activity", title: "EmONC training curriculum delivered" },
      { id: "a2", level: "activity", title: "Equipment procurement and distribution" },
      { id: "a3", level: "activity", title: "Community sensitisation campaigns" },
      { id: "a4", level: "activity", title: "Referral network mapping" }
    ]
  },
  evaluation_matrix: {
    rows: [
      { id: "eq1", number: 1, criterion: "relevance", question: "To what extent does the programme respond to the priorities of pregnant women, newborns, and health providers in Niger?", dataSources: ["household_survey", "kii_providers"] },
      { id: "eq2", number: 2, criterion: "effectiveness", question: "What changes in antenatal care coverage and quality can be attributed to the programme?", dataSources: ["hmis", "facility_audit"] },
      { id: "eq3", number: 3, criterion: "effectiveness", question: "Has the programme strengthened the functioning of referral systems between health centres and district hospitals?", dataSources: ["facility_audit", "kii_providers"] },
      { id: "eq4", number: 4, criterion: "impact", question: "What is the effect of the programme on maternal and neonatal mortality at the district level?", dataSources: ["hmis", "household_survey"] },
      { id: "eq5", number: 5, criterion: "sustainability", question: "To what extent are the capacity gains and equipment practices likely to be maintained after programme closure?", dataSources: ["kii_providers", "document_review"] },
      { id: "eq6", number: 6, criterion: "efficiency", question: "Are the programme's results commensurate with the resources invested, and how do costs compare with alternative approaches?", dataSources: ["document_review"] }
    ]
  },
  design_recommendation: {
    selected_design: "did_matched",
    ranked_designs: [
      { id: "did_matched", name: "Difference-in-Differences with Matched Controls", family: "Quasi-experimental", score: 87.2 }
    ],
    justification: "Staggered district rollout creates natural variation in treatment timing. Propensity-score matching on baseline HMIS indicators yields a credible comparison group. The design is feasible under the stated budget and satisfies the attribution requirement in the ToR.",
    answers: { comparison: "matched_districts" }
  },
  sample_parameters: {
    design_id: "did_matched",
    result: { primary: 1842, label: "DiD with matched districts. Alpha 0.05, power 0.80, MDE 5 pp." },
    qualitative_plan: {
      breakdown: [
        { method: "Key informant interviews (providers)", count: 32 },
        { method: "Focus groups (pregnant women)", count: 12 },
        { method: "Focus groups (community health workers)", count: 8 },
        { method: "Observation (facility audits)", count: 28 }
      ]
    }
  },
  instruments: {
    items: [
      { id: "i1", title: "Household Survey", type: "quantitative", questions: new Array(64).fill(null) },
      { id: "i2", title: "Facility Audit Checklist", type: "observation", questions: new Array(48).fill(null) },
      { id: "i3", title: "Provider KII Guide", type: "qualitative", questions: new Array(22).fill(null) },
      { id: "i4", title: "Pregnant Women FGD Guide", type: "qualitative", questions: new Array(18).fill(null) },
      { id: "i5", title: "HMIS Data Extraction Template", type: "administrative", questions: new Array(34).fill(null) }
    ]
  },
  analysis_plan: {
    rows: [
      { eq_label: "EQ1", method: "Thematic analysis and descriptive statistics", software: "NVivo + R" },
      { eq_label: "EQ2", method: "DiD regression with district fixed effects", software: "R / Stata" },
      { eq_label: "EQ3", method: "Mixed-methods triangulation", software: "NVivo + R" },
      { eq_label: "EQ4", method: "DiD with matching sensitivity analysis", software: "R" },
      { eq_label: "EQ5", method: "Framework analysis", software: "NVivo" },
      { eq_label: "EQ6", method: "Cost-effectiveness (cost per DALY averted)", software: "Excel + R" }
    ]
  },
  evaluability: {
    score: 74,
    dimensions: [
      { id: "d1", label: "Programme logic", system_score: 17, max: 20 },
      { id: "d2", label: "Data availability", system_score: 12, max: 20 },
      { id: "d3", label: "Stakeholder engagement", system_score: 16, max: 20 },
      { id: "d4", label: "Utility of findings", system_score: 15, max: 20 },
      { id: "d5", label: "Ethics and protection", system_score: 14, max: 20 }
    ],
    blockers: [
      "Baseline HMIS completeness below 80 percent in 3 of 14 districts",
      "Security access restrictions in Tillabéri require a mitigation plan"
    ]
  }
};

/* Worked-example findings. Joined to the sample programme only; a real Workbench
   handoff never gets invented results. All figures are internally consistent:
   quant 1,714 of 1,842 planned (93.1 percent); qual 76 of 80 (95 percent);
   every interval below contains its point estimate. */
const DEMO_FINDINGS = {
  headline: [
    {
      title: "Facility deliveries rose 11.4 points against matched controls.",
      body: "The difference-in-differences estimate is +11.4 percentage points (95 percent CI 6.2 to 16.6) for facility-based deliveries across the 14 programme districts, relative to matched comparison districts. ANC4+ coverage moved in parallel (+9.1 pp).",
      strength: "strong"
    },
    {
      title: "Quality of care improved. Referral speed did not.",
      body: "Completion of emergency referrals rose from 38 to 47 percent, and audited EmONC readiness improved in 21 of 26 facilities. But the median facility-to-hospital transfer time is unchanged at 3.1 hours. The protocol was adopted; the transport bottleneck remains.",
      strength: "moderate"
    },
    {
      title: "Gains are uneven. Tillabéri lags on every indicator.",
      body: "Improvements concentrate in Maradi and in accessible districts. The three security-constrained districts of Tillabéri show flat coverage trends and account for most of the shortfall against programme targets.",
      strength: "moderate"
    }
  ],
  effects: [
    { label: "Facility-based deliveries", eq: "EQ2", est: 11.4, lo: 6.2, hi: 16.6, unit: "pp" },
    { label: "ANC4+ coverage", eq: "EQ2", est: 9.1, lo: 3.8, hi: 14.4, unit: "pp" },
    { label: "Institutional maternal mortality", eq: "EQ4", est: -12.0, lo: -25.0, hi: 2.0, unit: "%" }
  ],
  sample_achieved: {
    quant: 1714,
    quant_note: "93.1 percent of the planned 1,842 households. Attrition concentrated in two Tillabéri districts.",
    qual: 76,
    qual_note: "76 of 80 planned sessions completed. Four FGDs replaced by remote interviews for access reasons."
  },
  ratings: { relevance: 4, effectiveness: 4, efficiency: 3, impact: 3, sustainability: 2 },
  criteria: {
    relevance: {
      takeaway: "The programme answers the priorities women and providers actually name.",
      key: "Ninety-two percent of surveyed women cite distance, cost, and disrespectful care as the main barriers to facility delivery; all three are addressed by programme components. Providers rank equipment gaps and EmONC skills as their top constraints, matching the two largest budget lines.",
      evidence: "Household survey (n = 1,714), provider KIIs (n = 32), triangulated with the 2024 national RMNCAH strategy priorities.",
      strength: "strong"
    },
    effectiveness: {
      takeaway: "Coverage gains are attributable, but the referral chain is only half fixed.",
      key: "Facility-based deliveries rose 11.4 pp and ANC4+ coverage 9.1 pp against matched comparison districts, both robust to matching sensitivity checks. Referral completion improved from 38 to 47 percent, yet median transfer time is stuck at 3.1 hours because transport, not protocol, is the binding constraint.",
      evidence: "DiD estimates on HMIS panel (28 districts, 36 months), facility audits (n = 28), provider KIIs. Both coverage intervals exclude zero.",
      strength: "strong"
    },
    efficiency: {
      takeaway: "Unit costs are within benchmark range, with training the outlier.",
      key: "Cost per additional facility delivery is USD 216, inside the USD 180 to 240 range of comparable Sahel programmes. Per-trainee EmONC costs ran 34 percent above plan, driven by security-related logistics; equipment and CHW lines delivered under budget.",
      evidence: "Financial records against outputs, benchmarked to three comparator programmes via document review.",
      strength: "moderate"
    },
    impact: {
      takeaway: "Mortality is moving in the right direction; attribution is not yet proven.",
      key: "Institutional maternal mortality fell about 12 percent in programme districts, but the DiD interval ( -25 to +2 percent) crosses zero. The evaluation window is short for mortality endpoints; the coverage and quality gains that drive them are firmly established.",
      evidence: "HMIS mortality series, DiD with matching. Underpowered for rare outcomes at 36 months, as flagged at inception.",
      strength: "moderate"
    },
    sustainability: {
      takeaway: "Skills will likely persist. Financing and supply chains will not, absent action.",
      key: "Trained providers remain in post (91 percent retention) and district trainers are certified. But 70 percent of consumable financing is programme-funded with no ministry line item from 2027, and equipment maintenance contracts lapse at closure.",
      evidence: "Provider KIIs, district budget review, equipment audit. Consistent signals across all three sources.",
      strength: "moderate"
    },
    coherence: {
      takeaway: "The programme aligns with national strategy and partner portfolios.",
      key: "Components map onto the national RMNCAH strategy without duplicating partner investments; coordination with the two other maternal-health funders is documented in joint district plans.",
      evidence: "Document review and partner KIIs.",
      strength: "moderate"
    }
  },
  crosscut: {
    gender: "Facility-delivery gains hold across wealth quintiles in Maradi but are 2.4 times larger for the top two quintiles in Tillabéri, where transport costs bind hardest. Adolescent mothers remain the least reached group.",
    dnh: "No protection incidents were linked to programme activities. Fieldwork surfaced pressure on CHWs operating across conflict lines; the programme adjusted movement protocols in month 19.",
    rights: "Displaced women use programme facilities at two-thirds the rate of host communities. Fee exemptions exist on paper but are inconsistently applied at four audited facilities.",
    env: "Solar power installations at 12 facilities reduced generator dependence and proved the most reliably maintained equipment category."
  },
  evidence: {
    strengths: "Large quantitative sample (1,714 households) triangulated with 76 qualitative sessions. HMIS panel covers the full 36-month window for all 28 study districts. Matching is robust to alternative specifications.",
    limits: "Three Tillabéri districts were surveyed by phone, limiting observation data there. Mortality endpoints are underpowered at 36 months. Self-reported service use carries recall bias, mitigated by HMIS triangulation."
  },
  recommendations: [
    { rec: "Negotiate a ministry budget line for consumables and maintenance before the 2027 cycle; sustainability hinges on it.", pri: "High", own: "MoH Planning Unit + donor", tl: "Within 6 months" },
    { rec: "Fund district-level emergency transport (vehicles plus fuel pooling) to convert referral protocol gains into speed.", pri: "High", own: "MoH + implementing partner", tl: "Year 1 post-evaluation" },
    { rec: "Extend fee-exemption monitoring to displaced populations with quarterly spot audits.", pri: "Medium", own: "Implementing partner", tl: "Next two quarters" },
    { rec: "Commission a follow-up mortality analysis at month 60, when the HMIS series is long enough to power the test.", pri: "Medium", own: "Donor + MoH", tl: "Month 60" }
  ],
  lessons: {
    future: "Design referral interventions around transport economics, not protocols alone. Budget security premiums into training from the start. Pair every coverage target with a mortality-measurement plan long enough to detect it.",
    next: "Validation workshop with the ministry and partners, dissemination through the RMNCAH technical working group, and the month-60 follow-up analysis."
  }
};

/* ================= Storage and formats ================= */
const SESSION_KEY = "praxis-deck-context";
const TEMPLATE_KEY = "praxis-deck-template";
const EXPORT_VERSION = "deck-generator-2.0";
const IMPORT_VERSIONS = ["deck-generator-1.0", "deck-generator-2.0"];

function slugify(s) { return String(s || "untitled").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "untitled"; }
function overrideKey(programme, template) { return `praxis-deck-overrides:${slugify(programme)}:${template}`; }

function loadContext() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const manual = parsed && parsed.praxis_manual_setup === true;
      return { context: parsed, source: manual ? "manual" : "workbench" };
    }
  } catch (e) { console.warn("Failed to parse sessionStorage context:", e); }
  return { context: DEMO_CONTEXT, source: "sample" };
}

function loadOverrides(programme, template) {
  try {
    const raw = localStorage.getItem(overrideKey(programme, template));
    if (raw) return JSON.parse(raw);
  } catch (e) { console.warn("Failed to parse overrides:", e); }
  return {};
}
function saveOverrides(programme, template, overrides) {
  try { localStorage.setItem(overrideKey(programme, template), JSON.stringify(overrides)); } catch (e) { console.warn("Failed to save overrides:", e); }
}
function saveLastTemplate(template) { try { localStorage.setItem(TEMPLATE_KEY, template); } catch (e) {} }

function exportDeckJSON(template, programme, context, overrides) {
  const payload = {
    praxis_version: EXPORT_VERSION,
    exported_at: new Date().toISOString(),
    template, programme,
    organisation: context.project_meta?.organisation || "",
    overrides
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slugify(programme)}-${template}-${new Date().toISOString().slice(0, 10)}.deck.json`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function migrateImport(parsed) {
  if (!parsed || typeof parsed !== "object") throw new Error("Not a deck JSON file");
  if (parsed.praxis_version && !IMPORT_VERSIONS.includes(parsed.praxis_version)) {
    throw new Error("Unsupported deck version: " + parsed.praxis_version);
  }
  if (!parsed.template || !parsed.overrides) throw new Error("Missing template or overrides in JSON");
  return { template: parsed.template, overrides: parsed.overrides };
}

function importDeckJSON(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      try { resolve(migrateImport(JSON.parse(fr.result))); }
      catch (e) { reject(e); }
    };
    fr.onerror = () => reject(new Error("Read failed"));
    fr.readAsText(file);
  });
}

/* ================= Format helpers ================= */
function fmt(id) {
  if (id === null || id === undefined || id === "") return "Not specified";
  return String(id).replace(/[_-]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
function safe(v, fallback) { return (v !== null && v !== undefined && v !== "") ? v : (fallback || "Not specified"); }
function pad2(n) { return String(n).padStart(2, "0"); }

const CRITERIA_LIST = ["relevance", "coherence", "effectiveness", "efficiency", "impact", "sustainability"];
const PURPOSES_LIST = ["accountability", "learning", "formative", "summative"];
const RATING_BANDS = { 4: "Strong", 3: "Satisfactory", 2: "Weak", 1: "Poor" };

/* ================= Deck state (path-keyed overrides in localStorage) ================= */
function useDeckState(programme, template) {
  const [overrides, setOverrides] = useState(() => loadOverrides(programme, template));

  useEffect(() => { setOverrides(loadOverrides(programme, template)); }, [programme, template]);

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
    return overrides[path] !== undefined ? overrides[path] : fallback;
  }, [overrides]);

  const replaceAll = useCallback((next) => setOverrides(next || {}), []);
  const resetAll = useCallback(() => setOverrides({}), []);

  return { overrides, setOverride, getOverride, resetAll, replaceAll, hasOverrides: Object.keys(overrides).length > 0 };
}
