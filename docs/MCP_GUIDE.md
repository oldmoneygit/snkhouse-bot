# 🔧 MCP SERVERS - SNKHOUSE BOT

**Última atualização:** 2025-10-08
**Versão:** 1.0

Este documento lista todos os MCP servers disponíveis no projeto SNKHOUSE Bot e define políticas de uso.

---

## 📋 MCP SERVERS DISPONÍVEIS

**Config location:** `C:\Users\PC\.cursor\mcp.json`

### **Servers Ativos:**

#### 1. 🗄️ Supabase
**URL:** `https://mcp.supabase.com/mcp?project_ref=czueuxqhmifgofuflscg`

**Capabilities:**
- ✅ Query tables (SELECT)
- ✅ Insert data
- ✅ Update data
- ⚠️ Delete data (CUIDADO - requer aprovação)
- ✅ Run SQL queries
- ✅ Check schema
- ✅ View RLS policies

**Quando usar:**
- Validar schema do banco antes de implementar features
- Consultar dados para debugging
- Criar queries complexas para analytics
- Verificar integridade de dados

**Quando NÃO usar:**
- Para operações CRUD normais (use `supabaseAdmin` do código)
- Para updates críticos sem validação
- Para deletar dados sem aprovação explícita

---

#### 2. 📁 Filesystem
**Command:** `npx -y @modelcontextprotocol/server-filesystem`
**Path:** `C:\Users\PC\Desktop\Ecossistema_Atendimento_SNKHOUSE`

**Capabilities:**
- ✅ Read files
- ✅ Write files
- ✅ List directories
- ✅ Create directories
- ✅ Search in files
- ✅ Get file metadata

**Quando usar:**
- SEMPRE para criar/modificar arquivos
- Para ler configs antes de modificar
- Para buscar padrões no código existente
- Para validar estrutura de pastas

**Quando NÃO usar:**
- Nunca sobrescrever arquivos sem ler primeiro
- Nunca deletar arquivos sem backup
- Nunca modificar .env ou arquivos sensíveis

---

#### 3. 🐙 Github
**Command:** `npx -y @modelcontextprotocol/server-github`
**Auth:** Token configurado

**Capabilities:**
- ✅ Create commits
- ✅ Create/close issues
- ✅ Create PRs
- ✅ Update Projects
- ✅ Add labels
- ✅ Search code

**Quando usar:**
- Ao finalizar uma task (commit + close issue)
- Para sincronizar com GitHub Projects
- Para criar issues de follow-up
- Para documentar decisões

**Quando NÃO usar:**
- Nunca fazer force push
- Nunca fechar issues sem validação
- Nunca modificar histórico de commits

---

#### 4. 🧠 Memory
**Command:** `npx -y @modelcontextprotocol/server-memory`

**Capabilities:**
- ✅ Save decisions
- ✅ Retrieve context
- ✅ Store patterns
- ✅ Remember preferences

**Quando usar:**
- Registrar decisões arquiteturais importantes
- Salvar padrões de código do projeto
- Lembrar convenções (ex: "sempre usar try-catch")
- Armazenar TODOs para próximas tasks

**Quando NÃO usar:**
- Não salvar dados sensíveis (API keys, senhas)
- Não salvar dados temporários
- Não duplicar informação que já está em docs

---

#### 5. 🤔 Sequential Thinking
**Command:** `npx -y @modelcontextprotocol/server-sequential-thinking`

**Capabilities:**
- ✅ Break down complex problems
- ✅ Create step-by-step plans

**Quando usar:**
- Para tasks complexas (>5 arquivos afetados)
- Para features que envolvem múltiplos packages
- Para debugging de problemas difíceis
- Para planejar refactorings grandes

**Quando NÃO usar:**
- Para tasks simples e diretas
- Quando o plano já está claro

---

#### 6. 🎭 Puppeteer
**Command:** `npx -y @modelcontextprotocol/server-puppeteer`

**Capabilities:**
- ✅ Navigate to URLs
- ✅ Take screenshots
- ✅ Click elements
- ✅ Fill forms
- ✅ Get page content
- ✅ Run JavaScript

**Quando usar:**
- Testar páginas após implementar
- Validar que UI funciona
- Fazer screenshots para documentação
- Testar fluxos completos (e2e)

