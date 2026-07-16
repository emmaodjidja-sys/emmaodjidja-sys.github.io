/* ================= Edit mode context ================= */
/* true only inside the editor. Presenter, speaker, overview, and print all render
   plain typography: no form chrome can ever appear on a presented or printed slide. */
const EditCtx = createContext(false);

function EditableText({ path, value, deckState, multiline, placeholder, ariaLabel, as = "span", className = "", style }) {
  const editable = useContext(EditCtx);
  const current = deckState.getOverride(path, value);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(current);

  useEffect(() => { if (!editing) setDraft(current); }, [current, editing]);

  const Tag = as;

  if (!editable) {
    if (current === null || current === undefined || String(current).trim() === "") return null;
    return <Tag className={className} style={style}>{current}</Tag>;
  }

  function commit() {
    setEditing(false);
    const trimmed = (draft || "").trim();
    if (trimmed === (value === null || value === undefined ? "" : String(value)).trim()) deckState.setOverride(path, null);
    else deckState.setOverride(path, trimmed);
  }
  function cancel() { setEditing(false); setDraft(current); }

  if (editing) {
    const shared = {
      autoFocus: true,
      value: draft || "",
      onChange: e => setDraft(e.target.value),
      onBlur: commit,
      placeholder,
      "aria-label": ariaLabel || placeholder || "Editable field",
      className: "etext-input",
      style
    };
    if (multiline) return <textarea {...shared} rows={Math.max(2, String(draft || "").split("\n").length)}
      onKeyDown={e => { if (e.key === "Escape") cancel(); }} />;
    return <input {...shared} onKeyDown={e => { if (e.key === "Enter") commit(); else if (e.key === "Escape") cancel(); }} />;
  }

  const empty = current === null || current === undefined || String(current).trim() === "";
  return <Tag
    className={`etext ${className} ${empty ? "etext-empty" : ""}`}
    role="button" tabIndex={0}
    aria-label={`${ariaLabel || placeholder || "Field"}. Activate to edit.`}
    style={style}
    onClick={() => setEditing(true)}
    onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setEditing(true); } }}
  >{empty ? (placeholder || "Add text") : current}</Tag>;
}

/* ================= Slide chrome ================= */
function PaperSlide({ eyebrow, num, total, programme, children }) {
  return <div className="slide-canvas">
    <div className="s-head">
      <span className="s-eyebrow">{eyebrow}</span>
      <span className="s-mark">PRAXIS</span>
    </div>
    <div className="s-rule"></div>
    <div className="s-body">{children}</div>
    <div className="s-foot">
      <span>{programme}</span>
      <span>{pad2(num)} / {pad2(total)}</span>
    </div>
  </div>;
}

function InkDial() {
  const rings = [110, 170, 230, 290, 350];
  const ticks = Array.from({ length: 24 }, (_, i) => (i * 360) / 24);
  return <svg className="dial" width="700" height="700" viewBox="0 0 700 700" aria-hidden="true">
    {rings.map(r => <circle key={r} cx="350" cy="350" r={r} fill="none" stroke="rgba(231,237,245,0.05)" strokeWidth="1" />)}
    {ticks.map(a => {
      const rad = (a * Math.PI) / 180;
      const x1 = 350 + Math.cos(rad) * 340, y1 = 350 + Math.sin(rad) * 340;
      const x2 = 350 + Math.cos(rad) * 352, y2 = 350 + Math.sin(rad) * 352;
      return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(231,237,245,0.07)" strokeWidth="1" />;
    })}
    <circle cx="350" cy="350" r="2.5" fill="rgba(46,196,182,0.35)" />
  </svg>;
}

function InkSlide({ eyebrow, num, total, programme, children }) {
  return <div className="slide-canvas ink">
    <InkDial />
    {eyebrow && <div className="ink-eyebrow">{eyebrow}</div>}
    {children}
    <div className="ink-foot">
      <span>{programme}</span>
      <span>{pad2(num)} / {pad2(total)}</span>
    </div>
  </div>;
}

/* ================= Ratings and evidence chips ================= */
function RatingScale({ rating, editable, onSet, size }) {
  const r = Math.max(0, Math.min(4, Number(rating) || 0));
  const band = RATING_BANDS[r] || "Unrated";
  return <span className={`rating ${editable ? "editable" : ""}`}>
    <span className="cells">
      {[1, 2, 3, 4].map(i => editable
        ? <button key={i} type="button" className={`cell ${i <= r ? `on-${r}` : ""}`}
            style={size ? { width: size, height: size } : undefined}
            aria-label={`Set rating to ${i} (${RATING_BANDS[i]})`}
            onClick={() => onSet && onSet(i)} />
        : <span key={i} className={`cell ${i <= r ? `on-${r}` : ""}`} style={size ? { width: size, height: size } : undefined} />)}
    </span>
    {r > 0 && <span className={`band b${r}`}>{band}</span>}
  </span>;
}

