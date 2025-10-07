const { chromium } = require('playwright');

(async ()=>{
  const host = process.env.HOST || 'http://127.0.0.1:3000';
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.goto(host, { waitUntil: 'networkidle' });
    const styles = await page.evaluate(()=>{
      const sheets = Array.from(document.styleSheets).map(s=>({href: s.href, rules: s.cssRules ? s.cssRules.length : null}));
      const body = window.getComputedStyle(document.body);
      const hero = document.querySelector('.hero');
      const heroStyle = hero ? window.getComputedStyle(hero) : null;
      return {sheets, bodyBg: body.backgroundColor, bodyColor: body.color, heroBg: heroStyle ? heroStyle.backgroundImage || heroStyle.backgroundColor : null};
    });
    console.log('Loaded stylesheets:');
    styles.sheets.forEach(s=>console.log('-', s.href, '(rules:', s.rules, ')'));
    console.log('Computed body background:', styles.bodyBg);
    console.log('Computed body color:', styles.bodyColor);
    console.log('Computed hero background:', styles.heroBg);
  } catch(err){
    console.error('inspect failed', err);
  } finally{
    await browser.close();
  }
})();