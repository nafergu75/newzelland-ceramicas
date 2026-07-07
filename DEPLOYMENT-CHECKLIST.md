# Deployment Checklist - Newzeland Cerámicas

## FASE 1 - Preparar Estructura ✅

- [x] Backend API (serverless function)
  - [x] `backend/api/index.js` configurado
  - [x] Rutas de API definidas
  - [x] CORS habilitado
  - [x] Express app exportado para Vercel

- [x] Frontend (React + Vite)
  - [x] `frontend/dist/` generado
  - [x] SPA con index.html fallback
  - [x] Assets bundleados
  - [x] TypeScript compilado

- [x] Configuración Vercel
  - [x] `vercel.json` creado
  - [x] Build commands definidos
  - [x] Routes configuradas
  - [x] Environment variables template

## FASE 2 - Setup BD y Variables ✅

- [x] Documentación de Variables
  - [x] `backend/.env.example` actualizado
  - [x] `frontend/.env.example` actualizado
  - [x] VERCEL-ENV-SETUP.md creado
  - [x] DATABASE-SETUP.md creado

- [x] Guía de Configuración
  - [x] Instrucciones Vercel Dashboard
  - [x] Instrucciones Vercel CLI
  - [x] Cómo generar secretos seguros
  - [x] Configuración de servicios (Stripe, WhatsApp, SMTP)

- [x] Arquitectura de BD
  - [x] 3 opciones (PostgreSQL, Vercel Postgres, Supabase)
  - [x] Estructura de tablas SQL
  - [x] Troubleshooting

## FASE 3 - Testing Local ✅

- [x] Instalar dependencias
  - [x] `npm install` en backend
  - [x] `npm install` en frontend
  - [x] Vulnerabilidades identificadas (aceptables)

- [x] Build verificado
  - [x] Frontend compila sin errores
  - [x] TypeScript sin warnings
  - [x] Assets generados correctamente
  - [x] `frontend/dist/` creado

- [x] Test Suite Local
  - [x] 6 tests automatizados
  - [x] Todos pasan ✓
  - [x] Estructura verificada
  - [x] Configuración validada

## FASE 4 - Deploy a Vercel (EN PROGRESO)

### Pre-Deploy Checklist

- [x] Vercel CLI instalado
  - [x] `vercel --version` funciona
  - [x] v54.21.1 activo

- [ ] Git prep
  - [ ] Todos los cambios en git
  - [ ] `git status` limpio
  - [ ] Últimas FASE 3 committeadas

- [ ] Vercel account
  - [ ] Cuenta de Vercel creada
  - [ ] Email verificado
  - [ ] GitHub repo opcional (recomendado)

- [ ] Documentación lista
  - [x] VERCEL-DEPLOY-GUIDE.md creado
  - [x] Instrucciones claras para login
  - [x] Opciones de deploy explicadas

### Deploy Steps

- [ ] Step 1: `git push origin master`
- [ ] Step 2: `vercel login` (o usar GitHub)
- [ ] Step 3: `vercel --prod`
- [ ] Step 4: Esperar por build (2-5 min)
- [ ] Step 5: Verificar URL asignada

### Post-Deploy

- [ ] Verificar `/api/health` devuelve JSON
- [ ] Verificar `/` devuelve HTML
- [ ] Verificar assets cargan correctamente
- [ ] Verificar no hay errores en logs

- [ ] Agregar variables de entorno
  - [ ] DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
  - [ ] JWT_SECRET
  - [ ] STRIPE_SECRET, STRIPE_PUBLIC
  - [ ] WHATSAPP_TOKEN
  - [ ] SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM

- [ ] Redeploy con variables
  - [ ] `vercel --prod`
  - [ ] Esperar por nuevo build
  - [ ] Verificar variables cargadas

## FASE 5 - Verificación Final

- [ ] Verificar endpoint `/api/health`
- [ ] Verificar SPA `/` y rutas internas
- [ ] Verificar assets (CSS, JS, images)
- [ ] Test de checkout (sin pago real)
- [ ] Test de formulario contacto
- [ ] Test de WhatsApp webhook
- [ ] Crear guía final de ops

## Variables de Entorno Requeridas

En Vercel Dashboard > Settings > Environment Variables:

### Database
```
DB_HOST=
DB_PORT=5432
DB_NAME=
DB_USER=
DB_PASSWORD=
```

### Security
```
JWT_SECRET=
JWT_EXPIRATION=7d
```

### Payments
```
STRIPE_SECRET=sk_live_...
STRIPE_PUBLIC=pk_live_...
```

### WhatsApp
```
WHATSAPP_TOKEN=
WHATSAPP_PHONE_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
```

### Email
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@newzeland.es
```

### Application
```
NODE_ENV=production
FRONTEND_URL=https://newzelland-ceramicas.vercel.app
API_URL=https://newzelland-ceramicas.vercel.app/api
```

## Archivos Generados

### Estructura
```
newzelland-ceramicas/
├── backend/
│   ├── api/
│   │   └── index.js (serverless function)
│   ├── src/
│   └── package.json
├── frontend/
│   ├── dist/ (generated after build)
│   ├── src/
│   └── package.json
├── vercel.json (deployment config)
├── .env.production (local prod config)
└── DEPLOYMENT-PLAN.md (this doc)
```

### Documentación Generada
```
DEPLOYMENT-PLAN.md (este documento)
DEPLOYMENT-CHECKLIST.md (checklist)
DATABASE-SETUP.md (BD setup - 3 opciones)
VERCEL-ENV-SETUP.md (variables de entorno)
VERCEL-DEPLOY-GUIDE.md (guía de deploy)
test-local.sh (tests automatizados)
```

## URLs Esperadas

```
Vercel Project: https://vercel.com/dashboard/project/newzelland-ceramicas
Production URL: https://newzelland-ceramicas.vercel.app
API Health: https://newzelland-ceramicas.vercel.app/api/health
Frontend: https://newzelland-ceramicas.vercel.app/
```

## Troubleshooting

### Build Fails
1. Ver logs: `vercel logs --follow`
2. Probar build local: `npm run build --prefix frontend`
3. Verificar deps: `npm install` en ambas carpetas

### Variables No Se Cargan
1. Ir a Vercel Dashboard → Settings → Environment Variables
2. Verificar que están en "Production"
3. Redeploy: `vercel --prod`

### API Returns 500 Error
1. Variables de entorno no cargadas
2. Base de datos no accesible
3. Ver logs: `vercel logs`

### Frontend Assets 404
1. Verificar que `frontend/dist/` se creó
2. Verificar paths en vercel.json
3. Probar build local

## Rollback

Si algo sale mal:
```bash
# Ver histórico
vercel ls

# Revertir a versión anterior
vercel promote <deployment_id> --prod
```

---

**Actualizado**: 2026-07-08
**Estado**: Checklist para FASE 4 en progreso
**Próximo**: Completar deploy y pasar a FASE 5
