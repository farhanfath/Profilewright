# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Developers who want a GitHub profile README without hand-writing markdown: working developers polishing their profile, students and beginners who have never made one, and job seekers who want a recruiter-ready page with selected work and contact links.

## Product Purpose

Profilewright turns a GitHub username into a finished profile README. The visitor picks a template and a theme, adjusts blocks and details, and copies or downloads the markdown. Success is a README pasted into the visitor's `<username>/<username>` repository within minutes.

## Positioning

The cards are drawn from the visitor's own public GitHub data (contribution calendar, languages, repositories) and served as live themed SVGs by this app, including illustrated scenes (Contribution City, Voxel Island, Repo Galaxy, Dev Room, Synthwave Horizon, Snake Trail). No sign-in, no token from the visitor.

## Operating Context

Used in a desktop browser next to GitHub. Output is markdown pasted into GitHub, where card images load from the deployed app (`PUBLIC_URL`) and follow GitHub's light or dark theme through `<picture>` sources.

## Capabilities and Constraints

- Node 20 server with no dependencies; vanilla JS front end; `marked` from a CDN for preview.
- Public GitHub API only (60 requests/hour unauthenticated, optional `GITHUB_TOKEN` on the server), 1-hour in-memory cache.
- Twelve templates, six themes, a block composer (reorder, duplicate, remove, edit text with `{tokens}`), shareable state in the URL.
- No accounts, no payments. MIT licensed, open source on GitHub, hosted on Vercel (`api/index.js` + `vercel.json`).

## Brand Commitments

Name: Profilewright (a "wright" is a maker or builder). Visual reference pinned by the user: getlayers.ai (dark, light-weight display type, pill navigation, bento sections).

## Evidence on Hand

Real card renders from the app itself. No testimonials, user counts, or press exist; do not invent them.

## Product Principles

- Show the visitor's own data, not stock examples, as early as possible.
- One username is the only required input.
- The output is plain markdown the visitor owns and can edit anywhere.
