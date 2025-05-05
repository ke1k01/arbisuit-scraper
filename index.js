const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.get('/', async (req, res) => {
  const query = req.query.q || 'iphone';
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.goto(`https://es.wallapop.com/app/search?keywords=${encodeURIComponent(query)}`);

  await page.waitForTimeout(3000); // Esperar un poco para que cargue
  const items = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[data-testid="item-card"]')).slice(0, 10).map(el => {
      const title = el.querySelector('[data-testid="item-card-title"]')?.innerText || '';
      const price = el.querySelector('[data-testid="item-card-price"]')?.innerText || '';
      const url = el.querySelector('a')?.href || '';
      return { title, price, url };
    });
  });

  await browser.close();

  const html = items.map(i => `
    <div style="margin-bottom: 10px;">
      <strong>${i.title}</strong><br/>
      ${i.price}<br/>
      <a href="${i.url}" target="_blank">Ver</a>
    </div>
  `).join('');

  res.send(`<h1>Resultados para "${query}"</h1>${html}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Escuchando en puerto " + PORT));