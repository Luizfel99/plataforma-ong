# 🚀 ATIVIDADE 3 - JAVASCRIPT AVANÇADO & SPA

## 📋 Especificações da Atividade

### 🎯 Objetivo
Implementar **JavaScript avançado** para transformar interface estática em aplicação web dinâmica e interativa, demonstrando domínio de manipulação do DOM, eventos, armazenamento local e criação de SPA básico.

### ⚡ Especificações Técnicas Obrigatórias

#### Manipulação do DOM
- ✅ **Single Page Application (SPA)** básico
- ✅ **Sistema de templates JavaScript**
- ✅ **Roteamento client-side**
- ✅ **Navegação dinâmica**

#### Funcionalidades Específicas
- ✅ **Sistema de verificação de consistência** de dados em formulários
- ✅ **Avisos ao usuário** de preenchimento incorreto
- ✅ **Validação em tempo real**
- ✅ **Feedback visual interativo**

### 📦 Estrutura de Entrega

#### 1. Código JavaScript Modular
- 📁 Estrutura de pastas organizada
- 📄 HTML, imagens, CSS e JS separados
- 🧩 Códigos organizados por funcionalidade

#### 2. Forma de Entrega
- 🌐 **Link PÚBLICO** do projeto no GitHub
- 📁 Todo código fonte organizado em pastas
- 📝 Documentação completa

---

## 🏗️ Arquitetura da Aplicação

### Frontend SPA
- 🎨 **Interface Responsiva** - Mobile-first design
- � **Roteamento Dinâmico** - Navegação sem reload
- 📱 **Templates JavaScript** - Renderização dinâmica
- ⚡ **Estado Reativo** - Atualizações em tempo real

### JavaScript Avançado
- 🧩 **Módulos ES6+** - Código modular e reutilizável
- � **Manipulação DOM** - APIs modernas
- 💾 **Storage Local** - Persistência de dados
- 🎯 **Event Handling** - Sistema de eventos avançado

### Validação de Dados
- ✅ **Validação em Tempo Real** - Feedback imediato
- 🔍 **Verificação de Consistência** - Dados coerentes
- � **Sistema de Alertas** - Avisos visuais
- � **Relatórios de Erro** - Debugging facilitado

---

## 📁 Estrutura do Projeto

```
atividade3/
├── 📄 index.html               # Entry point da SPA
├── 📄 README.md               # Documentação
├── 📄 package.json            # Dependências
├── assets/
│   ├── css/
│   │   ├── main.css           # Estilos principais
│   │   ├── components.css     # Componentes
│   │   └── responsive.css     # Media queries
│   ├── img/
│   │   ├── icons/             # Ícones SVG
│   │   └── photos/            # Imagens
│   └── data/
│       └── mock-data.json     # Dados de exemplo
├── js/
│   ├── app.js                 # Aplicação principal
│   ├── router/
│   │   ├── router.js          # Sistema de roteamento
│   │   └── routes.js          # Definição das rotas
│   ├── components/
│   │   ├── header.js          # Componente cabeçalho
│   │   ├── footer.js          # Componente rodapé
│   │   ├── navigation.js      # Navegação SPA
│   │   └── modal.js           # Sistema de modais
│   ├── templates/
│   │   ├── home.js            # Template home
│   │   ├── about.js           # Template sobre
│   │   ├── contact.js         # Template contato
│   │   ├── projects.js        # Template projetos
│   │   └── donations.js       # Template doações
│   ├── forms/
│   │   ├── validator.js       # Sistema de validação
│   │   ├── contact-form.js    # Formulário contato
│   │   ├── donation-form.js   # Formulário doação
│   │   └── volunteer-form.js  # Formulário voluntário
│   ├── utils/
│   │   ├── dom.js             # Utilitários DOM
│   │   ├── storage.js         # Local storage
│   │   ├── api.js             # Simulação de API
│   │   └── helpers.js         # Funções auxiliares
│   └── services/
│       ├── data-service.js    # Gerenciamento dados
│       ├── notification.js    # Sistema notificações
│       └── analytics.js       # Tracking de eventos
└── docs/
    ├── api.md                 # Documentação da API
    └── deployment.md          # Guia de deploy
```

