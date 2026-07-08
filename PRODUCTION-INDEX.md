# PRODUCTION-INDEX.md

Índice Completo de Documentación de Producción
Newzelland Cerámicas - https://newzelland-ceramicas.vercel.app

---

## EMPEZAR AQUÍ

1. Leer: PRODUCTION-SETUP-SUMMARY.md (5 min)
   └─ Resumen de los 10 pasos completados
   └─ Próximos pasos inmediatos
   └─ Checklist final

2. Ejecutar BASE DE DATOS (15 min)
   └─ Guía: DATABASE-SETUP.md

3. Configurar VERCEL (20 min)
   └─ Guía: VERCEL-SETUP-GUIDE.md

4. Configurar EMAIL (10 min)
   └─ Guía: EMAIL-SETUP.md

5. Verificar TODO (5 min)
   └─ Guía: FINAL-VERIFICATION.md

---

## DOCUMENTOS POR SECCIÓN

### SEGURIDAD Y CONFIGURACIÓN INICIAL

PRODUCTION-SETUP-SUMMARY.md
├─ Resumen de 10 pasos
├─ Variables críticas
├─ Verificación de seguridad
└─ Próximos pasos

.env.production.local (en .gitignore, usar como template)
├─ Variables por completar
├─ Comentarios de cada variable
└─ Valores placeholder seguros

### CONFIGURACIÓN MANUAL (PASO A PASO)

VERCEL-SETUP-GUIDE.md
├─ Acceder a Vercel Dashboard
├─ Agregar variables por ambiente
├─ Checklist de variables
└─ Verificación rápida

DATABASE-SETUP.md
├─ Vercel Postgres (RECOMENDADO)
├─ PostgreSQL alternativo
├─ Ejecutar migraciones
├─ Troubleshooting de conexión
└─ Test local con psql

EMAIL-SETUP.md
├─ Habilitar 2-Factor en Gmail
├─ Generar App Password
├─ Agregar a Vercel
├─ Test local de email
└─ Troubleshooting SMTP

STRIPE-SETUP.md (OPCIONAL)
├─ Obtener Live keys
├─ Configurar webhooks
├─ Test de pagos
└─ Troubleshooting de pagos

WHATSAPP-SETUP.md (OPCIONAL)
├─ Crear app en Meta
├─ Obtener tokens y IDs
├─ Configurar webhooks
├─ Test de mensajes
└─ Troubleshooting de WhatsApp

### VERIFICACIÓN Y TESTING

FINAL-VERIFICATION.md
├─ Health check (/api/health)
├─ Headers de seguridad
├─ CORS funciona
├─ Endpoints clave
├─ Logs de Vercel
├─ Checklist completo
└─ Troubleshooting común

### OPERACIONES Y MONITOREO

OPS-GUIDE.md
├─ Monitoreo diario
├─ Actualizaciones de código
├─ Backup de base de datos
├─ Seguridad
├─ Performance
├─ Escalado
├─ Comunicación con equipo
└─ Checklists (semanal, mensual, anual)

### EMERGENCIAS Y TROUBLESHOOTING

EMERGENCY-RUNBOOK.md
├─ API Down / 502
├─ Database Connection Failed
├─ Email Not Sending
├─ Out of Memory / 503
├─ CORS Error
├─ Rollback a versión anterior
└─ Contacto de soporte

PRODUCTION-DEPLOY-SUCCESSFUL.md
├─ Estado de implementación
├─ Variables de entorno críticas
├─ Verificación de seguridad
├─ Monitoreo en producción
├─ Rollback procedimiento
└─ Checklist final

---

## URLS IMPORTANTES

PRODUCCIÓN
https://newzelland-ceramicas.vercel.app (frontend)
https://newzelland-ceramicas.vercel.app/api (API)

VERCEL DASHBOARD
https://vercel.com/dashboard/project/newzelland-ceramicas
Settings → Environment Variables
Settings → Logs
Deployments → History

HERRAMIENTAS EXTERNAS
Gmail App Passwords: https://myaccount.google.com/apppasswords
Stripe Live Keys: https://dashboard.stripe.com/apikeys
Meta Developer: https://developers.facebook.com
Vercel Status: https://www.vercelstatus.com

