/**
 * FirstReview: the rapid red-flag screen of an incoming evaluation report,
 * shared by the commissioner cockpit (C3 Deliver, role 'commissioner') and
 * Station 7 (pre-submission self-screen, role 'team'). Pure logic lives in
 * PraxisScreenCore; this file is only the panel. Runs persist to the shared
 * top-level context.report_screens via SAVE_STATION stationId 10 (a key no
 * station depends on, so screen saves never mark the rail stale).
 * window.FirstReview. No-JSX React.createElement house style.
 */
(function() {
  'use strict';
  var h = React.createElement;

  function core() { return window.PraxisScreenCore; }

  function fdate(iso) { return window.CockpitData ? window.CockpitData.fdate(iso) : String(iso || '').slice(0, 10); }

  // toastType defaults to 'success' (the ordinary save), but a caller may ask for
  // any type the toast component supports (info | success | warning | error). A
  // save whose MESSAGE is a caution must not arrive in the green of a clean save:
  // this feature's organising principle is that nothing shows green unless it is
  // actually good, and a hardcoded 'success' broke that for the short-text
  // warning ("the text was under 500 words. Is that the whole report?").
  function saveScreens(dispatch, nextList, msg, toastType) {
    var AT = PraxisContext.ACTION_TYPES;
    dispatch({ type: AT.SAVE_STATION, stationId: 10, payload: { report_screens: nextList } });
    if (msg) dispatch({ type: AT.SHOW_TOAST, message: msg, toastType: toastType || 'success' });
  }

  var SEV_LABEL = { critical: 'Critical', major: 'Major' };
  var GROUPS = [
    { key: 'own', title: 'This evaluation', sources: { eq: 1, design: 1, sample: 1, structure: 1, timing: 1 } },
    { key: 'uneg', title: 'Report quality (UNEG and OECD-DAC)', sources: { uneg: 1 } },
    { key: 'ethics', title: 'Ethics and safeguarding', sources: { ethics: 1 } }
  ];

  // The deliverable a commissioner run defaults to: the most recent submitted
  // deliverable whose type or title reads as a report.
  //
  // FALLBACK, and it is not cosmetic. An UNATTACHED run has no report date, so
  // buildScreenItems computes the timing item against TODAY: on a project whose
  // final report was delivered on time, months ago, "the report is in time for
  // the decision" is then answered No against a window that closed long after
  // the report actually landed, and the run opens with a critical red flag that
  // is an artifact of the run not being attached to anything. A schedule with no
  // deliverable in 'submitted' status is the normal case, not an odd one (both
  // worked examples are like this: their final report sits at 'accepted'), so
  // the picker falls back to the deliverable a first review is FOR, which the
  // codebase already identifies: the final report. Unattached stays the last
  // resort, for a schedule that has no final report at all.
  function defaultDeliverableId(deliverables) {
    for (var i = deliverables.length - 1; i >= 0; i--) {
      var d = deliverables[i];
      if (d && d.status === 'submitted' && (/report/i.test(String(d.type || '')) || /report/i.test(String(d.title || '')))) return d.id;
    }
    // CockpitData is loaded on both lenses, but this file must not assume it:
    // Station 7 renders the same panel for the team, and a missing module should
    // degrade to an unattached run, not throw.
    var D = window.CockpitData;
    var fr = (D && D.finalReportDeliverable) ? D.finalReportDeliverable(deliverables) : null;
    return (fr && fr.id) ? fr.id : '';
  }

  // ---- small atoms ----------------------------------------------------------

  function sevTag(sev) {
    return h('span', { className: 'wb-fr-sev wb-fr-sev--' + sev }, SEV_LABEL[sev] || sev);
  }

  function answerButtons(item, onAnswer) {
    var C = core();
    var keys = ['yes', 'partial', 'no', 'cant_tell'];
    return h('div', { className: 'wb-fr-ans', role: 'group', 'aria-label': 'Answer for: ' + item.text },
      keys.map(function(k) {
        var on = item.answer === k;
        return h('button', { key: k, type: 'button',
          className: 'wb-fr-ans-btn wb-fr-ans-btn--' + k + (on ? ' wb-fr-ans-btn--on' : ''),
          'aria-pressed': on ? 'true' : 'false',
          onClick: function() { onAnswer(item.id, k); } }, C.ANSWER_LABELS[k]);
      }));
  }

  // What a keyword scan cannot see, said once, in the reviewer's own words. It rides
  // on EVERY absence, on every item, in every language, because it is true of every
  // absence: the scan matched none of its patterns, and that is a fact about the
  // patterns.
  var ABSENCE_NOTE = 'No keyword match. A keyword scan cannot see a synonym, a section under a different title, a point made without a heading, or a language it does not read, so this is not evidence that the report omits it. Read the section and answer this one yourself.';

  // Indicative signal from the paste-text prescan. A signal is a keyword or
  // heading match and nothing more: it is a DETECTION, never an approval. The
  // copy here has to carry that, because the failure mode is a reviewer reading
  // a chip as a tick. 'ethics:consent' fires on the word "consent" appearing
  // anywhere, a bibliography entry included, on a critical safeguarding item;
  // an EQ 'found' means the report mentions the question's TOPIC, which is not
  // the same fact as the question having been answered, so its chip prints the
  // denominator (matched 4 of 8 terms) and says so.
  //
  // PRIVACY: `evidence` is passed in from session state and is NEVER read off
  // the item. It is a line lifted verbatim from a confidential report (the worst
  // case, seen in a real fixture, is "Consent was refused by <name>, age 14, of
  // <village>"), so it is not allowed anywhere near the run, the context,
  // localStorage, the project file or an export. It lives in this tab, for this
  // session, and dies with it.
  function machineChip(item, onConfirm, evidence) {
    // The AUTO item (timing) is computed, so no chip and no confirm may ever be
    // offered on it. prescan emits no signal for it either; this is the belt to
    // that brace.
    if (!item.machine_signal || item.auto) return null;
    var C = core();
    // THE CENTRAL INVARIANT OF THIS FEATURE LIVES IN THIS TABLE, and `answer` is all
    // of it. `answer` is what a one-click confirm would RECORD, and not_found has
    // NONE, so there is no answer for the button to write and no code path below that
    // can render it. That is a structural property, not a tuned one: it holds in every
    // language, every script and every regime, and it needs the scanner to know
    // nothing at all about what it just read.
    //
    // found and weak are DETECTIONS. The scanner genuinely SAW the word it reports,
    // whatever language surrounds it, and the reviewer can check that in one glance,
    // so the shortcut is honest and it stays.
    //
    // not_found is an ABSENCE CLAIM, and this scanner cannot earn one. It means "my
    // regex did not match a heading", never "the report omits this". It is wrong on a
    // perfectly good English report whose limitations section is called "Caveats and
    // what we could not do"; it is wrong on every report in a language the patterns do
    // not cover, and three separate attempts to detect that language from the text
    // were each defeated by the next input class (see ScreenCore). One click from
    // there used to write a critical red flag -> recommendVerdict returns 'return' ->
    // the commissioner's one-click "Request revision on the deliverable", which flips
    // the deliverable and writes the audit log. So there is no click from there any
    // more, and the row says why in visible text. The reviewer can still answer No: on
    // the ordinary answer buttons, having read the section, which is the point.
    var map = {
      found: { label: 'mentioned in the text', cls: 'wb-fr-chip--found', answer: 'yes' },
      weak: { label: 'weak signal only', cls: 'wb-fr-chip--weak', answer: 'partial' },
      not_found: { label: 'no keyword match', cls: 'wb-fr-chip--none', answer: null }
    };
    var m = map[item.machine_signal];
    if (!m) return null;
    var absent = !m.answer;
    var label = 'Text scan: ' + m.label;
    var isEq = item.machine_total != null;
    if (isEq) label += ', matched ' + item.machine_hits + ' of ' + item.machine_total + ' question terms';
    // The gate is on whether the chip PRINTS A COUNT, not on the item's source
    // label or severity as such, and never on the language or script of the
    // pasted text. eq:* prints its own denominator right here in the chip label
    // ("matched 3 of 8 question terms"); sample:achieved prints the sample
    // figures it found against the planned n; structure:agreed prints how many
    // of the agreed section titles it detected as headings. All three show the
    // reviewer, in the same breath as the shortcut, exactly how thin the basis
    // is, so the shortcut stays.
    //
    // uneg:* has no denominator to print, and it fails for the identical reason
    // ethics does: 'found' on uneg:methods or uneg:limitations means a regex
    // matched ONE heading, full stop, and the line it quotes as "Basis:" can be
    // a table-of-contents entry ("2. Limitations .......... 14") or an annex
    // title lifted from the donor's bound-in Terms of Reference, in whatever
    // language the report is written in: a Spanish evaluation report with an
    // English ToR annex hands the scanner English headings for uneg:exec,
    // uneg:methods (critical), uneg:limitations (critical) and
    // uneg:recommendations, and a hurried reviewer can clear both critical
    // report-quality items with two clicks on a report the scanner never
    // actually read. ethics:* has no denominator either, for the reason noted
    // above (a bibliography entry or an annex title LOOKS like corroboration of
    // a critical, GBV-adjacent safeguarding claim). Both lose the shortcut. The
    // chip and the basis line stay for both (the reviewer loses no information,
    // only the shortcut), and both carry the same kind of visible caveat, worded
    // for what each family actually is.
    var hasDenominator = item.source === 'eq' || item.id === 'sample:achieved' || item.id === 'structure:agreed';
    var withheld = item.source === 'ethics' || item.source === 'uneg';
    // Two independent conditions, and the FIRST of them can never be satisfied by an
    // absence, whatever the text, whatever the language: absences carry no answer to
    // record. Withheld sources never get the shortcut either, whatever count their
    // chip happens to print, and neither does an item the reviewer has already
    // answered.
    var canConfirm = !!m.answer && hasDenominator && !withheld && !item.answer;
    // An absence has no "Basis": there is no line to quote, and framing a non-match as
    // a basis for anything is the misreading this whole change exists to stop. What it
    // has instead is the derived sentence prescan wrote (which names no body text: it
    // is a count, an n= note, or the agreed titles the keywords did not match) and then
    // the plain statement of what a keyword scan cannot see.
    var basis = absent
      ? (evidence || 'No keyword match for this item.')
      : (evidence
        ? 'Basis: ' + evidence
        : 'Basis: the scanned text was discarded, so the matching line is no longer available. Re-scan to see it.');
    return h('div', { className: 'wb-fr-sig' },
      h('span', { className: 'wb-fr-chip ' + m.cls,
        title: absent
          ? 'The scan matched none of its keywords for this item. It reports what its patterns did, not whether the requirement is met.'
          : 'A keyword or heading match in the text you pasted. It reports what the words do, not whether the requirement is met.' },
        label,
        canConfirm ? h('button', { type: 'button', className: 'wb-fr-chip-confirm',
          'aria-label': 'Record ' + C.ANSWER_LABELS[m.answer] + ' as my answer for: ' + item.text,
          onClick: function() { onConfirm(item.id, m.answer); } }, 'I checked. Record ' + C.ANSWER_LABELS[m.answer]) : null),
      h('p', { className: 'wb-fr-ev' }, basis,
        (isEq && !absent) ? h('span', { className: 'wb-fr-ev-note' }, ' The report mentions the topic. Whether it answers the question is yours to judge.') : null,
        (evidence && !absent) ? h('span', { className: 'wb-fr-ev-note' }, ' Shown in this tab only; never saved.') : null),
      // Visible text, not a tooltip: a caveat nobody can see is not a caveat. And it is
      // wb-fr-ev-note, not wb-fr-ev-caution: an absence is not a finding, and must not
      // be dressed as one.
      absent ? h('p', { className: 'wb-fr-ev wb-fr-ev-note' }, ABSENCE_NOTE) : null,
      // The withheld caveat has to be VISIBLE text, not a tooltip, same as the
      // ethics row it is modelled on, worded for what each family actually is:
      // a safeguarding claim on the ethics rows, a report-quality claim here.
      (withheld && item.source === 'ethics') ? h('p', { className: 'wb-fr-ev wb-fr-ev-caution' },
        'Safeguarding: the scan can only see the word. Read the section and answer this one yourself.') : null,
      (withheld && item.source === 'uneg') ? h('p', { className: 'wb-fr-ev wb-fr-ev-caution' },
        'Report quality: a keyword match is not a judgment. Read the section and answer this one yourself.') : null);
  }

  function itemRow(item, onAnswer, onNote, evidence) {
    return h('div', { className: 'wb-fr-item' + (item.auto ? ' wb-fr-item--auto' : ''), key: item.id },
      h('div', { className: 'wb-fr-item-head' },
        sevTag(item.severity),
        h('div', { className: 'wb-fr-item-text' },
          h('div', { className: 'wb-fr-item-title' }, item.text,
            item.answerability != null ? h('span', { className: 'wb-fr-answ', title: 'C2 answerability rating for this question (1 to 4, higher is more answerable)' }, 'C2: ' + item.answerability + '/4') : null),
          item.detail ? h('p', { className: 'wb-fr-item-detail' }, item.detail) : null,
          machineChip(item, onAnswer, evidence))),
      h('div', { className: 'wb-fr-item-body' },
        item.auto
          ? h('span', { className: 'wb-fr-auto-ans wb-fr-auto-ans--' + (item.answer || 'none') },
              'Computed: ' + (core().ANSWER_LABELS[item.answer] || 'n/a'))
          : answerButtons(item, onAnswer),
        h('input', { className: 'wb-input wb-fr-note', type: 'text', placeholder: 'note (what you saw, page refs)',
          defaultValue: item.note || '', 'aria-label': 'Note for: ' + item.text,
          onBlur: function(e) { onNote(item.id, e.target.value); } })));
  }

  // Per-EQ lifecycle ledger: answerability (C2) -> answered (this screen) ->
  // strength of evidence (C3 Endorse, filled later).
  function ledger(run, context) {
    var C = core();
    var D = window.CockpitData || { ANSW: [], SOE: [] };
    var eq = C.eqRows(context);
    if (!eq.rows.length) return null;
    var itemsById = {};
    (run.items || []).forEach(function(it) { itemsById[it.id] = it; });
    var soeMap = {};
    (((context.commissioner || {}).report_review || {}).evidence || []).forEach(function(e) {
      if (e && e.eq_id != null) soeMap[e.eq_id] = e.strength;
    });
    function scaleColor(scale, v) {
      for (var i = 0; i < scale.length; i++) if (scale[i].v === v) return scale[i].color;
      return 'var(--border-strong)';
    }
    var ansMark = {
      yes: { t: 'Y', c: 'var(--green-strong)' }, partial: { t: 'P', c: 'var(--amber-dark)' },
      no: { t: 'N', c: 'var(--red-strong)' }, cant_tell: { t: '?', c: 'var(--red-strong)' }
    };
    return h('div', { className: 'wb-fr-ledger' },
      h('h4', { className: 'wb-fr-ledger-title' }, 'Question ledger'),
      h('p', { className: 'wb-cm-hint' }, 'Each question across the commission: answerability rated before spend (C2), answered at this first review, strength of evidence rated at endorsement (C3).'),
      h('div', { className: 'wb-table-container' },
        h('table', { className: 'wb-table wb-cm-table' },
          h('thead', null, h('tr', null,
            h('th', { style: { width: 34 } }, '#'),
            h('th', null, 'Question'),
            h('th', { className: 'wb-th--center', style: { width: 110 } }, 'Answerability'),
            h('th', { className: 'wb-th--center', style: { width: 96 } }, 'Answered'),
            h('th', { className: 'wb-th--center', style: { width: 96 } }, 'Strength'))),
          h('tbody', null, eq.rows.map(function(r) {
            var it = itemsById['eq:' + r.eq_id];
            var a = it && it.answerability != null ? it.answerability : null;
            var ans = it && it.answer ? ansMark[it.answer] : null;
            var s = soeMap[r.eq_id] != null ? soeMap[r.eq_id] : null;
            // role 'img' on the coloured disc: a bare span is role=generic, so an
            // aria-label on it is ignored and a screen reader announces only the
            // glyph ("Y", "3"). With role img the label is what gets read
            // ("Answerability 3 of 4"), which is the whole content of the cell.
            function mark(text, color, label) {
              return h('span', { className: 'wb-fr-mark', role: 'img', style: { background: color }, 'aria-label': label }, text);
            }
            return h('tr', { key: r.eq_id },
              h('td', { className: 'wb-td--meta' }, r.number != null ? r.number : ''),
              h('td', null, h('div', { className: 'wb-cm-eq' }, r.question || '(untitled question)')),
              h('td', { className: 'wb-th--center' }, a != null ? mark(String(a), scaleColor(D.ANSW, a), 'Answerability ' + a + ' of 4') : h('span', { className: 'wb-cm-muted' }, '-')),
              h('td', { className: 'wb-th--center' }, ans ? mark(ans.t, ans.c, 'Screen answer: ' + (it ? C.ANSWER_LABELS[it.answer] : '')) : h('span', { className: 'wb-cm-muted' }, '-')),
              h('td', { className: 'wb-th--center' }, s != null ? mark(String(s), scaleColor(D.SOE, s), 'Strength of evidence ' + s + ' of 4') : h('span', { className: 'wb-cm-muted' }, '-')));
          })))));
  }

  // ---- main component --------------------------------------------------------

  function FirstReview(props) {
    var context = props.context;
    var dispatch = props.dispatch;
    var role = props.role === 'commissioner' ? 'commissioner' : 'team';
    var C = core();
    var screens = context.report_screens || [];
    var mine = screens.filter(function(r) { return r && r.role === role; });
    var deliverables = ((context.planning || {}).deliverables || []);

    // ---- hooks ---------------------------------------------------------------
    // Every hook is called here, unconditionally, before any branch. The render
    // below forks on whether a run is active, so nothing hook-shaped may move
    // below that fork.
    // Which view is on screen is two independent facts, not one: the run the
    // reviewer picked (selectedId), and whether they explicitly asked for the list
    // (listView). Deriving the list from selectedId === null alone conflated them:
    // 'Back to list' was a no-op while any run was open, and recording a verdict
    // completed the run out from under a reviewer who had not selected it in this
    // session, snapping them to the list before they could act on it.
    var sel = React.useState(null), selectedId = sel[0], setSelectedId = sel[1];
    var lv = React.useState(false), listView = lv[0], setListView = lv[1];
    // Lazy initialiser: the default deliverable is only resolved on first render.
    var delSel = React.useState(function() { return defaultDeliverableId(deliverables); }),
        delId = delSel[0], setDelId = delSel[1];
    // The paste box is uncontrolled on purpose: the report text must exist in one
    // place only (the DOM node the reviewer typed into), so that clearing that
    // node is the whole of forgetting it. Putting it in state or in the run would
    // put it in localStorage.
    var pasteRef = React.useRef(null);
    // Evidence snippets are session-only, keyed by the run they were scanned for
    // (item ids repeat across runs, so an unkeyed map would show run A's quoted
    // lines against run B's items). Shape: null | { run_id, by_item: { id: str } }.
    var evd = React.useState(null), evidence = evd[0], setEvidence = evd[1];
    var scn = React.useState(false), scanning = scn[0], setScanning = scn[1];
    // Session-only note about what the last scan in THIS tab managed to do. Shape:
    // null | { run_id, kind: 'unreadable' | 'no_match' }.
    // 'unreadable' = too little Latin-script text for a keyword scan to work on, so it
    // produced no signals at all. 'no_match' = it produced signals, but every one of
    // them is an absence: it matched NOTHING anywhere. That is worth saying, because
    // it is what a report in a language the patterns do not cover looks like, and it is
    // also what a genuinely empty report looks like, and the scan cannot tell the two
    // apart. Both are HONESTY notes about the wording, not safety gates: no signal is
    // suppressed on the strength of either, because a not_found is inert by
    // construction now (no one-click confirm, ever). Not persisted: run.prescan carries
    // counts only, and this is a fact about a scan, not about the report.
    var unr = React.useState(null), scanNote = unr[0], setScanNote = unr[1];

    // Runs of this role still open. The newest is where the panel lands when the
    // reviewer has selected nothing this session (the page-reload path).
    var openRuns = mine.filter(function(r) { return !r.completed_at; });
    var openIncomplete = openRuns.length ? openRuns[openRuns.length - 1].id : null;
    var activeId = listView ? null : (selectedId || openIncomplete);
    var run = null;
    for (var j = 0; j < screens.length; j++) { if (screens[j].id === activeId) { run = screens[j]; break; } }

    var rec = run ? C.recommendVerdict(run.items) : null;
    var api = role === 'commissioner' ? window.CockpitSave.make(context, dispatch) : null;

    function persist(nextRun, msg, log, toastType) {
      saveScreens(dispatch, C.upsertRun(screens, nextRun), msg, toastType);
      if (log && api) api.logEvent(log.action, log.detail);
    }

    // The only two ways to move between the views. Every entry into the run view
    // names its run, so no later state change can pull the run out from under it.
    function openRun(id) { setSelectedId(id); setListView(false); }
    function backToList() { setSelectedId(null); setListView(true); }

    function startRun() {
      var del = null;
      for (var m = 0; m < deliverables.length; m++) { if (deliverables[m].id === delId) { del = deliverables[m]; break; } }
      var fresh = C.newScreenRun(context, role, role === 'commissioner' ? del : null);
      openRun(fresh.id);
      persist(fresh, 'First review started');
    }

    function onAnswer(itemId, answer) { persist(C.setItemAnswer(run, itemId, { answer: answer })); }
    function onNote(itemId, note) { persist(C.setItemAnswer(run, itemId, { note: note })); }

    // ---- pre-scan ------------------------------------------------------------
    // What a scan is allowed to leave behind. Per item: the SIGNAL ('found' |
    // 'weak' | 'not_found'), and for an evaluation question the two integers that
    // make the thinness of the basis visible (matched N of M question terms).
    // Signals and counts are derived facts about the text, not the text. The
    // quoted line that justifies each signal is body text of a confidential
    // report, so it goes to session state (setEvidence) and NOWHERE else: not
    // into the item, not into the run, not into the context.
    //
    // A signal NEVER becomes an answer. `answer` is not in any patch below; only
    // the reviewer's own click (onAnswer, from the chip's Record button or the
    // answer buttons) writes one.
    function applySignals(target, signals) {
      var next = target;
      (target.items || []).forEach(function(it) {
        var s = signals[it.id];
        if (s) {
          var patch = { machine_signal: s.signal };
          // hits/total ride only on EQ signals. They are counts of matched terms,
          // never content.
          if (s.total != null) { patch.machine_hits = s.hits; patch.machine_total = s.total; }
          next = C.setItemAnswer(next, it.id, patch);
        } else if (it.machine_signal) {
          // A re-scan owns every signal. An item the new scan says nothing about
          // must not keep the last scan's verdict about it.
          next = C.setItemAnswer(next, it.id, { machine_signal: null, machine_hits: null, machine_total: null });
        }
      });
      return next;
    }

    // try/finally, not a bare sequence: anything thrown in here (a malformed
    // context reaching prescan, a dispatch that throws) used to leave scanning
    // stuck at true forever, which disables the Run pre-scan button AND the
    // textarea, with the pasted report still sitting in the DOM node, until the
    // reviewer navigates away. The scan is over when this function is over,
    // however it ends.
    function finishPrescan(text) {
      try {
        if (!run) return;
        var res = C.prescan(text, context);
        if (!res.ok) {
          dispatch({ type: PraxisContext.ACTION_TYPES.SHOW_TOAST,
            message: 'That text is too long to scan. The cap is ' + C.MAX_PRESCAN_CHARS + ' characters; scan the report a part at a time.',
            toastType: 'error' });
          return;
        }
        var byItem = {};
        Object.keys(res.signals).forEach(function(id) { byItem[id] = res.signals[id].evidence; });
        setEvidence({ run_id: run.id, by_item: byItem });
        // Derived from the COUNTS the scan reports about itself, not from any guess
        // about the language of the text. A scan that matched nothing anywhere has told
        // the reviewer nothing, and should say so rather than let a column of empty
        // notes read as a column of results.
        var kindNote = null;
        if (res.meta.unreadable) kindNote = 'unreadable';
        else if (res.meta.detections === 0 && res.meta.absences > 0) kindNote = 'no_match';
        setScanNote(kindNote ? { run_id: run.id, kind: kindNote } : null);

        // On unreadable text res.signals is {}, so applySignals CLEARS every signal
        // a previous scan left behind. That is the correct reading of a re-scan
        // that could read nothing: the tool now says nothing about any item.
        var next = applySignals(run, res.signals);
        next = Object.assign({}, next, {
          prescan: { ran_at: new Date().toISOString(), chars: res.meta.chars, words: res.meta.words }
        });
        // The pasted text is discarded here and is held nowhere else: `text` is a
        // local that falls out of scope with this call.
        var el = pasteRef.current;
        if (el) el.value = '';
        // Neither the unreadable case, nor a scan that matched nothing, nor a short
        // paste is a clean save, so none of them may arrive in the green of one. Only
        // the ordinary scan is a success toast.
        //
        // The copy speaks about what the SCAN did or did not do, and never asserts what
        // the text IS. An English results framework that is nine tenths figures trips
        // the readability gate exactly as an Arabic report does, and telling that
        // reviewer "that text does not read as English" would be false for their input.
        var msg, kind;
        if (res.meta.unreadable) {
          msg = 'The scan did not find enough text it could read in that paste, so it produced no signals at all. Screen the report yourself.';
          kind = 'warning';
        } else if (res.meta.detections === 0 && res.meta.absences > 0) {
          msg = 'Scanned, but the scan matched none of its keywords anywhere in that text. That can mean the report is missing those sections, or that it is written in a language or with a vocabulary the scan does not read. It cannot tell those apart, so it has recorded no finding either way. Answer each item yourself.';
          kind = 'warning';
        } else if (res.meta.short) {
          msg = 'Scanned, but the text was under 500 words. Is that the whole report?';
          kind = 'warning';
        } else {
          msg = 'Scanned. Signals are keyword matches, not judgments. Answer each item yourself.';
          kind = 'success';
        }
        persist(next, msg, null, kind);
      } finally {
        // Cleared AFTER the work, not before it, so the scanning state cannot blink
        // off while the thread is still held; and cleared on EVERY exit, including
        // an early return and a throw.
        setScanning(false);
      }
    }

    // The worked examples ship their own draft report, so the screen can be shown
    // end to end without the demonstrator pasting 2,600 words from somewhere. It is
    // looked up ONLY by exact programme_name, which is the demo fixture's own key,
    // so a real evaluation can never match one and the button below can never
    // appear on real work. Null on every project that is not one of the two demos.
    //
    // hasOwnProperty and the string check are not ceremony. A bare
    // `REPORTS[name] || null` reads INHERITED keys too: a project whose
    // programme_name happens to be "constructor", "toString" or "valueOf" would
    // pull a function off Object.prototype, the truthiness test would pass, the
    // button would render on a REAL evaluation, and clicking it would paste
    // "function Object() { [native code] }" into the reviewer's box. Own key,
    // and a string, or nothing.
    var demoReports = window.PRAXIS_DEMO_REPORTS || {};
    var demoKey = (context.project_meta || {}).programme_name || '';
    var demoReport = (demoKey && Object.prototype.hasOwnProperty.call(demoReports, demoKey)
      && typeof demoReports[demoKey] === 'string' && demoReports[demoKey]) ? demoReports[demoKey] : null;

    // Fills the paste box and stops. It deliberately does NOT scan: the demo has to
    // show both steps, the paste and the scan, because the point of the screen is
    // that a human puts the text in and a human reads what comes back. The text goes
    // into the uncontrolled textarea and NOWHERE else, exactly as a human paste
    // would, and runPrescan clears that node when it is done with it.
    function loadDemoReport() {
      var el = pasteRef.current;
      if (!el || !demoReport) return;
      el.value = demoReport;
      el.focus();
      dispatch({ type: PraxisContext.ACTION_TYPES.SHOW_TOAST,
        message: 'The worked example\'s own draft report is now in the box. Nothing has been scanned and nothing has been saved: press Run pre-scan.',
        toastType: 'info' });
    }

    function runPrescan() {
      if (scanning) return;
      var el = pasteRef.current;
      var text = el ? el.value : '';
      if (!text.trim()) {
        dispatch({ type: PraxisContext.ACTION_TYPES.SHOW_TOAST, message: 'Paste the report text first.', toastType: 'error' });
        return;
      }
      setScanning(true);
      // prescan is synchronous and O(n) over a paste that may run to a million
      // characters, so it can hold the main thread long enough to look like a
      // hang. Yield a frame (rAF fires before the paint that shows the scanning
      // state) and then a task (setTimeout fires after it), so the reviewer sees
      // the state change before the thread is taken.
      window.requestAnimationFrame(function() {
        window.setTimeout(function() { finishPrescan(text); }, 0);
      });
    }

    function recordVerdict(v) {
      var next = Object.assign({}, run, {
        verdict: v, verdict_recommended: rec.verdict,
        completed_at: new Date().toISOString()
      });
      // Pin the run before completing it. completed_at drops it out of openRuns,
      // so a reviewer who arrived by the reload path (selectedId still null) would
      // otherwise be thrown to the list on this very render: never seeing the
      // recorded verdict, and never reaching 'Request revision on the deliverable',
      // which is the whole point of a return verdict.
      openRun(run.id);
      persist(next, 'First review verdict recorded',
        role === 'commissioner' ? { action: 'first_review',
          detail: 'First review verdict: ' + C.VERDICTS[v].label + ' with ' + rec.redFlags.length + ' red flag(s)' } : null);
    }
    function reopen() {
      openRun(run.id);
      persist(Object.assign({}, run, { verdict: null, completed_at: null }), 'First review reopened');
    }

    function requestRevision() {
      var reasons = rec.redFlags.map(function(it) { return C.flagLabel(it); }).join('; ');
      api.patchDeliverable(run.deliverable_id, { status: 'revise', revision_reason: 'First review red flags: ' + reasons });
      api.logEvent('first_review', 'Requested revision on first review: ' + reasons);
      dispatch({ type: PraxisContext.ACTION_TYPES.SHOW_TOAST, message: 'Revision requested on the deliverable', toastType: 'success' });
    }

    // ---- render ------------------------------------------------------------
    var badge;
    var completedMine = mine.filter(function(r) { return r.completed_at; });
    // Reads the runs, not the current view: the list is now reachable while a run
    // is open, and the badge should still say so.
    if (openRuns.length) badge = 'In progress';
    else if (completedMine.length) badge = completedMine.length + ' completed';
    else badge = 'Not run';

    var intro = role === 'commissioner'
      ? 'When the draft report arrives, run a structured first pass before any deep read: red flags against this evaluation\'s own questions, design, sample and timing, plus the UNEG and OECD-DAC quality core and an ethics screen. The tool recommends; you decide and sign the verdict.'
      : 'Screen your own draft against the commission before you submit it: the same checklist the commissioner sees on receipt. Fix the red flags while they are still yours to fix.';

    var body;
    if (!run) {
      var teamNote = null;
      if (role === 'commissioner') {
        var teamLast = C.latestCompleted(screens, 'team');
        teamNote = h('p', { className: 'wb-cm-hint' }, teamLast
          ? 'Team self-screen: run ' + fdate(teamLast.completed_at) + '.'
          : 'Team self-screen: not run.');
      }
      // Runs still open are not in 'Past reviews' (that list is completed runs), so
      // without this block a reviewer who came back to the list mid-run would have
      // no way back into it.
      var resume = openRuns.length ? h('div', { className: 'wb-fr-past' },
        h('h4', { className: 'wb-fr-ledger-title' }, 'In progress'),
        openRuns.map(function(r) {
          var left = C.recommendVerdict(r.items).unanswered.length;
          return h('div', { className: 'wb-fr-past-row', key: r.id },
            h('span', null, 'Started ' + fdate(r.started_at) + (r.reviewer ? ', ' + r.reviewer : '')),
            h('span', { className: 'wb-cm-muted' }, left + ' item(s) still to answer'),
            h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-outline',
              onClick: function() { openRun(r.id); } }, 'Continue'));
        })) : null;

      body = h('div', { key: 'fr-list' },
        h('p', { className: 'wb-cm-panel-intro' }, intro),
        teamNote,
        resume,
        role === 'commissioner' && deliverables.length ? h('div', { className: 'wb-fr-start-row' },
          h('label', { className: 'wb-cm-focus-label', htmlFor: 'fr-del' }, 'Screen which deliverable'),
          h('select', { id: 'fr-del', className: 'wb-input wb-cm-select', value: delId, onChange: function(e) { setDelId(e.target.value); } },
            [h('option', { key: '', value: '' }, '(not linked to a deliverable)')].concat(
              deliverables.map(function(d) {
                return h('option', { key: d.id, value: d.id }, (d.code ? d.code + ' ' : '') + (d.title || '(untitled)') + (d.status === 'submitted' ? ' (submitted)' : ''));
              })))) : null,
        h('div', { className: 'wb-cm-add' },
          h('button', { type: 'button', className: 'wb-btn wb-btn-primary wb-btn-sm', onClick: startRun }, 'Start first review')),
        completedMine.length ? h('div', { className: 'wb-fr-past' },
          h('h4', { className: 'wb-fr-ledger-title' }, 'Past reviews'),
          completedMine.map(function(r) {
            var rrec = C.recommendVerdict(r.items);
            var v = r.verdict ? C.VERDICTS[r.verdict] : null;
            return h('div', { className: 'wb-fr-past-row', key: r.id },
              h('span', null, fdate(r.completed_at) + (r.reviewer ? ', ' + r.reviewer : '')),
              v ? h('span', { className: 'wb-badge ' + v.badge }, v.label) : null,
              h('span', { className: 'wb-cm-muted' }, rrec.redFlags.length + ' red flag(s)'),
              h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-outline', onClick: function() { openRun(r.id); } }, 'Open'),
              h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-outline', onClick: function() { window.PraxisScreenExport.download(r, context); } }, 'Export'));
          })) : null);
    } else {
      var done = !!run.completed_at;
      // Evidence is only ever shown against the run it was scanned for.
      var evMap = (evidence && evidence.run_id === run.id) ? evidence.by_item : {};
      var groups = GROUPS.map(function(g) {
        var its = (run.items || []).filter(function(it) { return g.sources[it.source]; });
        if (!its.length) return null;
        return h('div', { className: 'wb-fr-group', key: g.key },
          h('h4', { className: 'wb-fr-group-title' }, g.title),
          its.map(function(it) { return itemRow(it, onAnswer, onNote, evMap[it.id] || null); }));
      });

      var prescanBlock = h('div', { className: 'wb-fr-group' },
        h('h4', { className: 'wb-fr-group-title' }, 'Optional text pre-scan'),
        h('p', { className: 'wb-cm-hint' },
          'Paste the report text for an indicative first pass. The scan runs in this browser. The text is not uploaded, it is not saved, and it is cleared the moment the scan ends. What is saved is the signal per item (mentioned, weak, no keyword match), the matched-term counts for a question, and the word count. The quoted lines that explain a signal are held in this tab for this session only: they are never written to the project file, to storage, or to an export.'),
        h('p', { className: 'wb-cm-hint' },
          'A signal is a keyword or heading match, not a judgment. It can see that the word "consent" is somewhere in the text; it cannot see whether consent was obtained. It answers nothing for you. Every answer stays your call.'),
        // The standing statement about absences. It is permanent copy, not a warning
        // that fires on some inputs and not others, because it is true of every "no
        // keyword match" note the panel will ever show: the scan matched none of its
        // patterns, and it reads English and French keywords only, so a synonym, a
        // differently titled section, unheaded prose and another language all look
        // identical to it. That is why an absence offers no one-click answer here.
        h('p', { className: 'wb-cm-hint' },
          'The scan matches English and French keywords. A "no keyword match" note is not a finding and never becomes one on its own: the scan cannot tell a section that is missing from one that is titled differently, written without a heading, or written in a language it does not read. So it will never offer to record an answer off an absence. It offers that shortcut only where it actually saw the word.'),
        run.prescan ? h('p', { className: 'wb-cm-hint' },
          'Last scanned ' + fdate(run.prescan.ran_at) + ' (' + run.prescan.words + ' words, ' + run.prescan.chars + ' characters). The text itself is gone.') : null,
        // The truth, plainly, when there was too little for a keyword scan to work on.
        // It speaks about the SCAN, not about the text: a report in another script and
        // an English annex that is almost all figures both land here, and telling the
        // second reviewer "your text is not English" would be false.
        (scanNote && scanNote.run_id === run.id && scanNote.kind === 'unreadable') ? h('p', { className: 'wb-cm-hint wb-fr-ev-caution' },
          'The scan did not find enough text it could read in that paste. It matches keywords letter by letter, so a report written in another script gives it nothing to match, and neither does a paste that is almost all figures or tables. It has produced no signals at all, because it read nothing to produce them from. Screen this report yourself.') : null,
        // It read the text, and matched nothing in it. Said out loud because a column of
        // "no keyword match" notes must not be mistaken for a column of findings. The
        // panel does not guess WHY, and does not claim to know: a report in Spanish,
        // German or Tagalog looks exactly like a report with no sections at all to a
        // scanner that reads neither.
        (scanNote && scanNote.run_id === run.id && scanNote.kind === 'no_match') ? h('p', { className: 'wb-cm-hint wb-fr-ev-caution' },
          'The scan matched none of its keywords anywhere in that text. It reads English and French keywords only, so that can mean the report is missing those sections, or that it is written in another language, or simply that its sections are titled in words the scan does not carry. The scan cannot tell those apart, and it has not tried: nothing below is a finding, and no absence offers you an answer to record. Screen these items yourself.') : null,
        h('textarea', { ref: pasteRef, className: 'wb-input wb-fr-paste', disabled: scanning,
          'aria-label': 'Paste the report text to pre-scan', placeholder: 'paste the full report text here' }),
        h('div', { className: 'wb-cm-add' },
          h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-outline', disabled: scanning, onClick: runPrescan },
            scanning ? 'Scanning' : 'Run pre-scan'),
          // Renders nothing at all when there is no demo report: no button, no
          // empty span, no gap.
          demoReport ? h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-ghost', disabled: scanning, onClick: loadDemoReport },
            'Load the demo draft report') : null,
          demoReport ? h('span', { className: 'wb-cm-muted' },
            'This worked example ships the draft report it received, so the screen can be demonstrated end to end. It fills the box; you still press Run pre-scan.') : null,
          scanning ? h('span', { className: 'wb-cm-muted', role: 'status' },
            'Scanning in this browser. A long report can take a moment.') : null));

      var flagPanel = h('div', { className: 'wb-fr-flags' + (rec.redFlags.length ? ' wb-fr-flags--hot' : '') },
        h('h4', { className: 'wb-fr-ledger-title' }, 'Red flags (' + rec.redFlags.length + ')'),
        rec.redFlags.length
          ? h('ul', { className: 'wb-fr-flag-list' }, rec.redFlags.map(function(it) {
              return h('li', { key: it.id }, C.flagLabel(it) + (it.note ? ' (' + it.note + ')' : ''));
            }))
          : h('p', { className: 'wb-cm-hint' }, rec.unanswered.length
              ? rec.unanswered.length + ' item(s) still to answer.'
              : 'No red flags.'),
        rec.ambers.length ? h('p', { className: 'wb-cm-hint' }, rec.ambers.length + ' amber item(s): partial or unclear.') : null,
        rec.verdict ? h('p', { className: 'wb-fr-reco' }, 'Recommended: ' + C.VERDICTS[rec.verdict].label + '. You decide.') : null);

      var verdictBlock = h('div', { className: 'wb-fr-verdict' },
        h('div', { className: 'wb-cm-focus-field' },
          h('label', { className: 'wb-cm-focus-label', htmlFor: 'fr-reviewer' }, 'Reviewer'),
          h('input', { id: 'fr-reviewer', className: 'wb-input wb-cm-focus-input', type: 'text',
            placeholder: 'name and role of the person screening', defaultValue: run.reviewer || '',
            onBlur: function(e) { persist(Object.assign({}, run, { reviewer: e.target.value })); } })),
        done
          ? h('div', { className: 'wb-fr-verdict-done' },
              h('span', { className: 'wb-badge ' + (C.VERDICTS[run.verdict] || {}).badge }, (C.VERDICTS[run.verdict] || {}).label || ''),
              h('span', { className: 'wb-cm-muted' }, ' recorded ' + fdate(run.completed_at) + (run.reviewer ? ' by ' + run.reviewer : '')),
              h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-ghost', onClick: reopen }, 'Reopen'))
          : h('div', { className: 'wb-fr-verdict-row', role: 'group', 'aria-label': 'Record the verdict' },
              ['return', 'reserved', 'proceed'].map(function(v) {
                return h('button', { key: v, type: 'button',
                  className: 'wb-btn wb-btn-sm ' + (rec.verdict === v ? 'wb-btn-primary' : 'wb-btn-outline'),
                  onClick: function() { recordVerdict(v); } }, C.VERDICTS[v].label);
              })),
        done && run.verdict === 'return' && role === 'commissioner' && run.deliverable_id
          ? h('div', { className: 'wb-cm-add' },
              h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-outline', onClick: requestRevision },
                'Request revision on the deliverable'))
          : null,
        h('div', { className: 'wb-cm-add' },
          h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-outline', onClick: function() { window.PraxisScreenExport.download(run, context); } }, 'Export review note'),
          h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-ghost', onClick: backToList }, 'Back to list')));

      // Keyed by run id: the reviewer and note inputs are uncontrolled
      // (defaultValue), and item ids are stable across runs, so without a key
      // change React would reuse those DOM nodes and carry one run's typed text
      // into another. The key remounts the subtree when the run changes.
      // NO paste box on a completed run. A scan rewrites every item's
      // machine_signal and sets run.prescan; on a run whose verdict is already
      // recorded (and, for a commissioner, already written to the audit log) that
      // is a RETROACTIVE rewrite of the method disclosure. ScreenExport keys its
      // Method paragraph off run.prescan, so the note exported for a review that
      // was completed before any scan existed would flip from "No machine signals
      // were used" to the machine-signals wording. To scan, the reviewer must
      // Reopen the run first, which is an explicit act that clears completed_at
      // and the verdict.
      body = h('div', { key: 'fr-run-' + run.id },
        h('p', { className: 'wb-cm-panel-intro' }, intro),
        done ? null : prescanBlock,
        groups,
        flagPanel,
        ledger(run, context),
        verdictBlock);
    }

    return h(window.SectionCard, { title: role === 'commissioner' ? 'First review of the report' : 'Screen your draft', badge: badge,
      variant: rec && rec.redFlags.length ? 'warning' : null }, body);
  }

  window.FirstReview = FirstReview;
})();
