# 📚 Documentação - SNKHOUSE Bot

## 🎯 Visão Geral

Este diretório contém toda a documentação técnica do projeto SNKHOUSE Bot, um sistema de atendimento automatizado baseado em IA para e-commerce.

## 📖 Índice da Documentação

### 🚀 [Setup Inicial](./01-setup-inicial.md)
- Configuração do ambiente de desenvolvimento
- Instalação de dependências
- Configuração do Supabase
- Testes de conexão
- Status do projeto

### 🏗️ [Arquitetura do Sistema](./02-arquitetura.md)
- Visão geral da arquitetura
- Estrutura do monorepo
- Fluxo de dados
- Schema do banco de dados
- Segurança e deployment

### 📚 [Melhores Práticas](./03-melhores-praticas.md)
- Princípios de desenvolvimento
- Padrões de código
- Segurança e performance
- Testes e monitoramento
- CI/CD

### 🗄️ [Database Schema](./04-database-schema.md)
- Estrutura das tabelas
- Relacionamentos e índices
- Segurança e RLS
- Tipos TypeScript
- Scripts de validação

### 🎨 [Widget Implementation](./05-widget-implementation.md)
- Componente ChatButton
- Design system SNKHOUSE
- Acessibilidade e testes
- Animações e performance
- Integração e configuração

### 💬 [Chat Modal Implementation](./06-chat-modal-implementation.md)
- Componente ChatWindow
- Sistema de mensagens
- Animações e interações
- Acessibilidade completa
- Testes e documentação

### 🔌 [API Chat Implementation](./07-api-chat-implementation.md)
- API Route /api/chat
- Processamento de mensagens
- Respostas contextuais
- Integração frontend-backend
- Testes e validação

### 🤖 [AI Agent Implementation](./08-ai-agent-implementation.md)
- Agente IA com OpenAI GPT-4o-mini
- Fallback para Anthropic Claude
- System prompt em espanhol argentino
- Orquestração e error handling
- Testes e monitoramento

### 🛒 [WooCommerce Integration](./09-woocommerce-integration.md)
- Cliente para API REST WooCommerce
- Sistema de cache inteligente
- Consulta de produtos e pedidos
- Performance e error handling
- Testes e documentação

## 🎯 Objetivos do Projeto

O SNKHOUSE Bot é um sistema completo de atendimento automatizado que:

- **Automatiza** o atendimento ao cliente via IA
- **Integra** com WooCommerce para dados de produtos
- **Suporta** múltiplos canais (Widget web + WhatsApp)
- **Fornece** painel administrativo para gestão
- **Escala** facilmente com arquitetura moderna

## 🛠️ Stack Tecnológica

### Frontend
- **Next.js 14** - Framework React com App Router
- **React 18** - Biblioteca de interface
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS
- **Lucide React** - Ícones

### Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Banco de dados
- **Express.js** - Servidor Node.js
- **TypeScript** - Linguagem principal

### IA e Integrações
- **OpenAI GPT-4** - Modelo de linguagem principal
- **Anthropic Claude** - Modelo de fallback
- **WooCommerce API** - Integração com e-commerce
- **WhatsApp Business API** - Mensagens

### DevOps
- **Turborepo** - Build system para monorepo
- **pnpm** - Package manager
- **GitHub Actions** - CI/CD
- **Vercel/Railway** - Deploy

## 🏃‍♂️ Quick Start

### 1. Clone e Instale
```bash
git clone https://github.com/oldmoneygit/snkhouse-bot.git
cd snkhouse-bot
pnpm install
```

### 2. Configure Variáveis
```bash
cp .env.example .env.local
# Edite .env.local com suas credenciais
```

### 3. Teste Conexão
```bash
pnpm test:supabase
```

### 4. Execute Desenvolvimento
```bash
pnpm dev
```

## 📁 Estrutura do Projeto

```
snkhouse-bot/
├── apps/                    # Aplicações
│   ├── admin/              # Painel administrativo
│   ├── widget/             # Widget flutuante
│   └── whatsapp-service/   # Serviço WhatsApp
├── packages/               # Bibliotecas compartilhadas
│   ├── database/           # Cliente Supabase
│   ├── ai-agent/           # Serviço de IA
│   ├── integrations/       # Integrações externas
│   ├── ui/                 # Componentes UI
│   └── shared/             # Utilitários
├── docs/                   # Documentação
├── scripts/                # Scripts de automação
└── supabase/               # Configurações Supabase
```

## 🔗 Links Úteis

- **Repositório**: [GitHub](https://github.com/oldmoneygit/snkhouse-bot)
- **Issues**: [Roadmap e Bugs](https://github.com/oldmoneygit/snkhouse-bot/issues)
- **Supabase**: [Documentação](https://supabase.com/docs)
- **Next.js**: [Documentação](https://nextjs.org/docs)
- **OpenAI**: [API Docs](https://platform.openai.com/docs)

## 📞 Suporte

### Para Desenvolvedores
1. Consulte a documentação específica
2. Execute os testes para verificar setup
3. Abra uma issue no GitHub para bugs
4. Use as discussões para dúvidas

### Para Usuários Finais
1. Consulte o painel administrativo
2. Verifique logs de erro
3. Entre em contato com suporte técnico

## 📊 Status do Projeto

| Componente | Status | Descrição |
|------------|--------|-----------|
| Setup Inicial | ✅ Concluído | Ambiente configurado |
| Database | ✅ Concluído | Schema e migrações |
| Widget Button | ✅ Concluído | Botão flutuante |
| Chat Modal | ✅ Concluído | Interface de chat |
| API Chat | ✅ Concluído | Backend de mensagens |
| AI Agent | ✅ Concluído | Integração OpenAI/Claude |
| WooCommerce | ✅ Concluído | Cliente para produtos e pedidos |
| WhatsApp | 📋 Planejado | Business API |
| Admin Panel | 📋 Planejado | Painel de gestão |

## 🎯 Roadmap

### Fase 1: Core (Janeiro 2025)
- [x] Setup inicial e configurações
- [x] Database schema e migrações
- [x] Widget flutuante (ChatButton)
- [x] Modal de chat (ChatWindow)
- [x] API de chat (/api/chat)
- [x] Integração OpenAI
- [x] Cliente WooCommerce

### Fase 2: Integração (Fevereiro 2025)
- [ ] WhatsApp Business API
- [ ] Painel administrativo
- [ ] Sistema de autenticação
- [ ] Testes automatizados

### Fase 3: Produção (Março 2025)
- [ ] Deploy em produção
- [ ] Monitoramento e logs
- [ ] Otimizações de performance
- [ ] Documentação completa

## 🤝 Contribuição

1. Fork o repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a [MIT License](../LICENSE).

---

**Última atualização:** 08/01/2025  
**Versão:** 0.1.0  
**Status:** 🚧 Em desenvolvimento
