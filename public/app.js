const $ = (s) => document.querySelector(s);
const state = {
  username: '', template: 'recruiter', theme: 'github-dark', mode: 'dark', md: '', meta: null,
  blocks: [], custom: false, open: new Set(), dragFrom: null,
};
const MAX_REPOS = 3;
const STORE = 'rm:composer';

const icon = (name) => `<svg class="ic" aria-hidden="true"><use href="/icons.svg#${name}"/></svg>`;
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const clone = (x) => JSON.parse(JSON.stringify(x));
const status = (msg, err = false) => Object.assign($('#status'), { textContent: msg, className: err ? 'err' : '' });

// Blocks in URLs drop default values to stay short; the server fills them back in.
function compact(blocks) {
  const { types } = state.meta.blocks;
  return blocks.map((b) => {
    const out = { type: b.type };
    for (const f of types[b.type].fields) {
      const def = f.type === 'checkbox' ? false : f.type === 'select' ? f.default : '';
      if (b[f.key] !== def) out[f.key] = b[f.key];
    }
    return out;
  });
}
// Fill defaults so every field the form shows has a value.
function complete(b) {
  const out = { type: b.type };
  for (const f of state.meta.blocks.types[b.type]?.fields || []) {
    const def = f.type === 'checkbox' ? false : f.type === 'select' ? f.default : '';
    out[f.key] = b[f.key] ?? def;
  }
  return out;
}

function syncUrl() {
  const p = new URLSearchParams({ template: state.template, theme: state.theme });
  if (state.username) p.set('username', state.username);
  if (state.custom) p.set('blocks', JSON.stringify(compact(state.blocks)));
  history.replaceState(null, '', `?${p}`);
  try {
    localStorage.setItem(STORE, JSON.stringify({ template: state.template, custom: state.custom, blocks: compact(state.blocks) }));
  } catch {}
}

async function api(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText);
  return res.headers.get('content-type').includes('json') ? res.json() : res.text();
}

// --- templates & themes ---------------------------------------------------

function renderGallery() {
  const { templates, themes } = state.meta;
  $('#templates').innerHTML = Object.entries(templates)
    .map(
      ([k, t]) => `<button class="tpl tpl-${k}" data-tpl="${k}" aria-pressed="${k === state.template && !state.custom}">
        <span class="thumb" aria-hidden="true"><b></b><i></i><i></i><i></i></span>
        <strong>${escapeHtml(t.label)}</strong><small>${escapeHtml(t.blurb)}</small></button>`
    )
    .join('');
  $('#themes').innerHTML = Object.entries(themes)
    .map(
      ([k, t]) => `<button class="chip" data-theme="${k}" aria-pressed="${k === state.theme}">
        <span class="swatch" style="background:linear-gradient(135deg,${t.bg} 45%,${t.accents[0]} 45% 70%,${t.accents[1]} 70%)"></span>${escapeHtml(t.label)}</button>`
    )
    .join('');
  const t = templates[state.template] || templates.recruiter;
  $('#tpl-title').textContent = state.custom ? `${t.label} · customized` : t.label;
  $('#tpl-blurb').textContent = state.custom ? `Your own arrangement, started from ${t.label}` : t.blurb;
}

function useTemplate(key) {
  state.template = key;
  state.blocks = clone(state.meta.templates[key].blocks);
  state.custom = false;
  state.open.clear();
  renderGallery(), renderBlocks(), syncUrl(), loadReadme();
}

// --- block composer ---------------------------------------------------------

const cardLabel = (c) => state.meta.blocks.library.find((l) => l.block.card === c)?.label || c;
function blockTitle(b) {
  const type = state.meta.blocks.types[b.type];
  if (b.type === 'card') return [cardLabel(b.card), b.title];
  if (b.type === 'heading' || b.type === 'text') return [type.label, b.text];
  return [type.label, ''];
}

