# 📊 SNKHOUSE Admin Dashboard

Dashboard administrativo para gerenciar conversas do SNKHOUSE Bot.

## 🚀 Quick Start

### 1. Configurar Ambiente

Copie o arquivo de exemplo e configure:

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

### 2. Instalar Dependências

```bash
pnpm install
```

### 3. Iniciar Dev Server

```bash
pnpm dev
```

Acesse: **http://localhost:3001**

## 📋 Funcionalidades

### ✅ Implementado

- **Dashboard Principal**: Métricas em tempo real
  - Total de conversas
  - Conversas ativas
  - Total de mensagens
  - Taxa de resolução
  
- **Lista de Conversas**: Visualize todas as conversas
  - Filtros por canal e status
  - Informações do cliente
  - Ordenação por data
  
- **Detalhes da Conversa**: Histórico completo
  - Mensagens do cliente e assistente
  - Timeline de eventos
  - Informações do cliente

### 🔮 Próximas Funcionalidades

- Busca e filtros avançados
- Resposta manual via admin
- Notificações em tempo real
- Analytics e gráficos
- Exportar conversas

## 🛠️ Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Icons**: Lucide React
- **Language**: TypeScript

## 📦 Scripts

```bash
pnpm dev      # Inicia dev server (porta 3001)
pnpm build    # Build para produção
pnpm start    # Inicia servidor de produção
pnpm lint     # Executa linter
```

## 📚 Documentação

Veja a documentação completa em: `docs/11-admin-dashboard.md`

## 🤝 Suporte

Para dúvidas e suporte, consulte a documentação ou entre em contato com a equipe.
