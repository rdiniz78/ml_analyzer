const https = require('https');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Parâmetro id obrigatório' });

  try {
    const [item, reviews] = await Promise.all([
      httpsGet(`https://api.mercadolibre.com/items/${id}`),
      httpsGet(`https://api.mercadolibre.com/reviews/item/${id}`),
    ]);

    const seller = item.seller_id
      ? await httpsGet(`https://api.mercadolibre.com/users/${item.seller_id}`)
      : null;

    return res.status(200).json({
      id: item.id,
      title: item.title,
      price: item.price,
      sold_quantity: item.sold_quantity,
      condition: item.condition,
      free_shipping: item.shipping?.free_shipping,
      thumbnail: item.thumbnail,
      permalink: item.permalink,
      seller: seller ? {
        id: seller.id,
        nickname: seller.nickname,
        official_store_name: seller.company?.brand_name || null,
        transactions_completed: seller.seller_reputation?.transactions?.completed,
        rating: seller.seller_reputation?.level_id,
      } : null,
      reviews: {
        rating_average: reviews.rating_average,
        total: reviews.paging?.total || 0,
        one_star: reviews.rating_levels?.one_star || 0,
        two_star: reviews.rating_levels?.two_star || 0,
        five_star: reviews.rating_levels?.five_star || 0,
        top_negative: (reviews.reviews || [])
          .filter(r => r.rate <= 2)
          .slice(0, 5)
          .map(r => ({ rate: r.rate, content: r.content, title: r.title })),
        top_positive: (reviews.reviews || [])
          .filter(r => r.rate === 5)
          .slice(0, 3)
          .map(r => ({ rate: r.rate, content: r.content, title: r.title })),
      },
    });
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
