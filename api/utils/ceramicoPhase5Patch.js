/**
 * FASE 5 - Patch para ceramico-ai.js
 * Este archivo contiene las funciones y cambios necesarios para integrar
 * la captura de email y el almacenamiento de conversaciones
 *
 * INSTRUCCIONES DE INTEGRACIÓN:
 * 1. Agregar estas líneas en la parte superior de ceramico-ai.js (después de los otros imports):
 *    ```
 *    const { saveConversation, updateConversation } = require('./utils/conversationStorage');
 *    ```
 *
 * 2. Modificar la función ceramicoAnswer() para capturar conversaciones (ver abajo)
 * 3. Agregar las funciones de utilidad (al final del archivo)
 */

/**
 * ============================================================
 * PASO 1: AGREGAR ESTOS IMPORTS EN ceramico-ai.js
 * ============================================================
 *
 * const { saveConversation, updateConversation } = require('./utils/conversationStorage');
 */

/**
 * ============================================================
 * PASO 2: MODIFICAR ceramicoAnswer() - Agregar esto al principio
 * ============================================================
 *
 * // FASE 5: Generar o recuperar ID de conversación
 * const conversationId = context.conversationId || generateConversationId();
 * let conversation = context.conversation || await getConversationById(conversationId) || {
 *   id: conversationId,
 *   messages: [],
 *   sentimentHistory: [],
 *   createdAt: new Date().toISOString(),
 *   context: {
 *     postalCode: context.postalCode,
 *     currentSeriesSlug: context.currentSeriesSlug,
 *     userAgent: context.userAgent
 *   }
 * };
 *
 * // Agregar pregunta a historial
 * conversation.messages.push({
 *   role: 'user',
 *   content: question,
 *   timestamp: new Date().toISOString()
 * });
 */

/**
 * ============================================================
 * PASO 3: AGREGAR ESTO AL FINAL DE ceramicoAnswer(), antes del return
 * ============================================================
 *
 * // FASE 5: Procesar email capturado en pregunta del usuario
 * const emailCapture = captureEmailFromMessage(question, conversation);
 * if (emailCapture.emailCaptured) {
 *   conversation.clientEmail = emailCapture.email;
 * }
 *
 * // FASE 5: Guardar conversación completa
 * conversation.messages.push({
 *   role: 'assistant',
 *   content: textBlock.text,
 *   timestamp: new Date().toISOString()
 * });
 * conversation.finalSentiment = sentimentAnalysis?.sentiment || null;
 * conversation.sentimentHistory.push({
 *   timestamp: new Date().toISOString(),
 *   sentiment: sentimentAnalysis?.sentiment,
 *   confidence: sentimentAnalysis?.confidence,
 *   purchaseInterest: sentimentAnalysis?.purchaseInterest,
 *   intent: sentimentAnalysis?.intent,
 *   suggestedAction: sentimentAnalysis?.suggestedAction
 * });
 * conversation.duration = Date.now() - (conversation._startTime || Date.now());
 *
 * // Guardar en almacenamiento
 * await saveConversation(conversation);
 *
 * // Retornar con ID para que frontend lo guarde
 * return {
 *   answer: textBlock.text,
 *   conversationId: conversationId,
 *   clientEmail: conversation.clientEmail || null
 * };
 *
 * // Reemplazar el anterior return por arriba
 */

/**
 * ============================================================
 * PASO 4: AGREGAR ESTAS FUNCIONES AUXILIARES AL FINAL
 * ============================================================
 */

/**
 * Generar ID único para conversación
 * @returns {string}
 */
