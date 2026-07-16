/* ================= Slide registries ================= */
function buildInceptionSlides(context) {
  const slides = [
    { id: "cover", title: "Cover", isDivider: true, type: "cover" },
    { id: "agenda", title: "Agenda", type: "agenda" },
    { id: "programme", title: "Programme Overview", type: "programme" },
    { id: "purpose", title: "Evaluation Purpose and Users", type: "purpose" },
    { id: "toc", title: "Theory of Change", type: "toc" },
    { id: "eqs", title: "Evaluation Questions", type: "eqs" },
    { id: "method", title: "Methodology", type: "methodology" },
    { id: "sampling", title: "Sampling Strategy", type: "sampling" },
    { id: "datacoll", title: "Data Collection", type: "datacoll" },
    { id: "analysis", title: "Analysis Approach", type: "analysis" },
    { id: "evalabil", title: "Evaluability Assessment", type: "evaluability" },
    { id: "timeline", title: "Timeline", type: "timeline" },
    { id: "team", title: "Team and Roles", type: "team" },
    { id: "risks", title: "Risks and Mitigations", type: "risks" },
    { id: "deliverab", title: "Deliverables Schedule", type: "deliverables" },
    { id: "qa", title: "Q and A", isDivider: true, type: "qa" }
  ];
  return slides.map((s, i) => ({ ...s, num: i + 1, total: slides.length }));
}

const CRITERION_ORDER = ["relevance", "coherence", "effectiveness", "efficiency", "impact", "sustainability"];

function distinctCriteria(context) {
  const criteria = Array.from(new Set((context.evaluation_matrix?.rows || []).map(r => r.criterion).filter(Boolean)));
  return criteria.sort((a, b) => CRITERION_ORDER.indexOf(a) - CRITERION_ORDER.indexOf(b));
}

function buildFindingsSlides(context) {
  const sorted = distinctCriteria(context);
  const fixed = [
    { id: "cover", title: "Cover", isDivider: true, type: "cover-findings" },
    { id: "agenda", title: "Agenda", type: "agenda" },
    { id: "prgrecap", title: "Programme Recap", type: "programme-recap" },
    { id: "methrecap", title: "Methodology and Sample", type: "methodology-recap" },
    { id: "perf", title: "Performance Summary", type: "performance" },
    { id: "headline", title: "Headline Findings", type: "headline-findings" }
  ];
  const criterionSlides = sorted.map(cr => ({
    id: `finding-${cr}`, title: `Findings: ${fmt(cr)}`, eyebrow: fmt(cr), type: "finding-criterion", criterion: cr
  }));
  const tail = [
    { id: "crosscut", title: "Cross-cutting Findings", type: "cross-cutting" },
    { id: "evidence", title: "Evidence Quality and Limits", type: "evidence" },
    { id: "recs", title: "Recommendations", type: "recommendations" },
    { id: "lessons", title: "Lessons and Next Steps", type: "lessons" },
    { id: "qa", title: "Q and A", isDivider: true, type: "qa" }
  ];
  const all = [...fixed, ...criterionSlides, ...tail];
  return all.map((s, i) => ({ ...s, num: i + 1, total: all.length }));
}

/* ================= Small slide helpers ================= */
function hasVal(deckState, path, def) {
  const v = deckState.getOverride(path, def);
  return v !== null && v !== undefined && String(v).trim() !== "";
}

const noteStyle = { fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.04em", color: "var(--text-3)", lineHeight: 1.6 };

function StationNote({ children }) {
  return <p style={noteStyle}>{children}</p>;
}

/* Rating bound to the override store; interactive only in the editor. */
function RatingControl({ path, def, deckState, size }) {
  const editable = useContext(EditCtx);
  const rating = Number(deckState.getOverride(path, def)) || 0;
  return <RatingScale rating={rating} size={size} editable={editable}
    onSet={v => deckState.setOverride(path, v === Number(def) ? null : v)} />;
}

/* Gantt bound to the override store; cells clickable only in the editor. */
function GanttGrid({ deckState }) {
  const editable = useContext(EditCtx);
  const phases = [
    { id: "inception", label: "Inception" },
    { id: "fieldwork", label: "Fieldwork" },
    { id: "analysis", label: "Analysis" },
    { id: "reporting", label: "Reporting" }
  ];
  const defaults = {
    "timeline.inception": "1,2,3",
    "timeline.fieldwork": "4,5,6,7,8",
    "timeline.analysis": "8,9,10",
    "timeline.reporting": "10,11,12"
  };
  function monthsSet(phaseId) {
    const raw = deckState.getOverride(`timeline.${phaseId}`, defaults[`timeline.${phaseId}`]);
    return new Set(String(raw).split(",").map(s => parseInt(s.trim(), 10)).filter(n => n >= 1 && n <= 12));
  }
  function toggleMonth(phaseId, m) {
    if (!editable) return;
    const current = monthsSet(phaseId);
    if (current.has(m)) current.delete(m); else current.add(m);
    const sorted = Array.from(current).sort((a, b) => a - b).join(",");
    deckState.setOverride(`timeline.${phaseId}`, sorted === defaults[`timeline.${phaseId}`] ? null : sorted);
  }
  return <div className={`gantt ${editable ? "editable" : ""}`}>
    <div className="gh label-col">Phase</div>
    {Array.from({ length: 12 }, (_, i) => <div key={i} className="gh">M{i + 1}</div>)}
    {phases.map(p => <React.Fragment key={p.id}>
      <div className="phase-label">{p.label}</div>
      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
        const on = monthsSet(p.id).has(m);
        return editable
          ? <button key={m} type="button" className={`phase-cell ${on ? "on" : ""}`} aria-label={`${p.label} month ${m}${on ? ", active" : ""}`} onClick={() => toggleMonth(p.id, m)} />
          : <div key={m} className={`phase-cell ${on ? "on" : ""}`} />;
      })}
    </React.Fragment>)}
  </div>;
}

