// A README is a list of blocks. Templates are preset lists; the composer lets people edit them.
// Every block renders to GitHub-safe markdown/HTML; every string that comes from a user or from
// GitHub is escaped here.
import { esc, CARDS } from './cards.js';
import { THEMES } from './themes.js';

// --- shared helpers -------------------------------------------------------

export const CARD_INFO = {
  hero: { label: 'Hero banner', alt: 'hero', params: ['tagline'] },
  stats: { label: 'Stats', alt: 'GitHub stats' },
  stack: { label: 'Language stack', alt: 'technology stack' },
  heatmap: { label: 'Contribution heatmap', alt: 'contribution activity' },
  projects: { label: 'Selected projects', alt: 'selected projects' },
  social: { label: 'Social links', alt: 'links', params: ['website', 'linkedin', 'email'] },
  neofetch: { label: 'Neofetch', alt: 'neofetch-style profile card', params: ['role', 'website'] },
  city: { label: 'Contribution City (3D)', alt: 'contribution city' },
  galaxy: { label: 'Repo Galaxy', alt: 'repo galaxy' },
  snake: { label: 'Snake Trail', alt: 'snake trail through contribution activity' },
  synthwave: { label: 'Synthwave Horizon (3D)', alt: 'synthwave horizon', params: ['role'] },
  island: { label: 'Voxel Island (3D)', alt: 'voxel island' },
  room: { label: 'Dev Room (3D)', alt: 'isometric dev room' },
};

export const pickedProjects = (profile, opts) => {
  const picked = profile.projects.filter((r) => opts.projects?.includes(r.name));
  return (picked.length ? picked : profile.projects).slice(0, 3);
};

function picture({ profile, base }, opts, section) {
  const info = CARD_INFO[section];
  let extra = (info.params || []).filter((k) => opts[k]).map((k) => `&${k}=${encodeURIComponent(opts[k])}`).join('');
  if (section === 'projects') extra += `&repos=${encodeURIComponent(pickedProjects(profile, opts).map((r) => r.name).join(','))}`;
  const q = (mode) => `${base}/api/card/${section}?username=${encodeURIComponent(profile.login)}&theme=${opts.theme}${extra}&mode=${mode}`;
  return `<picture>
  <source media="(prefers-color-scheme: light)" srcset="${q('light')}" />
  <img src="${q('dark')}" width="100%" alt="${esc(profile.name)} ${info.alt}" />
</picture>`;
}

const SEPS = { dot: ' · ', spaced: ' &nbsp;·&nbsp; ', line: '<br />' };
export const linkList = (profile, opts, sep = SEPS.spaced) =>
  [
    `<a href="https://github.com/${esc(profile.login)}">GitHub</a>`,
    opts.website && `<a href="${esc(opts.website)}">Website</a>`,
    opts.linkedin && `<a href="${esc(opts.linkedin)}">LinkedIn</a>`,
    opts.email && `<a href="mailto:${esc(opts.email)}">Email</a>`,
    profile.twitter && `<a href="https://x.com/${esc(profile.twitter)}">X</a>`,
  ]
    .filter(Boolean)
    .join(sep);

// {tokens} in user text are filled from the profile.
export const TOKENS = ['name', 'login', 'role', 'tagline', 'status', 'repos', 'stars', 'followers', 'following', 'contributions', 'activeDays', 'streak', 'bestStreak', 'topLanguage', 'year'];
function tokenValues({ profile, opts }) {
  const c = profile.contributions;
  return {
    name: profile.name, login: profile.login, role: opts.role, tagline: opts.tagline, status: opts.status,
    repos: profile.publicRepos, stars: profile.stars, followers: profile.followers, following: profile.following ?? 0,
    contributions: c.total, activeDays: c.activeDays, streak: c.streak, bestStreak: c.longestStreak,
    topLanguage: profile.languages[0]?.name ?? '', year: new Date().getFullYear(),
  };
}
const fill = (s, ctx) => {
  const v = tokenValues(ctx);
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in v ? esc(v[k]) : m));
};
// Inside HTML: escape everything, then allow **bold**, `code` and line breaks.
const inline = (s, ctx) =>
  fill(esc(s), ctx)
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br/>');
// Plain markdown: only block raw HTML; markdown syntax (incl. "> quote") stays.
const md = (s, ctx) => fill(s.replace(/&/g, '&amp;').replace(/</g, '&lt;'), ctx);

const fold = (title, body, open) => `<details${open ? ' open' : ''}>
<summary><b>${title}</b></summary>
<br/>

${body}

</details>`;

// --- block types ----------------------------------------------------------

