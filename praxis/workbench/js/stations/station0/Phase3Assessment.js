(function() {
  'use strict';
  var h = React.createElement;

  function getBand(score) {
    if (score >= 80) return { label: 'Highly evaluable', color: '#059669' };
    if (score >= 60) return { label: 'Evaluable with constraints', color: '#D97706' };
    if (score >= 40) return { label: 'Challenging to evaluate', color: '#DC7633' };
    return { label: 'Significant evaluability concerns', color: '#DC2626' };
  }

  function Phase3Assessment(props) {
    var scoringResult = props.scoringResult || { score: 0, dimensions: [], blockers: [], recommendations: [] };
    var overrides = props.overrides || {};
    var onOverride = props.onOverride;
    var onSave = props.onSave;
    var onBack = props.onBack;

    var expandedState = React.useState(null);
    var expandedDim = expandedState[0];
    var setExpandedDim = expandedState[1];

    // Compute adjusted total
    var adjustedTotal = scoringResult.dimensions.reduce(function(sum, d) {
      var ov = overrides[d.id];
      return sum + (ov && ov.adjustedScore != null ? ov.adjustedScore : d.system_score);
    }, 0);

    var overrideCount = Object.keys(overrides).filter(function(k) { return overrides[k] && overrides[k].adjustedScore != null; }).length;
    var originalTotal = scoringResult.score;
    var band = getBand(adjustedTotal);

    function droveText(dim) {
      if (dim.id === 'comparison') return 'Comparison feasibility contributes up to ' + dim.max + ' points based on the comparison group available and operating context.';
      if (dim.id === 'data') return 'Data availability contributes up to ' + dim.max + ' points. Higher scores reflect baseline and endline data readiness.';
      if (dim.id === 'toc') return 'Theory of Change clarity is a proxy score at this stage. It will be refined in Station 1.';
      if (dim.id === 'timeline') return 'Timeline adequacy reflects whether the evaluation period is sufficient for the chosen methods.';
      if (dim.id === 'context') return 'Operating context scores the feasibility of rigorous evaluation in the current environment.';
      return '';
    }

    function improveText(dim) {
      if (dim.id === 'comparison') return 'Identify potential comparison groups or consider quasi-experimental alternatives.';
      if (dim.id === 'data') return 'Strengthen data readiness by reviewing existing routine MEAL data or planning a baseline.';
      if (dim.id === 'toc') return 'Develop a detailed theory of change in Station 1 to improve this score.';
      if (dim.id === 'timeline') return 'Negotiate a longer evaluation window or adjust methods to shorter timelines.';
      if (dim.id === 'context') return 'Adapt methods for the operating context and plan for context-appropriate data collection.';
      return '';
    }

    return h('div', null,
      // Score display
      h('div', { style: { textAlign: 'center', padding: '24px 0 16px' } },
        h('div', { style: { fontSize: '48px', fontWeight: 700, color: band.color } }, adjustedTotal),
        h('div', { style: { fontSize: '14px', fontWeight: 600, color: band.color, marginTop: 4 } }, band.label),
        h('div', { style: { fontSize: '11px', color: '#6B7280', marginTop: 4 } }, 'out of 100')
      ),

      // Override audit trail
      overrideCount > 0 ? h('div', { style: { background: '#F0F9FF', border: '1px solid #93C5FD', borderRadius: 6, padding: '10px 14px', marginBottom: 16, fontSize: '12px', color: '#1E40AF' } },
        overrideCount + ' score(s) adjusted by evaluator. Original auto-score: ' + originalTotal + '. Adjusted total: ' + adjustedTotal + '.'
      ) : null,

      // Dimension breakdown
      h('div', { style: { marginBottom: 20 } },
        scoringResult.dimensions.map(function(dim) {
          var isExpanded = expandedDim === dim.id;
          var ov = overrides[dim.id];
          var displayScore = ov && ov.adjustedScore != null ? ov.adjustedScore : dim.system_score;
          var pct = Math.round((displayScore / dim.max) * 100);

          return h('div', { key: dim.id, style: { border: '1px solid #E5E7EB', borderRadius: 6, marginBottom: 8, overflow: 'hidden' } },
            // Collapsed row
            h('div', {
              style: { display: 'flex', alignItems: 'center', padding: '10px 14px', cursor: 'pointer', gap: '12px' },
              onClick: function() { setExpandedDim(isExpanded ? null : dim.id); }
            },
              h('span', { style: { fontSize: '12px', transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' } }, '\u25B6'),
              h('span', { style: { flex: 1, fontSize: '13px', fontWeight: 500 } }, dim.label),
              h('div', { style: { width: 80, height: 6, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden' } },
                h('div', { style: { width: pct + '%', height: '100%', background: pct >= 60 ? '#059669' : pct >= 40 ? '#D97706' : '#DC2626', borderRadius: 3 } })
              ),
              h('span', { style: { fontSize: '12px', fontWeight: 600, color: '#374151', marginLeft: 8, minWidth: 36, textAlign: 'right' } }, displayScore + '/' + dim.max)
            ),

            // Expanded content
            isExpanded ? h('div', { style: { padding: '0 14px 14px', borderTop: '1px solid #E5E7EB' } },
              h('div', { style: { fontSize: '12px', color: '#374151', margin: '12px 0 8px' } },
                h('strong', null, 'What drove this score: '), droveText(dim)
              ),
              h('div', { style: { fontSize: '12px', color: '#374151', marginBottom: 12 } },
                h('strong', null, 'What would improve it: '), improveText(dim)
              ),
              // Override panel
              h('div', { style: { background: '#F9FAFB', borderRadius: 4, padding: '10px 12px' } },
                h('div', { style: { fontSize: '11px', color: '#6B7280', marginBottom: 6 } },
                  'System: ' + dim.system_score + '/' + dim.max + ' \u2192 Your assessment:'
                ),
                h('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: 8 } },
                  h('input', {
                    className: 'wb-input',
                    type: 'number',
                    min: 0,
                    max: dim.max,
                    style: { width: 60 },
                    value: ov && ov.adjustedScore != null ? ov.adjustedScore : '',
                    placeholder: String(dim.system_score),
                    onChange: function(e) {
                      var val = parseInt(e.target.value, 10);
                      if (isNaN(val)) val = null;
                      else val = Math.max(0, Math.min(dim.max, val));
                      onOverride(dim.id, val, (ov && ov.justification) || '');
                    }
                  }),
                  h('span', { style: { fontSize: '12px', color: '#6B7280' } }, '/ ' + dim.max)
                ),
                h('textarea', {
                  className: 'wb-input',
                  rows: 2,
                  placeholder: 'Justification for override...',
                  value: (ov && ov.justification) || '',
                  onChange: function(e) {
                    onOverride(dim.id, ov && ov.adjustedScore != null ? ov.adjustedScore : null, e.target.value);
                  }
                })
              )
            ) : null
          );
        })
      ),

      // Blockers
      scoringResult.blockers.length > 0 ? h('div', { style: { background: '#FFF7ED', border: '1px solid #FDBA74', borderRadius: 6, padding: '12px 16px', marginBottom: 16 } },
        h('div', { className: 'wb-badge-amber', style: { marginBottom: 6 } }, 'CONSTRAINTS'),
        scoringResult.blockers.map(function(b, i) {
          return h('p', { key: i, style: { fontSize: '12px', color: '#92400E', margin: '4px 0' } },
            b.label + ' scored ' + b.score + '/' + b.max + ' \u2014 below the 40% threshold.'
          );
        })
      ) : null,

      // Recommendations
      scoringResult.recommendations.length > 0 ? h('div', { style: { background: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: 6, padding: '12px 16px', marginBottom: 16 } },
        h('div', { className: 'wb-badge-green', style: { marginBottom: 6 } }, 'RECOMMENDATIONS'),
        scoringResult.recommendations.map(function(r, i) {
          return h('p', { key: i, style: { fontSize: '12px', color: '#065F46', margin: '4px 0' } }, r);
        })
      ) : null,

      // Bottom bar
      h('div', { className: 'wb-panel-footer' },
        h('span', { style: { fontSize: '11px', color: '#64748B' } }, 'Phase 3 of 3 \u00B7 Evaluability Assessment'),
        h('div', { style: { display: 'flex', gap: '8px' } },
          h('button', { className: 'wb-btn wb-btn-outline', onClick: onBack }, '\u2190 Review Phases'),
          h('button', { className: 'wb-btn wb-btn-primary', onClick: onSave }, 'Save & Proceed to Station 1 \u2192')
        )
      )
    );
  }

  window.Phase3Assessment = Phase3Assessment;
})();
