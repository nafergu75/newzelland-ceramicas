# Configuración WhatsApp Business API - FASE 8
**Fecha:** 2026-07-08  
**Estado:** ✅ OPCIONES DOCUMENTADAS

---

## Sobre WhatsApp Business API

**Propósito:** Chatbot y soporte automático vía WhatsApp  
**Proveedor:** Meta (Facebook)  
**Costo:** €0.50 - €1.00 por mensaje (dependiendo de tipo)  
**Requisitos:** Número de teléfono empresarial

---

## Opción 1: Usar WhatsApp Business (Recomendado)

### PASO 1: Configurar Meta Business

1. Ir a **https://business.facebook.com/**
2. Crear/acceder a cuenta empresarial
3. Crear aplicación Meta:
   - **My Apps** → **Create App**
   - **Type:** Business
   - **Name:** Newzelland Ceramicas
   - **Description:** Ecommerce WhatsApp integration

### PASO 2: Configurar WhatsApp

1. **Dashboard** → Seleccionar app
2. **Products** → Buscar **WhatsApp**
3. Click **Set up**
4. Seleccionar **WhatsApp Business Account**
5. Click **Create new account**
6. Ingresar información:
   - **Business Name:** Newzelland Cerámicas
   - **Phone Number:** Número de tu empresa (+34 xxx xxx xxx)
   - **Timezone:** Europe/Madrid

### PASO 3: Obtener Credenciales

1. **WhatsApp** → **API Setup**
2. Copiar:
   - **Phone Number ID:** `123456789012345`
   - **Business Account ID:** `123456789012345`
3. **Settings** → **API Credentials**
4. Generar **Access Token** (válido 60 días)
   - Token: `EAAxxxxxxxxxxxx`

### PASO 4: Configurar Webhook

1. **WhatsApp** → **Configuration**
2. **Webhook URL:**
   ```
   https://newzelland-ceramicas.vercel.app/api/whatsapp/webhook
   ```
3. **Verify Token** (generar aleatorio):
   ```
   verify_token_abc123def456
   ```
4. Seleccionar eventos:
   - `messages` (mensajes entrantes)
   - `message_status` (confirmación de envío)
   - `message_template_status_update`
5. Click **Save**

### PASO 5: Cargar en Vercel

**Settings** → **Environment Variables** → Agregar:

| Variable | Valor |
|----------|-------|
| WHATSAPP_TOKEN | EAAxxxxxxxxxxxx |
| WHATSAPP_PHONE_ID | 123456789012345 |
| WHATSAPP_BUSINESS_ACCOUNT_ID | 123456789012345 |
| WHATSAPP_VERIFY_TOKEN | verify_token_abc123def456 |

### PASO 6: Implementación en Backend

**Ubicación:** `backend/src/routes/whatsapp.ts`

```typescript
import express, { Router } from 'express';
import axios from 'axios';

const router = Router();

// Webhook para recibir mensajes
router.post('/webhook', express.json(), async (req, res) => {
  const body = req.body;

  // Verificar webhook (Meta lo requiere)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    } else {
      return res.status(403);
    }
  }

  // Procesar mensaje entrante
  try {
    const messages = body.entry[0].changes[0].value.messages;

    if (messages && messages[0]) {
      const message = messages[0];
      const senderNumber = message.from;
      const messageText = message.text?.body;

      console.log(`Mensaje de ${senderNumber}: ${messageText}`);

      // Procesar: catalogos, consultas, etc.
      let response = '';

      if (messageText?.toLowerCase().includes('catalogo')) {
        response = 'Aquí está nuestro catálogo: [link]';
      } else if (messageText?.toLowerCase().includes('precio')) {
        response = '¿De qué producto deseas saber el precio?';
      } else {
        response = 'Hola! Estamos aquí para ayudarte. ¿Qué necesitas?';
      }

      // Enviar respuesta
      await sendWhatsAppMessage(senderNumber, response);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Función para enviar mensajes
const sendWhatsAppMessage = async (recipientPhone: string, message: string) => {
  try {
    await axios.post(
      `https://graph.instagram.com/v17.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: recipientPhone,
        type: 'text',
        text: {
          body: message,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`Mensaje enviado a ${recipientPhone}`);
  } catch (error) {
    console.error('Error enviando WhatsApp:', error);
  }
};

