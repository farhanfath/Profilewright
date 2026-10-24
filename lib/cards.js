import { palette } from './themes.js';

const W = 860;
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const clip = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

// Shared frame: gradient panel, glow orbs, title + subtitle. `body` is raw SVG.
function frame(p, h, title, subtitle, body) {
  return shell(p, h, title, `<text x="32" y="50" class="t">${esc(title)}</text>
<text x="32" y="72" class="s">${esc(subtitle)}</text>
${body}`);
}

function shell(p, h, label, body) {
  const [a1, a2, a3] = p.accents;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}" viewBox="0 0 ${W} ${h}" role="img" aria-label="${esc(label)}">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.bg}"/><stop offset=".55" stop-color="${p.bg2}"/><stop offset="1" stop-color="${p.bg}"/></linearGradient>
  <radialGradient id="o1"><stop offset="0" stop-color="${a1}" stop-opacity=".45"/><stop offset="1" stop-color="${a1}" stop-opacity="0"/></radialGradient>
  <radialGradient id="o2"><stop offset="0" stop-color="${a3}" stop-opacity=".35"/><stop offset="1" stop-color="${a3}" stop-opacity="0"/></radialGradient>
  <clipPath id="c"><rect width="${W}" height="${h}" rx="18"/></clipPath>
  <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".07"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
