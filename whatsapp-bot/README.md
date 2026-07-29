# Bot de WhatsApp — Newzeland Cerámicas

Bot conversacional con IA (Claude) y RAG sobre el catálogo real de la marca. Es un
**proceso Node independiente**, no una función serverless: `whatsapp-web.js` necesita
mantener una sesión de navegador (Puppeteer) siempre viva, algo que Vercel no soporta.

## Arquitectura

```
WhatsApp  ⇄  whatsapp-web.js (Puppeteer)  ⇄  aiProvider (Claude, tool use)
                                                 │
                    ┌────────────────────────────┼──────────────────────────┐
                    ▼                            ▼                          ▼
            RAG (catalog_embeddings)   API pública (quote-requests)   whatsapp_conversations
            catálogo.json + projects   → dispara CRM/email ya          / whatsapp_messages
            (misma Postgres)             existentes en api/index.js    (misma Postgres)
```

- **No hay tablas `products`/`collections`** en la BD: el catálogo real vive en
  `frontend/src/data/catalogo.json`, servido también por HTTP en `GET /api/catalog`
  (añadido en `api/index.js` para que este servicio, desplegado aparte, no necesite
  acceso al sistema de ficheros del frontend).
- **RAG**: embeddings de cada serie del catálogo + cada proyecto publicado, generados
  con Voyage AI (recomendado por Anthropic), guardados en `catalog_embeddings`
  (JSONB) y comparados por similitud coseno en memoria — nada de pgvector ni un
  servicio de vectores aparte: a este volumen (~90-200 ítems) no hace falta.
- **Presupuestos y CRM**: el bot NO escribe directamente en `quote_requests` ni llama
  a Brevo — llama a `POST /api/quote-requests` (la misma API que usa la web), que ya
  dispara el hook de CRM y el email de confirmación implementados en E3. Cero lógica
  duplicada.
- **Handoff a humano**: al activarse, la conversación pasa a `estado = 'esperando_humano'`
  en `whatsapp_conversations` y el bot deja de responder en ese chat hasta que se
  reactive manualmente (`reactivarBot()` en `conversation/store.js`). No hay (todavía)
  una vista de admin para esto — ver "Próximos pasos".

## Requisitos antes de arrancar

1. **Claves de IA** (no las genero yo, son credenciales):
   - `ANTHROPIC_API_KEY` — [console.anthropic.com](https://console.anthropic.com)
   - `VOYAGE_API_KEY` — [dash.voyageai.com](https://dash.voyageai.com) (tiene tier gratuito)
2. Copiar `.env.example` a `.env` y rellenar (misma Postgres que `api/`, más las claves
   de arriba). Si ya tienes CRM (Brevo) configurado en Vercel, usa las mismas `CRM_*`.
3. Construir el índice RAG (una vez, y cada vez que cambie el catálogo o se publiquen proyectos):
   ```bash
   npm install
   npm run build-embeddings
   ```
4. Arrancar en local para vincular el número de WhatsApp (escanea el QR que aparece
   en terminal con WhatsApp → Dispositivos vinculados):
   ```bash
   npm start
   ```

## Despliegue (Railway, Render, Fly.io o VPS — no Vercel)

Incluye `Dockerfile`. Pasos generales:

1. Crear un servicio nuevo apuntando a este directorio (`whatsapp-bot/`) como raíz.
2. Configurar las mismas variables de `.env.example` en el panel del proveedor.
3. **Montar un volumen persistente en `/app/.wwebjs_auth`** — si no, cada redeploy
   borra la sesión y hay que re-escanear el QR. En Railway: Settings → Volumes.
4. Primer deploy: mirar los logs para escanear el QR (o usar `WWEBJS_HEADLESS=false`
   solo en local si prefieres ver el navegador).
5. Tras vincular, los redeploys posteriores no piden QR de nuevo (mientras el volumen
   persista).

## Multi-agente (escalabilidad)

Ahora mismo hay **un** agente Claude con 4 herramientas (`buscar_catalogo`,
`buscar_proyectos`, `crear_solicitud_presupuesto`, `derivar_a_humano`) — no varios
agentes LLM independientes. Es la opción correcta a este volumen: separar en varios
agentes que se pasan la conversación entre sí añade latencia y coste sin beneficio
real para un catálogo de 90 series. La estructura ya es modular
(`src/ai/tools.js`, `src/ai/systemPrompt.js`) para que, si en el futuro hace falta un
agente con personalidad/objetivo distinto (ej. un agente de post-venta con acceso a
`orders`), se añada como un nuevo `system prompt` + set de tools sin tocar el resto.

## Próximos pasos razonables (no implementados aquí)

- Vista en `/admin` para ver conversaciones en `esperando_humano` y poder reactivar
  el bot o responder manualmente (hoy solo se puede consultar/editar por SQL).
- Sincronizar leads de WhatsApp a Brevo aunque no lleguen a pedir presupuesto
  (requiere decidir cómo identificar el contacto en Brevo solo con teléfono, ya que
  Brevo indexa por email y el bot no lo tiene hasta que se crea un presupuesto).
- Cron para regenerar embeddings automáticamente cuando se publique un proyecto
  nuevo, en vez de requerir `npm run build-embeddings` manual.
