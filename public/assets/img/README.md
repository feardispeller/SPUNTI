# assets/img

The four pieces each need two frames:

| file                     | what it is                                        |
|--------------------------|---------------------------------------------------|
| `01-nomad-front.webp`    | The Nomad Tote, square-on                         |
| `01-nomad-alt.webp`      | The Nomad Tote, turned ~35°                       |
| `02-lariva-front.webp`   | La Riva Saddle, square-on                         |
| `02-lariva-alt.webp`     | La Riva Saddle, turned ~35°                       |
| `03-ombra-front.webp`    | Ombra Bucket, square-on                           |
| `03-ombra-alt.webp`      | Ombra Bucket, turned ~35°                         |
| `04-vela-front.webp`     | Vela Crescent, square-on                          |
| `04-vela-alt.webp`       | Vela Crescent, turned ~35°                        |

**Specification**

- Cut out on a **transparent** background (WebP or PNG). The pieces sit on a
  cream page that changes colour as you scroll — a white box behind them will
  show.
- **Portrait 3:4.** Anything else still works but shifts the column rhythm.
- `front` is magnified up to ×6 by the loupe, so give it **~1800px** on the
  long edge. `alt` is never magnified; ~900px is plenty.
- Same lighting, same distance, same lens for both frames of a piece. The two
  frames cross-fade into each other as the piece turns, so a change in
  exposure between them reads as a flicker.

Drop the files in with these exact names and set `PHOTO_SOURCE = 'local'` in
`index.html`. Any file that is missing falls back to that piece's hand-drawn
illustration; nothing breaks.

---

## Punti Piccoli

| file                    | what it is                                             |
|-------------------------|--------------------------------------------------------|
| `cloth-lana.png`        | macro of boiled wool, terracotta                       |
| `cloth-lino.png`        | macro of brushed linen, oat                            |
| `cloth-trap.png`        | macro of quilted cotton, dusty rose                    |
| `cloth-cera.png`        | macro of waxed canvas, olive                           |
| `piccoli-dog.png`       | a dog in the wool coat, cut out                        |
| `piccoli-cat.png`       | a cat in the linen cape, cut out                       |
| `piccoli-collar.png`    | the collar, cut out                                    |

**The four cloths** are used twice: as the swatch you press in the docket, and
as the fill laid over the garment on the animal, so the coat is made of real
cloth and still redraws as you pull the tapes. They should be **square,
top-down, edge to edge** — no seams, no objects, no hands — because they tile.
Roughly 1000px square is plenty; the tile is small on screen.

**The three commissions** are cut out on transparency, portrait, and hang
below the measuring table. A frame whose file is missing removes itself from
the row rather than leaving a hole, so you can ship with one, two, or none.