</defs>
<style>
  text{font-family:${FONT}}
  .t{font-size:24px;font-weight:800;fill:${p.text}}
  .s{font-size:12px;fill:${p.muted};letter-spacing:.4px}
  .l{font-size:11px;font-weight:700;fill:${p.muted};text-transform:uppercase;letter-spacing:1px}
  .v{font-size:30px;font-weight:800}
  .n{font-size:14px;font-weight:700;fill:${p.text}}
  .m{font-size:12px;fill:${p.muted}}
  .bar{transform-box:fill-box;transform-origin:left;animation:grow 1.2s cubic-bezier(.2,.8,.2,1) both}
  @keyframes grow{from{transform:scaleX(0)}}
  .rise{animation:rise .9s cubic-bezier(.2,.8,.2,1) both}
  @keyframes rise{from{opacity:0;transform:translateY(10px)}}
  .float{animation:float 5s ease-in-out infinite}
  @keyframes float{50%{transform:translateY(-4px)}}
  .pulse{animation:pulse 2.4s ease-in-out infinite}
  @keyframes pulse{50%{opacity:.3}}
  .spin{transform-box:fill-box;transform-origin:center;animation:spin 14s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  @media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
<g clip-path="url(#c)">
  <rect width="${W}" height="${h}" fill="url(#bg)"/>
  <circle cx="${W - 90}" cy="20" r="190" fill="url(#o1)"><animateTransform attributeName="transform" type="translate" values="0 0;-60 30;0 0" dur="16s" repeatCount="indefinite"/></circle>
  <circle cx="60" cy="${h}" r="170" fill="url(#o2)"><animateTransform attributeName="transform" type="translate" values="0 0;70 -25;0 0" dur="20s" repeatCount="indefinite"/></circle>
  <rect x="-300" width="260" height="${h}" fill="url(#sheen)" transform="skewX(-20)"><animate attributeName="x" values="-300;${W + 300};${W + 300}" keyTimes="0;.4;1" dur="7s" repeatCount="indefinite"/></rect>
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${h - 1}" rx="18" fill="none" stroke="${p.border}"/>
<circle cx="${W - 24}" cy="22" r="3" fill="${a2}"/>
<circle cx="${W - 24}" cy="22" r="3" fill="none" stroke="${a2}"><animate attributeName="r" values="3;11" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".8;0" dur="2s" repeatCount="indefinite"/></circle>
${body}
</svg>`;
}

export function statsCard(profile, { theme, mode } = {}) {
  const p = palette(theme, mode);
  const items = [
    ['Stars', profile.stars],
    ['Contributions', profile.contributions.total],
    ['Repos', profile.publicRepos],
    ['Followers', profile.followers],
  ];
  const max = Math.max(...items.map(([, v]) => v), 1);
  const tw = (W - 64 - 3 * 16) / 4;
  const tiles = items
    .map(([label, value], i) => {
      const x = 32 + i * (tw + 16);
      const c = p.accents[i % p.accents.length];
      const fill = Math.max(0.06, Math.log1p(value) / Math.log1p(max)) * (tw - 40);
      // Wrapper groups: CSS transforms would otherwise replace the translate() attribute.
      return `<g transform="translate(${x} 100)"><g class="rise" style="animation-delay:${i * 0.12}s"><g class="float" style="animation-delay:${i * 0.7}s">
  <rect width="${tw}" height="120" rx="14" fill="${p.bg}" fill-opacity=".55" stroke="${p.border}"/>
  <text x="20" y="30" class="l">${label}</text>
  <text x="20" y="74" class="v" fill="${c}">${value.toLocaleString('en-US')}</text>
  <rect x="20" y="94" width="${tw - 40}" height="5" rx="2.5" fill="${p.border}"/>
  <rect class="bar" style="animation-delay:${i * 0.12}s" x="20" y="94" width="${fill.toFixed(1)}" height="5" rx="2.5" fill="${c}"/>
  <circle class="pulse" style="animation-delay:${i * 0.3}s" cx="${(20 + fill).toFixed(1)}" cy="96.5" r="4" fill="${c}"/>
</g></g></g>`;
    })
    .join('\n');
  return frame(p, 250, 'Profile Signal', `Live GitHub stats · @${profile.login}`, tiles);
}

export function stackCard(profile, { theme, mode } = {}) {
  const p = palette(theme, mode);
  const langs = profile.languages.length ? profile.languages : [{ name: 'No public code yet', percent: 0 }];
  const rows = langs
    .map((l, i) => {
      const y = 112 + i * 30;
      const c = p.accents[i % p.accents.length];
      const bw = W - 360;
      const end = 270 + (bw * l.percent) / 100;
      return `<g class="rise" style="animation-delay:${i * 0.1}s"><circle cx="38" cy="${y - 4}" r="5" fill="${c}"/>
<text x="54" y="${y}" class="n">${esc(l.name)}</text>
<text x="240" y="${y}" class="m" text-anchor="end">${l.percent}%</text>
<rect x="270" y="${y - 9}" width="${bw}" height="8" rx="4" fill="${p.border}" fill-opacity=".6"/>
<rect class="bar" style="animation-delay:${i * 0.1}s" x="270" y="${y - 9}" width="${(end - 270).toFixed(1)}" height="8" rx="4" fill="${c}"/>
<circle class="pulse" style="animation-delay:${i * 0.25}s" cx="${end.toFixed(1)}" cy="${y - 5}" r="5.5" fill="${c}"/></g>`;
    })
    .join('\n');
  return frame(p, 112 + langs.length * 30 + 10, 'Language Stack', 'Repository-weighted technologies', rows);
}

export function heatmapCard(profile, { theme, mode } = {}) {
  const p = palette(theme, mode);
  const { days, total } = profile.contributions;
  const cell = 12, gap = 3, x0 = 32, y0 = 100;
  const startDow = days.length ? new Date(days[0].date + 'T00:00:00Z').getUTCDay() : 0;
  const op = [0, 0.35, 0.55, 0.8, 1];
  const cells = days
    .map((d, i) => {
      const k = i + startDow;
      const fill = d.level ? p.accents[1] : p.empty;
      const col = Math.floor(k / 7);
      // A brightness wave sweeps left to right; the column offset keeps it travelling.
      const wave = d.level ? `<animate attributeName="fill-opacity" values="${op[d.level]};1;${op[d.level]}" dur="4s" begin="${(col * 0.06).toFixed(2)}s" repeatCount="indefinite"/>` : '';
      return `<rect x="${x0 + col * (cell + gap)}" y="${y0 + (k % 7) * (cell + gap)}" width="${cell}" height="${cell}" rx="2.5" fill="${fill}" fill-opacity="${d.level ? op[d.level] : 1}" stroke="${p.border}" stroke-opacity=".5">${wave}</rect>`;
    })
    .join('');
  const gridW = Math.ceil((days.length + startDow) / 7) * (cell + gap);
  const scan = `<linearGradient id="scan" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${p.accents[1]}" stop-opacity="0"/><stop offset="1" stop-color="${p.accents[1]}" stop-opacity=".35"/></linearGradient>
<rect y="${y0 - 4}" width="40" height="${7 * (cell + gap) + 5}" fill="url(#scan)"><animate attributeName="x" values="${x0 - 40};${x0 + gridW};${x0 + gridW}" keyTimes="0;.6;1" dur="5s" repeatCount="indefinite"/></rect>`;
  const legend = op
    .map((o, i) => `<rect x="${W - 150 + i * 16}" y="40" width="12" height="12" rx="2.5" fill="${i ? p.accents[1] : p.empty}" fill-opacity="${i ? o : 1}"/>`)
    .join('');
  return frame(
    p,
    y0 + 7 * (cell + gap) + 24,
    'Contribution Activity',
    `${total.toLocaleString('en-US')} contributions in the last year`,
    `${cells}${scan}<text x="${W - 186}" y="50" class="m">Less</text>${legend}<text x="${W - 66}" y="50" class="m">More</text>`
  );
}

export function projectsCard(profile, { theme, mode, repos: picks = [] } = {}) {
  const p = palette(theme, mode);
  const list = picks.length ? profile.projects.filter((r) => picks.includes(r.name)) : profile.projects.slice(0, 3);
  const shown = (list.length ? list : profile.projects).slice(0, 3);
  const cw = (W - 64 - 2 * 16) / 3;
  const cards = shown
    .map((r, i) => {
      const c = p.accents[i % p.accents.length];
      const d = r.description || 'A selected public project.';
      return `<g transform="translate(${32 + i * (cw + 16)} 96)"><g class="rise" style="animation-delay:${i * 0.15}s"><g class="float" style="animation-delay:${i * 0.9}s">
  <rect width="${cw}" height="132" rx="14" fill="${p.bg}" fill-opacity=".55" stroke="${p.border}"/>
  <rect width="4" height="132" rx="2" fill="${c}"/>
  <rect class="pulse" style="animation-delay:${i * 0.4}s" width="4" height="132" rx="2" fill="${c}" filter="url(#pglow)"/>
  <text x="20" y="32" class="n" style="fill:${c}">${esc(clip(r.name, 26))}</text>
  <text x="20" y="58" class="m">${esc(d.slice(0, 38))}</text>
  <text x="20" y="76" class="m">${esc(clip(d.slice(38), 38))}</text>
  <text x="20" y="112" class="m">${esc(r.language || '—')}  ·  ★ ${r.stars}  ·  ⑂ ${r.forks}</text>
</g></g></g>`;
    })
    .join('\n');
  const glow = '<filter id="pglow" x="-200%" y="-10%" width="500%" height="120%"><feGaussianBlur stdDeviation="3"/></filter>';
  return frame(p, 252, 'Selected Work', 'Pinned from public repositories', glow + (cards || '<text x="32" y="130" class="m">No public repositories yet.</text>'));
}

const avatar = (profile, cx, cy, r, ring) => `<clipPath id="av"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>
${profile.avatarData ? `<image href="${profile.avatarData}" x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" clip-path="url(#av)" preserveAspectRatio="xMidYMid slice"/>` : `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${ring}" fill-opacity=".25"/><text x="${cx}" y="${cy + r / 3}" text-anchor="middle" class="t" style="font-size:${r}px">${esc(profile.name[0] || '?')}</text>`}
<circle cx="${cx}" cy="${cy}" r="${r + 1.5}" fill="none" stroke="${ring}" stroke-width="3"/>
<circle class="spin" cx="${cx}" cy="${cy}" r="${r + 9}" fill="none" stroke="${ring}" stroke-width="2" stroke-dasharray="5 11" stroke-linecap="round" stroke-opacity=".75"/>`;

export function heroCard(profile, { theme, mode, tagline } = {}) {
  const p = palette(theme, mode);
  let x = 170;
  const pills = profile.languages.slice(0, 5).map((l, i) => {
    const w = l.name.length * 8 + 36;
    const svg = `<g class="rise" style="animation-delay:${(0.35 + i * 0.1).toFixed(2)}s"><rect x="${x}" y="172" width="${w}" height="30" rx="15" fill="${p.bg}" fill-opacity=".6" stroke="${p.accents[i % 4]}" stroke-opacity=".7"/>
<text x="${x + w / 2}" y="192" text-anchor="middle" class="n" style="font-size:13px">${esc(l.name)}</text></g>`;
    x += w + 10;
    return svg;
  });
  return shell(p, 236, `${profile.name} hero`, `<rect x="20" y="20" width="${W - 40}" height="196" rx="16" fill="none" stroke="${p.accents[0]}" stroke-opacity=".35"/>
${avatar(profile, 96, 110, 52, p.accents[0])}
<g class="rise"><text x="170" y="70" class="l" style="letter-spacing:3px">@${esc(profile.login)}</text>
<text x="170" y="120" class="t" style="font-size:42px">${esc(clip(profile.name, 26))}</text></g>
<text x="170" y="150" class="m rise" style="font-size:15px;animation-delay:.2s">${esc(clip(tagline || profile.bio || `Building on GitHub.`, 80))}</text>
${pills.join('\n')}`);
}

export function socialCard(profile, { theme, mode, website, linkedin, email } = {}) {
  const p = palette(theme, mode);
  const items = [
    ['G', 'GitHub', `@${profile.login}`],
    website && ['W', 'Website', website.replace(/^https?:\/\//, '').replace(/\/$/, '')],
    linkedin && ['in', 'LinkedIn', linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '').replace(/\/$/, '')],
    email && ['@', 'Email', email],
    profile.twitter && ['X', 'X', `@${profile.twitter}`],
  ].filter(Boolean);
  const pw = 190, gap = 14;
  const x0 = (W - items.length * pw - (items.length - 1) * gap) / 2;
  const pills = items
    .map(([icon, label, value], i) => {
      const x = x0 + i * (pw + gap), c = p.accents[i % 4];
      return `<g class="rise" style="animation-delay:${i * 0.12}s"><g class="float" style="animation-delay:${i * 0.6}s"><rect x="${x}" y="38" width="${pw}" height="50" rx="25" fill="${p.bg}" fill-opacity=".8" stroke="${c}" stroke-opacity=".8"/>
<circle class="pulse" style="animation-delay:${i * 0.5}s" cx="${x + 26}" cy="63" r="17" fill="${c}" fill-opacity=".25"/>
<circle cx="${x + 26}" cy="63" r="14" fill="${c}" fill-opacity=".2"/>
<text x="${x + 26}" y="68" text-anchor="middle" class="n" style="fill:${c};font-size:13px">${icon}</text>
<text x="${x + 50}" y="58" class="l" style="font-size:10px">${label}</text>
<text x="${x + 50}" y="76" class="n" style="font-size:13px">${esc(clip(value, 18))}</text></g></g>`;
    })
    .join('\n');
  return shell(p, 126, `${profile.name} links`, `<rect x="20" y="20" width="${W - 40}" height="86" rx="16" fill="none" stroke="${p.accents[0]}" stroke-opacity=".3"/>\n${pills}`);
}

// Distro-logo slot of neofetch: the GitHub mark in ASCII.
const MARK = String.raw`            .:=+*####*+=:.
         .=#%%%%%%%%%%%%%%#=.
       .*%%%%%%%%%%%%%%%%%%%%*.
      +%%%%*  -#%%%%%%%#-  *%%%%+
     #%%%%%:               :%%%%%#
    *%%%%%=                 =%%%%%*
   .%%%%%%                   %%%%%%.
   -%%%%%#                   #%%%%%-
   -%%%%%%                   %%%%%%-
   .%%%%%%+                 +%%%%%%.
    *%%#. +#=.           .=#%%%%%%*
     #%%%: .*%%%-     -%%%%%%%%%%#
      +%%%#. :=-       -%%%%%%%%+
       .*%%%%*:         :%%%%%*.
         .=#%%%         %%%#=.
            .:=         =:.`.split('\n');

const leader = (label, value, width) => {
  const v = clip(String(value), Math.max(4, width - label.length - 6));
  return [`${label}: `, '.'.repeat(Math.max(2, width - label.length - v.length - 4)), ` ${v}`];
};

function since(iso, now = new Date()) {
  if (!iso) return '-';
  const months = (now.getFullYear() - new Date(iso).getFullYear()) * 12 + now.getMonth() - new Date(iso).getMonth();
  const y = Math.floor(months / 12), m = months % 12;
  return [y && `${y} year${y > 1 ? 's' : ''}`, m && `${m} month${m > 1 ? 's' : ''}`].filter(Boolean).join(', ') || 'new';
}

export function neofetchCard(profile, { theme, mode, role, website } = {}) {
  const p = palette(theme, mode);
  const [a1, a2, a3] = p.accents;
  const c = profile.contributions;
  const lh = 21, x = 400;
  let y = 84;
  const lines = [];
  const head = (t) => {
    lines.push(`<text x="${x}" y="${y}" class="mono"><tspan style="fill:${a1};font-weight:700">${esc(t)}</tspan><tspan style="fill:${p.muted}"> ${'─'.repeat(Math.max(4, 50 - t.length))}</tspan></text>`);
    y += lh;
  };
  const row = (label, value) => {
    const [l, dots, v] = leader(label, value, 52);
    lines.push(`<text x="${x}" y="${y}" class="mono"><tspan style="fill:${p.muted}">. </tspan><tspan style="fill:${a1}">${esc(l)}</tspan><tspan style="fill:${p.muted}">${dots}</tspan><tspan style="fill:${p.text}">${esc(v)}</tspan></text>`);
    y += lh;
  };
  const pair = (l1, v1, l2, v2) => {
    const [a, d1, b] = leader(l1, v1, 23);
    const [e, d2, f] = leader(l2, v2, 23);
    lines.push(`<text x="${x}" y="${y}" class="mono"><tspan style="fill:${p.muted}">. </tspan><tspan style="fill:${a1}">${esc(a)}</tspan><tspan style="fill:${p.muted}">${d1}</tspan><tspan style="fill:${p.text}">${esc(b)}</tspan><tspan style="fill:${p.muted}"> | </tspan><tspan style="fill:${a1}">${esc(e)}</tspan><tspan style="fill:${p.muted}">${d2}</tspan><tspan style="fill:${p.text}">${esc(f)}</tspan></text>`);
    y += lh;
  };
  head(`${profile.login}@github`);
  row('Name', profile.name);
  row('Role', role || 'Software engineer');
  row('Host', profile.company || profile.location || 'github.com');
  row('Uptime', `${since(profile.createdAt)} on GitHub`);
  row('Languages', profile.languages.slice(0, 4).map((l) => l.name).join(', ') || '-');
  y += lh / 2;
  head('Contact');
  row('GitHub', `github.com/${profile.login}`);
  if (website) row('Website', website.replace(/^https?:\/\//, '').replace(/\/$/, ''));
  y += lh / 2;
  head('GitHub Stats');
  pair('Repos', profile.publicRepos, 'Stars', profile.stars);
  pair('Followers', profile.followers, 'Following', profile.following ?? 0);
  pair('Commits', c.total, 'Active days', c.activeDays);
  pair('Streak', `${c.streak}d`, 'Best streak', `${c.longestStreak}d`);

  const h = Math.max(y, 84 + MARK.length * 19) + 50;
  const logo = MARK.map(
    (l, i) => `<text x="40" y="${96 + i * 19}" class="mono rise" xml:space="preserve" style="fill:${[a1, a2, a3][Math.floor((i / MARK.length) * 3)]};animation-delay:${(0.2 + i * 0.05).toFixed(2)}s">${esc(l)}</text>`
  ).join('\n');
  // Info lines print one after another, like the command's output scrolling in.
  const typed = lines.map((l, i) => l.replace('class="mono"', `class="mono rise" style="animation-delay:${(0.4 + i * 0.09).toFixed(2)}s"`));
  const prompt = (py) => `<text x="28" y="${py}" class="mono"><tspan style="fill:${a1};font-weight:700">${esc(profile.login)}@github</tspan><tspan style="fill:${p.muted}">:~$ </tspan></text>`;
  return shell(p, h, `${profile.name} neofetch`, `<style>.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:13.5px;white-space:pre}
