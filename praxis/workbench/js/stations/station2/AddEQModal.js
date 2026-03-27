(function() {
  'use strict';
  var h = React.createElement;
  var BANK = (typeof window !== 'undefined' && window.PRAXIS_INDICATOR_BANK) || {};
  var OECD_DAC = BANK.OECD_DAC || {};

  function AddEQModal(props) {
    var ss = React.useState({}), sel = ss[0], setSel = ss[1];
    var cs = React.useState({ text: '', criterion: 'relevance' }), custom = cs[0], setCustom = cs[1];
    var os = React.useState(''), overlap = os[0], setOverlap = os[1];

    var suggestions = React.useMemo(function() {
      return MatrixGenerator.generateEQSuggestions(props.toc || {}, props.context || {}, props.existingRows || []);
    }, [props.toc, props.context, props.existingRows]);

    var selCount = Object.keys(sel).filter(function(k) { return sel[k]; }).length + (custom.text.trim() ? 1 : 0);

    function checkOverlap(text) {
      if (!text || text.length < 10) { setOverlap(''); return; }
      var words = text.toLowerCase().split(/\s+/).filter(function(w) { return w.length > 4; });
      for (var i = 0; i < (props.existingRows || []).length; i++) {
        var eq = props.existingRows[i], eqW = (eq.question || '').toLowerCase().split(/\s+/);
        if (words.filter(function(w) { return eqW.indexOf(w) >= 0; }).length >= 3) {
          setOverlap('Similar to existing EQ: "' + eq.question.substring(0, 60) + '\u2026"'); return;
        }
      }
      setOverlap('');
    }

    function handleAdd() {
      var newRows = [];
      suggestions.forEach(function(s, i) {
        if (sel[i]) newRows.push({ id: 'eq_new_' + PraxisUtils.uid(''), criterion: s.criterion, question: s.question,
          subQuestions: [], indicators: [], dataSources: [], judgementCriteria: '', linkedOutcome: s.linkedOutcome || '' });
      });
      if (custom.text.trim()) newRows.push({ id: 'eq_custom_' + PraxisUtils.uid(''), criterion: custom.criterion,
        question: custom.text.trim(), subQuestions: [], indicators: [], dataSources: [], judgementCriteria: '' });
      props.onAdd(newRows);
    }

    return h(Modal, { isOpen: true, onClose: props.onClose, title: 'Add Evaluation Questions', width: '640px' },
      h('div', { className: 'wb-guidance', style: { marginBottom: 14 } },
        h('span', { style: { fontSize: 14 } }, '\u2728'),
        h('span', { className: 'wb-guidance-text' },
          'Based on your Theory of Change and DAC criteria, these questions address gaps in your matrix.')),
      h('div', { style: { maxHeight: 320, overflowY: 'auto', marginBottom: 14 } },
        suggestions.length === 0
          ? h('p', { style: { fontSize: 12, color: 'var(--slate)', padding: 12 } }, 'No additional suggestions \u2014 your matrix covers all DAC criteria.')
          : suggestions.map(function(s, i) {
            var dac = OECD_DAC[s.criterion] || {};
            return h('div', { key: i, className: 'wb-card wb-card--interactive' + (sel[i] ? ' wb-card--selected' : ''),
              onClick: function() { setSel(function(p) { var n = Object.assign({}, p); n[i] = !n[i]; return n; }); },
              style: { marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 10 } },
              h('input', { type: 'checkbox', checked: !!sel[i], readOnly: true, style: { marginTop: 3 } }),
              h('div', { style: { flex: 1 } },
                h('div', { style: { display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 } },
                  h('span', { className: 'wb-badge', style: { background: dac.color || '#666', color: '#fff' } },
                    (dac.name || s.criterion).toUpperCase()),
                  s.recommended ? h('span', { className: 'wb-badge wb-badge-green', style: { fontSize: 9 } }, 'Recommended') : null,
                  s.isNormative ? h('span', { className: 'wb-badge wb-badge-amber', style: { fontSize: 9 } }, 'Cross-cutting') : null),
                h('p', { style: { fontSize: 12, margin: 0, lineHeight: 1.4 } }, s.question),
                s.linkedOutcome ? h('span', { style: { fontSize: 10, color: 'var(--slate)' } },
                  'Linked: ' + s.linkedOutcome.substring(0, 60)) : null));
          })),
      h('div', { style: { borderTop: '1px solid var(--border)', paddingTop: 12 } },
        h('label', { className: 'wb-label' }, 'OR WRITE YOUR OWN'),
        h('div', { style: { display: 'flex', gap: 8 } },
          h('select', { className: 'wb-input', value: custom.criterion, style: { width: 120, fontSize: 11 },
            onChange: function(e) { setCustom(Object.assign({}, custom, { criterion: e.target.value })); } },
            Object.keys(OECD_DAC).map(function(k) { return h('option', { key: k, value: k }, OECD_DAC[k].name); })),
          h('input', { className: 'wb-input', style: { flex: 1, fontSize: 12 }, placeholder: 'Type your evaluation question\u2026',
            value: custom.text, onChange: function(e) {
              setCustom(Object.assign({}, custom, { text: e.target.value })); checkOverlap(e.target.value); } })),
        overlap ? h('p', { style: { fontSize: 10, color: 'var(--amber)', marginTop: 4 } }, '\u26a0 ' + overlap) : null),
      h('div', { className: 'wb-modal-footer', style: { margin: '14px -18px -18px', padding: '12px 18px' } },
        h('span', { style: { flex: 1, fontSize: 11, color: 'var(--slate)' } }, selCount + ' question' + (selCount !== 1 ? 's' : '') + ' selected'),
        h('button', { className: 'wb-btn wb-btn-sm wb-btn-ghost', onClick: props.onClose }, 'Cancel'),
        h('button', { className: 'wb-btn wb-btn-sm wb-btn-teal', onClick: handleAdd }, 'Add to Matrix')));
  }

  window.AddEQModal = AddEQModal;
})();
