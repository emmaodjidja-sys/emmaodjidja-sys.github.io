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
    var stages = [
      { key: 'recommended', label: 'Recommended', n: total, color: 'var(--border-strong)' },
      { key: 'accepted', label: 'Accepted', n: accepted, color: 'var(--blue)' },
      { key: 'in_progress', label: 'In progress', n: inprog, color: 'var(--teal-ink)' },
      { key: 'implemented', label: 'Implemented', n: impl, color: 'var(--green)' }
    ];
    return h('div', { className: 'wb-cm-uptake wb-cm-funnel' },
      h('div', { className: 'wb-cm-uptake-head' },
        h('span', { className: 'wb-cm-uptake-title' }, 'Recommendation uptake'),
        h('span', { className: 'wb-cm-uptake-num' }, impl + ' of ' + total + ' implemented')),
      h('div', { className: 'wb-cm-uptake-bar wb-cm-funnel-bar' }, stages.map(function(s, i) {
        return h('div', { key: s.key, className: 'wb-cm-uptake-seg wb-cm-funnel-seg',
          style: { flexGrow: Math.max(s.n, 0.4), background: s.color },
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

    var mr = api.listSetter('management_response');
    var dis = api.listSetter('dissemination');

    function addRecommendation() {
      mr.add({
        id: U.uid('rec_'), code: 'R' + (register.length + 1), recommendation: '',
        disposition: 'agree', owner: '', secondary_owner: '', owner_email: '',
        due_date: '', implementation_status: 'not_started', progress: 0,
        review_interval_months: 6, next_review: '', review_history: [],
        actions: '', evidence_note: ''
      }, 'Recommendation added');
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
          return h('tr', { key: r.id },
            h('td', { className: 'wb-td--meta' }, code),
            h('td', null,
              h('textarea', { className: 'wb-input wb-cm-inp', rows: 2, placeholder: 'recommendation', defaultValue: r.recommendation || '', 'aria-label': 'Recommendation ' + code, onBlur: function(e) { mr.set(r.id, { recommendation: e.target.value }); } }),
              h('div', { className: 'wb-cm-mr-track' },
                statusBadge(IMPL_STATUS, r.implementation_status || 'not_started'),
                h('span', { className: 'wb-cm-muted' }, 'Tracked in C5 Follow-up'))),
            h('td', null, h('select', { className: 'wb-input wb-cm-select', value: r.disposition || 'agree', 'aria-label': 'Management response for ' + code, onChange: function(e) { mr.set(r.id, { disposition: e.target.value }); } },
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
