(function() {
  'use strict';

  var SENSITIVITY_LEVELS = [
    { id: 'standard', label: 'Standard', desc: 'No special handling required' },
    { id: 'sensitive', label: 'Sensitive', desc: 'Contains personal or programme-sensitive data' },
    { id: 'highly_sensitive', label: 'Highly Sensitive', desc: 'Contains protection-critical or conflict-sensitive data' }
  ];

  function isSensitive(context) {
    return context.protection.sensitivity !== 'standard';
  }

  function isHighlySensitive(context) {
    return context.protection.sensitivity === 'highly_sensitive';
  }

  function getAiPermission(context) {
    return context.protection.ai_permitted;
  }

  function getSharingGuidance(context) {
    var level = context.protection.sensitivity;
    if (level === 'standard') return '';
    if (level === 'sensitive') return 'This file contains sensitive programme data. Share only with authorised evaluation team members.';
    return 'HIGHLY SENSITIVE. Encryption recommended for storage and transmission. Do not share outside the core evaluation team without explicit authorisation.';
  }

  window.PraxisProtection = {
    SENSITIVITY_LEVELS: SENSITIVITY_LEVELS,
    isSensitive: isSensitive,
    isHighlySensitive: isHighlySensitive,
    getAiPermission: getAiPermission,
    getSharingGuidance: getSharingGuidance
  };
})();
