# Entregáveis

Checklist final para esta atividade (status):

1) Arquivos CSS organizados
- Estrutura modular: `src/styles/` (OK)
- Documentação de componentes: `docs/components.md` (ADICIONADO)
- Guia de estilo visual: `docs/styleguide.md` (OK)
- Variáveis e tokens: `src/styles/_tokens.css` (OK)

2) Design system
- Biblioteca de componentes: `src/styles/_components.css` + `docs/components.md` (OK)
- Paleta de cores documentada: `docs/styleguide.md` (OK)
- Tipografia e espaçamentos: `docs/styleguide.md` (OK)
- Padrões de interação: `docs/design-system.md` (ADICIONADO)

3) Demonstrações responsivas
- Screenshots em diferentes dispositivos: `docs/screenshots/` (OK — 20 imagens capturadas)
- Testes de desempenho: `docs/performance.md` (OK)
- Relatório de compatibilidade: `docs/compatibility.md` (OK)

Arquivos extras úteis:
- `dist/styles.css` — build de produção
- `scripts/start_server_port3000.ps1` — helper para rodar servidor local
- `.github/workflows/pr-build.yml` — CI básico para PRs

Próximos passos (opcionais):
- Incluir Playwright checks no workflow para executar as capturas em CI.
- Gerar uma página de documentação HTML com exemplos interativos (storybook-like).
