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
    { key: 'uneg', title: 'Report quality (UNEG and OECD DAC)', sources: { uneg: 1 } },
    { key: 'ethics', title: 'Ethics and safeguarding', sources: { ethics: 1 } }
  ];

  // The deliverable a commissioner run defaults to: the most recent submitted
  // deliverable whose type or title reads as a report.
  function defaultDeliverableId(deliverables) {
    for (var i = deliverables.length - 1; i >= 0; i--) {
      var d = deliverables[i];
      if (d && d.status === 'submitted' && (/report/i.test(String(d.type || '')) || /report/i.test(String(d.title || '')))) return d.id;
    }
    return '';
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
    var map = {
      found: { label: 'mentioned in the text', cls: 'wb-fr-chip--found', answer: 'yes' },
      weak: { label: 'weak signal only', cls: 'wb-fr-chip--weak', answer: 'partial' },
      not_found: { label: 'not detected', cls: 'wb-fr-chip--miss', answer: 'no' }
    };
    var m = map[item.machine_signal];
    if (!m) return null;
    var label = 'Text scan: ' + m.label;
    var isEq = item.machine_total != null;
    if (isEq) label += ', matched ' + item.machine_hits + ' of ' + item.machine_total + ' question terms';
    // The three ethics items get the chip and the basis line (the reviewer loses
    // no information) but NO one-click confirm, and they say why on the row.
    // The gate is on the SOURCE, not on the severity: an EQ item is critical too,
    // but its chip prints its denominator ("matched 3 of 8 question terms") and
    // its own caveat, so the reviewer can see how thin the basis is. An ethics
    // signal has no denominator to print. 'found' on ethics:consent means the
    // regex saw the word, and the line it quotes as "Basis:" can be a
    // table-of-contents entry ("3. Ethics and consent .......... 21") or an annex
    // title ("Annex 4: Consent forms"), which passes isHeadingLine and LOOKS like
    // corroboration of a critical, GBV-adjacent safeguarding claim. The Confirm
    // button is only a shortcut for the Yes button already sitting in the same
    // row, so removing it costs one mouse-move and removes the "the machine said
    // yes, I agreed" anchor exactly where a false green does the most harm. The
    // harm is symmetric: a one-click "Record No" off a machine MISS (a report
    // that writes "assent" or "data safeguarding protocol", neither of which the
    // regex covers) would write a critical red flag straight into the
    // commissioner's one-click request-revision.
    var isEthics = item.source === 'ethics';
    var basis = evidence
      ? 'Basis: ' + evidence
      : 'Basis: the scanned text was discarded, so the matching line is no longer available. Re-scan to see it.';
    return h('div', { className: 'wb-fr-sig' },
      h('span', { className: 'wb-fr-chip ' + m.cls,
        title: 'A keyword or heading match in the text you pasted. It reports what the words do, not whether the requirement is met.' },
        label,
        (!item.answer && !isEthics) ? h('button', { type: 'button', className: 'wb-fr-chip-confirm',
          'aria-label': 'Record ' + C.ANSWER_LABELS[m.answer] + ' as my answer for: ' + item.text,
          onClick: function() { onConfirm(item.id, m.answer); } }, 'I checked. Record ' + C.ANSWER_LABELS[m.answer]) : null),
      h('p', { className: 'wb-fr-ev' }, basis,
        isEq ? h('span', { className: 'wb-fr-ev-note' }, ' The report mentions the topic. Whether it answers the question is yours to judge.') : null,
        evidence ? h('span', { className: 'wb-fr-ev-note' }, ' Shown in this tab only; never saved.') : null),
      // Visible text, not a tooltip: a caveat nobody can see is not a caveat.
      isEthics ? h('p', { className: 'wb-fr-ev wb-fr-ev-caution' },
        'Safeguarding: the scan can only see the word. Read the section and answer this one yourself.') : null);
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
            function mark(text, color, label) {
              return h('span', { className: 'wb-fr-mark', style: { background: color }, 'aria-label': label }, text);
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

    function finishPrescan(text) {
      if (!run) { setScanning(false); return; }
      // Cleared AFTER the blocking call, not before it: React 18 would batch a
      // clear made here either way, but this does not lean on that, so the
      // scanning state cannot blink off while the thread is still held.
      var res = C.prescan(text, context);
      setScanning(false);
      if (!res.ok) {
        dispatch({ type: PraxisContext.ACTION_TYPES.SHOW_TOAST,
          message: 'That text is too long to scan. The cap is ' + C.MAX_PRESCAN_CHARS + ' characters; scan the report a part at a time.',
          toastType: 'error' });
        return;
      }
      var byItem = {};
      Object.keys(res.signals).forEach(function(id) { byItem[id] = res.signals[id].evidence; });
      setEvidence({ run_id: run.id, by_item: byItem });

      var next = applySignals(run, res.signals);
      next = Object.assign({}, next, {
        prescan: { ran_at: new Date().toISOString(), chars: res.meta.chars, words: res.meta.words }
      });
      // The pasted text is discarded here and is held nowhere else: `text` is a
      // local that falls out of scope with this call.
      var el = pasteRef.current;
      if (el) el.value = '';
      // A short paste is a CAUTION ("is that really the whole report?"), so it
      // must not arrive in the green of a clean save. Only the ordinary scan is a
      // success toast.
      persist(next, res.meta.short
        ? 'Scanned, but the text was under 500 words. Is that the whole report?'
        : 'Scanned. Signals are keyword matches, not judgments. Answer each item yourself.',
        null, res.meta.short ? 'warning' : 'success');
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
          'Paste the report text for an indicative first pass. The scan runs in this browser. The text is not uploaded, it is not saved, and it is cleared the moment the scan ends. What is saved is the signal per item (mentioned, weak, not detected), the matched-term counts for a question, and the word count. The quoted lines that explain a signal are held in this tab for this session only: they are never written to the project file, to storage, or to an export.'),
        h('p', { className: 'wb-cm-hint' },
          'A signal is a keyword or heading match, not a judgment. It can see that the word "consent" is somewhere in the text; it cannot see whether consent was obtained. It answers nothing for you. Every answer stays your call.'),
        run.prescan ? h('p', { className: 'wb-cm-hint' },
          'Last scanned ' + fdate(run.prescan.ran_at) + ' (' + run.prescan.words + ' words, ' + run.prescan.chars + ' characters). The text itself is gone.') : null,
        h('textarea', { ref: pasteRef, className: 'wb-input wb-fr-paste', disabled: scanning,
          'aria-label': 'Paste the report text to pre-scan', placeholder: 'paste the full report text here' }),
        h('div', { className: 'wb-cm-add' },
          h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-outline', disabled: scanning, onClick: runPrescan },
            scanning ? 'Scanning' : 'Run pre-scan'),
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
