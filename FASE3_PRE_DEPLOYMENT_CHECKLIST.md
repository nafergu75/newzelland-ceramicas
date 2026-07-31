# Fase 3: Pre-Deployment Checklist

**Antes de hacer deploy a producción, verificar:**

---

## ✓ Archivos en su lugar

- [ ] `api/data/productData.js` existe (260 líneas)
- [ ] `api/ceramico-ai.js` tiene imports de productData (línea 8)
- [ ] `api/ceramico-ai.js` tiene CHECK_AVAILABILITY_TOOL (línea 39-46)
- [ ] `api/ceramico-ai.js` tiene sección "DATOS EN TIEMPO REAL" (línea 402)

---

## ✓ Código funciona localmente

```bash
# 1. Instalar dependencias (si no está hecho)
cd api
npm install

# 2. Iniciar servidor
npm start

# 3. Probar endpoint
curl -X POST http://localhost:3001/api/ceramico \
  -H "Content-Type: application/json" \
  -d '{
    "question": "¿Hay Bosco en 60x120?",
    "context": { "conversationHistory": [] }
  }'

# Esperado: Respuesta JSON sin errores
# NO debe tener: "error", "undefined", SQL errors
```

- [ ] npm start funciona
- [ ] Endpoint responde (HTTP 200)
- [ ] No hay errores SQL en logs
- [ ] No hay "ReferenceError: productData not found"

---

## ✓ Base de datos verifica

```bash
# Conectarse a BD de staging/producción
psql -d newzelland_prod

# Verificar que collections existe y tiene datos
SELECT COUNT(*) FROM collections;  -- Debe ser > 0

# Verificar estructura correcta
SELECT nombre, formatos FROM collections LIMIT 1;
-- Debe devolver nombre (string) y formatos (array)
```

- [ ] Tabla `collections` existe
- [ ] `collections` tiene datos (COUNT > 0)
- [ ] Campo `nombre` existe
- [ ] Campo `formatos` es array/JSON
- [ ] Índices están creados

---

## ✓ Tarifa de precios verifica

```bash
# Verificar que tarifa-productos.json existe y es válida
node -e "const t = require('./frontend/src/data/tarifa-productos.json'); console.log(t.productos.length, 'productos en tarifa');"

# Debe mostrar: "XXX productos en tarifa" (número > 0)
```

- [ ] `frontend/src/data/tarifa-productos.json` existe
- [ ] JSON es válido (no syntax errors)
- [ ] Tiene array "productos" no vacío
- [ ] Cada producto tiene: serie, formato, precio_venta_m2

---

## ✓ Herramientas configuradas correctamente

```bash
# Verificar que CHECK_AVAILABILITY_TOOL está en tools array
grep -n "tools.*PRICE_TOOL.*CHECK_AVAILABILITY" api/ceramico-ai.js

# Debe mostrar línea 461 aprox:
# tools: [PRICE_TOOL, CHECK_AVAILABILITY_TOOL],
```

- [ ] CHECK_AVAILABILITY_TOOL está en array tools
- [ ] PRICE_TOOL sigue en array tools
- [ ] Ambas herramientas en la primera llamada a Claude
- [ ] Ambas herramientas en follow-up calls

---

## ✓ Environment variables

```bash
# Verificar que están configuradas en producción
echo $ANTHROPIC_API_KEY    # Must not be empty
echo $DATABASE_URL         # Must not be empty
echo $CERAMICO_ENABLED     # Must be "true"
```

- [ ] ANTHROPIC_API_KEY está configurada
- [ ] DATABASE_URL apunta a BD productiva
- [ ] CERAMICO_ENABLED = "true"
- [ ] No hay secretos en código (hardcoded credentials)

---

## ✓ Logging y debugging

```bash
# Habilitar logs detallados en staging
NODE_ENV=staging npm start

# Hacer una pregunta y verificar logs
curl ... # pregunta sobre disponibilidad

# Logs deben mostrar:
# "Claude solicito check_product_availability con: {...}"
# No debe haber SQL errors
```

- [ ] Logs muestran invocación de herramientas
- [ ] No hay "Error" en logs (o son esperados)
- [ ] Console.error() no spam

---

## ✓ Testing de 7 casos

**Ejecutar cada test en staging ANTES de producción:**

1. [ ] **Disponibilidad OK**
   - Q: "¿Hay Bosco 60x120?"
   - E: Respuesta menciona "Bosco", "60x120", "disponible"

2. [ ] **Disponibilidad FAIL**
   - Q: "¿Hay Bosco 200x200?"
   - E: Respuesta dice "no disponible", lista alternativas