.cur{animation:blink 1s steps(1) infinite}@keyframes blink{50%{opacity:0}}@media (prefers-reduced-motion:reduce){.cur{animation:none}}</style>
${prompt(36)}<text x="${28 + (profile.login.length + 11) * 8.1}" y="36" class="mono" style="fill:${p.text}">neofetch</text>
${logo}
${typed.join('\n')}
${prompt(h - 24)}<rect class="cur" x="${28 + (profile.login.length + 11) * 8.1}" y="${h - 37}" width="9" height="16" fill="${a1}"/>`);
}

export function cityCard(profile, { theme, mode } = {}) {
  const p = palette(theme, mode);
  const { days, total, activeDays, busiest } = profile.contributions;
  const hw = 9.5, hh = 4.75, ox = 262 + 7 * hw, oy = 110;
  const startDow = days.length ? new Date(days[0].date + 'T00:00:00Z').getUTCDay() : 0;
  const shade = (pts, color, o) => `<polygon points="${pts}" fill="${color}"/>${o ? `<polygon points="${pts}" fill="${o > 0 ? '#fff' : '#000'}" fill-opacity="${Math.abs(o)}"/>` : ''}`;
  const cells = days.map((d, i) => {
    const k = i + startDow;
    return { w: Math.floor(k / 7), dw: k % 7, count: d.count };
  });
  // Painter's order: back (small w+d) to front.
  cells.sort((a, b) => a.w + a.dw - (b.w + b.dw));
  const rand = rng(`${profile.login}:city`);
  let tallest = null;
  const city = cells
    .map(({ w, dw, count }) => {
      const cx = ox + (w - dw) * hw, cy = oy + (w + dw) * hh;
      if (!count) return `<polygon points="${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}" fill="${p.empty}" stroke="${p.border}" stroke-width=".6"/>`;
      const H = 6 + (count / (busiest || 1)) * 84, s = 0.82, x = hw * s, y = hh * s;
      const c = p.accents[0];
      if (!tallest || H > tallest.H) tallest = { cx, top: cy - y - H, H };
      // Lit windows on both visible faces, a third of them flickering.
      const windows = [];
      for (let r = 0, wy = cy + y / 2 - H + 6; H >= 22 && r < 5 && wy < cy + y / 2 - 4; r++, wy += 7)
        for (const wx of [cx - x / 2, cx + x / 2]) {
          const blink = rand() < 0.35 ? `<animate attributeName="opacity" values=".9;.15;.9" dur="${(2 + rand() * 5).toFixed(1)}s" begin="${(rand() * 4).toFixed(1)}s" repeatCount="indefinite"/>` : '';
          windows.push(`<rect x="${(wx - 1.2).toFixed(1)}" y="${wy.toFixed(1)}" width="2.4" height="2.6" fill="#ffd76a" opacity=".9">${blink}</rect>`);
        }
      return `<g class="rise" style="animation-delay:${(w * 0.025).toFixed(3)}s">${[
        shade(`${cx - x},${cy - H} ${cx},${cy + y - H} ${cx},${cy + y} ${cx - x},${cy}`, c, -0.25),
        shade(`${cx},${cy + y - H} ${cx + x},${cy - H} ${cx + x},${cy} ${cx},${cy + y}`, c, -0.45),
        shade(`${cx},${cy - y - H} ${cx + x},${cy - H} ${cx},${cy + y - H} ${cx - x},${cy - H}`, c, 0.3),
        ...windows,
      ].join('')}</g>`;
    })
    .join('');
  const beacon = tallest
    ? `<circle cx="${tallest.cx}" cy="${(tallest.top - 3).toFixed(1)}" r="7" fill="#ff4d4d" opacity="0"><animate attributeName="opacity" values="0;.35;0" dur="1.6s" repeatCount="indefinite"/></circle><line x1="${tallest.cx}" x2="${tallest.cx}" y1="${tallest.top.toFixed(1)}" y2="${(tallest.top - 4).toFixed(1)}" stroke="${p.muted}"/><circle cx="${tallest.cx}" cy="${(tallest.top - 4).toFixed(1)}" r="2.2" fill="#ff4d4d"><animate attributeName="opacity" values="1;.15;1" dur="1.6s" repeatCount="indefinite"/></circle>`
    : '';
  return shell(p, 420, `${profile.name} contribution city`, `<text x="34" y="52" class="l" style="fill:${p.accents[0]};letter-spacing:3px">Contribution City</text>
<text x="34" y="98" class="t" style="font-size:40px">${total.toLocaleString('en-US')}</text>
<text x="34" y="124" class="m" style="font-size:14px">contributions in the last year</text>
<text x="34" y="160" class="m" style="font-size:13px;fill:${p.text}">${activeDays} active days</text>
<text x="34" y="182" class="m" style="font-size:13px;fill:${p.text}">Busiest day: ${busiest}</text>
<text x="34" y="380" class="m" style="font-family:ui-monospace,Consolas,monospace">@${esc(profile.login)}</text>
${city}${beacon}`);
}

// Seeded PRNG so a user's galaxy looks the same on every request (and in GitHub's cache).
function rng(seed) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function galaxyCard(profile, { theme, mode } = {}) {
  const p = palette(theme, mode);
  const rand = rng(profile.login);
  const cx = 575, cy = 190, tilt = 0.45, turns = 2.4 * Math.PI;
  const arms = (profile.languages.length ? profile.languages : [{ name: 'Code', percent: 100 }]).slice(0, 4);
  const color = (i) => p.accents[i % p.accents.length];
  const armOf = (lang) => Math.max(0, arms.findIndex((a) => a.name === lang));
  const spiral = (arm, t) => [20 + t * 200, (arm * 2 * Math.PI) / arms.length + t * turns];

  // The whole spiral turns as one: every dust particle orbits its own tilted ellipse with the
  // same period. animateMotion moves at constant arc length, so each particle's start offset is
  // its arc-length fraction (from a table for the unit ellipse; all orbits are similar ellipses).
  const SPIN = 50, STEPS = 720;
  const arc = [0];
  for (let i = 1; i <= STEPS; i++) {
    const a0 = ((i - 1) / STEPS) * 2 * Math.PI, a1 = (i / STEPS) * 2 * Math.PI;
    arc.push(arc[i - 1] + Math.hypot(Math.cos(a1) - Math.cos(a0), tilt * (Math.sin(a1) - Math.sin(a0))));
  }
  // Paths run towards decreasing angle, so the arm tips trail like a real galaxy.
  const startFrac = (th) => {
    const n = (((th % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI);
    return ((arc[STEPS] - arc[Math.round(n * STEPS)]) % arc[STEPS]) / arc[STEPS];
  };
  const orbit = (r) => {
    const R = r.toFixed(1), Ry = (r * tilt).toFixed(1);
    return `M${(cx + r).toFixed(1)} ${cy} A${R} ${Ry} 0 1 0 ${(cx - r).toFixed(1)} ${cy} A${R} ${Ry} 0 1 0 ${(cx + r).toFixed(1)} ${cy}`;
  };
  const dust = arms
    .map((_, a) => {
      const dots = Array.from({ length: 120 }, () => {
        const t = rand();
        const [r, th] = spiral(a, t);
        const rr = Math.max(4, r + (rand() - 0.5) * (8 + t * 30));
        return `<circle r="${(0.6 + rand() * 1.3).toFixed(2)}" fill="${color(a)}" fill-opacity="${(0.25 + rand() * 0.55).toFixed(2)}"><animateMotion path="${orbit(rr)}" dur="${SPIN}s" begin="-${(startFrac(th) * SPIN).toFixed(2)}s" repeatCount="indefinite"/></circle>`;
      }).join('');
      return `<g>${dots}<animate attributeName="opacity" values="1;.55;1" dur="${(5 + a * 1.3).toFixed(1)}s" repeatCount="indefinite"/></g>`;
    })
    .join('');
  const field = Array.from({ length: 70 }, (_, i) => {
    const tw = i % 5 ? '' : `<animate attributeName="opacity" values="1;.1;1" dur="${(2 + rand() * 3).toFixed(1)}s" repeatCount="indefinite"/>`;
    return `<circle cx="${(rand() * W).toFixed(0)}" cy="${(rand() * 380).toFixed(0)}" r="${(0.4 + rand() * 0.8).toFixed(1)}" fill="${p.muted}" fill-opacity="${(0.2 + rand() * 0.4).toFixed(2)}">${tw}</circle>`;
  }).join('');
  const shooting = [[300, 40, 0], [420, 250, 4.5]]
    .map(([x, y, b]) => `<g opacity="0"><line x2="-70" y2="-24" stroke="url(#shoot)" stroke-width="1.6" stroke-linecap="round"/><animate attributeName="opacity" values="0;1;0;0" keyTimes="0;.04;.14;1" dur="9s" begin="${b}s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="${x} ${y};${x + 260} ${y + 90};${x + 260} ${y + 90}" keyTimes="0;.14;1" dur="9s" begin="${b}s" repeatCount="indefinite"/></g>`)
    .join('');

  // Repos sit on their language's arm and turn with it. Names live in the side panel,
  // since labels riding a rotating galaxy would collide and leave the card.
  const perArm = arms.map(() => 0);
  const placed = (profile.repos || []).map((repo) => ({ repo, arm: armOf(repo.language), slot: perArm[armOf(repo.language)]++ }));
  const stars = placed.map(({ repo, arm, slot }) => {
    const [r, th] = spiral(arm, 0.18 + (0.75 * (slot + 0.5)) / perArm[arm]);
    return { repo, arm, r, th, size: 2.2 + Math.log1p(repo.stars) * 1.6 };
  });
  const brightest = [...stars].sort((a, b) => b.repo.stars - a.repo.stars).slice(0, 3);
  const starSvg = stars
    .map((s) => {
      const c = color(s.arm), lead = brightest.includes(s);
      const halo = `${(s.size * 2.4).toFixed(1)};${(s.size * 3.6).toFixed(1)};${(s.size * 2.4).toFixed(1)}`;
      return `<g><circle r="${(s.size * 2.4).toFixed(1)}" fill="${c}" fill-opacity="${lead ? '.35' : '.18'}"><animate attributeName="r" values="${halo}" dur="${(2.5 + rand() * 2).toFixed(1)}s" repeatCount="indefinite"/></circle><circle r="${s.size.toFixed(1)}" fill="${c}" stroke="#fff" stroke-opacity="${lead ? 1 : 0.7}" stroke-width="${lead ? 1.6 : 0.8}"/><animateMotion path="${orbit(s.r)}" dur="${SPIN}s" begin="-${(startFrac(s.th) * SPIN).toFixed(2)}s" repeatCount="indefinite"/></g>`;
    })
    .join('');
  const legend = arms
    .map((a, i) => `<circle cx="40" cy="${193 + i * 20}" r="5" fill="${color(i)}"/><text x="54" y="${198 + i * 20}" class="n" style="font-size:13px">${esc(a.name)}</text><text x="190" y="${198 + i * 20}" class="m" text-anchor="end">${a.percent}%</text>`)
    .join('');
  const bright = brightest
    .map((s, i) => `<circle cx="40" cy="${299 + i * 20}" r="4" fill="${color(s.arm)}" stroke="#fff" stroke-width="1.2"/><text x="54" y="${304 + i * 20}" class="n" style="font-size:13px">${esc(clip(s.repo.name, 15))}</text><text x="205" y="${304 + i * 20}" class="m" text-anchor="end">★ ${s.repo.stars}</text>`)
    .join('');

  return shell(p, 380, `${profile.name} repo galaxy`, `${field}
<radialGradient id="core"><stop offset="0" stop-color="${p.text}" stop-opacity=".9"/><stop offset=".25" stop-color="${p.accents[0]}" stop-opacity=".45"/><stop offset="1" stop-color="${p.accents[0]}" stop-opacity="0"/></radialGradient>
<linearGradient id="shoot" x1="1" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
${shooting}
${dust}
<ellipse cx="${cx}" cy="${cy}" rx="75" ry="${75 * tilt}" fill="url(#core)"><animate attributeName="rx" values="75;92;75" dur="5s" repeatCount="indefinite"/><animate attributeName="ry" values="${75 * tilt};${92 * tilt};${75 * tilt}" dur="5s" repeatCount="indefinite"/></ellipse>
<circle cx="${cx}" cy="${cy}" r="4" fill="${p.text}"/>
${starSvg}
<text x="34" y="52" class="l" style="fill:${p.accents[0]};letter-spacing:3px">Repo Galaxy</text>
<text x="34" y="90" class="t" style="font-size:28px">@${esc(profile.login)}</text>
<text x="34" y="116" class="m" style="font-size:14px">${profile.stars} stars · ${profile.publicRepos} repositories</text>
<text x="34" y="138" class="m">Each star is a repository, sized by its stars.</text>
<text x="34" y="174" class="l">Arms</text>
${legend}
<text x="34" y="280" class="l">Brightest stars</text>
${bright}`);
}

