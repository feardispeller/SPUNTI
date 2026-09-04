# Punti e Spunti — handbook

What the site *is*: its two houses, its photography, its section-by-section
contents, and what it does when things fail. For how it is **built**, see
[../README.md](../README.md).

An atelier of handwoven bags — Toscana · Milano. Founded by **Alessandra Guetta**,
third generation at the loom.

The whole site is one file. `index.html` carries its own markup, styles, fonts
metadata, illustrations and its entire JavaScript runtime — GSAP, ScrollTrigger,
Three.js and Lenis are all inlined. There is no build step, no bundler, no
`node_modules`, and nothing to compile. Open it and it runs.

---

## Deploy

`npm run build` writes `dist/` — one HTML file plus headers, robots, sitemap
and the share card. `dist/` is what every host below serves, and it is
committed, so a host that runs no build step still works.

| host | how |
|---|---|
| **Netlify** | connect the repo — `netlify.toml` sets build `node build.mjs`, publish `dist` — or `netlify deploy --prod --dir=dist` |
| **Vercel** | connect the repo — `vercel.json` sets the same — or `vercel --prod` |
| **Cloudflare Pages** | build command `node build.mjs`, output directory `dist` — `_headers` ships inside it |
| **GitHub Pages** | Pages → source `main` / `/dist` — `.nojekyll` ships inside it |
| **Any web server** | copy `dist/` into the document root |

Both config files set the same security headers (HSTS, nosniff, SAMEORIGIN,
a locked-down `Permissions-Policy`), revalidate `index.html` on every request
so a redeploy is live immediately, and cache `/assets/*` for a year.

### Before the QR code goes on a wall

Three things, in this order.

**1. Switch on commission capture.** In `src/js/02-catalogue.js` (line 75):

```js
var COMMISSION_ENDPOINT = '';
```

Paste a form endpoint here — Formspree, Basin and Web3Forms all accept a JSON
POST and all have a free tier — and the docket is captured properly, with the
animal's name, species, garment, cloth, trim and all three measurements as
fields. Leave it empty and the form falls back to opening the visitor's mail
app, **which loses a sizeable share of people on a phone**. With no prices on
the site, every interested scan has to become a conversation and the form gets
one attempt. This is the highest-value line in the file.

**2. Name the clinic.** Search `src/` for `[ clinic name ]` — it appears twice,
once in `src/index.html` (line 472) and once in the Italian translation in
`src/js/04-lingua.js` (line 121). Replace both with the real
name, and only once the clinic has agreed in writing to be named.

**3. Build the QR to the clinic link**, not the bare domain — see below.

### One thing to change before going live

Six absolute URLs in the `<head>` and two config files point at
`https://puntiespunti.it/`. Swap them for the real domain:

```bash
grep -rl 'puntiespunti.it' src public *.json *.toml | xargs sed -i 's|https://puntiespunti.it|https://YOUR-DOMAIN|g'
npm run build
```

That covers the canonical link, the Open Graph and Twitter cards, the JSON-LD
business record, `robots.txt` and `sitemap.xml`.

---

## Two houses, one file

Punti e Spunti is not two businesses. It is one maker with two kinds of
commission, and the site says that without burying either under the other.
There are two real addresses and one document:

| address | what it shows |
|---|---|
| `/` | **the front door and nothing else** — hero, two cards, correspondence. You choose; you are not shown both. |
| `/?p=piccoli` | the animals. **This is what the QR poster points at.** |
| `/?p=collezione` | the bags. Not one animal word on the page. |
| `/?c=<clinic>` | the animals, arrived at from a waiting room — short hero, straight onto the measuring table. |

Each house carries the shared story (craft, atelier, correspondence) after it,
so either address is a complete site. The front door does not: `/` is a
choice, not a table of contents.

**The route decides the copy, not just the visibility.** The hero line changes
with the house — *two kinds of commission* on the door, *made to measure for
your animal* on the one, *bags and small leather* on the other — and the
masthead drops the links to the house you are not in. A bags page that still
says "for your animal" and still offers SU MISURA in the nav has not been
split; it has been hidden. The matching pair — the scarf, the pochette, the
ribbon — belongs to Punti Piccoli and appears nowhere else: it is what you
order *alongside* an animal's coat, not a line of the collection.

`#collezione` as a hash works as an alias for the second address.

Switching route is a class on `<html>` and a rewritten query string — no
navigation, nothing re-fetched, and the address bar still says where you are,
so any of these can be shared, bookmarked, or printed on a poster. The router
runs before first paint, so the wrong house never flashes.

Two things it has to do that are easy to miss. Sections appearing and
disappearing invalidate every pinned ScrollTrigger on the page, so a route
change calls `ScrollTrigger.refresh()` twice — immediately and again after the
layout settles; without it the pinned horizontal gallery measures against a
page that no longer exists. And the masthead's *Punti Piccoli* and *Collection*
links cross between houses when a single house is showing, but fall back to
plain anchors on `/` where everything is on the one scroll.

