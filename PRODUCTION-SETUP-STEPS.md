# PRODUCTION-SETUP-STEPS.md
## Pasos Prácticos para Completar la Lista de Producción

**Proyecto**: Newzeland Cerámicas E-commerce  
**Última actualización**: 2026-07-08  
**Tiempo estimado**: 2 horas  

---

## PASO 1: VERIFICAR SEGURIDAD BÁSICA (15 minutos)

### 1.1 Verificar CORS está configurado

```bash
# Ir a la carpeta del proyecto
cd "C:\Users\NACHO PC\Desktop\newzelland-ceramicas"

# Verificar que app.ts tiene CORS
grep -r "cors(" backend/src/app.ts

# Debe mostrar:
# app.use(cors({ origin: process.env.FRONTEND_URL }));
```

### 1.2 Verificar Helmet.js está activo

```bash
# Verificar
grep -r "helmet()" backend/src/app.ts

# Debe mostrar:
# app.use(helmet());

# Verificar que está en dependencias
grep "helmet" backend/package.json

# Debe mostrar:
# "helmet": "^7.0.0"
```

### 1.3 Verificar Rate Limiting

```bash
# Verificar
grep -r "rateLimit" backend/src/app.ts

# Debe mostrar algo como:
# const limiter = rateLimit({
#   windowMs: 15 * 60 * 1000,
#   max: 100,
# });
```

**Si alguno falta, instalar ahora:**
```bash
cd backend
npm install helmet express-rate-limit cors
npm install --save-dev @types/cors
```

---

## PASO 2: PREPARAR VARIABLES DE ENTORNO (20 minutos)

### 2.1 Generar JWT_SECRET seguro

```bash
# En PowerShell o Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Resultado ejemplo:
# a7f3b2c1e9d4f6a8b3c5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7

# GUARDAR ESTE VALOR - se necesita para Vercel
```

### 2.2 Crear archivo .env.production.local (para testing local)

```bash
# Crear archivo
cat > .env.production.local << 'EOF'
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://newzelland-ceramicas.vercel.app
API_URL=https://newzelland-ceramicas.vercel.app/api

# Database (reemplazar con tus credenciales reales)
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=newzeland_ecommerce
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Security
JWT_SECRET=a7f3b2c1e9d4f6a8b3c5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7
JWT_EXPIRATION=7d

# SMTP (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_16_chars
SMTP_FROM=noreply@newzeland.es

# Stripe (agrega cuando tengas claves)
STRIPE_SECRET=sk_live_... (cuando obtengas)
STRIPE_PUBLIC=pk_live_... (cuando obtengas)

# WhatsApp (agrega cuando configures)
WHATSAPP_TOKEN=... (cuando obtengas)

EOF

# Verificar que se creó
ls -la .env.production.local
```

### 2.3 Actualizar .gitignore

```bash
# Verificar que .env está en .gitignore
cat .gitignore | grep -E "\.env"

# Si no está, agregar:
echo "" >> .gitignore
echo "# Environment variables" >> .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore
```

---

## PASO 3: CONFIGURAR EN VERCEL DASHBOARD (30 minutos)

### 3.1 Acceder a Vercel

```
URL: https://vercel.com/dashboard
Proyecto: newzelland-ceramicas
```

### 3.2 Agregar Variables de Entorno

1. Ir a: **Settings → Environment Variables**

2. Seleccionar: **Production** (dropdown)

3. Agregar estas variables (una por una):

**Base de Datos:**
```
Nombre: DB_HOST
Valor: [tu host postgresql]
Ambientes: Production, Preview, Development

Nombre: DB_PORT
Valor: 5432
Ambientes: Production, Preview, Development

Nombre: DB_NAME
Valor: newzeland_ecommerce
Ambientes: Production, Preview, Development

Nombre: DB_USER
Valor: [tu usuario postgresql]
Ambientes: Production, Preview, Development

Nombre: DB_PASSWORD
Valor: [tu contraseña postgresql]
Ambientes: Production (solo)
```

**Seguridad:**
```
Nombre: JWT_SECRET
Valor: [el valor generado en paso 2.1]
Ambientes: Production (solo)

Nombre: JWT_EXPIRATION
Valor: 7d
Ambientes: Production, Preview, Development

Nombre: NODE_ENV
Valor: production
Ambientes: Production (solo)
```

