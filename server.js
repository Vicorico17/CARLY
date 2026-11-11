import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { answer } from './server/chat.js';

try { process.loadEnvFile(); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const production = process.argv.includes('--production');
const vite = production ? null : await (await import('vite')).createServer({ server: { middlewareMode: true }, appType: 'spa' });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
let requests = 0;
const reset = setInterval(() => { requests = 0; }, 60000);
reset.unref();

createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const json = (status, value) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(value)); };
  if (pathname === '/api/status' && req.method === 'GET') return json(200, { mode: process.env.OPENAI_API_KEY && process.env.OPENAI_MODEL ? 'live' : 'practice' });
  if (pathname === '/api/chat') {
    if (req.method !== 'POST') return json(405, { error: 'Please send a question using the form.' });
    if (req.headers['sec-fetch-site'] === 'cross-site') return json(403, { error: 'Please open CARLY directly.' });
    if (++requests > 30) return json(429, { error: 'CARLY is busy. Please wait a minute and try again.' });
    let raw = '';
    try {
      for await (const chunk of req) {
        raw += chunk;
        if (Buffer.byteLength(raw) > 140000) { json(413, { error: 'That conversation is too long. Please start a new one.' }); return; }
      }
      const result = await answer(JSON.parse(raw));
      return json(result.status, result.body);
    } catch { return json(400, { error: 'That question could not be read. Please try again.' }); }
  }
  if (pathname.startsWith('/api/')) return json(404, { error: 'Not found' });
  if (vite) return vite.middlewares(req, res);
  const root = resolve('dist');
  const path = resolve(root, '.' + pathname);
  if (path !== root && !path.startsWith(root + '/')) { res.writeHead(403); return res.end(); }
  try {
    const file = extname(path) ? path : resolve(root, 'index.html');
    const content = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' }); res.end(content);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(Number(process.env.PORT) || 5173, process.env.HOST || '127.0.0.1', () => console.log('CARLY is ready on http://localhost:' + (process.env.PORT || 5173)));
