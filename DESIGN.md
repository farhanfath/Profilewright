# Design

Profilewright has one visual world shared by the landing page (`/`) and the builder (`/build`). Tokens live in `public/style.css` `:root`; landing-only layout lives in `public/landing.css`.

## World

Near-black ground, hairline white frames, rounded panels, pill-shaped controls, and light-weight display type with tight tracking (reference pinned by the user: getlayers.ai). The only color that is ours is GitHub contribution green; everything else colorful comes from the cards themselves.

## Tokens

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#070707` | page ground |
| `--surface` | `#0d0d0d` | panels, bento cells, FAQ items |
| `--raised` | `#141414` | inputs, tiles, block rows |
| `--hover` | `#1b1b1b` | hover fill |
| `--line` / `--line-strong` | white 8% / 16% | frames and dividers |
| `--ink` / `--muted` / `--faint` | `#f2f2ef` / `#92928c` / `#55554f` | text; `--faint` is decorative only (fails AA for text) |
| `--accent` | `#39d353` | focus rings, selection, active template, logo, step numbers |
| `--radius` | `20px` | panels; the hero and closing frames use 28px |
| `--ease` | `cubic-bezier(0.16, 1, 0.3, 1)` | all motion |

The contribution scale for illustrations: `#121417`, `#0e4429`, `#006d32`, `#26a641`, `#39d353`.

## Type

Geist 300 for display (`letter-spacing` about -0.04em, `text-wrap: balance`), Geist 400/500 for UI, Geist Mono only for code, usernames and file paths.

## Components

- **Buttons:** `.btn` is a pill on `--raised`; `.btn.primary` is ink-on-light (white fill, near-black text). There is no green button.
- **Username form:** `.input-row` pill with a mono `@`; wraps to a full-width button under 760px.
- **Icons:** `public/icons.svg` symbols (Lucide strokes, 2px, round caps) via `<svg class="ic"><use href="/icons.svg#name"/></svg>`. No unicode glyphs or emoji as icons.
- **Preview window:** keeps GitHub's own colors (`#0d1117` dark, white light) because it shows what GitHub will render.

## Motion

One authored moment: the hero's contribution field, where cells light up like fresh commits and cool back down. The hero copy rises in once on load. Everything else is short hover transitions. `prefers-reduced-motion` stops all of it.
