# Guía de Deployment en Vercel - Newzelland Cerámicas
**Fecha:** 2026-07-08  
**Estado:** ✅ LISTO PARA PRODUCCIÓN

---

## Configuración Vercel.json Actual

**Ubicación:** `/vercel.json`

```json
{
  "buildCommand": "cd backend && npm run build",
  "outputDirectory": "backend/dist",
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store"
        }
      ]
    }
  ]
}
```

---

## Estructura de Rutas Vercel

```
Dominio: https://newzelland-ceramicas.vercel.app

Frontend (Static)
├── / → index.html
├── /productos.html
├── /tienda.html
├── /descargas.html
├── /contacto.html
├── /sobre-nosotros.html
└── /assets/* → CSS, JS, imágenes

Backend (API)
├── /api/health → GET health check
├── /api/products → GET productos
├── /api/auth/* → Autenticación
├── /api/user/* → Perfil usuario
├── /api/checkout/* → Órdenes
└── /api/admin/* → Endpoints admin
```

---

## PASO 1: Verificar package.json en root

**Ubicación:** `/package.json`

Debe contener:
```json
{
  "name": "newzelland-ceramicas",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "cd backend && npm run build",
    "start": "cd backend && npm run start",
    "dev": "cd backend && npm run dev"
  }
}
```

---

## PASO 2: Verificar estructura backend

**Ubicación:** `/backend/package.json`

Debe tener:
```json
{
  "name": "newzelland-api",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc",
    "start": "node dist/src/app.js",
    "dev": "ts-node src/app.ts",
    "migrate": "ts-node src/db/migrations.ts"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^7.0.0",
    "pg": "^8.11.0",
    "jsonwebtoken": "^9.1.0",
    "joi": "^17.11.0",
    "bcrypt": "^5.1.1",
    "uuid": "^9.0.1",
    "nodemailer": "^6.9.7",
    "dotenv": "^16.3.1"
  }
}
```

---

## PASO 3: Estructura tsconfig.json (backend)

**Ubicación:** `/backend/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

---

## PASO 4: Verificar .vercelignore

**Ubicación:** `/.vercelignore`

```
*.md
.git
.gitignore
frontend
*.json (excepto package.json)
docs
temp_*.json
```

---

## PASO 5: Conectar Vercel Postgres

### En Vercel Dashboard:

1. **Proyecto Settings** → **Storage**
2. **Create Database** → seleccionar **Postgres**
3. Esperar creación (1-2 min)
4. Tab **.env.local**:
   ```
   POSTGRES_PRISMA_URL=postgresql://default:password@host:5432/verceldb
   POSTGRES_URL_NON_POOLING=postgresql://default:password@host:5432/verceldb
   ```
5. Copiar credenciales a **Environment Variables**:
   - DB_HOST
   - DB_PORT
   - DB_NAME
   - DB_USER
   - DB_PASSWORD

### Migrar en Vercel (PRIMEROS PASOS):

```bash
# Temporalmente, agregar a root:
# scripts: { "migrate": "cd backend && npm run migrate" }

# Luego en terminal local:
npm run migrate

