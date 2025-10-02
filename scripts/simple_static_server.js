const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 8000;
const root = path.resolve(__dirname, '..');

function contentType(file) {
  const ext = path.extname(file).toLowerCase();
  switch (ext) {
    case '.html': return 'text/html; charset=utf-8';
    case '.css': return 'text/css; charset=utf-8';
    case '.js': return 'application/javascript; charset=utf-8';
    case '.json': return 'application/json; charset=utf-8';
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.svg': return 'image/svg+xml';
    case '.mp4': return 'video/mp4';
    case '.vtt': return 'text/vtt; charset=utf-8';
    case '.mp3': return 'audio/mpeg';
    default: return 'application/octet-stream';
  }
}

const server = http.createServer((req, res) => {
  try {
    let reqPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(root, reqPath);
    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }
    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'});
        return res.end('Not Found');
      }
      res.writeHead(200, {'Content-Type': contentType(filePath)});
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
      stream.on('error', () => { res.end(); });
    });
  } catch (e) {
    res.writeHead(500, {'Content-Type':'text/plain; charset=utf-8'});
    res.end('Server error');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Static server running at http://127.0.0.1:${port}/ (root: ${root})`);
});

process.on('SIGINT', () => { server.close(() => process.exit(0)); });
