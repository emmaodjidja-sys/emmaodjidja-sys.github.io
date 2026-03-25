# PRAXIS Neural Network Background — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an animated neural network constellation background to the PRAXIS hero section using pure HTML5 Canvas.

**Architecture:** A single `<canvas>` element sits behind the hero content. An inline script manages node creation, movement (delta-time), connection rendering, and lifecycle (visibility pause, reduced-motion, responsive resize). All changes are in one file.

**Tech Stack:** Vanilla JS, HTML5 Canvas 2D API, no dependencies.

**Spec:** `docs/superpowers/specs/2026-03-25-praxis-neural-background-design.md`

---

### Task 1: Add CSS for canvas positioning

**Files:**
- Modify: `praxis/index.html:127-131` (`.hero` rule)

- [ ] **Step 1: Add `position: relative; overflow: hidden;` to `.hero`**

At line 127, change the `.hero` CSS block from:

```css
.hero {
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  padding: 140px 32px 100px;
}
```

to:

```css
.hero {
  position: relative; overflow: hidden;
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  padding: 140px 32px 100px;
}
```

- [ ] **Step 2: Add `position: relative; z-index: 1;` to `.hero-content`**

At line 132, change:

```css
.hero-content {
  text-align: center; max-width: 900px; margin: 0 auto;
}
```

to:

```css
.hero-content {
  position: relative; z-index: 1;
  text-align: center; max-width: 900px; margin: 0 auto;
}
```

- [ ] **Step 3: Add canvas style rule**

After the `.hero-content` rule (~line 134), add:

```css
.hero-canvas {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  z-index: 0; pointer-events: none;
  opacity: 0; transition: opacity 1s ease 0.3s;
}
.hero-canvas.visible { opacity: 1; }
```

- [ ] **Step 4: Verify in browser — hero should look identical (no visual change yet)**

Open `praxis/index.html` in browser. Confirm layout is unchanged.

- [ ] **Step 5: Commit**

```bash
git add praxis/index.html
git commit -m "style: add CSS scaffolding for hero canvas background"
```

---

### Task 2: Add canvas element to hero HTML

**Files:**
- Modify: `praxis/index.html:529` (hero section)

- [ ] **Step 1: Insert canvas as first child of `.hero`**

At line 529, change:

```html
<section class="hero">
  <div class="hero-content">
```

to:

```html
<section class="hero">
  <canvas class="hero-canvas" aria-hidden="true"></canvas>
  <div class="hero-content">
```

`aria-hidden="true"` ensures screen readers skip the decorative canvas.

- [ ] **Step 2: Verify in browser — still no visual change, canvas is transparent**

- [ ] **Step 3: Commit**

```bash
git add praxis/index.html
git commit -m "html: add canvas element to hero section"
```

---

### Task 3: Implement the neural network animation script

**Files:**
- Modify: `praxis/index.html` — add `<script>` block before the closing `</body>` tag (currently line ~875)

- [ ] **Step 1: Add the full animation script before `</body>`**

Insert the following script block just before `</body>` (after the existing `<script>` block that ends around line 874):

