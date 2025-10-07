const { chromium } = require('playwright');

(async ()=>{
  const host = process.env.HOST || 'http://127.0.0.1:8000';
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await context.newPage();

  try {
    await page.goto(host, { waitUntil: 'networkidle' });

    // helper to click and report
    async function clickAndReport(selector, name) {
      const el = await page.$(selector);
      if (!el) {
        console.log(`${name}: element not found (${selector})`);
        return;
      }
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle', timeout: 5000 }).catch(()=>null),
        el.click()
      ]);
      console.log(`${name}: url=${page.url()}`);
      // go back to home for next click
      await page.goto(host, { waitUntil: 'networkidle' });
    }

    // Try Início (link)
    await clickAndReport('a.navbar__link[href="index.html"]', 'Início');

    // Try Projetos (link)
    await clickAndReport('a.navbar__link[href="projetos.html"]', 'Projetos');

    // Try Doar (link)
    await clickAndReport('a.navbar__link[href="doacoes.html"]', 'Doar');

  } catch (err) {
    console.error('Test failed', err);
  } finally {
    await browser.close();
  }
})();