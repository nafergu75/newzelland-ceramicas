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

## FASE 2 - Setup BD y Variables de Entorno ✅ COMPLETADA

### Cambios realizados:

#### 1. Documentación de Variables
- **Archivo**: `backend/.env.example` - Actualizado con todas las variables requeridas
- **Archivo**: `frontend/.env.example` - Configuración de Vite + API URL
- Incluye comentarios para cada sección

#### 2. Guía de Configuración Vercel
- **Archivo**: `VERCEL-ENV-SETUP.md`
- Instrucciones paso a paso para Vercel Dashboard
- Guía de setup con Vercel CLI
- Cómo generar secretos seguros
- Instrucciones para Stripe, WhatsApp, SMTP
- Verificación post-deploy

#### 3. Guía de Setup de Base de Datos
- **Archivo**: `DATABASE-SETUP.md`
- 3 opciones:
  1. PostgreSQL Local (desarrollo)
  2. Vercel Postgres (producción managed)
  3. Supabase (PostgreSQL + extras)
- Comandos SQL de setup
- Estructura de tablas (users, orders, order_items)
- Troubleshooting

#### 4. Próximos pasos:
1. Elegir opción de BD (local vs cloud)
2. Crear la BD siguiendo DATABASE-SETUP.md
3. Copiar variables a .env local
4. Agregar variables a Vercel Dashboard (VERCEL-ENV-SETUP.md)

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
