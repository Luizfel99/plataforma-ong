/**
 * SISTEMA DE GRID AVANÇADO - JAVASCRIPT
 * Funcionalidades dinâmicas para o sistema de grid
 */

class AdvancedGridSystem {
    constructor() {
        this.init();
        this.setupEventListeners();
        this.setupObservers();
    }

    init() {
        this.setupAutoGrids();
        this.setupMasonryLayouts();
        this.setupResponsiveGrids();
        this.setupLayoutSwitchers();
    }

    setupEventListeners() {
        // Listener para redimensionamento da janela
        window.addEventListener('resize', this.debounce(() => {
            this.recalculateGrids();
            this.adjustMasonryLayouts();
        }, 250));

        // Listener para mudanças de orientação
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.recalculateGrids();
            }, 100);
        });
    }

    setupObservers() {
        // Observer para novos elementos grid adicionados dinamicamente
        if ('IntersectionObserver' in window) {
            this.gridObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.initializeGridElement(entry.target);
                    }
                });
            });

            // Observar todos os grids existentes
            document.querySelectorAll('.grid, .auto-grid, .grid-masonry').forEach(grid => {
                this.gridObserver.observe(grid);
            });
        }

        // Mutation Observer para elementos adicionados dinamicamente
        if ('MutationObserver' in window) {
            this.mutationObserver = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            if (node.matches('.grid, .auto-grid, .grid-masonry')) {
                                this.initializeGridElement(node);
                            }
                            // Verificar elementos filhos também
                            node.querySelectorAll('.grid, .auto-grid, .grid-masonry').forEach(grid => {
                                this.initializeGridElement(grid);
                            });
                        }
                    });
                });
            });

            this.mutationObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    initializeGridElement(element) {
        if (element.classList.contains('auto-grid')) {
            this.setupAutoGrid(element);
        }
        if (element.classList.contains('grid-masonry')) {
            this.setupMasonryLayout(element);
        }
        if (element.classList.contains('grid-responsive')) {
            this.setupResponsiveGrid(element);
        }
    }

    setupAutoGrids() {
        document.querySelectorAll('.auto-grid').forEach(grid => {
            this.setupAutoGrid(grid);
        });
    }

    setupAutoGrid(grid) {
        const updateColumns = () => {
            const containerWidth = grid.offsetWidth;
            const minColumnWidth = parseInt(
                getComputedStyle(grid).getPropertyValue('--min-column-width') || '250px'
            );
            
            const columns = Math.floor(containerWidth / minColumnWidth) || 1;
            grid.style.setProperty('--calculated-columns', columns);
            
            // Evento customizado para notificar mudanças
            grid.dispatchEvent(new CustomEvent('gridColumnsChanged', {
                detail: { columns, containerWidth, minColumnWidth }
            }));
        };

        // Configurar ResizeObserver se disponível
        if ('ResizeObserver' in window) {
            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    updateColumns();
                }
            });
            resizeObserver.observe(grid);
            grid._resizeObserver = resizeObserver;
        }

        updateColumns();
    }

    setupMasonryLayouts() {
        document.querySelectorAll('.grid-masonry').forEach(grid => {
            this.setupMasonryLayout(grid);
        });
    }

    setupMasonryLayout(grid) {
        const updateMasonry = () => {
            const items = Array.from(grid.children);
            const columnCount = this.getColumnCount(grid);
            const columnHeights = new Array(columnCount).fill(0);
            const gap = parseInt(getComputedStyle(grid).gap) || 0;

            items.forEach(item => {
                // Encontrar a coluna mais baixa
                const minHeight = Math.min(...columnHeights);
                const columnIndex = columnHeights.indexOf(minHeight);
                
                // Posicionar o item
                item.style.gridColumnStart = columnIndex + 1;
                item.style.gridRowStart = 'auto';
                
                // Atualizar altura da coluna
                const itemHeight = item.offsetHeight;
                columnHeights[columnIndex] += itemHeight + gap;
            });
        };

        // Aguardar carregamento de imagens
        this.waitForImages(grid).then(() => {
            updateMasonry();
        });

        // Observer para mudanças no conteúdo
        if ('ResizeObserver' in window) {
            const resizeObserver = new ResizeObserver(() => {
                updateMasonry();
            });
            resizeObserver.observe(grid);
            grid._masonryObserver = resizeObserver;
        }
    }

    setupResponsiveGrids() {
        document.querySelectorAll('.grid-responsive').forEach(grid => {
            this.setupResponsiveGrid(grid);
        });
    }

    setupResponsiveGrid(grid) {
        const breakpoints = {
            xs: parseInt(grid.dataset.colsXs) || 1,
            sm: parseInt(grid.dataset.colsSm) || 2,
            md: parseInt(grid.dataset.colsMd) || 3,
            lg: parseInt(grid.dataset.colsLg) || 4,
            xl: parseInt(grid.dataset.colsXl) || 5,
            '2xl': parseInt(grid.dataset.cols2xl) || 6
        };

        const updateGridColumns = () => {
            const width = window.innerWidth;
            let columns = breakpoints.xs;

            if (width >= 1536) columns = breakpoints['2xl'];
            else if (width >= 1280) columns = breakpoints.xl;
            else if (width >= 1024) columns = breakpoints.lg;
            else if (width >= 768) columns = breakpoints.md;
            else if (width >= 640) columns = breakpoints.sm;

            grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
            
            // Adicionar classe para CSS hooks
            grid.className = grid.className.replace(/\bgrid-cols-\d+\b/g, '');
            grid.classList.add(`grid-cols-${columns}`);
        };

        updateGridColumns();
        window.addEventListener('resize', this.debounce(updateGridColumns, 100));
    }

    setupLayoutSwitchers() {
        document.querySelectorAll('[data-layout-switcher]').forEach(switcher => {
            switcher.addEventListener('click', (e) => {
                const targetGrid = document.querySelector(switcher.dataset.layoutSwitcher);
                const layout = switcher.dataset.layout;
                
                if (targetGrid) {
                    this.switchLayout(targetGrid, layout);
                }
            });
        });
    }

    switchLayout(grid, layout) {
        // Remover classes de layout anteriores
        grid.className = grid.className.replace(/\bgrid-\w+|\bflex\w*|\blayout-\w+/g, '');
        
        switch (layout) {
            case 'grid':
                grid.classList.add('grid', 'grid-cols-3', 'gap-4');
                break;
            case 'masonry':
                grid.classList.add('grid-masonry');
                this.setupMasonryLayout(grid);
                break;
            case 'flex':
                grid.classList.add('flex', 'flex-wrap', 'gap-4');
                break;
            case 'list':
                grid.classList.add('flex', 'flex-col', 'gap-2');
                break;
            default:
                grid.classList.add('grid', 'grid-cols-1', 'gap-4');
        }

        // Evento customizado para mudança de layout
        grid.dispatchEvent(new CustomEvent('layoutChanged', {
            detail: { layout, grid }
        }));
    }

    getColumnCount(grid) {
        const computedStyle = getComputedStyle(grid);
        const columns = computedStyle.gridTemplateColumns.split(' ').length;
        return columns;
    }

    recalculateGrids() {
        document.querySelectorAll('.auto-grid').forEach(grid => {
            if (grid._resizeObserver) {
                // Forçar recálculo
                const event = new Event('resize');
                window.dispatchEvent(event);
            }
        });
    }

    adjustMasonryLayouts() {
        document.querySelectorAll('.grid-masonry').forEach(grid => {
            this.setupMasonryLayout(grid);
        });
    }

    waitForImages(container) {
        const images = container.querySelectorAll('img');
        const promises = Array.from(images).map(img => {
            if (img.complete) {
                return Promise.resolve();
            }
            return new Promise(resolve => {
                img.addEventListener('load', resolve);
                img.addEventListener('error', resolve);
            });
        });
        return Promise.all(promises);
    }

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

    // Métodos públicos para controle externo
    refreshGrid(gridElement) {
        this.initializeGridElement(gridElement);
    }

    destroyGrid(gridElement) {
        if (gridElement._resizeObserver) {
            gridElement._resizeObserver.disconnect();
        }
        if (gridElement._masonryObserver) {
            gridElement._masonryObserver.disconnect();
        }
        if (this.gridObserver) {
            this.gridObserver.unobserve(gridElement);
        }
    }

    // Utilitários para desenvolvedores
    static createGrid(container, options = {}) {
        const {
            columns = 'auto-fit',
            minColumnWidth = '250px',
            gap = '1rem',
            className = ''
        } = options;

        container.className = `grid auto-grid ${className}`;
        container.style.setProperty('--min-column-width', minColumnWidth);
        container.style.gap = gap;

        if (columns !== 'auto-fit') {
            container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        }

        return container;
    }

    static createMasonry(container, options = {}) {
        const {
            minColumnWidth = '300px',
            gap = '1.5rem',
            className = ''
        } = options;

        container.className = `grid-masonry ${className}`;
        container.style.gridTemplateColumns = `repeat(auto-fit, minmax(${minColumnWidth}, 1fr))`;
        container.style.gap = gap;

        return container;
    }

    static createFlexLayout(container, options = {}) {
        const {
            direction = 'row',
            wrap = 'wrap',
            justify = 'flex-start',
            align = 'flex-start',
            gap = '1rem',
            className = ''
        } = options;

        container.className = `flex ${className}`;
        container.style.flexDirection = direction;
        container.style.flexWrap = wrap;
        container.style.justifyContent = justify;
        container.style.alignItems = align;
        container.style.gap = gap;

        return container;
    }
}

