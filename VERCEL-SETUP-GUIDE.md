# Guía de Configuración Manual en Vercel Dashboard

## Paso 1: Acceder a Vercel

Ve a: https://vercel.com/dashboard/project/newzelland-ceramicas

## Paso 2: Navegar a Environment Variables

1. Click en **Settings**
2. En la izquierda, busca **Environment Variables**
3. Verás una tabla con las variables existentes

## Paso 3: Agregar Variables (copia y pega estos valores)

### SEGURIDAD - Production only

```
Nombre: JWT_SECRET
Valor: dcd4991b85a2f05a6f28813d2a48b0b1d302375042ff94f12e5b61d3aa5b74db
Ambiente: Production
```

```
Nombre: NODE_ENV
Valor: production
Ambiente: Production
```

```
Nombre: ADMIN_TOKEN
Valor: [generar con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
Ambiente: Production
```

### APLICACIÓN - Todos los ambientes

```
Nombre: FRONTEND_URL
Valor: https://newzelland-ceramicas.vercel.app
Ambiente: Production, Preview, Development
```

```
Nombre: API_URL
Valor: https://newzelland-ceramicas.vercel.app/api
Ambiente: Production, Preview, Development
```

```
Nombre: JWT_EXPIRATION
Valor: 7d
Ambiente: Production, Preview, Development
```

### DATABASE - Todos los ambientes

**NOTA:** Espera a completar PASO 5 (Vercel Postgres) para obtener estos valores

```
Nombre: DB_HOST
Valor: [de Vercel Postgres]
Ambiente: Production, Preview, Development
```

```
Nombre: DB_PORT
Valor: 5432
Ambiente: Production, Preview, Development
```

```
Nombre: DB_NAME
Valor: newzeland_ecommerce
Ambiente: Production, Preview, Development
```

```
Nombre: DB_USER
Valor: [de Vercel Postgres]
Ambiente: Production, Preview, Development
```

```
Nombre: DB_PASSWORD
Valor: [de Vercel Postgres]
Ambiente: Production only
```

### SMTP (Email) - Todos los ambientes

```
Nombre: SMTP_HOST
Valor: smtp.gmail.com
Ambiente: Production, Preview, Development
```

```
Nombre: SMTP_PORT
Valor: 587
Ambiente: Production, Preview, Development
```

```
Nombre: SMTP_USER
Valor: [tu email@gmail.com]
Ambiente: Production, Preview, Development
```

```
Nombre: SMTP_PASS
Valor: [Gmail App Password de 16 caracteres]
Ambiente: Production only
```

```
Nombre: SMTP_FROM
Valor: noreply@newzeland.es
Ambiente: Production, Preview, Development
```

### STRIPE (Opcional - cuando tengas Live keys)

```
Nombre: STRIPE_SECRET
Valor: sk_live_...
Ambiente: Production only
```

```
Nombre: STRIPE_PUBLIC
Valor: pk_live_...
Ambiente: Production, Preview, Development
```

```
Nombre: STRIPE_WEBHOOK_SECRET
Valor: whsec_...
Ambiente: Production only
```

### WhatsApp (Opcional)

```
Nombre: WHATSAPP_TOKEN
Valor: EAAJU...
Ambiente: Production only
```

```
Nombre: WHATSAPP_PHONE_ID
Valor: [tu phone ID]
Ambiente: Production, Preview, Development
```

```
Nombre: WHATSAPP_BUSINESS_ACCOUNT_ID
Valor: [tu business account ID]
Ambiente: Production, Preview, Development
```

```
Nombre: WHATSAPP_VERIFY_TOKEN
Valor: [cualquier string seguro]
Ambiente: Production, Preview, Development
```

## Paso 4: Verificar

Después de agregar cada variable, deberías ver:
- La variable aparece en la lista
- Dice "Encrypted" si es sensible
- El checkbox muestra qué ambientes tiene activados

## Paso 5: Redeploy

Una vez agregadas las variables críticas (JWT_SECRET, FRONTEND_URL, API_URL):

1. Ve a **Deployments**
2. Click en el deployment más reciente
3. Click en el botón **Redeploy** (o **Promote to Production**)
4. Espera 2-5 minutos a que complete

## Verificación Rápida

Después del redeploy:

```bash
# Test health endpoint
curl https://newzelland-ceramicas.vercel.app/api/health

# Debe responder:
# {"status":"ok"}
```

## Checklist Final

- [ ] JWT_SECRET agregado (Production)
- [ ] NODE_ENV agregado (Production)
- [ ] FRONTEND_URL agregado
- [ ] API_URL agregado
- [ ] SMTP variables agregadas
- [ ] DB variables agregadas (cuando tengas Postgres)
- [ ] Redeploy completado
- [ ] Health check funciona

---

**Notas:**
- Los valores sensibles (password, tokens) solo agrégalos en ambientes Production
- Los values no sensibles (URLs, puertos) agrégalos en todos los ambientes
- Si cambias una variable Production, no es necesario redeploy - se aplica al siguiente
- Si cambias variables Development/Preview, Vercel avisa cuando hay cambios
