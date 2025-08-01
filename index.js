const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/get-m3u8', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).send("❌ Paramètre ?url= requis.");

  console.log('🎥 Extraction depuis :', videoUrl);

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    let found = null;

    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('.m3u8')) {
        found = url;
      }
    });

    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const type = req.resourceType();
      if (['image', 'stylesheet', 'font'].includes(type)) req.abort();
      else req.continue();
    });

    await page.goto(videoUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForTimeout(10000);
    await browser.close();

    if (found) {
      res.send({ m3u8: found });
    } else {
      res.status(404).send("❌ Aucun lien .m3u8 trouvé.");
    }

  } catch (err) {
    console.error('Erreur Puppeteer :', err);
    res.status(500).send("❌ Erreur interne.");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API Puppeteer démarrée sur le port ${PORT}`);
});
