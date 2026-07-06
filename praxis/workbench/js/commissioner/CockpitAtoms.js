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

  function meterBar(pct, tone) {
    return h('div', { className: 'wb-cm-meter', role: 'progressbar', 'aria-valuenow': Math.round(pct || 0), 'aria-valuemin': 0, 'aria-valuemax': 100 },
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

  window.CockpitAtoms = {
    statusBadge: statusBadge, agingChip: agingChip, kpi: kpi, govItem: govItem,
    moveHead: moveHead, meterBar: meterBar, ring: ring,
    okMark: okMark, warnMark: warnMark, dashMark: dashMark
  };
})();