function fieldHtml(f, b, i) {
  const id = `f-${i}-${f.key}`, v = b[f.key];
  const optLabel = (o) => (o === '' ? (f.key === 'theme' ? 'global' : 'none') : f.key === 'card' ? cardLabel(o) : state.meta.themes[o]?.label || o);
  if (f.type === 'checkbox') return `<label class="chk"><input type="checkbox" id="${id}" data-key="${f.key}" ${v ? 'checked' : ''}/> ${escapeHtml(f.label)}</label>`;
  const input =
    f.type === 'select'
      ? `<select id="${id}" data-key="${f.key}">${f.options.map((o) => `<option value="${escapeHtml(o)}" ${o === v ? 'selected' : ''}>${escapeHtml(optLabel(o))}</option>`).join('')}</select>`
      : f.type === 'textarea'
        ? `<textarea id="${id}" data-key="${f.key}" rows="3" maxlength="${f.max}">${escapeHtml(v)}</textarea>`
        : `<input id="${id}" data-key="${f.key}" maxlength="${f.max}" value="${escapeHtml(v)}"/>`;
  return `<label for="${id}">${escapeHtml(f.label)}</label>${input}`;
}

function renderBlocks() {
  const { types } = state.meta.blocks;
  $('#block-count').textContent = state.blocks.length;
  $('#blocks').innerHTML = state.blocks
    .map((b, i) => {
      const [name, sub] = blockTitle(b), open = state.open.has(i), fields = types[b.type].fields;
      return `<li class="blk ${open ? 'open' : ''}" data-i="${i}">
        <div class="blk-row" draggable="true">
          <span class="grip">${icon('grip')}</span>
          <button class="blk-name" data-act="toggle" aria-expanded="${open}" ${fields.length ? '' : 'disabled'}><b>${escapeHtml(name)}</b>${sub ? `<small>${escapeHtml(sub)}</small>` : ''}</button>
          <span class="blk-actions">
            <button data-act="up" aria-label="Move up" ${i ? '' : 'disabled'}>${icon('up')}</button>
            <button data-act="down" aria-label="Move down" ${i < state.blocks.length - 1 ? '' : 'disabled'}>${icon('down')}</button>
            <button data-act="dup" aria-label="Duplicate">${icon('copy')}</button>
            <button data-act="del" aria-label="Remove">${icon('x')}</button>
          </span>
        </div>
        ${open ? `<div class="blk-form">${fields.map((f) => fieldHtml(f, b, i)).join('')}</div>` : ''}
      </li>`;
    })
    .join('');
}

function renderLibrary() {
  const groups = {};
  state.meta.blocks.library.forEach((item, n) => (groups[item.group] ||= []).push(`<button class="lib" data-lib="${n}">${escapeHtml(item.label)}</button>`));
  $('#library').innerHTML = Object.entries(groups).map(([g, items]) => `<p class="lib-group">${g}</p><div class="lib-items">${items.join('')}</div>`).join('');
  $('#tokens').textContent = state.meta.blocks.tokens.map((t) => `{${t}}`).join(' ');
}

// Any edit turns the preset into a custom arrangement.
function changed({ rerender = true } = {}) {
  state.custom = true;
  if (rerender) renderBlocks();
  renderGallery(), syncUrl(), scheduleReadme();
}

function move(from, to) {
  if (to < 0 || to >= state.blocks.length || from === to) return;
  const [b] = state.blocks.splice(from, 1);
  state.blocks.splice(to, 0, b);
  // Keep open forms attached to the blocks that moved.
  const open = [...state.open].map((i) => (i === from ? to : from < i && i <= to ? i - 1 : to <= i && i < from ? i + 1 : i));
  state.open = new Set(open);
  changed();
}

