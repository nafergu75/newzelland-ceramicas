/**
 * Servicio de email para envío de conversaciones - Fase 5
 * Compatible con nodemailer (SMTP) o SendGrid
 */

const nodemailer = require('nodemailer');
const { generatePDF } = require('./pdfGenerator');

/**
 * Crear transporte de email según configuración
 * Soporta SMTP (Gmail, Outlook, custom) o SendGrid
 * @returns {Promise<Object>}
 */
async function createEmailTransport() {
  // Verificar si usar SendGrid (recomendado para producción)
  if (process.env.SENDGRID_API_KEY) {
    const sgTransport = require('nodemailer-sendgrid-transport');
    return nodemailer.createTransport(
      sgTransport({
        auth: {
          api_key: process.env.SENDGRID_API_KEY
        }
      })
    );
  }

  // Fallback a SMTP (Gmail, Outlook, custom)
  const smtpConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true para puerto 465, false para 587
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  };

  // En desarrollo sin SMTP configurado, usar modo test
  if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_USER) {
    console.warn('⚠️  SMTP no configurado. Los emails en desarrollo se loguean pero no se envían.');
    // Retornar un transporter de prueba
    return {
      sendMail: async (mailOptions) => {
        console.log('📧 [TEST MODE] Email que sería enviado:');
        console.log('   To:', mailOptions.to);
        console.log('   Subject:', mailOptions.subject);
        console.log('   Attachments:', mailOptions.attachments?.length || 0);
        return { messageId: `test-${Date.now()}@newzelland.test` };
      }
    };
  }

  return nodemailer.createTransport(smtpConfig);
}

/**
 * Enviar conversación por email
 * @param {string} recipientEmail - Email del destinatario
 * @param {Object} conversation - Datos de la conversación
 * @returns {Promise<Object>}
 */
