/**
 * Fasikun Ayomide | Realtor — backend server
 * Pure Node.js (no npm install required). Serves the static frontend
 * and a small JSON API for properties, testimonials and lead capture.
 *
 * Run:   node backend/server.js
 * Open:  http://localhost:3000
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function sendToServerForm(record) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      access_key: process.env.SERVERFORM_ACCESS_KEY,
      name: record.name,
      phoneOrEmail: record.phoneOrEmail,
      interest: record.interest,
      message: record.message,
      source: record.source,
    });

    const req = https.request(
      {
        hostname: 'serverform.com',
        port: 443,
        path: '/api/v1/submit',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          Accept: 'application/json',
        },
      },
      (response) => {
        let responseBody = '';

        response.setEncoding('utf8');

        response.on('data', (chunk) => {
          responseBody += chunk;
        });

        response.on('end', () => {
          if (response.statusCode >= 200 && response.statusCode < 300) {
            resolve(responseBody);
          } else {
            reject(
              new Error(
                `ServerForm responded ${response.statusCode}: ${responseBody}`
              )
            );
          }
        });
      }
    );

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

const PORT_DEFAULT = 3000;
const ROOT = path.join(__dirname, '..');
const FRONTEND_DIR = path.join(ROOT, 'frontend');
const DATA_DIR = path.join(__dirname, 'data');
const PROPERTIES_FILE = path.join(DATA_DIR, 'properties.json');
const TESTIMONIALS_FILE = path.join(DATA_DIR, 'testimonials.json');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

// Load a .env file if present, without adding a dotenv dependency.
// Real environment variables (e.g. set by your host) always take priority.
// IMPORTANT: this must run before requiring ./email, since that module reads
// process.env values at require-time — loading .env any later would leave it
// permanently unconfigured even with a valid .env file on disk.
function loadDotEnv(file) {
  try {
    const content = fs.readFileSync(file, 'utf-8');
    content.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const idx = trimmed.indexOf('=');
      if (idx === -1) return;
      const key = trimmed.slice(0, idx).trim();
      let value = trimmed.slice(idx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    });
  } catch (e) {
    // No .env file — that's fine, rely on real environment variables instead.
  }
}
loadDotEnv(path.join(ROOT, '.env'));

// Now that .env has been loaded into process.env, it's safe to require modules
// that read config at require-time, and to resolve config constants.
const PORT = process.env.PORT || PORT_DEFAULT;

// Simple shared secret for admin-only writes (add/remove properties).
// Change this before deploying, and set it as an env var instead of hardcoding.
const ADMIN_KEY = process.env.ADMIN_KEY || 'change-this-admin-key';

if (!fs.existsSync(LEADS_FILE)) fs.writeFileSync(LEADS_FILE, '[]');

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

function sendJSON(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function collectBody(req, cb) {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
    if (body.length > 1e6) req.destroy(); // guard against huge payloads
  });
  req.on('end', () => cb(body));
}

function serveStatic(req, res) {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';

  // Allow /properties/some-id -> frontend/pages/property.html
  let filePath;
  if (reqPath.startsWith('/properties/') && reqPath !== '/properties/') {
    filePath = path.join(FRONTEND_DIR, 'pages', 'property.html');
  } else if (!path.extname(reqPath)) {
    // Clean URLs like /about -> /pages/about.html, /properties -> /pages/properties.html
    const name = reqPath.replace(/^\/+/, '') || 'index';
    const candidateRoot = path.join(FRONTEND_DIR, `${name}.html`);
    const candidatePages = path.join(FRONTEND_DIR, 'pages', `${name}.html`);
    filePath = fs.existsSync(candidateRoot) ? candidateRoot : candidatePages;
  } else {
    filePath = path.join(FRONTEND_DIR, reqPath);
  }

  // Prevent path traversal outside frontend dir
  if (!filePath.startsWith(FRONTEND_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      return res.end('<h1>404 — Page not found</h1><a href="/">Back home</a>');
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  // ---------- API ROUTES ----------
  if (url.startsWith('/api/')) {
    // CORS (harmless for same-origin use, useful if frontend is hosted separately)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }

    // GET /api/properties
    if (url === '/api/properties' && req.method === 'GET') {
      return sendJSON(res, 200, readJSON(PROPERTIES_FILE));
    }

    // GET /api/properties/:id
    if (url.startsWith('/api/properties/') && req.method === 'GET') {
      const id = url.split('/').pop();
      const properties = readJSON(PROPERTIES_FILE);
      const found = properties.find((p) => p.id === id);
      if (!found) return sendJSON(res, 404, { error: 'Property not found' });
      return sendJSON(res, 200, found);
    }

    // POST /api/properties  (admin only — add a new property)
    if (url === '/api/properties' && req.method === 'POST') {
      if (req.headers['x-admin-key'] !== ADMIN_KEY) {
        return sendJSON(res, 401, { error: 'Unauthorized' });
      }
      return collectBody(req, (body) => {
        try {
          const newProperty = JSON.parse(body);
          if (!newProperty.id) newProperty.id = crypto.randomUUID();
          const properties = readJSON(PROPERTIES_FILE);
          properties.push(newProperty);
          writeJSON(PROPERTIES_FILE, properties);
          sendJSON(res, 201, newProperty);
        } catch (e) {
          sendJSON(res, 400, { error: 'Invalid JSON body' });
        }
      });
    }

    // DELETE /api/properties/:id  (admin only)
    if (url.startsWith('/api/properties/') && req.method === 'DELETE') {
      if (req.headers['x-admin-key'] !== ADMIN_KEY) {
        return sendJSON(res, 401, { error: 'Unauthorized' });
      }
      const id = url.split('/').pop();
      const properties = readJSON(PROPERTIES_FILE);
      const next = properties.filter((p) => p.id !== id);
      writeJSON(PROPERTIES_FILE, next);
      return sendJSON(res, 200, { deleted: id });
    }

    // GET /api/testimonials
    if (url === '/api/testimonials' && req.method === 'GET') {
      return sendJSON(res, 200, readJSON(TESTIMONIALS_FILE));
    }

    // POST /api/leads (contact / consultation booking form)
if (url === '/api/leads' && req.method === 'POST') {
  return collectBody(req, (body) => {
    try {
      const lead = JSON.parse(body);

      if (!lead.name || !lead.phoneOrEmail) {
        return sendJSON(res, 400, {
          error: 'Name and phone/email are required',
        });
      }

      const leads = readJSON(LEADS_FILE);

      const record = {
        id: crypto.randomUUID(),
        receivedAt: new Date().toISOString(),
        name: lead.name,
        phoneOrEmail: lead.phoneOrEmail,
        interest: lead.interest || '',
        message: lead.message || '',
        source: lead.source || 'website',
      };

      leads.push(record);
      writeJSON(LEADS_FILE, leads);

      // Send email notification through ServerForm
      sendToServerForm(record).catch((err) => {
        console.error(
          '[ServerForm] Failed to send lead notification:',
          err.message
        );
      });

      // Tell the website that the lead was successfully received
      return sendJSON(res, 200, {
        success: true,
        message: 'Lead received successfully',
      });
    } catch (e) {
      return sendJSON(res, 400, {
        error: 'Invalid JSON body',
      });
    }
  });
}
    // GET /api/leads  (admin only — view captured leads)
    if (url === '/api/leads' && req.method === 'GET') {
      if (req.headers['x-admin-key'] !== ADMIN_KEY) {
        return sendJSON(res, 401, { error: 'Unauthorized' });
      }
      return sendJSON(res, 200, readJSON(LEADS_FILE));
    }

    return sendJSON(res, 404, { error: 'Not found' });
  }

  // ---------- STATIC FRONTEND ----------
  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Fasikun Ayomide | Realtor — server running at http://localhost:${PORT}`);
  console.log('[ServerForm] Email notifications enabled.');
});
