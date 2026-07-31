/**
 * FASE 4: Análisis de Sentimiento e Intención de Compra
 * =====================================================
 *
 * Este módulo detecta automáticamente:
 * - Estado emocional del usuario (frustración, neutralidad, satisfacción)
 * - Intención de compra (información general, interés medio, interés alto)
 * - Acciones proactivas recomendadas basadas en sentimiento
 *
 * El análisis es keyword-based (escalable a Claude AI en futuro)
 * Se ejecuta en BACKEND para no exponer lógica comercial al frontend
 */

// ============================================
// ANÁLISIS BÁSICO DE SENTIMIENTO
// ============================================

/**
 * Analiza el sentimiento básico del texto usando palabras clave en español
 * @param {string} text - Texto a analizar
 * @returns {object} { label: 'positive'|'neutral'|'negative', score: 0-1, confidence: 0-1 }
 */
function analyzeSentimentBasic(text) {
  if (!text || typeof text !== 'string') {
    return { label: 'neutral', score: 0.5, confidence: 0 };
  }

  const lowerText = text.toLowerCase().trim();

  // Palabras clave POSITIVAS (en español)
  const positiveKeywords = [
    'bien', 'excelente', 'genial', 'perfecto', 'satisfecho',
    'recomiendo', 'gracias', 'vale', 'ok', 'bueno',
    'maravilloso', 'fantástico', 'hermoso', 'encanta', 'gusta',
    'ideal', 'justo lo que buscaba', 'me encanta', 'muy bien',
    'bonito', 'precioso', 'fabuloso', 'sensacional', 'excelentes',
    'perfección', 'impecable', 'maravilla', 'estupendo', 'bellísimo'
  ];

  // Palabras clave NEGATIVAS (en español)
  const negativeKeywords = [
    'mal', 'peor', 'pésimo', 'horrible', 'frustrado',
    'enfadado', 'enojado', 'no funciona', 'error', 'problema',
    'queja', 'decepción', 'insatisfecho', 'terrible', 'nefasto',
    'no me gusta', 'muy caro', 'no entiendo', 'confuso',
    'complicado', 'roto', 'odio', 'detesto', 'disgusto',
    'furioso', 'endiablado', 'estropeado', 'defecto', 'fallo',
    'feo', 'horrendo', 'desastre', 'catástrofe'
  ];

  // Contar coincidencias (buscar palabras completas o como substrings)
  const countKeywords = (keywords) => {
    return keywords.filter(keyword => {
      // Buscar palabra completa o como parte de una palabra más larga
      const regex = new RegExp(`\\b${keyword}\\b|${keyword}`, 'gi');
      return regex.test(lowerText);
    }).length;
  };

  const positiveCount = countKeywords(positiveKeywords);
  const negativeCount = countKeywords(negativeKeywords);
  const totalCount = positiveCount + negativeCount;

  let label = 'neutral';
  let score = 0.5;
  let confidence = 0;

  if (totalCount === 0) {
    // Sin palabras clave detectadas
    confidence = 0.3;
  } else if (positiveCount > negativeCount) {
    label = 'positive';
    score = 0.5 + (positiveCount / (totalCount || 1)) * 0.5;
    confidence = Math.min(1, (positiveCount / 3));
  } else if (negativeCount > positiveCount) {
    label = 'negative';
    score = 0.5 - (negativeCount / (totalCount || 1)) * 0.5;
    confidence = Math.min(1, (negativeCount / 3));
  } else {
    // Igual número de palabras positivas y negativas
    confidence = Math.min(0.6, ((positiveCount + negativeCount) / 5));
  }

  return {
    label,
    score: Math.max(0, Math.min(1, score)), // Normalizar entre 0 y 1
    confidence
  };
}

// ============================================
// ANÁLISIS DE INTENCIÓN DE COMPRA
// ============================================

/**
 * Analiza la intención de compra del usuario
 * @param {string} text - Texto a analizar
 * @returns {object} { label: 'information'|'interested'|'high_intent', score: 0-1, confidence: 0-1 }
 */