function EvChip({ strength }) {
  const s = String(strength || "").toLowerCase();
  if (!["strong", "moderate", "limited"].includes(s)) return null;
  return <span className={`ev-chip ${s}`}><span className="sq"></span>{s} evidence</span>;
}

/* ================= Effect-size interval plot ================= */
function FxPlot({ effects, height }) {
  const fx = (effects || []).filter(e => e && e.est !== undefined && e.lo !== undefined && e.hi !== undefined);
  if (!fx.length) return null;
  const W = 1120;
  const rowH = 56;
  const topPad = 8, bottomPad = 30;
  const H = height || (fx.length * rowH + topPad + bottomPad);
  const plotX0 = 320, plotX1 = 980;
  let lo = Math.min(0, ...fx.map(e => e.lo));
  let hi = Math.max(0, ...fx.map(e => e.hi));
  const span = (hi - lo) || 1;
  lo -= span * 0.06; hi += span * 0.06;
  const x = v => plotX0 + ((v - lo) / (hi - lo)) * (plotX1 - plotX0);
  const fmtVal = (e) => `${e.est > 0 ? "+" : ""}${e.est}${e.unit === "%" ? " %" : " " + (e.unit || "")}`.trim();
  return <svg className="fx-plot" viewBox={`0 0 ${W} ${H}`} width="100%" height="100%"
    preserveAspectRatio="xMidYMid meet" style={{ display: "block" }} role="img"
    aria-label="Effect estimates with 95 percent confidence intervals">
    <line className="fx-zero" x1={x(0)} y1={topPad} x2={x(0)} y2={H - bottomPad + 6} />
    <text className="fx-tick" x={x(0)} y={H - bottomPad + 20} textAnchor="middle">0</text>
    {fx.map((e, i) => {
      const cy = topPad + i * rowH + rowH / 2;
      const sig = (e.lo > 0 && e.hi > 0) || (e.lo < 0 && e.hi < 0);
      const cls = sig ? "sig" : "ns";
      return <g key={i}>
        <text className="fx-label" x={0} y={cy - 2}>{e.label}</text>
        <text className="fx-eq" x={0} y={cy + 14}>{e.eq}{sig ? "" : "  (interval crosses zero)"}</text>
        <line className="fx-axis" x1={plotX0} y1={cy} x2={plotX1} y2={cy} />
        <line className={`fx-ci ${cls}`} x1={x(e.lo)} y1={cy} x2={x(e.hi)} y2={cy} />
        <line className={`fx-ci ${cls}`} x1={x(e.lo)} y1={cy - 5} x2={x(e.lo)} y2={cy + 5} />
        <line className={`fx-ci ${cls}`} x1={x(e.hi)} y1={cy - 5} x2={x(e.hi)} y2={cy + 5} />
        <circle className={`fx-dot ${cls}`} cx={x(e.est)} cy={cy} r={5} />
        <text className="fx-val" x={W} y={cy + 4} textAnchor="end">{fmtVal(e)}</text>
      </g>;
    })}
  </svg>;
}

/* ================= Achieved vs planned bars ================= */
function AchievementRow({ name, sub, planned, achieved, noteNode }) {
  const p = Number(planned) || 0;
  const a = Number(achieved) || 0;
  const pct = p > 0 ? Math.min(100, (a / p) * 100) : 0;
  return <div className="ach-row">
    <div className="ach-name">{name}<span className="sub">{sub}</span></div>
    <div>
      <div className="ach-track"><div className="ach-fill" style={{ width: `${pct}%` }}></div></div>
      {noteNode}
    </div>
    <div className="ach-nums"><strong>{a.toLocaleString("en-US")}</strong> of {p.toLocaleString("en-US")}<br />{p > 0 ? `${((a / p) * 100).toFixed(1)} percent` : ""}</div>
  </div>;
}

