// NEG Plus PLLC — Spline 3D Scene Manager
// Handles lazy loading, fallback, and mouse parallax for Spline scenes

(function () {
  'use strict';

  // ── Scene registry ────────────────────────────────────────────────────────
  // Supports both my.spline.design share URLs (iframe) and
  // prod.spline.design/scene.splinecode URLs (web component)
  const SCENES = {
    'index.html':          'https://my.spline.design/untitled-8lKheQMiymgRhWTQKmsMmA78/',
    'consulting.html':     'https://my.spline.design/untitled-CdwhgMQUhZAi0S9oWHizVMvW/',
    'care-delivery.html':  '',
  };

  // ── Detect which page we're on ────────────────────────────────────────────
  const page = window.location.pathname.split('/').pop() || 'index.html';
  const sceneUrl = SCENES[page];
  if (!sceneUrl) return; // no scene yet for this page

  // ── Wait for the hero canvas mount point ─────────────────────────────────
  function mountSpline() {
    const mount = document.getElementById('spline-mount');
    if (!mount) return;

    const isIframe = sceneUrl.includes('my.spline.design');

    if (isIframe) {
      // iframe embed — works with my.spline.design share URLs
      const iframe = document.createElement('iframe');
      iframe.src = sceneUrl;
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allowtransparency', 'true');
      iframe.setAttribute('loading', 'lazy');
      iframe.style.cssText = 'width:100%;height:100%;position:absolute;inset:0;border:none;';
      mount.appendChild(iframe);
      iframe.onload = revealScene;
    } else {
      // Web component — works with prod.spline.design/scene.splinecode URLs
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
        viewer.addEventListener('load', revealScene);
      };
    }

    function revealScene() {
      mount.style.opacity = '1';
      const fallback = document.getElementById('spline-fallback');
      if (fallback) {
        fallback.style.transition = 'opacity 1s ease';
        fallback.style.opacity = '0';
        setTimeout(() => fallback.remove(), 1100);
      }
    }
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
