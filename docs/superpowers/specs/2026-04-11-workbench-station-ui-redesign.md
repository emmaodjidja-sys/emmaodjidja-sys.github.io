# PRAXIS Workbench — Station UI Redesign Spec

**Date:** 2026-04-11
**Author:** Emmanuel Nene Odjidja + Claude
**Status:** Draft
**Scope:** Visual quality upgrade for all 9 workbench station interiors. Shell (topbar, rail, drawer) unchanged. Landing page unaffected.
**Live URL:** https://emmaodjidja-sys.github.io/praxis/workbench/

---

## Design Brief

The workbench stations are functional but visually flat — weak hierarchy, generic form elements, no visual rhythm, and insufficient substance. The goal is an institutional-grade productivity tool, not a marketing site.

**Design direction:** Hybrid density — dense where data lives (tables, scoring), breathable where you think (forms, configuration). Same brand tokens (navy, teal) but optimized for sustained work sessions, not storytelling.

**Reference class:** Linear, Stripe Dashboard — not the PRAXIS landing page.

**Approach:** Section cards with station summary bars. Each station gets a dark summary bar showing key metrics at a glance, then refined section cards below for the actual work.

---

## 1. Station Summary Bar

A compact context bar pinned at the top of the panel content area, below the existing station header.

**Visual treatment:**
- Background: navy-light `#1a3050`
- Text: white for primary metric, teal `#2EC4B6` for labels
- Height: 40px (accommodates primary metric + secondary pills with 8px vertical padding)
- Border-radius: 8px
- Sits between station header and first section card, with 20px bottom margin

**Layout:**
- Left: station-specific primary metric in prominent type
- Right: 2-3 secondary stats as small pill-style readouts
- Empty state: muted prompt — "Complete this station to see summary"

**Per-station metrics:**

| Station | Primary Metric | Secondary Stats |
|---------|---------------|-----------------|
| 0 — Evaluability | Overall score (e.g., 7.2/10) | Dimensions scored, overrides applied |
| 1 — ToC | Node count | Levels deep, connections |
| 2 — Matrix | EQ count | Criteria mapped, indicators linked |
| 3 — Design | Recommended design | Confidence, alternatives considered |
| 4 — Sample | Sample size | Power, effect size, design basis |
| 5 — Instruments | Instrument count | Questions total, coverage % |
| 6 — Analysis | Methods mapped | EQs covered, gaps |
| 7 — Report | Section count | Findings, recommendations |
| 8 — Deck | Slide count | Estimated duration |

**Behavior:** Updates live as the user works. Not interactive — purely informational context.

---

## 2. Section Cards

Distinct visual containers that group related content within each station.

**Card anatomy:**
- Background: `#FFFFFF` on page background `#F1F5F9`
- Border: 1px `#E2E8F0`, border-radius 8px
- Left accent border: 3px teal by default. Amber for warnings, green for completed sections.
- **Card header:** background `#F8FAFC`, 1px bottom border `#E2E8F0`. Contains section title (14px, 600 weight, navy) + optional badge (e.g., "3 of 5") + optional collapse chevron
- **Card body padding** varies by content type:
  - Form content: 20px
  - Table content: 12px (table goes edge-to-edge within card)
  - Scoring/assessment: 16px

**Card spacing:** 16px vertical gap between cards. No nesting — cards are always one level deep.

**Empty state:** Single muted line of guidance text + teal CTA button. No placeholder illustrations or decorative elements.

**Station card breakdown:**
- Station 0 (Evaluability): one card per phase (Programme Context, ToR Review, Assessment) + Phase Review card
- Station 2 (Matrix): EQ Builder card, Criteria Mapping card, Indicator Linking card
- Station 5 (Instruments): one card per instrument being built
- Simpler stations (3, 4): fewer, larger cards

---

## 3. Typography & Hierarchy

Four levels with strict rules.

**Level 1 — Station Title:**
- 20px, 700 weight, navy `#0F172A`
- Unchanged from current implementation

**Level 2 — Section Card Title:**
- 14px, 600 weight, navy `#0F172A`
- Lives inside card header strip
- Paired with optional badge or count to the right

**Level 3 — Field Group Label:**
- 11px, 600 weight, uppercase, letter-spacing 0.08em, slate `#64748B`
- Used above form inputs, table column headers, dimension labels
- Currently used inconsistently — normalize across all stations

**Level 4 — Body / Data Text:**
- 13px, 400 weight, `#334155` for primary content
- 12px, 400 weight, `#64748B` for secondary/helper text
- JetBrains Mono 12px, `line-height: 1.15` for numeric values, scores, data readouts

