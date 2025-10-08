# 🔐 Guia de Segurança - SNKHOUSE Bot

## ⚠️ REGRAS CRÍTICAS

### NUNCA FAÇA:
- ❌ Commitar arquivos `.env.local` ou `.env`
- ❌ Commitar API keys diretamente no código
- ❌ Expor credenciais em documentação
- ❌ Compartilhar `.env.local` por email/chat
- ❌ Fazer push sem verificar secrets

### SEMPRE FAÇA:
- ✅ Use variáveis de ambiente
- ✅ Mantenha `.gitignore` atualizado
- ✅ Execute `npm run check:secrets` antes de commits
- ✅ Rotacione keys se houver exposição
- ✅ Configure billing limits nas APIs

## 🔄 Como Rotacionar Credenciais

### OpenAI
1. Acesse: https://platform.openai.com/api-keys
2. Delete a key antiga
3. Crie nova key
4. Atualize `.env.local`

### Anthropic
1. Acesse: https://console.anthropic.com/settings/keys
2. Revoke key antiga
3. Crie nova key
4. Atualize `.env.local`

### Supabase
1. Acesse: https://supabase.com/dashboard/project/[PROJECT]/settings/api
2. Reset keys (se disponível)
3. Copie novas keys
4. Atualize `.env.local`

### WooCommerce
1. Acesse: [SITE]/wp-admin → WooCommerce → Settings → Advanced → REST API
2. Delete key antiga
3. Crie nova key com permissões Read/Write
4. Atualize `.env.local`

## 🛡️ Verificação de Segurança

Execute antes de cada commit:

```bash
npm run check:secrets
```

Se detectar secrets:
1. Remova do código
2. Use variáveis de ambiente
3. Adicione ao `.gitignore` se necessário
4. Rotacione as credenciais expostas

## 📋 Checklist de Segurança

- [ ] `.env.local` no `.gitignore`?
- [ ] `.env.example` criado como template?
- [ ] Documentação sem secrets?
- [ ] Pre-commit hook configurado?
- [ ] Billing limits configurados?
- [ ] Credentials rotacionadas após exposição?

## 🚨 Em Caso de Exposição

1. **Rotacione IMEDIATAMENTE** todas as keys
2. **Limpe o histórico** do Git
3. **Verifique logs** de uso suspeito
4. **Monitore billing** por cobranças inesperadas
5. **Notifique a equipe** se necessário

## 🔧 Configuração de Billing Limits

### OpenAI
- Configure limite de $20/mês
- Monitore uso no dashboard
- Ative alertas por email

### Anthropic
- Configure limite de créditos
- Monitore uso na console
- Ative alertas

### Supabase
- Configure limite de storage
- Monitore queries
- Ative alertas de uso

## 📊 Monitoramento

### Logs a Observar
- Requests suspeitos às APIs
- Uso excessivo de tokens
- IPs desconhecidos
- Erros de autenticação

### Ferramentas
- GitHub Security Alerts
- Supabase Dashboard
- OpenAI Usage Dashboard
- Anthropic Console

## 🚀 Deploy Seguro

### Variáveis de Ambiente
```bash
# Produção
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=sk-proj-your_key
ANTHROPIC_API_KEY=sk-ant-your_key
WOOCOMMERCE_URL=https://your-store.com
WOOCOMMERCE_CONSUMER_KEY=ck_your_key
WOOCOMMERCE_CONSUMER_SECRET=cs_your_secret
```

### Verificações Pré-Deploy
- [ ] Secrets não estão no código
- [ ] `.env.local` não está no repo
- [ ] Billing limits configurados
- [ ] Testes de segurança passaram

## 📞 Suporte

Em caso de problemas de segurança:
1. **Rotacione** todas as credenciais
2. **Abra issue** no GitHub
3. **Consulte** este guia
4. **Entre em contato** com a equipe

---

**Última Atualização:** 08/01/2025  
**Versão:** 1.0
