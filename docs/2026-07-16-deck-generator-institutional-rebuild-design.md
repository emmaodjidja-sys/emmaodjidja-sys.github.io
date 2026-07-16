# Deck Generator v2: Institutional Rebuild

Date: 2026-07-16
Status: approved (slide aesthetic confirmed by Emmanuel: monograph content slides, dark ink cover and dividers)
Supersedes the visual and content layers of `2026-04-20-deck-generator-tool-design.md`. The engine concepts from that spec (context handoff, overrides, presenter, print, JSON round-trip) survive; the surface is rebuilt.

## Problem

The live tool at `/praxis/tools/deck-generator/` fails the PRAXIS institutional standard on four counts, confirmed against the live site on 2026-07-16:

1. **Findings Brief renders no outputs.** `DEMO_CONTEXT` seeds only inception-side data. The findings deck renders raw bordered `<textarea>` elements (visible resize grips, form chrome) directly on the slide canvas, filled with coaching placeholders. They render this way in presenter mode and would print in the PDF. The worked example demonstrates nothing.
2. **Generic AI design language.** Teal rounded cards, glow shadows, giant teal numerals, light teal banner, navy header-bar slide template. Nothing shares the institutional language of the indicator bank (dark `#081221` chrome, mono microtype, engraved ink rules, tabular numerals).
3. **Glyph and dash slop.** `← Change template`, `→`, `↺`, `⇣`, `⇡`, `⎙`, `▶`, `×` buttons, and em dashes throughout copy. All banned by the workbench de-slop pass (SVG icons only, no em or en dashes anywhere).
4. **Runtime Babel.** 2.4 MB `babel.min.js` transpiles JSX on every page load, against the precompiled standard set by the indicator bank.

## Goals

Rebuild the tool page to the PRAXIS institutional standard while preserving every working contract: the Station 8 handoff, localStorage overrides, hash routing, presenter and speaker modes, print stylesheet, JSON import and export, keyboard map.

## Non-goals

No changes to the workbench itself, to Station 8, or to other tool pages. No new template types beyond Inception and Findings. No server or build-time dependency beyond Node plus the already-vendored babel-standalone used once at author time.

## Contracts preserved (must not break)

- `sessionStorage["praxis-deck-context"]`: shape written by `Station8.js handleOpenDeckTool` (project_meta, tor_constraints, evaluation_matrix, design_recommendation, sample_parameters, instruments, evaluability, toc, analysis_plan, generated_at).
- `localStorage["praxis-deck-overrides:<slug>:<template>"]` flat path-keyed override map, and `praxis-deck-template`.
- Hash routes `#/inception/N` and `#/findings/N` open presenter at slide N.
- Keyboard: P present, F fullscreen, S speaker, O overview, Esc, arrows, Home/End, `?` shortcuts, Ctrl+P print.
- Deck JSON export/import round-trip. New exports stamp `praxis_version: "deck-generator-2.0"`; import accepts 1.0 and 2.0.
- Print: A4 landscape, one slide per page, exact colors.

## Architecture

Single self-contained `index.html`, same as the indicator bank:

- `<script defer>` vendored React and ReactDOM only. No Babel at runtime.
- Authored as JSX in `praxis/tools/deck-generator/src/deck.jsx`, compiled to `React.createElement` output by `praxis/tools/deck-generator/src/build.js` (Node script that loads the vendored `babel-standalone` and inlines the compiled bundle into `index.html` between build markers). Source and build script are committed so future edits never require decompiling.
- CSP meta identical to the indicator bank: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; base-uri 'self'`.
- Design tokens copied from the indicator bank `:root` block (chrome, ink, teal-ink, amber, border, mono/display font stacks) plus a slide-only paper token set.
- The compiled IIFE exposes `window.__DECK_TEST__` with `buildInceptionSlides`, `buildFindingsSlides`, `DEMO_CONTEXT`, `DEMO_FINDINGS`, `migrateImport` for the Node test.

## App shell (dark institutional chrome)

- Topbar: identical idiom to the indicator bank. `PRAXIS` mono wordmark in teal, brand rule, page name "Deck Generator", right-side mono uppercase links (Workbench, Toolkit). Sticky, `#081221`.
- Home screen (replaces the picker): masthead with mono eyebrow, Fraunces title (the programme name), subtitle; a **provenance ledger** strip (2px ink top rule, mono uppercase segments): source (Workbench handoff / Sample programme / Manual setup), organisation, EQ count, criteria count, generated date. The teal demo banner is gone; sample provenance lives in the ledger with a plain link to the Workbench.
- Two deck cards drawn as dossier entries: hairline border, 2px radius, mono badge (PRE-FIELDWORK / POST-FIELDWORK), Fraunces deck name, description, mono meta row (slide count, criteria count), SVG arrow-right icon. Plus the "start from scratch" entry and the setup form, restyled to the same idiom.
- Editor toolbar: sticky light sub-bar under the chrome. Left: deck name label and a "Switch deck" button (SVG swap icon). Right: Reset edits, Import, Export, PDF, Shortcuts, Present (ink primary button). Every icon inline SVG; zero unicode glyph buttons.

## Slide design system (the monograph)

Canvas stays 1280x720, scaled in editor and presenter.

**Content slides: paper.** Background `#FBFAF8` (warm report stock; prints white). Anatomy:

