// 簡易靜態伺服器（服務 dist/client，含 SPA fallback）
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(process.cwd(), 'dist/client');
const PORT = Number(process.env.PORT || 4001);
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

http
  .createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
    if (urlPath === '/') urlPath = '/index.html';
    let filePath = path.join(ROOT, urlPath);
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403);
      return res.end('forbidden');
    }
    fs.stat(filePath, (err, stat) => {
      if (err || stat.isDirectory()) {
        // SPA fallback
        filePath = path.join(ROOT, 'index.html');
      }
      fs.readFile(filePath, (e2, data) => {
        if (e2) {
          res.writeHead(404);
          return res.end('not found');
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });
  })
  .listen(PORT, '127.0.0.1', () => console.log(`static on http://127.0.0.1:${PORT}`));
