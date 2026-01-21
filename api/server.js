import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { bucketList as seedBucket, timeline as seedTimeline } from '../src/data/memories.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');
const DIST_DIR = path.join(__dirname, '../dist');
const PORT = process.env.PORT || 3000;
const DEFAULT_NOTE = '给未来的我们：记得在忙碌的每一天留一点空隙，看日落、喝热巧克力、分享梦。';

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1e6) {
        req.connection.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
  });
}

function loadDB() {
  if (fs.existsSync(DB_PATH)) {
    try {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Failed to read db.json, using seed', err);
    }
  }
  return {
    capsules: seedTimeline,
    bucket: seedBucket,
    note: DEFAULT_NOTE,
  };
}

function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function sendJSON(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(body));
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const map = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.svg': 'image/svg+xml',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.woff2': 'font/woff2',
    };
    res.writeHead(200, { 'Content-Type': map[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

function notFound(res) {
  sendJSON(res, 404, { error: 'Not found' });
}

let db = loadDB();

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  // API routes
  if (req.url === '/api/state' && req.method === 'GET') {
    return sendJSON(res, 200, db);
  }

  if (req.url === '/api/capsules' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const capsule = body?.capsule;
      if (!capsule?.title) return sendJSON(res, 400, { error: 'Invalid capsule' });
      const id = capsule.id || `capsule-${Date.now()}`;
      const newCapsule = { ...capsule, id };
      db.capsules = [...db.capsules, newCapsule];
      saveDB(db);
      return sendJSON(res, 201, newCapsule);
    } catch (err) {
      return sendJSON(res, 400, { error: err.message });
    }
  }

  if (req.url?.startsWith('/api/capsules/') && req.method === 'PUT') {
    try {
      const id = decodeURIComponent(req.url.split('/').pop());
      const body = await readBody(req);
      const next = db.capsules.map((c) => (c.id === id ? { ...c, ...body } : c));
      if (!next.find((c) => c.id === id)) return sendJSON(res, 404, { error: 'Capsule not found' });
      db.capsules = next;
      saveDB(db);
      return sendJSON(res, 200, { ok: true });
    } catch (err) {
      return sendJSON(res, 400, { error: err.message });
    }
  }

  if (req.url?.startsWith('/api/bucket/') && req.method === 'PUT') {
    try {
      const id = decodeURIComponent(req.url.split('/').pop());
      const body = await readBody(req);
      const next = db.bucket.map((b) => (b.id === id ? { ...b, ...body } : b));
      if (!next.find((b) => b.id === id)) return sendJSON(res, 404, { error: 'Bucket item not found' });
      db.bucket = next;
      saveDB(db);
      return sendJSON(res, 200, { ok: true });
    } catch (err) {
      return sendJSON(res, 400, { error: err.message });
    }
  }

  if (req.url === '/api/note' && req.method === 'PUT') {
    try {
      const body = await readBody(req);
      if (typeof body.note !== 'string') return sendJSON(res, 400, { error: 'Invalid note' });
      db.note = body.note;
      saveDB(db);
      return sendJSON(res, 200, { ok: true });
    } catch (err) {
      return sendJSON(res, 400, { error: err.message });
    }
  }

  // Static file serving
  const pathname = req.url.split('?')[0];
  const filePath = path.join(DIST_DIR, pathname === '/' ? '/index.html' : pathname);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return sendFile(res, filePath);
  }
  // SPA fallback
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    return sendFile(res, indexPath);
  }
  return notFound(res);
});

server.listen(PORT, () => {
  console.log(`Server (API + static) running on http://localhost:${PORT}`);
});
