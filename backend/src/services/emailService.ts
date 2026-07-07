import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT!),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (
  email: string,
  token: string,
  frontendUrl: string
) => {
  const verificationUrl = `${frontendUrl}/verificar-email?token=${token}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
      </head>
      <body>
        <h1>Newzeland Cerámicas</h1>
        <h2>¡Bienvenido!</h2>
        <p>Gracias por registrarte. Haz clic en el botón para verificar tu correo:</p>
        <a href="${verificationUrl}" style="background: #26374a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verificar mi email</a>
        <p>El enlace expira en 24 horas.</p>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Verifica tu correo - Newzelland Cerámicas',
    html: htmlContent,
  });
};

export const sendOrderConfirmation = async (email: string, orderData: any) => {
  const itemsHtml = orderData.items
    .map(
      (item: any) =>
        `<tr><td>${item.name}</td><td>${item.quantity}</td><td>${item.unitPrice.toFixed(2)}€</td><td>${item.totalLine.toFixed(2)}€</td></tr>`
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
      </head>
      <body>
        <h1>Pedido confirmado</h1>
        <p>Tu pedido <strong>#${orderData.id}</strong> ha sido confirmado.</p>
        <h3>Detalle del pedido:</h3>
        <table style="border-collapse: collapse;">
          <thead>
            <tr>
              <th style="border: 1px solid #ccc; padding: 10px;">Producto</th>
              <th style="border: 1px solid #ccc; padding: 10px;">Cantidad</th>
              <th style="border: 1px solid #ccc; padding: 10px;">Precio unitario</th>
              <th style="border: 1px solid #ccc; padding: 10px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <p><strong>Total: ${orderData.total.toFixed(2)}€</strong></p>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: `Pedido confirmado #${orderData.id} - Newzelland Cerámicas`,
    html: htmlContent,
  });
};
