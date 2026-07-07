# PRODUCTION-COMMANDS.md
## Comandos y Scripts Listos para Usar

**Proyecto**: Newzeland Cerámicas E-commerce  
**Última actualización**: 2026-07-08  
**Plataforma**: Windows PowerShell + Vercel CLI + Bash  

---

## SECCIÓN 1: PREPARACIÓN PRE-DEPLOYMENT

### 1.1 Generar JWT_SECRET seguro

```powershell
# Windows PowerShell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Ejemplo de output:
# a7f3b2c1e9d4f6a8b3c5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7
```

**Guardar este valor para Vercel**

---

### 1.2 Generar STRIPE_WEBHOOK_SECRET (si usas Stripe)

No necesita generarse localmente. Se obtiene de:
```
https://dashboard.stripe.com/webhooks → Add endpoint
```

---

### 1.3 Verificar que .gitignore tiene .env

```bash
# Bash
cat .gitignore | grep -E "\.env"

# Debe retornar líneas con .env
```

Si no está:
```bash
echo "" >> .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore
git add .gitignore
git commit -m "chore: ensure env files are gitignored"
```

---

### 1.4 Verificar que backend tiene dependencias de seguridad

```bash
cd backend

# Verificar Helmet
npm list helmet

# Verificar CORS
npm list cors

# Verificar Rate Limiting
npm list express-rate-limit

# Todos deberían mostrar versiones
```

Si falta alguno:
```bash
npm install helmet cors express-rate-limit --save
npm install --save-dev @types/cors
```

---

### 1.5 Verificar build local

```bash
# Test backend build
cd backend
npm run build
# Debe completar sin errores

# Test frontend build
cd ../frontend
npm run build
# Debe crear dist/ sin errores
```

---

## SECCIÓN 2: VERCEL CLI SETUP

### 2.1 Instalar Vercel CLI

```powershell
# Windows PowerShell (como administrador)
npm install -g vercel
```

---

### 2.2 Login a Vercel

```bash
vercel login

# Sigue las instrucciones:
# 1. Selecciona email de login
# 2. Autoriza en navegador
# 3. Confirma
```

---

### 2.3 Conectar proyecto Vercel

```bash
cd "C:\Users\NACHO PC\Desktop\newzelland-ceramicas"

# Vincular proyecto (primera vez)
vercel link

# Selecciona:
# - Organization: Tu organización
# - Project: newzelland-ceramicas (o crea nuevo)
```

---

### 2.4 Verificar conexión

```bash
# Ver proyecto actual
vercel project list

# Debe mostrar: newzelland-ceramicas

# Ver último deployment
vercel ls

# Debe mostrar historial de deployments
```

---

## SECCIÓN 3: CONFIGURAR VARIABLES DE ENTORNO

### 3.1 Listar variables actuales

```bash
vercel env list
```

---

### 3.2 Agregar variables (CLI)

```bash
# Agregar una variable
vercel env add DB_HOST production

# Vercel pide el valor:
# ? What's the value of DB_HOST?
# > [tu valor]

# Confirma ambiente:
# ? For which environments do you want to add these Environment Variables to?
# ◉ Production only

# Para agregar a múltiples:
# ◯ All (Production, Preview, Development)
```

---

### 3.3 Script para agregar variables en batch

```bash
# Crear archivo add-vars.sh
cat > add-vars.sh << 'EOF'
#!/bin/bash

echo "Agregando variables de entorno a Vercel..."

# Variables de BD
vercel env add DB_HOST production
vercel env add DB_PORT production
vercel env add DB_NAME production
vercel env add DB_USER production
vercel env add DB_PASSWORD production

# Seguridad
vercel env add JWT_SECRET production
vercel env add JWT_EXPIRATION production

# SMTP
vercel env add SMTP_HOST production
vercel env add SMTP_PORT production
vercel env add SMTP_USER production
vercel env add SMTP_PASS production
vercel env add SMTP_FROM production

# URLs
vercel env add FRONTEND_URL production
vercel env add API_URL production

echo "✅ Variables agregadas"
EOF

# Ejecutar
bash add-vars.sh
```

---

### 3.4 Verificar variables agregadas

```bash
vercel env list

# Debe mostrar todas las variables con estado "Encrypted" o "Hidden"
```

---

## SECCIÓN 4: DEPLOYMENT

### 4.1 Deployment simple (recomendado)

```bash
# Posicionarse en raíz del proyecto
cd "C:\Users\NACHO PC\Desktop\newzelland-ceramicas"

# Hacer commit
git add .
git commit -m "feat: production deployment"

# Push a master (Vercel despliega automáticamente)
git push origin master

# Esperar en Vercel Dashboard:
# https://vercel.com/dashboard/project/newzelland-ceramicas
```