**Quando NÃO usar:**
- Não usar para testes unitários (use Jest)
- Não usar se servidor não estiver rodando
- Não fazer scraping de sites externos sem permissão

---

#### 7. 🎨 Playwright
**Command:** `npx -y @modelcontextprotocol/server-playwright`
**Status:** ⏸️ Disponível mas não usado (preferir Puppeteer)

---

#### 8. 📚 Context7
**URL:** `https://mcp.context7.com/mcp`

**Capabilities:**
- ✅ Search official docs
- ✅ Get latest API references

**Quando usar:**
- SEMPRE que usar biblioteca/framework novo
- Para verificar se API está deprecated
- Para consultar best practices atualizados
- Antes de implementar features complexas

**Quando NÃO usar:**
- Não confiar 100% - sempre validar localmente
- Não usar para conceitos básicos que você já sabe

---

#### 9. 🔧 Rube
**URL:** `https://rube.composio.dev/mcp?agent=cursor`

**Capabilities:**
- ✅ Code analysis
- ✅ Pattern detection
- ✅ Refactoring suggestions

**Quando usar:**
- Para analisar código legado
- Para detectar code smells
- Para sugestões de otimização

---

## 🎯 WORKFLOW RECOMENDADO

### **Antes de QUALQUER task:**

1. **[Read]** Ler `C:\Users\PC\.cursor\mcp.json`
   - Verificar quais MCPs estão ativos
   - Ver se há MCPs novos disponíveis

2. **[Memory MCP]** Consultar decisões anteriores
   - Ver se há padrões já definidos
   - Verificar TODOs relacionados

3. **[Context7 MCP]** Consultar docs oficiais
   - Se usar biblioteca nova
   - Se não tiver certeza sobre API

4. **[Filesystem MCP]** Ler estrutura do projeto
   - Entender arquitetura atual
   - Ver onde novos arquivos devem ir

5. **[Sequential Thinking MCP]** Planejar task
   - Se task for complexa
   - Criar checklist mental

### **Durante implementação:**

1. **[Filesystem MCP]** Criar arquivos
   - Seguir estrutura existente
   - Manter organização

2. **[Supabase MCP]** Validar queries
   - Se precisar acessar banco
   - Antes de escrever código

3. **[Puppeteer MCP]** Testar
   - Após implementar UI
   - Validar que funciona

### **Ao finalizar:**

1. **[Memory MCP]** Salvar decisões
   - Registrar o que foi feito
   - Marcar TODOs para próximas tasks

2. **[Github MCP]** Commit e close issue
   - Commit com mensagem clara
   - Fechar issue relacionada
   - Atualizar GitHub Projects

3. **[Filesystem MCP]** Criar/atualizar docs
   - Documentar no /docs
   - Atualizar CHANGELOG.md

---

## 📏 POLÍTICAS DE QUALIDADE

### **🚫 NUNCA:**

1. **Quebrar código funcionando**
   - ❌ Nunca modificar arquivo sem ler primeiro
   - ❌ Nunca assumir estrutura - sempre verificar
   - ❌ Nunca deletar código sem confirmar

2. **Fazer gambiarras**
   - ❌ Nunca usar `any` no TypeScript sem justificativa
   - ❌ Nunca hardcodar valores que devem ser variáveis
   - ❌ Nunca fazer workarounds temporários sem TODO

3. **Desorganizar o projeto**
   - ❌ Nunca criar arquivos fora da estrutura padrão
   - ❌ Nunca misturar responsabilidades
   - ❌ Nunca duplicar código que já existe

4. **Ignorar erros**
   - ❌ Nunca usar try-catch vazio
   - ❌ Nunca ignorar warnings do TypeScript
   - ❌ Nunca deixar console.log em produção

5. **Fazer mudanças sem validar**
   - ❌ Nunca commitar sem testar
   - ❌ Nunca fechar issue sem verificar
   - ❌ Nunca modificar schema sem backup

### **✅ SEMPRE:**

1. **Manter qualidade de código**
   - ✅ Sempre usar TypeScript tipado
   - ✅ Sempre adicionar comentários JSDoc
   - ✅ Sempre seguir padrões do projeto
   - ✅ Sempre fazer error handling robusto

