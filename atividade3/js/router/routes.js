/**
 * ROUTES.JS - DEFINIÇÕES DAS ROTAS DA SPA
 * Configuração de todas as rotas da aplicação
 */

// Importar templates das páginas
import { HomeTemplate } from '../templates/home.js';
import { AboutTemplate } from '../templates/about.js';
import { ProjectsTemplate } from '../templates/projects.js';
import { DonationsTemplate } from '../templates/donations.js';
import { VolunteerTemplate } from '../templates/volunteer.js';
import { ContactTemplate } from '../templates/contact.js';

/**
 * Configuração das rotas da aplicação
 */
export const routes = [
    {
        path: '/',
        name: 'home',
        component: HomeTemplate,
        meta: {
            title: 'Home - Plataforma ONG',
            description: 'Página inicial da Plataforma ONG',
            breadcrumbs: [
                { text: 'Home', url: '/' }
            ]
        }
    },
    
    {
        path: '/sobre',
        name: 'about',
        component: AboutTemplate,
        meta: {
            title: 'Sobre Nós - Plataforma ONG',
            description: 'Conheça nossa história e missão',
            breadcrumbs: [
                { text: 'Home', url: '/' },
                { text: 'Sobre', url: '/sobre' }
            ]
        }
    },
    
    {
        path: '/projetos',
        name: 'projects',
        component: ProjectsTemplate,
        meta: {
            title: 'Projetos - Plataforma ONG',
            description: 'Conheça nossos projetos e iniciativas',
            breadcrumbs: [
                { text: 'Home', url: '/' },
                { text: 'Projetos', url: '/projetos' }
            ]
        }
    },
    
    {
        path: '/projetos/:id',
        name: 'project-detail',
        component: async (params) => {
            const { ProjectDetailTemplate } = await import('../templates/project-detail.js');
            return ProjectDetailTemplate(params);
        },
        meta: {
            title: 'Detalhes do Projeto - Plataforma ONG',
            description: 'Detalhes do projeto selecionado',
            breadcrumbs: [
                { text: 'Home', url: '/' },
                { text: 'Projetos', url: '/projetos' },
                { text: 'Detalhes', url: null }
            ]
        }
    },
    
    {
        path: '/doacoes',
        name: 'donations',
        component: DonationsTemplate,
        meta: {
            title: 'Doações - Plataforma ONG',
            description: 'Faça sua doação e ajude a transformar vidas',
            breadcrumbs: [
                { text: 'Home', url: '/' },
                { text: 'Doações', url: '/doacoes' }
            ]
        },
        middlewares: [
            // Middleware para tracking de doações
            async (route, params) => {
                if (window.Analytics) {
                    window.Analytics.track('page_view_donations', {
                        source: document.referrer || 'direct'
                    });
                }
            }
        ]
    },
    
    {
        path: '/voluntariado',
        name: 'volunteer',
        component: VolunteerTemplate,
        meta: {
            title: 'Voluntariado - Plataforma ONG',
            description: 'Torne-se um voluntário e faça a diferença',
            breadcrumbs: [
                { text: 'Home', url: '/' },
                { text: 'Voluntariado', url: '/voluntariado' }
            ]
        }
    },
    
    {
        path: '/contato',
        name: 'contact',
        component: ContactTemplate,
        meta: {
            title: 'Contato - Plataforma ONG',
            description: 'Entre em contato conosco',
            breadcrumbs: [
                { text: 'Home', url: '/' },
                { text: 'Contato', url: '/contato' }
            ]
        }
    },
    
    {
        path: '/transparencia',
        name: 'transparency',
        component: async () => {
            const { TransparencyTemplate } = await import('../templates/transparency.js');
            return TransparencyTemplate();
        },
        meta: {
            title: 'Transparência - Plataforma ONG',
            description: 'Relatórios financeiros e de atividades',
            breadcrumbs: [
                { text: 'Home', url: '/' },
                { text: 'Transparência', url: '/transparencia' }
            ]
        }
    },
    
    {
        path: '/blog',
        name: 'blog',
        component: async () => {
            const { BlogTemplate } = await import('../templates/blog.js');
            return BlogTemplate();
        },
        meta: {
            title: 'Blog - Plataforma ONG',
            description: 'Notícias e artigos sobre nossas atividades',
            breadcrumbs: [
                { text: 'Home', url: '/' },
                { text: 'Blog', url: '/blog' }
            ]
        }
    },
    
    {
        path: '/blog/:slug',
        name: 'blog-post',
        component: async (params) => {
            const { BlogPostTemplate } = await import('../templates/blog-post.js');
            return BlogPostTemplate(params);
        },
        meta: {
            title: 'Post do Blog - Plataforma ONG',
            description: 'Leia nossos artigos e novidades',
            breadcrumbs: [
                { text: 'Home', url: '/' },
                { text: 'Blog', url: '/blog' },
                { text: 'Post', url: null }
            ]
        }
    },
    
    {
        path: '/obrigado',
        name: 'thank-you',
        component: async (params) => {
            const { ThankYouTemplate } = await import('../templates/thank-you.js');
            return ThankYouTemplate(params);
        },
        meta: {
            title: 'Obrigado - Plataforma ONG',
            description: 'Agradecemos sua contribuição',
            breadcrumbs: [
                { text: 'Home', url: '/' },
                { text: 'Obrigado', url: '/obrigado' }
            ]
        }
    },
    
    // Rotas de erro
    {
        path: '/erro/404',
        name: 'error-404',
        component: () => `
            <div class="error-page">
                <div class="error-container">
                    <div class="error-code">404</div>
                    <h1 class="error-title">Página não encontrada</h1>
                    <p class="error-description">
                        A página que você está procurando não existe ou foi movida.
                    </p>
                    <div class="error-actions">
                        <a href="#/" class="btn btn-primary">
                            Voltar ao Início
                        </a>
                        <button onclick="history.back()" class="btn btn-outline">
                            Página Anterior
                        </button>
                    </div>
                </div>
            </div>
        `,
        meta: {
            title: 'Página não encontrada - Plataforma ONG',
            description: 'A página solicitada não foi encontrada'
        }
    },
    
    {
        path: '/erro/500',
        name: 'error-500',
        component: () => `
            <div class="error-page">
                <div class="error-container">
                    <div class="error-code">500</div>
                    <h1 class="error-title">Erro interno</h1>
                    <p class="error-description">
                        Ocorreu um erro interno no servidor. Tente novamente em alguns minutos.
                    </p>
                    <div class="error-actions">
                        <button onclick="window.location.reload()" class="btn btn-primary">
                            Tentar Novamente
                        </button>
                        <a href="#/" class="btn btn-outline">
                            Voltar ao Início
                        </a>
                    </div>
                </div>
            </div>
        `,
        meta: {
            title: 'Erro interno - Plataforma ONG',
            description: 'Ocorreu um erro interno no servidor'
        }
    },
    
    // Rota catch-all para páginas não encontradas
    {
        path: '*',
        name: 'not-found',
        component: () => {
            // Redirecionar para página 404
            setTimeout(() => {
                window.location.hash = '#/erro/404';
            }, 100);
            
            return `
                <div class="loading-container">
                    <p>Redirecionando...</p>
                </div>
            `;
        },
        meta: {
            title: 'Redirecionando... - Plataforma ONG'
        }
    }
];

