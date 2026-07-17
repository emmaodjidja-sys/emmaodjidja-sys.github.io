(function() {
  'use strict';

  var LOCALE_KEY = 'praxis-workbench-locale';
  var SUPPORTED = { en: true, fr: true };

  // Inline English defaults. These always ship with the shell so t() resolves
  // even if the lang/*.js tables fail to load. They take precedence over
  // window.PRAXIS_LANG_EN for any shared key, so corrected copy here can never
  // be overridden by a stale language file. No em or en dashes.
  var inlineDefaults = {
    "shell.brand": "PRAXIS",
    "shell.workbench": "Workbench",
    "shell.save": "Save .praxis",
    "shell.open": "Open",
    "shell.export": "Export",
    "shell.start": "Start",
    "shell.start_hint": "Return to start page (your project stays saved)",

    "tier.foundation": "FOUNDATION",
    "tier.practitioner": "PRACTITIONER",
    "tier.advanced": "ADVANCED",

    "nav.continue": "Continue to {step}",
    "nav.back_to": "Back to {step}",
    "nav.start_at": "Start at {step}",
    "nav.save_finish": "Save and finish",
    "nav.position_station": "Station {n} of 9",
    "nav.position_cockpit": "{step}, {n} of 6",

    "cstation.0.name": "Overview",
    "cstation.1.name": "Commission",
    "cstation.2.name": "Contract",
    "cstation.3.name": "Assure",
    "cstation.4.name": "Deliver",
    "cstation.5.name": "Use",
    "cstation.6.name": "Follow-up",

    "landing.title": "Evaluation Workbench",
    "landing.subtitle": "Design a complete evaluation from scoping to final report. Nine integrated stations guide you through the full evaluation lifecycle.",
    "landing.new": "New Evaluation",
    "landing.new_desc": "Begin a new evaluation with guided intake",
    "landing.open": "Open .praxis File",
    "landing.open_desc": "Resume from a saved evaluation package",
    "landing.quick": "Single station",
    "landing.quick_desc": "Open a single station without creating a full project",
    "landing.continue": "Continue",
    "landing.last_edited": "Last edited {time} · Station {station}",

    "dropzone.cue": "Drop your file here",
    "dropzone.release": "Release to open",
    "dropzone.browse": "Browse files",
    "dropzone.accepts": "Accepts .praxis or .json, up to {mb} MB.",
    "dropzone.local": "The file opens in this browser. Nothing is uploaded.",

    "manifest.eyebrow": "Ready to open",
    "manifest.station": "Progress",
    "manifest.station_value": "Station {n} of 9, {name}",
    "manifest.station_planning": "Planning and contract",
    "manifest.station_start": "Not started",
    "manifest.questions": "Matrix",
    "manifest.questions_value": "{n} evaluation questions",
    "manifest.saved": "Last saved",
    "manifest.open": "Open this evaluation",
    "manifest.choose_another": "Choose another",
    "manifest.migrate": "Saved by version {from}. Opening brings it up to {to}.",
    "manifest.eyebrow_merge": "Ready to merge",
    "manifest.partial_generic": "Single station export",
    "manifest.partial_merge": "This is a single station export, not a whole project. Opening merges it into the project saved in this browser and leaves the other stations as they are.",
    "manifest.partial_fresh": "This is a single station export, not a whole project. There is nothing saved in this browser to merge it into, so the other stations will start empty.",
    "manifest.replaces": "Opening replaces the project currently saved in this browser. A backup is kept.",

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
    "sensitivity.sensitive": "SENSITIVE. Contains programme-sensitive data. Share only with authorised team members.",
    "sensitivity.highly": "HIGHLY SENSITIVE. Encryption recommended.",
    "sensitivity.highly_sensitive": "HIGHLY SENSITIVE. Encryption recommended. Do not share outside the core evaluation team without explicit authorisation.",

    "empty.title": "Station {n}: {name}",
    "empty.desc": "This station could not be loaded. Refresh the page to try again.",

    "common.save_draft": "Save Draft",
    "common.continue": "Continue",
    "common.cancel": "Cancel",
    "common.back": "Back",
    "common.next": "Next"
  };

  // Shallow own-key merge; later arguments win.
  function assign(target) {
    for (var i = 1; i < arguments.length; i++) {
      var src = arguments[i];
      if (!src) continue;
      for (var k in src) {
        if (Object.prototype.hasOwnProperty.call(src, k)) target[k] = src[k];
      }
    }
    return target;
  }

  // English table: the loaded union with inline defaults layered on top so
  // corrected inline copy wins. French table: the loaded translations; any
  // missing key falls back to English in t().
  var TABLES = {
    en: assign({}, window.PRAXIS_LANG_EN || {}, inlineDefaults),
    fr: assign({}, window.PRAXIS_LANG_FR || {})
  };

  function readStoredLocale() {
    try {
      var v = localStorage.getItem(LOCALE_KEY);
      if (v && SUPPORTED[v]) return v;
    } catch (e) {}
    return 'en';
  }

  var currentLocale = readStoredLocale();

  function applyDocumentLang() {
    try {
      if (document && document.documentElement) document.documentElement.lang = currentLocale;
    } catch (e) {}
  }
  applyDocumentLang();

  function t(key, vars) {
    var table = TABLES[currentLocale] || TABLES.en;
    var str = table[key];
    if (str === undefined || str === null) str = TABLES.en[key];
    if (str === undefined || str === null) str = key;
    if (vars) {
      Object.keys(vars).forEach(function(k) {
        str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
      });
    }
    return str;
  }

  // Persists the locale, updates document.documentElement.lang, and updates
  // this module's state. It does NOT force a re-render on its own; the caller
  // (TopBar) dispatches SET_LOCALE so React re-evaluates every t() call.
  function setLocale(locale) {
    if (!SUPPORTED[locale]) return currentLocale;
    currentLocale = locale;
    try { localStorage.setItem(LOCALE_KEY, locale); } catch (e) {}
    applyDocumentLang();
    return currentLocale;
  }

  function getLocale() { return currentLocale; }

  window.PraxisI18n = { t: t, setLocale: setLocale, getLocale: getLocale };
})();
