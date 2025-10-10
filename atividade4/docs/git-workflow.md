# 🌿 GIT WORKFLOW - ESTRATÉGIA GITFLOW

## 📋 Visão Geral

Este documento define a estratégia de **GitFlow** implementada no projeto Plataforma ONG, incluindo convenções de commits semânticos, gerenciamento de branches e processo de releases.

## 🌳 Estrutura de Branches

### Branches Principais

#### `main` (produção)
- **Propósito**: Código estável em produção
- **Proteção**: Apenas via Pull Request
- **Deploy**: Automático para produção
- **Versionamento**: Tags semânticas (v1.0.0, v1.1.0, etc.)

#### `develop` (desenvolvimento)
- **Propósito**: Integração contínua de features
- **Base para**: Feature branches
- **Merge para**: `main` via release branches

### Branches de Suporte

#### `feature/*` (funcionalidades)
```bash
# Nomenclatura
feature/atividade1-html-semantico
feature/atividade2-css-avancado
feature/atividade3-javascript-spa
feature/atividade4-deploy-acessibilidade

# Ciclo de vida
git checkout develop
git checkout -b feature/nome-da-feature
# desenvolvimento...
git push origin feature/nome-da-feature
# Pull Request para develop
```

#### `release/*` (preparação para produção)
```bash
# Nomenclatura
release/v1.0.0
release/v1.1.0

# Ciclo de vida
git checkout develop
git checkout -b release/v1.0.0
# ajustes finais, documentação...
git push origin release/v1.0.0
# Pull Request para main E develop
```

#### `hotfix/*` (correções urgentes)
```bash
# Nomenclatura
hotfix/correcao-critica

# Ciclo de vida
git checkout main
git checkout -b hotfix/correcao-critica
# correção...
git push origin hotfix/correcao-critica
# Pull Request para main E develop
```

## 📝 Convenções de Commits Semânticos

### Formato Padrão
```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

### Tipos de Commit

#### `feat` - Nova funcionalidade
```bash
feat(atividade1): adicionar estrutura HTML semântica
feat(atividade2): implementar sistema de grid CSS
feat(atividade3): criar sistema de validação de formulários
feat(atividade4): adicionar suporte a leitores de tela
```

#### `fix` - Correção de bug
```bash
fix(forms): corrigir validação de CPF
fix(css): resolver problema de responsividade
fix(js): corrigir erro de navegação SPA
```

#### `docs` - Documentação
```bash
docs(readme): atualizar instruções de instalação
docs(api): adicionar documentação de endpoints
docs(a11y): documentar recursos de acessibilidade
```

#### `style` - Formatação de código
```bash
style(css): formatar arquivo de estilos
style(js): corrigir indentação
```

#### `refactor` - Refatoração
```bash
refactor(components): melhorar estrutura de componentes
refactor(validators): otimizar sistema de validação
```

#### `test` - Testes
```bash
test(forms): adicionar testes de validação
test(a11y): implementar testes de acessibilidade
```

#### `chore` - Manutenção
```bash
chore(build): atualizar dependências
chore(config): configurar ambiente de desenvolvimento
```

### Escopos do Projeto
- `atividade1`: HTML semântico
- `atividade2`: CSS avançado
- `atividade3`: JavaScript SPA
- `atividade4`: Deploy e acessibilidade
- `forms`: Sistema de formulários
- `nav`: Navegação
- `a11y`: Acessibilidade
- `build`: Sistema de build
- `docs`: Documentação

## 🏷️ Versionamento Semântico

### Formato: `MAJOR.MINOR.PATCH`

#### MAJOR (1.0.0 → 2.0.0)
- Mudanças incompatíveis com versões anteriores
- Reestruturação completa da arquitetura
- Remoção de funcionalidades públicas

#### MINOR (1.0.0 → 1.1.0)
- Novas funcionalidades compatíveis
- Implementação de novas atividades
- Melhorias significativas

#### PATCH (1.0.0 → 1.0.1)
- Correções de bugs
- Pequenos ajustes
- Melhorias de performance

### Histórico de Releases Planejado

#### v0.1.0 - Atividade 1 (HTML Semântico)
```bash
git tag -a v0.1.0 -m "feat: implementar HTML semântico e estrutura base"
git push origin v0.1.0
```

#### v0.2.0 - Atividade 2 (CSS Avançado)
```bash
git tag -a v0.2.0 -m "feat: implementar sistema de design CSS avançado"
git push origin v0.2.0
```

#### v0.3.0 - Atividade 3 (JavaScript SPA)
```bash
git tag -a v0.3.0 -m "feat: implementar SPA com JavaScript avançado"
git push origin v0.3.0
```

#### v1.0.0 - Atividade 4 (Deploy Final)
```bash
git tag -a v1.0.0 -m "feat: implementar acessibilidade e deploy para produção"
git push origin v1.0.0
```

## 🔄 Fluxo de Trabalho

### 1. Desenvolvimento de Feature
```bash
# 1. Atualizar develop
git checkout develop
git pull origin develop