$('#blocks').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  const i = +btn.closest('.blk').dataset.i;
  const act = btn.dataset.act;
  if (act === 'toggle') {
    state.open.has(i) ? state.open.delete(i) : state.open.add(i);
    return renderBlocks();
  }
  if (act === 'up') return move(i, i - 1);
  if (act === 'down') return move(i, i + 1);
  if (act === 'dup') {
    state.blocks.splice(i + 1, 0, clone(state.blocks[i]));
    state.open = new Set([...state.open].map((n) => (n > i ? n + 1 : n)));
  }
  if (act === 'del') {
    state.blocks.splice(i, 1);
    state.open = new Set([...state.open].filter((n) => n !== i).map((n) => (n > i ? n - 1 : n)));
  }
  changed();
});
$('#blocks').addEventListener('input', (e) => {
  const key = e.target.dataset.key;
  if (!key) return;
  const i = +e.target.closest('.blk').dataset.i;
  state.blocks[i][key] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
  // Selects can change a block's title; plain typing must not re-render (it would drop focus).
  changed({ rerender: false });
  if (e.target.tagName === 'SELECT' || e.target.type === 'checkbox' || key === 'title' || key === 'text') {
    const [name, sub] = blockTitle(state.blocks[i]);
    const nameEl = e.target.closest('.blk').querySelector('.blk-name');
    nameEl.innerHTML = `<b>${escapeHtml(name)}</b>${sub ? `<small>${escapeHtml(sub)}</small>` : ''}`;
  }
});
// Native drag and drop for pointer users; the arrow buttons cover keyboard and touch.
$('#blocks').addEventListener('dragstart', (e) => {
  const li = e.target.closest('.blk');
  if (!li || e.target.closest('.blk-form')) return;
  state.dragFrom = +li.dataset.i;
  e.dataTransfer.effectAllowed = 'move';
  li.classList.add('dragging');
});
$('#blocks').addEventListener('dragover', (e) => {
  const li = e.target.closest('.blk');
  if (state.dragFrom === null || !li) return;
  e.preventDefault();
  for (const el of document.querySelectorAll('.blk.over')) el.classList.remove('over');
  li.classList.add('over');
});
$('#blocks').addEventListener('drop', (e) => {
  const li = e.target.closest('.blk');
  if (state.dragFrom === null || !li) return;
  e.preventDefault();
  move(state.dragFrom, +li.dataset.i);
});
$('#blocks').addEventListener('dragend', () => {
  state.dragFrom = null;
  for (const el of document.querySelectorAll('.blk.over, .blk.dragging')) el.classList.remove('over', 'dragging');
});
$('#library').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-lib]');
  if (!btn) return;
  state.blocks.push(complete(clone(state.meta.blocks.library[+btn.dataset.lib].block)));
  state.open.add(state.blocks.length - 1);
  changed();
  $('#blocks').lastElementChild?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
});
$('#reset').addEventListener('click', () => useTemplate(state.template));

// --- panels ---------------------------------------------------------------

