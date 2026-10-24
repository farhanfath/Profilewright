import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseContributions, summarizeLanguages } from '../lib/github.js';
import { CARDS } from '../lib/cards.js';
import { TEMPLATES, renderReadme, cleanOptions } from '../lib/templates.js';

const profile = {
  login: 'octo',
  name: 'Octo <script>',
  avatar: 'https://avatars.githubusercontent.com/u/1',
  bio: '',
  blog: '',
  twitter: '',
  followers: 5,
  following: 1,
  createdAt: '2020-01-01T00:00:00Z',
  avatarData: '',
  publicRepos: 2,
  stars: 3,
  forks: 1,
  languages: [{ name: 'JavaScript', percent: 70 }, { name: 'CSS', percent: 30 }],
  repos: [
    { name: 'a<img onerror=1>', language: 'JavaScript', stars: 3 },
    { name: 'b', language: 'Go', stars: 0 },
  ],
  projects: [
    { name: 'a', url: 'https://github.com/octo/a', description: 'x"><img onerror=1>', language: 'JavaScript', stars: 3, forks: 1 },
    { name: 'b', url: 'https://github.com/octo/b', description: '', language: '', stars: 0, forks: 0 },
  ],
  contributions: {
    total: 4,
    activeDays: 2,
    busiest: 3,
    streak: 2,
    longestStreak: 2,
    days: [{ date: '2026-01-04', level: 0, count: 0 }, { date: '2026-01-05', level: 2, count: 1 }, { date: '2026-01-06', level: 4, count: 3 }],
  },
};

test('parses the public contributions calendar', () => {
  const td = (i, date, level) => `<td id="d${i}" data-date="${date}" data-level="${level}"></td><tool-tip for="d${i}">${level ? `${level * 2} contributions` : 'No contributions'} on X.</tool-tip>`;
  const html = `<h2>  1,234
      contributions
        in the last year</h2>
    ${td(1, '2026-01-02', 1)}${td(0, '2026-01-01', 3)}${td(2, '2026-01-03', 0)}${td(3, '2026-01-04', 2)}${td(4, '2026-01-05', 2)}${td(5, '2026-01-06', 0)}`;
  const c = parseContributions(html);
  assert.equal(c.total, 1234);
  assert.deepEqual(c.days.map((d) => d.date), ['2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04', '2026-01-05', '2026-01-06']);
  assert.deepEqual(c.days.map((d) => d.count), [6, 2, 0, 4, 4, 0]);
  assert.equal(c.activeDays, 4);
  assert.equal(c.busiest, 6);
  assert.equal(c.longestStreak, 2);
  assert.equal(c.streak, 2, 'an empty today keeps the streak');
  assert.deepEqual(parseContributions(''), { total: 0, days: [], activeDays: 0, busiest: 0, streak: 0, longestStreak: 0 });
});

test('language share counts primary languages and skips repos without one', () => {
  const langs = summarizeLanguages([{ language: 'Go' }, { language: 'Go' }, { language: 'Go' }, { language: 'Rust' }, { language: null }]);
  assert.deepEqual(langs, [{ name: 'Go', percent: 75 }, { name: 'Rust', percent: 25 }]);
});

test('cleanOptions drops unsafe links, emails and unknown themes', () => {
  const o = cleanOptions({ website: 'javascript:alert(1)', linkedin: 'https://linkedin.com/in/x', email: 'a"@b.c', theme: 'nope', role: '' });
  assert.deepEqual(o, { linkedin: 'https://linkedin.com/in/x' });
});

test('every template escapes GitHub-sourced text', () => {
  for (const name of Object.keys(TEMPLATES)) {
    // Fenced code blocks render as literal text, so only the rest must be escaped.
    const md = renderReadme(name, profile, { website: 'https://ex.com' }, 'https://rm.test').replace(/```[\s\S]*?```/g, '');
    assert.ok(!md.includes('<script>'), `${name} leaks raw name`);
    assert.ok(!md.includes('<img onerror'), `${name} leaks raw description`);
    assert.ok(md.includes('https://rm.test/api/card/'), `${name} has no card`);
  }
});

test('cards render escaped, well-formed SVG in both modes', () => {
  for (const [name, card] of Object.entries(CARDS)) {
    for (const mode of ['dark', 'light']) {
      const svg = card(profile, { theme: 'dracula', mode, website: 'https://ex.com', role: '<b>' });
      assert.match(svg, /^<svg[\s\S]*<\/svg>$/, `${name} ${mode}`);
      assert.ok(!svg.includes('<img') && !svg.includes('<b>') && !svg.includes('<script'), `${name} leaks markup`);
      assert.equal(svg, card(profile, { theme: 'dracula', mode, website: 'https://ex.com', role: '<b>' }), `${name} is not deterministic`);
    }
  }
});
