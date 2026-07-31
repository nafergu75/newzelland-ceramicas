#!/usr/bin/env node

/**
 * Script de Verificación - FASE 4: Análisis de Sentimiento
 * ===========================================================
 *
 * Verifica que todos los componentes están correctamente instalados
 * y funcionando.
 *
 * Uso: node VERIFY_FASE4.js
 */

const fs = require('fs');
const path = require('path');

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

function checkFile(filePath, description) {
  const fullPath = path.join(__dirname, filePath);
  const exists = fs.existsSync(fullPath);

  if (exists) {
    const stats = fs.statSync(fullPath);
    log(COLORS.green, `✓ ${description}`);
    log(COLORS.cyan, `  → ${filePath} (${stats.size} bytes)`);
    return true;
  } else {
    log(COLORS.red, `✗ ${description} NOT FOUND`);
    log(COLORS.yellow, `  → ${filePath}`);
    return false;
  }
}

function checkModule(modulePath, description) {
  try {
    const fullPath = path.join(__dirname, modulePath);
    const module = require(fullPath);
    const hasExports = Object.keys(module).length > 0;

    if (hasExports) {
      log(COLORS.green, `✓ ${description}`);
      log(COLORS.cyan, `  → Exports: ${Object.keys(module).join(', ')}`);
      return true;
    } else {
      log(COLORS.red, `✗ ${description} - No exports found`);
      return false;
    }
  } catch (error) {
    log(COLORS.red, `✗ ${description} - Error: ${error.message}`);
    return false;
  }
}

function testAnalysis() {
  try {
    const { analyzeSentiment } = require('./api/utils/sentimentAnalysis');

    const testCases = [
      {
        input: 'Perfecto, compro ahora',
        expected: 'positive',
      },
      {
        input: 'Estoy muy frustrado con esto',
        expected: 'negative',
      },
      {
        input: 'Necesito presupuesto para 50 m² de Bosco. ¿Cuánto cuesta y cuándo entrega?',
        expected: 'high_intent',
      },
    ];

    let passed = 0;
    let failed = 0;

    testCases.forEach(test => {
      const result = analyzeSentiment(test.input);
      const isSentiment = result.sentiment === test.expected;
      const isIntent = result.intent === test.expected;
      const success = isSentiment || isIntent;

      if (success) {
        log(COLORS.green, `✓ Test: "${test.input.substring(0, 30)}..."`);
        console.log(`  Result: sentiment=${result.sentiment}, intent=${result.intent}`);
        passed++;
      } else {
        log(COLORS.red, `✗ Test: "${test.input.substring(0, 30)}..."`);
        console.log(`  Expected: ${test.expected}, Got: sentiment=${result.sentiment}, intent=${result.intent}`);
        failed++;
      }
    });

    return { passed, failed };
  } catch (error) {
    log(COLORS.red, `✗ Analysis test failed: ${error.message}`);
    return { passed: 0, failed: 3 };
  }
}

function checkIntegration() {
  try {
    const ceramicoAi = require('./api/ceramico-ai');

    const hasAnalyzeSentiment = 'analyzeSentiment' in ceramicoAi;
    const hasBuildSentiment = 'buildSentimentSystemPrompt' in ceramicoAi;

    if (hasAnalyzeSentiment && hasBuildSentiment) {
      log(COLORS.green, '✓ Integration with ceramico-ai.js');
      return true;
    } else {
      log(COLORS.red, '✗ Integration exports missing');
      log(COLORS.yellow, `  → analyzeSentiment: ${hasAnalyzeSentiment}`);
      log(COLORS.yellow, `  → buildSentimentSystemPrompt: ${hasBuildSentiment}`);
      return false;
    }
  } catch (error) {
    log(COLORS.red, `✗ Integration check failed: ${error.message}`);
    return false;
  }
}

