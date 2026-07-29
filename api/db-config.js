// Configuración única del Pool de Postgres, compartida entre el API
// (api/index.js) y los scripts de mantenimiento (scripts/*.js). Vive aquí y no
// en scripts/ porque api/ es donde está instalado `pg`.
//
// Acepta dos formas de configurar la conexión:
//
//   1. DATABASE_URL (preferida en producción / Vercel)
//      postgres://usuario:password@host:5432/basededatos?sslmode=require
//      Es lo que copian y pegan Neon, Supabase, Railway y Vercel Postgres.
//
//   2. Variables sueltas DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD
//      (lo que ya usa el .env local de desarrollo). Se ignoran si hay DATABASE_URL.
//
// SSL: los Postgres gestionados lo exigen. Con DATABASE_URL va SIEMPRE activo;
// con variables sueltas hay que pedirlo con DB_SSL=true (así el Postgres local
// sin TLS sigue funcionando igual que hasta ahora).
// Se usa rejectUnauthorized:false porque estos proveedores sirven certificados
// que no encadenan con la CA del sistema — es el modo estándar con ellos.

// Quita el parámetro `sslmode` de la query string, dejando el resto intacto.
// Si la URL no es parseable se devuelve tal cual: que falle pg con un error
// claro, no este helper con uno críptico.
function stripSslMode(url) {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete('sslmode');
    return parsed.toString();
  } catch {
    return url;
  }
}

function buildPoolConfig() {
  const url = process.env.DATABASE_URL;

  if (url && url.trim()) {
    return {
      // Se elimina `sslmode` de la cadena a propósito: pg 8.22 lo interpreta
      // como `verify-full` y, si está presente, ignora el objeto `ssl` de
      // abajo (comprobado: dejaba ssl en {}). Con verify-full la conexión a
      // Neon/Supabase falla porque sus certificados no encadenan con la CA
      // del sistema. Quitándolo, manda la config explícita de aquí.
      connectionString: stripSslMode(url.trim()),
      // SSL siempre activo en esta rama, sin escape hatch por DB_SSL: esa
      // variable existe para el Postgres local sin TLS y vale 'false' en el
      // .env de desarrollo. Si se respetara aquí, ejecutar un script con
      // DATABASE_URL cargando ese .env desactivaría TLS y el proveedor
      // rechazaría la conexión ("connection is insecure").
      ssl: { rejectUnauthorized: false },
    };
  }

  return {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  };
}

// Descripción del destino apta para logs: nunca incluye la contraseña.
function describeTarget() {
  const url = process.env.DATABASE_URL;
  if (url && url.trim()) {
    try {
      const { hostname, port, pathname } = new URL(url.trim());
      return `DATABASE_URL -> ${hostname}:${port || 5432}${pathname}`;
    } catch {
      return 'DATABASE_URL (no parseable)';
    }
  }
  const host = process.env.DB_HOST || '(sin DB_HOST)';
  const name = process.env.DB_NAME || '(sin DB_NAME)';
  return `DB_HOST -> ${host}:${process.env.DB_PORT || '5432'}/${name}`;
}

module.exports = { buildPoolConfig, describeTarget };
