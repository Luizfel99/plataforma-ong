/**
 * DOM-MANAGER.JS - SISTEMA AVANÇADO DE MANIPULAÇÃO DO DOM
 * Gerenciamento dinâmico de elementos, eventos e animações
 */

export class DOMManager {
    constructor() {
        this.observers = new Map();
        this.animations = new Map();
        this.eventListeners = new Map();
        this.components = new Map();
        this.mutationObserver = null;
        
        this.initializeDOM();
        console.log('✅ DOMManager inicializado');
    }

    /**
     * Inicializar gerenciador DOM
     */
    initializeDOM() {
        this.setupMutationObserver();
        this.setupIntersectionObserver();
        this.setupResizeObserver();
        this.setupScrollManager();
        this.setupLazyLoading();
        this.setupAnimationSystem();
        this.setupComponentSystem();
    }

    /**
     * Configurar Mutation Observer
     */
    setupMutationObserver() {
        this.mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // Elementos adicionados
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.processNewElement(node);
                        }
                    });

                    // Elementos removidos
                    mutation.removedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.processRemovedElement(node);
                        }
                    });
                }

                if (mutation.type === 'attributes') {
                    this.processAttributeChange(mutation.target, mutation.attributeName);
                }
            });
        });

        this.mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'data-component', 'data-animate']
        });
    }

    /**
     * Configurar Intersection Observer
     */
    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px 0px -100px 0px',
            threshold: [0, 0.25, 0.5, 0.75, 1]
        };

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                this.handleIntersection(entry);
            });
        }, options);

        // Observar elementos com animação
        this.observeAnimatedElements();
    }

    /**
     * Configurar Resize Observer
     */
    setupResizeObserver() {
        this.resizeObserver = new ResizeObserver((entries) => {
            entries.forEach((entry) => {
                this.handleResize(entry);
            });
        });
    }

    /**
     * Configurar gerenciador de scroll
     */
    setupScrollManager() {
        let scrollTimeout;
        let isScrolling = false;

        const handleScroll = () => {
            if (!isScrolling) {
                isScrolling = true;
                document.body.classList.add('scrolling');
                this.triggerEvent('scrollStart');
            }

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                isScrolling = false;
                document.body.classList.remove('scrolling');
                this.triggerEvent('scrollEnd');
            }, 150);

            this.updateScrollProgress();
            this.handleScrollAnimations();
        };

        window.addEventListener('scroll', this.throttle(handleScroll, 16), { passive: true });
    }

    /**
     * Configurar lazy loading
     */
    setupLazyLoading() {
        const lazyImages = document.querySelectorAll('img[data-src], [data-bg]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    this.loadLazyElement(entry.target);
                    imageObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px'
        });

        lazyImages.forEach((img) => {
            imageObserver.observe(img);
        });
    }

    /**
     * Configurar sistema de animações
     */
    setupAnimationSystem() {
        this.animationQueue = [];
        this.isAnimating = false;

        // Configurar animações CSS customizadas
        this.setupCSSAnimations();
        
        // Configurar Web Animations API
        this.setupWebAnimations();
    }

    /**
     * Configurar sistema de componentes
     */
    setupComponentSystem() {
        // Registrar componentes padrão
        this.registerComponent('modal', this.createModalComponent.bind(this));
        this.registerComponent('tabs', this.createTabsComponent.bind(this));
        this.registerComponent('accordion', this.createAccordionComponent.bind(this));
        this.registerComponent('carousel', this.createCarouselComponent.bind(this));
        this.registerComponent('tooltip', this.createTooltipComponent.bind(this));
        this.registerComponent('dropdown', this.createDropdownComponent.bind(this));
        this.registerComponent('progress', this.createProgressComponent.bind(this));
        this.registerComponent('counter', this.createCounterComponent.bind(this));

        // Inicializar componentes existentes
        this.initializeComponents();
    }

    /**
     * Processar novo elemento
     */
    processNewElement(element) {
        // Inicializar componentes
        const componentType = element.dataset.component;
        if (componentType && this.components.has(componentType)) {
            const component = this.components.get(componentType);
            component(element);
        }

        // Configurar animações
        if (element.dataset.animate) {
            this.setupElementAnimation(element);
        }

        // Configurar lazy loading
        if (element.dataset.src || element.dataset.bg) {
            this.intersectionObserver.observe(element);
        }

        // Processar filhos
        element.querySelectorAll('[data-component], [data-animate], [data-src], [data-bg]').forEach((child) => {
            this.processNewElement(child);
        });
    }

    /**
     * Processar elemento removido
     */
    processRemovedElement(element) {
        // Limpar observadores
        this.intersectionObserver?.unobserve(element);
        this.resizeObserver?.unobserve(element);

        // Limpar event listeners
        const elementId = element.id || element.dataset.id;
        if (elementId && this.eventListeners.has(elementId)) {
            this.eventListeners.delete(elementId);
        }

        // Limpar animações
        if (this.animations.has(element)) {
            const animation = this.animations.get(element);
            animation.cancel();
            this.animations.delete(element);
        }
    }

    /**
     * Processar mudança de atributo
     */
    processAttributeChange(element, attributeName) {
        switch (attributeName) {
            case 'class':
                this.handleClassChange(element);
                break;
            case 'data-component':
                this.reinitializeComponent(element);
                break;
            case 'data-animate':
                this.setupElementAnimation(element);
                break;
        }
    }

    /**
     * Lidar com intersecção
     */
    handleIntersection(entry) {
        const element = entry.target;
        const ratio = entry.intersectionRatio;

        // Animações baseadas em scroll
        if (element.dataset.animate) {
            if (entry.isIntersecting && ratio > 0.25) {
                this.triggerAnimation(element);
            }
        }

        // Parallax
        if (element.dataset.parallax) {
            this.updateParallax(element, ratio);
        }

        // Contador
        if (element.dataset.component === 'counter' && entry.isIntersecting) {
            this.startCounter(element);
        }

        // Progresso
        if (element.dataset.component === 'progress' && entry.isIntersecting) {
            this.animateProgress(element);
        }
    }

    /**
     * Lidar com redimensionamento
     */
    handleResize(entry) {
        const element = entry.target;
        
        // Atualizar componentes responsivos
        this.updateResponsiveComponent(element);
        
        // Recalcular animações
        this.recalculateAnimations(element);
    }

    /**
     * Carregar elemento lazy
     */
    loadLazyElement(element) {
        if (element.dataset.src) {
            // Imagem lazy
            element.src = element.dataset.src;
            element.classList.add('loaded');
            
            element.addEventListener('load', () => {
                element.classList.add('fade-in');
            });
        }

        if (element.dataset.bg) {
            // Background lazy
            element.style.backgroundImage = `url(${element.dataset.bg})`;
            element.classList.add('loaded');
        }
    }

    /**
     * Configurar animações CSS
     */
    setupCSSAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            .fade-in { animation: fadeIn 0.6s ease forwards; }
            .slide-up { animation: slideUp 0.8s ease forwards; }
            .slide-down { animation: slideDown 0.8s ease forwards; }
            .slide-left { animation: slideLeft 0.8s ease forwards; }
            .slide-right { animation: slideRight 0.8s ease forwards; }
            .zoom-in { animation: zoomIn 0.6s ease forwards; }
            .zoom-out { animation: zoomOut 0.6s ease forwards; }
            .bounce-in { animation: bounceIn 0.8s ease forwards; }
            .rotate-in { animation: rotateIn 0.8s ease forwards; }
            
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            @keyframes slideDown { from { transform: translateY(-50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            @keyframes slideLeft { from { transform: translateX(50px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideRight { from { transform: translateX(-50px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes zoomIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            @keyframes zoomOut { from { transform: scale(1.2); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            @keyframes bounceIn { 
                0% { transform: scale(0.3); opacity: 0; }
                50% { transform: scale(1.05); }
                70% { transform: scale(0.9); }
                100% { transform: scale(1); opacity: 1; }
            }
            @keyframes rotateIn { from { transform: rotate(-180deg) scale(0.8); opacity: 0; } to { transform: rotate(0) scale(1); opacity: 1; } }
        `;
        document.head.appendChild(style);
    }

    /**
     * Configurar Web Animations API
     */
    setupWebAnimations() {
        this.defaultAnimations = {
            fadeIn: [
                { opacity: 0 },
                { opacity: 1 }
            ],
            slideUp: [
                { transform: 'translateY(50px)', opacity: 0 },
                { transform: 'translateY(0)', opacity: 1 }
            ],
            zoomIn: [
                { transform: 'scale(0.8)', opacity: 0 },
                { transform: 'scale(1)', opacity: 1 }
            ]
        };

        this.defaultOptions = {
            duration: 600,
            easing: 'ease-out',
            fill: 'forwards'
        };
    }

    /**
     * Configurar animação de elemento
     */
    setupElementAnimation(element) {
        const animationType = element.dataset.animate;
        const delay = parseInt(element.dataset.delay) || 0;
        const duration = parseInt(element.dataset.duration) || 600;

        element.style.opacity = '0';
        element.style.transform = this.getInitialTransform(animationType);

        if (this.intersectionObserver) {
            this.intersectionObserver.observe(element);
        }
    }

    /**
     * Obter transformação inicial
     */
    getInitialTransform(animationType) {
        const transforms = {
            'slide-up': 'translateY(50px)',
            'slide-down': 'translateY(-50px)',
            'slide-left': 'translateX(50px)',
            'slide-right': 'translateX(-50px)',
            'zoom-in': 'scale(0.8)',
            'zoom-out': 'scale(1.2)',
            'rotate-in': 'rotate(-180deg) scale(0.8)'
        };

        return transforms[animationType] || 'none';
    }

    /**
     * Disparar animação
     */
    triggerAnimation(element) {
        const animationType = element.dataset.animate;
        const delay = parseInt(element.dataset.delay) || 0;

        setTimeout(() => {
            element.classList.add(animationType);
        }, delay);
    }

    /**
     * Registrar componente
     */
    registerComponent(name, factory) {
        this.components.set(name, factory);
    }

    /**
     * Inicializar componentes
     */
    initializeComponents() {
        this.components.forEach((factory, name) => {
            const elements = document.querySelectorAll(`[data-component="${name}"]`);
            elements.forEach(factory);
        });
    }

    /**
     * Criar componente modal
     */
    createModalComponent(element) {
        const triggers = document.querySelectorAll(`[data-modal="${element.id}"]`);
        const closeButtons = element.querySelectorAll('[data-modal-close]');
        
        triggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                this.openModal(element);
            });
        });

        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.closeModal(element);
            });
        });

        element.addEventListener('click', (e) => {
            if (e.target === element) {
                this.closeModal(element);
            }
        });
    }

    /**
     * Criar componente tabs
     */
    createTabsComponent(element) {
        const tabs = element.querySelectorAll('.tab-button');
        const panels = element.querySelectorAll('.tab-panel');

        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                this.switchTab(tabs, panels, index);
            });
        });
    }

    /**
     * Criar componente accordion
     */
    createAccordionComponent(element) {
        const items = element.querySelectorAll('.accordion-item');

        items.forEach(item => {
            const header = item.querySelector('.accordion-header');
            const content = item.querySelector('.accordion-content');

            header.addEventListener('click', () => {
                this.toggleAccordion(item, content);
            });
        });
    }

    /**
     * Criar componente carousel
     */
    createCarouselComponent(element) {
        const slides = element.querySelectorAll('.carousel-slide');
        const prevBtn = element.querySelector('.carousel-prev');
        const nextBtn = element.querySelector('.carousel-next');
        const indicators = element.querySelectorAll('.carousel-indicator');

        let currentSlide = 0;

        prevBtn?.addEventListener('click', () => {
            this.prevSlide(slides, indicators, currentSlide);
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        });

        nextBtn?.addEventListener('click', () => {
            this.nextSlide(slides, indicators, currentSlide);
            currentSlide = (currentSlide + 1) % slides.length;
        });

        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                this.goToSlide(slides, indicators, index);
                currentSlide = index;
            });
        });

        // Auto-play
        if (element.dataset.autoplay) {
            setInterval(() => {
                this.nextSlide(slides, indicators, currentSlide);
                currentSlide = (currentSlide + 1) % slides.length;
            }, parseInt(element.dataset.autoplay));
        }
    }

    /**
     * Criar componente tooltip
     */
    createTooltipComponent(element) {
        let tooltip = null;

        element.addEventListener('mouseenter', () => {
            tooltip = this.showTooltip(element);
        });

        element.addEventListener('mouseleave', () => {
            this.hideTooltip(tooltip);
        });
    }

    /**
     * Criar componente dropdown
     */
    createDropdownComponent(element) {
        const trigger = element.querySelector('.dropdown-trigger');
        const menu = element.querySelector('.dropdown-menu');

        trigger.addEventListener('click', () => {
            this.toggleDropdown(element, menu);
        });

        document.addEventListener('click', (e) => {
            if (!element.contains(e.target)) {
                this.closeDropdown(element, menu);
            }
        });
    }

    /**
     * Criar componente progress
     */
    createProgressComponent(element) {
        this.resizeObserver.observe(element);
        this.intersectionObserver.observe(element);
    }

    /**
     * Criar componente counter
     */
    createCounterComponent(element) {
        this.intersectionObserver.observe(element);
    }

    /**
     * Abrir modal
     */
    openModal(modal) {
        modal.classList.add('active');
        document.body.classList.add('modal-open');
        
        // Animação de entrada
        const dialog = modal.querySelector('.modal-dialog');
        if (dialog) {
            dialog.style.transform = 'scale(0.8)';
            dialog.style.opacity = '0';
            
            setTimeout(() => {
                dialog.style.transform = 'scale(1)';
                dialog.style.opacity = '1';
                dialog.style.transition = 'all 0.3s ease';
            }, 10);
        }
    }

    /**
     * Fechar modal
     */
    closeModal(modal) {
        const dialog = modal.querySelector('.modal-dialog');
        
        if (dialog) {
            dialog.style.transform = 'scale(0.8)';
            dialog.style.opacity = '0';
            
            setTimeout(() => {
                modal.classList.remove('active');
                document.body.classList.remove('modal-open');
            }, 300);
        } else {
            modal.classList.remove('active');
            document.body.classList.remove('modal-open');
        }
    }

    /**
     * Trocar tab
     */
    switchTab(tabs, panels, index) {
        tabs.forEach(tab => tab.classList.remove('active'));
        panels.forEach(panel => panel.classList.remove('active'));
        
        tabs[index].classList.add('active');
        panels[index].classList.add('active');
    }

    /**
     * Toggle accordion
     */
    toggleAccordion(item, content) {
        const isOpen = item.classList.contains('active');
        
        if (isOpen) {
            content.style.maxHeight = '0';
            item.classList.remove('active');
        } else {
            content.style.maxHeight = content.scrollHeight + 'px';
            item.classList.add('active');
        }
    }

    /**
     * Próximo slide
     */
    nextSlide(slides, indicators, current) {
        slides[current].classList.remove('active');
        indicators[current]?.classList.remove('active');
        
        const next = (current + 1) % slides.length;
        slides[next].classList.add('active');
        indicators[next]?.classList.add('active');
    }

    /**
     * Slide anterior
     */
    prevSlide(slides, indicators, current) {
        slides[current].classList.remove('active');
        indicators[current]?.classList.remove('active');
        
        const prev = (current - 1 + slides.length) % slides.length;
        slides[prev].classList.add('active');
        indicators[prev]?.classList.add('active');
    }

    /**
     * Ir para slide específico
     */
    goToSlide(slides, indicators, index) {
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        slides[index].classList.add('active');
        indicators[index]?.classList.add('active');
    }

    /**
     * Mostrar tooltip
     */
    showTooltip(element) {
        const text = element.dataset.tooltip;
        const position = element.dataset.tooltipPosition || 'top';
        
        const tooltip = document.createElement('div');
        tooltip.className = `tooltip tooltip-${position}`;
        tooltip.textContent = text;
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let top, left;
        
        switch (position) {
            case 'top':
                top = rect.top - tooltipRect.height - 8;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'bottom':
                top = rect.bottom + 8;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'left':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.left - tooltipRect.width - 8;
                break;
            case 'right':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.right + 8;
                break;
        }
        
        tooltip.style.top = top + 'px';
        tooltip.style.left = left + 'px';
        tooltip.classList.add('show');
        
        return tooltip;
    }

    /**
     * Esconder tooltip
     */
    hideTooltip(tooltip) {
        if (tooltip) {
            tooltip.classList.remove('show');
            setTimeout(() => tooltip.remove(), 200);
        }
    }

    /**
     * Toggle dropdown
     */
    toggleDropdown(element, menu) {
        const isOpen = element.classList.contains('active');
        
        if (isOpen) {
            this.closeDropdown(element, menu);
        } else {
            element.classList.add('active');
            menu.style.opacity = '0';
            menu.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                menu.style.opacity = '1';
                menu.style.transform = 'translateY(0)';
                menu.style.transition = 'all 0.2s ease';
            }, 10);
        }
    }

    /**
     * Fechar dropdown
     */
    closeDropdown(element, menu) {
        element.classList.remove('active');
    }

    /**
     * Animar progresso
     */
    animateProgress(element) {
        const bar = element.querySelector('.progress-bar');
        const value = element.dataset.value || 0;
        
        if (bar) {
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.width = value + '%';
                bar.style.transition = 'width 2s ease';
            }, 100);
        }
    }

    /**
     * Iniciar contador
     */
    startCounter(element) {
        const target = parseInt(element.dataset.target) || 0;
        const duration = parseInt(element.dataset.duration) || 2000;
        const increment = target / (duration / 16);
        
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            element.textContent = Math.floor(current);
        }, 16);
    }

    /**
     * Atualizar progresso do scroll
     */
    updateScrollProgress() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        const progressBars = document.querySelectorAll('.scroll-progress');
        progressBars.forEach(bar => {
            bar.style.width = scrollPercent + '%';
        });
    }

    /**
     * Lidar com animações de scroll
     */
    handleScrollAnimations() {
        const elements = document.querySelectorAll('[data-scroll-animation]');
        
        elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const inView = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (inView) {
                element.classList.add('in-view');
            }
        });
    }

    /**
     * Throttle function
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Disparar evento customizado
     */
    triggerEvent(eventName, data = {}) {
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
    }

    /**
     * Observar elementos animados
     */
    observeAnimatedElements() {
        const animatedElements = document.querySelectorAll('[data-animate]');
        animatedElements.forEach(element => {
            this.intersectionObserver.observe(element);
        });
    }

    /**
     * Destruir DOMManager
     */
    destroy() {
        this.mutationObserver?.disconnect();
        this.intersectionObserver?.disconnect();
        this.resizeObserver?.disconnect();
        
        this.observers.clear();
        this.animations.clear();
        this.eventListeners.clear();
        this.components.clear();
        
        console.log('🗑️ DOMManager destruído');
    }
}

// Exportar instância global
export const domManager = new DOMManager();