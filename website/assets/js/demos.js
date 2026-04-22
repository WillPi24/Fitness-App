/**
 * /features page interactive demos.
 * Four self-contained IIFEs. Vanilla JS. No dependencies.
 * Each demo exits silently if its container is not present on the page.
 */

(() => {
  'use strict';

  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function tween(from, to, ms, onStep, onDone) {
    if (prefersReducedMotion() || ms <= 0) {
      onStep(to);
      if (onDone) onDone();
      return () => {};
    }
    const start = performance.now();
    let rafId = 0;
    const step = (now) => {
      const t = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      onStep(from + (to - from) * eased);
      if (t < 1) rafId = requestAnimationFrame(step);
      else if (onDone) onDone();
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }

  // ─────────────────────────────────────────────────
  // 1. Strength — Brzycki 1RM calculator
  // ─────────────────────────────────────────────────
  (() => {
    const root = document.querySelector('.demo-strength');
    if (!root) return;

    const weightInput = root.querySelector('[data-demo="weight"]');
    const repsInput = root.querySelector('[data-demo="reps"]');
    const weightVal = root.querySelector('[data-demo="weight-val"]');
    const repsVal = root.querySelector('[data-demo="reps-val"]');
    const resultEl = root.querySelector('[data-demo="one-rm"]');

    let currentRm = null;
    let cancelTween = () => {};

    const calc = (w, r) => (r === 1 ? w : w * 36 / (37 - r));
    const fmt = (v) => v.toFixed(1) + ' kg';

    function setTrackFill(input) {
      const min = parseFloat(input.min);
      const max = parseFloat(input.max);
      const val = parseFloat(input.value);
      const pct = ((val - min) / (max - min)) * 100;
      input.style.setProperty('--track-fill', pct + '%');
    }

    function update() {
      const w = parseFloat(weightInput.value);
      const r = parseInt(repsInput.value, 10);
      weightVal.textContent = fmt(w);
      repsVal.textContent = r + (r === 1 ? ' rep' : ' reps');
      setTrackFill(weightInput);
      setTrackFill(repsInput);
      const next = calc(w, r);
      cancelTween();
      const from = currentRm == null ? next : currentRm;
      cancelTween = tween(from, next, 220, (v) => {
        resultEl.textContent = fmt(v);
      });
      currentRm = next;
    }

    weightInput.addEventListener('input', update);
    repsInput.addEventListener('input', update);
    update();
  })();

  // ─────────────────────────────────────────────────
  // 2. Cardio — animated run playback
  // ─────────────────────────────────────────────────
  (() => {
    const root = document.querySelector('.demo-cardio');
    if (!root) return;

    const path = root.querySelector('.demo-cardio__path');
    const dot = root.querySelector('.demo-cardio__dot');
    const btn = root.querySelector('.demo-cardio__play');
    const distEl = root.querySelector('[data-stat="distance"]');
    const timeEl = root.querySelector('[data-stat="time"]');
    const paceEl = root.querySelector('[data-stat="pace"]');

    const FINAL_KM = 5.24;
    const FINAL_SEC = 24 * 60 + 18; // 24:18
    const DURATION_MS = 6000;

    const pathLen = path.getTotalLength();
    path.style.strokeDasharray = pathLen;
    path.style.strokeDashoffset = pathLen;

    let playing = false;
    let cancelTween = () => {};

    const formatMmSs = (sec) => {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return m + ':' + String(s).padStart(2, '0');
    };

    function render(progress) {
      // Pace variation: runner starts a touch slower and settles in.
      // Distance progresses slightly non-linearly vs time progress.
      const distProgress = progress < 1
        ? Math.pow(progress, 1.05)
        : 1;
      const distance = FINAL_KM * distProgress;
      const time = FINAL_SEC * progress;

      distEl.textContent = distance.toFixed(2) + ' km';
      timeEl.textContent = formatMmSs(time);

      if (distance > 0.05) {
        const paceSec = time / distance;
        paceEl.textContent = formatMmSs(paceSec) + ' /km';
      } else {
        paceEl.textContent = '—:— /km';
      }

      path.style.strokeDashoffset = pathLen * (1 - progress);

      if (dot) {
        try {
          const pt = path.getPointAtLength(pathLen * progress);
          dot.setAttribute('cx', pt.x);
          dot.setAttribute('cy', pt.y);
          dot.style.opacity = progress > 0 && progress < 1 ? '1' : '0';
        } catch (_) {
          // getPointAtLength can throw on some browsers for 0-length; ignore
        }
      }
    }

    function play() {
      if (playing) return;
      playing = true;
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      render(0);
      cancelTween();
      cancelTween = tween(0, 1, DURATION_MS, render, () => {
        playing = false;
        btn.disabled = false;
        btn.setAttribute('aria-busy', 'false');
        btn.classList.add('demo-cardio__play--done');
        btn.innerHTML = '↻ Replay';
      });
    }

    btn.addEventListener('click', play);

    render(0);
  })();

  // ─────────────────────────────────────────────────
  // 3. Nutrition — build-a-meal macro ring
  // ─────────────────────────────────────────────────
  (() => {
    const root = document.querySelector('.demo-nutrition');
    if (!root) return;

    const GOAL_KCAL = 2200;
    const PROTEIN_TARGET = 165;
    const CARBS_TARGET = 250;
    const FAT_TARGET = 75;

    const FOODS = {
      oats:    { kcal: 320, p: 12, c: 54, f: 7 },
      chicken: { kcal: 285, p: 53, c: 0,  f: 6 },
      rice:    { kcal: 210, p: 4,  c: 45, f: 0 },
      egg:     { kcal: 78,  p: 6,  c: 0,  f: 5 },
      avocado: { kcal: 160, p: 2,  c: 9,  f: 15 },
      banana:  { kcal: 105, p: 1,  c: 27, f: 0 },
    };

    const state = { kcal: 0, p: 0, c: 0, f: 0 };
    let displayedKcal = 0;
    let cancelTween = () => {};

    const ring = root.querySelector('.demo-nutrition__ring');
    const totalEl = root.querySelector('[data-stat="kcal"]');
    const bars = {
      protein: root.querySelector('[data-bar="protein"]'),
      carbs:   root.querySelector('[data-bar="carbs"]'),
      fat:     root.querySelector('[data-bar="fat"]'),
    };
    const vals = {
      protein: root.querySelector('[data-val="protein"]'),
      carbs:   root.querySelector('[data-val="carbs"]'),
      fat:     root.querySelector('[data-val="fat"]'),
    };
    const chips = root.querySelectorAll('.demo-nutrition__chip');
    const resetBtn = root.querySelector('.demo-nutrition__reset');

    function render() {
      // Ring shows macro breakdown as kcal shares of the daily goal.
      // Protein/carbs = 4 kcal/g, fat = 9 kcal/g.
      const pKcal = state.p * 4;
      const cKcal = state.c * 4;
      const fKcal = state.f * 9;
      const pPct = Math.min(100, (pKcal / GOAL_KCAL) * 100);
      const cPct = Math.min(100, pPct + (cKcal / GOAL_KCAL) * 100);
      const fPct = Math.min(100, cPct + (fKcal / GOAL_KCAL) * 100);

      ring.style.setProperty('--p-end', pPct + '%');
      ring.style.setProperty('--c-end', cPct + '%');
      ring.style.setProperty('--f-end', fPct + '%');

      cancelTween();
      cancelTween = tween(displayedKcal, state.kcal, 380, (v) => {
        totalEl.textContent = Math.round(v).toLocaleString();
      });
      displayedKcal = state.kcal;

      bars.protein.style.width = Math.min(100, (state.p / PROTEIN_TARGET) * 100) + '%';
      bars.carbs.style.width   = Math.min(100, (state.c / CARBS_TARGET) * 100) + '%';
      bars.fat.style.width     = Math.min(100, (state.f / FAT_TARGET) * 100) + '%';

      vals.protein.textContent = Math.round(state.p) + ' g';
      vals.carbs.textContent   = Math.round(state.c) + ' g';
      vals.fat.textContent     = Math.round(state.f) + ' g';
    }

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const key = chip.dataset.food;
        const f = FOODS[key];
        if (!f) return;
        state.kcal += f.kcal;
        state.p += f.p;
        state.c += f.c;
        state.f += f.f;
        chip.classList.remove('demo-nutrition__chip--poke');
        // Force reflow so the animation retriggers.
        void chip.offsetWidth;
        chip.classList.add('demo-nutrition__chip--poke');
        render();
      });
    });

    resetBtn.addEventListener('click', () => {
      state.kcal = 0; state.p = 0; state.c = 0; state.f = 0;
      render();
    });

    render();
  })();

  // ─────────────────────────────────────────────────
  // 4. Body — weight trend scrubber
  // ─────────────────────────────────────────────────
  (() => {
    const root = document.querySelector('.demo-body');
    if (!root) return;

    const WEIGHTS = [84.7, 84.2, 83.8, 83.1, 82.7, 82.4, 82.0, 81.5, 81.2, 80.8, 80.3, 79.8];
    const VB_W = 240;
    const VB_H = 100;
    const PAD_X = 14;
    const PAD_Y = 14;
    const Y_MIN = 79;
    const Y_MAX = 85;

    const svg = root.querySelector('svg');
    const line = svg.querySelector('.demo-body__line');
    const area = svg.querySelector('.demo-body__area');
    const dot = svg.querySelector('.demo-body__dot');
    const hit = svg.querySelector('.demo-body__hit');
    const weekLabel = root.querySelector('[data-label="week"]');
    const weightLabel = root.querySelector('[data-label="weight"]');
    const deltaLabel = root.querySelector('[data-label="delta"]');

    const xFor = (i) => PAD_X + (i / (WEIGHTS.length - 1)) * (VB_W - 2 * PAD_X);
    const yFor = (w) => PAD_Y + ((Y_MAX - w) / (Y_MAX - Y_MIN)) * (VB_H - 2 * PAD_Y);
    const points = WEIGHTS.map((w, i) => ({ x: xFor(i), y: yFor(w), w }));

    line.setAttribute('points', points.map((p) => p.x + ',' + p.y).join(' '));
    if (area) {
      const base = VB_H - PAD_Y / 2;
      const areaPoints = [
        points[0].x + ',' + base,
        ...points.map((p) => p.x + ',' + p.y),
        points[points.length - 1].x + ',' + base,
      ].join(' ');
      area.setAttribute('points', areaPoints);
      area.style.opacity = '0';
    }

    const lineLen = line.getTotalLength();
    line.style.strokeDasharray = lineLen;
    line.style.strokeDashoffset = lineLen;

    let currentIndex = 5;
    let dragging = false;
    let hasDrawn = false;

    function drawLine() {
      if (hasDrawn) return;
      hasDrawn = true;
      if (prefersReducedMotion()) {
        line.style.strokeDashoffset = '0';
        if (area) area.style.opacity = '1';
        return;
      }
      if (typeof line.animate === 'function') {
        const anim = line.animate(
          [{ strokeDashoffset: lineLen }, { strokeDashoffset: 0 }],
          { duration: 900, easing: 'ease-out', fill: 'forwards' }
        );
        anim.addEventListener('finish', () => {
          line.style.strokeDashoffset = '0';
        });
        if (area) {
          area.animate(
            [{ opacity: 0 }, { opacity: 1 }],
            { duration: 900, delay: 300, easing: 'ease-out', fill: 'forwards' }
          );
        }
      } else {
        line.style.strokeDashoffset = '0';
        if (area) area.style.opacity = '1';
      }
    }

    function updateDot(index) {
      index = Math.max(0, Math.min(WEIGHTS.length - 1, index));
      currentIndex = index;
      const p = points[index];
      dot.setAttribute('cx', p.x);
      dot.setAttribute('cy', p.y);
      dot.setAttribute('aria-valuenow', index + 1);
      dot.setAttribute('aria-valuetext',
        'Week ' + (index + 1) + ', ' + WEIGHTS[index].toFixed(1) + ' kilograms');

      const delta = WEIGHTS[index] - WEIGHTS[0];
      weekLabel.textContent = 'Week ' + (index + 1);
      weightLabel.textContent = WEIGHTS[index].toFixed(1) + ' kg';
      const sign = delta > 0 ? '+' : (delta < 0 ? '−' : '±');
      deltaLabel.textContent = sign + Math.abs(delta).toFixed(1) + ' kg from W1';
      deltaLabel.classList.toggle('demo-body__delta--neg', delta < 0);
      deltaLabel.classList.toggle('demo-body__delta--pos', delta > 0);
    }

    function indexFromPointer(e) {
      const rect = svg.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (VB_W / rect.width);
      const rel = (x - PAD_X) / (VB_W - 2 * PAD_X);
      return Math.round(rel * (WEIGHTS.length - 1));
    }

    // Listen on the SVG root so pointerdown catches clicks on the dot itself
    // (the circle paints above the hit-rect and would otherwise swallow them).
    svg.addEventListener('pointerdown', (e) => {
      dragging = true;
      try { svg.setPointerCapture(e.pointerId); } catch (_) {}
      updateDot(indexFromPointer(e));
      // Keep focus off the dot when dragging with a mouse -- focus ring is for
      // keyboard users only.
      if (e.pointerType !== 'mouse' && e.target !== dot) {
        // touch users: no focus shift
      }
    });

    svg.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      updateDot(indexFromPointer(e));
    });

    const endDrag = (e) => {
      dragging = false;
      try { svg.releasePointerCapture(e.pointerId); } catch (_) {}
    };
    svg.addEventListener('pointerup', endDrag);
    svg.addEventListener('pointercancel', endDrag);

    dot.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        updateDot(currentIndex - 1);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        updateDot(currentIndex + 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        updateDot(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        updateDot(WEIGHTS.length - 1);
      }
    });

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            drawLine();
            io.disconnect();
          }
        });
      }, { threshold: 0.3 });
      io.observe(root);
    } else {
      drawLine();
    }

    updateDot(5);
  })();
})();
