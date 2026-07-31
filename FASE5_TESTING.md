# Fase 5 - Testing y Verificación

## Checklist de Implementación

### ✅ Archivos Creados
- [ ] `api/routes/ceramicoExport.js` (122 líneas)
- [ ] `api/utils/pdfGenerator.js` (220 líneas)
- [ ] `api/utils/emailService.js` (310 líneas)
- [ ] `api/utils/conversationStorage.js` (340 líneas)
- [ ] `api/utils/ceramicoPhase5Patch.js` (250 líneas - referencia)
- [ ] `FASE5_EXPORTACION.md` (documentación completa)
- [ ] `FASE5_TESTING.md` (este archivo)

### ✅ Archivos Modificados
- [ ] `api/package.json` - 3 dependencias nuevas agregadas
- [ ] `api/index.js` - Importación y 2 rutas nuevas

### ✅ Configuración
- [ ] Instalar dependencias: `npm install`
- [ ] Crear directorio: `mkdir -p logs`
- [ ] Configurar variables de entorno (ver más abajo)

---

## Test 1: Verificar Instalación

### 1.1 Verificar archivos existen
```bash
# Navegar al repo
cd "C:\Users\NACHO PC\Desktop\documntos prueba\newzelland-ceramicas"

# Verificar archivos
ls -la api/routes/ceramicoExport.js
ls -la api/utils/pdfGenerator.js
ls -la api/utils/emailService.js
ls -la api/utils/conversationStorage.js

# Debe mostrar: -rw-r--r-- (permisos)
```

### 1.2 Verificar dependencias en package.json
```bash
cd api
grep -A 10 '"dependencies"' package.json | grep -E 'pdfkit|nodemailer|sendgrid'

# Output esperado:
# "nodemailer": "^6.9.7",
# "nodemailer-sendgrid-transport": "^1.0.0",
# "pdfkit": "^0.13.0",
```

### 1.3 Instalar dependencias
```bash
cd api
npm install

# Output:
# added 15 packages, and audited 25 packages
```

### 1.4 Verificar módulos instalados
```bash
npm ls pdfkit nodemailer

# Output esperado:
# api@ 1.0.0
# ├── nodemailer@6.9.7
# ├── nodemailer-sendgrid-transport@1.0.0
# └── pdfkit@0.13.0
```

---

## Test 2: Verificar Endpoints

### 2.1 Iniciar servidor local
```bash
cd api
NODE_ENV=development npm start
# o
node index.js

# Output esperado:
# API local escuchando en http://localhost:3000
```

### 2.2 Verificar endpoints existen
```bash
# En otra terminal:
curl -X GET http://localhost:3000/api/health

# Output:
# {"status":"ok",...}
```

### 2.3 Test: POST /api/ceramico/export (Falta conversationId)
```bash
curl -X POST http://localhost:3000/api/ceramico/export \
  -H "Content-Type: application/json" \
  -d '{
    "format": "pdf"
  }'

# Output esperado (400):
# {
#   "ok": false,
#   "error": "conversationId es requerido"
# }
```

### 2.4 Test: POST /api/ceramico/export (Falta format)
```bash
curl -X POST http://localhost:3000/api/ceramico/export \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test_123"
  }'

# Output esperado (400):
# {
#   "ok": false,
#   "error": "format debe ser \"pdf\" o \"email\""
# }
```

### 2.5 Test: POST /api/ceramico/export (Conversación no existe)
```bash
curl -X POST http://localhost:3000/api/ceramico/export \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "nonexistent_conv_12345",
    "format": "pdf"
  }'

# Output esperado (404):
# {
#   "ok": false,
#   "error": "Conversación no encontrada"
# }
```

### 2.6 Test: GET /api/ceramico/export/:conversationId/status (No existe)
```bash
curl http://localhost:3000/api/ceramico/export/nonexistent/status

# Output esperado (404):
# {
#   "ok": false,
#   "error": "Conversación no encontrada"
# }
```

---

## Test 3: Guardar y Recuperar Conversación

