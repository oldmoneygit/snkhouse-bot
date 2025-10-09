#!/usr/bin/env node

/**
 * Script multiplataforma para matar processos nas portas do projeto
 * Funciona em Windows, Linux e Mac
 */

const { execSync } = require('child_process');
const os = require('os');

const PORTS = [3001, 3002]; // Admin, Widget

console.log('🔍 Procurando processos nas portas...\n');

function killPortWindows(port) {
  try {
    // Encontra o PID usando netstat
    const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf-8' });
    const lines = result.split('\n');
    
    const pids = new Set();
    lines.forEach(line => {
      const match = line.trim().match(/LISTENING\s+(\d+)/);
      if (match) {
        pids.add(match[1]);
      }
    });

    if (pids.size > 0) {
      pids.forEach(pid => {
        console.log(`✅ Encontrado processo na porta ${port} (PID: ${pid})`);
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          console.log(`   ✓ Processo na porta ${port} encerrado!`);
        } catch (e) {
          console.log(`   ⚠️  Não foi possível encerrar o processo ${pid}`);
        }
      });
    } else {
      console.log(`ℹ️  Porta ${port} está livre`);
    }
  } catch (error) {
    console.log(`ℹ️  Porta ${port} está livre`);
  }
}

function killPortUnix(port) {
  try {
    const result = execSync(`lsof -ti:${port}`, { encoding: 'utf-8' });
    const pids = result.trim().split('\n').filter(Boolean);
    
    if (pids.length > 0) {
      pids.forEach(pid => {
        console.log(`✅ Encontrado processo na porta ${port} (PID: ${pid})`);
        try {
          execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
          console.log(`   ✓ Processo na porta ${port} encerrado!`);
        } catch (e) {
          console.log(`   ⚠️  Não foi possível encerrar o processo ${pid}`);
        }
      });
    } else {
      console.log(`ℹ️  Porta ${port} está livre`);
    }
  } catch (error) {
    console.log(`ℹ️  Porta ${port} está livre`);
  }
}

function killPort(port) {
  if (os.platform() === 'win32') {
    killPortWindows(port);
  } else {
    killPortUnix(port);
  }
}

console.log('Verificando portas do projeto...\n');

PORTS.forEach(port => {
  killPort(port);
});

console.log('\n✅ Portas liberadas!\n');
console.log('Agora você pode executar: pnpm dev\n');

