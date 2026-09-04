#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Pull the eight placeholder frames off the generation CDN into assets/img/
# so the site serves its own photography instead of borrowing someone else's
# bandwidth. Run once from the project root:
#
#     bash scripts/fetch-photography.sh
#
# then open index.html and set:   var PHOTO_SOURCE = 'local';
#
# When Alessandra's real shots arrive, just overwrite the eight files in
# assets/img/ with the same names — nothing in the HTML needs to change.
# ---------------------------------------------------------------------------
set -euo pipefail

BASE="https://d2ol7oe51mr4n9.cloudfront.net/user_2ykR6HijNtnVqnRnCUrCf5zvljU"
PICC="https://d8j0ntlcm91z4.cloudfront.net/user_2ykR6HijNtnVqnRnCUrCf5zvljU"
OUT="assets/img"
mkdir -p "$OUT"

declare -a MAP=(
  "01-nomad-front.webp|255fc44d-842d-46cb-9e6a-8e7ca08f2106.webp"
  "01-nomad-alt.webp|12b37cce-5f17-45c0-ac02-4072b0ef8980.webp"
  "02-lariva-front.webp|d57f31bb-9342-4da4-8419-11da74a53d82.webp"
  "02-lariva-alt.webp|fa382da5-5201-4b73-8d49-d01e2100d166.webp"
  "03-ombra-front.webp|5558794c-ae65-489d-8a85-5de6d418877c.webp"
  "03-ombra-alt.webp|bba32c20-f27c-4d11-b7c1-dfae62a8261b.webp"
  "04-vela-front.webp|95630403-5f1a-4dae-828e-7d64bf19fe3e.webp"
  "04-vela-alt.webp|f7b77abb-715b-4772-92a1-0b03ec01dbec.webp"
)

# Punti Piccoli — the three commission photographs (the four cloths are
# woven in code inside index.html and need no download)
declare -a PMAP=(
  "piccoli-dog.png|hf_20260831_175417_6a9f7f43-f401-4ad3-9984-dcf6b9230a23.png"
  "piccoli-cat.png|hf_20260831_175416_c5489674-5b8a-4642-9da9-8d859bcf5c35.png"
  "piccoli-collar.png|hf_20260831_175416_199c1208-7845-4d21-934f-9749fd8e93be.png"
)

fail=0
for row in "${MAP[@]}"; do
  name="${row%%|*}"; id="${row##*|}"
  printf '  %-24s ' "$name"
  if curl -fsSL --retry 3 --max-time 60 "$BASE/$id" -o "$OUT/$name"; then
    printf 'ok  (%s)\n' "$(du -h "$OUT/$name" | cut -f1)"
  else
    printf 'FAILED\n'; rm -f "$OUT/$name"; fail=1
  fi
done

for row in "${PMAP[@]}"; do
  name="${row%%|*}"; id="${row##*|}"
  printf '  %-24s ' "$name"
  if curl -fsSL --retry 3 --max-time 90 "$PICC/$id" -o "$OUT/$name"; then
    printf 'ok  (%s)\n' "$(du -h "$OUT/$name" | cut -f1)"
  else
    printf 'FAILED\n'; rm -f "$OUT/$name"; fail=1
  fi
done

if [ "$fail" -eq 0 ]; then
  echo
  echo "All eleven files are in $OUT."
  echo "Now set  var PHOTO_SOURCE = 'local';  in index.html."
else
  echo
  echo "Some frames did not download. The generation CDN may have expired them."
  echo "Any piece whose frame is missing falls back to its hand-drawn"
  echo "illustration — the page still works, it just loses that photograph."
  exit 1
fi
