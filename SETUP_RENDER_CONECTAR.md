# 🔗 CONECTAR REPOSITORIO A RENDER

Tu proyecto "newzeland-ceramicas" ya existe en Render. Ahora necesitamos conectarlo a GitHub.

---

## 🎯 PASO 1: Conectar Repositorio en Render (5 min)

1. **Abre tu proyecto en Render:**
   - Ve a: https://dashboard.render.com
   - Busca y abre: "newzeland-ceramicas"

2. **Conectar repositorio:**
   - Vas a "Settings" o "Deploy"
   - Busca opción: **"Connect Repository"** o **"GitHub"**
   - Selecciona: **nafergu75/newzelland-ceramicas**

3. **Configurar build:**

   En Render, rellena estos campos:
   
   ```
   Branch: master
   Build Command: cd api && npm install && cd ../frontend && npm install && npm run build
   Start Command: cd api && npm start
   Plan: Free (Gratis)
   ```

4. **Haz clic en "Create Web Service"**

---

## 🎯 PASO 2: Configurar Variables de Entorno (2 min)

Una vez que el repositorio está conectado:

1. En Render, ve a la sección: **"Environment"** del servicio
2. Haz clic en: **"Add Environment Variable"**
3. Agrega estas variables (una por una):

```
CERAMICO_ENABLED=true
VITE_CERAMICO_ENABLED=true
NODE_ENV=production
```

4. **Para ANTHROPIC_API_KEY:**
   - Ve a: https://console.anthropic.com
   - Busca tu API key
   - Cópiala completamente: `sk-ant-api03-...`
   - En Render, agrega:
     ```
     ANTHROPIC_API_KEY=sk-ant-api03-[TU_CLAVE_AQUI]
     ```

5. **Para DATABASE_URL:**
   - Ve a: https://console.neon.tech
   - Selecciona tu base de datos "newzelland-ceramicas"
   - Vas a "Connection String"
   - Copia la URL con "pooled"
   - En Render, agrega:
     ```
     DATABASE_URL=[LA_URL_QUE_COPIASTE]
     DATABASE_URL_UNPOOLED=[LA_URL_QUE_COPIASTE]
     ```

6. Haz clic en **"Save"**

---

## ✅ PASO 3: Verificar Deployment (5 min)

1. Render debería empezar a compilar automáticamente
2. Vas a "Logs" y esperas a ver: **"Live"** (verde) o **"Deployed successfully"**
3. Primera compilación tarda ~3-5 minutos

**Señales de que funciona:**
```
✅ Status: Live (verde)
✅ URL como: https://newzeland-ceramicas.onrender.com
✅ Logs sin errores críticos
```

---

## 🧪 PASO 4: Prueba Rápida (1 min)

Una vez que veas "Live", abre en navegador:

```
https://newzeland-ceramicas.onrender.com/
```

Deberías ver:
- ✅ La página principal carga
- ⚠️ Primera carga puede tardar 30-50s (cold start)
- ✅ Siguientes cargas: normal

---

## 🆘 SI ALGO FALLA

**Error: "Build failed"**
```
→ Haz clic en "Logs" en Render
→ Lee el error exacto
→ Probablemente: package.json, variables de entorno mal configuradas
→ Manda el error exacto y lo resolvemos
```

**Error: "API no responde"**
```
→ Verifica DATABASE_URL y ANTHROPIC_API_KEY están configuradas
→ Espera 30-50s (cold start)
→ Si persiste: revisa logs en Render Dashboard
```

**Aplicación "duerme" después de 15min**
```
→ NORMAL en Render Free
→ Primera solicitud tras inactividad: 30-50s
→ Luego: normal
```

---

## 📊 RESULTADO FINAL

```
GitHub (nafergu75/newzelland-ceramicas)
    ↓ (push automático a Render)
Render.com
    ↓ (compila y despliega)
Cerámico en producción
    ↓
https://newzeland-ceramicas.onrender.com
```

**Cada vez que hagas `git push`, Render redeploya automáticamente.**

---

## ⏱️ TIMELINE

- Paso 1: 5 min
- Paso 2: 2 min
- Paso 3: 3-5 min (compilación automática)
- Paso 4: 1 min

**Total: ~15 minutos para estar en vivo en producción**

¿Ya lo tienes? Manda la URL del dashboard de Render y te guío por cualquier error.

