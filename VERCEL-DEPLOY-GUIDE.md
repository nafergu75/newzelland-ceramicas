# Guía de Deploy a Vercel - Newzeland Cerámicas

## Requisitos

1. Cuenta en Vercel: https://vercel.com/signup
2. Vercel CLI instalado: ✓ Completado
3. GitHub repo conectado (recomendado)
4. Commits pusheados a git

## Opción 1: Deploy vía GitHub (Recomendado)

### Pasos:

1. **Pushear cambios a GitHub**
   ```bash
   git push origin master
   ```

2. **Conectar en Vercel Dashboard**
   - Ve a https://vercel.com/dashboard
   - Click: "Add New..." → "Project"
   - Selecciona tu repo: `newzelland-ceramicas`
   - Framework: "Other" (HTML/CSS/JS)
   - Build settings:
     - Build Command: `npm run build --prefix frontend`
     - Output Directory: `frontend/dist`
   - Click: "Deploy"

3. **Vercel automáticamente:**
   - Clona el repo
   - Instala deps
   - Ejecuta build
   - Deploya a prod
   - Te da una URL

## Opción 2: Deploy vía Vercel CLI (Manual)

### 2.1 Login con Vercel CLI

```bash
vercel login
```

- Te abrirá navegador
- Confirma tu identidad
- Vuelve a la terminal
- Deberías ver: "✓ Logged in"

### 2.2 Preparar proyecto

```bash
cd "C:\Users\NACHO PC\Desktop\newzelland-ceramicas"

# Verificar que está todo en git
git status

# Debe estar limpio (no hay cambios sin commit)
```

### 2.3 Deploy inicial (linked to GitHub)

Si tu proyecto está en GitHub:

```bash
# Vercel detecta el repo automáticamente
vercel

# Te preguntará:
# - ¿Es este tu proyecto? (yes)
# - ¿Quieres conectar a GitHub? (yes)
# - Selecciona el repo
# - Build settings: accept defaults
```

### 2.4 Deploy a producción

```bash
vercel --prod
```

Esto:
- Compila frontend
- Empaqueta backend
- Deploya a https://newzelland-ceramicas.vercel.app

### 2.5 Deploy future (quick redeploy)

Para cambios futuros:
```bash
git push origin master
# GitHub te notifica a Vercel
# Vercel automáticamente redeploya
```

## Opción 3: Deploy Manual desde JSON (Sin interacción)

Si necesitas script sin interacción (CI/CD):

```bash
# Usar Vercel API token (generar en https://vercel.com/account/tokens)
export VERCEL_TOKEN=your_token_here

# Deploy
vercel deploy --token $VERCEL_TOKEN --prod
```

## Después del Deploy

### 1. Verificar deployment

```bash
# Ver URL de proyecto
vercel ls

# Debe mostrar:
# newzelland-ceramicas.vercel.app    Production
```

### 2. Test de health check

```bash
curl https://newzelland-ceramicas.vercel.app/api/health

# Debe responder:
# {"status":"ok","timestamp":"2026-07-08T..."}
```

### 3. Configurar variables de entorno

En Vercel Dashboard:
1. Ve a tu proyecto
2. Settings → Environment Variables
3. Agrega todas las variables (ver VERCEL-ENV-SETUP.md)
4. Redeploy:
   ```bash
   vercel --prod
   ```

### 4. Verificar frontend

```bash
curl https://newzelland-ceramicas.vercel.app/

# Debe responder HTML (SPA)
# Verificar en navegador: https://newzelland-ceramicas.vercel.app
```

## Rutas de API Activas

Después del deploy, estas rutas están activas:

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/checkout` | POST | Procesar pagos |
| `/api/whatsapp` | POST | Webhook WhatsApp |
| `/api/products` | GET | Catálogo de productos |
| `/api/orders/:id` | GET | Estado de pedido |
| `/api/contact` | POST | Formulario de contacto |
| `/` | GET | Frontend SPA |

## Monitoreo Post-Deploy

### Logs de Vercel

```bash
# Ver logs recientes
vercel logs https://newzelland-ceramicas.vercel.app

# Ver logs de función específica
vercel logs https://newzelland-ceramicas.vercel.app/api/health
```

### Dashboard

https://vercel.com/dashboard/project/newzelland-ceramicas

- Monitoring → Metrics (latencia, errores)
- Deployments → historial de deploys
- Settings → cambiar config

## Troubleshooting Deploy

### Error: "Build failed"

```bash
# Ver logs del build
vercel logs --follow
```

### Error: "Cannot find module"

- Verificar que `npm install` pasó en backend y frontend
- Revisar que los imports son correctos
- Probar build localmente: `npm run build --prefix frontend`

### Error: "PORT already in use"

- Vercel automáticamente asigna puerto
- No necesitas especificar puerto manualmente

### Las variables de entorno no se cargan

1. Verificar que están en Vercel Dashboard (Settings → Environment Variables)
2. Seleccionar "Production"
3. Redeploy: `vercel --prod`
4. Esperar ~1 minuto para que tomen efecto

## URLs Finales

```
Frontend: https://newzelland-ceramicas.vercel.app
API: https://newzelland-ceramicas.vercel.app/api
Health: https://newzelland-ceramicas.vercel.app/api/health
```

## Integración Continua (CI/CD)

Para que GitHub automáticamente redeploya en cada push:

1. En Vercel Dashboard
2. Settings → Git Integration
3. Vercel ya debería estar integrado
4. Cada push a `master` automáticamente deploya

## Rollback (revertir deploy anterior)

Si algo sale mal:

```bash
# Ver histórico de deploys
vercel ls

# Promocionar una versión anterior a prod
vercel promote <deployment_id> --prod
```

O en Vercel Dashboard:
1. Deployments
2. Selecciona versión anterior
3. Click: "Promote to Production"

---

**Status**: Listo para deploy
**Próximo**: FASE 5 - Verificación final
