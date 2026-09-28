/* ── Site backdrop: daytime clouds (light mode) / shooting stars (dark mode) ──
   Each theme paints a fixed WebGL layer behind the whole page. Scrolling moves
   through it with parallax, and the clock and scroll position are kept in
   sessionStorage so the backdrop carries on across pages. */
(function () {
  const STORE_KEY = 'sky-state';
  const PARALLAX  = 0.14;   // backdrop travel per viewport of page scroll: a slow drift, not a scroll
  const EASE      = 0.12;   // share of the remaining distance the sky covers each frame
  const FRAME_MS  = 1000 / 30;

  const isLight = () => document.documentElement.getAttribute('data-theme') === 'light';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const VERT = `#version 300 es
    in vec2 a_pos;
    void main(){ gl_Position = vec4(a_pos, 0, 1); }
  `;

  const DAY = `#version 300 es
    precision highp float;
    out vec4 O;
    uniform vec2  u_res;
    uniform float u_time;
    uniform float u_scroll;

    // Lattice hash from the webgl-noise permutation polynomial (x*34+1)*x mod 289.
    // Every intermediate stays below 2^24, so it is exact in 32-bit floats on any
    // GPU. Large-multiplier float hashes shatter on phones, and integer hashes
    // collapse there because fragment shaders default ints to mediump.
    float permute(float x){ return mod((x * 34. + 1.) * x, 289.); }
    float hash(vec2 p){ vec2 q = mod(p, 289.); return permute(permute(q.x) + q.y) * (1. / 289.); }
    float noise(vec2 p){
      vec2 i = floor(p), f = fract(p);
      vec2 u = f * f * f * (f * (f * 6. - 15.) + 10.);
      float a = hash(i), b = hash(i + vec2(1, 0)), c = hash(i + vec2(0, 1)), d = hash(i + 1.);
      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }
    float fbm(vec2 p){
      float v = 0., a = .5;
      mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
      for (int i = 0; i < 6; i++) { v += a * noise(p); p = m * p; a *= .5; }
      return v;
    }
    // Gently warped fbm for the cloud masses plus a finer fbm that roughens
    // the edges into cauliflower billows; both evolve slowly over time
    float density(vec2 p, float t, float cover, float soft){
      vec2 q = vec2(fbm(p * .5 + vec2(0., t * .02)), fbm(p * .5 + vec2(5.2, 1.3) - t * .015));
      float n = fbm(p + .55 * q);
      n += .22 * (fbm(p * 3.2 + vec2(t * .03, 0.)) - .5);
      return smoothstep(cover, cover + soft, n);
    }
    // Cloud colour: bright white where lit from above, grey where the cloud is
    // deep beneath denser cloud (self-shadow) or in thick, heavy patches
    vec3 shadeCloud(vec2 p, float t, float cover, float soft, float d){
      float toward = density(p + vec2(.015, .04), t, cover, soft);
      float shadow = clamp((toward - d) * 4., 0., 1.);
      float thick  = smoothstep(.5, .78, fbm(p * .6 + 3.1)) * d;
      float lit = clamp(1. - .5 * shadow - .45 * thick, 0., 1.);
      return mix(vec3(.46, .50, .58), vec3(1., 1., .985), lit);
    }

    void main(){
      vec2 fc = gl_FragCoord.xy;
      vec2 uv = fc / u_res.y;
      float y = fc.y / u_res.y;
      float t = u_time;

      // Deep blue overhead sky, a touch lighter towards the bottom of the screen
      vec3 col = mix(vec3(.20, .45, .80), vec3(.06, .22, .55), y);
      col *= 1. - .18 * length((fc / u_res - .5) * vec2(.9, .6));

      // Far layer: smaller, thinner, slower
      vec2 pf = uv * 2.4 + vec2(t * .012, t * .002) - vec2(0., u_scroll * .55 * 2.4);
      float df = density(pf, t, .52, .2);
      col = mix(col, shadeCloud(pf, t, .52, .2, df), df * .55);

      // Near layer: big billows, faster
      vec2 pn = uv * 1.25 + vec2(t * .022, t * .005) - vec2(0., u_scroll * 1.25) + 7.3;
      float dn = density(pn, t, .47, .16);
      col = mix(col, shadeCloud(pn, t, .47, .16, dn), dn * .98);

      O = vec4(col, 1.);
    }
  `;

  // The site's original dark hero shader: streaking light trails over drifting amber nebula
  const NIGHT = `#version 300 es
    precision highp float;
    out vec4 O;
    uniform vec2  u_res;
    uniform float u_time;
    uniform float u_scroll;
    #define FC gl_FragCoord.xy
    #define T u_time
    #define R u_res
    #define MN min(R.x,R.y)
    float perm(float x){return mod((x*34.+1.)*x,289.);}
    float rnd(vec2 p){vec2 q=mod(floor(p),289.);return perm(perm(q.x)+q.y)*(1./289.);}  // exact on phone GPUs (see day shader)
    float noise(in vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);float a=rnd(i),b=rnd(i+vec2(1,0)),c=rnd(i+vec2(0,1)),d=rnd(i+1.);return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}
    float fbm(vec2 p){float t=.0,a=1.;mat2 m=mat2(1.,-.5,.2,1.2);for(int i=0;i<5;i++){t+=a*noise(p);p*=2.*m;a*=.5;}return t;}
    float clouds(vec2 p){float d=1.,t=.0;for(float i=.0;i<3.;i++){float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);t=mix(t,d,a);d=a;p*=2./(i+1.);}return t;}
    void main(void){
      vec2 uv=(FC-.5*R)/MN,st=uv*vec2(2,1);
      vec3 col=vec3(0);
      float bg=clouds(vec2(st.x+T*.5,-st.y-u_scroll));
      uv*=1.-.3*(sin(T*.2)*.5+.5);
      for(float i=1.;i<12.;i++){
        uv+=.1*cos(i*vec2(.1+.01*i,.8)+i*i+T*.5+.1*uv.x);
        vec2 p=uv;
        float d=length(p);
        col+=.00125/d*(cos(sin(i)*vec3(1,2,3))+1.);
        float b=noise(i+p+bg*1.731);
        col+=.002*b/length(max(p,vec2(b*p.x*.02,p.y)));
        col=mix(col,vec3(bg*.25,bg*.137,bg*.05),d);
      }
      O=vec4(col,1);
    }
  `;

  /* Shared clock + position across pages in this tab */
  let state = null;
  try { state = JSON.parse(sessionStorage.getItem(STORE_KEY)); } catch (e) {}
  if (!state || typeof state.epoch !== 'number') state = { epoch: Date.now(), offset: 0 };

  // Phones show and hide the address bar while scrolling, which changes
  // innerHeight. The backdrop is sized to the large viewport (100lvh) instead,
  // and parallax is measured against it, so nothing stretches or jumps.
  let viewH = 0;
  const measureView = () => { viewH = (active && active.canvas.clientHeight) || window.innerHeight; };

  // Scrolling adds to the offset, so each page starts exactly where the
  // previous one left off, whatever scroll position it opens at
  let offset = typeof state.offset === 'number' ? state.offset : 0;   // where scrolling says the sky should be
  let shown = offset;                                                // where it is drawn; eases toward offset
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    offset += ((window.scrollY - lastY) / (viewH || window.innerHeight)) * PARALLAX;
    lastY = window.scrollY;
  }, { passive: true });

  window.addEventListener('pagehide', () => {
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify({ epoch: state.epoch, offset })); } catch (e) {}
  });

  function makeLayer(id, frag, resScale) {
    const canvas = document.createElement('canvas');
    canvas.id = id;
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText =
      'position:fixed;left:0;top:0;width:100%;height:100vh;height:100lvh;z-index:-1;pointer-events:none;' +
      'display:block;opacity:0;transition:opacity 0.8s ease;';
    document.body.prepend(canvas);

    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) return null;   // the CSS gradient on <body> stays as the fallback

    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn('Backdrop shader compile error:', gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    }
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, frag);
    if (!vs || !fs) return null;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn('Backdrop program link error:', gl.getProgramInfoLog(prog));
      return null;
    }
    gl.useProgram(prog);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,1,-1,-1,1,1,1,-1]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uRes    = gl.getUniformLocation(prog, 'u_res');
    const uTime   = gl.getUniformLocation(prog, 'u_time');
    const uScroll = gl.getUniformLocation(prog, 'u_scroll');

    return {
      canvas,
      resize() {
        const cssW = canvas.clientWidth || window.innerWidth;
        const cssH = canvas.clientHeight || window.innerHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        let scale = dpr * resScale * quality;
        // keep phones and tablets under ~0.6 MP of shading per frame
        const MAX_PIXELS = 600000;
        if (cssW * cssH * scale * scale > MAX_PIXELS) scale = Math.sqrt(MAX_PIXELS / (cssW * cssH));
        const w = Math.max(1, Math.round(cssW * scale));
        const h = Math.max(1, Math.round(cssH * scale));
        if (w === canvas.width && h === canvas.height) return false;   // nothing to do: no clear, no flash
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
        return true;
      },
      draw() {
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uTime, (Date.now() - state.epoch) * 0.001);
        gl.uniform1f(uScroll, shown);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    };
  }

  /* Low-power handling: Data Saver or a low battery shows a still frame, and a
     device that can't keep up gets a lower render resolution, then a still frame */
  let quality = 1;          // multiplier on each layer's render scale
  let frozen = false;
  const MIN_QUALITY = 0.5;
  const SLOW_FRAME_MS = 45;  // well under the 30fps target
  const WARMUP_MS = 4000;    // ignore load-time jank (shader compile, fonts, images)
  let slowRun = 0, prevTick = 0, measureFrom = 0;

  const saveData = () => navigator.connection?.saveData === true;
  const staticOnly = () => reducedMotion.matches || saveData() || frozen;

  navigator.getBattery?.().then(battery => {
    const check = () => {
      const low = !battery.charging && battery.level < 0.2;
      if (low !== frozen) { frozen = low; sync(); }
    };
    battery.addEventListener('levelchange', check);
    battery.addEventListener('chargingchange', check);
    check();
  }).catch(() => {});

  // Clouds are soft and the nebula is busy, so both render below device resolution
  const day   = makeLayer('sky-canvas', DAY, 0.75);
  const night = makeLayer('night-canvas', NIGHT, 0.6);

  let active = null;
  let raf = null;
  let last = 0;
  let lastScroll = -1;
  let lastScrollAt = 0;
  let prevEase = 0;

  function loop(now) {
    raf = requestAnimationFrame(loop);

    // Sustained slow frames: step the resolution down, then settle on a still frame
    const scrollingNow = window.scrollY !== lastScroll || now - lastScrollAt < 400;
    if (window.scrollY !== lastScroll) lastScrollAt = now;
    if (prevTick && now > measureFrom && !scrollingNow) slowRun = now - prevTick > SLOW_FRAME_MS ? slowRun + 1 : Math.max(0, slowRun - 2);
    prevTick = now;
    if (slowRun > 60) {
      slowRun = 0;
      if (quality > MIN_QUALITY) { quality = Math.max(MIN_QUALITY, quality * 0.75); active.resize(); }
      else { frozen = true; stop(); active.draw(); return; }
    }

    // Ease the drawn sky toward where scrolling put it (frame-rate independent),
    // so scroll steps become one continuous glide instead of visible jumps
    const dt = Math.min(now - (prevEase || now), 100);
    prevEase = now;
    const gap = offset - shown;
    const easing = Math.abs(gap) > 1e-4;
    if (easing) shown += gap * (1 - Math.pow(1 - EASE, dt / 16.7));
    else shown = offset;
    lastScroll = window.scrollY;

    // Drift at 30fps; while the sky is gliding, draw every frame
    if (!easing && now - last < FRAME_MS) return;
    last = now;
    active.draw();
  }

  function stop() {
    if (raf !== null) { cancelAnimationFrame(raf); raf = null; }
  }

  function sync() {
    const next = isLight() ? day : night;
    [day, night].forEach(l => { if (l) l.canvas.style.opacity = l === next ? '1' : '0'; });
    active = next;
    stop();
    if (!active) return;
    active.resize();
    measureView();
    shown = offset; prevEase = 0;
    prevTick = 0; slowRun = 0; measureFrom = performance.now() + WARMUP_MS;
    if (staticOnly() || document.hidden) { active.draw(); return; }
    raf = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => {
    if (!active) return;
    measureView();
    if (active.resize()) { active.draw(); measureFrom = performance.now() + 1500; }
  }, { passive: true });
  document.addEventListener('visibilitychange', () => { document.hidden ? stop() : sync(); });
  reducedMotion.addEventListener?.('change', sync);

  new MutationObserver(sync).observe(document.documentElement, {
    attributes: true, attributeFilter: ['data-theme']
  });

  sync();
})();
