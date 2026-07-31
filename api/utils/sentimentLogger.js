/**
 * FASE 4: Logger de Sentimiento
 * =============================
 *
 * Registra análisis de sentimiento para:
 * - Auditoría y compliance
 * - Análisis post-venta
 * - Training de modelos futuros
 * - Dashboard de analytics
 *
 * Formato: JSON-L (JSON Lines) para fácil streaming
 */

const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.join(__dirname, '../../logs');
const SENTIMENT_LOG_FILE = path.join(LOGS_DIR, 'sentiment_analysis.jsonl');

/**
 * Asegura que el directorio de logs existe
 */
function ensureLogsDirectory() {
  if (!fs.existsSync(LOGS_DIR)) {
    try {
      fs.mkdirSync(LOGS_DIR, { recursive: true });
    } catch (error) {
      console.error('Error creating logs directory:', error);
    }
  }
}

/**
 * Registra un análisis de sentimiento
 * @param {string} sessionId - ID único de la sesión/conversación
 * @param {string} userMessage - Mensaje del usuario
 * @param {object} sentimentAnalysis - Resultado de analyzeSentiment
 * @param {string} assistantResponse - Respuesta de Claude (opcional)
 * @param {object} metadata - Datos adicionales (postalCode, page, etc.)
 */
function logSentimentAnalysis(
  sessionId,
  userMessage,
  sentimentAnalysis,
  assistantResponse = null,
  metadata = {}
) {
  try {
    ensureLogsDirectory();

    const logEntry = {
      timestamp: new Date().toISOString(),
      sessionId,
      userMessage: userMessage.substring(0, 300), // Limitar a 300 caracteres
      sentiment: sentimentAnalysis.sentiment,
      sentimentScore: parseFloat(sentimentAnalysis.sentimentScore.toFixed(3)),
      sentimentConfidence: parseFloat(sentimentAnalysis.sentimentConfidence.toFixed(3)),
      intent: sentimentAnalysis.intent,
      intentScore: parseFloat(sentimentAnalysis.intentScore.toFixed(3)),
      intentConfidence: parseFloat(sentimentAnalysis.intentConfidence.toFixed(3)),
      suggestedAction: sentimentAnalysis.suggestedAction.type,
      actionPriority: sentimentAnalysis.suggestedAction.priority,
      assistantResponse: assistantResponse ? assistantResponse.substring(0, 200) : null,
      metadata: {
        postalCode: metadata.postalCode || null,
        page: metadata.page || null,
        userAgent: metadata.userAgent || null,
        ipAddress: metadata.ipAddress || null,
      },
    };

    // Escribir en archivo JSON Lines
    const logLine = JSON.stringify(logEntry);
    fs.appendFileSync(SENTIMENT_LOG_FILE, logLine + '\n', 'utf8');

    console.log(`[SENTIMENT_LOG] Sesión ${sessionId} registrada: ${sentimentAnalysis.sentiment} | ${sentimentAnalysis.intent}`);
  } catch (error) {
    console.error('Error logging sentiment analysis:', error);
  }
}

/**
 * Registra el resultado final de una conversación
 * @param {string} sessionId - ID único de la sesión
 * @param {string} outcome - Resultado (lead_captured, frustrated_exit, information_only, high_intent_qualified, etc.)
 * @param {object} summary - Resumen de la sesión
 */
function logConversationOutcome(sessionId, outcome, summary = {}) {
  try {
    ensureLogsDirectory();

    const logEntry = {
      type: 'conversation_outcome',
      timestamp: new Date().toISOString(),
      sessionId,
      outcome,
      summary,
    };

    const logLine = JSON.stringify(logEntry);
    fs.appendFileSync(SENTIMENT_LOG_FILE, logLine + '\n', 'utf8');

    console.log(`[SENTIMENT_LOG] Sesión ${sessionId} completada: ${outcome}`);
  } catch (error) {
    console.error('Error logging conversation outcome:', error);
  }
}

/**
 * Lee los últimos N registros de sentiment
 * @param {number} limit - Número de registros a leer (defecto 100)
 * @returns {array} Array de objetos de log
 */
function readRecentSentimentLogs(limit = 100) {
  try {
    if (!fs.existsSync(SENTIMENT_LOG_FILE)) {
      return [];
    }

    const content = fs.readFileSync(SENTIMENT_LOG_FILE, 'utf8');
    const lines = content.trim().split('\n').filter(line => line.length > 0);

    return lines
      .slice(-limit)
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(entry => entry !== null);
  } catch (error) {
    console.error('Error reading sentiment logs:', error);
    return [];
  }
}

