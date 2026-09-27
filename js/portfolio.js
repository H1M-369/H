/* ══════════════════════════════════════════════
   Portfolio page — runs alongside main.js
   ══════════════════════════════════════════════ */


/* ── Scroll progress bar ── */
(function () {
  const bar = document.getElementById('pf-progress');
  if (!bar) return;
  let ticking = false;

  function update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
})();


/* ── Hero illustration: CSS can't stop SMIL, so freeze the envelope for reduced motion ── */
(function () {
  const illo = document.querySelector('.pf-illo');
  if (illo && window.matchMedia('(prefers-reduced-motion: reduce)').matches) illo.pauseAnimations();
})();
