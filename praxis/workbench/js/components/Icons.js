/**
 * PraxisIcons - a small, consistent inline SVG icon set.
 * Institutional iconography that replaces text glyph characters (arrows, carets,
 * checkmarks, close crosses, pictographs) used as UI affordances. Icons inherit
 * color via currentColor and scale with the `size` argument.
 * No-JSX React.createElement. window.PraxisIcons.
 */
(function() {
  'use strict';
  var h = React.createElement;

  // Build an icon from one or more <path> d-strings (or raw child specs).
  function make(ds) {
    ds = Array.isArray(ds) ? ds : [ds];
    return function(size, opts) {
      opts = opts || {};
      var children = ds.map(function(d, i) {
        if (typeof d === 'string') {
          return h('path', { key: i, d: d, stroke: 'currentColor', strokeWidth: opts.weight || 2, strokeLinecap: 'round', strokeLinejoin: 'round' });
        }
        // object form: {c:[cx,cy,r]} circle
        if (d.c) return h('circle', { key: i, cx: d.c[0], cy: d.c[1], r: d.c[2], stroke: 'currentColor', strokeWidth: opts.weight || 2, fill: 'none' });
        return null;
      });
      return h('svg', {
        width: size || 14, height: size || 14, viewBox: '0 0 24 24', fill: 'none',
        'aria-hidden': 'true', focusable: 'false',
        style: Object.assign({ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }, opts.style || {})
      }, children);
    };
  }

  window.PraxisIcons = {
    chevronLeft:  make('M15 18l-6-6 6-6'),
    chevronRight: make('M9 18l6-6-6-6'),
    chevronDown:  make('M6 9l6 6 6-6'),
    chevronUp:    make('M18 15l-6-6-6 6'),
    arrowLeft:    make('M19 12H5M12 19l-7-7 7-7'),
    arrowRight:   make('M5 12h14M12 5l7 7-7 7'),
    check:        make('M20 6L9 17l-5-5'),
    close:        make('M18 6L6 18M6 6l12 12'),
    plus:         make('M12 5v14M5 12h14'),
    edit:         make('M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'),
    externalLink: make(['M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6', 'M15 3h6v6', 'M10 14 21 3']),
    refresh:      make(['M23 4v6h-6', 'M1 20v-6h6', 'M3.51 9a9 9 0 0 1 14.85-3.36L23 10', 'M1 14l4.64 4.36A9 9 0 0 0 20.49 15']),
    print:        make(['M6 9V2h12v7', 'M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2', 'M6 14h12v8H6z']),
    warning:      make(['M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z', 'M12 9v4', 'M12 17h.01']),
    info:         make([{ c: [12, 12, 10] }, 'M12 16v-4', 'M12 8h.01']),
    errorCircle:  make([{ c: [12, 12, 10] }, 'M15 9l-6 6', 'M9 9l6 6'])
  };
})();
