const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { PARTS, SLIDES } = require('../js/slides.js');
const Blocks = require('../js/blocks.js');

const count = (s, re) => (s.match(re) || []).length;
const plain = (html) =>
  html.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');

test('slide ids are unique and fields are complete', () => {
  const ids = new Set();
  for (const s of SLIDES) {
    assert.ok(!ids.has(s.id), `duplicate id ${s.id}`);
    ids.add(s.id);
    assert.ok(s.title.ko && s.title.en, `${s.id}: bilingual title`);
    assert.ok(s.notes && s.notes.length > 80, `${s.id}: Korean speaker notes`);
    assert.ok(s.sec > 0, `${s.id}: planned seconds`);
    assert.ok(PARTS[s.part], `${s.id}: valid part`);
  }
});

test('planned time fits in 20 minutes with some slack', () => {
  const total = SLIDES.reduce((a, s) => a + s.sec, 0);
  assert.ok(total <= 1200, `total ${total}s exceeds 20 min`);
  assert.ok(total >= 1000, `total ${total}s leaves too much slack`);
});

test('KO and EN renders are structurally identical', () => {
  for (const s of SLIDES) {
    const ko = s.render(Blocks.make('ko'));
    const en = s.render(Blocks.make('en'));
    for (const out of [ko, en]) {
      assert.ok(out.length > 50, `${s.id}: renders content`);
      assert.ok(!/undefined|\[object/.test(out), `${s.id}: no undefined/[object] leaks`);
    }
    for (const re of [/class="[^"]*\bfrag\b/g, /data-widget=/g, /<textarea/g, /<a /g]) {
      assert.equal(count(ko, re), count(en, re), `${s.id}: ${re} count differs between ko/en`);
    }
  }
});

test('English render contains no Hangul outside the cover', () => {
  for (const s of SLIDES) {
    if (s.id === 'cover') continue;
    const en = s.render(Blocks.make('en'));
    assert.ok(!/[가-힣]/.test(en), `${s.id}: Korean text left in English render`);
  }
});

test('highlighter escapes HTML and keeps text intact', () => {
  const src = '<p class="a">x < y && z</p>';
  const out = Blocks.highlight('html', src);
  assert.ok(!out.includes('<p class'), 'raw tag must be escaped');
  assert.equal(plain(out), src);
});

test('highlighter round-trips every code snippet', () => {
  const Snip = require('../js/snippets.js');
  const langOf = {
    cmpReact: 'jsx', react1: 'jsx', react2: 'jsx', react3: 'jsx', react4: 'jsx',
    cmpSvelte: 'svelte', npmPackage: 'json', npmScripts: 'json',
    cardCss: 'css', taskCss: 'css', stepCss: 'css',
    cardHtml: 'html', taskHtml: 'html', stepHtml: 'html', counterHtml: 'html', linkScript: 'html',
  };
  for (const [k, src] of Object.entries(Snip)) {
    const lang = langOf[k] || 'js';
    assert.equal(plain(Blocks.highlight(lang, src)), src, `${k} (${lang}) text changed by highlighting`);
  }
});

test('speaker script is generated and covers every slide', () => {
  require('child_process').execFileSync(process.execPath, [path.join(__dirname, '..', 'tools', 'export-script.js')]);
  const md = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'script.ko.md'), 'utf8');
  for (const s of SLIDES) assert.ok(md.includes(s.title.ko), `${s.id} missing from script`);
});
