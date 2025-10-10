// site-improved.js
// JavaScript melhorado para a plataforma ONG

document.addEventListener('DOMContentLoaded', function() {
    console.log('Plataforma ONG carregada');
    
    // Inicializar funcionalidades
    initializeNavigation();
    initializeButtons();
    initializeCards();
    initializeScrollBehavior();
    initializeThemeToggle();
    initializeMobileMenu();
    
    // Adicionar logs para debug
    console.log('Todas as funcionalidades inicializadas');
});

// ========== NAVEGAÇÃO ========== //
function initializeNavigation() {
    // Marcar link ativo baseado na URL atual
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.navbar__link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        }
    });
    
    console.log('Navegação inicializada para:', currentPage);
}

// ========== BOTÕES ========== //
function initializeButtons() {
    // Adicionar efeitos aos botões
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        // Adicionar evento de clique com feedback visual
        button.addEventListener('click', function(e) {
            console.log('Botão clicado:', this.textContent.trim());
            
            // Efeito ripple
            createRippleEffect(this, e);
            
            // Lógica específica por tipo de botão
            handleButtonAction(this);
        });
        
        // Adicionar eventos de hover para melhor UX
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    console.log(`${buttons.length} botões inicializados`);
}

// Criar efeito ripple nos botões
function createRippleEffect(button, event) {
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('span');
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    `;
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    // Remover o ripple após a animação
    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
        }
    }, 600);
}

// Adicionar CSS para animação do ripple
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Lógica específica para diferentes tipos de botões
function handleButtonAction(button) {
    const buttonText = button.textContent.trim().toLowerCase();
    const buttonHref = button.getAttribute('href');
    
    // Botões de doação
    if (buttonText.includes('doe') || buttonText.includes('doar')) {
        console.log('Redirecionando para página de doações');
        if (buttonHref && buttonHref !== '#') {
            window.location.href = buttonHref;
        } else {
            window.location.href = 'doacoes.html';
        }
        return;
    }
    
    // Botões de voluntariado
    if (buttonText.includes('voluntário') || buttonText.includes('participar')) {
        console.log('Redirecionando para página de voluntariado');
        if (buttonHref && buttonHref !== '#') {
            window.location.href = buttonHref;
        } else {
            window.location.href = 'voluntariado.html';
        }
        return;
    }
    
    // Botões de cadastro
    if (buttonText.includes('cadastr') || buttonText.includes('registr')) {
        console.log('Redirecionando para página de cadastro');
        if (buttonHref && buttonHref !== '#') {
            window.location.href = buttonHref;
        } else {
            window.location.href = 'cadastro.html';
        }
        return;
    }
    
    // Botões de contato
    if (buttonText.includes('contato') || buttonText.includes('falar')) {
        console.log('Redirecionando para página de contato');
        if (buttonHref && buttonHref !== '#') {
            window.location.href = buttonHref;
        } else {
            window.location.href = 'contato.html';
        }
        return;
    }
    
    // Botões de projetos
    if (buttonText.includes('projeto') || buttonText.includes('conhecer')) {
        console.log('Redirecionando para página de projetos');
        if (buttonHref && buttonHref !== '#') {
            window.location.href = buttonHref;
        } else {
            window.location.href = 'projetos.html';
        }
        return;
    }
    
    // Outros botões com href
    if (buttonHref && buttonHref !== '#') {
        console.log('Redirecionando para:', buttonHref);
        window.location.href = buttonHref;
    }
}

// ========== CARDS INTERATIVOS ========== //
function initializeCards() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        // Adicionar cursor pointer se o card for clicável
        const cardLink = card.querySelector('a.btn') || card.querySelector('[href]');
        if (cardLink) {
            card.style.cursor = 'pointer';
            
            // Permitir click no card inteiro
            card.addEventListener('click', function(e) {
                // Não interferir se o clique foi em um link/botão específico
                if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
                    return;
                }
                
                console.log('Card clicado, redirecionando...');
                cardLink.click();
            });
        }
        
        // Efeitos de hover melhorados
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
            this.style.boxShadow = '0 12px 28px rgba(0,0,0,0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });
    
    console.log(`${cards.length} cards inicializados`);
}

// ========== SCROLL BEHAVIOR ========== //
function initializeScrollBehavior() {
    // Smooth scroll para links âncora
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Navbar transparência no scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.backdropFilter = 'blur(10px)';
            } else {
                navbar.style.background = '';
                navbar.style.backdropFilter = '';
            }
        });
    }
    
    console.log('Scroll behavior inicializado');
}

// ========== TEMA ESCURO/CLARO ========== //
function initializeThemeToggle() {
    // Criar botão de alternância de tema se não existir
    let themeToggle = document.querySelector('[data-theme-toggle]');
    
    if (!themeToggle) {
        themeToggle = document.createElement('button');
        themeToggle.setAttribute('data-theme-toggle', '');
        themeToggle.setAttribute('aria-label', 'Alternar tema');
        themeToggle.className = 'btn btn--ghost theme-toggle';
        themeToggle.innerHTML = '🌙';
        themeToggle.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        document.body.appendChild(themeToggle);
    }
    
    // Carregar tema salvo
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(themeToggle, savedTheme);
    
    // Adicionar evento de clique
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(this, newTheme);
        
        console.log('Tema alterado para:', newTheme);
    });
    
    console.log('Alternância de tema inicializada');
}

function updateThemeIcon(button, theme) {
    button.innerHTML = theme === 'dark' ? '☀️' : '🌙';
}

// ========== MENU MOBILE ========== //
function initializeMobileMenu() {
    const hamburger = document.querySelector('.navbar__hamburger');
    const navToggle = document.querySelector('#nav-toggle');
    const navMenu = document.querySelector('.navbar__menu');
    
    if (hamburger && navMenu) {
        // Criar checkbox se não existir
        if (!navToggle) {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = 'nav-toggle';
            checkbox.style.display = 'none';
            hamburger.parentNode.insertBefore(checkbox, hamburger);
        }
        
        // Adicionar evento ao hamburger
        hamburger.addEventListener('click', function() {
            const toggle = document.querySelector('#nav-toggle');
            if (toggle) {
                toggle.checked = !toggle.checked;
                
                // Atualizar ícone do hamburger
                this.innerHTML = toggle.checked ? '✕' : '☰';
                
                // Adicionar/remover classe ativa no menu
                if (toggle.checked) {
                    navMenu.classList.add('active');
                } else {
                    navMenu.classList.remove('active');
                }
                
                console.log('Menu mobile:', toggle.checked ? 'aberto' : 'fechado');
            }
        });
        
        // Fechar menu ao clicar em um link
        const navLinks = navMenu.querySelectorAll('.navbar__link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                const toggle = document.querySelector('#nav-toggle');
                if (toggle && window.innerWidth <= 768) {
                    toggle.checked = false;
                    navMenu.classList.remove('active');
                    hamburger.innerHTML = '☰';
                }
            });
        });
        
        // Fechar menu ao redimensionar para desktop
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                const toggle = document.querySelector('#nav-toggle');
                if (toggle) {
                    toggle.checked = false;
                    navMenu.classList.remove('active');
                    hamburger.innerHTML = '☰';
                }
            }
        });
    }
    
    console.log('Menu mobile inicializado');
}

// ========== UTILITÁRIOS ========== //

// Adicionar loading aos botões durante navegação
function addLoadingState(button) {
    const originalText = button.textContent;
    button.textContent = 'Carregando...';
    button.disabled = true;
    
    setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
    }, 1000);
}

// Mostrar notificações
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--color-${type === 'error' ? 'error' : 'success'});
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Validar formulários
function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('error');
            isValid = false;
        } else {
            field.classList.remove('error');
        }
    });
    
    return isValid;
}

// Log de debug para desenvolvimento
function debugInfo() {
    console.log('=== DEBUG INFO ===');
    console.log('Botões encontrados:', document.querySelectorAll('.btn').length);
    console.log('Cards encontrados:', document.querySelectorAll('.card').length);
    console.log('Links de navegação:', document.querySelectorAll('.navbar__link').length);
    console.log('Formulários:', document.querySelectorAll('form').length);
    console.log('==================');
}

// Executar debug em modo desenvolvimento
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    debugInfo();
}

// Exportar funções para uso global
window.ongPlatform = {
    showNotification,
    validateForm,
    addLoadingState,
    debugInfo
};