function showPane(name) {
  for (const t of document.querySelectorAll('.ptabs [role=tab]')) t.setAttribute('aria-selected', t.dataset.pane === name);
  for (const p of document.querySelectorAll('.pane')) p.hidden = p.dataset.pane !== name;
}
for (const t of document.querySelectorAll('.ptabs [role=tab]')) t.addEventListener('click', () => showPane(t.dataset.pane));
$('#customize').addEventListener('click', () => {
  showPane('blocks');
  $('.panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// --- profile, details, preview -------------------------------------------

function renderProfile({ profile, defaults }) {
  const p = profile;
  $('#profile').hidden = false;
  $('#profile').innerHTML = `<img src="${escapeHtml(p.avatar)}" alt="" width="56" height="56" />
    <div><strong>${escapeHtml(p.name)}</strong><small>@${escapeHtml(p.login)}</small></div>
    <ul><li><b>${p.publicRepos}</b> repositories</li><li><b>${p.followers}</b> followers</li><li><b>${p.contributions.total}</b> contributions</li></ul>
    <a href="https://github.com/${escapeHtml(p.login)}" target="_blank" rel="noopener">View on GitHub ${icon('external')}</a>`;
  const form = $('#details');
  for (const [k, v] of Object.entries(defaults)) if (form.elements[k]) form.elements[k].value = v;
  $('#repos').innerHTML = p.projects.length
    ? p.projects
        .map(
          (r) => `<label class="repo"><input type="checkbox" name="projects" value="${escapeHtml(r.name)}" ${defaults.projects.includes(r.name) ? 'checked' : ''} />
          <span>${escapeHtml(r.name)}</span><small>${escapeHtml(r.language || '')} ★${r.stars}</small></label>`
        )
        .join('')
    : '<small>No public repositories.</small>';
}

function readmeQuery() {
  const form = $('#details');
  const q = new URLSearchParams({ username: state.username, template: state.template, theme: state.theme });
  for (const el of form.elements) if (el.name && el.name !== 'projects' && el.value.trim()) q.set(el.name, el.value.trim());
  const picked = [...form.querySelectorAll('input[name=projects]:checked')].map((el) => el.value);
  if (picked.length) q.set('projects', picked.join(','));
  if (state.custom) q.set('blocks', JSON.stringify(compact(state.blocks)));
  return q;
}

let timer;
const scheduleReadme = () => (clearTimeout(timer), (timer = setTimeout(loadReadme, 350)));

async function loadReadme() {
  if (!state.username) return;
  try {
    state.md = await api(`/api/readme?${readmeQuery()}`);
    renderOutput();
  } catch (e) {
    status(e.message, true);
  }
}

function renderOutput() {
  $('#code').textContent = state.md;
  const preview = $('#preview');
  preview.innerHTML = marked.parse(state.md);
  // Pin each <picture> to the chosen preview mode instead of the OS setting.
  for (const pic of preview.querySelectorAll('picture')) {
    const src = pic.querySelector('source');
    if (state.mode === 'light' && src) pic.querySelector('img').src = src.srcset;
    src?.remove();
  }
  // Text blocks are markdown from shared URLs: only allow web and mail links in the preview.
  for (const a of preview.querySelectorAll('a')) {
    if (!/^(https?:|mailto:|#)/i.test(a.getAttribute('href') || '')) a.removeAttribute('href');
    Object.assign(a, { target: '_blank', rel: 'noopener' });
  }
  for (const b of ['#copy', '#download']) $(b).disabled = !state.md;
}

async function loadProfile() {
  state.username = $('#username').value.trim().replace(/^@/, '');
  if (!state.username) return;
  syncUrl();
  status('Loading public GitHub data…');
  $('#crumb').textContent = `${state.username} / README.md`;
  try {
    renderProfile(await api(`/api/profile?username=${encodeURIComponent(state.username)}`));
    status('Profile loaded. Pick a template, then customize it in Blocks.');
    await loadReadme();
  } catch (e) {
    $('#profile').hidden = true;
    status(e.message, true);
  }
}

function setView(view) {
  for (const t of document.querySelectorAll('.tabs [role=tab]')) t.setAttribute('aria-selected', t.dataset.view === view);
  $('#preview').hidden = view !== 'preview';
  $('#code').hidden = view !== 'code';
}

$('#user-form').addEventListener('submit', (e) => (e.preventDefault(), loadProfile()));
$('#details').addEventListener('input', (e) => {
  const boxes = $('#details').querySelectorAll('input[name=projects]:checked');
  if (e.target.name === 'projects' && boxes.length > MAX_REPOS) e.target.checked = false;
  scheduleReadme();
});
$('#templates').addEventListener('click', (e) => {
  const b = e.target.closest('[data-tpl]');
  if (b) useTemplate(b.dataset.tpl);
});
$('#themes').addEventListener('click', (e) => {
  const b = e.target.closest('[data-theme]');
  if (!b) return;
  state.theme = b.dataset.theme;
  renderGallery(), syncUrl(), loadReadme();
});
for (const t of document.querySelectorAll('.tabs [role=tab]')) t.addEventListener('click', () => setView(t.dataset.view));
$('#mode').addEventListener('click', () => {
  state.mode = state.mode === 'dark' ? 'light' : 'dark';
  $('#md-dark').disabled = state.mode === 'light';
  $('#md-light').disabled = state.mode === 'dark';
  document.querySelector('.window').dataset.mode = state.mode;
  if (state.md) renderOutput();
});
$('#copy').addEventListener('click', async () => {
  await navigator.clipboard.writeText(state.md);
  $('#copy').textContent = 'Copied';
  setTimeout(() => ($('#copy').textContent = 'Copy README'), 1500);
});
$('#download').addEventListener('click', () => {
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([state.md], { type: 'text/markdown' })), download: 'README.md' });
  a.click();
  URL.revokeObjectURL(a.href);
});

// --- boot -------------------------------------------------------------------

$('#base').textContent = location.origin;
state.meta = await api('/api/meta');
const params = new URLSearchParams(location.search);
for (const k of ['username', 'template', 'theme']) if (params.get(k)) state[k] = params.get(k);
if (!state.meta.templates[state.template]) state.template = 'recruiter';
if (!state.meta.themes[state.theme]) state.theme = 'github-dark';

// A shared link's blocks win; otherwise restore this browser's last custom arrangement of the same template.
let saved = null;
try {
  saved = params.get('blocks') ? { custom: true, blocks: JSON.parse(params.get('blocks')) } : JSON.parse(localStorage.getItem(STORE) || 'null');
} catch {}
if (saved?.custom && Array.isArray(saved.blocks) && (params.get('blocks') || saved.template === state.template)) {
  state.blocks = saved.blocks.filter((b) => state.meta.blocks.types[b?.type]).map(complete);
  state.custom = true;
} else state.blocks = clone(state.meta.templates[state.template].blocks);

renderGallery(), renderBlocks(), renderLibrary();
if (state.username) ($('#username').value = state.username), loadProfile();
