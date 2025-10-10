/**
 * ROUTER.JS - SISTEMA DE ROTEAMENTO SPA
 * Sistema avançado de roteamento client-side para Single Page Application
 */

export class Router {
    constructor(routes = []) {
        this.routes = new Map();
        this.currentRoute = null;
        this.basePath = '';
        this.isInitialized = false;
        
        // Callbacks
        this.onRouteChange = null;
        this.onRouteError = null;
        this.onBeforeRouteChange = null;
        
        // História de navegação
        this.history = [];
        this.historyIndex = -1;
        
        // Middlewares
        this.middlewares = [];
        
        // Configurar rotas
        this.registerRoutes(routes);
        
        console.log('🛤️ Router inicializado com', routes.length, 'rotas');
    }

    /**
     * Registrar rotas no sistema
     */
    registerRoutes(routes) {
        routes.forEach(route => this.registerRoute(route));
    }

    /**
     * Registrar uma rota individual
     */
    registerRoute(route) {
        const { path, component, name, meta = {} } = route;
        
        if (!path || !component) {
            throw new Error('Rota deve ter path e component');
        }

        // Converter path em regex para matching
        const paramNames = [];
        const regexPath = path
            .replace(/\/:([^\/]+)/g, (match, paramName) => {
                paramNames.push(paramName);
                return '/([^/]+)';
            })
            .replace(/\*/g, '(.*)');

        const regex = new RegExp(`^${regexPath}$`);

        this.routes.set(name || path, {
            ...route,
            regex,
            paramNames,
            meta: {
                requiresAuth: false,
                title: name || 'Plataforma ONG',
                ...meta
            }
        });

        console.log(`📍 Rota registrada: ${path} -> ${name || 'unnamed'}`);
    }

    /**
     * Inicializar sistema de roteamento
     */
    init() {
        if (this.isInitialized) {
            console.warn('⚠️ Router já foi inicializado');
            return;
        }

        // Listener para mudanças na URL
        window.addEventListener('popstate', this.handlePopState.bind(this));
        
        // Interceptar clicks em links
        document.addEventListener('click', this.handleLinkClick.bind(this));
        
        // Processar rota inicial
        this.handleInitialRoute();
        
        this.isInitialized = true;
        console.log('✅ Router inicializado e ativo');
    }

    /**
     * Manipular rota inicial
     */
    handleInitialRoute() {
        const path = this.getCurrentPath();
        this.navigateToPath(path, { replace: true });
    }

    /**
     * Obter path atual da URL
     */
    getCurrentPath() {
        const hash = window.location.hash;
        return hash ? hash.slice(1) : '/';
    }

    /**
     * Manipular mudanças no histórico do navegador
     */
    handlePopState(event) {
        const path = this.getCurrentPath();
        this.navigateToPath(path, { fromPopState: true });
    }

    /**
     * Interceptar clicks em links para navegação SPA
     */
    handleLinkClick(event) {
        const link = event.target.closest('a[href^="#"]');
        
        if (!link) return;
        
        event.preventDefault();
        
        const href = link.getAttribute('href');
        const path = href.slice(1); // Remove o #
        
        this.navigate(path);
    }

    /**
     * Navegar para uma rota específica
     */
    async navigate(path, options = {}) {
        const { replace = false, state = null } = options;
        
        try {
            // Executar callback de antes da mudança de rota
            if (this.onBeforeRouteChange) {
                const shouldContinue = await this.onBeforeRouteChange(path, this.currentRoute);
                if (shouldContinue === false) {
                    console.log('🚫 Navegação cancelada pelo middleware');
                    return false;
                }
            }

            // Atualizar URL no navegador
            if (!options.fromPopState) {
                const fullPath = `#${path}`;
                if (replace) {
                    window.history.replaceState(state, '', fullPath);
                } else {
                    window.history.pushState(state, '', fullPath);
                }
            }

            // Processar a rota
            await this.navigateToPath(path, options);
            
            return true;
            
        } catch (error) {
            console.error('❌ Erro na navegação:', error);
            this.handleRouteError(error, path);
            return false;
        }
    }

    /**
     * Processar navegação para um path específico
     */
    async navigateToPath(path, options = {}) {
        console.log(`🛤️ Navegando para: ${path}`);

        // Encontrar rota correspondente
        const matchResult = this.matchRoute(path);
        
        if (!matchResult) {
            throw new Error(`Rota não encontrada: ${path}`);
        }

        const { route, params } = matchResult;

        // Executar middlewares
        try {
            await this.runMiddlewares(route, params);
        } catch (error) {
            console.error('❌ Middleware falhou:', error);
            throw error;
        }

        // Verificar autenticação se necessário
        if (route.meta.requiresAuth && !this.isAuthenticated()) {
            console.log('🔒 Rota requer autenticação - redirecionando para login');
            this.navigate('/login');
            return;
        }

        // Salvar rota anterior
        const previousRoute = this.currentRoute;

        // Atualizar rota atual
        this.currentRoute = {
            ...route,
            params,
            query: this.parseQuery(),
            path
        };

        // Atualizar histórico interno
        this.updateHistory(path);

        // Atualizar título da página
        this.updatePageTitle(route.meta.title);

        // Renderizar componente da rota
        try {
            await this.renderRoute(route, params);
        } catch (error) {
            console.error('❌ Erro na renderização da rota:', error);
            throw error;
        }

        // Executar callback de mudança de rota
        if (this.onRouteChange) {
            this.onRouteChange(this.currentRoute, previousRoute);
        }

        console.log('✅ Navegação concluída:', this.currentRoute);
    }

