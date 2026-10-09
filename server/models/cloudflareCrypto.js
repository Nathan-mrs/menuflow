const encoder = new TextEncoder();
export const hex = bytes => Array.from(new Uint8Array(bytes), value => value.toString(16).padStart(2, '0')).join('');
export const sha256 = async value => hex(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
export function validPasswordHash(value) { return /^pbkdf2:100000:[a-f0-9]{32}:[a-f0-9]{64}$/.test(value || ''); }
export async function passwordHash(password, salt = hex(crypto.getRandomValues(new Uint8Array(16)))) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const saltBytes = Uint8Array.from(salt.match(/.{2}/g), byte => parseInt(byte, 16));
  const digest = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: saltBytes, iterations: 100000 }, key, 256);
  return `pbkdf2:100000:${salt}:${hex(digest)}`;
}
export async function verifyPassword(password, stored) {
  if (!validPasswordHash(stored) || typeof password !== 'string' || password.length > 1024) return false;
  const candidate = await passwordHash(password, stored.split(':')[2]);
  let difference = 0;
  for (let index = 0; index < stored.length; index++) difference |= stored.charCodeAt(index) ^ candidate.charCodeAt(index);
  return difference === 0;
}
