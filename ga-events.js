// NEG Plus PLLC — GA4 Custom Event Tracking
// Fires named events for key user interactions across all pages

document.addEventListener('DOMContentLoaded', function () {

  function fire(name, params) {
    if (typeof gtag === 'function') {
      gtag('event', name, Object.assign({ page: window.location.pathname }, params || {}));
    }
  }

  // ── 1. Engage Now (nav CTA + mobile CTA) ─────────────────────────────────
  document.querySelectorAll('a.nav-cta, a.m-cta').forEach(function (el) {
    el.addEventListener('click', function () {
      fire('engage_now_click', { location: el.closest('nav') ? 'desktop_nav' : 'mobile_nav' });
    });
  });

  // ── 2. Employee Portal ────────────────────────────────────────────────────
  document.querySelectorAll('a[href="portal.html"]').forEach(function (el) {
    el.addEventListener('click', function () {
      fire('portal_access', { location: el.classList.contains('nav-portal') ? 'desktop_nav' : 'mobile_nav' });
    });
  });

  // ── 3. BRCAI Research Portal (outbound) ───────────────────────────────────
  document.querySelectorAll('a[href*="BRCAI"]').forEach(function (el) {
    el.addEventListener('click', function () {
      fire('outbound_click', { destination: 'BRCAI_Research_Portal', url: el.href });
    });
  });

  // ── 4. Book CTAs (news.html — Alchemy of Agency) ─────────────────────────
  document.querySelectorAll('a.book-cta-primary').forEach(function (el) {
    el.addEventListener('click', function () {
      fire('request_review_copy', { book: 'Alchemy_of_Agency' });
    });
  });

  document.querySelectorAll('a.book-cta-ghost').forEach(function (el) {
    el.addEventListener('click', function () {
      fire('book_speaker', { source: 'book_announcement' });
    });
  });

  // ── 5. All mailto links (consulting inquiries + subscribe) ────────────────
  document.querySelectorAll('a[href^="mailto"]').forEach(function (el) {
    el.addEventListener('click', function () {
      var href = el.getAttribute('href');
      var address = href.replace('mailto:', '').split('?')[0];
      var subject = (href.match(/subject=([^&]*)/) || [])[1] || '';
      fire('contact_click', {
        method: 'email',
        address: address,
        subject: decodeURIComponent(subject).substring(0, 100)
      });
    });
  });

  // ── 6. Primary hero/section CTAs ─────────────────────────────────────────
  document.querySelectorAll('a.btn').forEach(function (el) {
    el.addEventListener('click', function () {
      fire('cta_click', {
        label: el.textContent.trim(),
        destination: el.getAttribute('href'),
        style: el.classList.contains('btn-gold') ? 'primary' : 'secondary'
      });
    });
  });

  // ── 7. Consulting section CTAs (Engage Our Consulting Practice, etc.) ─────
  document.querySelectorAll('a[href*="consulting"]').forEach(function (el) {
    if (el.classList.contains('btn')) return; // already caught above
    if (el.closest('nav') || el.closest('footer')) return; // skip nav/footer
    el.addEventListener('click', function () {
      fire('consulting_link_click', { label: el.textContent.trim(), destination: el.getAttribute('href') });
    });
  });

  // ── 8. Rate card scroll (consulting.html #rates section) ─────────────────
  var ratesSection = document.getElementById('rates');
  if (ratesSection) {
    var ratesFired = false;
    var ratesObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !ratesFired) {
          ratesFired = true;
          fire('rate_card_view');
          ratesObserver.disconnect();
        }
      });
    }, { threshold: 0.25 });
    ratesObserver.observe(ratesSection);
  }

  // ── 9. Scroll depth milestones (25 / 50 / 75 / 100%) ────────────────────
  var depths = [25, 50, 75, 100];
  var firedDepths = {};
  window.addEventListener('scroll', function () {
    var scrolled = window.scrollY + window.innerHeight;
    var total = document.documentElement.scrollHeight;
    var pct = Math.round((scrolled / total) * 100);
    depths.forEach(function (d) {
      if (pct >= d && !firedDepths[d]) {
        firedDepths[d] = true;
        fire('scroll_depth', { percent: d });
      }
    });
  }, { passive: true });

});
