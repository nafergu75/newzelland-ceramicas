# Configuración Stripe - FASE 7
**Fecha:** 2026-07-08  
**Estado:** ✅ OPCIONES DOCUMENTADAS

---

## Sobre Stripe

**Propósito:** Procesar pagos con tarjeta de crédito  
**Modelos:** Test mode (desarrollo) + Live mode (producción)  
**Comisión:** 2.9% + €0.30 por transacción  
**Soporte:** Español disponible

---

## Opción 1: Activar Stripe (Recomendado)

### PASO 1: Crear cuenta Stripe

1. Ir a **https://stripe.com/es** (seleccionar Spanish)
2. Click **Comenzar** (Start)
3. Registrarse con email de negocios
4. Completar formulario:
   - Nombre empresa: **Newzelland Cerámicas SL**
   - País: **España**
   - Industria: **Retail / Commerce**
   - Volumen mensual: **€1,000 - €10,000** (estimado)
5. Verificar email
6. Dar acceso a dashboard

### PASO 2: Obtener Test Keys

1. Dashboard Stripe → **Developers** → **API Keys**
2. Verificar que está en **Test mode** (botón arriba a la derecha)
3. Copiar:
   - **Publishable key:** `pk_test_51xxxxx...`
   - **Secret key:** `sk_test_51xxxxx...`

### PASO 3: Crear Webhook

1. Dashboard → **Developers** → **Webhooks**
2. **Add endpoint**
3. Endpoint URL: `https://newzelland-ceramicas.vercel.app/api/checkout/webhook`
4. Seleccionar eventos:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Click **Add endpoint**
6. Copiar **Signing secret:** `whsec_test_xxxxx`

### PASO 4: Cargar en Vercel

**Settings** → **Environment Variables** → Agregar:

| Variable | Valor | Modo |
|----------|-------|------|
| STRIPE_PUBLIC | pk_test_51xxxxx... | Test |
| STRIPE_SECRET | sk_test_51xxxxx... | Test |
| STRIPE_WEBHOOK_SECRET | whsec_test_xxxxx | Test |

### PASO 5: Implementación en Backend

**Ubicación:** `backend/src/services/stripeService.ts`

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  apiVersion: '2023-10-16',
});

export const createPaymentIntent = async (
  amount: number,           // en centavos (ej: 9999 = €99.99)
  orderId: string,
  customerEmail: string
) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,                 // en centavos
    currency: 'eur',
    metadata: {
      orderId,
      customerEmail,
    },
    receipt_email: customerEmail,
  });

  return {
    clientSecret: paymentIntent.client_secret,
    intentId: paymentIntent.id,
  };
};

export const handleWebhook = async (event: Stripe.Event) => {
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const { orderId } = paymentIntent.metadata as any;

      // Marcar orden como pagada
      await query(
        'UPDATE orders SET status = $1 WHERE id = $2',
        ['completed', orderId]
      );
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const { orderId } = paymentIntent.metadata as any;

      // Marcar orden como fallida
      await query(
        'UPDATE orders SET status = $1 WHERE id = $2',
        ['failed', orderId]
      );
      break;
    }
  }
};
```

**Ubicación:** `backend/src/routes/checkout.ts`

```typescript
import express, { Router } from 'express';
import { createPaymentIntent, handleWebhook } from '../services/stripeService';
import { authMiddleware } from '../middleware/auth';
import { query } from '../db/connection';

const router = Router();

