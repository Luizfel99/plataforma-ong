# Plataforma ONG — Como disponibilizar o site

Visite a versão publicada: https://Luizfel99.github.io/plataforma-ong/

[![Website status](https://img.shields.io/website?down_color=red&down_message=down&up_color=brightgreen&up_message=up&url=https%3A%2F%2FLuizfel99.github.io%2Fplataforma-ong%2F)](https://Luizfel99.github.io/plataforma-ong/)

Este repositório contém um site estático (HTML/CSS/JS). Abaixo há instruções para publicar o site (deploy) e para rodar localmente em Windows, macOS e Linux.

Opções rápidas de deploy

- GitHub Pages (recomendado para sites estáticos)
- Netlify / Vercel (simples e com CI/CD)
- Ngrok / LocalTunnel (túnel temporário para demonstrações)

Obs.: já adicionei um workflow GitHub Actions (`.github/workflows/deploy_pages.yml`) que publica o site automaticamente quando você der push na branch `main`.

Como rodar localmente (passo a passo)

Windows (PowerShell)

```powershell
cd 'C:\Users\luizf\OneDrive\Desktop\plataforma-ong'
# iniciar em foreground (ver logs):
.\scripts\start_server_port3000_console.ps1

# iniciar e abrir o navegador automaticamente (press Enter para parar):
.\scripts\start_server_and_open.ps1
```

macOS / Linux (bash)

```bash
cd ~/Desktop/plataforma-ong
# tornar executável e rodar
chmod +x scripts/start_server_and_open.sh
./scripts/start_server_and_open.sh
```

Parando o servidor (Windows PowerShell)

```powershell
# Pare por PID (substitua <PID> pelo número mostrado)
Stop-Process -Id <PID> -Force

# Ou pare todos os processos node (use com cuidado)
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

Deploy rápido com ngrok (tempo limitado)

```powershell
ngrok http 3000
```

Opções de publicação

1) GitHub Pages

 - Faça push para `main` no GitHub; o workflow irá publicar automaticamente.
 - O site ficará em: `https://<seu-usuario>.github.io/<seu-repo>/` (no seu caso: `https://Luizfel99.github.io/plataforma-ong/`).

2) Netlify

 - Crie conta em netlify.com e arraste a pasta do projeto para publicar.

3) Ngrok

 - Use para demonstrações temporárias (a URL expira quando o túnel fecha).

Arquivos importantes adicionados

- `.github/workflows/deploy_pages.yml` — workflow que publica para GitHub Pages ao dar push em `main`.
