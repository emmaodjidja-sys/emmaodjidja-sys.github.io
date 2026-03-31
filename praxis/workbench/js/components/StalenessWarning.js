(function() {
  'use strict';
  var h = React.createElement;

  function StalenessWarning(props) {
    var stationId = props.stationId;
    var staleness = props.staleness || {};
    var onDismiss = props.onDismiss;

    if (!staleness[stationId]) return null;

    var warningText = PraxisI18n.t('staleness.warning');
    if (warningText === 'staleness.warning') {
      warningText = 'Upstream data has changed. Some inputs used for this station may be out of date.';
    }

    function handleReview() {
      // Navigate to the first stale upstream station — caller can override via onDismiss
      if (typeof onDismiss === 'function') onDismiss('review');
    }

    function handleDismiss() {
      if (typeof onDismiss === 'function') onDismiss('dismiss');
    }

    return h('div', {
      className: 'wb-card',
      style: {
        background: 'var(--amber-light)',
        border: '1px solid var(--amber)',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }
    },
      h('span', { style: { display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--amber)', flexShrink: 0 } }),
      h('p', { style: { flex: 1, margin: 0, fontSize: '12px', color: '#78350F' } }, warningText),
      h('button', {
        className: 'wb-btn wb-btn-outline wb-btn-sm',
        onClick: handleReview
      }, 'Review changes'),
      h('button', {
        className: 'wb-btn wb-btn-ghost wb-btn-sm',
        onClick: handleDismiss
      }, 'Dismiss')
    );
  }

  window.StalenessWarning = StalenessWarning;
})();