3. [ ] **Precio real**
   - Q: "¿Precio Alpina 30x60 para 15m²?"
   - E: Respuesta con número exacto en euros

4. [ ] **Serie inexistente**
   - Q: "¿Info de Inexistente?"
   - E: Respuesta dice "no existe", sugiere series reales

5. [ ] **Historial de conversación**
   - Q1: "¿Recomendación para baño?"
   - Q2: "¿Precio de Bosco 60x120?"
   - E: Q2 responde sin pedir aclaraciones (usa contexto)

6. [ ] **Manejo de error - BD caída** (optional, en staging)
   - Simular: `docker pause postgres` (si existe)
   - Q: "¿Hay Bosco?"
   - E: Respuesta clara: "Tengo problemas de acceso"
   - Nota: `docker unpause postgres` después

7. [ ] **Compatibilidad Fase 2**
   - Q: "¿Tipos de cerámica y dónde usarlas?"
   - E: Respuesta técnica correcta (asesoramiento sin cambios)

---

## ✓ Performance checklist

```bash
# Probar con carga moderada (10 requests)
for i in {1..10}; do
  curl -X POST http://localhost:3001/api/ceramico \
    -H "Content-Type: application/json" \
    -d '{"question":"¿Hay Bosco 60x120?","context":{"conversationHistory":[]}}' &
done
wait

# Verificar:
# - Todos devuelven 200 OK
# - Tiempo de respuesta < 5 segundos
# - No hay timeouts
```

- [ ] Respuesta rápida (< 5s incluso en consultas)
- [ ] No hay memory leaks (RAM estable)
- [ ] BD conexión se mantiene (no se cierra prematuramente)

---

## ✓ Monitoring en producción

Preparar alertas para:

```
- [ ] Error rate > 5% en /api/ceramico
- [ ] Latency > 10s (timeout inminente)
- [ ] BD connection errors
- [ ] ANTHROPIC_API_KEY invalid/expired
- [ ] Disk space bajo
```

---

## ✓ Rollback plan

Si algo falla en producción:

```bash
# Opción 1: Revertir a Fase 2 (en git)
git revert <commit-Fase3>
npm restart

# Opción 2: Disable Cerámico temporalmente
env CERAMICO_ENABLED=false npm restart

# Opción 3: Downgrade de DB (si cambió schema)
# [Plan específico con equipo DevOps]
```

- [ ] Equipo sabe cómo revertir
- [ ] CERAMICO_ENABLED flag existe como kill switch
- [ ] Plan de rollback documentado

---

## ✓ Comunicación

- [ ] Equipo comercial notificado (Cerámico ahora tiene datos reales)
- [ ] Equipo soporte notificado (ver troubleshooting en docs)
- [ ] Cliente (si aplica) informado del upgrade
- [ ] Documentación Fase 3 accessible (en repo)

---

## ✓ Último paso: Decisión Go/No-Go

**Review final:**

- [ ] Todos los checkboxes arriba están tildados
- [ ] No hay issues críticos (severity: critical)
- [ ] Testing pasó sin sorpresas
- [ ] Equipo está listo

**Decisión:**

```
[  ] GO a producción - Fase 3 está lista
[  ] NO-GO a producción - Resolver [describir issues] primero
```

---

## Signoff

Si todos los checkboxes están tildados:

**Autorizado por:** ___________________  
**Fecha:** ___________________  
**Hora:** ___________________  

**Deploy a producción iniciado:** ___________________

---

## Durante el deployment

```bash
# 1. Backup de BD (si es automated, verificar que pasó)
# 2. Copiar código a producción
# 3. npm install (si cambió package.json)
# 4. npm start (o reboot de servicio)
# 5. Esperar 30 segundos
# 6. Verificar logs: no errores
# 7. Test rápido: curl al endpoint
# 8. Monitoreo activo por 30 minutos
```

- [ ] Deploy completed sin errores
- [ ] Logs muestran servidor iniciado
- [ ] Test rápido devuelve 200 OK
- [ ] Errores esperados NO aparecen

---

## Post-deployment (primeras 24h)

- [ ] Monitorear error rate cada hora
- [ ] Verificar BD connection status
- [ ] Revisar logs por excepciones
- [ ] Hacer test aleatorio cada 6 horas
- [ ] Responder a issues de usuarios si hay

---

**Este checklist debe estar 100% completado antes de hacer deploy.**

Si algo no puedes verificar, escala a equipo técnico.

**Fase 3 es segura, pero mejor safe than sorry.**

Good luck! 🚀
