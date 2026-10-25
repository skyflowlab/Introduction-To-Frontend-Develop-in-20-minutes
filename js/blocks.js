/*
 * blocks.js — DOM-free string helpers used by slides.js
 * (syntax highlighter + markup for interactive widgets).
 * Works as a classic <script> (file:// friendly) and as a CommonJS module (tests / export script).
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Blocks = api;
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  const esc = (s) =>
    String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const span = (cls, s) => `<span class="tk-${cls}">${esc(s)}</span>`;

  /* ---------- tiny regex tokenizer ---------- */
  // Rules must only use non-capturing groups: capture indexes map 1:1 to rules.
  function tokenize(src, rules) {
    const combined = new RegExp(rules.map((r) => `(${r.re.source})`).join('|'), 'gm');
    let out = '';
    let last = 0;
    let m;
    while ((m = combined.exec(src))) {
      if (m[0] === '') {
        combined.lastIndex++;
        continue;
      }
      let idx = 0;
      while (m[idx + 1] === undefined) idx++;
      const rule = rules[idx];
      out += esc(src.slice(last, m.index));
      out += rule.fn ? rule.fn(m[0]) : span(rule.cls, m[0]);
      last = m.index + m[0].length;
    }
    return out + esc(src.slice(last));
  }

  const JS_KW =
    'const|let|var|function|return|if|else|for|while|of|in|new|class|extends|import|from|export|default|async|await|try|catch|finally|throw|typeof|instanceof|switch|case|break|continue|true|false|null|undefined|this|void';

  const jsRules = [
    { cls: 'c', re: /\/\/[^\n]*|\/\*[\s\S]*?\*\// },
    { cls: 's', re: /`(?:\\[\s\S]|[^`\\])*`|'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"/ },
    { cls: 'k', re: new RegExp('\\$(?:state|derived|effect|props)\\b|\\b(?:' + JS_KW + ')\\b') },
    { cls: 'n', re: /\b\d+(?:\.\d+)?\b/ },
    { cls: 'f', re: /[A-Za-z_$][\w$]*(?=\()/ },
  ];

  function tagHtml(m) {
    const re = /^(<\/?)([\w!-]+)|([\w:@.-]+)(?==)|"[^"]*"|'[^']*'/g;
    let out = '';
    let last = 0;
    let x;
    while ((x = re.exec(m))) {
      out += esc(m.slice(last, x.index));
      if (x[2] !== undefined) out += `<span class="tk-p">${esc(x[1])}</span><span class="tk-t">${esc(x[2])}</span>`;
      else if (x[3] !== undefined) out += `<span class="tk-a">${esc(x[3])}</span>`;
      else out += span('s', x[0]);
      last = x.index + x[0].length;
    }
    out += esc(m.slice(last));
    return out;
  }

  function blockTag(m, tag, lang) {
    const open = m.match(/^<[^>]*>/)[0];
    const close = `</${tag}>`;
    const inner = m.slice(open.length, m.length - close.length);
    return tagHtml(open) + highlight(lang, inner) + tagHtml(close);
  }

  const htmlRules = [
    { cls: 'c', re: /<!--[\s\S]*?-->/ },
    { fn: (m) => blockTag(m, 'style', 'css'), re: /<style[^>]*>[\s\S]*?<\/style>/ },
    { fn: (m) => blockTag(m, 'script', 'js'), re: /<script[^>]*>[\s\S]*?<\/script>/ },
    { fn: tagHtml, re: /<\/?[A-Za-z!][^>]*>/ },
  ];

  const jsxRules = [
    jsRules[0],
    jsRules[1],
    { fn: tagHtml, re: /<\/?[A-Za-z][\w.]*(?:=>|[^<>])*?\/?>/ },
    jsRules[2],
    jsRules[3],
    jsRules[4],
  ];

  const svelteRules = [
    htmlRules[0],
    htmlRules[1],
    htmlRules[2],
    htmlRules[3],
    { cls: 'f', re: /\{[^{}\n]*\}/ },
  ];

  const cssRules = [
    { cls: 'c', re: /\/\*[\s\S]*?\*\// },
    { cls: 's', re: /"[^"]*"|'[^']*'/ },
    { cls: 'k', re: /@[\w-]+/ },
    {
      cls: 'n',
      re: /#[0-9a-fA-F]{3,8}\b|(?<![\w-])-?(?:\d+\.?\d*|\.\d+)(?:px|rem|em|%|vh|vw|ms|s|deg|fr)?(?![\w-])/,
    },
    { cls: 'a', re: /--[\w-]+(?=\s*:)|[a-z-]+(?=\s*:[^{};]*[;}])/ },
    { cls: 't', re: /[.#][A-Za-z_-][\w-]*|::?[a-z-]+(?:\([^)]*\))?/ },
  ];

  const shRules = [
    { cls: 'c', re: /(?<=^|\s)#[^\n]*/ },
    { cls: 's', re: /"[^"\n]*"|'[^'\n]*'/ },
    { cls: 'f', re: /^[A-Za-z][\w.-]*/ },
    { cls: 'n', re: /(?<=\s)--?[A-Za-z][\w-]*/ },
  ];

  const jsonRules = [
    { cls: 'a', re: /"(?:\\.|[^"\\])*"(?=\s*:)/ },
    { cls: 's', re: /"(?:\\.|[^"\\])*"/ },
    { cls: 'n', re: /-?\d+(?:\.\d+)?/ },
    { cls: 'k', re: /\b(?:true|false|null)\b/ },
  ];

  const RULES = {
    js: jsRules,
    jsx: jsxRules,
    html: htmlRules,
    svelte: svelteRules,
    css: cssRules,
    sh: shRules,
    json: jsonRules,
  };

  function highlight(lang, src) {
    const rules = RULES[lang];
    return rules ? tokenize(src, rules) : esc(src);
  }

  /* ---------- helper factory (bound to a language) ---------- */
  function make(L) {
    const t = (ko, en) => (L === 'ko' ? ko : en);

    // code(lang, src, { steps, size, label })  — "§§" on its own line splits fragments
    function code(lang, src, o = {}) {
      src = src.replace(/^\n+/, '').replace(/\s+$/, '');
      const parts = o.steps ? src.split(/\n?§§\n/) : [src];
      const body = o.steps
        ? parts.map((p) => `<span class="frag cf">${highlight(lang, p)}</span>`).join('')
        : highlight(lang, src);
      const label = o.label ? `<div class="cb-label">${esc(o.label)}</div>` : '';
      return `<div class="codeblock ${o.size || ''} ${o.cls || ''}">${label}<pre class="code" data-lang="${lang}"><code>${body}</code></pre></div>`;
    }

    // inline code
    const ic = (s) => `<code class="ic">${esc(s)}</code>`;

    function tabs(items, o = {}) {
      return `<div class="tabs ${o.cls || ''}" data-widget="tabs">
        <div class="tab-bar">${items
          .map((it, i) => `<button class="tab ${i === 0 ? 'on' : ''}" data-tab="${i}">${esc(it.label)}</button>`)
          .join('')}</div>
        ${items
          .map(
            (it, i) =>
              `<div class="tab-panel ${i === 0 ? 'on' : ''}" data-panel="${i}">${code(it.lang, it.code, { size: o.size })}</div>`
          )
          .join('')}
      </div>`;
    }

    // items: [{ cmd, out }]
    function terminal(items, o = {}) {
      return `<div class="term ${o.cls || ''}">
        <div class="term-bar"><i></i><i></i><i></i><span>${esc(o.title || 'terminal')}</span></div>
        <div class="term-body">${items
          .map(
            (it) =>
              `<div class="frag tl"><div class="tl-cmd"><span class="ps">$</span> ${highlight('sh', it.cmd)}</div>${
                it.out ? `<pre class="tl-out">${esc(it.out)}</pre>` : ''
              }</div>`
          )
          .join('')}</div>
      </div>`;
    }

    // o: { html, css, js, edit: ['css'], height, console }
    function playground(o) {
      const edit = o.edit || ['html', 'css', 'js'];
      const label = { html: 'HTML', css: 'CSS', js: 'JS' };
      return `<div class="pg" data-widget="playground" data-console="${o.console ? 1 : 0}" style="height:${o.height || 400}px">
        <div class="pg-code">
          <div class="pg-tabs">${edit
            .map((f, i) => `<button class="pg-tab t-${f} ${i === 0 ? 'on' : ''}" data-file="${f}">${label[f]}</button>`)
            .join('')}<span class="pg-hint">${t('직접 고쳐보세요', 'Edit me live')}</span><button class="pg-reset" title="${t('초기화', 'Reset')}">↺</button></div>
          ${['html', 'css', 'js']
            .map(
              (f) =>
                `<textarea class="pg-ta ${edit.includes(f) ? '' : 'off'} ${f === edit[0] ? 'on' : ''}" data-file="${f}" spellcheck="false" autocomplete="off">${esc(
                  o[f] || ''
                )}</textarea>`
            )
            .join('')}
        </div>
        <div class="pg-out">
          <div class="pg-bar"><i></i><i></i><i></i><span>preview</span></div>
          <iframe class="pg-frame" title="preview"></iframe>
          ${o.console ? '<pre class="pg-console" aria-label="console"></pre>' : ''}
        </div>
      </div>`;
    }

    // lines: [[code, targetId, indent]], preview: html with data-t attributes
    function anatomy(lines, preview) {
      return `<div class="anat" data-widget="anatomy">
        <div class="an-code"><pre class="code">${lines
          .map(
            (l, i) =>
              `<div class="an-line" data-t="${l[1]}"><span class="an-no">${i + 1}</span>${highlight(
                'html',
                '  '.repeat(l[2] || 0) + l[0]
              )}</div>`
          )
          .join('')}</pre></div>
        <div class="an-view"><div class="pg-bar"><i></i><i></i><i></i><span>browser</span></div><div class="pv-page">${preview}</div></div>
      </div>`;
    }

    function loop() {
      return `<div class="loop" data-widget="loop">
        <div class="lp-row">
          <div class="lp-box lp-state" data-s="0"><b>state</b><span class="lp-n">0</span></div>
          <div class="lp-arrow">→</div>
          <div class="lp-box lp-render" data-s="1"><b>render()</b><small>${t('state로 화면을 계산', 'compute UI from state')}</small></div>
          <div class="lp-arrow">→</div>
          <div class="lp-box lp-dom" data-s="2"><b>DOM</b><small>${t('바뀐 부분만 갱신', 'only changes applied')}</small></div>
        </div>
        <button class="lp-btn">${t('클릭 = setState(n + 1)', 'click = setState(n + 1)')}</button>
        <div class="lp-ui"><span class="lp-label">UI</span><button class="lp-fake">Clicked <b class="lp-n2">0</b></button></div>
      </div>`;
    }

    function dice(ideas) {
      return `<div class="dice" data-widget="dice" data-ideas="${esc(JSON.stringify(ideas))}">
        <button class="dice-btn">🎲 ${t('아이디어 뽑기', 'Roll an idea')}</button>
        <div class="dice-out">${t('버튼을 눌러보세요', 'Press the button')}</div>
      </div>`;
    }

    const pill = (k, label) => `<span class="pill ${k}">${esc(label || k.toUpperCase())}</span>`;

    return { L, t, esc, code, ic, tabs, terminal, playground, anatomy, loop, dice, pill, highlight };
  }

  return { esc, highlight, make };
});