**Aplicación:**
```
Nombre: FRONTEND_URL
Valor: https://newzelland-ceramicas.vercel.app
Ambientes: Production, Preview, Development

Nombre: API_URL
Valor: https://newzelland-ceramicas.vercel.app/api
Ambientes: Production, Preview, Development
```

**SMTP (Email):**
```
Nombre: SMTP_HOST
Valor: smtp.gmail.com
Ambientes: Production, Preview, Development

Nombre: SMTP_PORT
Valor: 587
Ambientes: Production, Preview, Development

Nombre: SMTP_USER
Valor: [tu email@gmail.com]
Ambientes: Production, Preview, Development

Nombre: SMTP_PASS
Valor: [tu app password]
Ambientes: Production (solo)

Nombre: SMTP_FROM
Valor: noreply@newzeland.es
Ambientes: Production, Preview, Development
```

### 3.3 Verificar Variables Agregadas

```bash
# Con Vercel CLI
vercel env list

# Debe mostrar todas las variables
# Las que dicen "Encrypted" son seguras
```

---

## PASO 4: REDEPLOY PARA APLICAR VARIABLES (10 minutos)

### 4.1 Redeploy en Vercel

**Opción A: Via Vercel Dashboard (Recomendado)**
1. Ve a: https://vercel.com/dashboard/project/newzelland-ceramicas
2. Ir a: **Deployments**
3. Click en el último deployment (o en "Redeploy")
4. Si aparece botón "Redeploy", clickear
5. Esperar a que se complete (2-5 minutos)

**Opción B: Via CLI**
```bash
cd "C:\Users\NACHO PC\Desktop\newzelland-ceramicas"

# Login (si no lo hiciste antes)
vercel login

# Redeploy a producción
vercel --prod

# Esperar a que diga "Deployment completed"
```

### 4.2 Verificar Deploy Exitoso

```bash
# Test health endpoint
curl https://newzelland-ceramicas.vercel.app/api/health

# Debe retornar:
# {"status":"ok"}

# O en navegador:
# https://newzelland-ceramicas.vercel.app/api/health
```

---

## PASO 5: CONFIGURAR BASE DE DATOS (30 minutos)

### 5.1 Opción A: Vercel Postgres (RECOMENDADO)

```bash
# Conectarse desde CLI
vercel postgres connect

# Seguir instrucciones
# Seleccionar: Create a new Postgres database
# Esperar a que se cree (2-3 minutos)

# Vercel agregará automáticamente:
# POSTGRES_PRISMA_URL
# POSTGRES_URL_NON_POOLING
```

### 5.2 Opción B: Usar PostgreSQL existente

Si ya tienes una BD en Heroku, AWS RDS, o similar:

1. Obtén las credenciales:
   - Host
   - Port (normalmente 5432)
   - Database name
   - Username
   - Password

2. Agrega en Vercel (como en Paso 3):
   ```
   DB_HOST = host_value
   DB_PORT = 5432
   DB_NAME = database_name
   DB_USER = username
   DB_PASSWORD = password
   ```

### 5.3 Ejecutar Migraciones

**Importante:** Solo hacer esto ANTES del primer deploy con BD

```bash
# Local (con .env.production.local)
cd backend
npm run migrate

# O en Vercel:
# Crear un endpoint POST /api/admin/migrate (requiere admin token)
# Luego: curl -X POST https://...vercel.app/api/admin/migrate \
#   -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## PASO 6: CONFIGURAR EMAILS (20 minutos)

### 6.1 Obtener App Password de Gmail

1. Ve a: https://myaccount.google.com/security
2. En la izquierda, busca: **2-Step Verification**
   - Si no está habilitado, habilitar primero
3. Una vez habilitado, ve a: **App passwords**
4. Selecciona: Mail + Windows/Mac
5. Gmail genera contraseña de 16 caracteres
6. **Guardar** este valor - es tu SMTP_PASS

### 6.2 Agregar a Vercel

En Vercel Dashboard → Environment Variables → Production:

```
SMTP_HOST: smtp.gmail.com
SMTP_PORT: 587
SMTP_USER: tu_email@gmail.com
SMTP_PASS: [la contraseña de 16 caracteres]
SMTP_FROM: noreply@newzeland.es
```

### 6.3 Test de Email

Crear un archivo temporal para testing:

```bash
# Crear script de test
cat > test-email.js << 'EOF'
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'tu_email@gmail.com',
    pass: 'tu_app_password_16_chars'
  }
});

