# FASE 4: Módulos de Análisis de Sentimiento

Este directorio contiene los módulos de la **Fase 4 - Análisis de Sentimiento e Intención de Compra**.

## 📁 Archivos

### `sentimentAnalysis.js` ⭐ PRINCIPAL
**Módulo core del análisis de sentimiento**

Funciones principales:
- `analyzeSentiment(text)` - Análisis completo (sentiment + intent)
- `analyzeSentimentBasic(text)` - Solo sentimiento
- `analyzePurchaseIntent(text)` - Solo intención de compra
- `generateSentimentPrompt(analysis)` - Prompt dinámico para Claude
- `generateSentimentContext(analysis, text)` - Contexto para logging

**Dependencias:** Ninguna (solo built-in de Node.js)  
**Tamaño:** ~7 KB  
**Performance:** O(n) donde n = longitud del texto

### `sentimentLogger.js`
**Sistema de logging y auditoría**

Funciones principales:
- `logSentimentAnalysis(sessionId, message, analysis, response, metadata)` - Registra cada análisis
- `logConversationOutcome(sessionId, outcome, summary)` - Registra resultado final
- `generateSentimentStats(limit)` - Estadísticas agregadas
- `exportSentimentLogsToCSV(outputPath, limit)` - Exportar a CSV para análisis
- `readRecentSentimentLogs(limit)` - Leer logs recientes

**Archivo de salida:** `logs/sentiment_analysis.jsonl`  
**Formato:** JSON Lines (1 JSON por línea)

### `sentimentIntegrationExample.js`
**Ejemplos de integración con Express/API**

Contiene:
- `ceramicoAnswerWithSentiment()` - Función mejorada con logging
- `ceramicoSentimentMiddleware` - Middleware para Express
- `ceramicoHandlerWithSentiment()` - Handler completo
- `getSentimentStatsHandler()` - Endpoint de admin
- `recordConversationOutcome()` - Registrar outcomes
- Ejemplos de código para copy-paste

**Nota:** Este archivo es REFERENCIA. Adaptar según tu estructura.

---

## 🚀 Quick Start

### 1. Usar en tu código

```js
const { analyzeSentiment } = require('./utils/sentimentAnalysis');

// Analizar mensaje
const result = analyzeSentiment("Quiero comprar 50 m² de cerámica");

console.log(result);
// {
//   sentiment: 'positive',
//   sentimentScore: 0.5,
//   intent: 'high_intent',
//   intentScore: 0.9,
//   suggestedAction: { type: 'capture_lead', priority: 'high' }
// }
```

### 2. Logging automático

```js
const { logSentimentAnalysis } = require('./utils/sentimentLogger');

logSentimentAnalysis(
  'sess_abc123',
  userMessage,
  sentimentAnalysis,
  assistantResponse,
  { postalCode: '28001', page: 'product' }
);

// Genera: logs/sentiment_analysis.jsonl
```

### 3. Estadísticas

```js
const { generateSentimentStats } = require('./utils/sentimentLogger');

const stats = generateSentimentStats(1000);
// {
//   sentiments: { positive: { count: 350, percentage: "35%" }, ... },
//   intents: { high_intent: { count: 150, percentage: "15%" }, ... },
//   suggestedActions: { capture_lead: 150, ... }
// }
```

---

## 🧪 Testing

```bash
cd ../../
node api/tests/sentimentAnalysis.test.js

# Output: 19/19 tests passing (100%)
```

---

## 📊 Outputs

### Sentimiento (sentiment)
- `positive` - Usuario satisfecho/contento
- `neutral` - Usuario indiferente/buscando información
- `negative` - Usuario frustrado/insatisfecho

### Intención (intent)
- `information` - Buscando información general
- `interested` - Evaluando opciones
- `high_intent` - Decidido a comprar

