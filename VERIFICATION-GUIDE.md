# Guía de Verificación Final - Newzeland Cerámicas

## Estado Actual del Deployment

Todo está listo para hacer deploy en Vercel. Este documento guía la verificación final después del deploy.

## Verificaciones Previas al Deploy

Antes de ejecutar `vercel login && vercel --prod`:

```bash
# 1. Verificar que todo está en git
git status
# Debe estar limpio (no cambios sin commit)

# 2. Verificar último commit
git log --oneline -1
# Debe mostrar: "feat: FASE 4 - Deploy a Vercel - Documentación completada"

# 3. Verificar estructura
ls -la backend/api/index.js  # ✓ debe existir
ls -la frontend/dist/index.html  # ✓ debe existir
ls -la vercel.json  # ✓ debe existir
```

## Checklist de Deployment

### Paso 1: Push a GitHub (si aplica)

```bash
git push origin master

# Verificar en GitHub que los cambios están allí
# https://github.com/nafergu75/newzelland-ceramicas
```

### Paso 2: Deploy a Vercel

**Opción A: Vercel CLI (Recomendado)**
```bash
vercel login
# Te abrirá navegador, confirma
# Vuelve a terminal, presiona Enter

vercel --prod
# Te preguntará:
# - ¿Es este tu proyecto? → yes
# - Setup and deploy? → yes
```

**Opción B: Vercel GitHub Integration**
```
1. Ve a https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Selecciona repo "newzelland-ceramicas"
4. Click "Deploy"
```

### Paso 3: Esperar Deploy

- Build toma 2-5 minutos
- Vercel mostrará URL: `https://newzelland-ceramicas.vercel.app`
- Deploy exitoso cuando ves ✓

## Verificaciones Post-Deploy

Una vez que Vercel dice "Deployment completed":

### Test 1: API Health Check

```bash
curl https://newzelland-ceramicas.vercel.app/api/health

# Respuesta esperada:
# {"status":"ok","timestamp":"2026-07-08T..."}
```

En navegador:
```
https://newzelland-ceramicas.vercel.app/api/health
```

### Test 2: Frontend SPA

```bash
curl -I https://newzelland-ceramicas.vercel.app/

# Respuesta esperada:
# HTTP/2 200
# content-type: text/html
```

En navegador:
```
https://newzelland-ceramicas.vercel.app/
```

Debe mostrar la aplicación (aunque sin datos si no hay BD conectada).

### Test 3: Assets

```bash
# Verificar que CSS carga
curl -I https://newzelland-ceramicas.vercel.app/assets/index-*.css

# Debe responder:
# HTTP/2 200
# content-type: text/css
```

En navegador abrir DevTools:
```
F12 → Network
Recargar página
Buscar .css y .js files
```

Todos deben estar en status 200.

### Test 4: Rutas de la SPA

En navegador, probar estas rutas (todas deben mostrar la app):
```
https://newzelland-ceramicas.vercel.app/
https://newzelland-ceramicas.vercel.app/productos
https://newzelland-ceramicas.vercel.app/carrito
https://newzelland-ceramicas.vercel.app/contacto
https://newzelland-ceramicas.vercel.app/login
```

Todas deben servir `index.html` (fallback de SPA).

### Test 5: API Endpoints (sin autenticación)

```bash
# Health check
curl https://newzelland-ceramicas.vercel.app/api/health

# Productos (devuelve mensaje de demo)
curl https://newzelland-ceramicas.vercel.app/api/products

# Contact form (POST)
curl -X POST https://newzelland-ceramicas.vercel.app/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test User",
    "email": "test@example.com",
    "asunto": "Test",
    "mensaje": "Mensaje de test"
  }'

# Respuesta esperada:
# {"success":true,"message":"Mensaje recibido. Te contactaremos pronto."}
```

### Test 6: Verificar Logs

En Vercel Dashboard:
```
1. Ve a https://vercel.com/dashboard
2. Selecciona proyecto "newzelland-ceramicas"
3. Tab "Logs"
4. Deberías ver logs del deployment
```

