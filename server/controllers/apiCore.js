
const fail = (message, status = 400) => { throw Object.assign(new Error(message), { status }); };
function text(value, max = 500) { return String(value || '').trim().slice(0, max); }
function recalculate(product) {
  product.reviewsCount = product.reviews.length;
  product.ratingsDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const review of product.reviews) product.ratingsDistribution[review.rating]++;
  product.rating = product.reviews.length ? Number((product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length).toFixed(1)) : 0;
}
function productFields(input, restaurant) {
  const name = text(input.name, 120);
  const price = Number(input.price);
  if (!name || !Number.isFinite(price) || price <= 0) fail('Informe nome e preço positivo.');
  if (!restaurant.categories.some(category => category.id === input.category)) fail('Categoria inválida.');
  const image = text(input.image, 2000);
  if (image && !/^https?:\/\//i.test(image)) fail('Use uma URL http ou https para a imagem.');
  return { name, price, category: input.category, image, description: text(input.description, 3000), badge: text(input.badge, 80) || null, ingredients: (Array.isArray(input.ingredients) ? input.ingredients : []).slice(0, 40).map(item => text(item, 120)) };
}
async function body(req) {
  let result = '';
  for await (const chunk of req) { result += chunk; if (new TextEncoder().encode(result).byteLength > 32_768) fail('Dados muito grandes.', 413); }
  try { return JSON.parse(result || '{}'); } catch { fail('JSON inválido.'); }
}
const reviewAttempts = new Map();
export function createApi({ getRestaurant, changeRestaurant, authConfigured, authenticated, login, logout, sessionCookie, consumeReviewAttempt }) {
return async function api(req, res, pathname) {
  const send = (status, data, headers = {}) => {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
    res.end(JSON.stringify(data));
  };
  try {
    const method = req.method;
    if (!['GET', 'HEAD'].includes(method)) {
      const origin = req.headers.origin;
      if ((origin && new URL(origin).host !== req.headers.host) || req.headers['sec-fetch-site'] === 'cross-site') fail('Origem não permitida.', 403);
      if (!req.headers['content-type']?.startsWith('application/json')) fail('Envie application/json.', 415);
    }
    if (pathname === '/api/session' && method === 'GET') return send(200, { authenticated: (await authenticated(req)), configured: authConfigured });
    if (pathname === '/api/session' && method === 'POST') {
      if (!authConfigured) fail('Configure as credenciais do proprietário no servidor.', 503);
      const input = await body(req);
      const result = await login(req.socket.remoteAddress, input.email, input.password);
      if (result.error) return send(result.status, { error: result.error });
      return send(200, { authenticated: true }, { 'Set-Cookie': sessionCookie(result.token) });
    }
    if (pathname === '/api/session' && method === 'DELETE') {
      await logout(req);
      return send(200, { authenticated: false }, { 'Set-Cookie': sessionCookie('', true) });
    }
    if (pathname === '/api/restaurant' && method === 'GET') {
      const restaurant = await getRestaurant();
      if (!(await authenticated(req))) restaurant.products = restaurant.products.filter(product => product.status !== 'paused');
      return send(200, restaurant);
    }
    const reviewMatch = pathname.match(/^\/api\/products\/([^/]+)\/reviews$/);
    if (reviewMatch && method === 'POST') {
      const input = await body(req);
      if (!text(input.comment, 2000) || !Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) fail('Informe comentário e nota entre 1 e 5.');
      const address = req.socket.remoteAddress;
      if (consumeReviewAttempt) {
        if (!(await consumeReviewAttempt(address))) fail('Aguarde 30 segundos para avaliar novamente.', 429);
      } else {
        const now = Date.now();
        for (const [key, time] of reviewAttempts) if (now - time >= 30_000) reviewAttempts.delete(key);
        if (reviewAttempts.has(address)) fail('Aguarde 30 segundos para avaliar novamente.', 429);
        reviewAttempts.set(address, now);
      }
      const restaurant = await changeRestaurant(r => {
        const product = r.products.find(p => p.id === reviewMatch[1] && p.status !== 'paused');
        if (!product) fail('Produto não encontrado.', 404);
        product.reviews.unshift({ id: crypto.randomUUID(), author: text(input.author, 80) || 'Cliente', comment: text(input.comment, 2000), rating: input.rating, date: new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Fortaleza' }), verified: false, tags: [] });
        recalculate(product);
      });
      restaurant.products = restaurant.products.filter(p => p.status !== 'paused');
      return send(200, restaurant);
    }
    if (!(await authenticated(req))) fail('Faça login para administrar o estabelecimento.', 401);
    const input = await body(req);
    const productMatch = pathname.match(/^\/api\/products\/([^/]+)$/);
    const moderationMatch = pathname.match(/^\/api\/products\/([^/]+)\/reviews\/([^/]+)$/);
    const restaurant = await changeRestaurant(r => {
      if (pathname === '/api/products' && method === 'POST') {
        r.products.unshift({ ...productFields(input, r), id: crypto.randomUUID(), status: 'active', rating: 0, reviewsCount: 0, reviews: [], ratingsDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, sizes: [{ name: 'Padrão', priceOffset: 0, default: true }], addons: [] });
      } else if (productMatch) {
        const product = r.products.find(p => p.id === productMatch[1]);
        if (!product) fail('Produto não encontrado.', 404);
        if (method === 'DELETE') r.products = r.products.filter(p => p.id !== product.id);
        else if (method === 'PATCH') {
          if (Object.keys(input).length === 1 && ['active', 'paused'].includes(input.status)) product.status = input.status;
          else Object.assign(product, productFields(input, r));
        } else fail('Método não permitido.', 405);
      } else if (moderationMatch && method === 'DELETE') {
        const product = r.products.find(p => p.id === moderationMatch[1]);
        if (!product) fail('Produto não encontrado.', 404);
        product.reviews = product.reviews.filter(review => review.id !== moderationMatch[2]);
        recalculate(product);
      } else if (pathname === '/api/restaurant' && method === 'PATCH') {
        for (const key of ['name', 'tagline', 'phone', 'whatsapp', 'instagram', 'address', 'openingHours', 'deliveryTime']) if (key in input) r[key] = text(input[key]);
        if (!r.name || !/^\d{10,15}$/.test(r.whatsapp)) fail('Informe nome e WhatsApp com DDI, apenas números.');
      } else fail('Recurso não encontrado.', 404);
    });
    send(200, restaurant);
  } catch (error) {
    if (!error.status) console.error(error);
    send(error.status || 500, { error: error.status ? error.message : 'Não foi possível salvar os dados.' });
  }
}

}
