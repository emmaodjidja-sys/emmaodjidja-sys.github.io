(function() {
  'use strict';
  var h = React.createElement;

  function ProgressRing(props) {
    var percent = typeof props.percent === 'number' ? Math.min(100, Math.max(0, props.percent)) : 0;
    var size = typeof props.size === 'number' ? props.size : 24;
    var strokeWidth = Math.max(2, Math.round(size / 10));
    var radius = (size - strokeWidth * 2) / 2;
    var circumference = 2 * Math.PI * radius;
    var offset = circumference - (percent / 100) * circumference;
    var center = size / 2;
    var fontSize = Math.max(6, Math.round(size * 0.28));

    return h('div', { className: 'wb-progress-ring', style: { width: size, height: size } },
      h('svg', { width: size, height: size, viewBox: '0 0 ' + size + ' ' + size },
        h('circle', {
          cx: center, cy: center, r: radius,
          fill: 'none',
          stroke: '#E2E8F0',
          strokeWidth: strokeWidth
        }),
        h('circle', {
          cx: center, cy: center, r: radius,
          fill: 'none',
          stroke: 'var(--teal)',
          strokeWidth: strokeWidth,
          strokeDasharray: circumference,
          strokeDashoffset: offset,
          strokeLinecap: 'round',
          style: { transition: 'stroke-dashoffset 0.3s ease' }
        })
      ),
      h('span', {
        className: 'wb-progress-ring-text',
        style: { fontSize: fontSize }
      }, percent + '%')
    );
  }

  window.ProgressRing = ProgressRing;
})();