- Eyebrow row: mono 11px uppercase, tracking 0.16em, teal-ink: `04 / EFFECTIVENESS` left, `PRAXIS` wordmark right.
- Full-width 2px ink rule under the eyebrow (the engraved ledger line).
- Headline: Fraunces 600, 34 to 38px, ink `#0B1A2E`. Statement headlines where the content permits ("Facility deliveries rose 11.4 points against matched controls"), label headlines elsewhere.
- Body: DM Sans 15px on `--text-2`; panels are hairline-bordered, 2px radius, no shadows, no glow; tables are open ledger rows (1px separators, 2px ink header rule, tabular numerals).
- Footer: 1px rule; mono 10px, programme left, `06 / 15` tabular right.

**Cover, section dividers, Q&A: ink.** Background `#081221`, chrome text, teal mono eyebrow, Fraunces 52 to 56px, short teal rule. A single engraving motif: faint concentric arcs (white at 4 to 6 percent alpha) echoing the entry-page instrument dial, top right, drawn once as SVG. No other ornament.

**Color roles.** Ink for structure and text. Teal `#0F766E` reserved for data marks, active states, the eyebrow. Amber only for caution content (limitations, weak ratings, risks). Red only for poor ratings. Never decorative.

## Data visuals (inline SVG, no libraries)

1. **Effect-size interval plot**: horizontal estimates with 95 percent CI whiskers against a zero line; teal marks when the CI excludes zero, amber otherwise; mono value labels. Used on the effectiveness criterion slide and in miniature on Headline Findings.
2. **Sample achievement bars**: planned (hairline outline) vs achieved (ink fill) pairs with mono percent labels. Methodology recap slide.
3. **Criterion rating scale**: four small squares per criterion, filled to the rating, colored by band (teal strong, ink satisfactory, amber weak, red poor), mono band label. Drives the new Performance Summary slide and repeats on each criterion slide.
4. **Evidence strength chip**: small square plus mono STRONG / MODERATE / LIMITED.
5. Existing ToC tree, evaluability radar, and Gantt restyled to ink and paper (engraved boxes, ink axes, teal fills; no gradients).

## Template slide lists

Inception keeps its 16 slides, restyled. Findings becomes:

1. Cover (ink)
2. Agenda
3. Programme recap
4. Methodology and sample (achievement bars)
5. **Performance summary** (new: every criterion rated on one ledger slide; the money slide)
6. Headline findings (three statements with evidence chips and the miniature interval plot; no giant numerals)
7..N One slide per criterion (rating, EQs, key findings, supporting evidence, evidence chip)
- Cross-cutting findings
- Evidence quality and limitations
- Recommendations (ledger table: recommendation, priority, owner, timeline)
- Lessons and next steps
- Q&A (ink)

## Worked example (fixes the empty findings brief)

New `DEMO_FINDINGS` block, joined to `DEMO_CONTEXT` only when the context is the sample (never invented for a real handoff). Internally consistent Niger numbers:

- Facility-based deliveries: +11.4 pp, 95 percent CI 6.2 to 16.6, DiD vs matched districts. ANC4+ coverage: +9.1 pp, CI 3.8 to 14.4.
- Referral completion 38 to 47 percent, median transfer time unchanged at 3.1 hours (rating: moderate).
- Institutional MMR fell but the DiD estimate is not significant (CI crosses zero, shown amber): impact rated moderate.
- Achieved samples: quant 1,714 of 1,842 (93.1 percent), qual 76 of 80 (95 percent).
- Ratings: relevance strong, effectiveness strong, efficiency moderate, impact moderate, sustainability weak.
- Four seeded recommendations with priority, owner, timeline; evidence strengths and limitations; cross-cutting and lessons text.

Every criterion in the sample matrix gets key findings and evidence text that cites these same numbers. Nothing anywhere contradicts anything else.

## Editing model (kills form chrome on the canvas)

`EditableText` reads an edit/present mode flag from React context:

- **Edit mode**: renders final typography; hover shows a 1px dashed teal outline; click swaps in a metrics-matched transparent textarea or input; blur commits to the override store (unchanged semantics).
- **Present and print**: renders a plain element. No borders, grips, placeholders, or focus chrome can appear on a presented or printed slide.
- Empty values in present mode collapse (render nothing) instead of showing prompts. Guidance for empty workbench-fed slides renders as editor-only annotations outside the canvas.

## Copy and de-slop rules

No em dashes or en dashes anywhere (copy, code strings, seeded data; use periods, commas, parentheses). No unicode arrows, geometric glyphs, or emoji in UI: all icons inline SVG following the indicator bank set. Institutional tone throughout. The Node test greps the compiled bundle for banned characters so regressions fail the build.

## Testing

`praxis/tools/deck-generator/tests/deck.test.js`, Node only, vm-sandbox pattern from `praxis/workbench/tests/helpers.js`: loads vendored React and the compiled bundle, then asserts:

- Findings slide registry: 11 fixed plus one per distinct criterion, correct order, Performance Summary present.
- Demo consistency: achieved lte planned; every CI contains its estimate; every matrix criterion has ratings, key findings, evidence.
- Import migration: a v1.0 deck JSON loads.
- Slop guard: compiled bundle contains no em dash, en dash, or banned glyph characters.

## Verification before "done"

Local: serve, headless Chrome screenshots (home, editor both decks, presenter cover, performance summary, headline findings, criterion slide, print emulation), console-error-to-title trick showing zero errors. Then commit, push, verify the deployed URL headlessly again before reporting. Per feedback-verify-before-telling.
