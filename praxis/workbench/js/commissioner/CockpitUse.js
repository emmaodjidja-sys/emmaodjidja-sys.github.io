/**
 * CockpitUse: C4 Use (rail index 5). "Record the response, get findings used."
 * A recommendation is not done when it is accepted; it is done when it is
 * implemented. This station AUTHORS the management response (disposition, owner,
 * note) and the dissemination products. The six-monthly implementation tracking
 * lives in C5 Follow-up; here we only surface a read-only status so the author
 * sees current state. window.CockpitUse. No-JSX React.createElement house style.
 */
(function() {
  'use strict';
  var h = React.createElement;
  var I = window.PraxisIcons;
  var U = window.PraxisUtils;
  var A = window.CockpitAtoms;
  var D = window.CockpitData;
  var SectionCard = window.SectionCard;

  var moveHead = A.moveHead, statusBadge = A.statusBadge;
  var DISPOSITION = D.DISPOSITION, IMPL_STATUS = D.IMPL_STATUS, DIS_STATUS = D.DIS_STATUS;

  // Uptake FUNNEL: four decreasing stages over the recommendation register.
  // Recommended (all) -> Accepted (agree/partial) -> In progress (in_progress or
  // implemented) -> Implemented (implemented). Segment widths are proportional to
  // each stage count via flexGrow, with a small floor so a zero stage still reads
  // as a thin sliver rather than vanishing.
  function funnel(register) {
    var total = register.length;
    var accepted = 0, inprog = 0, impl = 0;
    register.forEach(function(r) {
      if (r.disposition === 'agree' || r.disposition === 'partial') accepted++;
      if (r.implementation_status === 'in_progress' || r.implementation_status === 'implemented') inprog++;
      if (r.implementation_status === 'implemented') impl++;
    });
    // Cumulative funnel: each stage counts everything that reached it OR beyond (an
    // implemented recommendation is also "underway or later"). Per-segment text colour so
    // the pale first stage uses dark text (white on #CBD5E1 is illegible) and the darker
    // stages keep white; the on-white variants clear WCAG AA.
    var stages = [
      { key: 'recommended', label: 'Recommended', n: total, color: 'var(--border-strong)', text: 'var(--text)' },
      { key: 'accepted', label: 'Accepted', n: accepted, color: 'var(--blue)', text: '#fff' },
      { key: 'in_progress', label: 'Underway or later', n: inprog, color: 'var(--teal-ink)', text: '#fff' },
      { key: 'implemented', label: 'Implemented', n: impl, color: 'var(--green-strong)', text: '#fff' }
    ];
    return h('div', { className: 'wb-cm-uptake wb-cm-funnel' },
      h('div', { className: 'wb-cm-uptake-head' },
        h('span', { className: 'wb-cm-uptake-title' }, 'Recommendation uptake'),
        h('span', { className: 'wb-cm-uptake-num' }, impl + ' of ' + total + ' implemented')),
      h('div', { className: 'wb-cm-uptake-bar wb-cm-funnel-bar' }, stages.map(function(s, i) {
        return h('div', { key: s.key, className: 'wb-cm-uptake-seg wb-cm-funnel-seg',
          style: { flexGrow: Math.max(s.n, 0.4), background: s.color, color: s.text },
          title: s.label + ': ' + s.n + ' of ' + total },
          h('span', { className: 'wb-cm-funnel-stage' }, 'Stage ' + (i + 1)),
          h('span', { className: 'wb-cm-funnel-count' }, s.n),
          h('span', { className: 'wb-cm-funnel-label' }, s.label));
      })));
  }

  function CockpitUse(props) {
    var context = props.state.context;
    var dispatch = props.dispatch;
    var api = window.CockpitSave.make(context, dispatch);
    var cm = context.commissioner || {};
    var register = cm.management_response || [];
    var dissem = cm.dissemination || [];
    var profile = D.profileOf(cm.governance || {});
    var dual = profile.dualOwners;
    // Evaluation questions and their report-acceptance strength of evidence (C3), so each
    // recommendation can be tied to the evidence it rests on and weak grounding is visible.
    var rows = (context.evaluation_matrix && context.evaluation_matrix.rows) || [];
    var soeMap = D.evidenceMap((cm.report_review || {}).evidence);

    // Money against use: the C1 figures (same vocabulary, same numbers) set
    // against a derived use verdict, so an unused evaluation reads as money
    // spent for nothing rather than a quiet funnel.
    var PS = window.PlanningShared;
    var money = D.moneyAgainstUse(context);
    var fit = D.decisionWindowFit(context);
    var VERDICT = {
      used: { label: 'Informing decisions', cls: 'good', note: 'At least one accepted action is underway or implemented.' },
      informing: { label: 'Response accepted', cls: 'good', note: 'Recommendations are accepted; implementation has not started.' },
      unused: { label: 'Spent, unused so far', cls: 'bad', note: 'The report is accepted but no recommendation has been accepted or acted on.' },
      pending: { label: 'Too early to call', cls: 'na', note: 'The final report is not yet accepted.' }
    };
    function moneyLine() {
      if (!money.ceiling && !money.committed) return null;
      var v = VERDICT[money.verdict];
      var missNote = (fit && fit.status === 'missed' && money.verdict !== 'used')
        ? ' The earliest decision window (' + fit.window.label + ') has already closed.' : '';
      return h('div', { className: 'wb-cm-moneyline wb-cm-moneyline--' + v.cls, role: 'group', 'aria-label': 'Money against use' },
        h('div', { className: 'wb-cm-moneyline-cell' },
          h('span', { className: 'wb-cm-moneyline-v' }, PS.money(money.ceiling, money.currency)),
          h('span', { className: 'wb-cm-moneyline-l' }, 'Contract value')),
        h('div', { className: 'wb-cm-moneyline-cell' },
          h('span', { className: 'wb-cm-moneyline-v' }, PS.money(money.committed, money.currency)),
          h('span', { className: 'wb-cm-moneyline-l' }, 'Committed to date')),
        h('div', { className: 'wb-cm-moneyline-cell wb-cm-moneyline-cell--verdict' },
          h('span', { className: 'wb-cm-moneyline-v' }, v.label),
          h('span', { className: 'wb-cm-moneyline-l' }, v.note + missNote)));
    }

    var mr = api.listSetter('management_response');
    var dis = api.listSetter('dissemination');
    var usersApi = api.listSetter('users');

    // Item-level truth about use: the funnel says what happened to
    // recommendations, this card says what happened to each named decision
    // maker. A recorded reason for non-use is the register's teeth: it turns
    // "the evaluation was fine" into "the board decided before we reported".
    function userOutcomes() {
      var users = (cm.users || []).filter(function(u) { return u && u.tier === 'primary'; });
      var roll = D.useOutcomeRollup(context);
      var head = roll.recorded
        ? (roll.used + ' of ' + roll.recorded + ' recorded outcomes reached use')
        : 'No outcomes recorded yet';
      var body = users.length ? h('div', { className: 'wb-table-container' },
        h('table', { className: 'wb-table wb-cm-table' },
          h('thead', null, h('tr', null,
            h('th', null, 'Primary user'), h('th', null, 'Intended use'),
            h('th', { style: { minWidth: 132 } }, 'Window'), h('th', { style: { minWidth: 168 } }, 'Outcome'))),
          h('tbody', null, users.map(function(u) {
            var uname = (u.name || '').trim() || 'Unnamed user';
            // Once an outcome is recorded the window is no longer live, so the aging
            // chip stops reading as an open countdown (same isOpen convention C3
            // Deliver uses for a deliverable that has already been accepted).
            var isOpen = !u.use_outcome;
            return h('tr', { key: u.id },
              h('td', null,
                h('div', { className: 'wb-cm-inp--strong', style: { color: 'var(--text)' } }, uname),
                (u.status && u.status !== 'in_post') ? statusBadge(D.USER_STATUS, u.status) : null),
              h('td', null, u.intended_use || h('span', { className: 'wb-cm-muted' }, '-')),
              h('td', null,
                u.decision_window ? h('div', { className: 'wb-cm-muted' }, u.decision_window) : null,
                u.window_closes ? h('span', { className: 'wb-cm-date', style: { display: 'inline-block' } }, D.fdate(u.window_closes)) : null,
                u.window_closes ? A.agingChip(u.window_closes, isOpen, 30) : null,
                (!u.decision_window && !u.window_closes) ? h('span', { className: 'wb-cm-muted' }, '-') : null),
              h('td', null, h('select', { className: 'wb-input wb-cm-select', value: u.use_outcome || '',
                  'aria-label': 'Use outcome for ' + uname,
                  onChange: function(e) { usersApi.set(u.id, { use_outcome: e.target.value }); } },
                Object.keys(D.USE_OUTCOME).map(function(k) {
                  return h('option', { key: k || 'unset', value: k }, D.USE_OUTCOME[k].label);
                }))));
          })))
      ) : h('div', { className: 'wb-station-empty' },
          h('div', { className: 'wb-station-empty-desc' }, 'No primary intended users named yet. Name them in C0 Commission; use is recorded per person, not per report.'));
      return h(SectionCard, { title: 'Use by intended user', badge: users.length ? head : 'Empty' }, body);
    }

    function today() { return new Date().toISOString().slice(0, 10); }
    function addRecommendation() {
      mr.add({
        id: U.uid('rec_'), code: 'R' + (register.length + 1), recommendation: '',
        disposition: 'agree', owner: '', secondary_owner: '', owner_email: '',
        due_date: '', implementation_status: 'not_started', progress: 0,
        // Default disposition is agree, so schedule the first six-monthly review now; an accepted
        // recommendation with no review date is exactly how uptake silently stalls.
        review_interval_months: 6, next_review: U.addMonths(today(), 6), review_history: [],
        actions: '', evidence_note: '', eq_refs: []
      }, 'Recommendation added');
    }
    // The weakest strength of evidence across a recommendation's linked questions, and whether
    // any linked question is not yet rated (both signal how well-grounded the recommendation is).
    function evidenceReadout(refs) {
      if (!rows.length) return null;
      if (!refs || !refs.length) return h('span', { className: 'wb-cm-muted', style: { fontSize: 11 } }, 'link a question');
      var strengths = refs.map(function(id) { var e = soeMap[id]; return e && typeof e.strength === 'number' ? e.strength : null; });
      var rated = strengths.filter(function(s) { return s != null; });
      var unrated = refs.length - rated.length;
      if (!rated.length) return h('span', { className: 'wb-cm-recon', style: { marginTop: 0 } }, 'linked questions not yet rated');
      var weakest = Math.min.apply(null, rated);
      var band = D.SOE.filter(function(s) { return s.v === weakest; })[0] || {};
      var warn = weakest <= 2 || unrated > 0;
      return h('span', { className: 'wb-cm-soe-basis' + (warn ? ' wb-cm-soe-basis--warn' : ''), title: 'Weakest strength of evidence across the linked questions' + (unrated ? '; ' + unrated + ' not yet rated' : '') },
        h('span', { className: 'wb-cm-soe-dot', style: { background: band.color || 'var(--border-strong)' } }),
        (band.label || 'rated') + (unrated ? ' (' + unrated + ' unrated)' : ''));
    }
    function addProduct() {
      dis.add({ id: U.uid('dis_'), product: '', format: '', audience: '', due_date: '', status: 'planned', note: '' }, 'Product added');
    }

    // ---- management response (authoring) ----------------------------------
    var mrBody = register.length ? h('div', { className: 'wb-table-container' },
      h('table', { className: 'wb-table wb-cm-table' },
        h('thead', null, h('tr', null,
          h('th', { style: { width: 40 } }, 'Rec'),
          h('th', null, 'Recommendation'),
          h('th', { style: { minWidth: 128 } }, 'Response'),
          h('th', null, dual ? 'Owners (Alliance / national)' : 'Owner'),
          h('th', { style: { minWidth: 150 } }, 'Owner email'),
          h('th', null, 'Note'))),
        h('tbody', null, register.map(function(r) {
          var code = r.code || '';
          var nums = D.refsToNumbers(r.eq_refs, rows);
          return h('tr', { key: r.id },
            h('td', { className: 'wb-td--meta' }, code),
            h('td', null,
              h('textarea', { className: 'wb-input wb-cm-inp', rows: 2, placeholder: 'recommendation', defaultValue: r.recommendation || '', 'aria-label': 'Recommendation ' + code, onBlur: function(e) { mr.set(r.id, { recommendation: e.target.value }); } }),
              h('div', { className: 'wb-cm-mr-track' },
                statusBadge(IMPL_STATUS, r.implementation_status || 'not_started'),
                h('span', { className: 'wb-cm-muted' }, 'Tracked in C5 Follow-up')),
              rows.length ? h('div', { className: 'wb-cm-mr-evidence' },
                h('span', { className: 'wb-cm-muted', style: { fontSize: 11 } }, 'Evidence'),
                h('input', { className: 'wb-input wb-cm-inp wb-cm-eqinp' + (nums.length ? '' : ' wb-cm-eqinp--empty'), type: 'text', style: { width: 74 }, placeholder: 'Q#', defaultValue: nums.join(', '), title: 'Evaluation questions this recommendation rests on', 'aria-label': 'Evidence questions for ' + code, onBlur: function(e) { mr.set(r.id, { eq_refs: D.numbersToRefs(e.target.value, rows) }); } }),
                evidenceReadout(r.eq_refs)) : null),
            h('td', null, h('select', { className: 'wb-input wb-cm-select', value: r.disposition || 'agree', 'aria-label': 'Management response for ' + code, onChange: function(e) {
                var v = e.target.value; var patch = { disposition: v };
                // Accepting a recommendation schedules its first six-monthly review if none is set,
                // so it cannot sit accepted-but-untracked with no alert.
                if ((v === 'agree' || v === 'partial') && !r.next_review) patch.next_review = U.addMonths(today(), r.review_interval_months || 6);
                mr.set(r.id, patch);
              } },
              Object.keys(DISPOSITION).map(function(k) { return h('option', { key: k, value: k }, DISPOSITION[k].label); }))),
            h('td', null,
              h('input', { className: 'wb-input wb-cm-inp', type: 'text', placeholder: dual ? 'Alliance owner' : 'owner', defaultValue: r.owner || '', 'aria-label': 'Owner for ' + code, onBlur: function(e) { mr.set(r.id, { owner: e.target.value }); } }),
              dual ? h('input', { className: 'wb-input wb-cm-inp wb-cm-inp--sub', type: 'text', placeholder: 'national programme owner', defaultValue: r.secondary_owner || '', 'aria-label': 'National owner for ' + code, onBlur: function(e) { mr.set(r.id, { secondary_owner: e.target.value }); } }) : null),
            h('td', null, h('input', { className: 'wb-input wb-cm-inp', type: 'email', placeholder: 'owner@org (optional)', defaultValue: r.owner_email || '', 'aria-label': 'Owner email for ' + code, onBlur: function(e) { mr.set(r.id, { owner_email: e.target.value }); } })),
            h('td', null, h('input', { className: 'wb-input wb-cm-note', type: 'text', placeholder: 'note (rationale / evidence)', defaultValue: r.evidence_note || '', 'aria-label': 'Note for ' + code, onBlur: function(e) { mr.set(r.id, { evidence_note: e.target.value }); } })));
        })))) : h('div', { className: 'wb-station-empty' },
          h('div', { className: 'wb-station-empty-title' }, 'No recommendations yet'),
          h('div', { className: 'wb-station-empty-desc' }, 'Add the evaluation recommendations to record the commissioner response, name an owner, and drive each to implementation.'));

    // ---- dissemination and use --------------------------------------------
    var disBody = dissem.length ? h('div', { className: 'wb-table-container' },
      h('table', { className: 'wb-table wb-cm-table' },
        h('thead', null, h('tr', null,
          h('th', null, 'Product'),
          h('th', null, 'For whom'),
          h('th', { className: 'wb-th--center', style: { minWidth: 120 } }, 'Due'),
          h('th', { style: { minWidth: 118 } }, 'Status'),
          h('th', { style: { width: 34 } }, ''))),
        h('tbody', null, dissem.map(function(d) {
          return h('tr', { key: d.id },
            h('td', null,
              h('input', { className: 'wb-input wb-cm-inp wb-cm-inp--strong', type: 'text', placeholder: 'product', defaultValue: d.product || '', 'aria-label': 'Product', onBlur: function(e) { dis.set(d.id, { product: e.target.value }); } }),
              d.format ? h('span', { className: 'wb-cm-inp--sub wb-cm-muted' }, d.format) : null),
            h('td', null, h('input', { className: 'wb-input wb-cm-inp', type: 'text', placeholder: 'audience', defaultValue: d.audience || '', 'aria-label': 'Audience', onBlur: function(e) { dis.set(d.id, { audience: e.target.value }); } })),
            h('td', { className: 'wb-th--center' }, h('input', { className: 'wb-input wb-cm-inp wb-cm-date', type: 'date', defaultValue: d.due_date || '', 'aria-label': 'Due date', onBlur: function(e) { dis.set(d.id, { due_date: e.target.value }); } })),
            h('td', null, h('select', { className: 'wb-input wb-cm-select', value: d.status || 'planned', 'aria-label': 'Product status', onChange: function(e) { dis.set(d.id, { status: e.target.value }); } },
              Object.keys(DIS_STATUS).map(function(k) { return h('option', { key: k, value: k }, DIS_STATUS[k].label); }))),
            h('td', null, h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-ghost', 'aria-label': 'Remove product', onClick: function() { dis.remove(d.id, 'Product removed'); } }, I.close(14))));
        })))) : h('div', { className: 'wb-station-empty' },
          h('div', { className: 'wb-station-empty-desc' }, 'No dissemination products yet. Findings are only useful once they reach the people who act on them.'));

    return h('section', { className: 'wb-cm-move', 'aria-label': 'Use' },
      moveHead('C4', 'Use', 'Drive findings to use', 'A recommendation is not done when it is accepted; it is done when it is implemented. Record the management response, and make sure each audience gets the product it needs to act.'),
      register.length ? funnel(register) : null,
      moneyLine(),
      userOutcomes(),
      h(SectionCard, { title: 'Management response', badge: register.length ? register.length + ' tracked' : 'Empty' },
        h('p', { className: 'wb-cm-panel-intro' }, 'Record the commissioner response to each recommendation and name who owns it' + (dual ? ', across the Alliance and national programmes.' : '.') + ' Implementation is then tracked six-monthly in C5 Follow-up.'),
        mrBody,
        h('div', { className: 'wb-cm-add' }, h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-outline', onClick: addRecommendation }, I.plus(14), ' Add recommendation'))),
      h(SectionCard, { title: 'Dissemination and use', badge: dissem.length ? dissem.length + ' products' : 'Empty' },
        h('p', { className: 'wb-cm-panel-intro' }, 'The learning and communication products that carry the findings to each intended user, and whether they have reached the people who must act.'),
        disBody,
        h('div', { className: 'wb-cm-add' }, h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-outline', onClick: addProduct }, I.plus(14), ' Add product'))));
  }

  window.CockpitUse = CockpitUse;
})();
