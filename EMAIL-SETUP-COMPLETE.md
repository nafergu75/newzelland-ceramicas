# Configuración Email SMTP - FASE 6
**Fecha:** 2026-07-08  
**Proveedor:** Gmail SMTP (recomendado)

---

## Opción 1: Gmail SMTP (RECOMENDADO)

### PASO 1: Preparar cuenta Gmail

**Requisitos:**
- Cuenta Gmail activa
- Email: `info@newzeland.es` o similar
- 2FA (verificación de dos factores) activado

### PASO 2: Generar Gmail App Password

**Importante:** Se requiere 2FA activado para usar App Passwords

1. Ir a **https://myaccount.google.com/**
2. Menú izquierdo → **Security** (Seguridad)
3. Desplazarse hasta **Your devices**
4. Click en **2-Step Verification** y activar si no está
5. Volver a **Account Settings** → **Security**
6. Buscar **"App passwords"** (aparece solo si 2FA está activo)
7. Click en **App passwords**
8. Seleccionar:
   - **Select the app:** Mail
   - **Select the device:** Windows Computer (o tu SO)
9. Google genera una contraseña de 16 caracteres
10. **Copiar la contraseña** (sin espacios)

**Ejemplo de App Password generada:**
```
abcdefghijklmnop
```

### PASO 3: Cargar en Vercel

**Vercel Dashboard** → **Settings** → **Environment Variables** → Agregar:

| Variable | Valor | Ambientes |
|----------|-------|-----------|
| SMTP_HOST | smtp.gmail.com | Production |
| SMTP_PORT | 587 | Production |
| SMTP_USER | info@newzeland.es | Production |
| SMTP_PASS | abcdefghijklmnop | Production |
| SMTP_FROM | noreply@newzeland.es | Production |

**Detalles:**
- **SMTP_HOST:** `smtp.gmail.com` (sin cambios)
- **SMTP_PORT:** `587` (TLS)
- **SMTP_USER:** Email desde el que envía
- **SMTP_PASS:** App Password de 16 caracteres (sin espacios)
- **SMTP_FROM:** Nombre que verá el destinatario

### PASO 4: Verificar en código

**Ubicación:** `backend/src/services/emailService.ts`

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,      // smtp.gmail.com
  port: parseInt(process.env.SMTP_PORT!),  // 587
  secure: false,                      // TLS (no SSL en puerto 587)
  auth: {
    user: process.env.SMTP_USER,      // info@newzeland.es
    pass: process.env.SMTP_PASS,      // abcdefghijklmnop
  },
});

export const sendVerificationEmail = async (
  email: string,
  token: string,
  frontendUrl: string
) => {
  const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

  return transporter.sendMail({
    from: process.env.SMTP_FROM,      // noreply@newzeland.es
    to: email,
    subject: 'Verifica tu email - Newzelland Cerámicas',
    html: `
      <h2>Bienvenido a Newzelland Cerámicas</h2>
      <p>Para completar tu registro, verifica tu email:</p>
      <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Verificar Email
      </a>
      <p>O copia este enlace:</p>
      <p>${verificationUrl}</p>
      <p>El enlace expira en 24 horas.</p>
    `,
  });
};

export const sendOrderConfirmation = async (
  email: string,
  orderDetails: any
) => {
  return transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Confirmación de pedido - Newzelland Cerámicas',
    html: `
      <h2>Pedido confirmado</h2>
      <p>Tu pedido #${orderDetails.orderId} ha sido creado exitosamente.</p>
      <p>Total: €${orderDetails.total}</p>
      <p>Nos pondremos en contacto pronto para confirmar el envío.</p>
    `,
  });
};
```

---

## Opción 2: SendGrid (Alternativa)

### Configuración SendGrid

1. Crear cuenta en **https://sendgrid.com/**
2. Generar API Key desde **Settings** → **API Keys**
3. Copiar la clave

### Variables en Vercel

```
SENDGRID_API_KEY = SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL = noreply@newzeland.es
```

### Implementación

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const sendVerificationEmail = async (
  email: string,
  token: string,
  frontendUrl: string
) => {
  const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

  return sgMail.send({
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject: 'Verifica tu email - Newzelland Cerámicas',
    html: `...`,
  });
};
```

---

## Opción 3: Mailgun

### Configuración Mailgun

1. Registrarse en **https://www.mailgun.com/**
2. Obtener API Key y dominio
3. Configurar dominio personalizado (newzeland.es)

### Variables

```
MAILGUN_API_KEY = key-xxxxx
MAILGUN_DOMAIN = newzeland.es
```

---

## Estructura de Emails

### 1. Email de Verificación

**Cuándo:** Después del registro  
**Para:** Usuario nuevo  
**Asunto:** "Verifica tu email - Newzelland Cerámicas"

