# Vendored library and asset versions (praxis/tools/vendor)

Copied from `praxis/workbench/vendor/` (react, react-dom, xlsx) or downloaded fresh (babel). All embedded tools (toc-builder, evaluation-design-advisor, sample-size-calculator) load these local files only; no runtime requests leave the origin.

| Asset | Version | Source | Verification |
|-------|---------|--------|---------------|
| react.production.min.js | React 18.3.1 (UMD production) | copied from workbench/vendor | byte-identical (10751 bytes) to a fresh fetch of unpkg.com/react@18.3.1/umd/react.production.min.js on 2026-07-05; unpkg.com/react@18 currently resolves to 18.3.1 |
| react-dom.production.min.js | React DOM 18.3.1 (UMD production) | copied from workbench/vendor | byte-identical (131835 bytes) to a fresh fetch of unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js on 2026-07-05 |
| xlsx.full.min.js | SheetJS Community Edition 0.18.5 | copied from workbench/vendor | byte-identical (881727 bytes) to a fresh fetch of unpkg.com/xlsx@0.18.5/dist/xlsx.full.min.js on 2026-07-05 |
| babel.min.js | @babel/standalone 8.0.3 | downloaded 2026-07-05 | unpkg.com/@babel/standalone (unpinned) currently redirects to /@babel/standalone@8.0.3/babel.min.js; confirmed via package.json version field |

## Fonts (praxis/tools/vendor/fonts)

| Asset | Version / source | Added |
|-------|------------------|-------|
| fonts/dm-sans-var.woff2 | DM Sans variable (Google Fonts CSS2 API, latin subset, wght 400-800) | copied from workbench/vendor/fonts 2026-07-05 |
| fonts/jetbrains-mono-var.woff2 | JetBrains Mono variable (Google Fonts CSS2 API, latin subset, wght 400-500 as shipped; physical font axis supports up to 800, declared as 400-700 in fonts.css to cover tool usage) | copied from workbench/vendor/fonts 2026-07-05 |
| fonts/fraunces-var.woff2 | Fraunces variable, v38 (Google Fonts CSS2 API, latin subset, opsz 9-144, wght 100-900 physical axis; declared as normal 300-700 in fonts.css to match the tools' requested range) | downloaded 2026-07-05 from fonts.gstatic.com/s/fraunces/v38/... (the URL Google Fonts CSS2 resolves for a Chrome 124 user agent) |
| fonts/poppins-{400,500,600,700}.woff2 and poppins-{...}-ext.woff2 | Poppins v24 static weights 400/500/600/700, latin + latin-ext subsets (no official variable release; OFL licensed) | downloaded 2026-07-16 from fonts.gstatic.com/s/poppins/v24/... (URLs the Google Fonts CSS2 API resolves for a Chrome UA); used by the Deck Generator slide canvas via the `--font-slide` token |

Note: none of the three tools' CSS actually applies `font-family: Fraunces` anywhere (grepped for `Fraunces` and `serif` across all three index.html files, no hits outside the removed Google Fonts `<link>`). The face is vendored anyway per spec, for exact parity with the previously requested font set and in case future work references it; it costs one local file with no runtime request.
