(function() {
  'use strict';
  var h = React.createElement;

  function PhaseReview(props) {
    var phaseNumber = props.phaseNumber;
    var phaseTitle = props.phaseTitle;
    var data = props.data || {};
    var earlySignals = props.earlySignals || [];
    var onEdit = props.onEdit;
    var onContinue = props.onContinue;
    var continueLabel = props.continueLabel || 'Continue';

    var fields = Object.keys(data);

    function formatLabel(key) {
      return key.replace(/_/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); });
    }

    function formatValue(val) {
      if (Array.isArray(val)) {
        return val.length > 0 ? val.join(', ') : null;
      }
      if (typeof val === 'string') return val || null;
      if (val == null) return null;
      return String(val);
    }

    return h('div', { className: 'wb-card', style: { padding: '24px', margin: '16px 0' } },
      // Header
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 20 } },
        h('span', { style: { color: '#059669', fontSize: '20px' } }, '\u2713'),
        h('h3', { style: { fontSize: '14px', fontWeight: 600, color: '#1F2937', margin: 0 } },
          'Phase ' + phaseNumber + ' Complete \u2014 ' + phaseTitle
        )
      ),

      // 3-column grid of values
      h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: 20 } },
        fields.map(function(key) {
          var val = formatValue(data[key]);
          return h('div', { key: key },
            h('div', { style: { fontSize: '9px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 } }, formatLabel(key)),
            val
              ? h('div', { style: { fontSize: '12px', fontWeight: 600, color: '#1F2937' } }, val)
              : h('a', { style: { fontSize: '12px', color: '#0D9488', cursor: 'pointer', textDecoration: 'none' }, onClick: onEdit }, 'Not yet specified \u2190 Add')
          );
        })
      ),

      // Early signals
      earlySignals.length > 0 ? h('div', { style: { background: '#FFF7ED', border: '1px solid #FDBA74', borderRadius: 6, padding: '12px 16px', marginBottom: 16 } },
        h('div', { style: { fontSize: '10px', fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 } }, 'EARLY SIGNAL'),
        earlySignals.map(function(s, i) {
          return h('p', { key: i, style: { fontSize: '12px', color: '#92400E', margin: '4px 0', lineHeight: 1.5 } }, s);
        })
      ) : null,

      // Action buttons
      h('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: 16 } },
        h('button', { className: 'wb-btn wb-btn-outline', onClick: onEdit }, '\u2190 Edit Phase ' + phaseNumber),
        h('button', { className: 'wb-btn wb-btn-primary', onClick: onContinue }, continueLabel + ' \u2192')
      )
    );
  }

  window.PhaseReview = PhaseReview;
})();
