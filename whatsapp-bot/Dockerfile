FROM node:20-slim

# Dependencias de sistema que necesita Puppeteer/Chromium para correr
# whatsapp-web.js en un contenedor headless.
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libnss3 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libgbm1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# La sesión de WhatsApp (LocalAuth) debe persistir entre despliegues, o
# habrá que re-escanear el QR cada vez — montar como volumen en Railway/
# Render/Fly.io apuntando a esta ruta.
VOLUME ["/app/.wwebjs_auth"]

CMD ["node", "src/index.js"]
