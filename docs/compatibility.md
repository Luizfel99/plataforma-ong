# Compatibilidade

Testes realizados com Playwright (headless). Resumo de status e erros de console.

## Chromium

- /  status: 200
- /projetos.html  status: 200
- /doacoes.html  status: 200
- /contato.html  status: 200

## Firefox

- /  status: 200
- /projetos.html  status: 200
- /doacoes.html  status: 200
- /contato.html  status: 200

## WebKit

- /  status: 200
- /projetos.html  status: 200
- /doacoes.html  status: 200
- /contato.html  status: 200

## Edge (msedge)

 - /  status: error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/
Call log:
[2m  - navigating to "http://127.0.0.1:4000/", waiting until "networkidle"[22m

 - /projetos.html  status: error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/projetos.html
Call log:
[2m  - navigating to "http://127.0.0.1:4000/projetos.html", waiting until "networkidle"[22m

 - /doacoes.html  status: error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/doacoes.html
Call log:
[2m  - navigating to "http://127.0.0.1:4000/doacoes.html", waiting until "networkidle"[22m

 - /contato.html  status: error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/contato.html
Call log:
[2m  - navigating to "http://127.0.0.1:4000/contato.html", waiting until "networkidle"[22m


## Edge (msedge)

- /  status: 200
- /projetos.html  status: 200
- /doacoes.html  status: 200
- /contato.html  status: 200
