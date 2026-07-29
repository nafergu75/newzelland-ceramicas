const { pool } = require('../db');

async function getOrCreateConversation(waId, nombreContacto) {
  const existing = await pool.query('SELECT * FROM whatsapp_conversations WHERE wa_id = $1', [waId]);
  if (existing.rows.length > 0) return existing.rows[0];

  const created = await pool.query(
    `INSERT INTO whatsapp_conversations (wa_id, nombre_contacto, estado)
     VALUES ($1, $2, 'bot') RETURNING *`,
    [waId, nombreContacto || null]
  );
  return created.rows[0];
}

async function saveMessage(conversationId, rol, contenido) {
  await pool.query(
    'INSERT INTO whatsapp_messages (conversation_id, rol, contenido) VALUES ($1, $2, $3)',
    [conversationId, rol, contenido]
  );
  await pool.query('UPDATE whatsapp_conversations SET updated_at = NOW() WHERE id = $1', [conversationId]);
}

// Ventana de contexto acotada: suficiente para que Claude mantenga el hilo
// de la conversación sin mandar el historial completo en cada mensaje
// (coste y latencia crecerían sin límite en conversaciones largas).
async function getRecentHistory(conversationId, limit = 20) {
  const result = await pool.query(
    `SELECT rol, contenido FROM whatsapp_messages
     WHERE conversation_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [conversationId, limit]
  );
  return result.rows.reverse();
}

async function marcarHandoff(conversationId, motivo) {
  await pool.query(
    `UPDATE whatsapp_conversations SET estado = 'esperando_humano', motivo_handoff = $2, updated_at = NOW() WHERE id = $1`,
    [conversationId, motivo]
  );
  await pool.query(
    `INSERT INTO whatsapp_messages (conversation_id, rol, contenido) VALUES ($1, 'system', $2)`,
    [conversationId, `Handoff activado: ${motivo}`]
  );
}

async function reactivarBot(conversationId) {
  await pool.query(
    `UPDATE whatsapp_conversations SET estado = 'bot', motivo_handoff = NULL, updated_at = NOW() WHERE id = $1`,
    [conversationId]
  );
}

module.exports = { getOrCreateConversation, saveMessage, getRecentHistory, marcarHandoff, reactivarBot };
