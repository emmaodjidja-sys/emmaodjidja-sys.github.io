(function() {
  'use strict';
  var h = React.createElement;
  var t = PraxisI18n.t;

  // The .praxis document mark, drawn from assets/praxis-file.svg (the same icon
  // Windows Explorer shows on the file once the association script has run), so
  // the artifact the user drags and the target they drop it on read as one
  // object. Two things are re-tuned for this context and neither changes the
  // mark's construction:
  //   * The Explorer sheet is navy, which is invisible against the navy
  //     landing, so the sheet is re-lit: teal hairline outline over a faint
  //     teal wash.
  //   * The mark is optically sized. logo.svg's bowl spans 83% of the stem, so
  //     the P only separates from a D once the stem's tail below the bowl
  //     carries a few pixels. At the asset's own 0.31 scale that tail is ~4px
  //     here and the letter reads as a D, so the P is set at 0.40 instead.
  //     Its centre is held on the sheet by the asset's formula: the ink bbox
  //     is x 148..446, y 86..420 on logo.svg's 512 grid, centre (297, 253), so
  //     translate = (129 - 297s, 132 - 253s) lands that centre on (129, 132),
  //     a shade below the sheet's middle so the mark sits clear of the fold.
  function PraxisFileMark(props) {
    var size = props.size || 96;
    return h('svg', {
      width: size, height: size, viewBox: '0 0 256 256', fill: 'none',
      'aria-hidden': 'true', focusable: 'false',
      style: {
        display: 'block',
        transform: props.lifted ? 'translateY(-3px) scale(1.04)' : 'none',
        transition: 'transform var(--dur-base) var(--ease-out)'
      }
    },
      // Sheet, folded corner cut away at top right
      h('path', {
        d: 'M 44 12 L 164 12 L 214 62 L 214 236 A 10 10 0 0 1 204 246 ' +
           'L 54 246 A 10 10 0 0 1 44 236 L 44 22 A 10 10 0 0 1 54 12 Z',
        fill: 'rgba(46,196,182,0.07)', stroke: 'var(--teal)', strokeWidth: 7,
        strokeLinejoin: 'round', opacity: 0.75
      }),
      // The fold itself, lifted in teal so the silhouette reads as paper
      h('path', {
        d: 'M 164 12 L 214 62 L 174 62 A 10 10 0 0 1 164 52 Z',
        fill: 'var(--teal)', opacity: 0.5
      }),
      // PRAXIS P, from the asset (logo.svg mark scaled onto the sheet)
      h('g', { transform: 'translate(10.2, 30.8) scale(0.40)' },
        h('rect', { x: 148, y: 112, width: 52, height: 288, rx: 4, fill: 'var(--teal)' }),
        h('path', {
          d: 'M 200 112 L 300 112 C 370 112 420 162 420 232 C 420 302 370 352 300 352 L 200 352',
          fill: 'none', stroke: 'var(--teal)', strokeWidth: 52,
          strokeLinecap: 'round', strokeLinejoin: 'round'
        }),
        h('circle', { cx: 380, cy: 400, r: 20, fill: 'var(--teal)', opacity: 0.5 })
      )
    );
  }

  function FileDropZone(props) {
    var dragState = React.useState(false);
    var isDragging = dragState[0];
    var setIsDragging = dragState[1];
    var inputRef = React.useRef(null);
    // Depth counter for drag enter/leave. dragleave also fires when the pointer
    // crosses onto a child element, so tracking a boolean alone makes the zone
    // flicker out of its armed state as the file passes over the mark or the
    // button. Counting enters against leaves keeps the state stable.
    var depthRef = React.useRef(0);

    // Two guards that only apply while this zone is on screen.
    //
    // A file dropped anywhere the page does not cancel is handled by the
    // browser, which navigates to it: miss the zone by a few pixels and the
    // Workbench is replaced by the raw JSON of the project. Cancelling
    // dragover and drop at window level makes a near miss do nothing instead.
    //
    // The same listeners settle the armed state. The depth counter is driven
    // by the zone's own enter/leave pairs, so a drag abandoned elsewhere (or
    // ended with Escape) can leave a count standing and the zone lit with
    // nothing to receive. Any drop or dragend anywhere resets it.
    React.useEffect(function() {
      function swallow(e) { e.preventDefault(); }
      function settle(e) {
        e.preventDefault();
        depthRef.current = 0;
        setIsDragging(false);
      }
      window.addEventListener('dragover', swallow);
      window.addEventListener('drop', settle);
      window.addEventListener('dragend', settle);
      return function() {
        window.removeEventListener('dragover', swallow);
        window.removeEventListener('drop', settle);
        window.removeEventListener('dragend', settle);
      };
    }, []);

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

    function handleDragEnter(e) {
      e.preventDefault();
      depthRef.current += 1;
      setIsDragging(true);
    }

    function handleDragOver(e) {
      // Required for drop to fire at all, and sets the cursor to a copy affordance.
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    }

    function handleDragLeave() {
      depthRef.current = Math.max(0, depthRef.current - 1);
      if (depthRef.current === 0) setIsDragging(false);
    }

    function handleDrop(e) {
      e.preventDefault();
      depthRef.current = 0;
      setIsDragging(false);
      var file = e.dataTransfer.files && e.dataTransfer.files[0];
      handleFile(file);
    }

    var maxMb = Math.round(PraxisUtils.MAX_IMPORT_BYTES / (1024 * 1024));

    var zone = h('div', {
      className: 'wb-dropzone' + (isDragging ? ' wb-dropzone--armed' : ''),
      onClick: handleClick,
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop
    },
      h('input', {
        ref: inputRef,
        type: 'file',
        accept: '.praxis,.json',
        style: { display: 'none' },
        onChange: handleInputChange
      }),
      h(PraxisFileMark, { size: 96, lifted: isDragging }),
      h('p', { className: 'wb-dropzone-cue' },
        isDragging ? t('dropzone.release') : (props.label || t('dropzone.cue'))),
      // Keyboard-accessible trigger for the hidden file input. The zone's own
      // onClick remains a mouse convenience; stopPropagation avoids a double
      // open when the button is clicked.
      h('button', {
        type: 'button',
        className: 'wb-btn wb-btn-primary',
        onClick: function(e) { e.stopPropagation(); handleClick(); }
      }, t('dropzone.browse'))
    );

    return h('div', { className: 'wb-dropzone-wrap' },
      zone,
      h('p', { className: 'wb-dropzone-meta' }, t('dropzone.accepts', { mb: maxMb })),
      h('p', { className: 'wb-dropzone-meta wb-dropzone-meta--local' },
        h('span', { className: 'wb-dropzone-dot', 'aria-hidden': 'true' }),
        h('span', null, t('dropzone.local'))
      )
    );
  }

  window.FileDropZone = FileDropZone;
})();
