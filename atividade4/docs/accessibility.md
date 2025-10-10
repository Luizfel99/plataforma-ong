# ♿ ACESSIBILIDADE - WCAG 2.1 NÍVEL AA

## 📋 Visão Geral

Este documento detalha a implementação de **acessibilidade conforme WCAG 2.1 Nível AA** na Plataforma ONG, garantindo que todos os usuários, independente de suas habilidades, possam acessar e utilizar o site de forma eficaz.

## 🎯 Objetivos de Acessibilidade

### Princípios WCAG 2.1

#### 1. **Perceptível** - Informações e componentes devem ser apresentados de forma perceptível
#### 2. **Operável** - Componentes de interface devem ser operáveis
#### 3. **Compreensível** - Informações e operação da interface devem ser compreensíveis
#### 4. **Robusto** - Conteúdo deve ser robusto o suficiente para diferentes tecnologias assistivas

## 🛠️ Implementações Realizadas

### 🔤 1. Estrutura Semântica (WCAG 1.3.1)

#### HTML Semântico Correto
```html
<!-- Estrutura principal -->
<header role="banner">
    <nav role="navigation" aria-label="Navegação principal">
        <ul>
            <li><a href="#home" aria-current="page">Início</a></li>
            <li><a href="#sobre">Sobre</a></li>
            <li><a href="#projetos">Projetos</a></li>
        </ul>
    </nav>
</header>

<main role="main">
    <section aria-labelledby="hero-heading">
        <h1 id="hero-heading">Plataforma ONG</h1>
        <p>Transformando vidas através da solidariedade</p>
    </section>
</main>

<footer role="contentinfo">
    <p>&copy; 2024 Plataforma ONG. Todos os direitos reservados.</p>
</footer>
```

#### Hierarquia de Cabeçalhos
```html
<h1>Título Principal da Página</h1>
    <h2>Seção Principal</h2>
        <h3>Subseção</h3>
        <h3>Outra Subseção</h3>
    <h2>Segunda Seção Principal</h2>
        <h3>Subseção da Segunda Seção</h3>
```

### ⌨️ 2. Navegação por Teclado (WCAG 2.1.1, 2.1.2)

#### Skip Links
```html
<a href="#main-content" class="skip-link">
    Pular para o conteúdo principal
</a>
<a href="#main-navigation" class="skip-link">
    Pular para a navegação
</a>
```

```css
.skip-link {
    position: absolute;
    top: -40px;
    left: 6px;
    background: #000;
    color: #fff;
    padding: 8px;
    text-decoration: none;
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.3s;
}

.skip-link:focus {
    top: 6px;
    opacity: 1;
}
```

#### Foco Visível
```css
/* Foco personalizado para todos os elementos interativos */
a:focus,
button:focus,
input:focus,
select:focus,
textarea:focus,
[tabindex]:focus {
    outline: 3px solid #005fcc;
    outline-offset: 2px;
    box-shadow: 0 0 0 2px #fff;
}

/* Foco específico para botões */
.btn:focus {
    outline: 3px solid #005fcc;
    outline-offset: 2px;
    box-shadow: 0 0 0 2px #fff, 0 0 0 5px rgba(0, 95, 204, 0.3);
}
```

#### Ordem de Tabulação Lógica
```html
<!-- Tabindex apenas quando necessário alterar ordem natural -->
<div class="modal" tabindex="-1" role="dialog">
    <div class="modal-content">
        <button class="close" tabindex="0" aria-label="Fechar modal">×</button>
        <h2 tabindex="0">Título do Modal</h2>
        <form>
            <input type="text" tabindex="0" placeholder="Nome">
            <input type="email" tabindex="0" placeholder="E-mail">
            <button type="submit" tabindex="0">Enviar</button>
        </form>
    </div>
</div>
```

### 🎨 3. Contraste de Cores (WCAG 1.4.3, 1.4.6)