**Rules:**
- No font size between 11px and 13px except 12px secondary/helper text — distinguished from Level 3 by being lowercase, 400 weight, and slate-colored rather than uppercase/600/letter-spaced
- Bold (700) reserved for Level 1 and key metric numbers only. Nothing above 500 except Level 3 labels (600).
- No italic except input placeholder text
- Teal for interactive links/CTAs only: `#2EC4B6`, no underline, `cursor: pointer`, hover darkens to `#259E92`
- JetBrains Mono always gets `line-height: 1.15`

---

## 4. Form Elements

**Text Inputs & Textareas:**
- Background: `#FFFFFF`
- Border: 1px `#CBD5E1`, border-radius 6px
- Default padding: `10px 12px`
- Compact padding (tables, scoring grids): `6px 10px`
- Focus: border transitions to teal `#2EC4B6` + box-shadow `0 0 0 2px rgba(46,196,182,0.2)`
- Font: 13px DM Sans, `#334155`
- Disabled: `opacity: 0.5`, `pointer-events: none`, `cursor: not-allowed`, border lightens to `#E2E8F0`, background stays `#FFFFFF`

**Select Dropdowns:**
- Same styling as text inputs
- Custom CSS chevron (not browser default)
- Consistent height with text inputs

**Option Cards (single/multi-select):**
- Always 2px border to prevent layout shift
- Unselected: `#FFFFFF` background, 2px `#CBD5E1` border
- Selected: `#0B1A2E` background, 2px `#0B1A2E` border, white text
- Selected indicator: teal dot (6px) top-right corner, not a checkmark
- Hover: `scale(1.01)`, 0.15s transition. No `will-change: transform`.

**Checkboxes:**
- Custom styled, 16px square, 3px radius
- Checked: teal `#2EC4B6` fill, white checkmark
- Unchecked: 1px `#CBD5E1` border, `#FFFFFF` background

**Toggles:**
- 32px wide pill shape
- On: teal `#2EC4B6`. Off: `#CBD5E1`.
- Slide animation: `0.15s ease`

---

## 5. Tables & Data Display

Stations 2, 5, 6, and 7 are table-heavy. Dense and efficient.

**Table Container:**
- Lives inside section card with 12px padding — table goes edge-to-edge within card body
- Horizontal overflow: `overflow-x: auto` with fade gradient pseudo-element on right edge when scrollable. Gradient uses `pointer-events: none` so clicks pass through.

**Table Header:**
- Sticky, background `#F8FAFC`, bottom border 1px `#E2E8F0`
- Level 3 typography: 11px, 600 weight, uppercase, letter-spacing, slate
- Vertical padding: 8px. Truncate with ellipsis if needed, no wrapping.
- Numeric column headers: right-aligned to match data columns

**Table Rows:**
- 40px minimum row height
- No alternating row colors — white rows with 1px `#F1F5F9` bottom border
- Hover: full row `#F8FAFC` background, 0.1s transition
- Selected: left 3px teal border, `#F0FDFA` background
- Cell padding: `8px 12px`

**Inline Editing:**
- Click editable cell to replace content with compact input variant (`6px 10px` padding)
- Input auto-sizes to cell width
- Save on blur or Enter. Escape reverts. No separate edit/save buttons.
- No save feedback animation — all client-side, instantaneous. Revisit if Supabase added.

**Empty Table:**
- Single muted row spanning all columns: "No [items] yet. [Add first item]" with teal CTA link (no underline, hover darkens)

**Numeric Columns:**
- Right-aligned, JetBrains Mono 12px, `line-height: 1.15`
- Score values get status color (green/amber/red) based on per-station thresholds

**Constraints:**
- No bulk actions for current demo. Single-row interaction only.

---

## 6. Scoring & Assessment Components

Station 0 (Evaluability) is the heaviest scoring interface. This visual language applies to any future rating/assessment UI.

**Dimension Score Bars:**
- Height: 8px, border-radius 4px (pill-shaped), background `#E2E8F0`
- Fill color by threshold: green `#10B981` (7+), amber `#F59E0B` (4–6.9), red `#EF4444` (<4)
- Fill transitions: `0.4s ease` on initial load/calculation, `0.15s ease` on user-triggered changes
- Score bars are not clickable. Scoring via dropdown or radio per dimension.

**Dimension Row Layout:**
- Horizontal row inside section card
- Left: dimension label (Level 3 typography — 11px uppercase)
- Center: score bar (flex: 1, min-width 120px)
- Right: score number — JetBrains Mono 14px, 700 weight, threshold color, `line-height: 1.15`
- Row height: 44px, 1px `#F1F5F9` bottom border between rows
- No alternating backgrounds

**Composite Score Display:**
- Own small card at top of assessment section card (not fused — 8px border-radius on all corners)
- Background: navy `#0B1A2E`
- Score: white, JetBrains Mono 32px, 700 weight
- Label: teal text below ("Overall Evaluability")
- Height: 80px, full card width

