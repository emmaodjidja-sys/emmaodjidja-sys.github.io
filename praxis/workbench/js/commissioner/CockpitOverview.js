/**
 * CockpitOverview: the commissioner flight-deck (rail index 0). The reading surface:
 * full KPI grid, the alerts module, and deep-link cards into each working station.
 * A fresh project shows a guided "start here". window.CockpitOverview.
 */
(function() {
  'use strict';
  var h = React.createElement;
  var AT = PraxisContext.ACTION_TYPES;
  var A = window.CockpitAtoms;
  var D = window.CockpitData;

  // Read-only accountability panel: who is acting, a segregation-of-duties check, and the
  // append-only log of governance and payment acts.
  function accountability(context, api) {
    var cm = context.commissioner || {}, pl = context.planning || {};
    var log = (cm.audit_log || []).slice().reverse();
    var acting = (cm.acting_officer || '').trim();
    var invoices = pl.invoices || [], dels = pl.deliverables || [];
    var payConflicts = invoices.filter(function(iv) { return iv.approved_by && iv.paid_by && iv.approved_by.trim() && iv.approved_by.trim() === iv.paid_by.trim(); });
    var acceptConflicts = dels.filter(function(d) { return d.accepted_by && d.rating && d.rating.rated_by && d.accepted_by.trim() && d.accepted_by.trim() === d.rating.rated_by.trim(); });
    var flags = [];
    if (!acting) flags.push('No acting officer is set, so new actions are logged as "Unattributed". Name the acting officer below.');
    if (payConflicts.length) flags.push(payConflicts.length + ' invoice(s) were approved and paid by the same officer (no separation between approval and payment).');
    if (acceptConflicts.length) flags.push(acceptConflicts.length + ' deliverable(s) were quality-rated and accepted by the same officer.');
    return h(SectionCard, { title: 'Accountability', badge: log.length ? log.length + ' logged' : 'No log yet', variant: flags.length ? 'warning' : null },
      h('div', { className: 'wb-cm-focus-field', style: { maxWidth: 380, marginBottom: 12 } },
        h('label', { className: 'wb-cm-focus-label', htmlFor: 'cm-acting' }, 'Acting officer (attributed on every logged action)'),
        h('input', { id: 'cm-acting', className: 'wb-input wb-cm-focus-input', type: 'text', placeholder: 'name and role of the officer acting now',
          key: 'acting:' + acting, defaultValue: cm.acting_officer || '', 'aria-label': 'Acting officer',
          onBlur: function(e) { api.setField('acting_officer', e.target.value); } })),
      flags.length
        ? flags.map(function(f, i) { return h('div', { key: 'f' + i, className: 'wb-cm-over', role: 'status', style: { marginTop: i ? 6 : 0 } }, f); })
        : h('p', { className: 'wb-cm-hint' }, 'No segregation-of-duties conflicts detected across acceptance, approval and payment.'),
      log.length
        ? h('div', { className: 'wb-cm-log', role: 'log', 'aria-label': 'Decision and payment log' }, log.map(function(e) {
            return h('div', { key: e.id, className: 'wb-cm-logrow' },
              h('span', { className: 'wb-cm-logrow-when' }, D.fdate(e.at) + ' ' + String(e.at || '').slice(11, 16)),
              h('span', { className: 'wb-cm-logrow-actor' }, e.actor || 'Unattributed'),
              h('span', { className: 'wb-cm-logrow-detail' }, e.detail || e.action));
          }))
        : h('p', { className: 'wb-cm-hint', style: { marginTop: 10 } }, 'No decisions logged yet. Gate decisions, acceptances, endorsements and payments are recorded here, append-only, as they happen.'));
  }

  var CARDS = [
    { idx: 1, code: 'C0', label: 'Commission', desc: 'Name the intended users and the decisions they must make.' },
    { idx: 2, code: 'C1', label: 'Contract', desc: 'Budget, deliverables, invoices and quality review.' },
    { idx: 3, code: 'C2', label: 'Assure', desc: 'Quality-gate the design at inception, before spend.' },
    { idx: 4, code: 'C3', label: 'Deliver', desc: 'Hold deliverables to schedule; accept the final report.' },
    { idx: 5, code: 'C4', label: 'Use', desc: 'Record the management response and dissemination.' },
    { idx: 6, code: 'C5', label: 'Follow-up', desc: 'Track implementation of accepted actions, six-monthly.' }
  ];

  function go(dispatch, cstation) { dispatch({ type: AT.SET_COMMISSIONER_STATION, station: cstation }); }

  // Track-record badge for one portfolio row. Honest about what was actually
  // measured: "Reached use" only when a named intended user's recorded
  // outcome says so (see PraxisPortfolio.snapshot). When no user outcome has
  // ever been recorded, the row falls back to the recommendation-movement
  // proxy, and the badge must not borrow the word "use" for that, since the
  // whole point of this register is that the two are not the same fact.
  function trackBadge(e) {
    if (e.use_basis === 'users') {
      return e.reached_use
        ? { cls: 'wb-badge-green', text: 'Reached use' }
        : { cls: 'wb-badge-amber', text: 'Not yet used' };
    }
    return (e.moving || 0) > 0
      ? { cls: 'wb-badge-amber', text: 'Recommendations moving' }
      : { cls: 'wb-badge-red', text: 'No recommendations moving' };
  }

  function tile(k, dispatch) {
    return h('button', { key: k.key, type: 'button', className: 'wb-cm-otile' + (k.tone ? ' wb-cm-otile--' + k.tone : ''), onClick: function() { go(dispatch, k.cstation); }, 'aria-label': k.label + ': ' + k.value + ', ' + k.sub },
      typeof k.frac === 'number' ? h('div', { className: 'wb-cm-otile-ring' }, A.ring(k.frac, k.tone)) : h('div', { className: 'wb-cm-otile-v' }, k.value),
      h('div', { className: 'wb-cm-otile-l' }, k.label),
      h('div', { className: 'wb-cm-otile-s' }, k.sub));
  }

  function Overview(props) {
    var context = props.state.context, dispatch = props.dispatch, alerts = props.alerts || [];
    var api = window.CockpitSave.make(context, dispatch);
    var cm = context.commissioner || {}, gov = cm.governance || {};
    var pl = context.planning || {};
    var hasData = (cm.users || []).length || (pl.deliverables || []).length || (cm.management_response || []).length || gov.funder_profile;

    if (!hasData) {
      return h('div', { className: 'wb-cm-overview' },
        h('div', { className: 'wb-station-empty' },
          h('div', { className: 'wb-station-empty-title' }, 'Set up the commissioning'),
          h('div', { className: 'wb-station-empty-desc' }, 'Start in Commission: name who this evaluation is for and the decisions it must serve. The design-assurance gate, delivery schedule and follow-up register then track against that.'),
          h('div', { className: 'wb-cm-add' }, h('button', { type: 'button', className: 'wb-btn wb-btn-primary wb-btn-sm', onClick: function() { go(dispatch, 1); } }, 'Start in C0 Commission'))));
    }

    var kpis = CockpitHeader.deriveKpis(context);

    // Across evaluations, not within one: the portfolio is the commissioner's
    // memory. Rendered only when there is more than the current project to
    // remember, so a first-time user never sees an empty mirror.
    var pf = window.PraxisPortfolio ? PraxisPortfolio.readAll() : [];
    var pfCard = null;
    if (pf.length >= 2) {
      // Only evaluations with a recorded user outcome can honestly be counted
      // as having "reached use". Rows resting on the recommendation-movement
      // proxy are shown below (with their own honest badge) but do not add to
      // this tally, or the summary would repeat the same overstatement per
      // evaluation instead of per row.
      var reached = pf.filter(function(e) { return e.use_basis === 'users' && e.reached_use; }).length;
      pfCard = h(SectionCard, { title: 'Track record', badge: reached + ' of ' + pf.length + ' reached use' },
        h('p', { className: 'wb-cm-panel-intro' }, 'Every evaluation this workbench has held: whether a named intended user recorded actually using it, or, failing that, whether its accepted recommendations moved.'),
        h('ul', { className: 'wb-cm-portfolio' }, pf.map(function(e) {
          var badge = trackBadge(e);
          return h('li', { key: e.id, className: 'wb-cm-portfolio-row' },
            h('span', { className: 'wb-cm-portfolio-title' }, e.title + (e.organisation ? ' (' + e.organisation + ')' : '')),
            h('span', { className: 'wb-badge ' + badge.cls }, badge.text));
        })));
    }

    return h('div', { className: 'wb-cm-overview' },
      h('header', { className: 'wb-cm-move-head' },
        h('div', null,
          h('div', { className: 'wb-cm-move-kicker' }, 'Flight deck'),
          h('h3', { className: 'wb-cm-move-title' }, 'Where this evaluation stands'),
          h('p', { className: 'wb-cm-move-desc' }, 'A live read of the commissioning: who it is for, whether the design is assured, what is on schedule, and what needs the commissioner now.'))),
      h('div', { className: 'wb-cm-otiles' }, kpis.map(function(k) { return tile(k, dispatch); })),
      pfCard,
      h(SectionCard, { title: 'Alerts', badge: alerts.length ? CockpitAlerts.summarize(alerts).overdue + ' overdue' : 'Clear', variant: (alerts.length && alerts[0].severity === 0) ? 'warning' : null },
        CockpitHeader.alertList(alerts, dispatch)),
      h(SectionCard, { title: 'Stations' },
        h('div', { className: 'wb-cm-navcards' }, CARDS.map(function(c) {
          return h('button', { key: c.idx, type: 'button', className: 'wb-cm-navcard', onClick: function() { go(dispatch, c.idx); } },
            h('span', { className: 'wb-cm-navcard-code' }, c.code),
            h('span', { className: 'wb-cm-navcard-label' }, c.label),
            h('span', { className: 'wb-cm-navcard-desc' }, c.desc));
        }))),
      accountability(context, api));
  }

  window.CockpitOverview = Overview;
})();