### 3.1 Crear conversación manualmente
```bash
# Crear archivo logs/conversations.jsonl con una conversación de prueba
cat > logs/conversations.jsonl << 'EOF'
{"id":"test_conv_001","messages":[{"role":"user","content":"Hola","timestamp":"2026-07-31T14:00:00Z"},{"role":"assistant","content":"Hola, ¿cómo estás?","timestamp":"2026-07-31T14:00:30Z"}],"sentimentHistory":[{"timestamp":"2026-07-31T14:00:00Z","sentiment":"POSITIVE","confidence":0.8,"purchaseInterest":60,"intent":"INTERESTED","suggestedAction":"continue_guidance"}],"finalSentiment":"POSITIVE","finalIntent":"INTERESTED","duration":300000,"createdAt":"2026-07-31T14:00:00Z","clientEmail":"test@example.com","context":{}}
EOF

# Verificar
cat logs/conversations.jsonl | jq .id
# Output: "test_conv_001"
```

### 3.2 Test: GET /api/ceramico/export/:conversationId/status (Ahora existe)
```bash
curl http://localhost:3000/api/ceramico/export/test_conv_001/status

# Output esperado (200):
# {
#   "ok": true,
#   "conversationId": "test_conv_001",
#   "clientEmail": "test@example.com",
#   "hasBeenExported": false,
#   "exportedAt": null,
#   "canExportToPDF": true,
#   "canExportToEmail": true
# }
```

### 3.3 Test: POST /api/ceramico/export (Generar PDF)
```bash
curl -X POST http://localhost:3000/api/ceramico/export \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test_conv_001",
    "format": "pdf",
    "internalNotes": "Test de PDF - Verificar generación correcta"
  }' > test_conversation.pdf

# Verificar que es PDF válido
file test_conversation.pdf
# Output: test_conversation.pdf: PDF document, version 1.4

# Verificar tamaño (debe ser > 0 bytes)
ls -lh test_conversation.pdf
# Output: -rw-r--r-- 1 user group 45K Jul 31 14:00 test_conversation.pdf

# Intentar abrir
# (en Windows) start test_conversation.pdf
# (en Mac) open test_conversation.pdf
# (en Linux) xdg-open test_conversation.pdf
```

### 3.4 Verificar exportación fue registrada
```bash
# Debe haber líneas en export_history.jsonl
cat logs/export_history.jsonl | jq .

# Output:
# {
#   "type": "export",
#   "conversationId": "test_conv_001",
#   "format": "pdf",
#   ...
# }
```

### 3.5 Verificar estado actualizado
```bash
curl http://localhost:3000/api/ceramico/export/test_conv_001/status

# Ahora debe mostrar:
# {
#   "ok": true,
#   "hasBeenExported": true,
#   "exportedAt": "2026-07-31T14:XX:XXZ",
#   ...
# }
```

---

## Test 4: Email (Desarrollo)

### 4.1 Configurar para modo test (sin SMTP)
```bash
# En .env.local, dejar vacíos estos valores o no configurarlos
# NODE_ENV=development
# SMTP_HOST= (vacío)
# SMTP_USER= (vacío)
```

### 4.2 Test: POST /api/ceramico/export (formato email)
```bash
curl -X POST http://localhost:3000/api/ceramico/export \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test_conv_001",
    "format": "email",
    "email": "cliente@example.com",
    "internalNotes": "Test email en desarrollo"
  }'

# Output esperado (en modo test):
# {
#   "ok": true,
#   "message": "Conversación enviada por email",
#   "email": "cliente@example.com",
#   "conversationId": "test_conv_001"
# }

# En consola debe verse:
# ⚠️  SMTP no configurado. Los emails en desarrollo se loguean pero no se envían.
# 📧 [TEST MODE] Email que sería enviado:
#    To: cliente@example.com
#    Subject: 📋 Tu conversación con Cerámico · Newzeland Ceramicas
#    Attachments: 1
```

---

## Test 5: Email Real (SMTP)

### 5.1 Configurar SMTP (Gmail)
```bash
# .env.local
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Cerámico <noreply@newzelland.es>
NODE_ENV=production
```

**Nota:** Para Gmail, usar contraseña de aplicación:
1. Ir a https://myaccount.google.com/security
2. Habilitar "Verificación en dos pasos"
3. Crear "Contraseña de aplicación" para Mail/Windows
4. Usar esa contraseña en SMTP_PASS

