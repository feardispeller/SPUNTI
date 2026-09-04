# Base44 Dev Environment

## Project
Single self-contained static HTML site (`index.html`) for "Punti e Spunti" — an atelier of handwoven bags. All CSS, JS, and assets are inline (Google Fonts loaded via CDN). No backend, no build step, no package manager, no external credentials.

## Running
- Served by `nginx:alpine` via `docker-compose.base44.yml`, bind-mounting `index.html` read-only into the container.
- Web entry point on host port **3000**.
- `docker compose -f docker-compose.base44.yml up -d` starts it.

## Editing
- Edits to `index.html` are reflected immediately on page refresh (nginx serves the bind-mounted file directly).
- There is no live-reload dev server; call `reload_preview` after edits so the preview iframe refreshes.

## Verifying
- `curl -sf http://localhost:3000/` returns 200 with the page title.
- External-host check: `curl -sf -H "Host: external-preview.example.com" http://localhost:3000/` also returns 200 (nginx serves any host).