    /**
     * Encontrar rota correspondente ao path
     */
    matchRoute(path) {
        for (const [name, route] of this.routes) {
            const match = path.match(route.regex);
            
            if (match) {
                const params = {};
                
                // Extrair parâmetros da URL
                route.paramNames.forEach((paramName, index) => {
                    params[paramName] = match[index + 1];
                });

                return { route, params };
            }
        }
        
        return null;
    }

    /**
     * Executar middlewares da rota
     */
    async runMiddlewares(route, params) {
        for (const middleware of this.middlewares) {
            await middleware(route, params);
        }

        // Middlewares específicos da rota
        if (route.middlewares) {
            for (const middleware of route.middlewares) {
                await middleware(route, params);
            }
        }
    }

    /**
     * Verificar se usuário está autenticado
     */
    isAuthenticated() {
        // Implementar lógica de autenticação
        return true; // Por enquanto sempre true
    }

    /**
     * Renderizar componente da rota
     */
    async renderRoute(route, params) {
        const contentContainer = document.getElementById('page-content');
        
        if (!contentContainer) {
            throw new Error('Container de conteúdo não encontrado');
        }

        // Mostrar loading
        contentContainer.innerHTML = `
            <div class="route-loading">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Carregando página...</p>
                </div>
            </div>
        `;

        try {
            let content;

            // Se component é uma função, executar
            if (typeof route.component === 'function') {
                content = await route.component(params, route.query);
            }
            // Se component é uma string, usar como HTML
            else if (typeof route.component === 'string') {
                content = route.component;
            }
            // Se component é um objeto com render method
            else if (route.component && typeof route.component.render === 'function') {
                content = await route.component.render(params, route.query);
            }
            else {
                throw new Error('Tipo de component inválido');
            }

            // Renderizar conteúdo
            contentContainer.innerHTML = content;

            // Executar scripts inline se houver
            this.executeInlineScripts(contentContainer);

            // Executar callback pós-renderização da rota
            if (route.onAfterRender) {
                await route.onAfterRender(contentContainer, params);
            }

        } catch (error) {
            console.error('❌ Erro na renderização:', error);
            
            // Renderizar página de erro
            contentContainer.innerHTML = `
                <div class="error-page">
                    <h1>Erro 500</h1>
                    <p>Não foi possível carregar a página.</p>
                    <button onclick="window.location.reload()" class="btn btn-primary">
                        Tentar Novamente
                    </button>
                </div>
            `;
        }
    }

    /**
     * Executar scripts inline no conteúdo renderizado
     */
    executeInlineScripts(container) {
        const scripts = container.querySelectorAll('script');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            if (script.src) {
                newScript.src = script.src;
            } else {
                newScript.textContent = script.textContent;
            }
            script.parentNode.replaceChild(newScript, script);
        });
    }

    /**
     * Atualizar histórico interno
     */
    updateHistory(path) {
        // Remover itens após índice atual se não estamos no final
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }

        // Adicionar nova entrada
        this.history.push({
            path,
            timestamp: Date.now()
        });

        this.historyIndex = this.history.length - 1;

        // Limitar tamanho do histórico
        if (this.history.length > 100) {
            this.history = this.history.slice(-50);
            this.historyIndex = this.history.length - 1;
        }
    }

    /**
     * Atualizar título da página
     */
    updatePageTitle(title) {
        document.title = title || 'Plataforma ONG';
    }

    /**
     * Parsear query string da URL
     */
    parseQuery() {
        const queryString = window.location.search;
        const params = new URLSearchParams(queryString);
        const query = {};
        
        for (const [key, value] of params.entries()) {
            query[key] = value;
        }
        
        return query;
    }

    /**
     * Manipular erros de roteamento
     */
    handleRouteError(error, path) {
        console.error('❌ Erro de roteamento:', error);
        
        if (this.onRouteError) {
            this.onRouteError(error, path);
        } else {
            // Fallback: navegar para página de erro
            this.navigate('/erro/404');
        }
    }

    /**
     * Adicionar middleware global
     */
    addMiddleware(middleware) {
        this.middlewares.push(middleware);
    }

    /**
     * Voltar na história
     */
    back() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const previousPath = this.history[this.historyIndex].path;
            this.navigate(previousPath, { replace: true });
        } else {
            // Se não há história, ir para home
            this.navigate('/');
        }
    }

    /**
     * Avançar na história
     */
    forward() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const nextPath = this.history[this.historyIndex].path;
            this.navigate(nextPath, { replace: true });
        }
    }

    /**
     * Recarregar rota atual
     */
    reload() {
        if (this.currentRoute) {
            this.navigateToPath(this.currentRoute.path, { replace: true });
        }
    }

    /**
     * Obter rota atual
     */
    getCurrentRoute() {
        return this.currentRoute;
    }

    /**
     * Obter histórico de navegação
     */
    getHistory() {
        return [...this.history];
    }

    /**
     * Verificar se pode voltar
     */
    canGoBack() {
        return this.historyIndex > 0;
    }

    /**
     * Verificar se pode avançar
     */
    canGoForward() {
        return this.historyIndex < this.history.length - 1;
    }

    /**
     * Destruir router (cleanup)
     */
    destroy() {
        window.removeEventListener('popstate', this.handlePopState);
        document.removeEventListener('click', this.handleLinkClick);
        
        this.routes.clear();
        this.middlewares = [];
        this.history = [];
        this.currentRoute = null;
        this.isInitialized = false;
        
        console.log('🗑️ Router destruído');
    }
}

// Exportar instância singleton se necessário
export const router = new Router();