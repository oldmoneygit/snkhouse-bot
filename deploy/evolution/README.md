# 🚀 Evolution API - Deploy Guide

## 📋 Deploy no Railway (1-Click)

### **Opção 1: Template Railway (MAIS FÁCIL)**

1. Click no botão:
   [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/evolution-api)

2. Configure variáveis:
   - `AUTHENTICATION_API_KEY`: Criar senha forte (ex: `snkh_evolution_2025_secure`)
   - `WEBHOOK_URL`: `https://snkhouse-bot-whatsapp-service.vercel.app/api/webhooks/evolution`

3. Deploy! (aguardar 2-3 min)

### **Opção 2: GitHub → Railway**

1. Fork Evolution API: https://github.com/EvolutionAPI/evolution-api

2. Railway Dashboard → New Project → Deploy from GitHub

3. Selecionar fork

4. Adicionar variáveis (mesmas acima)

5. Deploy!

---

## 🔗 Após Deploy

### **1. Anotar URL**
Railway vai gerar: `https://evolution-api-production-xxxx.up.railway.app`

### **2. Atualizar Vercel**
Adicionar variáveis em https://vercel.com/dashboard:

```env
EVOLUTION_API_URL=https://evolution-api-production-xxxx.up.railway.app
EVOLUTION_API_KEY=snkh_evolution_2025_secure
EVOLUTION_INSTANCE_NAME=snkhouse-bot
```

### **3. Redeploy Vercel**
Deployments → Latest → Redeploy

---

## 📱 Conectar WhatsApp

### **1. Criar Instância**

```bash
curl -X POST https://evolution-api-production-xxxx.up.railway.app/instance/create \
  -H "apikey: snkh_evolution_2025_secure" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "snkhouse-bot",
    "webhook": {
      "url": "https://snkhouse-bot-whatsapp-service.vercel.app/api/webhooks/evolution",
      "events": ["MESSAGES_UPSERT"]
    }
  }'
```

### **2. Gerar QR Code**

```bash
curl https://evolution-api-production-xxxx.up.railway.app/instance/connect/snkhouse-bot \
  -H "apikey: snkh_evolution_2025_secure"
```

Retorna: `{ "qrcode": { "base64": "..." } }`

### **3. Escanear**
- Abrir WhatsApp Business no celular (+55 92 9162-0674)
- WhatsApp → ⋮ → Dispositivos conectados
- Conectar dispositivo
- Escanear QR Code

### **4. Verificar Conexão**

```bash
curl https://evolution-api-production-xxxx.up.railway.app/instance/connectionState/snkhouse-bot \
  -H "apikey: snkh_evolution_2025_secure"
```

Deve retornar: `{ "state": "open" }`

---

## 🧪 Testar

1. Enviar mensagem WhatsApp para: **+55 92 9162-0674**
2. Mensagem: `Hola! Quiero ver zapatillas Nike`
3. Bot deve responder! 🎉

---

## 🔍 Troubleshooting

### QR Code expirou
```bash
curl -X DELETE https://evolution-api-production-xxxx.up.railway.app/instance/logout/snkhouse-bot \
  -H "apikey: snkh_evolution_2025_secure"

# Gerar novo QR
curl https://evolution-api-production-xxxx.up.railway.app/instance/connect/snkhouse-bot \
  -H "apikey: snkh_evolution_2025_secure"
```

### Webhook não funciona
Verificar logs Vercel: https://vercel.com/dashboard → Deployments → Logs

### Instância desconectada
WhatsApp pode desconectar após inatividade. Reconectar via QR Code.

---

## 📊 Monitoramento

**Status da instância:**
```bash
curl https://evolution-api-production-xxxx.up.railway.app/instance/fetchInstances \
  -H "apikey: snkh_evolution_2025_secure"
```

**Logs Railway:**
https://railway.app → Seu projeto → Deployments → View Logs
