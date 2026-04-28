/* ═══════════════════════════════════════════════════
   HELM - Main JavaScript
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── Mobile Menu Toggle ───
  const burger = document.querySelector('.nav__burger');
  const mobileMenu = document.querySelector('.nav__mobile');

  if (burger && mobileMenu) {
    burger.addEventListener('click', function () {
      burger.classList.toggle('active');
      mobileMenu.classList.toggle('open');
    });

    // Close menu when clicking a link
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        burger.classList.remove('active');
        mobileMenu.classList.remove('open');
      });
    });
  }

  // ─── Nav Scroll Effect ───
  const nav = document.querySelector('.nav');

  if (nav) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 10) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // ─── Scroll Reveal Animations ───
  var reveals = document.querySelectorAll('.reveal');

  if (reveals.length > 0) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  // ─── Phone Mockup Tilt ───
  // Default state: phone faces forward (CSS).
  // On mousemove: phone tilts so the area near the cursor leans back (rotates
  //   away from the user). Mouse top-right -> top-right edge tilts back.
  //   To flip to "face-the-mouse" (area under cursor leans forward), invert
  //   both signs in the applyTilt() call below.
  // On mouseleave: clear inline transform; CSS transition smoothly returns.
  // Skipped on touch / no-hover devices so we don't fight a tap.
  var phoneMockup = document.querySelector('.phone-mockup');
  if (phoneMockup && window.matchMedia('(hover: hover)').matches) {
    var TILT_MAX_DEG = 12;
    var tiltRaf = null;

    phoneMockup.addEventListener('mousemove', function (e) {
      var rect = phoneMockup.getBoundingClientRect();
      var halfW = rect.width / 2;
      var halfH = rect.height / 2;
      var normX = (e.clientX - rect.left - halfW) / halfW;
      var normY = (e.clientY - rect.top - halfH) / halfH;
      var rx = -normY * TILT_MAX_DEG; // top back when mouse near top
      var ry = normX * TILT_MAX_DEG;  // right back when mouse near right

      if (tiltRaf) cancelAnimationFrame(tiltRaf);
      tiltRaf = requestAnimationFrame(function () {
        // Short ease so the first move (and every subsequent move) animates
        // gradually instead of snapping. On mouseleave we clear the inline
        // style so the CSS 0.4s ease takes over for the slower return.
        phoneMockup.style.transition = 'transform 0.18s ease-out';
        phoneMockup.style.transform =
          'perspective(1000px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
      });
    });

    phoneMockup.addEventListener('mouseleave', function () {
      if (tiltRaf) cancelAnimationFrame(tiltRaf);
      phoneMockup.style.transition = '';
      phoneMockup.style.transform = '';
    });
  }

  // ─── Smooth Scroll for Anchor Links ───
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;

      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        var navHeight = document.querySelector('.nav') ? document.querySelector('.nav').offsetHeight : 0;
        var top = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        window.scrollTo({ top: top, behavior: 'smooth' });

        // Close mobile menu if open
        if (burger && mobileMenu) {
          burger.classList.remove('active');
          mobileMenu.classList.remove('open');
        }
      }
    });
  });

})();