/* ================= ToC tree ================= */
function ToCTreeSVG({ nodes }) {
  const W = 1168, H = 520;
  const levels = [
    { key: "impact", label: "Impact" },
    { key: "outcome", label: "Outcomes" },
    { key: "output", label: "Outputs" },
    { key: "activity", label: "Activities" }
  ];
  const COL_W = W / 4;
  const MAX_PER_COL = 6;
  const boxW = COL_W - 30, boxH = 46, gap = 10;

  const grouped = levels.map((L, ci) => {
    const all = (nodes || []).filter(n => n.level === L.key);
    const shown = all.slice(0, MAX_PER_COL);
    const overflow = all.length - shown.length;
    const totalH = shown.length * boxH + (shown.length - 1) * gap + (overflow > 0 ? (boxH + gap) : 0);
    const startY = 64 + (H - 80 - totalH) / 2;
    const x = ci * COL_W + 15;
    return {
      level: L, x, count: all.length,
      boxes: shown.map((n, i) => ({ node: n, x, y: startY + i * (boxH + gap), cy: startY + i * (boxH + gap) + boxH / 2 })),
      overflowBox: overflow > 0 ? { x, y: startY + shown.length * (boxH + gap), cy: startY + shown.length * (boxH + gap) + boxH / 2, n: overflow } : null
    };
  });

  const links = [];
  for (let ci = 1; ci < levels.length; ci++) {
    grouped[ci].boxes.forEach(child => {
      grouped[ci - 1].boxes.forEach(parent => {
        links.push({ x1: parent.x + boxW, y1: parent.cy, x2: child.x, y2: child.cy });
      });
    });
  }

  return <svg className="toc-tree" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" width="100%">
    {levels.map((L, ci) => <g key={L.key}>
      <text x={ci * COL_W + 15} y={26} className="col-label">{L.label}</text>
      <text x={ci * COL_W + 15} y={42} className="col-count">{grouped[ci].count} element{grouped[ci].count === 1 ? "" : "s"}</text>
      <line x1={ci * COL_W + 15} y1={50} x2={ci * COL_W + 15 + boxW} y2={50} stroke="var(--ink)" strokeWidth="2" />
    </g>)}
    {links.map((L, i) => <path key={i} className="link" d={`M ${L.x1} ${L.y1} C ${(L.x1 + L.x2) / 2} ${L.y1}, ${(L.x1 + L.x2) / 2} ${L.y2}, ${L.x2} ${L.y2}`} />)}
    {grouped.flatMap(g => [
      ...g.boxes.map(b => <g key={b.node.id}>
        <rect className={`node-box ${g.level.key}`} x={b.x} y={b.y} width={boxW} height={boxH} rx={2} />
        <foreignObject x={b.x + 8} y={b.y + 4} width={boxW - 16} height={boxH - 8}>
          <div xmlns="http://www.w3.org/1999/xhtml" style={{ font: "500 11px 'Poppins','DM Sans',sans-serif", color: g.level.key === "impact" ? "#E7EDF5" : "#101827", display: "flex", alignItems: "center", height: "100%", lineHeight: 1.25, overflow: "hidden" }}>
            {b.node.title}
          </div>
        </foreignObject>
      </g>),
      g.overflowBox && <g key={`of-${g.level.key}`}>
        <rect className="overflow-chip" x={g.overflowBox.x} y={g.overflowBox.y} width={boxW} height={boxH} rx={2} />
        <text className="overflow-text" x={g.overflowBox.x + boxW / 2} y={g.overflowBox.cy + 4} textAnchor="middle">+{g.overflowBox.n} more</text>
      </g>
    ])}
  </svg>;
}

/* ================= Evaluability radar ================= */
function EvaluabilityRadar({ dimensions }) {
  const size = 380, cx = size / 2, cy = size / 2 + 6, r = 128;
  const dims = dimensions || [];
  if (!dims.length) return null;
  const n = dims.length;
  const angleFor = i => -Math.PI / 2 + (i * 2 * Math.PI / n);
  const pts = dims.map((d, i) => {
    const val = d.adjusted_score != null ? d.adjusted_score : d.system_score;
    const pct = d.max > 0 ? val / d.max : 0;
    const a = angleFor(i);
    return { x: cx + Math.cos(a) * r * pct, y: cy + Math.sin(a) * r * pct, label: d.label, val, max: d.max, a };
  });
  const axisEnds = dims.map((_, i) => {
    const a = angleFor(i);
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, a };
  });
  const labelPos = axisEnds.map(e => ({ x: cx + Math.cos(e.a) * (r + 24), y: cy + Math.sin(e.a) * (r + 24), a: e.a }));
  const polyD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
  return <svg viewBox={`0 0 ${size} ${size + 30}`} preserveAspectRatio="xMidYMid meet">
    {[0.25, 0.5, 0.75, 1].map(f => <circle key={f} className="ring" cx={cx} cy={cy} r={r * f} />)}
    {axisEnds.map((e, i) => <line key={i} className="axis" x1={cx} y1={cy} x2={e.x} y2={e.y} />)}
    <path className="poly" d={polyD} />
    {pts.map((p, i) => <circle key={i} className="pt" cx={p.x} cy={p.y} r={4} />)}
    {labelPos.map((lp, i) => {
      const anchor = Math.abs(lp.a + Math.PI / 2) < 0.1 || Math.abs(lp.a - Math.PI / 2) < 0.1 ? "middle" : (Math.cos(lp.a) > 0 ? "start" : "end");
      return <g key={i}>
        <text className="alabel" x={lp.x} y={lp.y - 4} textAnchor={anchor}>{pts[i].label}</text>
        <text className="ascore" x={lp.x} y={lp.y + 11} textAnchor={anchor}>{pts[i].val}/{pts[i].max}</text>
      </g>;
    })}
  </svg>;
}

