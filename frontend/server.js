const http = require('http');
const fs = require('fs');
const path = require('path');

const publicDir = __dirname;
const port = process.env.FRONTEND_PORT || 3000;
const host = process.env.HOST || '127.0.0.1';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(publicDir, safePath === '/' ? 'index.html' : safePath);

  fs.readFile(filePath, (error, content) => {
    if (error) {
      fs.readFile(path.join(publicDir, 'index.html'), (fallbackError, fallbackContent) => {
        if (fallbackError) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fallbackContent);
      });
      return;
    }

    res.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream'
    });
    res.end(content);
  });
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Stop the existing server or run with FRONTEND_PORT=3001.`);
    process.exit(1);
  }

  throw error;
});

server.listen(port, host, () => {
  console.log(`Frontend running on http://${host}:${port}`);
});
