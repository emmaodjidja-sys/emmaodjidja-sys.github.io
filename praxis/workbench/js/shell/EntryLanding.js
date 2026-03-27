(function() {
  'use strict';
  var h = React.createElement;
  var t = PraxisI18n.t;
  var AT = PraxisContext.ACTION_TYPES;
  var LABELS = PraxisSchema.STATION_LABELS;

  // Reusable PRAXIS logo SVG
  function Logo(props) {
    var size = props && props.size || 24;
    return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none' },
      h('circle', { cx: 12, cy: 12, r: 10, stroke: '#2EC4B6', strokeWidth: 2 }),
      h('path', { d: 'M8 12l3 3 5-5', stroke: '#2EC4B6', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' })
    );
  }

  // Action card component
  function ActionCard(props) {
    var accentColor = props.accent || 'rgba(255,255,255,0.08)';
    return h('div', {
      onClick: props.onClick,
      style: {
        padding: '16px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
        cursor: 'pointer', marginBottom: '10px', borderLeft: '3px solid ' + accentColor,
        transition: 'background 0.15s'
      },
      onMouseEnter: function(e) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; },
      onMouseLeave: function(e) { e.currentTarget.style.background = 'transparent'; }
    },
      h('div', { style: { fontSize: '13px', fontWeight: 600, color: '#F1F5F9', marginBottom: 4 } }, props.title),
      props.desc ? h('div', { style: { fontSize: '11px', color: '#94A3B8', lineHeight: '1.5' } }, props.desc) : null,
      props.children
    );
  }

  // Back button
  function BackButton(props) {
    return h('div', {
      onClick: props.onClick,
      style: { fontSize: '12px', color: '#94A3B8', cursor: 'pointer', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '4px' }
    }, '\u2190 ', t('common.back'));
  }

  function EntryLanding(props) {
    var dispatch = props.dispatch;
    var modeState = React.useState(null);
    var mode = modeState[0];
    var setMode = modeState[1];

    // Check for saved data without loading it into state
    var hasSaved = React.useMemo(function() {
      return PraxisContext.hasSavedProject();
    }, []);

    // Station preview for left panel — uniform color, opacity fade for depth-of-field
    var stationPreview = LABELS.map(function(name, i) {
      var opacity = Math.max(0.25, 1 - i * 0.09);
      return h('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', opacity: opacity } },
        h('span', { style: { fontSize: '11px', fontWeight: 700, color: '#2EC4B6', minWidth: '16px' } }, i),
        h('span', { style: { fontSize: '12px', color: '#CBD5E1' } }, name)
      );
    });

    // Left panel
    var leftPanel = h('div', { className: 'wb-landing-left' },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' } },
        h(Logo, null),
        h('span', { style: { fontSize: '12px', fontWeight: 700, color: '#2EC4B6', letterSpacing: '0.12em' } }, 'PRAXIS')
      ),
      h('h1', { style: { fontSize: '24px', fontWeight: 700, color: '#FFFFFF', margin: '0 0 8px 0' } }, t('landing.title')),
      h('p', { style: { fontSize: '12px', color: '#94A3B8', lineHeight: '1.6', margin: '0 0 24px 0', maxWidth: '380px' } }, t('landing.subtitle')),
      h('div', { style: { maxWidth: '260px' } }, stationPreview)
    );

    // Right panel content depends on mode
    var rightContent;

    if (mode === 'tier') {
      // Tier selection
      var tiers = [
        { key: 'foundation', label: 'Foundation', accent: '#22C55E', textKey: 'landing.tier_foundation' },
        { key: 'practitioner', label: 'Practitioner', accent: '#3B82F6', textKey: 'landing.tier_practitioner' },
        { key: 'advanced', label: 'Advanced', accent: '#A855F7', textKey: 'landing.tier_advanced' }
      ];
      rightContent = h('div', null,
        h(BackButton, { onClick: function() { setMode(null); } }),
        h('div', { style: { fontSize: '14px', fontWeight: 600, color: '#F1F5F9', marginBottom: '14px' } }, t('landing.tier_title')),
        tiers.map(function(tier) {
          return h(ActionCard, {
            key: tier.key, title: tier.label, accent: tier.accent, desc: t(tier.textKey),
            onClick: function() { dispatch({ type: AT.INIT, tier: tier.key }); }
          });
        })
      );

    } else if (mode === 'open') {
      // File drop zone
      rightContent = h('div', null,
        h(BackButton, { onClick: function() { setMode(null); } }),
        h('div', { style: { fontSize: '14px', fontWeight: 600, color: '#F1F5F9', marginBottom: '14px' } }, t('landing.open')),
        h(FileDropZone, {
          label: 'Drop .praxis file here or click to browse',
          onFile: function(data) {
            dispatch({ type: AT.LOAD_FILE, context: data });
          }
        })
      );

    } else if (mode === 'quick') {
      // Station selector
      rightContent = h('div', null,
        h(BackButton, { onClick: function() { setMode(null); } }),
        h('div', { style: { fontSize: '14px', fontWeight: 600, color: '#F1F5F9', marginBottom: '14px' } }, 'Jump to a station'),
        LABELS.map(function(name, i) {
          return h('div', {
            key: i, onClick: function() {
              dispatch({ type: AT.INIT, station: i });
            },
            style: {
              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', cursor: 'pointer',
              marginBottom: '6px', transition: 'background 0.15s'
            },
            onMouseEnter: function(e) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; },
            onMouseLeave: function(e) { e.currentTarget.style.background = 'transparent'; }
          },
            h('span', { style: { fontSize: '12px', fontWeight: 700, color: '#2EC4B6', minWidth: '16px' } }, i),
            h('span', { style: { fontSize: '12px', color: '#E2E8F0' } }, name)
          );
        })
      );

    } else {
      // Default: action cards — accent colors mapped to design system tokens
      var cards = [
        h(ActionCard, { key: 'new', title: '+ ' + t('landing.new'), desc: t('landing.new_desc'), accent: '#2EC4B6', onClick: function() { setMode('tier'); } }),
        h(ActionCard, { key: 'open', title: t('landing.open'), desc: t('landing.open_desc'), accent: '#3B82F6', onClick: function() { setMode('open'); } }),
        h(ActionCard, { key: 'quick', title: t('landing.quick'), desc: t('landing.quick_desc'), accent: '#8B5CF6', onClick: function() { setMode('quick'); } })
      ];

      // Continue card (only if saved project has actual data)
      if (hasSaved) {
        var meta = PraxisContext.getSavedProjectMeta();
        var metaLine = meta
          ? meta.name + ' \u00B7 Station ' + meta.station + ' (' + meta.stationName + ')' + (meta.updatedAt ? ' \u00B7 ' + PraxisUtils.formatDate(meta.updatedAt) : '')
          : 'Resume saved project';
        cards.push(h(ActionCard, {
          key: 'continue', title: t('landing.continue'), accent: '#10B981',
          onClick: function() {
            var saved = PraxisContext.loadSavedProject();
            if (saved) dispatch({ type: AT.LOAD_FILE, context: saved });
          }
        },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' } },
            h('span', { style: { width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' } }),
            h('span', { style: { fontSize: '11px', color: '#CBD5E1' } }, metaLine)
          )
        ));
      }

      rightContent = h('div', null, cards);
    }

    var rightPanel = h('div', { className: 'wb-landing-right' }, rightContent);

    return h('div', { className: 'wb-landing', style: {
      fontFamily: "var(--font-sans)", zIndex: 100
    }}, leftPanel, rightPanel);
  }

  window.EntryLanding = EntryLanding;
})();
