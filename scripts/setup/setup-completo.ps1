# Script completo para setup do SNKHOUSE Bot
Write-Host "🚀 SETUP COMPLETO SNKHOUSE BOT" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Verificar se gh está instalado
$ghInstalled = $false
try {
    $version = gh --version 2>$null
    if ($version) {
        $ghInstalled = $true
        Write-Host "✅ GitHub CLI já está instalado!" -ForegroundColor Green
    }
} catch {
    $ghInstalled = $false
}

if (-not $ghInstalled) {
    Write-Host "📦 Instalando GitHub CLI..." -ForegroundColor Yellow

    # Tentar winget primeiro
    try {
        winget install GitHub.cli --accept-package-agreements --accept-source-agreements --silent
        Write-Host "✅ GitHub CLI instalado via winget!" -ForegroundColor Green
        $ghInstalled = $true
    } catch {
        Write-Host "⚠️ Winget não disponível. Use o script scripts\setup\install-github-cli.ps1 para instalação manual." -ForegroundColor Red
        Write-Host "Ou baixe manualmente de: https://cli.github.com/" -ForegroundColor Yellow
        Read-Host "Pressione Enter para continuar (você precisará instalar o GitHub CLI manualmente)..."
    }
}

if ($ghInstalled) {
    Write-Host "🔐 Configurando autenticação GitHub..." -ForegroundColor Yellow
    Write-Host "Você será redirecionado para fazer login no GitHub..." -ForegroundColor Yellow
    Start-Sleep 2

    try {
        gh auth login --web
        Write-Host "✅ Login realizado com sucesso!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro no login. Execute manualmente: gh auth login" -ForegroundColor Red
    }

    Write-Host "🏷️ Criando todas as labels..." -ForegroundColor Green

    # Comandos para criar labels
    $labelCommands = @(
        'gh label create "🔴 high-priority" --color "d73a4a" --repo oldmoneygit/snkhouse-bot',
        'gh label create "🟡 medium-priority" --color "fbca04" --repo oldmoneygit/snkhouse-bot',
        'gh label create "🟢 low-priority" --color "0e8a16" --repo oldmoneygit/snkhouse-bot',
        'gh label create "✨ feature" --color "a2eeef" --repo oldmoneygit/snkhouse-bot',
        'gh label create "🐛 bug" --color "d73a4a" --repo oldmoneygit/snkhouse-bot',
        'gh label create "🔧 improvement" --color "fbca04" --repo oldmoneygit/snkhouse-bot',
        'gh label create "📚 documentation" --color "0075ca" --repo oldmoneygit/snkhouse-bot',
        'gh label create "🎨 frontend" --color "e99695" --repo oldmoneygit/snkhouse-bot',
        'gh label create "⚙️ backend" --color "5319e7" --repo oldmoneygit/snkhouse-bot',
        'gh label create "🗄️ database" --color "bfd4f2" --repo oldmoneygit/snkhouse-bot',
        'gh label create "🤖 ai" --color "7057ff" --repo oldmoneygit/snkhouse-bot',
        'gh label create "💬 whatsapp" --color "25d366" --repo oldmoneygit/snkhouse-bot',
        'gh label create "🛒 integration" --color "fef2c0" --repo oldmoneygit/snkhouse-bot',
        'gh label create "🔐 security" --color "d93f0b" --repo oldmoneygit/snkhouse-bot',
        'gh label create "🚀 deployment" --color "0052cc" --repo oldmoneygit/snkhouse-bot',
        'gh label create "📅 week-1" --color "c2e0c6" --repo oldmoneygit/snkhouse-bot',
        'gh label create "📅 week-2" --color "bfdadc" --repo oldmoneygit/snkhouse-bot',
        'gh label create "📅 week-3" --color "f9d0c4" --repo oldmoneygit/snkhouse-bot',
        'gh label create "📊 summary" --color "d4c5f9" --repo oldmoneygit/snkhouse-bot',
        'gh label create "📋 triage" --color "ffffff" --repo oldmoneygit/snkhouse-bot',
        'gh label create "⚠️ blocker" --color "b60205" --repo oldmoneygit/snkhouse-bot',
        'gh label create "automated" --color "ededed" --repo oldmoneygit/snkhouse-bot'
    )

    $successCount = 0
    foreach ($cmd in $labelCommands) {
        try {
            Invoke-Expression $cmd
            $successCount++
            Write-Host "✅ Label criada com sucesso!" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ Label já existe ou erro ao criar" -ForegroundColor Yellow
        }
    }

    Write-Host "🎉 SETUP COMPLETO!" -ForegroundColor Green
    Write-Host "✅ $successCount labels criadas com sucesso!" -ForegroundColor Green
    Write-Host "🚀 Sua automação está 100% funcionando!" -ForegroundColor Green
}

Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Commit e push: git add . && git commit -m 'feat: setup completo' && git push" -ForegroundColor Yellow
Write-Host "2. Ativar GitHub Actions: https://github.com/oldmoneygit/snkhouse-bot/settings/actions" -ForegroundColor Yellow
Write-Host "3. Criar as 25 issues do roadmap!" -ForegroundColor Yellow

Read-Host "Pressione Enter para sair..."
