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

    return h('div', null,
      h(SectionCard, { title: 'Review: ' + phaseTitle, variant: 'complete' },
        // Header
        h('div', { className: 'wb-review-header' },
          h('span', { className: 'wb-review-header-check' }, '\u2713'),
          h('h3', { className: 'wb-review-header-title' },
            'Phase ' + phaseNumber + ' Complete \u2014 ' + phaseTitle
          )
        ),

        // 3-column grid of values
        h('div', { className: 'wb-review-grid' },
          fields.map(function(key) {
            var val = formatValue(data[key]);
            return h('div', { key: key },
              h('div', { className: 'wb-review-label' }, formatLabel(key)),
              val
                ? h('div', { className: 'wb-review-value' }, val)
                : h('a', { className: 'wb-review-add-link', onClick: onEdit }, 'Not yet specified \u2190 Add')
            );
          })
        ),

        // Early signals
        earlySignals.length > 0 ? h('div', { className: 'wb-guidance--signal' },
          h('div', { className: 'wb-guidance--signal-title' }, 'EARLY SIGNAL'),
          earlySignals.map(function(s, i) {
            return h('p', { key: i, className: 'wb-guidance--signal-text' }, s);
          })
        ) : null
      ),

      // Action buttons (outside SectionCard)
      h('div', { className: 'wb-review-actions' },
        h('button', { className: 'wb-btn wb-btn-outline', onClick: onEdit }, '\u2190 Edit Phase ' + phaseNumber),
        h('button', { className: 'wb-btn wb-btn-primary', onClick: onContinue }, continueLabel + ' \u2192')
      )
    );
  }

  window.PhaseReview = PhaseReview;
})();
