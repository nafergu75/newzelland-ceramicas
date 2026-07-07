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

## FASE 3 - Probar Localmente ✅ COMPLETADA

### Cambios realizados:

#### 1. Instalar dependencias
- Backend: `npm install` completado ✓
- Frontend: `npm install` completado ✓

#### 2. Arreglar TypeScript
- Simplificar tsconfig.json (remover composite references)
- Agregar types: vite/client
- Frontend build: `npm run build` exitoso ✓

#### 3. Build Frontend
- Frontend compilado a `frontend/dist/`
- Assets generados: index.html + JS + CSS
- Estructura lista para Vercel

#### 4. Test Suite Local
- Archivo: `test-local.sh`
- 6 tests automatizados:
  1. Verificar estructura carpetas
  2. Verificar backend API exports
  3. Verificar frontend dist
  4. Verificar vercel.json
  5. Verificar archivos .env
  6. Verificar documentación
- Resultado: ✓ All tests passed

#### 5. Verificación:
```
✓ backend/api/index.js - exports correctly
✓ frontend/dist/ - built successfully
✓ vercel.json - properly configured
✓ Env files - setup complete
✓ Documentation - complete
```

## FASE 4 - Deploy a Vercel ⏳ LISTA PARA DEPLOY

### Cambios realizados:

#### 1. Vercel CLI
- [x] Instalado globalmente: v54.21.1
- [x] Verificado: `vercel --version`

#### 2. Guía de Deploy
- **Archivo**: `VERCEL-DEPLOY-GUIDE.md`
- Opción 1: Deploy vía GitHub (recomendado)
  - Push a repo
  - Conectar en Vercel Dashboard
  - Vercel automáticamente deploya
- Opción 2: Deploy vía Vercel CLI
  - `vercel login`
  - `vercel --prod`
  - Deploy manual
- Opción 3: Vercel API token (para CI/CD)

#### 3. Checklist de Deploy
- **Archivo**: `DEPLOYMENT-CHECKLIST.md`
- Pre-deploy checklist
- Variables de entorno requeridas
- Troubleshooting guide
- URLs esperadas

#### 4. Próximos pasos manuales:
Para completar FASE 4, ejecutar:

**Opción A: GitHub (Recomendado)**
```bash
git push origin master
# Ir a https://vercel.com/dashboard
# Conectar repo newzelland-ceramicas
# Vercel automáticamente deploya
```

**Opción B: Vercel CLI**
```bash
vercel login
vercel --prod
```

#### 5. URL esperada:
```
https://newzelland-ceramicas.vercel.app
https://newzelland-ceramicas.vercel.app/api/health
```

## FASE 5 - Verificación Final

### Pendiente:
1. Verificar `/api/health`
2. Verificar assets y SPA
3. Probar contacto y checkout
4. Crear guía final

---

**Estado**: FASE 4 lista para deploy manual
**Fecha**: 2026-07-08
**Próximo paso**: FASE 4 Deploy (manual con vercel CLI o GitHub)
**Luego**: FASE 5 - Verificación final
