/* ── Floating WhatsApp button: on every page, pre-filled with where the visitor came from ── */
(function () {
  if (document.getElementById('wa-float')) return;
  const NUMBER = '254789376070';
  const page = location.pathname === '/' ? 'home page' : document.title.split(/\s[—–|-]\s/)[0].trim();
  const text = `Hello, I found you on saintlife.dev (${page}) and I'd like to discuss a project.`;

  const css = `
    #wa-float {
      position: fixed; right: 20px; bottom: max(20px, env(safe-area-inset-bottom));
      z-index: 90;
      display: flex; align-items: center; gap: 10px;
      text-decoration: none;
      font: 600 0.85rem/1 'Inter', system-ui, sans-serif;
      -webkit-tap-highlight-color: transparent;
    }
    #wa-float .wa-btn {
      position: relative;
      width: 56px; height: 56px; border-radius: 50%;
      display: grid; place-items: center;
      background: #25D366; color: #fff;
      box-shadow: 0 10px 28px -8px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.25);
      transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease;
    }
    #wa-float .wa-btn::after {
      content: ''; position: absolute; inset: 0; border-radius: 50%;
      box-shadow: 0 0 0 0 rgba(37,211,102,0.55);
      animation: wa-ping 2.8s ease-out infinite;
    }
    #wa-float svg { width: 28px; height: 28px; fill: currentColor; }
    #wa-float .wa-label {
      order: -1;
      padding: 9px 14px; border-radius: 100px;
      background: rgba(17,17,20,0.9); color: #fff;
      box-shadow: 0 8px 24px -10px rgba(0,0,0,0.5);
      opacity: 0; transform: translateX(8px); pointer-events: none;
      transition: opacity 0.2s ease, transform 0.2s ease;
      white-space: nowrap;
    }
    #wa-float:hover .wa-btn, #wa-float:focus-visible .wa-btn { transform: translateY(-3px) scale(1.05); }
    #wa-float:hover .wa-label, #wa-float:focus-visible .wa-label { opacity: 1; transform: none; }
    #wa-float:focus-visible { outline: none; }
    #wa-float:focus-visible .wa-btn { box-shadow: 0 0 0 3px #fff, 0 0 0 6px #25D366; }
    @keyframes wa-ping {
      0% { box-shadow: 0 0 0 0 rgba(37,211,102,0.5); }
      70%, 100% { box-shadow: 0 0 0 16px rgba(37,211,102,0); }
    }
    @media (max-width: 600px) { #wa-float { right: 16px; } #wa-float .wa-btn { width: 52px; height: 52px; } }
    @media (hover: none) { #wa-float .wa-label { display: none; } }
    @media (prefers-reduced-motion: reduce) { #wa-float .wa-btn::after { animation: none; } }
    @media print { #wa-float { display: none; } }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const a = document.createElement('a');
  a.id = 'wa-float';
  a.href = `https://wa.me/${NUMBER}?text=${encodeURIComponent(text)}`;
  a.target = '_blank';
  a.rel = 'noopener';
  a.setAttribute('aria-label', 'Chat on WhatsApp');
  a.innerHTML = `<span class="wa-label">Chat on WhatsApp</span><span class="wa-btn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg></span>`;
  document.body.appendChild(a);
})();
