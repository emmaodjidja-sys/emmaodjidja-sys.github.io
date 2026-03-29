(function() {
  'use strict';
  var h = React.createElement;

  /**
   * TocBridge — Custom hook for bidirectional communication between
   * the PRAXIS Workbench and the embedded ToC Builder iframe.
   *
   * Protocol:
   *   iframe  -> parent : TOC_READY   (iframe has loaded, requests data)
   *   parent  -> iframe : PRAXIS_INIT (sends current toc data into builder)
   *   iframe  -> parent : TOC_EXPORT  (user clicked export inside builder)
   *   iframe  -> parent : TOC_CHANGE  (real-time incremental sync)
   */
  function useTocBridge(iframeRef, tocData, onExport, onChange) {
    var readyRef = React.useRef(false);
    var rs = React.useState(false);
    var ready = rs[0];
    var setReady = rs[1];

    // Stable callback refs so the effect doesn't re-register on every render
    var onExportRef = React.useRef(onExport);
    var onChangeRef = React.useRef(onChange);
    React.useEffect(function() { onExportRef.current = onExport; }, [onExport]);
    React.useEffect(function() { onChangeRef.current = onChange; }, [onChange]);

    React.useEffect(function() {
      function handleMessage(e) {
        if (!e.data || typeof e.data.type !== 'string') return;

        // Only accept messages from our iframe origin
        if (iframeRef.current) {
          try {
            var iframeOrigin = new URL(iframeRef.current.src, window.location.origin).origin;
            if (e.origin !== iframeOrigin) return;
          } catch (_) {
            // If URL parsing fails, fall through (same-origin iframe)
          }
        }

        switch (e.data.type) {
          case 'TOC_READY':
            readyRef.current = true;
            setReady(true);
            // Push current data into the iframe
            if (iframeRef.current && tocData) {
              iframeRef.current.contentWindow.postMessage({
                type: 'PRAXIS_INIT',
                payload: tocData
              }, '*');
            }
            break;

          case 'TOC_EXPORT':
            if (e.data.payload && onExportRef.current) {
              onExportRef.current(e.data.payload);
            }
            break;

          case 'TOC_CHANGE':
            if (e.data.payload && onChangeRef.current) {
              onChangeRef.current(e.data.payload);
            }
            break;
        }
      }

      window.addEventListener('message', handleMessage);
      return function() {
        window.removeEventListener('message', handleMessage);
        readyRef.current = false;
      };
    }, [tocData]); // re-register when tocData ref changes so PRAXIS_INIT sends fresh data

    var sendInit = React.useCallback(function() {
      if (iframeRef.current && readyRef.current && tocData) {
        iframeRef.current.contentWindow.postMessage({
          type: 'PRAXIS_INIT',
          payload: tocData
        }, '*');
      }
    }, [tocData]);

    return { ready: ready, sendInit: sendInit };
  }

  window.useTocBridge = useTocBridge;
})();
