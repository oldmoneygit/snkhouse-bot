# SNKH-9: Admin Dashboard

Este documento descreve a implementação do Admin Dashboard básico para gerenciar conversas e visualizar métricas.

## Estrutura

```
apps/admin/
  next.config.js
  package.json
  postcss.config.js
  tailwind.config.js
  tsconfig.json
  src/
    app/
      globals.css
      layout.tsx
      page.tsx
      conversations/
        layout.tsx
        loading.tsx
        page.tsx
        [id]/
          page.tsx
packages/database/
  package.json
  src/index.ts
```

## Configurações
- Next.js 14 em `apps/admin`
- Porta de desenvolvimento padrão 3001 (também adicionado script `dev:3003`)
- Tailwind CSS configurado com cores SNKHOUSE
- Tipos via TypeScript integrado

## Integração com Supabase
- Pacote `@snkhouse/database` criado para exportar o client Supabase
- Carrega variáveis de ambiente de `.env.local` quando disponível
- Se `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` não estiverem definidos, o dashboard continua renderizando com valores zerados

Variáveis necessárias:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Páginas
- `/` Dashboard com estatísticas e últimas conversas
- `/conversations` Lista de conversas com status/canal
- `/conversations/[id]` Detalhe da conversa com mensagens

Todas as rotas usam `export const dynamic = 'force-dynamic'` para renderização no servidor e evitam cache.

## Scripts
Dentro de `apps/admin`:
- `pnpm dev` (porta 3001)
- `pnpm dev:3003` (porta 3003)
- `pnpm build`

## Teste rápido
1. Instale dependências na raiz: `pnpm install`
2. Configure `.env.local` na raiz ou em `apps/admin` com as variáveis do Supabase
3. Rode: `pnpm --filter @snkhouse/admin dev`
4. Acesse `http://localhost:3001`

## Observações
- Caso as variáveis do Supabase não estejam setadas, as consultas retornam dados vazios e o dashboard ainda carrega.
- O pacote `@snkhouse/database` cria o client de forma preguiçosa para evitar erros no build quando as envs não existem.
