# Configuración de Email (SMTP - Gmail)

## Paso 1: Habilitar 2-Factor en Gmail

1. Ve a: https://myaccount.google.com/security
2. En la izquierda, busca: "2-Step Verification"
3. Si no está habilitada, click en "Enable"
4. Sigue las instrucciones (verificarás con tu teléfono)

## Paso 2: Generar App Password

Una vez que 2-Factor esté habilitado:

1. Ve nuevamente a: https://myaccount.google.com/security
2. En la izquierda, busca: "App passwords"
3. Selecciona: Mail + Windows/Mac (o tu plataforma)
4. Gmail genera una contraseña de 16 caracteres
5. Copia ese valor: esto es tu `SMTP_PASS`

Ejemplo: `abcd efgh ijkl mnop` (sin espacios)

## Paso 3: Agregar a Vercel Dashboard

Environment Variables → Production:

```
SMTP_HOST: smtp.gmail.com
SMTP_PORT: 587
SMTP_USER: tu_email@gmail.com
SMTP_PASS: [la contraseña de 16 caracteres sin espacios]
SMTP_FROM: noreply@newzeland.es
```

## Paso 4: Test Local (opcional)

```bash
# Crear archivo test-email.js
cat > test-email.js << 'TESTEOF'
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'tu_email@gmail.com',
    pass: 'abcdefghijklmnop'  // Sin espacios
  }
});

transporter.sendMail({
  from: 'noreply@newzeland.es',
  to: 'tu_email@gmail.com',
  subject: 'Test Email desde Newzelland',
  html: '<h1>Test Successful!</h1><p>Email working correctly</p>'
}, (err, info) => {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log('Email sent! Response:', info.response);
  }
  process.exit(0);
});
TESTEOF

# Ejecutar test
node test-email.js

# Borrar archivo
rm test-email.js
```

## Paso 5: Verificar en Producción

Después de agregar variables a Vercel y redeploy:

```bash
# Health check
curl https://newzelland-ceramicas.vercel.app/api/health

# Si es necesario, revisa logs:
vercel logs https://newzelland-ceramicas.vercel.app --follow
```

## Troubleshooting

### "Authentication failed"
- ¿Usaste App Password (16 chars) o la contraseña normal?
- ¿Gmail muestra "Allow less secure apps"? (desactívalo si está en el navegador)
- Espera 5 minutos después de generar App Password

### "Connection refused"
- Verifica SMTP_HOST: smtp.gmail.com
- Verifica SMTP_PORT: 587 (no 465)
- Verifica SMTP_USER: tu email completo

### "No se envía email en producción"
- Revisa logs: `vercel logs --follow`
- Verifica que SMTP_PASS sea exacto (sin espacios extra)
- Gmail puede estar bloqueando conexión desde Vercel (raro pero posible)

## Integración en Código

En `backend/src/services/emailService.ts` ya existe:

```typescript
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
```

Así que solo asegúrate de que las variables de entorno estén configuradas.

---

**Proxima paso:** PASO 7 - Configurar Stripe (opcional)
