# Guía de Configuración de Credenciales Reales - Newzelland Cerámicas
**Fecha:** 2026-07-08  
**Documento:** Paso a paso para obtener y configurar credenciales reales

---

## ⚠️ IMPORTANTE

**NO usar placeholders en producción**

Todos los valores placeholder en este documento deben ser reemplazados con credenciales reales antes de hacer push a Vercel.

---

## PASO 1: Generar JWT_SECRET y ADMIN_TOKEN

### JWT_SECRET (Clave de firma de tokens)

**¿Qué es?** Contraseña maestra para firmar tokens JWT de sesión

**¿Cuándo cambiar?** Cada 6-12 meses o si existe violación de seguridad

**Cómo generar:**

#### Opción A - OpenSSL (recomendado)
```bash
openssl rand -hex 32
# Salida ejemplo: 
# 5f8a3c2b9e1d4f7a6b2c8e5d1f9a3b2c7e4a9f5d8b1c3e6f9a2d5b8c1e4f7
```

#### Opción B - Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Salida: 5f8a3c2b9e1d4f7a6b2c8e5d1f9a3b2c7e4a9f5d8b1c3e6f9a2d5b8c1e4f7
```

#### Opción C - Online (NO en producción)
https://www.random.org/bytes/
- Generador de 32 bytes
- Convertir a hexadecimal

**Guardar en:** Vercel Environment Variables como `JWT_SECRET`

### ADMIN_TOKEN (Token de acceso administrativo)

**¿Qué es?** Contraseña para endpoints administrativos (migraciones, etc.)

**Cómo generar:**

```bash
openssl rand -base64 32
# Salida ejemplo:
# kL9vM2pQ5wX1yZ3aB4cD6eF8gH0jK2lM4nO6pQ8rS=
```

O en Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Guardar en:** Vercel Environment Variables como `ADMIN_TOKEN`

---

## PASO 2: Vercel Postgres (Base de Datos)

### Crear BD en Vercel

1. **Vercel Dashboard** → Proyecto `newzelland-ceramicas`
2. Ir a tab **Storage** (Almacenamiento)
3. Click **Create Database**
4. Seleccionar **Postgres**
5. **Database Name:** `newzelland_ecommerce` (o dejar default)
6. **Region:** US-East o más cercana a España
7. Click **Create**

**Esperar 1-2 minutos...**

### Copiar credenciales

Una vez creada la BD:

1. Click en la base de datos
2. Tab **.env.local** → Copiar todo:
   ```
   POSTGRES_PRISMA_URL=postgresql://default:xxxxx@ep-cool-db-xxxxx.us-east-1.postgres.vercel-storage.com:5432/verceldb
   POSTGRES_URL_NON_POOLING=postgresql://default:xxxxx@ep-cool-db-xxxxx.us-east-1.postgres.vercel-storage.com:5432/verceldb
   ```

3. O desde tab **Data** → copiar manualmente:
   - **DB_HOST:** `ep-cool-db-xxxxx.us-east-1.postgres.vercel-storage.com`
   - **DB_PORT:** `5432`
   - **DB_NAME:** `verceldb`
   - **DB_USER:** `default`
   - **DB_PASSWORD:** `xxxxx` (copiar de .env.local)

### Cargar en Vercel

**Settings** → **Environment Variables** → Agregar 5 variables:

```
DB_HOST = ep-cool-db-xxxxx.us-east-1.postgres.vercel-storage.com
DB_PORT = 5432
DB_NAME = verceldb
DB_USER = default
DB_PASSWORD = <contraseña de Vercel Postgres>
```

### Ejecutar migraciones

```bash
cd "C:\Users\NACHO PC\Desktop\newzelland-ceramicas"
cd backend
npm install
npm run migrate

# Salida esperada:
# ✓ Migrations ejecutadas correctamente
```

---

## PASO 3: Gmail SMTP (Email)

### Preparar cuenta Gmail

**Requisitos:**
- Cuenta Gmail activa (info@newzeland.es o similar)
- 2FA (verificación de dos factores) ACTIVADO

### Activar 2FA

1. Ir a https://myaccount.google.com/
2. Menú izquierdo → **Security** (Seguridad)
3. Buscar **2-Step Verification**
4. Click y completar (necesitarás teléfono)
5. Verificado ✅

### Generar App Password

1. Volver a https://myaccount.google.com/
2. **Security** → Bajar hasta **Your devices**
3. Click **2-Step Verification** (para confirmar que existe)
4. Volver arriba → Buscar **App passwords**
5. Seleccionar:
   - **Select the app:** Mail
   - **Select the device:** Windows Computer (o tu SO)
6. Google genera password de 16 caracteres
7. **Copiar exactamente** (sin espacios)

**Ejemplo:** `abcdefghijklmnop`

### Cargar en Vercel

**Settings** → **Environment Variables** → Agregar 5 variables:

```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = info@newzeland.es
SMTP_PASS = <App Password 16 caracteres, sin espacios>
SMTP_FROM = noreply@newzeland.es
```

### Test local (opcional)

```bash
cd backend
npm run dev

# Registrarse:
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "tu-email@example.com",
    "password": "SecurePass123",
    "province": "Valencia"
  }'

