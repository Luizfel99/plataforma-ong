/**
 * APP.JS - APLICAÇÃO PRINCIPAL SPA
 * Sistema de Single Page Application com roteamento e gerenciamento de estado
 */

import { Router } from './router/router.js';
import { routes } from './router/routes.js';
import { stateManager } from './state/state-manager.js';
import { domManager } from './dom/dom-manager.js';
import { formManager } from './forms/form-manager.js';
import { validator } from './forms/validator.js';

class SPAApplication {
    constructor() {
        this.router = null;
        this.currentPage = null;
        this.isInitialized = false;
        this.services = new Map();
        
        this.initializeApp();
    }

    /**
     * Inicializar aplicação
     */
    async initializeApp() {
        try {
            console.log('🚀 Iniciando aplicação SPA...');
            
            // Mostrar loading
            this.showLoading();
            
            // Aguardar DOM estar pronto
            await this.waitForDOM();
            
            // Inicializar serviços
            await this.initializeServices();
            
            // Configurar router
            this.setupRouter();
            
            // Configurar eventos globais
            this.setupGlobalEvents();
            
            // Configurar estado inicial
            this.setupInitialState();
            
            // Marcar como inicializado
            this.isInitialized = true;
            
            // Esconder loading
            this.hideLoading();
            
            console.log('✅ Aplicação SPA inicializada com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar aplicação:', error);
            this.showError('Erro ao carregar a aplicação');
        }
    }

    /**
     * Aguardar DOM estar pronto
     */
    waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    /**
     * Inicializar serviços
     */
    async initializeServices() {
        // Registrar serviços principais
        this.services.set('state', stateManager);
        this.services.set('dom', domManager);
        this.services.set('forms', formManager);
        this.services.set('validator', validator);
        
        // Configurar integração entre serviços
        this.setupServiceIntegration();
        
        console.log('⚙️ Serviços inicializados:', Array.from(this.services.keys()));
    }

    /**
     * Configurar integração entre serviços
     */
    setupServiceIntegration() {
        // Integrar estado com notificações
        stateManager.watch('app.notifications', (notifications) => {
            this.renderNotifications(notifications);
        });

        // Integrar estado com loading
        stateManager.watch('app.loading', (loading) => {
            if (loading) {
                this.showLoading();
            } else {
                this.hideLoading();
            }
        });

        // Integrar estado com erro
        stateManager.watch('app.error', (error) => {
            if (error) {
                this.showError(error);
                stateManager.set('app.error', null, { silent: true });
            }
        });

        // Integrar estado com tema
        stateManager.watch('user.preferences.theme', (theme) => {
            document.documentElement.setAttribute('data-theme', theme);
        });

        // Configurar auto-save de formulários
        this.setupFormAutoSave();
    }

    /**
     * Configurar auto-save de formulários
     */
    setupFormAutoSave() {
        const formTypes = ['contact', 'volunteer', 'donation'];
        
        formTypes.forEach(formType => {
            const form = document.getElementById(`${formType}-form`);
            if (form) {
                // Salvar rascunho a cada 30 segundos
                setInterval(() => {
                    const formData = new FormData(form);
                    const data = Object.fromEntries(formData);
                    
                    if (Object.keys(data).length > 0) {
                        stateManager.dispatch('SAVE_FORM_DRAFT', {
                            formType,
                            data
                        });
                    }
                }, 30000);

                // Restaurar rascunho se existir
                const draft = stateManager.get(`forms.${formType}.draft`);
                if (draft && draft.data) {
                    this.restoreFormDraft(form, draft.data);
                }
            }
        });
    }

    /**
     * Restaurar rascunho de formulário
     */
    restoreFormDraft(form, data) {
        Object.keys(data).forEach(key => {
            const field = form.querySelector(`[name="${key}"]`);
            if (field) {
                field.value = data[key];
            }
        });

        this.showNotification('Rascunho restaurado automaticamente', 'info');
    }