function checkLogsDirectory() {
  const logsDir = path.join(__dirname, 'logs');
  const exists = fs.existsSync(logsDir);

  if (exists) {
    const isDirectory = fs.statSync(logsDir).isDirectory();
    if (isDirectory) {
      log(COLORS.green, '✓ Logs directory exists');
      return true;
    } else {
      log(COLORS.red, '✗ logs is not a directory');
      return false;
    }
  } else {
    // Intentar crear
    try {
      fs.mkdirSync(logsDir, { recursive: true });
      log(COLORS.yellow, '⚠ Logs directory created');
      return true;
    } catch (error) {
      log(COLORS.red, `✗ Cannot create logs directory: ${error.message}`);
      return false;
    }
  }
}

// ============================================
// MAIN
// ============================================

console.log('\n' + COLORS.cyan + '═══════════════════════════════════════════════════════════════════');
console.log('FASE 4: VERIFICATION SCRIPT - Análisis de Sentimiento e Intención');
console.log('═══════════════════════════════════════════════════════════════════' + COLORS.reset + '\n');

let checks = {
  files: [],
  modules: [],
  integration: false,
  logs: false,
  tests: { passed: 0, failed: 0 },
};

// 1. Verificar archivos principales
log(COLORS.blue, '📋 Checking Core Files...');
checks.files.push(
  checkFile('api/utils/sentimentAnalysis.js', 'Core sentiment analysis module'),
  checkFile('api/utils/sentimentLogger.js', 'Logging module'),
  checkFile('api/utils/sentimentIntegrationExample.js', 'Integration examples'),
  checkFile('api/tests/sentimentAnalysis.test.js', 'Test suite'),
  checkFile('FASE_4_SENTIMENT_ANALYSIS.md', 'Main documentation')
);

console.log();

// 2. Verificar módulos
log(COLORS.blue, '🔧 Checking Modules...');
checks.modules.push(
  checkModule('api/utils/sentimentAnalysis.js', 'sentimentAnalysis exports'),
  checkModule('api/utils/sentimentLogger.js', 'sentimentLogger exports')
);

console.log();

// 3. Verificar integración
log(COLORS.blue, '🔗 Checking Integration...');
checks.integration = checkIntegration();

console.log();

// 4. Verificar logs
log(COLORS.blue, '📁 Checking Logs Directory...');
checks.logs = checkLogsDirectory();

console.log();

// 5. Ejecutar tests
log(COLORS.blue, '🧪 Running Sentiment Analysis Tests...');
checks.tests = testAnalysis();

// ============================================
// RESUMEN
// ============================================

console.log('\n' + COLORS.cyan + '═══════════════════════════════════════════════════════════════════');
console.log('VERIFICATION SUMMARY');
console.log('═══════════════════════════════════════════════════════════════════' + COLORS.reset);

const filesPassed = checks.files.filter(Boolean).length;
const filesTotal = checks.files.length;
log(COLORS.blue, `Files: ${filesPassed}/${filesTotal}`);

const modulesPassed = checks.modules.filter(Boolean).length;
const modulesTotal = checks.modules.length;
log(COLORS.blue, `Modules: ${modulesPassed}/${modulesTotal}`);

log(COLORS.blue, `Integration: ${checks.integration ? '✓' : '✗'}`);
log(COLORS.blue, `Logs Directory: ${checks.logs ? '✓' : '✗'}`);
log(COLORS.blue, `Tests: ${checks.tests.passed}/${checks.tests.passed + checks.tests.failed}`);

const totalChecks = filesTotal + modulesTotal + 1 + 1 + (checks.tests.passed + checks.tests.failed);
const passedChecks = filesPassed + modulesPassed + (checks.integration ? 1 : 0) + (checks.logs ? 1 : 0) + checks.tests.passed;

console.log();
if (passedChecks === totalChecks && checks.tests.failed === 0) {
  log(COLORS.green, `✅ ALL CHECKS PASSED! (${passedChecks}/${totalChecks})`);
  console.log('\nFASE 4 is ready for production.\n');
  process.exit(0);
} else {
  log(COLORS.red, `⚠️  SOME CHECKS FAILED (${passedChecks}/${totalChecks})`);
  console.log('\nPlease review the errors above.\n');
  process.exit(1);
}