transporter.sendMail({
  from: 'noreply@newzeland.es',
  to: 'tu_email@gmail.com',
  subject: 'Test Email',
  html: '<h1>Test Successful</h1>'
}, (err, info) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Email sent:', info.response);
  }
  process.exit(0);
});
EOF

# Ejecutar test
node test-email.js

# Borrar archivo
rm test-email.js
```

---

## PASO 7: CONFIGURAR STRIPE (OPTIONAL - 25 minutos)

### 7.1 Obtener Claves de Stripe

1. Ve a: https://dashboard.stripe.com/apikeys
2. Asegúrate de estar en modo **LIVE** (no Test)
3. Copia:
   - **Secret Key** (comienza con `sk_live_...`)
   - **Publishable Key** (comienza con `pk_live_...`)

### 7.2 Agregar a Vercel

En Vercel Dashboard → Environment Variables → Production:

```
STRIPE_SECRET: sk_live_51234567890abcdef...
STRIPE_PUBLIC: pk_live_1234567890abcdef...
```

### 7.3 Configurar Webhook de Stripe

1. Ve a: https://dashboard.stripe.com/webhooks
2. Click: **Add endpoint**
3. URL del endpoint:
   ```
   https://newzelland-ceramicas.vercel.app/api/stripe/webhook
   ```
4. Selecciona eventos:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Click: **Add endpoint**
6. Copia el **Signing secret** (`whsec_...`)
7. Agrega a Vercel:
   ```
   STRIPE_WEBHOOK_SECRET: whsec_...
   ```

---

## PASO 8: CONFIGURAR WHATSAPP (OPTIONAL - 25 minutos)

### 8.1 Obtener Token de WhatsApp

1. Ve a: https://developers.facebook.com
2. Login o crea cuenta
3. Create App → Select App Type → Business
4. Agrega "WhatsApp" product
5. En WhatsApp API → Settings:
   - Selecciona Business Account
   - Click: **Generate Token**
   - Copia el token (comienza con `EAAJU...`)

### 8.2 Obtener IDs de Teléfono

1. En WhatsApp API Dashboard → Getting Started
2. Busca: "Phone number ID"
3. Busca: "Business Account ID"
4. Guarda ambos valores

### 8.3 Agregar a Vercel

En Vercel Dashboard → Environment Variables → Production:

```
WHATSAPP_TOKEN: EAAJU...
WHATSAPP_PHONE_ID: 123456789...
WHATSAPP_BUSINESS_ACCOUNT_ID: ...
WHATSAPP_VERIFY_TOKEN: [token que generes]
```

### 8.4 Configurar Webhook

1. En Meta Dashboard → App Settings → Webhooks
2. Click: **Edit**
3. **Callback URL**:
   ```
   https://newzelland-ceramicas.vercel.app/api/whatsapp/webhook
   ```
4. **Verify Token**: [El WHATSAPP_VERIFY_TOKEN que generaste]
5. **Subscribe to webhooks**: Seleccionar eventos necesarios
6. Guardar

---

## PASO 9: VERIFICACIONES FINALES (15 minutos)

### 9.1 Health Check

```bash
# Verificar que API responde
curl https://newzelland-ceramicas.vercel.app/api/health

# Resultado esperado:
# {"status":"ok"}
```

### 9.2 Verificar Frontend

En navegador:
```
https://newzelland-ceramicas.vercel.app
```

Debe:
- Cargar sin errores
- Mostrar la página de inicio
- Botones funcionales

### 9.3 Verificar CORS

```bash
# Test CORS
curl -H "Origin: https://newzelland-ceramicas.vercel.app" \
     https://newzelland-ceramicas.vercel.app/api/products \
     -v

# Busca en response:
# Access-Control-Allow-Origin: https://newzelland-ceramicas.vercel.app
```

### 9.4 Verificar Headers de Seguridad

```bash
curl -I https://newzelland-ceramicas.vercel.app/api/health

# Debe mostrar:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
# Strict-Transport-Security: ...
```

### 9.5 Ver Logs de Vercel

```bash
vercel logs https://newzelland-ceramicas.vercel.app --follow

# Esperar a ver logs
# No deben haber errores 500
```

---

## PASO 10: DOCUMENTAR Y COMUNICAR (10 minutos)

### 10.1 Documentar Configuración

Crear archivo `PRODUCTION-CONFIG.md`:

```bash
cat > PRODUCTION-CONFIG.md << 'EOF'
# Production Configuration - Newzelland Cerámicas

