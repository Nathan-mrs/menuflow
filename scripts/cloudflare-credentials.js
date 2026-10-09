import { writeFile } from 'node:fs/promises';
import { passwordHash } from '../server/models/cloudflareCrypto.js';
if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 12) {
  throw new Error('Preencha ADMIN_EMAIL e ADMIN_PASSWORD (mínimo de 12 caracteres) no .env antes de gerar as credenciais.');
}
const secrets = { ADMIN_EMAIL: process.env.ADMIN_EMAIL, ADMIN_PASSWORD_HASH: await passwordHash(process.env.ADMIN_PASSWORD) };
await writeFile('.dev.vars', Object.entries(secrets).map(([key, value]) => `${key}=${JSON.stringify(value)}`).join('\n') + '\n', { mode: 0o600 });
await writeFile('.cloudflare-secrets.json', JSON.stringify(secrets), { mode: 0o600 });
console.log('Credenciais geradas em arquivos locais ignorados pelo Git. Nenhuma senha foi exibida.');