export function snakeCard(profile, { theme, mode } = {}) {
  const p = palette(theme, mode);
  const { days, total } = profile.contributions;
  const cell = 11, gap = 3, x0 = 46, y0 = 104, D = 18, run = 0.8;
  const startDow = days.length ? new Date(days[0].date + 'T00:00:00Z').getUTCDay() : 0;
  const cols = Math.max(1, Math.ceil((days.length + startDow) / 7));
  const N = cols * 7;
  const at = (w, d) => [x0 + w * (cell + gap) + cell / 2, y0 + d * (cell + gap) + cell / 2];
  // Boustrophedon: down even columns, up odd ones. step(w, d) = when the head reaches that cell.
  const step = (w, d) => w * 7 + (w % 2 ? 6 - d : d);
  const path = Array.from({ length: N }, (_, k) => {
    const w = Math.floor(k / 7), d = w % 2 ? 6 - (k % 7) : k % 7;
    return at(w, d).map((v) => v.toFixed(1)).join(',');
  });
  const op = [0, 0.4, 0.6, 0.8, 1];
  const cells = days
    .map((day, i) => {
      const k = i + startDow, w = Math.floor(k / 7), d = k % 7;
      const [x, y] = at(w, d);
      const base = `x="${x - cell / 2}" y="${y - cell / 2}" width="${cell}" height="${cell}" rx="2.5"`;
      if (!day.level) return `<rect ${base} fill="${p.empty}" stroke="${p.border}" stroke-opacity=".5"/>`;
      const t = ((step(w, d) / N) * run).toFixed(4);
      return `<rect ${base} fill="${p.empty}"/><rect ${base} fill="${p.accents[1]}" fill-opacity="${op[day.level]}"><animate attributeName="fill-opacity" dur="${D}s" repeatCount="indefinite" keyTimes="0;${t};${(+t + 0.004).toFixed(4)};0.97;1" values="${op[day.level]};${op[day.level]};0;0;${op[day.level]}"/></rect>`;
    })
    .join('');
  // Each body segment runs the same path, one cell behind the previous.
  const lag = run / N;
  const d = `M${path.join(' L')}`;
  const motion = (i) =>
    i
      ? `<animateMotion dur="${D}s" repeatCount="indefinite" calcMode="linear" keyTimes="0;${(i * lag).toFixed(4)};${(run + i * lag).toFixed(4)};1" keyPoints="0;0;1;1" path="${d}"/>`
      : `<animateMotion dur="${D}s" repeatCount="indefinite" calcMode="linear" keyTimes="0;${run};1" keyPoints="0;1;1" path="${d}"/>`;
  const body = [4, 3, 2, 1]
    .map((i) => `<circle r="${5 - i * 0.6}" fill="${p.accents[1]}" fill-opacity="${1 - i * 0.18}">${motion(i)}</circle>`)
    .join('');
  const head = `<g><rect x="-7" y="-7" width="14" height="14" rx="4" fill="${p.accents[1]}"/><circle cx="-2.6" cy="-1" r="1.6" fill="${p.bg}"/><circle cx="2.6" cy="-1" r="1.6" fill="${p.bg}"/>${motion(0)}</g>`;
  const h = y0 + 7 * (cell + gap) + 36;
  return shell(p, h, `${profile.name} snake trail`, `<rect x="20" y="20" width="${W - 40}" height="${h - 40}" rx="16" fill="none" stroke="${p.accents[1]}" stroke-opacity=".35"/>
<text x="46" y="60" class="l" style="fill:${p.accents[1]};letter-spacing:3px">Snake Trail</text>
<text x="46" y="86" class="t" style="font-size:20px;fill:${p.accents[1]}">${total.toLocaleString('en-US')} contributions, one continuous run</text>
<rect x="${W - 96}" y="44" width="52" height="22" rx="11" fill="${p.accents[1]}" fill-opacity=".15"/><circle class="pulse" cx="${W - 88}" cy="55" r="3" fill="${p.accents[1]}"/><text x="${W - 70}" y="59" text-anchor="middle" class="l" style="fill:${p.accents[1]};font-size:10px">Live</text>
${cells}
${body}${head}`);
}

// The scene has its own night/daybreak palettes; the theme doesn't fit a sunset-on-a-grid look.
const SYNTH = {
  dark: { sky: ['#0b0221', '#2a0845', '#6a0f63'], sun: ['#ffe66d', '#ff6ec7'], ridge: '#ff2fb3', rock: ['#3a0d5c', '#14042a'], back: '#2b0b4d', ground: ['#1a0533', '#0b0218'], grid: '#ff2fb3', horizon: '#2de2e6', title: '#ffffff', label: '#2de2e6', sub: '#e9c6f5', star: '#ffffff' },
  light: { sky: ['#fde2f3', '#ffc2dd', '#ff9fc4'], sun: ['#ffcf5c', '#ff5e99'], ridge: '#d6247f', rock: ['#b36bd8', '#7d3aa8'], back: '#c99ae6', ground: ['#ffe9f4', '#fff7fb'], grid: '#ff5ea8', horizon: '#8a2be2', title: '#3a0d5c', label: '#d6247f', sub: '#7a3c86', star: '#ffffff' },
};