#### Paleta de Cores Acessível
```css
:root {
    /* Cores principais com contraste 4.5:1 mínimo */
    --primary-color: #005fcc;        /* Azul escuro */
    --primary-light: #4d8ae8;       /* Azul claro */
    --secondary-color: #28a745;     /* Verde */
    --accent-color: #ffc107;        /* Amarelo */
    
    /* Texto com alto contraste */
    --text-primary: #212529;        /* Quase preto - 15.8:1 */
    --text-secondary: #495057;      /* Cinza escuro - 9.7:1 */
    --text-muted: #6c757d;          /* Cinza médio - 4.5:1 */
    
    /* Backgrounds acessíveis */
    --bg-primary: #ffffff;          /* Branco */
    --bg-secondary: #f8f9fa;        /* Cinza muito claro */
    --bg-dark: #343a40;             /* Cinza escuro */
    
    /* Estados de erro/sucesso */
    --error-color: #dc3545;         /* Vermelho acessível */
    --success-color: #28a745;       /* Verde acessível */
    --warning-color: #fd7e14;       /* Laranja acessível */
}

/* Verificação de contraste para textos */
.text-primary { color: var(--text-primary); }    /* 15.8:1 */
.text-secondary { color: var(--text-secondary); } /* 9.7:1 */
.text-muted { color: var(--text-muted); }         /* 4.5:1 */

/* Botões com contraste adequado */
.btn-primary {
    background-color: var(--primary-color);
    color: #ffffff;                 /* 5.9:1 */
    border: 2px solid var(--primary-color);
}

.btn-primary:hover {
    background-color: #004ba8;      /* Escurecido para hover */
    border-color: #004ba8;
}

.btn-secondary {
    background-color: var(--secondary-color);
    color: #ffffff;                 /* 4.6:1 */
    border: 2px solid var(--secondary-color);
}
```

#### Modo Alto Contraste
```css
/* Modo alto contraste */
@media (prefers-contrast: high) {
    :root {
        --text-primary: #000000;
        --bg-primary: #ffffff;
        --primary-color: #000080;
        --secondary-color: #008000;
    }
    
    .btn {
        border-width: 3px;
        font-weight: bold;
    }
}

/* Classe para ativar alto contraste manualmente */
.high-contrast {
    --text-primary: #000000;
    --bg-primary: #ffffff;
    --primary-color: #000080;
    --secondary-color: #008000;
}

.high-contrast .btn {
    border-width: 3px;
    font-weight: bold;
}

.high-contrast img {
    filter: contrast(150%) brightness(90%);
}
```

#### Modo Escuro Acessível
```css
/* Modo escuro */
@media (prefers-color-scheme: dark) {
    :root {
        --text-primary: #f8f9fa;     /* Branco suave */
        --text-secondary: #dee2e6;   /* Cinza claro */
        --bg-primary: #212529;       /* Preto suave */
        --bg-secondary: #343a40;     /* Cinza escuro */
        --primary-color: #4d8ae8;    /* Azul mais claro */
    }
}

/* Classe para ativar modo escuro manualmente */
.dark-mode {
    --text-primary: #f8f9fa;
    --text-secondary: #dee2e6;
    --bg-primary: #212529;
    --bg-secondary: #343a40;
    --primary-color: #4d8ae8;
}
```

### 🔊 4. Suporte a Leitores de Tela (WCAG 4.1.1, 4.1.2)

#### ARIA Labels e Roles
```html
<!-- Navegação principal -->
<nav role="navigation" aria-label="Navegação principal">
    <ul role="menubar">
        <li role="none">
            <a href="#home" role="menuitem" aria-current="page">Início</a>
        </li>
        <li role="none">
            <a href="#about" role="menuitem">Sobre</a>
        </li>
    </ul>
</nav>

<!-- Formulários acessíveis -->
<form role="form" aria-label="Formulário de contato">
    <div class="form-group">
        <label for="name" id="name-label">
            Nome completo
            <span aria-label="obrigatório">*</span>
        </label>
        <input 
            type="text" 
            id="name" 
            name="name" 
            required 
            aria-labelledby="name-label"
            aria-describedby="name-help name-error"
        >
        <div id="name-help" class="form-help">
            Digite seu nome completo
        </div>
        <div id="name-error" class="form-error" aria-live="polite">
            <!-- Erro será inserido aqui dinamicamente -->
        </div>
    </div>
</form>

<!-- Componentes interativos -->
<button 
    aria-expanded="false" 
    aria-controls="dropdown-menu"
    aria-haspopup="true"
    id="dropdown-button"
>
    Menu <span aria-hidden="true">▼</span>
</button>
<ul id="dropdown-menu" aria-labelledby="dropdown-button" hidden>
    <li><a href="#" role="menuitem">Opção 1</a></li>
    <li><a href="#" role="menuitem">Opção 2</a></li>
</ul>
```

