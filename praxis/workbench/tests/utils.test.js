'use strict';
var H = require('./helpers');
var W = H.loadWorkbench();
var U = W.PraxisUtils;

H.eq(U.diffDaysLocal('2026-07-01', '2026-07-15'), 14, 'diffDaysLocal forward');
H.eq(U.diffDaysLocal('2026-07-15', '2026-07-01'), -14, 'diffDaysLocal backward');
H.eq(U.diffDaysLocal('2026-07-11', '2026-07-11'), 0, 'diffDaysLocal same day');
H.eq(U.diffDaysLocal('2026-03-28', '2026-03-30'), 2, 'diffDaysLocal across DST change');
H.eq(U.diffDaysLocal('', '2026-07-11'), null, 'diffDaysLocal empty a');
H.eq(U.diffDaysLocal('2026-07-11', 'nope'), null, 'diffDaysLocal bad b');
H.eq(U.diffDaysLocal('2026-07-01T09:00:00.000Z', '2026-07-03'), 2, 'diffDaysLocal accepts leading-date ISO timestamps');
H.summary('utils.test');
