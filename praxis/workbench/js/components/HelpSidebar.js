(function() {
  'use strict';
  var h = React.createElement;

  var STATION_HELP = {
    0: {
      title: 'Evaluability & Scoping',
      foundation: 'This station helps you assess whether your programme can be meaningfully evaluated. You\'ll describe the programme, review the terms of reference, and score evaluability across five dimensions.',
      practitioner: 'Assess evaluability across data availability, ToC clarity, timeline, context, and comparison feasibility. Professional judgment overrides are tracked with audit trail.',
      advanced: 'Five-dimension evaluability scoring with cross-dimension modifiers. Blockers and recommendations auto-generated from constraint patterns.'
    },
    1: {
      title: 'Theory of Change',
      foundation: 'Map out how your programme is expected to create change — from activities to outcomes to impact. You can use the simple guided builder or the full visual canvas.',
      practitioner: 'Build a theory of change with assumption testing, evidence strength ratings, and knowledge source tracking. Supports traceability codes.',
      advanced: 'Full ToC canvas with bidirectional connections, evidence taxonomies, and traceability. Export to SVG/PNG/JSON.'
    },
    2: {
      title: 'Evaluation Matrix',
      foundation: 'Create the core document that guides your evaluation — a table linking your evaluation questions to indicators, data sources, and how you\'ll judge success.',
      practitioner: 'Table-first matrix with auto-suggested evaluation questions from ToC × DAC criteria. Inline editing with indicator bank integration.',
      advanced: 'Full matrix with sub-questions, judgement criteria templates, and multi-format export (Word/Excel/JSON).'
    },
    3: {
      title: 'Design Advisor',
      foundation: 'Get recommendations for which evaluation design fits your situation best. Most questions are pre-filled from your earlier work — you just need to answer two more.',
      practitioner: '8 of 10 design advisor questions pre-filled from evaluability assessment. Scores 16 designs across experimental, quasi-experimental, theory-based, and participatory families.',
      advanced: 'Full design scoring with validity threat analysis, cost/rigour/complexity ratings, and exportable recommendation report.'
    },
    4: {
      title: 'Sample Size Calculator',
      foundation: 'Calculate how many people or sites you need in your evaluation. The calculator is pre-set to match your chosen design.',
      practitioner: 'Design-aware sample size calculation with qualitative sampling plan. Supports cluster designs, stepped-wedge, DiD, and ITS.',
      advanced: 'Full parametric calculator with ICC, design effects, finite population correction, and multi-outcome adjustment.'
    },
    5: {
      title: 'Instrument Builder',
      foundation: 'Build your data collection tools (surveys, interview guides) question by question. Each question links back to your evaluation matrix.',
      practitioner: 'Structured instrument builder with auto-scaffolding from matrix. Supports Likert, multiple choice, numeric, open text, ranking, and date types.',
      advanced: 'Full configurator with XLSForm live preview, skip logic boundaries, and multi-format export (XLSForm/Word/PDF).'
    },
    6: {
      title: 'Analysis Framework',
      foundation: 'Plan how you\'ll analyse the data you collect. Links each evaluation question to analysis methods.',
      practitioner: 'Analysis framework scaffold linked to evaluation matrix. Method and software selection per EQ.',
      advanced: 'Coming soon: full analysis plan with statistical specifications and software code templates.'
    },
    7: {
      title: 'Report Builder',
      foundation: 'Structure your evaluation report with a professional outline. Sections are auto-generated from your evaluation questions.',
      practitioner: 'Report outline auto-populated from matrix. Editable section structure with standard evaluation report format.',
      advanced: 'Coming soon: full report generation with finding templates and evidence synthesis framework.'
    },
    8: {
      title: 'Deck Generator',
      foundation: 'Create a summary presentation of your evaluation plan — useful for stakeholder briefings and approval meetings.',
      practitioner: 'Structured summary pulling from all stations. Export as PDF for stakeholder presentations.',
      advanced: 'Coming soon: full slide generation with data visualisation templates.'
    }
  };

  function HelpSidebar(props) {
    var stationId = props.stationId;
    var tier = props.tier || 'foundation';
    var open = props.open;
    var onClose = props.onClose;

    if (!open) return null;

    var help = STATION_HELP[stationId] || { title: 'Station ' + stationId, foundation: '', practitioner: '', advanced: '' };
    var text = help[tier] || help.foundation;

    return h('div', {
      style: {
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '320px',
        background: '#fff', borderLeft: '1px solid var(--wb-border)',
        boxShadow: '-4px 0 16px rgba(11,26,46,0.08)', zIndex: 250,
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }
    },
      // Header
      h('div', { style: { padding: '14px 16px', borderBottom: '1px solid var(--wb-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
        h('span', { style: { fontSize: '11px', fontWeight: 700, color: 'var(--wb-navy)', letterSpacing: '0.04em', textTransform: 'uppercase' } }, 'Help'),
        h('button', {
          className: 'wb-btn wb-btn-ghost wb-btn-sm',
          onClick: onClose,
          style: { fontSize: '14px', padding: '2px 6px', color: 'var(--wb-slate)' }
        }, '\u00D7')
      ),
      // Content
      h('div', { style: { flex: 1, overflow: 'auto', padding: '16px' } },
        h('h3', { style: { fontSize: '14px', fontWeight: 600, color: 'var(--wb-navy)', marginBottom: '8px' } },
          'Station ' + stationId + ': ' + help.title
        ),
        h('p', { style: { fontSize: '12px', color: 'var(--wb-text)', lineHeight: '1.6', marginBottom: '16px' } }, text),

        h('div', { style: { padding: '10px 12px', background: 'var(--wb-bg)', borderRadius: '6px', marginBottom: '12px' } },
          h('span', { className: 'wb-label', style: { marginBottom: '4px', display: 'block' } }, 'Current tier'),
          h('span', { className: 'wb-tier-pill', 'data-tier': tier, style: { fontSize: '9px' } }, tier.toUpperCase())
        ),

        h('div', { style: { fontSize: '11px', color: 'var(--wb-slate)', lineHeight: '1.5' } },
          h('p', { style: { marginBottom: '8px' } }, 'Tip: You can change your experience tier using the badge in the top bar. This adjusts the language and detail level without changing the layout.'),
          h('p', null, 'Your progress is saved automatically. You can also download a .praxis file at any time using the Save button.')
        )
      )
    );
  }

  window.HelpSidebar = HelpSidebar;
})();
