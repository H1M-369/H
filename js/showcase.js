/* ══════════════════════════════════════════════
   Project showcases — scripted mock demos.
   Each demo = { reset(stage), run(ctx), init?(stage) }.
   Demos play while on screen, loop, and stop when scrolled away.
   Interactive demos (websites) hand control to the visitor on first touch.
   ══════════════════════════════════════════════ */

(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CANCEL = Symbol('cancel');
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };


  /* ── Demo context: timing, cursor, typing — all cancellable ── */
  function makeCtx(sc, player, token) {
    const stage  = sc.querySelector('.sc-stage');
    const cursor = stage.querySelector('.sc-cursor');
    const steps  = [...sc.querySelectorAll('.sc-steps li')];
    const alive  = () => { if (token !== player.token) throw CANCEL; };

    const ctx = {
      stage,
      $:  s => stage.querySelector(s),
      $$: s => [...stage.querySelectorAll(s)],

      async wait(ms) {
        alive();
        if (reduce) return;
        await sleep(ms);
        alive();
      },

      cap(i) {
        alive();
        steps.forEach((li, k) => {
          li.classList.toggle('is-now', k === i);
          li.classList.toggle('is-done', i >= 0 && k < i);
        });
      },

      async point(target) {
        if (reduce) return;
        const s = stage.getBoundingClientRect();
        const r = target.getBoundingClientRect();
        const x = r.left - s.left + r.width * 0.55;
        const y = r.top - s.top + r.height * 0.6;
        cursor.classList.add('is-on');
        cursor.style.transform = `translate(${x}px, ${y}px)`;
        await ctx.wait(700);
      },

      async click(target) {
        await ctx.point(target);
        alive();
        cursor.classList.remove('is-click');
        void cursor.offsetWidth;
        cursor.classList.add('is-click');
        target.classList.add('mk-press');
        setTimeout(() => target.classList.remove('mk-press'), 160);
        target.click();
        await ctx.wait(260);
      },

      async type(node, text, cps = 45) {
        if (reduce) { node.textContent = text; return; }
        node.classList.add('is-typing');
        const step = text.length > 120 ? 3 : 2;
        for (let i = step; i < text.length; i += step) {
          node.textContent = text.slice(0, i);
          await ctx.wait((1000 / cps) * step);
        }
        node.textContent = text;
        node.classList.remove('is-typing');
      },

      async field(box, text) {
        box.classList.add('is-focus');
        await ctx.point(box);
        await ctx.type(box.querySelector('span'), text, 28);
        box.classList.remove('is-focus');
        await ctx.wait(150);
      },

      hideCursor() { cursor.classList.remove('is-on'); },
    };
    return ctx;
  }


  /* ── Player: visibility, looping, replay, manual takeover ── */
  function setup(sc, demo) {
    const stage  = sc.querySelector('.sc-stage');
    const steps  = [...sc.querySelectorAll('.sc-steps li')];
    const player = { token: 0, manual: false };

    function cleanup() {
      stage.querySelectorAll('.is-typing, .is-focus, .mk-press')
        .forEach(n => n.classList.remove('is-typing', 'is-focus', 'mk-press'));
    }

    async function start() {
      const token = ++player.token;
      const ctx = makeCtx(sc, player, token);
      sc.classList.remove('is-manual');
      try {
        do {
          cleanup();
          demo.reset(stage);
          ctx.cap(-1);
          await ctx.wait(700);
          await demo.run(ctx);
          ctx.hideCursor();
          await ctx.wait(3600);
        } while (!reduce);
      } catch (e) {
        if (e !== CANCEL) console.error(e);
      }
    }

    function stop() {
      player.token++;
      stage.querySelector('.sc-cursor').classList.remove('is-on');
    }

    if (demo.init) demo.init(stage);

    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !player.manual) start();
      else if (!e.isIntersecting) stop();
    }, { threshold: 0.35 }).observe(stage);

    sc.querySelector('.sc-replay').addEventListener('click', () => {
      player.manual = false;
      start();
    });

    if (demo.interactive) {
      stage.addEventListener('pointerdown', () => {
        if (player.manual) return;
        player.manual = true;
        stop();
        cleanup();
        sc.classList.add('is-manual');
        steps.forEach(li => li.classList.remove('is-now', 'is-done'));
      }, true);
    }
  }

  const railAt = (rail, i) => rail.forEach((s, k) => {
    s.classList.toggle('is-now', k === i);
    s.classList.toggle('is-done', k < i);
  });


  /* ════════ Email Autoresponder ════════ */
  const AUTO_REPLY = 'Hi Amina,\nOrders ship within 2 business days and tracking is emailed once dispatched. No tracking for #4821 by Thursday? Reply here and we’ll dig in.\n— Support';

  const auto = {
    reset(st) {
      st.querySelectorAll('[data-rail] span').forEach(s => s.classList.remove('is-now', 'is-done'));
      st.querySelector('[data-poll]').textContent = 'idle';
      st.querySelectorAll('.mk-mail.is-new').forEach(n => n.remove());
      st.querySelector('[data-empty]').classList.remove('mk-hide');
      ['[data-parsed]', '[data-doc]', '[data-reply]', '[data-sent]']
        .forEach(s => st.querySelector(s).classList.add('mk-hide'));
      st.querySelector('[data-parsed]').classList.remove('is-compact');
      st.querySelector('[data-reply-text]').textContent = '';
      st.querySelector('[data-log]').innerHTML = '';
    },
    async run(c) {
      const rail = c.$$('[data-rail] span');
      const mails = c.$('[data-mails]');
      const logEl = c.$('[data-log]');
      let sec = 10;
      const log = t => {
        sec += 1 + Math.floor(Math.random() * 2);
        const d = el('div', null, `<time>07:42:${String(sec).padStart(2, '0')}</time>${t}`);
        logEl.appendChild(d);
        while (logEl.children.length > 4) logEl.firstElementChild.remove();
      };
      const mail = (from, subj) => {
        const m = el('div', 'mk-mail is-new is-unread mk-pop', `<b>${from}</b><span>${subj}</span>`);
        mails.prepend(m);
        return m;
      };
      const tag = (m, text, ok) => {
        m.querySelector('.mk-tag')?.remove();
        m.appendChild(el('span', 'mk-tag' + (ok ? ' ok' : ''), text));
      };

      c.cap(0); railAt(rail, 0);
      c.$('[data-poll]').textContent = 'polling…';
      log('Polling inbox (every 30s)…');
      await c.wait(1300);
      const promo = mail('Weekly Deals', 'This week only: 30% off everything');
      await c.wait(450);
      const amina = mail('Amina W.', 'Where is my order #4821?');
      c.$('[data-poll]').textContent = '2 new';
      log('2 new unread emails');
      await c.wait(1200);

      c.cap(1); railAt(rail, 1);
      promo.classList.add('is-filtered'); tag(promo, 'Skipped');
      log('Filtered 1 newsletter');
      await c.wait(800);
      amina.classList.add('is-focus'); tag(amina, 'Support', true);
      c.$('[data-empty]').classList.add('mk-hide');
      c.$('[data-parsed]').classList.remove('mk-hide');
      log('Parsed: order status · amina.w@example.com');
      await c.wait(1500);

      c.cap(2); railAt(rail, 2);
      c.$('[data-doc]').classList.remove('mk-hide');
      log('Loaded shipping-policy.md');
      await c.wait(1500);

      c.cap(3); railAt(rail, 3);
      c.$('[data-parsed]').classList.add('is-compact');
      c.$('[data-reply]').classList.remove('mk-hide');
      log('Claude drafting reply…');
      await c.type(c.$('[data-reply-text]'), AUTO_REPLY, 75);
      log('Draft ready · grounded in 1 doc');
      await c.wait(700);

      c.cap(4); railAt(rail, 4);
      await c.wait(500);
      c.$('[data-sent]').classList.remove('mk-hide');
      amina.classList.remove('is-unread', 'is-focus');
      amina.classList.add('is-read');
      tag(amina, 'Replied', true);
      railAt(rail, 5);
      log('Sent in thread ✓ · marked read · 4.1s');
      await c.wait(600);
    },
  };


  /* ════════ Email Support Agent ════════ */
  const SUPPORT_EMAIL = 'Hi, the password reset link you sent last week says it’s expired. How do I get back into my account?\n— Mark';
  const SUPPORT_REPLY = 'Hi Mark,\n\nSorry for the trouble! Reset links expire after 24 hours for security, so last week’s link won’t work any more.\n\nYou can request a fresh one from the login page via “Forgot password?”.\n\nBest,\nSupport Team';

  const support = {
    reset(st) {
      st.querySelector('[data-bar]').style.width = '0';
      st.querySelector('[data-drop]').classList.remove('mk-hide');
      st.querySelector('[data-doclines]').classList.add('mk-hide');
      st.querySelectorAll('.mk-doclines p').forEach(p => p.classList.remove('is-hl'));
      st.querySelector('[data-email]').textContent = '';
      st.querySelector('[data-out]').textContent = '';
      ['[data-ready]', '[data-thinking]', '[data-source]']
        .forEach(s => st.querySelector(s).classList.add('mk-hide'));
    },
    async run(c) {
      c.cap(0);
      await c.click(c.$('[data-browse]'));
      c.$('[data-bar]').style.width = '100%';
      await c.wait(1000);
      c.$('[data-drop]').classList.add('mk-hide');
      const lines = c.$('[data-doclines]');
      lines.classList.remove('mk-hide'); lines.classList.add('mk-pop');
      await c.wait(900);

      c.cap(1);
      await c.point(c.$('[data-email]'));
      await c.type(c.$('[data-email]'), SUPPORT_EMAIL, 60);
      await c.wait(400);

      c.cap(2);
      await c.click(c.$('[data-gen]'));
      c.$('[data-thinking]').classList.remove('mk-hide');
      c.hideCursor();
      await c.wait(700);
      c.$('[data-l1]').classList.add('is-hl');
      await c.wait(600);
      c.$('[data-l2]').classList.add('is-hl');
      await c.wait(1000);
      c.$('[data-thinking]').classList.add('mk-hide');

      c.cap(3);
      await c.type(c.$('[data-out]'), SUPPORT_REPLY, 80);
      c.$('[data-ready]').classList.remove('mk-hide');
      c.$('[data-source]').classList.remove('mk-hide');
      c.$('[data-source]').classList.add('mk-pop');
      await c.wait(600);
    },
  };


  /* ════════ Competitor Analysis ════════ */
  const RING = 169.6;

  const comp = {
    reset(st) {
      st.querySelector('[data-target] span').textContent = '';
      st.querySelector('[data-rivals]').innerHTML = '';
      st.querySelector('[data-progress]').classList.remove('mk-hide');
      st.querySelectorAll('[data-plist] li').forEach(li => li.classList.remove('is-run', 'is-ok'));
      st.querySelector('[data-report]').classList.add('mk-hide');
      st.querySelector('[data-ring]').style.strokeDashoffset = RING;
      st.querySelector('[data-score]').textContent = '0';
      st.querySelectorAll('[data-road] li').forEach(li => { li.classList.add('is-wait'); li.classList.remove('is-in'); });
    },
    async run(c) {
      c.cap(0);
      await c.field(c.$('[data-target]'), 'Brewline Coffee Co.');
      const rivals = c.$('[data-rivals]');
      await c.point(rivals);
      for (const name of ['BeanStreet', 'Roast & Co.']) {
        rivals.appendChild(el('span', null, name));
        await c.wait(420);
      }
      await c.click(c.$('[data-run]'));
      c.hideCursor();

      c.cap(1);
      for (const li of c.$$('[data-plist] li')) {
        li.classList.add('is-run');
        await c.wait(420);
        li.classList.remove('is-run');
        li.classList.add('is-ok');
      }
      await c.wait(400);

      c.cap(2);
      c.$('[data-progress]').classList.add('mk-hide');
      const rep = c.$('[data-report]');
      rep.classList.remove('mk-hide'); rep.classList.add('mk-pop');
      await c.wait(80);
      const target = 72;
      c.$('[data-ring]').style.strokeDashoffset = RING * (1 - target / 100);
      const scoreEl = c.$('[data-score]');
      for (let v = 0; v <= target; v += 4) { scoreEl.textContent = v; await c.wait(45); }
      scoreEl.textContent = target;
      await c.wait(1100);

      c.cap(3);
      for (const li of c.$$('[data-road] li')) {
        li.classList.remove('is-wait'); li.classList.add('is-in');
        await c.wait(480);
      }
      await c.wait(400);
    },
  };


  /* ════════ Daily Briefing ════════ */
  const NEWS = [
    { topic: 'Technology', head: 'Chipmaker unveils low-power AI accelerator',
      sum: 'A new chip promises laptop-class AI at a fraction of the power draw. Shipping is planned for early next year.' },
    { topic: 'AI & ML', head: 'Open model tops new coding benchmark',
      sum: 'The model beat larger rivals on real-world coding tasks. Its weights are available for commercial use.' },
    { topic: 'Startups', head: 'Regional startups post record seed round',
      sum: 'Founders raised more seed funding this quarter than in all of last year, led by fintech and agritech.' },
  ];

  const brief = {
    reset(st) {
      st.querySelectorAll('[data-rail] span').forEach(s => s.classList.remove('is-now', 'is-done'));
      const clock = st.querySelector('[data-clock]');
      clock.classList.remove('is-fire');
      clock.querySelector('b').textContent = '6:59';
      st.querySelector('[data-feed]').innerHTML = '';
      st.querySelector('[data-weather]').classList.add('mk-hide');
      st.querySelector('[data-sums]').innerHTML = '<p class="mk-empty">Summaries appear here…</p>';
      st.querySelector('[data-delivered]').classList.add('mk-hide');
      st.querySelectorAll('[data-sheet] tr.is-new').forEach(r => r.remove());
    },
    async run(c) {
      const rail = c.$$('[data-rail] span');

      c.cap(0); railAt(rail, 0);
      await c.wait(900);
      c.$('[data-clock] b').textContent = '7:00';
      c.$('[data-clock]').classList.add('is-fire');
      await c.wait(1000);

      c.cap(1); railAt(rail, 1);
      const feed = c.$('[data-feed]');
      for (const n of NEWS) {
        feed.appendChild(el('div', null, `<i>${n.topic}</i>${n.head}`));
        await c.wait(420);
      }
      await c.wait(500);

      c.cap(2); railAt(rail, 2);
      const w = c.$('[data-weather]');
      w.classList.remove('mk-hide'); w.classList.add('mk-pop');
      await c.wait(1000);

      c.cap(3); railAt(rail, 3);
      const sums = c.$('[data-sums]');
      sums.innerHTML = '';
      sums.appendChild(el('p', 'mk-pop', '<b>Weather:</b> 24°, partly cloudy, high of 26°.'));
      await c.wait(400);
      for (const n of NEWS) {
        const p = el('p', null, `<b>${n.head}.</b> <span></span>`);
        sums.appendChild(p);
        await c.type(p.querySelector('span'), n.sum, 110);
        await c.wait(200);
      }

      c.cap(4); railAt(rail, 4);
      await c.wait(500);
      const d = c.$('[data-delivered]');
      d.classList.remove('mk-hide'); d.classList.add('mk-pop');
      await c.wait(900);

      c.cap(5); railAt(rail, 5);
      const row = el('tr', 'is-new', '<td>Today</td><td>Tech, AI, Startups</td><td>3</td>');
      c.$('[data-sheet]').appendChild(row);
      await c.wait(700);
      railAt(rail, 6);
    },
  };


  /* ════════ DRAPE store (interactive) ════════ */
  const GARMENTS = {
    shirt: '<svg viewBox="0 0 120 120" aria-hidden="true"><path fill="currentColor" d="M42 16 L52 11 Q60 19 68 11 L78 16 L102 30 L94 50 L84 45 V106 H36 V45 L26 50 L18 30 Z"/><path d="M52 11 L60 26 L68 11 M60 26 V106" stroke="rgba(0,0,0,.22)" stroke-width="1.5" fill="none"/><g fill="rgba(0,0,0,.3)"><circle cx="63" cy="40" r="1.6"/><circle cx="63" cy="56" r="1.6"/><circle cx="63" cy="72" r="1.6"/><circle cx="63" cy="88" r="1.6"/></g></svg>',
    tie:    '<svg viewBox="0 0 120 120" aria-hidden="true"><path fill="currentColor" d="M50 12 H70 L65 27 H55 Z"/><path fill="currentColor" d="M55 28 H65 L75 92 L60 109 L45 92 Z"/><path d="M53 42 L70 54 M50 60 L73 74 M48 78 L74 92" stroke="rgba(0,0,0,.18)" stroke-width="3" fill="none"/></svg>',
    jacket: '<svg viewBox="0 0 120 120" aria-hidden="true"><path fill="currentColor" d="M40 14 L52 10 L60 34 L68 10 L80 14 L104 30 L100 98 H88 V108 H32 V98 H20 L16 30 Z"/><path d="M52 10 L46 40 L60 64 L74 40 L68 10 M60 64 V108 M88 98 V60 M32 98 V60" stroke="rgba(0,0,0,.25)" stroke-width="1.6" fill="none"/><path d="M38 82 H50 M70 82 H82" stroke="rgba(0,0,0,.28)" stroke-width="2"/><circle cx="60" cy="78" r="1.8" fill="rgba(0,0,0,.3)"/><circle cx="60" cy="92" r="1.8" fill="rgba(0,0,0,.3)"/></svg>',
  };
  const PRODUCTS = {
    shirt:  { kicker: 'Shirts',  name: 'Oxford Button-Down', price: 48,
              colors: [['Chalk', '#EDEBE6'], ['Navy', '#2B3A55'], ['Sage', '#7D8F6E'], ['Rust', '#A5532E']] },
    tie:    { kicker: 'Ties',    name: 'Silk Knit Tie', price: 32,
              colors: [['Burgundy', '#6E2233'], ['Navy', '#2B3A55'], ['Charcoal', '#3A3A40'], ['Mustard', '#C49A0C']] },
    jacket: { kicker: 'Jackets', name: 'Wool Overshirt', price: 120,
              colors: [['Camel', '#B08A5A'], ['Charcoal', '#3A3A40'], ['Olive', '#5E6245'], ['Navy', '#2B3A55']] },
  };

  const drape = {
    interactive: true,
    state: null,
    init(st) {
      const q = s => st.querySelector(s);
      const self = this;

      this.render = () => {
        const s = self.state, p = PRODUCTS[s.cat];
        const g = q('[data-garment]');
        if (g.dataset.cat !== s.cat) {
          g.innerHTML = GARMENTS[s.cat];
          g.dataset.cat = s.cat;
          g.firstElementChild.classList.add('is-swap');
        }
        g.firstElementChild.style.color = p.colors[s.color][1];
        q('[data-kicker]').textContent = p.kicker;
        q('[data-pname]').textContent = p.name;
        q('[data-price]').textContent = '$' + p.price;
        q('[data-cname]').textContent = p.colors[s.color][0];
        const sw = q('[data-swatches]');
        sw.innerHTML = '';
        p.colors.forEach(([name, hex], i) => {
          const b = el('button', i === s.color ? 'is-on' : '');
          b.type = 'button';
          b.style.background = hex;
          b.setAttribute('aria-label', name);
          b.addEventListener('click', () => { self.state.color = i; self.render(); });
          sw.appendChild(b);
        });
        st.querySelectorAll('[data-sizes] button').forEach(b =>
          b.classList.toggle('is-on', b.textContent === s.size));
      };

      st.querySelectorAll('[data-cats] button').forEach(b => b.addEventListener('click', () => {
        st.querySelectorAll('[data-cats] button').forEach(x => x.classList.toggle('is-on', x === b));
        self.state.cat = b.dataset.cat;
        self.state.color = 0;
        self.render();
      }));
      st.querySelectorAll('[data-sizes] button').forEach(b => b.addEventListener('click', () => {
        self.state.size = b.textContent;
        self.render();
      }));
      q('[data-add]').addEventListener('click', () => {
        const s = self.state, p = PRODUCTS[s.cat];
        if (!s.size) { s.size = 'M'; self.render(); }
        s.cart.push({ name: p.name, color: p.colors[s.color], size: s.size, price: p.price });
        const count = q('[data-count]');
        count.textContent = s.cart.length;
        count.classList.remove('is-bump'); void count.offsetWidth; count.classList.add('is-bump');
        const lines = q('[data-lines]');
        lines.innerHTML = '';
        s.cart.slice(-3).forEach(item => lines.appendChild(el('div', 'mk-line',
          `<i style="background:${item.color[1]}"></i><div>${item.name}<span>${item.color[0]} · ${item.size}</span></div><b>$${item.price}</b>`)));
        q('[data-subtotal]').textContent = '$' + s.cart.reduce((t, i) => t + i.price, 0);
        q('[data-drawer]').classList.add('is-open');
      });
      q('[data-close]').addEventListener('click', () => q('[data-drawer]').classList.remove('is-open'));
      q('[data-cart-btn]').addEventListener('click', () => q('[data-drawer]').classList.toggle('is-open'));

      this.reset(st);
    },
    reset(st) {
      this.state = { cat: 'shirt', color: 0, size: null, cart: [] };
      st.querySelectorAll('[data-cats] button').forEach((b, i) => b.classList.toggle('is-on', i === 0));
      st.querySelector('[data-garment]').dataset.cat = '';
      st.querySelector('[data-count]').textContent = '0';
      st.querySelector('[data-lines]').innerHTML = '';
      st.querySelector('[data-subtotal]').textContent = '$0';
      st.querySelector('[data-drawer]').classList.remove('is-open');
      this.render();
    },
    async run(c) {
      const cats = c.$$('[data-cats] button');
      c.cap(0);
      await c.click(cats[3]);          // Jackets
      await c.wait(900);
      await c.click(cats[1]);          // Shirts
      await c.wait(700);

      c.cap(1);
      await c.click(c.$$('[data-swatches] button')[1]);   // Navy
      await c.wait(700);
      await c.click(c.$$('[data-swatches] button')[3]);   // Rust
      await c.wait(900);

      c.cap(2);
      await c.click(c.$$('[data-sizes] button')[2]);      // L
      await c.wait(700);

      c.cap(3);
      await c.click(c.$('[data-add]'));
      c.hideCursor();
      await c.wait(2200);
    },
  };


  /* ════════ Ember & Oak (interactive) ════════ */
  const MENU = {
    starters: [
      ['Smoked Bone Marrow', 18, 'Oak-smoked marrow, toasted sourdough, chimichurri.', ['Wood-fired', "Chef's pick"]],
      ['Burrata & Heirloom Tomato', 16, 'Roasted heirlooms, aged balsamic, basil oil.', ['Vegetarian']],
      ['Fire-Roasted Oysters', 22, 'Half dozen, roasted over oak, drawn butter.', ['Seasonal']],
    ],
    mains: [
      ['Wood-Fired Ribeye', 58, '300g dry-aged ribeye, garlic butter, greens.', ['Wood-fired', "Chef's pick"]],
      ['Ember Salmon', 36, 'Cooked on embers, celery root purée, dill oil.', ['Gluten free']],
      ['Roasted Cauliflower', 28, 'Harissa, pomegranate and tahini.', ['Vegan', 'Gluten free']],
    ],
    desserts: [
      ['Burnt Basque Cheesecake', 14, 'Flame-kissed crust, served warm, crème fraîche.', ["Chef's pick"]],
      ['Chocolate Ember Tart', 15, 'Dark ganache, smoked sea salt, single-origin coffee.', []],
    ],
  };

  const ember = {
    interactive: true,
    init(st) {
      const q = s => st.querySelector(s);
      const self = this;

      this.tab = name => {
        st.querySelectorAll('[data-tabs] button').forEach(b => b.classList.toggle('is-on', b.dataset.tab === name));
        const box = q('[data-dishes]');
        box.innerHTML = '';
        MENU[name].forEach(([n, price, desc, tags], i) => {
          const d = el('div', 'mk-dish',
            `<b>${n}</b><em>$${price}</em><p>${desc}</p>` +
            (tags.length ? `<div class="mk-dtags">${tags.map(t => `<span class="${t === "Chef's pick" ? 'pick' : ''}">${t}</span>`).join('')}</div>` : ''));
          d.style.animationDelay = (i * 70) + 'ms';
          box.appendChild(d);
        });
      };
      this.view = name => {
        st.querySelectorAll('.mk-ember-nav [data-view]').forEach(b => b.classList.toggle('is-on', b.dataset.view === name));
        st.querySelectorAll('[data-pane]').forEach(p => p.classList.toggle('is-on', p.dataset.pane === name));
      };

      st.querySelectorAll('[data-tabs] button').forEach(b => b.addEventListener('click', () => self.tab(b.dataset.tab)));
      st.querySelectorAll('.mk-ember-nav [data-view]').forEach(b => b.addEventListener('click', () => self.view(b.dataset.view)));
      q('[data-book]').addEventListener('click', () => {
        const val = k => q(`[data-f="${k}"] span`).textContent.trim();
        const defaults = { name: 'Guest', day: 'Friday', time: '7:30 pm', guests: '2' };
        Object.keys(defaults).forEach(k => { if (!val(k)) q(`[data-f="${k}"] span`).textContent = defaults[k]; });
        q('[data-booked-text]').textContent = `Table for ${val('guests')} · ${val('day')} · ${val('time')}`;
        q('[data-booked]').classList.add('is-on');
      });
      q('[data-booked]').addEventListener('click', () => {
        q('[data-booked]').classList.remove('is-on');
        st.querySelectorAll('[data-f] span').forEach(s => { s.textContent = ''; });
      });

      this.reset(st);
    },
    reset(st) {
      this.view('menu');
      this.tab('starters');
      st.querySelectorAll('[data-f] span').forEach(s => { s.textContent = ''; });
      st.querySelector('[data-booked]').classList.remove('is-on');
    },
    async run(c) {
      const tabs = c.$$('[data-tabs] button');
      c.cap(0);
      await c.wait(500);
      await c.click(tabs[1]);            // Mains
      await c.wait(900);

      c.cap(1);
      const pick = c.$('.mk-dish');
      await c.point(pick);
      pick.classList.add('is-hl');
      await c.wait(1500);
      await c.click(tabs[2]);            // Desserts
      await c.wait(900);

      c.cap(2);
      await c.click(c.$('.mk-ember-nav [data-view="reserve"]'));
      await c.wait(400);
      await c.field(c.$('[data-f="name"]'), 'Wanjiru M.');
      await c.field(c.$('[data-f="day"]'), 'Friday');
      await c.field(c.$('[data-f="time"]'), '7:30 pm');
      await c.field(c.$('[data-f="guests"]'), '4');

      c.cap(3);
      await c.click(c.$('[data-book]'));
      c.hideCursor();
      await c.wait(2200);
    },
  };


  /* ════════ WhatsApp + M-Pesa store ════════ */
  const PAY_ALERT = '🛒 New order #1042 · PAID\nLinen shirt (M) × 1 · KSh 3,200\nSilk tie × 1 · KSh 1,550\nTotal: KSh 4,750\nM-Pesa: SJK4H7XQ2P\n📍 Deliver to: Westlands, Nairobi\n📞 0712 345 678';

  const pay = {
    reset(st) {
      st.querySelectorAll('[data-rail] span').forEach(s => s.classList.remove('is-now', 'is-done'));
      st.querySelector('[data-f="phone"] span').textContent = '';
      const status = st.querySelector('[data-status]');
      status.className = 'mk-pay-status';
      status.textContent = 'Waiting for payment';
      st.querySelector('[data-paybtn]').disabled = false;
      st.querySelector('[data-idle]').classList.remove('mk-hide');
      ['[data-stk]', '[data-sms]'].forEach(s => st.querySelector(s).classList.add('mk-hide'));
      st.querySelectorAll('[data-pin] i').forEach(i => i.classList.remove('is-on'));
      st.querySelectorAll('.mk-wa-msg.is-new, .mk-wa-typing').forEach(n => n.remove());
      st.querySelector('[data-log]').innerHTML = '';
    },
    async run(c) {
      const rail = c.$$('[data-rail] span');
      const status = c.$('[data-status]');
      const logEl = c.$('[data-log]');
      let sec = 40;
      const log = t => {
        sec += 1;
        logEl.appendChild(el('div', null, `<time>10:42:${String(sec).padStart(2, '0')}</time>${t}`));
        while (logEl.children.length > 4) logEl.firstElementChild.remove();
      };
      const setStatus = (text, kind) => { status.className = 'mk-pay-status' + (kind ? ' is-' + kind : ''); status.innerHTML = text; };

      c.cap(0); railAt(rail, 0);
      log('Cart: 2 items · KSh 4,750');
      await c.field(c.$('[data-f="phone"]'), '0712 345 678');
      await c.click(c.$('[data-paybtn]'));
      c.$('[data-paybtn]').disabled = true;
      setStatus('<span class="mk-thinking"><i></i><i></i><i></i></span>Sending payment request', 'wait');
      log('POST /orders → #1042 created');
      await c.wait(900);

      c.cap(1); railAt(rail, 1);
      log('Daraja STK push → 254712•••678 · KSh 4,750');
      c.$('[data-idle]').classList.add('mk-hide');
      const stk = c.$('[data-stk]');
      stk.classList.remove('mk-hide'); stk.classList.add('mk-pop');
      setStatus('<span class="mk-thinking"><i></i><i></i><i></i></span>Check your phone to pay', 'wait');
      await c.wait(1300);

      c.cap(2); railAt(rail, 2);
      const pins = c.$$('[data-pin] i');
      await c.point(c.$('[data-pin]'));
      for (const p of pins) { p.classList.add('is-on'); await c.wait(260); }
      await c.click(c.$('[data-ok]'));
      stk.classList.add('mk-hide');
      setStatus('<span class="mk-thinking"><i></i><i></i><i></i></span>Confirming with M-Pesa', 'wait');
      await c.wait(1100);

      c.cap(3); railAt(rail, 3);
      log('Callback: ResultCode 0 · receipt SJK4H7XQ2P');
      const sms = c.$('[data-sms]');
      sms.classList.remove('mk-hide'); sms.classList.add('mk-pop');
      setStatus('✓ Paid · M-Pesa SJK4H7XQ2P', 'ok');
      log('Order #1042 marked paid');
      await c.wait(1300);

      c.cap(4); railAt(rail, 4);
      const wa = c.$('[data-wa]');
      c.hideCursor();
      const typing = el('div', 'mk-wa-typing mk-pop', '<i></i><i></i><i></i>');
      wa.appendChild(typing);
      await c.wait(900);
      typing.remove();
      const msg = el('div', 'mk-wa-msg is-new mk-pop', '<p class="mk-typed"></p><time>10:42 <b>✓✓</b></time>');
      wa.appendChild(msg);
      await c.type(msg.querySelector('p'), PAY_ALERT, 90);
      log('WhatsApp alert → owner · delivered');
      railAt(rail, 5);
      await c.wait(600);
    },
  };


  /* ── Wire up ── */
  const DEMOS = { auto, support, comp, brief, drape, ember, pay };
  document.querySelectorAll('.sc[data-demo]').forEach(sc => {
    const demo = DEMOS[sc.dataset.demo];
    if (demo) setup(sc, demo);
  });
})();
