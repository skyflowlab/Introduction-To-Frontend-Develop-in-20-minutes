// Generates scripts/script.ko.md (speaker script) from the `notes` in js/slides.js
const fs = require('node:fs');
const path = require('node:path');
const { PARTS, SLIDES } = require('../js/slides.js');

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
const total = SLIDES.reduce((a, s) => a + s.sec, 0);

let t = 0;
const rows = SLIDES.map((s, i) => {
  const from = t;
  t += s.sec;
  return { s, i, from, to: t };
});

const out = [];
out.push('# 발표 대본 — 20분 프론트엔드 입문', '');
out.push('> `npm run script` 로 `js/slides.js`의 notes에서 자동 생성됩니다. 직접 수정하지 말고 slides.js를 고치세요.');
out.push('> 발표는 한국어로 진행하고 기술 용어는 영어 그대로 사용합니다. 슬라이드 창에서 `P` 키 → 발표자 창(대본 + 타이머).', '');
out.push(`**계획 시간 ${fmt(total)} / 20:00** (여유 ${fmt(1200 - total)} — 질문·전환·데모 지연용)`, '');
out.push('| # | 시간 | 구간 | 슬라이드 |', '|---|------|------|----------|');
rows.forEach(({ s, i, from, to }) =>
  out.push(`| ${i + 1} | ${fmt(from)}–${fmt(to)} | ${PARTS[s.part].ko} | ${s.title.ko} |`)
);
out.push('');

let lastPart = -1;
rows.forEach(({ s, i, from, to }) => {
  if (s.part !== lastPart) {
    out.push(`## ${PARTS[s.part].ko}`, '');
    lastPart = s.part;
  }
  out.push(`### ${i + 1}. ${s.title.ko} · \`${fmt(from)}–${fmt(to)}\` (${s.sec}초)`, '');
  out.push(s.notes.split('\n').map((l) => (l.startsWith('▶') ? `> ${l}` : l)).join('\n\n'), '');
});

const file = path.join(__dirname, '..', 'scripts', 'script.ko.md');
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, out.join('\n'));
console.log(`wrote ${path.relative(process.cwd(), file)} (${rows.length} slides, ${fmt(total)})`);