```html
<h2>Bienvenido a Newzelland Cerámicas</h2>
<p>Hola [NAME],</p>
<p>Gracias por registrarte. Para completar tu registro, verifica tu email:</p>
<a href="[VERIFICATION_URL]">Verificar Email</a>
<p>El enlace expira en 24 horas.</p>
<hr>
<p>Si no solicitaste este registro, ignora este email.</p>
```

### 2. Email de Confirmación de Orden

**Cuándo:** Después de crear orden  
**Para:** Cliente  
**Asunto:** "Confirmación de pedido - Newzelland Cerámicas"

```html
<h2>Pedido confirmado</h2>
<p>Tu pedido #[ORDER_ID] ha sido creado exitosamente.</p>
<h3>Detalles:</h3>
<ul>
  <li>Subtotal: €[SUBTOTAL]</li>
  <li>Impuestos: €[TAX]</li>
  <li>Envío: €[SHIPPING]</li>
  <li><strong>Total: €[TOTAL]</strong></li>
</ul>
<p>Estado: [STATUS]</p>
<p>Nos pondremos en contacto en breve para confirmar el envío.</p>
```

### 3. Email de Restablecimiento de Contraseña (futuro)

```html
<h2>Restablece tu contraseña</h2>
<p>Has solicitado restablecer tu contraseña.</p>
<a href="[RESET_URL]">Restablecer Contraseña</a>
<p>El enlace expira en 1 hora.</p>
```

---

## Test de Email

### Test Local

```bash
cd backend
npm install nodemailer

# Crear archivo test-email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: 'info@newzeland.es',
    pass: 'abcdefghijklmnop',  // App Password
  },
});

transporter.sendMail({
  from: 'noreply@newzeland.es',
  to: 'tu-email@ejemplo.com',
  subject: 'Test Email',
  html: '<h1>Test desde Newzelland</h1>',
}, (err, info) => {
  if (err) console.error('Error:', err);
  else console.log('Email enviado:', info);
});

# Ejecutar
node test-email.js
```

### Test en Vercel

```bash
# POST /api/auth/register con email válido
# Debe recibir email de verificación en bandeja de entrada

# Verificar logs de Vercel
vercel logs newzelland-ceramicas
```

---

## Troubleshooting

### Error: "Invalid login credentials"
```
Solución:
1. Verificar App Password (no contraseña de Gmail)
2. Verificar 2FA está activado
3. Copiar password exactamente (sin espacios)
4. Regenerar si es necesario
```

### Error: "Less secure app access denied"
```
Solución:
No usar contraseña de Gmail directamente.
MUST usar App Password (genera automáticamente acceso seguro).
```

### Email no llega a bandeja de entrada
```
Verificar:
1. Revisar carpeta Spam/Junk
2. Verificar que el email es válido
3. Ver logs en Vercel para errores
4. Intentar con email de prueba (Mailtrap, etc.)
```

### Error: "SMTPAuthenticationError"
```
Solución:
1. Regenerar App Password en Google
2. Verificar SMTP_PORT es 587 (no 465 o 25)
3. Verificar SMTP_USER es el email correcto
```

---

## Monitoreo de Emails

### En Gmail
- Verificar carpeta **Sent Mail** para confirmación
- Revisar si hay rebotes (delivery failures)

### En logs de Vercel
```
Vercel Dashboard → Deployments → Logs
Buscar: "Email sending failed" o "Email sent"
```

### Servicios de testing
- **Mailtrap.io:** Capturar emails en desarrollo
- **Ethereal Email:** Temporal para testing

---

## Mejores prácticas

### 1. Validación de email
```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  throw new Error('Email inválido');
}
```

### 2. Manejo de errores
```typescript
try {
  await sendVerificationEmail(email, token, frontendUrl);
} catch (error) {
  console.error('Email sending failed:', error);
  // No bloquear registro si email falla
  // El usuario puede verificar después
}
```

### 3. Rate limiting de emails
```typescript
// Máximo 5 emails por usuario por hora
const recentEmails = await query(
  'SELECT COUNT(*) FROM email_logs WHERE user_id = $1 AND created_at > NOW() - INTERVAL 1 HOUR',
  [userId]
);

if (recentEmails.rows[0].count > 5) {
  throw new Error('Too many emails, please try again later');
}
```

### 4. Template HTML
- Usar layouts responsivos (mobile-friendly)
- Incluir logo y branding
- Agregar unsubscribe link
- Usar CSS inline (algunos clientes no soportan `<style>`)

---

## Variables Finales Requeridas

```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = info@newzeland.es
SMTP_PASS = <App Password 16 caracteres>
SMTP_FROM = noreply@newzeland.es
```

---

## Próximo Paso: FASE 7
Ver documento: `STRIPE-SETUP-INSTRUCTIONS.md`

**Email Setup:** ✅ Completado  
**Tipo:** Gmail SMTP (recomendado)  
**Status:** Listo para verificación
