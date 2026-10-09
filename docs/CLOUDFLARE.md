# Cloudflare Pages

O frontend é servido pelo Pages. As rotas `/api/*` executam Pages Functions usando as mesmas regras da API local, com persistência D1. O painel continua em `/admin`.

## Primeira publicação

1. Instale as dependências (`npm ci`) e autentique a conta (`npx wrangler login`).
2. Crie o banco: `npx wrangler d1 create menuflow-db`.
3. Atualize `database_id` no `wrangler.toml` com o UUID retornado. O ID inicial é um placeholder apenas para desenvolvimento local.
4. Aplique o esquema: `npm run cf:migrate`.
5. Crie o projeto: `npx wrangler pages project create menuflow --production-branch=main`.
6. Execute `npm run build`, `npm run lint` e `npm test`.
7. Publique: `npm run cf:deploy`.

O endereço final é informado pela Cloudflare. Se o nome estiver indisponível, atualize o nome do projeto em `wrangler.toml` e nos scripts `cf:deploy` e `cf:secrets` do `package.json`.

## Acesso do proprietário

Preencha `ADMIN_EMAIL` e `ADMIN_PASSWORD` no `.env` local, usando uma senha exclusiva de pelo menos 12 caracteres. Execute `npm run cf:credentials`. O comando grava `.dev.vars` para desenvolvimento e `.cloudflare-secrets.json` para publicação; ambos são ignorados pelo Git. A senha é convertida para um hash PBKDF2 com salt aleatório.

Execute `npm run cf:secrets` para enviar `ADMIN_EMAIL` e `ADMIN_PASSWORD_HASH` aos segredos do Pages. Depois execute `npm run cf:deploy` para ativar a configuração. Nunca coloque esses valores em variáveis com prefixo `VITE_`, arquivos públicos ou commits. Sem os segredos, o cardápio público funciona e o login fica desabilitado.

As sessões e a limitação de tentativas ficam no D1. Os cookies são HttpOnly/SameSite e Secure em HTTPS. Alterar as credenciais invalida as sessões antigas. Os tokens de sessão são armazenados como hashes no banco.

## Desenvolvimento e testes

- `npm run build`
- `npm run cf:migrate:local`
- `npm run cf:dev` (http://localhost:8788)
- `npm test` (após o build do frontend)

O teste Cloudflare usa Miniflare, banco temporário isolado e credenciais fictícias. Verifica autenticação, origem externa, alterações simultâneas, ocultação dos produtos pausados, avaliações, persistência, logout e revogação ao trocar credenciais. O servidor Node.js permanece disponível com `npm run dev` para desenvolvimento local.

O catálogo Bola Pizza é inicializado no primeiro acesso ao banco vazio. Dados do arquivo JSON local não são importados automaticamente. Não reutilize o banco de produção em ambientes de preview; configure um D1 separado antes de ativar previews.

## Atualizações

Execute os testes, aplique novas migrações com `npm run cf:migrate` e publique com `npm run cf:deploy`. O envio ao GitHub e a publicação no Pages são operações separadas nesta configuração de Direct Upload.

Referências oficiais: [Pages Functions e D1](https://developers.cloudflare.com/pages/functions/bindings/), [Wrangler para Pages](https://developers.cloudflare.com/pages/functions/wrangler-configuration/), [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/).
