/* ═══════════════════════════════════════════════════
   HELM — Phone Demo Walkthrough
   Animated autoplay using Motion library
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  var animate = window.Motion ? window.Motion.animate : null;
  if (!animate) {
    console.warn('Motion library not loaded, demo animations disabled.');
    // Still show the first screen without animations
    return;
  }

  var SCREEN_DURATION = 4000; // ms per screen
  var TRANSITION_DURATION = 0.5;
  var screens = document.querySelectorAll('.demo-screen');
  var tabs = document.querySelectorAll('.demo-tab');
  var currentScreen = 0;
  var totalScreens = screens.length;
  var interval = null;
  var demoContainer = document.getElementById('demo-screen');

  if (!demoContainer || totalScreens === 0) return;

  // ─── Screen Transition ───
  function showScreen(index) {
    var prev = currentScreen;
    currentScreen = index;

    // Update tabs - match by data-tab attribute
    tabs.forEach(function (tab) {
      if (parseInt(tab.getAttribute('data-tab')) === index) {
        tab.classList.add('demo-tab--active');
      } else {
        tab.classList.remove('demo-tab--active');
      }
    });

    // Animate out current screen
    var prevScreen = screens[prev];
    var nextScreen = screens[index];

    if (prev === index) {
      animateScreenIn(nextScreen);
      return;
    }

    animate(prevScreen, { opacity: [1, 0], transform: ['translateX(0)', 'translateX(-30px)'] }, { duration: TRANSITION_DURATION, easing: 'ease-in' }).finished.then(function () {
      prevScreen.classList.remove('demo-screen--active');
      prevScreen.style.opacity = '0';

      nextScreen.classList.add('demo-screen--active');
      nextScreen.style.opacity = '0';
      nextScreen.style.transform = 'translateX(30px)';

      animate(nextScreen, { opacity: [0, 1], transform: ['translateX(30px)', 'translateX(0)'] }, { duration: TRANSITION_DURATION, easing: [0.22, 1, 0.36, 1] }).finished.then(function () {
        animateScreenIn(nextScreen);
      });
    });
  }

  // ─── Per-Screen Animations ───
  function animateScreenIn(screen) {
    var index = parseInt(screen.getAttribute('data-demo'));

    // Stagger children
    var staggerEls = screen.querySelectorAll('[data-anim="stagger"] > *');
    if (staggerEls.length > 0) {
      staggerEls.forEach(function (el, i) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(10px)';
        animate(el, { opacity: [0, 1], transform: ['translateY(10px)', 'translateY(0)'] }, { duration: 0.35, delay: 0.15 + i * 0.08, easing: [0.22, 1, 0.36, 1] });
      });
    }

    // Pop elements
    var popEls = screen.querySelectorAll('[data-anim="pop"]');
    popEls.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'scale(0.8)';
      animate(el, { opacity: [0, 1], transform: ['scale(0.8)', 'scale(1)'] }, { duration: 0.4, delay: 1.2, easing: [0.34, 1.56, 0.64, 1] });
    });

    // Screen-specific animations (0=Calories, 1=Log, 2=Cardio, 3=Progress)
    if (index === 0) animateNutrition(screen);
    if (index === 1) animateWorkout(screen);
    if (index === 2) animateCardio(screen);
    if (index === 3) animateProgress(screen);
  }

  // ─── Workout Screen ───
  function animateWorkout(screen) {
    var timer = screen.querySelector('.demo-timer');
    if (timer) {
      var seconds = 24 * 60 + 17;
      timer.textContent = '24:17';
      var timerInterval = setInterval(function () {
        seconds += 1;
        var m = Math.floor(seconds / 60);
        var s = seconds % 60;
        timer.textContent = m + ':' + (s < 10 ? '0' : '') + s;
        if (seconds >= 24 * 60 + 21) clearInterval(timerInterval);
      }, 1000);
    }

    // Type in Set 2 weight then reps
    var weightEl = screen.querySelector('.demo-type-weight');
    var repsEl = screen.querySelector('.demo-type-reps');
    if (weightEl && repsEl) {
      weightEl.textContent = '';
      repsEl.textContent = '';
      var weightChars = ['2', '5'];
      var repsChars = ['1', '1'];
      // Type weight at 0.8s, 1.2s
      setTimeout(function () { weightEl.textContent = weightChars[0]; }, 800);
      setTimeout(function () { weightEl.textContent = weightChars[0] + weightChars[1]; }, 1200);
      // Type reps at 2.0s, 2.4s
      setTimeout(function () { repsEl.textContent = repsChars[0]; }, 2000);
      setTimeout(function () { repsEl.textContent = repsChars[0] + repsChars[1]; }, 2400);
    }
  }

  // ─── Cardio Screen ───
  function animateCardio(screen) {
    var route = screen.querySelector('.demo-route');
    var runner = screen.querySelector('.demo-runner');
    var glow = screen.querySelector('.demo-runner-glow');

    if (route) {
      var length = route.getTotalLength();
      route.setAttribute('stroke-dasharray', length);
      route.setAttribute('stroke-dashoffset', length);
      route.setAttribute('opacity', '1');

      var startTime = null;
      var duration = 2500;

      function animateRoute(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        // Draw the route behind the runner
        route.setAttribute('stroke-dashoffset', length * (1 - eased));

        // Move runner dot
        var point = route.getPointAtLength(eased * length);
        if (runner) {
          runner.setAttribute('cx', point.x);
          runner.setAttribute('cy', point.y);
        }
        if (glow) {
          glow.setAttribute('cx', point.x);
          glow.setAttribute('cy', point.y);
        }

        if (progress < 1) requestAnimationFrame(animateRoute);
      }
      requestAnimationFrame(animateRoute);
    }

    // Count up stats
    var distEl = screen.querySelector('[data-count="5.2"]');
    var timeEl = screen.querySelector('[data-count="25"]');
    if (distEl) countUp(distEl, 0, 5.2, 2500, 1);
    if (timeEl) countUp(timeEl, 0, 25, 2500, 0);
  }

  // ─── Nutrition Screen ───
  function animateNutrition(screen) {
    var protein = screen.querySelector('.demo-ring-protein');
    var carbs = screen.querySelector('.demo-ring-carbs');
    var fat = screen.querySelector('.demo-ring-fat');
    var calsCurrent = screen.querySelector('.demo-cal-current');
    var calBar = screen.querySelector('.demo-cal-bar__fill');

    // Animate filled pie slices by fading in sequentially
    if (protein) {
      animate(protein, { opacity: [0, 1] }, { duration: 0.5, delay: 0.3, easing: [0.22, 1, 0.36, 1] });
    }
    if (carbs) {
      animate(carbs, { opacity: [0, 1] }, { duration: 0.5, delay: 0.6, easing: [0.22, 1, 0.36, 1] });
    }
    if (fat) {
      animate(fat, { opacity: [0, 1] }, { duration: 0.5, delay: 0.9, easing: [0.22, 1, 0.36, 1] });
    }
    if (calsCurrent) {
      countUpText(calsCurrent, 0, 2045, 2000);
    }
    if (calBar) {
      setTimeout(function () { calBar.style.width = '85%'; }, 300);
    }
  }

  // ─── Progress Screen ───
  function animateProgress(screen) {
    var line = screen.querySelector('.demo-chart-line');
    var dot = screen.querySelector('.demo-chart-dot');

    if (line) {
      var length = line.getTotalLength();
      line.setAttribute('stroke-dasharray', length);
      line.setAttribute('stroke-dashoffset', length);

      var startTime = null;
      var duration = 1800;

      function drawLine(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        line.setAttribute('stroke-dashoffset', length * (1 - eased));
        if (progress < 1) requestAnimationFrame(drawLine);
      }
      requestAnimationFrame(drawLine);
    }

    if (dot) {
      dot.setAttribute('opacity', '0');
      dot.setAttribute('r', '0');
      setTimeout(function () {
        dot.setAttribute('opacity', '1');
        dot.setAttribute('r', '3.5');
      }, 1800);
    }
  }

  // ─── Utility: Count Up ───
  function countUp(el, from, to, duration, decimals) {
    var startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var current = from + (to - from) * progress;
      el.textContent = current.toFixed(decimals);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function countUpText(el, from, to, duration) {
    var startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(from + (to - from) * eased);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ─── Init ───
  function startDemo() {
    // Reset all screens
    screens.forEach(function (s, i) {
      if (i === 0) {
        s.classList.add('demo-screen--active');
        s.style.opacity = '1';
        s.style.transform = 'translateX(0)';
      } else {
        s.classList.remove('demo-screen--active');
        s.style.opacity = '0';
      }
    });

    // Animate first screen in
    setTimeout(function () {
      animateScreenIn(screens[0]);
    }, 800);

    // Auto-cycle
    interval = setInterval(function () {
      var next = (currentScreen + 1) % totalScreens;
      showScreen(next);
    }, SCREEN_DURATION);
  }

  // Start when the demo is in view
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        startDemo();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(demoContainer);
})();
