/* ── Services page: price modals and the request ("checkout") step ──
   Each category card opens a dialog listing its options. Choosing an option
   opens a short request form that notifies me through Formspree, with a
   pre-filled WhatsApp message as the alternative. No payment is taken. */
(function () {
  const WA_NUMBER = '254789376070';
  const checkout = document.getElementById('pm-checkout');
  const form = document.getElementById('pm-form');
  if (!checkout || !form) return;

  let fromDialog = null;   // the price list the visitor came from, for "Back"

  const open = d => {
    document.querySelectorAll('dialog.pm[open]').forEach(x => x !== d && x.close());
    if (!d.open) d.showModal();
    document.documentElement.classList.add('pm-lock');
  };
  const closeAll = () => {
    document.querySelectorAll('dialog.pm[open]').forEach(x => x.close());
    document.documentElement.classList.remove('pm-lock');
  };

  // category cards -> price dialogs
  document.querySelectorAll('[data-pm]').forEach(btn => btn.addEventListener('click', () => {
    const d = document.getElementById(btn.dataset.pm);
    if (d) open(d);
  }));

  // close: X / Done buttons, a click on the backdrop, or Esc
  document.querySelectorAll('dialog.pm').forEach(d => {
    d.addEventListener('click', e => {
      if (e.target === d || e.target.closest('[data-close]')) closeAll();
    });
    d.addEventListener('close', () => {
      if (!document.querySelector('dialog.pm[open]')) document.documentElement.classList.remove('pm-lock');
    });
  });

  const $ = s => checkout.querySelector(s);
  const status = form.querySelector('.cf-status');
  const say = (t, kind = '') => { status.textContent = t; status.dataset.kind = kind; };

  const waLink = () => {
    const d = new FormData(form);
    const lines = [
      `Hello, I'd like: ${d.get('service')} (${d.get('category')}).`,
      `Setup from: ${d.get('setup')}`,
      d.get('budget') ? `My budget: KSh ${d.get('budget')}` : '',
      d.get('plan') && !$('[data-co-plans]').hidden ? `Plan: ${d.get('plan')}` : '',
      d.get('name') ? `Name: ${d.get('name')}` : '',
      d.get('details') ? `Details: ${d.get('details')}` : '',
    ].filter(Boolean);
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
  };
  const refreshWa = () => { $('[data-co-wa]').href = waLink(); };

  const PLAN_SETS = {
    ai: { legend: 'Management plan', options: [['Basic', '2,000'], ['Full', '3,500']] },
    care: { legend: 'Website care', options: [['Care Basic', '2,500'], ['Care + Search', '4,000'], ['Care Growth', '10,000']] },
  };
  const fillPlans = set => {
    const plans = $('[data-co-plans]');
    plans.querySelector('legend').textContent = set.legend;
    plans.querySelectorAll('label:not([data-co-noplan])').forEach(l => l.remove());
    const noPlan = $('[data-co-noplan]');
    set.options.forEach(([name, price], i) => {
      const label = document.createElement('label');
      label.innerHTML = `<input type="radio" name="plan" value="${name} (KSh ${price}/month)"${i ? '' : ' checked'} /> <b>${name}</b> KSh ${price}/mo`;
      plans.insertBefore(label, noPlan);
    });
  };

  // "Choose" -> request form for that option
  document.querySelectorAll('.pm-choose').forEach(btn => btn.addEventListener('click', () => {
    fromDialog = btn.closest('dialog');
    const o = btn.dataset;
    form.reset();
    form.classList.remove('was-validated');
    say('');
    form.hidden = false;
    $('.pm-done').hidden = true;
    form.elements.service.value = o.service;
    form.elements.category.value = o.category;
    const setup = o.custom ? 'Your budget' : o.setup === 'None' ? 'None' : `KSh ${o.setup}`;
    form.elements.setup.value = setup;
    form.elements.monthly.value = o.monthly;
    $('[data-co-name]').textContent = o.service;
    $('[data-co-setup]').textContent = setup;
    $('[data-co-monthly]').textContent = o.monthly;
    // plans: required for agents/automations, optional (with "No plan") for websites and M-Pesa,
    // none for Website care packages; websites get the care packages instead of the AI plans
    const plans = $('[data-co-plans]');
    plans.hidden = plans.disabled = o.plan === 'none';
    fillPlans(PLAN_SETS[o.plans] || PLAN_SETS.ai);
    $('[data-co-noplan]').hidden = o.plan === 'required';
    if (o.plan !== 'required') form.querySelector('input[value="No plan"]').checked = true;
    $('[data-co-budget]').hidden = !o.custom;
    form.elements.budget.required = !!o.custom;
    refreshWa();
    open(checkout);
    setTimeout(() => form.elements[o.custom ? 'budget' : 'name'].focus(), 50);
  }));

  $('[data-back]').addEventListener('click', () => { if (fromDialog) open(fromDialog); });
  form.addEventListener('input', refreshWa);

  form.noValidate = true;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (form.elements._gotcha.value) return;
    form.classList.add('was-validated');
    if (!form.checkValidity()) {
      form.querySelector(':invalid').focus();
      say('Fill in the highlighted fields.', 'error');
      return;
    }
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    say('Sending…');
    const data = new FormData(form);
    data.set('_subject', `Service request: ${data.get('service')} — saintlife.dev`);
    try {
      const res = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(res.status);
      form.hidden = true;
      $('.pm-done').hidden = false;
    } catch (err) {
      say("That didn't go through. Use the WhatsApp button instead.", 'error');
    }
    button.disabled = false;
  });

  // deep links: /services/#websites etc. open that category straight away
  const fromHash = () => {
    const d = document.getElementById('pm-' + location.hash.slice(1));
    if (d && d.tagName === 'DIALOG') open(d);
  };
  fromHash();
  window.addEventListener('hashchange', fromHash);
})();
