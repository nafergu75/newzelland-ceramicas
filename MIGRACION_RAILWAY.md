# 🚀 MIGRACIÓN A RAILWAY.APP (GRATUITO)

**Tiempo estimado:** 10 minutos  
**Costo:** $0 (con crédito gratuito de $5/mes)  
**Resultado:** Cerámico completamente operativo en producción

---

## ✅ REQUISITOS

- [x] Cuenta GitHub (ya tienes)
- [x] Código en GitHub (ya está sincronizado)
- [x] Neon Database (ya está configurada)

---

## 🎯 PASO A PASO

### Paso 1: Crear cuenta en Railway.app (2 min)

1. Ve a: https://railway.app
2. Haz clic en **"Start Free"**
3. Elige: **"Sign up with GitHub"**
4. Autoriza Railway a acceder a tu GitHub
5. Completa el registro

---

### Paso 2: Crear nuevo proyecto (3 min)

1. En el dashboard de Railway, haz clic en **"+ New Project"**
2. Selecciona: **"Deploy from GitHub repo"**
3. Busca y selecciona: **nafergu75/newzelland-ceramicas**
4. Haz clic en **"Deploy"**

Railway automáticamente:
- ✅ Detectará que es Node.js
- ✅ Instalará dependencias
- ✅ Ejecutará el build
- ✅ Desplegará la aplicación

---

### Paso 3: Configurar variables de entorno (3 min)

1. En el proyecto de Railway, ve a **"Variables"**
2. Haz clic en **"Add Variable"**
3. Agrega estas variables:

```
CERAMICO_ENABLED = true
VITE_CERAMICO_ENABLED = true
ANTHROPIC_API_KEY = sk-ant-api03-[TU_CLAVE]
DATABASE_URL = [COPIA DE VERCEL O NEON]
DATABASE_URL_UNPOOLED = [COPIA DE VERCEL O NEON]
NODE_ENV = production
```

**Para obtener DATABASE_URL:**
1. Ve a https://console.neon.tech
2. Selecciona tu base de datos
3. Copia la connection string

---

### Paso 4: Verificar deployment (2 min)

1. Railway debería mostrar estado: **"Deployed"** (verde)
2. Haz clic en el proyecto
3. Ve a **"Networking"** para obtener la URL
4. Debería ser algo como: `https://newzelland-ceramicas-production.up.railway.app`

---

## ✅ VERIFICAR QUE FUNCIONA

### Prueba 1: Web carga
```
curl https://newzelland-ceramicas-production.up.railway.app/
# Debería devolver HTML de la web
```

### Prueba 2: API responde
```
curl -X POST https://newzelland-ceramicas-production.up.railway.app/api/ceramico \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola", "conversationHistory": [], "postalCode": "28001"}'
# Debería devolver respuesta de Claude
```

### Prueba 3: Botón flotante visible
1. Abre https://newzelland-ceramicas-production.up.railway.app
2. Ve a /collections
3. Debería ver botón circular en esquina inferior derecha

---

## 🎁 VENTAJAS DE RAILWAY VS VERCEL HOBBY

| Feature | Vercel Hobby | Railway Free |
|---------|-------------|--------------|
| **Funciones Serverless** | 12 máximo | Ilimitadas |
| **Crédito/Mes** | Gratis | $5 |
| **PostgreSQL** | Requiere Neon | Soporta Neon |
| **Bandwidth** | 100GB | 100GB |
| **Build time** | Limitado | Generoso |
| **Costo** | $0 | $0 |

**Veredicto:** Railway es claramente mejor para proyectos con muchas funciones.

---

## 💡 TIPS

1. **Dominio personalizado** (opcional):
   - Railway permite agregar dominio personalizado
   - Ve a Settings → Domains
   - Cuesta $0.50/mes si tienes crédito

2. **Alertas**:
   - Railway notifica si la app falla
   - Ve a Settings → Notifications

3. **Logs**:
   - Usa Railway Logs para debuggear problemas
   - Ve a Logs → "View logs"

---

## 🚨 TROUBLESHOOTING

### Error: "Build failed"
```
→ Verifica que package.json está correcto (sin nodemailer-sendgrid-transport)
→ Revisa los logs en Railway para más detalles
```

### Error: "API no responde"
```
→ Verifica que ANTHROPIC_API_KEY está configurada
→ Verifica DATABASE_URL es correcta
→ Revisa los logs de Railway
```

### Web lenta o no carga
```
→ Railway puede estar "arranque en frío" (primera carga)
→ Espera 30 segundos e intenta de nuevo
→ Revisa status en Dashboard de Railway
```

---

## 📊 DESPUÉS DE MIGRAR

```
GitHub
  ↓ (ya sincronizado)
Railway.app
  ↓ (deployment automático)
Cerámico en producción
  ↓
https://newzelland-ceramicas-production.up.railway.app
```

Cada vez que hagas push a GitHub, Railway redeploya automáticamente.

---

## ✨ RESULTADO FINAL

✅ Cerámico completamente operativo en producción  
✅ Sin pagar nada (usando crédito gratuito)  
✅ Mejor rendimiento que Vercel Hobby  
✅ Actualizaciones automáticas desde GitHub  

**¡Listo!** 🚀

