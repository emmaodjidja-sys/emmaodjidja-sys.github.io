(function() {
  'use strict';
  var h = React.createElement;

  /**
   * SectionCard: visual container for station content sections.
   * Props:
   *   title: string (required)
   *   badge: string (optional, e.g. "3 of 5")
   *   variant: 'default' | 'warning' | 'complete' | 'neutral' (default: 'default')
   *   bodyType: 'form' | 'table' | 'scoring' | 'empty' (default: 'form')
   *   collapsible: boolean (default: false)
   *   defaultCollapsed: boolean (default: false)
   *   children: React nodes
   */
  function SectionCard(props) {
    var title = props.title;
    var badge = props.badge || null;
    var variant = props.variant || 'default';
    var bodyType = props.bodyType || 'form';
    var collapsible = props.collapsible || false;
    var defaultCollapsed = props.defaultCollapsed || false;
    var children = props.children;

    var collapseState = React.useState(defaultCollapsed);
    var collapsed = collapseState[0];
    var setCollapsed = collapseState[1];

    var cardClass = 'wb-sec' +
      (variant === 'warning' ? ' wb-sec--warning' : '') +
      (variant === 'complete' ? ' wb-sec--complete' : '') +
      (variant === 'neutral' ? ' wb-sec--neutral' : '');

    var bodyClass = 'wb-sec-body' +
      (bodyType === 'table' ? ' wb-sec-body--table' : '') +
      (bodyType === 'scoring' ? ' wb-sec-body--scoring' : '') +
      (bodyType === 'empty' ? ' wb-sec-body--empty' : '');

    return h('div', { className: cardClass },
      // Header
      title ? h('div', { className: 'wb-sec-header' },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
          h('h3', { className: 'wb-sec-title' }, title),
          badge ? h('span', { className: 'wb-sec-badge' }, badge) : null
        ),
        collapsible ? h('button', {
          className: 'wb-sec-chevron',
          'aria-label': collapsed ? 'Expand section' : 'Collapse section',
          onClick: function() { setCollapsed(!collapsed); }
        }, collapsed ? PraxisIcons.chevronRight(12) : PraxisIcons.chevronDown(12)) : null
      ) : null,

      // Body
      (!collapsible || !collapsed) ? h('div', { className: bodyClass }, children) : null
    );
  }

  window.SectionCard = SectionCard;

  /**
   * Field: wraps a single form control with a programmatically associated
   * label. The control passed as children is cloned to receive a generated
   * id, and the label points at it with htmlFor.
   * Props:
   *   fieldKey: string (required), used to derive a stable id
   *   label: string (optional)
   *   hint: string (optional), small inline hint beside the label
   *   helper: string (optional), helper line below the label
   *   className, style: passed to the wrapper
   *   children: a single input/textarea/select element
   */
  function Field(props) {
    var id = 'wb-field-' + String(props.fieldKey || '').replace(/[^a-zA-Z0-9_-]/g, '-');
    var child = props.children;
    var control = React.isValidElement(child) ? React.cloneElement(child, { id: id }) : child;
    return h('div', { className: props.className || null, style: props.style || null },
      props.label != null ? h('label', { className: 'wb-field-label', htmlFor: id },
        props.label,
        props.hint ? h('span', { className: 'wb-field-hint' }, props.hint) : null
      ) : null,
      props.helper ? h('div', { className: 'wb-field-helper' }, props.helper) : null,
      control
    );
  }

  window.PraxisField = Field;

  /**
   * RadioGroup: accessible single-select group (ARIA radiogroup pattern with
   * roving tabindex and arrow-key navigation). The caller owns the visual
   * rendering of each option through renderItem.
   * Props:
   *   options: [{ value, ... }]
   *   value: currently selected value (may be null)
   *   onChange(value): fired when selection moves (arrow keys) or is activated
   *   onActivate(value): optional; fired only on Space/Enter/click, after onChange.
   *     Use for cases where activation does more than change the value (e.g. the
   *     entry-landing tier picker, where activating creates a project).
   *   ariaLabel: accessible name for the group
   *   groupClassName: class for the radiogroup container
   *   itemClassName(opt, isSelected): class for each radio element
   *   itemStyle(opt, isSelected): inline style object for each radio element
   *   renderItem(opt, isSelected): inner content for each radio element
   */
  function RadioGroup(props) {
    var options = props.options || [];
    var selectedIdx = -1;
    for (var i = 0; i < options.length; i++) {
      if (options[i].value === props.value) { selectedIdx = i; break; }
    }
    var focusIdx = selectedIdx < 0 ? 0 : selectedIdx;

    function focusRadio(fromEl, nextIdx) {
      var group = fromEl.closest ? fromEl.closest('[role="radiogroup"]') : null;
      if (!group) return;
      var radios = group.querySelectorAll('[role="radio"]');
      if (radios[nextIdx]) radios[nextIdx].focus();
    }

    function selectAt(idx) {
      var opt = options[idx];
      if (opt) props.onChange(opt.value);
    }

    function activateAt(idx) {
      var opt = options[idx];
      if (!opt) return;
      props.onChange(opt.value);
      if (typeof props.onActivate === 'function') props.onActivate(opt.value);
    }

    function onKeyDown(e) {
      var idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
      var key = e.key;
      if (key === 'ArrowRight' || key === 'ArrowDown') {
        e.preventDefault();
        var next = (idx + 1) % options.length;
        selectAt(next);
        focusRadio(e.currentTarget, next);
      } else if (key === 'ArrowLeft' || key === 'ArrowUp') {
        e.preventDefault();
        var prev = (idx - 1 + options.length) % options.length;
        selectAt(prev);
        focusRadio(e.currentTarget, prev);
      } else if (key === ' ' || key === 'Spacebar' || key === 'Enter') {
        e.preventDefault();
        activateAt(idx);
      }
    }

    return h('div', {
      role: 'radiogroup',
      'aria-label': props.ariaLabel || null,
      className: props.groupClassName || null
    },
      options.map(function(opt, idx) {
        var isSelected = idx === selectedIdx;
        return h('div', {
          key: opt.value,
          role: 'radio',
          'aria-checked': isSelected ? 'true' : 'false',
          tabIndex: idx === focusIdx ? 0 : -1,
          'data-idx': idx,
          className: props.itemClassName ? props.itemClassName(opt, isSelected) : null,
          style: props.itemStyle ? props.itemStyle(opt, isSelected) : null,
          onClick: function() { activateAt(idx); },
          onKeyDown: onKeyDown
        }, props.renderItem(opt, isSelected));
      })
    );
  }

  window.PraxisRadioGroup = RadioGroup;
})();