### 5.2 Reiniciar servidor
```bash
# En la terminal del servidor, presionar Ctrl+C
# Luego reiniciar
npm start
```

### 5.3 Test: Enviar email real
```bash
curl -X POST http://localhost:3000/api/ceramico/export \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test_conv_001",
    "format": "email",
    "email": "your-test-email@example.com",
    "internalNotes": "Email real de prueba"
  }'

# Verificar bandeja de entrada
# Debe llegar en < 5 segundos con:
# - Asunto: "📋 Tu conversación con Cerámico · Newzeland Ceramicas"
# - PDF adjunto: "conversation-test_conv_001.pdf"
# - HTML formateado con logo Newzeland
```

---

## Test 6: Almacenamiento y Recuperación

### 6.1 Crear múltiples conversaciones
```bash
# Script para agregar 5 conversaciones de prueba
cat >> logs/conversations.jsonl << 'EOF'
{"id":"test_conv_002","messages":[{"role":"user","content":"Busco azulejos","timestamp":"2026-07-31T15:00:00Z"},{"role":"assistant","content":"Tenemos muchas opciones","timestamp":"2026-07-31T15:00:30Z"}],"sentimentHistory":[{"timestamp":"2026-07-31T15:00:00Z","sentiment":"POSITIVE","confidence":0.85,"purchaseInterest":75,"intent":"INTERESTED","suggestedAction":"capture_lead"}],"finalSentiment":"POSITIVE","finalIntent":"INTERESTED","duration":180000,"createdAt":"2026-07-31T15:00:00Z","clientEmail":"cliente2@example.com","context":{}}
{"id":"test_conv_003","messages":[{"role":"user","content":"¿Qué precio?","timestamp":"2026-07-31T16:00:00Z"},{"role":"assistant","content":"El precio depende del formato","timestamp":"2026-07-31T16:00:30Z"}],"sentimentHistory":[{"timestamp":"2026-07-31T16:00:00Z","sentiment":"NEUTRAL","confidence":0.7,"purchaseInterest":50,"intent":"INFORMATION","suggestedAction":"continue_guidance"}],"finalSentiment":"NEUTRAL","finalIntent":"INFORMATION","duration":240000,"createdAt":"2026-07-31T16:00:00Z","context":{}}
EOF
```

### 6.2 Test: Estadísticas
```bash
# Usar Node.js para llamar función de estadísticas
node << 'EOF'
const { getConversationStats } = require('./api/utils/conversationStorage');

(async () => {
  const stats = await getConversationStats();
  console.log(JSON.stringify(stats, null, 2));
})();
EOF

# Output esperado:
# {
#   "total": 3,
#   "withEmail": 2,
#   "exported": 1,
#   "sentiment": {
#     "positive": 2,
#     "negative": 0,
#     "neutral": 1
#   },
#   "lastUpdated": "2026-07-31T16:30:00Z"
# }
```

### 6.3 Test: Exportar a CSV
```bash
# Exportar todas las conversaciones a CSV
node << 'EOF'
const { exportConversationsToCSV } = require('./api/utils/conversationStorage');

(async () => {
  await exportConversationsToCSV('test_conversations.csv', 0);
  console.log('✅ CSV exportado');
})();
EOF

# Verificar CSV
cat test_conversations.csv | head -3

# Output:
# "ID","Fecha","Email","Sentimiento","Intención","Duración (ms)","Exportado","Notas"
# "test_conv_001","2026-07-31T14:00:00Z","test@example.com","POSITIVE","INTERESTED","300000","Sí",""
# ...
```

---

## Test 7: Validación de Datos

### 7.1 Email inválidos
```bash
# Email sin @
curl -X POST http://localhost:3000/api/ceramico/export \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test_conv_001",
    "format": "email",
    "email": "invalid-email"
  }'
# Output esperado: 400 "email es requerido cuando format es email"

# Email sin dominio
curl -X POST http://localhost:3000/api/ceramico/export \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test_conv_001",
    "format": "email",
    "email": "user@"
  }'
# Output: 500 "Error al enviar email: Email inválido"
```

