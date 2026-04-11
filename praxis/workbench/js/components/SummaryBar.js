(function() {
  'use strict';
  var h = React.createElement;

  /**
   * SummaryBar — dark navy context strip per station.
   * Props:
   *   stationId: number
   *   context: object (full workbench context)
   */
  function SummaryBar(props) {
    var stationId = props.stationId;
    var ctx = props.context || {};
    var meta = ctx.project_meta || {};
    var evb = ctx.evaluability || {};
    var toc = ctx.toc || {};
    var matrix = ctx.evaluation_matrix || {};
    var design = ctx.design_recommendation || {};
    var sample = ctx.sample_parameters || {};
    var instr = ctx.instruments || {};
    var analysis = ctx.analysis_plan || {};
    var report = ctx.report_structure || {};
    var presentation = ctx.presentation || {};

    var primary = null;
    var stats = [];

    if (stationId === 0) {
      var score = evb.score;
      if (score != null) {
        primary = score + '/100';
        var dims = evb.dimensions || [];
        var overrideCount = dims.filter(function(d) { return d.adjusted_score != null; }).length;
        stats.push({ label: 'Dimensions', value: dims.length + ' scored' });
        if (overrideCount > 0) stats.push({ label: 'Overrides', value: String(overrideCount) });
      }
    } else if (stationId === 1) {
      var nodes = (toc.nodes || []);
      if (nodes.length > 0) {
        primary = nodes.length + ' nodes';
        var levels = {};
        nodes.forEach(function(n) { var l = n.level || 'other'; levels[l] = (levels[l] || 0) + 1; });
        var levelCount = Object.keys(levels).length;
        stats.push({ label: 'Levels', value: String(levelCount) });
      }
    } else if (stationId === 2) {
      var rows = matrix.rows || [];
      if (rows.length > 0) {
        primary = rows.length + ' EQs';
        var indCount = rows.reduce(function(s, r) { return s + (r.indicators || []).length; }, 0);
        var critSet = {};
        rows.forEach(function(r) { if (r.criterion) critSet[r.criterion] = true; });
        stats.push({ label: 'Criteria', value: Object.keys(critSet).length + ' mapped' });
        stats.push({ label: 'Indicators', value: String(indCount) });
      }
    } else if (stationId === 3) {
      var ranked = design.ranked_designs || [];
      if (ranked.length > 0) {
        var top = ranked[0];
        primary = top.name || top.id || 'Selected';
        if (top.score != null) stats.push({ label: 'Confidence', value: Math.round(top.score) + '%' });
        stats.push({ label: 'Alternatives', value: String(ranked.length - 1) });
      }
    } else if (stationId === 4) {
      var result = sample.result || {};
      if (result.primary) {
        primary = 'n = ' + result.primary;
        var params = sample.params || {};
        if (params.power) stats.push({ label: 'Power', value: params.power });
        if (params.effect_size) stats.push({ label: 'Effect', value: params.effect_size });
      }
    } else if (stationId === 5) {
      var items = (instr.items || []);
      if (items.length > 0) {
        primary = items.length + ' instrument' + (items.length !== 1 ? 's' : '');
        var totalQ = items.reduce(function(s, inst) { return s + (inst.questions ? inst.questions.length : 0); }, 0);
        stats.push({ label: 'Questions', value: String(totalQ) });
      }
    } else if (stationId === 6) {
      var aRows = (analysis.rows || []);
      if (aRows.length > 0) {
        primary = aRows.length + ' methods mapped';
        var coveredEqs = {};
        aRows.forEach(function(r) { if (r.eq_id) coveredEqs[r.eq_id] = true; });
        stats.push({ label: 'EQs covered', value: String(Object.keys(coveredEqs).length) });
      }
    } else if (stationId === 7) {
      var sections = (report.sections || []);
      if (sections.length > 0) {
        primary = sections.length + ' sections';
        var findings = sections.filter(function(s) { return s.type === 'finding'; }).length;
        var recs = sections.filter(function(s) { return s.sectionType === 'recommendations'; }).length;
        stats.push({ label: 'Findings', value: String(findings) });
        if (recs > 0) stats.push({ label: 'Recs', value: String(recs) });
      }
    } else if (stationId === 8) {
      var slides = (presentation.slides || []);
      if (slides.length > 0) {
        primary = slides.length + ' slides';
        var included = slides.filter(function(s) { return s.included !== false; }).length;
        stats.push({ label: 'Included', value: String(included) });
      }
    }

    // Empty state
    if (!primary) {
      return h('div', { className: 'wb-summary-bar' },
        h('span', { className: 'wb-summary-empty' }, 'Complete this station to see summary')
      );
    }

    return h('div', { className: 'wb-summary-bar' },
      h('div', { style: { display: 'flex', alignItems: 'center' } },
        h('span', { className: 'wb-summary-label' },
          (PraxisSchema.STATION_LABELS && PraxisSchema.STATION_LABELS[stationId]) || ('Station ' + stationId)),
        h('span', { className: 'wb-summary-primary' }, primary)
      ),
      stats.length > 0
        ? h('div', { className: 'wb-summary-stats' },
            stats.map(function(s, i) {
              return h('span', { key: i, className: 'wb-summary-stat' },
                h('span', { className: 'wb-summary-stat-label' }, s.label),
                ' ', s.value
              );
            })
          )
        : null
    );
  }

  window.SummaryBar = SummaryBar;
})();
