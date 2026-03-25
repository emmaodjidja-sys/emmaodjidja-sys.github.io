# PRAXIS Neural Network Background — Design Spec

## Overview

Add an animated neural network / constellation background to the PRAXIS hero section using pure HTML5 Canvas. The animation visualizes interconnected nodes drifting slowly, reinforcing PRAXIS's identity as a connected system of practitioner tools.

## Technical Approach

**Pure Canvas, zero dependencies.** A `<canvas>` element is positioned behind the hero section with `position: absolute; z-index: 0`. All hero content sits above it. The canvas is sized to the hero's dimensions and resizes on window resize.

## Visual Specification

### Nodes
- **Count:** 50-60 nodes total
- **Teal nodes:** ~90% of nodes, color `#58D5BA` at 15-40% opacity
- **Amber accent nodes:** ~10% of nodes, color `#F0B429` at 20-40% opacity
- **Size:** 1.5px - 4px radius, varying to create depth
- **Glow:** Canvas `shadowBlur` of 8-15px matching node color at low opacity
- **Movement:** Slow drift in random directions (0.1-0.3px/frame), wrapping at canvas edges

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
- Canvas sits inside `.hero` as the first child element
- Styled: `position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none;`
- Hero content container gets `position: relative; z-index: 1;`

### Performance
- Use `requestAnimationFrame` for the render loop
- Pause animation when tab is not visible (`visibilitychange` event)
- Canvas resolution matches `devicePixelRatio` for crisp rendering on retina displays
- Clear and redraw each frame (no trails)

### Existing Background
- The dot grid (`radial-gradient`) on `body` remains unchanged for sections below the hero
- The hero section gets `background: transparent` so the canvas shows through

## Scope
- **In scope:** Canvas animation in hero section only, responsive sizing, retina support, visibility pause
- **Out of scope:** Mouse interaction, scroll-based parallax, particles outside hero, mobile-specific reduction (canvas handles low node counts gracefully)

## Files Modified
- `praxis/index.html` — Add canvas element, inline `<script>` for animation, minor CSS adjustments to hero

## Rollback
- Single file change. Revert the commit to restore previous state.