---

### 4.2 Deployment manual (si no está en GitHub)

```bash
cd "C:\Users\NACHO PC\Desktop\newzelland-ceramicas"

# Deploy a producción
vercel --prod

# Vercel:
# 1. Detecta cambios
# 2. Compila (npm run build)
# 3. Despliega
# 4. Da URL: https://newzelland-ceramicas.vercel.app
```

---

### 4.3 Redeploy sin cambios

```bash
# Si solo cambiaste variables de entorno
vercel --prod --yes

# O en Dashboard:
# Deployments → Latest → Redeploy
```

---

## SECCIÓN 5: VERIFICACIÓN POST-DEPLOYMENT

### 5.1 Test health endpoint

```bash
# PowerShell o Bash
curl https://newzelland-ceramicas.vercel.app/api/health

# Esperado:
# {"status":"ok"}
```

---

### 5.2 Ver logs en tiempo real

```bash
vercel logs https://newzelland-ceramicas.vercel.app --follow

# Ctrl+C para salir
```

---

### 5.3 Ver logs de función específica

```bash
vercel logs https://newzelland-ceramicas.vercel.app/api/health

# Retorna últimos logs de ese endpoint
```

---

### 5.4 Filtrar logs por error

```bash
vercel logs https://newzelland-ceramicas.vercel.app | grep ERROR

# O en PowerShell:
vercel logs https://newzelland-ceramicas.vercel.app | Select-String ERROR
```

---

### 5.5 Test de CORS

```bash
curl -H "Origin: https://newzelland-ceramicas.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     https://newzelland-ceramicas.vercel.app/api/products \
     -v

# Busca en output:
# Access-Control-Allow-Origin: https://newzelland-ceramicas.vercel.app
```

---

### 5.6 Ver headers de seguridad

```bash
curl -I https://newzelland-ceramicas.vercel.app/api/health

# Busca:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
# Strict-Transport-Security: ...
```

---

## SECCIÓN 6: OPERACIONES DIARIAS

### 6.1 Ver estado del proyecto

```bash
vercel project inspect newzelland-ceramicas

# Retorna: nombre, org, git, estado
```

---

### 6.2 Listar deployments

```bash
vercel ls

# Muestra últimos 10 deployments con:
# - ID (hash)
# - Rama
# - Estado (Ready, Error, Building)
# - URL
# - Fecha
```

---

### 6.3 Ver detalles de un deployment

```bash
vercel inspect [DEPLOYMENT-ID]

# Ejemplo:
# vercel inspect newzelland-ceramicas-7f3k9d2
```

---

### 6.4 Actualizar una variable de entorno

```bash
# Remover antigua
vercel env rm STRIPE_SECRET production

# Agregar nueva
vercel env add STRIPE_SECRET production
# [pega nuevo valor]

# Redeploy para aplicar
vercel --prod
```

---

### 6.5 Ver todas las variables en un archivo

```bash
# Exportar a archivo (solo para backup local, NO para git)
vercel env list > env-backup.txt

# IMPORTANTE: No subir a git
echo "env-backup.txt" >> .gitignore
```

---

## SECCIÓN 7: ROLLBACK

### 7.1 Listar deployments anteriores

```bash
vercel ls

# Muestra todas las versiones anteriores
```

---

### 7.2 Promocionar deployment anterior a producción

```bash
# Usar ID del deployment anterior
vercel promote [OLD-DEPLOYMENT-ID] --prod

# Ejemplo:
# vercel promote newzelland-ceramicas-9f4d2e1 --prod

# Vercel confirma:
# ✓ Promoted newzelland-ceramicas-9f4d2e1 to production
```

---

### 7.3 Rollback rápido (Git)

```bash
# Si el error está en código (no en variables):
git revert [COMMIT-HASH]
git push origin master

# Vercel automáticamente redeploya con código anterior
```

---

## SECCIÓN 8: BASE DE DATOS

### 8.1 Conectar Vercel Postgres

```bash
vercel postgres connect

# Sigue instrucciones:
# 1. Select: Create a new Postgres database
# 2. Wait: Vercel crea BD (2-3 min)
# 3. Auto-agregaç: Vercel añade envvars automáticamente
```

---

### 8.2 Ejecutar migraciones

