/**
 * Generador de PDF para conversaciones - Fase 5
 * Usa pdfkit para crear PDFs profesionales
 */

const PDFDocument = require('pdfkit');

/**
 * Generar PDF de conversación con análisis de sentimiento
 * @param {Object} conversation - Datos de la conversación
 * @returns {Promise<Buffer>}
 */
async function generatePDF(conversation) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        bufferPages: true
      });

      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // ===== HEADER =====
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('Conversación Cerámico', { align: 'center' });

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#666666')
        .text('Newzeland Ceramicas', { align: 'center' });

      doc
        .fontSize(9)
        .fillColor('#999999')
        .text(
          `Exportado: ${new Date(conversation.exportedAt).toLocaleString('es-ES')}`,
          { align: 'center' }
        );

      doc.moveDown();

      // ===== LÍNEA SEPARADORA =====
      doc
        .strokeColor('#CCCCCC')
        .lineWidth(0.5)
        .moveTo(doc.page.margins.left, doc.y)
        .lineTo(doc.page.width - doc.page.margins.right, doc.y)
        .stroke();

      doc.moveDown();

      // ===== INFORMACIÓN DE CONVERSACIÓN =====
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text('Información de la Conversación', { underline: true });

      doc.fontSize(10).font('Helvetica').fillColor('#333333');

      const conversationInfo = [];
      if (conversation.id) conversationInfo.push(`ID: ${conversation.id}`);
      if (conversation.clientEmail)
        conversationInfo.push(`Email: ${conversation.clientEmail}`);
      if (conversation.duration)
        conversationInfo.push(
          `Duración: ${formatDuration(conversation.duration)}`
        );
      if (conversation.finalSentiment)
        conversationInfo.push(
          `Sentimiento: ${translateSentiment(conversation.finalSentiment)}`
        );
      if (conversation.finalIntent)
        conversationInfo.push(`Intención: ${conversation.finalIntent}`);
      if (conversation.createdAt)
        conversationInfo.push(
          `Fecha: ${new Date(conversation.createdAt).toLocaleString('es-ES')}`
        );

      conversationInfo.forEach((info) => {
        doc.text(info, { indent: 10 });
      });

      doc.moveDown();

      // ===== HISTORIAL DE CONVERSACIÓN =====
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text('Historial de Conversación', { underline: true });

      doc.moveDown(0.5);

      if (conversation.messages && Array.isArray(conversation.messages)) {
        conversation.messages.forEach((msg) => {
          const role = msg.role === 'user' ? 'Cliente' : 'Cerámico';
          const icon = msg.role === 'user' ? '👤' : '🤖';

          const time = msg.timestamp
            ? new Date(msg.timestamp).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              })
            : '';

          // Encabezado del mensaje
          doc
            .fontSize(10)
            .font('Helvetica-Bold')
            .fillColor('#1976D2')
            .text(`${icon} ${role}${time ? ` - ${time}` : ''}`, {
              align: 'left'
            });

          // Contenido del mensaje
          doc
            .fontSize(9)
            .font('Helvetica')
            .fillColor('#333333')
            .text(msg.content || '(Mensaje vacío)', {
              align: 'left',
              indent: 10,
              lineGap: 2,
              width: 480
            });

          doc.moveDown(0.3);
        });
      }

      doc.moveDown();

      // ===== ANÁLISIS DE SENTIMIENTO (si existe) =====
      if (
        conversation.sentimentHistory &&
        conversation.sentimentHistory.length > 0
      ) {
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .fillColor('#000000')
          .text('Análisis de Sentimiento', { underline: true });

        doc.moveDown(0.5);

        const lastSentiment =
          conversation.sentimentHistory[
            conversation.sentimentHistory.length - 1
          ];
        if (lastSentiment) {
          doc
            .fontSize(10)
            .font('Helvetica')
            .fillColor('#333333');

          doc.text(
            `Sentimiento: ${translateSentiment(lastSentiment.sentiment)}`,
            { indent: 10 }
          );

          if (lastSentiment.confidence) {
            doc.text(
              `Confianza: ${(lastSentiment.confidence * 100).toFixed(0)}%`,
              { indent: 10 }
            );
          }

          if (lastSentiment.purchaseInterest) {
            doc.text(
              `Interés de Compra: ${lastSentiment.purchaseInterest}%`,
              { indent: 10 }
            );
          }

          if (lastSentiment.suggestedAction) {
            doc.text(
              `Acción Sugerida: ${lastSentiment.suggestedAction}`,
              { indent: 10 }
            );
          }

          if (lastSentiment.intent) {
            doc.text(
              `Intención Detectada: ${lastSentiment.intent}`,
              { indent: 10 }
            );
          }
        }

        doc.moveDown();
      }

      // ===== NOTAS INTERNAS =====
      if (conversation.internalNotes && conversation.internalNotes.trim()) {
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .fillColor('#D32F2F')
          .text('Notas Internas', { underline: true });

        doc.moveDown(0.5);

        doc
          .fontSize(9)
          .font('Helvetica')
          .fillColor('#333333')
          .text(conversation.internalNotes, {
            align: 'left',
            indent: 10,
            lineGap: 2,
            width: 480
          });

        doc.moveDown();
      }

      // ===== FOOTER =====
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);

        doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor('#999999')
          .text(
            `Página ${i + 1} de ${pageCount} · © Newzeland Ceramicas · Confidencial`,
            doc.page.margins.bottom - 20,
            doc.page.height - doc.page.margins.bottom + 10,
            { align: 'center' }
          );
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Formatear duración en milisegundos
 * @param {number} ms
 * @returns {string}
 */
function formatDuration(ms) {
  if (!ms) return 'N/A';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

/**
 * Traducir sentimiento al español
 * @param {string} sentiment
 * @returns {string}
 */
function translateSentiment(sentiment) {
  const translations = {
    positive: 'Positivo',
    negative: 'Negativo',
    neutral: 'Neutral',
    POSITIVE: 'Positivo',
    NEUTRAL: 'Neutral',
    NEGATIVE: 'Negativo',
    very_positive: 'Muy Positivo',
    very_negative: 'Muy Negativo'
  };

  return translations[sentiment] || sentiment;
}

module.exports = {
  generatePDF
};
