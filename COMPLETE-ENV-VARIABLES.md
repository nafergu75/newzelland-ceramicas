# Lista Completa de Variables de Entorno - Newzelland Cerámicas
**Fecha:** 2026-07-08  
**Estado:** ✅ DOCUMENTADO

---

## Estructura de Archivos .env

### Archivo 1: `.env.production`
**Uso:** Variables públicas de producción  
**Ubicación:** Almacenar en Vercel Dashboard

```env
NODE_ENV=production
FRONTEND_URL=https://newzelland-ceramicas.vercel.app
API_URL=https://newzelland-ceramicas.vercel.app/api
JWT_EXPIRATION=7d
```

### Archivo 2: `.env.production.local`
**Uso:** Variables secretas locales (NO VERSIONAR)  
**Ubicación:** Git ignorado (.gitignore)  
**Vercel:** Cargar en Project Settings → Environment Variables

---

## CATEGORÍA 1: CORE APPLICATION

| Variable | Tipo | Ejemplo | Requerida | Descripción |
|----------|------|---------|-----------|-------------|
| NODE_ENV | String | production | ✅ SÍ | Ambiente de ejecución |
| PORT | Number | 3000 | ⚠️ OPCIONAL | Puerto del servidor (default: 3000) |
| FRONTEND_URL | String | https://newzelland-ceramicas.vercel.app | ✅ SÍ | URL del frontend para CORS |
| API_URL | String | https://newzelland-ceramicas.vercel.app/api | ✅ SÍ | URL base de API (para cliente) |
| JWT_EXPIRATION | String | 7d | ✅ SÍ | Duración del token JWT |

---

## CATEGORÍA 2: SECURITY (SECRETAS)

| Variable | Tipo | Ejemplo | Requerida | Instrucciones |
|----------|------|---------|-----------|---------------|
| JWT_SECRET | String (64 hex) | dcd4991b85a2f05a6f28813d2a48b0b1d302375042ff94f12e5b61d3aa5b74db | ✅ SÍ | **Generar:** `openssl rand -hex 32` o `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| ADMIN_TOKEN | String | admin_secure_token_12345 | ✅ SÍ | **Generar:** `openssl rand -base64 32` |

### Generar JWT_SECRET (Node.js)
```javascript
const crypto = require('crypto');
console.log(crypto.randomBytes(32).toString('hex'));
// Salida: dcd4991b85a2f05a6f28813d2a48b0b1d302375042ff94f12e5b61d3aa5b74db
```

---

## CATEGORÍA 3: DATABASE (PostgreSQL)

| Variable | Tipo | Ejemplo | Requerida | Instrucciones |
|----------|------|---------|-----------|---------------|
| DB_HOST | String | postgres.vercel-storage.com | ✅ SÍ | Host de Vercel Postgres |
| DB_PORT | Number | 5432 | ✅ SÍ | Puerto PostgreSQL (típicamente 5432) |
| DB_NAME | String | newzeland_ecommerce | ✅ SÍ | Nombre de la base de datos |
| DB_USER | String | postgres | ✅ SÍ | Usuario de PostgreSQL |
| DB_PASSWORD | String | secure_password_xyz | ✅ SÍ | Contraseña PostgreSQL |
| DATABASE_URL | String | postgresql://user:pass@host:5432/db | ⚠️ OPCIONAL | Alternativa unificada (Vercel Postgres) |

### Obtener credenciales en Vercel
1. Dashboard Vercel → Proyecto → Storage
2. Crear o seleccionar "Vercel Postgres"
3. Tab "Data" → "Project Variables"
4. Copiar: `DATABASE_URL` (contiene host, user, pass, db)

**Opción A - Usar DATABASE_URL (recomendado):**
```
DATABASE_URL=postgresql://default:xxxxxxxxxxxxxx@ep-cool-db-xxxxx.us-east-1.postgres.vercel-storage.com:5432/verceldb
```

**Opción B - Variables separadas:**
```
DB_HOST=ep-cool-db-xxxxx.us-east-1.postgres.vercel-storage.com
DB_PORT=5432
DB_NAME=verceldb
DB_USER=default
DB_PASSWORD=xxxxxxxxxxxxxx
```

---

## CATEGORÍA 4: EMAIL (SMTP)

| Variable | Tipo | Ejemplo | Requerida | Instrucciones |
|----------|------|---------|-----------|---------------|
| SMTP_HOST | String | smtp.gmail.com | ✅ SÍ | Servidor SMTP |
| SMTP_PORT | Number | 587 | ✅ SÍ | Puerto SMTP (587 para TLS) |
| SMTP_USER | String | info@newzeland.es | ✅ SÍ | Email de envío |
| SMTP_PASS | String | xxxx xxxx xxxx xxxx | ✅ SÍ | Contraseña o App Password |
| SMTP_FROM | String | noreply@newzeland.es | ✅ SÍ | Email remitente |

### Generar Gmail App Password (recomendado)
1. Gmail → Account Settings → Security
2. Buscar "App passwords" (requiere 2FA activado)
3. Generar password para "Mail" + "Windows Computer"
4. Copiar password de 16 caracteres: `xxxx xxxx xxxx xxxx`
5. Usar en SMTP_PASS (sin espacios): `xxxxxxxxxxxxxxxx`

**Alternativa - Gmail menos seguro (NO RECOMENDADO):**
```
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_contraseña_gmail
```

---

## CATEGORÍA 5: STRIPE (PAGOS - OPCIONAL)

| Variable | Tipo | Ejemplo | Requerida | Instrucciones |
|----------|------|---------|-----------|---------------|
| STRIPE_SECRET | String | sk_test_51... | ⚠️ OPCIONAL | Secret key privada de Stripe |
| STRIPE_PUBLIC | String | pk_test_51... | ⚠️ OPCIONAL | Public key de Stripe |
| STRIPE_WEBHOOK_SECRET | String | whsec_1... | ⚠️ OPCIONAL | Webhook signing secret |

### Obtener claves Stripe
1. Stripe Dashboard → Developers → API Keys
2. Copiar:
   - **Secret Key:** `sk_test_...` (desarrollo) o `sk_live_...` (producción)
   - **Publishable Key:** `pk_test_...` (desarrollo) o `pk_live_...` (producción)
3. Crear webhook:
   - Endpoint: `https://newzelland-ceramicas.vercel.app/api/checkout/webhook`
   - Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copiar signing secret

