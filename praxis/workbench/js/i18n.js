(function() {
  'use strict';

  // Inline defaults for all English strings — ensures t() works even if XHR fails
  var strings = {
    "shell.brand": "PRAXIS",
    "shell.workbench": "Workbench",
    "shell.save": "Save .praxis",
    "shell.open": "Open",
    "shell.export": "Export",

    "tier.foundation": "FOUNDATION",
    "tier.practitioner": "PRACTITIONER",
    "tier.advanced": "ADVANCED",

    "landing.title": "Evaluation Workbench",
    "landing.subtitle": "Design a complete evaluation from scoping to final report. Nine integrated stations guide you through the full evaluation lifecycle.",
    "landing.new": "New Evaluation",
    "landing.new_desc": "Start from scratch with guided intake",
    "landing.open": "Open .praxis File",
    "landing.open_desc": "Resume from a saved evaluation package",
    "landing.quick": "Quick Mode",
    "landing.quick_desc": "Jump to a single station without a full project",
    "landing.continue": "Continue",
    "landing.last_edited": "Last edited {time} · Station {station}",

    "landing.tier_title": "Choose your experience level",
    "landing.tier_foundation": "Plain language, guided experience. Recommended if this is your first evaluation design or you want the clearest explanations.",
    "landing.tier_practitioner": "Standard M&E terminology. For evaluators familiar with DAC criteria, ToC frameworks, and mixed methods.",
    "landing.tier_advanced": "Full technical detail. Assumes familiarity with econometric methods, advanced sampling, and XLSForm structure.",

    "station.0.name": "Evaluability & Scoping",
    "station.0.desc": "Assess whether this programme can be meaningfully evaluated",
    "station.1.name": "Theory of Change",
    "station.1.desc": "Map the causal logic connecting activities to outcomes",
    "station.2.name": "Evaluation Matrix",
    "station.2.desc": "Build evaluation questions, indicators, and data sources",
    "station.3.name": "Design Advisor",
    "station.3.desc": "Select the most appropriate evaluation design",
    "station.4.name": "Sample Size",
    "station.4.desc": "Calculate sample requirements for your design",
    "station.5.name": "Instrument Builder",
    "station.5.desc": "Build data collection instruments from the matrix",
    "station.6.name": "Analysis Framework",
    "station.6.desc": "Plan your analytical approach",
    "station.7.name": "Report Builder",
    "station.7.desc": "Structure your evaluation report",
    "station.8.name": "Deck Generator",
    "station.8.desc": "Generate presentation materials",

    "staleness.warning": "Upstream data changed since this station was last saved.",
    "staleness.review": "Review changes",
    "staleness.dismiss": "Dismiss",

    "sensitivity.standard": "Standard",
    "sensitivity.sensitive": "Sensitive data — handle with care",
    "sensitivity.highly": "HIGHLY SENSITIVE — encryption recommended",

    "empty.title": "Station {n}: {name}",
    "empty.desc": "This station will be available soon.",

    "common.save_draft": "Save Draft",
    "common.continue": "Continue",
    "common.cancel": "Cancel",
    "common.back": "Back",
    "common.next": "Next"
  };
  var currentLocale = 'en';

  function loadLocale(locale) {
    try {
      var xhr = new XMLHttpRequest();
      var path = (window.PRAXIS_BASE_PATH || '') + 'lang/' + locale + '.json';
      xhr.open('GET', path, false);
      xhr.send();
      if (xhr.status === 200) {
        strings = JSON.parse(xhr.responseText);
        currentLocale = locale;
      }
    } catch (e) {
      // Synchronous XHR failed (blocked or network error) — using inline defaults
    }
  }

  function t(key, vars) {
    var str = strings[key] || key;
    if (vars) {
      Object.keys(vars).forEach(function(k) {
        str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
      });
    }
    return str;
  }

  function setLocale(locale) {
    loadLocale(locale);
  }

  function getLocale() { return currentLocale; }

  try { loadLocale('en'); } catch (e) { }

  window.PraxisI18n = { t: t, setLocale: setLocale, getLocale: getLocale };
})();
