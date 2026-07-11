'use strict';
/* Layout of the shared cockpit time track (C3 delivery, C5 review cadence).
   The bug these guard: dates bunch, so labels placed at their true time position
   overlap each other and spill off the ends of the track. */
var H = require('./helpers');
var W = H.loadWorkbench();
var D = W.CockpitData;

function ms(iso) { var p = iso.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]).getTime(); }
function pt(iso, code, color, upcoming) {
  return { t: ms(iso), iso: iso, code: code, color: color || 'var(--blue)', upcoming: !!upcoming };
}

// The Gavi Zero-Dose review register, which is what jammed: four reviews inside eleven
// days, two of them on the very same date, then upcoming reviews eight days apart.
var ZD = [
  pt('2026-01-20', 'I5', 'var(--green)'), pt('2026-01-28', 'I7', 'var(--blue)'),
  pt('2026-01-31', 'I3', 'var(--green)'), pt('2026-01-31', 'I4', 'var(--red)'),
  pt('2026-03-05', 'I2', 'var(--red)'), pt('2026-03-20', 'I1', 'var(--blue)'),
  pt('2026-04-30', 'I6', 'var(--blue)'),
  pt('2026-06-05', 'I2', 'var(--teal)', true), pt('2026-06-20', 'I1', 'var(--teal)', true),
  pt('2026-07-20', 'I5', 'var(--teal)', true), pt('2026-07-28', 'I7', 'var(--teal)', true),
  pt('2026-10-31', 'I6', 'var(--teal)', true)
];

// ---- clustering -------------------------------------------------------------
var cl = D.clusterTrackPoints(ZD);
H.eq(cl.length, 11, 'twelve points on eleven distinct dates cluster to eleven dots');

var jan31 = cl.filter(function(c) { return c.iso === '2026-01-31'; });
H.eq(jan31.length, 1, 'the two 31 Jan reviews share one dot');
H.eq(jan31[0].codes.join(','), 'I3,I4', 'that dot carries both codes');
H.eq(jan31[0].colors.length, 2, 'and both statuses, so neither is silently dropped');

H.assert(cl.every(function(c, i) { return i === 0 || cl[i - 1].t <= c.t; }), 'clusters come out in date order');

// A review logged on a date another review is due must not merge into it: one is history,
// the other is a commitment, and they carry different colours.
var mixed = D.clusterTrackPoints([pt('2026-05-01', 'A'), pt('2026-05-01', 'B', 'var(--teal)', true)]);
H.eq(mixed.length, 2, 'a logged and an upcoming review on one date stay two dots');

H.eq(D.clusterTrackPoints([]).length, 0, 'no points, no clusters');
H.eq(D.clusterTrackPoints([{ iso: '2026-01-01', t: NaN }]).length, 0, 'undated points are dropped');

// ---- lane packing: the no-overlap invariant ---------------------------------
var LW = 92, GUT = 8;

// The whole point of the track. Two labels sharing a lane must not overlap, at any
// width the card can take.
function assertNoOverlap(layout, width) {
  var byLane = {};
  layout.clusters.forEach(function(c) { (byLane[c.lane] = byLane[c.lane] || []).push(c); });
  var bad = 0, out = 0;
  Object.keys(byLane).forEach(function(k) {
    var lane = byLane[k].slice().sort(function(a, b) { return a.labelLeft - b.labelLeft; });
    for (var i = 1; i < lane.length; i++) {
      if (lane[i].labelLeft < lane[i - 1].labelLeft + lane[i - 1].labelWidth) bad++;
    }
  });
  layout.clusters.forEach(function(c) {
    if (c.labelLeft < 0 || c.labelLeft + c.labelWidth > width + 0.01) out++;
  });
  H.eq(bad, 0, 'no two labels overlap in a lane at width ' + width);
  H.eq(out, 0, 'no label spills outside the track at width ' + width);
}

[420, 620, 880, 1100, 1600].forEach(function(w) {
  assertNoOverlap(D.packTrackLanes(cl, { width: w, labelWidth: LW, gutter: GUT }), w);
});

// ---- dots never move --------------------------------------------------------
var L = D.packTrackLanes(cl, { width: 1000, labelWidth: LW, gutter: GUT });
H.eq(L.clusters[0].x, 0, 'the earliest dot sits at the left end');
H.eq(L.clusters[L.clusters.length - 1].x, 1000, 'the latest dot sits at the right end');

// 31 Jan is 11 days into a 284-day span: the dot is where the date is, not where the
// label had to move to.
var span = ms('2026-10-31') - ms('2026-01-20');
var expected = (ms('2026-01-31') - ms('2026-01-20')) / span * 1000;
var got = L.clusters.filter(function(c) { return c.iso === '2026-01-31'; })[0].x;
H.assert(Math.abs(got - expected) < 0.01, 'a dot keeps its true time position (got ' + got.toFixed(2) + ', want ' + expected.toFixed(2) + ')');

// The label of that dot had to shift, which is exactly what stops the collision.
var jc = L.clusters.filter(function(c) { return c.iso === '2026-01-31'; })[0];
H.assert(jc.lane > 0, 'a bunched label is pushed off lane 0 rather than left to overlap');

// ---- lanes alternate above / below and stack outward ------------------------
var sides = L.clusters.slice().sort(function(a, b) { return a.lane - b.lane; });
H.assert(sides.every(function(c) { return c.side === (c.lane % 2 === 0 ? 'above' : 'below'); }), 'even lanes go above the line, odd lanes below');
H.assert(sides.every(function(c) { return c.row === Math.floor(c.lane / 2); }), 'lanes stack outward in rows');
H.eq(L.rowsAbove, Math.ceil(L.lanes / 2), 'rows above match the lanes used');
H.eq(L.rowsBelow, Math.floor(L.lanes / 2), 'rows below match the lanes used');

// A track that does not bunch must stay on one row per side, or every sparse track in
// the cockpit would suddenly grow tall for nothing.
var sparse = D.clusterTrackPoints([pt('2026-01-01', 'A'), pt('2026-05-01', 'B'), pt('2026-09-01', 'C')]);
var LS = D.packTrackLanes(sparse, { width: 900, labelWidth: LW, gutter: GUT });
H.eq(LS.lanes, 1, 'three well-spaced dates need a single lane');
H.eq(LS.rowsBelow, 0, 'and nothing below the line');

// ---- degenerate spans -------------------------------------------------------
var same = D.packTrackLanes(D.clusterTrackPoints([pt('2026-02-02', 'A'), pt('2026-02-02', 'B', 'var(--teal)', true)]), { width: 800, labelWidth: LW });
H.eq(same.clusters[0].x, 400, 'when every date is the same the track centres rather than piling up at zero');

H.eq(D.packTrackLanes([], { width: 800 }).clusters.length, 0, 'an empty track lays out to nothing');

// ---- today rule -------------------------------------------------------------
H.eq(D.trackX(L, ms('2026-01-20')), 0, 'today at the start of the span sits at x=0');
H.eq(D.trackX(L, ms('2026-10-31')), 1000, 'today at the end sits at the far edge');
H.eq(D.trackX(L, ms('2025-01-01')), null, 'a today before the span is not marked');
H.eq(D.trackX(L, ms('2027-01-01')), null, 'a today after the span is not marked');

H.summary('track');
