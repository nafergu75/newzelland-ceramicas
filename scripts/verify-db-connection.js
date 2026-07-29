// Comprueba que una cadena de conexión funciona, sin imprimir nunca la
// contraseña. Pensado para validar credenciales nuevas (por ejemplo tras
// rotar la password en Neon) antes de darlas por buenas.
//
// CÓMO USAR:
//
//   Contra la BD local (lee .env):
//     NODE_PATH=api/node_modules node scripts/verify-db-connection.js
//
//   Contra una cadena concreta, sin dejarla en el historial de la shell
//   (el espacio inicial evita que bash la guarde, con HISTCONTROL=ignorespace):
//      export DATABASE_URL='...'
//     NODE_PATH=api/node_modules node scripts/verify-db-connection.js
//     unset DATABASE_URL
//
// Solo lee: no modifica ni una fila.

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const { buildPoolConfig, describeTarget } = require('../api/db-config');

// Tablas cuyo contenido nos dice si la BD es la que esperamos y no una vacía.
const TABLAS_CLAVE = ['collections', 'users', 'projects'];

async function main() {
  console.log(`Destino: ${describeTarget()}\n`);

  const pool = new Pool(buildPoolConfig());

  try {
    const { rows } = await pool.query('SELECT version(), current_database(), current_user');
    console.log('Conexión ....... OK');
    console.log(`Servidor ....... ${rows[0].version.split(',')[0]}`);
    console.log(`Base de datos .. ${rows[0].current_database}`);
    console.log(`Usuario ........ ${rows[0].current_user}`);

    const existentes = await pool.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
    );
    const nombres = existentes.rows.map((r) => r.tablename);
    console.log(`Tablas ......... ${nombres.length > 0 ? nombres.length : 'ninguna (BD vacía)'}`);

    for (const tabla of TABLAS_CLAVE) {
      if (!nombres.includes(tabla)) {
        console.log(`  - ${tabla}: no existe`);
        continue;
      }
      const c = await pool.query(`SELECT COUNT(*) FROM ${tabla}`);
      console.log(`  - ${tabla}: ${c.rows[0].count} filas`);
    }

    console.log('\nResultado: la cadena de conexión es válida.');
  } catch (error) {
    console.error('Conexión ....... FALLO');
    console.error(`Motivo ......... ${error.message}`);
    console.error('\nPistas según el error:');
    console.error('  - "password authentication failed" -> credencial incorrecta o ya rotada.');
    console.error('  - "connection is insecure"         -> falta SSL (revisa DB_SSL en .env).');
    console.error('  - "ENOTFOUND" / "ETIMEDOUT"        -> host mal copiado o endpoint suspendido.');
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
