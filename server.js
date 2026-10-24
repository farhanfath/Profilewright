import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { getProfile } from './lib/github.js';
import { CARDS } from './lib/cards.js';
import { THEMES } from './lib/themes.js';
import { TEMPLATES, cleanOptions, defaults, renderReadme } from './lib/templates.js';
import { blockMeta, sanitizeBlocks } from './lib/blocks.js';

const PORT = process.env.PORT || 3000;
const PUBLIC = join(import.meta.dirname, 'public');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };

const send = (res, status, body, type = 'application/json; charset=utf-8', extra = {}) => {
  res.writeHead(status, { 'Content-Type': type, ...extra });
  res.end(type.startsWith('application/json') ? JSON.stringify(body) : body);
};

// Card URLs end up inside READMEs on github.com, so they must point at the public host.
const baseUrl = (req) => process.env.PUBLIC_URL?.replace(/\/$/, '') || `http://${req.headers.host}`;

async function handle(req, res) {
  const url = new URL(req.url, 'http://x');
  const q = Object.fromEntries(url.searchParams);
  const path = url.pathname;

  if (path === '/api/meta') {
    const templates = Object.fromEntries(Object.entries(TEMPLATES).map(([k, t]) => [k, { label: t.label, blurb: t.blurb, tags: t.tags, blocks: t.blocks }]));
    const themes = Object.fromEntries(Object.entries(THEMES).map(([k, t]) => [k, { label: t.label, bg: t.bg, accents: t.accents }]));
    return send(res, 200, { templates, themes, blocks: blockMeta() });
  }

  if (path === '/api/profile') {
    const profile = await getProfile(q.username || '');
    return send(res, 200, { profile, defaults: defaults(profile) });
  }

  if (path === '/api/readme') {
    const profile = await getProfile(q.username || '');
    const { username, template, projects, blocks, ...opts } = q;
    if (projects) opts.projects = projects.split(',');
    let custom = null;
    if (blocks) {
      try {
        custom = sanitizeBlocks(JSON.parse(blocks));
      } catch {
        return send(res, 400, { error: 'Invalid blocks' });
      }
    }
    const md = renderReadme(template, profile, opts, baseUrl(req), custom);
    return send(res, 200, md, 'text/markdown; charset=utf-8');
  }

  const cardMatch = path.match(/^\/api\/card\/(\w+)$/);
  if (cardMatch && CARDS[cardMatch[1]]) {
    const profile = await getProfile(q.username || '');
    const { repos, ...rest } = q;
    const svg = CARDS[cardMatch[1]](profile, { ...cleanOptions(rest), repos: repos ? repos.split(',') : [] });
    // GitHub's camo proxy respects cache headers; 1h matches the data cache.
    return send(res, 200, svg, 'image/svg+xml; charset=utf-8', { 'Cache-Control': 'public, max-age=3600' });
  }

  const page = { '/': 'index.html', '/build': 'build.html' }[path];
  const file = normalize(join(PUBLIC, page || path));
  if (!file.startsWith(PUBLIC)) return send(res, 403, { error: 'Forbidden' });
  try {
    return send(res, 200, await readFile(file), TYPES[extname(file)] || 'application/octet-stream');
  } catch {
    return send(res, 404, { error: 'Not found' });
  }
}

createServer((req, res) =>
  handle(req, res).catch((err) => send(res, err.status || 500, { error: err.status ? err.message : 'Internal error' }))
).listen(PORT, () => console.log(`Profilewright on http://localhost:${PORT}`));
