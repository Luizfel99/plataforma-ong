const fs = require('fs');
const { chromium, firefox, webkit } = require('playwright');
(async ()=>{
  const browsers = [ {name:'Chromium', launcher:chromium}, {name:'Firefox', launcher:firefox}, {name:'WebKit', launcher:webkit} ];
  const pages = ['/', '/projetos.html', '/doacoes.html', '/contato.html'];
  let out = ['# Compatibilidade','', 'Testes realizados com Playwright (headless). Resumo de status e erros de console.',''];
  for (const b of browsers){
    out.push(`## ${b.name}`,'');
    const browser = await b.launcher.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    for (const p of pages){
      const url = 'http://127.0.0.1:3000' + p;
      let status = null;
      let errors = [];
      page.on('console', msg => { if (msg.type()==='error') errors.push(msg.text()); });
      try{
        const res = await page.goto(url, { waitUntil:'networkidle', timeout:20000 });
        status = res ? res.status() : 'no-response';
      }catch(e){ status = 'error'; errors.push(e.message); }
      out.push(`- ${p}  status: ${status}`);
      if (errors.length) out.push('  - console errors:','    - '+errors.join('\n    - '));
    }
    await browser.close();
    out.push('');
  }
  fs.writeFileSync('docs/compatibility.md', out.join('\n'));
  console.log('docs/compatibility.md written');
})();
