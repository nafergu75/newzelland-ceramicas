/**
 * FASE 4: Test Cases - Análisis de Sentimiento e Intención de Compra
 * =================================================================
 *
 * Validar que el módulo de análisis detecta correctamente:
 * - Sentimiento (positivo, neutral, negativo)
 * - Intención de compra (información, interesado, alta intención)
 * - Acciones proactivas recomendadas
 */

const { analyzeSentiment } = require('../utils/sentimentAnalysis');

// COLORES PARA CONSOLA
const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, ...args) {
  console.log(`${color}`, ...args, COLORS.reset);
}

function testCase(name, condition, actual, expected) {
  if (condition) {
    log(COLORS.green, `✓ PASS: ${name}`);
    return true;
  } else {
    log(COLORS.red, `✗ FAIL: ${name}`);
    console.log(`  Expected: ${expected}`);
    console.log(`  Actual: ${actual}`);
    return false;
  }
}

// ============================================
// TEST CASES
// ============================================

console.log('\n' + COLORS.cyan + '═══════════════════════════════════════════════════════════════════');
console.log('FASE 4: ANÁLISIS DE SENTIMIENTO E INTENCIÓN DE COMPRA');
console.log('═══════════════════════════════════════════════════════════════════' + COLORS.reset);

let passCount = 0;
let failCount = 0;

// TEST 1: Usuario frustrado
log(COLORS.blue, '\n📋 TEST 1: Usuario Frustrado');
log(COLORS.blue, '─────────────────────────────');
const test1Message = 'Estoy muy enfadado, no encuentro el producto que quiero y es muy complicado.';
const test1 = analyzeSentiment(test1Message);

log(COLORS.cyan, 'Mensaje:', test1Message);
console.log('Resultado:', test1);

if (testCase(
  'Sentimiento es NEGATIVE',
  test1.sentiment === 'negative',
  test1.sentiment,
  'negative'
)) passCount++; else failCount++;

if (testCase(
  'Acción sugerida es offer_human_support',
  test1.suggestedAction.type === 'offer_human_support',
  test1.suggestedAction.type,
  'offer_human_support'
)) passCount++; else failCount++;

if (testCase(
  'Prioridad es HIGH',
  test1.suggestedAction.priority === 'high',
  test1.suggestedAction.priority,
  'high'
)) passCount++; else failCount++;

// TEST 2: Usuario con intención alta de compra
log(COLORS.blue, '\n📋 TEST 2: Usuario con Intención Alta de Compra');
log(COLORS.blue, '─────────────────────────────');
const test2Message = 'Quiero 100 m² de Bosco 60x120 para mi reforma, ¿cuánto cuesta y cuándo me lo entregas?';
const test2 = analyzeSentiment(test2Message);

log(COLORS.cyan, 'Mensaje:', test2Message);
console.log('Resultado:', test2);

if (testCase(
  'Intención es HIGH_INTENT',
  test2.intent === 'high_intent',
  test2.intent,
  'high_intent'
)) passCount++; else failCount++;

if (testCase(
  'Acción sugerida es capture_lead',
  test2.suggestedAction.type === 'capture_lead',
  test2.suggestedAction.type,
  'capture_lead'
)) passCount++; else failCount++;

if (testCase(
  'Prioridad es HIGH',
  test2.suggestedAction.priority === 'high',
  test2.suggestedAction.priority,
  'high'
)) passCount++; else failCount++;

// TEST 3: Usuario satisfecho e interesado
log(COLORS.blue, '\n📋 TEST 3: Usuario Satisfecho e Interesado');
log(COLORS.blue, '─────────────────────────────');
const test3Message = 'Perfecto, me encanta la recomendación de porcelánico para la cocina. ¿Y los rodapiés, qué opciones hay?';
const test3 = analyzeSentiment(test3Message);

log(COLORS.cyan, 'Mensaje:', test3Message);
console.log('Resultado:', test3);

if (testCase(
  'Sentimiento es POSITIVE',
  test3.sentiment === 'positive',
  test3.sentiment,
  'positive'
)) passCount++; else failCount++;

if (testCase(
  'Intención es INTERESTED',
  test3.intent === 'interested',
  test3.intent,
  'interested'
)) passCount++; else failCount++;

if (testCase(
  'Acción sugerida es reinforce_confidence',
  test3.suggestedAction.type === 'reinforce_confidence',
  test3.suggestedAction.type,
  'reinforce_confidence'
)) passCount++; else failCount++;

// TEST 4: Usuario buscando información general con comparación
log(COLORS.blue, '\n📋 TEST 4: Usuario Buscando Información con Comparación');
log(COLORS.blue, '─────────────────────────────');
const test4Message = '¿Qué diferencia hay entre pasta blanca y porcelánico?';
const test4 = analyzeSentiment(test4Message);

