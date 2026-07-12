/**
 * SequenceNav.js - the shared bottom navigation bar. Knows nothing about
 * evaluations or commissioners: it renders whatever SequenceNavCore.derive
 * hands back, with all wording supplied by the caller (positionText, formatStep).
 * Adapters: StationNav (evaluator lens), CockpitNav (commissioner lens).
 * window.SequenceNav.
 */
(function() {
  'use strict';
  var h = React.createElement;
  var I = window.PraxisIcons;

  // Quoted: 'continue' is a reserved word.
  var NEXT_KEY = { 'start': 'nav.start_at', 'home': 'nav.back_to', 'continue': 'nav.continue' };

  function SequenceNav(props) {
    var t = PraxisI18n.t;
    var steps = props.steps;
    var formatStep = props.formatStep;
    var onNavigate = props.onNavigate;
    var onSave = props.onSave;

    var d = window.SequenceNavCore.derive(steps, props.currentId, props.homeId);

    function goPrev() { onNavigate(d.prev.id); }

    function goNext() {
      if (onSave) onSave();
      onNavigate(d.next.id);
    }

    var back = d.prev
      ? h('button', {
          type: 'button',
          className: 'wb-btn wb-seqnav-btn',
          onClick: goPrev
        }, I.chevronLeft(), formatStep(d.prev, 'prev'))
      : h('div');

    var forward;
    if (d.next) {
      forward = h('button', {
        type: 'button',
        className: 'wb-btn wb-btn-primary wb-seqnav-btn',
        onClick: goNext
      }, t(NEXT_KEY[d.nextKind], { step: formatStep(d.next, 'next') }), I.chevronRight());
    } else if (onSave) {
      forward = h('button', {
        type: 'button',
        className: 'wb-btn wb-btn-teal wb-seqnav-btn',
        onClick: onSave
      }, t('nav.save_finish'));
    } else {
      forward = h('div');
    }

    return h('nav', { className: 'wb-seqnav', 'aria-label': 'Station navigation' },
      back,
      h('span', { className: 'wb-seqnav-pos' }, props.positionText),
      forward);
  }

  window.SequenceNav = SequenceNav;
})();
