# SNKH-9: Admin Dashboard

Este documento descreve a implementação do dashboard administrativo básico para gestão de conversas do chat.

## Estrutura

- apps/admin
  - next.config.js
  - package.json
  - postcss.config.js
  - tailwind.config.js
  - tsconfig.json
  - src/app
    - layout.tsx
    - globals.css
    - page.tsx (Dashboard)
    - conversations/
      - page.tsx (Lista)
      - [id]/page.tsx (Detalhe)

- packages/database
  - package.json
  - src/index.ts (cliente Supabase)

## Configurações

- Porta do Admin: 3001 (dev)
- Tailwind CSS configurado em `tailwind.config.js` e `globals.css`
- Tipos/TS via `tsconfig.json` (herda do root)
- Transpile package `@snkhouse/database`

## Variáveis de ambiente

Defina no `.env.local` (na raiz do monorepo ou dentro de `apps/admin`):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Sem estas variáveis, o dashboard funciona em modo "vazio" (contadores 0 e listas vazias), permitindo build e visualização do layout.

## Páginas

- `/` Dashboard com métricas:
  - Total de conversas
  - Conversas ativas
  - Total de mensagens
  - Lista de conversas recentes

- `/conversations` Lista de conversas (ordenadas por `updated_at`)

- `/conversations/[id]` Detalhes da conversa com mensagens e dados do cliente

Todas as páginas marcam `export const dynamic = 'force-dynamic'` para SSR e evitam problemas de cache no app router.

## Scripts

Na raiz:

```bash
pnpm install
pnpm --filter @snkhouse/admin dev
# ou
pnpm --filter @snkhouse/admin build && pnpm --filter @snkhouse/admin start
```

Para usar outra porta em dev, você pode ajustar o script `dev` ou executar `next dev --port 3003`.

## Observações

- O pacote `@snkhouse/database` cria o cliente Supabase apenas quando as variáveis estão presentes, evitando erros em build.
- A UI usa as cores SNKHOUSE (amarelo/preto) e design limpo com Tailwind.
- Quando houver dados no Supabase (tabelas `customers`, `conversations`, `messages`), os cards e listas serão preenchidos automaticamente.
