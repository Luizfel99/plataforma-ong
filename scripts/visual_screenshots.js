const { chromium } = require('playwright');
const fs = require('fs');

(async ()=>{
  const host = process.env.HOST || 'http://127.0.0.1:8000';
  const pages = ['/', '/projetos.html', '/doacoes.html', '/contato.html'];
  const viewports = [
    {name:'360x640', width:360, height:640},
    {name:'480x800', width:480, height:800},
    {name:'768x1024', width:768, height:1024},
    {name:'1366x768', width:1366, height:768},
    {name:'1440x900', width:1440, height:900},
  ];

  if (!fs.existsSync('screenshots')) fs.mkdirSync('screenshots');

  const browser = await chromium.launch();

  for (const pagePath of pages) {
    for (const vp of viewports) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await context.newPage();
      const url = host.replace(/\/$/, '') + pagePath;
      console.log('Capturing', url, vp.name);
      try {
        await page.goto(url, { waitUntil: 'networkidle' , timeout: 30000});
        const safeName = pagePath === '/' ? 'index' : pagePath.replace(/\//g,'').replace('.html','');
        const filename = `screenshots/${safeName}__${vp.name}.png`;
        await page.screenshot({ path: filename, fullPage: true });
      } catch (err) {
        console.error('Failed capturing', url, vp.name, err.message);
      }
      await context.close();
    }
  }

  await browser.close();
  console.log('Done. Screenshots saved to screenshots/');
})();