    /**
     * Configurar router
     */
    setupRouter() {
        this.router = new Router({
            container: '#app-content',
            basePath: '',
            enableHistory: true,
            scrollToTop: true
        });

        // Registrar todas as rotas
        routes.forEach(route => {
            this.router.addRoute(route.path, route.handler, route);
        });

        // Configurar middlewares globais
        this.router.beforeEach((to, from, next) => {
            console.log(`🧭 Navegando de ${from?.path || 'início'} para ${to.path}`);
            
            // Rastrear navegação
            stateManager.dispatch('TRACK_PAGE_VIEW', { page: to.path });
            
            // Limpar erros anteriores
            stateManager.set('app.error', null);
            
            next();
        });

        this.router.afterEach((to, from) => {
            // Atualizar título da página
            if (to.meta?.title) {
                document.title = `${to.meta.title} - Plataforma ONG`;
            }
            
            // Atualizar breadcrumbs
            this.updateBreadcrumbs(to.meta?.breadcrumbs);
            
            // Atualizar estado da página atual
            stateManager.set('app.currentPage', to.path);
            
            // Rastrear analytics
            this.trackPageView(to.path);
        });

        // Inicializar router
        this.router.init();
    }

    /**
     * Configurar estado inicial
     */
    setupInitialState() {
        // Aplicar tema salvo
        const theme = stateManager.get('user.preferences.theme');
        if (theme) {
            document.documentElement.setAttribute('data-theme', theme);
        }

        // Configurar tempo de sessão
        const sessionStart = stateManager.get('analytics.sessionStart');
        if (sessionStart) {
            const timeSpent = Date.now() - sessionStart;
            stateManager.set('analytics.timeSpent', timeSpent);
        }
    }

