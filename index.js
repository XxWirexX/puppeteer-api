const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 8000;

app.get('/extract', async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).json({ error: 'Paramètre "url" manquant.' });
  }

  console.log(`🎥 Extraction depuis : ${videoUrl}`);

  let browser;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage'
      ]
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    );

    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const type = req.resourceType();
      if (['image', 'stylesheet', 'font'].includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    let foundVideoUrl = null;

    page.on('response', async (response) => {
      const resUrl = response.url();
      if (resUrl.includes('.m3u8') || resUrl.includes('.mp4')) {
        if (!foundVideoUrl) {
          foundVideoUrl = resUrl;
          console.log('✅ Lien vidéo trouvé :', foundVideoUrl);
        }
      }
    });

    await page.goto(videoUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 90000
    });

    await page.waitForTimeout(15000); // Donne le temps aux requêtes

    await browser.close();

    if (foundVideoUrl) {
      return res.json({ video: foundVideoUrl });
    } else {
      return res.status(404).json({ error: 'Aucun lien .m3u8 ou .mp4 détecté.' });
    }
  } catch (err) {
    if (browser) await browser.close();
    console.error('Erreur Puppeteer :', err);
    return res.status(500).json({ error: 'Erreur Puppeteer', details: err.toString() });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API Puppeteer démarrée sur le port ${PORT}`);
});