log(COLORS.cyan, 'Mensaje:', test4Message);
console.log('Resultado:', test4);

if (testCase(
  'Sentimiento es NEUTRAL',
  test4.sentiment === 'neutral',
  test4.sentiment,
  'neutral'
)) passCount++; else failCount++;

if (testCase(
  'Intención es INTERESTED (evaluación comparativa)',
  test4.intent === 'interested',
  test4.intent,
  'interested'
)) passCount++; else failCount++;

if (testCase(
  'Acción sugerida es continue_guidance',
  test4.suggestedAction.type === 'continue_guidance',
  test4.suggestedAction.type,
  'continue_guidance'
)) passCount++; else failCount++;

// TEST 5: Usuario positivo buscando opciones
log(COLORS.blue, '\n📋 TEST 5: Usuario Positivo Buscando Opciones');
log(COLORS.blue, '─────────────────────────────');
const test5Message = 'Me gusta mucho vuestra propuesta. ¿Qué otras series tienes disponibles para cocina?';
const test5 = analyzeSentiment(test5Message);

log(COLORS.cyan, 'Mensaje:', test5Message);
console.log('Resultado:', test5);

if (testCase(
  'Sentimiento es POSITIVE',
  test5.sentiment === 'positive',
  test5.sentiment,
  'positive'
)) passCount++; else failCount++;

if (testCase(
  'Intención es INTERESTED',
  test5.intent === 'interested',
  test5.intent,
  'interested'
)) passCount++; else failCount++;

// TEST 6: Usuario con varios indicadores de compra
log(COLORS.blue, '\n📋 TEST 6: Usuario con Múltiples Indicadores de Compra');
log(COLORS.blue, '─────────────────────────────');
const test6Message = 'Necesito presupuesto para 75 m² de Bosco en formato 60x120. ¿Cuáles son las formas de pago y plazo de entrega?';
const test6 = analyzeSentiment(test6Message);

log(COLORS.cyan, 'Mensaje:', test6Message);
console.log('Resultado:', test6);

if (testCase(
  'Intención es HIGH_INTENT',
  test6.intent === 'high_intent',
  test6.intent,
  'high_intent'
)) passCount++; else failCount++;

// TEST 7: Mensaje vacío
log(COLORS.blue, '\n📋 TEST 7: Mensaje Vacío');
log(COLORS.blue, '─────────────────────────────');
const test7 = analyzeSentiment('');

log(COLORS.cyan, 'Mensaje: (vacío)');
console.log('Resultado:', test7);

if (testCase(
  'Sentimiento es NEUTRAL',
  test7.sentiment === 'neutral',
  test7.sentiment,
  'neutral'
)) passCount++; else failCount++;

if (testCase(
  'Confianza es 0',
  test7.confidence === 0,
  test7.confidence,
  0
)) passCount++; else failCount++;

// TEST 8: Scores están en rango 0-1
log(COLORS.blue, '\n📋 TEST 8: Validación de Scores (0-1)');
log(COLORS.blue, '─────────────────────────────');
const test8Message = 'Perfecto, compro 50 m². No me gusta el precio pero la calidad es excelente.';
const test8 = analyzeSentiment(test8Message);

log(COLORS.cyan, 'Mensaje:', test8Message);
console.log('Resultado:', test8);

if (testCase(
  'sentimentScore entre 0 y 1',
  test8.sentimentScore >= 0 && test8.sentimentScore <= 1,
  test8.sentimentScore,
  '0 <= score <= 1'
)) passCount++; else failCount++;

if (testCase(
  'intentScore entre 0 y 1',
  test8.intentScore >= 0 && test8.intentScore <= 1,
  test8.intentScore,
  '0 <= score <= 1'
)) passCount++; else failCount++;

// ============================================
// RESUMEN
// ============================================

console.log('\n' + COLORS.cyan + '═══════════════════════════════════════════════════════════════════');
console.log('RESUMEN DE PRUEBAS');
console.log('═══════════════════════════════════════════════════════════════════' + COLORS.reset);

log(COLORS.green, `✓ Pruebas pasadas: ${passCount}`);
if (failCount > 0) {
  log(COLORS.red, `✗ Pruebas fallidas: ${failCount}`);
} else {
  log(COLORS.green, `✓ Todas las pruebas pasaron!`);
}

const total = passCount + failCount;
const percentage = Math.round((passCount / total) * 100);

log(COLORS.cyan, `Total: ${passCount}/${total} (${percentage}%)\n`);

process.exit(failCount > 0 ? 1 : 0);
