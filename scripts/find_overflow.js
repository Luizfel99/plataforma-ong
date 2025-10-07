const { chromium } = require('playwright');

(async ()=>{
  const host = process.env.HOST || 'http://127.0.0.1:8000';
  const pages = ['/contato.html','/doacoes.html','/projetos.html','/'];
  const vp = {width:360,height:640,name:'360x640'};
  const browser = await chromium.launch();
  for (const pagePath of pages) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    const url = host.replace(/\/$/, '') + pagePath;
    try{
      await page.goto(url,{waitUntil:'networkidle'});
      const offenders = await page.evaluate(()=>{
        const docW = document.documentElement.clientWidth;
        const list = [];
        const all = Array.from(document.querySelectorAll('body *'));
        for (const el of all) {
          const r = el.getBoundingClientRect();
          if (r.right > docW + 1) {
            list.push({tag: el.tagName.toLowerCase(), class: el.className, id: el.id, right: Math.round(r.right), width: Math.round(r.width), html: el.outerHTML.slice(0,200) });
          }
        }
        return list.slice(0,10);
      });
      console.log('PAGE',url,'OFFENDERS',JSON.stringify(offenders,null,2));
    }catch(e){console.error('ERR',url,e.message)}
    await context.close();
  }
  await browser.close();
})();
