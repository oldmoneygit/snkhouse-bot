# 🔌 MCP (Model Context Protocol) Setup Guide

## 📋 Servidores MCP Configurados

Este projeto utiliza 4 servidores MCP para enhanced AI-assisted development:

1. **Context7** - Documentação atualizada de bibliotecas
2. **Filesystem** - Operações seguras de arquivos
3. **Supabase** - Integração direta com banco de dados
4. **Everything** (Opcional) - Conjunto completo de ferramentas

---

## 🚀 Instalação Rápida

### Pré-requisitos

- Node.js ≥ v18.0.0
- Claude Desktop App instalado
- (Opcional) Context7 API Key para rate limits maiores

---

## 1️⃣ Context7 - Up-to-date Documentation

### O que faz?

Busca documentação atualizada e exemplos de código direto da fonte, evitando APIs deprecadas e código desatualizado.

### Instalação

**Opção A: Servidor Remoto (Recomendado)**

1. Abra Claude Desktop
2. Vá em **Settings > Connectors > Add Custom Connector**
3. Configure:
   - **Name**: `Context7`
   - **URL**: `https://mcp.context7.com/mcp`

**Opção B: Servidor Local**

Adicione ao arquivo `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

**Opção C: Com API Key (para rate limits maiores)**

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp", "--api-key", "YOUR_API_KEY"]
    }
  }
}
```

> 💡 **Obter API Key**: Acesse [context7.com/dashboard](https://context7.com/dashboard)

### Uso

```
# Dentro do Claude
"Me mostre exemplos atualizados de como usar React 19 Server Actions"
"Qual é a API atual do Next.js 15 para middleware?"
```

---

## 2️⃣ Filesystem - Secure File Operations

### O que faz?

Permite operações seguras de leitura/escrita de arquivos com controles de acesso configuráveis.

### Instalação

Adicione ao `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:\\Users\\PC\\Desktop\\Ecossistema_Atendimento_SNKHOUSE"
      ]
    }
  }
}
```

### Configuração de Segurança

**⚠️ IMPORTANTE**: Sempre especifique diretórios permitidos explicitamente.

**Exemplo com múltiplos diretórios**:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:\\Users\\PC\\Desktop\\Ecossistema_Atendimento_SNKHOUSE",
        "C:\\Users\\PC\\Desktop\\Ecossistema_Atendimento_SNKHOUSE\\docs"
      ]
    }
  }
}
```

### Uso

```
# Dentro do Claude
"Liste todos os arquivos .ts no diretório packages/ai-agent"
"Leia o conteúdo do arquivo package.json"
"Crie um novo arquivo em docs/API_DOCS.md"
```

---

## 3️⃣ Supabase - Database Integration

### O que faz?

Permite queries diretas ao banco de dados Supabase, visualização de schemas, e operações CRUD.

### Instalação

**Via CLI (Recomendado)**:

```bash
claude mcp add --transport http supabase "https://mcp.supabase.com/mcp?project_ref=czueuxqhmifgofuflscg"
```

**Manual** (adicione ao `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "supabase": {
      "transport": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=czueuxqhmifgofuflscg"
    }
  }
}
```

### Configuração de Autenticação

O servidor Supabase MCP usa o project_ref para identificar o projeto. Certifique-se de que:

1. ✅ O project_ref está correto: `czueuxqhmifgofuflscg`
2. ✅ Você tem permissões de acesso ao projeto
3. ✅ As variáveis de ambiente estão configuradas (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

### Uso

```
# Dentro do Claude
"Mostre o schema da tabela conversations"
"Quantas mensagens foram enviadas hoje?"
"Liste os últimos 10 customers criados"
```

---

## 4️⃣ Everything - All Tools (Opcional)

### O que faz?

Pacote com conjunto completo de ferramentas MCP para desenvolvimento.

### Instalação

```json
{
  "mcpServers": {
    "everything": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-everything"]
    }
  }
}
```

> ⚠️ **Nota**: Este servidor inclui muitas ferramentas. Use apenas se precisar do conjunto completo.

---

## 📁 Configuração Completa

### Localização do arquivo de configuração

**Windows**:

```
%APPDATA%\Claude\claude_desktop_config.json
```

**macOS**:

```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux**:

