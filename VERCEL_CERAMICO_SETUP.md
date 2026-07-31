# Vercel Setup para Cerámico - Integración Completa

## Estado del repositorio

✅ **GitHub sincronizado:**
- Último commit: `35da7fd` (Vercel build configuration fix)
- Anterior commit: `9078e7c` (Cerámico integración completa Phases 1-5)
- 48 archivos nuevos/modificados
- 13,142 líneas de código nuevo

## Pasos para configurar Vercel

### 1. Acceder a Vercel Dashboard

1. Ve a https://vercel.com/dashboard
2. Busca el proyecto `newzelland-ceramicas`
3. Haz clic para entrar

### 2. Configurar Environment Variables

**Importante:** Las variables deben estar configuradas para **Production** y (opcionalmente) **Preview**.

#### 2.1 Variable: CERAMICO_ENABLED

- **Nombre:** `CERAMICO_ENABLED`
- **Valor:** `true`
- **Ambientes:** Production, Preview
- **Descripción:** Activa el chatbot Cerámico en el servidor

#### 2.2 Variable: VITE_CERAMICO_ENABLED

- **Nombre:** `VITE_CERAMICO_ENABLED`
- **Valor:** `true`
- **Ambientes:** Production, Preview
- **Descripción:** Activa el widget de Cerámico en el frontend (Vite)

#### 2.3 Variable: ANTHROPIC_API_KEY

- **Nombre:** `ANTHROPIC_API_KEY`
- **Valor:** `sk-ant-api03-...` (tu clave real de Anthropic)
- **Ambientes:** Production
- **Descripción:** Clave de API para conectar con Claude AI

#### 2.4 Variable: VITE_API_URL (opcional, pero recomendado)

- **Nombre:** `VITE_API_URL`
- **Valor:** (dejar vacío para usar el default)
- **Ambientes:** Production, Preview
- **Nota:** En producción, Vercel automáticamente usa rutas relativas. Si no está configurada, usa `http://localhost:3000/api` en desarrollo.

**Pasos para añadir variables:**

1. Haz clic en **Settings** → **Environment Variables**
2. Haz clic en **Add Environment Variable**
3. Rellena los campos:
   - **Name:** (nombre de la variable, ej. `CERAMICO_ENABLED`)
   - **Value:** (el valor, ej. `true`)
   - **Select Environments:** (elige Production y/o Preview)
4. Haz clic en **Save**
5. Repite para cada variable

### 3. Verificar Build Settings

1. Ve a **Settings → Build & Development Settings**
2. Verifica que estos campos están correctos:
   - **Framework Preset:** `Vite` (o auto-detectado)
   - **Build Command:** `cd api && npm install && cd ../frontend && npm install && npm run build`
   - **Output Directory:** `frontend/dist`
   - **Node.js Version:** `24.x` (o mayor que 18)

3. Si el **Build Command** no es el correcto, actualízalo manualmente.

### 4. Forzar Redeploy

1. Ve a **Deployments**
2. Haz clic en el último deployment (o en el que tenga status fallido)
3. Haz clic en **Redeploy** → **Redeploy to Production**
4. Espera a que termine (puede tomar 15-30 minutos)

### 5. Verificar Logs de Build

Después del redeploy, revisa los **Build Logs** para asegurar que no hay errores:

1. En la página del deployment, haz clic en **Build Logs**
2. Busca errores relacionados con:
   - `ceramico-ai.js`
   - `/api/ceramico`
   - `ANTHROPIC_API_KEY`
   - Importes faltantes (`@anthropic-ai/sdk`, `pdfkit`, `nodemailer`)

**Errores comunes y soluciones:**

| Error | Solución |
|-------|----------|
| `Cannot find module '@anthropic-ai/sdk'` | Asegúrate de que `api/package.json` tiene la dependencia. Verifica en GitHub que el archivo fue subido. |
| `ANTHROPIC_API_KEY is not defined` | Verifica que la variable de entorno está configurada en Vercel (Settings → Environment Variables). |
| `Cannot find module './ceramico-ai'` | El archivo `api/ceramico-ai.js` debe existir. Verifica en GitHub. |
| Build timeout | Aumenta el timeout en Vercel (Settings). Por defecto es 45 minutos. |

