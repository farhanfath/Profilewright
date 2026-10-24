// Public GitHub data -> one normalized profile object used by templates and cards.
const API = 'https://api.github.com';
const TTL = 60 * 60 * 1000;
const cache = new Map();

const headers = () => ({
  'User-Agent': 'profilewright',
  Accept: 'application/vnd.github+json',
  ...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }),
});

async function getJson(url) {
  const res = await fetch(url, { headers: headers() });
  if (res.status === 404) throw Object.assign(new Error('GitHub user not found'), { status: 404 });
  if (!res.ok) throw Object.assign(new Error(`GitHub API ${res.status}`), { status: 502 });
  return res.json();
}

// The public contributions calendar works without a token (GraphQL would need one).
export function parseContributions(html) {
  // Exact per-day counts only live in the <tool-tip for="<td id>"> text.
  const counts = new Map();
  for (const m of html.matchAll(/<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>\s*([\d,]+) contributions? on/g)) {
    counts.set(m[1], Number(m[2].replace(/,/g, '')));
  }
  const byDate = new Map();
  for (const m of html.matchAll(/<td\b[^>]*>/g)) {
    const date = m[0].match(/data-date="([\d-]+)"/)?.[1];
    if (!date) continue;
    const level = Number(m[0].match(/data-level="(\d)"/)?.[1] ?? 0);
    const id = m[0].match(/\bid="([^"]+)"/)?.[1];
    byDate.set(date, { date, level, count: counts.get(id) ?? (level ? 1 : 0) });
  }
  const days = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  const total = Number(html.match(/([\d,]+)\s+contributions?\s+in the last year/)?.[1].replace(/,/g, '') ?? 0);

  let run = 0, longestStreak = 0;
  for (const d of days) longestStreak = Math.max(longestStreak, (run = d.level ? run + 1 : 0));
  // Today without contributions yet doesn't break the current streak.
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].level) streak++;
    else if (i < days.length - 1 || streak) break;
  }
  return {
    total,
    days,
    activeDays: days.filter((d) => d.level > 0).length,
    busiest: days.reduce((m, d) => Math.max(m, d.count), 0),
    streak,
    longestStreak,
  };
}

async function avatarDataUri(url) {
  try {
    const res = await fetch(`${url}${url.includes('?') ? '&' : '?'}s=160`);
    if (!res.ok) return '';
    return `data:${res.headers.get('content-type') || 'image/png'};base64,${Buffer.from(await res.arrayBuffer()).toString('base64')}`;
  } catch {
    return '';
  }
}

// shortcut: language share counts each repo's primary language once (size weighting got skewed
// by asset repos); exact bytes need one /languages call per repo — upgrade when a GITHUB_TOKEN is always present.
export function summarizeLanguages(repos) {
  const weights = {};
  for (const r of repos) if (r.language) weights[r.language] = (weights[r.language] || 0) + 1;
  const sum = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(weights)
    .map(([name, w]) => ({ name, percent: Math.round((w / sum) * 100) }))
    .sort((a, b) => b.percent - a.percent)
    .filter((l) => l.percent > 0)
    .slice(0, 6);
}

export async function getProfile(username) {
  if (!/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(username)) {
    throw Object.assign(new Error('Invalid GitHub username'), { status: 400 });
  }
  const key = username.toLowerCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.data;

  const [user, repos, calendarHtml] = await Promise.all([
    getJson(`${API}/users/${username}`),
    getJson(`${API}/users/${username}/repos?per_page=100&sort=pushed`),
    fetch(`https://github.com/users/${username}/contributions`, { headers: { 'User-Agent': 'profilewright' } })
      .then((r) => (r.ok ? r.text() : ''))
      .catch(() => ''),
  ]);

  // The <login>/<login> repo is the profile README itself, not a project.
  const own = repos.filter((r) => !r.fork && r.name.toLowerCase() !== key);
  const top = [...own].sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at));
  const data = {
    login: user.login,
    name: user.name || user.login,
    avatar: user.avatar_url,
    bio: user.bio || '',
    company: user.company || '',
    location: user.location || '',
    blog: user.blog ? (/^https?:\/\//.test(user.blog) ? user.blog : `https://${user.blog}`) : '',
    twitter: user.twitter_username || '',
    followers: user.followers,
    following: user.following,
    createdAt: user.created_at,
    // SVGs loaded through <img> can't fetch external images, so cards embed this instead.
    avatarData: await avatarDataUri(user.avatar_url),
    publicRepos: user.public_repos,
    stars: own.reduce((s, r) => s + r.stargazers_count, 0),
    forks: own.reduce((s, r) => s + r.forks_count, 0),
    languages: summarizeLanguages(own),
    repos: top.slice(0, 60).map((r) => ({ name: r.name, language: r.language || '', stars: r.stargazers_count })),
    projects: top.slice(0, 6).map((r) => ({
      name: r.name,
      fullName: r.full_name,
      url: r.html_url,
      description: r.description || '',
      language: r.language || '',
      stars: r.stargazers_count,
      forks: r.forks_count,
    })),
    contributions: parseContributions(calendarHtml),
  };
  cache.set(key, { at: Date.now(), data });
  return data;
}