O por CLI:
```bash
vercel logs https://newzelland-ceramicas.vercel.app
```

## Configuración de Variables de Entorno (Próximo paso)

Una vez verificado que el deploy funciona, agregar variables:

```bash
# En Vercel Dashboard:
1. Settings → Environment Variables
2. Seleccionar "Production"
3. Agregar cada variable:
   - DB_HOST
   - DB_PORT
   - DB_NAME
   - DB_USER
   - DB_PASSWORD
   - JWT_SECRET
   - STRIPE_SECRET, STRIPE_PUBLIC
   - WHATSAPP_TOKEN
   - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM

# Después de agregar variables:
4. Redeploy: vercel --prod
```

## Verificación de Variables de Entorno

Después de redeploy:

```bash
# Las variables deben estar disponibles en la app
# Verificar en logs:
vercel logs https://newzelland-ceramicas.vercel.app | grep -i "env\|database\|jwt"
```

Si las variables cargan correctamente, verás mensajes como:
```
Database connected
JWT initialized
SMTP configured
```

## Matriz de Verificación

| Test | URL/Command | Esperado | Status |
|------|------------|----------|--------|
| Health Check | `/api/health` | JSON {status:ok} | ⏳ |
| Frontend | `/` | HTML (SPA) | ⏳ |
| Assets | `/assets/index-*.css` | CSS files 200 | ⏳ |
| Contact API | POST `/api/contact` | 200 + JSON | ⏳ |
| Logs | `vercel logs` | Deployment logs | ⏳ |
| Variables | Vercel Dashboard | Todas visibles | ⏳ |
| CORS | Requests desde fe | Access-Control-Allow-Origin | ⏳ |

Completar con ✓ después de verificar cada test.

## Troubleshooting Verificación

### "Cannot GET /api/health"

```
Causa: vercel.json routes mal configuradas
Solución: Verificar que `/api/*` apunta a backend/api/index.js
Comando: cat vercel.json | grep -A5 routes
```

### "Cannot GET /" (404 en SPA)

```
Causa: frontend/dist/index.html no encontrado
Solución: Verificar que build sucesivamente ocurrió
Comando: vercel logs | grep -i build
```

### "CORS error en navegador"

```
Causa: Backend API no retorna CORS headers
Solución: Verificar que backend/api/index.js tiene app.use(cors())
```

### "Variables no se cargan"

```
Causa: Variables no agregadas a Vercel o fase incorrecta
Solución: 
1. Verificar Vercel Dashboard → Settings → Environment Variables
2. Seleccionar "Production"
3. Redeploy: vercel --prod
4. Esperar 1-2 minutos
5. Verificar logs: vercel logs
```

## URLs Finales del Proyecto

```
Frontend:       https://newzelland-ceramicas.vercel.app
API Base:       https://newzelland-ceramicas.vercel.app/api
Health Check:   https://newzelland-ceramicas.vercel.app/api/health
Vercel Dashboard: https://vercel.com/dashboard/project/newzelland-ceramicas
```

## Próximos Pasos Después de Verificación

1. **Configurar Base de Datos**
   - Ver DATABASE-SETUP.md
   - Elegir Vercel Postgres o Supabase
   - Crear tablas
   - Agregar DB_* variables a Vercel

2. **Configurar Servicios**
   - Stripe: Generar keys de test
   - WhatsApp: Configurar webhook
   - SMTP: Generar app password
   - Agregar variables a Vercel

3. **Pruebas Funcionales**
   - Test checkout con Stripe
   - Test webhook WhatsApp
   - Test envío de emails
   - Test formulario de contacto

4. **Monitoreo Continuo**
   - Vercel Analytics
   - Error tracking
   - Performance monitoring
   - Log aggregation

## Guía de Operaciones (Ops)

Ver `OPS-GUIDE.md` después de verificar.

---

**Checklist**: Completar todos los tests antes de pasar a Configuración de BD
**Estado**: Listo para deploy manual
**Próximo**: Ejecutar `vercel login && vercel --prod`
