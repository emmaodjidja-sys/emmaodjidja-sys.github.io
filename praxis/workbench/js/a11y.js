(function() {
  'use strict';

  var FOCUSABLE = [
    'a[href]', 'button:not([disabled])', 'textarea:not([disabled])',
    'input:not([disabled]):not([type="hidden"])', 'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  function tabbables(container) {
    var nodes = container.querySelectorAll(FOCUSABLE);
    return Array.prototype.filter.call(nodes, function(el) {
      return el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement;
    });
  }

  function trapFocus(container) {
    if (!container) return function() {};
    var els = tabbables(container);
    if (els.length) {
      els[0].focus();
    } else if (typeof container.focus === 'function') {
      container.focus();
    }

    function onKeydown(e) {
      if (e.key !== 'Tab') return;
      var list = tabbables(container);
      if (!list.length) { e.preventDefault(); return; }
      var first = list[0];
      var last = list[list.length - 1];
      var active = document.activeElement;
      if (e.shiftKey && (active === first || !container.contains(active))) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault(); first.focus();
      }
    }

    container.addEventListener('keydown', onKeydown);
    return function release() {
      container.removeEventListener('keydown', onKeydown);
    };
  }

  function restoreFocus(el) {
    if (el && typeof el.focus === 'function') {
      try { el.focus(); } catch (e) {}
    }
  }

  window.PraxisA11y = { trapFocus: trapFocus, restoreFocus: restoreFocus };
})();
