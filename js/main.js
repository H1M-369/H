/* ── Theme toggle ── */
const SUN  = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
const MOON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

const toggleBtn = document.getElementById('theme-toggle');

function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    toggleBtn.innerHTML = MOON;
    toggleBtn.setAttribute('aria-label', 'Switch to dark mode');
  } else {
    document.documentElement.removeAttribute('data-theme');
    toggleBtn.innerHTML = SUN;
    toggleBtn.setAttribute('aria-label', 'Switch to light mode');
  }
  localStorage.setItem('theme', theme);
}

applyTheme(localStorage.getItem('theme') || 'dark');

toggleBtn.addEventListener('click', () => {
  const isDark = !document.documentElement.hasAttribute('data-theme');
  applyTheme(isDark ? 'light' : 'dark');
});


/* ── Projects dropdown ── */
function toggleDropdown(id) {
  const item = document.getElementById(id);
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.nav-item.open').forEach(el => el.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}
document.addEventListener('click', e => {
  if (!e.target.closest('.nav-item')) {
    document.querySelectorAll('.nav-item.open').forEach(el => el.classList.remove('open'));
  }
});


/* ── Hamburger / mobile menu ── */
const hamburgerBtn  = document.getElementById('hamburger-btn');
const mobileMenuEl  = document.getElementById('mobile-menu');

hamburgerBtn.addEventListener('click', () => {
  const isOpen = mobileMenuEl.classList.toggle('open');
  hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
});
document.querySelectorAll('.mobile-menu-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenuEl.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
  });
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    mobileMenuEl.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
  }
});


/* ── Scroll reveal + divider draw ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal, .divider').forEach(el => revealObserver.observe(el));


/* ── Contact chips entrance trigger ── */
const contactObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('contact-visible');
      contactObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
const contactSection = document.getElementById('contact');
if (contactSection) contactObserver.observe(contactSection);


/* ── Cursor ambient glow ── */
const cursorGlow = document.getElementById('cursor-glow');
let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
let rx = cx, ry = cy;

document.addEventListener('mousemove', e => {
  cx = e.clientX;
  cy = e.clientY;
}, { passive: true });

(function animateCursor() {
  rx += (cx - rx) * 0.07;
  ry += (cy - ry) * 0.07;
  cursorGlow.style.transform = `translate(${rx - 240}px, ${ry - 240}px)`;
  requestAnimationFrame(animateCursor);
})();


/* ── Stat counter ── */
function countUp(el, target, suffix, duration) {
  const isNum = !isNaN(parseInt(target));
  if (!isNum) return;
  const end = parseInt(target);
  const start = performance.now();
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(ease * end) + suffix;
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const numEl = e.target.querySelector('.stat-number');
    if (!numEl) return;
    const raw   = numEl.textContent.trim();
    const match = raw.match(/^(\d+)(.*)$/);
    if (match) countUp(numEl, match[1], match[2], 1200);
    statObserver.unobserve(e.target);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-card').forEach(el => statObserver.observe(el));


/* ── Text disperse (phone CTA) ── */
(function () {
  const phoneText  = '+254789376070';
  const transforms = [
    { x: -0.8,  y: -0.6,  r: -29 },
    { x: -0.2,  y: -0.4,  r: -6  },
    { x: -0.05, y:  0.1,  r:  12 },
    { x: -0.05, y: -0.1,  r:  -9 },
    { x: -0.1,  y:  0.55, r:   3 },
    { x:  0,    y: -0.1,  r:   9 },
    { x:  0,    y:  0.15, r: -12 },
    { x:  0,    y:  0.15, r: -17 },
    { x:  0,    y: -0.65, r:   9 },
    { x:  0.1,  y:  0.4,  r:  12 },
    { x:  0,    y: -0.15, r:  -9 },
    { x:  0.2,  y:  0.15, r:  12 },
    { x:  0.8,  y:  0.6,  r:  20 },
  ];
  const wrap = document.getElementById('text-disperse');
  if (!wrap) return;
  phoneText.split('').forEach(char => {
    const span = document.createElement('span');
    span.textContent = char;
    wrap.appendChild(span);
  });
  const spans = wrap.querySelectorAll('span');
  wrap.addEventListener('mouseenter', () => {
    spans.forEach((span, i) => {
      const t = transforms[i];
      span.style.transform = `translate(${t.x}em, ${t.y}em) rotate(${t.r}deg)`;
    });
  });
  wrap.addEventListener('mouseleave', () => {
    spans.forEach(span => { span.style.transform = 'translate(0,0) rotate(0deg)'; });
  });
})();


/* ── Contact dot particle canvas (click to burst) ── */
(function () {
  const section = document.getElementById('contact');
  if (!section) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;display:block;';
  section.insertBefore(canvas, section.firstChild);

  const ctx = canvas.getContext('2d');
  const particles = [];
  let time = 0;
  let raf;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = section.clientWidth;
    const h = section.clientHeight;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function particleColor() {
    return document.documentElement.hasAttribute('data-theme')
      ? '184, 134, 11'   // amber — readable on light bg
      : '223, 181, 32';  // amber-l — readable on dark bg
  }

  function spawnBurst(x, y) {
    const fast = Math.floor(25 + Math.random() * 15);
    for (let i = 0; i < fast; i++) {
      const angle = (Math.PI * 2 * i) / fast + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 4;
      particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0, maxLife: 2000 + Math.random() * 3000,
        size: 1 + Math.random() * 3, angle, speed,
      });
    }
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 1.5;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0, maxLife: 4000 + Math.random() * 2000,
        size: 2 + Math.random() * 2, angle, speed,
      });
    }
  }

  function animate() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    time += 0.006;

    const col = particleColor();

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life += 16;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.02;
      p.vx *= 0.995;
      p.vy *= 0.995;
      p.x += Math.sin(time + p.angle) * 0.3;
      p.y += Math.cos(time + p.angle * 0.7) * 0.2;

      const progress = p.life / p.maxLife;
      const alpha    = Math.max(0, (1 - progress) * 0.8);
      const size     = p.size * (1 - progress * 0.3);

      if (alpha > 0) {
        ctx.fillStyle = `rgba(${col},${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      if (p.life >= p.maxLife || p.x < -50 || p.x > w + 50 || p.y < -50 || p.y > h + 50) {
        particles.splice(i, 1);
      }
    }

    raf = requestAnimationFrame(animate);
  }

  section.addEventListener('click', e => {
    const rect = section.getBoundingClientRect();
    spawnBurst(e.clientX - rect.left, e.clientY - rect.top);
  });

  window.addEventListener('resize', resize, { passive: true });

  resize();
  raf = requestAnimationFrame(animate);
})();


/* ── Active nav highlight on scroll ── */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  navLinks.forEach(a => {
    a.style.color = a.getAttribute('href') === `#${current}` ? 'var(--amber-l)' : '';
  });
}, { passive: true });