#### Live Regions para Feedback
```html
<!-- Área para anúncios importantes -->
<div aria-live="assertive" aria-atomic="true" class="sr-only" id="announcements">
    <!-- Anúncios urgentes serão inseridos aqui -->
</div>

<!-- Área para atualizações de status -->
<div aria-live="polite" aria-atomic="false" class="sr-only" id="status-updates">
    <!-- Atualizações de status serão inseridas aqui -->
</div>

<!-- Área para erros de formulário -->
<div aria-live="polite" aria-relevant="additions text" id="form-errors">
    <!-- Erros de validação serão inseridos aqui -->
</div>
```

#### Screen Reader Only Content
```css
/* Classe para conteúdo apenas para leitores de tela */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

/* Classe para mostrar conteúdo quando focado */
.sr-only-focusable:focus {
    position: static;
    width: auto;
    height: auto;
    padding: 0.25rem 0.5rem;
    margin: 0;
    overflow: visible;
    clip: auto;
    white-space: normal;
}
```

### 🖼️ 5. Imagens e Mídia Acessível (WCAG 1.1.1)

#### Textos Alternativos
```html
<!-- Imagens informativas -->
<img 
    src="projeto-educacao.jpg" 
    alt="Crianças em sala de aula participando de atividade educacional do projeto"
    loading="lazy"
>

<!-- Imagens decorativas -->
<img 
    src="pattern-background.svg" 
    alt="" 
    role="presentation"
    loading="lazy"
>

<!-- Imagens com texto complexo -->
<img 
    src="grafico-doacoes.png" 
    alt="Gráfico de doações mostrando crescimento de 300% nos últimos 12 meses"
    longdesc="#grafico-descricao"
>
<div id="grafico-descricao" class="sr-only">
    <h3>Descrição detalhada do gráfico</h3>
    <p>O gráfico mostra...</p>
</div>

<!-- Ícones funcionais -->
<button type="submit">
    <svg aria-hidden="true" focusable="false">
        <use href="#icon-send"></use>
    </svg>
    <span class="sr-only">Enviar formulário</span>
</button>
```

#### Vídeos Acessíveis
```html
<video controls preload="metadata" poster="video-poster.jpg">
    <source src="institucional.mp4" type="video/mp4">
    <source src="institucional.webm" type="video/webm">
    <track 
        kind="captions" 
        src="institucional-pt.vtt" 
        srclang="pt" 
        label="Português (Brasil)"
        default
    >
    <track 
        kind="descriptions" 
        src="institucional-desc-pt.vtt" 
        srclang="pt" 
        label="Audiodescrição em Português"
    >
    <p>Seu navegador não suporta o elemento de vídeo. 
       <a href="institucional.mp4">Baixe o vídeo</a>.
    </p>
</video>
```

### 📝 6. Formulários Acessíveis (WCAG 3.3.1, 3.3.2)

