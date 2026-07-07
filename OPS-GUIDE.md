# Guía de Operaciones - Newzeland Cerámicas

## Arquitectura Final

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│     https://newzelland-ceramicas.vercel.app        │
│                                                     │
├──────────────────┬──────────────────────────────────┤
│  Frontend SPA    │         Backend API              │
│  (React+Vite)    │      (Express.js)                │
├──────────────────┼──────────────────────────────────┤
│ /                │ /api/health                      │
│ /productos       │ /api/products                    │
│ /carrito         │ /api/checkout (Stripe)           │
│ /contacto        │ /api/contact                     │
│ /login           │ /api/whatsapp (webhook)          │
│ /dashboard       │ /api/orders/:id                  │
│ /...             │ /api/admin/* (auth required)     │
├──────────────────┼──────────────────────────────────┤
│ dist/            │ backend/api/index.js             │
│ CSS+JS build     │ (Vercel Serverless Function)     │
└──────────────────┴──────────────────────────────────┘
         │                          │
         └──────────┬───────────────┘
                    │
          ┌─────────▼────────┐
          │  PostgreSQL DB   │
          │  (Vercel Postgres)
          │  Supabase, o RDS)│
          │                  │
          │ users            │
          │ orders           │
          │ order_items      │
          └──────────────────┘
```

## Monitoreo y Logs

### Ver Logs de Vercel

```bash
# Logs en tiempo real
vercel logs https://newzelland-ceramicas.vercel.app --follow

# Logs de función específica
vercel logs https://newzelland-ceramicas.vercel.app/api/health

# Filtrar por tipo
vercel logs https://newzelland-ceramicas.vercel.app | grep ERROR
vercel logs https://newzelland-ceramicas.vercel.app | grep -i database
```

### Dashboard de Vercel

https://vercel.com/dashboard/project/newzelland-ceramicas

- **Deployments**: Historial de deploys
- **Monitoring**: Latencia, errores, CPU
- **Settings**: Variables de entorno, dominios
- **Environment Variables**: Secretos y config

### Analytics

https://vercel.com/dashboard/project/newzelland-ceramicas/analytics

- Web Vitals
- Request volume
- Response times
- Error rates

## Redeploy (Actualizar el app)

### Opción 1: Auto-deploy vía GitHub

```bash
# Hacer cambios locales
git add .
git commit -m "fix: something"
git push origin master

# Vercel automáticamente:
# 1. Detecta el push
# 2. Clona el repo
# 3. Compila (npm run build)
# 4. Deploya
# Toma 2-5 minutos
```

### Opción 2: Manual con CLI

```bash
# Cambios locales
git add .
git commit -m "fix: something"

# Redeploy manual
vercel --prod

# O más específico:
vercel --prod --yes  # Sin confirmaciones
```

### Opción 3: Redeploy sin cambios (re-compile)

```bash
# Si solo cambiaste variables de entorno:
vercel --prod

# O en Vercel Dashboard:
# 1. Ve a Deployments
# 2. Haz click en el último deploy
# 3. Click "Redeploy"
```

## Variables de Entorno - Cambiar en Producción

### Actualizar una variable

```bash
# En Vercel Dashboard:
1. Settings → Environment Variables
2. Busca la variable (ej: STRIPE_SECRET)
3. Click en el lápiz (edit)
4. Cambia el valor
5. Click Save
6. Vercel automáticamente redeploya (opcional)
```

O con CLI:
```bash
vercel env list
vercel env rm STRIPE_SECRET production
vercel env add STRIPE_SECRET production
# Pega el nuevo valor
# Sí, para todos los environments
```

Después redeploy:
```bash
vercel --prod
```

## Rollback (Revertir a versión anterior)

Si algo sale mal después de un deploy:

```bash
# Opción 1: CLI
vercel ls
# Busca el deployment anterior que funcionaba
# Copia el ID (ej: prj_abc123)

vercel promote prj_abc123 --prod
# Confirma cuando te pregunta
```

O en Vercel Dashboard:
```
1. Ve a Deployments
2. Haz click en el deploy anterior que funcionaba
3. Click "Promote to Production"
4. Confirma
```

Espera 1-2 minutos para que tome efecto.

## Dominio Personalizado

Para usar `newzeland.es` en lugar de `newzelland-ceramicas.vercel.app`:

```bash
# En Vercel Dashboard:
1. Settings → Domains
2. Agrega tu dominio: newzeland.es
3. Agrega registros DNS en tu proveedor:
   - A record: 76.76.19.165
   - CNAME: cname.vercel.app.
4. Espera 24h para propagación DNS
```

## SSL/HTTPS

Automático con Vercel:
- Todos los dominios tienen SSL/HTTPS
- Certificado LetsEncrypt renovado automáticamente
- Sin costo adicional

Verificar en navegador:
```
https://newzelland-ceramicas.vercel.app/
🔒 debe mostrar candado (HTTPS)
```

## Performance Optimization

### Frontend

```bash
# Analizar bundle size
npm run build --prefix frontend
# Ver tamaño de dist/

# Reducir tamaño:
1. Code splitting (React.lazy)
2. Image optimization
3. CSS minification (Vite automático)
4. JS minification (Vite automático)
```

### Backend

```bash
# Monitorear latencia en Vercel Analytics
# Optimizaciones:
1. DB connection pooling
2. Caching (Redis)
3. CDN para assets estáticos
4. API response compression (Vercel automático)
```

## Seguridad

### Checklist de Seguridad

- [x] HTTPS habilitado (Vercel automático)
- [x] CORS configurado en backend
- [ ] JWT_SECRET fuerte (min 32 caracteres)
- [ ] No .env con secretos en GitHub
- [ ] Rate limiting en API (del middleware)
- [ ] Validación de input (Joi en backend)
- [ ] HTTPS enforced (redirección)
- [ ] Headers de seguridad (Helmet en backend)

### Verificar HTTPS Enforced

```bash
# Intentar HTTP (debe redirigir a HTTPS)
curl -I http://newzelland-ceramicas.vercel.app/
# Debe responder: HTTP/2 308 (redirect)

# HTTPS debe funcionar
curl -I https://newzelland-ceramicas.vercel.app/
# Debe responder: HTTP/2 200
```

## Base de Datos - Operaciones Comunes

### Conectar a Vercel Postgres

```bash
# Si usaste Vercel Postgres:
vercel postgres connect

# Te dará comando para conectar:
# psql postgresql://...
```

### Backup de BD

Con Vercel Postgres:
```bash
# Exportar
pg_dump postgresql://... > backup.sql

# Restaurar
psql postgresql://... < backup.sql
```

Con Supabase:
```
Dashboard → Backups → Download backup
```

### Monitorear Queries

Vercel Postgres Dashboard:
```
https://vercel.com/dashboard/data
Selecciona tu base de datos
Ve a Logs → Queries
```

## Alertas y Monitoreo

### Alertas de Error

En Vercel Dashboard:
```
1. Settings → Alerts (si tienes plan Pro)
2. Configura notificaciones por email
3. Recibe alertas cuando hay errores
```

### Monitoreo Manual

```bash
# Health check cada minuto
watch -n 60 'curl https://newzelland-ceramicas.vercel.app/api/health'

# Logs en tiempo real
vercel logs https://newzelland-ceramicas.vercel.app --follow
```

## Escala y Limites

### Limites de Vercel Free

- 6000 build minutes/mes
- 100GB bandwidth/mes
- Deployments ilimitados
- 12 serverless function invocations/mes

### Si necesitas más

```
Upgrade a plan Pro:
1. Vercel Dashboard → Account Settings
2. Click "Upgrade to Pro"
3. $20/mes
4. Limites mucho más altos
```

## Logs de Auditoría

Vercel guarda historial de:
- Deployments
- Cambios de variables
- Cambios de settings
- Team members actions

Ver en Dashboard → Settings → Activity

## Disaster Recovery

Si algo muy malo pasó:

```bash
# 1. Verificar últimos deployments
vercel ls

# 2. Identificar cuándo se rompió
# (ver timestamps en el listado)

# 3. Revertir a última versión buena
vercel promote <good_deployment_id> --prod

# 4. Si el repo también está roto:
git log --oneline
git revert HEAD
git push origin master
vercel --prod

# 5. Si todo está mal:
# - Contacta a support de Vercel
# - Vercel tiene backups de todos los deploys
```

## Preguntas Frecuentes (FAQ)

### ¿Cuánto tarda un deploy?

Típicamente 2-5 minutos desde que haces push.

### ¿Vercel cuesta dinero?

Free tier es suficiente para pequeño a mediano tráfico.
Plan Pro: $20/mes si necesitas más limites.

### ¿Cómo reporto un bug?

En GitHub issues: https://github.com/nafergu75/newzelland-ceramicas/issues

O en Vercel Support: https://vercel.com/support

### ¿Puedo cambiar dominio?

Sí, en Settings → Domains.
DNS debe propagarse (24h normalmente).

### ¿Cómo activo analytics?

Vercel Analytics está en Free tier.
Automáticamente se ve en Dashboard → Analytics.

### ¿Vercel tiene SLA?

Vercel garantiza 99.95% uptime en Pro plan.
Free tier es best-effort.

---

**Referencia rápida:**

```bash
# Ver logs
vercel logs https://newzelland-ceramicas.vercel.app --follow

# Redeploy
vercel --prod

# Rollback
vercel promote <id> --prod

# Variables
vercel env list

# Listar deploys
vercel ls
```

**Documentación oficial:**
https://vercel.com/docs

**Support:**
https://vercel.com/support

---

**Última actualización**: 2026-07-08
**Contacto**: ignacio@ifeval.es
