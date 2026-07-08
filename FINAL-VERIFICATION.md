# PASO 9: Verificaciones Finales

## 1. Health Check

```bash
# Verificar que API responde
curl https://newzelland-ceramicas.vercel.app/api/health

# Resultado esperado:
# {"status":"ok"}
```

## 2. Verificar Headers de Seguridad

```bash
curl -I https://newzelland-ceramicas.vercel.app/api/health

# Debe mostrar:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
# Strict-Transport-Security: max-age=...
```

## 3. Verificar CORS

```bash
curl -H "Origin: https://newzelland-ceramicas.vercel.app" \
     https://newzelland-ceramicas.vercel.app/api/health \
     -v

# Busca en response headers:
# Access-Control-Allow-Origin: https://newzelland-ceramicas.vercel.app
```

## 4. Verificar Frontend

En navegador:
```
https://newzelland-ceramicas.vercel.app
```

Debe:
- Cargar sin errores (comprobar consola del navegador)
- Mostrar la página de inicio
- Botones navegables funcionales
- Imágenes cargando correctamente

## 5. Ver Logs de Vercel

```bash
# Seguir logs en tiempo real
vercel logs https://newzelland-ceramicas.vercel.app --follow

# Debe mostrar requests sin errores 500
# Si hay errores, analiza el mensaje
```

## 6. Test de Endpoints Clave

```bash
# Productos (sin autenticación)
curl https://newzelland-ceramicas.vercel.app/api/products

# Auth (test login)
curl -X POST https://newzelland-ceramicas.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# Respuesta esperada:
# {"error":"Invalid credentials"} (es correcto, usuario no existe)
```

## 7. Checklist Final

```
SEGURIDAD
[x] CORS configurado correctamente
[x] Headers Helmet presentes
[x] Rate limiting activo
[x] JWT_SECRET en variables (no en código)

BASE DE DATOS
[ ] Conexión exitosa (si ya configuraste BD)
[ ] Migraciones ejecutadas (si ya configuraste BD)
[ ] Pool de conexiones funciona

SERVICIOS
[ ] SMTP configurado (si lo agregaste)
[ ] Stripe keys agregadas (si lo agregaste)
[ ] WhatsApp webhook activo (si lo agregaste)

VERIFICACIONES
[x] /api/health responde
[ ] Frontend carga sin errores
[x] CORS funciona
[x] Headers de seguridad presentes
[ ] Logs se ven en Vercel

DOCUMENTACIÓN
[ ] PRODUCTION-DEPLOY-SUCCESSFUL.md actualizado
[ ] README.md referencias a producción
[ ] EMERGENCY-RUNBOOK.md creado
[ ] Equipo notificado
```

## 8. Troubleshooting

### "502 Bad Gateway"
- Revisa logs: `vercel logs --follow`
- Espera 2 minutos (Vercel puede estar burlando)
- Redeploy: `vercel --prod`

### "CORS Error en navegador"
- Verifica FRONTEND_URL en variables
- Verifica que matches exactly con tu dominio
- Redeploy después de cambiar variable

### "404 Not Found"
- Verifica que rutas estén mapeadas en vercel.json
- Revisa que los archivos están en frontend/dist/

### "Cannot GET /api/products"
- Asegúrate que el archivo de build en backend está correcto
- Revisa backend/api/index.js existe
- Verifica vercel.json rutas

---

Si todo funciona: ¡Felicidades! Pasar a PASO 10 - Documentación Final
