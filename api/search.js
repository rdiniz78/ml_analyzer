const https = require('https');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q, limit = 10 } = req.query;
  if (!q) return res.status(400).json({ error: 'q obrigatorio' });

  try {
    const token = await getToken();
    const path = `/sites/MLB/search?q=${encodeURIComponent(q)}&limit=${limit}`;
    const data = await get('api.mercadolibre.com', path, token);
    if (!data.results) return res.status(200).json({ results: [], paging: { total: 0 }, raw: data });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

async function getToken() {
  const id = process.env.ML_CLIENT_ID;
  const secret = process.env.ML_CLIENT_SECRET;
  const body = `grant_type=client_credentials&client_id=${id}&client_secret=${secret}`;
  const data = await post('api.mercadolibre.com', '/oauth/token', body);
  if (!data.access_token) throw new Error('Sem token: ' + JSON.stringify(data));
  return data.access_token;
}

function get(host, path, token) {
  return new Promise((resolve, reject) => {
    const r = https.request({
      hostname: host, path, method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json', 'User-Agent': 'ml-analyzer/1.0' }
    }, res => {
      let b = ''; res.on('data', c => b += c);
      res.on('end', () => { try { resolve(JSON.parse(b)); } catch(e) { reject(new Error(b.substring(0,200))); } });
    });
    r.on('error', reject); r.end();
  });
}

function post(host, path, body) {
  return new Promise((resolve, reject) => {
    const r = https.request({
      hostname: host, path, method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body), 'Accept': 'application/json' }
    }, res => {
      let b = ''; res.on('data', c => b += c);
      res.on('end', () => { try { resolve(JSON.parse(b)); } catch(e) { reject(e); } });
    });
    r.on('error', reject); r.write(body); r.end();
  });
}
