# Solución del Error de Deployment en Vercel - Newzelland Cerámicas

**Fecha de Resolución:** 8 de julio de 2026  
**Proyecto:** Newzelland Cerámicas  
**Rama:** master  
**URL Productiva:** https://newzelland-ceramicas.vercel.app

---

## Problema Identificado

El deployment en Vercel estaba completando exitosamente, pero todos los endpoints de API retornaban errores 404:
- `https://newzelland-ceramicas.vercel.app/api/health` → 404 Not Found
- `https://newzelland-ceramicas.vercel.app/api/products` → 404 Not Found
- `https://newzelland-ceramicas.vercel.app/api/contact` → 404 Not Found

El frontend (React/Vite) se servía correctamente, pero la API no respondía.

---

## Causas Raíz

### 1. **Configuración de Estructura de Directorios Incorrecta**

Vercel requiere que las funciones serverless de Node.js estén en un directorio `/api/` en la raíz del proyecto. El código original estaba en `/backend/api/index.js`, que es compatible con deployments tradicionales pero no con Vercel Serverless Functions.

### 2. **Rutas de API con Prefijo Duplicado**

Inicialmente, las rutas Express estaban definidas como `/api/health`, `/api/checkout`, etc. Cuando Vercel enrutaba las solicitudes a través de `/api/*` a la función serverless, se generaba un doble prefijo: `/api/api/health`.

### 3. **Configuración de Vercel Inadecuada**

La configuración inicial en `vercel.json` intentaba servir la función desde `/backend/api/index.js`, lo que no es compatible con la estructura esperada por Vercel.

---

## Solución Implementada

### Paso 1: Crear Estructura de Directorios Correcta

Se creó un nuevo directorio `/api/` en la raíz del proyecto:

```
newzelland-ceramicas/
├── api/
│   ├── index.js          (nuevo - función serverless)
│   └── package.json      (nuevo - dependencias mínimas)
├── backend/              (mantiene TypeScript src)
├── frontend/             (React/Vite)
└── ...
```

### Paso 2: Crear Función Serverless Compatible

Se creó `/api/index.js` como una aplicación Express que:
- Importa y configura Express, CORS, y dotenv
- Define todas las rutas **CON** el prefijo `/api/` (porque Vercel pasa el path completo)
- Exporta la aplicación como módulo para Vercel
- Incluye middleware de debug para troubleshooting

### Paso 3: Crear package.json para /api/

Se creó `/api/package.json` con solo las dependencias necesarias:

```json
{
  "name": "newzelland-api",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.0"
  },
  "engines": {
    "node": "24.x"
  }
}
```

### Paso 4: Actualizar vercel.json

Se simplificó y corrigió `vercel.json`:

```json
{
  "version": 2,
  "buildCommand": "npm install --prefix api && npm run build --prefix backend && npm run build --prefix frontend",
  "installCommand": "npm install && npm install --prefix backend && npm install --prefix frontend",
  "outputDirectory": "frontend/dist",
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js",
      "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"]
    },
    {
      "src": "/assets/(.*)",
      "dest": "/frontend/dist/assets/$1"
    },
    {
      "src": "/(.*\\..*)",
      "dest": "/frontend/dist/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/dist/index.html"
    }
  ]
}
```

### Paso 5: Mantener Compatibilidad Local

El archivo `/backend/api/index.js` se mantuvo igual para compatibilidad con desarrollo local. La función serverless en `/api/index.js` es la que se usa en producción en Vercel.

---

## Cambios Realizados

### Commits

1. **a781476** - Fix: Remove /api prefix from backend API routes for Vercel serverless compatibility
2. **e073162** - Fix: Move API to root api/ directory for proper Vercel serverless routing
3. **cf8638a** - Fix: Update Node.js version to 24.x for Vercel compatibility
4. **7f4ed26** - Fix: Remove functions block and let Vercel auto-detect runtime
5. **8bbb741** - Fix: Update API routes to use /api prefix as received from Vercel routing

