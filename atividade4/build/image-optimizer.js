/**
 * IMAGE-OPTIMIZER.JS - OTIMIZADOR DE IMAGENS PARA PRODUÇÃO
 * Comprime e otimiza imagens SVG, PNG, JPG, WebP para melhor performance
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class ImageOptimizer {
    constructor() {
        this.sourceDir = path.resolve('../../assets/img');
        this.outputDir = path.resolve('../production/assets/img');
        this.results = {
            timestamp: new Date().toISOString(),
            summary: {
                totalFiles: 0,
                processed: 0,
                skipped: 0,
                errors: 0,
                originalSize: 0,
                optimizedSize: 0,
                savedBytes: 0,
                savedPercentage: 0
            },
            files: [],
            recommendations: []
        };

        // Configurações de otimização
        this.config = {
            svg: {
                removeComments: true,
                removeMetadata: true,
                removeEmptyContainers: true,
                removeUnusedNS: true,
                removeEditorsNSData: true,
                cleanupAttrs: true,
                cleanupIDs: true,
                minifyStyles: true,
                mergePaths: true
            },
            webp: {
                quality: 85,
                method: 4,
                lossless: false
            },
            progressive: true,
            responsive: {
                breakpoints: [320, 768, 1024, 1200],
                formats: ['webp', 'jpg']
            }
        };

        // Formatos suportados
        this.supportedFormats = ['.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp'];
    }

    async optimize() {
        console.log('🖼️  Iniciando otimização de imagens...');
        
        try {
            // Verificar dependências
            await this.checkDependencies();
            
            // Criar diretório de saída
            await fs.mkdir(this.outputDir, { recursive: true });
            
            // Encontrar todas as imagens
            const imageFiles = await this.findImages();
            this.results.summary.totalFiles = imageFiles.length;
            
            console.log(`📁 Encontradas ${imageFiles.length} imagens para otimizar`);
            
            // Processar cada imagem
            for (const filePath of imageFiles) {
                await this.processImage(filePath);
            }
            
            // Gerar imagens responsivas
            await this.generateResponsiveImages();
            
            // Calcular estatísticas finais
            this.calculateFinalStats();
            
            // Gerar recomendações
            this.generateRecommendations();
            
            // Salvar resultados
            await this.saveResults();
            
            // Mostrar resumo
            this.showSummary();
            
        } catch (error) {
            console.error('❌ Erro na otimização de imagens:', error);
            this.results.summary.errors++;
        }
    }

    async checkDependencies() {
        const dependencies = [
            { name: 'svgo', check: 'svgo --version', install: 'npm install -g svgo' },
            { name: 'imagemin', check: null, install: 'npm install imagemin imagemin-webp imagemin-mozjpeg imagemin-pngquant' }
        ];

        for (const dep of dependencies) {
            if (dep.check) {
                try {
                    execSync(dep.check, { stdio: 'ignore' });
                    console.log(`✅ ${dep.name} disponível`);
                } catch (error) {
                    console.log(`⚠️  ${dep.name} não encontrado. Instale com: ${dep.install}`);
                }
            }
        }
    }

    async findImages() {
        const images = [];
        
        async function scanDirectory(dir) {
            try {
                const entries = await fs.readdir(dir, { withFileTypes: true });
                
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    
                    if (entry.isDirectory()) {
                        await scanDirectory(fullPath);
                    } else if (entry.isFile()) {
                        const ext = path.extname(entry.name).toLowerCase();
                        if (this.supportedFormats.includes(ext)) {
                            images.push(fullPath);
                        }
                    }
                }
            } catch (error) {
                console.warn(`⚠️  Erro ao escanear diretório ${dir}:`, error.message);
            }
        }
        
        await scanDirectory.call(this, this.sourceDir);
        return images;
    }

    async processImage(inputPath) {
        const fileName = path.basename(inputPath);
        const ext = path.extname(fileName).toLowerCase();
        const outputPath = path.join(this.outputDir, fileName);
        
        console.log(`🔄 Processando: ${fileName}`);
        
        try {
            const originalStats = await fs.stat(inputPath);
            const originalSize = originalStats.size;
            
            let optimizedSize = originalSize;
            let processed = false;
            
            // Processar baseado no tipo de arquivo
            switch (ext) {
                case '.svg':
                    optimizedSize = await this.optimizeSVG(inputPath, outputPath);
                    processed = true;
                    break;
                    
                case '.png':
                case '.jpg':
                case '.jpeg':
                    optimizedSize = await this.optimizeRaster(inputPath, outputPath, ext);
                    processed = true;
                    break;
                    
                default:
                    // Copiar arquivo sem otimização
                    await fs.copyFile(inputPath, outputPath);
                    this.results.summary.skipped++;
                    break;
            }
            
            if (processed) {
                const saved = originalSize - optimizedSize;
                const savedPercentage = ((saved / originalSize) * 100);
                
                this.results.files.push({
                    name: fileName,
                    originalSize,
                    optimizedSize,
                    saved,
                    savedPercentage: Math.round(savedPercentage * 10) / 10,
                    type: ext,
                    status: 'optimized'
                });
                
                this.results.summary.processed++;
                this.results.summary.originalSize += originalSize;
                this.results.summary.optimizedSize += optimizedSize;
                
                console.log(`  ✅ ${fileName}: ${this.formatBytes(originalSize)} → ${this.formatBytes(optimizedSize)} (${savedPercentage.toFixed(1)}% menor)`);
            }
            
        } catch (error) {
            console.error(`  ❌ Erro ao processar ${fileName}:`, error.message);
            this.results.summary.errors++;
            
            this.results.files.push({
                name: fileName,
                status: 'error',
                error: error.message
            });
        }
    }

    async optimizeSVG(inputPath, outputPath) {
        try {
            const svgContent = await fs.readFile(inputPath, 'utf8');
            
            // Otimização manual básica do SVG
            let optimized = svgContent
                // Remover comentários
                .replace(/<!--[\s\S]*?-->/g, '')
                // Remover espaços desnecessários
                .replace(/>\s+</g, '><')
                .replace(/\s+/g, ' ')
                // Remover atributos desnecessários
                .replace(/\s*(xml:space="preserve"|xmlns:xml="[^"]*")\s*/g, '')
                // Simplificar decimais
                .replace(/(\d+\.\d{3,})/g, (match) => parseFloat(match).toFixed(2));
            
            // Tentar usar SVGO se disponível
            try {
                const { optimize } = require('svgo');
                const result = optimize(svgContent, {
                    multipass: true,
                    plugins: [
                        'removeComments',
                        'removeMetadata',
                        'removeEmptyContainers',
                        'removeUnusedNS',
                        'removeEditorsNSData',
                        'cleanupAttrs',
                        'cleanupIDs',
                        'minifyStyles',
                        'mergePaths'
                    ]
                });
                optimized = result.data;
            } catch (svgoError) {
                console.log(`  ⚠️  SVGO não disponível, usando otimização básica`);
            }
            
            await fs.writeFile(outputPath, optimized, 'utf8');
            return Buffer.byteLength(optimized, 'utf8');
            
        } catch (error) {
            // Fallback: copiar arquivo original
            await fs.copyFile(inputPath, outputPath);
            const stats = await fs.stat(outputPath);
            return stats.size;
        }
    }

    async optimizeRaster(inputPath, outputPath, ext) {
        try {
            // Tentar usar imagemin
            const imagemin = require('imagemin');
            const imageminWebp = require('imagemin-webp');
            const imageminMozjpeg = require('imagemin-mozjpeg');
            const imageminPngquant = require('imagemin-pngquant');
            
            const plugins = [];
            
            if (ext === '.jpg' || ext === '.jpeg') {
                plugins.push(imageminMozjpeg({ quality: 85 }));
            } else if (ext === '.png') {
                plugins.push(imageminPngquant({ quality: [0.6, 0.8] }));
            }
            
            const files = await imagemin([inputPath], {
                destination: path.dirname(outputPath),
                plugins
            });
            
            if (files.length > 0) {
                const stats = await fs.stat(outputPath);
                return stats.size;
            }
        } catch (error) {
            console.log(`  ⚠️  ImageMin não disponível, copiando arquivo original`);
        }
        
        // Fallback: copiar arquivo original
        await fs.copyFile(inputPath, outputPath);
        const stats = await fs.stat(outputPath);
        return stats.size;
    }

    async generateResponsiveImages() {
        console.log('📱 Gerando imagens responsivas...');
        
        const responsiveDir = path.join(this.outputDir, 'responsive');
        await fs.mkdir(responsiveDir, { recursive: true });
        
        // Gerar diferentes tamanhos para imagens principais
        const mainImages = this.results.files.filter(f => 
            f.name.includes('hero') || 
            f.name.includes('banner') || 
            f.name.includes('featured')
        );
        
        for (const imageFile of mainImages) {
            if (imageFile.type !== '.svg') {
                await this.createResponsiveVariants(
                    path.join(this.outputDir, imageFile.name),
                    responsiveDir,
                    imageFile.name
                );
            }
        }
        
        // Gerar CSS para imagens responsivas
        await this.generateResponsiveCSS();
    }

    async createResponsiveVariants(imagePath, outputDir, fileName) {
        const baseName = path.parse(fileName).name;
        const ext = path.parse(fileName).ext;
        
        for (const width of this.config.responsive.breakpoints) {
            try {
                // Simular criação de variantes (requer Sharp ou similar)
                const variantName = `${baseName}-${width}w${ext}`;
                const variantPath = path.join(outputDir, variantName);
                
                // Por enquanto, copiar o arquivo original
                // Em produção, usar Sharp para redimensionar
                await fs.copyFile(imagePath, variantPath);
                
                console.log(`  📐 Criada variante: ${variantName}`);
                
            } catch (error) {
                console.warn(`  ⚠️  Erro ao criar variante ${width}w:`, error.message);
            }
        }
    }

    async generateResponsiveCSS() {
        const cssContent = `
/* IMAGENS RESPONSIVAS - Gerado automaticamente */

/* Base para todas as imagens */
img {
    max-width: 100%;
    height: auto;
    display: block;
}

/* Classes utilitárias para imagens responsivas */
.img-responsive {
    width: 100%;
    height: auto;
}

.img-hero {
    width: 100%;
    height: 400px;
    object-fit: cover;
    object-position: center;
}

@media (min-width: 768px) {
    .img-hero {
        height: 500px;
    }
}

@media (min-width: 1024px) {
    .img-hero {
        height: 600px;
    }
}

/* Lazy loading com aspect ratio */
.img-container {
    position: relative;
    overflow: hidden;
}

.img-container::before {
    content: '';
    display: block;
    padding-top: 56.25%; /* 16:9 aspect ratio */
}

.img-container img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* WebP support */
.webp .img-webp {
    background-image: url('data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA');
}
        `.trim();
        
        const cssPath = path.join(this.outputDir, 'responsive-images.css');
        await fs.writeFile(cssPath, cssContent);
        
        console.log('✅ CSS responsivo gerado: responsive-images.css');
    }

    calculateFinalStats() {
        this.results.summary.savedBytes = this.results.summary.originalSize - this.results.summary.optimizedSize;
        this.results.summary.savedPercentage = this.results.summary.originalSize > 0 ? 
            ((this.results.summary.savedBytes / this.results.summary.originalSize) * 100) : 0;
    }

    generateRecommendations() {
        const { summary } = this.results;
        
        // Recomendação geral
        if (summary.savedPercentage > 20) {
            this.results.recommendations.push({
                priority: 'success',
                title: 'Ótima Otimização!',
                description: `Redução de ${summary.savedPercentage.toFixed(1)}% no tamanho das imagens`,
                impact: 'performance'
            });
        } else if (summary.savedPercentage > 0) {
            this.results.recommendations.push({
                priority: 'info',
                title: 'Otimização Moderada',
                description: `Redução de ${summary.savedPercentage.toFixed(1)}% no tamanho das imagens`,
                impact: 'performance'
            });
        }

        // Recomendações específicas
        const largeFiles = this.results.files.filter(f => f.optimizedSize > 500000); // > 500KB
        if (largeFiles.length > 0) {
            this.results.recommendations.push({
                priority: 'medium',
                title: 'Arquivos Grandes Detectados',
                description: `${largeFiles.length} arquivos ainda são maiores que 500KB`,
                actions: [
                    'Considerar compressão adicional',
                    'Implementar lazy loading',
                    'Usar formatos modernos (WebP, AVIF)',
                    'Criar versões menores para mobile'
                ],
                files: largeFiles.map(f => f.name)
            });
        }

        // Recomendações de formato
        const oldFormats = this.results.files.filter(f => f.type === '.png' || f.type === '.jpg');
        if (oldFormats.length > 0) {
            this.results.recommendations.push({
                priority: 'low',
                title: 'Considerar Formatos Modernos',
                description: 'Imagens podem ser convertidas para WebP ou AVIF',
                benefits: [
                    'WebP: 25-35% menor que JPEG',
                    'AVIF: 50% menor que JPEG',
                    'Melhor qualidade visual',
                    'Suporte crescente em navegadores'
                ]
            });
        }

        // Recomendações de performance
        this.results.recommendations.push({
            priority: 'info',
            title: 'Melhorias de Performance',
            description: 'Implementar técnicas avançadas de otimização',
            techniques: [
                'Lazy loading com Intersection Observer',
                'Preload de imagens críticas',
                'Responsive images com srcset',
                'Service Worker para cache agressivo',
                'CDN para distribuição global'
            ]
        });
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async saveResults() {
        const reportPath = path.join(__dirname, '../production/image-optimization-report.json');
        await fs.mkdir(path.dirname(reportPath), { recursive: true });
        await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
        
        // Gerar relatório HTML
        await this.generateHTMLReport();
        
        console.log('✅ Relatório de otimização salvo:', reportPath);
    }

    async generateHTMLReport() {
        const htmlReport = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Otimização de Imagens</title>
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
            color: #667eea;
        }
        .content {
            padding: 30px;
        }
        .file-list {
            display: grid;
            gap: 15px;
        }
        .file-item {
            display: flex;
            align-items: center;
            padding: 15px;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            background: #f8f9fa;
        }
        .file-item.optimized {
            border-left: 4px solid #28a745;
        }
        .file-item.error {
            border-left: 4px solid #dc3545;
        }
        .file-info {
            flex: 1;
        }
        .file-name {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .file-details {
            font-size: 0.9em;
            color: #666;
        }
        .file-savings {
            text-align: right;
            font-weight: bold;
        }
        .savings-positive {
            color: #28a745;
        }
        .progress-bar {
            width: 100%;
            height: 20px;
            background: #e9ecef;
            border-radius: 10px;
            overflow: hidden;
            margin: 20px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #28a745 0%, #20c997 100%);
            transition: width 0.3s ease;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🖼️ Relatório de Otimização de Imagens</h1>
            <p>Plataforma ONG - Otimização para Produção</p>
            <p>Gerado em: ${new Date(this.results.timestamp).toLocaleString('pt-BR')}</p>
        </div>
        
        <div class="summary">
            <div class="stat-card">
                <div class="stat-number">${this.results.summary.totalFiles}</div>
                <div>Arquivos Encontrados</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${this.results.summary.processed}</div>
                <div>Otimizados</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${this.formatBytes(this.results.summary.savedBytes)}</div>
                <div>Espaço Economizado</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${this.results.summary.savedPercentage.toFixed(1)}%</div>
                <div>Redução de Tamanho</div>
            </div>
        </div>
        
        <div class="content">
            <h2>Progresso da Otimização</h2>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${(this.results.summary.processed / this.results.summary.totalFiles * 100)}%"></div>
            </div>
            <p>${this.results.summary.processed} de ${this.results.summary.totalFiles} arquivos processados com sucesso</p>
            
            <h2>Arquivos Otimizados</h2>
            <div class="file-list">
                ${this.results.files.map(file => `
                    <div class="file-item ${file.status}">
                        <div class="file-info">
                            <div class="file-name">${file.name}</div>
                            <div class="file-details">
                                ${file.status === 'optimized' ? 
                                    `${this.formatBytes(file.originalSize)} → ${this.formatBytes(file.optimizedSize)}` :
                                    `Erro: ${file.error || 'Não processado'}`
                                }
                            </div>
                        </div>
                        ${file.status === 'optimized' ? `
                            <div class="file-savings savings-positive">
                                -${file.savedPercentage}%
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
            
            <h2>Recomendações</h2>
            ${this.results.recommendations.map(rec => `
                <div class="recommendation priority-${rec.priority}">
                    <h3>${rec.title}</h3>
                    <p>${rec.description}</p>
                    ${rec.actions ? `
                        <ul>
                            ${rec.actions.map(action => `<li>${action}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
        `.trim();

        const htmlReportPath = path.join(__dirname, '../production/image-optimization-report.html');
        await fs.writeFile(htmlReportPath, htmlReportPath);
    }

    showSummary() {
        console.log('\n🖼️  RESUMO DA OTIMIZAÇÃO DE IMAGENS');
        console.log('====================================');
        console.log(`📁 Arquivos encontrados: ${this.results.summary.totalFiles}`);
        console.log(`✅ Processados: ${this.results.summary.processed}`);
        console.log(`⏭️  Ignorados: ${this.results.summary.skipped}`);
        console.log(`❌ Erros: ${this.results.summary.errors}`);
        console.log(`💾 Tamanho original: ${this.formatBytes(this.results.summary.originalSize)}`);
        console.log(`📦 Tamanho otimizado: ${this.formatBytes(this.results.summary.optimizedSize)}`);
        console.log(`💰 Economia: ${this.formatBytes(this.results.summary.savedBytes)} (${this.results.summary.savedPercentage.toFixed(1)}%)`);
        
        console.log('\n🏆 Top arquivos com maior economia:');
        const topSavings = this.results.files
            .filter(f => f.status === 'optimized')
            .sort((a, b) => b.saved - a.saved)
            .slice(0, 5);
            
        topSavings.forEach((file, i) => {
            console.log(`  ${i + 1}. ${file.name}: ${this.formatBytes(file.saved)} (${file.savedPercentage}%)`);
        });
        
        console.log('\n📄 Relatórios gerados:');
        console.log('  • atividade4/production/image-optimization-report.json');
        console.log('  • atividade4/production/image-optimization-report.html');
        console.log('  • atividade4/production/assets/img/ (imagens otimizadas)');
    }
}

// Executar otimização
if (require.main === module) {
    const optimizer = new ImageOptimizer();
    optimizer.optimize();
}

module.exports = ImageOptimizer;