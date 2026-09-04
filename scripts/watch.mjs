/* rebuild on any change under src/ or vendor/ */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const build = () => { try { execFileSync('node', ['build.mjs'], {cwd: ROOT, stdio: 'inherit'}); } catch {} };
build();
let t = null;
for (const d of ['src', 'vendor']) {
  fs.watch(path.join(ROOT, d), {recursive: true}, () => { clearTimeout(t); t = setTimeout(build, 120); });
}
console.log('watching src/ and vendor/ …');