```javascript
<script>
(function() {
  'use strict';

  var canvas = document.querySelector('.hero-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var hero = canvas.closest('.hero');
  var nodes = [];
  var animId = null;
  var lastTime = 0;

  // Config
  var isMobile = window.matchMedia('(max-width: 767px)').matches;
  var NODE_COUNT = isMobile ? 28 : 55;
  var CONNECTION_DIST = 150;
  var TEAL = { r: 88, g: 213, b: 186 };    // #58D5BA
  var AMBER = { r: 240, g: 180, b: 41 };   // #F0B429
  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  // Reduced motion check
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    var rect = hero.getBoundingClientRect();
    canvas.width = rect.width * DPR;
    canvas.height = rect.height * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function createNode(w, h) {
    var isAmber = Math.random() < 0.1;
    var color = isAmber ? AMBER : TEAL;
    var depth = 0.3 + Math.random() * 0.7; // 0.3 - 1.0
    var speed = 15 + depth * 30; // 15 - 45 px/sec
    var angle = Math.random() * Math.PI * 2;
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 1.5 + depth * 2.5,
      opacity: 0.15 + depth * 0.25,
      color: color,
      depth: depth
    };
  }

  function init() {
    resize();
    var w = canvas.width / DPR;
    var h = canvas.height / DPR;
    nodes = [];
    for (var i = 0; i < NODE_COUNT; i++) {
      nodes.push(createNode(w, h));
    }
  }

  function update(dt) {
    var w = canvas.width / DPR;
    var h = canvas.height / DPR;
    var buffer = CONNECTION_DIST;

    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.x += n.vx * dt;
      n.y += n.vy * dt;

      // Wrap with buffer
      if (n.x < -buffer) n.x = w + buffer;
      if (n.x > w + buffer) n.x = -buffer;
      if (n.y < -buffer) n.y = h + buffer;
      if (n.y > h + buffer) n.y = -buffer;
    }
  }

  function draw() {
    var w = canvas.width / DPR;
    var h = canvas.height / DPR;
    ctx.clearRect(0, 0, w, h);

    // Draw connections
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var dx = nodes[i].x - nodes[j].x;
        var dy = nodes[i].y - nodes[j].y;
        var distSq = dx * dx + dy * dy;
        if (distSq < CONNECTION_DIST * CONNECTION_DIST) {
          var dist = Math.sqrt(distSq);
          var alpha = 0.08 * (1 - dist / CONNECTION_DIST);
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = 'rgba(' + TEAL.r + ',' + TEAL.g + ',' + TEAL.b + ',' + alpha + ')';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // Draw nodes with glow
    for (var k = 0; k < nodes.length; k++) {
      var n = nodes[k];
      var rgb = n.color.r + ',' + n.color.g + ',' + n.color.b;

      // Glow circle (larger, dimmer)
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius * 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + rgb + ',' + (n.opacity * 0.15) + ')';
      ctx.fill();

      // Core circle
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + rgb + ',' + n.opacity + ')';
      ctx.fill();
    }
  }

  function animate(timestamp) {
    if (!lastTime) lastTime = timestamp;
    var dt = Math.min((timestamp - lastTime) / 1000, 0.1); // cap at 100ms
    lastTime = timestamp;

    update(dt);
    draw();
    animId = requestAnimationFrame(animate);
  }

  // Visibility pause
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      if (animId) { cancelAnimationFrame(animId); animId = null; }
    } else {
      lastTime = 0;
      if (!prefersReducedMotion) animId = requestAnimationFrame(animate);
    }
  });

  // Resize handling
  if (window.ResizeObserver) {
    new ResizeObserver(function() { resize(); }).observe(hero);
  } else {
    window.addEventListener('resize', resize);
  }

  // Start
  init();

  if (prefersReducedMotion) {
    // Single static frame
    draw();
  } else {
    animId = requestAnimationFrame(animate);
  }

  // Fade in canvas
  requestAnimationFrame(function() { canvas.classList.add('visible'); });
})();
</script>
```

- [ ] **Step 2: Open in browser — verify the neural network animation appears behind hero text**

Check:
- Teal nodes drift slowly with thin connection lines
- A few amber accent nodes visible
- Hero text fully readable above the animation
- Animation feels subtle and ambient, not distracting

- [ ] **Step 3: Test reduced motion — enable "Reduce motion" in OS accessibility settings**

Verify: Canvas shows a static constellation frame, no movement.

- [ ] **Step 4: Test tab visibility — switch tabs and return**

Verify: Animation pauses when tab is hidden, resumes when visible.

- [ ] **Step 5: Test mobile viewport — resize browser to <768px**

Verify: Fewer nodes visible (~28), animation still smooth.

- [ ] **Step 6: Commit**

```bash
git add praxis/index.html
git commit -m "feat: add neural network constellation background to PRAXIS hero"
```

---

### Task 4: Visual tuning pass

**Files:**
- Modify: `praxis/index.html` (script config values)

- [ ] **Step 1: Review in browser and adjust if needed**

Tunable values in the script config section:
- `NODE_COUNT`: 55 desktop / 28 mobile — increase/decrease for density
- `CONNECTION_DIST`: 150 — increase for more connections, decrease for sparser
- `speed`: 15-45 px/sec — adjust for faster/slower drift
- `opacity`: 0.15-0.40 range — adjust for brighter/dimmer nodes
- `0.08` in connection alpha — adjust for more/less visible lines

If everything looks good, no changes needed.

- [ ] **Step 2: Final commit if adjustments were made**

```bash
git add praxis/index.html
git commit -m "tweak: fine-tune neural background visual parameters"
```