### Archivos Creados/Modificados

- ✅ **Creado:** `/api/index.js` - Función serverless principal
- ✅ **Creado:** `/api/package.json` - Dependencias de la función
- ✅ **Modificado:** `/vercel.json` - Configuración de routing
- ✅ **Modificado:** `/backend/api/index.js` - Eliminadas duplicaciones de /api prefix

---

## Verificación

Todos los endpoints están ahora operacionales:

```bash
# Health Check
curl https://newzelland-ceramicas.vercel.app/api/health
→ {"status":"ok","timestamp":"2026-07-08T07:46:01.901Z"}

# Products
curl https://newzelland-ceramicas.vercel.app/api/products
→ {"message":"Endpoint disponible...","endpoint":"/data/catalogo.json"}

# Orders
curl https://newzelland-ceramicas.vercel.app/api/orders/test123
→ {"orderId":"test123","status":"processing",...}

# Contact
curl -X POST https://newzelland-ceramicas.vercel.app/api/contact \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Test","email":"test@test.com","asunto":"test","mensaje":"test message"}'
→ {"success":true,"message":"Mensaje recibido..."}

# Frontend
curl https://newzelland-ceramicas.vercel.app/
→ 200 OK - HTML de la aplicación React
```

---

## Lecciones Aprendidas

### 1. **Vercel Serverless Functions Requieren Estructura Específica**

- Las funciones deben estar en `/api/` en la raíz
- Vercel compila y sirve automáticamente archivos JS en ese directorio
- No se usan "funciones serverless tradicionales" sin esta estructura

### 2. **Rutas Express en Vercel**

- **Importante:** Vercel **NO** quita el prefijo `/api/` antes de pasar al handler
- Las rutas en Express deben incluir `/api/` completo
- Esto es diferente a otros hosts que sí quitan el prefijo

### 3. **Debugging de Deployments**

- Usar `vercel logs` para ver errores en producción
- Agregar middleware de debug para entender qué paths llegan
- Los logs muestran exactamente qué URL está siendo visitada

### 4. **Arquitectura Monorepo en Vercel**

Para proyectos con múltiples directorios:
- Usar `npm install --prefix <dir>` en los comandos de install y build
- Cada directorio puede tener su propio `package.json`
- Vercel maneja las dependencias de cada uno correctamente

---

## Prevención Futura

Para evitar este problema en futuros proyectos de Vercel + Node.js:

### Checklist de Deploy

- [ ] Verificar que `/api/index.js` existe en la raíz
- [ ] Verificar que `/api/package.json` existe
- [ ] Las rutas Express incluyen `/api/` en la definición
- [ ] `vercel.json` apunta a `/api/index.js` (no `/backend/api/...`)
- [ ] Ejecutar `vercel deploy --prod` y verificar logs
- [ ] Probar cada endpoint después del deploy: `curl /api/health`, etc.

### Configuración Recomendada

```json
{
  "version": 2,
  "buildCommand": "npm install --prefix api && npm run build",
  "installCommand": "npm install && npm install --prefix api",
  "outputDirectory": "frontend/dist",
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js",
      "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
    }
  ]
}
```

---

## Documentación Relacionada

- [Documentación de Vercel Serverless Functions](https://vercel.com/docs/functions/runtimes/node-js)
- [Routing en Vercel](https://vercel.com/docs/edge-network/routing)
- Guía local: `PRODUCTION-INDEX.md`
- Guía de setup: `PRODUCTION-SETUP-STEPS.md`

---

## Resultado Final

✅ **Deployment EXITOSO**  
✅ **API FUNCIONANDO** - Todos los endpoints responden correctamente  
✅ **Frontend SERVIDO** - React/Vite se carga sin problemas  
✅ **LISTO PARA PRODUCCIÓN** - Sistema completamente operacional

**URL Productiva:** https://newzelland-ceramicas.vercel.app  
**Última Actualización:** 8 de julio de 2026  
**Estado:** ✅ OPERACIONAL
