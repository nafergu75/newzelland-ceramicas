# Plan de Deployment a Vercel - Newzeland Cerámicas

## FASE 1 - Preparar Estructura ✅ COMPLETADA

### Cambios realizados:

#### 1. Backend API (serverless function)
- **Archivo**: `backend/api/index.js`
- Configurado como serverless function compatible con Vercel
- Rutas disponibles:
  - `GET /api/health` - Health check
  - `POST /api/checkout` - Procesar pagos (Stripe)
  - `POST /api/whatsapp` - Webhook WhatsApp
  - `GET /api/products` - Catálogo de productos
  - `GET /api/orders/:id` - Estado de pedidos
  - `POST /api/contact` - Formulario de contacto

#### 2. Configuración Vercel (`vercel.json`)
- Version: 2
- Build command: compila backend y frontend
- Install command: instala deps en ambos
- Rutas configuradas:
  - `/api/*` → `backend/api/index.js` (serverless)
  - `/assets/*` → `frontend/dist/assets/` (estáticos)
  - `/*.*` → `frontend/dist/` (archivos con extensión)
  - `/*` → `frontend/dist/index.html` (SPA fallback)

#### 3. Build Scripts
- Backend: `npm run build` - Ready para Vercel
- Frontend: `npm run build` - Vite genera `dist/`

#### 4. Variables de Entorno (en vercel.json)
```
DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
JWT_SECRET, JWT_EXPIRATION
STRIPE_SECRET, STRIPE_PUBLIC
WHATSAPP_TOKEN
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
NODE_ENV=production
```

#### 5. Archivos creados
- `.env.production` - Configuración para producción

## FASE 2 - Setup BD y Variables de Entorno

### Pendiente:
1. Conectar base de datos PostgreSQL
2. Configurar variables en Vercel Dashboard
3. Generar JWT_SECRET seguro
4. Configurar Stripe keys
5. Configurar SMTP credentials

## FASE 3 - Probar Localmente

### Pendiente:
1. Instalar deps: `npm install` en ambas carpetas
2. Build frontend: `npm run build --prefix frontend`
3. Test en localhost:3000

## FASE 4 - Deploy a Vercel

### Pendiente:
1. `vercel login`
2. `vercel --prod`
3. Configurar variables en Vercel
4. Verificar deployment

## FASE 5 - Verificación Final

### Pendiente:
1. Verificar `/api/health`
2. Verificar assets y SPA
3. Probar contacto y checkout
4. Crear guía final

---

**Estado**: FASE 1 completada
**Fecha**: 2026-07-08
**Próximo paso**: FASE 2 - Setup BD y variables
