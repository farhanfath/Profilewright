import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import handler from '../api/index.js';

test('vercel entry restores the rewritten /api path', async () => {
  const server = createServer(handler).listen(0);
  const base = `http://localhost:${server.address().port}`;
  try {
    const rewritten = await fetch(`${base}/api?__path=meta`);
    assert.equal(rewritten.status, 200);
    assert.ok((await rewritten.json()).templates.recruiter);
    assert.match(rewritten.headers.get('cache-control'), /s-maxage=3600/);
    // Without the rewrite (local or if Vercel keeps the original URL) the path passes through untouched.
    assert.equal((await fetch(`${base}/api/meta`)).status, 200);
  } finally {
    server.close();
  }
});