/* ================= Home ================= */
const SOURCE_LABELS = { workbench: "Workbench handoff", sample: "Sample programme", manual: "Manual setup" };

function Home({ context, source, onPick, onStartCustom }) {
  const meta = context.project_meta || {};
  const programme = meta.programme_name || "Untitled programme";
  const rows = context.evaluation_matrix?.rows || [];
  const criterionCount = new Set(rows.map(r => r.criterion).filter(Boolean)).size;
  const findingsTotal = 11 + criterionCount;
  const generated = context.generated_at ? String(context.generated_at).slice(0, 10) : null;

  return <div className="main">
    <div className="eyebrow">Deck Generator</div>
    <h1 className="masthead-title">{programme}</h1>
    <p className="masthead-sub">
      Two decks, one engine: a pre-fieldwork Inception Brief and a post-fieldwork Findings Brief,
      generated from this project and edited inline. Presenter mode, speaker notes, and print-quality PDF export included.
    </p>
    <div className="ledger">
      <span className="ledger-seg">Source <strong>{SOURCE_LABELS[source] || "Unknown"}</strong></span>
      {meta.organisation && <span className="ledger-seg"><strong>{meta.organisation}</strong></span>}
      <span className="ledger-seg">Questions <strong>{rows.length}</strong></span>
      <span className="ledger-seg">Criteria <strong>{criterionCount}</strong></span>
      {generated && <span className="ledger-seg">Generated <strong>{generated}</strong></span>}
      {source === "sample" && <span className="ledger-seg"><a href="/praxis/workbench/">Build yours in the Workbench</a></span>}
    </div>

    <div className="deck-cards">
      <button className="deck-card" onClick={() => onPick("inception")}>
        <div className="deck-card-badge">Pre-fieldwork</div>
        <h3>Inception Brief</h3>
        <div className="deck-card-sub">For the donor inception meeting. Theory of change, evaluation questions, methodology, sampling, instruments, evaluability, timeline, team, and risks.</div>
        <div className="deck-card-meta">
          <span>16 slides</span>
          <span className="deck-card-go">{Icon.arrowRight(15)}</span>
        </div>
      </button>
      <button className="deck-card" onClick={() => onPick("findings")}>
        <div className="deck-card-badge">Post-fieldwork</div>
        <h3>Findings Brief</h3>
        <div className="deck-card-sub">For the results presentation. Performance summary across criteria, headline findings with effect estimates, criterion detail, recommendations, and lessons.</div>
        <div className="deck-card-meta">
          <span>{findingsTotal} slides, {criterionCount || "no"} criteria</span>
          <span className="deck-card-go">{Icon.arrowRight(15)}</span>
        </div>
      </button>
    </div>

    <div className="home-divider">or</div>
    <button className="start-own" onClick={onStartCustom}>
      <span>
        <span className="so-title">Start a deck from scratch</span>
        <span className="so-desc">Enter a programme name, purpose, and evaluation questions. Every slide stays editable inline.</span>
      </span>
      <span className="deck-card-go">{Icon.arrowRight(15)}</span>
    </button>

    <div className="home-foot">
      Inside a deck: <kbd>P</kbd> presents, <kbd>Ctrl</kbd>+<kbd>P</kbd> exports PDF, <kbd>?</kbd> lists every shortcut.
    </div>
  </div>;
}

