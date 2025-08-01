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
      headless: 'new', // ou true si erreur
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    let videoLinks = [];

    // Intercepte les requêtes
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('.m3u8') || url.includes('.mp4')) {
        console.log('✅ Lien vidéo détecté :', url);
        videoLinks.push(url);
      }
    });

    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(videoUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForTimeout(10000); // attendre que les requêtes soient faites

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
