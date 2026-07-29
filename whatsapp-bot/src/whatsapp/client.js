const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const config = require('../config');

function crearClienteWhatsapp() {
  const client = new Client({
    authStrategy: new LocalAuth({ dataPath: config.whatsappSessionPath }),
    puppeteer: {
      // --no-sandbox es obligatorio en la mayoría de contenedores/VPS sin
      // usuario root dedicado (Railway, Render, Docker genérico).
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      // En el Dockerfile se usa el Chromium del sistema (más ligero que el
      // que descarga Puppeteer). En local dev, sin esta variable, Puppeteer
      // usa el Chromium que descarga él mismo al instalar dependencias.
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    },
  });

  client.on('qr', (qr) => {
    console.log('Escanea este QR con WhatsApp (Dispositivos vinculados):');
    qrcode.generate(qr, { small: true });
  });

  client.on('authenticated', () => {
    console.log('[whatsapp-bot] Sesión autenticada correctamente.');
  });

  client.on('auth_failure', (msg) => {
    console.error('[whatsapp-bot] Fallo de autenticación:', msg);
  });

  client.on('disconnected', (reason) => {
    console.error('[whatsapp-bot] Desconectado:', reason, '— reintentando...');
    client.initialize();
  });

  return client;
}

module.exports = { crearClienteWhatsapp };
