#!/usr/bin/env node
/* ============================================================
   PUNTI E SPUNTI — build

   Reassembles src/ + vendor/ into one self-contained document.
   No network at runtime, no network at build time: every library
   is vendored and every image is inlined, because the site has to
   survive a clinic wifi that blocks CDNs and a phone on one bar.

       node build.mjs            → dist/index.html
       node build.mjs --check    → also verify it matches dist/index.html.sha256
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const R    = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const RB   = p => fs.readFileSync(path.join(ROOT, p));
const M    = JSON.parse(R('build.manifest.json'));

/* ---------- the pieces ---------- */
const css    = R(M.css);
const app    = M.app.map(R).join('');          // fragments, concatenated in order
const vendor = Object.fromEntries(M.vendor.map(p => [path.basename(p), R(p)]));
const assets = Object.fromEntries(
  M.assets.map(a => [a.name, `data:${a.mime};base64,${RB(a.path).toString('base64')}`])
);

/* ---------- fill the shell ---------- */
let out = R(M.entry)
  .replace('@@ROUTER_HEAD@@', () => R(M.routerHead))
  .replace('@@SCHEMA@@',      () => R(M.schema))
  .replace('@@CSS@@',         () => css)
  .replace('@@APP@@',         () => app)
  .replace(/@@VENDOR:([^@]+)@@/g, (_, n) => {
    if (!vendor[n]) throw new Error('missing vendor file: ' + n);
    return vendor[n];
  })
  .replace(/@@ASSET:([^@]+)@@/g, (_, n) => {
    if (!assets[n]) throw new Error('missing asset: ' + n);
    return assets[n];
  });

const left = out.match(/@@[A-Z_]+(:[^@]+)?@@/);
if (left) throw new Error('unfilled placeholder: ' + left[0]);

fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
fs.writeFileSync(path.join(ROOT, M.out), out);

/* everything a host serves alongside the document — headers, robots,
   sitemap, the share card, and the optional photography folder */
fs.cpSync(path.join(ROOT, 'public'), path.join(ROOT, 'dist'), { recursive: true });

const sha = crypto.createHash('sha256').update(out).digest('hex');
const kb  = n => (n / 1024).toFixed(1) + ' KB';
console.log(`${M.out}  ${kb(Buffer.byteLength(out))}  sha256 ${sha.slice(0, 16)}…`);
console.log(`  css ${kb(css.length)}   app ${kb(app.length)} in ${M.app.length} modules`);
console.log(`  vendor ${kb(Object.values(vendor).reduce((n, v) => n + v.length, 0))}   assets ${kb(M.assets.reduce((n, a) => n + RB(a.path).length, 0))} in ${M.assets.length} files`);

if (process.argv.includes('--check')) {
  const want = path.join(ROOT, 'dist.sha256');
  if (!fs.existsSync(want)) { fs.writeFileSync(want, sha + '\n'); console.log('  wrote baseline hash'); }
  else if (R('dist.sha256').trim() !== sha) { console.error('  MISMATCH against dist.sha256 — dist/index.html would change.'); process.exit(1); }
  else console.log('  ✓ matches baseline');
}