### 7.2 Conversación con datos mínimos
```bash
cat >> logs/conversations.jsonl << 'EOF'
{"id":"test_conv_minimal","messages":[],"sentimentHistory":[],"createdAt":"2026-07-31T17:00:00Z"}
EOF

# Exportar a PDF (debe funcionar incluso sin datos)
curl -X POST http://localhost:3000/api/ceramico/export \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test_conv_minimal",
    "format": "pdf"
  }' > minimal_test.pdf

file minimal_test.pdf
# Output: minimal_test.pdf: PDF document, version 1.4
```

---

## Test 8: Integración con Phase 4

### 8.1 Verificar que ceramico-ai.js tiene imports
```bash
grep -n "require.*sentimentAnalysis" api/ceramico-ai.js

# Output esperado:
# 10:  analyzeSentiment,
# 11:  generateSentimentPrompt,
# 12:  generateSentimentContext,
# 13:} = require('./utils/sentimentAnalysis');
```

### 8.2 Ejecutar un chat y capturar conversationId
```bash
curl -X POST http://localhost:3000/api/ceramico \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Hola, busco azulejos para baño",
    "context": {
      "conversationHistory": []
    }
  }' | jq .

# Output actual: (sin Phase 5 integrada aún)
# {
#   "answer": "Tenemos varias opciones...",
#   "postalCode": null
# }

# Output esperado (después de integrar ceramicoPhase5Patch.js):
# {
#   "answer": "Tenemos varias opciones...",
#   "postalCode": null,
#   "conversationId": "conv_abc123def456",
#   "clientEmail": null
# }
```

---

## Test 9: Limpiar y Resetear

### 9.1 Limpiar archivos de test
```bash
# Eliminar conversaciones de prueba
rm logs/conversations.jsonl logs/export_history.jsonl

# Eliminar PDFs de test
rm test_conversation.pdf minimal_test.pdf test_conversations.csv
```

### 9.2 Resetear a estado limpio
```bash
# Crear directorio limpio
mkdir -p logs
touch logs/.gitkeep

# Verificar
ls -la logs/
```

---

## Checklist de Validación Final

- [ ] Todos los archivos existen en las rutas correctas
- [ ] `npm install` ejecutado sin errores
- [ ] Server inicia sin errores: `npm start`
- [ ] Endpoint 400 cuando faltan parámetros
- [ ] Endpoint 404 cuando conversación no existe
- [ ] PDF se genera correctamente (file type PDF)
- [ ] Email funciona en modo test (logs en consola)
- [ ] Email funciona con SMTP real (llega a bandeja)
- [ ] Conversaciones se guardan en logs/conversations.jsonl
- [ ] Exportaciones se registran en logs/export_history.jsonl
- [ ] Estadísticas se calculan correctamente
- [ ] CSV se exporta con todos los datos
- [ ] Validación de emails funciona
- [ ] Datos mínimos no causan errores

---

## Resultado de Tests

**Después de completar todos los tests, completar tabla:**

| Test | Resultado | Notas |
|------|-----------|-------|
| 1.1 - Archivos existen | ✅/❌ | |
| 1.2 - Dependencies en package.json | ✅/❌ | |
| 1.3 - npm install | ✅/❌ | |
| 1.4 - Módulos instalados | ✅/❌ | |
| 2.1 - Server inicia | ✅/❌ | |
| 2.2 - Endpoints responden | ✅/❌ | |
| 2.3-2.6 - Validación endpoints | ✅/❌ | |
| 3.1-3.5 - Guardar/Recuperar | ✅/❌ | |
| 4.1-4.2 - Email test mode | ✅/❌ | |
| 5.1-5.3 - Email SMTP real | ✅/❌ | |
| 6.1-6.3 - Almacenamiento | ✅/❌ | |
| 7.1-7.2 - Validación datos | ✅/❌ | |
| 8.1-8.2 - Integración Phase 4 | ✅/❌ | |

---

## Status Final

**Cuando todos los tests pasen:**

✅ Phase 5 está completamente implementada y funcional  
✅ Sistema listo para producción  
✅ Documentación completa  
✅ Equipo comercial puede exportar conversaciones  

---

**Actualizado:** 31/07/2026  
**Versión:** 1.0.0
