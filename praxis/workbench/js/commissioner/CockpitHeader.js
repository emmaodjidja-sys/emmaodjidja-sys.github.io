/**
 * CockpitHeader: the persistent, condensed cockpit header shown above every C-station.
 * Profile chip, one-line decision context, a thin lifecycle spine (process STATE, not
 * the rail), a condensed KPI strip, and an alerts badge that opens a triage drawer.
 * Exports window.CockpitHeader (the component) with deriveKpis / deriveStage / alertList
 * attached for reuse by the Overview flight-deck. React.createElement house style.
 */
(function() {
  'use strict';
  var h = React.createElement;
  var AT = PraxisContext.ACTION_TYPES;
  var I = window.PraxisIcons;
  var D = window.CockpitData;
  var CA = window.CockpitAlerts;

  var STAGE_STATION = { originate: 1, procure: 2, gate: 3, endorse: 4, track: 6 };

  function deriveKpis(context) {
    var cm = context.commissioner || {}, pl = context.planning || {};
    var users = cm.users || [], dels = pl.deliverables || [], reg = cm.management_response || [];
    var gate = cm.gate || {};
    var primary = users.filter(function(u) { return u.tier === 'primary'; }).length;
    var usesDef = users.filter(function(u) { return (u.intended_use || '').trim(); });
    var usesCov = usesDef.filter(function(u) { return (u.eq_refs || []).length; });
    var covPct = usesDef.length ? usesCov.length / usesDef.length * 100 : 0;
    var accepted = dels.filter(function(d) { return D.deliverableStatus(d) === 'accepted'; }).length;
    var late = dels.filter(function(d) { return D.deliverableStatus(d) === 'late'; }).length;
    var implemented = reg.filter(function(r) { return r.implementation_status === 'implemented'; }).length;
    var gateLabel = gate.decision && D.GATE_DECISION[gate.decision] ? D.GATE_DECISION[gate.decision].label : 'Not decided';
    // Decision-window fit: the clock the whole commissioning runs against.
    var fit = D.decisionWindowFit(context);
    var FIT_LABEL = { landed: 'Landed in window', on_course: 'On course', at_risk: 'At risk', missed: 'Missed', undated: 'Clock running' };
    var winKpi = { key: 'window', label: 'Decision window', value: '-', sub: 'date the windows in C0', tone: null, cstation: 1 };
    if (fit) {
      var wk = fit.marginDays == null ? null : Math.round(Math.abs(fit.marginDays) / 7);
      var winSub = fit.window.label + ' closes ' + D.fdate(fit.window.closes);
      if (fit.status === 'missed' && wk != null) winSub = 'by about ' + wk + ' wk (' + fit.window.label + ')';
      if (fit.status === 'at_risk' && wk != null) winSub = 'projected miss by about ' + wk + ' wk';
      if (fit.status === 'on_course' && wk != null) winSub = wk + ' wk of margin (' + fit.window.label + ')';
      if (fit.status === 'landed') winSub = fit.window.label + ', in time';
      winKpi = { key: 'window', label: 'Decision window', value: FIT_LABEL[fit.status], sub: winSub,
        tone: (fit.status === 'landed' || fit.status === 'on_course') ? 'good'
          : (fit.status === 'undated' ? null : 'warn'),
        cstation: 1 };
    }
    return [
      { key: 'users', label: 'Primary intended users', value: String(primary), sub: primary ? 'named' : 'name them first', tone: primary ? 'good' : 'warn', cstation: 1 },
      { key: 'coverage', label: 'Use-to-question coverage', value: usesDef.length ? (usesCov.length + ' / ' + usesDef.length) : '-', sub: usesDef.length ? (usesCov.length + ' of ' + usesDef.length + ' uses served') : 'no uses yet', tone: usesDef.length && usesCov.length < usesDef.length ? 'warn' : (usesDef.length ? 'good' : null), cstation: 1, frac: usesDef.length ? usesCov.length / usesDef.length : null },
      winKpi,
      { key: 'gate', label: 'Inception gate', value: gateLabel, sub: gate.decided_at ? D.fdate(gate.decided_at) : 'awaiting decision', tone: gate.decision === 'approve' ? 'good' : (gate.decision ? 'warn' : null), cstation: 3 },
      { key: 'deliverables', label: 'Deliverables on track', value: dels.length ? (accepted + ' / ' + dels.length) : '-', sub: late ? late + ' late' : (dels.length ? 'accepted' : 'no schedule'), tone: late ? 'warn' : (dels.length ? 'good' : null), cstation: 4 },
      { key: 'uptake', label: 'Recommendations implemented', value: reg.length ? (implemented + ' / ' + reg.length) : '-', sub: reg.length ? (implemented + ' of ' + reg.length + ' implemented') : 'none yet', tone: reg.length && implemented < reg.length ? null : (reg.length ? 'good' : null), cstation: 6, frac: reg.length ? implemented / reg.length : null }
    ];
  }

  function deriveStage(context) {
    var cm = context.commissioner || {}, pl = context.planning || {};
    var users = cm.users || [], gate = cm.gate || {}, reg = cm.management_response || [], dels = pl.deliverables || [];
    var gov = cm.governance || {}, rr = cm.report_review || {};
    var reached = {
      originate: !!(gov.purpose) || users.length > 0,
      procure: dels.length > 0,
      gate: !!gate.decision,
      // Endorse is reached only when the final report is formally accepted, not merely when a
      // recommendation exists; the spine must not overstate that the evaluation was endorsed.
      endorse: !!rr.accepted,
      track: reg.some(function(r) { return (r.review_history || []).length || r.implementation_status === 'implemented'; })
    };
    var current = reached.track ? 'track' : (reached.endorse ? 'endorse' : (reached.gate ? 'gate' : (reached.procure ? 'procure' : 'originate')));
    return { reached: reached, current: current };
  }

  function go(dispatch, cstation) { dispatch({ type: AT.SET_COMMISSIONER_STATION, station: cstation }); }

  function spine(context, dispatch) {
    var st = deriveStage(context);
    return h('div', { className: 'wb-cm-spine wb-cm-spine--thin', role: 'group', 'aria-label': 'Commissioning lifecycle' },
      D.LIFECYCLE.map(function(s, i) {
        var active = s.key === st.current;
        var done = st.reached[s.key] && !active;
        return h(React.Fragment, { key: s.key },
          i ? h('span', { className: 'wb-cm-spine-link', 'aria-hidden': 'true' }) : null,
          h('button', { type: 'button',
            className: 'wb-cm-stage' + (active ? ' wb-cm-stage--active' : '') + (done ? ' wb-cm-stage--done' : ''),
            'aria-current': active ? 'step' : null,
            'aria-label': done ? s.label + ', completed' : null,
            title: s.label, onClick: function() { go(dispatch, STAGE_STATION[s.key]); } },
            h('span', { className: 'wb-cm-stage-dot' }, done ? I.check(10) : null), s.label));
      }));
  }

  function alertRow(a, dispatch) {
    var sevCls = a.severity === 0 ? 'wb-cm-alert--overdue' : (a.severity === 1 ? 'wb-cm-alert--soon' : 'wb-cm-alert--info');
    return h('div', { key: a.id, className: 'wb-cm-alert ' + sevCls },
      h('div', { className: 'wb-cm-alert-main' },
        h('div', { className: 'wb-cm-alert-title' }, a.severity !== 2 ? h('span', { className: 'wb-cm-alert-ico', 'aria-hidden': 'true' }, I.warning(13)) : null, a.title),
        a.detail ? h('div', { className: 'wb-cm-alert-detail' }, a.detail) : null),
      h('div', { className: 'wb-cm-alert-actions' },
        // Open (go handle the item at its station) is the primary action, so it carries the
        // outline weight; email and calendar are secondary and read as quieter ghost buttons.
        h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-outline', onClick: function() { go(dispatch, a.cstation); } }, 'Open'),
        h('a', { className: 'wb-btn wb-btn-sm wb-btn-ghost', href: CA.mailtoForAlert(a), 'aria-label': 'Email about ' + a.title }, 'Email owner'),
        a.due_date ? h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-ghost', onClick: function() { CA.downloadIcsForAlert(a); } }, 'Add to calendar') : null));
  }

  function alertList(alerts, dispatch) {
    if (!alerts.length) return h('p', { className: 'wb-cm-hint' }, 'No alerts. Deliverable deadlines and six-monthly reviews appear here as they approach.');
    return h('div', { className: 'wb-cm-alerts' }, alerts.map(function(a) { return alertRow(a, dispatch); }));
  }

  function Header(props) {
    var context = props.context, dispatch = props.dispatch, alerts = props.alerts || [];
    var cm = context.commissioner || {}, gov = cm.governance || {};
    var profile = D.profileOf(gov);
    var kpis = deriveKpis(context);
    var sum = CA.summarize(alerts);
    var drawer = React.useState(false); var open = drawer[0], setOpen = drawer[1];
    var badgeRef = React.useRef(null); var drawerRef = React.useRef(null);
    // Move focus into the drawer when it opens so keyboard and screen-reader users land on it.
    React.useEffect(function() { if (open && drawerRef.current) drawerRef.current.focus(); }, [open]);
    function closeDrawer() { setOpen(false); if (badgeRef.current) badgeRef.current.focus(); }

    var badge = h('button', { type: 'button', ref: badgeRef, className: 'wb-cm-alertbadge' + (sum.overdue ? ' wb-cm-alertbadge--alert' : ''), 'aria-expanded': open ? 'true' : 'false', 'aria-controls': 'wb-cm-alert-drawer', 'aria-label': (sum.total ? sum.overdue + ' overdue, ' + sum.total + ' alerts' : 'No alerts'), onClick: function() { setOpen(!open); } },
      h('span', { className: 'wb-cm-alertbadge-ico', 'aria-hidden': 'true' }, I.warning(15)),
      h('span', { className: 'wb-cm-alertbadge-txt' }, sum.total ? (sum.overdue ? sum.overdue + ' overdue' : sum.total + ' due') : 'No alerts'));

    return h('div', { className: 'wb-cm-header2' },
      h('div', { className: 'wb-cm-header2-top' },
        h('div', { className: 'wb-cm-header2-id' },
          gov.funder_profile ? h('span', { className: 'wb-cm-chip', style: { borderColor: profile.accent, color: profile.accent } }, profile.label) : h('span', { className: 'wb-cm-chip wb-cm-chip--muted' }, 'Commissioner'),
          gov.decision_clock ? h('span', { className: 'wb-cm-header2-clock' }, h('span', { className: 'wb-cm-header2-clock-ey' }, 'Decision served'), gov.decision_clock) : null,
          gov.oversight_body ? h('span', { className: 'wb-cm-header2-over' }, gov.oversight_body) : null),
        badge),
      spine(context, dispatch),
      props.hideKpis ? null : h('div', { className: 'wb-cm-kpistrip' }, kpis.map(function(k) {
        return h('button', { key: k.key, type: 'button', className: 'wb-cm-kpichip' + (k.tone ? ' wb-cm-kpichip--' + k.tone : ''), onClick: function() { go(dispatch, k.cstation); }, title: k.label + ': ' + k.sub },
          h('span', { className: 'wb-cm-kpichip-v' }, k.value),
          h('span', { className: 'wb-cm-kpichip-l' }, k.label));
      })),
      open ? h('div', { className: 'wb-cm-drawer', id: 'wb-cm-alert-drawer', role: 'region', 'aria-label': 'Alerts', tabIndex: -1, ref: drawerRef,
          onKeyDown: function(e) { if (e.key === 'Escape') { e.stopPropagation(); closeDrawer(); } } },
        h('div', { className: 'wb-cm-drawer-head' },
          h('span', { className: 'wb-cm-drawer-title' }, 'Alerts'),
          h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-ghost', 'aria-label': 'Close alerts', onClick: closeDrawer }, I.close(14))),
        alertList(alerts, dispatch)) : null);
  }

  window.CockpitHeader = Header;
  window.CockpitHeader.deriveKpis = deriveKpis;
  window.CockpitHeader.deriveStage = deriveStage;
  window.CockpitHeader.alertList = alertList;
})();
