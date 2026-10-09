import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const sessions = new Map();
const attempts = new Map();
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
if (password && password.length < 12) throw new Error('ADMIN_PASSWORD deve ter pelo menos 12 caracteres.');
const salt = randomBytes(32);
const passwordHash = password ? scryptSync(password, salt, 64) : null;
const lifetime = 8 * 60 * 60 * 1000;
export const authConfigured = Boolean(email && passwordHash);
export function login(address, candidateEmail, candidatePassword) {
  const now = Date.now();
  for (const [key, entry] of attempts) if (entry.until < now) attempts.delete(key);
  const attempt = attempts.get(address) || { count: 0, until: now + 15 * 60 * 1000 };
  if (attempt.count >= 5) return { status: 429, error: 'Muitas tentativas. Aguarde 15 minutos.' };
  attempt.count++;
  attempts.set(address, attempt);
  const candidate = scryptSync(String(candidatePassword || '').slice(0, 1024), salt, 64);
  if (!passwordHash || !timingSafeEqual(candidate, passwordHash) || candidateEmail !== email) {
    return { status: 401, error: 'E-mail ou senha inválidos.' };
  }
  attempts.delete(address);
  const token = randomBytes(32).toString('hex');
  for (const [key, entry] of sessions) if (entry.expires < now) sessions.delete(key);
  sessions.set(token, { expires: now + lifetime });
  return { token };
}
export function sessionToken(req) {
  return (req.headers.cookie || '').split(';').map(part => part.trim()).find(part => part.startsWith('menuflow_session='))?.split('=')[1];
}
export function authenticated(req) {
  const token = sessionToken(req);
  const session = sessions.get(token);
  if (!session || session.expires < Date.now()) { sessions.delete(token); return false; }
  return true;
}
export const logout = req => sessions.delete(sessionToken(req));
export const sessionCookie = (token, clear = false) => `menuflow_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${clear ? 0 : lifetime / 1000}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
