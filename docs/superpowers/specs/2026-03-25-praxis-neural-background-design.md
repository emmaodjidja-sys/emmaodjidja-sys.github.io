# PRAXIS Neural Network Background — Design Spec

## Overview

Add an animated neural network / constellation background to the PRAXIS hero section using pure HTML5 Canvas. The animation visualizes interconnected nodes drifting slowly, reinforcing PRAXIS's identity as a connected system of practitioner tools.

## Technical Approach

**Pure Canvas, zero dependencies.** A `<canvas>` element is positioned behind the hero section with `position: absolute; z-index: 0`. All hero content sits above it. The canvas is sized to the hero's dimensions and resizes on window resize (debounced via `ResizeObserver` on `.hero`).

## Visual Specification

### Nodes
- **Count:** 50-60 nodes on desktop (>=768px), 25-30 on mobile (<768px) via `matchMedia`
- **Teal nodes:** ~90% of nodes, color `#58D5BA` at 15-40% opacity
- **Amber accent nodes:** ~10% of nodes, color `#F0B429` at 20-40% opacity
- **Size:** 1.5px - 4px radius, varying to create depth
- **Glow:** Rendered as a larger, low-opacity circle behind each node (not `shadowBlur`, which is too expensive)
- **Movement:** Slow drift in random directions, delta-time based (~15-45px/sec) for frame-rate independence on 120Hz+ displays
- **Wrapping:** Nodes wrap with a 150px buffer zone so connections fade out before the node teleports

### Connections
- **Logic:** Draw a line between any two nodes within 150px of each other
- **Color:** `#58D5BA` (teal)
- **Opacity:** Inversely proportional to distance — fully visible at 0px, invisible at 150px threshold
- **Max opacity:** 0.08 — lines should be subtle, not dominant
- **Width:** 1px

### Depth & Layering
- Nodes have a `speed` multiplier (0.3x - 1.0x) creating parallax
- Smaller/dimmer nodes move slower (appear farther away)
- Larger/brighter nodes move faster (appear closer)

### Mouse Interaction
- None initially. Keep it ambient and non-distracting. Can be added later if desired.

## Integration

### Canvas Placement
- `.hero` gets `position: relative; overflow: hidden;` to contain the canvas
- Canvas sits inside `.hero` as the first child element
- Styled: `position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none;`
- Hero content container gets `position: relative; z-index: 1;`

### Performance
- Use `requestAnimationFrame` with delta-time scaling (movement in px/sec, not px/frame)
- Pause animation when tab is not visible (`visibilitychange` event)
- Canvas `devicePixelRatio` capped at 2 to prevent excessive rendering on 3x DPR mobile devices
- Clear and redraw each frame (no trails)
- Glow via double-circle technique, not `shadowBlur`

### Accessibility
- Respect `prefers-reduced-motion: reduce` — render a single static frame and do not start the animation loop

### Load Behavior
- Canvas fades in over 1s after a 0.3s delay, aligning with existing hero reveal animations

### Existing Background
- The dot grid (`radial-gradient`) on `body` remains unchanged for sections below the hero
- The hero section gets `background: transparent` so the canvas shows through

## Scope
- **In scope:** Canvas animation in hero section only, responsive sizing, retina support (capped DPR), visibility pause, reduced-motion support, mobile node reduction, delta-time motion
- **Out of scope:** Mouse interaction, scroll-based parallax, particles outside hero

## Files Modified
- `praxis/index.html` — Add canvas element, inline `<script>` for animation, minor CSS adjustments to hero

## Rollback
- Single file change. Revert the commit to restore previous state.