2. **Documentar tudo**
   - ✅ Sempre atualizar docs/ ao fazer mudanças
   - ✅ Sempre adicionar comentários em código complexo
   - ✅ Sempre atualizar CHANGELOG.md
   - ✅ Sempre criar README se adicionar package novo

3. **Validar antes de mudar**
   - ✅ Sempre ler arquivo antes de modificar
   - ✅ Sempre consultar Context7 para APIs novas
   - ✅ Sempre verificar schema no Supabase
   - ✅ Sempre testar com Puppeteer após implementar

4. **Seguir estrutura do projeto**
   ```
   apps/          → Next.js apps (admin, widget)
   packages/      → Shared packages
   docs/          → Documentation
   scripts/       → Utility scripts
   supabase/      → DB migrations
   ```

5. **Usar MCPs apropriadamente**
   - ✅ Sempre consultar mcp.json primeiro
   - ✅ Sempre usar Filesystem para arquivos
   - ✅ Sempre usar Github para commits
   - ✅ Sempre usar Memory para decisões importantes

---

## 🎨 PADRÕES DE CÓDIGO

### **TypeScript:**
```typescript
// ✅ BOM
interface User {
  id: string;
  name: string;
  email: string;
}

async function getUser(id: string): Promise<User> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[getUser] Error:', error);
    throw error;
  }
}

// ❌ RUIM
function getUser(id: any): any {
  const data = supabase.from('users').select('*').eq('id', id).single();
  return data;
}
```

### **React Components:**
```typescript
// ✅ BOM
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-[#FFED00] px-4 py-2 rounded hover:opacity-90"
    >
      {label}
    </button>
  );
}

// ❌ RUIM
export function Button(props: any) {
  return <button onClick={props.onClick}>{props.label}</button>;
}
```

### **Logging:**
```typescript
// ✅ BOM
console.log('✅ [Analytics] Metrics loaded successfully');
console.error('❌ [Analytics] Failed to load:', error);
console.warn('⚠️ [Analytics] Cache expired, refetching...');

// ❌ RUIM
console.log('success');
console.log(error);
```

---

## 🔐 SEGURANÇA

### **Supabase MCP:**
- **✅ PERMITIDO:** SELECT queries (read), INSERT com validação, UPDATE campos específicos
- **⚠️ REQUER APROVAÇÃO:** UPDATE dados críticos, DELETE qualquer coisa
- **❌ PROIBIDO:** DROP tables, TRUNCATE, ALTER schema sem migration

### **Filesystem MCP:**
- **✅ PERMITIDO:** Criar arquivos em /docs, /apps, /packages, Ler qualquer arquivo, Modificar código
- **❌ PROIBIDO:** Modificar .env (apenas ler), Deletar node_modules, Modificar .git/, Editar arquivos de sistema

---

## 📊 CHECKLIST PARA CADA TASK

### Antes de começar:
- [ ] Consultei mcp.json para ver MCPs disponíveis
- [ ] Li Memory MCP para contexto anterior
- [ ] Consultei Context7 se usar tech nova
- [ ] Li estrutura do projeto com Filesystem
- [ ] Criei plano com Sequential Thinking (se complexo)

### Durante implementação:
- [ ] Segui estrutura de pastas do projeto
- [ ] Usei TypeScript tipado (zero `any`)
- [ ] Adicionei error handling em toda função assíncrona
- [ ] Adicionei logs com formato padrão [Package] Message
- [ ] Consultei Supabase MCP para validar queries

### Após implementar:
- [ ] Testei com Puppeteer MCP
- [ ] Criei/atualizei documentação em /docs
- [ ] Atualizei CHANGELOG.md
- [ ] Salvei decisões no Memory MCP
- [ ] Fiz commit com Github MCP
- [ ] Fechei issue relacionada

### Validação final:
- [ ] Zero erros no console
- [ ] Zero warnings do TypeScript
- [ ] Todas as funcionalidades testadas
- [ ] Código está limpo e organizado
- [ ] Documentação está completa

---

## 🆘 QUANDO EM DÚVIDA

1. **Pergunte antes de fazer** - Melhor confirmar do que quebrar
2. **Consulte a documentação** - Sempre tem resposta lá
3. **Use Sequential Thinking** - Para problemas complexos
4. **Leia código existente** - Veja como foi feito antes
5. **Teste antes de commitar** - SEMPRE

---

**Versão:** 1.0
**Mantido por:** Claude Code + Human
