# Guía: Cargar Variables en Vercel Dashboard
**Fecha:** 2026-07-08  
**Proyecto:** newzelland-ceramicas  
**URL:** https://vercel.com/dashboard

---

## PASO 1: Acceder a Vercel Dashboard

1. Ir a https://vercel.com/dashboard
2. Seleccionar proyecto **newzelland-ceramicas**
3. Ir a pestaña **Settings** (Configuración)
4. En el menú izquierdo, click en **Environment Variables**

---

## PASO 2: Generar valores secretos

**ANTES de cargar en Vercel, generar estos valores localmente:**

### Generar JWT_SECRET
En terminal (Mac/Linux):
```bash
openssl rand -hex 32
# Ejemplo: dcd4991b85a2f05a6f28813d2a48b0b1d302375042ff94f12e5b61d3aa5b74db
```

En PowerShell (Windows):
```powershell
[System.Convert]::ToHexString([byte[]](1..32 | ForEach-Object { Get-Random -Maximum 256 }))
# O usar online: https://www.random.org/hex-to-dec/
```

En Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Generar ADMIN_TOKEN
```bash
openssl rand -base64 32
# Ejemplo: kL9vM2pQ5wX1yZ3aB4cD6eF8gH0jK2lM4nO6pQ8rS
```

---

## PASO 3: Obtener credenciales de Vercel Postgres

1. En Vercel Dashboard → Tab **Storage**
2. Buscar o crear **Vercel Postgres**
3. Click en la base de datos
4. Tab **.env.local** → Copiar bloque:
   ```
   POSTGRES_PRISMA_URL=postgresql://...
   POSTGRES_URL_NON_POOLING=postgresql://...
   ```
   
   O desde tab **Data** → Copiar manualmente:
   - `DATABASE_URL`
   - `DB_HOST`
   - `DB_PORT` (5432)
   - `DB_NAME`
   - `DB_USER`
   - `DB_PASSWORD`

---

## PASO 4: Obtener Gmail App Password

1. Ir a https://myaccount.google.com/
2. Menú izquierdo → **Security** (Seguridad)
3. Buscar "App passwords" (requiere 2FA activado)
4. Seleccionar:
   - App: **Mail**
   - Device: **Windows Computer** (o tu SO)
5. Google genera contraseña de 16 caracteres
6. Copiar (sin espacios): `xxxxxxxxxxxxxxxx`

---

## PASO 5: Cargar variables en Vercel

En **Settings → Environment Variables**, agregar cada variable:

### Variables Públicas (Production)

| Clave | Valor | Ambientes |
|-------|-------|-----------|
| NODE_ENV | production | Production |
| FRONTEND_URL | https://newzelland-ceramicas.vercel.app | Production |
| API_URL | https://newzelland-ceramicas.vercel.app/api | Production |
| JWT_EXPIRATION | 7d | Production |

### Variables Secretas (Production + Development)

| Clave | Valor | Ambientes | Notas |
|-------|-------|-----------|-------|
| JWT_SECRET | `<generar con openssl>` | All | 64 caracteres hex |
| ADMIN_TOKEN | `<generar con openssl>` | All | 32 caracteres base64 |
| DB_HOST | `ep-cool-db-xxxxx.us-east-1.postgres.vercel-storage.com` | All | De Vercel Postgres |
| DB_PORT | 5432 | All | |
| DB_NAME | verceldb (o nombre) | All | De Vercel Postgres |
| DB_USER | default (o usuario) | All | De Vercel Postgres |
| DB_PASSWORD | `<contraseña Vercel Postgres>` | All | De Vercel Postgres |
| SMTP_HOST | smtp.gmail.com | All | |
| SMTP_PORT | 587 | All | |
| SMTP_USER | info@newzeland.es | All | Email para enviar |
| SMTP_PASS | `<Gmail App Password>` | All | Sin espacios |
| SMTP_FROM | noreply@newzeland.es | All | Email remitente |

### Variables Opcionales (si usas)

| Clave | Valor | Ambientes | Notas |
|-------|-------|-----------|-------|
| STRIPE_SECRET | sk_test_... | Production | De Stripe Dashboard |
| STRIPE_PUBLIC | pk_test_... | Production | De Stripe Dashboard |
| STRIPE_WEBHOOK_SECRET | whsec_... | Production | De Stripe Webhooks |
| WHATSAPP_TOKEN | EAA... | Production | De Meta Business |
| WHATSAPP_PHONE_ID | 123... | Production | |
| WHATSAPP_BUSINESS_ACCOUNT_ID | 123... | Production | |
| WHATSAPP_VERIFY_TOKEN | verify_... | Production | Generar aleatorio |

---

## PASO 6: Verificar en Vercel

1. Después de cargar cada variable, click **Save** (Guardar)
2. Vercel automáticamente redeploy el proyecto
3. Esperar a que se complete el deploy (verde ✓)
4. Ver logs en **Deployments** → últimas lineas

---

## PASO 7: Verificar conexión a BD

Ejecutar endpoint de health check:
```bash
curl https://newzelland-ceramicas.vercel.app/health
# Respuesta esperada: { "status": "ok" }
```

Si hay error, ver logs:
- Vercel Dashboard → **Deployments** → últimos logs
- O ejecutar localmente: `npm run dev`

---

## Checklist Final

- [ ] JWT_SECRET generado (64 hex)
- [ ] ADMIN_TOKEN generado (32 base64)
- [ ] Vercel Postgres conectado
- [ ] DB_HOST, DB_USER, DB_PASSWORD copiados
- [ ] Gmail App Password generado
- [ ] SMTP_PASS configurado (sin espacios)
- [ ] Todas las variables cargadas en Vercel
- [ ] Deploy completado (estado verde)
- [ ] GET /health retorna status ok
- [ ] GET /api/products retorna productos

---

## Troubleshooting

### Error: "Cannot find module 'pg'"
```
Solución: Vercel debe ejecutar "npm install" en el build
```

### Error: "Database connection failed"
```
Verificar:
1. DATABASE_URL está cargada en Vercel
2. IP de Vercel está whitelisteada en Postgres
3. Credenciales son correctas (copiar tal cual)
```

### Error: "Email sending failed"
```
Verificar:
1. SMTP_PASS es App Password (no contraseña de Gmail)
2. SMTP_USER es correo válido de Gmail
3. 2FA está activado en Gmail
```

### Deploy stalled / no progress
```
Solución:
1. Vercel Dashboard → Deployments
2. Click en último deploy fallido
3. Ver logs para identificar error
4. Hacer git push nuevamente después de fix
```

---

## Próximo Paso: FASE 3
Ejecutar: `npm run deploy` o push a GitHub para triggerear Vercel build

**URLs finales:**
- 🌐 Frontend: https://newzelland-ceramicas.vercel.app
- 🔌 API: https://newzelland-ceramicas.vercel.app/api
- 📊 Health: https://newzelland-ceramicas.vercel.app/health
