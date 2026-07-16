/* ================= Scaled slide (editor stack) ================= */
function ScaledSlide({ children }) {
  const ref = useRef(null);
  const [width, setWidth] = useState(1100);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    function measure() { setWidth(Math.min(1100, el.clientWidth || 1100)); }
    measure();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  const scale = width / 1280;
  return <div className="slide-scale" ref={ref}>
    <div className="slide-scale-inner" style={{ width: 1280, height: 720, transform: `scale(${scale})`, marginBottom: (720 * scale) - 720 }}>
      {children}
    </div>
  </div>;
}

/* ================= Presenter ================= */
function templateIdFromSlides(slides) {
  return slides[0]?.type === "cover-findings" ? "findings" : "inception";
}

function Presenter({ slides, context, deckState, programme, source, onExit, initialIndex, onIndexChange }) {
  const [idx, setIdx] = useState(initialIndex || 0);
  const [mode, setMode] = useState("present");
  const [clock, setClock] = useState(() => new Date());
  const [scale, setScale] = useState(1);
  const rootRef = useRef(null);
  const templateId = templateIdFromSlides(slides);

  const go = useCallback((delta) => {
    setIdx(prev => Math.min(slides.length - 1, Math.max(0, prev + delta)));
  }, [slides.length]);

  useEffect(() => {
    document.body.classList.add("presenting");
    return () => document.body.classList.remove("presenting");
  }, []);

  useEffect(() => { onIndexChange?.(idx); }, [idx, onIndexChange]);

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    function resize() { setScale(Math.min(window.innerWidth / 1280, window.innerHeight / 720)); }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if ((e.key === "p" || e.key === "P") && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onExit?.();
        setTimeout(() => window.print(), 100);
        return;
      }
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { e.preventDefault(); go(1); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(-1); }
      else if (e.key === "Home") { setIdx(0); }
      else if (e.key === "End") { setIdx(slides.length - 1); }
      else if (e.key === "f") {
        if (!document.fullscreenElement) rootRef.current?.requestFullscreen?.();
        else document.exitFullscreen?.();
      }
      else if (e.key === "s") { setMode(m => m === "speaker" ? "present" : "speaker"); }
      else if (e.key === "o") { setMode(m => m === "overview" ? "present" : "overview"); }
      else if (e.key === "Escape") {
        if (mode !== "present") setMode("present");
        else onExit?.();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onExit, slides.length, mode]);

  const slide = { ...slides[idx], _siblings: slides };
  const nextSlide = idx < slides.length - 1 ? { ...slides[idx + 1], _siblings: slides } : null;
  const notesPath = `notes.${templateId}.${slide.id}`;
  const notes = deckState.getOverride(notesPath, "");

  if (mode === "overview") {
    const thumbScale = 0.2;
    return <div className="overview-root">
      <div className="overview-title">Overview. {slides.length} slides. Click any slide to jump. Esc returns.</div>
      <div className="overview-grid">
        {slides.map((s, i) => <div key={s.id} className={`overview-thumb ${i === idx ? "active" : ""}`} onClick={() => { setIdx(i); setMode("present"); }}>
          <div style={{ width: 1280 * thumbScale, height: 720 * thumbScale, overflow: "hidden" }}>
            <div style={{ width: 1280, height: 720, transformOrigin: "top left", transform: `scale(${thumbScale})` }}>
              {renderSlide({ ...s, _siblings: slides }, context, deckState, programme, source)}
            </div>
          </div>
          <div className="olabel"><span className="on">{pad2(s.num)}</span>{s.title}</div>
        </div>)}
      </div>
    </div>;
  }

  if (mode === "speaker") {
    const mainScale = Math.min((window.innerWidth * 0.55) / 1280, (window.innerHeight * 0.8) / 720);
    const nextScale = 0.15;
    return <div className="speaker-root">
      <div className="sv-main">
        <div style={{ width: 1280, height: 720, transform: `scale(${mainScale})`, transformOrigin: "center" }}>
          {renderSlide(slide, context, deckState, programme, source)}
        </div>
      </div>
      <div className="sv-side">
        <div className="sv-next">
          <span className="nlab">Up next</span>
          {nextSlide ? <>
            <span className="ntitle">{nextSlide.title}</span>
            <div style={{ width: 1280 * nextScale, height: 720 * nextScale, overflow: "hidden", borderRadius: 2 }}>
              <div style={{ width: 1280, height: 720, transformOrigin: "top left", transform: `scale(${nextScale})` }}>
                {renderSlide(nextSlide, context, deckState, programme, source)}
              </div>
            </div>
          </> : <span className="ntitle" style={{ color: "var(--chrome-dim)" }}>End of deck</span>}
        </div>
        <div className="sv-notes">
          <div className="sv-notes-title">Speaker notes, slide {idx + 1}</div>
          <textarea value={notes} onChange={e => deckState.setOverride(notesPath, e.target.value || null)}
            placeholder="Talking points, reminders, timings" aria-label="Speaker notes"
            style={{ width: "100%", minHeight: 200, background: "transparent", border: "none", color: "var(--chrome-text)", font: "inherit", fontSize: 14.5, resize: "vertical", lineHeight: 1.6, outline: "none" }} />
        </div>
      </div>
      <div className="sv-bottom">
        <span>{slide.title} · {idx + 1} / {slides.length}</span>
        <span className="sv-clock">{clock.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
      </div>
    </div>;
  }

  return <div className="presenter-root" ref={rootRef}>
    <div className="click-zone left" onClick={() => go(-1)} aria-hidden="true" />
    <div className="click-zone right" onClick={() => go(1)} aria-hidden="true" />
    <div className="stage">
      <div style={{ width: 1280, height: 720, transform: `scale(${scale})`, transformOrigin: "center", flexShrink: 0 }}>
        {renderSlide(slide, context, deckState, programme, source)}
      </div>
    </div>
    <div className="hud">
      <span className="hkey">Arrows</span> Navigate
      <span className="hsep">/</span>
      <span className="hkey">F</span> Fullscreen
      <span className="hsep">/</span>
      <span className="hkey">S</span> Speaker
      <span className="hsep">/</span>
      <span className="hkey">O</span> Overview
      <span className="hsep">/</span>
      <span className="hkey">Esc</span> Exit
      <span className="hsep">/</span>
      <span>{idx + 1} / {slides.length}</span>
    </div>
  </div>;
}

