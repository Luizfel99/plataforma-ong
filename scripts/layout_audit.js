const { chromium } = require('playwright');

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

  const browser = await chromium.launch();
  for (const pagePath of pages) {
    for (const vp of viewports) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await context.newPage();
      const url = host.replace(/\/$/, '') + pagePath;
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        const result = await page.evaluate(() => {
          const issues = [];
          const doc = document.documentElement;
          // horizontal overflow
          const hasHOverflow = doc.scrollWidth > doc.clientWidth + 1;
          if (hasHOverflow) issues.push('horizontal-overflow');
          // font family
          const bodyStyle = window.getComputedStyle(document.body);
          const fontFamily = bodyStyle.fontFamily || '';
          // nav wrapping detection
          const nav = document.querySelector('nav');
          let navWrap = false;
          if (nav) {
            const links = nav.querySelectorAll('a,button');
            if (links.length) {
              const firstTop = links[0].getBoundingClientRect().top;
              for (let i=1;i<links.length;i++){
                const r = links[i].getBoundingClientRect();
                if (Math.abs(r.top - firstTop) > 4) { navWrap = true; break; }
              }
            }
            if (nav.scrollWidth > nav.clientWidth + 1) navWrap = true;
            if (navWrap) issues.push('nav-wrapped');
          }
          // grid-cards columns
          let gridCols = null;
          const grid = document.querySelector('.grid-cards');
          if (grid) {
            const style = window.getComputedStyle(grid);
            const cols = style.gridTemplateColumns;
            if (cols && cols !== 'none') {
              gridCols = cols.split(' ').length;
            } else {
              // fallback estimate
              const children = Array.from(grid.children);
              if (children.length) {
                const containerW = grid.getBoundingClientRect().width;
                const childW = children[0].getBoundingClientRect().width;
                gridCols = Math.max(1, Math.round(containerW / childW));
              }
            }
            if (gridCols && gridCols < 1) gridCols = 1;
          }
          return {
            hasHOverflow,
            fontFamily,
            navWrap,
            gridCols,
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight,
            title: document.title,
          };
        });
        console.log(JSON.stringify({url, viewport: vp.name, result}));
      } catch (err) {
        console.error('ERROR', url, vp.name, err.message);
      }
      await context.close();
    }
  }
  await browser.close();
})();