---

## The waiting-room entrance

A visitor arriving at `https://your-domain/?c=clinica` (any value works, and it
is recorded on the commission so you can tell channels apart) gets a different
page: the loading sequence is skipped entirely, the hero shrinks to the wordmark
and one line, the woven cloth steps back so it does not fight the reading, and
**Punti Piccoli is the first thing under it**. `#misura` does the same thing
without a parameter.

Point the QR code at the `?c=` link. Someone with four minutes in a waiting room
should reach the measuring table in one thumb-scroll, not after three screens of
cinema — the cinema is still there for anyone who arrives at the bare domain.

---

## The photography

The four pieces and the three commission photographs are currently served from
the AI-generation CDNs they were made on. The cloths are not — they are inside
the file. **That is fine for a preview and wrong for production** — it is someone
else's bandwidth and the files can expire.

```bash
bash scripts/fetch-photography.sh     # pulls all eleven files into assets/img/
```

Then open `index.html`, find `var PHOTO_SOURCE` near the top of the script, and
change `'remote'` to `'local'`.

When Alessandra's real campaign shots arrive, overwrite the eight files in
`assets/img/` using the same names — nothing in the HTML changes. The
specification for every file — the bag frames, the four tiling cloths and the
three commissions — is in `assets/img/README.md`.

Every image path in the site lives in that one block — `PHOTO_LOCAL` /
`PHOTO_REMOTE` for the collection, `PICCOLI_LOCAL` / `PICCOLI_REMOTE` for the
cloths and commissions. Nothing else in the file references an image.

---

## What is in the page

**The hero** is a piece of hand-woven cloth rendered live in WebGL — warp and
weft crossing in a true plain weave, lit by a single raking window, casting a
shadow onto the page. As you scroll the weave gives: weft slides out of the
shed, warp splays, the cloth goes back to being thread. Below 38fps the page
quietly drops the cloth's sheen and its pixel ratio rather than the frame rate.

**The collection** is a pinned horizontal gallery. Each piece rests facing
front and turns to its three-quarter angle only when you ask — drag on a
desktop, swipe on a phone. Hovering raises **la lente**, a brass loupe that
magnifies the actual photograph up to ×6; click the glass to cycle the
magnification. If a photograph is unavailable the loupe magnifies the piece's
hand-drawn illustration instead, so the control is never dead.

**Punti Piccoli** is her made-to-measure line for animals, and the section is
built as a measuring table rather than a catalogue. At the centre stands a
**hand-cut animal in three dimensions** — the same dog and the same cat drawn
for the flat stage, extruded with a soft bevel and stood in depth: far legs
and tail behind, the body in the middle, the near legs in front. Drag the
canvas and she turns; move a pointer across it and the layers separate. She is
a workshop object — calico over board, jet button eye, brass-rimmed base —
not an attempt at a photograph of a pet, and that is what lets her read as
*made*.

**The three numbers shape HER.** This is the part that makes the whole thing
mean anything, and it is worth stating plainly: pull the *torace* and her
ribcage deepens; pull the *dorso* and she lengthens behind the shoulder; pull
the *collo* and her neck thickens. Her legs keep their paws on the base while
their tops travel with her belly. A cat at 44 cm and a shepherd at 64 cm are
visibly different animals on the same stage.

**And the garment is then cut off HER.** Not from a separate drawing — from
the outline she has just been warped into. The panel follows her topline, its
depth is read off the *torace*, its length off the *dorso*, and it stops where
her body stops. It fits by construction, which is the only way a made-to-
measure page can be honest: while she was a fixed mannequin with a changing
coat, the coat could only ever look badly fitted, because the body it was cut
for was not the body it was sitting on.

*Il Collare* is a band on the neck with a leather edge, a brass buckle and a
tag. Her name is worked into the flank of the coat, right way up on both
sides. **The piece for you is made too** — the scarf folded in three, the
pochette with its peak, the ribbon tied in a bow — sitting on the base she
stands on, in the same cloth and the same leather. The tapes have ticks
printed on them.

**See the finished piece** now works on this stage: she steps out of the
light, the piece is left turning on its own, and the camera closes on it over
a plate carrying the name, the specification and the three measurements.

Two things govern all of it and are worth knowing before editing. The outline
is read by a real **scanline** — crossings at an x, paired into spans —
because taking the highest and lowest points near an x conflates the neck with
the chest beneath it, which is what made the collar come out as a slab across
her shoulder. And anything meant to be seen on her must clear `Z_SKIN`, or on
the cloth `Z_CLOTH`; getting those two numbers wrong is what buried the
collar, and then the monogram, inside the animal they were supposed to be on.

**Which animal is not a footnote.** *Il Cane* and *Il Gatto* are two cards
with the animal drawn in each, because it is the first choice anyone makes and
it decides everything that follows.

