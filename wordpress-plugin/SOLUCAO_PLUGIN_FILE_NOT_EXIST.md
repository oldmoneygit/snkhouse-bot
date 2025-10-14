# 🔧 Solução: "Plugin file does not exist"

## 🐛 O Problema

Você fez upload do `snkhouse-widget.zip` no WordPress, mas ao tentar ativar apareceu:
```
Plugin file does not exist.
This message was triggered by WordPress Core.
```

## ✅ SOLUÇÃO 1: Upload via FTP (MAIS CONFIÁVEL)

### Passo a Passo:

#### 1️⃣ Descompactar o ZIP localmente

No Windows:
1. Vá em: `C:\Users\PC\Desktop\Ecossistema_Atendimento_SNKHOUSE\wordpress-plugin\`
2. Clique com botão direito em `snkhouse-widget.zip`
3. Escolha **"Extrair Aqui"** ou **"Extrair para snkhouse-widget\"**
4. Você terá uma pasta: `snkhouse-widget\` com os arquivos dentro

#### 2️⃣ Conectar via FTP

Use **FileZilla**, **WinSCP** ou o **Gerenciador de Arquivos do cPanel**.

**Credenciais FTP** (você deve ter):
- Host: `ftp.snkhouse.com` (ou IP do servidor)
- Usuário: [seu usuário FTP]
- Senha: [sua senha FTP]
- Porta: 21

#### 3️⃣ Navegar até a pasta de plugins

No servidor, navegue até:
```
/public_html/wp-content/plugins/
```

Ou em alguns servidores:
```
/home/snkhouse/public_html/wp-content/plugins/
```

#### 4️⃣ Fazer Upload da Pasta

1. **Arraste** a pasta `snkhouse-widget` (já descompactada) para dentro de `plugins/`
2. Aguarde o upload completar (2 arquivos, ~6 KB, menos de 5 segundos)

Estrutura final no servidor:
```
/wp-content/plugins/snkhouse-widget/
├── snkhouse-widget.php
└── readme.txt
```

#### 5️⃣ Verificar Permissões

No FTP, clique com botão direito na pasta `snkhouse-widget/` e verifique:
- **Pasta**: 755 (rwxr-xr-x)
- **Arquivos**: 644 (rw-r--r--)

Se estiverem diferentes, altere para essas permissões.

#### 6️⃣ Ativar no WordPress

1. Entre no WordPress Admin: `https://snkhouse.com/wp-admin`
2. Vá em **Plugins → Plugins Instalados**
3. Procure por **"SNKHOUSE Widget"**
4. Clique em **"Activar"**

✅ **Deve funcionar!**

---

## ✅ SOLUÇÃO 2: Via cPanel File Manager

Se tiver acesso ao **cPanel**:

#### 1️⃣ Acessar File Manager

1. Entre no cPanel: `https://snkhouse.com:2083` (ou outro endereço)
2. Clique em **"Administrador de archivos"** ou **"File Manager"**

#### 2️⃣ Navegar até plugins

1. Clique em `public_html/`
2. Clique em `wp-content/`
3. Clique em `plugins/`

#### 3️⃣ Upload do ZIP

1. Clique no botão **"Upload"** (topo da página)
2. Arraste o arquivo `snkhouse-widget.zip` para a área de upload
3. Aguarde completar

#### 4️⃣ Extrair o ZIP no servidor

1. Volte para a pasta `plugins/`
2. Clique com botão direito em `snkhouse-widget.zip`
3. Escolha **"Extract"** ou **"Extrair"**
4. Confirme a extração
5. Delete o arquivo `snkhouse-widget.zip` (opcional)

#### 5️⃣ Verificar estrutura

Deve ficar assim:
```
plugins/
└── snkhouse-widget/
    ├── snkhouse-widget.php
    └── readme.txt
```

#### 6️⃣ Ativar no WordPress

1. Entre no WordPress Admin
2. **Plugins → Plugins Instalados**
3. **"SNKHOUSE Widget"** → **"Activar"**

✅ **Funcionou!**

