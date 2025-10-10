/**
 * STATE-MANAGER.JS - SISTEMA DE GERENCIAMENTO DE ESTADO E ARMAZENAMENTO LOCAL
 * Gerenciamento reativo de estado com persistência local
 */

export class StateManager {
    constructor() {
        this.state = new Map();
        this.listeners = new Map();
        this.watchers = new Map();
        this.history = [];
        this.maxHistorySize = 50;
        this.storagePrefix = 'plataforma_ong_';
        
        this.initializeState();
        console.log('✅ StateManager inicializado');
    }

    /**
     * Inicializar estado
     */
    initializeState() {
        // Carregar estado do localStorage
        this.loadFromStorage();
        
        // Configurar estado inicial padrão
        this.setDefaultState();
        
        // Configurar auto-save
        this.setupAutoSave();
        
        // Configurar sincronização entre abas
        this.setupTabSync();
    }

    /**
     * Configurar estado padrão
     */
    setDefaultState() {
        const defaultState = {
            // Configurações do usuário
            user: {
                preferences: {
                    theme: 'light',
                    language: 'pt-BR',
                    notifications: true,
                    animationsEnabled: true
                },
                profile: null,
                isLoggedIn: false
            },
            
            // Configurações da aplicação
            app: {
                currentPage: 'home',
                loading: false,
                error: null,
                notifications: [],
                modals: {
                    active: null,
                    history: []
                }
            },
            
            // Cache de dados
            cache: {
                projects: null,
                blogPosts: null,
                donations: null,
                lastUpdate: null
            },
            
            // Formulários
            forms: {
                contact: {
                    draft: null,
                    lastSaved: null
                },
                volunteer: {
                    draft: null,
                    lastSaved: null
                },
                donation: {
                    draft: null,
                    lastSaved: null
                }
            },
            
            // Analytics
            analytics: {
                pageViews: new Map(),
                interactions: [],
                sessionStart: Date.now(),
                timeSpent: 0
            }
        };

        // Aplicar estado padrão apenas para chaves não existentes
        Object.keys(defaultState).forEach(key => {
            if (!this.state.has(key)) {
                this.state.set(key, defaultState[key]);
            }
        });
    }

    /**
     * Obter valor do estado
     */
    get(path) {
        if (typeof path === 'string') {
            const keys = path.split('.');
            let value = this.state;
            
            for (const key of keys) {
                if (value instanceof Map) {
                    value = value.get(key);
                } else if (value && typeof value === 'object') {
                    value = value[key];
                } else {
                    return undefined;
                }
                
                if (value === undefined) break;
            }
            
            return value;
        }
        
        return this.state.get(path);
    }

    /**
     * Definir valor no estado
     */
    set(path, value, options = {}) {
        const { silent = false, persist = true, history = true } = options;
        
        // Salvar estado anterior para histórico
        if (history) {
            this.saveToHistory();
        }
        
        if (typeof path === 'string') {
            this.setNested(path, value);
        } else {
            this.state.set(path, value);
        }
        
        // Persistir no localStorage
        if (persist) {
            this.saveToStorage(path);
        }
        
        // Notificar listeners
        if (!silent) {
            this.notifyListeners(path, value);
        }
        
        // Executar watchers
        this.executeWatchers(path, value);
        
        console.log(`📊 Estado atualizado: ${path}`, value);
    }

    /**
     * Definir valor aninhado
     */
    setNested(path, value) {
        const keys = path.split('.');
        let current = this.state;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            
            if (current instanceof Map) {
                if (!current.has(key)) {
                    current.set(key, {});
                }
                current = current.get(key);
            } else {
                if (!current[key]) {
                    current[key] = {};
                }
                current = current[key];
            }
        }
        
