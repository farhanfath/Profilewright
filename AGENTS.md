# AGENTS.md - Profilewright Agent Guidelines & Conventions

Welcome to the **Profilewright** repository.

---

## ⚠️ MANDATORY RULE: Obsidian Vault is the Single Source of Truth

The documentation, roadmap, architecture, decision logs (ADRs), and progress history of this project are maintained in an Obsidian Vault at:

📂 **`D:\vault\readme-maker-vault\`**

All AI agents (Antigravity, Claude Code, Codex, Cursor, etc.) **MUST** adhere to the following workflow:

### 1. At Session Start (Bootstrap Context)
Before planning or executing any task, you **MUST inspect the vault**:
* Read **`00 Home.md`** to know the current phase, status, and active links.
* Read **`01 Project/Roadmap.md`** to know completed milestones and next priorities.
* Read **`03 Architecture/Architecture.md`** and **`04 Decisions/Decision Log.md`** to understand architectural patterns, constraints, and past decisions.
* Read the latest devlog in **`05 Devlog/`** to understand recent changes and context.

### 2. During Implementation
* **Zero Dependencies**: Keep the application runtime dependency-free (native Node.js built-ins: `node:http`, `node:fs/promises`, `node:path`, `node:url`, `fetch`).
* **Clean Separation**: 
  * Frontend static assets live in `public/` (served statically by Vercel CDN from the edge).
  * Backend shared logic lives in `lib/` (`server.js`, `cards.js`, `templates.js`, `blocks.js`, `themes.js`, `github.js`).
  * Vercel Serverless Function entrypoint is strictly `api/index.js` (routes `/api/*`).
  * Never place runnable server files (`server.js`, `index.js`, `app.js`) in the root or `public/` to prevent Vercel zero-config auto-detection conflicts.
* **Test Verification**: Always verify changes by running `node --test` (all tests must pass before completing any task).

### 3. At Session End (Update Source of Truth)
Before completing the session, you **MUST update the vault**:
* **Devlog**: Add or update today's log in **`05 Devlog/YYYY-MM-DD.md`** with what was built, issues investigated, root causes, and verification results.
* **Decisions**: Record any architectural or technical choices in **`04 Decisions/Decision Log.md`** as a new ADR entry.
* **Roadmap**: Check off completed items in **`01 Project/Roadmap.md`** and add new upcoming tasks if applicable.
* **Home Index**: Update `status`, `updated` date, and current status notes in **`00 Home.md`**.
* **Obsidian Wikilinks**: Ensure all cross-references use standard Obsidian format `[[Note Name]]` or `[[Folder/Note Name|Alias]]`.

---

## Project Overview

* **Product Name**: Profilewright (formerly readme-maker)
* **Description**: GitHub profile README builder. Users enter a username, select templates/themes or customize blocks, and copy markdown READMEs with embedded, animated SVG cards generated from public GitHub data.
* **Live Production URL**: `https://profilewright.vercel.app/`
* **Repository**: `https://github.com/farhanfath/Profilewright.git` (branch `main`)
* **Tech Stack**:
  * **Runtime**: Node.js `>=20` (ESM `"type": "module"`), zero runtime npm dependencies.
  * **Hosting**: Vercel (`vercel.json` with `"framework": null`, static `public/`, serverless `api/index.js`).
  * **Frontend**: Vanilla HTML5, CSS3 with design tokens, SVG icons, client-side module (`public/build.js`).
  * **Testing**: Native `node:test` + `node:assert/strict`.

---

## Key Directories

```text
D:\My Data\FATHUR PROGRAM\ai-project-all\readme-maker/
├── api/index.js      # Vercel Serverless Function entry (maps /api/* to router)
├── lib/
│   ├── server.js     # Unified HTTP router & local development server
│   ├── github.js     # Public GitHub data fetcher & contribution parser (1h cache)
│   ├── cards.js      # 13 animated SVG card renderers
│   ├── templates.js  # 12 template presets & markdown assembler
│   ├── blocks.js     # Block Composer schema, validation & sanitizer
│   └── themes.js     # Theme palettes (dark & light modes)
├── public/           # Static frontend assets deployed to Vercel CDN
│   ├── index.html    # Product landing page (served at /)
│   ├── build.html    # Interactive builder UI (served at /build)
│   ├── build.js      # Builder client-side script
│   ├── landing.js    # Landing page client-side script
│   ├── style.css     # Shared design system tokens & builder styles
│   └── landing.css   # Landing page styles
├── test/             # Native node:test suite
├── vercel.json       # Vercel deployment config (framework: null, outputDirectory: public)
└── AGENTS.md         # This guideline
```
