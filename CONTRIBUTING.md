# Contributing

Thanks for helping. Profilewright has no dependencies and no build step, so you only need Node 20+.

```bash
npm start   # http://localhost:3000, builder at /build
npm test    # must pass before you open a pull request
```

Set `GITHUB_TOKEN` while developing (`GITHUB_TOKEN="$(gh auth token)" npm run dev`), or the 60 unauthenticated GitHub requests per hour run out after a few reloads.

## Where things go

- **A new card:** add a renderer to `lib/cards.js` and register it in `CARDS`. It receives the profile from `lib/github.js` and must return an SVG string. Escape every piece of GitHub text with `esc`.
- **A new template:** add a preset to `TEMPLATES` in `lib/templates.js` (a list of blocks), then a `.tpl-<key> .thumb` thumbnail in `public/style.css`.
- **A new theme:** add a palette to `THEMES` in `lib/themes.js`. Light mode reuses the accents on a light base, so check both modes.

The test suite checks that every preset only uses valid blocks, so run `npm test` after any template change.

## Pull requests

- Keep each PR to one change, and include a screenshot of any new card or template in dark and light mode.
- No new runtime dependencies unless there is no other way.
- Only public GitHub data. Profilewright never asks visitors to sign in or provide a token.
