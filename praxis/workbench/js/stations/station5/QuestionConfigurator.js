(function() {
  'use strict';
  var h = React.createElement;

  var RESPONSE_TYPES = [
    { key: 'likert', label: 'Likert Scale' },
    { key: 'select_one', label: 'Multiple Choice' },
    { key: 'numeric', label: 'Numeric' },
    { key: 'text', label: 'Open Text' },
    { key: 'ranking', label: 'Ranking' },
    { key: 'date', label: 'Date' }
  ];

  var LIKERT_LABELS = {
    5: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'],
    4: ['Strongly disagree', 'Disagree', 'Agree', 'Strongly agree'],
    3: ['Disagree', 'Neutral', 'Agree']
  };

  function QuestionConfigurator(props) {
    var q = props.question, suggested = props.suggestedType, onChange = props.onChange;
    var cfg = q.responseConfig || {};

    function update(patch) {
      onChange(Object.assign({}, q, patch));
    }
    function updateCfg(patch) {
      update({ responseConfig: Object.assign({}, cfg, patch) });
    }

    // Suggestion pill
    var pill = suggested ? h('div', { style: { fontSize: 12, color: '#2B6CB0', background: '#EBF8FF', borderRadius: 12, padding: '3px 10px', display: 'inline-block', marginBottom: 10 } },
      'Suggested: ', h('strong', null, suggested.type), ' \u2014 ', suggested.reason) : null;

    // Type buttons
    var typeRow = h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 } },
      RESPONSE_TYPES.map(function(t) {
        var active = q.responseType === t.key;
        return h('button', { key: t.key, className: 'wb-btn wb-btn-sm', style: { background: active ? '#1a365d' : '#EDF2F7', color: active ? '#fff' : '#2D3748', fontWeight: active ? 600 : 400 },
          onClick: function() { update({ responseType: t.key }); } }, t.label);
      }));

    // Type-specific config
    var configPanel = null;
    if (q.responseType === 'likert') {
      var pts = cfg.points || 5;
      var labels = LIKERT_LABELS[pts] || LIKERT_LABELS[5];
      configPanel = h('div', { className: 'wb-card', style: { padding: 12, marginBottom: 12 } },
        h('div', { style: { display: 'flex', gap: 6, marginBottom: 10 } },
          [5, 4, 3].map(function(n) { return h('button', { key: n, className: 'wb-btn wb-btn-sm', style: { background: pts === n ? '#1a365d' : '#EDF2F7', color: pts === n ? '#fff' : '#2D3748' },
            onClick: function() { updateCfg({ points: n }); } }, n + '-point'); })),
        h('div', { style: { display: 'flex', gap: 4, marginBottom: 10 } },
          labels.map(function(l) { return h('span', { key: l, style: { flex: 1, fontSize: 11, textAlign: 'center', padding: '4px 2px', background: '#F7FAFC', border: '1px solid #E2E8F0', borderRadius: 4 } }, l); })),
        h('label', { style: { fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 } },
          h('input', { type: 'checkbox', checked: !!cfg.includeNA, onChange: function(e) { updateCfg({ includeNA: e.target.checked }); } }), "Include Don't Know / N/A"),
        h('label', { style: { fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 } },
          h('input', { type: 'checkbox', checked: !!q.required, onChange: function(e) { update({ required: e.target.checked }); } }), 'Required'));
    } else if (q.responseType === 'select_one' || q.responseType === 'select_multiple') {
      var opts = cfg.options || ['Option 1'];
      configPanel = h('div', { className: 'wb-card', style: { padding: 12, marginBottom: 12 } },
        h('div', { style: { display: 'flex', gap: 8, marginBottom: 8 } },
          h('button', { className: 'wb-btn wb-btn-sm', style: { background: q.responseType === 'select_one' ? '#1a365d' : '#EDF2F7', color: q.responseType === 'select_one' ? '#fff' : '#2D3748' },
            onClick: function() { update({ responseType: 'select_one' }); } }, 'Single'),
          h('button', { className: 'wb-btn wb-btn-sm', style: { background: q.responseType === 'select_multiple' ? '#1a365d' : '#EDF2F7', color: q.responseType === 'select_multiple' ? '#fff' : '#2D3748' },
            onClick: function() { update({ responseType: 'select_multiple' }); } }, 'Multi')),
        opts.map(function(o, i) {
          return h('div', { key: i, style: { display: 'flex', gap: 4, marginBottom: 4 } },
            h('input', { type: 'text', value: o, style: { flex: 1, fontSize: 12, padding: '4px 6px', border: '1px solid #CBD5E0', borderRadius: 4 },
              onChange: function(e) { var nOpts = opts.slice(); nOpts[i] = e.target.value; updateCfg({ options: nOpts }); } }),
            h('button', { style: { border: 'none', background: 'none', color: '#E53E3E', cursor: 'pointer', fontSize: 14 },
              onClick: function() { updateCfg({ options: opts.filter(function(_, j) { return j !== i; }) }); } }, '\u00d7'));
        }),
        h('button', { className: 'wb-btn wb-btn-sm', style: { marginTop: 6 },
          onClick: function() { updateCfg({ options: opts.concat(['Option ' + (opts.length + 1)])}); } }, '+ Add option'));
    } else if (q.responseType === 'numeric') {
      configPanel = h('div', { className: 'wb-card', style: { padding: 12, marginBottom: 12, display: 'flex', gap: 12 } },
        h('label', { style: { fontSize: 12 } }, 'Min ', h('input', { type: 'number', value: cfg.min != null ? cfg.min : '', style: { width: 60, fontSize: 12, padding: '3px 6px', border: '1px solid #CBD5E0', borderRadius: 4 },
          onChange: function(e) { updateCfg({ min: e.target.value ? Number(e.target.value) : undefined }); } })),
        h('label', { style: { fontSize: 12 } }, 'Max ', h('input', { type: 'number', value: cfg.max != null ? cfg.max : '', style: { width: 60, fontSize: 12, padding: '3px 6px', border: '1px solid #CBD5E0', borderRadius: 4 },
          onChange: function(e) { updateCfg({ max: e.target.value ? Number(e.target.value) : undefined }); } })),
        h('label', { style: { fontSize: 12 } }, 'Unit ', h('input', { type: 'text', value: cfg.unit || '', style: { width: 80, fontSize: 12, padding: '3px 6px', border: '1px solid #CBD5E0', borderRadius: 4 },
          onChange: function(e) { updateCfg({ unit: e.target.value }); } })));
    } else if (q.responseType === 'text') {
      configPanel = h('div', { className: 'wb-card', style: { padding: 12, marginBottom: 12 } },
        h('label', { style: { fontSize: 12 } }, 'Character limit (optional) ',
          h('input', { type: 'number', value: cfg.maxLength || '', style: { width: 80, fontSize: 12, padding: '3px 6px', border: '1px solid #CBD5E0', borderRadius: 4 },
            onChange: function(e) { updateCfg({ maxLength: e.target.value ? Number(e.target.value) : undefined }); } })));
    } else if (q.responseType === 'ranking') {
      var items = cfg.items || ['Item 1'];
      configPanel = h('div', { className: 'wb-card', style: { padding: 12, marginBottom: 12 } },
        items.map(function(it, i) {
          return h('div', { key: i, style: { display: 'flex', gap: 4, marginBottom: 4 } },
            h('span', { style: { fontSize: 12, color: '#718096', width: 20 } }, (i + 1) + '.'),
            h('input', { type: 'text', value: it, style: { flex: 1, fontSize: 12, padding: '4px 6px', border: '1px solid #CBD5E0', borderRadius: 4 },
              onChange: function(e) { var ni = items.slice(); ni[i] = e.target.value; updateCfg({ items: ni }); } }));
        }),
        h('button', { className: 'wb-btn wb-btn-sm', style: { marginTop: 6 },
          onClick: function() { updateCfg({ items: items.concat(['Item ' + (items.length + 1)])}); } }, '+ Add item'));
    }

    // XLSForm preview
    var xlsName = InstrumentExport.sanitizeName(q.text, 1);
    var xlsType = q.responseType === 'likert' ? 'select_one likert' + (cfg.points || 5)
      : q.responseType === 'select_one' ? 'select_one list' : q.responseType === 'select_multiple' ? 'select_multiple list'
      : q.responseType === 'numeric' ? 'integer' : q.responseType === 'date' ? 'date' : 'text';

    var xlsPreview = h('div', { style: { background: '#1a365d', color: '#A0D2DB', borderRadius: 6, padding: 12, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, lineHeight: 1.7 } },
      h('div', null, h('span', { style: { color: '#90CDF4' } }, 'type: '), xlsType),
      h('div', null, h('span', { style: { color: '#90CDF4' } }, 'name: '), xlsName),
      h('div', null, h('span', { style: { color: '#90CDF4' } }, 'label: '), q.text || ''),
      h('div', null, h('span', { style: { color: '#90CDF4' } }, 'required: '), q.required ? 'yes' : 'false'));

    return h('div', null, pill, typeRow, configPanel, xlsPreview);
  }

  window.QuestionConfigurator = QuestionConfigurator;
})();
