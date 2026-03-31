(function() {
  'use strict';
  var h = React.createElement;

  function getBand(score) {
    if (score >= 80) return { label: 'Highly evaluable', css: 'wb-score-band--green' };
    if (score >= 60) return { label: 'Evaluable with constraints', css: 'wb-score-band--amber' };
    if (score >= 40) return { label: 'Challenging to evaluate', css: 'wb-score-band--amber' };
    return { label: 'Significant evaluability concerns', css: 'wb-score-band--red' };
  }

  function dimFillColor(pct) {
    if (pct > 75) return '#059669';
    if (pct >= 50) return '#D97706';
    return '#DC2626';
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
      // Score display — uses .wb-score design-system classes
      h('div', { style: { textAlign: 'center', padding: '20px 0 8px' } },
        h('div', { className: 'wb-score', style: { justifyContent: 'center' } },
          h('span', { className: 'wb-score-number' }, adjustedTotal),
          h('span', { className: 'wb-score-label' }, 'out of 100')
        ),
        h('div', { style: { marginTop: 8 } },
          h('span', { className: 'wb-score-band ' + band.css }, band.label)
        )
      ),

      // Override audit trail
      overrideCount > 0 ? h('div', { className: 'wb-guidance', style: { marginTop: 12 } },
        h('span', { className: 'wb-guidance-text' },
          overrideCount + ' score(s) adjusted by evaluator. Original auto-score: ' + originalTotal + '. Adjusted total: ' + adjustedTotal + '.'
        )
      ) : null,

      // Dimension breakdown — uses .wb-dimension design-system classes
      h('div', { style: { margin: '16px 0 20px' } },
        scoringResult.dimensions.map(function(dim) {
          var isExpanded = expandedDim === dim.id;
          var ov = overrides[dim.id];
          var displayScore = ov && ov.adjustedScore != null ? ov.adjustedScore : dim.system_score;
          var pct = Math.round((displayScore / dim.max) * 100);

          return h('div', { key: dim.id, style: { cursor: 'pointer' } },
            // Dimension row — collapsed
            h('div', {
              className: 'wb-dimension',
              onClick: function() { setExpandedDim(isExpanded ? null : dim.id); }
            },
              h('span', {
                style: { fontSize: '10px', color: 'var(--slate)', marginRight: -4,
                  transform: isExpanded ? 'rotate(90deg)' : 'none',
                  transition: 'transform 0.15s', display: 'inline-block' }
              }, '\u25B6'),
              h('span', { className: 'wb-dimension-label' }, dim.label),
              h('div', { className: 'wb-dimension-bar' },
                h('div', { className: 'wb-dimension-fill', style: { width: pct + '%', background: dimFillColor(pct) } })
              ),
              h('span', { className: 'wb-dimension-score' }, displayScore + '/' + dim.max)
            ),

            // Expanded detail
            isExpanded ? h('div', { style: { padding: '4px 0 12px 28px' } },
              h('p', { style: { fontSize: '12px', color: 'var(--text)', margin: '0 0 6px', lineHeight: '1.5' } },
                h('strong', null, 'What drove this score: '), droveText(dim)
              ),
              h('p', { style: { fontSize: '12px', color: 'var(--text)', margin: '0 0 12px', lineHeight: '1.5' } },
                h('strong', null, 'What would improve it: '), improveText(dim)
              ),
              // Override panel
              h('div', { className: 'wb-card', style: { padding: '10px 14px' } },
                h('label', { className: 'wb-field-label' },
                  'Evaluator override',
                  h('span', { className: 'wb-field-hint' }, 'System: ' + dim.system_score + '/' + dim.max)
                ),
                h('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: 8 } },
                  h('input', {
                    className: 'wb-input',
                    type: 'number',
                    min: 0,
                    max: dim.max,
                    style: { width: 64 },
                    value: ov && ov.adjustedScore != null ? ov.adjustedScore : '',
                    placeholder: String(dim.system_score),
                    onChange: function(e) {
                      var val = parseInt(e.target.value, 10);
                      if (isNaN(val)) val = null;
                      else val = Math.max(0, Math.min(dim.max, val));
                      onOverride(dim.id, val, (ov && ov.justification) || '');
                    }
                  }),
                  h('span', { style: { fontSize: '12px', color: 'var(--slate)' } }, '/ ' + dim.max)
                ),
                h('label', { className: 'wb-field-label' }, 'Justification'),
                h('textarea', {
                  className: 'wb-input wb-textarea',
                  rows: 2,
                  placeholder: 'Reason for adjusting this dimension score...',
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
      scoringResult.blockers.length > 0 ? h('div', { className: 'wb-card', style: { borderLeft: '3px solid var(--amber)', marginBottom: 16 } },
        h('div', { className: 'wb-badge wb-badge-amber', style: { marginBottom: 8 } }, 'CONSTRAINTS'),
        scoringResult.blockers.map(function(b, i) {
          return h('p', { key: i, style: { fontSize: '12px', color: '#92400E', margin: '4px 0', lineHeight: '1.5' } },
            b.label + ' scored ' + b.score + '/' + b.max + ' \u2014 below the 40\u2009% threshold.'
          );
        })
      ) : null,

      // Recommendations
      scoringResult.recommendations.length > 0 ? h('div', { className: 'wb-card', style: { borderLeft: '3px solid var(--green)', marginBottom: 16 } },
        h('div', { className: 'wb-badge wb-badge-green', style: { marginBottom: 8 } }, 'RECOMMENDATIONS'),
        scoringResult.recommendations.map(function(r, i) {
          return h('p', { key: i, style: { fontSize: '12px', color: '#065F46', margin: '4px 0', lineHeight: '1.5' } }, r);
        })
      ) : null,

      // Bottom bar
      h('div', { className: 'wb-panel-footer' },
        h('span', { className: 'wb-station-nav-pos' }, 'Phase 3 of 3 \u00B7 Evaluability Assessment'),
        h('div', { style: { display: 'flex', gap: '8px' } },
          h('button', { className: 'wb-btn wb-btn-outline', onClick: onBack }, 'Review Phases'),
          h('button', { className: 'wb-btn wb-btn-primary', onClick: onSave }, 'Save & Proceed to Station 1')
        )
      )
    );
  }

  window.Phase3Assessment = Phase3Assessment;
})();
