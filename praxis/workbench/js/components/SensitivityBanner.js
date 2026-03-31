(function() {
  'use strict';
  var h = React.createElement;

  function SensitivityBanner(props) {
    var context = props.context || {};

    if (!context.protection) return null;
    if (!PraxisProtection.isSensitive(context)) return null;

    var isHighly = PraxisProtection.isHighlySensitive(context);
    var modifier = isHighly ? '--highly' : '--sensitive';
    var className = 'wb-sensitivity-banner wb-sensitivity-banner' + modifier;

    var i18nKey = isHighly ? 'sensitivity.highly_sensitive' : 'sensitivity.sensitive';
    var text = PraxisI18n.t(i18nKey);
    if (text === i18nKey) {
      text = isHighly
        ? 'HIGHLY SENSITIVE — Encryption recommended. Do not share outside core evaluation team without explicit authorisation.'
        : 'SENSITIVE — Contains programme-sensitive data. Share only with authorised team members.';
    }

    return h('div', { className: className },
      h('span', { style: { display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: isHighly ? '#EF4444' : '#F59E0B', flexShrink: 0 } }),
      h('span', null, text)
    );
  }

  window.SensitivityBanner = SensitivityBanner;
})();
