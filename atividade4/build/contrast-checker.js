/**
 * CONTRAST-CHECKER.JS - VERIFICADOR DE CONTRASTE DE CORES
 * Verifica se todas as combinações de cores atendem WCAG 2.1 AA (4.5:1)
 */

const fs = require('fs').promises;
const path = require('path');

class ContrastChecker {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            summary: {
                total: 0,
                passed: 0,
                failed: 0,
                aa_large_passed: 0,
                aaa_passed: 0
            },
            combinations: [],
            recommendations: []
        };

        // Paleta de cores do projeto
        this.colorPalette = {
            // Cores principais
            primary: '#005fcc',
            primaryLight: '#4d8ae8',
            secondary: '#28a745',
            accent: '#ffc107',
            
            // Texto
            textPrimary: '#212529',
            textSecondary: '#495057',
            textMuted: '#6c757d',
            textLight: '#ffffff',
            
            // Backgrounds
            bgPrimary: '#ffffff',
            bgSecondary: '#f8f9fa',
            bgDark: '#343a40',
            bgGray: '#e9ecef',
            
            // Estados
            success: '#28a745',
            warning: '#ffc107',
            error: '#dc3545',
            info: '#17a2b8',
            
            // Modo escuro
            darkBg: '#212529',
            darkText: '#f8f9fa',
            darkSecondary: '#6c757d'
        };

        // Combinações comuns utilizadas no projeto
        this.commonCombinations = [
            // Texto principal
            { text: 'textPrimary', background: 'bgPrimary', context: 'Texto principal em fundo branco' },
            { text: 'textSecondary', background: 'bgPrimary', context: 'Texto secundário em fundo branco' },
            { text: 'textMuted', background: 'bgPrimary', context: 'Texto esmaecido em fundo branco' },
            
            // Texto em backgrounds coloridos
            { text: 'textLight', background: 'primary', context: 'Texto branco em botão primário' },
            { text: 'textLight', background: 'secondary', context: 'Texto branco em botão secundário' },
            { text: 'textPrimary', background: 'accent', context: 'Texto escuro em fundo amarelo' },
            
            // Estados
            { text: 'textLight', background: 'success', context: 'Texto em alerta de sucesso' },
            { text: 'textPrimary', background: 'warning', context: 'Texto em alerta de aviso' },
            { text: 'textLight', background: 'error', context: 'Texto em alerta de erro' },
            { text: 'textLight', background: 'info', context: 'Texto em alerta de informação' },
            
            // Modo escuro
            { text: 'darkText', background: 'darkBg', context: 'Texto claro em fundo escuro' },
            { text: 'darkSecondary', background: 'darkBg', context: 'Texto secundário em modo escuro' },
            
            // Backgrounds secundários
            { text: 'textPrimary', background: 'bgSecondary', context: 'Texto em fundo cinza claro' },
            { text: 'textLight', background: 'bgDark', context: 'Texto claro em fundo escuro' },
            
            // Links e elementos interativos
            { text: 'primary', background: 'bgPrimary', context: 'Links primários' },
            { text: 'primaryLight', background: 'bgPrimary', context: 'Links em hover' },
            
            // Navegação
            { text: 'textLight', background: 'bgDark', context: 'Texto de navegação' },
            { text: 'primary', background: 'bgSecondary', context: 'Links ativos na navegação' }
        ];
    }

    async checkContrast() {
        console.log('🎨 Iniciando verificação de contraste...');
        
        try {
            // Verificar todas as combinações
            for (const combination of this.commonCombinations) {
                await this.checkCombination(combination);
            }

            // Gerar recomendações
            this.generateRecommendations();
            
            // Salvar resultados
            await this.saveResults();
            
            // Mostrar resumo
            this.showSummary();
            
        } catch (error) {
            console.error('❌ Erro na verificação de contraste:', error);
        }
    }

    async checkCombination(combination) {
        const textColor = this.colorPalette[combination.text];
        const bgColor = this.colorPalette[combination.background];
        
        if (!textColor || !bgColor) {
            console.warn(`⚠️ Cor não encontrada: ${combination.text} ou ${combination.background}`);
            return;
        }

        const contrast = this.calculateContrast(textColor, bgColor);
        
        const result = {
            textColor: {
                name: combination.text,
                hex: textColor,
                rgb: this.hexToRgb(textColor)
            },
            backgroundColor: {
                name: combination.background,
                hex: bgColor,
                rgb: this.hexToRgb(bgColor)
            },
            contrast: Math.round(contrast * 100) / 100,
            context: combination.context,
            wcag: {
                aa_normal: contrast >= 4.5,      // WCAG AA para texto normal
                aa_large: contrast >= 3,         // WCAG AA para texto grande
                aaa_normal: contrast >= 7,       // WCAG AAA para texto normal
                aaa_large: contrast >= 4.5       // WCAG AAA para texto grande
            },
            recommendations: []
        };

        // Gerar recomendações específicas
        this.addRecommendations(result);
        
        this.results.combinations.push(result);
        this.updateSummary(result);
        
        // Log do resultado
        const status = result.wcag.aa_normal ? '✅' : '❌';
        console.log(`${status} ${combination.context}: ${result.contrast}:1`);
    }

    calculateContrast(color1, color2) {
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        
        const l1 = this.getLuminance(rgb1);
        const l2 = this.getLuminance(rgb2);
        
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        
        return (lighter + 0.05) / (darker + 0.05);
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    getLuminance(rgb) {
        const { r, g, b } = rgb;
        
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    addRecommendations(result) {
        if (!result.wcag.aa_normal) {
            // Sugerir cores alternativas
            const textRgb = result.textColor.rgb;
            const bgRgb = result.backgroundColor.rgb;
            
            // Escurecer texto ou clarear fundo
            const darkerText = this.adjustBrightness(textRgb, -20);
            const lighterBg = this.adjustBrightness(bgRgb, 20);
            
            result.recommendations.push({
                type: 'darken_text',
                description: 'Escurecer o texto',
                suggestion: this.rgbToHex(darkerText.r, darkerText.g, darkerText.b),
                expectedContrast: this.calculateContrast(
                    this.rgbToHex(darkerText.r, darkerText.g, darkerText.b),
                    result.backgroundColor.hex
                )
            });
            
            result.recommendations.push({
                type: 'lighten_background',
                description: 'Clarear o fundo',
                suggestion: this.rgbToHex(lighterBg.r, lighterBg.g, lighterBg.b),
                expectedContrast: this.calculateContrast(
                    result.textColor.hex,
                    this.rgbToHex(lighterBg.r, lighterBg.g, lighterBg.b)
                )
            });

            // Sugerir cores da paleta que funcionam
            const workingColors = this.findWorkingColors(result.backgroundColor.hex);
            if (workingColors.length > 0) {
                result.recommendations.push({
                    type: 'alternative_colors',
                    description: 'Cores da paleta que funcionam',
                    suggestions: workingColors
                });
            }
        }
    }

    adjustBrightness(rgb, amount) {
        return {
            r: Math.max(0, Math.min(255, rgb.r + amount)),
            g: Math.max(0, Math.min(255, rgb.g + amount)),
            b: Math.max(0, Math.min(255, rgb.b + amount))
        };
    }

    findWorkingColors(backgroundColor) {
        const workingColors = [];
        
        Object.entries(this.colorPalette).forEach(([name, color]) => {
            const contrast = this.calculateContrast(color, backgroundColor);
            if (contrast >= 4.5) {
                workingColors.push({
                    name,
                    hex: color,
                    contrast: Math.round(contrast * 100) / 100
                });
            }
        });
        
        return workingColors.sort((a, b) => b.contrast - a.contrast);
    }

    updateSummary(result) {
        this.results.summary.total++;
        
        if (result.wcag.aa_normal) {
            this.results.summary.passed++;
        } else {
            this.results.summary.failed++;
        }
        
        if (result.wcag.aa_large) {
            this.results.summary.aa_large_passed++;
        }
        
        if (result.wcag.aaa_normal) {
            this.results.summary.aaa_passed++;
        }
    }

    generateRecommendations() {
        // Recomendações gerais baseadas nos resultados
        const failedCount = this.results.summary.failed;
        
        if (failedCount === 0) {
            this.results.recommendations.push({
                priority: 'success',
                title: 'Parabéns!',
                description: 'Todas as combinações de cores atendem aos critérios WCAG 2.1 AA'
            });
        } else {
            this.results.recommendations.push({
                priority: 'high',
                title: 'Melhorar Contraste',
                description: `${failedCount} combinações precisam ser ajustadas para atender WCAG 2.1 AA`,
                actions: [
                    'Revisar as combinações marcadas como falharam',
                    'Implementar as sugestões de cores alternativas',
                    'Testar com usuários com deficiência visual',
                    'Considerar implementar modo de alto contraste'
                ]
            });
        }

        // Recomendações específicas
        const lowContrastCombinations = this.results.combinations.filter(c => c.contrast < 3);
        if (lowContrastCombinations.length > 0) {
            this.results.recommendations.push({
                priority: 'critical',
                title: 'Contraste Crítico',
                description: `${lowContrastCombinations.length} combinações têm contraste muito baixo (< 3:1)`,
                items: lowContrastCombinations.map(c => c.context)
            });
        }

        const mediumContrastCombinations = this.results.combinations.filter(c => c.contrast >= 3 && c.contrast < 4.5);
        if (mediumContrastCombinations.length > 0) {
            this.results.recommendations.push({
                priority: 'medium',
                title: 'Melhorar Contraste',
                description: `${mediumContrastCombinations.length} combinações podem ser melhoradas`,
                items: mediumContrastCombinations.map(c => c.context)
            });
        }
    }

    async saveResults() {
        const reportPath = path.join(__dirname, '../accessibility/contrast-report.json');
        await fs.mkdir(path.dirname(reportPath), { recursive: true });
        await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
        
        // Gerar relatório HTML
        await this.generateHTMLReport();
        
        console.log('✅ Relatório de contraste salvo:', reportPath);
    }

    async generateHTMLReport() {
        const htmlReport = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Contraste - Plataforma ONG</title>
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
        .content {
            padding: 30px;
        }
        .combination {
            display: flex;
            align-items: center;
            padding: 15px;
            margin-bottom: 15px;
            border: 1px solid #e9ecef;
            border-radius: 8px;
        }
        .combination.pass {
            border-left: 4px solid #28a745;
            background: #f8fff9;
        }
        .combination.fail {
            border-left: 4px solid #dc3545;
            background: #fff8f8;
        }
        .color-sample {
            width: 60px;
            height: 60px;
            border-radius: 4px;
            margin-right: 15px;
            border: 1px solid #ccc;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 12px;
        }
        .combination-info {
            flex: 1;
        }
        .combination-title {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .combination-details {
            font-size: 0.9em;
            color: #666;
        }
        .contrast-ratio {
            font-size: 1.5em;
            font-weight: bold;
            margin-left: 15px;
        }
        .wcag-badges {
            display: flex;
            gap: 5px;
            margin-top: 5px;
        }
        .badge {
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: bold;
        }
        .badge.pass {
            background: #28a745;
            color: white;
        }
        .badge.fail {
            background: #dc3545;
            color: white;
        }
        .recommendations {
            background: #e7f3ff;
            border: 1px solid #b3d9ff;
            border-radius: 8px;
            padding: 15px;
            margin-top: 15px;
        }
        .rec-title {
            font-weight: bold;
            margin-bottom: 10px;
        }
        .rec-suggestion {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
        }
        .rec-color {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            margin-right: 10px;
            border: 1px solid #ccc;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎨 Relatório de Contraste</h1>
            <p>Plataforma ONG - WCAG 2.1 AA Compliance</p>
            <p>Gerado em: ${new Date(this.results.timestamp).toLocaleString('pt-BR')}</p>
        </div>
        
        <div class="summary">
            <div class="stat-card">
                <div class="stat-number">${this.results.summary.total}</div>
                <div>Total de Combinações</div>
            </div>
            <div class="stat-card">
                <div class="stat-number passed">${this.results.summary.passed}</div>
                <div>Aprovadas (AA)</div>
            </div>
            <div class="stat-card">
                <div class="stat-number failed">${this.results.summary.failed}</div>
                <div>Reprovadas</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${this.results.summary.aaa_passed}</div>
                <div>AAA Compliance</div>
            </div>
        </div>
        
        <div class="content">
            <h2>Combinações de Cores</h2>
            ${this.results.combinations.map(combination => `
                <div class="combination ${combination.wcag.aa_normal ? 'pass' : 'fail'}">
                    <div class="color-sample" style="background-color: ${combination.backgroundColor.hex}; color: ${combination.textColor.hex};">
                        Aa
                    </div>
                    <div class="combination-info">
                        <div class="combination-title">${combination.context}</div>
                        <div class="combination-details">
                            Texto: ${combination.textColor.hex} • Fundo: ${combination.backgroundColor.hex}
                        </div>
                        <div class="wcag-badges">
                            <span class="badge ${combination.wcag.aa_normal ? 'pass' : 'fail'}">
                                AA Normal ${combination.wcag.aa_normal ? '✓' : '✗'}
                            </span>
                            <span class="badge ${combination.wcag.aa_large ? 'pass' : 'fail'}">
                                AA Large ${combination.wcag.aa_large ? '✓' : '✗'}
                            </span>
                            <span class="badge ${combination.wcag.aaa_normal ? 'pass' : 'fail'}">
                                AAA ${combination.wcag.aaa_normal ? '✓' : '✗'}
                            </span>
                        </div>
                        ${combination.recommendations.length > 0 ? `
                            <div class="recommendations">
                                <div class="rec-title">Recomendações:</div>
                                ${combination.recommendations.map(rec => 
                                    rec.type === 'alternative_colors' ? 
                                        rec.suggestions.slice(0, 3).map(alt => `
                                            <div class="rec-suggestion">
                                                <div class="rec-color" style="background-color: ${alt.hex}"></div>
                                                ${alt.name}: ${alt.contrast}:1
                                            </div>
                                        `).join('') :
                                        `<div class="rec-suggestion">${rec.description}: ${rec.suggestion}</div>`
                                ).join('')}
                            </div>
                        ` : ''}
                    </div>
                    <div class="contrast-ratio ${combination.wcag.aa_normal ? 'passed' : 'failed'}">
                        ${combination.contrast}:1
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
        `.trim();

        const htmlReportPath = path.join(__dirname, '../accessibility/contrast-report.html');
        await fs.writeFile(htmlReportPath, htmlReport);
    }

    showSummary() {
        console.log('\n🎨 RESUMO DA VERIFICAÇÃO DE CONTRASTE');
        console.log('=====================================');
        console.log(`📊 Total de combinações: ${this.results.summary.total}`);
        console.log(`✅ Aprovadas (WCAG AA): ${this.results.summary.passed}`);
        console.log(`❌ Reprovadas: ${this.results.summary.failed}`);
        console.log(`🏆 AAA Compliance: ${this.results.summary.aaa_passed}`);
        
        const percentage = ((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1);
        console.log(`📈 Taxa de aprovação: ${percentage}%`);
        
        if (this.results.summary.failed === 0) {
            console.log('\n🎉 EXCELENTE! Todas as combinações atendem WCAG 2.1 AA!');
        } else {
            console.log('\n🔧 Combinações que precisam ser ajustadas:');
            this.results.combinations
                .filter(c => !c.wcag.aa_normal)
                .forEach(c => {
                    console.log(`  • ${c.context}: ${c.contrast}:1 (precisa ≥4.5:1)`);
                });
        }
        
        console.log('\n📄 Relatórios gerados:');
        console.log('  • atividade4/accessibility/contrast-report.json');
        console.log('  • atividade4/accessibility/contrast-report.html');
    }
}

// Executar verificação
if (require.main === module) {
    const checker = new ContrastChecker();
    checker.checkContrast();
}

module.exports = ContrastChecker;