/**
 * Middleware global para todas as rotas
 */
export const globalMiddlewares = [
    // Middleware de logging
    async (route, params) => {
        if (window.DEBUG) {
            console.log('🛤️ Navegando para rota:', route.name, params);
        }
    },
    
    // Middleware de analytics
    async (route, params) => {
        if (window.Analytics && route.name !== 'not-found') {
            window.Analytics.trackPageView(route.path, route.name);
        }
    },
    
    // Middleware de breadcrumbs
    async (route, params) => {
        updateBreadcrumbs(route.meta.breadcrumbs || []);
    },
    
    // Middleware de scroll to top
    async (route, params) => {
        // Scroll suave para o topo após mudança de rota
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
    }
];

/**
 * Atualizar breadcrumbs na interface
 */
function updateBreadcrumbs(breadcrumbs) {
    const breadcrumbContainer = document.getElementById('breadcrumb');
    
    if (!breadcrumbContainer || breadcrumbs.length === 0) {
        if (breadcrumbContainer) {
            breadcrumbContainer.style.display = 'none';
        }
        return;
    }
    
    breadcrumbContainer.style.display = 'block';
    
    const breadcrumbHTML = breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        
        if (isLast || !crumb.url) {
            return `
                <span class="breadcrumb-item active">
                    ${crumb.text}
                </span>
            `;
        } else {
            return `
                <a href="#${crumb.url}" class="breadcrumb-item">
                    ${crumb.text}
                </a>
            `;
        }
    }).join('<span class="breadcrumb-separator">›</span>');
    
    breadcrumbContainer.innerHTML = `
        <div class="container">
            <nav class="breadcrumb-nav" aria-label="Navegação estrutural">
                ${breadcrumbHTML}
            </nav>
        </div>
    `;
}

/**
 * Obter rota por nome
 */
export function getRouteByName(name) {
    return routes.find(route => route.name === name);
}

/**
 * Gerar URL para uma rota
 */
export function generateUrl(routeName, params = {}) {
    const route = getRouteByName(routeName);
    
    if (!route) {
        console.warn(`⚠️ Rota não encontrada: ${routeName}`);
        return '/';
    }
    
    let url = route.path;
    
    // Substituir parâmetros na URL
    Object.keys(params).forEach(key => {
        url = url.replace(`:${key}`, params[key]);
    });
    
    return url;
}

/**
 * Verificar se uma rota existe
 */
export function routeExists(path) {
    return routes.some(route => {
        const regex = new RegExp(`^${route.path.replace(/:[^/]+/g, '[^/]+')}$`);
        return regex.test(path);
    });
}

/**
 * Configuração de rotas protegidas (que requerem autenticação)
 */
export const protectedRoutes = [
    // Adicionar rotas que requerem autenticação quando necessário
];

/**
 * Configuração de rotas públicas (sempre acessíveis)
 */
export const publicRoutes = [
    'home',
    'about',
    'projects',
    'donations',
    'volunteer',
    'contact',
    'blog',
    'transparency',
    'error-404',
    'error-500'
];

export default routes;