---
date: 2026-06-03
status: shipped
type: positioning reframe
scope: copy + IA only (no new product surfaces)
---

# PRAXIS positioning reframe: causal inference as the methodology layer

## Decision

PRAXIS is no longer positioned around its two surface tracks (program evaluation and conflict early warning) as if they were peers. It is positioned around the discipline that runs underneath both: causal inference for applied evaluation.

PRAXIS remains the product brand. Causal inference is the methodology layer, expressed in plain language for a public, mixed audience.

## Audience

Public-facing, mixed. Donor and practitioner M&E (USAID, Global Fund, GIZ, MEAL officers, consultants), with secondary visibility to methodologist peers (J-PAL, IPA-adjacent, eval academics).

The rigor shows in how every surface is described, not in jargon. The headline does not say "estimand" or "identification strategy". The tool descriptions do.

## Through-line

> An open methodology lab. Two applied tracks built on the same discipline. Defensible answers to what changed, what worked, and what predicts what.

The two tracks are restated as applications of the same method, not separate products:

- Track 01 . Program Evaluation . Workbench, indicator bank, design advisor, supporting tools.
- Track 02 . Conflict Intelligence . TREMOR. Co-occurrence as a treatment, escalation as the outcome.

## Headline lexicon (public-facing, no jargon)

Permitted: causal inference, evidence, defensible claims, identification, what changed, what worked, what predicts what, methodology, causal chain.

Avoided: estimand, DAG, identification strategy as headline copy (but allowed in tool body descriptions), counterfactual, treatment effect heterogeneity. Avoided everywhere: em dash, en dash, "innovative", "transformative", "revolutionary", first-person quotes.

## Surfaces changed

| Surface | File | Change |
|---------|------|--------|
| Landing | praxis/index.html | New hero, new "Two Tracks, One Discipline" section, reframed research teaser overline + body, reframed tools section, reframed credentials, reframed vision, killed practitioner quote in footer, fixed "before it satisfies" typo. |
| Program Evaluation | praxis/evaluation/index.html | New hero, killed "I spent years looking" quote, killed first-person "I kept running into the same problem", added methodology-layer right-side block, fixed en-dash, updated 360 "Coming 2026" badge to "Now Live", updated workbench tools section overline + h2. |
| Tools hub | praxis/tools/index.html | New hero h1 "From indicators to evidence.", reframed hero desc, reframed section title, updated meta tags. |
| 360 | praxis/360/index.html | Reframed hero body to "Causal claims require one unbroken chain...", reframed paradigm-shift heading. Preserves in-progress launch-banner cleanup. |
| TREMOR / EWS | praxis/ews/index.html | New eyebrow (Track 02 . Conflict Intelligence), reframed hero lede to position TREMOR as the conflict track of the lab. |
| Research | praxis/research/index.html | Unchanged. The research page is the destination for "Read the Methodology" CTAs. Its existing voice is already academic and method-led; no reframe needed. |
| Workbench | praxis/workbench/ | Unchanged. Internal tool, not the place for positioning copy. |

## What stayed the same

- Visual design system (navy/teal, Fraunces/Inter/JetBrains Mono).
- IA. No new top-level sections beyond the one "Two Tracks" section on the landing.
- All tools, all stations, all research content.
- The "8.8x co-occurrence" research finding remains the headline empirical artifact, now framed as the lab's clearest published case of the method, not as the lab's identity.

## What was killed

- "Built by a practitioner, not a product team." (landing footer quote, flagged by expert panel)
- "I spent years looking for evaluation tools built by someone who had actually run an evaluation in a conflict zone." (evaluation page quote, expert panel critique)
- "I kept running into the same problem." (evaluation page first-person voice)
- "Predicting violence before it satisfies." (landing hero, included a typo that has now disappeared in the reframe)
- "Coming 2026" badge on the 360 cross-link (360 is live).
- One en-dash in evaluation page tools section ("13&ndash;16 findings slides" -> "13 to 16 findings slides").

## Verification

Local server walk of all six touched URLs returned 200. Grep audits confirmed:
- All killed strings: 0 hits on served pages.
- All new positioning strings: present.
- Em dashes / en dashes in user-visible body content of all touched pages: 0.

## What this does not do

This is a positioning-only reframe. It does not:
- Add a /methodology section or any new product surface.
- Tag indicators by what causal claim they support (would be product work).
- Add a DAG picker or identification-strategy widget to the Workbench (would be product work).
- Restructure the navigation. (Nav stays as is. The Two Tracks framing is asserted in body copy, not by renaming nav links.)

These remain possible follow-ups if the positioning reframe lands well with the public audience.