        const lastKey = keys[keys.length - 1];
        if (current instanceof Map) {
            current.set(lastKey, value);
        } else {
            current[lastKey] = value;
        }
    }

    /**
     * Atualizar valor no estado (merge)
     */
    update(path, updates, options = {}) {
        const currentValue = this.get(path);
        
        if (currentValue && typeof currentValue === 'object' && !Array.isArray(currentValue)) {
            const mergedValue = { ...currentValue, ...updates };
            this.set(path, mergedValue, options);
        } else {
            this.set(path, updates, options);
        }
    }

    /**
     * Remover valor do estado
     */
    remove(path, options = {}) {
        const { silent = false, persist = true, history = true } = options;
        
        if (history) {
            this.saveToHistory();
        }
        
        if (typeof path === 'string') {
            this.removeNested(path);
        } else {
            this.state.delete(path);
        }
        
        if (persist) {
            this.saveToStorage();
        }
        
        if (!silent) {
            this.notifyListeners(path, undefined);
        }
    }

    /**
     * Remover valor aninhado
     */
    removeNested(path) {
        const keys = path.split('.');
        let current = this.state;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            
            if (current instanceof Map) {
                current = current.get(key);
            } else {
                current = current[key];
            }
            
            if (!current) return;
        }
        
        const lastKey = keys[keys.length - 1];
        if (current instanceof Map) {
            current.delete(lastKey);
        } else {
            delete current[lastKey];
        }
    }

    /**
     * Observar mudanças no estado
     */
    subscribe(path, listener) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, new Set());
        }
        
        this.listeners.get(path).add(listener);
        
        // Retornar função de unsubscribe
        return () => {
            const pathListeners = this.listeners.get(path);
            if (pathListeners) {
                pathListeners.delete(listener);
                if (pathListeners.size === 0) {
                    this.listeners.delete(path);
                }
            }
        };
    }

    /**
     * Observar mudanças com callback
     */
    watch(path, callback, options = {}) {
        const { immediate = false, deep = false } = options;
        
        if (!this.watchers.has(path)) {
            this.watchers.set(path, new Set());
        }
        
        const watcher = {
            callback,
            deep,
            lastValue: immediate ? undefined : this.get(path)
        };
        
        this.watchers.get(path).add(watcher);
        
        // Executar imediatamente se solicitado
        if (immediate) {
            callback(this.get(path), undefined);
        }
        
        // Retornar função de unwatch
        return () => {
            const pathWatchers = this.watchers.get(path);
            if (pathWatchers) {
                pathWatchers.delete(watcher);
                if (pathWatchers.size === 0) {
                    this.watchers.delete(path);
                }
            }
        };
    }

    /**
     * Notificar listeners
     */
    notifyListeners(path, value) {
        // Notificar listeners exatos
        const exactListeners = this.listeners.get(path);
        if (exactListeners) {
            exactListeners.forEach(listener => {
                try {
                    listener(value, path);
                } catch (error) {
                    console.error('❌ Erro no listener:', error);
                }
            });
        }
        
        // Notificar listeners de caminhos pais
        const pathParts = path.split('.');
        for (let i = pathParts.length - 1; i > 0; i--) {
            const parentPath = pathParts.slice(0, i).join('.');
            const parentListeners = this.listeners.get(parentPath);
            
            if (parentListeners) {
                const parentValue = this.get(parentPath);
                parentListeners.forEach(listener => {
                    try {
                        listener(parentValue, parentPath);
                    } catch (error) {
                        console.error('❌ Erro no listener pai:', error);
                    }
                });
            }
        }
    }

    /**
     * Executar watchers
     */
    executeWatchers(path, newValue) {
        const watchers = this.watchers.get(path);
        if (!watchers) return;
        
        watchers.forEach(watcher => {
            try {
                const { callback, lastValue } = watcher;
                
                if (this.hasChanged(lastValue, newValue)) {
                    callback(newValue, lastValue);
                    watcher.lastValue = this.deepClone(newValue);
                }
            } catch (error) {
                console.error('❌ Erro no watcher:', error);
            }
        });
    }

    /**
     * Verificar se valor mudou
     */
    hasChanged(oldValue, newValue) {
        if (oldValue === newValue) return false;
        
        if (oldValue === null || newValue === null) return true;
        if (oldValue === undefined || newValue === undefined) return true;
        
        if (typeof oldValue !== typeof newValue) return true;
        
        if (typeof oldValue === 'object') {
            return JSON.stringify(oldValue) !== JSON.stringify(newValue);
        }
        
        return oldValue !== newValue;
    }

    /**
     * Computar valores derivados
     */
    computed(dependencies, computeFn) {
        let cachedValue;
        let isComputed = false;
        
        const compute = () => {
            const values = dependencies.map(path => this.get(path));
            cachedValue = computeFn(...values);
            isComputed = true;
            return cachedValue;
        };
        
        // Observar dependências
        dependencies.forEach(dependency => {
            this.watch(dependency, () => {
                isComputed = false;
            });
        });
        
        return () => {
            if (!isComputed) {
                return compute();
            }
            return cachedValue;
        };
    }

    /**
     * Executar ação
     */
    dispatch(action, payload = {}) {
        console.log(`🚀 Executando ação: ${action}`, payload);
        
        switch (action) {
            case 'SET_LOADING':
                this.set('app.loading', payload.loading);
                break;
                
            case 'SET_ERROR':
                this.set('app.error', payload.error);
                break;
                
            case 'ADD_NOTIFICATION':
                this.addNotification(payload);
                break;
                
            case 'REMOVE_NOTIFICATION':
                this.removeNotification(payload.id);
                break;
                
            case 'SET_THEME':
                this.setTheme(payload.theme);
                break;
                
            case 'SAVE_FORM_DRAFT':
                this.saveFormDraft(payload.formType, payload.data);
                break;
                
            case 'CLEAR_FORM_DRAFT':
                this.clearFormDraft(payload.formType);
                break;
                
            case 'TRACK_PAGE_VIEW':
                this.trackPageView(payload.page);
                break;
                
            case 'TRACK_INTERACTION':
                this.trackInteraction(payload);
                break;
                
            default:
                console.warn(`⚠️ Ação desconhecida: ${action}`);
        }
    }

    /**
     * Adicionar notificação
     */
    addNotification(notification) {
        const notifications = this.get('app.notifications') || [];
        const newNotification = {
            id: Date.now(),
            type: 'info',
            duration: 5000,
            ...notification,
            timestamp: Date.now()
        };
        
        notifications.push(newNotification);
        this.set('app.notifications', notifications);
        
        // Auto-remover após duração especificada
        if (newNotification.duration > 0) {
            setTimeout(() => {
                this.removeNotification(newNotification.id);
            }, newNotification.duration);
        }
    }

    /**
     * Remover notificação
     */
    removeNotification(id) {
        const notifications = this.get('app.notifications') || [];
        const filtered = notifications.filter(n => n.id !== id);
        this.set('app.notifications', filtered);
    }

    /**
     * Definir tema
     */
    setTheme(theme) {
        this.set('user.preferences.theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        
        // Salvar preferência
        localStorage.setItem(this.storagePrefix + 'theme', theme);
    }

    /**
     * Salvar rascunho de formulário
     */
    saveFormDraft(formType, data) {
        const draft = {
            data,
            timestamp: Date.now()
        };
        
        this.set(`forms.${formType}.draft`, draft);
        this.set(`forms.${formType}.lastSaved`, Date.now());
    }

    /**
     * Limpar rascunho de formulário
     */
    clearFormDraft(formType) {
        this.set(`forms.${formType}.draft`, null);
        this.set(`forms.${formType}.lastSaved`, null);
    }

    /**
     * Rastrear visualização de página
     */
    trackPageView(page) {
        const pageViews = this.get('analytics.pageViews') || new Map();
        const currentCount = pageViews.get(page) || 0;
        pageViews.set(page, currentCount + 1);
        
        this.set('analytics.pageViews', pageViews, { persist: false });
        this.set('app.currentPage', page);
    }

    /**
     * Rastrear interação
     */
    trackInteraction(interaction) {
        const interactions = this.get('analytics.interactions') || [];
        interactions.push({
            ...interaction,
            timestamp: Date.now(),
            page: this.get('app.currentPage')
        });
        
        // Manter apenas as últimas 100 interações
        if (interactions.length > 100) {
            interactions.splice(0, interactions.length - 100);
        }
        
        this.set('analytics.interactions', interactions, { persist: false });
    }

    /**
     * Salvar no histórico
     */
    saveToHistory() {
        const snapshot = this.serializeState();
        this.history.push({
            state: snapshot,
            timestamp: Date.now()
        });
        
        // Limitar tamanho do histórico
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }

    /**
     * Desfazer alteração
     */
    undo() {
        if (this.history.length === 0) {
            console.warn('⚠️ Não há estados anteriores para desfazer');
            return false;
        }
        
        const previousState = this.history.pop();
        this.deserializeState(previousState.state);
        this.notifyListeners('*', this.state);
        
        console.log('↩️ Estado desfeito');
        return true;
    }

    /**
     * Serializar estado
     */
    serializeState() {
        const serialized = {};
        
        this.state.forEach((value, key) => {
            try {
                if (value instanceof Map) {
                    serialized[key] = Object.fromEntries(value);
                } else {
                    serialized[key] = JSON.parse(JSON.stringify(value));
                }
            } catch (error) {
                console.warn(`⚠️ Erro ao serializar ${key}:`, error);
            }
        });
        
        return serialized;
    }

    /**
     * Deserializar estado
     */
    deserializeState(serialized) {
        this.state.clear();
        
        Object.keys(serialized).forEach(key => {
            try {
                this.state.set(key, serialized[key]);
            } catch (error) {
                console.warn(`⚠️ Erro ao deserializar ${key}:`, error);
            }
        });
    }

    /**
     * Salvar no localStorage
     */
    saveToStorage(path = null) {
        try {
            if (path) {
                // Salvar apenas uma chave específica
                const value = this.get(path);
                if (value !== undefined) {
                    localStorage.setItem(
                        this.storagePrefix + path.replace('.', '_'),
                        JSON.stringify(value)
                    );
                }
            } else {
                // Salvar estado completo
                const serialized = this.serializeState();
                localStorage.setItem(
                    this.storagePrefix + 'state',
                    JSON.stringify(serialized)
                );
            }
        } catch (error) {
            console.error('❌ Erro ao salvar no localStorage:', error);
        }
    }

    /**
     * Carregar do localStorage
     */
    loadFromStorage() {
        try {
            const savedState = localStorage.getItem(this.storagePrefix + 'state');
            if (savedState) {
                const parsed = JSON.parse(savedState);
                this.deserializeState(parsed);
            }
            
            // Carregar tema
            const savedTheme = localStorage.getItem(this.storagePrefix + 'theme');
            if (savedTheme) {
                document.documentElement.setAttribute('data-theme', savedTheme);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar do localStorage:', error);
        }
    }

    /**
     * Configurar auto-save
     */
    setupAutoSave() {
        // Salvar estado a cada 30 segundos
        setInterval(() => {
            this.saveToStorage();
        }, 30000);
        
        // Salvar antes de sair da página
        window.addEventListener('beforeunload', () => {
            this.saveToStorage();
        });
    }

    /**
     * Configurar sincronização entre abas
     */
    setupTabSync() {
        window.addEventListener('storage', (event) => {
            if (event.key?.startsWith(this.storagePrefix)) {
                // Recarregar estado quando outra aba fizer alterações
                if (event.key === this.storagePrefix + 'state') {
                    this.loadFromStorage();
                    this.notifyListeners('*', this.state);
                }
            }
        });
    }

    /**
     * Limpar armazenamento
     */
    clearStorage() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.storagePrefix)) {
                localStorage.removeItem(key);
            }
        });
        
        console.log('🗑️ Armazenamento limpo');
    }

    /**
     * Exportar estado
     */
    exportState() {
        return this.serializeState();
    }

    /**
     * Importar estado
     */
    importState(state) {
        this.deserializeState(state);
        this.saveToStorage();
        this.notifyListeners('*', this.state);
        
        console.log('📥 Estado importado');
    }

    /**
     * Deep clone de objeto
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj);
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (obj instanceof Map) return new Map(Array.from(obj, ([k, v]) => [k, this.deepClone(v)]));
        if (obj instanceof Set) return new Set(Array.from(obj, item => this.deepClone(item)));
        if (typeof obj === 'object') {
            const cloned = {};
            Object.keys(obj).forEach(key => {
                cloned[key] = this.deepClone(obj[key]);
            });
            return cloned;
        }
        return obj;
    }

    /**
     * Debug: imprimir estado
     */
    debug() {
        console.log('🔍 Estado atual:', this.exportState());
        console.log('👥 Listeners:', this.listeners);
        console.log('👁️ Watchers:', this.watchers);
        console.log('📚 Histórico:', this.history.length, 'entradas');
    }

    /**
     * Destruir StateManager
     */
    destroy() {
        this.saveToStorage();
        this.listeners.clear();
        this.watchers.clear();
        this.state.clear();
        this.history.length = 0;
        
        console.log('🗑️ StateManager destruído');
    }
}

// Exportar instância global
export const stateManager = new StateManager();