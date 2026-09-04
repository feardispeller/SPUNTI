# Brief for Base44

Paste this into the Base44 builder. It is written to be read by the builder
and by whoever checks its work.

---

## What already exists

A finished website, in this repo, at `dist/index.html` — one self-contained
1.06 MB HTML file with no dependencies and no build step at serve time. It is
the public face of the business and it does not need rebuilding. Serve it as
the app's public page.

Its fitting form already sends a complete JSON POST. **Do not rebuild the
form.** Give it somewhere to POST.

## Build two things

### 1. The `Commission` entity

Schema in `base44/commission.entity.json` — create it exactly. Then take the
app's create-Commission endpoint URL and put it in **one line** of this repo:

```js
// src/js/02-catalogue.js, line 75
var COMMISSION_ENDPOINT = 'https://…your Base44 endpoint…';
```

then `node build.mjs`. That is the entire integration. It must accept an
unauthenticated POST — visitors are strangers scanning a QR code in a waiting
room, and asking them to sign up loses every one of them.

The form already handles the endpoint failing: it falls back to opening the
visitor's mail app, so a bad deploy degrades instead of dropping commissions.

### 2. Sandra's workbench

This is the part that does not exist and is the actual reason to be here.
An internal, authenticated app over the `Commission` table.

**The board.** Commissions as cards in columns by `status`, newest first.
A card shows: animal name and species, the garment, the cloth, whether the
owner took a matching piece, how long it has been waiting, and the clinic it
came from. Overdue reply — anything `new` for more than 24 hours — reads
urgent, because with no prices on the site every commission is a conversation
that has not started yet.

**The cutting sheet.** Open a card and get the docket as something to work
from at a table, not a form to read on a phone: the three measurements large
and unmissable in cm, the cloth and trim named in Italian, the garment, the
owner's matching piece, and the visitor's own letter underneath. It should
print onto one sheet of A4 that survives being pinned above a cutting table.

**Ceci's view.** Read-only, filtered to her clinic, showing animal name,
species, garment and status — no contact details, no letter, no addresses.
She needs to know that Signora Rossi's whippet is ready, and nothing else.
Keep that boundary strict; it is a veterinary practice's client list.

**Worth counting, once there is data.** Which clinic sends the most; how
often `for_owner_key` is empty (the matching piece is the whole business idea,
so a run of empties is a fact about the page); which cloth wins; where
measurements cluster, because those are the sizes worth cutting ahead.

## Ground rules

- **Everything Sandra and Ceci read is in Italian.** The site is bilingual for
  visitors; the workbench is not — it is theirs.
- **No prices anywhere**, in the workbench either. Sandra quotes by writing
  back. Do not add a price field; it will end up on the public page.
- **Measurements are centimetres**, always, everywhere, labelled.
- The `*_key` fields are for grouping and counting. The plain-label fields
  (`garment`, `cloth`, `trim`, `for_owner`) are the visitor's language and are
  display-only — never group on them or the same cloth counts twice.

## Do not

- Rewrite `dist/index.html`, or any file under `src/`, `vendor/` or `dist/`,
  except the one line above. `.github/workflows/build.yml` will reject a push
  where `dist/` no longer matches `src/`.
- Add an external `<script>` or stylesheet to the page. Most visitors arrive
  on clinic guest wifi; the page carries its whole runtime for that reason and
  CI enforces it.
- Put commission capture behind a login.

`docs/BASE44.md` explains why the presentation layer is staying as it is, and
what it would cost to port it if that changes.
