# Configuración de Stripe (OPCIONAL)

**ESTADO:** Paso opcional para pagos en vivo

## Paso 1: Obtener Live Keys de Stripe

1. Ve a: https://dashboard.stripe.com/apikeys
2. **IMPORTANTE:** Verifica que estés en modo **LIVE** (no Test)
   - En la parte superior izquierda, verás "Live" o "Test"
   - Si dice "Test", cambia a "Live"
3. Copia ambas claves:
   - **Secret Key**: comienza con `sk_live_...`
   - **Publishable Key**: comienza con `pk_live_...`

## Paso 2: Agregar a Vercel

Environment Variables → Production:

```
STRIPE_SECRET: sk_live_51234567890...
STRIPE_PUBLIC: pk_live_9876543210...
```

## Paso 3: Configurar Webhook

1. Ve a: https://dashboard.stripe.com/webhooks
2. Click: **Add endpoint**
3. URL del endpoint:
   ```
   https://newzelland-ceramicas.vercel.app/api/stripe/webhook
   ```
4. Selecciona eventos:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `customer.created`
5. Click: **Add endpoint**
6. Copia el **Signing secret** (comienza con `whsec_...`)
7. Agrega a Vercel:
   ```
   STRIPE_WEBHOOK_SECRET: whsec_...
   ```

## Paso 4: Test (en navegador)

```
https://newzelland-ceramicas.vercel.app/checkout

Número: 4242 4242 4242 4242
Fecha: 12/25
CVC: 123
```

## Troubleshooting

### "Webhook rejected"
- Verifica que el signing secret sea exacto
- Espera 2 minutos después de agregar webhook
- Revisa logs en Stripe Dashboard → Events

### "Payment failed"
- Verifica que estés en modo LIVE (no Test)
- Revisa logs de Vercel: `vercel logs --follow`

---

**Proxima paso:** PASO 8 - Configurar WhatsApp (opcional)
