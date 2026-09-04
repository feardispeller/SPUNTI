# Handoff

Everything needed to take this over, in the order it needs doing.

## 1. Push the repo

I cannot do this step — it needs credentials, and credentials are not
something to hand to an assistant. Run it yourself.

> **If you pasted a personal access token into a chat, revoke it.**
> GitHub → Settings → Developer settings → Personal access tokens →
> Fine-grained tokens → Revoke. A token in a transcript is a token that has
> left your control, whatever it was for.

Unzip `punti-e-spunti-repo.zip` somewhere, then — replacing the contents of
the existing repo, keeping its history:

```bash
cd ~/where/you/unzipped/punti-e-spunti
git init -b main
git remote add origin git@github.com:feardispeller/SPUNTI.git   # or the https URL
git fetch origin
git reset --soft origin/main        # keep these files, adopt the history
git add -A
git commit -m "Split the document into source, add the build that reassembles it"
git push origin main
```

If `git reset --soft origin/main` complains that the branch is called
something else, `git branch -r` will show you. If you would rather start a
clean repo, drop the `fetch`/`reset` lines and push to a new remote.

Sanity check after cloning it back down anywhere:

```bash
node build.mjs --check     # must print ✓ matches baseline
```

## 2. Connect Base44

Base44 → connect GitHub → this repo. The sync is safe in both directions
because of the split: Base44's edits arrive as diffs to files under `src/`,
and CI rejects any push where `dist/` has drifted from `src/`. Before the
split, every sync would have been a conflict on a single 1.06 MB line.

Then hand Base44 **`base44/BRIEF.md`** and **`base44/commission.entity.json`**.
Those two files are the whole instruction set: create the entity, wire the one
line, build the workbench, and leave the site alone.

## 3. The four things before a QR code goes on a wall

| | what | where |
|---|---|---|
| 1 | `COMMISSION_ENDPOINT` — Base44's endpoint, or Formspree/Basin in the meantime | `src/js/02-catalogue.js:75` |
| 2 | `[ clinic name ]` ×2 — only once the clinic has agreed in writing | `src/index.html:472`, `src/js/04-lingua.js:121` |
| 3 | the real domain, replacing `https://puntiespunti.it/` | `src/`, `public/robots.txt`, `public/sitemap.xml` |
| 4 | photography — `scripts/fetch-photography.sh`, then `PHOTO_SOURCE = 'local'` | `src/js/02-catalogue.js` |

Then `node build.mjs` and deploy `dist/`.

Number 1 is the one that matters. With no prices on the site, every scan has
to become a conversation, the form gets one attempt, and today it falls back
to opening a mail app — which loses a large share of people on a phone.

## 4. The QR code

Point it at `https://your-domain/?c=Clinic+Name` — **not** the bare domain.
That URL-encoded name is what makes the page open directly on the fitting
form, on the clinic's own ground colour, saying the clinic's name back to the
person standing in the waiting room. It also lands in every commission's
`clinic` field, so you can tell which posters are working.

One QR per clinic, per poster if you like. The parameter is just text.

## What is where

```
README.md                       the repo: source layout, build, the guarantee
docs/HANDBOOK.md                the site: two houses, photography, how it degrades
docs/BASE44.md                  the port: what maps, what fights back, what it costs
base44/BRIEF.md                 paste into the Base44 builder
base44/commission.entity.json   the entity schema, ready to create
```
