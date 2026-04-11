/**
 * Station6.js — Analysis Framework
 * Two-panel (Quantitative | Qualitative) analysis plan with per-EQ cards,
 * disaggregation chips, editable notes, and Word export.
 */
(function () {
  'use strict';

  var h = React.createElement;
  var useState = React.useState;
  var useCallback = React.useCallback;
  var useMemo = React.useMemo;

  // ── Standard disaggregation dimensions for M&E ──

  var DEFAULT_DISAGGREGATIONS = [
    { id: 'gender', label: 'Gender' },
    { id: 'age', label: 'Age' },
    { id: 'geography', label: 'Geography' },
    { id: 'disability', label: 'Disability' },
    { id: 'ses', label: 'Socioeconomic status' },
    { id: 'urban_rural', label: 'Urban/Rural' }
  ];

  // ═══════════════════════════════════════════════════════════
  // Analysis Method Suggestion Engine
  // Produces specific, contextual recommendations based on:
  //   - DAC criterion
  //   - Indicator characteristics (numeric vs perception vs institutional)
  //   - Selected evaluation design (experimental, quasi-exp, theory-based)
  //   - Data source types
  // Each recommendation includes: method, analytical steps, software with
  // specific packages/commands, and the rationale for the suggestion.
  // ═══════════════════════════════════════════════════════════

  function classifyIndicators(inds) {
    var flags = { hasRate: false, hasCount: false, hasCost: false, hasPerception: false, hasInstitutional: false, hasBinary: false, hasComposite: false };
    (inds || []).forEach(function (i) {
      var n = (i.name || '').toLowerCase();
      if (/rate|percentage|proportion|prevalence|ratio|completeness|timeliness/i.test(n)) flags.hasRate = true;
      if (/number|count|total|frequency/i.test(n)) flags.hasCount = true;
      if (/cost|expenditure|budget|unit cost|financing|co-financing/i.test(n)) flags.hasCost = true;
      if (/perception|satisfaction|opinion|attitude|score|rating|confidence|willingness/i.test(n)) flags.hasPerception = true;
      if (/capacity|institutional|integration|system|structure|governance|policy|plan|strategy/i.test(n)) flags.hasInstitutional = true;
      if (/yes.no|binary|presence|existence|functional|operational/i.test(n)) flags.hasBinary = true;
      if (/index|composite|resilience|vulnerability|readiness/i.test(n)) flags.hasComposite = true;
    });
    return flags;
  }

  function suggestAnalysis(criterion, indicators, selectedDesign, dataSources) {
    var f = classifyIndicators(indicators);
    var ds = (dataSources || []).join(' ').toLowerCase();
    var hasSurvey = /survey|dhs|mics|household|facility|assessment/i.test(ds);
    var hasAdmin = /dhis|hmis|routine|register|lmis|programme data/i.test(ds);
    var hasQualDS = /interview|kii|fgd|focus group|observation|document review/i.test(ds);
    var isExperimental = selectedDesign && /rct|cluster/i.test(selectedDesign);
    var isQuasiExp = selectedDesign && /did|its|rdd|psm/i.test(selectedDesign);

    // ── RELEVANCE ──
    if (criterion === 'relevance') {
      if (f.hasPerception && hasSurvey) return {
        method: 'Beneficiary perception analysis using Likert-scale survey data, triangulated with stakeholder KIIs on programme design rationale',
        steps: '1. Compute frequency distributions and means for perception items. 2. Disaggregate by sex, age group, and location. 3. Test for significant differences across groups (chi-square or Kruskal-Wallis). 4. Code KII transcripts for alignment themes using framework analysis.',
        software: 'Quantitative: Stata (tab, ttest, kwallis) or R (likert package, ggplot2). Qualitative: Dedoose or manual framework matrix in Excel.',
        type: 'mixed',
        threats: 'Social desirability bias: beneficiaries may overstate satisfaction, especially in face-to-face surveys or where evaluators are associated with the programme.\nConfirmation bias: evaluators may unconsciously seek evidence confirming the causal claim.\nNon-response bias: systematic differences between respondents and non-respondents may skew perception results.'
      };
      if (f.hasInstitutional) return {
        method: 'Policy alignment analysis mapping programme objectives against national strategy priorities and sector plans',
        steps: '1. Extract programme objectives from ToC and logframe. 2. Map each objective to corresponding national strategy pillar. 3. Score alignment (fully aligned / partially aligned / not aligned) with justification. 4. Validate with government counterpart KIIs.',
        software: 'Alignment matrix in Excel or Word. Qualitative coding of policy documents in Dedoose or manual framework analysis.',
        type: 'qualitative',
        threats: 'Confirmation bias: evaluators may unconsciously seek evidence confirming the causal claim.\nRival explanations: alternative causes must be systematically assessed, not just acknowledged.\nInformant bias: government counterparts may overstate alignment to protect institutional interests.'
      };
      return {
        method: 'Document review of programme design against identified needs, supplemented by stakeholder interviews on relevance perceptions',
        steps: '1. Review needs assessments and situational analyses cited in programme design. 2. Map programme activities to identified needs. 3. Conduct KIIs with beneficiaries and implementing staff on perceived relevance. 4. Triangulate documentary and interview evidence.',
        software: 'Document analysis: manual coding matrix (Excel). KII analysis: Dedoose or ATLAS.ti for thematic coding.',
        type: 'qualitative',
        threats: 'Confirmation bias: evaluators may unconsciously seek evidence confirming the causal claim.\nRival explanations: alternative causes must be systematically assessed, not just acknowledged.\nSelection bias in document review: available documents may not represent the full picture of programme design rationale.'
      };
    }

    // ── COHERENCE ──
    if (criterion === 'coherence') {
      return {
        method: 'Internal and external coherence mapping: analyse alignment between programme components (internal) and with other actors/policies in the same space (external)',
        steps: '1. Map programme pillars/components and their interdependencies. 2. Identify other programmes operating in the same sector/geography. 3. Score coherence along three dimensions: complementarity, coordination, and harmonisation. 4. Conduct KIIs with coordination bodies and partner organisations.',
        software: 'Stakeholder/programme mapping: Kumu (network visualisation) or manual matrix in Excel. Interview coding: Dedoose.',
        type: 'qualitative',
        threats: 'Confirmation bias: evaluators may unconsciously seek evidence confirming the causal claim.\nRival explanations: alternative causes must be systematically assessed, not just acknowledged.\nIncomplete mapping: coherence assessment depends on identifying all relevant actors and programmes, which may be infeasible in complex multi-stakeholder environments.'
      };
    }

    // ── EFFECTIVENESS ──
    if (criterion === 'effectiveness') {
      if (isExperimental && f.hasRate) return {
        method: 'Intent-to-treat (ITT) analysis comparing treatment and control groups on primary outcome indicators, with per-protocol sensitivity analysis',
        steps: '1. Verify baseline balance across treatment arms (t-tests, normalised differences). 2. Estimate ITT effects using OLS with baseline covariates and strata fixed effects. 3. Adjust for clustering (cluster-robust standard errors or multilevel models). 4. Conduct subgroup analysis by sex, region, and baseline vulnerability. 5. Report effect sizes (Cohen\'s d) alongside p-values.',
        software: 'Stata: regress/areg with vce(cluster), estout for tables. R: lme4 for multilevel, clubSandwich for CR standard errors. Power: Stata\'s power command for ex-post MDE.',
        type: 'quantitative',
        threats: 'Attrition bias: differential dropout between treatment/control can bias ITT estimates. Check attrition rates and compute Lee (2009) bounds.\nContamination/spillovers: if control units receive indirect benefits, treatment effects are underestimated.\nHawthorne effect: awareness of being studied may alter behaviour independent of the intervention.'
      };
      if (isQuasiExp && selectedDesign === 'did' && (f.hasRate || hasAdmin)) return {
        method: 'Difference-in-differences (DID) estimation exploiting phased rollout. IMPORTANT: If treatment timing is staggered across units, use heterogeneity-robust DID estimators (Callaway & Sant\u2019Anna 2021, Sun & Abraham 2021) rather than naive two-way fixed effects, which produce biased estimates under staggered adoption (Goodman-Bacon 2021).',
        steps: '1. Construct panel dataset: facility/district-level outcomes across pre/post periods and treatment/comparison regions. 2. Test parallel trends assumption visually (event study plot) and with Rambachan & Roth (2023) sensitivity analysis (honestdid). 3. If staggered rollout: use Callaway-Sant\u2019Anna group-time ATT estimator (csdid). If common treatment timing: use TWFE with reghdfe. 4. Conduct event study to visualise dynamic treatment effects. 5. Robustness: vary treatment timing window, test with synthetic control (synth/scpi) for largest units, Oster (2019) bounds for omitted variable bias.',
        software: 'Stata: csdid (Callaway-Sant\u2019Anna), did_multiplegt (de Chaisemartin-D\u2019Haultfoeuille), eventstudyinteract (Sun-Abraham), reghdfe (naive TWFE for comparison only), honestdid for sensitivity. R: did package, fixest (feols/sunab), HonestDiD. Python: linearmodels for panel data.',
        type: 'quantitative',
        threats: 'Parallel trends violation: if treatment regions were selected on need, pre-trends may diverge. Test with event study and honestdid sensitivity.\nStaggered treatment bias: if rollout timing varies, naive TWFE produces biased ATT estimates (Goodman-Bacon 2021).\nAnticipation effects: units may change behaviour before formal treatment begins.'
      };
      if (isQuasiExp && selectedDesign === 'rdd') return {
        method: 'Regression discontinuity design (RDD) exploiting a threshold/cutoff rule that determines programme eligibility or intensity',
        steps: '1. Verify the assignment variable and cutoff: confirm that treatment is determined by crossing a threshold (eligibility score, geographic boundary, date cutoff). 2. Test for manipulation of the running variable using the McCrary (2008) density test (rddensity). 3. Estimate the local average treatment effect (LATE) at the cutoff using local polynomial regression with optimal bandwidth selection (Calonico, Cattaneo & Titiunik 2014). 4. Robustness: vary bandwidth, test with different polynomial orders, check for covariate balance at the cutoff, test for discontinuities at placebo cutoffs.',
        software: 'Stata: rdrobust (Cattaneo, Idrobo & Titiunik 2020), rddensity for McCrary test, rdplot for visualisation. R: rdrobust, rddensity, rdlocrand packages. Python: rdrobust package.',
        type: 'quantitative',
        threats: 'Manipulation of running variable: if units can manipulate their score to fall above/below the threshold, assignment is no longer quasi-random.\nBandwidth sensitivity: results may change substantially with different bandwidth choices.\nInsufficient density near cutoff: too few observations near the threshold reduces statistical power and precision of local estimates.'
      };
      if (isQuasiExp && (selectedDesign === 'psm' || selectedDesign === 'matching')) return {
        method: 'Propensity score matching (PSM) or inverse probability weighting (IPW) to construct a comparable comparison group from observational data',
        steps: '1. Estimate propensity scores using logistic regression on pre-treatment covariates. 2. Assess common support and trim observations outside the overlap region. 3. Match using nearest-neighbour, kernel, or caliper matching (or compute IPW weights). 4. Verify covariate balance after matching (standardised mean differences < 0.1). 5. Estimate ATT using the matched sample. 6. Sensitivity: Rosenbaum bounds for hidden bias, vary matching algorithm and caliper width.',
        software: 'Stata: teffects psmatch/ipw, psmatch2, pstest for balance diagnostics. R: MatchIt (Ho et al.), WeightIt for IPW, cobalt for balance diagnostics. Sensitivity: rbounds (Rosenbaum), sensemakr (Cinelli & Hazlett 2020).',
        type: 'quantitative',
        threats: 'Selection on unobservables: PSM only controls for observed covariates. Unobserved confounders remain a threat.\nCommon support violation: if treatment and comparison groups have limited overlap in propensity scores, matched estimates are unreliable.\nModel dependence: treatment effect estimates can be sensitive to the specification of the propensity score model.'
      };
      if (isQuasiExp && selectedDesign === 'its') return {
        method: 'Interrupted time series analysis measuring level and trend changes at the intervention point, using routine monitoring data',
        steps: '1. Compile monthly/quarterly time series of outcome indicators (minimum 8 pre-intervention data points). 2. Fit segmented regression: level change + slope change at intervention point. 3. Test for autocorrelation (Durbin-Watson) and adjust with Newey-West standard errors. 4. Sensitivity: vary the intervention date window, test for seasonality.',
        software: 'Stata: itsa command (Linden 2015), or newey for Newey-West SE. R: CausalImpact (Bayesian structural time series) or segmented package.',
        type: 'quantitative',
        threats: 'Concurrent events: other interventions or policy changes at the same time point confound the level/trend change.\nSeasonality: if outcome has seasonal patterns, segmented regression may attribute seasonal variation to the intervention.\nInsufficient pre-intervention data: fewer than 12 data points limits trend estimation reliability.'
      };
      if (f.hasRate && hasAdmin && !isExperimental && !isQuasiExp) return {
        method: 'Descriptive trend analysis of facility-level outcome indicators from routine health information systems, supplemented by contribution analysis to establish plausible causal links',
        steps: '1. Extract monthly indicator time series from DHIS2/HMIS. 2. Compute period-over-period change (baseline vs endline or annual trends). 3. Disaggregate by region, facility type, and urban/rural. 4. Apply contribution analysis: map observed changes to ToC pathways, identify rival explanations, assess evidence for each causal link.',
        software: 'Data extraction: DHIS2 analytics API or manual pivot tables. Analysis: Stata (collapse, graph twoway) or R (tidyverse, ggplot2). Contribution analysis: structured narrative using evidence matrix in Word/Excel.',
        type: 'mixed',
        threats: 'Confirmation bias: evaluators may unconsciously seek evidence confirming the causal claim.\nRival explanations: alternative causes must be systematically assessed, not just acknowledged.\nData quality in routine systems: DHIS2/HMIS data may suffer from reporting gaps, inconsistent definitions, or delayed entry that bias trend estimates.'
      };
      if (f.hasPerception) return {
        method: 'Outcome harvesting combined with survey-based perception analysis to capture both documented and perceived changes',
        steps: '1. Facilitate outcome harvesting workshops with implementing staff to identify observed changes. 2. Substantiate each outcome with independent evidence (documents, third-party verification). 3. Analyse perception survey items (Likert distributions, cross-tabulations). 4. Map harvested outcomes against ToC pathways.',
        software: 'Outcome harvesting: structured templates in Excel or Airtable. Survey: Stata (tab, graph bar) or R (likert package). Narrative synthesis: Word.',
        type: 'mixed',
        threats: 'Confirmation bias: evaluators may unconsciously seek evidence confirming the causal claim.\nRival explanations: alternative causes must be systematically assessed, not just acknowledged.\nSocial desirability bias: beneficiaries may overstate satisfaction, especially in face-to-face surveys or where evaluators are associated with the programme.'
      };
      return {
        method: 'Theory-based effectiveness assessment using contribution analysis, supported by process tracing of key causal mechanisms',
        steps: '1. Articulate the causal claim from the ToC for this outcome. 2. Identify and assess evidence for and against the causal link (interviews, documents, monitoring data). 3. Assess rival explanations. 4. Rate the strength of the contribution claim (strong, moderate, weak).',
        software: 'Process tracing: structured evidence tables in Excel. Interview coding: Dedoose or NVivo. Synthesis: narrative in Word.',
        type: 'qualitative',
        threats: 'Confirmation bias: evaluators may unconsciously seek evidence confirming the causal claim.\nRival explanations: alternative causes must be systematically assessed, not just acknowledged.\nWeak evidence base: if key informants are few or documents scarce, contribution claims rest on thin evidence.'
      };
    }

    // ── EFFICIENCY ──
    if (criterion === 'efficiency') {
      if (f.hasCost) return {
        method: 'Cost-efficiency analysis comparing unit costs across delivery modalities and regions, with value-for-money assessment using the 4Es framework (Economy, Efficiency, Effectiveness, Equity)',
        steps: '1. Extract expenditure data by activity/component from financial reports. 2. Calculate unit costs (cost per beneficiary, cost per output) by region and modality. 3. Compare against sector benchmarks and similar programmes (e.g., WHO-CHOICE thresholds). 4. Assess the 4Es: were inputs procured economically? Were outputs produced efficiently? Did outputs achieve outcomes? Were benefits equitably distributed?',
        software: 'Cost analysis: Excel (pivot tables, unit cost models). Benchmarking: WHO-CHOICE database, DCP3 estimates. Visualisation: Stata or R for comparative charts.',
        type: 'quantitative',
        threats: 'Attribution of costs: shared costs across programme components may not be accurately allocable.\nCounterfactual cost estimation: what would have been spent without the programme is inherently uncertain.\nBenchmark comparability: cost benchmarks from different contexts may not be appropriate for direct comparison.'
      };
      return {
        method: 'Value-for-money assessment using the 4Es framework, based on qualitative evidence of resource utilisation and process efficiency',
        steps: '1. Review budget execution rates and procurement records (Economy). 2. Assess output delivery against planned targets and timelines (Efficiency). 3. Link outputs to outcomes from the effectiveness analysis (Effectiveness). 4. Examine whether benefits reached the most vulnerable (Equity). 5. Triangulate with staff and partner KIIs on bottlenecks.',
        software: 'Budget analysis: Excel. Process review: structured interview coding in Dedoose. 4Es framework: narrative synthesis in Word.',
        type: 'mixed',
        threats: 'Attribution of costs: shared costs across programme components may not be accurately allocable.\nCounterfactual cost estimation: what would have been spent without the programme is inherently uncertain.\nSubjective efficiency judgements: qualitative VFM assessments depend heavily on evaluator interpretation and stakeholder framing.'
      };
    }

    // ── IMPACT ──
    if (criterion === 'impact') {
      if (isExperimental) return {
        method: 'Experimental impact estimation with subgroup heterogeneity analysis and mediation analysis to understand causal mechanisms',
        steps: '1. Estimate average treatment effect (ATE) on primary impact indicator. 2. Conduct heterogeneity analysis: interact treatment with baseline characteristics (sex, vulnerability quintile, region). 3. Mediation analysis: decompose total effect through intermediate outcomes using causal mediation (Imai, Keele & Tingley 2010). 4. Test for differential attrition and compute Lee (2009) bounds. 5. Apply multiple hypothesis correction (Anderson 2008 sharpened q-values) for subgroup tests. 6. Report minimum detectable effect sizes for non-significant results.',
        software: 'Stata: medeff for causal mediation, margins for heterogeneity, coefplot for forest plots. R: mediation package (Imai et al.), grf for causal forests heterogeneity. Robustness: Oster (2019) psacalc for omitted variable bounds.',
        type: 'quantitative',
        threats: 'Attrition bias: differential dropout between treatment/control can bias ITT estimates. Check attrition rates and compute Lee (2009) bounds.\nContamination/spillovers: if control units receive indirect benefits, treatment effects are underestimated.\nHawthorne effect: awareness of being studied may alter behaviour independent of the intervention.\nMultiple hypothesis testing: subgroup and mediation analyses inflate false positive risk without correction.'
      };
      if (isQuasiExp && selectedDesign === 'did') return {
        method: 'DID impact estimation on population-level indicators (e.g., mortality, morbidity) using phased rollout as natural experiment, supplemented by most significant change stories for qualitative impact evidence',
        steps: '1. Construct region-by-year panel for impact indicators from DHS/MICS or routine data. 2. Estimate DID controlling for region-level confounders. 3. Conduct event study to visualise pre-trends. 4. Collect and analyse most significant change (MSC) stories from beneficiaries and frontline staff. 5. Synthesise quantitative and qualitative impact evidence.',
        software: 'Quantitative: Stata (reghdfe, coefplot) or R (fixest, ggplot2). MSC: structured narrative templates in Word, thematic coding of stories in Dedoose.',
        type: 'mixed',
        threats: 'Parallel trends violation: if treatment regions were selected on need, pre-trends may diverge. Test with event study and honestdid sensitivity.\nStaggered treatment bias: if rollout timing varies, naive TWFE produces biased ATT estimates (Goodman-Bacon 2021).\nAnticipation effects: units may change behaviour before formal treatment begins.\nEcological fallacy: population-level DID estimates may not reflect individual-level impact.'
      };
      return {
        method: 'Contribution analysis for impact assessment, using process tracing to test the causal chain from programme outputs through intermediate outcomes to impact-level changes',
        steps: '1. Specify the causal claim: "the programme contributed to [impact indicator] through [mechanism]." 2. Identify observable implications if the causal claim is true vs false. 3. Gather evidence for each implication (monitoring data, KIIs, documents, secondary data). 4. Assess rival explanations (other programmes, secular trends, policy changes). 5. Rate the contribution claim with explicit evidence reasoning.',
        software: 'Evidence mapping: structured contribution matrix in Excel. Interview coding: Dedoose or NVivo. Secondary data: DHS StatCompiler, World Bank WDI, UN OCHA.',
        type: 'qualitative',
        threats: 'Confirmation bias: evaluators may unconsciously seek evidence confirming the causal claim.\nRival explanations: alternative causes must be systematically assessed, not just acknowledged.\nAttribution gap: at the impact level, the causal chain from programme to population-level change is long and the contribution claim is inherently weaker.'
      };
    }

    // ── SUSTAINABILITY ──
    if (criterion === 'sustainability') {
      if (f.hasCost || f.hasInstitutional) return {
        method: 'Institutional sustainability assessment examining financial absorption capacity, policy integration, and organisational embedding of programme functions',
        steps: '1. Analyse government co-financing trends (current ratio, projected trajectory). 2. Map which programme functions are formally integrated into government structures vs still externally supported. 3. Assess staff capacity and knowledge transfer (training records, competency assessments). 4. Review sustainability/exit plans and their implementation status. 5. Interview government counterparts on ownership and continuation intentions.',
        software: 'Financial analysis: Excel (trend models, absorption rate calculations). Institutional mapping: stakeholder matrix in Excel or Miro. Interview analysis: Dedoose for thematic coding against sustainability dimensions.',
        type: 'mixed',
        threats: 'Stated vs revealed preferences: government counterparts may express commitment to continuation without budgetary evidence.\nProjection uncertainty: sustainability forecasts based on current trends may not hold if political or fiscal conditions change.\nSurvivor bias: only assessing components that remain active may miss those already discontinued.'
      };
      return {
        method: 'Sustainability likelihood assessment across five dimensions: financial, institutional, technical, social, and environmental',
        steps: '1. For each dimension, rate sustainability likelihood (likely / somewhat likely / unlikely) with evidence justification. 2. Identify critical sustainability risks and enabling factors. 3. Assess stakeholder ownership through interviews and document review. 4. Map dependencies on external funding and technical assistance. 5. Review and assess the programme\'s exit/transition strategy.',
        software: 'Sustainability scorecard: Excel template with RAG ratings. Interview analysis: Dedoose. Document review: manual framework analysis.',
        type: 'qualitative',
        threats: 'Stated vs revealed preferences: government counterparts may express commitment to continuation without budgetary evidence.\nProjection uncertainty: sustainability forecasts based on current trends may not hold if political or fiscal conditions change.\nNormative framing: sustainability ratings are inherently subjective and may reflect evaluator assumptions about what "should" continue.'
      };
    }

    // Fallback
    return {
      method: 'Mixed methods analysis combining quantitative indicator tracking with qualitative stakeholder perspectives',
      steps: '1. Compile indicator data from monitoring systems. 2. Conduct trend analysis and disaggregation. 3. Triangulate with qualitative interview findings.',
      software: 'Quantitative: Stata or R. Qualitative: Dedoose or NVivo.',
      type: 'mixed',
      threats: 'Confirmation bias: evaluators may unconsciously seek evidence confirming the causal claim.\nRival explanations: alternative causes must be systematically assessed, not just acknowledged.\nData quality: routine monitoring data may have gaps or inconsistencies that affect trend analysis reliability.'
    };
  }

  // Keep the simple suggestMethod wrapper for backward compat
  function suggestMethod(criterion, indicators, selectedDesign) {
    var r = suggestAnalysis(criterion, indicators, selectedDesign);
    return { method: r.method, type: r.type };
  }

  // ── Classify indicator type ──

  function classifyIndicatorType(ind) {
    if (/rate|percentage|number|ratio|count|proportion|score|cost|unit|days/i.test(ind.name || '')) {
      return 'quantitative';
    }
    if (/perception|satisfaction|attitude|opinion|qualitative|narrative|experience/i.test(ind.name || '')) {
      return 'qualitative';
    }
    return 'quantitative';
  }

  // ── Build analysis cards from matrix ──

  function buildCards(matrix, selectedDesign) {
    var rows = matrix.rows || [];
    if (!Array.isArray(rows) || rows.length === 0) return [];
    return rows.map(function (eq, i) {
      var result = suggestAnalysis(eq.criterion, eq.indicators, selectedDesign, eq.dataSources);
      var indicators = (eq.indicators || []).map(function (ind) {
        return Object.assign({}, ind, { indType: classifyIndicatorType(ind) });
      });
      return {
        id: (typeof PraxisUtils !== 'undefined' ? PraxisUtils.uid('af') : 'af-' + i),
        eqNumber: eq.number || eq.id || (i + 1),
        question: eq.question || eq.text || '',
        criterion: eq.criterion || '',
        indicators: indicators,
        dataSources: eq.dataSources || [],
        method: result.method,
        steps: result.steps || '',
        analysisType: result.type,
        software: result.software || '',
        threats: result.threats || '',
        disaggregations: ['gender', 'age', 'geography'],
        notes: ''
      };
    });
  }

  // ── Disaggregation Chip ──

  function DisaggChip(props) {
    var active = props.active;
    var label = props.label;
    var onToggle = props.onToggle;
    return h('button', {
      type: 'button',
      className: 'wb-btn wb-btn-xs' + (active ? ' wb-btn--active' : ''),
      style: { fontSize: '10px', padding: '2px 8px', borderRadius: '12px', margin: '2px' },
      onClick: onToggle
    }, label);
  }

  // ── Per-EQ Analysis Card ──

  function AnalysisCard(props) {
    var card = props.card;
    var index = props.index;
    var onUpdate = props.onUpdate;

    var _threatsOpen = useState(false);
    var threatsOpen = _threatsOpen[0];
    var setThreatsOpen = _threatsOpen[1];

    var toggleDisagg = useCallback(function (disaggId) {
      var current = card.disaggregations || [];
      var next = current.indexOf(disaggId) >= 0
        ? current.filter(function (d) { return d !== disaggId; })
        : current.concat([disaggId]);
      onUpdate(index, 'disaggregations', next);
    }, [card.disaggregations, index, onUpdate]);

    var eqLabel = (typeof card.eqNumber === 'string' && card.eqNumber.indexOf('eq_') === 0)
      ? card.eqNumber.replace('eq_', '')
      : card.eqNumber;

    return h('div', { className: 'wb-card', style: { marginBottom: '12px' } },
      // Header: EQ number + criterion badge
      h('div', { className: 'wb-toolbar', style: { marginBottom: '8px' } },
        h('span', {
          style: { fontSize: '14px', fontWeight: 700, color: 'var(--navy)', marginRight: '8px' }
        }, 'EQ ' + eqLabel),
        h('span', {
          className: 'wb-criterion wb-criterion--' + (card.criterion || 'effectiveness')
        }, (card.criterion || '').charAt(0).toUpperCase() + (card.criterion || '').slice(1)),
        h('span', { className: 'wb-toolbar-spacer' }),
        h('span', {
          className: 'wb-context-badge',
          style: {
            fontSize: '9px', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.04em', padding: '2px 8px', borderRadius: '3px',
            background: card.analysisType === 'quantitative' ? '#DBEAFE' : '#FCE7F3',
            color: card.analysisType === 'quantitative' ? '#1E40AF' : '#9D174D'
          }
        }, card.analysisType === 'quantitative' ? 'QUANT' : 'QUAL')
      ),

      // Question text
      h('p', {
        style: { fontSize: '13px', color: 'var(--text)', lineHeight: 1.5, margin: '0 0 12px 0' }
      }, card.question),

      // Two-column detail grid
      h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' } },

        // Left column
        h('div', null,
          // Indicators
          h('div', { className: 'wb-field', style: { marginBottom: '10px' } },
            h('label', { className: 'wb-field-label' }, 'Linked Indicators'),
            (card.indicators && card.indicators.length > 0)
              ? h('ul', { style: { margin: '4px 0 0 0', paddingLeft: '16px', fontSize: '12px', lineHeight: 1.6, color: 'var(--text)' } },
                  card.indicators.map(function (ind, j) {
                    return h('li', { key: j },
                      h('span', { style: { fontWeight: 500 } }, ind.code ? '[' + ind.code + '] ' : ''),
                      ind.name,
                      h('span', {
                        style: {
                          marginLeft: '6px', fontSize: '9px', fontWeight: 700,
                          textTransform: 'uppercase', padding: '1px 5px', borderRadius: '3px',
                          background: ind.indType === 'quantitative' ? '#EFF6FF' : '#FDF2F8',
                          color: ind.indType === 'quantitative' ? '#3B82F6' : '#DB2777'
                        }
                      }, ind.indType === 'quantitative' ? 'NUM' : 'QUAL')
                    );
                  })
                )
              : h('span', { className: 'wb-td--meta' }, 'No indicators linked')
          ),

          // Data Sources
          h('div', { className: 'wb-field', style: { marginBottom: '10px' } },
            h('label', { className: 'wb-field-label' }, 'Data Sources'),
            (card.dataSources && card.dataSources.length > 0)
              ? h('ul', { style: { margin: '4px 0 0 0', paddingLeft: '16px', fontSize: '12px', lineHeight: 1.6, color: 'var(--text)' } },
                  card.dataSources.map(function (ds, j) {
                    return h('li', { key: j }, ds);
                  })
                )
              : h('span', { className: 'wb-td--meta' }, 'No data sources specified')
          )
        ),

        // Right column
        h('div', null,
          // Method
          h('div', { className: 'wb-field', style: { marginBottom: '10px' } },
            h('label', { className: 'wb-field-label' }, 'Suggested Method'),
            h('textarea', {
              className: 'wb-input wb-textarea',
              rows: 2,
              value: card.method,
              onChange: function (e) { onUpdate(index, 'method', e.target.value); },
              style: { fontSize: '12px', width: '100%', boxSizing: 'border-box' }
            })
          ),

          // Analytical steps
          card.steps ? h('div', { className: 'wb-field', style: { marginBottom: '10px' } },
            h('label', { className: 'wb-field-label' }, 'Analytical Steps'),
            h('div', {
              style: { fontSize: '11px', color: 'var(--text)', lineHeight: 1.6, padding: '8px 10px',
                background: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }
            }, card.steps)
          ) : null,

          // Validity threats (collapsible)
          card.threats ? h('div', { className: 'wb-field', style: { marginBottom: '10px' } },
            h('button', {
              type: 'button',
              onClick: function () { setThreatsOpen(!threatsOpen); },
              style: {
                display: 'flex', alignItems: 'center', gap: '6px', width: '100%',
                background: 'none', border: 'none', padding: '0', cursor: 'pointer',
                fontSize: '11px', fontWeight: 700, color: '#B45309',
                textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px'
              }
            },
              h('span', { style: { fontSize: '10px', transition: 'transform 0.15s', transform: threatsOpen ? 'rotate(90deg)' : 'rotate(0deg)', display: 'inline-block' } }, '\u25B6'),
              'Validity Threats (' + card.threats.split('\n').length + ')'
            ),
            threatsOpen ? h('div', {
              style: {
                fontSize: '11px', color: '#78350F', lineHeight: 1.7, padding: '10px 12px',
                background: '#FFFBEB', borderRadius: 'var(--radius-sm)',
                borderLeft: '3px solid #F59E0B', border: '1px solid #FDE68A',
                borderLeftWidth: '3px', borderLeftColor: '#F59E0B'
              }
            },
              card.threats.split('\n').map(function (threat, ti) {
                return h('div', { key: ti, style: { marginBottom: ti < card.threats.split('\n').length - 1 ? '6px' : '0', paddingLeft: '4px' } },
                  h('span', { style: { color: '#D97706', marginRight: '6px', fontWeight: 700 } }, '\u26A0'),
                  threat
                );
              })
            ) : null
          ) : null,

          // Software & tools
          h('div', { className: 'wb-field', style: { marginBottom: '10px' } },
            h('label', { className: 'wb-field-label' }, 'Software & Tools'),
            h('textarea', {
              className: 'wb-input wb-textarea',
              rows: 2,
              value: card.software,
              onChange: function (e) { onUpdate(index, 'software', e.target.value); },
              style: { fontSize: '11px', width: '100%', boxSizing: 'border-box' }
            })
          ),

          // Disaggregation chips
          h('div', { className: 'wb-field', style: { marginBottom: '10px' } },
            h('label', { className: 'wb-field-label' }, 'Disaggregation Dimensions'),
            h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '2px', marginTop: '4px' } },
              DEFAULT_DISAGGREGATIONS.map(function (dim) {
                var active = (card.disaggregations || []).indexOf(dim.id) >= 0;
                return h(DisaggChip, {
                  key: dim.id,
                  label: dim.label,
                  active: active,
                  onToggle: function () { toggleDisagg(dim.id); }
                });
              })
            )
          ),

          // Notes
          h('div', { className: 'wb-field' },
            h('label', { className: 'wb-field-label' }, 'Notes'),
            h('input', {
              className: 'wb-input',
              value: card.notes,
              placeholder: 'Analysis notes...',
              onChange: function (e) { onUpdate(index, 'notes', e.target.value); },
              style: { fontSize: '12px', width: '100%', boxSizing: 'border-box' }
            })
          )
        )
      )
    );
  }

  // ── Summary Bar ──

  function SummaryBar(props) {
    var cards = props.cards;
    var quantCount = 0;
    var qualCount = 0;
    var allDisaggs = {};

    cards.forEach(function (c) {
      if (c.analysisType === 'quantitative') quantCount++;
      else qualCount++;
      (c.disaggregations || []).forEach(function (d) { allDisaggs[d] = true; });
    });

    var disaggCount = Object.keys(allDisaggs).length;

    return h('div', {
      style: {
        display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
        padding: '10px 16px', marginBottom: '16px',
        background: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border)'
      }
    },
      h('span', { style: { fontSize: '13px', fontWeight: 600, color: 'var(--navy)' } },
        cards.length + ' EQ' + (cards.length !== 1 ? 's' : '')),
      h('span', { style: { width: '1px', height: '16px', background: 'var(--border)' } }),
      h('span', { style: { fontSize: '12px', color: '#1E40AF', fontWeight: 500 } },
        quantCount + ' quantitative'),
      h('span', { style: { width: '1px', height: '16px', background: 'var(--border)' } }),
      h('span', { style: { fontSize: '12px', color: '#9D174D', fontWeight: 500 } },
        qualCount + ' qualitative'),
      h('span', { style: { width: '1px', height: '16px', background: 'var(--border)' } }),
      h('span', { style: { fontSize: '12px', color: 'var(--slate)', fontWeight: 500 } },
        disaggCount + ' disaggregation dimension' + (disaggCount !== 1 ? 's' : ''))
    );
  }

  // ── Word Export ──

  function esc(s) {
    return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function exportAnalysisPlan(cards, programmeName) {
    var title = esc(programmeName || 'Evaluation Programme');

    var quantCards = cards.filter(function (c) { return c.analysisType === 'quantitative'; });
    var qualCards = cards.filter(function (c) { return c.analysisType !== 'quantitative'; });

    function disaggLabel(ids) {
      var labels = [];
      DEFAULT_DISAGGREGATIONS.forEach(function (d) {
        if (ids.indexOf(d.id) >= 0) labels.push(d.label);
      });
      return labels.join(', ') || 'None specified';
    }

    function buildTable(rows) {
      if (rows.length === 0) return '<p style="font-size:10pt;color:#888"><em>No evaluation questions in this category.</em></p>';
      var t = '';
      rows.forEach(function (card) {
        var eqLabel = (typeof card.eqNumber === 'string' && card.eqNumber.indexOf('eq_') === 0)
          ? card.eqNumber.replace('eq_', '')
          : card.eqNumber;
        t += '<div style="margin-bottom:16pt;padding:10pt;border:1pt solid #E2E8F0;border-left:3pt solid #2EC4B6;border-radius:4pt">';
        t += '<p style="margin:0 0 4pt;font-size:11pt"><strong>EQ ' + esc(String(eqLabel)) + ' (' + esc(card.criterion || '') + ')</strong></p>';
        t += '<p style="margin:0 0 6pt;font-size:10pt;color:#374151">' + esc(card.question || '') + '</p>';
        t += '<p style="margin:0 0 3pt;font-size:9pt;font-weight:bold;color:#64748B">METHOD</p>';
        t += '<p style="margin:0 0 6pt;font-size:10pt">' + esc(card.method || '') + '</p>';
        if (card.steps) {
          t += '<p style="margin:0 0 3pt;font-size:9pt;font-weight:bold;color:#64748B">ANALYTICAL STEPS</p>';
          t += '<p style="margin:0 0 6pt;font-size:9pt;color:#374151;line-height:1.5">' + esc(card.steps) + '</p>';
        }
        if (card.threats) {
          t += '<div style="margin:0 0 6pt;padding:6pt 10pt;background:#FFFBEB;border-left:3pt solid #F59E0B;border-radius:3pt">';
          t += '<p style="margin:0 0 3pt;font-size:9pt;font-weight:bold;color:#B45309">VALIDITY THREATS</p>';
          card.threats.split('\n').forEach(function (threat) {
            t += '<p style="margin:0 0 2pt;font-size:8.5pt;color:#78350F;line-height:1.4">\u26A0 ' + esc(threat) + '</p>';
          });
          t += '</div>';
        }
        t += '<p style="margin:0 0 3pt;font-size:9pt;font-weight:bold;color:#64748B">SOFTWARE & TOOLS</p>';
        t += '<p style="margin:0 0 6pt;font-size:9pt;color:#374151">' + esc(card.software || '') + '</p>';
        t += '<p style="margin:0 0 3pt;font-size:9pt;font-weight:bold;color:#64748B">DATA SOURCES</p>';
        t += '<p style="margin:0 0 6pt;font-size:9pt;color:#374151">' + esc((card.dataSources || []).join('; ')) + '</p>';
        t += '<p style="margin:0;font-size:9pt;color:#64748B">Disaggregation: ' + esc(disaggLabel(card.disaggregations || [])) + '</p>';
        t += '</div>';
      });
      return t;
    }

    var html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">' +
      '<head><meta charset="UTF-8"><style>' +
      'body{font-family:Calibri,sans-serif;font-size:10pt;color:#333}' +
      'h1{font-size:16pt;color:#0B1A2E;margin-bottom:4pt}' +
      'h2{font-size:13pt;color:#0B1A2E;margin-top:20pt;margin-bottom:6pt;border-bottom:2px solid #0B1A2E;padding-bottom:4pt}' +
      'table{border-collapse:collapse;width:100%;margin-bottom:16pt}' +
      'th{background:#0B1A2E;color:#fff;padding:6px 8px;text-align:left;font-size:9pt}' +
      'td{border:1px solid #ccc;padding:5px 8px;vertical-align:top;font-size:10pt}' +
      'tr:nth-child(even){background:#f9f9f9}' +
      '.footer{font-size:8pt;color:#999;margin-top:24pt;border-top:1px solid #ddd;padding-top:8pt}' +
      '</style></head><body>' +
      '<h1>Analysis Framework &mdash; ' + title + '</h1>' +
      '<p style="font-size:10pt;color:#666;margin-bottom:16pt">' +
        cards.length + ' evaluation questions &middot; ' +
        quantCards.length + ' quantitative &middot; ' +
        qualCards.length + ' qualitative' +
      '</p>' +
      '<h2>Quantitative Methods</h2>' +
      buildTable(quantCards) +
      '<h2>Qualitative Methods</h2>' +
      buildTable(qualCards) +
      '<p class="footer">Generated by PRAXIS Evaluation Workbench &mdash; ' + new Date().toISOString().slice(0, 10) + '</p>' +
      '</body></html>';

    var blob = new Blob([html], { type: 'application/msword' });
    if (typeof PraxisUtils !== 'undefined' && PraxisUtils.downloadBlob) {
      PraxisUtils.downloadBlob(blob, 'analysis-framework.doc');
    } else {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'analysis-framework.doc';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  // ── Tab Button ──

  function TabButton(props) {
    var active = props.active;
    var label = props.label;
    var count = props.count;
    var onClick = props.onClick;
    var color = props.color;

    return h('button', {
      type: 'button',
      className: 'wb-btn' + (active ? ' wb-btn--active' : ''),
      style: active ? { background: color || 'var(--navy)', borderColor: color || 'var(--navy)' } : {},
      onClick: onClick
    },
      label + ' (' + count + ')'
    );
  }

  // ── Station 6 Component ──

  function Station6(props) {
    var state = props.state;
    var dispatch = props.dispatch;
    var context = (state && state.context) || {};

    var matrix = context.evaluation_matrix || null;
    var savedPlan = context.analysis_plan || null;
    var designRec = context.design_recommendation || {};
    var selectedDesign = designRec.selected_design || null;
    var programmeName = (context.project_meta && context.project_meta.programme_name) ||
      (matrix && matrix.context && matrix.context.programmeName) || '';

    var hasMatrix = matrix && matrix.rows && Array.isArray(matrix.rows) && matrix.rows.length > 0;

    // Initialise cards from saved data or empty
    var initialCards = savedPlan && savedPlan.cards && savedPlan.cards.length > 0
      ? savedPlan.cards
      : (savedPlan && savedPlan.rows && savedPlan.rows.length > 0 ? savedPlan.rows : []);

    var _cards = useState(initialCards);
    var cards = _cards[0];
    var setCards = _cards[1];

    var _generated = useState(initialCards.length > 0);
    var generated = _generated[0];
    var setGenerated = _generated[1];

    var _activeTab = useState('quantitative');
    var activeTab = _activeTab[0];
    var setActiveTab = _activeTab[1];

    // Derived: split cards by type
    var quantCards = useMemo(function () {
      return cards.filter(function (c) { return c.analysisType === 'quantitative'; });
    }, [cards]);

    var qualCards = useMemo(function () {
      return cards.filter(function (c) { return c.analysisType !== 'quantitative'; });
    }, [cards]);

    var visibleCards = activeTab === 'quantitative' ? quantCards : qualCards;

    // ── No matrix data ──
    if (!hasMatrix) {
      return h('div', null,
        h(SectionCard, { title: 'Analysis Plan', bodyType: 'empty' },
          h('div', { className: 'wb-station-empty' },
            h('div', { className: 'wb-station-empty-title' },
              'No Evaluation Matrix Available'),
            h('p', { className: 'wb-station-empty-desc' },
              'Complete Station 2 first to define your evaluation questions. The analysis framework will suggest methods based on your matrix.'),
            h('button', {
              className: 'wb-btn wb-btn-primary',
              onClick: function () { dispatch({ type: 'SET_ACTIVE_STATION', station: 2 }); }
            }, 'Go to Station 2')
          )
        ),
        typeof StationNav !== 'undefined' ? h(StationNav, { stationId: 6, dispatch: dispatch }) : null
      );
    }

    // ── Card update handler ──
    var updateCard = useCallback(function (index, field, value) {
      // index is the position in the FULL cards array, not the filtered view.
      // We need to map visible index back to the full array index.
      var visibleType = activeTab;
      var count = 0;
      var fullIndex = -1;
      for (var i = 0; i < cards.length; i++) {
        var cardType = cards[i].analysisType === 'quantitative' ? 'quantitative' : 'qualitative';
        if (cardType === visibleType) {
          if (count === index) { fullIndex = i; break; }
          count++;
        }
      }
      if (fullIndex < 0) return;

      setCards(function (prev) {
        var next = prev.slice();
        next[fullIndex] = Object.assign({}, next[fullIndex]);
        next[fullIndex][field] = value;
        return next;
      });
    }, [activeTab, cards]);

    // ── Generate analysis plan ──
    var handleGenerate = useCallback(function () {
      var newCards = buildCards(matrix, selectedDesign);
      setCards(newCards);
      setGenerated(true);
      // Default to the tab with more cards
      var qn = newCards.filter(function (c) { return c.analysisType === 'quantitative'; }).length;
      var ql = newCards.length - qn;
      setActiveTab(qn >= ql ? 'quantitative' : 'qualitative');
    }, [matrix, selectedDesign]);

    // ── Save draft ──
    var handleSave = useCallback(function () {
      dispatch({
        type: 'SAVE_STATION',
        stationId: 6,
        data: {
          analysis_plan: {
            cards: cards,
            rows: cards,
            completed_at: new Date().toISOString()
          }
        }
      });
      if (typeof dispatch === 'function') {
        dispatch({ type: 'SHOW_TOAST', message: 'Analysis framework saved', toastType: 'success' });
      }
    }, [dispatch, cards]);

    // ── Export handler ──
    var handleExport = useCallback(function () {
      exportAnalysisPlan(cards, programmeName);
    }, [cards, programmeName]);

    // ── Render ──
    return h('div', null,
      // Design context banner
      selectedDesign ? h('div', {
        className: 'wb-guidance wb-guidance--neutral',
        style: { padding: '10px 16px', marginBottom: '16px', borderRadius: '6px', border: '1px solid var(--border)' }
      },
        h('span', { className: 'wb-guidance-text' },
          h('strong', null, 'Evaluation design: '),
          selectedDesign.toUpperCase(),
          ' \u2014 analysis method suggestions are tailored to this design.'
        )
      ) : null,

      // Main section card
      h(SectionCard, {
        title: 'Analysis Plan',
        badge: generated ? cards.length + ' EQs' : null,
        bodyType: generated ? 'table' : 'empty'
      },
        !generated
          ? h('div', { className: 'wb-station-empty' },
              h('p', { className: 'wb-station-empty-desc' },
                'Generate an analysis framework from your ' + (matrix.rows || []).length +
                ' evaluation questions. Each question receives a tailored method, software recommendation, and disaggregation plan based on its criterion, indicators, and your selected evaluation design.'),
              h('button', {
                className: 'wb-btn wb-btn-primary',
                onClick: handleGenerate
              }, 'Generate Analysis Framework')
            )
          : h('div', null,
              // Toolbar actions row
              h('div', { className: 'wb-toolbar', style: { marginBottom: '12px' } },
                h('span', { className: 'wb-toolbar-spacer' }),
                h('div', { style: { display: 'flex', gap: '8px' } },
                  h('button', {
                    className: 'wb-btn',
                    onClick: handleExport,
                    title: 'Export as Word document'
                  }, 'Export Analysis Plan'),
                  h('button', {
                    className: 'wb-btn',
                    onClick: handleGenerate
                  }, 'Regenerate')
                )
              ),

              // Summary bar
              h(SummaryBar, { cards: cards }),

              // Tab buttons
              h('div', { style: { display: 'flex', gap: '8px', marginBottom: '16px' } },
                h(TabButton, {
                  active: activeTab === 'quantitative',
                  label: 'Quantitative',
                  count: quantCards.length,
                  color: '#1E40AF',
                  onClick: function () { setActiveTab('quantitative'); }
                }),
                h(TabButton, {
                  active: activeTab === 'qualitative',
                  label: 'Qualitative',
                  count: qualCards.length,
                  color: '#9D174D',
                  onClick: function () { setActiveTab('qualitative'); }
                })
              ),

              // Panel heading
              h('div', {
                style: {
                  fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.06em', marginBottom: '12px',
                  color: activeTab === 'quantitative' ? '#1E40AF' : '#9D174D'
                }
              }, activeTab === 'quantitative'
                ? 'Quantitative Analysis Methods — statistical and numerical approaches'
                : 'Qualitative Analysis Methods — interpretive and thematic approaches'),

              // EQ cards
              visibleCards.length > 0
                ? visibleCards.map(function (card, i) {
                    return h(AnalysisCard, {
                      key: card.id,
                      card: card,
                      index: i,
                      onUpdate: updateCard
                    });
                  })
                : h('div', {
                    style: {
                      textAlign: 'center', padding: '32px', fontSize: '13px',
                      color: 'var(--slate)', fontStyle: 'italic'
                    }
                  }, 'No ' + activeTab + ' evaluation questions in this analysis plan.')
            )
      ),

      // Action bar
      generated ? h('div', { className: 'wb-action-bar' },
        h('button', {
          className: 'wb-btn wb-btn-teal',
          onClick: handleSave
        }, 'Save Draft'),
        h('button', {
          className: 'wb-btn',
          onClick: handleExport
        }, 'Export as Word')
      ) : null,

      // Navigation
      typeof StationNav !== 'undefined' ? h(StationNav, { stationId: 6, dispatch: dispatch, onSave: handleSave }) : null
    );
  }

  window.Station6 = Station6;
})();
