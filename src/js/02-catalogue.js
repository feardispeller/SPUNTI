
/* ============================================================
   PHOTOGRAPHY — the only place image paths live.

   The eight frames below are the AI-generated placeholders this
   build was designed around. To drop in Alessandra's real campaign
   shots, put the files in assets/img/ under the names in
   PHOTO_LOCAL, then change PHOTO_SOURCE to 'local'. Nothing else
   in the page needs touching.

   What each frame needs to be:
     front  — the piece square-on, cut out on a transparent
              background (PNG or WebP). La Lente magnifies this
              one up to x6, so give it ~1800px on the long edge.
     alt    — the same piece turned roughly 35 degrees, same
              lighting and same distance. ~900px is plenty.
     Portrait 3:4 keeps the layout identical to this build.

   If a file is missing or a URL 404s, that piece falls back to its
   hand-drawn illustration and the page carries on — nothing breaks.
   ============================================================ */

/* 'remote' = the generation CDN this build was made against.
   'local'  = assets/img/ (run scripts/fetch-photography.sh first). */
var PHOTO_SOURCE = 'remote';

var PHOTO_LOCAL = [
  { /* 01 - The Nomad Tote  */ front:'assets/img/01-nomad-front.webp',   alt:'assets/img/01-nomad-alt.webp'   },
  { /* 02 - La Riva Saddle  */ front:'assets/img/02-lariva-front.webp',  alt:'assets/img/02-lariva-alt.webp'  },
  { /* 03 - Ombra Bucket    */ front:'assets/img/03-ombra-front.webp',   alt:'assets/img/03-ombra-alt.webp'   },
  { /* 04 - Vela Crescent   */ front:'assets/img/04-vela-front.webp',    alt:'assets/img/04-vela-alt.webp'    }
];

var PHOTO_REMOTE = [
  { /* 01 - The Nomad Tote  */ front:'https://d2ol7oe51mr4n9.cloudfront.net/user_2ykR6HijNtnVqnRnCUrCf5zvljU/255fc44d-842d-46cb-9e6a-8e7ca08f2106.webp', alt:'https://d2ol7oe51mr4n9.cloudfront.net/user_2ykR6HijNtnVqnRnCUrCf5zvljU/12b37cce-5f17-45c0-ac02-4072b0ef8980.webp' },
  { /* 02 - La Riva Saddle  */ front:'https://d2ol7oe51mr4n9.cloudfront.net/user_2ykR6HijNtnVqnRnCUrCf5zvljU/d57f31bb-9342-4da4-8419-11da74a53d82.webp', alt:'https://d2ol7oe51mr4n9.cloudfront.net/user_2ykR6HijNtnVqnRnCUrCf5zvljU/fa382da5-5201-4b73-8d49-d01e2100d166.webp' },
  { /* 03 - Ombra Bucket    */ front:'https://d2ol7oe51mr4n9.cloudfront.net/user_2ykR6HijNtnVqnRnCUrCf5zvljU/5558794c-ae65-489d-8a85-5de6d418877c.webp', alt:'https://d2ol7oe51mr4n9.cloudfront.net/user_2ykR6HijNtnVqnRnCUrCf5zvljU/bba32c20-f27c-4d11-b7c1-dfae62a8261b.webp' },
  { /* 04 - Vela Crescent   */ front:'https://d2ol7oe51mr4n9.cloudfront.net/user_2ykR6HijNtnVqnRnCUrCf5zvljU/95630403-5f1a-4dae-828e-7d64bf19fe3e.webp', alt:'https://d2ol7oe51mr4n9.cloudfront.net/user_2ykR6HijNtnVqnRnCUrCf5zvljU/f7b77abb-715b-4772-92a1-0b03ec01dbec.webp' }
];

var PHOTOGRAPHS = (PHOTO_SOURCE === 'local') ? PHOTO_LOCAL : PHOTO_REMOTE;

/* ---- Punti Piccoli: the four cloths and the three commission photographs.
   The cloths are macro fabric shots. They are laid over the drawn weave on
   the garment, so if a file is missing the drawing underneath still reads —
   the coat is never blank, only less real. ---- */
/* ---- The four cloths are woven here, in code, and carried inside this file
   as data URIs: seamless tiles that need no network and cannot go missing.
   The three commission photographs are the only optional assets on the page —
   a frame whose file never arrives simply removes itself from the row. ---- */
var CLOTH_TILES = {
  lana:'@@ASSET:cloth-lana.webp@@',
  lino:'@@ASSET:cloth-lino.webp@@',
  trap:'@@ASSET:cloth-trap.webp@@',
  cera:'@@ASSET:cloth-cera.webp@@'
};
var PIC_CDN = 'https://d8j0ntlcm91z4.cloudfront.net/user_2ykR6HijNtnVqnRnCUrCf5zvljU/';
var PICCOLI_LOCAL = {
  dog:'assets/img/piccoli-dog.png', cat:'assets/img/piccoli-cat.png',
  collar:'assets/img/piccoli-collar.png'
};
var PICCOLI_REMOTE = {
  dog   : PIC_CDN+'hf_20260831_175417_6a9f7f43-f401-4ad3-9984-dcf6b9230a23.png',
  cat   : PIC_CDN+'hf_20260831_175416_c5489674-5b8a-4642-9da9-8d859bcf5c35.png',
  collar: PIC_CDN+'hf_20260831_175416_199c1208-7845-4d21-934f-9749fd8e93be.png'
};
var PICCOLI = (PHOTO_SOURCE === 'local') ? PICCOLI_LOCAL : PICCOLI_REMOTE;

/* ---- WHERE A COMMISSION GOES -------------------------------------------
   Paste a form endpoint here (Formspree, Basin, Web3Forms — any of them
   take a JSON POST) and the docket is captured properly. Leave it empty and
   the form falls back to opening the visitor's mail app, which loses a
   sizeable share of people on a phone. This is the single highest-value
   line in the file to fill in before a QR code goes on a wall. */
var COMMISSION_ENDPOINT = '';