**The photographs are real, and they are in the file.** Nine images were
generated for this atelier — the coat, the cape, the collar, the scarf, the
pochette and the ribbon as product shots, plus a whippet in a fitted coat, a
cat in a collar, and a woman holding a small dog in cloth cut from the same
bolt. They are carried inside `index.html` as one WebP sprite, so they need no
network and cannot go missing. The three photographs open the section, before
any of the making begins, and the six product shots are what you press when
you choose a garment or a piece for yourself. **A drawn icon tells you the name
of a garment; a photograph tells you what you are being offered.**

The full-resolution originals are not in the file. `PHOTO_REMOTE` in the
configuration block holds their URLs and `scripts/fetch-photography.sh` will
pull them down; set `PHOTO_SOURCE = 'local'` to use them.

**Choosing is the point, so every choice carries a picture.** The garment, the
piece for you, the cloth and the trim are all small drawings rather than
words: the coat, the cape and the collar are each drawn in whatever cloth and
leather are currently selected, so the whole tray shifts when you change your
mind. The four cloths are shown as real fabric — the same procedurally woven
tiles that land on the animal, carried in the file as data URIs, needing no
network — and the three leathers as tanned chips.

**On a phone — which is where nearly everyone arrives, from a QR code — the
stage sticks to the top of the screen.** The animal stays in view while the
bench of choices scrolls underneath her, so pressing *Tela Cerata* changes a
coat you can still see. The three measurement pills come off her and sit in a
thumb-height row under the stage, twice the size, so she is never covered by
her own controls.

**Cloth and trim are separate choices** — four cloths against three
vegetable-tanned leathers — and four **presets** she has cut before send all three
tapes travelling on a stagger so you watch the cloth find its new shape. A line
under the measurements tells you what they mean (*a close fit*, *room for a jumper
underneath*), read off the chest-to-back ratio. **See the finished piece** lifts
the garment off her, centres it, and turns it slowly with a plate below carrying
the name, the specification and the three measurements.

The tapes are real sliders — pointer, touch and keyboard (arrows step 1 cm,
shift steps 5, Home and End go to the limits), each announced to screen readers
with its live value in centimetres.

The four cloths are woven in code — a real over-one-under-one plain weave for
the linen, felted fibre for the wool, puffed diamonds for the quilted cotton, a
twill with waxy creases for the canvas — generated as seamless tiles and carried
inside `index.html` as data URIs. They need no network and cannot go missing.
Each is used twice: as the swatch you press in the docket, and as the fill laid
over the garment on the animal, so the coat is made of real cloth and still
redraws as you pull the tapes. Three cut-out commission photographs hang below
the measuring table; any whose file is missing removes itself from the row.

**The colour journey** morphs the page's ground and ink through seven states as
you scroll, from cream to terracotta and back. The masthead adapts with it —
the shared **S** lifts from clay to peach on the dark grounds so the mark never
disappears into its own background.

**Language.** English and Italian, switched from the masthead. Italian browsers
arrive in Italian automatically.

---

## Degradation

The page was built so nothing is load-bearing.

| if this is missing | what happens |
|---|---|
| JavaScript | the full page renders as static HTML — every word is readable, the loader never appears |
| WebGL | the woven hero is skipped, the rest is untouched |
| the photographs | each piece falls back to its hand-drawn illustration |
| a commission photograph | that frame removes itself from the row |
| JavaScript, on Punti Piccoli | she is still drawn wearing the default coat; the tapes and toggles are hidden |
| WebGL, on Punti Piccoli | the 3D fitting form is skipped and the flat drawn stage takes its place, with the same tapes and the same docket |
| `prefers-reduced-motion`, on Punti Piccoli | same — the flat stage, which does not turn or breathe |
| `prefers-reduced-motion` | the loader is bypassed, scroll-driven motion stops, the page stays whole |
| Google Fonts | falls back to Didot / Georgia / Helvetica stacks already in the CSS |

The only two network dependencies are **Google Fonts** and, until you run the
fetch script, **the photography**. Everything else is in the file.

---

## Editing

This section moved. The document is no longer edited by hand — it is built
from `src/`. See **[../README.md](../README.md)** for the source layout and
`npm run watch` for the loop.

## Verified

Chromium at 1440×900 and 390×844, English and Italian, with and without
JavaScript, with and without the photography, with WebGL available and with
`getContext` returning null, and under `prefers-reduced-motion`. No console
errors, no horizontal overflow, no piece resting on the wrong face, and the
measuring tapes pull correctly by pointer and by keyboard in both languages.

On the fitting form specifically: both species, all three garments including the
collar, all four cloths and all three trims, all four presets, the monogram
reading the right way round on both flanks, and the stage falling back to the
flat drawn version whenever WebGL is unavailable or motion is reduced. The
canvas stops rendering entirely when it scrolls out of view or the tab is
hidden, and drops its pixel ratio by itself if the machine cannot keep up.