async function sendConversationEmail(recipientEmail, conversation) {
  try {
    // Validar email
    if (!recipientEmail || !isValidEmail(recipientEmail)) {
      throw new Error('Email inválido');
    }

    // Generar PDF
    const pdfBuffer = await generatePDF(conversation);

    // Crear transportador
    const transporter = await createEmailTransport();

    // Preparar email
    const mailOptions = {
      from:
        process.env.SMTP_FROM ||
        process.env.SENDGRID_FROM ||
        'Cerámico <noreply@newzelland.es>',
      to: recipientEmail,
      subject:
        '📋 Tu conversación con Cerámico · Newzeland Ceramicas',
      html: generateEmailHTML(conversation),
      attachments: [
        {
          filename: `conversation-${conversation.id || 'export'}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ],
      headers: {
        'X-Conversation-ID': conversation.id || 'unknown',
        'X-Client-Email': recipientEmail
      }
    };

    // Enviar email
    const result = await transporter.sendMail(mailOptions);

    console.log(`✉️  Email enviado a ${recipientEmail}:`, result.messageId);

    return {
      success: true,
      messageId: result.messageId,
      to: recipientEmail
    };
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    throw new Error(`No se pudo enviar email: ${error.message}`);
  }
}

/**
 * Generar HTML del email
 * @param {Object} conversation
 * @returns {string}
 */
function generateEmailHTML(conversation) {
  const {
    id,
    clientEmail,
    finalSentiment,
    finalIntent,
    sentimentHistory = [],
    createdAt
  } = conversation;

  const lastSentiment =
    sentimentHistory.length > 0
      ? sentimentHistory[sentimentHistory.length - 1]
      : null;

  const baseURL = process.env.BASE_URL || 'https://newzelland.es';

  const sentimentLabel = finalSentiment
    ? translateSentimentLabel(finalSentiment)
    : 'N/A';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tu Conversación con Cerámico</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            font-size: 28px;
            margin-bottom: 8px;
            font-weight: 600;
        }
        .header p {
            font-size: 14px;
            opacity: 0.9;
        }
        .content {
            padding: 30px 20px;
        }
        .section {
            margin-bottom: 25px;
        }
        .section h2 {
            font-size: 16px;
            color: #1976D2;
            margin-bottom: 12px;
            border-bottom: 2px solid #E3F2FD;
            padding-bottom: 8px;
        }
        .info-box {
            background-color: #F5F5F5;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 10px;
            border-left: 4px solid #1976D2;
        }
        .info-box strong {
            display: block;
            color: #1976D2;
            margin-bottom: 4px;
        }
        .sentiment-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-right: 8px;
        }
        .sentiment-positive {
            background-color: #E8F5E9;
            color: #2E7D32;
        }
        .sentiment-negative {
            background-color: #FFEBEE;
            color: #C62828;
        }
        .sentiment-neutral {
            background-color: #F5F5F5;
            color: #616161;
        }
        .cta-section {
            background-color: #E3F2FD;
            padding: 20px;
            border-radius: 4px;
            text-align: center;
            margin-bottom: 20px;
        }
        .cta-button {
            display: inline-block;
            background-color: #1976D2;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 600;
            font-size: 14px;
        }
        .cta-button:hover {
            background-color: #1565C0;
        }
        .footer {
            background-color: #F5F5F5;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #999;
            border-top: 1px solid #E0E0E0;
        }
        .footer p {
            margin: 5px 0;
        }
        .contact-info {
            background-color: #FFFDE7;
            padding: 15px;
            border-radius: 4px;
            margin-top: 15px;
            border-left: 4px solid #FBC02D;
        }
        .contact-info p {
            margin: 5px 0;
        }
        .contact-info a {
            color: #1976D2;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🤖 Cerámico</h1>
            <p>Tu conversación con nuestro asistente inteligente</p>
        </div>

        <!-- Content -->
        <div class="content">
            <p style="margin-bottom: 20px;">Hola,</p>
            <p style="margin-bottom: 20px;">
                Aquí tienes un resumen completo de tu conversación con <strong>Cerámico</strong>,
                nuestro asistente de catálogo de productos cerámicos. El PDF adjunto contiene toda la información.
            </p>

            <!-- Sección de Información -->
            ${
              lastSentiment || finalSentiment
                ? `
            <div class="section">
                <h2>📊 Análisis de la Conversación</h2>
                ${
                  finalSentiment
                    ? `<p style="margin-bottom: 10px;">
                        <span class="sentiment-badge sentiment-${translateSentimentClass(finalSentiment)}">
                            ${sentimentLabel}
                        </span>
                    </p>`
                    : ''
                }
                ${
                  lastSentiment && lastSentiment.purchaseInterest
                    ? `<p>
                        <strong>Interés de compra:</strong> ${lastSentiment.purchaseInterest}%
                    </p>`
                    : ''
                }
                ${
                  finalIntent
                    ? `<p>
                        <strong>Intención principal:</strong> ${finalIntent}
                    </p>`
                    : ''
                }
            </div>
            `
                : ''
            }

            <!-- Contenido del PDF -->
            <div class="section">
                <h2>📄 Contenido del Documento Adjunto</h2>
                <div class="info-box">
                    <p>El PDF incluye:</p>
                    <ul style="margin-left: 20px; margin-top: 8px;">
                        <li>Historial completo de la conversación</li>
                        <li>Preguntas y respuestas detalladas</li>
                        <li>Análisis de sentimiento y preferencias</li>
                        <li>Información de productos consultados</li>
                        <li>Presupuesto estimado (si lo solicitaste)</li>
                    </ul>
                </div>
            </div>

            <!-- Call to Action -->
            <div class="cta-section">
                <p style="margin-bottom: 15px;">¿Necesitas más información o quieres continuar?</p>
                <a href="${baseURL}" class="cta-button">Volver a Cerámico</a>
            </div>

            <!-- Información de Contacto -->
            <div class="contact-info">
                <strong>📞 ¿Preguntas? Contacta con nosotros:</strong>
                <p>📧 <a href="mailto:info@newzelland.es">info@newzelland.es</a></p>
                <p>🌐 <a href="${baseURL}">www.newzelland.es</a></p>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>Newzeland Ceramicas</strong></p>
            <p>© ${new Date().getFullYear()} Todos los derechos reservados.</p>
            <p>Este email contiene información confidencial destinada al cliente.</p>
            <hr style="border: none; border-top: 1px solid #E0E0E0; margin: 10px 0;">
            <p>ID Conversación: ${id || 'N/A'}</p>
            <p>Fecha: ${createdAt ? new Date(createdAt).toLocaleString('es-ES') : 'N/A'}</p>
        </div>
    </div>
</body>
</html>
  `;
}

/**
 * Validar formato de email
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Traducir sentimiento a clase CSS
 * @param {string} sentiment
 * @returns {string}
 */
function translateSentimentClass(sentiment) {
  if (
    sentiment === 'positive' ||
    sentiment === 'very_positive' ||
    sentiment === 'POSITIVE'
  ) {
    return 'positive';
  }
  if (
    sentiment === 'negative' ||
    sentiment === 'very_negative' ||
    sentiment === 'NEGATIVE'
  ) {
    return 'negative';
  }
  return 'neutral';
}

/**
 * Traducir sentimiento a etiqueta legible
 * @param {string} sentiment
 * @returns {string}
 */
function translateSentimentLabel(sentiment) {
  const translations = {
    positive: '✅ Positivo',
    negative: '❌ Negativo',
    neutral: '➖ Neutral',
    POSITIVE: '✅ Positivo',
    NEGATIVE: '❌ Negativo',
    NEUTRAL: '➖ Neutral',
    very_positive: '🎉 Muy Positivo',
    very_negative: '⚠️ Muy Negativo'
  };

  return translations[sentiment] || sentiment;
}

module.exports = {
  sendConversationEmail,
  createEmailTransport
};
