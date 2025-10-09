# Script para matar processos nas portas do projeto
# Execute com: .\kill-ports.ps1

Write-Host "🔍 Procurando processos nas portas..." -ForegroundColor Yellow
Write-Host ""

# Função para matar processo em uma porta
function Kill-PortProcess {
    param (
        [int]$Port
    )
    
    $process = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    
    if ($process) {
        Write-Host "✅ Encontrado processo na porta $Port (PID: $process)" -ForegroundColor Green
        Stop-Process -Id $process -Force
        Write-Host "   ✓ Processo na porta $Port encerrado!" -ForegroundColor Cyan
    } else {
        Write-Host "ℹ️  Porta $Port está livre" -ForegroundColor Gray
    }
}

# Matar processos nas portas do projeto
Write-Host "Verificando portas do projeto..." -ForegroundColor Yellow
Write-Host ""

Kill-PortProcess -Port 3001  # Admin Dashboard
Kill-PortProcess -Port 3002  # Widget

Write-Host ""
Write-Host "✅ Portas liberadas!" -ForegroundColor Green
Write-Host ""
Write-Host "Agora você pode executar: pnpm dev" -ForegroundColor Cyan

