// NEG Plus PLLC — Spline 3D Scene Manager
// Handles lazy loading, fallback, and mouse parallax for Spline scenes

(function () {
  'use strict';

  // ── Scene registry — swap in your exported Spline URLs here ───────────────
  // Export each scene from Spline: Publish → Copy Link → paste below
  const SCENES = {
    'index.html':          'https://prod.spline.design/HOMEPAGE_SCENE_ID/scene.splinecode',
    'consulting.html':     'https://prod.spline.design/CONSULTING_SCENE_ID/scene.splinecode',
    'care-delivery.html':  'https://prod.spline.design/CARE_SCENE_ID/scene.splinecode',
  };

  // ── Detect which page we're on ────────────────────────────────────────────
  const page = window.location.pathname.split('/').pop() || 'index.html';
  const sceneUrl = SCENES[page];
  if (!sceneUrl || sceneUrl.includes('SCENE_ID')) return; // no scene yet for this page

  // ── Wait for the hero canvas mount point ─────────────────────────────────
  function mountSpline() {
    const mount = document.getElementById('spline-mount');
    if (!mount) return;

    // Load the Spline viewer web component
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/@splinetool/viewer@1.9.82/build/spline-viewer.js';
    document.head.appendChild(script);

    script.onload = function () {
      const viewer = document.createElement('spline-viewer');
      viewer.setAttribute('url', sceneUrl);
      viewer.setAttribute('loading', 'lazy');
      viewer.style.cssText = 'width:100%;height:100%;position:absolute;inset:0;';
      mount.appendChild(viewer);

      // Fade in once loaded
      viewer.addEventListener('load', function () {
        mount.style.opacity = '1';
        // Remove the fallback gradient overlay once 3D is live
        const fallback = document.getElementById('spline-fallback');
        if (fallback) {
          fallback.style.transition = 'opacity 0.8s ease';
          fallback.style.opacity = '0';
          setTimeout(() => fallback.remove(), 900);
        }
      });
    };
  }

  // ── Subtle mouse parallax on the hero ────────────────────────────────────
  function initParallax() {
    const hero = document.querySelector('.hero, .page-hero');
    if (!hero) return;
    let ticking = false;
    document.addEventListener('mousemove', function (e) {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
        const dx = (e.clientX - cx) / cx;   // -1 to 1
        const dy = (e.clientY - cy) / cy;
        const mount = document.getElementById('spline-mount');
        if (mount) {
          mount.style.transform = `translate(${dx * -12}px, ${dy * -8}px) scale(1.04)`;
        }
        ticking = false;
      });
    });
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { mountSpline(); initParallax(); });
  } else {
    mountSpline(); initParallax();
  }

})();