    /**
     * Configurar eventos globais
     */
    setupGlobalEvents() {
        // Evento de erro global
        window.addEventListener('error', (event) => {
            console.error('❌ Erro global:', event.error);
            this.handleError(event.error);
        });

        // Evento de promise rejeitada
        window.addEventListener('unhandledrejection', (event) => {
            console.error('❌ Promise rejeitada:', event.reason);
            this.handleError(event.reason);
        });

        // Eventos de navegação
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a[href]');
            if (link && this.isInternalLink(link)) {
                event.preventDefault();
                this.router.navigateTo(link.getAttribute('href'));
                
                // Rastrear clique
                stateManager.dispatch('TRACK_INTERACTION', {
                    type: 'navigation',
                    target: link.getAttribute('href'),
                    text: link.textContent.trim()
                });
            }
        });

        // Eventos de formulário
        document.addEventListener('submit', (event) => {
            this.handleFormSubmit(event);
        });

        // Eventos de teclado
        document.addEventListener('keydown', (event) => {
            this.handleKeyDown(event);
        });

        // Eventos de mudança de foco (para analytics)
        window.addEventListener('focus', () => {
            stateManager.set('app.isActive', true);
        });

        window.addEventListener('blur', () => {
            stateManager.set('app.isActive', false);
        });

        // Evento antes de sair da página
        window.addEventListener('beforeunload', () => {
            const timeSpent = Date.now() - stateManager.get('analytics.sessionStart');
            stateManager.set('analytics.timeSpent', timeSpent);
        });

        console.log('🎯 Eventos globais configurados');
    }

    /**
     * Verificar se link é interno
     */
    isInternalLink(link) {
        const href = link.getAttribute('href');
        return href && (
            href.startsWith('/') || 
            href.startsWith('#/') || 
            href.startsWith(window.location.origin)
        );
    }

    /**
     * Lidar com submit de formulário
     */
    handleFormSubmit(event) {
        const form = event.target;
        
        // Rastrear submissão
        stateManager.dispatch('TRACK_INTERACTION', {
            type: 'form_submit',
            form: form.id || form.className,
            page: stateManager.get('app.currentPage')
        });

        if (form.dataset.ajax === 'true') {
            event.preventDefault();
            this.processAjaxForm(form);
        }
    }

    /**
     * Lidar com teclas pressionadas
     */
    handleKeyDown(event) {
        // ESC para fechar modais
        if (event.key === 'Escape') {
            this.closeActiveModal();
        }
        
        // Atalhos de teclado
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 'k':
                    event.preventDefault();
                    this.openSearch();
                    break;
                case '/':
                    event.preventDefault();
                    this.openHelp();
                    break;
            }
        }

        // Rastrear uso de atalhos
        if ((event.ctrlKey || event.metaKey) && event.key !== 'Control' && event.key !== 'Meta') {
            stateManager.dispatch('TRACK_INTERACTION', {
                type: 'keyboard_shortcut',
                key: event.key,
                modifier: event.ctrlKey ? 'ctrl' : 'cmd'
            });
        }
    }

    /**
     * Processar formulário AJAX
     */
    async processAjaxForm(form) {
        try {
            stateManager.set('app.loading', true);
            
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: form.method || 'POST',
                body: formData
            });
            
            if (response.ok) {
                stateManager.dispatch('ADD_NOTIFICATION', {
                    message: 'Formulário enviado com sucesso!',
                    type: 'success'
                });
                
                form.reset();
                
                // Limpar rascunho
                const formType = form.id.replace('-form', '');
                stateManager.dispatch('CLEAR_FORM_DRAFT', { formType });
            } else {
                throw new Error('Erro ao enviar formulário');
            }
        } catch (error) {
            console.error('❌ Erro no formulário AJAX:', error);
            stateManager.dispatch('ADD_NOTIFICATION', {
                message: 'Erro ao enviar formulário',
                type: 'error'
            });
        } finally {
            stateManager.set('app.loading', false);
        }
    }

    /**
     * Fechar modal ativo
     */
    closeActiveModal() {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            activeModal.classList.remove('active');
            document.body.classList.remove('modal-open');
            
            // Atualizar estado
            stateManager.set('app.modals.active', null);
        }
    }

    /**
     * Abrir pesquisa
     */
    openSearch() {
        const searchModal = document.getElementById('search-modal');
        if (searchModal) {
            searchModal.classList.add('active');
            const searchInput = searchModal.querySelector('input[type="search"]');
            if (searchInput) {
                searchInput.focus();
            }
            
            // Atualizar estado
            stateManager.set('app.modals.active', 'search');
        }
    }

    /**
     * Abrir ajuda
     */
    openHelp() {
        const helpModal = document.getElementById('help-modal');
        if (helpModal) {
            helpModal.classList.add('active');
            stateManager.set('app.modals.active', 'help');
        }
    }

    /**
     * Renderizar notificações
     */
    renderNotifications(notifications) {
        const container = document.querySelector('.notifications-container');
        if (!container) return;

        // Limpar notificações antigas
        container.innerHTML = '';

        // Renderizar notificações ativas
        notifications.forEach(notification => {
            const element = document.createElement('div');
            element.className = `notification notification-${notification.type}`;
            element.innerHTML = `
                <div class="notification-content">
                    <span class="notification-message">${notification.message}</span>
                    <button class="notification-close" aria-label="Fechar notificação">×</button>
                </div>
            `;

            // Adicionar evento de fechar
            element.querySelector('.notification-close').addEventListener('click', () => {
                stateManager.dispatch('REMOVE_NOTIFICATION', { id: notification.id });
            });

            container.appendChild(element);

            // Animar entrada
            setTimeout(() => element.classList.add('show'), 100);
        });
    }

    /**
     * Atualizar breadcrumbs
     */
    updateBreadcrumbs(breadcrumbs) {
        const breadcrumbContainer = document.querySelector('.breadcrumb');
        if (!breadcrumbContainer || !breadcrumbs) return;

        breadcrumbContainer.innerHTML = breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return `
                <li class="breadcrumb-item ${isLast ? 'active' : ''}">
                    ${isLast ? crumb.title : `<a href="${crumb.path}">${crumb.title}</a>`}
                </li>
            `;
        }).join('');
    }

    /**
     * Rastrear visualização de página
     */
    trackPageView(path) {
        console.log('📊 Página visualizada:', path);
        
        // Enviar para analytics (simulado)
        if (window.gtag) {
            window.gtag('config', 'GA_TRACKING_ID', {
                page_path: path
            });
        }
    }

    /**
     * Lidar com erro
     */
    handleError(error) {
        console.error('❌ Erro na aplicação:', error);
        stateManager.dispatch('ADD_NOTIFICATION', {
            message: 'Ocorreu um erro inesperado',
            type: 'error'
        });
    }

    /**
     * Mostrar loading
     */
    showLoading() {
        document.body.classList.add('loading');
        
        const loadingElement = document.querySelector('.loading-screen');
        if (loadingElement) {
            loadingElement.style.display = 'flex';
        }
    }

    /**
     * Esconder loading
     */
    hideLoading() {
        document.body.classList.remove('loading');
        
        const loadingElement = document.querySelector('.loading-screen');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    /**
     * Mostrar erro
     */
    showError(message) {
        stateManager.dispatch('ADD_NOTIFICATION', {
            message,
            type: 'error'
        });
    }

    /**
     * Mostrar sucesso
     */
    showSuccess(message) {
        stateManager.dispatch('ADD_NOTIFICATION', {
            message,
            type: 'success'
        });
    }

    /**
     * Mostrar notificação
     */
    showNotification(message, type = 'info') {
        stateManager.dispatch('ADD_NOTIFICATION', {
            message,
            type
        });
    }

    /**
     * Obter serviço
     */
    getService(name) {
        return this.services.get(name);
    }

    /**
     * Obter instância do router
     */
    getRouter() {
        return this.router;
    }

    /**
     * Obter estado
     */
    getState(path) {
        return stateManager.get(path);
    }

    /**
     * Definir estado
     */
    setState(path, value, options) {
        return stateManager.set(path, value, options);
    }

    /**
     * Verificar se aplicação está inicializada
     */
    isReady() {
        return this.isInitialized;
    }

    /**
     * Debug da aplicação
     */
    debug() {
        console.log('🔍 Debug da aplicação:');
        console.log('- Inicializada:', this.isInitialized);
        console.log('- Serviços:', Array.from(this.services.keys()));
        console.log('- Página atual:', stateManager.get('app.currentPage'));
        console.log('- Estado:', stateManager.exportState());
        
        // Debug dos serviços
        stateManager.debug();
    }

    /**
     * Destruir aplicação
     */
    destroy() {
        if (this.router) {
            this.router.destroy();
        }
        
        // Destruir serviços
        this.services.forEach(service => {
            if (service.destroy) {
                service.destroy();
            }
        });
        
        this.services.clear();
        this.isInitialized = false;
        
        console.log('🗑️ Aplicação destruída');
    }
}

