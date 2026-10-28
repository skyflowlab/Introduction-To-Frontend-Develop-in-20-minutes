# Frontend in 20 minutes · 20분 프론트엔드 입문

Interactive, bilingual (한국어 / English) presentation for newcomers to web development.
The deck is itself a static website: no build step, no dependencies, so it runs on GitHub Pages
(`https://<username>.github.io/<repository>/`) and even from `file://` offline.

| | |
|---|---|
| Talk | Korean (technical terms in English) — script in [`scripts/script.ko.md`](scripts/script.ko.md) |
| Slides | KO / EN, chosen on the cover (toggle any time with **L**) |
| Length | 25 slides, 19:35 planned + ~0:25 slack = 20 min |

## Flow

1. **웹의 세 기둥** — how a browser shows a page, HTML (hover code ↔ element), CSS and JS (live editors), how they connect
2. **직접 만들기** — a real *Task board* in plain JavaScript (DOM, localStorage) running live in the slide, plus fetch and axios error-handling examples (code only)
3. **프레임워크 & React** — built on top of those fundamentals: why frameworks, the landscape (React, Svelte, …), 4 essential React techniques
4. **이제 당신 차례** — project ideas (dice), then an appendix-style setup block (Node, npm, `npm create vite@latest`, `test` / `build` / `audit` / `deploy`, GitHub Pages `base` pitfall), learning resources, wrap-up

## Run

```bash
npm start        # http://localhost:5173  (zero-dependency static server)
npm test         # checks KO/EN parity, timing, highlighter, script export
npm run script   # regenerates scripts/script.ko.md from js/slides.js
```

Or just open `index.html` in a browser.

## Presenting

| Key | Action |
|---|---|
| `→` `Space` / `←` | next (fragment → slide) / previous |
| `L` | language KO ↔ EN |
| `P` | **presenter window** (Korean script, timer with ahead/behind pace, next slide) — drag it to your laptop screen |
| `N` | script drawer on the slide window |
| `T` / `R` | show / reset timer (starts when you leave the cover) |
| `O` | overview, `F` fullscreen, `D` light/dark, `?` help |

Interactive spots: the HTML slide (hover code lines), CSS / JS / Task board slides (editable live playgrounds),
the frameworks slide (state → render loop, Vanilla/React/Svelte tabs), the challenge slide (idea dice).

## Deploy to GitHub Pages

**Option A — GitHub Actions (included).** Push to `main`, then *Settings → Pages → Source: GitHub Actions*.
[`.github/workflows/pages.yml`](.github/workflows/pages.yml) runs `npm test` and publishes the static files.

**Option B — branch.** *Settings → Pages → Deploy from a branch → `main` / `(root)`*.

## Editing the deck

- All slides live in [`js/slides.js`](js/slides.js): `title`, `notes` (Korean script), `sec` (planned seconds), `render(h)`.
  Write both languages with `h.t('한국어', 'English')`; `npm test` fails if the two renders drift apart.
- Code samples: [`js/snippets.js`](js/snippets.js). Widgets/highlighter: [`js/blocks.js`](js/blocks.js). Behaviour: [`js/app.js`](js/app.js). Theme: [`css/style.css`](css/style.css).

## Before you present — double-check

- Version strings on slides (`v24.x.x`, `vite ^7`) are illustrative; adjust to what is current.
- The Task board demo is fully offline (no external API); the `fetch` example on the "Persist & network" slide is code only.
- Resource links on the last slides — click through once.
