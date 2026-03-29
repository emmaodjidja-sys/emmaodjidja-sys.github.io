(function() {
  'use strict';
  var h = React.createElement;

  var TIERS = [
    { id: 'foundation', label: 'FOUNDATION', desc: 'Plain language, guided experience. Best for programme staff and junior evaluators.' },
    { id: 'practitioner', label: 'PRACTITIONER', desc: 'Standard terminology with contextual guidance. For experienced M&E professionals.' },
    { id: 'advanced', label: 'ADVANCED', desc: 'Full technical detail, minimal guidance. For senior evaluators and methodologists.' }
  ];

  function ExperienceTierBadge(props) {
    var currentTier = props.tier || 'foundation';
    var dispatch = props.dispatch;
    var openState = React.useState(false);
    var open = openState[0];
    var setOpen = openState[1];
    var ref = React.useRef(null);

    // Close on outside click
    React.useEffect(function() {
      if (!open) return;
      function handleClick(e) {
        if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      }
      document.addEventListener('mousedown', handleClick);
      return function() { document.removeEventListener('mousedown', handleClick); };
    }, [open]);

    return h('div', { ref: ref, style: { position: 'relative' } },
      h('button', {
        className: 'wb-tier-pill',
        'data-tier': currentTier,
        onClick: function() { setOpen(!open); },
        style: { cursor: 'pointer', border: 'none', outline: 'none' }
      }, currentTier.toUpperCase()),

      open ? h('div', {
        style: {
          position: 'absolute', top: '100%', right: 0, marginTop: '6px',
          width: '280px', background: '#fff', border: '1px solid var(--wb-border)',
          borderRadius: '8px', boxShadow: '0 4px 16px rgba(11,26,46,0.12)',
          zIndex: 300, overflow: 'hidden'
        }
      },
        h('div', { style: { padding: '10px 14px 6px', borderBottom: '1px solid var(--wb-border)' } },
          h('span', { style: { fontSize: '10px', fontWeight: 700, color: 'var(--wb-slate)', letterSpacing: '0.04em', textTransform: 'uppercase' } }, 'Experience Tier')
        ),
        TIERS.map(function(tier) {
          var isActive = tier.id === currentTier;
          return h('button', {
            key: tier.id,
            onClick: function() {
              dispatch({ type: PraxisContext.ACTION_TYPES.SET_TIER, tier: tier.id });
              setOpen(false);
            },
            style: {
              display: 'block', width: '100%', padding: '10px 14px',
              background: isActive ? 'var(--wb-tier-' + tier.id + '-bg, rgba(16,185,129,0.08))' : 'transparent',
              border: 'none', borderLeft: isActive ? '3px solid var(--wb-tier-' + tier.id + ', #10B981)' : '3px solid transparent',
              cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s'
            }
          },
            h('div', { style: { fontSize: '11px', fontWeight: 600, color: 'var(--wb-text)', marginBottom: '2px' } }, tier.label),
            h('div', { style: { fontSize: '10px', color: 'var(--wb-slate)', lineHeight: '1.4' } }, tier.desc)
          );
        })
      ) : null
    );
  }

  window.ExperienceTierBadge = ExperienceTierBadge;
})();
