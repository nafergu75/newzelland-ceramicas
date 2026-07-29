// Crea la tabla `users` en la base de datos de destino.
//
// POR QUÉ EXISTE ESTE SCRIPT
//
// api/index.js tiene un ensureXTable() por cada tabla que crea al arrancar,
// pero NO tiene ninguno para `users` — se daba por creada. En una base de
// datos virgen (como la de Neon recién provisionada) eso rompe en cascada:
// casi todas las demás tablas declaran `user_id INTEGER REFERENCES users(id)`,
// así que sus ensure*() fallan, y como capturan el error y solo lo loguean,
// el fallo pasa desapercibido hasta que algo intenta hacer login y salta
// `relation "users" does not exist`.
//
// Lo mismo pasa con `orders`: ensureAccountTables() empieza con un
// `ALTER TABLE orders ADD COLUMN ...` dando por hecho que la tabla existe
// (así era en la BD local, creada por el backend Express antiguo). Si no
// existe, el ALTER lanza, el catch se lo traga y `support_tickets` y
// `support_ticket_messages` nunca se crean.
//
// Creando `users` y `orders`, en el siguiente arranque en frío los ensure*()
// del resto de tablas ya encuentran sus dependencias y se completan solos.
//
// ESQUEMA
//
// Se replica el de la BD local, que es la que funciona con api/index.js.
// OJO: backend/src/db/migrations.ts define un `users` DISTINTO, con id UUID.
// Ese es el backend Express antiguo, que ya no se despliega. Usar aquel
// esquema rompería todas las FK, que son INTEGER. No lo uses como referencia.
//
// CÓMO USAR:
//
//   Contra la BD local (lee .env):
//     NODE_PATH=api/node_modules node scripts/create-users-table.js
//
//   Contra producción (rama ep-old-pine-…-pooler de Neon):
//      export DATABASE_URL='postgresql://...'
//     NODE_PATH=api/node_modules node scripts/create-users-table.js
//     unset DATABASE_URL
//
// Idempotente: CREATE TABLE IF NOT EXISTS, se puede re-ejecutar sin riesgo.
// No toca datos existentes.

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const { buildPoolConfig, describeTarget } = require('../api/db-config');

const pool = new Pool(buildPoolConfig());

// El orden importa: `orders.user_id` referencia a `users`.
const TABLAS = [
  {
    nombre: 'users',
    ddl: `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        empresa VARCHAR(255),
        accepts_marketing BOOLEAN DEFAULT FALSE,
        email_verified BOOLEAN DEFAULT FALSE,
        role VARCHAR(50) DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        direccion JSONB
      );
    `,
    indices: [
      `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
      `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`,
    ],
  },
  {
    // Las columnas a partir de `items` las añade ensureAccountTables() con
    // ALTER; se incluyen aquí para que una BD nueva quede completa de una vez.
    nombre: 'orders',
    ddl: `
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'pending',
        total NUMERIC(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        items JSONB DEFAULT '[]',
        direccion JSONB,
        estado_envio VARCHAR(50),
        codigo_seguimiento VARCHAR(100),
        transportista VARCHAR(100),
        enlace_tracking VARCHAR(500)
      );
    `,
    indices: [`CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);`],
  },
];

async function main() {
  console.log(`Destino: ${describeTarget()}\n`);

  for (const tabla of TABLAS) {
    const antes = await pool.query(
      `SELECT to_regclass($1) IS NOT NULL AS existe`,
      [`public.${tabla.nombre}`]
    );

    await pool.query(tabla.ddl);
    for (const idx of tabla.indices) await pool.query(idx);

    const cols = await pool.query(
      `SELECT COUNT(*)::int AS n FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1`,
      [tabla.nombre]
    );
    const filas = await pool.query(`SELECT COUNT(*) FROM ${tabla.nombre}`);

    const estado = antes.rows[0].existe ? 'ya existía' : 'CREADA';
    console.log(
      `${tabla.nombre.padEnd(10)} ${estado.padEnd(11)} ` +
      `${cols.rows[0].n} columnas, ${filas.rows[0].count} filas`
    );
  }

  console.log('\nListo. En el siguiente arranque en frío del API, los ensure*()');
  console.log('restantes encontrarán sus dependencias y crearán las tablas que falten.');

  await pool.end();
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