/* ================= Setup form (manual deck) ================= */
function buildBlankContext({ org, programme, country, purpose, eqs }) {
  const validEqs = (eqs || []).filter(e => e.text && e.text.trim().length > 0);
  return {
    praxis_manual_setup: true,
    project_meta: {
      organisation: (org || "").trim(),
      programme_name: (programme || "").trim(),
      country: (country || "").trim(),
      health_areas: [], operating_context: "", budget: "", programme_maturity: "", timeline: "", sector: ""
    },
    tor_constraints: {
      evaluation_purpose: purpose ? [purpose] : [],
      causal_inference_level: "", geographic_scope: "", target_population: "", comparison_feasibility: ""
    },
    toc: { nodes: [] },
    evaluation_matrix: {
      rows: validEqs.map((eq, i) => ({ id: `eq${i + 1}`, number: i + 1, criterion: eq.criterion || "relevance", question: eq.text.trim(), dataSources: [] }))
    },
    design_recommendation: { selected_design: null, ranked_designs: [], justification: "", answers: {} },
    sample_parameters: { design_id: "", result: {}, qualitative_plan: { breakdown: [] } },
    instruments: { items: [] },
    analysis_plan: { rows: [] },
    evaluability: { score: null, dimensions: [], blockers: [] }
  };
}

function SetupForm({ onSubmit, onCancel }) {
  const [org, setOrg] = useState("");
  const [programme, setProgramme] = useState("");
  const [country, setCountry] = useState("");
  const [purpose, setPurpose] = useState("");
  const [eqs, setEqs] = useState([
    { text: "", criterion: "relevance" },
    { text: "", criterion: "effectiveness" },
    { text: "", criterion: "impact" }
  ]);
  const validEqCount = eqs.filter(e => e.text.trim().length > 0).length;
  const canSubmit = programme.trim().length > 0 && validEqCount >= 1;

  function updateEq(i, patch) { setEqs(prev => prev.map((e, idx) => idx === i ? { ...e, ...patch } : e)); }
  function addEq() { if (eqs.length < 6) setEqs(prev => [...prev, { text: "", criterion: "relevance" }]); }
  function removeEq(i) { if (eqs.length > 1) setEqs(prev => prev.filter((_, idx) => idx !== i)); }

  function submit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit(buildBlankContext({ org, programme, country, purpose, eqs }));
  }

  return <div className="setup-wrap">
    <div className="eyebrow">Deck Generator</div>
    <h1 className="masthead-title" style={{ fontSize: 30 }}>New deck setup</h1>
    <p className="masthead-sub">Enter the programme basics and evaluation questions. Everything else is edited inline once the deck exists.</p>
    <form onSubmit={submit}>
      <div className="setup-card">
        <h3>Programme</h3>
        <div className="setup-row">
          <div className="setup-field">
            <label htmlFor="su-org">Organisation</label>
            <input id="su-org" value={org} onChange={e => setOrg(e.target.value)} placeholder="e.g. UNICEF, MoH, World Bank" />
          </div>
          <div className="setup-field">
            <label htmlFor="su-country">Country / Region</label>
            <input id="su-country" value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g. Niger, South Asia" />
          </div>
        </div>
        <div className="setup-row one">
          <div className="setup-field">
            <label htmlFor="su-prog">Programme name (required)</label>
            <input id="su-prog" value={programme} onChange={e => setProgramme(e.target.value)} placeholder="e.g. Maternal Health Quality Improvement Programme" required />
          </div>
        </div>
        <div className="setup-row one">
          <div className="setup-field">
            <label htmlFor="su-purpose">Evaluation purpose</label>
            <select id="su-purpose" value={purpose} onChange={e => setPurpose(e.target.value)}>
              <option value="">Select one</option>
              {PURPOSES_LIST.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="setup-card">
        <h3>Evaluation questions<span className="hint">at least one, up to six</span></h3>
        {eqs.map((eq, i) => <div key={i} className="eq-row-setup">
          <textarea value={eq.text} onChange={e => updateEq(i, { text: e.target.value })} placeholder={`Evaluation question ${i + 1}`} aria-label={`Evaluation question ${i + 1}`} />
          <select value={eq.criterion} onChange={e => updateEq(i, { criterion: e.target.value })} aria-label="Criterion">
            {CRITERIA_LIST.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
          <button type="button" className="eq-remove" onClick={() => removeEq(i)} disabled={eqs.length <= 1} aria-label="Remove question">{Icon.close(13)}</button>
        </div>)}
        {eqs.length < 6 && <button type="button" className="eq-add" onClick={addEq}>{Icon.plus(12)} Add question</button>}
      </div>

      <div className="setup-actions">
        <button type="button" className="btn quiet" onClick={onCancel}>Back to decks</button>
        <button type="submit" className="btn primary" disabled={!canSubmit}>Create deck {Icon.arrowRight(13)}</button>
      </div>
    </form>
  </div>;
}