---

## VARIABLES DE ENTORNO

CRÍTICAS (Production only):
- JWT_SECRET: dcd4991b85a2f05a6f28813d2a48b0b1d302375042ff94f12e5b61d3aa5b74db
- NODE_ENV: production
- DB_PASSWORD: [tu password postgresql]
- SMTP_PASS: [gmail app password 16 chars]

IMPORTANTES (Todos ambientes):
- FRONTEND_URL: https://newzelland-ceramicas.vercel.app
- API_URL: https://newzelland-ceramicas.vercel.app/api
- JWT_EXPIRATION: 7d

DATABASE:
- DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD

SMTP:
- SMTP_HOST: smtp.gmail.com
- SMTP_PORT: 587
- SMTP_USER: tu_email@gmail.com
- SMTP_FROM: noreply@newzeland.es

OPCIONALES:
- STRIPE_SECRET, STRIPE_PUBLIC, STRIPE_WEBHOOK_SECRET
- WHATSAPP_TOKEN, WHATSAPP_PHONE_ID, etc.

---

## CHECKLIST RÁPIDO (¿QUÉ HAGO AHORA?)

SI RECIÉN EMPIEZAS:
[ ] Leer PRODUCTION-SETUP-SUMMARY.md
[ ] Ejecutar: vercel postgres connect
[ ] Agregar variables en Vercel Dashboard
[ ] Ejecutar: vercel --prod (redeploy)
[ ] Test: curl https://newzelland-ceramicas.vercel.app/api/health

SI YA TIENES PRODUCCIÓN CORRIENDO:
[ ] Ver logs: vercel logs --follow
[ ] Health check: curl /api/health
[ ] Revisar Analytics en Vercel Dashboard
[ ] Si algo falla: ver EMERGENCY-RUNBOOK.md
[ ] Operaciones diarias: ver OPS-GUIDE.md

SI ALGO EXPLOTA:
[ ] Abrir EMERGENCY-RUNBOOK.md
[ ] Identificar el problema (API, DB, Email, etc)
[ ] Seguir los pasos de resolución
[ ] Si no se arregla: email a ignacio@ifeval.es

---

## DIAGRAMA DE FLUJO

START
  ↓
¿Seguridad lista? (PASO 1-2)
  ├─ YES → PRODUCTION-SETUP-SUMMARY.md
  └─ NO → Revisar PRODUCTION-DEPLOY-SUCCESSFUL.md
  ↓
¿Variables de entorno en Vercel? (PASO 3)
  ├─ NO → VERCEL-SETUP-GUIDE.md
  └─ YES → CONTINUAR
  ↓
¿Base de datos configurada? (PASO 5)
  ├─ NO → DATABASE-SETUP.md
  └─ YES → CONTINUAR
  ↓
¿Email funciona? (PASO 6)
  ├─ NO → EMAIL-SETUP.md
  └─ YES → CONTINUAR
  ↓
¿Health check OK? (PASO 9)
  ├─ NO → FINAL-VERIFICATION.md
  └─ YES → PRODUCCIÓN LISTA
  ↓
PRODUCCIÓN CORRIENDO
  ├─ Monitoreo diario → OPS-GUIDE.md
  ├─ Problema → EMERGENCY-RUNBOOK.md
  └─ Cambios → Commit → Vercel auto-redeploy

---

## SOPORTE

EMAIL: ignacio@ifeval.es

DOCUMENTO PARA:
- Problema de API: EMERGENCY-RUNBOOK.md
- Operaciones diarias: OPS-GUIDE.md
- Configurar servicio: [SERVICIO]-SETUP.md
- Verificar sistema: FINAL-VERIFICATION.md
- Emergencia: EMERGENCY-RUNBOOK.md

---

## ESTADÍSTICAS

Documentos generados: 10
Pasos completados: 10/10
Variables configurables: 20+
Servicios soportados: Email, Stripe, WhatsApp
Monitoreo: 24/7 automático en Vercel

Última actualización: 2026-07-08
Estado: LISTO PARA PRODUCCIÓN

---

PRODUCTION-INDEX.md
Índice maestro de documentación
Crea en: 2026-07-08
