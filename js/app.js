/* app.js — navigation, fragments, widgets, timer, presenter view */
(function () {
  'use strict';

  const { PARTS, SLIDES } = window.Deck;
  const B = window.Blocks;
  const TOTAL_SEC = 20 * 60;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode etc. */ } },
  };

  const params = new URLSearchParams(location.search);
  const isPresenter = params.has('presenter');

  const UI = {
    ko: {
      keys: [
        ['→ / Space / PageDown', '다음 (조각 → 슬라이드)'], ['← / PageUp', '이전'], ['Home / End', '처음 / 끝'],
        ['L', '언어 전환 KO ↔ EN'], ['F', '전체화면'], ['O', '슬라이드 목록'], ['N', '발표 대본 표시'],
        ['P', '발표자 창 열기 (대본 + 타이머)'], ['T', '타이머 표시'], ['R', '타이머 초기화'], ['D', '밝은/어두운 테마'], ['?', '이 도움말'],
      ],
      help: '단축키', ov: '슬라이드 목록', next: '다음', late: '늦음', early: '빠름',
    },
    en: {
      keys: [
        ['→ / Space / PageDown', 'Next (fragment → slide)'], ['← / PageUp', 'Previous'], ['Home / End', 'First / last'],
        ['L', 'Switch language KO ↔ EN'], ['F', 'Fullscreen'], ['O', 'Slide overview'], ['N', 'Show speaker script'],
        ['P', 'Open presenter window (script + timer)'], ['T', 'Show timer'], ['R', 'Reset timer'], ['D', 'Light / dark theme'], ['?', 'This help'],
      ],
      help: 'Keyboard shortcuts', ov: 'Slides', next: 'Next', late: 'behind', early: 'ahead',
    },
  };

  const state = {
    lang: params.get('lang') === 'en' || params.get('lang') === 'ko' ? params.get('lang') : store.get('lang') || 'ko',
    i: 0,
    step: 0,
    startedAt: 0,
    maxSeen: 0,
  };
  let frags = [];
  let presenterWin = null;

  const deck = $('#deck');
  const planned = (i) => SLIDES.slice(0, i).reduce((a, s) => a + s.sec, 0);
  const fmt = (s) => {
    const a = Math.abs(Math.round(s));
    return `${String(Math.floor(a / 60)).padStart(2, '0')}:${String(a % 60).padStart(2, '0')}`;
  };

  /* ---------------- deck building ---------------- */
  function build() {
    const h = B.make(state.lang);
    deck.innerHTML = '';
    SLIDES.forEach((s, idx) => {
      const el = document.createElement('section');
      el.className = 'slide' + (s.layout ? ' ' + s.layout : '');
      el.dataset.id = s.id;
      const head = s.layout === 'center' ? '' : `<header class="s-head"><span class="kicker" style="--c:var(--p${s.part})">${B.esc(PARTS[s.part][state.lang])}</span><h2>${B.esc(s.title[state.lang])}</h2></header>`;
      el.innerHTML = `${head}<div class="s-body">${s.render(h)}</div>`;
      el.setAttribute('aria-label', `${idx + 1}. ${s.title[state.lang]}`);
      deck.append(el);
    });
    document.documentElement.lang = state.lang;
    $('#progress').innerHTML = SLIDES.map((s) => `<i style="background:var(--p${s.part})"></i>`).join('');
  }

  function setLang(lang) {
    if (lang === state.lang && deck.children.length) return;
    state.lang = lang;
    store.set('lang', lang);
    const keepStep = state.step;
    build();
    go(state.i, 'start');
    state.step = Math.min(keepStep, frags.length);
    applyStep();
  }

  /* ---------------- navigation ---------------- */
  function go(i, mode) {
    i = Math.max(0, Math.min(SLIDES.length - 1, i));
    $$('.slide', deck).forEach((el, k) => el.classList.toggle('active', k === i));
    const el = deck.children[i];
    initWidgets(el);
    frags = $$('.frag', el);
    state.i = i;
    state.step = mode === 'end' ? frags.length : 0;
    state.maxSeen = Math.max(state.maxSeen, i);
    if (i >= 1 && !state.startedAt) state.startedAt = Date.now();
    applyStep();
    updateHud();
    try { history.replaceState(null, '', '#' + (i + 1)); } catch (e) { /* file:// quirks */ }
  }

  function applyStep() {
    frags.forEach((f, k) => f.classList.toggle('on', k < state.step));
    sync();
  }

  const next = () => (state.step < frags.length ? (state.step++, applyStep()) : state.i < SLIDES.length - 1 && go(state.i + 1, 'start'));
  const prev = () => (state.step > 0 ? (state.step--, applyStep()) : state.i > 0 && go(state.i - 1, 'end'));
  const jump = (i) => go(i, i < state.i ? 'end' : 'start');

  /* ---------------- HUD / timer / notes ---------------- */
  function updateHud() {
    $$('#progress i').forEach((el, k) => {
      el.classList.toggle('seen', k <= state.maxSeen);
      el.classList.toggle('cur', k === state.i);
    });
    $('#counter').textContent = `${state.i + 1} / ${SLIDES.length}`;
    $('#notes').textContent = SLIDES[state.i].notes;
    tick();
  }

  function pace() {
    if (!state.startedAt) return { elapsed: 0, delta: 0 };
    const elapsed = (Date.now() - state.startedAt) / 1000;
    return { elapsed, delta: elapsed - planned(state.i) };
  }

  function paceText() {
    const { elapsed, delta } = pace();
    const sign = delta >= 0 ? '+' : '−';
    const lab = delta >= 0 ? UI[state.lang].late : UI[state.lang].early;
    return { text: `${fmt(elapsed)} / ${fmt(TOTAL_SEC)} · ${sign}${fmt(delta)} ${lab}`, cls: delta > 20 ? 'late' : delta < -20 ? 'early' : '' };
  }

  function tick() {
    const el = $('#timer');
    const p = paceText();
    el.textContent = p.text;
    el.className = p.cls;
  }
  setInterval(tick, 1000);

  /* ---------------- presenter window ---------------- */
  function sync() {
    if (presenterWin && !presenterWin.closed) {
      presenterWin.postMessage({ type: 'state', i: state.i, step: state.step, steps: frags.length, startedAt: state.startedAt, lang: state.lang }, '*');
    }
  }

  function openPresenter() {
    presenterWin = window.open(location.pathname + '?presenter=1&lang=' + state.lang, 'presenter', 'width=1000,height=720');
  }

  function initPresenter() {
    document.body.classList.add('presenter');
    document.title = 'Presenter · ' + document.title;
    const root = $('#presenter');
    root.innerHTML = `<div class="p-top"><h1></h1><span class="p-time"></span></div><div class="p-notes"></div>
      <div class="p-bot"><button id="pp">◀</button><button id="pn">▶</button><span class="p-next"></span></div>`;
    const ps = { i: 0, step: 0, steps: 0, startedAt: 0 };
    const cmd = (c, extra) => window.opener && window.opener.postMessage(Object.assign({ type: 'cmd', cmd: c }, extra), '*');
    const render = () => {
      const s = SLIDES[ps.i];
      $('h1', root).textContent = `${ps.i + 1}/${SLIDES.length} · ${s.title.ko}  (${ps.step}/${ps.steps})`;
      $('.p-notes', root).textContent = s.notes;
      const n = SLIDES[ps.i + 1];
      $('.p-next', root).textContent = n ? `다음 ▸ ${n.title.ko} · ${n.sec}s` : '마지막 슬라이드';
    };
    const clock = () => {
      const el = $('.p-time', root);
      if (!ps.startedAt) { el.textContent = '00:00 / 20:00'; return; }
      const elapsed = (Date.now() - ps.startedAt) / 1000;
      const delta = elapsed - planned(ps.i);
      el.textContent = `${fmt(elapsed)} / 20:00 · ${delta >= 0 ? '+' : '−'}${fmt(delta)}`;
      el.className = 'p-time ' + (delta > 20 ? 'late' : delta < -20 ? 'early' : '');
    };
    window.addEventListener('message', (e) => {
      if (e.source !== window.opener || !e.data || e.data.type !== 'state') return;
      Object.assign(ps, e.data);
      render();
      clock();
    });
    $('#pp').onclick = () => cmd('prev');
    $('#pn').onclick = () => cmd('next');
    window.addEventListener('keydown', (e) => {
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); cmd('next'); }
      if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); cmd('prev'); }
    });
    setInterval(clock, 1000);
    render();
    cmd('hello');
  }

  /* ---------------- widgets ---------------- */
  const SHIM = `(function(){
    function send(t,a){try{parent.postMessage({__pg:1,type:t,text:a.map(function(x){try{return typeof x==='string'?x:JSON.stringify(x)}catch(e){return String(x)}}).join(' ')},'*')}catch(e){}}
    ['log','info','warn','error'].forEach(function(k){var o=console[k];console[k]=function(){send(k,[].slice.call(arguments));o.apply(console,arguments)}});
    addEventListener('error',function(e){send('error',[e.message])});
    addEventListener('unhandledrejection',function(e){send('error',[String(e.reason)])});
    try{localStorage.getItem('__t')}catch(e){var m={};Object.defineProperty(window,'localStorage',{value:{getItem:function(k){return k in m?m[k]:null},setItem:function(k,v){m[k]=String(v)},removeItem:function(k){delete m[k]},clear:function(){m={}}}})}
  })();`;
  const BASE_CSS = "html{color-scheme:light}body{font:16px/1.5 system-ui,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;margin:14px;background:#fff;color:#1a1d2e}";
  const buildDoc = (html, css, js) =>
    `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}</style><style>${css}</style><script>${SHIM}<\/script></head><body>${html}<script>${js}<\/script></body></html>`;

  const consoles = [];
  window.addEventListener('message', (e) => {
    const d = e.data;
    if (!d) return;
    if (d.__pg) {
      const c = consoles.find((x) => x.frame.contentWindow === e.source);
      if (c && c.cons) {
        const line = document.createElement('div');
        if (d.type === 'error') line.className = 'err';
        line.textContent = (d.type === 'error' ? '✖ ' : '› ') + d.text;
        c.cons.append(line);
        c.cons.scrollTop = c.cons.scrollHeight;
      }
    } else if (d.type === 'hello' && e.source === presenterWin) sync();
    else if (d.type === 'cmd' && e.source === presenterWin) {
      if (d.cmd === 'next') next();
      else if (d.cmd === 'prev') prev();
      else if (d.cmd === 'hello') sync();
    }
  });

  const WIDGETS = {
    playground(root) {
      const frame = $('.pg-frame', root);
      const cons = $('.pg-console', root);
      const ta = {};
      $$('.pg-ta', root).forEach((t) => (ta[t.dataset.file] = t));
      consoles.push({ frame, cons });
      let timer;
      const run = () => {
        if (cons) cons.textContent = '';
        frame.srcdoc = buildDoc(ta.html.value, ta.css.value, ta.js.value);
      };
      const schedule = () => { clearTimeout(timer); timer = setTimeout(run, 400); };
      $$('.pg-tab', root).forEach((b) =>
        b.addEventListener('click', () => {
          $$('.pg-tab', root).forEach((x) => x.classList.toggle('on', x === b));
          $$('.pg-ta', root).forEach((t) => t.classList.toggle('on', t.dataset.file === b.dataset.file));
        })
      );
      Object.values(ta).forEach((t) => {
        t.addEventListener('input', schedule);
        t.addEventListener('keydown', (e) => {
          if (e.key === 'Tab') {
            e.preventDefault();
            t.setRangeText('  ', t.selectionStart, t.selectionEnd, 'end');
            schedule();
          }
        });
      });
      $('.pg-reset', root).addEventListener('click', () => {
        Object.values(ta).forEach((t) => (t.value = t.defaultValue));
        run();
      });
      run();
    },
    anatomy(root) {
      const clear = () => $$('.hl', root).forEach((x) => x.classList.remove('hl'));
      root.addEventListener('mouseover', (e) => {
        const el = e.target.closest('[data-t]');
        clear();
        if (el) $$(`[data-t="${el.dataset.t}"]`, root).forEach((x) => x.classList.add('hl'));
      });
      root.addEventListener('mouseleave', clear);
    },
    tabs(root) {
      $$('.tab', root).forEach((b) =>
        b.addEventListener('click', () => {
          $$('.tab', root).forEach((x) => x.classList.toggle('on', x === b));
          $$('.tab-panel', root).forEach((p) => p.classList.toggle('on', p.dataset.panel === b.dataset.tab));
        })
      );
    },
    loop(root) {
      let n = 0;
      const boxes = $$('.lp-box', root);
      $('.lp-btn', root).addEventListener('click', () => {
        n++;
        boxes.forEach((b) => b.classList.remove('on'));
        boxes.forEach((b, k) =>
          setTimeout(() => {
            boxes.forEach((x) => x.classList.toggle('on', x === b));
            if (k === 0) $('.lp-n', root).textContent = n;
            if (k === 2) $('.lp-n2', root).textContent = n;
          }, k * 380)
        );
        setTimeout(() => boxes.forEach((b) => b.classList.remove('on')), 1500);
      });
    },
    dice(root) {
      const ideas = JSON.parse(root.dataset.ideas);
      const out = $('.dice-out', root);
      $('.dice-btn', root).addEventListener('click', () => {
        let k = 0;
        out.classList.add('roll');
        const id = setInterval(() => {
          out.textContent = ideas[Math.floor(Math.random() * ideas.length)];
          if (++k > 9) { clearInterval(id); out.classList.remove('roll'); }
        }, 70);
      });
    },
  };

  function initWidgets(slideEl) {
    $$('[data-widget]', slideEl).forEach((w) => {
      if (w.dataset.ready) return;
      w.dataset.ready = '1';
      WIDGETS[w.dataset.widget] && WIDGETS[w.dataset.widget](w);
    });
  }

  /* ---------------- overlays ---------------- */
  const close = () => $$('.overlay').forEach((o) => o.classList.remove('open'));
  function openOverview() {
    const ov = $('#overview');
    ov.innerHTML = `<h3>${UI[state.lang].ov}</h3><div class="grid">${SLIDES.map(
      (s, k) => `<button class="ov ${k === state.i ? 'cur' : ''}" data-i="${k}" style="--c:var(--p${s.part})"><small>${k + 1} · ${B.esc(PARTS[s.part][state.lang])}</small><b>${B.esc(s.title[state.lang])}</b><small>${s.sec}s</small></button>`
    ).join('')}</div>`;
    ov.classList.add('open');
  }
  function openHelp() {
    const u = UI[state.lang];
    $('#help').innerHTML = `<h3>${u.help}</h3><div class="keys">${u.keys.map(([k, d]) => `<kbd>${B.esc(k)}</kbd><span>${B.esc(d)}</span>`).join('')}</div>`;
    $('#help').classList.add('open');
  }
  const toggle = (id, open) => ($('#' + id).classList.contains('open') ? close() : open());

  function fullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
  }
  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    store.set('theme', t);
  }
  const toggleTheme = () => setTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light');

  /* ---------------- input ---------------- */
  const typing = (el) => el && (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT' || el.isContentEditable);

  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Escape') { close(); if (typing(e.target)) e.target.blur(); return; }
    if (typing(e.target) || isPresenter) return;
    const onBtn = e.target.tagName === 'BUTTON' || e.target.tagName === 'A';
    switch (e.key) {
      case 'ArrowRight': case 'PageDown': next(); break;
      case ' ': case 'Enter': if (onBtn) return; next(); break;
      case 'ArrowLeft': case 'PageUp': case 'Backspace': prev(); break;
      case 'Home': go(0, 'start'); break;
      case 'End': go(SLIDES.length - 1, 'end'); break;
      case 'l': case 'L': setLang(state.lang === 'ko' ? 'en' : 'ko'); break;
      case 'f': case 'F': fullscreen(); break;
      case 'o': case 'O': toggle('overview', openOverview); break;
      case 'n': case 'N': document.body.classList.toggle('show-notes'); break;
      case 'p': case 'P': openPresenter(); break;
      case 't': case 'T': document.body.classList.toggle('show-timer'); break;
      case 'r': case 'R': state.startedAt = state.i >= 1 ? Date.now() - 0 : 0; sync(); tick(); break;
      case 'd': case 'D': toggleTheme(); break;
      case '?': toggle('help', openHelp); break;
      default: return;
    }
    e.preventDefault();
  });

  $('#next').onclick = next;
  $('#prev').onclick = prev;
  $('#b-lang').onclick = () => setLang(state.lang === 'ko' ? 'en' : 'ko');
  $('#b-ov').onclick = () => toggle('overview', openOverview);
  $('#b-notes').onclick = () => document.body.classList.toggle('show-notes');
  $('#b-pres').onclick = openPresenter;
  $('#b-theme').onclick = toggleTheme;
  $('#b-full').onclick = fullscreen;
  $('#b-help').onclick = () => toggle('help', openHelp);
  $('#overview').addEventListener('click', (e) => {
    const b = e.target.closest('.ov');
    if (b) { close(); jump(+b.dataset.i); } else if (e.target.id === 'overview') close();
  });
  $('#help').addEventListener('click', close);
  deck.addEventListener('click', (e) => {
    const b = e.target.closest('.lang-btn');
    if (b) { setLang(b.dataset.lang); go(1, 'start'); }
  });

  // swipe
  let sx = null;
  window.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
  window.addEventListener('touchend', (e) => {
    if (sx === null || typing(e.target)) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 60) (dx < 0 ? next : prev)();
    sx = null;
  });

  // UI auto-hide + scaling
  let hideTimer;
  window.addEventListener('mousemove', () => {
    document.body.classList.add('ui');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => document.body.classList.remove('ui'), 2500);
  });
  const stage = $('#stage');
  function fit() {
    const s = Math.min(innerWidth / 1280, innerHeight / 720);
    stage.style.transform = `translate(-50%,-50%) scale(${s})`;
  }
  window.addEventListener('resize', fit);
  window.addEventListener('hashchange', () => {
    const n = parseInt(location.hash.slice(1), 10);
    if (n && n - 1 !== state.i) jump(n - 1);
  });

  /* ---------------- boot ---------------- */
  const savedTheme = store.get('theme');
  if (savedTheme) setTheme(savedTheme);
  fit();
  if (isPresenter) {
    initPresenter();
  } else {
    build();
    const n = parseInt(location.hash.slice(1), 10);
    go(n > 0 ? n - 1 : 0, 'start');
    if (params.has('timer')) document.body.classList.add('show-timer');
  }
})();
