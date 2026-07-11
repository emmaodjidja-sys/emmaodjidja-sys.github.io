/**
 * CockpitAtoms: small presentational atoms shared across the cockpit stations.
 * window.CockpitAtoms. React.createElement house style, PraxisIcons for glyphs.
 */
(function() {
  'use strict';
  var h = React.createElement;
  var I = window.PraxisIcons;
  var U = window.PraxisUtils;

  function statusBadge(map, key) {
    var s = map[key] || { label: key, badge: '' };
    return h('span', { className: 'wb-badge ' + (s.badge || ''), style: s.badge ? null : { background: 'var(--surface-muted)', color: 'var(--text-tertiary)', border: '1px solid var(--border)' } }, s.label);
  }

  // Aging chip for an OPEN dated item: overdue reads with a bold "Nd over", due-soon
  // (<= lead) with "in Nd". Settled items do not age. Uses the local-date diff.
  function agingChip(iso, isOpen, lead) {
    if (!isOpen) return null;
    var d = U.daysUntilLocal(iso);
    if (d == null) return null;
    if (d < 0) return h('span', { className: 'wb-cm-age wb-cm-age--late' }, Math.abs(d) + 'd over');
    if (d <= (lead || 14)) return h('span', { className: 'wb-cm-age wb-cm-age--soon' }, 'in ' + d + 'd');
    return h('span', { className: 'wb-cm-age' }, 'in ' + d + 'd');
  }

  function kpi(label, value, sub, tone) {
    return h('div', { className: 'wb-cm-kpi' + (tone ? ' wb-cm-kpi--' + tone : '') },
      h('div', { className: 'wb-cm-kpi-value' }, value),
      h('div', { className: 'wb-cm-kpi-label' }, label),
      sub != null ? h('div', { className: 'wb-cm-kpi-sub' }, sub) : null);
  }

  function govItem(label, value) {
    return h('div', { className: 'wb-cm-govitem' },
      h('span', { className: 'wb-cm-govitem-label' }, label),
      h('span', { className: 'wb-cm-govitem-value' }, value));
  }

  // Station header: kicker + title + one-line description.
  function moveHead(code, kicker, title, desc) {
    return h('header', { className: 'wb-cm-move-head' },
      code ? h('span', { className: 'wb-cm-move-idx', 'aria-hidden': 'true' }, code) : null,
      h('div', null,
        h('div', { className: 'wb-cm-move-kicker' }, kicker),
        h('h3', { className: 'wb-cm-move-title' }, title),
        desc ? h('p', { className: 'wb-cm-move-desc' }, desc) : null));
  }

  function meterBar(pct, tone, label) {
    return h('div', { className: 'wb-cm-meter', role: 'progressbar', 'aria-label': label || 'Progress', 'aria-valuenow': Math.round(pct || 0), 'aria-valuemin': 0, 'aria-valuemax': 100 },
      h('div', { className: 'wb-cm-meter-fill wb-cm-meter-fill--' + (tone || 'teal'), style: { width: Math.max(0, Math.min(100, pct || 0)) + '%' } }));
  }

  // Compact SVG donut ring for a coverage proportion (0..1). Non-emoji, theme-token stroke.
  function ring(frac, tone) {
    var f = Math.max(0, Math.min(1, frac || 0));
    var r = 16, c = 2 * Math.PI * r;
    var col = tone === 'good' ? 'var(--green)' : (tone === 'warn' ? 'var(--amber)' : 'var(--teal-ink)');
    return h('svg', { className: 'wb-cm-ring', width: 44, height: 44, viewBox: '0 0 44 44', 'aria-hidden': 'true' },
      h('circle', { cx: 22, cy: 22, r: r, fill: 'none', stroke: 'var(--border)', strokeWidth: 4 }),
      h('circle', { cx: 22, cy: 22, r: r, fill: 'none', stroke: col, strokeWidth: 4, strokeLinecap: 'round',
        strokeDasharray: c, strokeDashoffset: c * (1 - f), transform: 'rotate(-90 22 22)' }),
      h('text', { x: 22, y: 26, textAnchor: 'middle', className: 'wb-cm-ring-t' }, Math.round(f * 100) + '%'));
  }

  function okMark() { return h('span', { className: 'wb-cm-mark wb-cm-mark--ok', title: 'Present', 'aria-label': 'present' }, I.check(13)); }
  function warnMark(title) { return h('span', { className: 'wb-cm-mark wb-cm-mark--warn', title: title, 'aria-label': title }, '!'); }
  function dashMark(title) { return h('span', { className: 'wb-cm-mark wb-cm-mark--dash', title: title, 'aria-label': title }, ''); }

  // ---- TimeTrack -----------------------------------------------------------
  // One horizontal time line with a today rule, shared by C3 Deliver and C5 Follow-up.
  // Dots sit at their true date. Labels are packed into lanes above and below the line
  // by CockpitData.packTrackLanes so none overlap however tightly the dates bunch, and
  // a stem ties each label back to its dot. The layout is measured in pixels, so the
  // track re-packs on resize.
  //
  // Props: clusters (from CockpitData.clusterTrackPoints), todayT, label, rowHeight,
  // nameLines (1 or 2), tooltip(cluster) -> string, sr(cluster) -> string.
  var STEM = 12;          // clear space between the line and the first label row
  var TODAY_H = 14;       // room for the "today" caption above everything

  function TimeTrack(props) {
    var D = window.CockpitData;
    var clusters = props.clusters || [];
    var rowH = props.rowHeight || 30;
    var lines = props.nameLines === 2 ? 2 : 1;

    var ref = React.useRef(null);
    var ws = React.useState(0), width = ws[0], setWidth = ws[1];

    React.useLayoutEffect(function() {
      var el = ref.current;
      if (!el) return;
      function measure() { var w = el.clientWidth; if (w) setWidth(w); }
      measure();
      if (typeof ResizeObserver === 'undefined') return;   // older browsers keep the first measurement
      var ro = new ResizeObserver(measure);
      ro.observe(el);
      return function() { ro.disconnect(); };
    }, []);

    // Nominal width for the very first paint, replaced the moment the layout effect runs.
    var L = D.packTrackLanes(clusters, { width: width || 880, labelWidth: props.labelWidth || 92 });
    var padTop = TODAY_H + L.rowsAbove * rowH + STEM;
    var padBottom = L.rowsBelow * rowH + STEM;
    var todayX = D.trackX(L, props.todayT);

    var marks = [];
    L.clusters.forEach(function(c) {
      var above = c.side === 'above';
      var reach = STEM + c.row * rowH;                       // line -> near edge of this row
      var labelTop = above ? padTop - reach - rowH : padTop + reach;
      var tip = props.tooltip ? props.tooltip(c) : c.iso;

      marks.push(h('span', { key: 'stem' + c.iso + c.lane, className: 'wb-cm-mile-stem', 'aria-hidden': 'true',
        style: { left: c.x + 'px', top: (above ? labelTop + rowH : padTop + 6) + 'px', height: Math.max(0, reach - 6) + 'px' } }));

      marks.push(h('span', { key: 'dot' + c.iso + c.lane, className: 'wb-cm-mile-dot', title: tip,
        style: { left: c.x + 'px', top: padTop + 'px', background: dotFill(c) } }));

      marks.push(h('span', { key: 'lbl' + c.iso + c.lane, className: 'wb-cm-mile-lbl', title: tip,
          style: { left: c.labelLeft + 'px', top: labelTop + 'px', width: c.labelWidth + 'px', height: rowH + 'px' } },
        h('span', { className: 'wb-cm-mile-name' + (lines === 2 ? ' wb-cm-mile-name--2' : '') }, codeLabel(c)),
        h('span', { className: 'wb-cm-mile-date' }, D.fdate(c.iso))));
    });

    return h('div', { className: 'wb-cm-track', ref: ref, style: { height: (padTop + padBottom) + 'px' } },
      h('div', { className: 'wb-cm-track-line', style: { top: padTop + 'px' } }),
      todayX != null ? h('div', { className: 'wb-cm-track-today', style: { left: todayX + 'px', top: TODAY_H + 'px', height: (padTop + padBottom - TODAY_H) + 'px' } },
        h('span', { className: 'wb-cm-track-today-lbl' }, 'today')) : null,
      h('div', { 'aria-hidden': 'true' }, marks),
      // The dots carry no text, so the readable version of the track is this list.
      h('ul', { className: 'wb-cm-track-sr', 'aria-label': props.label || 'Timeline' }, L.clusters.map(function(c) {
        return h('li', { key: c.iso + c.lane }, props.sr ? props.sr(c) : (codeLabel(c) + ', ' + D.fdate(c.iso)));
      })));
  }

  // Codes carried by one dot. Two fit the label; beyond that the rest become a count.
  function codeLabel(c) {
    var codes = c.codes || [];
    if (codes.length <= 2) return codes.join(', ');
    return codes.slice(0, 2).join(', ') + ' +' + (codes.length - 2);
  }

  // A dot holding several statuses is split between them rather than picking a winner.
  function dotFill(c) {
    var cols = c.colors || [];
    if (cols.length <= 1) return cols[0] || 'var(--border-strong)';
    var n = cols.length;
    var stops = cols.map(function(col, i) {
      return col + ' ' + (i / n * 100) + '% ' + ((i + 1) / n * 100) + '%';
    });
    return 'conic-gradient(' + stops.join(', ') + ')';
  }

  window.CockpitAtoms = {
    statusBadge: statusBadge, agingChip: agingChip, kpi: kpi, govItem: govItem,
    moveHead: moveHead, meterBar: meterBar, ring: ring,
    okMark: okMark, warnMark: warnMark, dashMark: dashMark,
    TimeTrack: TimeTrack
  };
})();
