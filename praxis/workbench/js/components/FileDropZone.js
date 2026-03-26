(function(global) {
  'use strict';
  var h = React.createElement;
  var useState = React.useState;
  var useRef = React.useRef;
  function FileDropZone(props) {
    var ref = useRef(null);
    var active = useState(false);
    var isActive = active[0];
    var setActive = active[1];
    function handleDrop(e) {
      e.preventDefault();
      setActive(false);
      var file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith('.praxis') || file.name.endsWith('.json'))) {
        props.onFile(file);
      }
    }
    function handleClick() {
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = '.praxis,.json';
      input.onchange = function(e) {
        if (e.target.files[0]) props.onFile(e.target.files[0]);
      };
      input.click();
    }
    return h('div', {
      ref: ref,
      className: 'wb-dropzone' + (isActive ? ' active' : ''),
      onDragOver: function(e) { e.preventDefault(); setActive(true); },
      onDragLeave: function() { setActive(false); },
      onDrop: handleDrop,
      onClick: handleClick
    },
      h('p', { className: 'wb-dropzone-label' }, props.label || PraxisI18n.t('entry.dropzone'))
    );
  }
  global.PraxisFileDropZone = FileDropZone;
})(window);
