const fs = require('fs');

// Ensure docs exists
if (!fs.existsSync('docs')) fs.mkdirSync('docs');

const pages = ['index','projetos','doacoes','contato'];

// Generate performance.md from reports JSON
let perfLines = ['# Relatório Lighthouse (resumo)','Gerei os relatórios completos em reports/*.json e reports/*.html. Abaixo as pontuações resumidas (0-100):','','| Página | Performance | Accessibility | Best Practices | SEO |','|---|---:|---:|---:|---:|'];
for (const p of pages) {
  const path = `reports/${p}.json`;
  if (!fs.existsSync(path)) continue;
  const j = JSON.parse(fs.readFileSync(path, 'utf8'));
  const perf = Math.round(j.categories.performance.score * 100);
  const acc = Math.round(j.categories.accessibility.score * 100);
  const bp = Math.round(j.categories['best-practices'].score * 100);
  const seo = Math.round(j.categories.seo.score * 100);
  perfLines.push(`| ${p} | ${perf} | ${acc} | ${bp} | ${seo} |`);
}
fs.writeFileSync('docs/performance.md', perfLines.join('\n'));
console.log('docs/performance.md written');

// Generate styleguide.md from tokens and typography
let tokens = '';
try { tokens = fs.readFileSync('src/styles/_tokens.css', 'utf8'); } catch(e) { tokens = ''; }
let typography = '';
try { typography = fs.readFileSync('src/styles/_typography.css', 'utf8'); } catch(e) { typography = ''; }

function extractVars(css, prefix){
  const obj = {};
  const m = css.match(/:root\s*\{([\s\S]*?)\}/);
  if (!m) return obj;
  const body = m[1];
  const re = /--([a-z0-9-]+)\s*:\s*([^;]+);/gmi;
  let it;
  while((it = re.exec(body))){ obj[it[1].trim()] = it[2].trim(); }
  return obj;
}

const vars = extractVars(tokens);

let styleLines = ['# Styleguide','', '## Paleta de cores',''];
const colorKeys = Object.keys(vars).filter(k=>/(color|gray|white|primary|secondary|success|warning|danger|info)/i.test(k));
if (colorKeys.length){
  styleLines.push('| Nome | Valor |');
  styleLines.push('|---|---|');
  for (const k of colorKeys){ styleLines.push(`| ${k} | ${vars[k]} |`); }
} else styleLines.push('Nenhuma variável de cor encontrada.');

styleLines.push('', '## Tipografia','');
const font = vars['font-sans'] || 'N/A';
styleLines.push(`- Fonte base: ${font}`);
styleLines.push('');
styleLines.push('### Escalas de fonte');
const fsKeys = Object.keys(vars).filter(k=>/^fs-/.test(k));
if (fsKeys.length){
  styleLines.push('| Token | Valor |');
  styleLines.push('|---|---:|');
  for (const k of fsKeys){ styleLines.push(`| ${k} | ${vars[k]} |`); }
}

styleLines.push('', '## Espaçamentos');
const spKeys = Object.keys(vars).filter(k=>/^space-/.test(k));
if (spKeys.length){
  styleLines.push('| Token | Valor |');
  styleLines.push('|---|---:|');
  for (const k of spKeys){ styleLines.push(`| ${k} | ${vars[k]} |`); }
}

styleLines.push('', '## Radii & sombras');
const radKeys = ['radius-sm','radius-md','radius-lg'];
for (const k of radKeys){ if (vars[k]) styleLines.push(`- ${k}: ${vars[k]}`); }
styleLines.push('', '## Containers');
const contKeys = Object.keys(vars).filter(k=>/^container-/.test(k));
for (const k of contKeys){ styleLines.push(`- ${k}: ${vars[k]}`); }

styleLines.push('', '## Observações de tipografia (trechos de _typography.css)','');
if (typography) styleLines.push('```css\n'+typography.trim()+'\n```');

fs.writeFileSync('docs/styleguide.md', styleLines.join('\n'));
console.log('docs/styleguide.md written');
