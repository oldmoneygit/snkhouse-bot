# =====================================================
# SNKHOUSE BOT - MCP SETUP SCRIPT
# =====================================================
# Este script configura os servidores MCP para Claude Desktop
# Autor: Claude Code
# Data: 2025-01-13
# =====================================================

Write-Host "🔌 Configurando Model Context Protocol Servers..." -ForegroundColor Cyan
Write-Host ""

# Detectar diretório de configuração do Claude Desktop
$claudeConfigDir = "$env:APPDATA\Claude"
$configFile = "$claudeConfigDir\claude_desktop_config.json"

Write-Host "📁 Verificando diretório de configuração..." -ForegroundColor Yellow
Write-Host "   Localização: $claudeConfigDir"

# Criar diretório se não existir
if (-not (Test-Path $claudeConfigDir)) {
    Write-Host "   ⚠️  Diretório não encontrado. Criando..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $claudeConfigDir -Force | Out-Null
    Write-Host "   ✅ Diretório criado" -ForegroundColor Green
} else {
    Write-Host "   ✅ Diretório encontrado" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Verificando arquivo de configuração..." -ForegroundColor Yellow

# Backup do arquivo existente se houver
if (Test-Path $configFile) {
    $backupFile = "$configFile.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Write-Host "   ⚠️  Arquivo existente encontrado. Criando backup..." -ForegroundColor Yellow
    Copy-Item $configFile $backupFile
    Write-Host "   ✅ Backup criado: $backupFile" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔧 Configurando servidores MCP..." -ForegroundColor Cyan

# Criar configuração MCP
$projectPath = (Get-Location).Path
$projectPathEscaped = $projectPath -replace '\\', '\\'

$config = @{
    mcpServers = @{
        context7 = @{
            command = "npx"
            args = @("-y", "@upstash/context7-mcp")
        }
        filesystem = @{
            command = "npx"
            args = @(
                "-y",
                "@modelcontextprotocol/server-filesystem",
                $projectPath
            )
        }
        supabase = @{
            transport = "http"
            url = "https://mcp.supabase.com/mcp?project_ref=czueuxqhmifgofuflscg"
        }
    }
    globalShortcut = "Ctrl+Space"
}

# Converter para JSON e salvar
$jsonConfig = $config | ConvertTo-Json -Depth 10
$jsonConfig | Out-File -FilePath $configFile -Encoding UTF8

Write-Host ""
Write-Host "✅ Configuração salva em: $configFile" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Servidores configurados:" -ForegroundColor Cyan
Write-Host "   1. Context7      - Documentação atualizada de bibliotecas" -ForegroundColor White
Write-Host "   2. Filesystem    - Operações seguras de arquivos" -ForegroundColor White
Write-Host "   3. Supabase      - Integração com banco de dados" -ForegroundColor White
Write-Host ""
Write-Host "🔄 Próximos passos:" -ForegroundColor Yellow
Write-Host "   1. Feche Claude Desktop completamente" -ForegroundColor White
Write-Host "   2. Abra Claude Desktop novamente" -ForegroundColor White
Write-Host "   3. Verifique se os servidores MCP estão ativos" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Para testar, use estes comandos no Claude:" -ForegroundColor Cyan
Write-Host "   - 'Liste todos os arquivos TypeScript no diretório packages/'" -ForegroundColor White
Write-Host "   - 'Mostre o schema da tabela messages no Supabase'" -ForegroundColor White
Write-Host "   - 'Me mostre exemplos atualizados de React 19 hooks'" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentação completa: docs/MCP_SETUP.md" -ForegroundColor White
Write-Host ""
Write-Host "✨ Setup concluído com sucesso!" -ForegroundColor Green
