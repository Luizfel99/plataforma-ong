/**
 * ACCESSIBILITY-AUDIT.JS - AUDITORIA DE ACESSIBILIDADE AUTOMATIZADA
 * Verifica conformidade com WCAG 2.1 usando axe-core
 */

const puppeteer = require('puppeteer');
const axeCore = require('axe-core');
const fs = require('fs').promises;
const path = require('path');

class AccessibilityAuditor {
    constructor() {
        this.browser = null;
        this.results = {
            timestamp: new Date().toISOString(),
            summary: {
                total: 0,
                passed: 0,
                failed: 0,
                incomplete: 0,
                inapplicable: 0
            },
            pages: {},
            violations: [],
            passes: []
        };
    }

    async audit() {
        console.log('♿ Iniciando auditoria de acessibilidade...');
        
        try {
            // Inicializar browser
            this.browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            // Páginas para auditar
            const pages = [
                { name: 'Home', url: 'http://localhost:3000/index.html' },
                { name: 'Sobre', url: 'http://localhost:3000/sobre.html' },
                { name: 'Projetos', url: 'http://localhost:3000/projetos.html' },
                { name: 'Doações', url: 'http://localhost:3000/doacoes.html' },
                { name: 'Voluntariado', url: 'http://localhost:3000/voluntariado.html' },
                { name: 'Contato', url: 'http://localhost:3000/contato.html' }
            ];

            // Auditar cada página
            for (const pageInfo of pages) {
                await this.auditPage(pageInfo);
            }

            // Gerar relatório
            await this.generateReport();
            
            // Mostrar resumo
            this.showSummary();

        } catch (error) {
            console.error('❌ Erro na auditoria:', error);
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }

    async auditPage(pageInfo) {
        console.log(`🔍 Auditando: ${pageInfo.name}`);
        
        try {
            const page = await this.browser.newPage();
            
            // Configurar viewport
            await page.setViewport({ width: 1280, height: 720 });
            
            // Navegar para a página
            await page.goto(pageInfo.url, { 
                waitUntil: 'networkidle0',
                timeout: 30000
            });

            // Injetar axe-core
            await page.addScriptTag({ content: axeCore.source });

            // Executar auditoria
            const axeResults = await page.evaluate(async () => {
                return await axe.run(document, {
                    rules: {
                        // Focar em WCAG 2.1 AA
                        'color-contrast': { enabled: true },
                        'keyboard-navigation': { enabled: true },
                        'focus-order-semantics': { enabled: true },
                        'aria-valid-attr': { enabled: true },
                        'aria-valid-attr-value': { enabled: true },
                        'aria-required-attr': { enabled: true },
                        'aria-roles': { enabled: true },
                        'button-name': { enabled: true },
                        'bypass': { enabled: true },
                        'document-title': { enabled: true },
                        'duplicate-id': { enabled: true },
                        'form-field-multiple-labels': { enabled: true },
                        'frame-title': { enabled: true },
                        'html-has-lang': { enabled: true },
                        'html-lang-valid': { enabled: true },
                        'image-alt': { enabled: true },
                        'input-image-alt': { enabled: true },
                        'label': { enabled: true },
                        'landmark-one-main': { enabled: true },
                        'landmark-complementary-is-top-level': { enabled: true },
                        'link-name': { enabled: true },
                        'list': { enabled: true },
                        'listitem': { enabled: true },
                        'meta-refresh': { enabled: true },
                        'meta-viewport': { enabled: true },
                        'page-has-heading-one': { enabled: true },
                        'region': { enabled: true },
                        'scope-attr-valid': { enabled: true },
                        'server-side-image-map': { enabled: true },
                        'tabindex': { enabled: true },
                        'table-fake-caption': { enabled: true },
                        'td-headers-attr': { enabled: true },
                        'th-has-data-cells': { enabled: true },
                        'valid-lang': { enabled: true },
                        'video-caption': { enabled: true }
                    }
                });
            });

            // Processar resultados
            this.processPageResults(pageInfo.name, axeResults);
            
            await page.close();
            
        } catch (error) {
            console.error(`❌ Erro ao auditar ${pageInfo.name}:`, error);
            
            this.results.pages[pageInfo.name] = {
                error: error.message,
                violations: [],
                passes: [],
                incomplete: [],
                inapplicable: []
            };
        }
    }

    processPageResults(pageName, axeResults) {
        console.log(`📊 ${pageName}: ${axeResults.violations.length} violações, ${axeResults.passes.length} sucessos`);
        
        // Armazenar resultados da página
        this.results.pages[pageName] = {
            url: axeResults.url,
            violations: axeResults.violations,
            passes: axeResults.passes,
            incomplete: axeResults.incomplete,
            inapplicable: axeResults.inapplicable,
            stats: {
                violations: axeResults.violations.length,
                passes: axeResults.passes.length,
                incomplete: axeResults.incomplete.length,
                inapplicable: axeResults.inapplicable.length
            }
        };

        // Atualizar totais
        this.results.summary.failed += axeResults.violations.length;
        this.results.summary.passed += axeResults.passes.length;
        this.results.summary.incomplete += axeResults.incomplete.length;
        this.results.summary.inapplicable += axeResults.inapplicable.length;

        // Coletar violações críticas
        axeResults.violations.forEach(violation => {
            this.results.violations.push({
                page: pageName,
                rule: violation.id,
                impact: violation.impact,
                description: violation.description,
                help: violation.help,
                helpUrl: violation.helpUrl,
                nodes: violation.nodes.length,
                wcag: violation.tags.filter(tag => tag.startsWith('wcag'))
            });
        });
    }

    async generateReport() {
        console.log('📄 Gerando relatório de acessibilidade...');
        
        // Calcular totais
        this.results.summary.total = 
            this.results.summary.passed + 
            this.results.summary.failed + 
            this.results.summary.incomplete + 
            this.results.summary.inapplicable;

        // Gerar relatório JSON
        const reportPath = path.join(__dirname, '../accessibility/audit-report.json');
        await fs.mkdir(path.dirname(reportPath), { recursive: true });
        await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));

