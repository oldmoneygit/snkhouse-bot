# 🚀 Setup do Projeto SNKHOUSE Bot

Este documento contém as instruções para configurar o sistema de automação completo do projeto.

## ✅ O que já foi criado automaticamente

- ✅ Estrutura de pastas completa
- ✅ 4 GitHub Actions workflows
- ✅ 2 Issue templates
- ✅ 1 PR template
- ✅ Arquivos de configuração (.gitignore, package.json, etc)
- ✅ CHANGELOG.md e LICENSE

## 🔧 Próximos passos manuais (necessários)

### PASSO 1: Commit e Push (2min)
```bash
git add .
git commit -m "feat: setup completo com automação GitHub Projects"
git push origin main
```

### PASSO 2: Ativar GitHub Actions (1min)
1. Ir em: https://github.com/oldmoneygit/snkhouse-bot/settings/actions
2. Em "Workflow permissions" → selecionar "Read and write permissions"
3. Clicar em "Save"

### PASSO 3: Criar Labels (5min)
Execute todos estes comandos de uma vez:

```bash
gh label create "🔴 high-priority" --color "d73a4a" --repo oldmoneygit/snkhouse-bot
gh label create "🟡 medium-priority" --color "fbca04" --repo oldmoneygit/snkhouse-bot
gh label create "🟢 low-priority" --color "0e8a16" --repo oldmoneygit/snkhouse-bot
gh label create "✨ feature" --color "a2eeef" --repo oldmoneygit/snkhouse-bot
gh label create "🐛 bug" --color "d73a4a" --repo oldmoneygit/snkhouse-bot
gh label create "🔧 improvement" --color "fbca04" --repo oldmoneygit/snkhouse-bot
gh label create "📚 documentation" --color "0075ca" --repo oldmoneygit/snkhouse-bot
gh label create "🎨 frontend" --color "e99695" --repo oldmoneygit/snkhouse-bot
gh label create "⚙️ backend" --color "5319e7" --repo oldmoneygit/snkhouse-bot
gh label create "🗄️ database" --color "bfd4f2" --repo oldmoneygit/snkhouse-bot
gh label create "🤖 ai" --color "7057ff" --repo oldmoneygit/snkhouse-bot
gh label create "💬 whatsapp" --color "25d366" --repo oldmoneygit/snkhouse-bot
gh label create "🛒 integration" --color "fef2c0" --repo oldmoneygit/snkhouse-bot
gh label create "🔐 security" --color "d93f0b" --repo oldmoneygit/snkhouse-bot
gh label create "🚀 deployment" --color "0052cc" --repo oldmoneygit/snkhouse-bot
gh label create "📅 week-1" --color "c2e0c6" --repo oldmoneygit/snkhouse-bot
gh label create "📅 week-2" --color "bfdadc" --repo oldmoneygit/snkhouse-bot
gh label create "📅 week-3" --color "f9d0c4" --repo oldmoneygit/snkhouse-bot
gh label create "📊 summary" --color "d4c5f9" --repo oldmoneygit/snkhouse-bot
gh label create "📋 triage" --color "ffffff" --repo oldmoneygit/snkhouse-bot
gh label create "⚠️ blocker" --color "b60205" --repo oldmoneygit/snkhouse-bot
gh label create "automated" --color "ededed" --repo oldmoneygit/snkhouse-bot
```

## 🎉 Após completar os 3 passos

Você terá:
- ✅ GitHub Actions rodando automaticamente
- ✅ Labels criadas
- ✅ Issue templates prontos
- ✅ PR template pronto
- ✅ Estrutura de pastas completa
- ✅ Arquivos de configuração prontos

## 📋 Próximo passo

Após completar a configuração, o próximo passo é criar as 25 issues do roadmap usando os templates criados.

## 🔄 Como funciona a automação

### GitHub Actions Workflows:
1. **project-automation.yml**: Gerencia automaticamente o GitHub Projects
2. **roadmap-sync.yml**: Atualiza progresso do roadmap a cada 6 horas
3. **daily-summary.yml**: Cria resumo diário às 21h
4. **auto-label.yml**: Aplica labels automaticamente baseado no conteúdo

### Issue Templates:
- **feature.yml**: Para solicitar novas funcionalidades
- **bug.yml**: Para reportar bugs

### PR Template:
- Template padronizado para pull requests

## 📊 Monitoramento

- Acesse a aba "Actions" no GitHub para ver os workflows rodando
- Issues serão automaticamente movidas entre colunas do projeto
- Relatórios diários serão criados automaticamente
- Progresso será atualizado no README automaticamente

---

*Sistema de automação criado com ❤️ para o projeto SNKHOUSE Bot*