function generateConversationId() {
  const crypto = require('crypto');
  if (crypto.randomUUID) {
    return `conv_${crypto.randomUUID()}`;
  }
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Detectar y capturar email en mensaje del usuario
 * @param {string} message
 * @param {Object} conversation
 * @returns {Object}
 */
function captureEmailFromMessage(message, conversation) {
  // Regex para detectar email
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const emailMatches = message.match(emailRegex);

  if (emailMatches && emailMatches.length > 0) {
    const email = emailMatches[0].toLowerCase();

    // Validar email básico
    if (isValidEmail(email)) {
      return {
        emailCaptured: true,
        email: email,
        message: `✅ Perfecto. He capturado tu email: ${email}`
      };
    }
  }

  return {
    emailCaptured: false,
    email: null,
    message: null
  };
}

/**
 * Validar email
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Añadir sugerencia de captura de email cuando hay interés alto
 * @param {string} response
 * @param {Object} sentimentAnalysis
 * @returns {string}
 */
function addLeadCapturePrompt(response, sentimentAnalysis) {
  if (!sentimentAnalysis) return response;

  const purchaseInterest = sentimentAnalysis.purchaseInterest || 0;

  if (purchaseInterest >= 70) {
    // Alto interés: ofrecer captura inmediata
    const leadCapture = `

---

### 📧 ¿Te envío un resumen de esta conversación?

Parece que te interesa nuestros productos. Me gustaría enviarte:
- 📋 Historial completo de la conversación
- 🎯 Presupuesto personalizado
- 🚚 Opciones de envío y plazos

Solo comparte tu email:
`;
    return (response || '') + leadCapture;
  } else if (purchaseInterest >= 50) {
    // Interés medio: sugerencia suave
    const suggestCapture = `

---

💡 **Tip:** Si quieres guardar esta conversación, puedo enviarte un PDF. ¿Me das tu email?
`;
    return (response || '') + suggestCapture;
  }

  return response;
}

/**
 * ============================================================
 * EJEMPLO COMPLETO DE FUNCIÓN MODIFICADA
 * ============================================================
 *
 * async function ceramicoAnswer(question, context, pool) {
 *   try {
 *     if (!process.env.ANTHROPIC_API_KEY) {
 *       throw new Error('ANTHROPIC_API_KEY not configured');
 *     }
 *
 *     // FASE 5: Generar o recuperar ID de conversación
 *     const conversationId = context.conversationId || generateConversationId();
 *     let conversation = context.conversation || {
 *       id: conversationId,
 *       messages: [],
 *       sentimentHistory: [],
 *       createdAt: new Date().toISOString(),
 *       _startTime: Date.now(),
 *       context: {
 *         postalCode: context.postalCode,
 *         currentSeriesSlug: context.currentSeriesSlug
 *       }
 *     };
 *
 *     // Agregar pregunta a historial
 *     conversation.messages.push({
 *       role: 'user',
 *       content: question,
 *       timestamp: new Date().toISOString()
 *     });
 *
 *     // FASE 4: Análisis de sentimiento
 *     const sentimentAnalysis = analyzeSentiment(question);
 *     const sentimentContext = generateSentimentContext(sentimentAnalysis, question);
 *
 *     // ... resto del código existente ...
 *
 *     // ANTES DEL RETURN FINAL:
 *     const textBlock = response.content && response.content.find((block) => block.type === 'text');
 *     if (textBlock) {
 *       // FASE 5: Procesar email capturado
 *       const emailCapture = captureEmailFromMessage(question, conversation);
 *       if (emailCapture.emailCaptured) {
 *         conversation.clientEmail = emailCapture.email;
 *       }
 *
 *       // FASE 5: Guardar conversación
 *       conversation.messages.push({
 *         role: 'assistant',
 *         content: textBlock.text,
 *         timestamp: new Date().toISOString()
 *       });
 *       conversation.finalSentiment = sentimentAnalysis?.sentiment || null;
 *       conversation.sentimentHistory.push({
 *         timestamp: new Date().toISOString(),
 *         sentiment: sentimentAnalysis?.sentiment,
 *         confidence: sentimentAnalysis?.confidence,
 *         purchaseInterest: sentimentAnalysis?.purchaseInterest,
 *         intent: sentimentAnalysis?.intent,
 *         suggestedAction: sentimentAnalysis?.suggestedAction
 *       });
 *       conversation.duration = Date.now() - conversation._startTime;
 *
 *       // Guardar en almacenamiento
 *       await saveConversation(conversation);
 *
 *       // Retornar respuesta con ID de conversación
 *       return {
 *         answer: textBlock.text,
 *         conversationId: conversationId,
 *         clientEmail: conversation.clientEmail || null
 *       };
 *     }
 *
 *     return 'No pude generar una respuesta. Por favor, intenta de nuevo.';
 *   } catch (error) {
 *     console.error('Error in ceramicoAnswer:', error);
 *     throw error;
 *   }
 * }
 */

module.exports = {
  generateConversationId,
  captureEmailFromMessage,
  isValidEmail,
  addLeadCapturePrompt
};
