(function() {
  'use strict';
  var h = React.createElement;

  /**
   * SectionCard — visual container for station content sections.
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
          onClick: function() { setCollapsed(!collapsed); }
        }, collapsed ? '\u25B6' : '\u25BC') : null
      ) : null,

      // Body
      (!collapsible || !collapsed) ? h('div', { className: bodyClass }, children) : null
    );
  }

  window.SectionCard = SectionCard;
})();
