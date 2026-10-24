// Builder links shared before the landing page existed pointed at /?username=…; send them on.
if (/[?&](username|template|theme|blocks)=/.test(location.search)) location.replace(`/build${location.search}`);

const $ = (s) => document.querySelector(s);
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const DEMO = 'farhanfath';
// Template -> the card that best shows it off, and the theme to render it in.
const SHOWCASE = [
  ['city', 'city'],
  ['galaxy', 'galaxy'],
  ['room', 'room'],
  ['island', 'island'],
  ['synthwave', 'synthwave', 'synthwave'],
  ['snake', 'snake'],
  ['neofetch', 'neofetch', 'tokyo-night'],
  ['recruiter', 'stats'],
];
const WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen'];

// --- contribution field -------------------------------------------------------

const LEVELS = ['#121417', '#0e4429', '#006d32', '#26a641', '#39d353'];
function field(canvas) {
  const ctx = canvas.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cells = [], cols = 0, rows = 0, size = 0, raf = 0, last = 0, visible = true;

  function layout() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    size = width < 700 ? 13 : 17;
    cols = Math.ceil(width / size) + 1;
    rows = Math.ceil(height / size) + 1;
    // Weekdays (rows 1-5 of each 7) commit more, like a real calendar.
    cells = Array.from({ length: cols * rows }, (_, i) => {
      const day = Math.floor(i / cols) % 7;
      const busy = day > 0 && day < 6 ? 0.45 : 0.18;
      const base = Math.random() < busy ? 1 + Math.floor(Math.random() ** 2.4 * 4) : 0;
      return { base, heat: 0 };
    });
    draw(true);
  }

  function draw(all) {
    for (let i = 0; i < cells.length; i++) {
      const c = cells[i];
      if (!all && !c.dirty) continue;
      const x = (i % cols) * size, y = Math.floor(i / cols) * size;
      ctx.clearRect(x, y, size, size);
      ctx.fillStyle = LEVELS[Math.min(4, Math.round(c.base + c.heat * (4 - c.base)))];
      ctx.beginPath();
      ctx.roundRect(x + 2, y + 2, size - 4, size - 4, 3);
      ctx.fill();
      c.dirty = c.heat > 0;
    }
  }

  function tick(t) {
    raf = requestAnimationFrame(tick);
    if (t - last < 50) return;
    last = t;
    // A handful of fresh commits land each tick, then cool back to their base level.
    for (let n = 0; n < 3; n++) Object.assign(cells[(Math.random() * cells.length) | 0], { heat: 1, dirty: true });
    for (const c of cells) if (c.heat > 0) c.heat = Math.max(0, c.heat - 0.035);
    draw(false);
  }

  const run = () => {
    cancelAnimationFrame(raf);
    if (!still && visible && !document.hidden) raf = requestAnimationFrame(tick);
  };
  new ResizeObserver(layout).observe(canvas);
  new IntersectionObserver(([e]) => ((visible = e.isIntersecting), run())).observe(canvas);
  document.addEventListener('visibilitychange', run);
}
field($('#field'));

// --- content from the API -----------------------------------------------------

function renderGallery({ templates, themes }) {
  const shown = SHOWCASE.filter(([key]) => templates[key]);
  $('#gallery').innerHTML = shown
    .map(([key, card, theme = 'github-dark']) => {
      const t = templates[key];
      const src = `/api/card/${card}?username=${DEMO}&theme=${theme}`;
      return `<a class="tile" href="/build?template=${key}&theme=${theme}">
        <span class="tile-frame" style="--frame:${themes[theme]?.bg || '#0d1117'}"><img src="${src}" alt="${escapeHtml(t.label)} card drawn from @${DEMO}'s public GitHub data" loading="lazy" decoding="async" /></span>
        <span class="tile-meta"><strong>${escapeHtml(t.label)}</strong><small>${escapeHtml(t.blurb)}</small></span>
      </a>`;
    })
    .join('');
  // GitHub's unauthenticated rate limit can run out; say so instead of showing a broken image.
  for (const img of document.querySelectorAll('.tile img')) img.addEventListener('error', () => img.parentElement.classList.add('failed'), { once: true });

  const total = Object.keys(templates).length;
  $('#tpl-count').textContent = WORDS[total] || total;
  const rest = Object.entries(templates).filter(([k]) => !shown.some(([s]) => s === k)).map(([, t]) => t.label);
  $('#more-list').textContent = rest.length > 1 ? `${rest.slice(0, -1).join(', ')} and ${rest.at(-1)}` : rest.join('');

  const list = Object.values(themes);
  $('#theme-count').textContent = WORDS[list.length] || list.length;
  $('#theme-list').innerHTML = list
    .map((t) => `<li><span style="background:${t.bg}">${t.accents.map((a) => `<i style="background:${a}"></i>`).join('')}</span>${escapeHtml(t.label)}</li>`)
    .join('');
}

async function renderSnippet() {
  const res = await fetch(`/api/readme?username=${DEMO}&template=city`);
  if (!res.ok) throw new Error(res.statusText);
  // Long card URLs drown the structure; shorten them for the teaser.
  const md = (await res.text()).replace(/https?:\/\/[^\s"')]+\/api\/card\/(\w+)\?[^\s"')]+/g, '…/card/$1');
  $('#md-snippet').textContent = md.split('\n').slice(0, 18).join('\n');
}

fetch('/api/meta')
  .then((r) => r.json())
  .then(renderGallery)
  .catch(() => ($('#gallery').innerHTML = '<p class="more">Templates could not load. <a href="/build">Open the builder</a></p>'));
renderSnippet().catch(() => ($('#md-snippet').textContent = 'README preview unavailable right now.'));