# O usar "Deployment" en Vercel para ejecutar comando:
cd backend && npm run migrate
```

---

## PASO 6: Variables de Entorno (Verificación)

**Dashboard Vercel** → **Settings** → **Environment Variables**

### Variables requeridas cargadas:

```
✓ NODE_ENV = production
✓ FRONTEND_URL = https://newzelland-ceramicas.vercel.app
✓ API_URL = https://newzelland-ceramicas.vercel.app/api
✓ JWT_EXPIRATION = 7d
✓ JWT_SECRET = <generado>
✓ ADMIN_TOKEN = <generado>
✓ DB_HOST = <Vercel Postgres>
✓ DB_PORT = 5432
✓ DB_NAME = <nombre>
✓ DB_USER = <usuario>
✓ DB_PASSWORD = <password>
✓ SMTP_HOST = smtp.gmail.com
✓ SMTP_PORT = 587
✓ SMTP_USER = info@newzeland.es
✓ SMTP_PASS = <App Password>
✓ SMTP_FROM = noreply@newzeland.es
```

---

## PASO 7: Triggerear Deploy en Vercel

**Opción A - Push a GitHub:**
```bash
git add .
git commit -m "chore: Production configuration complete"
git push origin master
```

Vercel detecta automáticamente y hace deploy.

**Opción B - Redeploy manual:**
1. Vercel Dashboard → **Deployments**
2. Click en el último deploy
3. Click **Redeploy**
4. Confirmar

**Opción C - Deployments API:**
```bash
curl -X POST https://api.vercel.com/v13/deployments \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"newzelland-ceramicas"}'
```

---

## PASO 8: Monitorear Build

### En Vercel Dashboard:
1. **Deployments** tab
2. Observar estado:
   - 🟡 **Building** - en progreso
   - 🟢 **Ready** - completado exitoso
   - 🔴 **Failed** - error

### Ver logs:
```
Click en deployment → "Build logs"
Buscar errores como:
- Module not found
- TypeScript compilation error
- Database connection failed
```

### Reintentar en caso de fallo:
```
Vercel Dashboard → Deployment → "Redeploy"
O hacer nuevo push a GitHub
```

---

## PASO 9: Verificaciones Finales

### 1. Health Check
```bash
curl https://newzelland-ceramicas.vercel.app/health

# Respuesta esperada:
# {"status":"ok"}
```

### 2. Listar Productos
```bash
curl https://newzelland-ceramicas.vercel.app/api/products

# Respuesta esperada:
# {"products":[{id:"1",name:"Atlas Gris",...}],"total":5}
```

### 3. Test Registro (estructura)
```bash
curl -X POST https://newzelland-ceramicas.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "securepass123",
    "province": "Valencia"
  }'

# Respuesta esperada:
# {"userId":"uuid...","message":"Registration successful..."}
```

### 4. Ver Deployment Details
```bash
# Logs de producción
Vercel Dashboard → Deployments → últimos logs
```

---

## PASO 10: Optimizaciones Opcionales

### 1. Agregar Dominio Custom (opcional)
```
Vercel Dashboard → Domains → Add Domain
Pointing: newzelland.es
DNS: vercel.com
```

### 2. Habilitar HTTP/2 Server Push
```
Ya habilitado por defecto en Vercel
```

### 3. Cache Strategy
```
vercel.json - ya configurado:
"Cache-Control: no-store" para /api/*
```

### 4. Monitoreo con Sentry (opcional)
```
npm install @sentry/node @sentry/tracing
Y agregar SENTRY_DSN en variables
```

---

## Resumen de Deployment

| Paso | Tarea | Status |
|------|-------|--------|
| 1 | Verificar package.json | ✅ OK |
| 2 | Verificar backend | ✅ OK |
| 3 | tsconfig.json | ✅ OK |
| 4 | .vercelignore | ✅ OK |
| 5 | Vercel Postgres | ⏳ Hacer |
| 6 | Variables de entorno | ⏳ Hacer |
| 7 | Triggerear deploy | ⏳ Hacer |
| 8 | Monitorear build | ⏳ Hacer |
| 9 | Verificaciones | ⏳ Hacer |
| 10 | Optimizaciones | ⚠️ Opcional |

---

## URLs Finales

- 🌐 **Frontend:** https://newzelland-ceramicas.vercel.app
- 🔌 **API Base:** https://newzelland-ceramicas.vercel.app/api
- 💚 **Health:** https://newzelland-ceramicas.vercel.app/health
- 📦 **Productos:** https://newzelland-ceramicas.vercel.app/api/products

---

## Próximo Paso: FASE 4
Ver documento: `PRODUCTION-VERIFICATION-RESULTS.md`