### 6. Verificar Runtime Logs

Después del redeploy, verifica que no hay errores en runtime:

1. Ve a **Logs → Runtime Logs** (o **Observability** en versiones nuevas)
2. Busca mensajes de Cerámico
3. Asegúrate de que no hay errores de "ANTHROPIC_API_KEY" o conectividad

## Verificación en Producción

Una vez que el redeploy esté completo, prueba en:

### URL de Producción

```
https://newzelland-ceramicas.vercel.app
```

(O tu dominio personalizado si lo tienes configurado)

### Tests de verificación

1. **Botón flotante visible:**
   - Abre la web
   - Navega a `/collections` o cualquier página
   - Verifica que hay un botón circular en la esquina inferior derecha
   - Tooltip: "Cerámico · Asistente de catálogo"

2. **Widget de chat:**
   - Haz clic en el botón
   - Verifica que el panel se abre con animación
   - Debe mostrar el mensaje de bienvenida

3. **Prueba de conversación:**
   - Pregunta: "¿Qué series tenéis?"
   - Esperado: Lista de series disponibles
   - Si falla: Abre DevTools → Console y busca errores

4. **Análisis de sentimiento:**
   - Pregunta: "Estoy muy frustrado"
   - Verificar que la respuesta es empática

5. **Cálculo de precios:**
   - Pregunta: "¿Cuánto cuesta 50 m² de BOSCO 60x120?"
   - Esperado: Cálculo con número de cajas y precio total

## Checklist de Deployment

- [ ] Variables de entorno configuradas en Vercel (CERAMICO_ENABLED, VITE_CERAMICO_ENABLED, ANTHROPIC_API_KEY)
- [ ] Build Command configurado correctamente en Vercel
- [ ] Redeploy completado sin errores
- [ ] Build Logs limpios (sin errores de Cerámico)
- [ ] Runtime Logs limpios
- [ ] Botón flotante visible en producción
- [ ] Widget de chat abre correctamente
- [ ] Conversación de prueba responde correctamente
- [ ] Console del navegador sin errores JavaScript
- [ ] Red requests a `/api/ceramico` devuelven Status 200

## Troubleshooting

### El botón no aparece
1. Abre DevTools → Console
2. Busca errores que mencionen "CeramicoButton" o "VITE_CERAMICO_ENABLED"
3. Verifica que `VITE_CERAMICO_ENABLED=true` en Vercel

### El widget abre pero no responde
1. Abre DevTools → Network
2. Haz una pregunta
3. Busca la request a `/api/ceramico`
4. Si falla con 503: `CERAMICO_ENABLED` no está en `true` en Vercel
5. Si falla con 500: Revisa Runtime Logs en Vercel para el error específico

### Error "ANTHROPIC_API_KEY is not defined"
1. En Vercel, ve a Settings → Environment Variables
2. Verifica que `ANTHROPIC_API_KEY` existe y tiene el valor completo (`sk-ant-...`)
3. Fuerza redeploy después de añadirla

### Build falla con "Cannot find module"
1. Verifica que todos los archivos están subidos a GitHub:
   - `api/ceramico-ai.js`
   - `api/price-calculator.js`
   - `api/ceramicoKnowledge.js`
   - `api/routes/ceramicoExport.js`
   - `api/utils/sentimentAnalysis.js`
   - etc.
2. Si faltan, añádelos y haz push de nuevo
3. Fuerza redeploy en Vercel

## Contacto y Soporte

Si tienes problemas durante el deployment, revisa:
- Logs de build: Vercel Dashboard → Deployments → Build Logs
- Logs de runtime: Vercel Dashboard → Logs → Runtime Logs
- Console del navegador: DevTools → Console
- Network requests: DevTools → Network → Filter by `/api/ceramico`

---

**Documento de referencia:** 2025-07-31
**Última actualización:** Sincronización completa de GitHub con Phases 1-5