/* ================= Slide dispatcher ================= */
function renderSlide(slide, ctx, deckState, programme, source) {
  const findings = source === "sample" ? DEMO_FINDINGS : null;
  const chrome = { num: slide.num, total: slide.total, programme };
  const eyebrow = `${pad2(slide.num)} / ${(slide.eyebrow || slide.title)}`;
  const meta = ctx.project_meta || {};

  switch (slide.type) {

    /* ============ Ink slides ============ */
    case "cover":
    case "cover-findings": {
      const subDefault = slide.type === "cover" ? "Evaluation Design Brief" : "Findings Brief";
      return <InkSlide {...chrome} eyebrow={meta.organisation || "Evaluation"}>
        <h2>{programme}</h2>
        <div className="ink-rule"></div>
        <EditableText as="div" className="ink-sub" path="cover.subtitle" value={subDefault}
          deckState={deckState} placeholder="Subtitle, for example: Mid-term findings, April 2026" ariaLabel="Deck subtitle" />
      </InkSlide>;
    }
    case "qa":
      return <InkSlide {...chrome} eyebrow="Questions">
        <h2>Thank you</h2>
        <div className="ink-rule"></div>
        <EditableText as="div" className="ink-sub" path="qa.contact" value={meta.organisation || ""}
          deckState={deckState} placeholder="Contact details" ariaLabel="Contact details" />
      </InkSlide>;

    /* ============ Shared ============ */
    case "agenda":
      return <PaperSlide {...chrome} eyebrow={eyebrow}>
        <h2 className="headline">Agenda</h2>
        <p className="lede">Order and focus for today's discussion.</p>
        <ul className="agenda-grid">
          {(slide._siblings || []).filter(s => s.id !== slide.id && !s.isDivider).map(s =>
            <li key={s.id}><span className="an">{pad2(s.num)}</span><span className="at">{s.title}</span></li>
          )}
        </ul>
      </PaperSlide>;

    /* ============ Inception ============ */
    case "programme": {
      const params = [
        { k: "Country / Region", v: safe(meta.country) },
        { k: "Sectors", v: (meta.health_areas || []).map(fmt).join(", ") || safe(meta.sector) },
        { k: "Operating Context", v: fmt(meta.operating_context) },
        { k: "Budget", v: fmt(meta.budget) },
        { k: "Programme Maturity", v: fmt(meta.programme_maturity) },
        { k: "Timeline", v: fmt(meta.timeline) }
      ];
      return <PaperSlide {...chrome} eyebrow={eyebrow}>
        <h2 className="headline">{safe(meta.programme_name, "Programme Overview")}</h2>
        <p className="lede">{safe(meta.organisation, "")}. Programme context at a glance.</p>
        <div className="param-grid">
          {params.map((p, i) => <div key={i} className="param"><div className="k">{p.k}</div><div className="v">{p.v}</div></div>)}
        </div>
      </PaperSlide>;
    }
    case "purpose": {
      const t = ctx.tor_constraints || {};
      const purposes = (t.evaluation_purpose || []).map(fmt);
      const params = [
        { k: "Evaluation Purpose", v: purposes.length ? purposes.join(", ") : "Not specified" },
        { k: "Causal Inference Level", v: fmt(t.causal_inference_level) },
        { k: "Geographic Scope", v: safe(t.geographic_scope), wide: true },
        { k: "Target Population", v: safe(t.target_population), wide: true }
      ];
      return <PaperSlide {...chrome} eyebrow={eyebrow}>
        <h2 className="headline">Evaluation Purpose and Users</h2>
        <p className="lede">What this evaluation is for, and who will use the findings.</p>
        <div className="param-grid cols-2">
          {params.map((p, i) => <div key={i} className="param" style={p.wide ? { gridColumn: "1 / -1" } : {}}><div className="k">{p.k}</div><div className="v">{p.v}</div></div>)}
        </div>
      </PaperSlide>;
    }
    case "toc": {
      const nodes = ctx.toc?.nodes || [];
      if (!nodes.length) return <PaperSlide {...chrome} eyebrow={eyebrow}>
        <h2 className="headline">Theory of Change</h2>
        <StationNote>No theory of change captured in the Workbench yet. Complete the Theory of Change station to populate this slide.</StationNote>
      </PaperSlide>;
      return <PaperSlide {...chrome} eyebrow={eyebrow}>
        <p className="lede" style={{ marginBottom: 8 }}>How activities cascade into impact: the causal pathway this evaluation will test.</p>
        <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "stretch" }}>
          <ToCTreeSVG nodes={nodes} />
        </div>
      </PaperSlide>;
    }
    case "eqs": {
      const rows = ctx.evaluation_matrix?.rows || [];
      if (!rows.length) return <PaperSlide {...chrome} eyebrow={eyebrow}>
        <h2 className="headline">Evaluation Questions</h2>
        <StationNote>Complete the Evaluation Matrix station to populate this slide.</StationNote>
      </PaperSlide>;
      return <PaperSlide {...chrome} eyebrow={eyebrow}>
        <h2 className="headline">Evaluation Questions</h2>
        <p className="lede">{rows.length} question{rows.length === 1 ? "" : "s"} across {distinctCriteria(ctx).length} OECD DAC criteria.</p>
        <div className="ltable">
          {rows.map((eq, i) => <div key={eq.id || i} className="lrow" style={{ gridTemplateColumns: "44px 170px 1fr" }}>
            <span className="lnum">EQ{eq.number || i + 1}</span>
            <span className="crit-tag"><span className="sq"></span>{fmt(eq.criterion || "")}</span>
            <span>{eq.question || ""}</span>
          </div>)}
        </div>
      </PaperSlide>;
    }
    case "methodology": {
      const dr = ctx.design_recommendation || {};
      const top = dr.ranked_designs?.[0] || (dr.selected_design ? { id: dr.selected_design } : null);
      if (!top) return <PaperSlide {...chrome} eyebrow={eyebrow}>
        <h2 className="headline">Methodology</h2>
        <StationNote>Complete the Design Advisor station to select an evaluation design.</StationNote>
      </PaperSlide>;
      const params = [
        { k: "Design", v: safe(top.name, fmt(top.id)) },
        { k: "Family", v: safe(top.family, "Not classified") },
        top.score != null ? { k: "Advisor Score", v: (typeof top.score === "number" ? top.score.toFixed(1) : top.score) + " / 100" } : null,
        { k: "Comparison Strategy", v: fmt(ctx.tor_constraints?.comparison_feasibility || dr.answers?.comparison) }
      ].filter(Boolean);
      return <PaperSlide {...chrome} eyebrow={eyebrow}>
        <h2 className="headline">{safe(top.name, fmt(top.id))}</h2>
        <p className="lede">{dr.justification || "Design selected by the Workbench advisor from the causal-inference requirement, timeline, and ToR constraints."}</p>
        <div className="param-grid cols-4" style={{ marginTop: "auto" }}>
          {params.map((p, i) => <div key={i} className="param"><div className="k">{p.k}</div><div className="v" style={{ fontSize: 13.5 }}>{p.v}</div></div>)}
        </div>
      </PaperSlide>;
    }
    case "sampling": {
      const sp = ctx.sample_parameters || {};
      const quant = sp.result?.primary;
      const qual = sp.qualitative_plan?.breakdown || [];
      const qualTotal = qual.reduce((s, b) => s + (b.count || 0), 0);
      const maxQual = Math.max(1, ...qual.map(b => b.count || 0));
      if (!quant && !qual.length) return <PaperSlide {...chrome} eyebrow={eyebrow}>
        <h2 className="headline">Sampling Strategy</h2>
        <StationNote>Complete the Sample Size station to populate this slide.</StationNote>
      </PaperSlide>;
      return <PaperSlide {...chrome} eyebrow={eyebrow}>
        <h2 className="headline">Sampling Strategy</h2>
        <div className="param-grid cols-2" style={{ marginBottom: 18 }}>
          <div className="param">
            <div className="k">Quantitative Sample</div>
            <div className="v num">{quant != null ? quant.toLocaleString("en-US") : ""}</div>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>{sp.result?.label || ""}</div>
          </div>
          <div className="param">
            <div className="k">Qualitative Touchpoints</div>
            <div className="v num">{qualTotal}</div>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>{qual.length} method{qual.length === 1 ? "" : "s"}</div>
          </div>
        </div>
        {qual.length > 0 && <div>
          <div className="crit-block-label">Qualitative breakdown</div>
          {qual.map((b, i) => <div key={i} className="samp-bar-row">
            <span className="method">{b.method}</span>
            <div className="bar"><div className="bar-fill" style={{ width: `${(b.count / maxQual) * 100}%` }}></div></div>
            <span className="count">{b.count}</span>
          </div>)}
        </div>}
      </PaperSlide>;
    }
    case "datacoll": {
      const items = ctx.instruments?.items || [];
      if (!items.length) return <PaperSlide {...chrome} eyebrow={eyebrow}>
        <h2 className="headline">Data Collection</h2>
        <StationNote>Complete the Instruments station to populate this slide.</StationNote>
      </PaperSlide>;
      const totalQ = items.reduce((s, it) => s + (it.questions?.length || 0), 0);
      const typeMap = {};
      items.forEach(it => { const t = it.type || "other"; typeMap[t] = (typeMap[t] || 0) + 1; });
      return <PaperSlide {...chrome} eyebrow={eyebrow}>
        <h2 className="headline">Data Collection</h2>
        <p className="lede">Instruments and touchpoints across the data collection plan.</p>
        <div className="param-grid" style={{ marginBottom: 16 }}>
          <div className="param"><div className="k">Instruments</div><div className="v num">{items.length}</div></div>
          <div className="param"><div className="k">Total Questions</div><div className="v num">{totalQ}</div></div>
          <div className="param"><div className="k">Types</div><div className="v" style={{ fontSize: 13 }}>{Object.keys(typeMap).map(t => `${fmt(t)} (${typeMap[t]})`).join(", ")}</div></div>
        </div>
        <div className="ltable">
          <div className="lrow lhead" style={{ gridTemplateColumns: "1fr 160px 80px" }}>
            <span>Instrument</span><span>Type</span><span style={{ textAlign: "right" }}>Items</span>
          </div>
          {items.map((it, i) => <div key={it.id || i} className="lrow" style={{ gridTemplateColumns: "1fr 160px 80px" }}>
            <span className="lstrong">{it.title || it.name || "Untitled"}</span>
            <span className="lmono">{fmt(it.type || "other")}</span>
            <span className="lmono" style={{ textAlign: "right" }}>{it.questions?.length || 0}</span>
          </div>)}
        </div>
      </PaperSlide>;
    }
    case "analysis": {
      const rows = ctx.analysis_plan?.rows || [];
      const matrixRows = ctx.evaluation_matrix?.rows || [];
      if (!rows.length && !matrixRows.length) return <PaperSlide {...chrome} eyebrow={eyebrow}>
        <h2 className="headline">Analysis Approach</h2>
        <StationNote>Complete the Analysis station to populate this slide.</StationNote>
      </PaperSlide>;
      const list = rows.length
        ? rows.map((r, i) => ({ eq: r.eq_label || `EQ${i + 1}`, method: r.method || "Not specified", soft: r.software || "" }))
        : matrixRows.map((eq, i) => ({ eq: `EQ${eq.number || i + 1}`, method: (eq.dataSources || []).map(fmt).join(", ") || "No sources defined", soft: "" }));
      return <PaperSlide {...chrome} eyebrow={eyebrow}>
        <h2 className="headline">Analysis Approach</h2>
        <p className="lede">{rows.length ? "Method and software assignments per evaluation question." : "Data sources per evaluation question."}</p>
        <div className="ltable">
          <div className="lrow lhead" style={{ gridTemplateColumns: "70px 1fr 220px" }}>
            <span>EQ</span><span>{rows.length ? "Method" : "Data sources"}</span><span>Software</span>
          </div>
          {list.map((r, i) => <div key={i} className="lrow" style={{ gridTemplateColumns: "70px 1fr 220px" }}>
            <span className="lnum">{r.eq}</span>
            <span>{r.method}</span>
            <span className="lmono">{r.soft}</span>
          </div>)}
        </div>
      </PaperSlide>;
    }
    case "evaluability": {
      const ev = ctx.evaluability || {};
      if (ev.score == null) return <PaperSlide {...chrome} eyebrow={eyebrow}>
        <h2 className="headline">Evaluability Assessment</h2>
        <StationNote>Evaluability assessment not yet completed in the Workbench.</StationNote>
      </PaperSlide>;
      const score = ev.score;
      const bandClass = score >= 80 ? "high" : (score >= 50 ? "moderate" : "low");
      const bandLabel = score >= 80 ? "High" : (score >= 50 ? "Moderate" : "Low");
      const blockers = ev.blockers || [];
      return <PaperSlide {...chrome} eyebrow={eyebrow}>
        <h2 className="headline">Evaluability Assessment</h2>
        <p className="lede">Is this programme ready to be evaluated? Five-dimension readiness score.</p>
        <div className="eval-layout">
          <div>
            <div className="eval-hero">
              <span className="sval">{score}</span>
              <span className="scap">/ 100</span>
            </div>
            <span className={`eval-band ${bandClass}`}>{bandLabel} evaluability</span>
            {blockers.length > 0 && <div className="eval-blockers">
              <div className="bk">Key constraints</div>
              {blockers.map((b, i) => <div key={i} className="bitem">{typeof b === "string" ? b : (b.label || b.text || "")}</div>)}
            </div>}
          </div>
          <div className="eval-radar"><EvaluabilityRadar dimensions={ev.dimensions || []} /></div>
        </div>
      </PaperSlide>;
    }
    case "timeline":
      return <PaperSlide {...chrome} eyebrow={eyebrow}>
        <h2 className="headline">Timeline</h2>
        <p className="lede">Twelve-month evaluation schedule by phase.</p>
        <GanttGrid deckState={deckState} />
      </PaperSlide>;
    case "team": {
      const defaults = [
        { role: "Team Leader", name: "Dr. [Name]", resp: "Overall direction, donor liaison, final report" },
        { role: "Senior Methodologist", name: "[Name]", resp: "Quantitative design, DiD modelling, sampling" },
        { role: "Qualitative Lead", name: "[Name]", resp: "KII and FGD design, thematic analysis, fieldwork oversight" },
        { role: "Field Coordinator", name: "[Name]", resp: "Enumerator training, logistics, data quality" },
        { role: "M&E Specialist", name: "[Name]", resp: "HMIS integration, indicator validation" }
      ];
      return <PaperSlide {...chrome} eyebrow={eyebrow}>
        <h2 className="headline">Team and Roles</h2>
        <p className="lede">Core evaluation team and division of responsibilities.</p>
        <div className="ltable">
          <div className="lrow lhead" style={{ gridTemplateColumns: "220px 210px 1fr" }}>
            <span>Role</span><span>Name</span><span>Responsibilities</span>
          </div>
          {defaults.map((d, i) => <div key={i} className="lrow" style={{ gridTemplateColumns: "220px 210px 1fr" }}>
            <EditableText path={`team.${i}.role`} value={d.role} deckState={deckState} className="lstrong" ariaLabel="Role" />
            <EditableText path={`team.${i}.name`} value={d.name} deckState={deckState} ariaLabel="Name" />
            <EditableText path={`team.${i}.resp`} value={d.resp} deckState={deckState} multiline ariaLabel="Responsibilities" />
          </div>)}
        </div>
      </PaperSlide>;
    }
    case "risks": {
      const defaults = [
        { risk: "Security deterioration in target districts", like: "Medium", impact: "High", mit: "Remote enumeration protocol; drop non-accessible districts from the sample" },
        { risk: "HMIS data incompleteness at baseline", like: "High", impact: "Medium", mit: "Triangulate with facility audit; sensitivity analysis" },
        { risk: "Enumerator attrition during fieldwork", like: "Medium", impact: "Medium", mit: "Oversample and rolling training; daily data quality checks" },
        { risk: "Government counterpart changes mid-evaluation", like: "Low", impact: "Medium", mit: "Documented ToR; quarterly stakeholder briefings" }
      ];
      return <PaperSlide {...chrome} eyebrow={eyebrow}>
        <h2 className="headline">Risks and Mitigations</h2>
        <p className="lede">Top risks and planned responses. Adjust before the inception meeting.</p>
        <div className="ltable">
          <div className="lrow lhead" style={{ gridTemplateColumns: "2fr 100px 100px 3fr" }}>
            <span>Risk</span><span>Likelihood</span><span>Impact</span><span>Mitigation</span>
          </div>
          {defaults.map((d, i) => <div key={i} className="lrow" style={{ gridTemplateColumns: "2fr 100px 100px 3fr" }}>
            <EditableText path={`risks.${i}.risk`} value={d.risk} deckState={deckState} multiline className="lstrong" ariaLabel="Risk" />
            <EditableText path={`risks.${i}.like`} value={d.like} deckState={deckState} className="lmono" ariaLabel="Likelihood" />
            <EditableText path={`risks.${i}.impact`} value={d.impact} deckState={deckState} className="lmono" ariaLabel="Impact" />
            <EditableText path={`risks.${i}.mit`} value={d.mit} deckState={deckState} multiline ariaLabel="Mitigation" />
          </div>)}
        </div>
      </PaperSlide>;
    }
    case "deliverables": {
      const defaults = [
        { name: "Inception Report", due: "Month 2" },
        { name: "Data Collection Tools (finalised)", due: "Month 3" },
        { name: "Fieldwork Plan and Training Package", due: "Month 4" },
        { name: "Preliminary Findings Note", due: "Month 8" },
        { name: "Draft Evaluation Report", due: "Month 10" },
        { name: "Final Evaluation Report and Dissemination Materials", due: "Month 12" }
      ];
      return <PaperSlide {...chrome} eyebrow={eyebrow}>
        <h2 className="headline">Deliverables Schedule</h2>
        <p className="lede">Key outputs and target delivery dates.</p>
        <div className="ltable">
          <div className="lrow lhead" style={{ gridTemplateColumns: "1fr 160px" }}>
            <span>Deliverable</span><span>Due</span>
          </div>
          {defaults.map((d, i) => <div key={i} className="lrow" style={{ gridTemplateColumns: "1fr 160px" }}>
            <EditableText path={`deliverables.${i}.name`} value={d.name} deckState={deckState} className="lstrong" ariaLabel="Deliverable" />
            <EditableText path={`deliverables.${i}.due`} value={d.due} deckState={deckState} className="lmono" ariaLabel="Due date" />
          </div>)}
        </div>
      </PaperSlide>;
    }

    /* ============ Findings ============ */
    case "programme-recap": {
      return <PaperSlide {...chrome} eyebrow={eyebrow}>
        <h2 className="headline">{safe(meta.programme_name, "Programme")}</h2>
        <p className="lede">{[safe(meta.organisation, ""), safe(meta.country, "")].filter(s => s && s !== "Not specified").join(", ")}. {fmt(meta.operating_context)} context, {fmt(meta.timeline)} duration, budget {fmt(meta.budget)}.</p>
        <div className="param-grid cols-4" style={{ marginTop: "auto" }}>
          <div className="param"><div className="k">Sectors</div><div className="v" style={{ fontSize: 13.5 }}>{(meta.health_areas || []).map(fmt).join(", ") || safe(meta.sector)}</div></div>
          <div className="param"><div className="k">Target Population</div><div className="v" style={{ fontSize: 13.5 }}>{safe(ctx.tor_constraints?.target_population)}</div></div>
          <div className="param"><div className="k">Evaluation Questions</div><div className="v num">{(ctx.evaluation_matrix?.rows || []).length}</div></div>
          <div className="param"><div className="k">Criteria Covered</div><div className="v num">{distinctCriteria(ctx).length}</div></div>
        </div>
      </PaperSlide>;
    }
    case "methodology-recap": {
      const dr = ctx.design_recommendation || {};
      const top = dr.ranked_designs?.[0] || (dr.selected_design ? { id: dr.selected_design } : null);
      const quantPlanned = ctx.sample_parameters?.result?.primary;
      const qualPlanned = (ctx.sample_parameters?.qualitative_plan?.breakdown || []).reduce((s, b) => s + (b.count || 0), 0);
      const quantAchieved = Number(deckState.getOverride("findings.sample.quant_achieved", findings ? findings.sample_achieved.quant : quantPlanned)) || 0;
      const qualAchieved = Number(deckState.getOverride("findings.sample.qual_achieved", findings ? findings.sample_achieved.qual : qualPlanned)) || 0;
      const headDefault = findings
        ? "The design held. 93.1 percent of the planned sample was reached."
        : "Methodology and achieved sample";
      return <PaperSlide {...chrome} eyebrow={eyebrow}>
        <EditableText as="h2" className="headline" path="findings.method.headline" value={headDefault} deckState={deckState} multiline ariaLabel="Slide headline" />
        <p className="lede">Design used: {top ? safe(top.name, fmt(top.id)) : "not specified in the Workbench"}. Achieved sample against plan.</p>
        <div style={{ marginTop: 6 }}>
          <div style={{ display: "grid", gridTemplateColumns: "210px 1fr 190px", gap: 18, borderBottom: "1px solid var(--paper-line-strong)", borderTop: "2px solid var(--ink)", padding: "7px 2px" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-3)" }}>Strand</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-3)" }}>Achievement</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-3)", textAlign: "right" }}>Achieved of planned</span>
          </div>
          <AchievementRow name="Quantitative" sub={ctx.sample_parameters?.result?.label || ""}
            planned={quantPlanned} achieved={quantAchieved}
            noteNode={<div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 5 }}>
              <EditableText path="findings.sample.quant_notes" value={findings ? findings.sample_achieved.quant_note : ""} deckState={deckState} multiline placeholder="Response rate and attrition notes" ariaLabel="Quantitative sample notes" />
            </div>} />
          <AchievementRow name="Qualitative" sub={`${(ctx.sample_parameters?.qualitative_plan?.breakdown || []).length} methods planned`}
            planned={qualPlanned} achieved={qualAchieved}
            noteNode={<div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 5 }}>
              <EditableText path="findings.sample.qual_notes" value={findings ? findings.sample_achieved.qual_note : ""} deckState={deckState} multiline placeholder="Completion against plan, substitutions" ariaLabel="Qualitative sample notes" />
            </div>} />
        </div>
        {top && <div className="param-grid cols-2" style={{ marginTop: "auto" }}>
          <div className="param"><div className="k">Design</div><div className="v" style={{ fontSize: 13.5 }}>{safe(top.name, fmt(top.id))}</div></div>
          <div className="param"><div className="k">Comparison</div><div className="v" style={{ fontSize: 13.5 }}>{fmt(ctx.tor_constraints?.comparison_feasibility || dr.answers?.comparison)}</div></div>
        </div>}
      </PaperSlide>;
    }
    case "performance": {
      const criteria = distinctCriteria(ctx);
      const rows = ctx.evaluation_matrix?.rows || [];
      if (!criteria.length) return <PaperSlide {...chrome} eyebrow={eyebrow}>
        <h2 className="headline">Performance Summary</h2>
        <StationNote>No criteria found in the evaluation matrix.</StationNote>
      </PaperSlide>;
      return <PaperSlide {...chrome} eyebrow={eyebrow}>
        <h2 className="headline">Performance at a glance</h2>
        <p className="lede">One rating and one sentence per criterion. Detail follows on the criterion slides.</p>
        <div className="ltable">
          <div className="lrow lhead" style={{ gridTemplateColumns: "180px 210px 1fr 90px" }}>
            <span>Criterion</span><span>Rating</span><span>In one sentence</span><span style={{ textAlign: "right" }}>EQs</span>
          </div>
          {criteria.map(cr => {
            const eqRefs = rows.filter(r => r.criterion === cr).map(r => `EQ${r.number}`).join("  ");
            const def = findings?.criteria?.[cr];
            return <div key={cr} className="lrow" style={{ gridTemplateColumns: "180px 210px 1fr 90px", alignItems: "center" }}>
              <span className="lstrong">{fmt(cr)}</span>
              <RatingControl path={`findings.${cr}.rating`} def={findings?.ratings?.[cr] || 0} deckState={deckState} />
              <EditableText path={`findings.${cr}.takeaway`} value={def ? def.takeaway : ""} deckState={deckState} multiline
                placeholder="One-sentence takeaway" ariaLabel={`${fmt(cr)} takeaway`} style={{ fontSize: 13 }} />
              <span className="lmono" style={{ textAlign: "right" }}>{eqRefs}</span>
            </div>;
          })}
        </div>
      </PaperSlide>;
    }
    case "headline-findings": {
      const defs = findings ? findings.headline : [
        { title: "", body: "", strength: null },
        { title: "", body: "", strength: null },
        { title: "", body: "", strength: null }
      ];
      const effects = findings ? findings.effects : [];
      return <PaperSlide {...chrome} eyebrow={eyebrow}>
        <EditableText as="h2" className="headline" path="headline.title" value={findings ? "Three results that matter" : "Headline findings"} deckState={deckState} ariaLabel="Slide headline" />
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          {defs.map((d, i) => <div key={i} className="hf-row">
            <span className="hf-num">{pad2(i + 1)}</span>
            <span>
              <EditableText as="div" className="hf-title" path={`headline.${i}.title`} value={d.title} deckState={deckState} multiline
                placeholder={`Headline finding ${i + 1}, one statement sentence`} ariaLabel={`Headline finding ${i + 1}`} />
              <EditableText as="div" className="hf-body" path={`headline.${i}.body`} value={d.body} deckState={deckState} multiline
                placeholder="Two supporting sentences with the number that proves it" ariaLabel={`Headline finding ${i + 1} detail`} />
            </span>
            <span className="hf-side"><EvChip strength={d.strength} /></span>
          </div>)}
          {effects.length > 0 && <div style={{ marginTop: "auto", paddingTop: 12, height: 168 }}>
            <FxPlot effects={effects} />
          </div>}
        </div>
      </PaperSlide>;
    }
    case "finding-criterion": {
      const cr = slide.criterion;
      const rows = (ctx.evaluation_matrix?.rows || []).filter(r => r.criterion === cr);
      const def = findings?.criteria?.[cr];
      const crEqIds = new Set(rows.map(r => `EQ${r.number}`));
      const effects = (findings?.effects || []).filter(e => crEqIds.has(e.eq));
      return <PaperSlide {...chrome} eyebrow={eyebrow}>
        <EditableText as="h2" className="headline" path={`findings.${cr}.headline`} value={def ? def.takeaway : ""} deckState={deckState} multiline
          placeholder={`${fmt(cr)}: the finding in one sentence`} ariaLabel={`${fmt(cr)} headline`} />
        <div style={{ display: "flex", alignItems: "center", gap: 22, margin: "2px 0 16px" }}>
          <RatingControl path={`findings.${cr}.rating`} def={findings?.ratings?.[cr] || 0} deckState={deckState} />
          <EvChip strength={def ? def.strength : null} />
        </div>
        <div className="crit-cols">
          <div>
            <div className="crit-block-label">Evaluation questions</div>
            {rows.map((eq, i) => <div key={eq.id || i} className="crit-eq-item">
              <span className="n">EQ{eq.number || i + 1}</span>
              <span>{eq.question}</span>
            </div>)}
            <div className="crit-block-label" style={{ marginTop: 20 }}>Evidence base</div>
            <EditableText as="div" path={`findings.${cr}.evidence`} value={def ? def.evidence : ""} deckState={deckState} multiline
              placeholder="Sources and strength: what underpins this finding"
              ariaLabel={`${fmt(cr)} evidence`} style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--text-2)" }} />
          </div>
          <div>
            <div className="crit-block-label">Key findings</div>
            <EditableText as="div" className="crit-body" path={`findings.${cr}.key`} value={def ? def.key : ""} deckState={deckState} multiline
              placeholder="Three to four sentences. Lead with the most policy-relevant finding and cite the evidence."
              ariaLabel={`${fmt(cr)} key findings`} />
            {effects.length > 0 && <div style={{ marginTop: 18, height: effects.length * 60 + 40 }}>
              <FxPlot effects={effects} />
            </div>}
          </div>
        </div>
      </PaperSlide>;
    }
    case "cross-cutting": {
      const panels = [
        { k: "Gender and equity", path: "crosscut.gender", def: findings ? findings.crosscut.gender : "", ph: "How did effects differ by gender, age, and wealth? Where was uptake uneven?" },
        { k: "Do no harm", path: "crosscut.dnh", def: findings ? findings.crosscut.dnh : "", ph: "Unintended negative effects or protection concerns surfaced during fieldwork" },
        { k: "Human rights and inclusion", path: "crosscut.rights", def: findings ? findings.crosscut.rights : "", ph: "Access for marginalised or displaced populations" },
        { k: "Environment and climate", path: "crosscut.env", def: findings ? findings.crosscut.env : "", ph: "Climate or environmental considerations surfaced by the evaluation" }
      ];
      return <PaperSlide {...chrome} eyebrow={eyebrow}>
        <h2 className="headline">Cross-cutting Findings</h2>
        <p className="lede">Issues that cut across criteria: gender, equity, do no harm, rights, environment.</p>
        <div className="param-grid cols-2" style={{ flex: 1, alignItems: "stretch" }}>
          {panels.map((c, i) => <div key={i} className="param" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div className="k">{c.k}</div>
            <EditableText as="div" path={c.path} value={c.def} deckState={deckState} multiline placeholder={c.ph}
              ariaLabel={c.k} style={{ fontSize: 13, lineHeight: 1.55, color: "var(--text-2)", flex: 1 }} />
          </div>)}
        </div>
      </PaperSlide>;
    }
    case "evidence": {
      return <PaperSlide {...chrome} eyebrow={eyebrow}>
        <h2 className="headline">Evidence Quality and Limitations</h2>
        <p className="lede">What we know with confidence, and where the evidence is thinner.</p>
        <div className="param-grid cols-2" style={{ flex: 1, alignItems: "stretch" }}>
          <div className="param" style={{ display: "flex", flexDirection: "column", gap: 6, borderLeft: "2px solid var(--teal-ink)" }}>
            <div className="k">Strengths of the evidence base</div>
            <EditableText as="div" path="evidence.strengths" value={findings ? findings.evidence.strengths : ""} deckState={deckState} multiline
              placeholder="Sample sizes, triangulation, coverage, robustness checks"
              ariaLabel="Evidence strengths" style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--text-2)", flex: 1 }} />
          </div>
          <div className="param caution" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div className="k">Limitations</div>
            <EditableText as="div" path="evidence.limits" value={findings ? findings.evidence.limits : ""} deckState={deckState} multiline
              placeholder="Access constraints, bias risks, power limits, causal caveats"
              ariaLabel="Evidence limitations" style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--text-2)", flex: 1 }} />
          </div>
        </div>
      </PaperSlide>;
    }
    case "recommendations": {
      const defaults = findings ? findings.recommendations : [
        { rec: "", pri: "", own: "", tl: "" }, { rec: "", pri: "", own: "", tl: "" },
        { rec: "", pri: "", own: "", tl: "" }, { rec: "", pri: "", own: "", tl: "" }
      ];
      return <PaperSlide {...chrome} eyebrow={eyebrow}>
        <h2 className="headline">Recommendations</h2>
        <p className="lede">Prioritised actions with owners and timelines.</p>
        <div className="ltable">
          <div className="lrow lhead" style={{ gridTemplateColumns: "44px 3fr 90px 1.3fr 1fr" }}>
            <span></span><span>Recommendation</span><span>Priority</span><span>Owner</span><span>Timeline</span>
          </div>
          {defaults.map((d, i) => <div key={i} className="lrow" style={{ gridTemplateColumns: "44px 3fr 90px 1.3fr 1fr" }}>
            <span className="lnum">R{i + 1}</span>
            <EditableText path={`recs.${i}.rec`} value={d.rec} deckState={deckState} multiline placeholder="Action, stated as an imperative" ariaLabel={`Recommendation ${i + 1}`} />
            <EditableText path={`recs.${i}.pri`} value={d.pri} deckState={deckState} className="lmono" placeholder="High" ariaLabel="Priority" />
            <EditableText path={`recs.${i}.own`} value={d.own} deckState={deckState} placeholder="Owner" ariaLabel="Owner" style={{ fontSize: 13 }} />
            <EditableText path={`recs.${i}.tl`} value={d.tl} deckState={deckState} className="lmono" placeholder="When" ariaLabel="Timeline" />
          </div>)}
        </div>
      </PaperSlide>;
    }
    case "lessons": {
      return <PaperSlide {...chrome} eyebrow={eyebrow}>
        <h2 className="headline">Lessons and Next Steps</h2>
        <p className="lede">What this evaluation teaches future programmes, and what happens next.</p>
        <div className="param-grid cols-2" style={{ flex: 1, alignItems: "stretch" }}>
          <div className="param" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div className="k">Lessons for future programming</div>
            <EditableText as="div" path="lessons.future" value={findings ? findings.lessons.future : ""} deckState={deckState} multiline
              placeholder="Transferable lessons on design, implementation, and measurement"
              ariaLabel="Lessons" style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--text-2)", flex: 1 }} />
          </div>
          <div className="param" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div className="k">Next steps</div>
            <EditableText as="div" path="lessons.next" value={findings ? findings.lessons.next : ""} deckState={deckState} multiline
              placeholder="Validation workshop, dissemination plan, follow-up studies"
              ariaLabel="Next steps" style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--text-2)", flex: 1 }} />
          </div>
        </div>
      </PaperSlide>;
    }

    default:
      return <PaperSlide {...chrome} eyebrow={eyebrow}>
        <StationNote>Unknown slide type: {slide.type}</StationNote>
      </PaperSlide>;
  }
}
