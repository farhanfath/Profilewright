import { app } from '../lib/server.js';

// vercel.json rewrites /api/<path> to /api?__path=<path>; restore the original URL for the router.
export default function handler(req, res) {
  const url = new URL(req.url, 'http://x');
  const path = url.searchParams.get('__path');
  if (path !== null) {
    url.searchParams.delete('__path');
    req.url = `/api/${path}${url.search}`;
  }
  return app(req, res);
}