# 2. Criar feature branch
git checkout -b feature/nova-funcionalidade

# 3. Desenvolvimento com commits semânticos
git add .
git commit -m "feat(escopo): implementar nova funcionalidade"

# 4. Push da feature
git push origin feature/nova-funcionalidade

# 5. Criar Pull Request
# - Base: develop
# - Título: feat(escopo): implementar nova funcionalidade
# - Descrição detalhada
# - Labels apropriadas
# - Reviewers
```

### 2. Release para Produção
```bash
# 1. Criar release branch
git checkout develop
git checkout -b release/v1.0.0

# 2. Ajustes finais
git commit -m "chore(release): preparar v1.0.0"

# 3. Merge para main
# Pull Request: release/v1.0.0 → main

# 4. Criar tag
git checkout main
git tag -a v1.0.0 -m "chore(release): versão 1.0.0"
git push origin v1.0.0

# 5. Merge de volta para develop
# Pull Request: main → develop
```

### 3. Hotfix de Emergência
```bash
# 1. Criar hotfix branch
git checkout main
git checkout -b hotfix/correcao-urgente

# 2. Implementar correção
git commit -m "fix(bug): corrigir problema crítico"

# 3. Merge para main E develop
# Pull Request duplo

# 4. Nova tag patch
git tag -a v1.0.1 -m "fix: correção crítica"
```

## 📋 Pull Request Template

### Estrutura Padrão
```markdown
## 🎯 Objetivo
Breve descrição do objetivo do PR

## 📝 Mudanças
- [ ] Funcionalidade A implementada
- [ ] Bug B corrigido
- [ ] Documentação C atualizada

## 🧪 Testes
- [ ] Testes unitários passando
- [ ] Testes de integração passando
- [ ] Testes manuais realizados

## 📸 Screenshots
(Se aplicável)

## 🔗 Issues Relacionadas
Closes #123
Fixes #456

## ✅ Checklist
- [ ] Código revisado
- [ ] Documentação atualizada
- [ ] Testes adicionados
- [ ] Changelog atualizado
```

## 🏷️ Issues e Milestones

### Labels Padronizadas
- `enhancement`: Melhorias
- `bug`: Correções
- `documentation`: Documentação
- `accessibility`: Acessibilidade
- `performance`: Performance
- `security`: Segurança
- `help wanted`: Ajuda necessária
- `good first issue`: Para iniciantes

### Milestones por Atividade
- **Milestone 1**: Atividade 1 - HTML Semântico
- **Milestone 2**: Atividade 2 - CSS Avançado
- **Milestone 3**: Atividade 3 - JavaScript SPA
- **Milestone 4**: Atividade 4 - Deploy e Acessibilidade

## 🔧 Configuração Git

### Configuração Inicial
```bash
# Configurar usuário
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"

# Configurar editor padrão
git config --global core.editor "code --wait"

# Configurar merge tool
git config --global merge.tool vscode

# Configurar aliases úteis
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.lg "log --oneline --graph --decorate"
```

### Hooks Recomendados

#### Pre-commit Hook
```bash
#!/bin/sh
# Executar linting antes do commit
npm run lint
npm run test
```

#### Commit-msg Hook
```bash
#!/bin/sh
# Validar formato de commit semântico
npx commitlint --edit $1
```

## 📊 Métricas e Relatórios

### Relatórios Automáticos
- **Frequency**: Commits por desenvolvedor
- **Velocity**: Tempo médio de features
- **Quality**: Cobertura de testes
- **Stability**: Frequência de hotfixes

### Dashboard de Projeto
- Burndown charts
- Velocity tracking
- Issue resolution time
- Code review metrics

---

**Este workflow garante qualidade, rastreabilidade e colaboração eficiente no desenvolvimento da Plataforma ONG.**