// Endpoint manual para enviar mensaje (admin)
router.post('/send-message', express.json(), async (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ error: 'Phone and message required' });
  }

  try {
    await sendWhatsAppMessage(phone, message);
    res.json({ success: true, message: 'Enviado a ' + phone });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

**Ubicación:** `backend/src/app.ts` (agregar ruta)

```typescript
import whatsappRoutes from './routes/whatsapp';

app.use('/api/whatsapp', whatsappRoutes);
```

### PASO 7: Test de Webhook

Meta requiere que verifiques el webhook:

```bash
# Meta hará una petición GET a tu URL
# Tu código debe responder con el challenge

# Para testear localmente:
curl "http://localhost:3000/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=verify_token_abc123def456&hub.challenge=test_challenge"

# Debe retornar: test_challenge
```

---

## Opción 2: ChatAPI (Alternativa más simple)

Si no quieres completar toda la configuración de Meta:

### Usar ChatAPI

1. Ir a **https://www.chat-api.com/**
2. Registrarse
3. Obtener API Key
4. Configurar webhook similar

**Variables:**
```
CHATAPI_TOKEN = token_xxxxx
CHATAPI_WEBHOOK_URL = https://newzelland-ceramicas.vercel.app/api/chatapi/webhook
```

---

## Opción 3: Desactivar WhatsApp (por ahora)

Si no necesitas inmediatamente:

```
WHATSAPP_TOKEN = disabled
WHATSAPP_PHONE_ID = disabled
WHATSAPP_BUSINESS_ACCOUNT_ID = disabled
WHATSAPP_VERIFY_TOKEN = disabled
```

---

## Casos de uso comunes

### 1. Notificación de orden
```
Cliente: "¿Dónde está mi pedido?"
Bot: "Tu orden #12345 está en proceso. Te notificaremos cuando se envíe."
```

### 2. Catálogo por WhatsApp
```
Cliente: "Mostrar catálogos"
Bot: Envía 5 PDFs en archivo
```

### 3. Presupuestos automáticos
```
Cliente: "Presupuesto para 100m2 de Atlas Gris"
Bot: "Para 100m2 necesitas 70 cajas. Precio total: €3.219,30 + IVA"
```

### 4. Contacto con vendedor
```
Cliente: "Hablar con vendedor"
Bot: "Te transferimos a un vendedor. Espera un momento..."
Vendedor: Toma la conversación manualmente
```

---

## Número de teléfono WhatsApp

### Obtener número
1. Meta Business → WhatsApp Settings
2. **Phone Numbers** → Add phone number
3. Pueden usar número existente o comprar uno
4. Verificar con SMS/llamada

### Verificación
- Llevar 2-5 días
- Necesario para enviar mensajes

---

## Tarifas WhatsApp

| Tipo de mensaje | Costo (por mensaje) |
|-----------------|-------------------|
| Plantilla de servicio | €0.50 |
| Plantilla de marketing | €1.00 |
| Mensaje de usuario a empresa | Gratis |
| Notificación de orden | €0.50 |

**Ejemplo:** 100 notificaciones de orden = €50/mes

---

## Webhook Request/Response

### Request de Meta (mensaje entrante)
```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "ENTRY_ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "messages": [
              {
                "from": "34123456789",
                "id": "msg_id",
                "timestamp": "1671234567",
                "type": "text",
                "text": {
                  "body": "Hola!"
                }
              }
            ]
          }
        }
      ]
    }
  ]
}
```

### Response de tu servidor
```json
{
  "success": true
}
```

### Request para enviar mensaje
```bash
POST https://graph.instagram.com/v17.0/PHONE_ID/messages

{
  "messaging_product": "whatsapp",
  "to": "34123456789",
  "type": "text",
  "text": {
    "body": "Tu respuesta aquí"
  }
}

Headers:
Authorization: Bearer WHATSAPP_TOKEN
Content-Type: application/json
```

---

## Testing

### Test local (sin Meta)

```bash
# Simular webhook
curl -X POST http://localhost:3000/api/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "34123456789",
            "text": {"body": "Hola!"},
            "id": "msg_123"
          }]
        }
      }]
    }]
  }'
```

### Test en Vercel

1. Meta Business Panel → **Test messages**
2. Enviar mensaje a tu número
3. Verificar logs en Vercel Dashboard

---

## Monitoreo

### Meta Business Suite
- Messages → Ver historial
- Insights → Analytics de conversaciones
- Contacts → Números que te escriben

### Logs Vercel
```
Dashboard → Deployments → Logs

Buscar:
"Mensaje de" (incoming)
"Mensaje enviado a" (outgoing)
"WhatsApp webhook error" (errors)
```

---

## Mejores prácticas

1. **Responder rápido** - ideal <1 minuto
2. **Ser amable** - usar emoji, diálogos naturales
3. **Ofrecer alternativas** - "¿Te ayudo con algo más?"
4. **No spamear** - solo mensajes relevantes
5. **Usar plantillas** - para notificaciones (más barato)

---

## URLs finales

| Endpoint | Método | Propósito |
|----------|--------|-----------|
| /api/whatsapp/webhook | GET/POST | Webhook de Meta |
| /api/whatsapp/send-message | POST | Enviar manual (admin) |

---

## Próximo Paso: FASE 9
Ver documento: `PRODUCTION-DOCUMENTATION-FINAL.md`

**WhatsApp:** ✅ Documentado  
**Alternativas:** ChatAPI, desactivado  
**Status:** Listo para activar
