(function() {
  'use strict';
  var h = React.createElement;

  // ── Helpers ──────────────────────────────────────────────

  var LEVEL_ORDER = ['impact', 'outcome', 'output', 'activity'];
  var LEVEL_LABELS = { impact: 'Goal / Impact', outcome: 'Outcome', output: 'Output', activity: 'Activity' };

  function uid() {
    return 'toc_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  /** Auto-layout positions: stack levels top-to-bottom, items left-to-right. */
  function layoutNodes(items) {
    var yByLevel = { impact: 60, outcome: 200, output: 340, activity: 480 };
    var countByLevel = { impact: 0, outcome: 0, output: 0, activity: 0 };
    return items.map(function(item) {
      var col = countByLevel[item.level]++;
      return Object.assign({}, item, {
        x: 140 + col * 220,
        y: yByLevel[item.level] || 100
      });
    });
  }

  /** Build connections: each child connects to its parent. */
  function buildConnections(outcomes, outputsByOutcome, activitiesByOutput, impactId) {
    var conns = [];
    outcomes.forEach(function(oc) {
      conns.push({ from: oc.id, to: impactId, label: '' });
      var outputs = outputsByOutcome[oc.id] || [];
      outputs.forEach(function(op) {
        conns.push({ from: op.id, to: oc.id, label: '' });
        var acts = activitiesByOutput[op.id] || [];
        acts.forEach(function(ac) {
          conns.push({ from: ac.id, to: op.id, label: '' });
        });
      });
    });
    return conns;
  }

  // ── Sub-components ──────────────────────────────────────

  function RemoveBtn(props) {
    return h('button', {
      type: 'button',
      className: 'wb-btn wb-btn-ghost wb-btn-sm',
      style: { color: 'var(--rose, #e11d48)', marginLeft: 8, flexShrink: 0 },
      onClick: props.onClick,
      title: 'Remove',
      'aria-label': 'Remove'
    }, '\u00D7');
  }

  function ActivityRow(props) {
    var act = props.activity;
    return h('div', { style: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, paddingLeft: 24 } },
      h('span', { style: { fontSize: 11, color: 'var(--slate)', flexShrink: 0, width: 56 } }, 'Activity'),
      h('input', {
        className: 'wb-input',
        style: { flex: 1, fontSize: 13 },
        placeholder: 'Activity title',
        value: act.title,
        onChange: function(e) { props.onChange(act.id, 'title', e.target.value); }
      }),
      h(RemoveBtn, { onClick: function() { props.onRemove(act.id); } })
    );
  }

  function OutputBlock(props) {
    var op = props.output;
    var activities = props.activities;
    return h('div', { className: 'wb-card', style: { marginBottom: 10, padding: '10px 12px', background: 'var(--bg-alt, #f8fafc)' } },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 } },
        h('span', { style: { fontSize: 11, color: 'var(--teal)', fontWeight: 600, flexShrink: 0, width: 48 } }, 'Output'),
        h('input', {
          className: 'wb-input',
          style: { flex: 1, fontSize: 13 },
          placeholder: 'Output title',
          value: op.title,
          onChange: function(e) { props.onOutputChange(op.id, 'title', e.target.value); }
        }),
        h(RemoveBtn, { onClick: function() { props.onRemoveOutput(op.id); } })
      ),
      h('input', {
        className: 'wb-input',
        style: { fontSize: 12, marginBottom: 8, width: '100%' },
        placeholder: 'Brief description (optional)',
        value: op.description || '',
        onChange: function(e) { props.onOutputChange(op.id, 'description', e.target.value); }
      }),
      activities.map(function(act) {
        return h(ActivityRow, {
          key: act.id,
          activity: act,
          onChange: props.onActivityChange,
          onRemove: props.onRemoveActivity
        });
      }),
      h('button', {
        type: 'button',
        className: 'wb-btn wb-btn-ghost wb-btn-sm',
        style: { fontSize: 11, marginTop: 4, paddingLeft: 24 },
        onClick: function() { props.onAddActivity(op.id); }
      }, '+ Activity')
    );
  }

  function OutcomeBlock(props) {
    var oc = props.outcome;
    var outputs = props.outputs;
    var activitiesByOutput = props.activitiesByOutput;
    return h('div', { className: 'wb-card', style: { marginBottom: 14, padding: '12px 14px' } },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 } },
        h('span', { style: { fontSize: 12, color: 'var(--indigo, #4f46e5)', fontWeight: 600, flexShrink: 0, width: 64 } }, 'Outcome'),
        h('input', {
          className: 'wb-input',
          style: { flex: 1, fontSize: 13, fontWeight: 500 },
          placeholder: 'Outcome title',
          value: oc.title,
          onChange: function(e) { props.onOutcomeChange(oc.id, 'title', e.target.value); }
        }),
        h(RemoveBtn, { onClick: function() { props.onRemoveOutcome(oc.id); } })
      ),
      h('input', {
        className: 'wb-input',
        style: { fontSize: 12, marginBottom: 10, width: '100%' },
        placeholder: 'Description (optional)',
        value: oc.description || '',
        onChange: function(e) { props.onOutcomeChange(oc.id, 'description', e.target.value); }
      }),
      outputs.map(function(op) {
        return h(OutputBlock, {
          key: op.id,
          output: op,
          activities: activitiesByOutput[op.id] || [],
          onOutputChange: props.onOutputChange,
          onRemoveOutput: props.onRemoveOutput,
          onActivityChange: props.onActivityChange,
          onRemoveActivity: props.onRemoveActivity,
          onAddActivity: props.onAddActivity
        });
      }),
      h('button', {
        type: 'button',
        className: 'wb-btn wb-btn-ghost wb-btn-sm',
        style: { fontSize: 12, marginTop: 4 },
        onClick: function() { props.onAddOutput(oc.id); }
      }, '+ Output')
    );
  }

  // ── Main Component ──────────────────────────────────────

  function TocInline(props) {
    var tocData = props.tocData || {};
    var onSave = props.onSave;

    // Parse existing toc data into editable structures
    var parsed = React.useMemo(function() {
      return parseTocData(tocData);
    }, []);

    // ── State ──
    var gs = React.useState(parsed.goal);
    var goal = gs[0]; var setGoal = gs[1];
    var ns = React.useState(parsed.narrative);
    var narrative = ns[0]; var setNarrative = ns[1];
    var os = React.useState(parsed.outcomes);
    var outcomes = os[0]; var setOutcomes = os[1];
    var ops = React.useState(parsed.outputs);
    var outputs = ops[0]; var setOutputs = ops[1];
    var as = React.useState(parsed.activities);
    var activities = as[0]; var setActivities = as[1];

    // ── Parsers ──

    function parseTocData(data) {
      var g = '', narr = '';
      var ocs = [], opList = [], actList = [];
      if (data && data.nodes && data.nodes.length > 0) {
        // Reconstruct from nodes/connections
        var nodeMap = {};
        data.nodes.forEach(function(n) { nodeMap[n.id] = n; });
        data.nodes.forEach(function(n) {
          if (n.level === 'impact') {
            g = n.title || '';
          } else if (n.level === 'outcome') {
            ocs.push({ id: n.id, title: n.title || '', description: n.description || '' });
          } else if (n.level === 'output') {
            // Find parent outcome via connection
            var parentId = findParent(n.id, data.connections);
            opList.push({ id: n.id, title: n.title || '', description: n.description || '', outcomeId: parentId });
          } else if (n.level === 'activity') {
            var parentOutputId = findParent(n.id, data.connections);
            actList.push({ id: n.id, title: n.title || '', outputId: parentOutputId });
          }
        });
        narr = data.narrative || '';
      }
      return { goal: g, narrative: narr, outcomes: ocs, outputs: opList, activities: actList };
    }

    function findParent(childId, connections) {
      if (!connections) return null;
      for (var i = 0; i < connections.length; i++) {
        if (connections[i].from === childId) return connections[i].to;
      }
      return null;
    }

    // ── Outcome CRUD ──

    function addOutcome() {
      setOutcomes(function(prev) {
        return prev.concat([{ id: uid(), title: '', description: '' }]);
      });
    }

    function removeOutcome(id) {
      setOutcomes(function(prev) { return prev.filter(function(o) { return o.id !== id; }); });
      // Cascade: remove child outputs and their activities
      setOutputs(function(prev) {
        var removed = prev.filter(function(o) { return o.outcomeId === id; });
        var removedIds = removed.map(function(o) { return o.id; });
        setActivities(function(acts) {
          return acts.filter(function(a) { return removedIds.indexOf(a.outputId) === -1; });
        });
        return prev.filter(function(o) { return o.outcomeId !== id; });
      });
    }

    function changeOutcome(id, field, value) {
      setOutcomes(function(prev) {
        return prev.map(function(o) {
          if (o.id !== id) return o;
          var next = Object.assign({}, o);
          next[field] = value;
          return next;
        });
      });
    }

    // ── Output CRUD ──

    function addOutput(outcomeId) {
      setOutputs(function(prev) {
        return prev.concat([{ id: uid(), title: '', description: '', outcomeId: outcomeId }]);
      });
    }

    function removeOutput(id) {
      setOutputs(function(prev) { return prev.filter(function(o) { return o.id !== id; }); });
      setActivities(function(prev) { return prev.filter(function(a) { return a.outputId !== id; }); });
    }

    function changeOutput(id, field, value) {
      setOutputs(function(prev) {
        return prev.map(function(o) {
          if (o.id !== id) return o;
          var next = Object.assign({}, o);
          next[field] = value;
          return next;
        });
      });
    }

    // ── Activity CRUD ──

    function addActivity(outputId) {
      setActivities(function(prev) {
        return prev.concat([{ id: uid(), title: '', outputId: outputId }]);
      });
    }

    function removeActivity(id) {
      setActivities(function(prev) { return prev.filter(function(a) { return a.id !== id; }); });
    }

    function changeActivity(id, field, value) {
      setActivities(function(prev) {
        return prev.map(function(a) {
          if (a.id !== id) return a;
          var next = Object.assign({}, a);
          next[field] = value;
          return next;
        });
      });
    }

    // ── Build ToC schema ──

    function buildTocSchema() {
      var impactId = uid();
      var items = [];

      // Impact node
      items.push({ id: impactId, title: goal, description: '', level: 'impact' });

      // Outcome nodes
      outcomes.forEach(function(oc) {
        items.push({ id: oc.id, title: oc.title, description: oc.description || '', level: 'outcome' });
      });

      // Output nodes
      outputs.forEach(function(op) {
        items.push({ id: op.id, title: op.title, description: op.description || '', level: 'output' });
      });

      // Activity nodes
      activities.forEach(function(ac) {
        items.push({ id: ac.id, title: ac.title, description: '', level: 'activity' });
      });

      var nodes = layoutNodes(items);

      // Derive parent maps
      var outputsByOutcome = {};
      outputs.forEach(function(op) {
        if (!outputsByOutcome[op.outcomeId]) outputsByOutcome[op.outcomeId] = [];
        outputsByOutcome[op.outcomeId].push(op);
      });
      var activitiesByOutput = {};
      activities.forEach(function(ac) {
        if (!activitiesByOutput[ac.outputId]) activitiesByOutput[ac.outputId] = [];
        activitiesByOutput[ac.outputId].push(ac);
      });

      var connections = buildConnections(outcomes, outputsByOutcome, activitiesByOutput, impactId);

      return {
        title: goal || 'Untitled Theory of Change',
        narrative: narrative,
        nodes: nodes,
        connections: connections
      };
    }

    function handleSave() {
      if (onSave) onSave(buildTocSchema());
    }

    // ── Derived: group outputs by outcome, activities by output ──

    var outputsByOutcome = {};
    outputs.forEach(function(op) {
      if (!outputsByOutcome[op.outcomeId]) outputsByOutcome[op.outcomeId] = [];
      outputsByOutcome[op.outcomeId].push(op);
    });

    var activitiesByOutput = {};
    activities.forEach(function(ac) {
      if (!activitiesByOutput[ac.outputId]) activitiesByOutput[ac.outputId] = [];
      activitiesByOutput[ac.outputId].push(ac);
    });

    // ── Validation ──

    var hasGoal = goal.trim().length > 0;
    var hasOutcome = outcomes.some(function(o) { return o.title.trim().length > 0; });

    // ── Render ──

    return h('div', { style: { maxWidth: 680, margin: '0 auto' } },

      // Header
      h('div', { style: { marginBottom: 20 } },
        h('h3', { style: { fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 } },
          'Guided Theory of Change Builder'),
        h('p', { className: 'wb-helper', style: { fontSize: 13 } },
          'Define your programme\'s causal chain from activities through to intended impact. This structured form produces the same ToC schema used by the full canvas builder.')
      ),

      // Goal / Impact
      h('div', { style: { marginBottom: 20 } },
        h('label', { className: 'wb-label' }, 'Goal / Impact Statement'),
        h('textarea', {
          className: 'wb-textarea',
          rows: 3,
          placeholder: 'What is the ultimate change this programme aims to achieve?',
          value: goal,
          onChange: function(e) { setGoal(e.target.value); }
        })
      ),

      // Narrative
      h('div', { style: { marginBottom: 20 } },
        h('label', { className: 'wb-label' }, 'Theory Narrative'),
        h('p', { className: 'wb-helper', style: { marginBottom: 6, fontSize: 12 } },
          'Optional. Describe the causal logic connecting activities to outcomes.'),
        h('textarea', {
          className: 'wb-textarea',
          rows: 3,
          placeholder: 'If the programme delivers [activities], then [outputs] will be produced, leading to [outcomes], ultimately contributing to [impact] because...',
          value: narrative,
          onChange: function(e) { setNarrative(e.target.value); }
        })
      ),

      // Outcomes section
      h('div', { style: { marginBottom: 16 } },
        h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 } },
          h('label', { className: 'wb-label', style: { marginBottom: 0 } }, 'Outcomes'),
          h('button', {
            type: 'button',
            className: 'wb-btn wb-btn-ghost wb-btn-sm',
            onClick: addOutcome
          }, '+ Outcome')
        ),

        outcomes.length === 0
          ? h('p', { className: 'wb-helper', style: { fontSize: 12, fontStyle: 'italic', padding: '12px 0' } },
              'No outcomes yet. Add your first outcome to start building the causal chain.')
          : outcomes.map(function(oc) {
              return h(OutcomeBlock, {
                key: oc.id,
                outcome: oc,
                outputs: outputsByOutcome[oc.id] || [],
                activitiesByOutput: activitiesByOutput,
                onOutcomeChange: changeOutcome,
                onRemoveOutcome: removeOutcome,
                onOutputChange: changeOutput,
                onRemoveOutput: removeOutput,
                onActivityChange: changeActivity,
                onRemoveActivity: removeActivity,
                onAddOutput: addOutput,
                onAddActivity: addActivity
              });
            })
      ),

      // Summary bar
      h('div', {
        style: {
          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
          background: 'var(--bg-alt, #f8fafc)', borderRadius: 8, marginBottom: 16, fontSize: 12, color: 'var(--slate)'
        }
      },
        h('span', null, outcomes.length + ' outcomes'),
        h('span', null, '\u00b7'),
        h('span', null, outputs.length + ' outputs'),
        h('span', null, '\u00b7'),
        h('span', null, activities.length + ' activities')
      ),

      // Save button
      h('div', { style: { display: 'flex', gap: 10, justifyContent: 'flex-end' } },
        h('button', {
          type: 'button',
          className: 'wb-btn wb-btn-teal',
          disabled: !hasGoal || !hasOutcome,
          onClick: handleSave,
          title: !hasGoal ? 'Enter a goal statement first' : !hasOutcome ? 'Add at least one outcome' : ''
        }, 'Save Draft')
      )
    );
  }

  window.TocInline = TocInline;
})();
