(function() {
  'use strict';
  var h = React.createElement;

  function FileDropZone(props) {
    var label = props.label || 'Drop .praxis file here or click to browse';
    var dragState = React.useState(false);
    var isDragging = dragState[0];
    var setIsDragging = dragState[1];
    var inputRef = React.useRef(null);

    function handleFile(file) {
      if (!file) return;
      PraxisUtils.readFileAsJSON(file).then(function(data) {
        if (typeof props.onFile === 'function') props.onFile(data);
      }).catch(function(err) {
        console.error('FileDropZone: failed to parse file', err);
        if (typeof props.onError === 'function') props.onError(err);
      });
    }

    function handleClick() {
      if (inputRef.current) inputRef.current.click();
    }

    function handleInputChange(e) {
      var file = e.target.files && e.target.files[0];
      handleFile(file);
      e.target.value = '';
    }

    function handleDragOver(e) {
      e.preventDefault();
      setIsDragging(true);
    }

    function handleDragLeave() { setIsDragging(false); }

    function handleDrop(e) {
      e.preventDefault();
      setIsDragging(false);
      var file = e.dataTransfer.files && e.dataTransfer.files[0];
      handleFile(file);
    }

    var borderColor = isDragging ? 'var(--teal)' : 'var(--border)';
    var bg = isDragging ? 'var(--teal-light)' : 'var(--surface)';

    return h('div', {
      className: 'wb-card',
      onClick: handleClick,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
      style: {
        border: '2px dashed ' + borderColor,
        background: bg,
        cursor: 'pointer',
        textAlign: 'center',
        padding: '32px 20px',
        transition: 'all 0.15s'
      }
    },
      h('input', {
        ref: inputRef,
        type: 'file',
        accept: '.praxis,.json',
        style: { display: 'none' },
        onChange: handleInputChange
      }),
      h('p', { style: { fontSize: '13px', color: 'var(--slate)', margin: '0 0 12px 0' } }, label),
      // Keyboard-accessible trigger for the hidden file input. The card's own
      // onClick remains a mouse convenience; stopPropagation avoids a double
      // open when the button is clicked.
      h('button', {
        type: 'button',
        className: 'wb-btn wb-btn-outline',
        onClick: function(e) { e.stopPropagation(); handleClick(); }
      }, 'Browse files')
    );
  }

  window.FileDropZone = FileDropZone;
})();
