/**
 * SequenceNavCore.js - pure prev/next derivation for the station nav bars.
 * No React, no DOM: this module must stay loadable under the node test sandbox
 * (tests/helpers.js), which is why it is split from SequenceNav.js.
 * window.SequenceNavCore.
 */
(function() {
  'use strict';

  // Evaluator stations 0..8. Station 9 (Planning) is optional and sits off the
  // sequence, so it is not part of this list. Derived from the schema rather than
  // re-hardcoded: a private copy of the station list is exactly the bug this
  // component exists to remove.
  function stationCount() {
    var L = window.PraxisSchema && window.PraxisSchema.STATION_LABELS;
    return (L && L.length) ? L.length : 9;
  }

  function indexOfId(steps, id) {
    for (var i = 0; i < steps.length; i++) {
      if (steps[i].id === id) return i;
    }
    return -1;
  }

  /* derive(steps, currentId, homeId) -> { prev, next, nextKind }
     homeId is the id of the "home" step, or null if the sequence has no home.
     On home: no prev, and next is the step after it ('start').
     On the last step of a sequence that HAS a home: next wraps to home ('home').
     Otherwise: next is the following step ('continue'), or null at the end. */
  function derive(steps, currentId, homeId) {
    var none = { prev: null, next: null, nextKind: null };
    if (!steps || !steps.length) return none;

    var idx = indexOfId(steps, currentId);
    if (idx === -1) return none;

    // Compare against null explicitly: homeId is legitimately 0, which is falsy.
    var hasHome = homeId !== null && homeId !== undefined;
    var isHome = hasHome && currentId === homeId;

    var prev = isHome ? null : (steps[idx - 1] || null);

    var next = steps[idx + 1] || null;
    var nextKind = next ? (isHome ? 'start' : 'continue') : null;

    if (!next && hasHome && !isHome) {
      var homeIdx = indexOfId(steps, homeId);
      if (homeIdx !== -1) {
        next = steps[homeIdx];
        nextKind = 'home';
      }
    }

    return { prev: prev, next: next, nextKind: nextKind };
  }

  /* buildStationSteps(labelFn) -> the evaluator's stations.
     The label source is INJECTED, not hardcoded here: that injection is what
     killed the private English LABELS array StationNav used to carry, a stale
     copy of PraxisSchema.STATION_LABELS that drove an off-by-one back button.
     The evaluator's caller injects PraxisSchema.STATION_LABELS[id], the same
     source the rail, the station header, the summary bar and the landing
     page all read.
     Do NOT inject t('station.' + id + '.name') here. Those keys exist in
     i18n.js but nothing else in the evaluator consumes them, so translating
     only this bar would leave it disagreeing with the station heading above
     it. Translating the evaluator's station names is a suite-wide change
     across seven consumers, not a nav-bar change.
     `code` is '' because the evaluator has no C0-style codes; the field
     exists only so both lenses hand SequenceNav the same step shape. */
  function buildStationSteps(labelFn) {
    var count = stationCount();
    var steps = [];
    for (var i = 0; i < count; i++) {
      steps.push({ id: i, code: '', label: labelFn(i) });
    }
    return steps;
  }

  window.SequenceNavCore = {
    derive: derive,
    buildStationSteps: buildStationSteps
  };
})();
