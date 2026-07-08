# QUICK START - PRODUCCIÓN

**Newzelland Cerámicas - Guía de 5 pasos (75 minutos)**

---

## PASO 1: Base de Datos (15 minutos)

```bash
cd "C:\Users\NACHO PC\Desktop\newzelland-ceramicas"
vercel postgres connect
```

Sigue instrucciones en CLI.

Documentación: DATABASE-SETUP.md

---

## PASO 2: Agregar Variables en Vercel (20 minutos)

Ve a: https://vercel.com/dashboard/project/newzelland-ceramicas

Settings → Environment Variables

Agrega estas variables siguiendo VERCEL-SETUP-GUIDE.md

Críticas:
- JWT_SECRET: dcd4991b85a2f05a6f28813d2a48b0b1d302375042ff94f12e5b61d3aa5b74db
- FRONTEND_URL: https://newzelland-ceramicas.vercel.app
- API_URL: https://newzelland-ceramicas.vercel.app/api

Documentación: VERCEL-SETUP-GUIDE.md

---

## PASO 3: Redeploy (5 minutos)

```bash
vercel --prod
```

Espera a que complete (2-5 minutos).

---

## PASO 4: Configurar Email (10 minutos)

Sigue: EMAIL-SETUP.md

Pasos rápidos:
1. Ve a: https://myaccount.google.com/security
2. Habilita 2-Step Verification
3. Genera App Password (16 caracteres)
4. Agrega a Vercel:
   - SMTP_HOST: smtp.gmail.com
   - SMTP_PORT: 587
   - SMTP_USER: tu_email@gmail.com
   - SMTP_PASS: [app password]

---

## PASO 5: Verificar (5 minutos)

```bash
curl https://newzelland-ceramicas.vercel.app/api/health
```

Debe responder: {"status":"ok"}

Si hay problemas: EMERGENCY-RUNBOOK.md

---

## LISTO

Producción corriendo en: https://newzelland-ceramicas.vercel.app

Para operaciones diarias: OPS-GUIDE.md
Para problemas: EMERGENCY-RUNBOOK.md
Para preguntas: PRODUCTION-INDEX.md

---

Tiempo total: 75 minutos
Email soporte: ignacio@ifeval.es
