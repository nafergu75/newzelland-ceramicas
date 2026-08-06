# 🚀 MIGRACIÓN A RENDER.COM (100% GRATIS)

**Tiempo estimado:** 5 minutos  
**Costo:** $0 (completamente gratuito indefinidamente)  
**Nota:** Cold starts ocasionales (primera carga: 30-50s, después normal)

---

## ✅ REQUISITOS

- [x] Cuenta GitHub (ya tienes)
- [x] Código en GitHub (ya está sincronizado)
- [x] Neon Database (ya está configurada)

---

## 🎯 PASO A PASO

### Paso 1: Crear cuenta en Render.com (2 min)

1. Ve a: https://render.com
2. Haz clic en **"Get started"**
3. Elige: **"Sign up with GitHub"**
4. Autoriza Render a acceder a tu GitHub
5. Completa el registro

---

### Paso 2: Crear nuevo Web Service (2 min)

1. En el dashboard, haz clic en **"New +"**
2. Selecciona: **"Web Service"**
3. Conecta tu repositorio: **nafergu75/newzelland-ceramicas**
4. Rellena:
   - **Name:** `newzelland-ceramicas`
   - **Environment:** `Node`
   - **Branch:** `master` (el repo no tiene rama `main`)
   - **Build Command:** `cd api && npm install && cd ../frontend && npm install && npm run build`
   - **Start Command:** `cd api && npm start`
   - **Plan:** Selecciona el plan **Free** (gratis)

5. Haz clic en **"Create Web Service"**

Render automáticamente:
- ✅ Detectará Node.js
- ✅ Instalará dependencias
- ✅ Ejecutará build
- ✅ Desplegará la aplicación

---

### Paso 3: Configurar variables de entorno (1 min)

1. En la página del servicio, ve a **"Environment"**
2. Haz clic en **"Add Environment Variable"**
3. Agrega estas variables:

```
CERAMICO_ENABLED=true
VITE_CERAMICO_ENABLED=true
ANTHROPIC_API_KEY=sk-ant-api03-[TU_CLAVE]
DATABASE_URL=[COPIA_DE_NEON]
DATABASE_URL_UNPOOLED=[COPIA_DE_NEON]
NODE_ENV=production
```

**Para obtener DATABASE_URL:**
1. Ve a https://console.neon.tech
2. Selecciona tu base de datos
3. Copia la connection string (con "pooled" para DATABASE_URL)

4. Haz clic en **"Save"**

---

### Paso 4: Verificar deployment (2 min)

1. Render debería mostrar status: **"Live"** (verde)
2. Tu URL será algo como: `https://newzelland-ceramicas.onrender.com`
3. Haz clic en la URL para verificar que carga

---

## ✅ VERIFICAR QUE FUNCIONA

### Prueba 1: Web carga (nota el cold start)
```bash
curl https://newzelland-ceramicas.onrender.com/
# Primera vez: ~30-50s
# Después: ~1-2s
```

### Prueba 2: API responde
```bash
curl -X POST https://newzelland-ceramicas.onrender.com/api/ceramico \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola", "conversationHistory": [], "postalCode": "28001"}'
# Debería devolver respuesta de Claude
```

### Prueba 3: Botón flotante visible
1. Abre https://newzelland-ceramicas.onrender.com
2. Ve a /collections
3. Debería ver botón circular en esquina inferior derecha

---

## 💡 ENTENDER LOS "COLD STARTS"

**¿Qué es?**
- Render detiene la aplicación si no hay tráfico durante 15 minutos
- Cuando llega la primera solicitud, arranca el servidor (toma 30-50s)
- Después de eso, funciona normal (1-2s)

**¿Es un problema para Cerámico?**
- ❌ Primera carga del día: esperar 30-50s
- ✅ Siguientes cargas: normal
- ✅ Para usuarios que usan la web regularmente: no lo notarán
- ✅ Para un sitio de negocios: aceptable

**Alternativa si no quieres cold starts:**
- Pagar €5/mes en Railway
- O pagar €20/mes en Vercel Pro

---

## 🎁 VENTAJAS DE RENDER

| Aspecto | Costo | Cold Starts | Funciones |
|---------|-------|------------|-----------|
| **Render Free** | $0 | Sí | Ilimitadas |
| **Railway Hobby** | €5/mes | No | Ilimitadas |
| **Vercel Pro** | €20/mes | No | Ilimitadas |

**Render ofrece el mejor price-to-performance gratuito.**

---

## 🚨 TROUBLESHOOTING

### Error: "Build failed"
```
→ Verifica Build Command en la consola de Render
→ Verifica que package.json no tiene nodemailer-sendgrid-transport
→ Revisa los logs en Render Dashboard
```

### Error: "API no responde"
```
→ Verifica ANTHROPIC_API_KEY está configurada
→ Verifica DATABASE_URL es correcta
→ Puede ser cold start, espera 30-50s
→ Revisa logs en Render
```

### Aplicación se "duerme"
```
→ Normal en plan Free
→ Primera solicitud tras 15min sin usar: 30-50s
→ Esto es por diseño de Render Free
→ Para evitarlo: pagar €5/mes (Railway) o €20/mes (Vercel Pro)
```

---

## 📊 DESPUÉS DE MIGRAR

```
GitHub
  ↓ (ya sincronizado)
Render.com
  ↓ (deployment automático)
Cerámico en producción
  ↓
https://newzelland-ceramicas.onrender.com
```

Cada vez que hagas push a GitHub, Render redeploya automáticamente.

---

## ✨ RESULTADO FINAL

✅ Cerámico completamente operativo en producción  
✅ $0 costo (100% gratis para siempre)  
✅ Sin límite de funciones  
✅ Actualizaciones automáticas desde GitHub  
⚠️ Cold starts ocasionales (30-50s primera carga)

**¡Listo!** 🚀