/**
 * CLASSE PRINCIPAL DA APLICAÇÃO SPA
 */
class SPAApplication {
    constructor() {
        // Estado inicial da aplicação
        this.state = {
            currentRoute: '/',
            isLoading: false,
            isOnline: navigator.onLine,
            user: null,
            lastSaved: null,
            theme: 'light',
            isAuthenticated: false,
            pendingForms: [],
            searchQuery: '',
            filters: {},
            viewport: this.getViewportSize(),
            performance: {
                loadTime: Date.now(),
                interactions: 0,
                errors: 0
            }
        };

        // Serviços da aplicação
        this.services = {
            router: null,
            domManager: null,
            formManager: null,
            stateManager: null,
            navigation: null,
            notifications: null,
            dataService: null,
            storage: null,
            analytics: null
        };
        
        // Event listeners e observers
        this.eventListeners = new Map();
        this.stateObservers = new Set();
        
        this.log('🚀 Plataforma ONG SPA inicialized');
    }

    /**
     * Inicialização principal da aplicação
     */
    async init() {
        try {
            this.log('🔄 Iniciando aplicação...');
            
            // Verificar compatibilidade do navegador
            this.checkBrowserCompatibility();
            
            // Inicializar serviços core
            await this.initializeServices();
            
            // Configurar event listeners globais
            this.setupGlobalEventListeners();
            
            // Carregar estado salvo
            await this.loadSavedState();
            
            // Inicializar componentes
            await this.initializeComponents();
            
            // Configurar roteamento
            this.setupRouting();
            
            // Remover loading screen
            this.removeLoadingScreen();
            
            // Marcar como inicializado
            this.isInitialized = true;
            
            // Disparar evento de aplicação pronta
            this.dispatchEvent('app:ready', { app: this });
            
            this.log('✅ Aplicação inicializada com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro na inicialização da aplicação:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Verificar compatibilidade do navegador
     */
    checkBrowserCompatibility() {
        const requiredFeatures = [
            'fetch',
            'Promise',
            'localStorage',
            'addEventListener',
            'querySelector'
        ];

        const unsupportedFeatures = requiredFeatures.filter(feature => 
            !(feature in window) && !(feature in window.prototype)
        );

        if (unsupportedFeatures.length > 0) {
            throw new Error(`Navegador não suportado. Recursos ausentes: ${unsupportedFeatures.join(', ')}`);
        }

        this.log('✅ Navegador compatível');
    }

    /**
     * Inicializar serviços principais
     */
    async initializeServices() {
        this.log('🔧 Inicializando serviços...');

        // Storage Manager
        this.services.storage = new StorageManager(this.config.storagePrefix);
        
        // Data Service
        this.services.dataService = new DataService(this.config.apiBaseUrl);
        
        // Notification Service
        if (this.config.enableNotifications) {
            this.services.notifications = new NotificationService();
            await this.services.notifications.init();
        }
        
        // Analytics Service
        if (this.config.enableAnalytics) {
            this.services.analytics = new Analytics();
            this.services.analytics.init();
        }
        
        this.log('✅ Serviços inicializados');
    }

    /**
     * Configurar event listeners globais
     */
    setupGlobalEventListeners() {
        this.log('🎧 Configurando event listeners globais...');

        // Listener para mudanças na conectividade
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
        
        // Listener para mudanças de visibilidade da página
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        
        // Listener para antes de descarregar a página
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        
        // Listener para erros não capturados
        window.addEventListener('error', this.handleGlobalError.bind(this));
        window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
        
        // Listener para redimensionamento da janela
        const resizeHandler = this.debounce(this.handleResize.bind(this), 250);
        window.addEventListener('resize', resizeHandler);
        
        // Listener para scroll
        const scrollHandler = this.throttle(this.handleScroll.bind(this), 100);
        window.addEventListener('scroll', scrollHandler);
        
        // Listener para teclas do teclado
        document.addEventListener('keydown', this.handleKeydown.bind(this));
        
        this.log('✅ Event listeners configurados');
    }

    /**
     * Carregar estado salvo da aplicação
     */
    async loadSavedState() {
        this.log('💾 Carregando estado salvo...');

        try {
            const savedState = this.services.storage.get('app_state');
            if (savedState) {
                this.state = { ...this.state, ...savedState };
                this.log('✅ Estado carregado:', this.state);
            }
        } catch (error) {
            console.warn('⚠️ Erro ao carregar estado salvo:', error);
        }
    }

    /**
     * Salvar estado atual da aplicação
     */
    saveState() {
        if (this.config.autoSave) {
            try {
                this.services.storage.set('app_state', {
                    theme: this.state.theme,
                    language: this.state.language,
                    currentUser: this.state.currentUser
                });
            } catch (error) {
                console.warn('⚠️ Erro ao salvar estado:', error);
            }
        }
    }

    /**
     * Inicializar componentes da interface
     */
    async initializeComponents() {
        this.log('🧩 Inicializando componentes...');

        // Navigation Component
        this.services.navigation = new Navigation();
        await this.services.navigation.init();
        
        // Outros componentes serão inicializados aqui conforme necessário
        
        this.log('✅ Componentes inicializados');
    }

    /**
     * Configurar sistema de roteamento
     */
    setupRouting() {
        this.log('🛤️ Configurando roteamento...');

        this.services.router = new Router(routes);
        
        // Configurar callbacks do router
        this.services.router.onRouteChange = this.handleRouteChange.bind(this);
        this.services.router.onRouteError = this.handleRouteError.bind(this);
        
        // Inicializar router
        this.services.router.init();
        
        this.log('✅ Roteamento configurado');
    }

    /**
     * Remover tela de loading
     */
    removeLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    loadingScreen.remove();
                }, 300);
            }, 500);
        }
    }

    /**
     * Manipular mudança de rota
     */
    handleRouteChange(route, params) {
        this.log(`🛤️ Rota alterada: ${route.path}`, params);
        
        this.setState({ 
            currentPage: route.name,
            isLoading: false 
        });
        
        // Analytics
        if (this.services.analytics) {
            this.services.analytics.trackPageView(route.path, route.name);
        }
        
        // Atualizar navegação ativa
        if (this.services.navigation) {
            this.services.navigation.updateActiveRoute(route.name);
        }
        
        // Scroll para o topo
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Manipular erro de rota
     */
    handleRouteError(error, path) {
        console.error('❌ Erro de roteamento:', error, path);
        
        if (this.services.notifications) {
            this.services.notifications.error('Página não encontrada', {
                description: `A página "${path}" não foi encontrada.`
            });
        }
        
        // Redirecionar para home
        this.services.router.navigate('/');
    }

    /**
     * Manipular estado online
     */
    handleOnline() {
        this.log('🌐 Aplicação online');
        
        if (this.services.notifications) {
            this.services.notifications.success('Conexão restaurada', {
                description: 'Você está novamente online!'
            });
        }
        
        // Sincronizar dados pendentes
        this.syncPendingData();
    }

    /**
     * Manipular estado offline
     */
    handleOffline() {
        this.log('📱 Aplicação offline');
        
        if (this.services.notifications) {
            this.services.notifications.warning('Sem conexão', {
                description: 'Você está trabalhando offline. Algumas funcionalidades podem estar limitadas.'
            });
        }
    }

    /**
     * Manipular mudança de visibilidade da página
     */
    handleVisibilityChange() {
        if (document.hidden) {
            this.log('👁️ Página oculta');
            this.saveState();
        } else {
            this.log('👁️ Página visível');
            // Verificar atualizações se necessário
        }
    }

    /**
     * Manipular antes de descarregar a página
     */
    handleBeforeUnload(event) {
        this.saveState();
        
        // Se houver dados não salvos, avisar o usuário
        if (this.hasUnsavedData()) {
            event.preventDefault();
            event.returnValue = 'Você tem alterações não salvas. Deseja realmente sair?';
            return event.returnValue;
        }
    }

    /**
     * Manipular erros globais
     */
    handleGlobalError(event) {
        console.error('❌ Erro global:', event.error);
        
        if (this.services.analytics) {
            this.services.analytics.trackError(event.error);
        }
        
        if (this.services.notifications) {
            this.services.notifications.error('Ops! Algo deu errado', {
                description: 'Ocorreu um erro inesperado. Nossa equipe foi notificada.'
            });
        }
    }

    /**
     * Manipular promises rejeitadas
     */
    handleUnhandledRejection(event) {
        console.error('❌ Promise rejeitada:', event.reason);
        
        if (this.services.analytics) {
            this.services.analytics.trackError(event.reason);
        }
    }

    /**
     * Manipular redimensionamento da janela
     */
    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.log(`📐 Janela redimensionada: ${width}x${height}`);
        
        // Atualizar estado da aplicação se necessário
        this.dispatchEvent('window:resize', { width, height });
    }

    /**
     * Manipular scroll
     */
    handleScroll() {
        const scrollY = window.scrollY;
        const backToTopBtn = document.getElementById('back-to-top');
        
        // Mostrar/ocultar botão de voltar ao topo
        if (backToTopBtn) {
            if (scrollY > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }
        
        this.dispatchEvent('window:scroll', { scrollY });
    }

    /**
     * Manipular teclas do teclado
     */
    handleKeydown(event) {
        // Atalhos de teclado globais
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 'k':
                    event.preventDefault();
                    this.openSearchModal();
                    break;
                case 's':
                    event.preventDefault();
                    this.saveCurrentData();
                    break;
            }
        }
        
        // ESC para fechar modais
        if (event.key === 'Escape') {
            this.closeActiveModal();
        }
    }

    /**
     * Manipular erro de inicialização
     */
    handleInitializationError(error) {
        // Remover loading screen mesmo com erro
        this.removeLoadingScreen();
        
        // Mostrar mensagem de erro amigável
        const errorMessage = document.createElement('div');
        errorMessage.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                text-align: center;
                max-width: 400px;
                z-index: 9999;
            ">
                <h2 style="color: #dc3545; margin-bottom: 1rem;">
                    Erro de Inicialização
                </h2>
                <p style="margin-bottom: 1rem;">
                    Não foi possível carregar a aplicação. Tente recarregar a página.
                </p>
                <button onclick="window.location.reload()" style="
                    background: #007bff;
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    cursor: pointer;
                ">
                    Recarregar Página
                </button>
            </div>
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 9998;
            "></div>
        `;
        
        document.body.appendChild(errorMessage);
    }

    /**
     * Atualizar estado da aplicação
     */
    setState(newState) {
        const prevState = { ...this.state };
        this.state = { ...this.state, ...newState };
        
        this.log('📊 Estado atualizado:', { prevState, newState: this.state });
        
        // Notificar observadores
        this.notifyStateObservers(prevState, this.state);
        
        // Salvar estado automaticamente
        this.saveState();
    }

    /**
     * Obter estado atual
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Adicionar observador de estado
     */
    addStateObserver(callback) {
        this.stateObservers.add(callback);
        return () => this.stateObservers.delete(callback);
    }

    /**
     * Notificar observadores de mudança de estado
     */
    notifyStateObservers(prevState, newState) {
        this.stateObservers.forEach(callback => {
            try {
                callback(newState, prevState);
            } catch (error) {
                console.error('❌ Erro em observador de estado:', error);
            }
        });
    }

    /**
     * Disparar evento customizado
     */
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        window.dispatchEvent(event);
        this.log(`📡 Evento disparado: ${eventName}`, detail);
    }

    /**
     * Verificar se há dados não salvos
     */
    hasUnsavedData() {
        // Implementar lógica específica para verificar dados não salvos
        return false;
    }

    /**
     * Sincronizar dados pendentes
     */
    async syncPendingData() {
        try {
            const pendingData = this.services.storage.get('pending_sync') || [];
            
            if (pendingData.length > 0) {
                this.log(`🔄 Sincronizando ${pendingData.length} itens pendentes...`);
                
                for (const item of pendingData) {
                    await this.services.dataService.sync(item);
                }
                
                this.services.storage.remove('pending_sync');
                this.log('✅ Sincronização concluída');
            }
        } catch (error) {
            console.error('❌ Erro na sincronização:', error);
        }
    }

    /**
     * Abrir modal de busca
     */
    openSearchModal() {
        this.log('🔍 Abrindo modal de busca...');
        // Implementar modal de busca
    }

    /**
     * Salvar dados atuais
     */
    saveCurrentData() {
        this.log('💾 Salvando dados atuais...');
        this.saveState();
        
        if (this.services.notifications) {
            this.services.notifications.success('Dados salvos');
        }
    }

    /**
     * Fechar modal ativo
     */
    closeActiveModal() {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            // Implementar fechamento de modal
            this.log('❌ Fechando modal ativo');
        }
    }

    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
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
     * Log de debug
     */
    log(...args) {
        if (this.debug) {
            console.log('[SPA App]', ...args);
        }
    }

    /**
     * Obter informações da aplicação
     */
    getInfo() {
        return {
            name: this.config.appName,
            version: this.version,
            isInitialized: this.isInitialized,
            state: this.getState(),
            services: Object.keys(this.services).reduce((acc, key) => {
                acc[key] = this.services[key] ? 'initialized' : 'not initialized';
                return acc;
            }, {})
        };
    }
}

// ===== INICIALIZAÇÃO DA APLICAÇÃO =====

let app;

/**
 * Inicializar aplicação quando DOM estiver pronto
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌟 DOM carregado - Iniciando Plataforma ONG SPA');
    
    try {
        app = new SPAApplication();
        await app.init();
        
        // Disponibilizar globalmente para debugging
        if (window.DEBUG) {
            window.app = app;
            console.log('🔧 App disponível globalmente como window.app');
        }
        
    } catch (error) {
        console.error('💥 Falha crítica na inicialização:', error);
    }
});

// ===== EXPORTS =====
export { SPAApplication, app };

// ===== GLOBAL ERROR HANDLING =====
window.addEventListener('error', (event) => {
    console.error('🚨 Erro JavaScript:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Promise rejeitada:', event.reason);
    event.preventDefault();
});