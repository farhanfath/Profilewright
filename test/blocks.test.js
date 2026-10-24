import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeBlocks, renderBlocks, blockMeta, MAX_BLOCKS } from '../lib/blocks.js';
import { TEMPLATES } from '../lib/templates.js';

const profile = {
  login: 'octo',
  name: 'Octo <b>',
  avatar: 'https://avatars.githubusercontent.com/u/1',
  twitter: '',
  followers: 5,
  following: 1,
  publicRepos: 2,
  stars: 3,
  languages: [{ name: 'Go', percent: 100 }],
  projects: [{ name: 'a', url: 'https://github.com/octo/a', description: 'x', language: 'Go', stars: 3, forks: 0 }],
  contributions: { total: 4, activeDays: 2, busiest: 3, streak: 1, longestStreak: 2, days: [] },
};
const ctx = { profile, opts: { theme: 'github-dark', role: 'Dev', tagline: 'Hi', projects: [] }, base: 'https://rm.test' };

test('sanitizeBlocks keeps known types and fields only, with defaults', () => {
  const out = sanitizeBlocks([
    { type: 'card', card: 'galaxy', fold: 'open', theme: 'nope', evil: '<script>', half: 'yes' },
    { type: 'nope' },
    { type: 'heading', text: 'x'.repeat(500), level: '9' },
    null,
  ]);
  assert.equal(out.length, 2);
  assert.equal(out[0].card, 'galaxy');
  assert.equal(out[0].fold, 'open');
  assert.equal(out[0].theme, '', 'unknown theme falls back to global');
  assert.equal(out[0].half, false, 'only a real true enables a checkbox');
  assert.ok(!('evil' in out[0]));
  assert.equal(out[1].level, '2');
  assert.equal(out[1].text.length, 200);
  assert.equal(sanitizeBlocks(Array(99).fill({ type: 'divider' })).length, MAX_BLOCKS);
  assert.equal(sanitizeBlocks('nope'), null);
});

test('user text cannot inject HTML, tokens are filled and escaped', () => {
  const md = renderBlocks(
    sanitizeBlocks([
      { type: 'text', text: '<img src=x onerror=alert(1)> **{name}** {unknown}' },
      { type: 'text', text: '<script>x</script> {name}', align: 'center' },
      { type: 'heading', text: '<i>{login}</i>', align: 'center' },
      { type: 'card', card: 'stats', title: '<b>t</b>', caption: '<svg onload=1>' },
    ]),
    ctx
  );
  assert.ok(!/<img src=x|<script|<i>|<svg|<b>t/.test(md));
  assert.ok(md.includes('Octo &lt;b&gt;'), 'token values are escaped');
  assert.ok(md.includes('{unknown}'), 'unknown tokens stay as typed');
});

test('two half cards share a table row; a lone half card does not', () => {
  const pair = renderBlocks(sanitizeBlocks([{ type: 'card', card: 'stats', half: true }, { type: 'card', card: 'stack', half: true }]), ctx);
  assert.equal((pair.match(/<td width="50%"/g) || []).length, 2);
  const lone = renderBlocks(sanitizeBlocks([{ type: 'card', card: 'stats', half: true }, { type: 'divider' }]), ctx);
  assert.ok(!lone.includes('<td width="50%"'));
});

test('every preset is valid blocks and the library builds valid blocks', () => {
  for (const [k, t] of Object.entries(TEMPLATES)) assert.deepEqual(sanitizeBlocks(t.blocks), t.blocks, k);
  const { library } = blockMeta();
  for (const item of library) assert.equal(sanitizeBlocks([item.block]).length, 1, item.label);
});
