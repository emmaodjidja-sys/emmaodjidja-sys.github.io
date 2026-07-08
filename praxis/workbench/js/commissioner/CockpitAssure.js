/**
 * CockpitAssure: C2 Assure station of the commissioner cockpit. Quality-gate the design
 * at inception, when course-correction is still cheap. Per-EQ answerability (design
 * confidence, not strength of evidence, which cannot exist before fieldwork), an
 * independence attestation, an ethics / safeguarding sign-off, and the inception gate
 * decision. Renders ONLY the station body; the shell owns the cockpit header.
 * window.CockpitAssure. React.createElement house style, PraxisIcons for glyphs.
 */
(function() {
  'use strict';
  var h = React.createElement;
  var I = window.PraxisIcons;
  var U = window.PraxisUtils;
  var D = window.CockpitData;
  var A = window.CockpitAtoms;
  var Save = window.CockpitSave;

  var PANEL_INTRO = 'At inception, rate whether each question can be answered with its proposed method, source and judgement criteria. Strength of evidence is assessed later, at report acceptance.';
  // Imperative button labels for the three gate decisions (GATE_DECISION stores the
  // past-tense state that the badge reads back).
  var DECISION_LABEL = { approve: 'Approve', conditions: 'Approve with conditions', return: 'Return for redesign' };

  // Which evaluator-lens station authors each inception-package element, so a commissioner can
  // click through from C2 to see and assess the actual work (not just its done/not-done chip).
  var INCEPTION_STATION = { evaluability: 0, toc: 1, evaluation_matrix: 2, design_recommendation: 3, sample_parameters: 4 };

  // Answerability distribution: one bar per band, worst (Not answerable) on the left
  // through best (High confidence) on the right, so it reads with the scale ends.
  function answerabilityDist(rows, evMap) {
    var counts = [0, 0, 0, 0], rated = 0;
    rows.forEach(function(r) { var ev = evMap[r.id]; if (ev && typeof ev.rating === 'number') { counts[ev.rating - 1]++; rated++; } });
    var max = Math.max(1, counts[0], counts[1], counts[2], counts[3]);
    var bands = D.ANSW.slice().sort(function(a, b) { return a.v - b.v; });
    return h('div', { className: 'wb-cm-dist' },
      h('div', { className: 'wb-cm-dist-head' },
        h('span', { className: 'wb-cm-dist-title' }, 'Answerability'),
        h('span', { className: 'wb-cm-dist-sub' }, rated + ' of ' + rows.length + ' rated')),
      h('div', { className: 'wb-cm-dist-bars' }, bands.map(function(s) {
        var n = counts[s.v - 1];
        return h('div', { key: s.v, className: 'wb-cm-dist-col', title: s.label + ': ' + n },
          h('div', { className: 'wb-cm-dist-track' }, h('div', { className: 'wb-cm-dist-fill', style: { height: (n / max * 100) + '%', background: s.color } })),
          h('span', { className: 'wb-cm-dist-n' }, n),
          h('span', { className: 'wb-cm-dist-x' }, s.v));
      })),
      h('div', { className: 'wb-cm-dist-scale' }, h('span', null, 'Not answerable'), h('span', null, 'High confidence')));
  }

  function CockpitAssure(props) {
    var context = props.state.context;
    var dispatch = props.dispatch;
    var AT = PraxisContext.ACTION_TYPES;
    var api = Save.make(context, dispatch);
    var SectionCard = window.SectionCard;

    // Switch to the evaluation-team lens and open the station that authors this element, so the
    // commissioner can assess the underlying design work. The role toggle returns them to C2.
    function openEvaluatorStation(stationIdx) {
      dispatch({ type: AT.SET_ACTIVE_STATION, station: stationIdx });
      dispatch({ type: AT.SET_ROLE, role: 'evaluator' });
    }

    var cm = context.commissioner || {};
    var gov = cm.governance || {};
    var profile = D.profileOf(gov);
    var rows = (context.evaluation_matrix && context.evaluation_matrix.rows) || [];
    var gate = cm.gate || {};
    var appraisal = cm.appraisal || { evidence: [] };
    var servedIds = D.servedEqIds(cm.users || []);
    var evMap = D.evidenceMap(appraisal.evidence);

    var withSource = rows.filter(function(r) { return D.hasSource(r); }).length;
    var served = rows.filter(function(r) { return servedIds[r.id]; }).length;

    // ---- appraisal.evidence (answerability), upsert keyed by eq_id ----------
    function saveEvidence(eqId, partial, msg) {
      var list = (appraisal.evidence || []).slice();
      var idx = -1;
      for (var i = 0; i < list.length; i++) { if (list[i].eq_id === eqId) { idx = i; break; } }
      if (idx === -1) list = list.concat([Object.assign({ eq_id: eqId, rating: null, justification: '' }, partial)]);
      else list[idx] = Object.assign({}, list[idx], partial);
      api.saveCommissioner(api.patch({ appraisal: Object.assign({}, appraisal, { evidence: list }) }), msg);
    }

    // ---- gate.independence --------------------------------------------------
    var ind = gate.independence || { attested: false, statement: '', conflicts: [], attested_by: '', attested_at: null };
    var conflicts = (ind.conflicts || []).map(function(c, i) { return typeof c === 'string' ? { id: 'cfl_' + i, text: c } : c; });
    function saveInd(p, msg) { api.setGate({ independence: Object.assign({}, ind, p) }, msg); }

    // ---- gate.ethics --------------------------------------------------------
    var eth = gate.ethics || { status: 'none', body: '', note: '', cleared_at: null };
    function saveEth(p, msg) { api.setGate({ ethics: Object.assign({}, eth, p) }, msg); }

    // ---- gate.conditions ----------------------------------------------------
    var conds = gate.conditions || [];
    function addCondition() { api.setGate({ conditions: conds.concat([{ id: U.uid('cond_'), text: '', resolved: false }]) }); }
    function setCondition(id, p) { api.setGate({ conditions: conds.map(function(c) { return c.id === id ? Object.assign({}, c, p) : c; }) }); }
    function removeCondition(id) { api.setGate({ conditions: conds.filter(function(c) { return c.id !== id; }) }); }

    // ================= per-EQ design QA table ==============================
    var table = rows.length ? h('div', { className: 'wb-table-container' },
      h('table', { className: 'wb-table wb-cm-table' },
        h('thead', null, h('tr', null,
          h('th', { style: { width: 34 } }, '#'),
          h('th', null, 'Evaluation question'),
          h('th', { className: 'wb-th--center' }, 'Method'),
          h('th', { className: 'wb-th--center' }, 'Source'),
          h('th', { className: 'wb-th--center' }, 'Serves a use'),
          h('th', { className: 'wb-th--center', style: { minWidth: 150 } }, 'Answerability'),
          h('th', null, 'Commissioner note'))),
        h('tbody', null, rows.map(function(r) {
          var ev = evMap[r.id] || {};
          return h('tr', { key: r.id },
            h('td', { className: 'wb-td--meta' }, r.number != null ? r.number : ''),
            h('td', null, h('div', { className: 'wb-cm-eq' }, r.question || '(untitled question)')),
            h('td', { className: 'wb-th--center' }, D.hasMethod(r) ? A.okMark() : A.warnMark('No indicator/method')),
            h('td', { className: 'wb-th--center' }, D.hasSource(r) ? A.okMark() : A.warnMark('No named data source')),
            h('td', { className: 'wb-th--center' }, servedIds[r.id] ? A.okMark() : A.dashMark('Not linked to an intended use')),
            h('td', { className: 'wb-th--center' }, h('div', { className: 'wb-cm-soe' },
              D.ANSW.map(function(s) {
                var on = ev.rating === s.v;
                return h('button', { key: s.v, type: 'button', className: 'wb-cm-soe-btn wb-cm-soe-btn--' + s.v + (on ? ' wb-cm-soe-btn--on' : ''), title: 'Answerability ' + s.v + ': ' + s.label + '. ' + s.desc, 'aria-label': 'Answerability ' + s.v + ', ' + s.label, 'aria-pressed': on ? 'true' : 'false', onClick: function() { saveEvidence(r.id, { rating: s.v }, 'Answerability recorded'); } }, String(s.v));
              }))),
            h('td', null, h('input', { className: 'wb-input wb-cm-note', type: 'text', placeholder: 'why this rating', defaultValue: ev.justification || '', 'aria-label': 'Commissioner note for question ' + (r.number || ''), onBlur: function(e) { saveEvidence(r.id, { justification: e.target.value }); } })));
        })))) : h('div', { className: 'wb-station-empty' },
          h('div', { className: 'wb-station-empty-title' }, 'No evaluation questions yet'),
          h('div', { className: 'wb-station-empty-desc' }, 'Build the evaluation matrix in Station 2. Each question then appears here for inception design QA before the gate.'));

    // Inception package completeness chips. Each is a button that opens the evaluation-team
    // station authoring that element, so the commissioner can review and assess the actual work.
    var inceptionChips = h('div', { className: 'wb-cm-inception' },
      h('span', { className: 'wb-cm-inception-label' }, 'Inception package'),
      D.INCEPTION.map(function(s) {
        var done = !!(context[s.field] && context[s.field].completed_at);
        var st = INCEPTION_STATION[s.field];
        return h('button', { key: s.field, type: 'button',
          className: 'wb-cm-inception-chip' + (done ? ' wb-cm-inception-chip--done' : ''),
          title: 'Open the evaluation team view of ' + s.label + ' (Station ' + st + ') to review it',
          'aria-label': 'Review ' + s.label + ' in the evaluation team view' + (done ? ', complete' : ', not yet complete'),
          onClick: function() { openEvaluatorStation(st); } },
          done ? I.check(11) : null, s.label, I.chevronRight(11));
      }));

    // ================= independence attestation ============================
    var attested = !!ind.attested;
    var independenceCard = h(SectionCard, { title: 'Independence', badge: attested ? 'Attested' : 'Not attested', variant: attested ? 'complete' : null },
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
        h('div', { style: { display: 'flex', alignItems: 'flex-start', gap: 10 } },
          h('button', { type: 'button', role: 'switch', 'aria-checked': attested ? 'true' : 'false',
            className: 'wb-cm-cond-check' + (attested ? ' wb-cm-cond-check--on' : ''),
            'aria-label': attested ? 'Withdraw independence attestation' : 'Attest independence',
            onClick: function() { saveInd(attested ? { attested: false } : { attested: true, attested_at: new Date().toISOString() }, attested ? null : 'Independence attested'); } }, attested ? I.check(12) : ''),
          h('div', null,
            h('div', { className: 'wb-cm-cond-text' }, 'The evaluation team is independent of the program under review and its management.'),
            attested && ind.attested_at ? h('div', { className: 'wb-cm-muted' }, 'Attested ' + D.fdate(ind.attested_at) + (ind.attested_by ? ' by ' + ind.attested_by : '')) : null)),
        h('textarea', { className: 'wb-input', rows: 2, placeholder: 'Independence statement (how independence is assured)', defaultValue: ind.statement || '', 'aria-label': 'Independence statement', onBlur: function(e) { saveInd({ statement: e.target.value }); } }),
        h('input', { className: 'wb-input', type: 'text', placeholder: 'Attested by (name, role)', defaultValue: ind.attested_by || '', 'aria-label': 'Attested by', onBlur: function(e) { saveInd({ attested_by: e.target.value }); } }),
        h('div', { className: 'wb-cm-conditions' },
          h('div', { className: 'wb-cm-conditions-label' }, 'Declared conflicts of interest'),
          conflicts.map(function(c) {
            return h('div', { key: c.id, className: 'wb-cm-condition' },
              h('input', { className: 'wb-input wb-cm-cond-text', type: 'text', placeholder: 'declared conflict', defaultValue: c.text || '', 'aria-label': 'Declared conflict', onBlur: function(e) { saveInd({ conflicts: conflicts.map(function(x) { return x.id === c.id ? Object.assign({}, x, { text: e.target.value }) : x; }) }); } }),
              h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-ghost', 'aria-label': 'Remove conflict', onClick: function() { saveInd({ conflicts: conflicts.filter(function(x) { return x.id !== c.id; }) }); } }, I.close(14)));
          }),
          h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-outline', onClick: function() { saveInd({ conflicts: conflicts.concat([{ id: U.uid('cfl_'), text: '' }]) }); } }, I.plus(14), ' Add conflict'))));

    // ================= ethics / safeguarding sign-off ======================
    var ethStatus = eth.status || 'none';
    var ethicsCard = h(SectionCard, { title: 'Ethics and safeguarding', badge: (D.ETHICS_STATUS[ethStatus] || {}).label || 'Not started', variant: ethStatus === 'cleared' ? 'complete' : (ethStatus === 'pending' ? 'warning' : null) },
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' } },
          h('label', { className: 'wb-cm-focus-label', htmlFor: 'wb-cm-eth-status', style: { margin: 0 } }, 'Clearance status'),
          h('select', { id: 'wb-cm-eth-status', className: 'wb-input wb-cm-select', value: ethStatus, 'aria-label': 'Ethics clearance status',
            onChange: function(e) { var v = e.target.value; var p = { status: v }; if (v === 'cleared' && !eth.cleared_at) p.cleared_at = new Date().toISOString(); saveEth(p, 'Ethics status updated'); } },
            Object.keys(D.ETHICS_STATUS).map(function(k) { return h('option', { key: k, value: k }, D.ETHICS_STATUS[k].label); })),
          ethStatus === 'cleared' && eth.cleared_at ? h('span', { className: 'wb-cm-muted' }, 'Cleared ' + D.fdate(eth.cleared_at)) : null),
        h('input', { className: 'wb-input', type: 'text', placeholder: 'Ethics or IRB body (who cleared it)', defaultValue: eth.body || '', 'aria-label': 'Ethics or review body', onBlur: function(e) { saveEth({ body: e.target.value }); } }),
        h('textarea', { className: 'wb-input', rows: 2, placeholder: 'Safeguarding note (protocol, consent, data protection)', defaultValue: eth.note || '', 'aria-label': 'Safeguarding note', onBlur: function(e) { saveEth({ note: e.target.value }); } })));

    // ================= inception gate decision =============================
    var conditionsBlock = h('div', { className: 'wb-cm-conditions' },
      h('div', { className: 'wb-cm-conditions-label' }, 'Conditions to clear before final acceptance'),
      conds.map(function(c) {
        return h('div', { key: c.id, className: 'wb-cm-condition' },
          h('button', { type: 'button', className: 'wb-cm-cond-check' + (c.resolved ? ' wb-cm-cond-check--on' : ''), 'aria-label': c.resolved ? 'Mark condition unresolved' : 'Mark condition resolved', onClick: function() { setCondition(c.id, { resolved: !c.resolved }); } }, c.resolved ? I.check(12) : ''),
          h('input', { className: 'wb-input wb-cm-cond-text', type: 'text', placeholder: 'condition', defaultValue: c.text || '', 'aria-label': 'Condition to clear before final acceptance', onBlur: function(e) { setCondition(c.id, { text: e.target.value }); } }),
          h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-ghost', 'aria-label': 'Remove condition', onClick: function() { removeCondition(c.id); } }, I.close(14)));
      }),
      h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-outline', onClick: addCondition }, I.plus(14), ' Add condition'));

    var decided = gate.decision && D.GATE_DECISION[gate.decision];
    // A positive gate decision cannot be recorded until the two structural preconditions are
    // met: the evaluation team's independence is attested and ethics is cleared (or N/A).
    // Returning for redesign is always available. This makes the gate a real control.
    var ethOk = ethStatus === 'cleared' || ethStatus === 'na';
    var canApprove = attested && ethOk;
    var approveBlockers = [];
    if (!attested) approveBlockers.push('independence is attested');
    if (!ethOk) approveBlockers.push('ethics is cleared or marked not applicable');
    var decisionRow = h('div', { className: 'wb-cm-decision' },
      h('div', { className: 'wb-cm-decision-head' },
        h('span', { className: 'wb-cm-decision-title' }, 'Inception decision'),
        decided ? h('span', { className: 'wb-badge ' + D.GATE_DECISION[gate.decision].badge }, D.GATE_DECISION[gate.decision].label) : null,
        gate.decided_at ? h('span', { className: 'wb-cm-decision-when' }, D.fdate(gate.decided_at) + (gate.decided_by ? ' by ' + gate.decided_by : '')) : null),
      h('p', { className: 'wb-cm-decision-sub' }, 'Reviewed by ' + profile.gateReviewers + ', before fieldwork spend. ' + withSource + ' of ' + rows.length + ' questions have a named data source; ' + served + ' trace to an intended use.'),
      h('div', { className: 'wb-cm-decision-btns' }, Object.keys(D.GATE_DECISION).map(function(k) {
        var on = gate.decision === k;
        var blocked = (k === 'approve' || k === 'conditions') && !canApprove;
        return h('button', { key: k, type: 'button', disabled: blocked,
          title: blocked ? ('Available once ' + approveBlockers.join(' and ') + '.') : null,
          className: 'wb-btn wb-btn-sm' + (on ? ' wb-btn-primary' : ''),
          style: blocked ? { opacity: 0.45, cursor: 'not-allowed' } : null,
          onClick: function() { if (blocked) return; api.setGate({ decision: k, decided_at: new Date().toISOString() }, 'Inception decision recorded: ' + D.GATE_DECISION[k].label); } }, DECISION_LABEL[k] || D.GATE_DECISION[k].label);
      })),
      !canApprove ? h('p', { className: 'wb-cm-recon' }, 'Approval is available once ' + approveBlockers.join(' and ') + '. Return for redesign is available now.') : null,
      gate.decision === 'conditions' ? conditionsBlock : null,
      h('div', { className: 'wb-cm-cfield', style: { maxWidth: 340, marginTop: 8 } },
        h('label', { className: 'wb-cm-cfield-label', htmlFor: 'gate-by' }, 'Decision by'),
        h('input', { id: 'gate-by', className: 'wb-input wb-cm-inp', type: 'text', placeholder: 'name and role of the deciding officer',
          key: 'gateby:' + (gate.decided_by || ''), defaultValue: gate.decided_by || '', 'aria-label': 'Decision by',
          onBlur: function(e) { api.setGate({ decided_by: e.target.value }); } })),
      h('textarea', { className: 'wb-input wb-cm-decision-note', rows: 2, placeholder: 'Decision rationale (optional)', defaultValue: gate.note || '', 'aria-label': 'Decision rationale', onBlur: function(e) { api.setGate({ note: e.target.value }); } }));

    return h('section', { className: 'wb-cm-move', 'aria-label': 'Assure' },
      A.moveHead('C2', 'Assure', 'Quality-gate before spend', 'The commissioner signs off the design at inception, when course-correction is still cheap.'),
      rows.length ? h('div', { className: 'wb-cm-assure-top' }, answerabilityDist(rows, evMap), inceptionChips) : null,
      h(SectionCard, { title: 'Inception design QA', badge: rows.length ? (withSource + ' / ' + rows.length + ' sourced') : 'Awaiting matrix', variant: (rows.length && withSource < rows.length) ? 'warning' : null },
        rows.length ? h('p', { className: 'wb-cm-panel-intro' }, PANEL_INTRO) : null,
        table),
      independenceCard,
      ethicsCard,
      decisionRow);
  }

  window.CockpitAssure = CockpitAssure;
})();
