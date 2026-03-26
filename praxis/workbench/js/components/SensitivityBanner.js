(function(global) {
  'use strict';
  var h = React.createElement;
  function SensitivityBanner(props) {
    var ctx = props.context;
    if (!PraxisProtection.isSensitive(ctx)) return null;
    var isHighly = PraxisProtection.isHighlySensitive(ctx);
    var cls = 'wb-sens-banner ' + (isHighly ? 'wb-sens-banner-highly' : 'wb-sens-banner-sensitive');
    var key = isHighly ? 'sensitivity.banner.highly' : 'sensitivity.banner.sensitive';
    return h('div', { className: cls }, PraxisI18n.t(key));
  }
  global.PraxisSensitivityBanner = SensitivityBanner;
})(window);
