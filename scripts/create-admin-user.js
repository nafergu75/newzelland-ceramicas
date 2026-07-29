// Da de alta (o promociona) un usuario con role='admin'.
//
// Necesario porque una base de datos nueva no tiene ningún usuario, y sin un
// admin no se puede entrar al panel: authMiddleware + adminMiddleware exigen
// un JWT de un usuario con role='admin'.
//
// La contraseña se pasa por variable de entorno y NUNCA se imprime ni se
// guarda en el repositorio. Usa el mismo bcryptjs y el mismo coste (10) que
// el endpoint de registro de api/index.js, así que el login funciona igual.
//
// CÓMO USAR (el espacio inicial evita el historial con HISTCONTROL=ignorespace):
//
//   Contra la BD local:
//      ADMIN_EMAIL='tu@correo.com' ADMIN_PASSWORD='...' ADMIN_NAME='Tu Nombre' \
//        NODE_PATH=api/node_modules node scripts/create-admin-user.js
//
//   Contra producción (Neon):
//      export DATABASE_URL='postgresql://...'
//      ADMIN_EMAIL='tu@correo.com' ADMIN_PASSWORD='...' ADMIN_NAME='Tu Nombre' \
//        NODE_PATH=api/node_modules node scripts/create-admin-user.js
//     unset DATABASE_URL
//
// Si el email ya existe, no lo duplica: se limita a ponerle role='admin'
// (y actualiza la contraseña solo si se pasa ADMIN_RESET_PASSWORD=true).

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { buildPoolConfig, describeTarget } = require('../api/db-config');

const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || '';
const name = (process.env.ADMIN_NAME || '').trim() || 'Administrador';
const resetPassword = process.env.ADMIN_RESET_PASSWORD === 'true';

if (!email || !password) {
  console.error('Faltan ADMIN_EMAIL y/o ADMIN_PASSWORD.');
  console.error("Ejemplo: ADMIN_EMAIL='tu@correo.com' ADMIN_PASSWORD='...' \\");
  console.error('           NODE_PATH=api/node_modules node scripts/create-admin-user.js');
  process.exit(1);
}

if (password.length < 8) {
  console.error('La contraseña debe tener al menos 8 caracteres.');
  process.exit(1);
}

const pool = new Pool(buildPoolConfig());

async function main() {
  console.log(`Destino: ${describeTarget()}`);
  console.log(`Email:   ${email}\n`);

  const existente = await pool.query('SELECT id, role FROM users WHERE email = $1', [email]);

  if (existente.rows.length > 0) {
    const { id, role } = existente.rows[0];
    if (resetPassword) {
      const hash = await bcrypt.hash(password, 10);
      await pool.query(
        `UPDATE users SET role = 'admin', password_hash = $1, updated_at = NOW() WHERE id = $2`,
        [hash, id]
      );
      console.log(`Usuario #${id} ya existía (role=${role}): ahora es admin y se ha cambiado su contraseña.`);
    } else {
      await pool.query(`UPDATE users SET role = 'admin', updated_at = NOW() WHERE id = $1`, [id]);
      console.log(`Usuario #${id} ya existía (role=${role}): ahora es admin.`);
      console.log('La contraseña NO se ha tocado. Para cambiarla, repite con ADMIN_RESET_PASSWORD=true.');
    }
  } else {
    const hash = await bcrypt.hash(password, 10);
    const nuevo = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, email_verified, created_at)
       VALUES ($1, $2, $3, 'admin', true, NOW())
       RETURNING id`,
      [name, email, hash]
    );
    console.log(`Usuario admin creado con id #${nuevo.rows[0].id}.`);
  }

  const admins = await pool.query(`SELECT id, name, email FROM users WHERE role = 'admin' ORDER BY id`);
  console.log(`\nAdmins en esta base de datos (${admins.rows.length}):`);
  for (const a of admins.rows) console.log(`  #${a.id} ${a.name} <${a.email}>`);

  await pool.end();
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
