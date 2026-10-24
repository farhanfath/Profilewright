# Profilewright

GitHub profile README builder. Type a username, pick a template and a theme, and copy a README made from public GitHub data. The themed SVG cards (stats, languages, contribution activity, projects) are served by this app.

Inspired by [GitSkins' README builder](https://www.gitskins.com/readme-builder).

## Run

```bash
npm start            # http://localhost:3000 (landing) and /build (builder)
npm run dev          # restart on file changes
npm test
```

Node 20+ and no dependencies.

| Env | Purpose |
| --- | --- |
| `PORT` | Server port (default `3000`) |
| `PUBLIC_URL` | Public origin written into card URLs, e.g. `https://readme.example.com`. Without it the cards point at localhost and won't load on github.com |
| `GITHUB_TOKEN` | Optional. Raises the GitHub API limit from 60 to 5000 requests per hour |

During development `npm run dev` restarts on every save and clears the in-memory cache, which uses up the 60 unauthenticated requests quickly. If you use the GitHub CLI:

```bash
GITHUB_TOKEN="$(gh auth token)" npm run dev
```

## API

| Route | Returns |
| --- | --- |
| `GET /api/meta` | Available templates and themes |
| `GET /api/profile?username=` | Normalized profile + default form values |
| `GET /api/readme?username=&template=&theme=&role=&tagline=&status=&website=&linkedin=&email=&cta=&projects=a,b[&blocks=<json>]` | README markdown. `blocks` (a JSON array) replaces the template's preset |
| `GET /api/card/{stats,stack,heatmap,projects,hero,social,neofetch,city,galaxy,snake,synthwave,island,room}?username=&theme=&mode=dark\|light[&repos=a,b&role=&tagline=&website=&linkedin=&email=]` | SVG card |

Templates: Dev Room, Voxel Island, Synthwave Horizon, Recruiter-ready, Everything Hub, Contribution City, Repo Galaxy, Snake Trail, Neofetch, Front Page, Minimal, Terminal.

## Layout

```
server.js         HTTP server: static UI + API
lib/github.js     public GitHub data -> profile (1h in-memory cache)
lib/themes.js     palettes; mode=light swaps the base, keeps accents
lib/cards.js      SVG card renderers
lib/blocks.js     block types (cards, text, headings, sections), validation, rendering
lib/templates.js  templates = preset block lists; option sanitizing
public/           landing page (index.html, landing.*) and builder (build.html, app.js), shared style.css + icons.svg
test/             node:test
```

Project notes, decisions and progress live in the Obsidian vault at `D:\vault\readme-maker-vault`.