// Crear PaymentIntent para checkout
router.post('/create-payment-intent', authMiddleware, async (req, res) => {
  try {
    const { items, total } = req.body;
    const userId = (req as any).user.id;

    // Validar
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in order' });
    }

    // Crear orden en BD
    const orderResult = await query(
      `INSERT INTO orders (user_id, items, total, status, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id`,
      [userId, JSON.stringify(items), total, 'pending']
    );

    const orderId = orderResult.rows[0].id;

    // Crear PaymentIntent en Stripe
    const { clientSecret, intentId } = await createPaymentIntent(
      Math.round(total * 100),  // convertir a centavos
      orderId,
      (req as any).user.email
    );

    res.json({
      clientSecret,
      orderId,
      intentId,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook de Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );

    await handleWebhook(event);
    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
```

---

## Opción 2: Desactivar Stripe (por ahora)

Si no quieres pagos online inicialmente:

### Configurable en Vercel

```
STRIPE_PUBLIC = disabled
STRIPE_SECRET = disabled
STRIPE_WEBHOOK_SECRET = disabled
```

### En código

```typescript
if (process.env.STRIPE_PUBLIC === 'disabled') {
  // Checkout offline
  // Mostrar opción: "Solicitar presupuesto" en lugar de pago online
}
```

---

## Migrar de Test a Live (después)

### PASO 1: Completar verificación

1. Dashboard Stripe → **Settings** → **Account details**
2. Completar información de empresa
3. Verificar identidad
4. Aceptar términos

Puede tomar 2-5 días para aprobación.

### PASO 2: Obtener Live Keys

1. Dashboard → **Developers** → **API Keys**
2. Click en toggle **Live mode** (arriba)
3. Copiar:
   - **Publishable key:** `pk_live_51xxxxx...`
   - **Secret key:** `sk_live_51xxxxx...`

### PASO 3: Actualizar Vercel

1. **Settings** → **Environment Variables**
2. Cambiar valores:
   ```
   STRIPE_PUBLIC = pk_live_51xxxxx...  (cambiar de test a live)
   STRIPE_SECRET = sk_live_51xxxxx...  (cambiar de test a live)
   STRIPE_WEBHOOK_SECRET = whsec_live_xxxxx
   ```
3. Guardare deploy automático

### PASO 4: Crear nuevo Webhook

1. Dashboard → **Developers** → **Webhooks**
2. **Add endpoint** (para Live mode)
3. Mismo URL: `https://newzelland-ceramicas.vercel.app/api/checkout/webhook`
4. Copiar nuevo signing secret

---

## Test de Pago en Modo Test

### Tarjetas de test Stripe

Usar en formulario de pago:

| Escenario | Número | Exp | CVC |
|-----------|--------|-----|-----|
| Pago exitoso | 4242 4242 4242 4242 | 12/26 | 123 |
| Pago rechazado | 4000 0000 0000 0002 | 12/26 | 123 |
| 3D Secure | 4000 0025 0000 3155 | 12/26 | 123 |
| Falta CVC | 4000 0000 0000 0010 | 12/26 | (cualquiera) |

### Test Request

```bash
# 1. Crear orden
curl -X POST https://newzelland-ceramicas.vercel.app/api/checkout/create-payment-intent \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId": "1", "quantity": 1, "price": 45.99}],
    "total": 45.99
  }'

# Respuesta:
# {"clientSecret": "pi_test_xxx_secret_xxx", "orderId": "uuid"}

# 2. Completa pago en frontend con Stripe.js
# 3. Webhook debe actualizar orden a "completed"
```

---

## Monitoreo

### Dashboard Stripe

- **Payments:** Ver todas las transacciones
- **Customers:** Datos de clientes
- **Disputes:** Chargebacks
- **Events:** Logs de webhooks

### Logs de Vercel

```
Vercel Dashboard → Deployments → Logs

Buscar:
"Payment intent succeeded"
"Payment intent failed"
"Webhook error"
```

---

## Tarifas Stripe

| Transacción | Tarifa |
|------------|--------|
| Pago con tarjeta | 2.9% + €0.30 |
| Transferencia a cuenta bancaria | Gratis |
| Retiro (10+ retiradas/mes) | Gratis |

**Ejemplo:** Venta de €100
- Stripe cobra: €3.20 (2.9% + €0.30)
- Tu ganancia: €96.80

---

## Alternativas a Stripe

### PayPal
```
PAYPAL_CLIENT_ID = <id>
PAYPAL_SECRET = <secret>
```

### Adyen
```
ADYEN_API_KEY = <key>
ADYEN_MERCHANT = <merchant>
```

### Redsys (España)
```
REDSYS_MERCHANT_ID = <id>
REDSYS_TERMINAL = <terminal>
REDSYS_SECRET = <secret>
```

---

## Resumen

| Opción | Test Keys | Live Keys | Activación | Status |
|--------|-----------|-----------|------------|--------|
| **Stripe activado** | ✅ Sí | ⏳ Después | Inmediato | ⏳ Hacer |
| **Stripe desactivado** | ❌ No | ❌ No | Más tarde | ⏳ Opcional |

---

## Próximo Paso: FASE 8
Ver documento: `WHATSAPP-SETUP-FINAL.md`

**Stripe:** ✅ Documentado  
**Test Keys:** Listos para obtener  
**Live Keys:** Después de verificación (2-5 días)
