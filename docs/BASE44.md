# Base44 — the port

The goal is a Base44 project the two of you can run the business from, with
this repo two-way synced. This document is the honest engineering assessment
of how to get there, written after splitting the site into source.

## The one thing worth knowing first

The site already speaks Base44's language. When a visitor finishes a fitting
and presses send, `src/js/12-piccoli-table.js:651` builds this and POSTs it as
JSON:

```json
{ "from_name": "...", "reply_to": "...", "subject": "...",
  "animal_name": "Lilla", "species": "cane",
  "garment": "Il cappottino", "for_owner": "Sciarpa abbinata",
  "cloth": "Lana cotta", "trim": "Filo oro",
  "neck_cm": 32, "chest_cm": 54, "back_cm": 41,
  "clinic": "Clinica X", "language": "it", "message": "..." }
```

That is a database row with a `fetch` in front of it. It needs an endpoint,
not a rewrite. **Point `COMMISSION_ENDPOINT` at a Base44 entity and the
business runs on Base44 tomorrow, with the front end untouched.**

Everything below is about whether to *also* rewrite the presentation layer.

## What the port would actually involve

### Maps cleanly (a good afternoon's work)

| piece | in Base44 |
|---|---|
| `/?p=piccoli` · `/?p=collezione` | React Router routes — genuinely nicer than the class-swap |
| `src/js/04-lingua.js` | a translation table; it is already one, keyed by selector |
| `src/js/02-catalogue.js` | a data file, or entity rows Sandra can edit herself |
| the commission docket | a **Commission** entity — the real prize, see below |
| the markup | JSX, mechanically |

### Fights back (this is where weeks go)

**The route is decided before the first paint.** `00-router-head.js` runs in
`<head>` and sets a class on `<html>` so no visitor ever sees the wrong house
flash. React renders after paint. Every SPA answer to this — a loading
screen, a skeleton, a flash — is worse than what the site does now, on the
exact device that matters most: a phone in a waiting room on clinic wifi.

**ScrollTrigger pins and React are natural enemies.** The horizontal gallery
pins a section and drives it with `containerAnimation`; the theme journey
measures every `section[data-bg]`. Both read layout that React owns and may
re-create underneath them. It is solvable — `useLayoutEffect`, `gsap.context`,
refresh on route change — and it is a week of fighting a fight the current
code does not have.

**The fitting form reads the live SVG DOM.** `13-fitting-form.js` extrudes
Three.js geometry from the path data the 2D measuring table has *just drawn*
into the document — that is why the two files are one closure. Under React
that shared DOM becomes shared state across a component boundary, and this is
the module that took the longest to get right. Porting it risks the single
best thing on the site for no visitor-visible gain.

**720 KB of vendored library.** Base44 will want npm imports. Fine — but the
current build guarantees the page works with every external origin blocked,
which is the failure mode the QR code is most likely to meet.

### Would be lost

Nothing about the site is currently allowed to fail. No JS: 3,325 characters
of the real text still render. No WebGL: the fitting form falls back to flat.
CDN blocked: 4/4 illustrations stand in. `prefers-reduced-motion`: everything
stills. That is achievable in React and it is not achieved by default, and it
is not what anyone remembers to re-test after a refactor.

## Recommendation

**Port the business, not the brochure.**

1. **Now** — create the Base44 app with a `Commission` entity matching the
   payload above, and set `COMMISSION_ENDPOINT` to it. Every fitting becomes a
   row. This is the whole reason to be on Base44 and it costs one line.
2. **Next** — build the thing that does not exist yet and that Base44 is
   genuinely the right tool for: **Sandra's workbench**. Commissions by
   status, the docket rendered as a cutting sheet, a note per client, and a
   view Ceci can open in the clinic to see what her clients have ordered.
   That is a real application. Nobody has built it, and it is worth more to
   the business than a re-rendered homepage.
3. **Serve the site from `dist/index.html`** as the app's public page. It is
   one file with no dependencies; every host on earth, Base44 included, can
   serve it, and it keeps its no-flash routing and its graceful failure.
4. **Only if a reason appears** — a visitor login, per-client saved fittings,
   a catalogue Sandra edits live — port the presentation layer, section by
   section, starting with `collezione` (static, no fitting form, low risk)
   and leaving `13-fitting-form.js` embedded as-is for as long as possible.

The split in this repo is what makes step 4 survivable whenever it comes:
each module is a file a person can read, and `node build.mjs --check` proves
the shipped bytes did not move while you were reading it.

## Two-way sync

Base44's GitHub connection syncs a repo. Point it at this one and the useful
invariant holds in both directions: Base44 edits arrive as diffs to files
under `src/`, and `.github/workflows/build.yml` rejects any push where
`dist/` no longer matches `src/`. Without the split, every sync would have
been a conflict on a single 1.06 MB line.
