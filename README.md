# Punti e Spunti

The atelier of **Alessandra Guetta**, Milano — and the pet-apparel line she
runs with **Ceci**, a veterinary surgeon whose clients are the people the
site is written for. Most visitors arrive by scanning a QR code in the
clinic waiting room, so the site is designed phone-first and carries its
entire runtime inside one file: no CDN, no build server, nothing that a
guest wifi can block.

There are no prices anywhere. Every piece is commissioned by conversation.

**One document. Two addresses.**

| route | what it is |
|---|---|
| `/` | the door — the atelier's name, and a choice of two houses |
| `/?p=collezione` | the human collection — bags, leather, the horizontal gallery |
| `/?p=piccoli` | Punti Piccoli — the animals, the fitting form, the matching cloth |
| `/?c=Clinic+Name` | the waiting-room entrance: straight to the fitting form, clinic named |

---

## The shape of this repo

The site ships as **one 1.06 MB HTML file** — that is a deliberate product
decision, not an accident of tooling. But nobody should have to *edit* a
1.06 MB file. So the source is split, and the file is built:

```
src/
  index.html                 markup shell, with @@TOKENS@@ where blocks go
  styles/site.css            all CSS  (66 KB)
  meta/schema.json           JSON-LD business record
  assets/                    photography sprite + 4 cloth tiles (webp)
  js/
    00-router-head.js        runs before first paint — decides the route
    01-motion.js             veil, letter spans, marquee, hand-drawn rules
    02-catalogue.js          ★ photo paths, cloth tiles, COMMISSION_ENDPOINT
    03-photo-stage.js        the photograph and its atelier frame
    04-lingua.js             ★ EN / IT — every string on the site
    05-smooth-scroll.js      Lenis, with an inline fallback
    06-three-atmosphere.js   dust, fog, the golden thread
    07-theme-journey.js      background & ink morph per section
    08-choreography.js       GSAP timelines, pins, the horizontal gallery
    09-menu.js  10-cursor.js  11-lente.js
    12-piccoli-table.js      the measuring table, cloths, trims, docket
    13-fitting-form.js       ★ the 3D fitting form (Three.js)
    14-router.js             route switching without a reload
    15-lingua-boot.js        Italian browsers arrive in Italian

vendor/                      pinned, unmodified, never edited
  gsap.min.js 3.12.5 · scrolltrigger.min.js 3.12.5
  three.min.js r149 · lenis.min.js 1.1.13

build.mjs                    src/ + vendor/  →  dist/index.html
dist/                        the deployable folder (committed)
```

★ = the four files that hold everything anyone normally wants to change.

### Build

```bash
node build.mjs          # → dist/index.html
node build.mjs --check  # → and verify it matches dist.sha256
npm run dev             # build, then serve dist/ on :4321
npm run watch           # rebuild on every save under src/ or vendor/
```

No dependencies. No `npm install`. Node 18+ and nothing else.

The build is a **concatenation**, not a bundler: `@@CSS@@`, `@@APP@@`,
`@@VENDOR:three.min.js@@` and `@@ASSET:photography.webp@@` in the shell are
replaced with file contents, the images re-encoded to `data:` URIs. That is
the whole tool, 60 lines. It has no opinions, so it can never break the site
by having a new one.

### The guarantee

The split was performed against the shipped file and verified in the only way
that means anything:

```
$ node build.mjs && cmp dist/index.html the-original-1.06MB-file
BYTE-IDENTICAL ✓
```

Not "equivalent". Not "renders the same". The same 1,112,725 bytes. Nothing
was reformatted, reordered, minified or *improved* on the way out, so no
behaviour could have changed. `dist.sha256` pins that result and
`.github/workflows/build.yml` fails the build if `dist/` ever drifts from
`src/`.

### Working on it

Edit a file under `src/`, run `npm run watch`, refresh. A change to the
fitting form is now a diff in `13-fitting-form.js` — twenty lines a human can
read in a pull request — instead of a one-line diff on a 1.06 MB blob that no
review tool will open and no merge will ever resolve cleanly.

Three rules:

1. **Never hand-edit `dist/`.** It is generated. CI checks.
2. **Never edit `vendor/`.** Pinned copies, replaced wholesale on upgrade.
3. **The JS modules are fragments, not ES modules.** They are concatenated in
   manifest order into one `<script>`, exactly as they were written. In
   particular `12-piccoli-table.js` and `13-fitting-form.js` are two halves of
   one IIFE — the fitting form reads the live SVG the measuring table draws,
   which is why it lives inside that closure. Split them further only along a
   boundary you have checked, and re-run `node build.mjs --check`.

---

## Before the QR code goes on a wall

Four things, in order of value. The full detail is in
**[docs/HANDBOOK.md](docs/HANDBOOK.md)**.

1. **`COMMISSION_ENDPOINT`** — `src/js/02-catalogue.js:75`. Empty today, so
   the form falls back to opening a mail app, which loses a large share of
   people on a phone. With no prices on the site, every scan has to become a
   conversation and the form gets one attempt. Highest-value line in the repo.
2. **`[ clinic name ]`** — `src/index.html:472` and `src/js/04-lingua.js:121`.
   Replace both, once the clinic has agreed in writing to be named.
3. **The domain** — `https://puntiespunti.it/` is a placeholder across the
   head, `robots.txt` and `sitemap.xml`.
4. **The photography** — nine frames still load from a generation CDN. Run
   `scripts/fetch-photography.sh`, then set `PHOTO_SOURCE = 'local'` in
   `src/js/02-catalogue.js`. A frame that fails falls back to its hand-drawn
   illustration, so this degrades gracefully — but it should not ship that way.

## Documentation

- **[docs/HANDBOOK.md](docs/HANDBOOK.md)** — what the site *is*: the two
  houses, the waiting-room entrance, the photography, a section-by-section
  tour, and how every part degrades when JavaScript, WebGL, the network or
  motion preferences are against it.
- **[docs/HANDOFF.md](docs/HANDOFF.md)** — start here if you are taking this
  over: pushing the repo, connecting Base44, the pre-launch list, the QR code.
- **[docs/BASE44.md](docs/BASE44.md)** — the port: what maps cleanly, what
  does not, and what would be lost.
- **[base44/BRIEF.md](base44/BRIEF.md)** — paste into the Base44 builder;
  `base44/commission.entity.json` is the entity schema beside it.
