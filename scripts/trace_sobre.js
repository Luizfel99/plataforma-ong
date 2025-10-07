const { chromium } = require('playwright');

(async ()=>{
  const host = process.env.HOST || 'http://127.0.0.1:4000';
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const requests = [];
  page.on('requestfailed', r=>{
    requests.push({url: r.url(), status: 'failed', method: r.method(), resourceType: r.resourceType()});
  });
  page.on('response', r=>{
    if (r.status() >= 400) requests.push({url: r.url(), status: r.status(), method: r.request().method(), resourceType: r.request().resourceType()});
  });
  page.on('console', msg=>console.log('CONSOLE:', msg.type(), msg.text()));
  try {
    await page.goto(host + '/sobre.html', { waitUntil: 'networkidle' });
    // wait a bit to let video-check run
    await page.waitForTimeout(1000);
    console.log('Captured requests with errors:');
    console.log(requests.filter(r=>r.status && (r.status === 'failed' || r.status >= 400)));
  } catch(err){
    console.error('trace failed', err);
  } finally{
    await browser.close();
  }
})();