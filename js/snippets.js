/*
 * snippets.js — code samples shown on slides and run in playgrounds.
 * Backticks and ${ inside samples are escaped for the surrounding template literals.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Snippets = api;
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  const S = {};

  /* ---------- CSS playground ---------- */
  S.cardHtml = `<div class="card">
  <h3>Hello CSS</h3>
  <p>Change me!</p>
  <button>Buy</button>
</div>`;

  S.cardCss = `.card {
  width: 240px;
  padding: 20px;
  border-radius: 12px;
  background: #ffe7d6;
  box-shadow: 0 4px 12px rgba(0, 0, 0, .15);
}

h3 {
  margin: 0 0 8px;
  color: #d9480f;
}

button {
  padding: 8px 16px;
  border: 0;
  border-radius: 8px;
  background: #d9480f;
  color: white;
}

button:hover {
  background: #a73a0c;
}`;

  /* ---------- JS playground ---------- */
  S.counterHtml = `<button id="btn">Clicked 0 times</button>`;
  S.counterCss = `button { font-size: 18px; padding: 10px 18px; border-radius: 10px; border: 0; background: #5b5bd6; color: #fff; cursor: pointer; }`;
  S.counterJs = `const btn = document.querySelector('#btn');
let n = 0;

btn.addEventListener('click', () => {
  n++;
  btn.textContent = \`Clicked \${n} times\`;
  console.log('n =', n);
});

// Try: after 5 clicks, turn the button red
// btn.style.background = 'tomato';`;

  /* ---------- Task board (the "real service" example) ---------- */
  S.taskHtml = `<main class="app">
  <h1>📝 Tasks</h1>

  <form id="form">
    <input id="input" type="text" placeholder="What needs doing?" autocomplete="off">
    <button>Add</button>
  </form>

  <ul id="list"></ul>

  <footer>
    <span id="count"></span>
    <button id="import" type="button" class="ghost">Import samples</button>
  </footer>
</main>`;

  S.taskCss = `body {
  font: 16px/1.5 system-ui, sans-serif;
  background: #f4f5fb;
  color: #1a1d2e;
}
.app {
  max-width: 420px;
  margin: 12px auto;
  padding: 20px 24px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, .08);
}
h1 { margin: 0 0 12px; font-size: 22px; }
form { display: flex; gap: 8px; }
input[type="text"] {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ccd;
  border-radius: 8px;
}
button {
  padding: 8px 14px;
  border: 0;
  border-radius: 8px;
  background: #5b5bd6;
  color: #fff;
  cursor: pointer;
}
button.ghost { background: transparent; color: #5b5bd6; }
ul { list-style: none; padding: 0; margin: 12px 0; }
li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #eee;
}
li.done span { text-decoration: line-through; color: #999; }
li button { background: none; color: #c33; padding: 2px 8px; }
footer { display: flex; justify-content: space-between; color: #888; font-size: 14px; }`;

  S.taskJs = `const KEY = 'tasks-v1';
let tasks = JSON.parse(localStorage.getItem(KEY) || '[]');

const $list = document.querySelector('#list');
const $form = document.querySelector('#form');
const $input = document.querySelector('#input');
const $count = document.querySelector('#count');

function save() {
  localStorage.setItem(KEY, JSON.stringify(tasks));
}

function render() {
  $list.innerHTML = '';
  for (const t of tasks) {
    const li = document.createElement('li');
    li.className = t.done ? 'done' : '';
    li.innerHTML = '<label><input type="checkbox"> <span></span></label><button>✕</button>';
    li.querySelector('span').textContent = t.title; // textContent: XSS-safe
    li.querySelector('input').checked = t.done;
    li.querySelector('input').onchange = () => { t.done = !t.done; update(); };
    li.querySelector('button').onclick = () => {
      tasks = tasks.filter((x) => x.id !== t.id);
      update();
    };
    $list.append(li);
  }
  $count.textContent = tasks.filter((t) => !t.done).length + ' left';
}

function update() {
  save();
  render();
}

$form.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = $input.value.trim();
  if (!title) return;
  tasks.push({ id: Date.now(), title, done: false });
  $input.value = '';
  update();
});

async function importSamples() {
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=3');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    tasks.push(...data.map((d) => ({ id: Date.now() + d.id, title: d.title, done: d.completed })));
    update();
  } catch (err) {
    $count.textContent = 'Network error: ' + err.message;
  }
}
document.querySelector('#import').onclick = importSamples;

render();`;

  /* ---------- excerpts for the step-by-step slides ---------- */
  S.stepHtml = `<form id="form">
  <input id="input" type="text">
  <button>Add</button>
</form>

<ul id="list"></ul>
<span id="count"></span>`;

  S.stepCss = `li.done span {
  text-decoration: line-through;
  color: #999;
}`;

  S.stepState = `// 1. Find — the DOM is a tree that JS can reach
const $list = document.querySelector('#list');
§§
// 2. Change — create, insert, edit, remove
const li = document.createElement('li');
li.textContent = 'Write talk';
$list.append(li);              // on screen right away
li.classList.add('done');      // CSS .done → strikethrough
li.remove();                   // gone again
§§
// 3. Listen — user action → handler → DOM change
$form.addEventListener('submit', (e) => {
  e.preventDefault();
  const li = document.createElement('li');
  li.textContent = $input.value;
  $list.append(li);
  $input.value = '';
});
§§
// 4. Real apps also keep the data in a variable
let tasks = [];                // see the full code in the demo`;

  S.stepPersist = `// Persist: state → string → localStorage
function save() {
  localStorage.setItem(KEY, JSON.stringify(tasks));
}
let tasks = JSON.parse(localStorage.getItem(KEY) || '[]');`;

  S.stepFetch = `// Network: it can fail, so always handle errors
async function importSamples() {
  try {
    const res = await fetch(URL);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    tasks.push(...data.map(toTask));
    update();                       // save + render
  } catch (err) {
    $count.textContent = 'Network error';
  }
}`;

  /* ---------- Framework comparison ---------- */
  S.cmpVanilla = `const btn = document.querySelector('#btn');
let n = 0;

btn.addEventListener('click', () => {
  n++;
  btn.textContent = \`Clicked \${n}\`;   // update the DOM by hand
});`;

  S.cmpReact = `import { useState } from 'react';

function Counter() {
  const [n, setN] = useState(0);

  return <button onClick={() => setN(n + 1)}>Clicked {n}</button>;
}`;

  S.cmpSvelte = `<script>
  let n = $state(0);
</script>

<button onclick={() => n++}>Clicked {n}</button>`;

  /* ---------- React ---------- */
  S.react1 = `function Greeting({ name, emoji = '👋' }) {
  return <h1 className="title">{emoji} Hello, {name}!</h1>;
}
§§
export default function App() {
  return (
    <main>
      <Greeting name="Web" />
      <Greeting name="React" emoji="⚛️" />
    </main>
  );
}`;

  S.react2 = `function Todos() {
  const [todos, setTodos] = useState([]);
§§
  const add = (title) =>
    setTodos([...todos, { id: Date.now(), title, done: false }]);
  const remove = (id) =>
    setTodos(todos.filter((t) => t.id !== id));
  const toggle = (id) =>
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
§§
  return (
    <ul>
      {todos.length === 0 && <p>Nothing yet</p>}
      {todos.map((t) => (
        <li key={t.id} onClick={() => toggle(t.id)}>{t.title}</li>
      ))}
    </ul>
  );
}`;

  S.react3 = `function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch('/api/users', { signal: ctrl.signal })
      .then((r) => r.json())
      .then(setUsers)
      .catch(() => {});
    return () => ctrl.abort();      // cleanup
  }, []);                           // deps: when to re-run
§§
  // Derived value: compute it, don't store it
  const active = users.filter((u) => u.active);
  return <List items={active} />;
}`;

  S.react4 = `function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() =>
    JSON.parse(localStorage.getItem(key) ?? JSON.stringify(initial))
  );
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}

// const [tasks, setTasks] = useLocalStorage('tasks-v1', []);`;

  S.npmPackage = `{
  "name": "my-app",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "dayjs": "^1.11.0"
  },
  "devDependencies": {
    "vite": "^7.0.0"
  }
}`;

  S.npmScripts = `"scripts": {
  "dev": "vite",
  "test": "vitest run",
  "build": "vite build",
  "deploy": "gh-pages -d dist"
}`;

  S.viteConfig = `// vite.config.js
// username.github.io/<repo>/ → set the repo name as base
export default {
  base: '/my-repo/',
};`;

  S.linkScript = `<link rel="stylesheet" href="style.css">
<script src="app.js" defer></script>`;

  S.hooks = `<div class="card" id="buy">…</div>      /* HTML  */
.card { background: #fff; }               /* CSS  */
document.querySelector('#buy')            // JS`;

  return S;
});
