/* Station 3 <-> Evaluation Design Advisor bridge.

   The mapping tables that used to live here now live in js/design-vocab.js, whose
   enums the advisor's own source is tested against. They were the fault line:
   PURPOSE_MAP was keyed lowercase while Station 0 writes 'Outcome', so purpose never
   pre-filled at all; unit and complexity were never mapped though Station 0 collects
   both; and a value in none of the tables was forwarded unchanged to an engine that
   scores what it does not recognise as zero. This file is now only the plumbing. */
(function() {
  'use strict';

  function vocab() { return window.PraxisDesignVocab; }

  /* Back-compat shape: callers that only want the answers still get a plain object.
     Call PraxisDesignVocab.torToDesignAnswers directly for rejections and notes. */
  function torToDesignAnswers(torConstraints, projectMeta) {
    return vocab().torToDesignAnswers(torConstraints, projectMeta).answers;
  }

  function useDesignBridge(iframeRef, prefillAnswers, onExport) {
    var readyState = React.useState(false);
    var ready = readyState[0];
    var setReady = readyState[1];

    // Hold the live handler and answers in refs so the listener attaches once on
    // mount rather than being torn down and re-added on every parent render.
    var exportRef = React.useRef(onExport);
    exportRef.current = onExport;
    var answersRef = React.useRef(prefillAnswers);
    answersRef.current = prefillAnswers;

    React.useEffect(function() {
      function handleMessage(e) {
        if (e.origin !== window.location.origin) return;
        if (!e.data || !e.data.type) return;

        if (e.data.type === 'DESIGN_READY') {
          setReady(true);
          if (iframeRef.current && iframeRef.current.contentWindow && answersRef.current) {
            // Normalize on the way out. The advisor validates independently, but
            // forwarding a value we already know is unscoreable would be knowingly
            // asking for a ranking built on a parameter that counted for nothing.
            var norm = vocab().normalizeAnswers(answersRef.current);
            iframeRef.current.contentWindow.postMessage({
              type: 'PRAXIS_INIT',
              payload: { answers: norm.answers }
            }, window.location.origin);
          }
        } else if (e.data.type === 'DESIGN_EXPORT' && e.data.payload) {
          if (exportRef.current) exportRef.current(e.data.payload);
        }
      }

      window.addEventListener('message', handleMessage);
      return function() { window.removeEventListener('message', handleMessage); };
    }, [iframeRef]);

    return { ready: ready };
  }

  window.torToDesignAnswers = torToDesignAnswers;
  window.useDesignBridge = useDesignBridge;
})();