        // Gerar relatório HTML
        await this.generateHTMLReport();

        console.log('✅ Relatório gerado:', reportPath);
    }

    async generateHTMLReport() {
        const htmlReport = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Acessibilidade - Plataforma ONG</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stat-number {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .incomplete { color: #ffc107; }
        .inapplicable { color: #6c757d; }
        .content {
            padding: 30px;
        }
        .page-results {
            margin-bottom: 40px;
        }
        .page-title {
            background: #e9ecef;
            padding: 15px 20px;
            margin: 0 -30px 20px -30px;
            font-size: 1.2em;
            font-weight: bold;
        }
        .violation {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 4px;
            padding: 15px;
            margin-bottom: 15px;
        }
        .violation-title {
            font-weight: bold;
            color: #721c24;
            margin-bottom: 5px;
        }
        .violation-description {
            color: #721c24;
            margin-bottom: 10px;
        }
        .violation-meta {
            font-size: 0.9em;
            color: #856404;
        }
        .impact-critical { color: #dc3545; }
        .impact-serious { color: #fd7e14; }
        .impact-moderate { color: #ffc107; }
        .impact-minor { color: #28a745; }
        .no-violations {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 15px;
            border-radius: 4px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>♿ Relatório de Acessibilidade</h1>
            <p>Plataforma ONG - WCAG 2.1 AA Compliance</p>
            <p>Gerado em: ${new Date(this.results.timestamp).toLocaleString('pt-BR')}</p>
        </div>
        
        <div class="summary">
            <div class="stat-card">
                <div class="stat-number passed">${this.results.summary.passed}</div>
                <div>Sucessos</div>
            </div>
            <div class="stat-card">
                <div class="stat-number failed">${this.results.summary.failed}</div>
                <div>Violações</div>
            </div>
            <div class="stat-card">
                <div class="stat-number incomplete">${this.results.summary.incomplete}</div>
                <div>Incompletos</div>
            </div>
            <div class="stat-card">
                <div class="stat-number inapplicable">${this.results.summary.inapplicable}</div>
                <div>Não Aplicáveis</div>
            </div>
        </div>
        
        <div class="content">
            ${Object.entries(this.results.pages).map(([pageName, pageData]) => `
                <div class="page-results">
                    <div class="page-title">${pageName}</div>
                    ${pageData.violations && pageData.violations.length > 0 ? 
                        pageData.violations.map(violation => `
                            <div class="violation">
                                <div class="violation-title">${violation.id}: ${violation.help}</div>
                                <div class="violation-description">${violation.description}</div>
                                <div class="violation-meta">
                                    Impacto: <span class="impact-${violation.impact}">${violation.impact}</span> |
                                    Elementos afetados: ${violation.nodes.length} |
                                    WCAG: ${violation.tags.filter(tag => tag.startsWith('wcag')).join(', ')}
                                </div>
                            </div>
                        `).join('') :
                        '<div class="no-violations">✅ Nenhuma violação encontrada nesta página!</div>'
                    }
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
        `.trim();

        const htmlReportPath = path.join(__dirname, '../accessibility/audit-report.html');
        await fs.writeFile(htmlReportPath, htmlReport);
    }

    showSummary() {
        console.log('\n📊 RESUMO DA AUDITORIA DE ACESSIBILIDADE');
        console.log('==========================================');
        console.log(`✅ Sucessos: ${this.results.summary.passed}`);
        console.log(`❌ Violações: ${this.results.summary.failed}`);
        console.log(`⚠️ Incompletos: ${this.results.summary.incomplete}`);
        console.log(`➖ Não Aplicáveis: ${this.results.summary.inapplicable}`);
        console.log(`📊 Total de Testes: ${this.results.summary.total}`);
        
        if (this.results.summary.failed === 0) {
            console.log('\n🎉 PARABÉNS! Nenhuma violação de acessibilidade encontrada!');
        } else {
            console.log('\n🔧 Violações encontradas que precisam ser corrigidas:');
            
            // Agrupar violações por impacto
            const violationsByImpact = this.results.violations.reduce((acc, violation) => {
                if (!acc[violation.impact]) acc[violation.impact] = [];
                acc[violation.impact].push(violation);
                return acc;
            }, {});

            ['critical', 'serious', 'moderate', 'minor'].forEach(impact => {
                if (violationsByImpact[impact]) {
                    console.log(`\n${impact.toUpperCase()}:`);
                    violationsByImpact[impact].forEach(violation => {
                        console.log(`  • ${violation.rule} (${violation.page}): ${violation.nodes} elemento(s)`);
                    });
                }
            });
        }
        
        console.log('\n📄 Relatórios gerados:');
        console.log('  • atividade4/accessibility/audit-report.json');
        console.log('  • atividade4/accessibility/audit-report.html');
    }
}

// Executar auditoria
if (require.main === module) {
    const auditor = new AccessibilityAuditor();
    auditor.audit();
}

module.exports = AccessibilityAuditor;