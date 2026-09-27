/* ══════════════════════════════════════════════
   Portfolio page — runs alongside main.js
   ══════════════════════════════════════════════ */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isLight = () => document.documentElement.hasAttribute('data-theme');


/* ── Scroll progress bar + timeline fill ── */
(function () {
  const bar  = document.getElementById('pf-progress');
  const tl   = document.getElementById('pf-timeline');
  const fill = document.getElementById('pf-tl-fill');
  let ticking = false;

  function update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;

    const r = tl.getBoundingClientRect();
    const mid = window.innerHeight * 0.6;
    const p = Math.min(Math.max((mid - r.top) / r.height, 0), 1);
    fill.style.transform = `scaleY(${p})`;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
})();


/* ── Achievement card spotlight follows pointer ── */
document.querySelectorAll('.pf-ach').forEach(card => {
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});


/* ── 3D agent core: rotating network sphere ── */
(function () {
  const canvas = document.getElementById('pf-core-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Fibonacci sphere — evenly spread nodes
  const N = 120;
  const nodes = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = golden * i;
    nodes.push({ x: Math.cos(th) * rad, y, z: Math.sin(th) * rad, pulse: Math.random() * Math.PI * 2 });
  }

  // Connect near neighbours once
  const edges = [];
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const a = nodes[i], b = nodes[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
      if (d < 0.36) edges.push([i, j]);
    }
  }

  // Signals: packets travelling along random edges
  const signals = [];
  function spawnSignal() {
    const e = edges[(Math.random() * edges.length) | 0];
    signals.push({ e, t: 0, speed: 0.012 + Math.random() * 0.02 });
  }

  // Orbit rings (tilted) with satellites
  const rings = [
    { r: 1.32, tilt: 0.45,  spin: 0.004, sats: 3, off: 0 },
    { r: 1.55, tilt: -0.9, spin: -0.0026, sats: 2, off: 1.2 },
  ];

  let W = 0, H = 0, dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  // Rotation state: auto-spin + drag + pointer tilt
  let rotY = 0.6, rotX = -0.25, velY = 0.003, velX = 0;
  let tiltX = 0, tiltY = 0, targetTX = 0, targetTY = 0;
  let dragging = false, lastX = 0, lastY = 0;

  canvas.addEventListener('pointerdown', e => {
    dragging = true; lastX = e.clientX; lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    targetTY = ((e.clientX - r.left) / r.width - 0.5) * 0.5;
    targetTX = ((e.clientY - r.top) / r.height - 0.5) * 0.5;
    if (!dragging) return;
    velY = (e.clientX - lastX) * 0.006;
    velX = (e.clientY - lastY) * 0.006;
    lastX = e.clientX; lastY = e.clientY;
  });
  const endDrag = () => { dragging = false; };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('pointerleave', () => { targetTX = 0; targetTY = 0; });

  function project(x, y, z, scale) {
    // rotate Y
    let cy = Math.cos(rotY + tiltY), sy = Math.sin(rotY + tiltY);
    let x1 = x * cy - z * sy, z1 = x * sy + z * cy;
    // rotate X
    let cx = Math.cos(rotX + tiltX), sx = Math.sin(rotX + tiltX);
    let y1 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
    const persp = 3.2 / (3.2 + z2);
    return { x: W / 2 + x1 * scale * persp, y: H / 2 + y1 * scale * persp, z: z2, p: persp };
  }

  function colors() {
    return isLight()
      ? { node: '184,134,11', line: '122,86,6', core: '212,160,23' }
      : { node: '223,181,32', line: '196,154,12', core: '223,181,32' };
  }

  let t = 0, visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    t += 1;

    if (!dragging) {
      velY += (0.003 - velY) * 0.02;
      velX += (0 - velX) * 0.05;
    }
    if (!reduceMotion || dragging) { rotY += velY; rotX = Math.max(-1.2, Math.min(1.2, rotX + velX)); }
    tiltX += (targetTX - tiltX) * 0.05;
    tiltY += (targetTY - tiltY) * 0.05;

    const c = colors();
    const scale = Math.min(W, H) * 0.3;
    ctx.clearRect(0, 0, W, H);

    const P = nodes.map(n => project(n.x, n.y, n.z, scale));

    // Rings (back half first, drawn as dotted ellipses)
    function drawRing(ring, front) {
      const a = t * ring.spin + ring.off;
      ctx.beginPath();
      let started = false;
      for (let k = 0; k <= 96; k++) {
        const ang = (k / 96) * Math.PI * 2;
        const rx = Math.cos(ang) * ring.r, rz = Math.sin(ang) * ring.r;
        const ry = rz * Math.sin(ring.tilt), rz2 = rz * Math.cos(ring.tilt);
        const q = project(rx, ry, rz2, scale);
        if ((q.z < 0) !== front) { started = false; continue; }
        if (!started) { ctx.moveTo(q.x, q.y); started = true; } else ctx.lineTo(q.x, q.y);
      }
      ctx.setLineDash([2, 6]);
      ctx.strokeStyle = `rgba(${c.line},${front ? 0.5 : 0.18})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);

      for (let s = 0; s < ring.sats; s++) {
        const ang = a + (s / ring.sats) * Math.PI * 2;
        const rx = Math.cos(ang) * ring.r, rz = Math.sin(ang) * ring.r;
        const q = project(rx, rz * Math.sin(ring.tilt), rz * Math.cos(ring.tilt), scale);
        if ((q.z < 0) !== front) continue;
        ctx.beginPath();
        ctx.arc(q.x, q.y, 3.2 * q.p, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c.node},${front ? 0.95 : 0.35})`;
        ctx.shadowColor = `rgba(${c.node},0.8)`;
        ctx.shadowBlur = front ? 10 : 0;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
    rings.forEach(r => drawRing(r, false));

    // Edges
    ctx.lineWidth = 0.8;
    for (const [i, j] of edges) {
      const a = P[i], b = P[j];
      const depth = ((a.z + b.z) / 2 + 1) / 2;       // 0 front … 1 back
      const alpha = 0.05 + (1 - depth) * 0.3;
      ctx.strokeStyle = `rgba(${c.line},${alpha})`;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }

    // Nodes
    for (let i = 0; i < N; i++) {
      const q = P[i];
      const depth = (q.z + 1) / 2;
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.04 + nodes[i].pulse);
      const r = (1 + (1 - depth) * 1.6 + pulse * 0.5) * q.p;
      ctx.beginPath();
      ctx.arc(q.x, q.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c.node},${0.25 + (1 - depth) * 0.7})`;
      ctx.fill();
    }

    // Signals
    if (!reduceMotion && t % 9 === 0 && signals.length < 26) spawnSignal();
    for (let k = signals.length - 1; k >= 0; k--) {
      const s = signals[k];
      s.t += s.speed;
      if (s.t >= 1) { signals.splice(k, 1); continue; }
      const a = nodes[s.e[0]], b = nodes[s.e[1]];
      const q = project(a.x + (b.x - a.x) * s.t, a.y + (b.y - a.y) * s.t, a.z + (b.z - a.z) * s.t, scale);
      if (q.z > 0.3) continue;
      ctx.beginPath();
      ctx.arc(q.x, q.y, 2.4 * q.p, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c.core},0.95)`;
      ctx.shadowColor = `rgba(${c.core},0.9)`;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Inner core glow
    const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, scale * 0.55);
    const breathe = 0.16 + 0.06 * Math.sin(t * 0.03);
    g.addColorStop(0, `rgba(${c.core},${breathe})`);
    g.addColorStop(1, `rgba(${c.core},0)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(W / 2, H / 2, scale * 0.55, 0, Math.PI * 2); ctx.fill();

    rings.forEach(r => drawRing(r, true));
  }
  requestAnimationFrame(frame);
})();


/* ── Pipeline model: auto-plays, click to jump ── */
(function () {
  const root = document.getElementById('pf-pipeline');
  if (!root) return;
  const nodes = [...root.querySelectorAll('.pf-node')];
  const wires = [...root.querySelectorAll('.pf-wire')];
  const panel = document.getElementById('pf-pipe-detail');
  const $ = id => document.getElementById(id);

  const steps = [
    { name: 'Trigger', title: 'Something happens.',
      body: 'A new email arrives, a schedule fires, or a form is submitted. The pipeline watches for that event so nobody has to.',
      tags: ['Gmail API', 'Cron', 'Webhooks'] },
    { name: 'Parse', title: 'Turn the mess into structure.',
      body: 'Pull out the sender, the actual question, the urgency, and any attachments. Clean input here saves a lot of trouble later.',
      tags: ['Python', 'Extraction', 'Validation'] },
    { name: 'Context', title: 'Load what the model needs to know.',
      body: 'Bring in the support docs, product data, or past threads. The agent answers from your sources, which keeps it accurate.',
      tags: ['Docs', 'Retrieval', 'Context Design'] },
    { name: 'Reason', title: 'Claude does the thinking.',
      body: 'Claude gets a focused prompt, clear tools, and a strict output format. It writes a draft, a summary, or an analysis that’s ready to use.',
      tags: ['Claude API', 'Tool Use', 'Structured Output'] },
    { name: 'Deliver', title: 'The result lands somewhere useful.',
      body: 'The reply gets sent, the digest reaches your inbox, and the row gets logged to Sheets. Errors are caught and flagged, not lost.',
      tags: ['Gmail', 'Google Sheets', 'Error Handling'] },
  ];

  let current = 0, timer = null, inView = false, userTook = false;

  function render(i, animateWire) {
    nodes.forEach((n, k) => {
      n.classList.toggle('is-active', k === i);
      n.classList.toggle('is-done', k < i);
      n.setAttribute('aria-selected', String(k === i));
    });
    wires.forEach((w, k) => {
      w.classList.toggle('is-done', k < i);
      w.classList.remove('is-flowing');
    });
    if (animateWire && i > 0 && !reduceMotion) {
      const w = wires[i - 1];
      void w.offsetWidth;               // restart animation
      w.classList.add('is-flowing');
    }

    panel.classList.add('is-swapping');
    setTimeout(() => {
      const s = steps[i];
      $('pf-pd-label').textContent = `Step 0${i + 1} · ${s.name}`;
      $('pf-pd-title').textContent = s.title;
      $('pf-pd-body').textContent  = s.body;
      $('pf-pd-tags').innerHTML = s.tags.map(t => `<span class="tag">${t}</span>`).join('');
      panel.classList.remove('is-swapping');
    }, 220);
    current = i;
  }

  function tick() {
    render((current + 1) % steps.length, current + 1 < steps.length);
  }
  function play() {
    if (timer || userTook || reduceMotion) return;
    timer = setInterval(tick, 3200);
  }
  function pause() { clearInterval(timer); timer = null; }

  nodes.forEach((n, i) => n.addEventListener('click', () => {
    userTook = true; pause();
    render(i, i === current + 1);
  }));

  // Arrow-key navigation between steps
  root.addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const dir = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : -1;
    const next = (current + dir + steps.length) % steps.length;
    userTook = true; pause();
    render(next, dir === 1 && next !== 0);
    nodes[next].focus();
  });

  new IntersectionObserver(([e]) => {
    inView = e.isIntersecting;
    inView ? play() : pause();
  }, { threshold: 0.4 }).observe(root);
})();
