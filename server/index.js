import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { api } from './controllers/api.js';

const production = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT || 5173);
const vite = production ? null : await (await import('vite')).createServer({ server: { middlewareMode: true }, appType: 'spa' });
const dist = resolve('dist');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };
createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'same-origin');
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); return res.end('URL inválida'); }
  if (pathname.startsWith('/api/')) return api(req, res, pathname);
  if (vite) return vite.middlewares(req, res);
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
  try {
    const target = resolve(dist, `.${pathname}`);
    if (!target.startsWith(dist + sep) && target !== dist) { res.writeHead(403); return res.end(); }
    let content;
    let extension = extname(target);
    try { content = await readFile(target); }
    catch {
      if (extension) { res.writeHead(404); return res.end(); }
      content = await readFile(resolve(dist, 'index.html'));
      extension = '.html';
    }
    res.setHeader('Content-Type', types[extension] || 'application/octet-stream');
    res.setHeader('Cache-Control', extension === '.html' ? 'no-store' : 'public, max-age=3600');
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch { res.writeHead(500); res.end('Execute npm run build antes de iniciar em produção.'); }
}).listen(port, process.env.HOST || '127.0.0.1', () => console.log(`MenuFlow: http://localhost:${port}`));
