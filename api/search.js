const https = require('https');

let cachedToken = null;
let tokenExpiry = 0;

async function getToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;
  const clientId = process.env.ML_CLIENT_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;
  const body = `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`;
  const data = await httpsPost('api.mercadolibre.com', '/oauth/token', body);
  if (!data.access_token) throw new Error('Token nao retornado: ' + JSON.stringify(data));
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const { q, limit = 10 } = req.query;
  if (!q) return res.status(400).json({ error: 'q obrigatorio' });
  try {
    const token = await getToken();
    const path = `/sites/MLB/search?q=${encodeURIComponent(q)}&limit=${limit}`;
    const data = await httpsGet('api.mercadolibre.com', path, token);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

function httpsGet(host, path, token) {
  return new Promise((resolve, reject) => {
    const r = https.request({ hostname: host, path, method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => { try { resolve(JSON.parse(body)); } catch(e) { reject(e); } });
    });
    r.on('error', reject);
    r.setTimeout(10000, () => { r.destroy(); reject(new Error('Timeout')); });
    r.end();
  });
}

function httpsPost(host, path, body) {
  return new Promise((resolve, reject) => {
    const r = https.request({ hostname: host, path, method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
    });
    r.on('error', reject);
    r.write(body);
    r.end();
  });
}
