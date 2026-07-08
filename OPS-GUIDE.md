# OPS-GUIDE.md

Operaciones diarias y mantenimiento para Newzelland Cerámicas en Producción

---

## MONITOREO DIARIO

### Health Check (recomendado cada hora)

curl https://newzelland-ceramicas.vercel.app/api/health

Respuesta esperada:
{"status":"ok"}

### Ver Logs en Tiempo Real

vercel logs https://newzelland-ceramicas.vercel.app --follow

Buscar:
- Errores (ERROR, Error, error)
- Warnings (WARN, Warning)
- Status 500 (internal server error)

### Dashboard Vercel

https://vercel.com/dashboard/project/newzelland-ceramicas

Revisar:
- Deployments: últimos cambios
- Analytics: traffic y performance
- Logs: errores o warnings
- Settings: variables de entorno

---

## ACTUALIZACIONES Y CAMBIOS

### Hacer Cambios en Código

1. En tu máquina local:
   git checkout main
   git pull origin main
   git checkout -b feature/description

2. Hacer cambios y commit:
   git add .
   git commit -m "feat: descripcion"

3. Push a GitHub:
   git push origin feature/description

4. Crear Pull Request en GitHub
   - Describe cambios
   - Pide review si necesario
   - Merge cuando esté aprobado

5. Vercel automáticamente:
   - Crea preview deployment
   - Después del merge → deploy a producción
   - Tiempo: 2-5 minutos

### Verificar Antes de Cambios

```bash
cd "C:\Users\NACHO PC\Desktop\newzelland-ceramicas"

# Compilar TypeScript
npm run build --prefix backend
npm run build --prefix frontend

# Test local (si tienes tests)
npm test

# Revisar cambios
git diff
git status
```

### Después de Deploy a Producción

```bash
# Esperar 2-3 minutos
# Luego test:
curl https://newzelland-ceramicas.vercel.app/api/health

# Si algo está roto: ROLLBACK inmediato
# Ver EMERGENCY-RUNBOOK.md sección ROLLBACK
```

---

## BASE DE DATOS

### Backup de Datos

Si usas Vercel Postgres:

```bash
# Ver BD disponibles
vercel postgres list

# Conectar a BD
psql postgresql://...

# Dump de toda la BD
pg_dump postgresql://... > backup-2026-07-08.sql

# Guardar en lugar seguro (Cloud Storage, Dropbox, etc)
```

### Restaurar Backup

```bash
psql postgresql://... < backup-2026-07-08.sql
```

### Mantenimiento de BD

```bash
# Conectar a BD
psql postgresql://...

# Ver tamaño de tablas
\dt+

# Analizar para optimizar queries
ANALYZE;

# Ver índices
\di

# Salir
\q
```

---

## SEGURIDAD

### Cambiar JWT_SECRET (trimestral recomendado)

1. Generar nuevo:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

2. Actualizar en Vercel:
   Settings → Environment Variables → JWT_SECRET → [nuevo valor]

3. Redeploy:
   vercel --prod

4. NOTA: Los tokens JWT ya emitidos se invalidarán
   (Usuarios necesitarán login nuevamente)

### Cambiar SMTP_PASS (si Gmail lo pide)

1. Ir a: https://myaccount.google.com/apppasswords
2. Revocar la contraseña vieja
3. Generar una nueva
4. Actualizar en Vercel
5. Redeploy: vercel --prod

### Revisar Variables Sensibles

```bash
# Verificar que NO hay secretos en código
grep -r "sk_" backend/src/  # Stripe secret
grep -r "EAAJU" backend/src/  # WhatsApp token
grep -r "password" backend/src/  # DB password
grep -r "secret" backend/src/  # Genéricos

# Debe estar vacío (todos en variables de entorno, no en código)
```

### HTTPS

✅ Vercel proporciona automáticamente
✅ Certificado SSL renovado automáticamente
✅ Redirige HTTP → HTTPS automáticamente

No hay nada que hacer.

---

## PERFORMANCE

### Monitorear Lentitud

Si notas que la API está lenta:

1. Ver logs:
   vercel logs https://newzelland-ceramicas.vercel.app --follow

2. Buscar requests que toman mucho tiempo
   (verás duración de cada request)

3. Identificar endpoint lento

4. Revisar query de BD:
   - ¿Está indexada la columna WHERE?
   - ¿Trae datos innecesarios?
   - ¿Hay JOINs que no se necesitan?

5. Optimizar:
   - Agregar índice: CREATE INDEX idx_name ON table(column);
   - Paginar: SELECT ... LIMIT 50;
   - Denormalizar si es necesario

### Analytics en Vercel

https://vercel.com/dashboard/project/newzelland-ceramicas/analytics

Ver:
- Requests por hora
- Países visitantes
- Browsers usados
- Errores más comunes

---

## ESCALADO

### Si tráfico crece demasiado

Vercel tiene límites Serverless:
- 3 GB memoria por función
- 60 segundos timeout
- Concurrency automático (paga lo que usas)

Señales de que necesitas cambio:
- Errores frecuentes "out of memory"
- Requests timeouting (>55 seg)
- Facturas muy altas

Opciones:

A) Optimizar código (ver PERFORMANCE)

B) Vercel Pro Plan
   - $20/mes
   - Mejor soporte
   - Más concurrency

C) Migrar a Vercel Functions + DB dedicated
   (Costo: +$50-100/mes)

D) Cambiar hosting a Heroku/Render/Railway
   (Costo: +$7-50/mes dependiendo)

---

## COMUNICACIÓN CON EQUIPO

### Team Notifications

Cuando hagas deploy importante:

1. Notificar a usuarios/equipo:
   Email con:
   - Qué cambios
   - Cuándo empieza
   - Si hay downtime esperado

2. Formato:
   Subject: "Newzelland Cerámicas - Maintenance window 2026-07-09 02:00 UTC"
   
   Body:
   We will be performing maintenance on...
   Expected downtime: 15 minutes
   Features affected: [list]
   
   Thank you for your patience.

### Incident Communication

Si hay problema:

1. Confirmar que es real (no falso positivo)

2. Notificar inmediatamente:
   Email + Slack (si tienes)
   Subject: "INCIDENT: Newzelland down"

3. Dar actualizaciones cada 15 min:
   "Investigating..."
   "Found root cause, fixing now..."
   "Fixed and tested, monitoring..."
   "All systems normal, post-mortem coming"

4. Después de resolver:
   Hacer post-mortem:
   - Qué pasó
   - Por qué pasó
   - Cómo prevenirlo en futuro

---

## CHECKLISTS

### Weekly (cada semana)

- [ ] Health check funciona
- [ ] No hay errores en logs
- [ ] Performance normal
- [ ] Backup de BD reciente

### Monthly (cada mes)

- [ ] Revisar Analytics de Vercel
- [ ] Revisar seguridad (buscar secrets)
- [ ] Actualizar dependencias (npm audit)
- [ ] Revisar costs en Vercel

### Quarterly (cada 3 meses)

- [ ] Cambiar JWT_SECRET
- [ ] Review de código
- [ ] Actualizaciones de seguridad
- [ ] Planificar escaldo si es necesario

### Yearly (cada año)

- [ ] Auditoría de seguridad completa
- [ ] Revisar contrato de Vercel
- [ ] Considerar cambios de arquitectura
- [ ] Documentación actualizada

---

## CONTACTOS Y RECURSOS

### Recursos

- Vercel Dashboard: https://vercel.com/dashboard
- Vercel Docs: https://vercel.com/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Express.js Docs: https://expressjs.com/
- Node.js Docs: https://nodejs.org/docs/

### Email de Soporte

ignacio@ifeval.es

### URLs importantes

- Production: https://newzelland-ceramicas.vercel.app
- API: https://newzelland-ceramicas.vercel.app/api
- GitHub: [tu repo]
- Vercel: https://vercel.com/dashboard/project/newzelland-ceramicas

---

Documento: OPS-GUIDE.md
Última actualización: 2026-07-08
