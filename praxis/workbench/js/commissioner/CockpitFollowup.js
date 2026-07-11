/**
 * CockpitFollowup: C5 Follow-up (rail index 6). Track implementation of accepted
 * management actions on a recurring cadence, six-monthly by default, until each is
 * implemented or formally closed. Reads commissioner.management_response; a rejected
 * recommendation is not tracked. Renders only the station body (CockpitShell owns the
 * persistent header). Every edit saves through the shared CockpitSave contract.
 * No-JSX React.createElement, workbench house style. window.CockpitFollowup.
 */
(function() {
  'use strict';
  var h = React.createElement;
  var D = window.CockpitData;
  var A = window.CockpitAtoms;
  var AL = window.CockpitAlerts;
  var U = window.PraxisUtils;
  var I = window.PraxisIcons;

  // Implementation status -> dot / segment colour for the read-only cadence timeline
  // and the summary strip. Neutral tones for not-started / superseded, signal tones for
  // in-progress (blue), implemented (green) and blocked (red).
  var STATUS_COLOR = {
    not_started: 'var(--border-strong)',
    in_progress: 'var(--blue)',
    implemented: 'var(--green)',
    blocked: 'var(--red)',
    superseded: 'var(--text-tertiary)'
  };

  // Local-midnight ms for a date-only ISO. Never new Date('YYYY-MM-DD'), which parses as
  // UTC midnight and shifts a calendar day for users west of UTC.
  function msLocal(iso) {
    var a = U.ymd(iso);
    return a ? new Date(a[0], a[1] - 1, a[2]).getTime() : null;
  }

  // A labelled, stacked form field: uppercase mono label, control, optional extra below.
  function field(label, control, extra) {
    return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6, minWidth: 150, flex: '0 1 auto' } },
      h('span', { className: 'wb-cm-focus-label' }, label),
      control,
      extra != null ? extra : null);
  }

  // ---- summary strip: status distribution + overdue-review count ---------------
  function summaryStrip(tracked) {
    var order = [
      { k: 'implemented', label: 'Implemented', color: STATUS_COLOR.implemented },
      { k: 'in_progress', label: 'In progress', color: STATUS_COLOR.in_progress },
      { k: 'blocked', label: 'Blocked', color: STATUS_COLOR.blocked },
      { k: 'not_started', label: 'Not started', color: STATUS_COLOR.not_started },
      { k: 'superseded', label: 'Superseded', color: STATUS_COLOR.superseded }
    ];
    var counts = {};
    tracked.forEach(function(r) { var k = r.implementation_status || 'not_started'; counts[k] = (counts[k] || 0) + 1; });
    var overdue = tracked.filter(function(r) { var d = D.reviewDaysUntil(r); return d != null && d < 0; }).length;
    var implemented = counts.implemented || 0;

    return h('div', { className: 'wb-cm-uptake' },
      h('div', { className: 'wb-cm-uptake-head' },
        h('span', { className: 'wb-cm-uptake-title' }, 'Implementation status'),
        h('span', { className: 'wb-cm-uptake-num' }, implemented + ' of ' + tracked.length + ' implemented')),
      h('div', { className: 'wb-cm-uptake-bar' }, order.map(function(o) {
        var n = counts[o.k] || 0; if (!n) return null;
        return h('div', { key: o.k, className: 'wb-cm-uptake-seg', style: { flexGrow: n, background: o.color }, title: o.label + ': ' + n });
      })),
      h('div', { className: 'wb-cm-uptake-legend' },
        order.map(function(o) {
          var n = counts[o.k] || 0; if (!n) return null;
          return h('span', { key: o.k, className: 'wb-cm-uptake-leg' }, h('i', { style: { background: o.color } }), o.label, ' ', h('b', null, n));
        }),
        h('span', { key: 'overdue', className: 'wb-cm-uptake-leg', style: overdue ? { color: 'var(--red-strong)' } : null },
          h('i', { style: { background: overdue ? 'var(--red)' : 'var(--border-strong)' } }),
          'Overdue reviews', ' ', h('b', { style: overdue ? { color: 'var(--red-strong)' } : null }, overdue))));
  }

  // ---- cadence timeline: logged review dates + upcoming next review ------------
  // Read-only, a single line across all tracked actions with a today marker. Reviews
  // bunch in real registers (several logged in the same week, two on the same day), so
  // the shared TimeTrack clusters same-day reviews onto one dot and packs the labels
  // into lanes. Skipped when there are fewer than two dated dots to compare.
  function cadenceTimeline(tracked, todayISO) {
    var points = [];
    tracked.forEach(function(r) {
      (r.review_history || []).forEach(function(e) {
        var t = msLocal(e.review_date);
        if (t != null) points.push({ t: t, iso: e.review_date, code: r.code || 'action', color: STATUS_COLOR[e.status] || STATUS_COLOR.not_started, upcoming: false });
      });
      if (D.isReviewOpen(r) && r.next_review) {
        var tn = msLocal(r.next_review);
        if (tn != null) points.push({ t: tn, iso: r.next_review, code: r.code || 'action', color: 'var(--teal)', upcoming: true });
      }
    });

    var clusters = D.clusterTrackPoints(points);
    if (clusters.length < 2) return null;

    function phrase(c) {
      return c.codes.join(', ') + (c.upcoming ? ', next review ' : ', reviewed ') + D.fdate(c.iso);
    }

    return h(SectionCard, { title: 'Review cadence', badge: points.length + ' dated reviews' },
      h('p', { className: 'wb-cm-panel-intro' }, 'Logged reviews and the next scheduled review (teal), on a single line against today. A read of whether the cadence is being kept. Reviews falling on the same day share one dot.'),
      h(A.TimeTrack, {
        clusters: clusters,
        todayT: msLocal(todayISO),
        label: 'Review cadence across ' + points.length + ' dated reviews',
        rowHeight: 28,
        nameLines: 1,
        tooltip: phrase,
        sr: phrase
      }));
  }

  // ---- one accepted action -----------------------------------------------------
  function actionCard(r, api, alerts, todayISO) {
    var mr = api.listSetter('management_response');
    var closed = r.implementation_status === 'implemented' || r.implementation_status === 'superseded';
    var open = D.isReviewOpen(r);
    var progress = typeof r.progress === 'number' ? r.progress : 0;
    var interval = r.review_interval_months || 6;
    var history = (r.review_history || []).slice().reverse();       // most recent first
    var label = r.code || 'action';

    function setField(patch, msg) { mr.set(r.id, patch, msg); }
    function patchHistory(entryId, patch) {
      var nextArr = (r.review_history || []).map(function(e) { return e.id === entryId ? Object.assign({}, e, patch) : e; });
      mr.set(r.id, { review_history: nextArr });
    }
    function logReview() {
      var anchor = r.next_review || todayISO;                       // advance from the SCHEDULED date, not actual
      var entry = { id: U.uid('rev_'), review_date: todayISO, status: r.implementation_status || 'not_started', note: '', evidence_url: '', evidence_label: '' };
      var next = { review_history: (r.review_history || []).concat([entry]), next_review: U.addMonths(anchor, interval) };
      mr.set(r.id, next, 'Review logged, next review scheduled');
    }

    var alert = (alerts || []).filter(function(a) { return a.stableId === r.id && a.kind.indexOf('review') === 0; })[0];

    var head = h('div', { className: 'wb-cm-decision-head' },
      h('span', { style: { fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--teal-ink)' } }, label),
      h('span', { className: 'wb-cm-rec', style: { flex: '1 1 240px' } }, r.recommendation || '(recommendation)'),
      A.statusBadge(D.DISPOSITION, r.disposition || 'agree'),
      A.statusBadge(D.IMPL_STATUS, r.implementation_status || 'not_started'));

    var statusSel = h('select', { className: 'wb-input wb-cm-select', value: r.implementation_status || 'not_started', 'aria-label': 'Implementation status for ' + label,
        onChange: function(e) { setField({ implementation_status: e.target.value }); } },
      Object.keys(D.IMPL_STATUS).map(function(k) { return h('option', { key: k, value: k }, D.IMPL_STATUS[k].label); }));

    var progressField = field('Progress (%)',
      h('input', { className: 'wb-input wb-cm-inp', type: 'number', min: 0, max: 100, step: 5, defaultValue: progress, 'aria-label': 'Implementation progress percent for ' + label,
        onBlur: function(e) { var n = parseInt(e.target.value, 10); if (isNaN(n)) n = 0; n = Math.max(0, Math.min(100, n)); setField({ progress: n }); } }),
      A.meterBar(progress, 'teal', 'Implementation progress for ' + label));

    var cadenceSel = h('select', { className: 'wb-input wb-cm-select', value: String(interval), 'aria-label': 'Review cadence for ' + label,
        onChange: function(e) { setField({ review_interval_months: parseInt(e.target.value, 10) }); } },
      D.CADENCE.map(function(c) { return h('option', { key: c.v, value: String(c.v) }, c.label); }));

    var reviewDate = h('input', { className: 'wb-input wb-cm-inp wb-cm-date', type: 'date', value: r.next_review || '', 'aria-label': 'Next review date for ' + label,
      onChange: function(e) { setField({ next_review: e.target.value }); } });

    var controls = h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start', marginTop: 12 } },
      field('Implementation status', statusSel),
      progressField,
      field('Review cadence', cadenceSel),
      field('Next review', reviewDate, open ? A.agingChip(r.next_review, true, 30) : null));

    var actionRow = h('div', { className: 'wb-cm-decision-btns', style: { marginTop: 12, alignItems: 'center' } },
      closed
        ? h('span', { className: 'wb-cm-mr-review wb-cm-mr-review--muted' }, h('span', null, 'Closed'), '. No further reviews scheduled.')
        : h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-primary', onClick: logReview },
            I.refresh(14), h('span', { style: { marginLeft: 6 } }, 'Log review and schedule next')),
      alert ? h('a', { className: 'wb-btn wb-btn-sm wb-btn-outline', href: AL.mailtoForAlert(alert) }, 'Email owner') : null,
      alert ? h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-outline', onClick: function() { AL.downloadIcsForAlert(alert); } }, 'Add to calendar') : null);

    var historyRows = history.map(function(e) {
      return h('div', { key: e.id, style: { display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' } },
        h('span', { className: 'wb-cm-date', style: { minWidth: 88 } }, D.fdate(e.review_date)),
        A.statusBadge(D.IMPL_STATUS, e.status || 'not_started'),
        h('input', { className: 'wb-input wb-cm-note', type: 'text', placeholder: 'review note', defaultValue: e.note || '', 'aria-label': 'Review note', style: { flex: '2 1 200px' }, onBlur: function(ev) { patchHistory(e.id, { note: ev.target.value }); } }),
        h('input', { className: 'wb-input wb-cm-inp', type: 'url', placeholder: 'evidence URL (https://...)', defaultValue: e.evidence_url || '', 'aria-label': 'Evidence URL', style: { flex: '1 1 160px' }, onBlur: function(ev) { patchHistory(e.id, { evidence_url: ev.target.value }); } }),
        h('input', { className: 'wb-input wb-cm-inp', type: 'text', placeholder: 'evidence label', defaultValue: e.evidence_label || '', 'aria-label': 'Evidence label', style: { flex: '1 1 120px' }, onBlur: function(ev) { patchHistory(e.id, { evidence_label: ev.target.value }); } }),
        e.evidence_url
          ? h('a', { href: e.evidence_url, target: '_blank', rel: 'noopener noreferrer', style: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)', color: 'var(--teal-ink)' } }, I.externalLink(13), e.evidence_label || 'evidence')
          : null);
    });

    var historyBlock = h('div', { style: { marginTop: 14 } },
      h('div', { className: 'wb-cm-sub' }, 'Review history', h('span', { className: 'wb-cm-sub-count' }, (r.review_history || []).length)),
      history.length
        ? h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } }, historyRows)
        : h('p', { className: 'wb-cm-hint' }, 'No reviews logged yet. Use Log review and schedule next to record the first review on the chosen cadence.'));

    return h('div', { key: r.id, className: 'wb-cm-decision' }, head, controls, actionRow, historyBlock);
  }

  // ==============================================================================
  function CockpitFollowup(props) {
    var context = props.state.context;
    var dispatch = props.dispatch;
    var alerts = props.alerts || [];
    var api = window.CockpitSave.make(context, dispatch);
    var register = (context.commissioner && context.commissioner.management_response) || [];
    var tracked = register.filter(function(r) { return r.disposition !== 'reject'; });

    var head = A.moveHead('C5', 'Follow-up', 'Track implementation, six-monthly',
      'A recommendation is done only when it is implemented. Follow each accepted action on a recurring cadence until it is implemented or formally closed.');

    if (tracked.length === 0) {
      return h('section', { className: 'wb-cm-move', 'aria-label': 'Follow-up' },
        head,
        h('div', { className: 'wb-station-empty' },
          h('div', { className: 'wb-station-empty-title' }, 'No actions to follow up yet'),
          h('div', { className: 'wb-station-empty-desc' }, 'No accepted management actions to follow up yet. Record the management response in C4 Use.')));
    }

    var t = new Date();
    var todayISO = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');

    return h('section', { className: 'wb-cm-move', 'aria-label': 'Follow-up' },
      head,
      summaryStrip(tracked),
      cadenceTimeline(tracked, todayISO),
      h(SectionCard, { title: 'Accepted actions', badge: tracked.length + ' tracked' },
        h('p', { className: 'wb-cm-panel-intro' }, 'Every accepted or partially accepted recommendation, tracked to implementation. Set the status and progress, keep a review on the cadence, and record the evidence at each review.'),
        tracked.map(function(r) { return actionCard(r, api, alerts, todayISO); })));
  }

  window.CockpitFollowup = CockpitFollowup;
})();
