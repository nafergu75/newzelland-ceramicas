# Configuración de Variables de Entorno en Vercel

## Ubicación en Vercel Dashboard

1. Ve a: https://vercel.com/dashboard
2. Selecciona el proyecto `newzelland-ceramicas`
3. Ve a **Settings → Environment Variables**
4. Agrega cada variable según el entorno

## Variables Requeridas para Vercel

### 1. Base de Datos PostgreSQL

```
DB_HOST=tu_host_postgresql
DB_PORT=5432
DB_NAME=newzeland_ecommerce
DB_USER=postgres_user
DB_PASSWORD=strong_password_here
```

**Opciones de BD:**
- Vercel Postgres (recomendado): Integración nativa
- Heroku Postgres: Legacy pero funciona
- AWS RDS: Para producción escalada
- Supabase: PostgreSQL managed + realtime

### 2. Seguridad y JWT

```
JWT_SECRET=tu_secreto_generado_32_caracteres_minimo_CAMBIA_ESTO
JWT_EXPIRATION=7d
```

**Generar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Stripe (Pagos)

Obtén desde: https://dashboard.stripe.com/apikeys

```
STRIPE_SECRET=sk_live_... (clave secreta)
STRIPE_PUBLIC=pk_live_... (clave pública - visible en cliente)
```

### 4. WhatsApp Bot

Obtén desde: https://developers.facebook.com/docs/whatsapp/cloud-api

```
WHATSAPP_TOKEN=EAAJU... (token de acceso)
WHATSAPP_PHONE_ID=12345... (ID de teléfono)
WHATSAPP_BUSINESS_ACCOUNT_ID=...
```

### 5. Email (SMTP)

**Con Gmail:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=app_password_16_caracteres (NO contraseña normal)
SMTP_FROM=noreply@newzeland.es
```

**Generar App Password en Gmail:**
1. Ve a https://myaccount.google.com/security
2. Activa 2FA
3. Ve a App passwords
4. Selecciona Mail + Windows/Mac
5. Copia el password de 16 caracteres

### 6. URLs de Aplicación

```
NODE_ENV=production
FRONTEND_URL=https://newzelland-ceramicas.vercel.app
API_URL=https://newzelland-ceramicas.vercel.app/api
```

## Pasos para Configurar en Vercel

### Opción 1: Dashboard Manual

1. Ve a Settings → Environment Variables
2. Selecciona "Production" en el dropdown
3. Copia cada variable del `backend/.env.example`
4. Pega el valor (sin comentarios)
5. Click en "Save"
6. Redeploy después de agregar las variables

### Opción 2: Vercel CLI (Automatizado)

```bash
# Login
vercel login

# Configurar variable individual
vercel env add DB_HOST
vercel env add DB_PORT
vercel env add DB_NAME
vercel env add DB_USER
vercel env add DB_PASSWORD
vercel env add JWT_SECRET
vercel env add STRIPE_SECRET
vercel env add STRIPE_PUBLIC
vercel env add WHATSAPP_TOKEN
vercel env add SMTP_HOST
vercel env add SMTP_PORT
vercel env add SMTP_USER
vercel env add SMTP_PASS
vercel env add SMTP_FROM

# Verificar variables
vercel env list
```

## Orden Recomendado de Configuración

1. **Primero**: Base de datos (sin esto no funciona nada)
2. **Segundo**: JWT_SECRET (seguridad)
3. **Tercero**: Email SMTP (notificaciones)
4. **Cuarto**: Stripe (pagos)
5. **Quinto**: WhatsApp (bot)

## Verificación Post-Deploy

Después de agregar las variables:

```bash
# Redeploy con variables nuevas
vercel --prod

# Verificar salud de la API
curl https://newzelland-ceramicas.vercel.app/api/health

# Debe responder:
# {"status":"ok","timestamp":"2026-07-08T..."}
```

## Secretos NO deben estar en .env local

El archivo `.env` local (en git) solo debe tener:
```
NODE_ENV=development
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
```

Todos los secretos (passwords, tokens, keys) van SOLO en Vercel Dashboard.

## Rollback de Variables

Si algo sale mal:
1. Ve a Settings → Environment Variables
2. Edita la variable problemática
3. O elimina y reagrega
4. Vercel automáticamente redeploy en Prod

## Monitoreo

Usa Vercel Analytics para verificar:
- https://vercel.com/dashboard/project/newzelland-ceramicas/monitoring

Busca errores de:
- Conexión a BD (DB connection error)
- JWT malformado (invalid token)
- Fallos SMTP (email not sent)
