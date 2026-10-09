# MenuFlow

Cardápio digital de um único restaurante, com área pública em `/` e painel do proprietário em `/admin`.

## Requisitos e instalação

- Node.js 22.16 ou superior (linha 22 LTS) e npm.
- `npm ci`
- Copie `.env.example` para `.env` e preencha `ADMIN_EMAIL` e `ADMIN_PASSWORD` (mínimo de 12 caracteres).
- `npm run dev`
- Abra `http://localhost:5173` ou `http://localhost:5173/admin`.

Sem credenciais configuradas, o login fica desabilitado. Não existe senha padrão, cadastro público nem senha embutida no frontend. Reinicie o servidor após alterar as credenciais. Para outros donos do mesmo estabelecimento, esta versão utiliza uma conta de proprietário compartilhada; contas individuais e recuperação por e-mail ainda não foram implementadas.

## Estrutura MVC

```text
server/
  models/            Dados do restaurante, persistência e sessões
  controllers/       API, validação e autorização das operações
  index.js           Servidor HTTP e integração com Vite
  production.js      Inicialização em produção
src/
  models/            Acesso à API e armazenamento dos favoritos
  controllers/       Estado e ações do restaurante e autenticação
  views/             Telas, componentes visuais e estilos
  utils/             Formatação e mensagem de pedido pelo WhatsApp
  App.jsx            Seleção das páginas pública e administrativa
  main.jsx           Inicialização do React
 tests/              Testes de integração de acesso e persistência
```

O único exemplo mantido é o Bola Pizza, em `server/models/restaurantSeed.js`. O catálogo inicial é utilizado quando ainda não existe armazenamento no servidor. Dados antigos das demonstrações em localStorage não são importados automaticamente.

## Funcionalidades

- Categorias, busca, favoritos locais, avaliações e detalhes dos produtos.
- Tamanho, adicionais, observações e quantidade com envio do pedido ao WhatsApp.
- QR Code válido para o cardápio e identificação da mesa na mensagem de pedido.
- Login do proprietário, saída e sessão com validade de oito horas.
- Criar, editar, pausar, ativar e excluir produtos.
- Listar categorias, remover avaliações e editar dados do estabelecimento.
- Indicadores baseados nos produtos e comentários cadastrados. Não há indicadores fictícios de pedidos.

As alterações administrativas são autorizadas no servidor. O login usa comparação de hash scrypt, cookies HttpOnly/SameSite e limitação de tentativas. Em produção, cookies exigem HTTPS. Sessões ficam em memória e são encerradas quando o servidor reinicia.

## Dados e hospedagem

As alterações são gravadas em `storage/restaurant.json` por escrita atômica. Configure `DATA_DIR` para um diretório persistente se a hospedagem utilizar discos temporários. Faça backup desse diretório. Esta implementação é para uma instância do servidor; várias réplicas exigem armazenamento e sessões compartilhados.

Para produção:

1. Configure as credenciais por variáveis de ambiente ou `.env.production`.
2. Execute `npm ci` e `npm run build`.
3. Execute `npm start` atrás de um proxy com HTTPS.
4. Configure `HOST=0.0.0.0` quando a plataforma precisar de acesso externo à porta, e ajuste `PORT` conforme o provedor.

O servidor entrega tanto o frontend quanto a API. GitHub Pages não executa Node.js e não atende à autenticação e à persistência desta versão. O antigo deploy estático foi substituído por CI de validação; nenhuma nova hospedagem foi publicada.

## Verificação

- `npm run lint`
- `npm run build`
- `npm test` (execute após o build)
- `npm audit`

O teste de integração cobre bloqueio de alterações anônimas, login inválido e válido, atributos dos cookies, origem externa, validação de preço, criação e edição, pausa de produtos, avaliações, moderação, logout, limitação de tentativas e persistência após reiniciar. Os dados de teste ficam em um diretório temporário isolado.
