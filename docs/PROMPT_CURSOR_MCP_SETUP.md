# 🔌 Prompt para Cursor: Configurar MCPs

## 📋 Para o Cursor AI

Cole o seguinte prompt no Cursor para ele configurar os MCPs automaticamente:

---

## PROMPT PARA CURSOR:

```
Execute as seguintes tarefas em ordem:

1. Verifique se o diretório %APPDATA%\Claude existe. Se não existir, crie-o.

2. Crie ou substitua o arquivo %APPDATA%\Claude\claude_desktop_config.json com o seguinte conteúdo:

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
  },
  "globalShortcut": "Ctrl+Space"
}

3. Se já existir um arquivo claude_desktop_config.json, crie um backup dele primeiro com a extensão .backup-[timestamp].

4. Após criar o arquivo, mostre:
   - O caminho completo do arquivo criado
   - Confirmação de que os 3 servidores MCP foram configurados (Context7, Filesystem, Supabase)
   - Instruções para reiniciar o Claude Desktop

5. Crie um relatório final mostrando:
   - Status da configuração (sucesso/erro)
   - Localização do arquivo de backup (se houver)
   - Próximos passos para o usuário
```

---

## 📋 Ou Execute Manualmente

### Opção 1: PowerShell Script (Recomendado)

```powershell
# Execute este comando no PowerShell (como Administrador)
cd C:\Users\PC\Desktop\Ecossistema_Atendimento_SNKHOUSE
.\scripts\setup-mcp.ps1
```

### Opção 2: Manual via GUI

1. **Abra o Explorador de Arquivos**
2. **Cole na barra de endereço**: `%APPDATA%\Claude`
3. **Crie o arquivo**: `claude_desktop_config.json`
4. **Cole o conteúdo** do arquivo `claude_desktop_config.example.json`
5. **Ajuste o caminho** do filesystem para o caminho correto do projeto
6. **Salve o arquivo**
7. **Reinicie Claude Desktop**

### Opção 3: Via Linha de Comando

```bash
# Windows CMD
cd %APPDATA%\Claude
copy C:\Users\PC\Desktop\Ecossistema_Atendimento_SNKHOUSE\claude_desktop_config.example.json claude_desktop_config.json

# Depois edite o arquivo para ajustar o caminho do projeto
notepad claude_desktop_config.json
```

---

## 🧪 Testando a Configuração

Após configurar, reinicie Claude Desktop e teste:

### Teste Context7

```
Prompt: "Me mostre a documentação mais recente do TypeScript 5.3 sobre decorators"
```

**Resultado esperado**: Claude busca documentação atualizada do TypeScript

### Teste Filesystem

```
Prompt: "Liste todos os arquivos TypeScript no diretório packages/"
```

**Resultado esperado**: Claude lista arquivos .ts em packages/

### Teste Supabase

```
Prompt: "Mostre o schema da tabela messages"
```

**Resultado esperado**: Claude mostra estrutura da tabela messages

---

## 🔧 Troubleshooting

### Claude Desktop não reconhece os servidores

**Solução**:

1. Feche Claude Desktop **completamente** (verifique na bandeja do sistema)
2. Abra novamente
3. Verifique os logs em: `%APPDATA%\Claude\logs\mcp.log`

### Erro de permissão

**Solução**:

1. Execute o PowerShell como Administrador
2. Ou crie o arquivo manualmente via GUI

### Filesystem não acessa o projeto

**Solução**:
Verifique se o caminho está correto no JSON:

```json
"C:\\Users\\PC\\Desktop\\Ecossistema_Atendimento_SNKHOUSE"
```

Note as **barras duplas** `\\` no JSON!

---

## 📚 Documentação Completa

Para mais detalhes, consulte:

- [docs/MCP_SETUP.md](MCP_SETUP.md) - Guia completo de configuração
- [CLAUDE.md](../CLAUDE.md#-p6-mcp-model-context-protocol-configuration) - Documentação no contexto do projeto

---

**Última atualização**: 2025-01-13
