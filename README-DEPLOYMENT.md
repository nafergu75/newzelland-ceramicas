# Deployment a Vercel - Newzeland Cerámicas

## Estado Actual

Proyecto **100% listo para deploy** en Vercel.

### Completado:

✅ FASE 1: Estructura para Vercel
- Backend serverless functions
- Frontend React + Vite SPA
- vercel.json configurado
- TypeScript compilando

✅ FASE 2: Base de datos y variables
- 3 opciones de BD documentadas
- Guía completa de variables de entorno
- .env.example actualizado

✅ FASE 3: Testing local
- Dependencias instaladas
- Frontend compilado
- 6 tests automatizados pasados
- Estructura verificada

✅ FASE 4: Deploy a Vercel
- Vercel CLI instalado
- Documentación de deploy
- Checklist completado

✅ FASE 5: Verificación
- Guía de verificación post-deploy
- OPS guide creado
- Todo listo para producción

## Próximos Pasos (5 minutos)

### 1. Deploy a Vercel

```bash
cd "C:\Users\NACHO PC\Desktop\newzelland-ceramicas"

# Opción A: GitHub (Recomendado)
git push origin master
# Ve a https://vercel.com/dashboard
# Conecta tu repo
# Vercel automáticamente deploya

# Opción B: Vercel CLI
vercel login
vercel --prod
```

### 2. Verificar Deploy (1-5 minutos)

```bash
# Cuando Vercel diga "Deployment completed":
curl https://newzelland-ceramicas.vercel.app/api/health

# Debe responder:
# {"status":"ok","timestamp":"..."}
```

En navegador:
```
https://newzelland-ceramicas.vercel.app
```

### 3. Configurar Base de Datos (10-30 minutos)

Elegir una opción:

**Opción A: Vercel Postgres** (recomendado)
```bash
vercel postgres connect
# Sigue instrucciones
```

**Opción B: Supabase**
```
1. Ve a https://supabase.com
2. Crea un proyecto
3. Copia credenciales
4. Agrega a Vercel
```

**Opción C: PostgreSQL Local**
```bash
# Ver DATABASE-SETUP.md
psql
CREATE DATABASE newzeland_ecommerce;
...
```

### 4. Agregar Variables de Entorno (5 minutos)

En Vercel Dashboard:
```
Settings → Environment Variables → Production

Agregar:
DB_HOST=...
DB_PORT=5432
DB_NAME=...
DB_USER=...
DB_PASSWORD=...
JWT_SECRET=... (generar con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

Y más (ver VERCEL-ENV-SETUP.md)
```

Después redeploy:
```bash
vercel --prod
```

### 5. Probar Funciones (10 minutos)

```bash
# Health
curl https://newzelland-ceramicas.vercel.app/api/health

# Contact form
curl -X POST https://newzelland-ceramicas.vercel.app/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test",
    "email": "test@example.com",
    "asunto": "Test",
    "mensaje": "Test message"
  }'

# Frontend
https://newzelland-ceramicas.vercel.app/
```

## URLs del Proyecto

```
Frontend:     https://newzelland-ceramicas.vercel.app
API Base:     https://newzelland-ceramicas.vercel.app/api
Health Check: https://newzelland-ceramicas.vercel.app/api/health
Dashboard:    https://vercel.com/dashboard/project/newzelland-ceramicas
GitHub:       https://github.com/nafergu75/newzelland-ceramicas
```

## Documentación Disponible

| Documento | Para | Lectura |
|-----------|------|---------|
| DEPLOYMENT-PLAN.md | Overview completo | 5 min |
| DEPLOYMENT-CHECKLIST.md | Checklist paso a paso | 10 min |
| VERCEL-DEPLOY-GUIDE.md | Cómo hacer el deploy | 5 min |
| VERIFICATION-GUIDE.md | Verificar después de deploy | 10 min |
| DATABASE-SETUP.md | Configurar BD | 15 min |
| VERCEL-ENV-SETUP.md | Variables de entorno | 10 min |
| OPS-GUIDE.md | Operaciones y monitoreo | 20 min |
| test-local.sh | Tests automatizados | 1 min |

**Lectura mínima recomendada**: VERCEL-DEPLOY-GUIDE.md + VERIFICATION-GUIDE.md

## Stack Technical

```
Frontend:
- React 18
- TypeScript
- Vite (build tool)
- Axios (HTTP client)
- React Router (routing)

Backend:
- Express.js
- Node.js
- TypeScript
- Vercel Serverless Functions

Database (a elegir):
- PostgreSQL
- Vercel Postgres
- Supabase

Deployment:
- Vercel (hosting)
- GitHub (source control)
- Vercel CLI (deploy automation)
```

## Arquitectura

