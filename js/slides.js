/*
 * slides.js — the deck. One object per slide:
 *   id, part, sec (planned seconds), title {ko,en}, notes (Korean speaker script), render(h) -> HTML
 * `h` is the helper bundle from Blocks.make(lang); h.t(ko, en) picks the language.
 * Loaded as a classic <script> in the browser and via require() in tests / export script.
 */
(function (root, factory) {
  const deps = typeof module === 'object' && module.exports ? { Snippets: require('./snippets.js') } : root;
  const api = factory(deps.Snippets);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Deck = api;
})(typeof self !== 'undefined' ? self : globalThis, function (S) {
  'use strict';

  const PARTS = [
    { ko: '시작', en: 'Intro', c: 0 },
    { ko: '① 웹의 세 기둥', en: '① The web trio', c: 1 },
    { ko: '② 직접 만들기', en: '② Build it', c: 3 },
    { ko: '③ 프레임워크 & React', en: '③ Frameworks & React', c: 4 },
    { ko: '④ 이제 당신 차례', en: '④ Your turn', c: 5 },
  ];
  // Node & npm are appendix-style: they sit inside "Your turn" with their own kicker
  const SETUP = { ko: '④ 개발 환경 세팅 (부록)', en: '④ Set up your environment (appendix)' };

  const SLIDES = [
    /* ===================================================== 0. INTRO */
    {
      id: 'cover',
      part: 0,
      sec: 20,
      layout: 'center',
      title: { ko: '표지', en: 'Cover' },
      notes: `안녕하세요. 오늘 20분 동안 프론트엔드 개발의 "전체 지도"를 함께 그려보겠습니다. 깊이보다 넓이, 외우기보다 길 찾기가 목표입니다.
▶ 화면의 [한국어 / English] 버튼으로 슬라이드 언어를 고릅니다. (발표는 한국어로 진행되고, 슬라이드 언어만 바뀝니다.)
▶ 조작법: 화살표로 넘기고, F는 전체화면, ?는 도움말입니다.`,
      render: () => `
        <div class="cover">
          <div class="cover-badge">20 min · Frontend</div>
          <h1><span class="c-html">HTML</span> · <span class="c-css">CSS</span> · <span class="c-js">JS</span><br><span class="c-arrow">→</span> React</h1>
          <p class="cover-sub">20분 만에 훑는 프론트엔드 개발 입문</p>
          <p class="cover-sub en">Frontend development in 20 minutes</p>
          <div class="lang-pick">
            <span>언어를 선택하세요 · Choose your language</span>
            <div>
              <button class="lang-btn" data-lang="ko">한국어</button>
              <button class="lang-btn" data-lang="en">English</button>
            </div>
          </div>
          <p class="hint"><kbd>←</kbd> <kbd>→</kbd> · <kbd>F</kbd> fullscreen · <kbd>?</kbd> help</p>
        </div>`,
    },

    {
      id: 'roadmap',
      part: 0,
      sec: 20,
      title: { ko: '오늘의 지도', en: "Today's map" },
      notes: `오늘은 네 정거장을 지납니다. 먼저 웹의 기본기인 HTML, CSS, JavaScript를 이해합니다. 그다음 그 기본기만으로 실제 서비스처럼 동작하는 예제를 직접 만들어 봅니다. 기본기를 알아야 프레임워크가 "무엇을 대신해 주는지" 보이기 때문에, 세 번째로 React 같은 프레임워크를 기본기 위에 얹어서 살펴봅니다. 마지막은 여러분이 직접 만들 차례이고, 이때 필요한 개발 환경인 Node와 npm, 배포는 부록처럼 뒤에서 다룹니다.
목표는 하나입니다. 20분 뒤에 "모르는 게 생겨도 어디서 찾아야 하는지 아는 사람"이 되는 것.`,
      render: ({ t }) => `
        <p class="lead">${t(
          '목표: 다 외우기가 아니라, <b>스스로 길을 찾을 수 있는 지도</b> 갖기',
          'Goal: not memorizing everything — getting a <b>map you can navigate on your own</b>'
        )}</p>
        <div class="stops">
          <div class="frag stop p1"><b>1</b><h3>${t('웹의 세 기둥', 'The web trio')}</h3><p>HTML · CSS · JavaScript</p><small>≈ 5 min</small></div>
          <div class="frag stop p3"><b>2</b><h3>${t('직접 만들기', 'Build it')}</h3><p>${t('순수 JS로 Task board — DOM · 저장', 'Task board in plain JS — DOM · storage')}</p><small>≈ 3 min</small></div>
          <div class="frag stop p4"><b>3</b><h3>${t('프레임워크 & React', 'Frameworks & React')}</h3><p>${t('기본기 위에 얹기 — React · Svelte · 핵심 기술 4가지', 'On top of the basics — React · Svelte · 4 key techniques')}</p><small>≈ 5 min</small></div>
          <div class="frag stop p5"><b>4</b><h3>${t('이제 당신 차례', 'Your turn')}</h3><p>${t('나만의 서비스 · 개발 환경(Node · npm · 배포) · 리소스', 'Your own service · setup (Node · npm · deploy) · resources')}</p><small>≈ 5 min</small></div>
        </div>
        <p class="frag muted center">${t(
          '이 발표 자체가 <b>정적 웹사이트</b>입니다 — 개발자도구(F12)로 뜯어보세요',
          'This deck is itself a <b>static website</b> — open DevTools (F12) and take it apart'
        )}</p>`,
    },

    /* ===================================================== 1. WEB TRIO */
    {
      id: 'web',
      part: 1,
      sec: 55,
      title: { ko: '브라우저는 어떻게 웹을 보여줄까', en: 'How a browser shows a page' },
      notes: `웹 개발을 시작하기 전에, 주소창에 URL을 치면 무슨 일이 일어나는지부터 봅시다.
①주소를 치면 브라우저가 서버를 찾고, ②HTTP 요청을 보냅니다. ③서버는 HTML 파일을 돌려주고, ④브라우저는 그 HTML을 읽다가 link와 script 태그를 만나면 CSS와 JS 파일을 추가로 요청합니다. ⑤마지막으로 이것들을 합쳐서 화면을 그립니다.
핵심은, 서버가 주는 건 결국 "텍스트 파일 세 종류"라는 점입니다. 그래서 웹은 누구나 열어볼 수 있습니다.
▶ F12를 눌러 Network 탭을 보여주세요. 이 발표 자체가 정적 사이트라는 걸 강조합니다.`,
      render: ({ t, ic }) => `
        <div class="flow">
          <div class="frag step"><div class="ico">⌨️</div><b>1</b><h4>${t('URL 입력', 'Enter a URL')}</h4><p>${t('브라우저가 서버 주소를 찾는다 (DNS)', 'The browser finds the server (DNS)')}</p></div>
          <div class="frag step"><div class="ico">📨</div><b>2</b><h4>${t('HTTP 요청', 'HTTP request')}</h4><p>${ic('GET /index.html')}</p></div>
          <div class="frag step"><div class="ico">📄</div><b>3</b><h4>${t('HTML 응답', 'HTML response')}</h4><p>${t('서버가 파일을 돌려준다', 'The server returns a file')}</p></div>
          <div class="frag step"><div class="ico">🔗</div><b>4</b><h4>${t('추가 요청', 'More requests')}</h4><p>${t('link·script를 보고 CSS/JS도 요청', 'Sees link/script → asks for CSS & JS')}</p></div>
          <div class="frag step"><div class="ico">🖼️</div><b>5</b><h4>${t('화면 그리기', 'Render')}</h4><p>${t('DOM + 스타일 → 픽셀', 'DOM + styles → pixels')}</p></div>
        </div>
        <div class="cols">
          <div class="frag callout">
            <h4>${t('서버가 주는 것 = 텍스트 파일 3종', 'What the server sends = 3 kinds of text files')}</h4>
            <div class="files"><span class="file html">index.html</span><span class="file css">style.css</span><span class="file js">app.js</span></div>
          </div>
          <div class="frag callout">
            <h4>${t('직접 확인하기', 'See it yourself')}</h4>
            <p><kbd>F12</kbd> → <b>Network</b> ${t('탭 → 새로고침. 요청과 응답이 그대로 보입니다.', 'tab → reload. Every request and response is right there.')}</p>
          </div>
        </div>`,
    },

    {
      id: 'html',
      part: 1,
      sec: 50,
      title: { ko: 'HTML — 구조', en: 'HTML — structure' },
      notes: `HTML은 "이 페이지에 무엇이 있는가"를 적는 언어입니다. 프로그래밍 언어라기보다 문서의 구조를 표시하는 마크업 언어예요.
▶ 왼쪽 코드 줄에 마우스를 올려보세요. 오른쪽 화면에서 해당 요소가 강조됩니다. 반대로 화면의 요소에 올려도 코드가 강조됩니다.
꺾쇠로 둘러싼 것이 태그, 태그로 만든 덩어리가 요소(element), href나 alt처럼 태그 안에 붙는 추가 정보가 속성(attribute)입니다.
header, nav, main, footer 같은 "의미 있는 태그"를 쓰면 접근성과 검색 노출, 그리고 코드 가독성이 좋아집니다. div만 쓰지 마세요.`,
      render: ({ t, anatomy, ic }) => `
        ${anatomy(
          [
            ['<header>', 'header', 0],
            ['<h1>My Page</h1>', 'h1', 1],
            ['<nav>', 'nav', 1],
            ['<a href="/">Home</a>', 'a1', 2],
            ['<a href="/about">About</a>', 'a2', 2],
            ['</nav>', 'nav', 1],
            ['</header>', 'header', 0],
            ['<main>', 'main', 0],
            ['<h2>Hello, web!</h2>', 'h2', 1],
            ['<p>HTML is the <em>structure</em>.</p>', 'p', 1],
            ['<button>Click me</button>', 'btn', 1],
            ['</main>', 'main', 0],
            ['<footer>© 2026</footer>', 'footer', 0],
          ],
          `<header data-t="header"><h1 data-t="h1">My Page</h1><nav data-t="nav"><a data-t="a1">Home</a><a data-t="a2">About</a></nav></header>
           <main data-t="main"><h2 data-t="h2">Hello, web!</h2><p data-t="p">HTML is the <em>structure</em>.</p><button data-t="btn">Click me</button></main>
           <footer data-t="footer">© 2026</footer>`
        )}
        <div class="cols three">
          <div class="mini"><b>${t('태그 / 요소', 'Tag / element')}</b><span>${ic('<p>…</p>')}</span></div>
          <div class="mini"><b>${t('속성', 'Attribute')}</b><span>${ic('href="/about"')}</span></div>
          <div class="mini"><b>${t('의미 있는 태그', 'Semantic tags')}</b><span>${ic('header nav main footer')}</span></div>
        </div>`,
    },

    {
      id: 'css',
      part: 1,
      sec: 50,
      title: { ko: 'CSS — 모양', en: 'CSS — appearance' },
      notes: `CSS는 "어떻게 보이는가"를 정합니다. 구조는 선택자, 중괄호 안에 속성: 값; 이 세 가지만 알면 읽을 수 있습니다.
▶ 오른쪽 미리보기를 보면서 CSS를 직접 고쳐보세요. 예를 들어 border-radius를 50%로, background를 하늘색으로, hover 색을 바꿔봅니다. 저장 버튼 없이 바로 반영됩니다.
CSS는 암기 과목이 아닙니다. 모르면 MDN에서 속성 이름을 검색하는 게 정석입니다. 레이아웃은 Flexbox와 Grid 두 개만 먼저 익히세요.`,
      render: ({ t, playground, ic }) => `
        ${playground({ html: S.cardHtml, css: S.cardCss, edit: ['css', 'html'], height: 360 })}
        <div class="cols three">
          <div class="mini css"><b>${t('선택자', 'Selector')}</b><span>${ic('.card  h3  button:hover')}</span></div>
          <div class="mini css"><b>${t('속성: 값', 'property: value')}</b><span>${ic('padding: 20px;')}</span></div>
          <div class="mini css"><b>${t('먼저 익힐 것', 'Learn first')}</b><span>${ic('Box model · Flexbox · Grid')}</span></div>
        </div>`,
    },

    {
      id: 'js',
      part: 1,
      sec: 50,
      title: { ko: 'JavaScript — 동작', en: 'JavaScript — behavior' },
      notes: `JavaScript는 페이지를 "움직이게" 합니다. 패턴은 항상 세 단계예요. 요소를 찾고, 이벤트를 기다리고, 내용을 바꾼다.
▶ 코드를 읽어 드립니다. querySelector로 버튼을 찾고, addEventListener로 클릭을 기다리고, textContent로 글자를 바꿉니다. 버튼을 눌러보시면 오른쪽 console에도 로그가 찍힙니다.
▶ 주석을 풀어서 색이 바뀌는 것까지 보여주세요.
여러분이 이미 다른 언어를 아신다면 문법은 금방 익숙해지실 거예요. 새로운 건 "브라우저가 주는 객체", 즉 document와 DOM이라는 점이 포인트입니다.`,
      render: ({ t, playground, ic }) => `
        ${playground({ html: S.counterHtml, css: S.counterCss, js: S.counterJs, edit: ['js', 'html'], height: 360, console: true })}
        <div class="cols three">
          <div class="mini js"><b>1 · ${t('찾기', 'Find')}</b><span>${ic('querySelector')}</span></div>
          <div class="mini js"><b>2 · ${t('기다리기', 'Listen')}</b><span>${ic('addEventListener')}</span></div>
          <div class="mini js"><b>3 · ${t('바꾸기', 'Change')}</b><span>${ic('textContent · style · classList')}</span></div>
        </div>`,
    },

    {
      id: 'relation',
      part: 1,
      sec: 50,
      title: { ko: '셋은 어떻게 이어질까', en: 'How the three connect' },
      notes: `정리해 볼까요. HTML은 뼈대, CSS는 옷, JavaScript는 근육입니다. 각자 역할이 달라서 파일도 나눕니다. 이걸 관심사의 분리라고 부릅니다.
연결 방법은 간단합니다. HTML 안에 link 태그로 CSS를, script 태그로 JS를 불러옵니다.
그리고 셋을 이어주는 접점이 DOM과 class, id입니다. 브라우저는 HTML을 DOM이라는 트리로 만들고, CSS는 class로 그 요소를 골라 꾸미고, JS는 id나 selector로 같은 요소를 찾아 바꿉니다.
한 문장: "HTML이 만든 DOM을 CSS가 꾸미고, JS가 바꾼다." 이 문장을 기억해 주세요.`,
      render: ({ t, code }) => `
        <div class="trio">
          <div class="frag tcard html"><div class="t-ico">🦴</div><h3>HTML</h3><p class="role">${t('구조 · 의미', 'Structure · meaning')}</p><p>${t('무엇이 있는가?', 'What is on the page?')}</p><small>${t('제목, 문단, 버튼, 입력창…', 'headings, paragraphs, buttons, inputs…')}</small></div>
          <div class="frag tcard css"><div class="t-ico">👕</div><h3>CSS</h3><p class="role">${t('모양 · 배치', 'Look · layout')}</p><p>${t('어떻게 보이는가?', 'How does it look?')}</p><small>${t('색, 크기, 간격, 반응형…', 'color, size, spacing, responsive…')}</small></div>
          <div class="frag tcard js"><div class="t-ico">💪</div><h3>JavaScript</h3><p class="role">${t('동작 · 데이터', 'Behavior · data')}</p><p>${t('어떻게 움직이는가?', 'How does it react?')}</p><small>${t('클릭, 입력, 서버 통신…', 'clicks, input, network…')}</small></div>
        </div>
        <div class="cols">
          <div class="frag">
            <h4>${t('① 파일 연결', '① Linking files')}</h4>
            ${code('html', S.linkScript, { size: 'sm' })}
          </div>
          <div class="frag">
            <h4>${t('② 접점 = DOM + class/id', '② Meeting point = DOM + class/id')}</h4>
            <div class="hooks">
              <div class="hk html">&lt;button <b>id="buy"</b> <b>class="primary"</b>&gt;</div>
              <div class="hk css">.primary { … }</div>
              <div class="hk js">querySelector('#buy')</div>
            </div>
          </div>
        </div>
        <div class="frag banner">${t(
          'HTML이 만든 <b>DOM</b>을 → CSS가 <b>꾸미고</b> → JS가 <b>바꾼다</b>',
          'HTML builds the <b>DOM</b> → CSS <b>styles</b> it → JS <b>changes</b> it'
        )}</div>`,
    },

    /* ===================================================== 3. BUILD */
    {
      id: 'task',
      part: 2,
      sec: 45,
      title: { ko: '실전 예제: Task board', en: 'A real example: Task board' },
      notes: `이제 진짜 서비스의 뼈대를 만들어 봅니다. 할 일 보드인데요, 작아 보여도 실제 서비스가 가진 요소가 다 들어 있습니다. 추가, 완료 체크, 삭제, 그리고 새로고침해도 남는 저장까지 들어 있습니다.
▶ 여기 미리보기에서 할 일을 추가하고, 체크하고, 지워 보세요. 그리고 코드 탭에서 직접 고쳐도 됩니다. 외부 서버 없이 브라우저 안에서만 동작하므로 네트워크 걱정은 없습니다.
실제 서비스의 뼈대는 데이터, 화면, 저장, 통신입니다. 이 예제는 앞의 셋을 다루고, 통신은 세 번째 단계에서 코드로만 살펴봅니다. 코드를 세 단계로 나눠서 보겠습니다.`,
      render: ({ t, playground }) => `
        <div class="chips">
          <span class="chip">＋ ${t('추가', 'add')}</span><span class="chip">☑ ${t('완료', 'complete')}</span><span class="chip">✕ ${t('삭제', 'delete')}</span>
          <span class="chip">💾 ${t('새로고침해도 유지', 'survives reload')}</span>
        </div>
        ${playground({ html: S.taskHtml, css: S.taskCss, js: S.taskJs, edit: ['js', 'html', 'css'], height: 470 })}`,
    },

    {
      id: 'step1',
      part: 2,
      sec: 45,
      title: { ko: 'Step 1 — 뼈대 (HTML / CSS)', en: 'Step 1 — Skeleton (HTML / CSS)' },
      notes: `1단계는 뼈대입니다. HTML에서 중요한 건 id입니다. form, input, ul, span에 id를 달아두면, 나중에 JS가 이 id를 손잡이처럼 잡고 움직입니다.
CSS에서는 한 가지 요령만 기억하세요. 모양이 바뀌어야 하는 상태, 예를 들어 "완료됨"을 클래스 하나, done으로 표현합니다. 그러면 JS는 스타일을 직접 만지지 않고 클래스만 붙였다 뗍니다. 역할 분리가 깔끔해집니다.`,
      render: ({ t, code }) => `
        <div class="cols">
          <div class="frag">${code('html', S.stepHtml, { label: 'index.html' })}
            <p class="note">${t('<b>id</b> = JS가 잡을 손잡이', '<b>id</b> = the handle JS grabs')}</p></div>
          <div class="frag">${code('css', S.stepCss, { label: 'style.css' })}
            <p class="note">${t('상태 → <b>클래스</b>로 표현. JS는 클래스만 토글', 'State → expressed as a <b>class</b>. JS only toggles it')}</p></div>
        </div>
        <div class="frag banner">${t('HTML = <b>있어야 할 것</b> · CSS = <b>상태별 모양</b> · JS = 곧 연결', 'HTML = <b>what exists</b> · CSS = <b>look per state</b> · JS = next')}</div>`,
    },

    {
      id: 'step2',
      part: 2,
      sec: 50,
      title: { ko: 'Step 2 — JavaScript로 DOM 바꾸기', en: 'Step 2 — Changing the DOM with JavaScript' },
      notes: `2단계는 JavaScript가 웹 페이지를 실제로 바꾸는 방법입니다. 핵심은 DOM이에요. 브라우저는 HTML을 DOM이라는 트리 객체로 만들어 두고, JavaScript는 그 객체를 직접 만질 수 있습니다.
첫째, 찾기. querySelector로 DOM의 원하는 요소를 잡습니다.
둘째, 바꾸기. createElement로 요소를 만들고, append로 붙이고, textContent로 글자를 바꾸고, classList로 클래스를 넣고 빼고, remove로 지웁니다. 코드가 실행되는 순간 화면이 바뀝니다.
셋째, 이벤트. 사용자가 제출이나 클릭을 하면 우리가 등록한 함수가 실행되고, 그 안에서 DOM을 바꿉니다. 사용자 동작, 핸들러, DOM 변경. 이 흐름이 웹 인터랙션의 전부입니다.
아래 그림을 보면, DOM이 바뀔 때마다 브라우저가 스타일을 다시 계산하고, 배치를 잡고, 화면에 다시 그립니다. 그래서 CSS가 .done 클래스만 보고 취소선을 그려 주는 거예요.
마지막으로 실제 앱은 데이터를 배열 같은 변수에 들고 있으면서 이 DOM 조작을 합니다. 전체 코드는 앞의 데모에 있습니다.
▶ 여기서는 프레임워크 이야기를 하지 않고, 순수 JavaScript의 DOM 조작만 설명합니다.`,
      render: ({ t, code }) => `
        ${code('js', S.stepState, { steps: true, cls: 'scroll tall' })}
        <div class="frag callout">
          <h4>${t('DOM이 바뀌면 브라우저는…', 'When the DOM changes, the browser…')}</h4>
          <div class="chips">
            <span class="chip">DOM ${t('변경', 'change')}</span><span class="chip">→</span>
            <span class="chip">Style ${t('다시 계산', 'recalculate')}</span><span class="chip">→</span>
            <span class="chip">Layout ${t('배치', 'position')}</span><span class="chip">→</span>
            <span class="chip">Paint ${t('다시 그리기', 'redraw')}</span>
          </div>
        </div>`,
    },

    {
      id: 'step3',
      part: 2,
      sec: 50,
      title: { ko: 'Step 3 — 저장하고 통신하기', en: 'Step 3 — Persist & network' },
      notes: `3단계는 서비스다운 기능입니다. 저장과 통신.
localStorage는 브라우저에 문자열을 저장하는 작은 창고예요. 객체는 JSON.stringify로 문자열로 바꿔 넣고, 꺼낼 때 JSON.parse로 되돌립니다.
외부 서버와 통신할 때는 fetch를 씁니다. 이 부분은 데모에는 넣지 않았고 코드로만 보여드립니다. async, await로 읽기 쉽게 쓰고, 중요한 건 "네트워크는 실패한다"는 전제입니다. res.ok를 확인하고 try-catch로 에러를 처리하세요.
마지막으로 보안 한 가지. 사용자 입력을 innerHTML에 그대로 넣으면 XSS 공격에 노출됩니다. 그래서 우리 코드에서는 textContent를 썼습니다.`,
      render: ({ t, code }) => `
        <div class="cols">
          <div>
            ${code('js', S.stepPersist, { size: 'sm' })}
            <div style="height:14px"></div>
            ${code('js', S.stepFetch, { size: 'sm' })}
          </div>
          <div class="side">
            <div class="frag callout"><h4>💾 localStorage</h4><p>${t('문자열만 저장 → <code class="ic">JSON.stringify / parse</code>', 'strings only → <code class="ic">JSON.stringify / parse</code>')}</p></div>
            <div class="frag callout"><h4>🌐 fetch</h4><p>${t('네트워크는 <b>실패한다</b> — <code class="ic">res.ok</code>와 <code class="ic">try/catch</code>', 'the network <b>fails</b> — check <code class="ic">res.ok</code>, use <code class="ic">try/catch</code>')}</p></div>
            <div class="frag callout"><h4>🛡 XSS</h4><p>${t('사용자 입력은 <code class="ic">textContent</code>로. <code class="ic">innerHTML</code>은 위험', 'user input → <code class="ic">textContent</code>. <code class="ic">innerHTML</code> is risky')}</p></div>
          </div>
        </div>`,
    },

    /* ===================================================== 4. FRAMEWORKS */
    {
      id: 'axios',
      part: 2,
      sec: 50,
      title: { ko: 'Step 4 — axios와 에러 처리', en: 'Step 4 — axios & error handling' },
      notes: `방금 본 fetch를 실무에서는 axios라는 라이브러리로 대신하는 경우가 많습니다. npm install axios로 설치하고, 오늘 배운 npm이 바로 이럴 때 쓰입니다. ▶ 이 예제는 코드로만 보여드립니다.
axios의 큰 장점은 에러 처리가 일관된다는 점입니다. fetch는 404나 500이 와도 에러를 던지지 않아서 res.ok를 직접 확인해야 했죠. axios는 2xx가 아니면 알아서 예외를 던집니다. 그래서 try-catch 하나로 처리할 수 있어요.
catch에서는 에러를 세 종류로 나눠 보세요. 첫째, error.response가 있으면 서버가 응답은 했지만 4xx나 5xx를 준 겁니다. 상태 코드와 data를 보고 "로그인 필요", "없는 데이터" 같은 메시지를 정합니다. 둘째, error.request만 있으면 요청은 나갔는데 응답이 없는 겁니다. 오프라인이나 타임아웃이고, 그래서 timeout 옵션을 꼭 지정합니다. 셋째, 둘 다 없으면 우리 코드의 버그입니다.
마지막으로 에러를 삼키지 말고 다시 던져서, 화면 쪽에서 사용자에게 알려 주도록 하세요. 코드가 길면 스크롤해서 보시면 됩니다.`,
      render: ({ t, code, ic }) => `
        <div class="cols" style="grid-template-columns:7fr 5fr">
          ${code('js', S.axiosErr, { cls: 'scroll tall xl', label: 'npm install axios' })}
          <div class="side">
            <div class="frag callout"><h4>1 · ${ic('err.response')}</h4><p>${t('서버가 <b>에러 상태</b>로 응답 (4xx · 5xx) → 상태 코드와 메시지로 안내', 'the server replied with an <b>error status</b> (4xx · 5xx) → show a message')}</p></div>
            <div class="frag callout"><h4>2 · ${ic('err.request')}</h4><p>${t('<b>응답 없음</b> — 오프라인 · 타임아웃 → <code class="ic">timeout</code> 필수', '<b>no reply</b> — offline · timeout → always set <code class="ic">timeout</code>')}</p></div>
            <div class="frag callout"><h4>3 · ${t('그 외', 'Otherwise')}</h4><p>${t('우리 코드의 <b>버그</b> — 삼키지 말고 다시 throw', 'a <b>bug</b> in our code — rethrow, never swallow')}</p></div>
            <div class="frag callout rec"><h4>fetch vs axios</h4><p>${t('fetch는 404도 성공 처리 → <code class="ic">res.ok</code> 확인. axios는 2xx 밖이면 <b>자동으로 throw</b>', 'fetch treats 404 as success → check <code class="ic">res.ok</code>. axios <b>throws</b> outside 2xx')}</p></div>
          </div>
        </div>`,
    },

    {
      id: 'why-fw',
      part: 3,
      sec: 55,
      title: { ko: '왜 프레임워크인가', en: 'Why frameworks?' },
      notes: `방금 만든 예제를 다시 떠올려 보세요. 앱이 커질수록 "이 상태가 바뀌면 화면의 어느 부분을 어떻게 고쳐야 하지?"를 우리가 손으로 관리해야 합니다. 이게 점점 지옥이 됩니다.
프레임워크의 아이디어는 간단합니다. 어떻게 고칠지(how)는 프레임워크에 맡기고, 우리는 state가 이럴 때 화면은 이렇다(what)만 선언합니다.
▶ 먼저 왼쪽의 Vanilla JS 카운터를 읽어 줍니다. DOM을 직접 고치는 방식이죠. 다음 키를 누르면 state → render → DOM 그림이 나오니 버튼을 눌러 흐름을 보여주세요. 그다음에야 오른쪽에 React, 그리고 Svelte 버전이 차례로 나타납니다. 같은 카운터를 프레임워크는 어떻게 쓰는지 비교해 주세요.
마지막에 한 줄로 정리합니다. UI는 state의 함수, UI = f(state). 화면은 state가 정하고, state가 바뀌면 화면이 다시 계산됩니다. 이게 React를 비롯한 프레임워크의 핵심 아이디어예요. 문법은 달라도 사상은 같으니, 하나를 깊이 배우면 나머지는 빨리 배웁니다.`,
      render: ({ t, code, loop }) => `
        <div class="cols" style="grid-template-columns:1fr 1fr">
          <div class="side">
            ${code('js', S.cmpVanilla, { cls: 'scroll', label: t('① Vanilla JS — DOM을 직접 갱신', '① Vanilla JS — update the DOM by hand') })}
            <div class="frag">${loop()}</div>
          </div>
          <div class="side">
            <div class="frag">${code('jsx', S.cmpReact, { cls: 'scroll', label: t('② React — state만 바꾸면 화면은 알아서', '② React — change state, the UI follows') })}</div>
            <div class="frag">${code('svelte', S.cmpSvelte, { cls: 'scroll', label: t('③ Svelte 5 — 같은 아이디어, 더 짧게', '③ Svelte 5 — same idea, even shorter') })}</div>
          </div>
        </div>
        <div class="frag banner"><b class="formula">UI = f( state )</b> ${t(
          '— <b>명령형(how)</b>에서 <b>선언형(what)</b>으로',
          '— from <b>imperative (how)</b> to <b>declarative (what)</b>'
        )}</div>`,
    },

    {
      id: 'landscape',
      part: 3,
      sec: 50,
      title: { ko: '프레임워크 지도', en: 'The framework landscape' },
      notes: `생태계가 복잡해 보이지만 층으로 나누면 간단합니다. 가장 아래 런타임과 도구, 그 위에 UI 라이브러리, 그 위에 라우팅과 서버 렌더링을 해주는 메타 프레임워크.
UI는 React, Vue, Svelte, Solid, Angular. 메타 프레임워크는 Next.js, Nuxt, SvelteKit, Astro 같은 것들이 있습니다.
최근 흐름도 짚어 봅니다. Svelte 5의 runes와 Solid 같은 signals 기반 반응성, React Compiler와 서버 컴포넌트, 정적 콘텐츠에 강한 Astro의 islands 구조, 그리고 Rolldown, Oxc, Biome 같은 Rust 기반 도구들입니다.
처음 시작한다면 추천은 React에 Vite, TypeScript 조합입니다. 자료와 일자리, 생태계가 가장 크기 때문이에요. Svelte는 가볍고 배우기 쉬운 훌륭한 대안입니다.`,
      render: ({ t }) => `
        <div class="layers">
          <div class="frag layer"><span class="lname">${t('메타 프레임워크', 'Meta-frameworks')}<small>${t('라우팅 · SSR · 배포', 'routing · SSR · deploy')}</small></span><span class="chips"><i class="chip">Next.js</i><i class="chip">React Router</i><i class="chip">Nuxt</i><i class="chip">SvelteKit</i><i class="chip">Astro</i></span></div>
          <div class="frag layer"><span class="lname">${t('UI 라이브러리', 'UI libraries')}<small>${t('컴포넌트 · 상태', 'components · state')}</small></span><span class="chips"><i class="chip hot">React</i><i class="chip">Vue</i><i class="chip">Svelte</i><i class="chip">Solid</i><i class="chip">Angular</i></span></div>
          <div class="frag layer"><span class="lname">${t('도구 · 언어', 'Tooling · language')}<small>${t('빌드 · 검사 · 테스트', 'build · lint · test')}</small></span><span class="chips"><i class="chip">TypeScript</i><i class="chip">Vite</i><i class="chip">Vitest</i><i class="chip">ESLint / Biome</i><i class="chip">Tailwind</i></span></div>
          <div class="frag layer"><span class="lname">${t('런타임', 'Runtime')}<small>${t('JS 실행 환경', 'where JS runs')}</small></span><span class="chips"><i class="chip">Browser</i><i class="chip">Node.js</i><i class="chip">Deno</i><i class="chip">Bun</i></span></div>
        </div>
        <div class="cols">
          <div class="frag callout"><h4>✨ ${t('요즘 흐름', "What's new")}</h4>
            <p><i class="chip new">Svelte 5 runes</i> <i class="chip new">Signals</i> <i class="chip new">React Compiler</i> <i class="chip new">Server Components</i> <i class="chip new">Astro islands</i> <i class="chip new">Rust tooling</i></p></div>
          <div class="frag callout rec"><h4>🧭 ${t('첫 선택', 'Where to start')}</h4>
            <p><b>React + Vite + TypeScript</b><br><small class="muted">${t('자료 · 일자리 · 생태계 최대 / 가볍게 시작하려면 Svelte', 'largest ecosystem & job market / Svelte for a lighter start')}</small></p></div>
        </div>`,
    },

    {
      id: 'react1',
      part: 3,
      sec: 50,
      title: { ko: 'React ① 컴포넌트 · JSX · props', en: 'React ① Components · JSX · props' },
      notes: `React 핵심 기술 첫 번째, 컴포넌트입니다. React에서 화면은 레고처럼 조립합니다. 컴포넌트는 그냥 "JSX를 반환하는 함수"예요. 이름은 반드시 대문자로 시작합니다.
JSX는 JavaScript 안에서 HTML처럼 쓰는 문법입니다. 다만 class는 className으로 쓰고, 중괄호 안에는 자바스크립트 식을 넣을 수 있습니다.
props는 함수의 인자처럼 부모가 자식에게 넘기는 값이고, 자식은 읽기만 합니다. 기본값도 줄 수 있어요.
▶ App이 Greeting을 두 번 재사용하는 모습을 보여주세요. 같은 컴포넌트, 다른 props, 다른 결과. 이게 재사용입니다.`,
      render: ({ t, code }) => `
        <div class="cols" style="grid-template-columns:7fr 5fr">
          ${code('jsx', S.react1, { steps: true })}
          <ul class="bul">
            <li class="frag"><b>${t('컴포넌트', 'Component')}</b> = ${t('JSX를 반환하는 <b>함수</b> (이름은 대문자)', 'a <b>function</b> returning JSX (Capitalized)')}</li>
            <li class="frag"><b>JSX</b> = ${t('JS 안의 HTML 같은 문법', 'HTML-like syntax inside JS')}<br><small class="muted"><code class="ic">class → className</code> · <code class="ic">{ }</code> = JS ${t('식', 'expression')}</small></li>
            <li class="frag"><b>props</b> = ${t('부모 → 자식 <b>읽기 전용</b> 값', 'parent → child <b>read-only</b> values')}</li>
          </ul>
        </div>`,
    },

    {
      id: 'react2',
      part: 3,
      sec: 55,
      title: { ko: 'React ② state · 리스트 · 불변 업데이트', en: 'React ② State · lists · immutable updates' },
      notes: `두 번째, state. useState는 "기억하는 변수"를 만듭니다. 값과 그 값을 바꾸는 함수를 한 쌍으로 돌려주고, 바꾸는 함수를 부르면 React가 컴포넌트를 다시 그립니다. 앞에서 본 UI = f(state)가 바로 이 루프예요.
가장 중요한 규칙은 불변성입니다. 배열을 push로 직접 고치지 말고, 새 배열을 만들어 set 함수에 넘깁니다. 추가는 전개 연산자, 삭제는 filter, 수정은 map을 씁니다. 이 세 패턴만 외우면 됩니다.
리스트를 그릴 때는 map을 쓰고, 각 항목에 key를 줍니다. key는 인덱스가 아니라 안정적인 id를 쓰세요. 조건부 렌더링은 && 나 삼항 연산자를 씁니다.`,
      render: ({ t, code }) => `
        <div class="cols" style="grid-template-columns:7fr 5fr">
          ${code('jsx', S.react2, { steps: true, size: 'sm' })}
          <ul class="bul">
            <li class="frag"><code class="ic">useState</code> = ${t('기억하는 변수. 바꾸면 <b>다시 렌더</b>', 'a remembered variable. Changing it <b>re-renders</b>')}</li>
            <li class="frag">${t('<b>불변</b>: 직접 고치지 말고 <b>새 값</b>을 만들어 set', '<b>Immutable</b>: never mutate — set a <b>new value</b>')}<br><small class="muted">add <code class="ic">[...a, x]</code> · remove <code class="ic">filter</code> · update <code class="ic">map</code></small></li>
            <li class="frag">${t('리스트: <code class="ic">map</code> + 안정적인 <code class="ic">key</code> (index ✕)', 'lists: <code class="ic">map</code> + a stable <code class="ic">key</code> (not index)')}<br><small class="muted">${t('조건부: <code class="ic">cond && &lt;X/&gt;</code>', 'conditional: <code class="ic">cond && &lt;X/&gt;</code>')}</small></li>
          </ul>
        </div>`,
    },

    {
      id: 'react3',
      part: 3,
      sec: 55,
      title: { ko: 'React ③ effect · 파생 값 · 데이터 가져오기', en: 'React ③ Effects · derived values · fetching', },
      notes: `세 번째, useEffect입니다. 렌더링 밖의 세상, 즉 네트워크나 타이머, 이벤트 구독 같은 외부 시스템과 동기화할 때 씁니다. 두 번째 인자인 의존성 배열이 "언제 다시 실행할지"를 정하고, 반환하는 함수는 정리(cleanup)를 담당합니다.
여기서 흔한 실수 두 가지를 짚을게요. 하나, 계산할 수 있는 값은 state에 넣지 마세요. 필터링 결과 같은 파생 값은 렌더링 중에 그냥 계산하면 됩니다. 둘, 클릭에 반응하는 일은 effect가 아니라 이벤트 핸들러에서 처리합니다.
실무에서는 데이터 가져오기를 직접 effect로 쓰기보다 TanStack Query 같은 라이브러리를 쓰는 경우가 많다는 것도 알아두세요. 그리고 두 컴포넌트가 같은 상태를 써야 하면, 가장 가까운 공통 부모로 state를 끌어올립니다. 이걸 lifting state up이라고 합니다.`,
      render: ({ t, code }) => `
        <div class="cols" style="grid-template-columns:7fr 5fr">
          ${code('jsx', S.react3, { steps: true, size: 'sm' })}
          <ul class="bul">
            <li class="frag"><code class="ic">useEffect</code> = ${t('<b>외부 시스템</b>과 동기화 (네트워크·타이머·구독)', 'sync with <b>external systems</b> (network, timers, subscriptions)')}<br><small class="muted">deps ${t('배열 = 언제 다시 실행?', 'array = when to re-run?')} · cleanup</small></li>
            <li class="frag">${t('<b>파생 값</b>은 state가 아니라 <b>계산</b>', '<b>Derived values</b> are <b>computed</b>, not stored')}</li>
            <li class="frag">${t('상태 공유 = 가까운 공통 부모로 <b>끌어올리기</b>', 'share state = <b>lift it up</b> to the nearest common parent')}<br><small class="muted">${t('서버 데이터는 TanStack Query 같은 도구도', 'for server data, consider TanStack Query')}</small></li>
          </ul>
        </div>`,
    },

    {
      id: 'react4',
      part: 3,
      sec: 40,
      title: { ko: 'React ④ 커스텀 훅 · 다음 단계', en: 'React ④ Custom hooks · next steps' },
      notes: `마지막 기술은 커스텀 훅입니다. 앞에서 우리가 localStorage에 저장하던 로직을 use로 시작하는 함수로 묶으면, 어느 컴포넌트에서든 useLocalStorage 한 줄로 재사용할 수 있습니다. 로직을 재사용하는 React의 방식이에요.
Hooks에는 두 규칙이 있습니다. 컴포넌트나 훅의 최상위에서만 부르고, 조건문이나 반복문 안에서는 부르지 않습니다.
시작은 npm create vite 명령으로 React 템플릿을 만들면 됩니다. npm이 뭔지는 뒤의 부록에서 설명드립니다.
Svelte와도 간단히 비교해 볼게요. Svelte는 컴파일러가 변경 지점을 알아내서 필요한 DOM만 직접 갱신하기 때문에 코드가 더 짧습니다. 철학은 같고, 선택은 팀과 취향의 문제입니다.`,
      render: ({ t, code, terminal }) => `
        <div class="cols">
          <div>
            ${code('jsx', S.react4, { size: 'sm', label: 'useLocalStorage.js' })}
            <div class="frag callout" style="margin-top:12px"><h4>${t('Hooks 규칙', 'Rules of Hooks')}</h4><p>${t('최상위에서만 호출 · 조건/반복문 안에서 ✕ · 이름은 <code class="ic">use…</code>', 'call at the top level only · never in if/loops · name starts with <code class="ic">use…</code>')}</p></div>
          </div>
          <div>
            <div class="frag">${terminal([{ cmd: 'npm create vite@latest my-app -- --template react-ts' }, { cmd: 'cd my-app && npm install' }, { cmd: 'npm run dev', out: 'Local: http://localhost:5173/' }], { title: 'start' })}</div>
            <div class="frag callout" style="margin-top:12px"><h4>React vs Svelte</h4>
              <p>${t('React: 함수를 <b>다시 실행</b>해 비교 · Svelte: 컴파일러가 <b>바뀔 곳만</b> 직접 갱신', 'React: <b>re-runs</b> the function & diffs · Svelte: the compiler updates <b>only what changed</b>')}</p></div>
          </div>
        </div>`,
    },

    /* ===================================================== 5. YOUR TURN */
    {
      id: 'challenge',
      part: 4,
      sec: 50,
      title: { ko: '이제 당신 차례', en: 'Your turn' },
      notes: `이제 여러분 차례입니다. 오늘 배운 걸로 나만의 서비스를 만들어 보세요. 주제가 막막하면 이 주사위를 굴려 보세요.
▶ 주사위 버튼을 눌러 아이디어를 하나 뽑아 보여주세요.
규칙은 단순합니다. 첫째, 한 문장으로 정의한다. 둘째, 기능은 세 개만 — 이걸 MVP라고 합니다. 셋째, state를 먼저 설계한다. 넷째, 배포해서 링크를 공유한다. 배포까지 가야 진짜 만든 겁니다.
완벽하게 만들려 하지 말고, 작게 만들어서 배포하고, 고치면서 키워 가세요.
그러려면 내 컴퓨터에 개발 환경이 필요합니다. 지금부터 세 장은 부록처럼, 환경을 만드는 방법을 빠르게 훑겠습니다.`,
      render: ({ t, dice }) => `
        <div class="cols" style="grid-template-columns:5fr 6fr">
          <div>
            ${dice(
              t(
                ['날씨 대시보드 (API)', '습관 트래커 (localStorage)', '퀴즈 앱', '북마크 · 레시피 보드', '포모도로 타이머', '가계부 + 차트', '단어 암기 카드', '2048 · 지뢰찾기 같은 미니 게임'],
                ['Weather dashboard (API)', 'Habit tracker (localStorage)', 'Quiz app', 'Bookmark / recipe board', 'Pomodoro timer', 'Expense tracker + chart', 'Flashcards', 'Mini game: 2048 / Minesweeper']
              )
            )}
          </div>
          <ol class="steps">
            <li class="frag"><b>${t('한 문장 정의', 'One sentence')}</b><small>${t('"누가 무엇을 위해 쓰는가"', '"who uses it, and why"')}</small></li>
            <li class="frag"><b>MVP ${t('기능 3개', '3 features')}</b><small>${t('나머지는 나중에', 'everything else later')}</small></li>
            <li class="frag"><b>state ${t('먼저 설계', 'first')}</b><small>${t('어떤 데이터가 바뀌는가?', 'what data changes?')}</small></li>
            <li class="frag"><b>${t('배포 + 링크 공유', 'Deploy + share the link')}</b><small>GitHub Pages</small></li>
          </ol>
        </div>`,
    },

    /* ===================================================== 4b. SETUP (appendix-style: Node & npm) */
    {
      id: 'node',
      part: 4,
      sec: 45,
      title: { ko: 'Node.js — 브라우저 밖의 JavaScript', en: 'Node.js — JavaScript outside the browser' },
      notes: `부록의 첫 장, 개발 환경입니다. 앞에서는 브라우저만으로 충분했지만, 프레임워크를 쓰거나 배포하려면 도구가 필요합니다. Node.js는 크롬의 JavaScript 엔진을 브라우저 밖으로 꺼낸 실행 환경이에요.
프론트엔드 코드는 결국 브라우저에서 돌지만, 우리가 쓰는 개발 도구 — 개발 서버, 번들러, 테스트, 린터 — 는 전부 Node 위에서 돌아갑니다. 그래서 Node는 "도구 실행기"라고 생각하시면 됩니다.
설치는 nodejs.org에서 LTS 버전을 받으면 됩니다. 여러 버전이 필요하면 nvm이나 fnm 같은 버전 관리자를 쓰세요.
▶ 터미널에서 node -v, npm -v가 나오면 준비 끝입니다.`,
      render: ({ t, terminal, ic }) => `
        <div class="cols" style="grid-template-columns:6fr 5fr">
          <div>
            <ul class="bul">
              <li class="frag"><b>Node.js</b> = ${t('V8 엔진으로 JS를 <b>브라우저 밖</b>에서 실행', 'runs JS with the V8 engine <b>outside the browser</b>')}</li>
              <li class="frag">${t('프론트엔드에서의 역할: <b>도구 실행기</b>', 'In frontend, it is the <b>tool runner</b>')}<br><small class="muted">${t('개발 서버 · 번들러 · 테스트 · 린터 · 빌드', 'dev server · bundler · tests · linter · build')}</small></li>
              <li class="frag">${t('<b>npm</b> = Node와 함께 설치되는 패키지 관리자', '<b>npm</b> = the package manager that ships with Node')}</li>
              <li class="frag">${t('설치: <b>nodejs.org</b>의 <b>LTS</b> 버전', 'Install the <b>LTS</b> from <b>nodejs.org</b>')}<br><small class="muted">${t('버전을 바꿔야 하면 nvm / fnm', 'need several versions? nvm / fnm')}</small></li>
            </ul>
          </div>
          <div>
            ${terminal([
              { cmd: 'node -v', out: 'v24.x.x' },
              { cmd: 'npm -v', out: '11.x.x' },
              { cmd: 'node -e "console.log(1 + 1)"', out: '2' },
              { cmd: 'node hello.js', out: 'Hello from Node!' },
            ])}
            <p class="muted small">${t('* 출력은 예시입니다', '* sample output')}</p>
          </div>
        </div>`,
    },

    {
      id: 'npm',
      part: 4,
      sec: 60,
      title: { ko: 'npm — 패키지와 프로젝트', en: 'npm — packages & projects' },
      notes: `npm은 남이 만든 코드를 가져다 쓰는 도구입니다. 프로젝트의 시작은 npm init이고, 그러면 package.json이 생깁니다. 이 파일이 프로젝트의 신분증이에요.
npm install 패키지이름으로 라이브러리를 설치하면 dependencies에 기록됩니다. 개발할 때만 필요한 도구는 -D 옵션으로 devDependencies에 들어갑니다.
설치된 코드는 node_modules 폴더에 쌓이는데, 이 폴더는 엄청 크니까 git에는 올리지 않습니다. 대신 package.json과 package-lock.json을 올리면 누구나 npm install 한 번으로 똑같은 환경을 재현할 수 있어요.
버전 앞의 캐럿 기호는 "1.x 안에서는 업데이트 허용"이라는 뜻입니다.`,
      render: ({ t, terminal, code }) => `
        <div class="cols" style="grid-template-columns:6fr 5fr">
          <div>
            ${terminal([
              { cmd: 'mkdir my-app && cd my-app' },
              { cmd: 'npm init -y', out: 'Wrote to …/my-app/package.json' },
              { cmd: 'npm install dayjs', out: 'added 1 package' },
              { cmd: 'npm install -D vite', out: 'added … packages' },
              { cmd: 'ls', out: 'node_modules  package.json  package-lock.json' },
            ])}
            <div class="frag legend">
              <div><code class="ic">-D</code> ${t('개발할 때만 필요 (devDependencies)', 'dev-only (devDependencies)')}</div>
              <div><code class="ic">node_modules</code> ${t('설치된 코드 — <b>git에 올리지 않음</b>', 'installed code — <b>do not commit</b>')}</div>
              <div><code class="ic">package-lock.json</code> ${t('정확한 버전 고정 — <b>커밋</b>', 'exact versions — <b>commit it</b>')}</div>
            </div>
          </div>
          <div class="frag">
            ${code('json', S.npmPackage, { label: 'package.json' })}
            <p class="muted small">${t('<code class="ic">^1.11.0</code> = 1.x 범위에서 업데이트 허용 (semver)', '<code class="ic">^1.11.0</code> = accept updates within 1.x (semver)')}</p>
          </div>
        </div>`,
    },

    {
      id: 'pipeline',
      part: 4,
      sec: 70,
      title: { ko: 'test · build · audit · deploy', en: 'test · build · audit · deploy' },
      notes: `package.json의 scripts 칸에 명령어를 등록하면 npm run 이름으로 실행할 수 있습니다. 실무에서 가장 자주 만나는 네 가지를 봅시다.
test는 코드가 깨지지 않았는지 자동으로 확인합니다. Vitest나 Jest를 많이 씁니다. build는 개발용 코드를 압축하고 합쳐서 dist 폴더에 배포용 파일을 만듭니다. audit은 설치한 패키지에 알려진 보안 취약점이 있는지 검사합니다. deploy는 dist를 서버, 우리의 경우 GitHub Pages에 올립니다.
GitHub Pages 주의점 하나. 주소가 username.github.io/저장소이름 형태라서, Vite에서는 base 옵션에 저장소 이름을 꼭 넣어야 합니다. 안 넣으면 CSS와 JS를 못 찾아 흰 화면이 뜹니다.
npm test와 npm start만 run을 생략할 수 있고, 나머지는 npm run build처럼 씁니다.`,
      render: ({ t, code, ic }) => `
        <div class="pipe">
          <div class="frag pcard"><h4>test</h4><code class="ic">npm test</code><p>${t('깨졌는지 자동 확인', 'verify nothing broke')}</p><small>Vitest · Jest</small></div>
          <div class="frag pcard"><h4>build</h4><code class="ic">npm run build</code><p>${t('압축·합치기 → <b>dist/</b>', 'bundle & minify → <b>dist/</b>')}</p><small>Vite · esbuild</small></div>
          <div class="frag pcard"><h4>audit</h4><code class="ic">npm audit</code><p>${t('알려진 보안 취약점 검사', 'scan for known vulnerabilities')}</p><small>npm audit fix</small></div>
          <div class="frag pcard"><h4>deploy</h4><code class="ic">npm run deploy</code><p>${t('dist/ → 서버 (Pages)', 'dist/ → hosting (Pages)')}</p><small>gh-pages · Actions</small></div>
        </div>
        <div class="cols">
          <div class="frag">${code('json', S.npmScripts, { size: 'sm', label: 'package.json' })}</div>
          <div class="frag">
            ${code('js', S.viteConfig, { size: 'sm' })}
            <p class="warn small">⚠ ${t('GitHub Pages는 <b>base</b>가 저장소 이름이어야 함 — 아니면 흰 화면!', 'GitHub Pages needs <b>base</b> = repo name — otherwise a blank page!')}</p>
          </div>
        </div>
        <p class="frag muted small center">${t(
          `${ic('npm test')}, ${ic('npm start')}는 <code class="ic">run</code> 생략 가능 · 나머지는 ${ic('npm run <name>')}`,
          `${ic('npm test')} and ${ic('npm start')} can skip <code class="ic">run</code> · everything else: ${ic('npm run <name>')}`
        )}</p>`,
    },

    {
      id: 'resources',
      part: 4,
      sec: 60,
      title: { ko: '더 배우고 싶다면', en: 'Keep learning' },
      notes: `마지막으로 어디서 더 배울지입니다. 세 단계로 정리했어요.
레벨 1, 기초 다지기. MDN Web Docs는 웹 표준 공식 사전급 문서고 한국어판도 있습니다. javascript.info 는 JS를 처음부터 깊게 다루는 튜토리얼이고, web.dev의 Learn 코스도 훌륭합니다.
레벨 2, 프레임워크. react.dev 공식 문서가 가장 좋은 교재입니다. TypeScript도 이때 같이 시작하세요. Svelte 튜토리얼은 브라우저에서 바로 풀어볼 수 있습니다.
레벨 3, 실전과 심화. roadmap.sh로 전체 지도를 보고, Frontend Mentor 같은 곳에서 디자인 시안을 따라 만들어 보세요. 브라우저 호환성은 Can I use에서 확인합니다.
공부 요령 한 가지. 모르면 먼저 MDN과 공식 문서를 보고, 에러 메시지는 그대로 검색하세요. 그리고 개발자도구를 항상 열어 두세요.`,
      render: ({ t, L }) => {
        const ko = L === 'ko';
        const a = (href, name, desc) => `<a class="res" href="${href}" target="_blank" rel="noopener"><b>${name}</b><span>${desc}</span></a>`;
        return `
        <div class="levels">
          <div class="frag level l1"><h3>Lv.1 ${t('기초 다지기', 'Foundations')}</h3>
            ${a(ko ? 'https://developer.mozilla.org/ko/' : 'https://developer.mozilla.org/', 'MDN Web Docs', t('HTML·CSS·JS 공식급 레퍼런스', 'the reference for HTML·CSS·JS'))}
            ${a(ko ? 'https://ko.javascript.info/' : 'https://javascript.info/', 'javascript.info', t('JS를 처음부터 깊게', 'modern JS from scratch'))}
            ${a('https://web.dev/learn', 'web.dev/learn', t('성능 · 접근성 · 반응형', 'performance · a11y · responsive'))}
          </div>
          <div class="frag level l2"><h3>Lv.2 ${t('프레임워크', 'Frameworks')}</h3>
            ${a(ko ? 'https://ko.react.dev/' : 'https://react.dev/', 'react.dev', t('최고의 React 교재', 'the best React guide'))}
            ${a('https://svelte.dev/tutorial', 'svelte.dev/tutorial', t('브라우저에서 바로 풀기', 'learn in the browser'))}
            ${a('https://www.typescriptlang.org/docs/', 'TypeScript Docs', t('타입으로 안전하게', 'safer with types'))}
          </div>
          <div class="frag level l3"><h3>Lv.3 ${t('실전 · 심화', 'Practice · depth')}</h3>
            ${a('https://roadmap.sh/frontend', 'roadmap.sh/frontend', t('전체 학습 지도', 'the whole map'))}
            ${a('https://www.frontendmentor.io/', 'Frontend Mentor', t('시안 따라 만들기', 'build from real designs'))}
            ${a('https://caniuse.com/', 'Can I use', t('브라우저 호환성', 'browser support'))}
          </div>
        </div>
        <div class="frag banner">${t(
          '모르면 <b>MDN · 공식 문서</b> → 에러는 <b>그대로 검색</b> → <b>DevTools(F12)</b>는 항상 열어두기',
          'Stuck? <b>MDN · official docs</b> → <b>search the error</b> as-is → keep <b>DevTools (F12)</b> open'
        )}</div>`;
      },
    },

    {
      id: 'closing',
      part: 4,
      sec: 25,
      layout: 'center',
      title: { ko: '정리', en: 'Wrap-up' },
      notes: `정리하겠습니다. 오늘의 세 문장입니다.
하나, HTML은 구조, CSS는 모양, JS는 동작이고 그 접점은 DOM이다.
둘, npm과 Vite 같은 도구가 개발, 테스트, 빌드, 배포를 자동화하고, GitHub Pages로 누구나 링크 하나로 서비스를 공개할 수 있다.
셋, state가 화면을 만든다는 한 가지 생각이 React와 Svelte 같은 프레임워크의 뿌리다.
이제 직접 만들어 보세요. 질문 받겠습니다. 감사합니다!`,
      render: ({ t }) => `
        <div class="closing">
          <h1>${t('만들어 보세요 🚀', 'Go build something 🚀')}</h1>
          <ol class="take">
            <li class="frag"><b>HTML · CSS · JS</b> = ${t('구조 · 모양 · 동작 — 접점은 <b>DOM</b>', 'structure · look · behavior — meeting at the <b>DOM</b>')}</li>
            <li class="frag"><b>npm + Vite + Pages</b> = ${t('test · build · audit · deploy 를 링크 하나로', 'test · build · audit · deploy → one shareable link')}</li>
            <li class="frag"><b>UI = f(state)</b> = ${t('프레임워크의 뿌리 — 작게 만들고, 배포하고, 키우기', 'the root of every framework — start small, ship, grow')}</li>
          </ol>
          <p class="frag qa">Q &amp; A</p>
        </div>`,
    },
  ];

  SLIDES.forEach((s) => {
    if (['node', 'npm', 'pipeline'].includes(s.id)) s.kicker = SETUP;
  });

  return { PARTS, SLIDES };
});