export function synthwaveCard(profile, { mode, role } = {}) {
  const s = SYNTH[mode === 'light' ? 'light' : 'dark'];
  const rand = rng(`${profile.login}:synth`);
  const H = 400, hy = 236, vx = W / 2, cam = H - hy;
  const c = profile.contributions;

  // Peaks = contributions per week, so the ridge is the year read left to right.
  const startDow = c.days.length ? new Date(c.days[0].date + 'T00:00:00Z').getUTCDay() : 0;
  const weeks = Array(Math.max(1, Math.ceil((c.days.length + startDow) / 7))).fill(0);
  c.days.forEach((d, i) => (weeks[Math.floor((i + startDow) / 7)] += d.count));
  const max = Math.max(...weeks, 1);
  const ridge = weeks.map((v, i) => [(i * W) / (weeks.length - 1 || 1), hy - (14 + (v / max) * 95 + rand() * 12)]);
  const backRange = Array.from({ length: 30 }, (_, i) => `${((i * W) / 29).toFixed(0)},${(hy - 18 - rand() * 40).toFixed(0)}`).join(' ');
  const pts = ridge.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const wire = ridge
    .map(([x, y]) => `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x.toFixed(1)}" y2="${hy}"/>`)
    .join('');
  const contour = ridge.map(([x, y]) => `${x.toFixed(1)},${(hy - (hy - y) * 0.5).toFixed(1)}`).join(' ');

  const stars = Array.from({ length: 60 }, (_, i) => {
    const x = (rand() * W).toFixed(0), y = (rand() * (hy - 60)).toFixed(0), r = (0.5 + rand() * 1.1).toFixed(1);
    const tw = i % 4 ? '' : `<animate attributeName="opacity" values="1;.2;1" dur="${(2 + rand() * 3).toFixed(1)}s" repeatCount="indefinite"/>`;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${s.star}" opacity=".8">${tw}</circle>`;
  }).join('');

  // Off-centre so the title block on the left never sits on the sun.
  const sun = { cx: Math.round(W * 0.68), cy: 150, r: 86 };
  const stripes = Array.from({ length: 7 }, (_, i) => `<rect x="0" y="${(sun.cy + 6 + i * 12).toFixed(0)}" width="${W}" height="${(2 + i * 1.3).toFixed(1)}" fill="#000"/>`).join('');

  const verticals = Array.from({ length: 45 }, (_, i) => {
    const xb = vx + (i - 22) * 62;
    return `<line x1="${vx + (xb - vx) * 0.04}" y1="${hy}" x2="${xb}" y2="${H}"/>`;
  }).join('');
  // Each line slides to where the next one was, so the loop is seamless; sampled along y = hy + cam/z.
  const dz = 0.6, steps = 8, D = 1.6;
  const horizontals = Array.from({ length: 28 }, (_, j) => {
    const z = 1 + j * dz;
    const ys = Array.from({ length: steps + 1 }, (_, k) => (hy + cam / (z - (dz * k) / steps)).toFixed(1)).join(';');
    const y0 = (hy + cam / z).toFixed(1);
    return `<line x1="0" x2="${W}" y1="${y0}" y2="${y0}"><animate attributeName="y1" values="${ys}" dur="${D}s" repeatCount="indefinite"/><animate attributeName="y2" values="${ys}" dur="${D}s" repeatCount="indefinite"/></line>`;
  }).join('');

  const subtitle = [role, `${c.total.toLocaleString('en-US')} contributions`, `best streak ${c.longestStreak}d`, `${profile.publicRepos} repos`].filter(Boolean).join('  ·  ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(profile.name)} synthwave horizon">
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.sky[0]}"/><stop offset=".6" stop-color="${s.sky[1]}"/><stop offset="1" stop-color="${s.sky[2]}"/></linearGradient>
  <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop offset=".1" stop-color="${s.sun[0]}"/><stop offset=".9" stop-color="${s.sun[1]}"/></linearGradient>
  <radialGradient id="halo"><stop offset=".55" stop-color="${s.sun[1]}" stop-opacity=".45"/><stop offset="1" stop-color="${s.sun[1]}" stop-opacity="0"/></radialGradient>
  <linearGradient id="rock" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.rock[0]}"/><stop offset="1" stop-color="${s.rock[1]}"/></linearGradient>
  <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.ground[0]}"/><stop offset="1" stop-color="${s.ground[1]}"/></linearGradient>
  <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.ground[0]}"/><stop offset="1" stop-color="${s.ground[0]}" stop-opacity="0"/></linearGradient>
  <mask id="bands"><rect width="${W}" height="${H}" fill="#fff"/>${stripes}</mask>
  <filter id="glow" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <clipPath id="frame"><rect width="${W}" height="${H}" rx="18"/></clipPath>
  <linearGradient id="sshoot" x1="1" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
