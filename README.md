# Plataforma ONG — Como disponibilizar o site para sua professora
---

Visite o site publicado (GitHub Pages):

[![Website status](https://img.shields.io/website?down_color=red&down_message=down&up_color=brightgreen&up_message=up&url=https%3A%2F%2FLuizfel99.github.io%2Fplataforma-ong%2F)](https://Luizfel99.github.io/plataforma-ong/)

Comandos rápidos para rodar o servidor local (Windows PowerShell):

- Iniciar (em primeiro plano, logs visíveis):

```powershell
cd 'C:\Users\luizf\OneDrive\Desktop\plataforma-ong'
.
\scripts\start_server_port3000_console.ps1
```

- Parar (por PID ou nome):

```powershell

- GitHub Pages (gratuito) — publica direto do repositório GitHub. Bom para sites estáticos simples.
- Netlify / Vercel (gratuito para uso básico) — arrastar e soltar ou conectar ao repositório para deploy automático.
- Ngrok / LocalTunnel — expõe temporariamente seu servidor local (útil para demonstrações rápidas). A URL exposta dura enquanto o túnel estiver ativo.

```

Arquivos adicionados por mim nesta pasta:
- `.github/workflows/deploy_pages.yml` — workflow que publica para GitHub Pages ao dar push em `main`.
Escolha recomendada: GitHub Pages (simples e permanente). Abaixo tem instruções rápidas para cada opção.

1) GitHub Pages (recomendado)

- Crie um repositório no GitHub (ou use um existente).
- No seu computador, no diretório do projeto, rode:

```powershell
cd 'C:\Users\luizf\OneDrive\Desktop\plataforma-ong'
git init  # só se ainda não houver .git
git add .
git commit -m "site: initial commit"
git remote add origin https://github.com/<seu-usuario>/<seu-repo>.git
git push -u origin main
```

- No GitHub, abra Settings → Pages (ou Pages na barra lateral). Em "Build and deployment" selecione "Deploy from a branch" e escolha `main` como branch e `/ (root)` como pasta. Salve.
- Após alguns minutos o site estará disponível em `https://<seu-usuario>.github.io/<seu-repo>/`.

Observação: criei um workflow de GitHub Actions que publica automaticamente o conteúdo do repositório para Pages sempre que você der push na `main` (arquivo: `.github/workflows/deploy_pages.yml`). Basta pushar para `main`.

2) Netlify (arrastar e soltar — muito simples)

- Faça login em https://app.netlify.com/ (crie conta gratuita).
- Arraste a pasta do projeto (a raiz com `index.html`) para a área "Sites" → "Drop your site folder here".
- Netlify fará upload e retornará uma URL pública.

3) Demo temporária com ngrok (rápido, não é permanente)

- Baixe ngrok em https://ngrok.com/ e instale.
- Rode seu servidor local (já tem script `scripts\start_server_port3000_console.ps1`). Depois, no PowerShell:

```powershell
ngrok http 3000
```

- O ngrok exibirá um endereço público (https://...). Compartilhe essa URL com sua professora. Quando você fechar o túnel ou desligar seu computador, a URL deixa de funcionar.

Se quiser que eu crie o README de forma diferente, ou se prefere que eu gere/ajude a criar o repositório no GitHub e os commits necessários (você precisará apenas fazer o push — eu não tenho credenciais para empurrar para o seu GitHub), diga e eu preparo os arquivos necessários.

---

Arquivos adicionados por mim nesta pasta:
- `.github/workflows/deploy_pages.yml` — workflow que publica para GitHub Pages ao dar push em `main`.
