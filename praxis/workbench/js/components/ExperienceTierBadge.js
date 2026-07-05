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
    var triggerRef = React.useRef(null);

    // Close on outside click or Escape; Escape returns focus to the trigger.
    React.useEffect(function() {
      if (!open) return;
      function handleClick(e) {
        if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      }
      function handleKey(e) {
        if (e.key === 'Escape') {
          setOpen(false);
          if (triggerRef.current) triggerRef.current.focus();
        }
      }
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('keydown', handleKey);
      return function() {
        document.removeEventListener('mousedown', handleClick);
        document.removeEventListener('keydown', handleKey);
      };
    }, [open]);

    return h('div', { ref: ref, style: { position: 'relative' } },
      h('button', {
        ref: triggerRef,
        className: 'wb-tier-pill',
        'data-tier': currentTier,
        'aria-haspopup': 'true',
        'aria-expanded': open ? 'true' : 'false',
        onClick: function() { setOpen(!open); },
        style: { cursor: 'pointer', border: 'none', outline: 'none' }
      }, currentTier.toUpperCase()),

      open ? h('div', {
        role: 'menu',
        style: {
          position: 'absolute', top: '100%', right: 0, marginTop: '6px',
          width: '280px', background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '8px', boxShadow: '0 4px 16px rgba(11,26,46,0.12)',
          zIndex: 300, overflow: 'hidden'
        }
      },
        h('div', { style: { padding: '10px 14px 6px', borderBottom: '1px solid var(--border)' } },
          h('span', { style: { fontSize: '10px', fontWeight: 700, color: 'var(--slate)', letterSpacing: '0.04em', textTransform: 'uppercase' } }, 'Experience Tier')
        ),
        TIERS.map(function(tier) {
          var isActive = tier.id === currentTier;
          return h('button', {
            key: tier.id,
            type: 'button',
            role: 'menuitem',
            'aria-current': isActive ? 'true' : null,
            onClick: function() {
              dispatch({ type: PraxisContext.ACTION_TYPES.SET_TIER, tier: tier.id });
              setOpen(false);
            },
            style: {
              display: 'block', width: '100%', padding: '10px 14px',
              background: isActive ? 'var(--tier-' + tier.id + '-bg)' : 'transparent',
              border: 'none', borderLeft: isActive ? '3px solid var(--tier-' + tier.id + ')' : '3px solid transparent',
              cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s'
            }
          },
            h('div', { style: { fontSize: '11px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' } }, tier.label),
            h('div', { style: { fontSize: '10px', color: 'var(--slate)', lineHeight: '1.4' } }, tier.desc)
          );
        })
      ) : null
    );
  }

  window.ExperienceTierBadge = ExperienceTierBadge;
})();
