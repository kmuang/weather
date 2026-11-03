import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = process.cwd();

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
};

const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  const url = new URL(request.url, 'http://localhost');

  const filePath = normalize(join(root, pathname === '/' ? 'index.html' : pathname));
  if (!filePath.startsWith(root)) {
    response.writeHead(403).end();
    return;
  }

  try {
    const file = await readFile(filePath);
    response.writeHead(200, { 'Content-Type': contentTypes[extname(filePath)] || 'application/octet-stream' });
    response.end(file);
  } catch {
    response.writeHead(404).end('Not found');
  }
});

let port = Number(process.env.PORT) || 3000;
server.on('error', error => {
  if (['EADDRINUSE', 'EPERM'].includes(error.code) && !process.env.PORT && port < 3010) {
    port += 1;
    server.listen(port);
    return;
  }
  throw error;
});
server.on('listening', () => {
  const address = server.address();
  console.log(`Global Weather is running at http://localhost:${address.port}`);
});
server.listen(port);
