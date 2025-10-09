# 📊 @snkhouse/analytics

Package de analytics e métricas para o ecossistema SNKHOUSE.

## 🎯 Funcionalidades

- ✅ Coleta de métricas do dashboard
- ✅ Estatísticas de conversas
- ✅ Análise de clientes
- ✅ Métricas de performance
- ✅ Dados em tempo real

## 📦 Instalação

```bash
pnpm add @snkhouse/analytics
```

## 🚀 Uso

```typescript
import { getDashboardMetrics } from '@snkhouse/analytics';

const metrics = await getDashboardMetrics();

console.log(metrics);
// {
//   totalConversations: 150,
//   activeConversations: 45,
//   totalMessages: 1200,
//   totalCustomers: 89,
//   ...
// }
```

## 📊 Métricas Disponíveis

### Métricas Gerais
- `totalConversations`: Total de conversas no sistema
- `activeConversations`: Conversas ativas no momento
- `totalMessages`: Total de mensagens enviadas
- `totalCustomers`: Total de clientes cadastrados
- `averageMessagesPerConversation`: Média de mensagens por conversa

### Métricas de Período
- `conversationsLast24h`: Conversas nas últimas 24h
- `messagesLast24h`: Mensagens nas últimas 24h

### Top Clientes
- `topCustomers`: Array com os 5 clientes mais ativos
  - `id`: ID do cliente
  - `name`: Nome do cliente
  - `email`: Email do cliente
  - `conversationCount`: Número de conversas
  - `lastActivity`: Última atividade

### Análise de Conversas
- `conversationsByStatus`: Distribuição de conversas por status
  - `status`: Status da conversa
  - `count`: Quantidade de conversas

### Análise Temporal
- `messagesByHour`: Distribuição de mensagens por hora (últimas 24h)
  - `hour`: Hora (0-23)
  - `count`: Quantidade de mensagens

### Performance
- `averageResponseTime`: Tempo médio de resposta (em segundos)

## 🔧 Desenvolvimento

```bash
# Rodar testes
pnpm test
```

## 📝 Exemplo Completo

```typescript
import { getDashboardMetrics, type DashboardMetrics } from '@snkhouse/analytics';

async function showDashboard() {
  try {
    const metrics: DashboardMetrics = await getDashboardMetrics();

    console.log('📊 DASHBOARD METRICS');
    console.log('==================');
    console.log(`Total Conversas: ${metrics.totalConversations}`);
    console.log(`Conversas Ativas: ${metrics.activeConversations}`);
    console.log(`Total Mensagens: ${metrics.totalMessages}`);
    console.log(`Total Clientes: ${metrics.totalCustomers}`);
    console.log(`Média Msgs/Conversa: ${metrics.averageMessagesPerConversation}`);
    console.log(`Conversas 24h: ${metrics.conversationsLast24h}`);
    console.log(`Mensagens 24h: ${metrics.messagesLast24h}`);
    console.log(`Tempo Médio Resposta: ${metrics.averageResponseTime}s`);

    console.log('\n🏆 TOP 5 CLIENTES:');
    metrics.topCustomers.forEach((customer, idx) => {
      console.log(`${idx + 1}. ${customer.name} - ${customer.conversationCount} conversas`);
    });

    console.log('\n📈 CONVERSAS POR STATUS:');
    metrics.conversationsByStatus.forEach((status) => {
      console.log(`${status.status}: ${status.count}`);
    });
  } catch (error) {
    console.error('Erro ao obter métricas:', error);
  }
}
```

## 🔐 Requisitos

- Supabase configurado com service role key
- Tabelas: `conversations`, `messages`, `customers`
- Permissões de leitura no banco de dados

## 📚 Dependências

- `@snkhouse/database`: Client Supabase com supabaseAdmin