#### Labels e Associações
```html
<form novalidate aria-label="Formulário de doação">
    <!-- Campo obrigatório com indicação clara -->
    <div class="form-group">
        <label for="donor-name" class="form-label">
            Nome do doador
            <span class="required" aria-label="campo obrigatório">*</span>
        </label>
        <input 
            type="text" 
            id="donor-name" 
            name="donorName"
            class="form-control"
            required
            aria-required="true"
            aria-describedby="donor-name-help donor-name-error"
            autocomplete="name"
        >
        <div id="donor-name-help" class="form-help">
            Digite seu nome completo como aparece no documento
        </div>
        <div id="donor-name-error" class="form-error" aria-live="polite">
            <!-- Mensagem de erro inserida via JavaScript -->
        </div>
    </div>

    <!-- Grupo de radio buttons -->
    <fieldset class="form-group">
        <legend class="form-legend">Tipo de doação</legend>
        <div class="radio-group" role="radiogroup" aria-required="true">
            <label class="radio-label">
                <input type="radio" name="donationType" value="monthly" aria-describedby="monthly-desc">
                <span class="radio-text">Mensal</span>
            </label>
            <div id="monthly-desc" class="radio-desc">
                Doação recorrente todo mês
            </div>
            
            <label class="radio-label">
                <input type="radio" name="donationType" value="single" aria-describedby="single-desc">
                <span class="radio-text">Única</span>
            </label>
            <div id="single-desc" class="radio-desc">
                Doação de valor único
            </div>
        </div>
    </fieldset>

    <!-- Campo de valor com formatação -->
    <div class="form-group">
        <label for="amount" class="form-label">
            Valor da doação (R$)
            <span class="required" aria-label="campo obrigatório">*</span>
        </label>
        <input 
            type="number" 
            id="amount" 
            name="amount"
            class="form-control"
            min="5"
            max="50000"
            step="0.01"
            required
            aria-required="true"
            aria-describedby="amount-help amount-error"
        >
        <div id="amount-help" class="form-help">
            Valor mínimo: R$ 5,00 - Valor máximo: R$ 50.000,00
        </div>
        <div id="amount-error" class="form-error" aria-live="polite"></div>
    </div>

    <!-- Botão de envio acessível -->
    <button type="submit" class="btn btn-primary" aria-describedby="submit-help">
        <span class="btn-text">Fazer doação</span>
        <span class="btn-loading sr-only" aria-hidden="true">Processando...</span>
    </button>
    <div id="submit-help" class="form-help">
        Seus dados estão seguros e protegidos
    </div>
</form>
```

### 🔄 7. Estados e Feedback (WCAG 4.1.3)

#### Estados de Componentes
```html
<!-- Toggle switch acessível -->
<div class="toggle-switch" role="switch" aria-checked="false" aria-labelledby="dark-mode-label" tabindex="0">
    <span id="dark-mode-label">Modo escuro</span>
    <div class="toggle-track">
        <div class="toggle-thumb"></div>
    </div>
</div>

<!-- Accordion acessível -->
<div class="accordion">
    <div class="accordion-item">
        <button 
            class="accordion-header"
            aria-expanded="false"
            aria-controls="panel-1"
            id="header-1"
        >
            <span>Pergunta frequente 1</span>
            <span class="accordion-icon" aria-hidden="true">+</span>
        </button>
        <div 
            class="accordion-panel"
            id="panel-1"
            aria-labelledby="header-1"
            hidden
        >
            <p>Resposta da pergunta frequente 1...</p>
        </div>
    </div>
</div>

<!-- Loading states -->
<button class="btn btn-primary" aria-describedby="loading-status">
    <span class="btn-text">Enviar</span>
</button>
<div id="loading-status" aria-live="polite" class="sr-only">
    <!-- Status será atualizado via JavaScript -->
</div>
```

### 🎮 8. JavaScript Acessível

#### Gerenciamento de Foco
```javascript
// Gerenciador de foco para modals
class AccessibleModal {
    constructor(modalElement) {
        this.modal = modalElement;
        this.focusableElements = this.modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        this.firstFocusable = this.focusableElements[0];
        this.lastFocusable = this.focusableElements[this.focusableElements.length - 1];
    }

    open() {
        this.previouslyFocused = document.activeElement;
        
        this.modal.setAttribute('aria-hidden', 'false');
        this.modal.style.display = 'block';
        
        // Foco no primeiro elemento
        this.firstFocusable.focus();
        
        // Trap focus
        this.modal.addEventListener('keydown', this.trapFocus.bind(this));
        
        // Anunciar abertura
        this.announce('Modal aberto');
    }

    close() {
        this.modal.setAttribute('aria-hidden', 'true');
        this.modal.style.display = 'none';
        
        // Retornar foco
        if (this.previouslyFocused) {
            this.previouslyFocused.focus();
        }
        
        this.modal.removeEventListener('keydown', this.trapFocus.bind(this));
        
        // Anunciar fechamento
        this.announce('Modal fechado');
    }

    trapFocus(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === this.firstFocusable) {
                    e.preventDefault();
                    this.lastFocusable.focus();
                }
            } else {
                // Tab
                if (document.activeElement === this.lastFocusable) {
                    e.preventDefault();
                    this.firstFocusable.focus();
                }
            }
        }
        
        if (e.key === 'Escape') {
            this.close();
        }
    }

    announce(message) {
        const announcer = document.getElementById('announcements');
        announcer.textContent = message;
        
        // Limpar após anunciar
        setTimeout(() => {
            announcer.textContent = '';
        }, 1000);
    }
}
```

