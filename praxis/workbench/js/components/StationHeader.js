(function() {
  'use strict';
  var h = React.createElement;

  function StationHeader(props) {
    var stationId = props.stationId || 0;
    var context = props.context || {};
    var meta = context.project_meta || {};
    var toc = context.toc || {};
    var evaluability = context.evaluability || {};

    var stationName = (PraxisSchema.STATION_LABELS && PraxisSchema.STATION_LABELS[stationId]) || ('Station ' + stationId);
    var desc = PraxisI18n.t('station.' + stationId + '.desc');
    if (desc === 'station.' + stationId + '.desc') desc = '';

    var badges = [];
    if (meta.programme_name) {
      badges.push(h('span', { key: 'prog', className: 'wb-context-badge' }, meta.programme_name));
    }
    if (evaluability.score !== null && evaluability.score !== undefined) {
      badges.push(h('span', { key: 'eval', className: 'wb-context-badge' },
        'Evaluability: ' + evaluability.score + '/100'
      ));
    }
    if (toc.nodes && toc.nodes.length > 0) {
      badges.push(h('span', { key: 'toc', className: 'wb-context-badge' },
        toc.nodes.length + ' ToC node' + (toc.nodes.length !== 1 ? 's' : '')
      ));
    }
    if (meta.evaluation_type) {
      badges.push(h('span', { key: 'etype', className: 'wb-context-badge' }, meta.evaluation_type));
    }

    return h('div', { className: 'wb-panel-header' },
      h('span', { className: 'wb-station-label' }, 'STATION ' + stationId),
      h('h2', { className: 'wb-station-title' }, stationName),
      desc ? h('p', { className: 'wb-station-desc' }, desc) : null,
      badges.length > 0
        ? h('div', { className: 'wb-context-badges' }, badges)
        : null
    );
  }

  window.StationHeader = StationHeader;
})();
