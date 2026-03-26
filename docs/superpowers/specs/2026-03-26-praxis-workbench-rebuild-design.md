# PRAXIS Workbench — Rebuild Design Spec

**Date:** 2026-03-26
**Author:** Emmanuel Nene Odjidja + Claude
**Status:** Design complete, pending implementation plan
**Companion mockups:** `deploy-site/.superpowers/brainstorm/2077-1774557242/`

---

## 1. Context and Motivation

The PRAXIS Workbench is a 9-station evaluation design tool that guides practitioners through the full evaluation lifecycle — from evaluability scoping to final reporting. It integrates five existing PRAXIS tools (ToC Builder, Evaluation Matrix Builder, Design Advisor, Sample Size Calculator, Data Explorer) into a shared context that flows between stations.

The first implementation was scrapped because it was rushed, produced generic-looking UI ("combined forms"), skipped cross-cutting systems (Learning Layer, Review Layer, Protection Framework), and did not follow the architecture spec section by section. This rebuild starts from validated visual designs and follows a design-first approach.

### Reference documents
- **Architecture blueprint:** `docs/workbench-architecture-blueprint.md` (826 lines, still valid — tech stack, schema contract, file tree, data flow, integration strategy, build sequence)
- **Website redesign spec:** `docs/praxis-website-redesign-spec.md`
- **Existing tools:** `praxis/tools/` (ToC Builder, Eval Matrix Builder, Design Advisor, Sample Size Calculator, Indicator Bank, Data Explorer)

### What this spec adds
The architecture blueprint defines *what* to build. This spec defines *how it should look, feel, and behave* — the visual identity, interaction patterns, and UX decisions that the blueprint left open.

---

## 2. Design Principles

These emerged from the brainstorming process and govern all implementation decisions:

### 2.1 Institutional grade, not demo quality
The audience is top-class practitioners — evaluators, government M&E officers, IPDET participants, UN agency staff. Every screen must look like it belongs next to Microsoft AI for Good Lab or Bloomberg Terminal, not a student project or a generic SaaS dashboard.

### 2.2 Preference, not rank
The Experience Tier system (Foundation / Practitioner / Advanced) is a language preference, not a difficulty level. A Foundation-tier user at a national NGO and an Advanced-tier user at a UN agency are both professionals doing serious work. The tier selector is a subtle pill in the top bar. Layout is structurally identical across tiers. Content density and terminology change; chrome does not.

### 2.3 The table IS the deliverable
The evaluation matrix (Station 2) and instruments (Station 5) produce professional artifacts that drop directly into inception reports and ToR annexes. What the user sees on screen is what exports. If it needs reformatting after export, the design has failed.

### 2.4 The tool that makes users smarter
Features like the XLSForm preview, structured judgement criteria templates, and AI-suggested evaluation questions don't just save time — they teach methodology. A Foundation user who spends a month with this tool should understand evaluation design better than when they started.

### 2.5 Honest boundaries
Where the tool chooses not to implement something (e.g., skip logic), it says so clearly and explains why. A well-framed boundary builds more trust than a half-built feature.

---

## 3. Visual Identity: Hybrid Authority

