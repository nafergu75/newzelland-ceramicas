/**
 * Almacenamiento de conversaciones - Fase 5
 * Guarda conversaciones en JSON Lines (logs/conversations.jsonl)
 * Escalable para migración a base de datos
 */

const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('crypto').randomUUID || (() => require('uuid').v4)();

// Intentar usar uuid de crypto (Node 15.7+) o fallback
let generateId;
try {
  const crypto = require('crypto');
  if (crypto.randomUUID) {
    generateId = () => crypto.randomUUID();
  } else {
    generateId = () => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} catch {
  generateId = () => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

const CONVERSATIONS_FILE = path.join(process.cwd(), 'logs', 'conversations.jsonl');

/**
 * Asegurar que el directorio de logs existe
 */
async function ensureLogsDir() {
  try {
    await fs.mkdir(path.dirname(CONVERSATIONS_FILE), { recursive: true });
  } catch (error) {
    console.error('Error creando directorio de logs:', error);
  }
}

/**
 * Obtener conversación por ID
 * @param {string} conversationId
 * @returns {Promise<Object|null>}
 */
async function getConversationById(conversationId) {
  try {
    await ensureLogsDir();
    const fileContent = await fs.readFile(CONVERSATIONS_FILE, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim());

    for (const line of lines) {
      try {
        const conversation = JSON.parse(line);
        if (conversation.id === conversationId) {
          return conversation;
        }
      } catch (parseError) {
        // Saltar líneas malformadas
        continue;
      }
    }

    return null;
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Archivo no existe aún
      return null;
    }
    console.warn('Error leyendo conversaciones:', error.message);
    return null;
  }
}

/**
 * Guardar nueva conversación
 * @param {Object} conversation
 * @returns {Promise<string>} - Retorna el ID de la conversación
 */
async function saveConversation(conversation) {
  try {
    await ensureLogsDir();

    // Generar ID si no existe
    const conversationId = conversation.id || generateId();

    const conversationRecord = {
      id: conversationId,
      messages: conversation.messages || [],
      sentimentHistory: conversation.sentimentHistory || [],
      finalSentiment: conversation.finalSentiment || null,
      finalIntent: conversation.finalIntent || null,
      duration: conversation.duration || null,
      createdAt: conversation.createdAt || new Date().toISOString(),
      clientEmail: conversation.clientEmail || null,
      userAgent: conversation.userAgent || null,
      context: conversation.context || {}
    };

    const line = JSON.stringify(conversationRecord);
    await fs.appendFile(CONVERSATIONS_FILE, line + '\n');

    console.log(`✅ Conversación guardada: ${conversationId}`);
    return conversationId;
  } catch (error) {
    console.error('Error guardando conversación:', error);
    throw error;
  }
}

/**
 * Actualizar conversación existente
 * @param {string} conversationId
 * @param {Object} updates - Campos a actualizar
 * @returns {Promise<boolean>}
 */
async function updateConversation(conversationId, updates) {
  try {
    await ensureLogsDir();

    // Leer todas las conversaciones
    const fileContent = await fs.readFile(CONVERSATIONS_FILE, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim());

    let found = false;
    const updatedLines = lines.map(line => {
      try {
        const conversation = JSON.parse(line);
        if (conversation.id === conversationId) {
          found = true;
          return JSON.stringify({
            ...conversation,
            ...updates,
            updatedAt: new Date().toISOString()
          });
        }
        return line;
      } catch (parseError) {
        return line;
      }
    });

    if (found) {
      await fs.writeFile(CONVERSATIONS_FILE, updatedLines.join('\n') + '\n');
      console.log(`✅ Conversación actualizada: ${conversationId}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error actualizando conversación:', error);
    return false;
  }
}

/**
 * Registrar exportación de conversación
 * @param {string} conversationId
 * @param {string} format - 'pdf' | 'email'
 * @param {string|null} email - Email si se exportó por email
 * @param {string} internalNotes - Notas del equipo
 * @returns {Promise<void>}
 */
async function saveConversationExport(conversationId, format, email, internalNotes) {
  try {
    await ensureLogsDir();

    const exportRecord = {
      type: 'export',
      conversationId,
      format,
      email: email || null,
      internalNotes: internalNotes || null,
      exportedAt: new Date().toISOString(),
      exportedBy: process.env.USER || 'system'
    };

    const exportsFile = path.join(process.cwd(), 'logs', 'export_history.jsonl');
    const line = JSON.stringify(exportRecord);
    await fs.appendFile(exportsFile, line + '\n');

    // Actualizar la conversación con exportedAt
    await updateConversation(conversationId, {
      exportedAt: new Date().toISOString(),
      lastExportFormat: format
    });

    console.log(`📤 Exportación registrada: ${conversationId} → ${format}`);
  } catch (error) {
    console.error('Error registrando exportación:', error);
    // No fallar la operación principal si el registro falla
  }
}

/**
 * Obtener estadísticas de conversaciones
 * @returns {Promise<Object>}
 */
async function getConversationStats() {
  try {
    await ensureLogsDir();

    const fileContent = await fs.readFile(CONVERSATIONS_FILE, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim());

    let totalConversations = 0;
    let conversationsWithEmail = 0;
    let conversationsExported = 0;
    const sentimentCounts = {
      positive: 0,
      negative: 0,
      neutral: 0
    };

    for (const line of lines) {
      try {
        const conversation = JSON.parse(line);
        totalConversations++;

        if (conversation.clientEmail) conversationsWithEmail++;
        if (conversation.exportedAt) conversationsExported++;

        if (conversation.finalSentiment) {
          const sentiment = conversation.finalSentiment.toLowerCase();
          if (sentiment.includes('positive')) sentimentCounts.positive++;
          else if (sentiment.includes('negative')) sentimentCounts.negative++;
          else sentimentCounts.neutral++;
        }
      } catch (parseError) {
        // Saltar líneas malformadas
        continue;
      }
    }

    return {
      total: totalConversations,
      withEmail: conversationsWithEmail,
      exported: conversationsExported,
      sentiment: sentimentCounts,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.warn('Error obteniendo estadísticas:', error.message);
    return {
      total: 0,
      withEmail: 0,
      exported: 0,
      sentiment: { positive: 0, negative: 0, neutral: 0 },
      lastUpdated: new Date().toISOString()
    };
  }
}

/**
 * Exportar conversaciones a CSV (para análisis)
 * @param {string} outputPath - Ruta del archivo CSV
 * @param {number} limit - Máximo número de conversaciones (0 = todas)
 * @returns {Promise<void>}
 */
async function exportConversationsToCSV(outputPath, limit = 0) {
  try {
    await ensureLogsDir();

    const fileContent = await fs.readFile(CONVERSATIONS_FILE, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim());

    const conversations = [];
    for (const line of lines) {
      try {
        const conversation = JSON.parse(line);
        conversations.push(conversation);
        if (limit > 0 && conversations.length >= limit) break;
      } catch (parseError) {
        // Saltar líneas malformadas
        continue;
      }
    }

    // Crear CSV
    const csv = [
      ['ID', 'Fecha', 'Email', 'Sentimiento', 'Intención', 'Duración (ms)', 'Exportado', 'Notas'].join(',')
    ];

    for (const conv of conversations) {
      const row = [
        conv.id || '',
        conv.createdAt || '',
        conv.clientEmail || '',
        conv.finalSentiment || '',
        conv.finalIntent || '',
        conv.duration || '',
        conv.exportedAt ? 'Sí' : 'No',
        (conv.internalNotes || '').replace(/"/g, '""') // Escapar comillas
      ];
      csv.push('"' + row.join('","') + '"');
    }

    await fs.writeFile(outputPath, csv.join('\n'));
    console.log(`✅ CSV exportado: ${outputPath} (${conversations.length} conversaciones)`);
  } catch (error) {
    console.error('Error exportando a CSV:', error);
    throw error;
  }
}

module.exports = {
  getConversationById,
  saveConversation,
  updateConversation,
  saveConversationExport,
  getConversationStats,
  exportConversationsToCSV,
  ensureLogsDir,
  CONVERSATIONS_FILE
};
