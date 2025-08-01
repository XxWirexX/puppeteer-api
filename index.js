const puppeteer = require('puppeteer');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
  res.send('🎬 API Puppeteer pour extraire les liens vidéo Vidmoly');
});

app.get('/extract', async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).json({ error: 'URL manquante. Utilise ?url=https://...' });
  }

  console.log(`🎥 Extraction depuis : ${videoUrl}`);

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Simule un vrai navigateur (important pour éviter les protections)
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    );

    // Désactive les images et autres éléments inutiles
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Navigation avec un timeout plus long
    await page.goto(videoUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(12000);


    await browser.close();

    if (videoLinks.length === 0) {
      return res.status(404).json({ error: 'Aucun lien vidéo trouvé' });
    }

    res.json({ links: videoLinks });

  } catch (err) {
    console.error('Erreur Puppeteer :', err);
    res.status(500).json({ error: 'Erreur lors de l’extraction', details: err.toString() });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API Puppeteer démarrée sur le port ${PORT}`);
});
