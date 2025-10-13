# MCP Setup Script for Claude Desktop
$ErrorActionPreference = "Stop"

$claudeDir = Join-Path $env:APPDATA "Claude"
$configFile = Join-Path $claudeDir "claude_desktop_config.json"
$projectPath = Get-Location | Select-Object -ExpandProperty Path

Write-Output "Configurando MCPs para Claude Desktop..."
Write-Output "Diretorio: $claudeDir"
Write-Output "Arquivo: $configFile"

# Criar diretorio se necessario
if (-not (Test-Path $claudeDir)) {
    New-Item -ItemType Directory -Path $claudeDir -Force | Out-Null
    Write-Output "Diretorio criado"
}

# Backup do arquivo existente
if (Test-Path $configFile) {
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $backupFile = "$configFile.backup-$timestamp"
    Copy-Item $configFile $backupFile
    Write-Output "Backup criado: $backupFile"
}

# Criar JSON manualmente para evitar problemas de encoding
$json = @"
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
        "$($projectPath -replace '\\', '\\')"
      ]
    },
    "supabase": {
      "transport": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=czueuxqhmifgofuflscg"
    }
  },
  "globalShortcut": "Ctrl+Space"
}
"@

# Salvar arquivo
[System.IO.File]::WriteAllText($configFile, $json, [System.Text.Encoding]::UTF8)

Write-Output ""
Write-Output "SUCESSO! Configuracao salva em: $configFile"
Write-Output ""
Write-Output "Servidores MCP configurados:"
Write-Output "  1. Context7 - Documentacao atualizada"
Write-Output "  2. Filesystem - Operacoes de arquivos"
Write-Output "  3. Supabase - Banco de dados"
Write-Output ""
Write-Output "Proximos passos:"
Write-Output "  1. Feche Claude Desktop completamente"
Write-Output "  2. Abra Claude Desktop novamente"
Write-Output "  3. Teste com: 'Liste arquivos em packages/'"
Write-Output ""
