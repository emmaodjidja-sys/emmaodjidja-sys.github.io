(function() {
  'use strict';
  var h = React.createElement;
  var THRESH = ['Strong', 'Moderate', 'Weak'], RUBRIC = ['Excellent', 'Good', 'Fair', 'Poor'];
  var TMPL_LABELS = { threshold: 'Threshold', rubric: 'Rubric (4-level)', binary: 'Binary', freetext: 'Free text' };
  var THRESH_CLR = ['var(--green)', 'var(--amber)', 'var(--red)'];

  function MatrixInlineEditor(props) {
    var row = props.row;
    var s = React.useState(function() {
      return { subQ: (row.subQuestions || []).slice(), inds: (row.indicators || []).slice(),
        src: (row.dataSources || []).join(', '), jc: row.judgementCriteria || '',
        thr: THRESH.map(function(l) { return { level: l, text: '' }; }),
        rub: RUBRIC.map(function(l) { return { level: l, text: '' }; }), bp: '', bf: '' };
    });
    var d = s[0], set = s[1];
    var ts = React.useState('threshold'), tmpl = ts[0], setTmpl = ts[1];
    var es = React.useState(false), expanded = es[0], setExpanded = es[1];

    function upd(f, v) { set(function(p) { var n = Object.assign({}, p); n[f] = v; return n; }); }
    function updSubQ(i, v) { var a = d.subQ.slice(); a[i] = v; upd('subQ', a); }
    function rmInd(i) { upd('inds', d.inds.filter(function(_, j) { return j !== i; })); }

    function save() {
      var jc = d.jc;
      if (tmpl === 'threshold') jc = d.thr.map(function(r) { return r.level + ': ' + r.text; }).join(' | ');
      else if (tmpl === 'rubric') jc = d.rub.map(function(r) { return r.level + ': ' + r.text; }).join(' | ');
      else if (tmpl === 'binary') jc = 'Pass: ' + d.bp + ' | Fail: ' + d.bf;
      props.onSave(Object.assign({}, row, { subQuestions: d.subQ, indicators: d.inds,
        dataSources: d.src.split(',').map(function(s) { return s.trim(); }).filter(Boolean), judgementCriteria: jc }));
    }

    function levelRow(arr, field, colors) {
      return h('div', null, arr.map(function(r, i) {
        return h('div', { key: r.level, style: { display: 'flex', gap: 6, marginBottom: 4, alignItems: 'center' } },
          h('span', { style: { fontSize: 11, fontWeight: 600, minWidth: 60, color: colors ? colors[i] : 'var(--text)' } }, r.level),
          h('input', { className: 'wb-input', style: { fontSize: 11 }, value: r.text, placeholder: 'Criteria for ' + r.level,
            onChange: function(e) { var a = d[field].slice(); a[i] = { level: r.level, text: e.target.value }; upd(field, a); } }));
      }));
    }

    var jcContent;
    if (tmpl === 'threshold') jcContent = levelRow(d.thr, 'thr', THRESH_CLR);
    else if (tmpl === 'rubric') jcContent = levelRow(d.rub, 'rub');
    else if (tmpl === 'binary') {
      jcContent = h('div', null,
        ['Pass', 'Fail'].map(function(lbl, i) {
          var fld = i === 0 ? 'bp' : 'bf', clr = i === 0 ? 'var(--green)' : 'var(--red)';
          return h('div', { key: lbl, style: { display: 'flex', gap: 6, marginBottom: 4 } },
            h('span', { style: { fontSize: 11, fontWeight: 600, minWidth: 40, color: clr } }, lbl),
            h('input', { className: 'wb-input', style: { fontSize: 11 }, value: d[fld],
              onChange: function(e) { upd(fld, e.target.value); } }));
        }));
    } else {
      jcContent = h('textarea', { className: 'wb-input wb-textarea', value: d.jc, style: { fontSize: 11 },
        onChange: function(e) { upd('jc', e.target.value); } });
    }

    var left = h('div', { style: { flex: 1, minWidth: 240 } },
      h('label', { className: 'wb-label' }, 'Sub-questions'),
      d.subQ.map(function(sq, i) {
        return h('div', { key: i, style: { display: 'flex', gap: 6, marginBottom: 6 } },
          h('span', { style: { fontSize: 11, color: 'var(--slate)', minWidth: 28 } }, row.id.replace('eq_', '') + '.' + (i + 1)),
          h('input', { className: 'wb-input', value: sq, style: { fontSize: 12 },
            onChange: function(e) { updSubQ(i, e.target.value); } }));
      }),
      h('button', { className: 'wb-btn wb-btn-sm wb-btn-ghost', onClick: function() { upd('subQ', d.subQ.concat([''])); } }, '+ Add sub-question'),
      h('label', { className: 'wb-label', style: { marginTop: 14 } }, 'Indicators'),
      h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 4 } },
        d.inds.map(function(ind, i) {
          return h('span', { key: i, className: 'wb-badge wb-badge-teal', style: { fontSize: 10 } }, ind.code || ind.name,
            h('span', { onClick: function() { rmInd(i); }, style: { marginLeft: 4, cursor: 'pointer', fontWeight: 700 } }, '\u00d7'));
        })),
      h('div', { style: { marginTop: 6, display: 'flex', gap: 8 } },
        h('button', { className: 'wb-btn wb-btn-sm wb-btn-outline', onClick: function() { props.onOpenIndicatorBank(row.id); } }, '+ From Indicator Bank'),
        h('button', { className: 'wb-btn wb-btn-sm wb-btn-ghost' }, '+ Custom'))
    );

    var right = h('div', { style: { flex: 1, minWidth: 240 } },
      h('label', { className: 'wb-label' }, 'Data Sources'),
      h('textarea', { className: 'wb-input wb-textarea', value: d.src, style: { fontSize: 11, minHeight: 48 },
        onChange: function(e) { upd('src', e.target.value); } }),
      h('label', { className: 'wb-label', style: { marginTop: 14 } }, 'Judgement Criteria'),
      h('div', { style: { display: 'flex', gap: 6, marginBottom: 8 } },
        h('button', { className: 'wb-btn wb-btn-sm ' + (tmpl === 'threshold' ? 'wb-btn-primary' : 'wb-btn-ghost'),
          onClick: function() { setTmpl('threshold'); } }, 'Threshold'),
        expanded ? ['rubric', 'binary', 'freetext'].map(function(t) {
          return h('button', { key: t, className: 'wb-btn wb-btn-sm ' + (tmpl === t ? 'wb-btn-primary' : 'wb-btn-ghost'),
            onClick: function() { setTmpl(t); } }, TMPL_LABELS[t]);
        }) : h('button', { className: 'wb-btn wb-btn-sm wb-btn-ghost', onClick: function() { setExpanded(true); } }, 'Other formats \u25B8')),
      jcContent);

    return h('div', { style: { background: '#F8FAFC', border: '2px solid var(--blue)', borderRadius: 'var(--radius-md)', padding: 16, marginTop: -1 } },
      h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 } }, left, right),
      h('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border)' } },
        h('button', { className: 'wb-btn wb-btn-sm wb-btn-ghost', onClick: props.onCancel }, 'Cancel'),
        h('button', { className: 'wb-btn wb-btn-sm wb-btn-primary', onClick: save }, 'Save')));
  }

  window.MatrixInlineEditor = MatrixInlineEditor;
})();
