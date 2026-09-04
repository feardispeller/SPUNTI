# Base44 Dev Environment

## Project
Punti e Spunti — atelier of Alessandra Guetta, Milano. A single self-contained
HTML site built from modular source. Two product lines: handwoven bags
(collezione) and made-to-measure animal apparel (piccoli/Punti Piccoli).

## Architecture
- `src/` — modular source: HTML shell with `@@TOKENS@@`, separate CSS (`src/styles/site.css`), 16 JS fragments (`src/js/00-15`), JSON-LD schema, webp assets
- `vendor/` — pinned GSAP, ScrollTrigger, Three.js, Lenis (never edited)
- `build.mjs` — token-replacement build (not a bundler). `node build.mjs` → `dist/index.html`
- `dist/` — the built, deployable single file (committed; CI rejects drift from src/)
- `public/` — static assets served alongside (og-image, sitemap, robots, headers)
- `scripts/serve.mjs` — static server on :4321
- `scripts/watch.mjs` — rebuilds dist/ on any src/ or vendor/ change

## Running in Base44
- `docker-compose.base44.yml` runs two services:
  - `web` (nginx:alpine) — serves `dist/` on host port **3000**
  - `watch` (node:22-slim) — runs `build.mjs` then `scripts/watch.mjs` to rebuild on source edits
- `docker compose -f docker-compose.base44.yml up -d` starts both.

## Editing
- Edit files under `src/`. The watch service rebuilds `dist/index.html` automatically.
- After a rebuild, call `reload_preview` so the preview iframe refreshes (no live-reload WebSocket).
- `node build.mjs --check` verifies dist/ matches the baseline hash.

## Routes
- `/` — the door (choice of two houses)
- `/?p=collezione` — handwoven bags collection
- `/?p=piccoli` — Punti Piccoli (animal apparel, measuring table, fitting form)
- `/?c=Clinic+Name` — clinic entrance: straight to the fitting form

## Pre-launch checklist (see docs/HANDOFF.md)
1. `COMMISSION_ENDPOINT` in `src/js/02-catalogue.js` — currently empty, falls back to mail app
2. `[ clinic name ]` in `src/index.html` and `src/js/04-lingua.js`
3. Domain `https://puntiespunti.it/` is a placeholder
4. Photography still on generation CDN — run `scripts/fetch-photography.sh`, set `PHOTO_SOURCE = 'local'`

## Verifying
- `curl -sf http://localhost:3000/` returns 200 with the page title.
- `node build.mjs --check` must print "✓ matches baseline".
