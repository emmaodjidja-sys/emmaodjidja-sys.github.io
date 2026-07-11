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

  function saveScreens(dispatch, nextList, msg) {
    var AT = PraxisContext.ACTION_TYPES;
    dispatch({ type: AT.SAVE_STATION, stationId: 10, payload: { report_screens: nextList } });
    if (msg) dispatch({ type: AT.SHOW_TOAST, message: msg, toastType: 'success' });
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

  // Indicative signal from the Phase 2 paste-text prescan. Dormant until
  // PraxisScreenCore.prescan sets machine_signal; it never answers on its own.
  function machineChip(item, onConfirm) {
    if (!item.machine_signal) return null;
    var map = {
      found: { label: 'Machine: detected', cls: 'wb-fr-chip--found', answer: 'yes' },
      weak: { label: 'Machine: weak signal', cls: 'wb-fr-chip--weak', answer: 'partial' },
      not_found: { label: 'Machine: not found', cls: 'wb-fr-chip--miss', answer: 'no' }
    };
    var m = map[item.machine_signal];
    if (!m) return null;
    return h('span', { className: 'wb-fr-chip ' + m.cls, title: item.machine_evidence || 'Indicative signal from the pasted text. Confirm or override.' },
      m.label,
      !item.answer ? h('button', { type: 'button', className: 'wb-fr-chip-confirm',
        'aria-label': 'Confirm machine signal as the answer for: ' + item.text,
        onClick: function() { onConfirm(item.id, m.answer); } }, 'Confirm') : null);
  }

  function itemRow(item, onAnswer, onNote) {
    return h('div', { className: 'wb-fr-item' + (item.auto ? ' wb-fr-item--auto' : ''), key: item.id },
      h('div', { className: 'wb-fr-item-head' },
        sevTag(item.severity),
        h('div', { className: 'wb-fr-item-text' },
          h('div', { className: 'wb-fr-item-title' }, item.text,
            item.answerability != null ? h('span', { className: 'wb-fr-answ', title: 'C2 answerability rating for this question (1 to 4, higher is more answerable)' }, 'C2: ' + item.answerability + '/4') : null),
          item.detail ? h('p', { className: 'wb-fr-item-detail' }, item.detail) : null,
          machineChip(item, onAnswer))),
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

    // Runs of this role still open. The newest is where the panel lands when the
    // reviewer has selected nothing this session (the page-reload path).
    var openRuns = mine.filter(function(r) { return !r.completed_at; });
    var openIncomplete = openRuns.length ? openRuns[openRuns.length - 1].id : null;
    var activeId = listView ? null : (selectedId || openIncomplete);
    var run = null;
    for (var j = 0; j < screens.length; j++) { if (screens[j].id === activeId) { run = screens[j]; break; } }

    var rec = run ? C.recommendVerdict(run.items) : null;
    var api = role === 'commissioner' ? window.CockpitSave.make(context, dispatch) : null;

    function persist(nextRun, msg, log) {
      saveScreens(dispatch, C.upsertRun(screens, nextRun), msg);
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
      var reasons = rec.redFlags.map(function(it) { return it.text; }).join('; ');
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
      var groups = GROUPS.map(function(g) {
        var its = (run.items || []).filter(function(it) { return g.sources[it.source]; });
        if (!its.length) return null;
        return h('div', { className: 'wb-fr-group', key: g.key },
          h('h4', { className: 'wb-fr-group-title' }, g.title),
          its.map(function(it) { return itemRow(it, onAnswer, onNote); }));
      });

      var flagPanel = h('div', { className: 'wb-fr-flags' + (rec.redFlags.length ? ' wb-fr-flags--hot' : '') },
        h('h4', { className: 'wb-fr-ledger-title' }, 'Red flags (' + rec.redFlags.length + ')'),
        rec.redFlags.length
          ? h('ul', { className: 'wb-fr-flag-list' }, rec.redFlags.map(function(it) {
              return h('li', { key: it.id }, it.text + (it.note ? ' (' + it.note + ')' : ''));
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
      body = h('div', { key: 'fr-run-' + run.id },
        h('p', { className: 'wb-cm-panel-intro' }, intro),
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