# Revisar bandeja de entrada para email de verificación
```

---

## PASO 4: Stripe (Pagos Opcionales)

### Crear cuenta Stripe

1. Ir a https://stripe.com/es
2. Click **Comenzar**
3. Registrarse:
   - Empresa: Newzelland Cerámicas SL
   - País: España
   - Industria: Retail/Commerce
4. Verificar email

### Obtener Test Keys

1. Dashboard Stripe → **Developers** → **API Keys**
2. Verificar que es **Test mode** (botón arriba)
3. Copiar:
   - **Publishable key:** `pk_test_51xxxxx...`
   - **Secret key:** `sk_test_51xxxxx...`

### Crear Webhook

1. **Developers** → **Webhooks**
2. **Add endpoint**
3. **Endpoint URL:** `https://newzelland-ceramicas.vercel.app/api/checkout/webhook`
4. Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Click **Add endpoint**
6. Copiar **Signing secret:** `whsec_test_xxxxx`

### Cargar en Vercel (OPCIONAL)

```
STRIPE_PUBLIC = pk_test_51xxxxx...
STRIPE_SECRET = sk_test_51xxxxx...
STRIPE_WEBHOOK_SECRET = whsec_test_xxxxx
```

**Nota:** Pueden agregarse después. Por ahora, dejar como placeholders.

---

## PASO 5: WhatsApp (Bot Automático - Opcional)

### Crear cuenta Meta Business

1. Ir a https://business.facebook.com/
2. Crear o acceder a cuenta empresarial
3. **My Apps** → **Create App**
4. Type: Business
5. Nombre: Newzelland Ceramicas
6. Siguiente

### Configurar WhatsApp

1. **Products** → Buscar **WhatsApp**
2. Click **Set up**
3. **Create new account**
4. Ingresar:
   - **Business Name:** Newzelland Cerámicas
   - **Phone Number:** +34 xxx xxx xxx (número empresa)
   - **Timezone:** Europe/Madrid

### Obtener credenciales

1. **WhatsApp** → **API Setup**
2. Copiar:
   - **Phone Number ID:** `123456789012345`
   - **Business Account ID:** `123456789012345`
3. **Settings** → **API Credentials**
4. Generar **Access Token**
5. Copiar token: `EAAxxxxxxxxxxxx`

### Verificar token

Meta enviará SMS a tu número. Ingresar código verificador.

### Crear Webhook

1. **Configuration** → **Webhook URL**
2. URL: `https://newzelland-ceramicas.vercel.app/api/whatsapp/webhook`
3. **Verify Token:** `verify_token_abc123def456` (generar aleatorio)
4. **Save**

### Cargar en Vercel (OPCIONAL)

```
WHATSAPP_TOKEN = EAAxxxxxxxxxxxx
WHATSAPP_PHONE_ID = 123456789012345
WHATSAPP_BUSINESS_ACCOUNT_ID = 123456789012345
WHATSAPP_VERIFY_TOKEN = verify_token_abc123def456
```

---

## RESUMEN DE VARIABLES A CARGAR

### Obligatorias (REQUIERE AHORA)

```
NODE_ENV = production
FRONTEND_URL = https://newzelland-ceramicas.vercel.app
API_URL = https://newzelland-ceramicas.vercel.app/api
JWT_EXPIRATION = 7d

JWT_SECRET = <generar con openssl>
ADMIN_TOKEN = <generar con openssl>

DB_HOST = <Vercel Postgres>
DB_PORT = 5432
DB_NAME = <nombre BD>
DB_USER = <usuario>
DB_PASSWORD = <password>

SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = info@newzeland.es
SMTP_PASS = <App Password>
SMTP_FROM = noreply@newzeland.es
```

### Opcionales (PUEDE AGREGAR DESPUÉS)

```
STRIPE_PUBLIC = sk_test_...
STRIPE_SECRET = sk_test_...
STRIPE_WEBHOOK_SECRET = whsec_test_...

WHATSAPP_TOKEN = EAA...
WHATSAPP_PHONE_ID = 123...
WHATSAPP_BUSINESS_ACCOUNT_ID = 123...
WHATSAPP_VERIFY_TOKEN = verify_...
```

---

## VERIFICACIÓN FINAL

Antes de hacer push a producción:

### Checklist

- [ ] JWT_SECRET generado (64 hex characters)
- [ ] ADMIN_TOKEN generado (32 base64 characters)
- [ ] Vercel Postgres creada y credenciales copiadas
- [ ] Migraciones ejecutadas (`npm run migrate`)
- [ ] Gmail App Password generado (2FA activo)
- [ ] 16 variables cargadas en Vercel Dashboard
- [ ] Deploy completado (status verde)
- [ ] GET /health responde 200 OK
- [ ] GET /api/products responde 200 OK
- [ ] Registro de usuario funciona

### Test Request

```bash
# 1. Verificar health
curl https://newzelland-ceramicas.vercel.app/health
# Esperado: {"status":"ok"}

# 2. Listar productos
curl https://newzelland-ceramicas.vercel.app/api/products
# Esperado: {"products":[...],"total":5}

# 3. Registrarse
curl -X POST https://newzelland-ceramicas.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "SecurePass123",
    "province": "Valencia"
  }'
# Esperado: 201 Created
```

---

## Próximo Paso

Cuando todas las credenciales estén configuradas:

```bash
# En la raíz del proyecto
git add .
git commit -m "chore: Production credentials configured - ready for deployment"
git push origin master

# Vercel automáticamente:
# 1. Detecta el push
# 2. Corre npm run build
# 3. Compila TypeScript
# 4. Deploy automático
```

---

**¡Listo! Tu aplicación está en producción.**

Para cambios después:
1. Editar código localmente
2. `git push`
3. Vercel redeploy automático

Para cambiar variables después:
1. Vercel Dashboard → Settings → Environment Variables
2. Editar y guardar
3. Vercel redeploy automático

---

**Soporte:** Ver archivos de troubleshooting en la carpeta raíz
