/**
 * FASE 4: Ejemplo de Integración con Logging
 * ============================================
 *
 * Este archivo muestra cómo integrar completamente el sistema de sentimiento
 * en el endpoint /api/ceramico con logging automático.
 *
 * Nota: Este es código EJEMPLO. Para producción, incorporar directamente
 * en ceramico-ai.js o index.js según necesidad.
 */

const { analyzeSentiment } = require('./sentimentAnalysis');
const {
  logSentimentAnalysis,
  logConversationOutcome,
  generateSentimentStats,
} = require('./sentimentLogger');

/**
 * Versión mejorada de ceramicoAnswer con logging automático
 *
 * @param {string} question - Pregunta del usuario
 * @param {object} context - Contexto { currentSeriesSlug, page, postalCode, conversationHistory }
 * @param {object} pool - Pool de base de datos
 * @param {string} sessionId - ID único de sesión (para tracking)
 * @returns {object} { answer, sentiment, action }
 */
async function ceramicoAnswerWithSentiment(question, context, pool, sessionId = null) {
  try {
    // Generar sessionId si no se proporciona
    const finalSessionId = sessionId || `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // PASO 1: Analizar sentimiento
    const sentimentAnalysis = analyzeSentiment(question);

    // PASO 2: Registrar análisis en logs
    logSentimentAnalysis(
      finalSessionId,
      question,
      sentimentAnalysis,
      null,  // La respuesta se registra después
      {
        postalCode: context?.postalCode,
        page: context?.page,
        userAgent: context?.userAgent,
        ipAddress: context?.ipAddress,
      }
    );

    // PASO 3: Log en consola para debugging
    console.log(`[SENTIMENT_PHASE4] SessionId: ${finalSessionId}`);
    console.log(`[SENTIMENT_PHASE4] Sentiment: ${sentimentAnalysis.sentiment} (${sentimentAnalysis.sentimentScore.toFixed(2)})`);
    console.log(`[SENTIMENT_PHASE4] Intent: ${sentimentAnalysis.intent} (${sentimentAnalysis.intentScore.toFixed(2)})`);
    console.log(`[SENTIMENT_PHASE4] Action: ${sentimentAnalysis.suggestedAction.type} (${sentimentAnalysis.suggestedAction.priority})`);

    // PASO 4: Llamar a ceramicoAnswer original (aquí iría la lógica real)
    // Simulado para ejemplo:
    let answer = `Tu pregunta ha sido analizada con sentimiento: ${sentimentAnalysis.sentiment}`;

    // Ajustar respuesta según sentimiento (ejemplo simple)
    if (sentimentAnalysis.sentiment === 'negative') {
      answer = `Entiendo tu frustración. Te ayudamos: info@newzelland.es o +34 963 XXX XXX.\n${answer}`;
    } else if (sentimentAnalysis.intent === 'high_intent') {
      answer = `¡Perfecto! Veo que tienes interés de compra. ${answer}\n¿Quieres que te envíe un presupuesto?`;
    }

    // PASO 5: Registrar respuesta completa
    logSentimentAnalysis(
      finalSessionId,
      question,
      sentimentAnalysis,
      answer,
      {
        postalCode: context?.postalCode,
        page: context?.page,
      }
    );

    // PASO 6: Retornar respuesta enriquecida
    return {
      answer,
      postalCode: context?.postalCode || null,
      sentiment: sentimentAnalysis,  // Opcional: enviar al frontend
      sessionId: finalSessionId,     // Para tracking futuro
    };
  } catch (error) {
    console.error('[SENTIMENT_ERROR]', error);
    throw error;
  }
}

/**
 * Middleware Express para endpoint /api/ceramico mejorado
 *
 * Uso:
 * app.post('/api/ceramico-v2', ceramicoSentimentMiddleware, ceramicoHandler);
 */
function ceramicoSentimentMiddleware(req, res, next) {
  // Generar session ID único
  const sessionId = req.headers['x-session-id'] || `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Pasar al siguiente middleware/handler
  req.sessionId = sessionId;
  req.userMetadata = {
    userAgent: req.get('user-agent'),
    ipAddress: req.ip,
    timestamp: new Date().toISOString(),
  };

  console.log(`[SESSION_START] ${sessionId}`);
  next();
}

/**
 * Handler para /api/ceramico con sentimiento
 *
 * Uso:
 * app.post('/api/ceramico-v2', ceramicoSentimentMiddleware, (req, res) => {
 *   const { question, context } = req.body;
 *   const result = await ceramicoAnswerWithSentiment(question, context, pool, req.sessionId);
 *   res.json(result);
 * });
 */
async function ceramicoHandlerWithSentiment(req, res, pool) {
  try {
    const { question, context } = req.body;
    const sessionId = req.sessionId;

    const result = await ceramicoAnswerWithSentiment(
      question,
      { ...context, ...req.userMetadata },
      pool,
      sessionId
    );

    res.json(result);
  } catch (error) {
    console.error('[CERAMICO_ERROR]', error);
    res.status(500).json({ error: 'Error procesando tu pregunta' });
  }
}

/**
 * Endpoint de admin: ver estadísticas de sentimiento
 *
 * Uso:
 * app.get('/api/admin/sentiment-stats', authMiddleware, (req, res) => {
 *   const limit = req.query.limit || 1000;
 *   const stats = generateSentimentStats(limit);
 *   res.json(stats);
 * });
 */
function getSentimentStatsHandler(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 1000;
    const stats = generateSentimentStats(limit);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Registrar outcome cuando la conversación termina
 *
 * Uso: Llamar cuando el usuario cierra sesión o completa una compra
 */
function recordConversationOutcome(sessionId, outcome) {
  try {
    logConversationOutcome(sessionId, outcome, {
      endTime: new Date().toISOString(),
      durationMinutes: calculateDuration(),
    });
  } catch (error) {
    console.error('[OUTCOME_ERROR]', error);
  }
}

/**
 * Outcomes posibles:
 * - "lead_captured": Usuario dejó email/nombre para presupuesto
 * - "high_intent_qualified": Usuario mostró alta intención
 * - "information_only": Solo buscaba información
 * - "frustrated_exit": Abandonó por frustración
 * - "purchase_completed": Completó compra
 * - "support_requested": Pidió contacto humano
 */

// ============================================
// EJEMPLOS DE USO
// ============================================

/**
 * Ejemplo 1: Integrar en endpoint existente
 */
const expresExampleIntegration = `
// En index.js, modificar endpoint /api/ceramico:

app.post('/api/ceramico', ceramicoSentimentMiddleware, async (req, res) => {
  const { question, context } = req.body;

  try {
    const result = await ceramicoAnswerWithSentiment(
      question,
      context,
      pool,
      req.sessionId  // SessionId generado por middleware
    );

    res.json({
      answer: result.answer,
      postalCode: result.postalCode,
      // Opcional: enviar sentimiento al frontend para UI/UX mejorado
      ...(req.query.includeSentiment && { sentiment: result.sentiment }),
      sessionId: result.sessionId,
    });
  } catch (error) {
    console.error('Error en POST /api/ceramico:', error);
    res.status(500).json({ error: 'Error procesando tu pregunta' });
  }
});
`;

/**
 * Ejemplo 2: Endpoint de analytics
 */
const analyticsExample = `
// Endpoint para dashboard de analytics

app.get('/api/admin/sentiment-stats', authMiddleware, adminMiddleware, (req, res) => {
  const limit = parseInt(req.query.limit) || 1000;
  const stats = generateSentimentStats(limit);

  res.json({
    success: true,
    data: stats,
    timestamp: new Date().toISOString(),
  });
});

// Cliente (Frontend):
// fetch('/api/admin/sentiment-stats?limit=500')
//   .then(r => r.json())
//   .then(data => {
//     console.log('Sentimientos:', data.sentiments);
//     console.log('Intenciones:', data.intents);
//     console.log('Acciones sugeridas:', data.suggestedActions);
//   });
`;

/**
 * Ejemplo 3: Registrar outcome cuando usuario completa ación
 */
const outcomeExample = `
// Cuando usuario captura lead (envía email)
app.post('/api/ceramico/capture-lead', async (req, res) => {
  const { sessionId, email, name } = req.body;

  // Guardar lead en BD
  await saveLead(email, name);

  // Registrar outcome
  recordConversationOutcome(sessionId, 'lead_captured');

  res.json({ success: true });
});

// Cuando usuario solicita contacto humano
app.post('/api/ceramico/request-support', async (req, res) => {
  const { sessionId, issue } = req.body;

  // Notificar al equipo comercial
  await notifyCommercialTeam(issue);

  // Registrar outcome
  recordConversationOutcome(sessionId, 'support_requested');

  res.json({ success: true });
});
`;

/**
 * Ejemplo 4: Exportar logs a CSV
 */
const exportExample = `
// Endpoint para descargar reporte CSV

const { exportSentimentLogsToCSV } = require('./utils/sentimentLogger');

app.get('/api/admin/sentiment-export', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const filePath = exportSentimentLogsToCSV();
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
`;

// ============================================
// EXPORTAR PARA USO EN OTROS MÓDULOS
// ============================================

module.exports = {
  ceramicoAnswerWithSentiment,
  ceramicoSentimentMiddleware,
  ceramicoHandlerWithSentiment,
  getSentimentStatsHandler,
  recordConversationOutcome,
  // Ejemplos como strings para documentación
  expresExampleIntegration,
  analyticsExample,
  outcomeExample,
  exportExample,
};
