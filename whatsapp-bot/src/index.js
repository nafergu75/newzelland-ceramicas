const config = require('./config');
const { ensureTables, pool } = require('./db');
const { crearClienteWhatsapp } = require('./whatsapp/client');
const { getOrCreateConversation, saveMessage, getRecentHistory } = require('./conversation/store');
const { responder } = require('./ai/aiProvider');

// Solo mensajes 1:1 (no grupos) y no los propios del bot — un bot en un
// grupo respondiendo cada mensaje sería spam y no es el caso de uso pedido.
function esMensajeAtendible(message) {
  return !message.from.endsWith('@g.us') && !message.fromMe;
}

async function manejarMensaje(message) {
  if (!esMensajeAtendible(message)) return;

  const waId = message.from;
  const contacto = await message.getContact();
  const conversation = await getOrCreateConversation(waId, contacto?.pushname || contacto?.name);

  await saveMessage(conversation.id, 'user', message.body);

  // Si ya está esperando a un humano, el bot se calla — un humano se hará
  // cargo desde fuera de este proceso (panel de admin / WhatsApp directo).
  // Reactivar el bot es una acción manual (ver conversation/store.js).
  if (conversation.estado === 'esperando_humano') {
    console.log(`[whatsapp-bot] Conversación ${waId} en espera de humano — mensaje guardado, sin respuesta automática.`);
    return;
  }

  try {
    const historial = await getRecentHistory(conversation.id);
    const respuestaTexto = await responder(historial.slice(0, -1), message.body, conversation.id);

    if (respuestaTexto) {
      await message.reply(respuestaTexto);
      await saveMessage(conversation.id, 'assistant', respuestaTexto);
    }
  } catch (error) {
    console.error(`[whatsapp-bot] Error generando respuesta para ${waId}:`, error);
    await message.reply('Disculpa, he tenido un problema técnico. En breve te contactamos por aquí mismo.');
  }
}

async function main() {
  console.log('[whatsapp-bot] Iniciando...');
  await ensureTables();

  const client = crearClienteWhatsapp();

  client.on('ready', () => {
    console.log('[whatsapp-bot] Cliente de WhatsApp listo y escuchando mensajes.');
  });

  client.on('message', (message) => {
    manejarMensaje(message).catch((error) => {
      console.error('[whatsapp-bot] Error no controlado manejando mensaje:', error);
    });
  });

  await client.initialize();
}

process.on('SIGINT', async () => {
  console.log('\n[whatsapp-bot] Cerrando conexión a base de datos...');
  await pool.end();
  process.exit(0);
});

main().catch((error) => {
  console.error('[whatsapp-bot] Error fatal al iniciar:', error);
  process.exit(1);
});
