/* ── Cookie consent + Google Analytics ──
   GA (gtag.js) loads only after the visitor accepts. The choice is kept in
   localStorage ("cookie-consent": "granted" | "denied") and can be changed from
   any [data-cookie-settings] control (footer link, privacy policy). The banner
   styles itself, so it also works on the demo pages that don't load main.css. */
(function () {
  const GA_ID = 'G-8JXBLPWPSG';
  const KEY = 'cookie-consent';
  const read = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const write = v => { try { localStorage.setItem(KEY, v); } catch (e) { /* private mode: applies to this page only */ } };

  let loaded = false;
  function loadGA() {
    if (loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_ID);
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  // _ga cookies live on the site's domain; clear every variant GA may have used
  function clearGACookies() {
    const host = location.hostname;
    const domains = ['', host, '.' + host, '.' + host.split('.').slice(-2).join('.')];
    document.cookie.split(';').map(c => c.split('=')[0].trim()).filter(n => /^_ga/.test(n)).forEach(name => {
      domains.forEach(d => { document.cookie = `${name}=; Max-Age=0; path=/${d ? '; domain=' + d : ''}`; });
    });
  }

  const css = `
    .cc {
      position: fixed; left: 20px; bottom: 20px; z-index: 95;
      width: min(420px, calc(100vw - 40px));
      padding: 16px 18px; border-radius: 16px;
      background: rgba(17,17,20,0.94); color: #E8E4DC;
      border: 1px solid rgba(255,255,255,0.1);
      box-shadow: 0 18px 50px -18px rgba(0,0,0,0.65);
      -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px);
      font: 400 0.85rem/1.55 'Inter', system-ui, sans-serif;
      opacity: 0; transform: translateY(12px);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    .cc.cc-in { opacity: 1; transform: none; }
    .cc[hidden] { display: none; }
    .cc p { margin: 0; }
    .cc b { color: #fff; font-weight: 600; }
    .cc a { color: #DFB520; text-underline-offset: 2px; }
    .cc-btns { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
    .cc-btn {
      min-width: 100px; padding: 9px 16px; border-radius: 8px; cursor: pointer;
      font: 600 0.82rem/1 'Inter', system-ui, sans-serif;
      border: 1px solid rgba(255,255,255,0.25); background: transparent; color: #fff;
      transition: background 0.2s ease, border-color 0.2s ease;
    }
    .cc-btn:hover { border-color: rgba(255,255,255,0.5); }
    .cc-accept { background: #DFB520; border-color: #DFB520; color: #17130A; }
    .cc-accept:hover { background: #F2CC4A; border-color: #F2CC4A; }
    .cc-btn:focus-visible, .cc a:focus-visible { outline: 2px solid #DFB520; outline-offset: 2px; }
    @media (max-width: 600px) {
      .cc { left: 12px; right: 12px; bottom: 12px; width: auto; }
      .cc-btn { flex: 1; }
    }
    @media (prefers-reduced-motion: reduce) { .cc { transition: none; } }
    @media print { .cc { display: none; } }
  `;

  let banner = null;
  function build() {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    banner = document.createElement('div');
    banner.className = 'cc';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.hidden = true;
    banner.innerHTML = `
      <p><b>Cookies.</b> I use Google Analytics cookies to see which pages people find useful. No ads, and nothing is sold. <a href="/privacy.html#cookies">Privacy policy</a></p>
      <div class="cc-btns">
        <button type="button" class="cc-btn cc-decline">Decline</button>
        <button type="button" class="cc-btn cc-accept">Accept</button>
      </div>`;
    banner.querySelector('.cc-accept').addEventListener('click', () => choose('granted'));
    banner.querySelector('.cc-decline').addEventListener('click', () => choose('denied'));
    document.body.appendChild(banner);
  }
  function show() {
    if (!banner) build();
    banner.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => banner.classList.add('cc-in')));
  }
  function hide() {
    if (!banner) return;
    banner.classList.remove('cc-in');
    banner.hidden = true;
  }
  function choose(value) {
    const wasRunning = loaded || read() === 'granted';
    write(value);
    hide();
    if (value === 'granted') loadGA();
    else if (wasRunning) { clearGACookies(); location.reload(); }   // GA can't be unloaded from a live page
  }

  const choice = read();
  if (choice === 'granted') loadGA();

  const ready = fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn());
  ready(() => {
    if (choice !== 'granted' && choice !== 'denied') show();
    document.addEventListener('click', e => {
      if (e.target.closest('[data-cookie-settings]')) { e.preventDefault(); show(); }
    });
  });
})();