**Professional Judgment Override:**
- Override badge: 11px uppercase (Level 3 styling), amber `#F59E0B` text on `rgba(245,158,11,0.12)` background, next to dimension label
- Override score in primary position (14px/700). Original auto-score as strikethrough to its left (12px/400/slate).
- Justification textarea expands below dimension row on override. Single line, expandable. Placeholder: "Justification for override". Methodologically required (Davies 2013 evaluability framework).

---

## 7. Buttons & Actions

Five tiers with strict placement rules.

**Primary (Navy):**
- Background `#0B1A2E`, white text, 13px 600 weight
- Padding: `10px 20px`, border-radius 6px
- Hover: `#122240`, 0.15s transition
- Use: Save, Generate, Export — one primary per card maximum

**Teal (Secondary emphasis):**
- Background `#2EC4B6`, white text, 13px 600 weight
- Hover: `#1a9e92`
- Use: Empty state CTAs, "Add" actions, forward-moving actions

**Outline:**
- Transparent background, 1px `#CBD5E1` border, `#334155` text, 13px 500 weight
- Hover: `#F8FAFC` background
- Use: Cancel, secondary actions, alternatives

**Ghost:**
- No border/background, teal `#2EC4B6` text, 13px 500 weight
- Hover: `rgba(46,196,182,0.08)` background, sized to clearly indicate click target
- Use: Tertiary actions, "Add another", inline actions

**Danger:**
- Outline style: 1px `#EF4444` border, `#EF4444` text
- Hover: `#EF4444` background, white text
- Use: Remove, Delete — always visually separated from other buttons (minimum 12px gap or right-aligned when others are left-aligned)

**Disabled state (all tiers):** `opacity: 0.4`, `pointer-events: none`, `cursor: not-allowed`. No grayscale filter.

**Button groups:**
- Card footer: right-aligned, 8px gap. Primary rightmost. Danger leftmost.
- Station navigation bar (back/next/save): unchanged — shell-level, not station-level.
- All buttons: `width: auto`, no max-width. 20px horizontal padding accommodates i18n label expansion.
- No loading states for current demo — all client-side.

**Icon Buttons:**
- 32px square, 6px radius, ghost styling
- Icon size: 16px or 20px inside 32px container for clean centering
- Use only for: collapse chevrons, close/dismiss, move up/down
- No icon-only buttons for primary actions — always include text

---

## 8. Spacing System & Visual Rhythm

**Vertical spacing:**
- Between section cards: 16px
- Between card header and card body: 0 (header's bottom border is separator)
- Between form fields within a card: 16px
- Between dimension rows: 0 (1px border)
- Between table rows: 0 (1px border)
- Summary bar to first section card: 20px

**Horizontal spacing:**
- Card body padding (forms): 20px
- Card body padding (tables): 12px
- Card body padding (scoring): 16px
- Card header padding: 16px 20px
- Form grid: 2-column, 20px gap, collapses to 1-column below 768px

**Content max-widths (left-aligned, anchored to card's left padding edge):**
- Station content area: no max-width (fills available panel space)
- Prose text blocks (descriptions, guidance): max-width 640px
- Form grid: max-width 800px
- Tables: full width, always

**Rhythm rules:**
- Consistent 16px gap between all section cards. No variable spacing — irregular gaps read as broken.
- The summary bar's dark background creates the visual anchor. No additional separators needed.

---

## Files to Modify

**CSS (primary changes):**
- `praxis/workbench/css/tokens.css` — add new tokens for compact input, summary bar
- `praxis/workbench/css/components.css` — upgrade button, input, card, checkbox, toggle styles
- `praxis/workbench/css/stations.css` — section card system, scoring components, table upgrades
- `praxis/workbench/css/layout.css` — summary bar positioning

**JS (structural changes):**
- `praxis/workbench/js/stations/Station0.js` through `Station8.js` — wrap content in section cards, add summary bar data, refactor scoring UI
- `praxis/workbench/js/shell/Shell.js` — render summary bar component
- `praxis/workbench/js/components/` — new SummaryBar, SectionCard, CompactInput components

**No changes to:**
- Shell topbar, rail, drawer (already dark navy, working well)
- Station navigation bar (back/next/save)
- Context/state management (context.js, schema.js)
- Demo data (demo-data.js)
- Landing page or any non-workbench pages

---

## Out of Scope

- Tier-gating (Foundation/Practitioner/Advanced content changes)
- ToC Builder canvas harmonization
- French translations
- Service worker re-enablement
- Amber accent from landing page — workbench stays navy/teal only
- Dark mode for stations
- Supabase integration or backend persistence