```bash
# Local con BD de producción (SOLO una vez)
cd backend

# Crear .env.production.local
cat > .env.production.local << 'EOF'
DB_HOST=[tu_host]
DB_PORT=5432
DB_NAME=[tu_db]
DB_USER=[tu_user]
DB_PASSWORD=[tu_pass]
EOF

# Ejecutar migrations
npm run migrate

# Borrar .env.production.local (seguridad)
rm .env.production.local
```

---

## SECCIÓN 9: EMAIL (SMTP)

### 9.1 Obtener App Password de Gmail

```
1. Ve a: https://myaccount.google.com/apppasswords
2. Selecciona: Mail + Windows/Mac
3. Copia: 16-character password
4. NO uses tu contraseña normal
```

---

### 9.2 Test de email (local)

```bash
# Crear test-email.js
cat > test-email.js << 'EOF'
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'tu_email@gmail.com',
    pass: 'tu_app_password_16_chars'
  }
});

transporter.sendMail({
  from: 'noreply@newzeland.es',
  to: 'tu_email@gmail.com',
  subject: 'Test Email',
  html: '<h1>✅ Test Successful</h1>'
}, (err, info) => {
  if (err) {
    console.error('❌ Error:', err.message);
  } else {
    console.log('✅ Email sent:', info.response);
  }
  process.exit(0);
});
EOF

# Instalar nodemailer
npm install nodemailer

# Ejecutar test
node test-email.js

# Borrar archivos de test
rm test-email.js
```

---

## SECCIÓN 10: MONITORING & ALERTS

### 10.1 Setup de monitoreo con Uptime Robot (gratis)

```
1. Ve a: https://uptimerobot.com
2. Click: Add Monitor
3. Tipo: HTTP(s)
4. URL: https://newzelland-ceramicas.vercel.app/api/health
5. Intervalo: 5 minutos
6. Contacto: tu email
7. Guardar
```

**Resultado**: Email cada vez que /api/health falla

---

### 10.2 Setup de alertas en Slack (opcional)

```bash
# 1. Crear webhook de Slack
# Ve a: https://api.slack.com/messaging/webhooks
# Crea webhook para tu canal #alerts

# 2. Setup en Vercel (manual desde Dashboard):
# Settings → Integrations → Slack
# Conecta tu workspace
# Selecciona canal #alerts
```

---

## SECCIÓN 11: BACKUP & DISASTER RECOVERY

### 11.1 Backup de código

```bash
# Ya hecho: GitHub es tu backup
git push origin master

# Para restaurar:
git clone https://github.com/[tu-org]/newzelland-ceramicas.git
cd newzelland-ceramicas
git checkout [COMMIT-HASH]
vercel --prod
```

---

### 11.2 Backup de base de datos

```bash
# Si usas Vercel Postgres:
# Vercel hace backups automáticos
# Dashboard → Data → Postgres → Backups

# Si usas otra BD:
# Configurar backups automáticos en ese proveedor
```

---

### 11.3 Exportar datos de producción

```bash
# Con pg_dump (si tienes acceso)
pg_dump -U [user] -h [host] -d [dbname] > backup.sql

# Guardar en lugar seguro (NO en git)
# Encriptar si es sensitivo
```

---

## SECCIÓN 12: SCRIPTS ÚTILES

### 12.1 Script: Verificación rápida

```bash
#!/bin/bash
# save as: health-check.sh

echo "🔍 Newzeland Ceramicas Health Check"
echo "===================================="

# Health endpoint
echo -n "API Health: "
curl -s https://newzelland-ceramicas.vercel.app/api/health | grep -q "ok" && echo "✅ OK" || echo "❌ FAILED"

# Frontend
echo -n "Frontend: "
curl -s -o /dev/null -w "%{http_code}" https://newzelland-ceramicas.vercel.app | grep -q "200" && echo "✅ OK" || echo "❌ FAILED"

# CORS
echo -n "CORS: "
curl -s -H "Origin: https://newzelland-ceramicas.vercel.app" https://newzelland-ceramicas.vercel.app/api/products | grep -q "Access-Control-Allow-Origin" && echo "✅ OK" || echo "❌ FAILED"

# Latest logs
echo ""
echo "📋 Latest errors:"
vercel logs https://newzelland-ceramicas.vercel.app --follow | grep ERROR | tail -5
```

**Usar**:
```bash
bash health-check.sh
```

---

### 12.2 Script: Redeploy automático

