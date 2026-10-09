import { createApi } from '../../server/controllers/apiCore.js';
import { cloudflareServices } from '../../server/models/cloudflare.js';

export async function onRequest({ request, env }) {
  const security = { 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'same-origin', 'Cache-Control': 'no-store' };
  if (!env.DB) return Response.json({ error: 'Banco de dados indisponível.' }, { status: 503, headers: security });
  const url = new URL(request.url);
  const req = {
    method: request.method,
    headers: { ...Object.fromEntries(request.headers), host: url.host },
    socket: { remoteAddress: request.headers.get('cf-connecting-ip') || 'local' },
    async *[Symbol.asyncIterator]() {
      if (!request.body) return;
      const reader = request.body.getReader();
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          yield decoder.decode(value, { stream: true });
        }
        yield decoder.decode();
      } finally { reader.releaseLock(); }
    },
  };
  let response;
  let status = 200;
  let headers = security;
  const res = {
    writeHead(code, values) { status = code; headers = { ...security, ...values }; },
    end(body) { response = new Response(body, { status, headers }); },
  };
  try {
    const api = createApi(cloudflareServices(env, url.protocol === 'https:'));
    await api(req, res, url.pathname);
    return response;
  } catch {
    return Response.json({ error: 'Não foi possível concluir a operação.' }, { status: 500, headers: security });
  }
}
