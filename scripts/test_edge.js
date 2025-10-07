const fs = require('fs');
(async ()=>{
  const { chromium } = require('playwright');
  const pages = ['/', '/projetos.html', '/doacoes.html', '/contato.html'];
  let out = fs.readFileSync('docs/compatibility.md','utf8');
  out += '\n## Edge (msedge)\n\n';
  try{
    const browser = await chromium.launch({ channel: 'msedge' });
    const context = await browser.newContext();
    const page = await context.newPage();
    for (const p of pages){
  const url = 'http://127.0.0.1:3000' + p;
      let status='no-response';
      try{
        const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
        status = res ? res.status() : 'no-response';
      }catch(e){ status = 'error: '+e.message; }
      out += `- ${p}  status: ${status}\n`;
    }
    await browser.close();
  }catch(err){
    out += 'Edge (msedge) not available on this machine or Playwright cannot launch it: ' + err.message + '\n';
  }
  fs.writeFileSync('docs/compatibility.md', out);
  console.log('Updated docs/compatibility.md with Edge results');
})();