// Classe para gerenciamento de Container Queries
class ContainerQueryManager {
    constructor() {
        this.init();
    }

    init() {
        if ('container' in document.documentElement.style) {
            this.setupContainerQueries();
        } else {
            this.setupPolyfill();
        }
    }

    setupContainerQueries() {
        document.querySelectorAll('[data-container-query]').forEach(element => {
            element.style.containerType = 'inline-size';
            element.style.containerName = element.dataset.containerQuery || 'container';
        });
    }

    setupPolyfill() {
        // Polyfill simples para container queries
        if ('ResizeObserver' in window) {
            const resizeObserver = new ResizeObserver(entries => {
                entries.forEach(entry => {
                    const element = entry.target;
                    const width = entry.contentRect.width;
                    
                    // Adicionar classes baseadas no tamanho
                    element.classList.remove('container-sm', 'container-md', 'container-lg');
                    
                    if (width >= 700) {
                        element.classList.add('container-lg');
                    } else if (width >= 500) {
                        element.classList.add('container-md');
                    } else if (width >= 300) {
                        element.classList.add('container-sm');
                    }
                });
            });

            document.querySelectorAll('[data-container-query]').forEach(element => {
                resizeObserver.observe(element);
            });
        }
    }
}

// Auto-inicialização quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.advancedGridSystem = new AdvancedGridSystem();
    window.containerQueryManager = new ContainerQueryManager();
});

// Export para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AdvancedGridSystem, ContainerQueryManager };
}

// Exposição global
window.AdvancedGridSystem = AdvancedGridSystem;
window.ContainerQueryManager = ContainerQueryManager;