import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { passwordHash } from '../server/models/cloudflareCrypto.js';

test('Pages Functions: login, D1, concorrência, revogação e persistência', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'menuflow-d1-test-'));
  const password = 'test-cloudflare-password-123';
  const email = 'owner@example.test';
  const hash = await passwordHash(password);
  let runtime;
  const start = async (storedHash = hash) => {
    runtime = new Miniflare(convertV4MiniflareOptions({
      modules: true, scriptPath: '.wrangler/build/index.js', compatibilityDate: '2026-10-09',
      d1Databases: { DB: 'menuflow-integration-test' }, resourcePersistencePath: directory,
      bindings: { ADMIN_EMAIL: email, ADMIN_PASSWORD_HASH: storedHash },
    }));
    await runtime.ready;
  };
  t.after(async () => { if (runtime) await runtime.dispose(); await rm(directory, { recursive: true, force: true }); });
  await start();
  const db = await runtime.getD1Database('DB');
  const schema = await readFile('migrations/0001_initial.sql', 'utf8');
  for (const statement of schema.split(';').map(value => value.trim()).filter(Boolean)) await db.prepare(statement).run();
  let cookie;
  const request = (path, method = 'GET', body, authenticated = false, extra = {}) => runtime.dispatchFetch(`https://menuflow.example/api${path}`, {
    method, headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '192.0.2.5', ...(authenticated ? { Cookie: cookie } : {}), ...extra },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  assert.equal((await (await request('/session')).json()).authenticated, false);
  const initial = await (await request('/restaurant')).json();
  assert.equal(initial.id, 'bola-pizza');
  assert.equal((await request('/products', 'POST', {})).status, 401);
  assert.equal((await request('/session', 'POST', { email, password: 'errada' })).status, 401);
  const login = await request('/session', 'POST', { email, password });
  assert.equal(login.status, 200);
  assert.match(login.headers.get('set-cookie'), /HttpOnly; SameSite=Strict/);
  assert.match(login.headers.get('set-cookie'), /Secure/);
  cookie = login.headers.get('set-cookie').split(';')[0];
  assert.equal((await (await request('/session', 'GET', undefined, true)).json()).authenticated, true);
  assert.equal((await request('/restaurant', 'PATCH', { name: 'invasor' }, true, { Origin: 'https://evil.example' })).status, 403);
  const create = name => request('/products', 'POST', { name, price: 20, category: initial.categories[0].id, ingredients: [] }, true);
  const created = await create('Teste D1');
  assert.equal(created.status, 200);
  const product = (await created.json()).products.find(p => p.name === 'Teste D1');
  const concurrent = await Promise.all([create('Concorrente A'), create('Concorrente B')]);
  for (const response of concurrent) assert.equal(response.status, 200);
  const after = await (await request('/restaurant')).json();
  assert.ok(after.products.some(p => p.name === 'Concorrente A'));
  assert.ok(after.products.some(p => p.name === 'Concorrente B'));
  await request(`/products/${product.id}`, 'PATCH', { status: 'paused' }, true);
  assert.equal((await (await request('/restaurant')).json()).products.some(p => p.id === product.id), false);
  assert.equal((await (await request('/restaurant', 'GET', undefined, true)).json()).products.some(p => p.id === product.id), true);
  const review = { rating: 4, author: 'Cliente', comment: 'Muito bom 🍕' };
  const reviewResponse = await request(`/products/${initial.products[0].id}/reviews`, 'POST', review);
  assert.equal(reviewResponse.status, 200);
  assert.equal((await reviewResponse.json()).products.find(p => p.id === initial.products[0].id).reviews[0].comment, review.comment);
  assert.equal((await request(`/products/${initial.products[0].id}/reviews`, 'POST', review)).status, 429);
  await request('/restaurant', 'PATCH', { name: 'Persistido no D1' }, true);
  await runtime.dispose();
  await start();
  assert.equal((await (await request('/restaurant')).json()).name, 'Persistido no D1');
  assert.equal((await (await request('/session', 'GET', undefined, true)).json()).authenticated, true);
  await request('/session', 'DELETE', {}, true);
  assert.equal((await request('/restaurant', 'PATCH', { name: 'falha' }, true)).status, 401);
  const again = await request('/session', 'POST', { email, password });
  cookie = again.headers.get('set-cookie').split(';')[0];
  await runtime.dispose();
  await start(await passwordHash('another-test-password-123'));
  assert.equal((await (await request('/session', 'GET', undefined, true)).json()).authenticated, false);
  for (let i = 0; i < 5; i++) assert.equal((await request('/session', 'POST', { email, password: 'errada' })).status, 401);
  assert.equal((await request('/session', 'POST', { email, password: 'errada' })).status, 429);
});
