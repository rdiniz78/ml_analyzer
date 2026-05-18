const https = require('https');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q, limit = 10 } = req.query;
  if (!q) return res.status(400).json({ error: 'q obrigatorio' });

  try {
    const token = process.env.ML_ACCESS_TOKEN;
    const path = `/sites/MLB/search?q=${encodeURIComponent(q)}&limit=${limit}`;
    const data = await get('api.mercadolibre.com', path, token);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

function get(host, path, token) {
  return new Promise((resolve, reject) => {
    const r = https.request({
      hostname: host, path, method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }
    }, res => {
      let b = ''; res.on('data', c => b += c);
      res.on('end', () => { try { resolve(JSON.parse(b)); } catch(e) { reject(new Error(b.substring(0,200))); } });
    });
    r.on('error', reject); r.end();
  });
}