function analyzePurchaseIntent(text) {
  if (!text || typeof text !== 'string') {
    return { label: 'information', score: 0.3, confidence: 0 };
  }

  const lowerText = text.toLowerCase().trim();

  // Palabras clave de ALTA INTENCIÓN (va a comprar)
  const highIntentKeywords = [
    'comprar', 'presupuesto', 'precio', 'cuánto cuesta',
    'cuanto cuesta', 'quiero comprar', 'necesito', 'interesado',
    'cuando puedo', 'cuándo entrega', 'cuándo entregan',
    'pedido', 'm²', 'cajas', 'cuántos m²', 'cuantos m2',
    'reformar', 'cambiar', 'cuanto vale', 'cuál es el precio',
    'me interesa', 'en serio', 'decidido', 'cantidad',
    'cuándo disponible', 'cuando disponible', 'forma de pago',
    'envio', 'envío', 'entrega', 'plazo', 'presupuesto',
    'condiciones', 'descuento', 'oferta', 'promoción',
    'próximo paso', 'próximos pasos', 'siguientes pasos'
  ];

  // Palabras clave de INTENCIÓN MEDIA (evaluando)
  const mediumIntentKeywords = [
    'opciones', 'alternativas', 'qué tal', 'recomendación',
    'sugerencia', 'tipología', 'diferencia', 'ventajas',
    'desventajas', 'comparar', 'series', 'formatos',
    'acabados', 'colores', 'características', 'especificaciones',
    'cual elegir', 'cuál elegir', 'mejor para', 'más adecuado',
    'ventaja', 'inconveniente', 'pros', 'contras',
    'opinión', 'consejo', 'qué recomiendas', 'que recomiendas'
  ];

  // Contar coincidencias
  const countKeywords = (keywords) => {
    return keywords.filter(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b|${keyword}`, 'gi');
      return regex.test(lowerText);
    }).length;
  };

  const highIntentCount = countKeywords(highIntentKeywords);
  const mediumIntentCount = countKeywords(mediumIntentKeywords);

  let label = 'information';
  let score = 0.3;
  let confidence = 0.4;

  if (highIntentCount >= 2) {
    // Múltiples señales de alta intención
    label = 'high_intent';
    score = 0.9;
    confidence = Math.min(1, (highIntentCount / 3));
  } else if (highIntentCount === 1 || mediumIntentCount >= 3) {
    // Una señal alta o varias señales medias
    label = 'interested';
    score = 0.6;
    confidence = Math.min(1, ((highIntentCount + mediumIntentCount) / 4));
  } else if (mediumIntentCount >= 1) {
    // Al menos una señal media
    label = 'interested';
    score = 0.5;
    confidence = Math.min(0.8, (mediumIntentCount / 3));
  } else {
    // Sin señales claras
    label = 'information';
    confidence = 0.3;
  }

  return {
    label,
    score: Math.max(0, Math.min(1, score)),
    confidence
  };
}

// ============================================
// DETERMINACIÓN DE ACCIONES SUGERIDAS
// ============================================

/**
 * Determina la acción proactiva recomendada basada en sentimiento e intención
 * @param {object} sentiment - Resultado de analyzeSentimentBasic
 * @param {object} purchaseIntent - Resultado de analyzePurchaseIntent
 * @returns {object} { type, message, priority }
 */
function determineSuggestedAction(sentiment, purchaseIntent) {
  // Prioridad 1: Detectar FRUSTRACIÓN → Ofrecer soporte humano
  if (sentiment.label === 'negative' && sentiment.confidence >= 0.4) {
    return {
      type: 'offer_human_support',
      message: 'frustración detectada - ofrecer contacto directo',
      priority: 'high',
      emotionalContext: 'Usuario frustrado o insatisfecho'
    };
  }

  // Prioridad 2: Detectar ALTA INTENCIÓN DE COMPRA → Capturar lead
  if (purchaseIntent.label === 'high_intent' && purchaseIntent.confidence >= 0.5) {
    return {
      type: 'capture_lead',
      message: 'interés de compra detectado - sugerir captura de datos',
      priority: 'high',
      emotionalContext: 'Usuario decidido a comprar'
    };
  }

  // Prioridad 3: SATISFACCIÓN + INTERÉS MEDIO → Reforzar confianza
  if (
    sentiment.label === 'positive' &&
    purchaseIntent.label === 'interested' &&
    sentiment.confidence >= 0.4
  ) {
    return {
      type: 'reinforce_confidence',
      message: 'usuario satisfecho e interesado - reforzar confianza',
      priority: 'medium',
      emotionalContext: 'Usuario satisfecho y considerando compra'
    };
  }

  // Prioridad 4: INTERÉS MEDIO (neutral) → Continuar guiando
  if (purchaseIntent.label === 'interested') {
    return {
      type: 'continue_guidance',
      message: 'usuario en evaluación - proporcionar información clara',
      priority: 'medium',
      emotionalContext: 'Usuario en fase de evaluación'
    };
  }

  // Por defecto: Información general
  return {
    type: 'continue_guidance',
    message: 'usuario buscando información - guiar educativamente',
    priority: 'low',
    emotionalContext: 'Usuario buscando información general'
  };
}

// ============================================
// FUNCIÓN PRINCIPAL DE ANÁLISIS
// ============================================

/**
 * Análisis completo de sentimiento e intención de compra
 * @param {string} text - Mensaje del usuario
 * @returns {object} Resultado completo con sentiment, intent, scores, y acción sugerida
 */
function analyzeSentiment(text) {
  if (!text || typeof text !== 'string') {
    return {
      sentiment: 'neutral',
      sentimentScore: 0.5,
      sentimentConfidence: 0,
      intent: 'information',
      intentScore: 0.3,
      intentConfidence: 0,
      confidence: 0,
      suggestedAction: {
        type: 'continue_guidance',
        message: 'análisis no disponible',
        priority: 'low'
      }
    };
  }

  const sentiment = analyzeSentimentBasic(text);
  const purchaseIntent = analyzePurchaseIntent(text);
  const suggestedAction = determineSuggestedAction(sentiment, purchaseIntent);

  // Confianza general: el mínimo de ambas detecciones
  const overallConfidence = Math.min(sentiment.confidence, purchaseIntent.confidence);

  return {
    sentiment: sentiment.label,
    sentimentScore: sentiment.score,
    sentimentConfidence: sentiment.confidence,
    intent: purchaseIntent.label,
    intentScore: purchaseIntent.score,
    intentConfidence: purchaseIntent.confidence,
    confidence: overallConfidence,
    suggestedAction
  };
}

// ============================================
// PROMPTS DINÁMICOS SEGÚN SENTIMIENTO
// ============================================

/**
 * Genera un prompt dinámico para enriquecer la respuesta de Claude basado en el análisis
 * @param {object} analysisResult - Resultado de analyzeSentiment
 * @returns {string} Prompt adicional para el system prompt
 */
function generateSentimentPrompt(analysisResult) {
  const { sentiment, intent, suggestedAction } = analysisResult;

  let promptAddition = '';

  // Si hay frustración detectada
  if (sentiment === 'negative') {
    promptAddition += `
## USUARIO FRUSTRADO DETECTADO
El usuario parece frustrado o insatisfecho.
- Sé especialmente empático y comprensivo.
- Reconoce su preocupación antes de responder.
- Ofrece activamente contacto con el equipo comercial.
- Propón soluciones alternativas si es posible.
- Contacto directo: Email info@newzelland.es o llama al +34 963 XXX XXX
`;
  }

  // Si hay intención alta de compra
  if (intent === 'high_intent') {
    promptAddition += `
## USUARIO CON ALTA INTENCIÓN DE COMPRA
El usuario muestra signos claros de decisión de compra.
- Proporciona información detallada y precisa sobre precios, plazos y condiciones.
- Sugiere próximos pasos claros (envío de presupuesto, contacto comercial).
- Ofrece captura de datos: "¿Me dejas tu email y nombre para preparar un presupuesto personalizado?"
- Sé proactivo pero no agresivo.
`;
  }

  // Si hay satisfacción e interés medio
  if (sentiment === 'positive' && intent === 'interested') {
    promptAddition += `
## USUARIO SATISFECHO E INTERESADO
El usuario está contento con tus asesoramiento y considera la compra.
- Refuerza su confianza en tus recomendaciones.
- Proporciona información adicional sin presionar.
- Sugiere pasos naturales: "¿Te gustaría que te enviemos muestras de color?" o "¿Prefieres contactar directamente con ventas?"
`;
  }

  return promptAddition;
}

/**
 * Genera un contexto resumido para logs o debugging
 * @param {object} analysisResult - Resultado de analyzeSentiment
 * @param {string} originalText - Texto original analizado
 * @returns {object} Contexto de sentimiento para logging
 */
function generateSentimentContext(analysisResult, originalText) {
  return {
    timestamp: new Date().toISOString(),
    originalText: originalText.substring(0, 200), // Primeros 200 caracteres
    sentiment: analysisResult.sentiment,
    sentimentScore: analysisResult.sentimentScore.toFixed(2),
    sentimentConfidence: analysisResult.sentimentConfidence.toFixed(2),
    intent: analysisResult.intent,
    intentScore: analysisResult.intentScore.toFixed(2),
    intentConfidence: analysisResult.intentConfidence.toFixed(2),
    suggestedAction: analysisResult.suggestedAction.type,
    actionMessage: analysisResult.suggestedAction.message,
    priority: analysisResult.suggestedAction.priority
  };
}

// ============================================
// EXPORTAR FUNCIONES
// ============================================

module.exports = {
  analyzeSentiment,
  analyzeSentimentBasic,
  analyzePurchaseIntent,
  determineSuggestedAction,
  generateSentimentPrompt,
  generateSentimentContext
};
