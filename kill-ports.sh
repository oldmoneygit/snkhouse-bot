#!/bin/bash
# Script para matar processos nas portas do projeto (Linux/Mac)
# Execute com: ./kill-ports.sh

echo "🔍 Procurando processos nas portas..."
echo ""

# Função para matar processo em uma porta
kill_port() {
    PORT=$1
    PID=$(lsof -ti:$PORT)
    
    if [ ! -z "$PID" ]; then
        echo "✅ Encontrado processo na porta $PORT (PID: $PID)"
        kill -9 $PID
        echo "   ✓ Processo na porta $PORT encerrado!"
    else
        echo "ℹ️  Porta $PORT está livre"
    fi
}

echo "Verificando portas do projeto..."
echo ""

kill_port 3001  # Admin Dashboard
kill_port 3002  # Widget

echo ""
echo "✅ Portas liberadas!"
echo ""
echo "Agora você pode executar: pnpm dev"

