FROM node:18-slim

# Prérequis Puppeteer pour Chrome Headless
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libxss1 \
    libxtst6 \
    xdg-utils \
    libdrm2 \
    libgbm1 \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Créer le dossier app
WORKDIR /app

# Copier les fichiers
COPY . .

# Installer les dépendances
RUN npm install

# Exposer le port utilisé par Express
ENV PORT=3000
EXPOSE 3000

# Lancer le script
CMD ["node", "index.js"]