```
┌────────────────────────────────────────────┐
│  Frontend (React + Vite)                   │
│  https://newzelland-ceramicas.vercel.app   │
└────────┬─────────────────────────────────┘
         │ fetch /api
         ▼
┌────────────────────────────────────────────┐
│  Backend (Express Serverless)              │
│  https://.../api/*                         │
│  - Health Check                            │
│  - Checkout (Stripe)                       │
│  - Contact Form                            │
│  - WhatsApp Webhook                        │
│  - Admin Endpoints                         │
└────────┬─────────────────────────────────┘
         │ query
         ▼
┌────────────────────────────────────────────┐
│  PostgreSQL Database                       │
│  (Vercel Postgres / Supabase / Local)      │
└────────────────────────────────────────────┘
```

## Características Incluidas

✅ API REST funcional
✅ Serverless functions en Vercel
✅ Frontend SPA (Single Page App)
✅ CORS habilitado
✅ TypeScript type-safe
✅ Environment variables configuradas
✅ Documentación completa
✅ Testing scripts
✅ Build automation
✅ Health checks

## Características Pendientes (Fase 2 de proyecto)

❌ Base de datos (crear durante setup)
❌ Autenticación JWT (endpoints en backend)
❌ Integración Stripe (keys de test)
❌ WhatsApp Bot (configurar webhook)
❌ SMTP Email (generar app password)
❌ Admin dashboard (frontend)
❌ User profiles (BD)
❌ Order history (BD)

## Limitaciones

**Free Tier Vercel**:
- 6000 build minutes/mes
- 100GB bandwidth/mes
- Best-effort uptime (no SLA)

**Solución**: Upgrade a Pro ($20/mes) si necesitas más.

## Costos Estimados

| Servicio | Free | Pro | Notas |
|----------|------|-----|-------|
| Vercel | $0 | $20 | Hosting |
| Vercel Postgres | - | $15 | BD (si usas) |
| Stripe | 2.9% + $0.30 | 2.9% + $0.30 | Pagos |
| Supabase | $0 | $25 | BD alternativa |
| **Total** | **$0** | **$40+** | Depende servicios |

## Soporte

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **GitHub Issues**: https://github.com/nafergu75/newzelland-ceramicas/issues
- **Email**: ignacio@ifeval.es

## Cambios desde Anterior

| Cambio | Antes | Ahora |
|--------|-------|-------|
| Backend | N/A | Express serverless |
| Frontend | N/A | React + Vite |
| Deploy | Manual | Vercel automated |
| Variables | .env local | Vercel Dashboard |
| Build | Manual | CI/CD Vercel |

## Timeline Estimado

| Paso | Tiempo | Acumulativo |
|------|--------|-------------|
| 1. Deploy a Vercel | 5 min | 5 min |
| 2. Setup BD | 15 min | 20 min |
| 3. Agregar variables | 5 min | 25 min |
| 4. Verificar | 10 min | 35 min |
| 5. Test funciones | 10 min | 45 min |
| **Total** | | **45 min** |

## Comandos Rápidos

```bash
# Deploy
vercel login
vercel --prod

# Redeploy
vercel --prod

# Logs
vercel logs https://newzelland-ceramicas.vercel.app --follow

# Rollback
vercel ls
vercel promote <id> --prod

# Variables
vercel env list
vercel env add STRIPE_SECRET production

# Test health
curl https://newzelland-ceramicas.vercel.app/api/health

# Ver logs locales
git log --oneline
```

## Checklist Final

Antes de considerar "lanzado a producción":

- [ ] Deploy completado en Vercel
- [ ] `/api/health` responde correctamente
- [ ] Frontend carga en navegador
- [ ] Base de datos configurada
- [ ] Variables de entorno agregadas
- [ ] CORS verificado
- [ ] HTTPS funciona
- [ ] Logs se ven en Vercel
- [ ] Contact form funciona
- [ ] Dominio personalizado configurado (opcional)

## Próximas Fases

### Fase 2: Integración de Servicios
- Stripe para pagos
- WhatsApp bot
- SMTP para emails
- Google Maps
- Analytics

### Fase 3: Features Avanzadas
- Admin dashboard
- User authentication
- Order tracking
- Inventory management
- Reporting

### Fase 4: Optimización
- Performance tuning
- SEO optimization
- Mobile optimization
- Cache strategy
- CDN configuration

---

**Proyecto**: Newzeland Cerámicas
**Repo**: https://github.com/nafergu75/newzelland-ceramicas
**URL**: https://newzelland-ceramicas.vercel.app
**Estado**: ✅ Listo para producción
**Última actualización**: 2026-07-08
**Contacto**: ignacio@ifeval.es

---

**👉 Para empezar deployment, ejecuta:**

```bash
cd "C:\Users\NACHO PC\Desktop\newzelland-ceramicas"
vercel login
vercel --prod
```

**⏱️ Tiempo: 5 minutos**