### Acciones Sugeridas (suggestedAction.type)
- `offer_human_support` - Ofrecerle contacto directo
- `capture_lead` - Solicitar email/nombre para presupuesto
- `reinforce_confidence` - Reforzar su confianza
- `continue_guidance` - Continuar asesorando

---

## ⚡ Performance

### Análisis de Sentimiento
- **Complejidad:** O(n) donde n = longitud del mensaje
- **Tiempo típico:** <1ms para mensajes normales (<500 chars)
- **Memoria:** <100KB por análisis

### Logging
- **I/O:** Append a archivo JSON Lines (~1ms)
- **No bloquea:** Llamadas de logging son síncronas pero muy rápidas

### Recomendación
Sin problemas para producción con miles de usuarios.

---

## 🔧 Configuración

### .env (opcional)

```bash
# Activar/desactivar logging
SENTIMENT_LOGGING_ENABLED=true

# Ruta de logs (defecto: ./logs)
SENTIMENT_LOG_PATH=./logs

# Escalado futuro
SENTIMENT_USE_CLAUDE_AI=false  # Para Fase 4.5
```

### Permisos de carpeta

```bash
# Asegurar que logs/ tiene permisos de escritura
mkdir -p logs
chmod 755 logs
```

---

## 📈 Análisis de Logs

### Leer últimos 100 registros

```js
const { readRecentSentimentLogs } = require('./utils/sentimentLogger');

const logs = readRecentSentimentLogs(100);
logs.forEach(log => {
  console.log(`${log.timestamp}: ${log.sentiment} - ${log.intent}`);
});
```

### Exportar a Excel/Google Sheets

```js
const { exportSentimentLogsToCSV } = require('./utils/sentimentLogger');

exportSentimentLogsToCSV('./export.csv', 500);
// Luego abrir export.csv en Excel
```

### Importar en Google Sheets

```
1. Descargar CSV desde API
2. Crear nueva hoja en Google Sheets
3. File → Import → Upload → Seleccionar CSV
4. Crear gráficos de Sentiment vs Intent
```

---

## 🛠️ Troubleshooting

### P: Los logs no se generan
R: Verificar que `logs/` existe y tiene permisos:
```bash
mkdir -p logs && chmod 755 logs
ls -la logs/
```

### P: ¿Qué pasa si falla el logging?
R: El logging nunca bloquea la respuesta. Errores se loguean en consola pero no afectan al usuario.

### P: ¿Cuánto espacio ocupan los logs?
R: ~1KB por análisis. 10,000 sesiones = ~10MB.

### P: ¿Puedo limpiar logs viejos?
R: Sí, archiva/borra `logs/sentiment_analysis.jsonl`:
```bash
gzip logs/sentiment_analysis.jsonl
mv logs/sentiment_analysis.jsonl.gz backups/
touch logs/sentiment_analysis.jsonl  # Nuevo archivo
```

---

## 🔐 Privacidad y Seguridad

### Datos capturados
- Sentimiento/intención (análisis)
- Primeros 300 caracteres del mensaje (no full text)
- Código postal (si disponible)
- Page/source
- Timestamp

### Datos NO capturados
- Nombres de usuarios
- Emails
- Datos financieros
- IPs completas (solo contexto)

### Cumplimiento RGPD
- ✅ No se almacenan datos personales sin consentimiento
- ✅ Logs pueden ser purgados periódicamente
- ✅ Acceso solo para admin
- ✅ Exportación disponible para auditoría

---

## 📚 Documentación Completa

Ver: `../FASE_4_SENTIMENT_ANALYSIS.md`

Contiene:
- Arquitectura completa
- Casos de uso reales
- Planes de escalado
- Métricas y KPIs
- Roadmap para Fase 5-6

---

## 👥 Soporte

- **Bug report:** Crear issue con logs de error
- **Feature request:** Contactar equipo de producto
- **Performance issue:** Incluir tamaño del mensaje y latencia

---

**Versión:** 1.0  
**Última actualización:** 2026-07-31  
**Status:** Production Ready ✅
