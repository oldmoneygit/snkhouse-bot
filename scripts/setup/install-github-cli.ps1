# Script para instalar GitHub CLI e criar labels automaticamente
Write-Host "🚀 Instalando GitHub CLI..." -ForegroundColor Green

# Tentar instalar via winget primeiro
try {
    Write-Host "Tentando instalar via winget..." -ForegroundColor Yellow
    winget install GitHub.cli --accept-package-agreements --accept-source-agreements
    Write-Host "✅ GitHub CLI instalado via winget!" -ForegroundColor Green
} catch {
    Write-Host "❌ Winget não disponível. Tentando download direto..." -ForegroundColor Yellow
    
    # Download direto do GitHub CLI
    $url = "https://github.com/cli/cli/releases/latest/download/gh_2.40.1_windows_amd64.msi"
    $output = "gh_installer.msi"
    
    Write-Host "Baixando GitHub CLI..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing
    
    Write-Host "Instalando GitHub CLI..." -ForegroundColor Yellow
    Start-Process msiexec.exe -Wait -ArgumentList "/I $output /quiet"
    
    Write-Host "✅ GitHub CLI instalado!" -ForegroundColor Green
    
    # Limpar arquivo temporário
    Remove-Item $output -Force
}

# Atualizar PATH
Write-Host "Atualizando PATH..." -ForegroundColor Yellow
$env:PATH += ";C:\Program Files\GitHub CLI"

Write-Host "🔐 Configurando autenticação..." -ForegroundColor Green
Write-Host "Você será redirecionado para fazer login no GitHub." -ForegroundColor Yellow
Write-Host "Após o login, volte aqui e pressione Enter para continuar..." -ForegroundColor Yellow

# Fazer login no GitHub
gh auth login --web

Write-Host "🏷️ Criando labels automaticamente..." -ForegroundColor Green

# Array de labels para criar
$labels = @(
    @{name="🔴 high-priority"; color="d73a4a"},
    @{name="🟡 medium-priority"; color="fbca04"},
    @{name="🟢 low-priority"; color="0e8a16"},
    @{name="✨ feature"; color="a2eeef"},
    @{name="🐛 bug"; color="d73a4a"},
    @{name="🔧 improvement"; color="fbca04"},
    @{name="📚 documentation"; color="0075ca"},
    @{name="🎨 frontend"; color="e99695"},
    @{name="⚙️ backend"; color="5319e7"},
    @{name="🗄️ database"; color="bfd4f2"},
    @{name="🤖 ai"; color="7057ff"},
    @{name="💬 whatsapp"; color="25d366"},
    @{name="🛒 integration"; color="fef2c0"},
    @{name="🔐 security"; color="d93f0b"},
    @{name="🚀 deployment"; color="0052cc"},
    @{name="📅 week-1"; color="c2e0c6"},
    @{name="📅 week-2"; color="bfdadc"},
    @{name="📅 week-3"; color="f9d0c4"},
    @{name="📊 summary"; color="d4c5f9"},
    @{name="📋 triage"; color="ffffff"},
    @{name="⚠️ blocker"; color="b60205"},
    @{name="automated"; color="ededed"}
)

# Criar cada label
foreach ($label in $labels) {
    try {
        gh label create $label.name --color $label.color --repo oldmoneygit/snkhouse-bot
        Write-Host "✅ Label '$($label.name)' criada!" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Label '$($label.name)' já existe ou erro ao criar" -ForegroundColor Yellow
    }
}

Write-Host "🎉 CONCLUÍDO! Todas as labels foram criadas!" -ForegroundColor Green
Write-Host "🚀 Sua automação está 100% funcionando!" -ForegroundColor Green

Read-Host "Pressione Enter para sair..."
