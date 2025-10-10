/**
 * BUILD.JS - SISTEMA DE BUILD PRINCIPAL
 * Orquestra todo o processo de otimização para produção
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class ProductionBuilder {
    constructor() {
        this.sourceDir = path.resolve(__dirname, '../..');
        this.outputDir = path.resolve(__dirname, '../production');
        this.startTime = Date.now();
        
        console.log('🚀 Iniciando build para produção...');
        console.log('📁 Origem:', this.sourceDir);
        console.log('📁 Destino:', this.outputDir);
    }

    async build() {
        try {
            // 1. Limpar diretório de output
            await this.cleanOutput();
            
            // 2. Copiar estrutura base
            await this.copyBaseStructure();
            
            // 3. Minificar CSS
            await this.minifyCSS();
            
            // 4. Minificar JavaScript
            await this.minifyJavaScript();
            
            // 5. Minificar HTML
            await this.minifyHTML();
            
            // 6. Otimizar imagens
            await this.optimizeImages();
            
            // 7. Gerar Service Worker
            await this.generateServiceWorker();
            
            // 8. Gerar relatório
            await this.generateReport();
            
            const buildTime = ((Date.now() - this.startTime) / 1000).toFixed(2);
            console.log(`✅ Build concluído em ${buildTime}s`);
            
        } catch (error) {
            console.error('❌ Erro no build:', error);
            process.exit(1);
        }
    }

    async cleanOutput() {
        console.log('🧹 Limpando diretório de output...');
        
        try {
            await fs.rm(this.outputDir, { recursive: true, force: true });
            await fs.mkdir(this.outputDir, { recursive: true });
            console.log('✅ Diretório limpo');
        } catch (error) {
            console.error('❌ Erro ao limpar output:', error);
        }
    }

    async copyBaseStructure() {
        console.log('📋 Copiando estrutura base...');
        
        const itemsToCopy = [
            'index.html',
            'assets/img',
            'assets/video',
            'assets/audio'
        ];

        for (const item of itemsToCopy) {
            const sourcePath = path.join(this.sourceDir, item);
            const targetPath = path.join(this.outputDir, item);
            
            try {
                await this.copyRecursive(sourcePath, targetPath);
                console.log(`✅ Copiado: ${item}`);
            } catch (error) {
                console.warn(`⚠️ Não foi possível copiar: ${item}`);
            }
        }
    }

    async copyRecursive(source, target) {
        const stats = await fs.stat(source);
        
        if (stats.isDirectory()) {
            await fs.mkdir(target, { recursive: true });
            const items = await fs.readdir(source);
            
            for (const item of items) {
                await this.copyRecursive(
                    path.join(source, item),
                    path.join(target, item)
                );
            }
        } else {
            await fs.copyFile(source, target);
        }
    }

    async minifyCSS() {
        console.log('🎨 Minificando CSS...');
        
        const CleanCSS = require('clean-css');
        const cleaner = new CleanCSS({
            level: 2,
            returnPromise: true,
            sourceMap: true,
            rebaseTo: this.outputDir
        });

        try {
            // Processar todos os arquivos CSS
            const cssFiles = await this.findFiles(this.sourceDir, '.css');
            
            for (const cssFile of cssFiles) {
                const relativePath = path.relative(this.sourceDir, cssFile);
                const outputPath = path.join(this.outputDir, relativePath);
                
                await fs.mkdir(path.dirname(outputPath), { recursive: true });
                
                const input = await fs.readFile(cssFile, 'utf8');
                const result = await cleaner.minify(input);
                
                if (result.errors.length > 0) {
                    console.error('❌ Erros no CSS:', result.errors);
                    continue;
                }

                await fs.writeFile(outputPath, result.styles);
                
                if (result.sourceMap) {
                    await fs.writeFile(outputPath + '.map', result.sourceMap.toString());
                }
                
                const originalSize = Buffer.byteLength(input, 'utf8');
                const minifiedSize = Buffer.byteLength(result.styles, 'utf8');
                const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
                
                console.log(`✅ ${relativePath}: ${originalSize}b → ${minifiedSize}b (${savings}% menor)`);
            }
            
        } catch (error) {
            console.error('❌ Erro ao minificar CSS:', error);
        }
    }

    async minifyJavaScript() {
        console.log('⚡ Minificando JavaScript...');
        
        const { minify } = require('terser');
        
        try {
            const jsFiles = await this.findFiles(this.sourceDir, '.js');
            
            for (const jsFile of jsFiles) {
                const relativePath = path.relative(this.sourceDir, jsFile);
                const outputPath = path.join(this.outputDir, relativePath);
                
                await fs.mkdir(path.dirname(outputPath), { recursive: true });
                
                const input = await fs.readFile(jsFile, 'utf8');
                
                const result = await minify(input, {
                    compress: {
                        dead_code: true,
                        drop_console: false, // Manter console para debug
                        drop_debugger: true,
                        keep_fargs: false,
                        unsafe_comps: true,
                        unsafe_math: true
                    },
                    mangle: {
                        toplevel: true,
                        keep_fnames: false
                    },
                    format: {
                        comments: false
                    },
                    sourceMap: {
                        filename: path.basename(outputPath),
                        url: path.basename(outputPath) + '.map'
                    }
                });
                
                if (result.error) {
                    console.error('❌ Erro no JavaScript:', result.error);
                    continue;
                }

                await fs.writeFile(outputPath, result.code);
                
                if (result.map) {
                    await fs.writeFile(outputPath + '.map', result.map);
                }
                
                const originalSize = Buffer.byteLength(input, 'utf8');
                const minifiedSize = Buffer.byteLength(result.code, 'utf8');
                const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
                
                console.log(`✅ ${relativePath}: ${originalSize}b → ${minifiedSize}b (${savings}% menor)`);
            }
            
        } catch (error) {
            console.error('❌ Erro ao minificar JavaScript:', error);
        }
    }

    async minifyHTML() {
        console.log('📄 Minificando HTML...');
        
        const { minify } = require('html-minifier-terser');
        
        const options = {
            collapseWhitespace: true,
            removeComments: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            removeEmptyAttributes: true,
            minifyCSS: true,
            minifyJS: true,
            preserveLineBreaks: false,
            preventAttributesEscaping: true
        };

        try {
            const htmlFiles = await this.findFiles(this.sourceDir, '.html');
            
            for (const htmlFile of htmlFiles) {
                const relativePath = path.relative(this.sourceDir, htmlFile);
                const outputPath = path.join(this.outputDir, relativePath);
                
                await fs.mkdir(path.dirname(outputPath), { recursive: true });
                
                const input = await fs.readFile(htmlFile, 'utf8');
                const result = await minify(input, options);
                
                await fs.writeFile(outputPath, result);
                
                const originalSize = Buffer.byteLength(input, 'utf8');
                const minifiedSize = Buffer.byteLength(result, 'utf8');
                const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
                
                console.log(`✅ ${relativePath}: ${originalSize}b → ${minifiedSize}b (${savings}% menor)`);
            }
            
        } catch (error) {
            console.error('❌ Erro ao minificar HTML:', error);
        }
    }

    async optimizeImages() {
        console.log('🖼️ Otimizando imagens...');
        
        try {
            const imagemin = require('imagemin');
            const imageminMozjpeg = require('imagemin-mozjpeg');
            const imageminPngquant = require('imagemin-pngquant');
            const imageminSvgo = require('imagemin-svgo');
            const imageminWebp = require('imagemin-webp');

            const imageDir = path.join(this.sourceDir, 'assets/img');
            const outputImageDir = path.join(this.outputDir, 'assets/img');
            
            await fs.mkdir(outputImageDir, { recursive: true });

            // Otimizar diferentes formatos
            const plugins = [
                imageminMozjpeg({ quality: 85 }),
                imageminPngquant({ 
                    quality: [0.6, 0.8],
                    speed: 1
                }),
                imageminSvgo({
                    plugins: [
                        { name: 'removeViewBox', active: false },
                        { name: 'removeDimensions', active: true }
                    ]
                })
            ];

            const files = await imagemin([`${imageDir}/*`], {
                destination: outputImageDir,
                plugins: plugins
            });

            // Gerar versões WebP
            const webpFiles = await imagemin([`${imageDir}/*.{jpg,jpeg,png}`], {
                destination: outputImageDir,
                plugins: [
                    imageminWebp({ quality: 80 })
                ]
            });

            console.log(`✅ ${files.length} imagens otimizadas`);
            console.log(`✅ ${webpFiles.length} versões WebP geradas`);
            
        } catch (error) {
            console.error('❌ Erro ao otimizar imagens:', error);
        }
    }

    async generateServiceWorker() {
        console.log('⚙️ Gerando Service Worker...');
        
        const swContent = `
// Service Worker para Plataforma ONG
const CACHE_NAME = 'plataforma-ong-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/assets/css/main.css',
    '/assets/js/app.js',
    '/assets/img/logo.svg'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
        `.trim();

        await fs.writeFile(
            path.join(this.outputDir, 'service-worker.js'),
            swContent
        );
        
        console.log('✅ Service Worker gerado');
    }

    async generateReport() {
        console.log('📊 Gerando relatório de build...');
        
        const report = {
            timestamp: new Date().toISOString(),
            buildTime: Date.now() - this.startTime,
            files: {},
            totalSavings: {
                originalSize: 0,
                optimizedSize: 0,
                savings: 0
            }
        };

        // Calcular estatísticas
        const files = await this.findFiles(this.outputDir, ['.html', '.css', '.js']);
        
        for (const file of files) {
            const stats = await fs.stat(file);
            const relativePath = path.relative(this.outputDir, file);
            
            report.files[relativePath] = {
                size: stats.size,
                type: path.extname(file)
            };
        }

        const reportPath = path.join(this.outputDir, 'build-report.json');
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
        
        console.log('✅ Relatório gerado:', reportPath);
    }

    async findFiles(dir, extensions) {
        const files = [];
        const items = await fs.readdir(dir, { withFileTypes: true });

        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            
            if (item.isDirectory()) {
                files.push(...await this.findFiles(fullPath, extensions));
            } else {
                const ext = path.extname(item.name);
                if (Array.isArray(extensions) ? extensions.includes(ext) : ext === extensions) {
                    files.push(fullPath);
                }
            }
        }

        return files;
    }
}

// Executar build
if (require.main === module) {
    const builder = new ProductionBuilder();
    builder.build();
}

module.exports = ProductionBuilder;