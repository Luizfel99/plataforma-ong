# Design System — Visão geral

Este repositório contém uma implementação leve de um design system para a Plataforma ONG.

Principais partes:
- Tokens: `src/styles/_tokens.css` (cores, tipografia, espaçamentos, radii, breakpoints)
- Tipografia: `src/styles/_typography.css` (escala e regras base)
- Componentes: `src/styles/_components.css` (botões, cards, badges, formulários)
- Comportamento: `assets/js/site.js` (algumas interações opt-in)
- Build: `postcss` (entrada: `src/styles/main.css`, saída: `dist/styles.css`)

Como usar:
1. Build de produção: `npm run build:css:prod` — gera `dist/styles.css`.
2. Incluir em páginas: `<link rel="stylesheet" href="/dist/styles.css" />`.

Padrões de interação (resumo):
- Foco visível: todos os componentes relevantes têm `:focus-visible` com contraste.
- Estados de formulário: `.is-valid` / `.is-invalid` e mensagens com `.field-msg.ok` ou `.field-msg.error`.
- Botões: animações reduzidas quando o usuário prefere `prefers-reduced-motion`.

Manutenção:
- Adicionar componentes em `src/styles/` como arquivos `_nome.css` e importar em `src/styles/main.css`.
- Atualizar tokens em `_tokens.css` para alterar paleta globalmente.
