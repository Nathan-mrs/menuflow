import { restaurantSeed } from './restaurantSeed.js';
import { hex, sha256, verifyPassword, validPasswordHash } from './cloudflareCrypto.js';

export function cloudflareServices(env, secure = true) {
  const db = env.DB;
  const configured = Boolean(env.ADMIN_EMAIL && validPasswordHash(env.ADMIN_PASSWORD_HASH));
  const credentialHash = () => sha256(`${env.ADMIN_EMAIL}:${env.ADMIN_PASSWORD_HASH}`);
  const lifetime = 8 * 60 * 60 * 1000;
  const token = req => (req.headers.cookie || '').split(';').map(value => value.trim()).find(value => value.startsWith('menuflow_session='))?.slice('menuflow_session='.length) || '';
  async function readRestaurant() {
    let row = await db.prepare('SELECT data, version FROM restaurant WHERE id = 1').first();
    if (!row) {
      await db.prepare('INSERT OR IGNORE INTO restaurant (id, data, version) VALUES (1, ?, 0)').bind(JSON.stringify(restaurantSeed)).run();
      row = await db.prepare('SELECT data, version FROM restaurant WHERE id = 1').first();
    }
    return row;
  }
  async function limited(key, duration, limit) {
    const now = Date.now();
    await db.prepare('DELETE FROM rate_limits WHERE expires <= ?').bind(now).run();
    const result = await db.prepare(`INSERT INTO rate_limits (key, count, expires) VALUES (?, 1, ?)
      ON CONFLICT(key) DO UPDATE SET count = rate_limits.count + 1 RETURNING count`).bind(key, now + duration).first();
    return result.count > limit;
  }
  return {
    authConfigured: configured,
    getRestaurant: async () => JSON.parse((await readRestaurant()).data),
    changeRestaurant: async change => {
      for (let attempt = 0; attempt < 5; attempt++) {
        const row = await readRestaurant();
        const next = JSON.parse(row.data);
        change(next);
        const result = await db.prepare('UPDATE restaurant SET data = ?, version = version + 1 WHERE id = 1 AND version = ?').bind(JSON.stringify(next), row.version).run();
        if (result.meta.changes === 1) return next;
      }
      throw Object.assign(new Error('O cardápio foi alterado simultaneamente. Tente novamente.'), { status: 409 });
    },
    authenticated: async req => {
      const value = token(req);
      if (!configured || !/^[a-f0-9]{64}$/.test(value)) return false;
      const session = await db.prepare('SELECT expires FROM sessions WHERE token_hash = ? AND credential_hash = ? AND expires > ?').bind(await sha256(value), await credentialHash(), Date.now()).first();
      return Boolean(session);
    },
    login: async (address, email, password) => {
      const key = `login:${await sha256(address)}`;
      if (await limited(key, 15 * 60 * 1000, 5)) return { status: 429, error: 'Muitas tentativas. Aguarde 15 minutos.' };
      const valid = await verifyPassword(password, env.ADMIN_PASSWORD_HASH);
      if (!valid || email !== env.ADMIN_EMAIL) return { status: 401, error: 'E-mail ou senha inválidos.' };
      await db.prepare('DELETE FROM rate_limits WHERE key = ?').bind(key).run();
      await db.prepare('DELETE FROM sessions WHERE expires <= ?').bind(Date.now()).run();
      const value = hex(crypto.getRandomValues(new Uint8Array(32)));
      await db.prepare('INSERT INTO sessions (token_hash, credential_hash, expires) VALUES (?, ?, ?)').bind(await sha256(value), await credentialHash(), Date.now() + lifetime).run();
      return { token: value };
    },
    logout: async req => { await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256(token(req))).run(); },
    sessionCookie: (value, clear = false) => `menuflow_session=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${clear ? 0 : lifetime / 1000}${secure ? '; Secure' : ''}`,
    consumeReviewAttempt: async address => !(await limited(`review:${await sha256(address)}`, 30_000, 1)),
  };
}
