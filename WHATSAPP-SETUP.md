# Configuración de WhatsApp Bot (OPCIONAL)

**ESTADO:** Paso opcional para bot de notificaciones

## Paso 1: Crear App en Meta

1. Ve a: https://developers.facebook.com
2. Login o crea cuenta
3. Click: **My Apps** → **Create App**
4. **App Type**: Business
5. Completa los detalles básicos
6. Click: **Create**

## Paso 2: Agregar WhatsApp Product

1. En el dashboard de tu app, busca: **Add Product**
2. Busca: **WhatsApp**
3. Click: **Set Up**
4. Selecciona: **Phone Number**

## Paso 3: Obtener Token y IDs

En WhatsApp API Dashboard:

1. **API Token:**
   - Ir a: **Settings** → **API Access**
   - Click: **Generate Token**
   - Copia el token (comienza con `EAAJU...`)
   - Esto es tu `WHATSAPP_TOKEN`

2. **Phone Number ID:**
   - Ir a: **Getting Started**
   - En la sección "Sample Code", verás `PHONE_NUMBER_ID`
   - Copia ese valor
   - Esto es tu `WHATSAPP_PHONE_ID`

3. **Business Account ID:**
   - Ir a: **Settings** → **Business Accounts**
   - Copia el ID
   - Esto es tu `WHATSAPP_BUSINESS_ACCOUNT_ID`

## Paso 4: Generar Verify Token

Este es un token que tú eliges (para webhook verification):

```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
# Resultado: abc123def456... (copia esto)
```

Esto es tu `WHATSAPP_VERIFY_TOKEN`

## Paso 5: Agregar a Vercel

Environment Variables → Production:

```
WHATSAPP_TOKEN: EAAJU...
WHATSAPP_PHONE_ID: 123456789
WHATSAPP_BUSINESS_ACCOUNT_ID: 987654321
WHATSAPP_VERIFY_TOKEN: abc123def456...
```

## Paso 6: Configurar Webhook

1. En Meta Dashboard → App Settings → Webhooks
2. Click: **Edit**
3. **Callback URL:**
   ```
   https://newzelland-ceramicas.vercel.app/api/whatsapp/webhook
   ```
4. **Verify Token:** [El WHATSAPP_VERIFY_TOKEN que generaste arriba]
5. Selecciona eventos: `message`
6. Click: **Save and Continue**

## Paso 7: Test

Enviar mensaje de prueba a tu número:

```bash
curl -X POST https://newzelland-ceramicas.vercel.app/api/whatsapp/send \
  -H "Authorization: Bearer [WHATSAPP_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "34612345678",
    "message": "Test desde Newzelland"
  }'
```

## Troubleshooting

### "Webhook not responding"
- Verifica que tu Verify Token sea exacto
- Redeploy: `vercel --prod`
- Espera 2 minutos

### "Message not sent"
- Revisa logs: `vercel logs --follow`
- Verifica que WHATSAPP_TOKEN sea válido
- Verifica formato de número (debe ser código país + número)

---

**Proxima paso:** PASO 9 - Verificaciones finales
