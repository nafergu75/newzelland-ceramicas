# EMERGENCY-RUNBOOK.md

Guía rápida para resolver problemas en producción

---

## PROBLEMA: API Down / 502 Bad Gateway

### Síntomas
- GET https://newzelland-ceramicas.vercel.app devuelve 502
- Health check falla
- Clientes no pueden acceder

### Resolución (5 minutos)

1. Verificar estado de Vercel en https://www.vercelstatus.com

2. Ver logs:
   vercel logs https://newzelland-ceramicas.vercel.app --follow

3. Si ves "Cannot find module":
   - Problema en build
   - Revisar package.json
   - Redeploy: vercel --prod

4. Si ves "Connection refused":
   - Problema con base de datos
   - Ver sección "Database Connection Failed"

5. Si todo ok, esperar 2-3 minutos (Vercel a veces lento)

6. Si persiste, redeploy forzado:
   vercel --prod

7. Confirmar:
   curl https://newzelland-ceramicas.vercel.app/api/health

---

## PROBLEMA: Database Connection Failed

### Síntomas
- Error: "ECONNREFUSED" en logs
- "Connection timeout"
- Endpoints que usan BD fallan

### Resolución (10 minutos)

1. Verificar credenciales en Vercel Dashboard
   Settings → Environment Variables
   Revisa: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD

2. Si usas Vercel Postgres:
   vercel postgres list

3. Si usas PostgreSQL externo:
   psql postgresql://user:password@host:5432/dbname

4. Si falla localmente:
   - BD está down
   - Credenciales incorrectas
   - Firewall bloquea

5. Si está correcto, regenerar CONNECTION STRING
   Actualizar en Vercel y redeploy:
   vercel --prod

---

## PROBLEMA: Email Not Sending

### Síntomas
- Usuarios no reciben emails
- Logs muestran "SMTP Error"
- "Authentication failed"

### Resolución (15 minutos)

1. Verificar SMTP en Vercel
   Settings → Environment Variables
   Revisa: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS

2. IMPORTANTE: Debe ser App Password de Gmail, NO contraseña regular
   Ve a: https://myaccount.google.com/apppasswords

3. App Password formato:
   - Ejemplo: abcd efgh ijkl mnop (CON espacios)
   - Pero en Vercel: abcdefghijklmnop (SIN espacios)

4. Verificar 2-Factor en Gmail:
   https://myaccount.google.com/security
   "2-Step Verification" debe estar ON

5. Si falla por timeout, probar SMTP_PORT: 465 (en lugar de 587)

6. Redeploy después de cambios:
   vercel --prod

---

## PROBLEMA: Out of Memory / 503

### Síntomas
- Errores aleatorios "out of memory"
- Requests ocasionales fallan
- Más fallos en horarios pico

### Resolución

Vercel Serverless límites:
- Memory: 3GB (fijo)
- Timeout: 60 segundos (fijo)

Soluciones:

A) Reducir tamaño de payloads
   - Paginar APIs (?limit=50&page=1)
   - Comprimir respuestas (ya habilitado)

B) Optimizar queries de BD
   - Indexar columnas en WHERE
   - Usar LIMIT en queries grandes
   - Evitar JOINs complejos

C) Stream respuestas grandes
   - Para descargas de PDF
   - Usar response.pipe()

D) Alternative: cambiar hosting
   - Heroku, Render.com, Railway.app
   - Sin límites de memoria pero cuesta más

---

## PROBLEMA: CORS Error en Cliente

### Síntomas
- Navegador: "Access-Control-Allow-Origin" error
- Frontend no puede llamar API
- Funciona local pero NO en producción

### Resolución (5 minutos)

1. Verificar FRONTEND_URL en Vercel
   Settings → Environment Variables
   Debe ser: https://newzelland-ceramicas.vercel.app
   (sin trailing slash, sin puerto)

2. Si cambió FRONTEND_URL:
   REDEPLOY OBLIGATORIO: vercel --prod

3. Verificar app.ts:
   cat backend/src/app.ts | grep -A 2 "cors"
   Debe tener: cors({ origin: process.env.FRONTEND_URL })

4. Test con curl:
   curl -H "Origin: https://newzelland-ceramicas.vercel.app" \
        https://newzelland-ceramicas.vercel.app/api/health -v

   Busca en respuesta:
   Access-Control-Allow-Origin: https://newzelland-ceramicas.vercel.app

---

## ROLLBACK: Volver a Versión Anterior

### Pasos

1. Ver deployments:
   vercel ls

2. Identificar deployment anterior que funcionaba

3. Promover a production:
   vercel promote [deployment-id] --prod

4. Ejemplo:
   vercel promote ij90kl12 --prod

5. Esperar a completar (1-2 minutos)

6. Verificar:
   curl https://newzelland-ceramicas.vercel.app/api/health

### Nota
- PROMOTE no es revert de código
- Es solo promocionar deployment anterior
- Git sigue con todos los commits
- Para revert de código: git revert [commit]

---

CONTACTO
Email: ignacio@ifeval.es

Proporcionar al reportar:
1. Error exacto
2. Endpoint que falla
3. Última acción
4. Resultado de: curl https://newzelland-ceramicas.vercel.app/api/health

---

Documento: EMERGENCY-RUNBOOK.md
Última actualización: 2026-07-08