## Database
- Provider: Vercel Postgres
- Host: [auto]
- Database: newzeland_ecommerce

## API Security
- JWT Expiration: 7 days
- Rate Limit: 100 requests per 15 minutes
- CORS: Whitelist only frontend

## Email Service
- Provider: Gmail SMTP
- Status: ✅ Configured

## Payments
- Provider: Stripe (LIVE)
- Status: ✅ Configured

## Notifications
- WhatsApp: ✅ Configured
- Webhook: https://newzelland-ceramicas.vercel.app/api/whatsapp/webhook

## Monitoring
- Health Check: /api/health
- Analytics: [configured]
- Logs: Vercel CLI
EOF
```

### 10.2 Crear Runbook de Emergencia

```bash
cat > EMERGENCY-RUNBOOK.md << 'EOF'
# Emergency Runbook - Newzelland Cerámicas

## API Down?
1. Check Vercel status: https://www.vercelstatus.com
2. View logs: `vercel logs https://newzelland-ceramicas.vercel.app --follow`
3. Check error: database connection? SSL? Rate limit?
4. Redeploy: `vercel --prod`

## Database Connection Failed?
1. Check DB credentials in Vercel Environment Variables
2. Verify DB is running and accessible
3. Test connection manually if possible
4. Check firewall rules

## Email Not Sending?
1. Check SMTP credentials in Vercel
2. Verify Gmail App Password (not regular password)
3. Check logs for SMTP errors
4. Test from Postman/curl

## Out of Memory?
1. Vercel serverless functions have 3GB memory
2. Reduce payload sizes
3. Stream large responses
4. Check for memory leaks

## Rollback
1. Get list: `vercel ls`
2. Find previous working deployment
3. Promote: `vercel promote [deployment-id] --prod`
EOF
```

### 10.3 Comunicar al Equipo

Enviar email:

```
Asunto: ✅ Newzelland Cerámicas - Ahora en Producción

Hola equipo,

El sitio newzelland-ceramicas está ahora activo en producción:

URL: https://newzelland-ceramicas.vercel.app
API: https://newzelland-ceramicas.vercel.app/api

Servicios configurados:
✅ PostgreSQL Database
✅ CORS/Security Headers
✅ Rate Limiting
✅ Email (SMTP)
✅ Stripe Payments
✅ WhatsApp Bot
✅ Health Monitoring

Para acceder a logs:
- CLI: vercel logs https://newzelland-ceramicas.vercel.app --follow
- Dashboard: https://vercel.com/dashboard/project/newzelland-ceramicas

Documentación:
- Setup: PRODUCTION-CHECKLIST-FINAL.md
- Emergency: EMERGENCY-RUNBOOK.md
- Ops: OPS-GUIDE.md

Contacto: ignacio@ifeval.es

¡Listo para recibir clientes!
```

---

## VERIFICACIÓN FINAL

### Checklist antes de considerar "COMPLETO"

```
SEGURIDAD
✅ CORS configurado
✅ Headers Helmet activos
✅ Rate limiting activo
✅ Variables de entorno protegidas
✅ JWT_SECRET seguro (32+ chars)
✅ No hay secretos en código

BASE DE DATOS
✅ Conexión exitosa
✅ Migraciones ejecutadas
✅ Pool de conexiones funciona

SERVICIOS
✅ SMTP configurado y testeado
✅ Stripe keys agregadas (si aplicable)
✅ WhatsApp webhook activo (si aplicable)

VERIFICACIONES
✅ /api/health responde
✅ Frontend carga sin errores
✅ CORS funciona
✅ Headers de seguridad presentes
✅ Logs se ven en Vercel

DOCUMENTACIÓN
✅ PRODUCTION-CHECKLIST-FINAL.md actualizado
✅ README.md actualizado
✅ EMERGENCY-RUNBOOK.md creado
✅ Equipo notificado
```

---

## SOPORTE

Si algo no funciona:

1. **Revisar logs**: `vercel logs https://newzelland-ceramicas.vercel.app`
2. **Verificar variables**: Vercel Dashboard → Environment Variables
3. **Buscar en docs**: README.md, OPS-GUIDE.md
4. **Preguntar**: ignacio@ifeval.es

---

**¡Felicidades! Tu aplicación está en producción** 🚀

*Documento: PRODUCTION-SETUP-STEPS.md*  
*Última actualización: 2026-07-08*