---

## 🎯 Funcionalidades Implementadas

### 1. 🔄 Single Page Application (SPA)
- Roteamento client-side sem reload
- Templates JavaScript dinâmicos
- Navegação fluida entre páginas
- Estado preservado durante navegação

### 2. 📝 Sistema de Formulários Avançado
- Validação em tempo real
- Verificação de consistência de dados
- Feedback visual imediato
- Prevenção de envios inválidos

### 3. 🎨 Interface Dinâmica
- Componentes reutilizáveis
- Atualizações reativas
- Animações CSS + JS
- Responsividade completa

### 4. 💾 Gerenciamento de Estado
- Local Storage para persistência
- Estado global da aplicação
- Sincronização entre componentes
- Cache de dados

---

## 🚀 Tecnologias Utilizadas

### JavaScript ES6+
- ✨ **Módulos** - Import/export
- 🏗️ **Classes** - OOP moderno
- ⚡ **Async/Await** - Operações assíncronas
- 🎯 **Destructuring** - Sintaxe moderna
- 🔄 **Template Literals** - Strings dinâmicas

### APIs do Navegador
- 🌐 **History API** - Roteamento SPA
- 💾 **Local Storage** - Persistência local
- 🎯 **DOM API** - Manipulação avançada
- 📱 **Fetch API** - Requisições HTTP
- 🔔 **Notification API** - Notificações

### Padrões de Design
- 🏗️ **MVC** - Model-View-Controller
- 👁️ **Observer** - Reatividade
- 🏭 **Factory** - Criação de objetos
- 🎯 **Module** - Encapsulamento
- 🔄 **Pub/Sub** - Comunicação entre componentes

---

## ⚡ Como Executar

### 1. Clonar Repositório
```bash
git clone [URL_DO_REPOSITORIO]
cd atividade3
```

### 2. Servidor Local
```bash
# Opção 1: Python
python -m http.server 8000

# Opção 2: Node.js
npx serve .

# Opção 3: PHP
php -S localhost:8000
```

### 3. Acessar Aplicação
```
http://localhost:8000
```

---

## 📱 Funcionalidades da SPA

### 🏠 Página Home
- Dashboard interativo
- Estatísticas em tempo real
- Cards de projetos dinâmicos
- Call-to-actions animados

### 📋 Página Sobre
- Timeline da organização
- Galeria de imagens
- Depoimentos rotativos
- Informações institucionais

### 💰 Página Doações
- Formulário de doação avançado
- Calculadora de impacto
- Métodos de pagamento
- Confirmação dinâmica

### 🤝 Página Voluntariado
- Formulário de inscrição
- Área de interesse seletiva
- Disponibilidade de horários
- Sistema de matching

### 📞 Página Contato
- Formulário com validação completa
- Mapa interativo
- Informações de contato
- Sistema de tickets

---

## 🔧 Sistema de Validação

### Validação em Tempo Real
```javascript
// Exemplo de validação
const validator = new FormValidator({
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Digite um e-mail válido'
  },
  phone: {
    required: true,
    pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
    message: 'Formato: (11) 99999-9999'
  }
});
```

### Verificação de Consistência
- CPF/CNPJ válidos
- CEP existente
- Telefone com DDD correto
- E-mail com domínio válido
- Senhas compatíveis

---

## 📊 Recursos Avançados

### 🎯 Analytics
- Tracking de eventos
- Tempo de permanência
- Interações do usuário
- Conversões de formulário

### 🔔 Notificações
- Toast messages
- Alertas de sistema
- Confirmações de ação
- Feedback de erro

### 💾 Persistência
- Dados de formulário salvos
- Preferências do usuário
- Histórico de navegação
- Cache de dados

---

*Projeto desenvolvido para demonstrar JavaScript avançado e conceitos de SPA*
*Setembro 2024 - Atividade 3*