```
~/.config/Claude/claude_desktop_config.json
```

### Arquivo de Configuração Completo

**Template disponível em**: [claude_desktop_config.example.json](../claude_desktop_config.example.json)

Copie o arquivo de exemplo e ajuste os caminhos:

```bash
# Localize seu arquivo de configuração do Claude Desktop
# Windows: %APPDATA%\Claude\claude_desktop_config.json

# Copie o exemplo e edite
cp claude_desktop_config.example.json "%APPDATA%\Claude\claude_desktop_config.json"
```

**Configuração Completa**:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:\\Users\\PC\\Desktop\\Ecossistema_Atendimento_SNKHOUSE"
      ]
    },
    "supabase": {
      "transport": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=czueuxqhmifgofuflscg"
    }
  }
}
```

> ⚠️ **IMPORTANTE**: Ajuste o caminho do filesystem para o caminho correto do seu projeto!

---

## 🔒 Segurança e Boas Práticas

### 1. Filesystem Access Control

❌ **NÃO FAÇA**:

```json
// Não dê acesso à raiz do sistema
"args": ["-y", "@modelcontextprotocol/server-filesystem", "/"]
```

✅ **FAÇA**:

```json
// Sempre especifique diretórios específicos do projeto
"args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/project"]
```

### 2. Aprovação de Tools

- **SEMPRE** revise as ações que Claude propõe antes de aprovar
- Ferramentas de escrita/deleção requerem aprovação explícita
- Você pode configurar auto-approve para operações específicas (avançado)

### 3. API Keys e Secrets

- **NUNCA** commite `claude_desktop_config.json` com API keys
- Use variáveis de ambiente quando possível
- Rotacione API keys regularmente

---

## 🧪 Testando a Configuração

Após configurar os MCPs, reinicie Claude Desktop e teste:

### Teste Context7

```
Prompt: "Me mostre a documentação mais recente do TypeScript 5.3 sobre decorators"
```

### Teste Filesystem

```
Prompt: "Liste todos os arquivos TypeScript no diretório packages/"
```

### Teste Supabase

```
Prompt: "Mostre o schema da tabela messages"
```

Se tudo funcionar, você verá Claude usando as ferramentas com tags como:

- `[Context7]`
- `[Filesystem]`
- `[Supabase]`

---

## 🐛 Troubleshooting

### Erro: "Server not found"

**Solução**: Certifique-se de que Node.js está instalado e no PATH:

```bash
node --version  # Deve mostrar v18+
```

### Erro: "Permission denied"

**Solução**: Verifique os diretórios especificados no filesystem:

- Caminhos devem ser absolutos
- Você deve ter permissões de leitura/escrita

### Erro: "Invalid project_ref"

**Solução**: Verifique o project_ref do Supabase:

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. Copie o Project ID correto

### Servidor não aparece no Claude

**Solução**:

1. Reinicie Claude Desktop completamente
2. Verifique a sintaxe JSON do config file (use [jsonlint.com](https://jsonlint.com))
3. Veja os logs em: `%APPDATA%\Claude\logs\mcp.log` (Windows)

---

## 📚 Recursos Adicionais

- **MCP Specification**: https://modelcontextprotocol.io/
- **MCP Servers Repository**: https://github.com/modelcontextprotocol/servers
- **Context7 Documentation**: https://github.com/upstash/context7
- **Supabase MCP**: https://mcp.supabase.com/
- **Claude Desktop Help**: https://support.claude.com/

---

## 🔄 Atualizações

Para atualizar os servidores MCP:

```bash
# Context7
npx -y @upstash/context7-mcp@latest

# Filesystem
npx -y @modelcontextprotocol/server-filesystem@latest

# Everything
npx -y @modelcontextprotocol/server-everything@latest
```

Os servidores são automaticamente atualizados quando você usa `npx -y` (flag `-y` força última versão).

---

**Última atualização**: 2025-01-13
**Versão do documento**: 1.0.0
