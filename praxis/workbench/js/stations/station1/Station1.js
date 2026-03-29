(function() {
  'use strict';
  var h = React.createElement;

  var TOC_BUILDER_URL = '/praxis/tools/toc-builder/';

  var LEVEL_ICONS = {
    impact:   '\u{1F3AF}',
    outcome:  '\u{1F4C8}',
    output:   '\u{1F4E6}',
    activity: '\u{2699}\uFE0F'
  };

  var LEVEL_LABELS = {
    impact:   'Impact',
    outcome:  'Outcomes',
    output:   'Outputs',
    activity: 'Activities'
  };

  // ── Helpers ──────────────────────────────────────────────

  function countByLevel(nodes) {
    var counts = { impact: 0, outcome: 0, output: 0, activity: 0 };
    if (!nodes) return counts;
    nodes.forEach(function(n) {
      if (counts.hasOwnProperty(n.level)) counts[n.level]++;
    });
    return counts;
  }

  function hasTocData(toc) {
    return toc && toc.nodes && toc.nodes.length > 0;
  }

  // ── Sub-components ──────────────────────────────────────

  function OptionCard(props) {
    return h('button', {
      type: 'button',
      className: 'wb-card',
      style: {
        cursor: 'pointer', textAlign: 'left', padding: '20px 22px',
        border: '1px solid var(--border)', borderRadius: 10,
        transition: 'border-color 0.15s, box-shadow 0.15s',
        background: 'var(--bg)',
        width: '100%'
      },
      onClick: props.onClick,
      onMouseEnter: function(e) { e.currentTarget.style.borderColor = 'var(--teal, #14b8a6)'; },
      onMouseLeave: function(e) { e.currentTarget.style.borderColor = 'var(--border)'; }
    },
      h('div', { style: { fontSize: 28, marginBottom: 10 } }, props.icon),
      h('div', { style: { fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 4 } }, props.title),
      h('p', { style: { fontSize: 13, color: 'var(--slate)', lineHeight: '1.5', margin: 0 } }, props.description)
    );
  }

  function TocSummary(props) {
    var toc = props.toc;
    var counts = countByLevel(toc.nodes);

    return h('div', { className: 'wb-card', style: { padding: '18px 20px' } },

      // Title row
      h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 } },
        h('h3', { style: { fontSize: 15, fontWeight: 600, color: 'var(--text)', margin: 0 } },
          toc.title || 'Untitled Theory of Change'),
        h('span', { style: { fontSize: 11, color: 'var(--slate)' } },
          toc.nodes.length + ' nodes')
      ),

      // Narrative (truncated)
      toc.narrative
        ? h('p', {
            style: { fontSize: 12, color: 'var(--slate)', lineHeight: '1.5', marginBottom: 14,
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }
          }, toc.narrative)
        : null,

      // Node counts by level
      h('div', { style: { display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 } },
        ['impact', 'outcome', 'output', 'activity'].map(function(level) {
          return h('div', { key: level, style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 } },
            h('span', null, LEVEL_ICONS[level]),
            h('span', { style: { fontWeight: 600, color: 'var(--text)' } }, counts[level]),
            h('span', { style: { color: 'var(--slate)' } }, LEVEL_LABELS[level])
          );
        })
      ),

      // Action buttons
      h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
        h('button', {
          type: 'button',
          className: 'wb-btn wb-btn-teal wb-btn-sm',
          onClick: props.onEditCanvas
        }, 'Edit in Canvas'),
        h('button', {
          type: 'button',
          className: 'wb-btn wb-btn-ghost wb-btn-sm',
          onClick: props.onEditGuided
        }, 'Edit Guided'),
        h('button', {
          type: 'button',
          className: 'wb-btn wb-btn-ghost wb-btn-sm',
          onClick: props.onExport
        }, 'Export JSON')
      )
    );
  }

  function CanvasOverlay(props) {
    var iframeRef = React.useRef(null);
    var toc = props.toc;
    var bridge = window.useTocBridge(iframeRef, toc, function(payload) {
      // Auto-capture export from within iframe
      props.onSave(normaliseTocPayload(payload));
    });

    function handleSave() {
      // Request an export from the iframe
      if (iframeRef.current && bridge.ready) {
        iframeRef.current.contentWindow.postMessage({ type: 'PRAXIS_REQUEST_EXPORT' }, '*');
      }
    }

    return h('div', {
      style: {
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', flexDirection: 'column',
        background: 'var(--bg, #ffffff)'
      }
    },
      // Header bar
      h('div', {
        style: {
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '8px 16px', borderBottom: '1px solid var(--border)',
          background: 'var(--bg-alt, #f8fafc)', flexShrink: 0
        }
      },
        h('div', { style: { fontSize: 14, fontWeight: 600, color: 'var(--text)', flex: 1 } },
          'Theory of Change Builder'),
        bridge.ready
          ? h('span', { style: { fontSize: 11, color: 'var(--teal, #14b8a6)', marginRight: 8 } }, 'Connected')
          : h('span', { style: { fontSize: 11, color: 'var(--slate)', marginRight: 8 } }, 'Loading\u2026'),
        h('button', {
          type: 'button',
          className: 'wb-btn wb-btn-teal wb-btn-sm',
          onClick: handleSave,
          disabled: !bridge.ready
        }, 'Save to Workbench'),
        h('button', {
          type: 'button',
          className: 'wb-btn wb-btn-ghost wb-btn-sm',
          onClick: props.onClose,
          'aria-label': 'Close canvas overlay',
          style: { fontSize: 18, lineHeight: 1 }
        }, '\u00D7')
      ),

      // Iframe
      h('iframe', {
        ref: iframeRef,
        src: TOC_BUILDER_URL,
        style: { flex: 1, border: 'none', width: '100%' },
        title: 'Theory of Change Canvas Builder',
        allow: 'clipboard-write'
      })
    );
  }

  // ── Normalise payload from ToC Builder export ──────────

  function normaliseTocPayload(payload) {
    return {
      title: payload.title || '',
      narrative: payload.narrative || '',
      nodes: payload.nodes || [],
      connections: payload.connections || []
    };
  }

  // ── Main Station Component ──────────────────────────────

  function Station1(props) {
    var state = props.state;
    var dispatch = props.dispatch;
    var context = state.context;
    var tier = (state.ui && state.ui.experienceTier) || 'foundation';
    var toc = context.toc || {};
    var hasData = hasTocData(toc);

    // Mode: 'landing' | 'inline' | 'canvas'
    var ms = React.useState('landing');
    var mode = ms[0]; var setMode = ms[1];

    function saveToc(tocSchema) {
      dispatch({
        type: PraxisContext.ACTION_TYPES.SAVE_STATION,
        stationId: 1,
        payload: { toc: tocSchema }
      });
      dispatch({
        type: PraxisContext.ACTION_TYPES.SHOW_TOAST,
        message: 'Theory of Change saved',
        toastType: 'success'
      });
      setMode('landing');
    }

    function handleExport() {
      var blob = new Blob([JSON.stringify(toc, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = (toc.title || 'toc').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    // ── Canvas mode ──
    if (mode === 'canvas') {
      return h(CanvasOverlay, {
        toc: hasData ? toc : null,
        onSave: saveToc,
        onClose: function() { setMode('landing'); }
      });
    }

    // ── Inline mode ──
    if (mode === 'inline') {
      return h('div', null,
        h('div', { style: { display: 'flex', alignItems: 'center', marginBottom: 16 } },
          h('button', {
            type: 'button',
            className: 'wb-btn wb-btn-ghost wb-btn-sm',
            onClick: function() { setMode('landing'); },
            style: { marginRight: 8 }
          }, '\u2190 Back'),
          h('span', { style: { fontSize: 14, fontWeight: 600, color: 'var(--text)' } }, 'Guided Builder')
        ),
        h(window.TocInline, {
          tocData: hasData ? toc : null,
          onSave: saveToc,
          tier: tier
        })
      );
    }

    // ── Landing mode ──
    return h('div', { style: { maxWidth: 600, margin: '0 auto', padding: '20px 0' } },

      // Station header
      h('div', { style: { marginBottom: 24 } },
        h('h2', { style: { fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 6 } },
          'Station 1: Theory of Change'),
        h('p', { style: { fontSize: 13, color: 'var(--slate)', lineHeight: '1.5', maxWidth: 520 } },
          'Define the causal pathway from programme activities to intended impact. ' +
          'Your Theory of Change anchors every downstream evaluation decision\u2014design, ' +
          'matrix, indicators, and data collection all trace back to what you build here.')
      ),

      // If ToC data exists, show summary
      hasData
        ? h(TocSummary, {
            toc: toc,
            onEditCanvas: function() { setMode('canvas'); },
            onEditGuided: function() { setMode('inline'); },
            onExport: handleExport
          })
        : h('div', null,
            // Option cards
            h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 } },
              h(OptionCard, {
                icon: '\u{1F4DD}',
                title: 'Guided Builder',
                description: 'Step-by-step structured form. Best for straightforward programmes or if you\'re new to Theories of Change.',
                onClick: function() { setMode('inline'); }
              }),
              h(OptionCard, {
                icon: '\u{1F5FA}\uFE0F',
                title: 'Full Canvas',
                description: 'Visual node-and-connection builder with drag-and-drop. Best for complex programmes with multiple causal pathways.',
                onClick: function() { setMode('canvas'); }
              })
            ),
            h('p', { className: 'wb-helper', style: { fontSize: 12, textAlign: 'center' } },
              'You can switch between builders at any time. Both produce the same underlying data.')
          )
    );
  }

  window.Station1 = Station1;
})();