</defs>
<style>text{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif}</style>
<g clip-path="url(#frame)">
  <rect width="${W}" height="${hy}" fill="url(#sky)"/>
  ${stars}
  <g opacity="0"><line x2="-80" y2="-22" stroke="url(#sshoot)" stroke-width="1.8" stroke-linecap="round"/><animate attributeName="opacity" values="0;1;0;0" keyTimes="0;.04;.12;1" dur="8s" begin="2s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="180 30;460 110;460 110" keyTimes="0;.12;1" dur="8s" begin="2s" repeatCount="indefinite"/></g>
  <circle cx="${sun.cx}" cy="${sun.cy}" r="${sun.r * 1.5}" fill="url(#halo)"><animate attributeName="r" values="${sun.r * 1.45};${sun.r * 1.7};${sun.r * 1.45}" dur="4s" repeatCount="indefinite"/></circle>
  <circle cx="${sun.cx}" cy="${sun.cy}" r="${sun.r}" fill="url(#sun)" mask="url(#bands)"/>
  <polygon points="0,${hy} ${backRange} ${W},${hy}" fill="${s.back}" opacity=".85"/>
  <polygon points="0,${hy} ${pts} ${W},${hy}" fill="url(#rock)"/>
  <g stroke="${s.ridge}" stroke-opacity=".22" stroke-width="1">${wire}</g>
  <polyline points="${contour}" fill="none" stroke="${s.ridge}" stroke-opacity=".3"/>
  <polyline points="${pts}" fill="none" stroke="${s.ridge}" stroke-width="2" stroke-linejoin="round" filter="url(#glow)"/>
  <polyline points="${pts}" fill="none" stroke="#fff" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" pathLength="1000" stroke-dasharray="30 970" filter="url(#glow)"><animate attributeName="stroke-dashoffset" values="0;-1000" dur="6s" repeatCount="indefinite"/></polyline>
  <rect y="${hy}" width="${W}" height="${cam}" fill="url(#ground)"/>
  <g stroke="${s.grid}" stroke-width="1.2" stroke-opacity=".75">${verticals}${horizontals}</g>
  <rect y="${hy}" width="${W}" height="44" fill="url(#fog)"/>
  <line x1="0" x2="${W}" y1="${hy}" y2="${hy}" stroke="${s.horizon}" stroke-width="2" filter="url(#glow)"/>
  <text x="34" y="46" style="font-size:12px;font-weight:700;letter-spacing:4px;fill:${s.label}">SYNTHWAVE HORIZON</text>
  <text x="34" y="88" style="font-size:36px;font-weight:900;font-style:italic;fill:${s.title}" filter="url(#glow)">${esc(clip(profile.name, 24))}</text>
  <text x="34" y="114" style="font-size:13px;fill:${s.sub}">${esc(clip(subtitle, 80))}</text>
  <text x="${W - 34}" y="46" text-anchor="end" style="font-size:13px;font-family:ui-monospace,Consolas,monospace;fill:${s.sub}">@${esc(profile.login)}</text>
  <text x="${W - 34}" y="${H - 18}" text-anchor="end" style="font-size:11px;fill:${s.sub};opacity:.8">peaks = contributions per week</text>
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="18" fill="none" stroke="${s.ridge}" stroke-opacity=".4"/>
</svg>`;
}

const ISLAND = {
  dark: { sky: ['#07172b', '#163a5c'], cloud: '#c9d8ea', title: '#f1f6ff', sub: '#9fb6cf', label: '#7ee3a1', star: '#ffffff' },
  light: { sky: ['#9fd8ff', '#e6f6ff'], cloud: '#ffffff', title: '#0f2a44', sub: '#3d5d7a', label: '#1f8a4c', star: null },
};
const BIOMES = [
  { name: 'Sand', min: 1, color: '#e6d39a' },
  { name: 'Grass', min: 2, color: '#5fbf55' },
  { name: 'Forest', min: 4, color: '#2f8a46' },
  { name: 'Rock', min: 6, color: '#8b929c' },
  { name: 'Snow', min: 8, color: '#f2f6fb' },
];

export function islandCard(profile, { mode } = {}) {
  const s = ISLAND[mode === 'light' ? 'light' : 'dark'];
  const rand = rng(`${profile.login}:island`);
  const { days, total, activeDays, busiest } = profile.contributions;
  const W2 = W, H = 460, N = 24, R = 11.2, mid = (N - 1) / 2;
  const hw = 14, hh = 7, unit = 8, dirt = 12, ox = 585, oy = 80;

  // Ragged coastline: a circle whose radius wobbles with the angle.
  const [p1, p2] = [rand() * 6.3, rand() * 6.3];
  const land = [];
  for (let gx = 0; gx < N; gx++)
    for (let gy = 0; gy < N; gy++) {
      const dx = gx - mid, dy = gy - mid, th = Math.atan2(dy, dx);
      const edge = R * (0.84 + 0.1 * Math.sin(3 * th + p1) + 0.06 * Math.sin(5 * th + p2));
      const dist = Math.hypot(dx, dy);
      if (dist < edge) land.push({ gx, gy, f: dist / edge });
    }
  // Most recent day sits at the centre, older days spiral outwards.
  land.sort((a, b) => a.f - b.f);
  land.forEach((t, k) => {
    const day = days[days.length - 1 - k];
    t.boost = day?.count ? 1 + Math.round((day.count / (busiest || 1)) * 5) : 0;
  });
  // Spread each day's boost into a cone so busy days read as hills, not single pillars.
  const peaks = land.filter((t) => t.boost);
  land.forEach((t) => {
    const lift = Math.max(0, ...peaks.map((q) => q.boost - Math.hypot(q.gx - t.gx, q.gy - t.gy) * 1.3));
    // The coast stays low even for very active users, so it always reads as an island.
    t.h = t.f > 0.86 ? 1 : 2 + Math.floor((1 - t.f) * 2) + Math.round(lift);
    t.tree = lift < 0.5 && t.h >= 2 && t.h <= 3 && rand() < 0.14;
  });

  const shade = (pts, color, o) => `<polygon points="${pts}" fill="${color}"/>${o ? `<polygon points="${pts}" fill="#000" fill-opacity="${o}"/>` : ''}`;
  const biome = (h) => [...BIOMES].reverse().find((b) => h >= b.min).color;
  const tiles = [...land]
    .sort((a, b) => a.gx + a.gy - (b.gx + b.gy))
    .map(({ gx, gy, h, tree }) => {
      const cx = ox + (gx - gy) * hw, cy = oy + (gx + gy) * hh, top = cy - h * unit, c = biome(h);
      const f = (n) => n.toFixed(1);
      let svg =
        shade(`${f(cx - hw)},${f(top)} ${f(cx)},${f(top + hh)} ${f(cx)},${f(cy + hh + dirt)} ${f(cx - hw)},${f(cy + dirt)}`, '#6b4a2f', 0.1) +
        shade(`${f(cx)},${f(top + hh)} ${f(cx + hw)},${f(top)} ${f(cx + hw)},${f(cy + dirt)} ${f(cx)},${f(cy + hh + dirt)}`, '#6b4a2f', 0.3) +
        // Biome colour only on the upper band of each side, dirt below it.
        shade(`${f(cx - hw)},${f(top)} ${f(cx)},${f(top + hh)} ${f(cx)},${f(top + hh + 5)} ${f(cx - hw)},${f(top + 5)}`, c, 0.15) +
        shade(`${f(cx)},${f(top + hh)} ${f(cx + hw)},${f(top)} ${f(cx + hw)},${f(top + 5)} ${f(cx)},${f(top + hh + 5)}`, c, 0.32) +
        shade(`${f(cx)},${f(top - hh)} ${f(cx + hw)},${f(top)} ${f(cx)},${f(top + hh)} ${f(cx - hw)},${f(top)}`, c, 0);
      if (tree)
        svg += `<rect x="${f(cx - 1.5)}" y="${f(top - 9)}" width="3" height="9" fill="#5a3a22"/>${shade(`${f(cx)},${f(top - 26)} ${f(cx + 7)},${f(top - 8)} ${f(cx)},${f(top - 5)}`, '#2f8a46', 0.3)}${shade(`${f(cx)},${f(top - 26)} ${f(cx)},${f(top - 5)} ${f(cx - 7)},${f(top - 8)}`, '#3fa557', 0)}`;
      if (h >= 8 && rand() < 0.5)
        svg += `<path d="M${f(cx)} ${f(top - 4)} l1 3 3 1 -3 1 -1 3 -1 -3 -3 -1 3 -1z" fill="#fff" opacity="0"><animate attributeName="opacity" values="0;1;0" dur="${(1.5 + rand() * 2).toFixed(1)}s" begin="${(rand() * 3).toFixed(1)}s" repeatCount="indefinite"/></path>`;
      return svg;
    })
    .join('');

  // Waterfall off the front-right coast, falling past the rock.
  const fall = land.filter((t) => t.f > 0.86).sort((a, b) => b.gx + b.gy + (b.gx - b.gy) * 0.3 - (a.gx + a.gy + (a.gx - a.gy) * 0.3))[0];
  let waterfall = '';
  if (fall) {
    const wx = ox + (fall.gx - fall.gy) * hw, wy = oy + (fall.gx + fall.gy) * hh - fall.h * unit + hh;
    waterfall = `<rect x="${wx - 4}" y="${wy}" width="8" height="150" fill="url(#water)"/>
<line x1="${wx}" x2="${wx}" y1="${wy}" y2="${wy + 150}" stroke="#e6f6ff" stroke-width="2" stroke-dasharray="6 10" opacity=".8"><animate attributeName="stroke-dashoffset" values="0;-32" dur=".6s" repeatCount="indefinite"/></line>
<line x1="${wx - 2.5}" x2="${wx - 2.5}" y1="${wy}" y2="${wy + 130}" stroke="#bfe6ff" stroke-width="1" stroke-dasharray="4 12" opacity=".6"><animate attributeName="stroke-dashoffset" values="0;-32" dur=".8s" repeatCount="indefinite"/></line>`;
  }
  const birds = [[110, 26, 0], [150, 34, -12]]
    .map(([y, dur, b]) => `<g><g stroke="${s.title}" stroke-opacity=".7" stroke-width="1.6" fill="none" stroke-linecap="round"><path d="M-7 0 Q-3.5 -5 0 0 Q3.5 -5 7 0"><animate attributeName="d" values="M-7 0 Q-3.5 -5 0 0 Q3.5 -5 7 0;M-7 -3 Q-3.5 3 0 0 Q3.5 3 7 -3;M-7 0 Q-3.5 -5 0 0 Q3.5 -5 7 0" dur=".7s" repeatCount="indefinite"/></path></g><animateTransform attributeName="transform" type="translate" values="300 ${y};${W2 + 30} ${y - 30}" dur="${dur}s" begin="${b}s" repeatCount="indefinite"/></g>`)
    .join('');

  // Rocky underside: hidden behind the tiles at the top, a jagged point below.
  const xs = land.map((t) => ox + (t.gx - t.gy) * hw), ys = land.map((t) => oy + (t.gx + t.gy) * hh);
  const [minX, maxX, maxY] = [Math.min(...xs), Math.max(...xs), Math.max(...ys)];
  const midY = oy + mid * 2 * hh;
  const under = [[minX, midY], ...Array.from({ length: 9 }, (_, i) => {
    const t = (i + 1) / 10, x = minX + (maxX - minX) * t;
    const depth = Math.sin(Math.PI * t) * (maxY - midY + 70) * (0.75 + rand() * 0.35);
    return [x, midY + depth];
  }), [maxX, midY]].map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

  const clouds = [0, 1, 2]
    .map((i) => {
      const y = 70 + i * 120 + rand() * 30, x = rand() * W2, sc = 0.7 + rand() * 0.6, dur = 70 + i * 25;
      return `<g opacity="${(0.55 + rand() * 0.3).toFixed(2)}"><g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${sc.toFixed(2)})"><ellipse rx="38" ry="12" fill="${s.cloud}"/><ellipse cx="-18" cy="-8" rx="18" ry="12" fill="${s.cloud}"/><ellipse cx="12" cy="-12" rx="22" ry="15" fill="${s.cloud}"/></g><animateTransform attributeName="transform" type="translate" values="-${W2} 0;${W2} 0" keyTimes="0;1" dur="${dur * 2}s" begin="-${(rand() * dur).toFixed(0)}s" repeatCount="indefinite"/></g>`;
    })
    .join('');
  const stars = s.star
    ? Array.from({ length: 45 }, (_, i) => `<circle cx="${(rand() * W2).toFixed(0)}" cy="${(rand() * H * 0.7).toFixed(0)}" r="${(0.4 + rand() * 0.9).toFixed(1)}" fill="${s.star}" opacity="${(0.3 + rand() * 0.6).toFixed(2)}">${i % 3 ? '' : `<animate attributeName="opacity" values=".9;.1;.9" dur="${(2 + rand() * 3).toFixed(1)}s" repeatCount="indefinite"/>`}</circle>`).join('')
    : '';
  const peak = days.find((d) => d.count === busiest && busiest > 0);
  const legend = BIOMES.map((b, i) => `<rect x="34" y="${300 + i * 20}" width="12" height="12" rx="2" fill="${b.color}"/><text x="54" y="${310 + i * 20}" style="font-size:12px;fill:${s.sub}">${b.name}</text>`).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W2}" height="${H}" viewBox="0 0 ${W2} ${H}" role="img" aria-label="${esc(profile.name)} voxel island">
<defs>
  <linearGradient id="isky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.sky[0]}"/><stop offset="1" stop-color="${s.sky[1]}"/></linearGradient>
  <linearGradient id="rockfall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3424"/><stop offset="1" stop-color="#241812"/></linearGradient>
  <radialGradient id="ishadow"><stop offset="0" stop-color="#000" stop-opacity=".25"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
  <clipPath id="iframe"><rect width="${W2}" height="${H}" rx="18"/></clipPath>
  <clipPath id="cloudzone"><rect x="320" width="${W2 - 320}" height="${H}"/></clipPath>
  <linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc8ff" stop-opacity=".9"/><stop offset="1" stop-color="#7cc8ff" stop-opacity="0"/></linearGradient>
</defs>
<style>text{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif}</style>
<g clip-path="url(#iframe)">
  <rect width="${W2}" height="${H}" fill="url(#isky)"/>
  ${stars}
  <g clip-path="url(#cloudzone)">${clouds}${birds}</g>
  <ellipse cx="${ox}" cy="${H - 20}" rx="190" ry="14" fill="url(#ishadow)"><animate attributeName="rx" values="190;178;190" dur="6s" repeatCount="indefinite"/></ellipse>
  <g>
    <polygon points="${under}" fill="url(#rockfall)"/>
    ${tiles}
    ${waterfall}
    <animateTransform attributeName="transform" type="translate" values="0 0;0 -6;0 0" dur="6s" repeatCount="indefinite"/>
  </g>
  <text x="34" y="52" style="font-size:12px;font-weight:700;letter-spacing:4px;fill:${s.label}">VOXEL ISLAND</text>
  <text x="34" y="100" style="font-size:42px;font-weight:800;fill:${s.title}">${total.toLocaleString('en-US')}</text>
  <text x="34" y="126" style="font-size:14px;fill:${s.sub}">contributions raised this island</text>
  <text x="34" y="164" style="font-size:13px;fill:${s.title}">${activeDays} active days</text>
  <text x="34" y="186" style="font-size:13px;fill:${s.title}">Highest peak: ${busiest}${peak ? ` on ${peak.date}` : ''}</text>
  <text x="34" y="208" style="font-size:12px;fill:${s.sub}">Newest days at the centre · taller = more</text>
  <text x="34" y="286" style="font-size:11px;font-weight:700;letter-spacing:2px;fill:${s.sub}">BIOMES</text>
  ${legend}
  <text x="34" y="${H - 22}" style="font-size:12px;font-family:ui-monospace,Consolas,monospace;fill:${s.sub}">@${esc(profile.login)}</text>
