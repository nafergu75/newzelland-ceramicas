/**
 * FASE 5 - Exportación de Conversaciones
 * POST /api/ceramico/export
 *
 * Permite exportar conversaciones a PDF o enviar por email
 * con análisis de sentimiento y notas internas
 */

const { generatePDF } = require('../utils/pdfGenerator');
const { sendConversationEmail } = require('../utils/emailService');
const { getConversationById, saveConversationExport } = require('../utils/conversationStorage');

/**
 * POST /api/ceramico/export
 *
 * Request body:
 * {
 *   conversationId: string (requerido)
 *   format: 'pdf' | 'email' (requerido)
 *   email?: string (requerido si format es 'email')
 *   internalNotes?: string (opcional)
 * }
 */
async function exportConversation(req, res) {
  const { conversationId, format, email, internalNotes } = req.body;

  // Validación básica
  if (!conversationId) {
    return res.status(400).json({
      ok: false,
      error: 'conversationId es requerido'
    });
  }

  if (!['pdf', 'email'].includes(format)) {
    return res.status(400).json({
      ok: false,
      error: 'format debe ser "pdf" o "email"'
    });
  }

  if (format === 'email' && !email) {
    return res.status(400).json({
      ok: false,
      error: 'email es requerido cuando format es "email"'
    });
  }

  try {
    // 1. Obtener la conversación completa
    const conversation = await getConversationById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        ok: false,
        error: 'Conversación no encontrada'
      });
    }

    // 2. Enriquecer con metadatos
    const enrichedConversation = {
      ...conversation,
      exportedAt: new Date().toISOString(),
      internalNotes: internalNotes || ''
    };

    // 3a. Exportar a PDF
    if (format === 'pdf') {
      try {
        const pdfBuffer = await generatePDF(enrichedConversation);

        // Registrar exportación
        await saveConversationExport(conversationId, 'pdf', null, internalNotes);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="conversation-${conversationId}.pdf"`
        );

        return res.send(pdfBuffer);
      } catch (pdfError) {
        console.error('Error generando PDF:', pdfError);
        return res.status(500).json({
          ok: false,
          error: 'Error al generar PDF',
          details: process.env.NODE_ENV === 'development' ? pdfError.message : undefined
        });
      }
    }

    // 3b. Exportar por email
    if (format === 'email') {
      try {
        await sendConversationEmail(email, enrichedConversation);

        // Registrar exportación
        await saveConversationExport(conversationId, 'email', email, internalNotes);

        return res.json({
          ok: true,
          message: 'Conversación enviada por email',
          email: email,
          conversationId: conversationId
        });
      } catch (emailError) {
        console.error('Error enviando email:', emailError);
        return res.status(500).json({
          ok: false,
          error: 'Error al enviar email',
          details: process.env.NODE_ENV === 'development' ? emailError.message : undefined
        });
      }
    }
  } catch (error) {
    console.error('Error en exportación de conversación:', error);
    res.status(500).json({
      ok: false,
      error: 'Error al exportar conversación',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * GET /api/ceramico/export/:conversationId/status
 * Obtener estado de exportación de una conversación
 */
async function getExportStatus(req, res) {
  const { conversationId } = req.params;

  if (!conversationId) {
    return res.status(400).json({
      ok: false,
      error: 'conversationId es requerido'
    });
  }

  try {
    const conversation = await getConversationById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        ok: false,
        error: 'Conversación no encontrada'
      });
    }

    return res.json({
      ok: true,
      conversationId,
      clientEmail: conversation.clientEmail || null,
      hasBeenExported: !!conversation.exportedAt,
      exportedAt: conversation.exportedAt || null,
      canExportToPDF: true,
      canExportToEmail: !!conversation.clientEmail
    });
  } catch (error) {
    console.error('Error obteniendo estado de exportación:', error);
    res.status(500).json({
      ok: false,
      error: 'Error obteniendo estado de exportación'
    });
  }
}

module.exports = {
  exportConversation,
  getExportStatus
};
