const https = require('https');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const trends = await httpsGet('https://api.mercadolibre.com/trends/MLB');
    return res.status(200).json({ trends: trends.slice(0, 20) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (r) => {
      let body = '';
      r.on('data', c => body += c);
      r.on('end', () => { try { resolve(JSON.parse(body)); } catch(e) { reject(e); } });
    }).on('error', reject);
  });
}
