/* the smallest possible static server: `npm run dev`, then open the URL.
   serves dist/ with the routes the site actually uses (?p=, #misura). */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = {'.html':'text/html;charset=utf-8','.js':'text/javascript','.css':'text/css',
  '.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.xml':'application/xml','.txt':'text/plain'};

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  for (const base of ['dist', 'public']) {
    const f = path.join(ROOT, base, url === '/' ? 'index.html' : url);
    if (f.startsWith(path.join(ROOT, base)) && fs.existsSync(f) && fs.statSync(f).isFile()) {
      res.writeHead(200, {'content-type': TYPES[path.extname(f)] || 'application/octet-stream'});
      return fs.createReadStream(f).pipe(res);
    }
  }
  res.writeHead(200, {'content-type': 'text/html;charset=utf-8'});
  fs.createReadStream(path.join(ROOT, 'dist/index.html')).pipe(res);  // SPA fallback
}).listen(4321, () => console.log('http://localhost:4321  ·  /?p=piccoli  ·  /?p=collezione  ·  /?c=Clinica'));
