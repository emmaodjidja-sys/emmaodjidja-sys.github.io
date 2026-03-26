(function(global) {
  'use strict';
  var SENSITIVITY_LEVELS = {
    standard: { label: 'Standard', color: 'var(--wb-sens-standard)' },
    sensitive: { label: 'Sensitive', color: 'var(--wb-sens-sensitive)' },
    highly_sensitive: { label: 'Highly Sensitive', color: 'var(--wb-sens-highly)' }
  };
  function isSensitive(context) { return context.protection.sensitivity !== 'standard'; }
  function isHighlySensitive(context) { return context.protection.sensitivity === 'highly_sensitive'; }
  function getAiPermission(context) {
    if (isHighlySensitive(context)) return false;
    return context.protection.ai_permitted;
  }
  function getSharingGuidance(context) {
    var level = context.protection.sensitivity;
    if (level === 'highly_sensitive') return 'Share only via organisational secure platform. Encrypt before transfer.';
    if (level === 'sensitive') return 'Share via encrypted channels only (Signal, encrypted email).';
    return 'Share with colleagues as needed.';
  }
  global.PraxisProtection = {
    SENSITIVITY_LEVELS: SENSITIVITY_LEVELS,
    isSensitive: isSensitive,
    isHighlySensitive: isHighlySensitive,
    getAiPermission: getAiPermission,
    getSharingGuidance: getSharingGuidance
  };
})(window);