**Desarrollo (Test Keys):**
```
STRIPE_SECRET=sk_test_51234567890...
STRIPE_PUBLIC=pk_test_51234567890...
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

**Producción (Live Keys) - después:**
```
STRIPE_SECRET=sk_live_51234567890...
STRIPE_PUBLIC=pk_live_51234567890...
STRIPE_WEBHOOK_SECRET=whsec_live_...
```

---

## CATEGORÍA 6: WHATSAPP BOT (OPCIONAL)

| Variable | Tipo | Ejemplo | Requerida | Instrucciones |
|----------|------|---------|-----------|---------------|
| WHATSAPP_TOKEN | String | EAAxxxxxxxxxxxxxx | ⚠️ OPCIONAL | Access token de WhatsApp Business |
| WHATSAPP_PHONE_ID | String | 123456789012345 | ⚠️ OPCIONAL | ID del número de teléfono |
| WHATSAPP_BUSINESS_ACCOUNT_ID | String | 123456789012345 | ⚠️ OPCIONAL | ID de cuenta comercial |
| WHATSAPP_VERIFY_TOKEN | String | verify_token_abc123 | ⚠️ OPCIONAL | Token para verificar webhooks |

### Obtener credenciales WhatsApp
1. Meta Business → WhatsApp → API Setup
2. Generar token de acceso (válido por 60 días)
3. Copiar:
   - Access Token: `EAAxxxxxxxxxxxxxx`
   - Phone Number ID: Ver en cuenta comercial
   - Business Account ID: Ver en configuración
4. Generar verify token aleatorio para webhooks

**Webhook URL:**
```
https://newzelland-ceramicas.vercel.app/api/whatsapp/webhook
```

---

## CATEGORÍA 7: ANALYTICS (OPCIONAL)

| Variable | Tipo | Ejemplo | Requerida | Instrucciones |
|----------|------|---------|-----------|---------------|
| GOOGLE_ANALYTICS_ID | String | G-XXXXXXXXXX | ⚠️ OPCIONAL | Google Analytics 4 ID |
| SENTRY_DSN | String | https://xxx@sentry.io/xxx | ⚠️ OPCIONAL | Sentry error tracking |

---

## Resumen de Variables Necesarias

### Mínimo requerido para funcionar:
```env
# Core
NODE_ENV=production
FRONTEND_URL=https://newzelland-ceramicas.vercel.app
API_URL=https://newzelland-ceramicas.vercel.app/api
JWT_EXPIRATION=7d

# Security
JWT_SECRET=<generar con openssl>
ADMIN_TOKEN=<generar con openssl>

# Database
DB_HOST=<Vercel Postgres>
DB_PORT=5432
DB_NAME=<nombre DB>
DB_USER=<usuario>
DB_PASSWORD=<password>

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=info@newzeland.es
SMTP_PASS=<App Password>
SMTP_FROM=noreply@newzeland.es
```

### Variables opcionales:
```env
# Pagos
STRIPE_SECRET=<key>
STRIPE_PUBLIC=<key>
STRIPE_WEBHOOK_SECRET=<key>

# WhatsApp
WHATSAPP_TOKEN=<token>
WHATSAPP_PHONE_ID=<id>
WHATSAPP_BUSINESS_ACCOUNT_ID=<id>
WHATSAPP_VERIFY_TOKEN=<token>

# Analytics
GOOGLE_ANALYTICS_ID=<id>
SENTRY_DSN=<dsn>
```

---

## Próximo Paso: FASE 3
Ver documento: `VERCEL-ENV-VARIABLES.md`

**Acciones:**
1. Generar valores para JWT_SECRET y ADMIN_TOKEN
2. Conectar Vercel Postgres
3. Configurar Gmail App Password
4. Cargar variables en Vercel Dashboard