### 3.1 Core pattern
Dark compact rail (48px, navy #0a1525) + white content panels. The dark rail provides gravitas and navigation clarity. The white content area keeps forms and data tables highly readable. A collapsed context drawer (44px) on the right provides access to the full .praxis JSON tree.

### 3.2 Design tokens (extending existing PRAXIS palette)

**Inherited from existing tools (must match exactly):**
- `--navy: #0B1A2E` — primary brand, top bar, badges
- `--teal: #2EC4B6` — accent, active states, PRAXIS brand
- `--teal-dark: #1a9e92` — hover states
- `--bg: #F1F5F9` — page background
- `--surface: #FFFFFF` — card/panel background
- `--border: #E2E8F0` — borders, dividers
- `--text: #0F172A` — primary text
- `--slate: #64748B` — secondary text, labels

**Workbench additions:**
- `--wb-rail-bg: #0a1525` — rail background (darker than navy)
- `--wb-rail-width: 48px` (overrides blueprint's 64px — validated in mockups as more compact and proportional)
- `--wb-topbar-height: 44px` (overrides blueprint's 48px — validated in mockups)
- `--wb-drawer-width: 44px` (collapsed), `320px` (expanded)
- Tier tokens: `--tier-foundation: #10B981`, `--tier-practitioner: #3B82F6`, `--tier-advanced: #8B5CF6`
- Staleness: `--stale-color: #F59E0B`
- Sensitivity: `--sens-sensitive-bg: #FEF3C7`, `--sens-highly-bg: #FEE2E2`
- Selection/editing: `--edit-color: #3B82F6`, `--edit-bg: #EFF6FF`

**Typography:** DM Sans (400/500/600/700) from Google Fonts. Monospace: JetBrains Mono for XLSForm previews and code-like content.

### 3.3 Component conventions
- All workbench CSS classes prefixed with `.wb-` to avoid conflict with embedded tools
- Border radius: 6px for inputs/small elements, 8-10px for cards/panels, 12px for modals
- Shadows: minimal — `0 2px 8px rgba(11,26,46,0.08)` for floating elements only
- Labels: 9-11px, uppercase, letter-spacing 0.04-0.08em, `--slate` color
- Active/selected state: navy background with white text (badges, pills, selected rows)
- Hover: subtle background shift (`#FAFBFC`) on table rows, teal border on interactive cards

### 3.4 Rail states
Each station button in the rail has four possible states:
- **Locked/Upcoming:** Muted text (`#334155-#475569`), no background, reduced opacity. Not clickable in appearance but navigable.
- **Active:** Teal background glow (`rgba(46,196,182,0.12)`), teal left border (2px), teal text. This is the current station.
- **Completed:** Muted text with a small green checkmark badge (10×10px) at top-right of the button.
- **Stale:** Amber dot (6px) at top-right, indicating upstream data changed since this station was last saved.

---

## 4. Entry Experience: Full Landing Page

### 4.1 Layout
Full-page dark landing that replaces the shell entirely on first load. This is a full-page replacement component (not a modal overlay on top of the shell). The blueprint file tree places this at `shell/EntryModal.js` but the component renders *instead of* the Shell, not on top of it. When the user selects an entry mode, the full landing unmounts and the Shell mounts. Two-panel layout:
- **Left (55%):** PRAXIS logo + "Evaluation Workbench" title, introductory text, preview of all 9 station names with numbers (fading from visible to muted, showing the journey ahead).
- **Right (45%):** Action cards on dark background.

### 4.2 Entry modes
Four action cards:
1. **New Evaluation** — initializes blank .praxis context, navigates to Station 0 Phase 1
2. **Open .praxis File** — file picker / drag-and-drop, deserializes JSON into state, navigates to last active station
3. **Quick Mode** — dropdown to select a single station (0-8), enters without a full project context
4. **Continue** (shown only when localStorage has a saved context) — dashed border card showing project name, last edit time, last active station. Green dot indicator. "Continue →" link.

### 4.3 Experience tier selection
On "New Evaluation," the user selects their tier before entering Station 0. Presented as three cards:
- **Foundation:** "Plain language, guided experience. Recommended if this is your first evaluation design or you want the clearest explanations."
- **Practitioner:** "Standard M&E terminology. For evaluators familiar with DAC criteria, ToC frameworks, and mixed methods."
- **Advanced:** "Full technical detail. Assumes familiarity with econometric methods, advanced sampling, and XLSForm structure."

The tier is changeable at any time via the top bar pill. Changing tier does not lose data — only language and field visibility change.

---

## 5. Shell Layout

### 5.1 Top bar (44px)
Navy background (`#081420`). Left to right:
- PRAXIS logo (SVG, 18px) + "PRAXIS" brand text (teal, 10px, letter-spacing 0.1em)
- Separator dot (muted)
- Project title (editable inline, `#94A3B8`, 11px)
- Spacer
- Experience tier pill (e.g., "FOUNDATION" in green on dark green background)
- Save .praxis button
- Sensitivity badge (shown only when protection.sensitivity ≠ 'standard')

### 5.2 Station rail (48px)
Left-side vertical navigation. Navy background (`#0a1525`). Contains 9 station buttons (32×32px, border-radius 6px) with states as defined in §3.4. Station numbers rendered as text, not icons — numbers are universally understood and convey sequence. Overflow: Help and Settings icons at the bottom of the rail.

### 5.3 Content panel
White background, full remaining width. Contains:
- Station header: `STATION N` label (teal, 10px, uppercase) + station title (navy, 15-16px, bold) + description (slate, 11px)
- Upstream context badges (pill-shaped, `#F1F5F9` background, 9px text)
- Station-specific content below

### 5.4 Context drawer (collapsed 44px / expanded 320px)
Right-side panel. Collapsed state shows a `{ }` icon button. Expanded state shows:
- Project meta summary
- Collapsible sections for each populated context field
- Staleness tree visualization
- Export .praxis button

---

## 6. Station 0: Evaluability & Scoping

### 6.1 Structure: Three assessment phases
Station 0 is a structured intake assessment, not a creative workspace. It maps to three cognitive tasks:

**Phase 1 — "Programme Details" (Recall & Description)**
The user describes the programme from memory or documents.

**Phase 2 — "Terms of Reference" (Document Analysis)**
The user extracts evaluation constraints from the ToR.

**Phase 3 — "Evaluability Assessment" (Professional Judgment)**
Auto-scored evaluability with override capability.

### 6.2 Phase indicator bar
Segmented bar (not a stepper with dots). Three segments, each showing phase name and number. States:
- **Current:** Navy background, teal number circle, white text
- **Completed:** Green background, green checkmark circle, green text. Clickable to review.
- **Upcoming:** Grey background (`#F1F5F9`), grey bordered circle with grey number, muted text. Not clickable in appearance.

The visual language for completed/current/upcoming must be consistent across all three phases.

### 6.3 Phase 1: Programme Details

**Guidance banner:** Compact, single-line, dismissible with × and "Don't show again." Stores dismissal preference in localStorage. Text: "Basic programme details to shape which evaluation approaches and indicators are relevant."

**Fields (2-column grid):**
- Programme Name (text input)
- Organisation (text input)
- Sector (multi-select pill chips with checkmarks on selected items, "Select all that apply — most programmes span multiple sectors." Cap visible pills at ~8 most common sectors. If 4+ selected, surface gentle analytical prompt: "Programmes spanning many sectors may benefit from narrowing the primary focus for evaluation design.")
- Country / Region (text input)
- Budget Range (3-option card selector: Low <$200K / Medium $200K-$1M / High >$1M. Inline helper: "Often not in the ToR — skip if unknown")
- Operating Context (3-option card selector: Stable / Fragile / Humanitarian. Selected state: amber border for Fragile, red for Humanitarian)
- Programme Maturity (3-option card selector: Pilot / Scaling / Mature)
- Timeline (3-option card selector: Short <6mo / Medium 6-12mo / Long >12mo)

**Inline field helpers:** Specific to fields most likely to be unknown (Budget, Comparison). Not a blanket "leave blank if unknown" banner.

**Bottom bar:** "Phase 1 of 3 · Programme Details" on left. "Save Draft" and "Review & Continue →" buttons on right.

### 6.4 Phase transition: Review card
After each phase, a review card summarizes what was entered:
- Green checkmark header: "Phase 1 Complete — Programme Details"
- Data grid (3-column) showing all entered values
- **Unspecified fields as invitation:** "Not yet specified ← Add" (teal link back to edit), not "Not specified" as reprimand
- **Early signal box** (amber): Analytical insight connecting Phase 1 inputs to evaluation implications. Example: "Fragile context with a scaling programme across three countries. Experimental designs (RCTs) will face feasibility constraints."
- Action buttons: "← Edit Phase 1" and "Begin Phase 2: Terms of Reference →"

Must handle long programme names (tested with "USAID Resilience and Food Security Activity in the Lake Chad Basin Region"). Programme name gets its own full-width row. Review card width: 600px.

### 6.5 Phase 2: Terms of Reference
Fields from `tor_constraints` schema:
- Raw ToR text (large textarea, optional — "Paste your Terms of Reference here if you have one")
- Evaluation purpose (multi-select from Design Advisor's QUESTIONS[0].options)
- Causal inference level (3-option: Attribution / Contribution / Description)
- Comparison feasibility (4-option: Randomisable / Natural / Threshold / None)
- Data availability (4-option: Baseline+Endline / Timeseries / Routine only / Minimal)
- Unit of intervention (3-option: Individual / Cluster / System)
- Programme complexity (3-option: Simple / Complicated / Complex)
- Geographic scope (text)
- Target population (text)
- Evaluation questions from ToR (list of free-text fields, "+ Add question")

Same phase indicator, review card, and bottom bar pattern as Phase 1.

### 6.6 Phase 3: Evaluability Assessment

**Score display:** Large centered number (48px bold), "out of 100" label, qualitative band label with color coding:
- 80-100: "Highly evaluable" (green)
- 60-79: "Evaluable with constraints" (amber)
- 40-59: "Challenging to evaluate" (amber-red)
- 0-39: "Significant evaluability concerns" (red)

**Score breakdown: Expandable accordion rows.** Five dimensions:
1. Data Availability (25 points)
2. Theory of Change Clarity (20 points)
3. Timeline Adequacy (20 points)
4. Operating Context (15 points)
5. Comparison Feasibility (20 points)

Each row shows: dimension name, progress bar (color-coded: green >75%, amber 50-75%, red <50%), score as "N/M".

**Schema note:** The blueprint's `evaluability` schema uses flat fields (`data_readiness`, `toc_clarity`, `stakeholder_access`, `timeline_adequate`) with qualitative enums. This spec's five numeric dimensions replace that structure. The `evaluability` schema field should be extended to:
```
"evaluability": {
  "score": 68,
  "dimensions": [
    {"id": "data", "label": "Data Availability", "max": 25, "system_score": 15, "adjusted_score": null, "justification": null},
    {"id": "toc", "label": "ToC Clarity", "max": 20, "system_score": 18, "adjusted_score": null, "justification": null},
    {"id": "timeline", "label": "Timeline Adequacy", "max": 20, "system_score": 15, "adjusted_score": null, "justification": null},
    {"id": "context", "label": "Operating Context", "max": 15, "system_score": 10, "adjusted_score": null, "justification": null},
    {"id": "comparison", "label": "Comparison Feasibility", "max": 20, "system_score": 10, "adjusted_score": 16, "justification": "Natural experiment: 2/3 provinces received intervention in Phase 1"}
  ],
  "blockers": [],
  "recommendations": [],
  "completed_at": null
}
```
This supports both the numeric scoring and the professional override audit trail. `stakeholder_access` from the blueprint schema is absorbed into the scoring rubric (affects Data and Context dimensions) rather than being a standalone field.

**Expanded row shows:**
- "What drove this score" — plain language explanation referencing the user's actual inputs (e.g., "You selected 'natural comparison' for comparison feasibility in a fragile operating context across 3 countries.")
- "What would improve it" — actionable guidance
- **Professional judgment override:** "Adjust this score" panel with:
  - System score persisted: "System: 10/20"
  - Adjusted score input field
  - Justification text field (required when overriding)
  - The delta is always visible: "System: 10/20 → Your assessment: 16/20"

**Override audit trail:** Banner below the score breakdown: "1 score adjusted by evaluator. Original auto-score: 62. Adjusted total: 68." This is a differentiating feature for institutional contexts where evaluation findings get audited.

**Constraints box** (amber): Identified constraints from the scoring logic.

**Recommendations box** (green): Actionable recommendations. Placed ABOVE the "Save & Proceed" button — users must scroll past recommendations before reaching the action. Recommendations should reference overrides when relevant (e.g., "The natural experiment opportunity strengthens the case for contribution analysis").

**Bottom actions:** "← Review Phases" and "Save & Proceed to Station 1 →"

---

## 7. Station 1: Theory of Change (Integration)

### 7.1 Pattern: Embedded tool with bridge
The ToC Builder is a complex canvas tool. Rewriting it is unnecessary and risky. It is embedded via iframe in a full-page overlay modal (`position:fixed, inset:0, z-index:200`) to preserve the tool's layout expectations.

### 7.2 Landing view
If `context.toc.nodes.length > 0`: Summary of existing ToC (node count, level breakdown) with "Edit in ToC Builder" button and "Use Inline Editor" button.

If empty: "Build your Theory of Change" CTA with two options:
- **Guided Builder** (Foundation default): Lightweight inline editor — structured text fields for goal, outcomes, outputs, activities, system assumptions. Produces the same schema as the full ToC Builder.
- **Full Canvas**: Opens the ToC Builder in the iframe overlay.

### 7.3 Bridge mechanism
Small addition to `toc-builder/index.html` (~25 lines):
- `window.addEventListener('message', handler)` accepting `PRAXIS_INIT` to hydrate state
- `postMessage` emit on export: `{type: 'TOC_EXPORT', payload: exportJSON()}`
- "Save to Workbench" button visible only when `window.self !== window.top`
- `TOC_READY` handshake before sending initial data

### 7.4 Context badges
Upstream: Project meta from Station 0.
Downstream: "This Theory of Change feeds into Station 2 (Evaluation Matrix) and Station 3 (Design Advisor)."

---

## 8. Station 2: Evaluation Matrix (The Spine)

### 8.1 Default view: Table
The evaluation matrix is the single most recognizable artifact in the evaluation profession. The table is home.

**Columns (all required for export-readiness):**
1. `#` — EQ number (32px)
2. Criterion — DAC criterion badge (navy pill, 70px)
3. Evaluation Question — full text (flexible width, min 180px)
4. Indicators — tag pills with source badges (130px)
5. Data Sources — truncated text (110px), full on hover tooltip
6. Judgement Criteria — truncated text (120px), full on hover tooltip

**Toolbar:**
- View toggle: Table (default) / Cards
- Criterion filters: All (N), Relevance, Coherence, Effectiveness, Efficiency, Impact, Sustainability
- **Coverage gap nudge:** "2 criteria not yet covered" badge near + Add EQ button when DAC criteria are missing from the matrix
- "+ Add EQ" button
- "Export ↓" button

**Summary line:** "8 evaluation questions · 16 indicators · 6 DAC criteria"

**Row interaction:** Clicking a row highlights it (blue left border, `#EFF6FF` background) and opens the inline detail editor below that row.

### 8.2 Inline detail editor
Opens below the selected table row. Two-column grid on `#F8FAFC` background, bordered by the selection color (`#3B82F6`).

**Left column:**
- Sub-questions (editable list with numbering 2.1, 2.2, + Add sub-question)
- Indicators (removable tags with source badges like "MER" or "Custom," + From Indicator Bank link, + Custom link)

**Right column:**
- Data Sources (free-text field)
- Judgement Criteria with **structured template selector:**
  - **Threshold** (default at Foundation): Strong/Moderate/Weak grid with editable criteria
  - **Rubric:** 4-level scale with descriptions
  - **Binary:** Pass/Fail with criteria
  - **Free text:** Unstructured (fallback)
  - At Foundation tier: show Threshold as default, other formats behind "Other formats" expander

**Footer:** ToC node linkages ("Linked to ToC nodes: Outcome 1, Output 1.2"), Cancel, Save EQ N.

### 8.3 + Add EQ flow
Modal overlay. Two paths:

**Auto-suggested questions (prominent at Foundation tier):**
- Suggestions derived from ToC nodes × DAC criteria
- Each suggestion shows: criterion badge, "Not yet covered in matrix" label, question text, linked ToC outcomes
- "Recommended" tag for normative questions (e.g., Gender/Equity) that aren't derived from the ToC but from normative commitments
- Multi-select: user can add multiple suggestions at once

**Write your own:**
- Free text input + criterion dropdown
- **Overlap detection:** If the typed question substantially covers the same ground as an existing EQ, a gentle warning: "This may overlap with EQ2 (Effectiveness)"

### 8.4 Export
Must produce donor-ready formats:
- **Word:** Table that drops into inception report annex without reformatting. All six columns. Proper header row styling. Page-break aware.
- **Excel:** Full matrix with sortable/filterable columns. Indicator tags as comma-separated text. Sub-questions in sub-rows.
- **JSON:** `.praxis` partial (just the `evaluation_matrix` field)

---

## 9. Station 3: Design Advisor (Integration)

### 9.1 Pattern: Pre-filled bridge
The Design Advisor asks 10 questions to recommend an evaluation design. The bridge pre-fills 8 of 10 from `tor_constraints` and `project_meta`.

### 9.2 Landing view
Summary: "8 of 10 questions pre-filled from your evaluability assessment." Read-only display of pre-answered questions with edit affordance. Two unfilled questions highlighted for user input.

### 9.3 Bridge mechanism
`DesignBridge.js` maps:
- `tor_constraints.evaluation_purpose → answers.purpose`
- `tor_constraints.causal_inference_level → answers.causal`
- `tor_constraints.comparison_feasibility → answers.comparison`
- `tor_constraints.data_available → answers.data`
- `project_meta.operating_context → answers.context`
- `project_meta.budget → answers.budget`
- `project_meta.timeline → answers.timeline`
- `project_meta.programme_maturity → answers.maturity`

The user reviews all pre-filled answers and can override any before the advisor scores designs.

### 9.4 Result display
Ranked design recommendations with scores and reasoning. "Select this design" button stores the choice. This flows downstream to Station 4 (Sample Size).

---

## 10. Station 4: Sample Size Calculator (Integration)

### 10.1 Pattern: Design-aware bridge
Pre-selects the design type from `design_recommendation.selected_design`. Maps Design Advisor design IDs to Sample Calculator design IDs (e.g., `rct → twoProportions`, `clusterRCT → clusterRCT`).

### 10.2 Landing view
Shows selected design name with link to change in Station 3. Renders the relevant parameter panel. Shows results (sample size, power, assumptions). Qualitative sampling plan section for KII/FGD numbers.

### 10.3 Bridge mechanism
Same iframe + postMessage pattern as Station 1. Small addition (~25 lines) to `sample-size-calculator/index.html`.

---

## 11. Station 5: Instrument Builder (Priority Build)

### 11.1 Structure: Structured configurator
Default mode is a structured configurator (like Typeform's builder), not a document editor. Advanced tier can unlock more freeform editing.

### 11.2 Landing view: Instrument overview
Shows instrument cards and a coverage matrix.

**Instrument cards:** Each shows:
- Instrument type icon and name (Household Survey, KII Guide, FGD Guide, Observation Checklist)
- Method type (Structured questionnaire / Semi-structured / Unstructured)
- Target sample size (linked from Station 3/4 — if from sample parameters, clickable to see sampling logic; if estimated, editable here)
- Question count and section count
- EQ coverage badges (which evaluation questions this instrument addresses)

**Coverage matrix:** Table with EQ rows and instrument columns. Teal checkmarks for coverage. **Uncovered EQs must visually highlight** — amber/red row background or a summary line: "EQ7: Impact has no instrument coverage." Empty rows cannot sit silently.

**"+ Add Instrument" button** with type options: Observation checklist, Document review template, Custom.

### 11.3 Question editor (the configurator)

**Left sidebar (240px):**
- Instrument name and metadata
- Collapsible sections organized by EQ (Section 1: Demographics, Section 2: Relevance/EQ1, etc.). Click section header to expand/collapse question list. Focuses the user on the active section.
- Active question highlighted with blue left border
- Export bar at bottom: XLSForm (primary), Word, PDF

**Right panel (question editor):**
- EQ context banner: Shows the evaluation question this section addresses and the linked indicator
- Question text (editable text field)
- **Response type selector with Auto-suggestion:** "Suggested: Likert — perception indicator → scale response." The suggestion explains its reasoning based on indicator type:
  - Percentage/count indicators → categorical or numeric response
  - Perception/attitude indicators → Likert scale
  - Binary/yes-no indicators → multiple choice
  - Qualitative/descriptive indicators → open text
- Response type options: Likert Scale, Multiple Choice, Numeric, Open Text, Ranking, Date
- **Response configuration** (type-specific):
  - Likert: Scale toggle (5/4/3-point), editable labels per point, "Include Don't Know/N/A" checkbox, Required toggle
  - Multiple Choice: Editable option list, "Allow other" checkbox, single/multi-select toggle
  - Numeric: Min/max range, unit label
  - Open Text: Character limit (optional)
  - Ranking: Items list, max selections
- **XLSForm live preview:** Dark panel showing `type`, `name`, `label` in monospace font. Updates in real time as the user configures the question. Shows what KoboToolbox will receive. Teaches XLSForm structure while building trust with technical users.
- Required toggle
- Collapsed next-question preview below

### 11.4 Skip logic boundary
Clearly framed as a platform concern, not an evaluation methodology concern. The section shows:
- Badge: "Handled in KoboToolbox"
- Explanation: "Skip logic, branching, and conditional display are best configured directly in KoboToolbox or ODK after importing the XLSForm."
- "What this builder does" box (green): Question wording, response types, XLSForm structure, section organization, choice lists
- "Configure in KoboToolbox" box (grey): Skip logic, validation constraints, repeat groups, geolocation
- **XLSForm column note:** "When you export the XLSForm, skip logic columns (relevant, constraint) will be included as empty columns, ready for you to populate in Kobo."

### 11.5 Export
**Note:** This supersedes the blueprint's `InstrumentExport.js` formats (Word, KoboJSON, CSV). XLSForm is the primary output.
- **XLSForm** (primary): Valid XLS file with `survey`, `choices`, and `settings` sheets. Correct `type`, `name`, `label`, `required` columns. Empty `relevant` and `constraint` columns for Kobo configuration. Choice lists for Likert scales, multiple choice options. This is the format KoboToolbox and ODK import natively.
- **Word:** Formatted instrument document suitable for printing or sharing. Section headers, question numbers, response options displayed visually.
- **PDF:** Print-ready version of the Word output (via browser print dialog).

---

## 12. Stations 6, 7, 8: Stubs

### 12.1 Station 6: Analysis Framework (Planned)
Shows analysis template drawn from evaluation matrix EQs. Editable table: EQ → Method → Software → Notes. "Generate Analysis Plan" button creates scaffold from EQ criteria and indicator types. "Full feature coming soon" badge. Saves partial `analysis_plan`.

### 12.2 Station 7: Report Builder (Planned)
Shows report structure template. Editable section list auto-populated from evaluation matrix EQs. "Generate Outline" button. "Full feature coming soon" badge. Saves partial `report_structure`.

### 12.3 Station 8: Deck Generator (Integration)
Reads from evaluation matrix, design recommendation, sample parameters. Shows structured summary. "Open Deck Tool" button navigates to `/praxis/tools/deck-generator/` with context passed via `sessionStorage`. "Download as Summary PDF" via browser print dialog.

---

## 13. Cross-Cutting Systems

### 13.1 Staleness propagation
`UPSTREAM_DEPS` maps each station to the context fields it reads. When `SAVE_STATION(N, payload)` fires, all downstream stations whose read-fields intersect with the written fields get flagged stale. The staleness indicator is an amber dot on the rail button.

**Staleness warning inside a station:** When a station is stale, a banner appears below the station header: "Upstream data changed since this station was last saved. [Review changes] [Dismiss]." The warning shows which specific fields changed.

### 13.2 Protection framework
Three sensitivity levels: Standard (default), Sensitive, Highly Sensitive.

- **Standard:** No visual indicators. AI features permitted. Sharing unrestricted.
- **Sensitive:** Amber banner below top bar. AI features permitted with consent. Sharing guidance shown on export.
- **Highly Sensitive:** Red banner with subtle pulse. AI features blocked. Red border overlay. Export warnings. "Encryption recommended" badge.

Sensitivity is set in Station 0 or via the top bar. It affects all stations.

### 13.3 Experience tier system
**Subtle toggle** in top bar. Consistent layout across tiers.

**What changes by tier:**
- **Field labels:** Foundation uses plain language ("How sure are you that you can compare a group that received the programme with one that didn't?"), Practitioner uses standard M&E terminology ("Comparison feasibility"), Advanced uses technical terms ("Counterfactual identification strategy").
- **Field visibility:** Foundation hides advanced fields behind "Show more detail" inline expanders. All fields are always accessible — nothing is locked by tier.
- **Help text:** Foundation gets more contextual guidance. Advanced gets methodological references.
- **Auto-suggestions:** Foundation gets more prominent suggestions (e.g., pre-generated evaluation questions as default). Advanced gets suggestions as secondary options with "Write your own" as primary.

**What does NOT change:** Layout, colors, component structure, station flow, data model. A screenshot from Foundation tier and Advanced tier should be immediately recognizable as the same tool.

### 13.4 Internationalization
All UI strings in `lang/en.json` keyed by `component.key` (e.g., `"shell.topbar.title": "PRAXIS Workbench"`). French translations (`lang/fr.json`) can start partial. `t(key, vars)` translation function with English fallback.

### 13.5 Offline / PWA
Service worker caches all local assets (cache-first) and CDN resources (network-first with cache fallback). PWA manifest enables installability. Specific CDN URLs (versioned, e.g., `react@18.3.1`) in precache list. Fallback offline warning if CDN fetch fails and no cache exists.

---

## 14. Technical Constraints

These are inherited from the architecture blueprint and remain unchanged:

- **React 18 via CDN** (unpkg.com), no build step. `@babel/standalone` for JSX transpilation in station components only. Shell and orchestration layer use `React.createElement` directly.
- **Single `useReducer`** at app level. No external state library.
- **localStorage** for persistence, single key `praxis-workbench`. Size monitoring with warning at 4MB.
- **Hash-based routing:** `#station=N&mode=X`
- **.praxis JSON schema** as defined in the architecture blueprint §3 (the canonical contract).
- **Same-origin iframe embedding** for Stations 1, 3, 4 with postMessage bridge.
- **All client-side, zero data transmission.** No server, no API calls, no telemetry.

---

## 15. Decisions Log

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Hybrid Authority visual direction | Dark rail = gravitas + navigation clarity. White panels = readable forms and tables. Best of IDE conventions (VS Code, Figma) and modern SaaS. |
| 2 | Full Landing as entry, not centered modal | The workbench earns its first impression. Space to introduce all 9 stations and establish identity for first-time users. |
| 3 | Station 0 as three assessment phases | Maps to three cognitive tasks: recall, document analysis, professional judgment. Phases create natural pause points for collaboration. Clinical screening tool pattern, not creative workspace. |
| 4 | Professional judgment overrides in Phase 3 | Separates the tool from a quiz. Evaluators can disagree with auto-scoring and justify their assessment. Creates audit trail for institutional contexts. |
| 5 | Subtle tier toggle (preference, not rank) | A Foundation user at an NGO and an Advanced user at a UN agency are both professionals. Prominent "difficulty selector" would patronize Foundation users. |
| 6 | Progressive disclosure within tiers | "Show more detail" inline expanders supplement the tier toggle. Users can go deeper on specific topics without switching their whole tier. |
| 7 | Table-first for Station 2 | The evaluation matrix is the most recognizable artifact in the profession. Table = instant recognition + export-ready deliverable. Card view is the editor, not the home. |
| 8 | Structured judgement criteria templates | Threshold/Rubric/Binary/Free-text templates elevate evaluation quality. Most evaluators default to vague criteria because they've never been offered structure. |
| 9 | Auto-suggested EQs from ToC × DAC criteria | Closes the integration loop between stations. Demonstrates workbench value (not just sequential tools). Foundation tier gets suggestions as primary path. |
| 10 | Structured configurator for Station 5 | Constrains choices to ensure methodological quality. Response type suggestions based on indicator type teach methodology. XLSForm-native from the start. |
| 11 | XLSForm preview in question editor | Builds trust with technical users, teaches XLSForm structure to others. The tool makes users smarter. |
| 12 | Honest skip logic boundary | Better than a half-built logic editor. Clearly frames what the builder does (methodology) vs. what Kobo does (data collection platform). Empty XLSForm columns included for continuity. |
| 13 | Coverage matrix for EQ-to-instrument mapping | Solves many-to-many visualization as a truth table, not a wiring diagram. Uncovered EQs highlighted to catch gaps. |
| 14 | Review cards with early signals between phases | Connects phases intellectually. Shows analytical value before intake is complete. Builds trust in the tool's intelligence. |
| 15 | EQ overlap detection in Add EQ flow | Prevents redundancy, which is a common problem in real evaluation matrices. |

---

## 16. What This Spec Does Not Cover

- **Detailed CSS for every component** — the architecture blueprint §8 has file-level descriptions. This spec adds visual direction and interaction patterns.
- **Exact i18n string list** — will be generated during implementation from the UI patterns described here.
- **Station 2 pure function ports** — the architecture blueprint §7 details exactly which functions to extract from `eval-matrix-builder/index.html` and how.
- **postMessage bridge implementation details** — the architecture blueprint §7 specifies the exact message types, handlers, and line counts.
- **Build sequence** — the architecture blueprint §9 has the phased build order. The implementation plan (next step) will adapt this into an actionable task list.

---

## 17. Next Step

Invoke the `writing-plans` skill to create a detailed implementation plan from this spec + the architecture blueprint. The plan should follow the blueprint's phased build sequence (§9) but incorporate the visual design decisions from this spec at every phase.