---

## ✅ SOLUÇÃO 3: Recriar o ZIP (se outros métodos falharem)

Às vezes o problema é o formato do ZIP. Vou criar um novo:

### Via PowerShell (já estou fazendo):

```powershell
cd wordpress-plugin
Remove-Item snkhouse-widget.zip -Force
Compress-Archive -Path snkhouse-widget/* -DestinationPath snkhouse-widget-novo.zip
```

Depois tente fazer upload do **`snkhouse-widget-novo.zip`**

---

## 🔍 DIAGNÓSTICO: Por que isso aconteceu?

Possíveis causas:

### 1. Estrutura do ZIP incorreta ❌
**Problema**: ZIP criado com pasta raiz extra
```
snkhouse-widget.zip
└── snkhouse-widget/
    └── snkhouse-widget/  ← PASTA DUPLICADA
        ├── snkhouse-widget.php
        └── readme.txt
```

**Correto**:
```
snkhouse-widget.zip
└── snkhouse-widget/
    ├── snkhouse-widget.php
    └── readme.txt
```

### 2. Permissões no servidor ❌
WordPress não conseguiu escrever na pasta `/wp-content/plugins/`

### 3. Cache do WordPress ❌
WordPress tinha o plugin em cache mas os arquivos não existiam

### 4. Plugin incompleto ❌
Upload foi interrompido e só subiu parte dos arquivos

---

## 🧪 VERIFICAR SE FUNCIONOU

Após instalar via FTP:

### 1. WordPress Admin
```
Plugins → Plugins Instalados
```

Deve aparecer:
```
┌─────────────────────────────────────────┐
│ SNKHOUSE Widget                         │
│ Widget de atendimento con IA...         │
│ Version 1.0.0 | By SNKHOUSE             │
│ [Activar] [Editar] [Eliminar]           │
└─────────────────────────────────────────┘
```

### 2. No Site
1. Abra `https://snkhouse.com` em aba anônima
2. Widget deve aparecer no canto inferior direito

### 3. Console
Pressione F12 → Console:
```
🚀 SNKHOUSE Widget Context Awareness - Iniciando
✅ Widget iframe carregado
```

---

## 📁 Arquivos para Upload via FTP

**O que você precisa**:

📂 Pasta: `snkhouse-widget/` (descompactada do ZIP)

Contém:
- `snkhouse-widget.php` (3 KB)
- `readme.txt` (2 KB)

**Destino no servidor**:
```
/public_html/wp-content/plugins/snkhouse-widget/
```

---

## 🚨 IMPORTANTE

**Depois de instalar via FTP**, você NÃO precisa fazer upload via WordPress Admin.

O plugin já está instalado, basta:
1. Ir em **Plugins → Plugins Instalados**
2. Clicar em **"Activar"** no SNKHOUSE Widget

---

## ✅ CHECKLIST

Siga esta ordem:

- [ ] Descompactar `snkhouse-widget.zip` localmente
- [ ] Conectar via FTP ou cPanel
- [ ] Navegar até `/wp-content/plugins/`
- [ ] Upload da pasta `snkhouse-widget/`
- [ ] Verificar estrutura: `plugins/snkhouse-widget/snkhouse-widget.php` existe
- [ ] Verificar permissões: pasta 755, arquivos 644
- [ ] WordPress Admin → Plugins → Plugins Instalados
- [ ] Procurar "SNKHOUSE Widget"
- [ ] Clicar em "Activar"
- [ ] Testar no site (aba anônima)
- [ ] Verificar console (F12)

---

## 📞 Ainda não funcionou?

Me envie:

1. **Print da estrutura** no File Manager:
   - Caminho completo do arquivo `snkhouse-widget.php`

2. **Print do erro** (se houver novo erro)

3. **Console do navegador** (F12):
   - Qualquer erro em vermelho

---

**🔧 Recomendação**: Use **SOLUÇÃO 1 (FTP)** - é o método mais confiável e evita problemas com upload via WordPress.

Quer que eu te guie pelo processo via FTP agora?