/**
 * Genera estadísticas de sentimiento (últimas N sesiones)
 * @param {number} limit - Número de sesiones a analizar
 * @returns {object} Estadísticas agregadas
 */
function generateSentimentStats(limit = 1000) {
  try {
    const logs = readRecentSentimentLogs(limit);

    // Filtrar solo entries de análisis (no outcomes)
    const sentimentLogs = logs.filter(entry => !entry.type);

    if (sentimentLogs.length === 0) {
      return { error: 'No sentiment logs found' };
    }

    // Contar sentimientos
    const sentiments = { positive: 0, neutral: 0, negative: 0 };
    const intents = { information: 0, interested: 0, high_intent: 0 };
    const actions = {};

    let totalSentimentScore = 0;
    let totalIntentScore = 0;

    sentimentLogs.forEach(log => {
      sentiments[log.sentiment]++;
      intents[log.intent]++;
      actions[log.suggestedAction] = (actions[log.suggestedAction] || 0) + 1;
      totalSentimentScore += log.sentimentScore;
      totalIntentScore += log.intentScore;
    });

    const count = sentimentLogs.length;

    return {
      totalAnalyzed: count,
      sentiments: {
        positive: { count: sentiments.positive, percentage: ((sentiments.positive / count) * 100).toFixed(1) },
        neutral: { count: sentiments.neutral, percentage: ((sentiments.neutral / count) * 100).toFixed(1) },
        negative: { count: sentiments.negative, percentage: ((sentiments.negative / count) * 100).toFixed(1) },
        averageScore: (totalSentimentScore / count).toFixed(3),
      },
      intents: {
        information: { count: intents.information, percentage: ((intents.information / count) * 100).toFixed(1) },
        interested: { count: intents.interested, percentage: ((intents.interested / count) * 100).toFixed(1) },
        high_intent: { count: intents.high_intent, percentage: ((intents.high_intent / count) * 100).toFixed(1) },
        averageScore: (totalIntentScore / count).toFixed(3),
      },
      suggestedActions: actions,
      logFileSize: `${(fs.statSync(SENTIMENT_LOG_FILE).size / 1024).toFixed(2)} KB`,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error generating sentiment stats:', error);
    return { error: error.message };
  }
}

/**
 * Exporta logs de sentimiento a un archivo CSV (para análisis en Excel)
 * @param {string} outputPath - Ruta de salida (defecto ./logs/sentiment_export.csv)
 * @param {number} limit - Límite de registros a exportar
 */
function exportSentimentLogsToCSV(outputPath = null, limit = 1000) {
  try {
    const logs = readRecentSentimentLogs(limit);
    const sentimentLogs = logs.filter(entry => !entry.type);

    if (sentimentLogs.length === 0) {
      console.warn('No sentiment logs to export');
      return;
    }

    const csvPath = outputPath || path.join(LOGS_DIR, 'sentiment_export.csv');

    // Header
    const headers = [
      'Timestamp',
      'Session ID',
      'User Message',
      'Sentiment',
      'Sentiment Score',
      'Sentiment Confidence',
      'Intent',
      'Intent Score',
      'Intent Confidence',
      'Suggested Action',
      'Priority',
      'Postal Code',
    ];

    // Rows
    const rows = sentimentLogs.map(log => [
      log.timestamp,
      log.sessionId,
      `"${log.userMessage.replace(/"/g, '""')}"`, // Escape quotes
      log.sentiment,
      log.sentimentScore,
      log.sentimentConfidence,
      log.intent,
      log.intentScore,
      log.intentConfidence,
      log.suggestedAction,
      log.actionPriority,
      log.metadata?.postalCode || '',
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    fs.writeFileSync(csvPath, csvContent, 'utf8');
    console.log(`Sentiment logs exported to ${csvPath}`);

    return csvPath;
  } catch (error) {
    console.error('Error exporting sentiment logs to CSV:', error);
  }
}

module.exports = {
  logSentimentAnalysis,
  logConversationOutcome,
  readRecentSentimentLogs,
  generateSentimentStats,
  exportSentimentLogsToCSV,
  SENTIMENT_LOG_FILE,
};