/* ================= App ================= */
function App() {
  const [ctxState, setCtxState] = useState(() => loadContext());
  const { context, source } = ctxState;
  const [template, setTemplate] = useState(null);
  const [setupMode, setSetupMode] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const [presentIdx, setPresentIdx] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const fileRef = useRef(null);

  const programme = context.project_meta?.programme_name || "Untitled programme";
  const deckState = useDeckState(programme, template || "inception");

  useEffect(() => {
    function onHash() {
      const m = (window.location.hash || "").match(/^#\/(inception|findings)\/(\d+)$/);
      if (m) {
        setTemplate(m[1]);
        setPresentIdx(Math.max(0, parseInt(m[2], 10) - 1));
        setPresenting(true);
      }
    }
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "?" && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
        setShowShortcuts(s => !s);
      } else if (e.key === "p" && !e.ctrlKey && !e.metaKey && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA" && template && !presenting) {
        setPresenting(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [template, presenting]);

  if (setupMode) {
    return <SetupForm
      onCancel={() => setSetupMode(false)}
      onSubmit={(newContext) => {
        try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(newContext)); } catch (e) {}
        setCtxState({ context: newContext, source: "manual" });
        setSetupMode(false);
      }}
    />;
  }

  if (!template) {
    return <Home
      context={context}
      source={source}
      onPick={(t) => { saveLastTemplate(t); setTemplate(t); }}
      onStartCustom={() => setSetupMode(true)}
    />;
  }

  const slides = template === "inception" ? buildInceptionSlides(context) : buildFindingsSlides(context);

  if (presenting) {
    return <Presenter
      slides={slides}
      context={context}
      deckState={deckState}
      programme={programme}
      source={source}
      initialIndex={Math.min(presentIdx, slides.length - 1)}
      onIndexChange={(i) => { window.location.hash = `#/${template}/${i + 1}`; }}
      onExit={() => { setPresenting(false); if (window.location.hash) history.replaceState(null, "", window.location.pathname + window.location.search); }}
    />;
  }

  async function onImportFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const parsed = await importDeckJSON(f);
      if (parsed.template && parsed.template !== template) {
        if (!window.confirm(`This file is a "${parsed.template}" deck. Switch deck and load it?`)) return;
        setTemplate(parsed.template);
      }
      deckState.replaceAll(parsed.overrides);
    } catch (err) {
      window.alert("Import failed: " + err.message);
    } finally {
      e.target.value = "";
    }
  }

  return <div className="editor-wrap">
    <div className="editor-toolbar">
      <span className="deck-label">{template === "inception" ? "Inception Brief" : "Findings Brief"}</span>
      <button className="btn quiet" onClick={() => setTemplate(null)}>{Icon.swap(13)} Switch deck</button>
      <div className="tspacer"></div>
      {deckState.hasOverrides && <button className="btn quiet" onClick={() => { if (window.confirm("Discard every inline edit for this deck?")) deckState.resetAll(); }} title="Discard all inline edits">{Icon.reset(13)} Reset edits</button>}
      <button className="btn" onClick={() => fileRef.current?.click()} title="Load a previously exported deck file">{Icon.upload(13)} Import</button>
      <input ref={fileRef} type="file" accept=".json,.deck.json,application/json" className="sr-only" aria-label="Import deck JSON" onChange={onImportFile} />
      <button className="btn" onClick={() => exportDeckJSON(template, programme, context, deckState.overrides)} title="Download the editable deck state">{Icon.download(13)} Export</button>
      <button className="btn" onClick={() => window.print()} title="Print or save as PDF">{Icon.print(13)} PDF</button>
      <button className="btn" onClick={() => setShowShortcuts(true)} title="Keyboard shortcuts" aria-label="Keyboard shortcuts">{Icon.question(14)}</button>
      <button className="btn primary" onClick={() => setPresenting(true)}>{Icon.play(11)} Present</button>
    </div>
    <div className="editor-annot"><span className="dot"></span>Click any text on a slide to edit it. Edits stay in this browser and never appear as form fields in the presented or printed deck.</div>

    {showShortcuts && <div className="shortcuts-modal" onClick={() => setShowShortcuts(false)}>
      <div className="smbody" role="dialog" aria-label="Keyboard shortcuts" onClick={(e) => e.stopPropagation()}>
        <h3>Keyboard shortcuts</h3>
        <div className="shrow"><span>Present</span><kbd>P</kbd></div>
        <div className="shrow"><span>Navigate slides</span><span><kbd>Left</kbd> <kbd>Right</kbd></span></div>
        <div className="shrow"><span>Fullscreen</span><kbd>F</kbd></div>
        <div className="shrow"><span>Speaker view</span><kbd>S</kbd></div>
        <div className="shrow"><span>Overview grid</span><kbd>O</kbd></div>
        <div className="shrow"><span>Export PDF</span><span><kbd>Ctrl</kbd> + <kbd>P</kbd></span></div>
        <div className="shrow"><span>Exit or close</span><kbd>Esc</kbd></div>
        <div className="shrow"><span>Show this panel</span><kbd>?</kbd></div>
      </div>
    </div>}

    <EditCtx.Provider value={true}>
      <div className="edit-on">
        {slides.map(slide => {
          const slideWithSiblings = { ...slide, _siblings: slides };
          return <div key={slide.id} className="slide-wrap">
            <div className="slide-meta"><span className="snum">{pad2(slide.num)}</span> {slide.title}</div>
            <ScaledSlide>{renderSlide(slideWithSiblings, context, deckState, programme, source)}</ScaledSlide>
          </div>;
        })}
      </div>
    </EditCtx.Provider>
  </div>;
}

const rootEl = typeof document !== "undefined" && document.getElementById ? document.getElementById("root") : null;
if (rootEl) ReactDOM.createRoot(rootEl).render(<App />);

/* Test surface (Node vm harness reads this; harmless in the browser). */
window.__DECK_TEST__ = {
  buildInceptionSlides, buildFindingsSlides, distinctCriteria,
  DEMO_CONTEXT, DEMO_FINDINGS, migrateImport, slugify, RATING_BANDS
};