const themeOptions = ['', ...Object.keys(THEMES)];
const F = {
  text: (key, label, max = 200) => ({ key, label, type: 'text', max }),
  area: (key, label, max = 1000) => ({ key, label, type: 'textarea', max }),
  select: (key, label, options, def = options[0]) => ({ key, label, type: 'select', options, default: def }),
  check: (key, label) => ({ key, label, type: 'checkbox' }),
};

export const BLOCKS = {
  card: {
    label: 'Card',
    fields: [
      F.select('card', 'Card', Object.keys(CARDS), 'stats'),
      F.text('title', 'Section title'),
      F.select('fold', 'Collapsible', ['', 'open', 'closed']),
      F.select('theme', 'Theme (blank = global)', themeOptions),
      F.area('caption', 'Caption', 400),
      F.select('captionPos', 'Caption position', ['below', 'above']),
      F.check('small', 'Small caption'),
      F.check('list', 'List repos under it (projects)'),
      F.check('half', 'Half width (pairs with the next half card)'),
    ],
    render(b, ctx) {
      const opts = b.theme ? { ...ctx.opts, theme: b.theme } : ctx.opts;
      const cap = b.caption ? `<p align="center">${b.small ? '<sub>' : ''}${inline(b.caption, ctx)}${b.small ? '</sub>' : ''}</p>` : '';
      const list =
        b.list && b.card === 'projects'
          ? ctx.profile.projects.map((r) => `- [${esc(r.name)}](${esc(r.url)}) · ★ ${r.stars}${r.description ? ` — ${esc(r.description)}` : ''}`).join('\n')
          : '';
      const body = [b.captionPos === 'above' && cap, `<p align="center">\n${picture(ctx, opts, b.card)}\n</p>`, list, b.captionPos !== 'above' && cap]
        .filter(Boolean)
        .join('\n\n');
      if (b.fold) return fold(inline(b.title || CARD_INFO[b.card].label, ctx), body, b.fold === 'open');
      return b.title ? `## ${md(b.title, ctx)}\n\n${body}` : body;
    },
  },
  heading: {
    label: 'Heading',
    fields: [F.text('text', 'Text'), F.select('level', 'Level', ['2', '1', '3']), F.select('align', 'Align', ['left', 'center'])],
    render(b, ctx) {
      return b.align === 'center' ? `<h${b.level} align="center">${inline(b.text, ctx)}</h${b.level}>` : `${'#'.repeat(+b.level)} ${md(b.text, ctx)}`;
    },
  },
  text: {
    label: 'Text',
    fields: [F.area('text', 'Text (markdown, {tokens})'), F.select('align', 'Align', ['left', 'center']), F.check('small', 'Small')],
    render(b, ctx) {
      if (b.align === 'center' || b.small) return `<p align="${b.align}">${b.small ? '<sub>' : ''}${inline(b.text, ctx)}${b.small ? '</sub>' : ''}</p>`;
      return md(b.text, ctx);
    },
  },
  links: {
    label: 'Links row',
    fields: [F.select('align', 'Align', ['center', 'left']), F.select('sep', 'Separator', ['dot', 'spaced', 'line']), F.text('prefix', 'Prefix'), F.text('suffix', 'Suffix'), F.check('small', 'Small')],
    render(b, ctx) {
      const parts = (b.prefix ? `${inline(b.prefix, ctx)} &nbsp; ` : '') + linkList(ctx.profile, ctx.opts, SEPS[b.sep]) + (b.suffix ? ` · ${inline(b.suffix, ctx)}` : '');
      const body = b.small ? `<sub>${parts}</sub>` : parts;
      return b.align === 'center' ? `<p align="center">${body}</p>` : `<p>${body}</p>`;
    },
  },
  divider: { label: 'Divider', fields: [], render: () => '<hr />' },

  // Sections lifted from the original templates.
  recruiterHero: {
    label: 'Recruiter hero',
    section: true,
    fields: [],
    render({}, { profile, opts }) {
      return `<div align="center">

<table width="100%">
<tr>
<td width="64%" valign="middle">
<p><sub>RECRUITER SIGNAL BRIEF · ${esc(profile.login)}</sub></p>
<h1>${esc(profile.name)}</h1>
<h2>${esc(opts.role)}</h2>
<p>${esc(opts.tagline)}</p>
${opts.status ? `<p><strong>● ${esc(opts.status)}</strong></p>\n` : ''}<p>${linkList(profile, opts)}</p>
</td>
<td width="36%" valign="middle" align="center">
<img src="${esc(profile.avatar)}" width="180" alt="${esc(profile.name)} GitHub avatar" />
</td>
</tr>
</table>
</div>`;
    },
  },
  evaluate: {
    label: 'Role fit / proof / momentum',
    section: true,
    fields: [],
    render({}, { profile, opts }) {
      const c = profile.contributions;
      return `<h2>What teams can evaluate quickly</h2>

<table width="100%">
<tr>
<td width="33%" valign="top"><h3>Role fit</h3><p>${esc([opts.role, ...profile.languages.slice(0, 3).map((l) => l.name)].join(' · '))}</p></td>
<td width="33%" valign="top"><h3>Public proof</h3><p>${profile.publicRepos} repositories · ${profile.stars} stars</p></td>
<td width="33%" valign="top"><h3>Momentum</h3><p>${c.total} contributions · ${c.activeDays} active days</p></td>
</tr>
</table>`;
    },
  },
  proofNumbers: {
    label: 'Proof at a glance (numbers)',
    section: true,
    fields: [],
    render({}, { profile }) {
      const c = profile.contributions;
      const cells = [
        [profile.publicRepos, 'Repositories'],
        [profile.stars, 'Stars'],
        [c.total, 'Contributions'],
        [profile.followers, 'Followers'],
      ].map(([v, l]) => `<td width="25%" align="center"><strong>${v}</strong><br /><sub>${l}</sub></td>`);
      return `<h2>Proof at a glance</h2>

<table width="100%">
<tr>
${cells.join('\n')}
</tr>
</table>`;
    },
  },
  selectedWork: {
    label: 'Selected work (projects + lead)',
    section: true,
    fields: [],
    render({}, ctx) {
      const { profile, opts } = ctx;
      const [lead, ...rest] = pickedProjects(profile, opts);
      if (!lead) return '';
      return `<h2>Selected work</h2>

<table width="100%">
<tr>
<td width="58%" valign="top">
${picture(ctx, opts, 'projects')}
</td>
<td width="42%" valign="top">
<h3><a href="${esc(lead.url)}">${esc(lead.name)}</a></h3>
<p>${esc(lead.description || 'A selected public project.')}</p>
<p><sub>${esc(lead.language || '—')} · ⭐ ${lead.stars} · 🍴 ${lead.forks}</sub></p>
<p><a href="${esc(lead.url)}">Read the repository →</a></p>
</td>
</tr>
</table>${
        rest.length
          ? `

<table width="100%">
<tr>
${rest.map((r) => `<td width="50%" valign="top"><h3><a href="${esc(r.url)}">${esc(r.name)}</a></h3><p>${esc(r.description || 'A selected public project.')}</p><p><sub>${esc(r.language || '—')} · ⭐ ${r.stars}</sub></p></td>`).join('\n')}
</tr>
</table>`
          : ''
      }`;
    },
  },
  langTable: {
    label: 'Language % table',
    section: true,
    fields: [],
    render({}, { profile }) {
      const langs = profile.languages.slice(0, 5);
      if (!langs.length) return '';
      const w = Math.floor(100 / langs.length);
      return `<table width="100%">
<tr>
${langs.map((l) => `<td width="${w}%" align="center"><strong>${esc(l.name)}</strong><br /><sub>${l.percent}% of public code</sub></td>`).join('\n')}
</tr>
</table>`;
    },
  },
  cta: {
    label: 'Call to action',
    section: true,
    fields: [F.text('title', 'Title')],
    render(b, ctx) {
      return `<table width="100%">
<tr>
<td width="62%" valign="middle"><h2>${inline(b.title || 'Let’s talk about the next build', ctx)}</h2><p>${esc(ctx.opts.cta)}</p></td>
<td width="38%" valign="middle" align="right">${linkList(ctx.profile, ctx.opts, SEPS.line)}</td>
</tr>
</table>`;
    },
  },
  intro: {
    label: 'Avatar intro',
    section: true,
    fields: [],
    render({}, { profile, opts }) {
      return `<div align="center">
<img src="${esc(profile.avatar)}" width="110" alt="${esc(profile.name)} avatar" />

<h1>Hi, I'm ${esc(profile.name)} 👋</h1>
<p><strong>${esc(opts.role)}</strong></p>
<p>${esc(opts.tagline)}</p>
<p>${linkList(profile, opts)}</p>
</div>`;
    },
  },
  projectList: {
    label: 'Project list',
    section: true,
    fields: [],
    render({}, { profile, opts }) {
      return pickedProjects(profile, opts)
        .map((r) => `- **[${esc(r.name)}](${esc(r.url)})** — ${esc(r.description || 'A public project.')} <sub>${esc(r.language)}</sub>`)
        .join('\n');
    },
  },
  whoami: {
    label: 'Terminal whoami',
    section: true,
    fields: [],
    render({}, { profile, opts }) {
      return `<h3><code>~/${esc(profile.login)} $ whoami</code></h3>

\`\`\`text
name      ${profile.name}
role      ${opts.role}
about     ${opts.tagline}
langs     ${profile.languages.map((l) => `${l.name} ${l.percent}%`).join(', ') || '-'}
repos     ${profile.publicRepos}   stars ${profile.stars}   followers ${profile.followers}
commits   ${profile.contributions.total} contributions in the last year
\`\`\``;
    },
  },
  lsProjects: {
    label: 'Terminal project list',
    section: true,
    fields: [],
    render({}, { profile, opts }) {
      return `<h3><code>$ ls ~/projects</code></h3>

${pickedProjects(profile, opts).map((r) => `- [\`${esc(r.name)}/\`](${esc(r.url)}) ${esc(r.description)}`).join('\n')}`;
    },
  },
  masthead: {
    label: 'Newspaper masthead',
    section: true,
    fields: [],
    render({}, { profile, opts }) {
      return `<div align="center">

<sub>VOL. ${new Date().getFullYear()} · No. ${profile.contributions.total} · github.com/${esc(profile.login)}</sub>

# The ${esc(profile.name)} Times

<sub><b>${esc(opts.role.toUpperCase())}</b> · ALL THE CODE THAT'S FIT TO SHIP</sub>

</div>`;
    },
  },
  newsTable: {
    label: 'Newspaper columns',
    section: true,
    fields: [],
    render({}, { profile, opts }) {
      const [lead, ...rest] = pickedProjects(profile, opts);
      const c = profile.contributions;
      const story = (r) => `<a href="${esc(r.url)}">${esc(r.name)}</a> · ★ ${r.stars}<br/><sub>${esc(r.description || 'A public project on GitHub.')}</sub>`;
      return `<table>
<tr>
<td width="44%" valign="top">

### Top stories

${lead ? `<b>${story(lead)}</b><br/><br/>\n` : ''}${rest.map(story).join('<br/><br/>\n')}

</td>
<td width="28%" valign="top">

### By the numbers

Repositories: <b>${profile.publicRepos}</b><br/>
Stars: <b>${profile.stars}</b><br/>
Contributions: <b>${c.total}</b><br/>
Longest streak: <b>${c.longestStreak} days</b><br/>
Followers: <b>${profile.followers}</b>

</td>
<td width="28%" valign="top">

### Languages

${profile.languages.map((l) => `${esc(l.name)} · ${l.percent}%`).join('<br/>\n') || '—'}

</td>
</tr>
</table>`;
    },
  },
};

// --- validation and rendering ----------------------------------------------

export const MAX_BLOCKS = 40;

// Blocks arrive from URLs other people can share: keep only known types and fields.
export function sanitizeBlocks(raw) {
  if (!Array.isArray(raw)) return null;
  return raw.slice(0, MAX_BLOCKS).flatMap((b) => {
    const def = b && BLOCKS[b.type];
    if (!def) return [];
    const out = { type: b.type };
    for (const f of def.fields) {
      const v = b[f.key];
      if (f.type === 'checkbox') out[f.key] = v === true;
      else if (f.type === 'select') out[f.key] = f.options.includes(String(v ?? '')) ? String(v ?? '') : f.default;
      else out[f.key] = typeof v === 'string' ? v.slice(0, f.max) : '';
    }
    return [out];
  });
}

export function renderBlocks(blocks, ctx) {
  const out = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i], next = blocks[i + 1];
    // Two half-width cards in a row sit side by side.
    if (b.type === 'card' && b.half && next?.type === 'card' && next.half) {
      const cell = (x) => `<td width="50%" valign="top">\n\n${BLOCKS.card.render(x, ctx)}\n\n</td>`;
      out.push(`<table width="100%">\n<tr>\n${cell(b)}\n${cell(next)}\n</tr>\n</table>`);
      i++;
      continue;
    }
    const html = BLOCKS[b.type].render(b, ctx);
    if (html) out.push(html);
  }
  return out.join('\n\n') + '\n';
}

// What the composer UI needs to build its forms and library.
export function blockMeta() {
  const types = Object.fromEntries(Object.entries(BLOCKS).map(([k, d]) => [k, { label: d.label, section: !!d.section, fields: d.fields }]));
  const library = [
    ...Object.keys(CARDS).map((c) => ({ group: 'Cards', label: CARD_INFO[c].label, block: { type: 'card', card: c } })),
    { group: 'Basics', label: 'Heading', block: { type: 'heading', text: 'New section', level: '2' } },
    { group: 'Basics', label: 'Text', block: { type: 'text', text: 'Write something about **{name}**.' } },
    { group: 'Basics', label: 'Links row', block: { type: 'links' } },
    { group: 'Basics', label: 'Divider', block: { type: 'divider' } },
    ...Object.entries(BLOCKS)
      .filter(([, d]) => d.section)
      .map(([k, d]) => ({ group: 'Sections', label: d.label, block: { type: k } })),
  ];
  return { types, library, tokens: TOKENS };
}