```bash
#!/bin/bash
# save as: auto-redeploy.sh

echo "🚀 Auto Redeploy Starting..."

cd "C:\Users\NACHO PC\Desktop\newzelland-ceramicas"

# Check git status
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Committing changes..."
    git add .
    git commit -m "chore: auto redeploy $(date '+%Y-%m-%d %H:%M')"
else
    echo "ℹ️ No changes to commit"
fi

# Push to master
echo "📤 Pushing to master..."
git push origin master

# Esperar a que Vercel termine
echo "⏳ Waiting for Vercel deployment..."
sleep 30

# Verificar health
echo "🔍 Checking health..."
curl https://newzelland-ceramicas.vercel.app/api/health

echo "✅ Redeploy complete!"
```

**Usar**:
```bash
bash auto-redeploy.sh
```

---

### 12.3 Script: Exportar variables localmente

```bash
#!/bin/bash
# save as: export-env.sh

echo "📥 Exporting environment variables from Vercel..."

# Guardar en archivo local (no se sube a git)
vercel env list > .env.vercel.backup

echo "✅ Saved to .env.vercel.backup"
echo "⚠️ REMEMBER: Don't commit this file!"

# Agregar a .gitignore
echo ".env.vercel.backup" >> .gitignore
```

---

## SECCIÓN 13: TROUBLESHOOTING RÁPIDO

### 13.1 "API returns 500 error"

```bash
# Ver logs de error
vercel logs https://newzelland-ceramicas.vercel.app | grep -i "error\|failed\|exception"

# Causas comunes:
# 1. Variable de entorno faltante
# 2. Base de datos no conecta
# 3. Timeout (>10s en free tier)

# Solución:
# Verificar variables: vercel env list
# Redeploy: vercel --prod
```

---

### 13.2 "CORS error in browser console"

```bash
# Verificar CORS está configurado
grep -r "cors({" backend/src/app.ts

# Verificar FRONTEND_URL
vercel env list | grep FRONTEND_URL

# Debe ser exactamente: https://newzelland-ceramicas.vercel.app
# SIN trailing slash
```

---

### 13.3 "Email no se envía"

```bash
# Test local primero
node test-email.js

# Si falla local:
# - SMTP_PASS debe ser app password (16 chars)
# - NO contraseña normal

# Si funciona local pero no en prod:
# - Verificar SMTP_PASS en Vercel está correcto
# - Ver logs: vercel logs ... | grep -i smtp
```

---

### 13.4 "Database connection failed"

```bash
# Verificar credenciales
vercel env list | grep DB_

# Verificar que BD está activa
# En Vercel Dashboard → Data → Postgres

# Test conexión (local):
psql -U [user] -h [host] -d [dbname] -c "SELECT 1"

# Si falla en prod, ver logs:
vercel logs https://newzelland-ceramicas.vercel.app | grep -i database
```

---

## SECCIÓN 14: CHEATSHEET RÁPIDA

```bash
# Ver estado del proyecto
vercel ls

# Ver logs en vivo
vercel logs https://newzelland-ceramicas.vercel.app --follow

# Redeploy
vercel --prod

# Rollback a versión anterior
vercel promote [OLD-ID] --prod

# Agregar variable
vercel env add VAR_NAME production

# Ver variables
vercel env list

# Test health
curl https://newzelland-ceramicas.vercel.app/api/health

# Ver latest deployment ID
vercel ls | head -1 | awk '{print $3}'

# Inspeccionar deployment
vercel inspect [DEPLOYMENT-ID]

# Cancelar deployment en progreso
vercel cancel [DEPLOYMENT-ID]

# Borrar proyecto (⚠️ CUIDADO)
vercel remove newzelland-ceramicas --force
```

---

## SECCIÓN 15: REFERENCIAS

**URLs Importantes:**
- Dashboard: https://vercel.com/dashboard/project/newzelland-ceramicas
- Production: https://newzelland-ceramicas.vercel.app
- API: https://newzelland-ceramicas.vercel.app/api
- Health: https://newzelland-ceramicas.vercel.app/api/health

**Documentación:**
- [Vercel Docs](https://vercel.com/docs)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

**Comandos Locales:**
```bash
cd backend && npm run dev        # Backend local
cd frontend && npm run dev       # Frontend local
npm run build --prefix backend   # Build backend
npm run build --prefix frontend  # Build frontend
```

---

## METADATA

| Campo | Valor |
|-------|-------|
| Proyecto | Newzeland Cerámicas |
| Última actualización | 2026-07-08 |
| Comandos listos | 50+ |
| Scripts listos | 5 |
| Plataforma | Windows + Bash + Vercel CLI |
| Estado | ✅ Completo |

---

**Documento**: PRODUCTION-COMMANDS.md  
**Uso**: Copia-pega los comandos que necesites  
**Guardarlo**: Guardar como referencia para operaciones diarias

