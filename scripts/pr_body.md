- O que foi feito
  - Padronizei header e footer entre páginas.
  - Reestruturei o CSS (src/styles/*) e adicionei pipeline PostCSS; gerado dist/styles.css.
  - Corrigi botões e formulários (interceptação opt-in com data-demo="true").
  - Desativei carregamento automático do vídeo institucional.
  - Constrain social SVGs e corrigi overflow em formulários.
  - Adicionei documentação e evidências em docs/:
    - docs/screenshots/ — screenshots nas 5 viewports (index, projetos, doacoes, contato).
    - docs/performance.md — resumo Lighthouse (scores).
    - docs/compatibility.md — resultados Chromium/Firefox/WebKit/Edge.
    - docs/styleguide.md — paleta, tipografia, espaçamentos e tokens.
    - docs/reports/ — HTML completos do Lighthouse (evidência).

  1. npm ci
  2. npm run build:css:prod
  3. .\scripts\start_server_port3000.ps1 (ou com -Port 4000)
  4. Abrir http://127.0.0.1:4000 e checar Início / Projetos / Doações / Contato
  5. Conferir docs/screenshots/ para evidências visuais

- Locais de evidência rápida
  - Screenshots: docs/screenshots/
  - Lighthouse (resumo): docs/performance.md
  - Lighthouse (completo): docs/reports/*.html
  - Compatibilidade: docs/compatibility.md
  - Styleguide: docs/styleguide.md

- Checklist
  - [ ] Build/visual manual OK (dev)
  - [ ] Revisão UI/UX feita
  - [ ] Aprovação de QA/PO
