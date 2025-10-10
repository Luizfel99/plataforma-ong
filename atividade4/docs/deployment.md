# GUIA DE DEPLOYMENT - PLATAFORMA ONG
# Configurações para deploy em produção

## 🚀 OPÇÕES DE DEPLOYMENT

### 1. GitHub Pages (Recomendado - Gratuito)
```bash
# Configurar GitHub Pages
git checkout main
git push origin main

# GitHub Actions já configurado em .github/workflows/deploy.yml
# Site será disponibilizado em: https://seu-usuario.github.io/plataforma-ong/
```

### 2. Netlify (Simples e Gratuito)
```bash
# 1. Conectar repositório no Netlify
# 2. Configurar build:
#    Build command: npm run build
#    Publish directory: production/
# 3. Configurar domínio personalizado (opcional)
```

### 3. Vercel (Excelente Performance)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configurar no vercel.json (já incluído)
```

### 4. Firebase Hosting (Google)
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login no Firebase
firebase login

# Inicializar projeto
firebase init hosting

# Deploy
firebase deploy
```

## 📋 CHECKLIST PRÉ-DEPLOYMENT

### ✅ Verificações Técnicas
- [ ] Todos os arquivos otimizados (CSS/JS/HTML minificados)
- [ ] Imagens comprimidas e otimizadas
- [ ] Service Worker configurado para cache
- [ ] Todos os links funcionando (404s verificados)
- [ ] Formulários validados e funcionais
- [ ] Compatibilidade cross-browser testada

### ✅ Verificações de Acessibilidade
- [ ] WCAG 2.1 AA compliance verificada
- [ ] Contraste mínimo 4.5:1 em todos os elementos
- [ ] Navegação por teclado funcional
- [ ] Screen readers testados
- [ ] Alt text em todas as imagens
- [ ] Estrutura semântica HTML5 correta

### ✅ Verificações de Performance
- [ ] Lighthouse Score > 90 (Performance, Accessibility, Best Practices, SEO)
- [ ] Core Web Vitals aprovadas
- [ ] Tempo de carregamento < 3 segundos
- [ ] Imagens lazy loading implementado
- [ ] CSS/JS crítico inline
- [ ] Recursos não utilizados removidos

### ✅ Verificações de SEO
- [ ] Meta tags configuradas em todas as páginas
- [ ] Sitemap.xml gerado
- [ ] Robots.txt configurado
- [ ] Open Graph e Twitter Cards
- [ ] URLs amigáveis e limpas
- [ ] Schema.org markup implementado

## 🔧 CONFIGURAÇÕES DE AMBIENTE

### Variáveis de Ambiente (.env)
```env
# Produção
NODE_ENV=production
SITE_URL=https://seu-dominio.com
CONTACT_EMAIL=contato@ong.org
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
FACEBOOK_PIXEL_ID=XXXXXXXXXX

# APIs (se aplicável)
FORMSPREE_ENDPOINT=https://formspree.io/f/xxxxxxxx
MAILCHIMP_API_KEY=xxxxxxxxxx
GOOGLE_MAPS_API_KEY=xxxxxxxxxx
```

### Headers de Segurança (.htaccess para Apache)
```apache
# Segurança
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-Content-Type-Options "nosniff"
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"

# CSP (Content Security Policy)
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' *.google-analytics.com *.googletagmanager.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data: *.google-analytics.com; connect-src 'self' *.google-analytics.com"

# Cache
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
</IfModule>

# Compressão
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
```

### Headers para Nginx
```nginx
# nginx.conf
server {
    listen 80;
    server_name seu-dominio.com;
    
    # Redirecionar para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com;
    
    # SSL Configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Root directory
    root /var/www/plataforma-ong/production;
    index index.html;
    
    # Cache static assets
    location ~* \.(css|js|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # HTML files
    location ~* \.html$ {
        expires 1h;
        add_header Cache-Control "public";
    }
    
    # Service Worker
    location /sw.js {
        expires 0;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # Fallback to index.html for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 📊 MONITORAMENTO PÓS-DEPLOYMENT

### Google Analytics 4
```html
<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', {
    anonymize_ip: true,
    cookie_flags: 'max-age=7200;secure;samesite=strict'
  });
</script>
```

### Google Search Console
1. Adicionar propriedade no Search Console
2. Verificar propriedade via HTML tag ou DNS
3. Submeter sitemap.xml
4. Monitorar erros de indexação

### Ferramentas de Monitoramento
- **Uptime Robot**: Monitoramento de disponibilidade
- **PageSpeed Insights**: Performance contínua
- **GTmetrix**: Análise detalhada de velocidade
- **Lighthouse CI**: Integração com GitHub Actions

## 🔄 PROCESSO DE ATUALIZAÇÃO

### 1. Desenvolvimento
```bash
git checkout develop
git pull origin develop
# Fazer alterações
git add .
git commit -m "feat: nova funcionalidade"
git push origin develop
```

### 2. Teste e Staging
```bash
git checkout staging
git merge develop
npm run build
npm run test
# Testar em ambiente de staging
```

### 3. Release para Produção
```bash
git checkout main
git merge staging
git tag v1.0.1
git push origin main --tags
# Deploy automático via GitHub Actions
```

### 4. Hotfix (Emergência)
```bash
git checkout main
git checkout -b hotfix/correcao-critica
# Fazer correção
git commit -m "fix: correção crítica"
git checkout main
git merge hotfix/correcao-critica
git tag v1.0.2
git push origin main --tags
git branch -d hotfix/correcao-critica
```

## 🎯 MÉTRICAS DE SUCESSO

### Performance
- Lighthouse Score: > 90 em todas as categorias
- Core Web Vitals: Verde em todas as métricas
- Tempo de carregamento: < 3 segundos
- Time to Interactive: < 5 segundos

### Acessibilidade
- WCAG 2.1 AA: 100% compliance
- Axe DevTools: 0 violações
- Screen reader: Navegação fluída
- Contraste: Mínimo 4.5:1

### SEO
- Google PageSpeed: > 90
- Mobile-Friendly Test: Aprovado
- Rich Snippets: Implementados
- Sitemap: Submetido e indexado

### Segurança
- SSL Labs: Nota A+
- Security Headers: Todas implementadas
- Vulnerabilidades: 0 críticas
- GDPR: Compliance completa

## 📞 SUPORTE PÓS-DEPLOYMENT

### Documentação
- Manual do usuário administrativo
- Guia de atualização de conteúdo
- Procedimentos de backup
- Contatos de emergência

### Backup e Recuperação
- Backup automático diário
- Versionamento de código no Git
- Backup de banco de dados (se aplicável)
- Plano de recuperação de desastres

### Manutenção
- Atualizações de segurança mensais
- Revisão de performance trimestral
- Auditoria de acessibilidade semestral
- Renovação de certificados SSL anual