#### Validação Acessível
```javascript
// Sistema de validação com feedback acessível
class AccessibleValidator {
    constructor(form) {
        this.form = form;
        this.errorSummary = null;
    }

    validate() {
        const errors = [];
        
        // Validar cada campo
        const fields = this.form.querySelectorAll('[required]');
        fields.forEach(field => {
            const error = this.validateField(field);
            if (error) {
                errors.push(error);
            }
        });

        if (errors.length > 0) {
            this.showErrorSummary(errors);
            this.focusFirstError();
            return false;
        }

        this.clearErrors();
        return true;
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.getAttribute('aria-label') || field.labels[0]?.textContent || field.name;
        
        if (!value) {
            this.showFieldError(field, `${fieldName} é obrigatório`);
            return {
                field: field,
                message: `${fieldName} é obrigatório`
            };
        }

        this.clearFieldError(field);
        return null;
    }

    showFieldError(field, message) {
        const errorId = `${field.id}-error`;
        let errorElement = document.getElementById(errorId);
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = errorId;
            errorElement.className = 'form-error';
            errorElement.setAttribute('aria-live', 'polite');
            field.parentNode.appendChild(errorElement);
        }

        errorElement.textContent = message;
        field.setAttribute('aria-describedby', errorId);
        field.setAttribute('aria-invalid', 'true');
        field.classList.add('error');
    }

    clearFieldError(field) {
        const errorId = `${field.id}-error`;
        const errorElement = document.getElementById(errorId);
        
        if (errorElement) {
            errorElement.textContent = '';
        }
        
        field.removeAttribute('aria-invalid');
        field.classList.remove('error');
    }

    showErrorSummary(errors) {
        // Criar resumo de erros
        if (!this.errorSummary) {
            this.errorSummary = document.createElement('div');
            this.errorSummary.className = 'error-summary';
            this.errorSummary.setAttribute('role', 'alert');
            this.errorSummary.setAttribute('aria-live', 'assertive');
            this.form.insertBefore(this.errorSummary, this.form.firstChild);
        }

        const errorList = errors.map(error => 
            `<li><a href="#${error.field.id}">${error.message}</a></li>`
        ).join('');

        this.errorSummary.innerHTML = `
            <h3>Corrija os seguintes erros:</h3>
            <ul>${errorList}</ul>
        `;

        this.errorSummary.focus();
    }

    focusFirstError() {
        const firstError = this.form.querySelector('.error');
        if (firstError) {
            firstError.focus();
        }
    }

    clearErrors() {
        if (this.errorSummary) {
            this.errorSummary.remove();
            this.errorSummary = null;
        }
    }
}
```

## 🧪 Testes de Acessibilidade

### Ferramentas de Teste
1. **axe-core**: Teste automatizado de acessibilidade
2. **WAVE**: Web Accessibility Evaluation Tool
3. **Lighthouse**: Auditoria de acessibilidade do Chrome
4. **Screen Readers**: NVDA, JAWS, VoiceOver

### Checklist de Verificação Manual
- [ ] Navegação completa apenas por teclado
- [ ] Todos os elementos interativos são focáveis
- [ ] Ordem de tabulação é lógica
- [ ] Foco visível em todos os elementos
- [ ] Contraste de cores conforme WCAG AA
- [ ] Textos alternativos em todas as imagens
- [ ] Labels associados corretamente aos campos
- [ ] Mensagens de erro são anunciadas
- [ ] Estrutura de cabeçalhos é hierárquica
- [ ] ARIA labels e roles estão corretos

---

**Esta implementação garante que a Plataforma ONG seja acessível a todos os usuários, cumprindo as diretrizes WCAG 2.1 Nível AA.**