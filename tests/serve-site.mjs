import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const root = join(process.cwd(), 'dist/site');
const config = JSON.parse(readFileSync(join(root, 'staticwebapp.config.json'), 'utf8'));
const knownAppRoutes = new Set(['/', '/demo', '/check', '/privacy', '/terms', '/print/sample-family-archive']);
const port = Number.parseInt(process.env.FAC_TEST_PORT ?? '4173', 10);
const mime = {
  '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.ps1': 'text/plain; charset=utf-8',
  '.sh': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.xml': 'application/xml; charset=utf-8'
};

const server = createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://127.0.0.1').pathname);
  const isAppRoute = knownAppRoutes.has(pathname);
  const requested = normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '');
  let file = join(root, requested === '/' ? 'index.html' : requested);
  let status = 200;
  if (isAppRoute) file = join(root, 'index.html');
  else if (!existsSync(file) || !statSync(file).isFile()) {
    file = join(root, '404.html');
    status = 404;
  }
  for (const [name, value] of Object.entries(config.globalHeaders ?? {})) response.setHeader(name, value);
  if (pathname.startsWith('/assets/')) response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  else if (pathname === '/sw.js' || pathname === '/index.html' || isAppRoute) response.setHeader('Cache-Control', 'no-cache');
  response.statusCode = status;
  response.setHeader('Content-Type', mime[extname(file)] ?? 'application/octet-stream');
  createReadStream(file).pipe(response);
});

server.on('error', (error) => {
  console.error(`Family Archive Check test server could not start on ${port}: ${error.message}`);
  process.exitCode = 1;
});

const stop = () => server.close(() => process.exit());
process.once('SIGINT', stop);
process.once('SIGTERM', stop);
server.listen(port, '127.0.0.1');