</g>
<rect x=".5" y=".5" width="${W2 - 1}" height="${H - 1}" rx="18" fill="none" stroke="${s.label}" stroke-opacity=".35"/>
</svg>`;
}

const ROOM = {
  dark: { bg: ['#0d1020', '#1a1f3a'], wallL: '#2a2f4f', wallR: '#353b62', floor: '#5a3f2e', plank: '#4a3325', slab: '#3a281d', text: '#eef1ff', sub: '#9aa3c7', label: '#ffb86b', sky: ['#0b1030', '#233066'], orb: '#f4f1d0', neon: '#ff4fd8', glow: 0.22, wood: '#7a5236', shelf: '#6b4a32', chair: '#3d6fd9', rug: '#7b4bb5' },
  light: { bg: ['#fdf3e7', '#f7e4cf'], wallL: '#e9dcc9', wallR: '#f3e8d8', floor: '#c99a6b', plank: '#b5875a', slab: '#8e6440', text: '#2b2118', sub: '#6b5a48', label: '#d9622b', sky: ['#8fd3ff', '#d9f1ff'], orb: '#ffd34d', neon: '#e2367a', glow: 0.08, wood: '#a8774f', shelf: '#946945', chair: '#2f6fe0', rug: '#c96b8c' },
};
const BOOK_COLORS = ['#e05d5d', '#f2a541', '#4fa3e0', '#59c48a', '#a47be0', '#e0d35d', '#5dd6e0', '#e07bb5'];

const shadeHex = (hex, f) =>
  '#' + [1, 3, 5].map((i) => Math.max(0, Math.min(255, Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 + f)))).toString(16).padStart(2, '0')).join('');

export function roomAchievements(profile) {
  const c = profile.contributions;
  const years = profile.createdAt ? (Date.now() - new Date(profile.createdAt)) / 3.156e10 : 0;
  return [
    ['First star', profile.stars >= 1],
    ['10 repos', profile.publicRepos >= 10],
    ['25 followers', profile.followers >= 25],
    ['100 contributions', c.total >= 100],
    ['7-day streak', c.longestStreak >= 7],
    ['3 years on GitHub', years >= 3],
  ];
}

export function roomCard(profile, { mode } = {}) {
  const s = ROOM[mode === 'light' ? 'light' : 'dark'];
  const rand = rng(`${profile.login}:room`);
  const c = profile.contributions;
  const X = 9, Y = 9, Z = 6.5, k = 28, ox = 590, oy = 200, H = 490;
  const P = (x, y, z) => [ox + (x - y) * k * 0.866, oy + (x + y) * k * 0.5 - z * k];
  const pts = (...ps) => ps.map((p) => P(...p).map((n) => n.toFixed(1)).join(',')).join(' ');
  const poly = (fill, ...ps) => `<polygon points="${pts(...ps)}" fill="${fill}"/>`;
  // Only the faces a viewer at +x/+y can see: top, the +x side (right) and the +y side (left).
  const box = (x, y, z, dx, dy, dz, col, topCol = col) =>
    poly(shadeHex(col, -0.32), [x + dx, y, z], [x + dx, y + dy, z], [x + dx, y + dy, z + dz], [x + dx, y, z + dz]) +
    poly(shadeHex(col, -0.16), [x, y + dy, z], [x + dx, y + dy, z], [x + dx, y + dy, z + dz], [x, y + dy, z + dz]) +
    poly(topCol, [x, y, z + dz], [x + dx, y, z + dz], [x + dx, y + dy, z + dz], [x, y + dy, z + dz]);
  // Flat content on a wall: local px, u along the wall (left to right on screen), v downwards.
  const onRight = (x, y, z) => { const [e, f] = P(x, y, z); return `matrix(0.866 0.5 0 1 ${e.toFixed(1)} ${f.toFixed(1)})`; };
  const onLeft = (x, y, z) => { const [e, f] = P(x, y, z); return `matrix(0.866 -0.5 0 1 ${e.toFixed(1)} ${f.toFixed(1)})`; };
  const out = [];

  // Floor slab, floor, walls.
  out.push(poly(shadeHex(s.slab, -0.2), [X, 0, 0], [X, Y, 0], [X, Y, -0.6], [X, 0, -0.6]));
  out.push(poly(s.slab, [0, Y, 0], [X, Y, 0], [X, Y, -0.6], [0, Y, -0.6]));
  out.push(poly(s.floor, [0, 0, 0], [X, 0, 0], [X, Y, 0], [0, Y, 0]));
  for (let i = 1; i < Y; i++) out.push(`<polyline points="${pts([0, i, 0], [X, i, 0])}" stroke="${s.plank}" stroke-width="1" fill="none"/>`);
  out.push(poly(s.wallL, [0, 0, 0], [0, Y, 0], [0, Y, Z], [0, 0, Z]));
  out.push(poly(s.wallR, [0, 0, 0], [X, 0, 0], [X, 0, Z], [0, 0, Z]));
  out.push(poly(shadeHex(s.wallL, 0.25), [0, 0, Z], [0, Y, Z], [-0.25, Y, Z], [-0.25, -0.25, Z], [X, -0.25, Z], [X, 0, Z]));
  out.push(poly(shadeHex(s.wallL, -0.2), [0, Y, 0], [0, Y, Z], [-0.25, Y, Z], [-0.25, Y, 0]));
  out.push(poly(shadeHex(s.wallR, -0.3), [X, 0, 0], [X, 0, Z], [X, -0.25, Z], [X, -0.25, 0]));

  // Window with sky (right wall).
  const win = pts([5.6, 0, 3.0], [8.4, 0, 3.0], [8.4, 0, 5.6], [5.6, 0, 5.6]);
  const stars = mode === 'light' ? '' : Array.from({ length: 14 }, () => { const [x, y] = P(5.7 + rand() * 2.6, 0, 3.2 + rand() * 2.3); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.5 + rand() * 0.8).toFixed(1)}" fill="#fff"><animate attributeName="opacity" values="1;.15;1" dur="${(1.5 + rand() * 3).toFixed(1)}s" repeatCount="indefinite"/></circle>`; }).join('');
  const [mx, my] = P(7.6, 0, 5.0);
  out.push(`<clipPath id="win"><polygon points="${win}"/></clipPath><polygon points="${win}" fill="url(#rsky)"/>
<g clip-path="url(#win)">${stars}<circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="11" fill="${s.orb}"/>${mode === 'light' ? '' : `<circle cx="${(mx + 5).toFixed(1)}" cy="${(my - 3).toFixed(1)}" r="9" fill="${s.sky[0]}"/>`}</g>
<polygon points="${win}" fill="none" stroke="${s.wood}" stroke-width="4"/>
<polyline points="${pts([7.0, 0, 3.0], [7.0, 0, 5.6])}" stroke="${s.wood}" stroke-width="3"/><polyline points="${pts([5.6, 0, 4.3], [8.4, 0, 4.3])}" stroke="${s.wood}" stroke-width="3"/>
${box(5.4, 0, 2.85, 3.2, 0.35, 0.15, s.wood)}`);

  // Neon sign and the monitor's glow on the right wall.
  const sign = `@${clip(profile.login, 18)}`;
  const signSize = Math.min(17, (4.0 * k) / (sign.length * 0.62));
  out.push(`<g transform="${onRight(0.7, 0, 6.05)}"><rect width="${4.2 * k}" height="${0.9 * k}" rx="6" fill="#000" fill-opacity=".25" stroke="${s.neon}" stroke-opacity=".5"/><text x="${2.1 * k}" y="${(0.45 * k + signSize * 0.36).toFixed(1)}" text-anchor="middle" style="font-size:${signSize.toFixed(1)}px;font-weight:800;fill:${s.neon}" filter="url(#rglow)">${esc(sign)}<animate attributeName="opacity" values="1;1;.25;1;.5;1;1" keyTimes="0;.78;.8;.83;.85;.88;1" dur="5s" repeatCount="indefinite"/></text></g>`);
  const [gx, gy] = P(5.3, 0, 4);
  out.push(`<ellipse cx="${gx.toFixed(1)}" cy="${gy.toFixed(1)}" rx="85" ry="55" fill="#59c4ff" fill-opacity="${s.glow}" filter="url(#rblur)"><animate attributeName="fill-opacity" values="${s.glow};${(s.glow * 1.7).toFixed(2)};${s.glow}" dur="3.5s" repeatCount="indefinite"/></ellipse>`);

  // Poster: the last 12 weeks (left wall).
  const recent = c.days.slice(-84);
  const pw = 3.0 * k, cell = 5.6, gap = 1.3;
  const grid = recent
    .map((d, i) => `<rect x="${8 + Math.floor(i / 7) * (cell + gap)}" y="${16 + (i % 7) * (cell + gap)}" width="${cell}" height="${cell}" rx="1" fill="${d.level ? '#39d353' : '#ffffff'}" fill-opacity="${d.level ? [0, 0.45, 0.65, 0.85, 1][d.level] : 0.12}"/>`)
    .join('');
  out.push(`<g transform="${onLeft(0, 8.7, 3.9)}"><rect width="${pw}" height="${2.4 * k}" rx="3" fill="#161b22" stroke="${s.wood}" stroke-width="3"/><text x="8" y="11" style="font-size:6.5px;font-weight:700;letter-spacing:1px;fill:#8b949e">LAST 12 WEEKS</text>${grid}</g>`);

  // Trophy shelf (left wall): earned trophies are gold, the rest faded.
  const trophies = roomAchievements(profile);
  out.push(box(0, 5.4, 4.45, 0.8, 3.4, 0.15, s.shelf));
  trophies.forEach(([, won], i) => {
    const [tx, ty] = P(0.4, 5.75 + i * 0.52, 4.6);
    const col = won ? '#f5c542' : '#8a8f98';
    out.push(`<g opacity="${won ? 1 : 0.35}"><path d="M${(tx - 6).toFixed(1)} ${(ty - 17).toFixed(1)} h12 l-1.5 7 q-4.5 4.5 -9 0 z" fill="${col}"/><path d="M${(tx - 6).toFixed(1)} ${(ty - 15).toFixed(1)} q-4 0 -2 4 M${(tx + 6).toFixed(1)} ${(ty - 15).toFixed(1)} q4 0 2 4" stroke="${col}" stroke-width="1.5" fill="none"/><rect x="${(tx - 1).toFixed(1)}" y="${(ty - 7).toFixed(1)}" width="2" height="4" fill="${shadeHex(col, -0.2)}"/><rect x="${(tx - 4).toFixed(1)}" y="${(ty - 3).toFixed(1)}" width="8" height="3" rx="1" fill="${shadeHex(col, -0.3)}"/></g>`);
  });

  // Bookshelf (left wall): one book per public repo, coloured by language.
  const langIndex = Object.fromEntries(profile.languages.map((l, i) => [l.name, i]));
  const repos = profile.repos || [];
  const nBooks = Math.min(profile.publicRepos, 48);
  out.push(box(0, 0.6, 0, 1.3, 0.15, 5.5, s.shelf));
  for (let level = 0; level < 4; level++) {
    const z = level * 1.35;
    out.push(box(0, 0.6, z, 1.3, 4.1, 0.15, s.shelf));
    for (let j = 0; j < 12; j++) {
      const n = level * 12 + j;
      if (n >= nBooks) break;
      const lang = repos[n]?.language;
      const col = lang in langIndex ? BOOK_COLORS[langIndex[lang] % BOOK_COLORS.length] : BOOK_COLORS[Math.floor(rand() * BOOK_COLORS.length)];
      // Spine faces the room; the top shows the pages.
      out.push(box(0.15, 0.8 + j * 0.32, z + 0.15, 1.0, 0.27, 0.75 + rand() * 0.35, col, '#e9e1cc'));
    }
  }
  out.push(box(0, 0.6, 5.4, 1.3, 4.1, 0.15, s.shelf));
  out.push(box(0, 4.6, 0, 1.3, 0.15, 5.55, s.shelf));

  // Rug.
  out.push(poly(s.rug, [3.2, 3.0, 0.01], [8.2, 3.0, 0.01], [8.2, 7.6, 0.01], [3.2, 7.6, 0.01]));
  out.push(`<polygon points="${pts([3.5, 3.3, 0.02], [7.9, 3.3, 0.02], [7.9, 7.3, 0.02], [3.5, 7.3, 0.02])}" fill="none" stroke="${shadeHex(s.rug, 0.35)}" stroke-width="2" stroke-dasharray="6 4"/>`);

  // Plant: grows with the longest streak.
  const stage = c.longestStreak >= 30 ? 4 : c.longestStreak >= 10 ? 3 : c.longestStreak >= 4 ? 2 : c.longestStreak >= 1 ? 1 : 0;
  out.push(box(7.85, 0.2, 0, 0.75, 0.75, 0.75, '#c8693f'));
  const [px, py] = P(8.22, 0.57, 0.75);
  const leaves = [
    [0, -6, 4, 8, 0], [-5, -10, 5, 11, -30], [5, -10, 5, 11, 30], [-9, -18, 6, 14, -35], [9, -18, 6, 14, 35], [0, -24, 6, 16, 0], [-12, -28, 7, 16, -40], [12, -28, 7, 16, 40],
  ].slice(0, [2, 3, 5, 6, 8][stage]);
  const scale = [0.7, 0.9, 1.1, 1.35, 1.5][stage];
  // Leaves sway around the rim of the pot.
  out.push(`<g transform="translate(${px.toFixed(1)} ${py.toFixed(1)}) scale(${scale})"><g>${leaves.map(([x, y, rx, ry, rot], i) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" fill="${i % 2 ? '#3fa557' : '#2f8a46'}"/>`).join('')}${stage === 4 ? '<circle cx="-12" cy="-40" r="3" fill="#ff7eb6"/><circle cx="12" cy="-40" r="3" fill="#ffd34d"/><circle cx="0" cy="-36" r="3" fill="#ff7eb6"/>' : ''}<animateTransform attributeName="transform" type="rotate" values="-4;4;-4" dur="4.5s" repeatCount="indefinite"/></g></g>`);

  // Desk, drawer, keyboard, monitor with the top language, mug.
  out.push(box(2.9, 0.1, 0, 0.18, 0.18, 2.4, s.wood), box(7.3, 0.1, 0, 0.18, 0.18, 2.4, s.wood));
  out.push(box(6.3, 0.15, 0, 1.2, 1.9, 2.3, shadeHex(s.wood, -0.1)));
  out.push(`<polyline points="${pts([7.5, 0.4, 1.55], [7.5, 1.85, 1.55])}" stroke="${shadeHex(s.wood, 0.4)}" stroke-width="2"/><polyline points="${pts([7.5, 0.4, 0.8], [7.5, 1.85, 0.8])}" stroke="${shadeHex(s.wood, 0.4)}" stroke-width="2"/>`);
  out.push(box(2.9, 1.9, 0, 0.18, 0.18, 2.4, s.wood));
  out.push(box(2.8, 0, 2.4, 4.9, 2.2, 0.18, s.wood));
  out.push(box(5.1, 0.45, 2.58, 0.4, 0.3, 0.5, '#2d333b'), box(4.7, 0.4, 2.58, 1.2, 0.6, 0.06, '#2d333b'));
  out.push(box(3.8, 0.3, 3.0, 3.0, 0.25, 1.95, '#1f242c'));
  const top = profile.languages[0]?.name || 'Hello, world';
  // Lines type out one after another, hold, then the screen clears and it starts over.
  const lines = Array.from({ length: 6 }, (_, i) => {
    const w = (18 + rand() * 38).toFixed(0), ind = (i % 3) * 6, t0 = (0.04 + i * 0.11).toFixed(2), t1 = (0.04 + i * 0.11 + 0.09).toFixed(2);
    return `<rect x="${6 + ind}" y="${16 + i * 6}" width="${w}" height="3" rx="1.5" fill="${['#ff7b72', '#79c0ff', '#d2a8ff', '#7ee787', '#ffa657', '#79c0ff'][i]}"><animate attributeName="width" values="0;0;${w};${w};0" keyTimes="0;${t0};${t1};.92;1" dur="8s" repeatCount="indefinite"/></rect>`;
  }).join('');
  out.push(`<g transform="${onRight(3.92, 0.56, 4.85)}"><rect width="${2.76 * k}" height="${1.7 * k}" fill="#0b1220"/><text x="6" y="10" style="font-size:7.5px;font-weight:800;fill:#58a6ff;font-family:ui-monospace,Consolas,monospace">&lt;/&gt; ${esc(clip(top, 14))}</text>${lines}<rect x="6" y="${16 + 6 * 6}" width="4" height="4" fill="#e6edf3"><animate attributeName="opacity" values="1;0;1" dur="1s" calcMode="discrete" repeatCount="indefinite"/></rect></g>`);
  out.push(box(4.2, 1.15, 2.58, 2.1, 0.65, 0.07, '#30363d'));
  out.push(box(3.2, 1.35, 2.58, 0.38, 0.38, 0.45, '#f0ece2'));
  const [sx, sy] = P(3.39, 1.54, 3.05);
  out.push([0, 1.2].map((b) => `<path d="M${sx.toFixed(1)} ${sy.toFixed(1)} q3 -5 0 -10 q-3 -5 0 -10" stroke="${s.sub}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0"><animate attributeName="opacity" values="0;.7;0" dur="2.4s" begin="${b}s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0 0;0 -8" dur="2.4s" begin="${b}s" repeatCount="indefinite"/></path>`).join(''));

  // Chair, facing the desk.
  out.push(box(5.15, 3.55, 0, 0.3, 0.3, 1.5, '#2d333b'));
  out.push(box(4.6, 3.0, 1.5, 1.4, 1.4, 0.25, s.chair));
  out.push(box(4.6, 4.2, 1.75, 1.4, 0.22, 1.8, s.chair));

  const earned = trophies.filter(([, w]) => w).length;
  const legend = [
    ['#e05d5d', `Shelf · ${nBooks} repos as books`],
    ['#58a6ff', `Screen · ${top} is on top`],
    ['#3fa557', `Plant · grown by a ${c.longestStreak}-day best streak`],
    ['#f5c542', `Trophies · ${earned} of ${trophies.length} earned`],
    ['#39d353', 'Poster · the last 12 weeks'],
  ]
    .map(([col, t], i) => `<rect x="34" y="${196 + i * 26}" width="10" height="10" rx="2" fill="${col}"/><text x="52" y="${205 + i * 26}" style="font-size:13px;fill:${s.text}">${esc(t)}</text>`)
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(profile.name)} dev room">
<defs>
  <linearGradient id="rbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.bg[0]}"/><stop offset="1" stop-color="${s.bg[1]}"/></linearGradient>
  <linearGradient id="rsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.sky[0]}"/><stop offset="1" stop-color="${s.sky[1]}"/></linearGradient>
  <filter id="rglow" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="rblur"><feGaussianBlur stdDeviation="18"/></filter>
  <clipPath id="rframe"><rect width="${W}" height="${H}" rx="18"/></clipPath>
</defs>
<style>text{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif}</style>
<g clip-path="url(#rframe)">
  <rect width="${W}" height="${H}" fill="url(#rbg)"/>
  ${out.join('\n')}
  <text x="34" y="52" style="font-size:12px;font-weight:700;letter-spacing:4px;fill:${s.label}">DEV ROOM</text>
  <text x="34" y="92" style="font-size:30px;font-weight:800;fill:${s.text}">${esc(clip(profile.name, 20))}</text>
  <text x="34" y="118" style="font-size:13px;font-family:ui-monospace,Consolas,monospace;fill:${s.sub}">@${esc(profile.login)}</text>
  <text x="34" y="170" style="font-size:11px;font-weight:700;letter-spacing:2px;fill:${s.sub}">WHAT'S IN THE ROOM</text>
  ${legend}
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="18" fill="none" stroke="${s.label}" stroke-opacity=".35"/>
</svg>`;
}

export const CARDS = {
  room: roomCard,
  island: islandCard,
  synthwave: synthwaveCard,
  galaxy: galaxyCard,
  snake: snakeCard,
  stats: statsCard,
  stack: stackCard,
  heatmap: heatmapCard,
  projects: projectsCard,
  hero: heroCard,
  social: socialCard,
  neofetch: neofetchCard,
  city: cityCard,
};
