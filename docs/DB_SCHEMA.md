# Esquema de base de datos

## Cómo se crean las tablas

`api/index.js` crea sus tablas al arrancar mediante funciones `ensureXTable()`
que ejecutan `CREATE TABLE IF NOT EXISTS`. Se invocan sin `await` al cargar el
módulo y **capturan sus propios errores**, limitándose a hacer `console.error`.

Eso tiene una consecuencia importante: **si una de esas funciones falla, el API
sigue arrancando como si nada**. El fallo solo se descubre cuando algo intenta
usar la tabla que no llegó a crearse.

## Dos tablas que el código da por existentes

`users` y `orders` **no tienen `ensureXTable()`**. El código asume que ya están,
porque en la base de datos de desarrollo las había creado el backend Express
antiguo (`backend/src/db/migrations.ts`, hoy sin desplegar).

En una base de datos nueva eso provoca un fallo en cascada:

- Casi todas las demás tablas declaran `user_id INTEGER REFERENCES users(id)`.
  Sin `users`, sus `ensure*()` fallan.
- `ensureAccountTables()` empieza con `ALTER TABLE orders ADD COLUMN ...`.
  Sin `orders`, lanza antes de llegar a crear `support_tickets` y
  `support_ticket_messages`.

Síntoma típico: `relation "users" does not exist` al intentar hacer login,
con el resto de la web aparentemente funcionando.

**Solución:** crear ambas antes del primer arranque.

```bash
 export DATABASE_URL='postgresql://...'
NODE_PATH=api/node_modules node scripts/create-users-table.js
unset DATABASE_URL
```

El script es idempotente y crea `users` y `orders` en el orden correcto. Tras
ejecutarlo, en el siguiente arranque en frío los `ensure*()` restantes
encuentran sus dependencias y completan el esquema solos.

### Cuidado con `backend/src/db/migrations.ts`

Ese fichero define un `users` **distinto**, con `id UUID`. Corresponde al
backend Express que ya no se despliega. Todas las claves ajenas de `api/` son
`INTEGER`, así que usar aquel esquema rompería el modelo entero. No sirve como
referencia.

## Tablas

### `users` — registro y login de clientes

```sql
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
```

`role` distingue `customer` de `admin` (ver `adminMiddleware`). `direccion` se
añadió para `PATCH /api/account/perfil`; antes el frontend la esperaba y el
backend nunca la tuvo, lo que dejaba el perfil bloqueado.

### `orders` — pedidos

```sql
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
```

Las columnas desde `items` las añade `ensureAccountTables()` por `ALTER`; el
script las incluye directamente para que una base nueva quede completa.

### Creadas automáticamente por `api/index.js`

`collections`, `contacts`, `projects`, `catalog_downloads`, `partners`,
`quote_requests`, `support_tickets`, `support_ticket_messages`.

### Del bot de WhatsApp

`catalog_embeddings`, `whatsapp_conversations`, `whatsapp_messages`. Las crea el
servicio de `whatsapp-bot/`, que corre aparte (no en Vercel) porque
`whatsapp-web.js` necesita un proceso persistente. **No deben existir en Neon**
mientras el bot no se despliegue contra esa misma base.

## Verificación

```bash
 export DATABASE_URL='postgresql://...'
NODE_PATH=api/node_modules node scripts/verify-db-connection.js
unset DATABASE_URL
```

Muestra host, base de datos y recuento de filas sin imprimir la contraseña.

Prueba de humo de autenticación en producción:

```bash
curl -s -X POST https://newzelland-ceramicas.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Test","email":"test@example.com","password":"Password123!","terminos":true,"privacidad":true}'
```

Esperado: `201` con `{"success":true,...}`. Después, `POST /api/auth/login`
con las mismas credenciales debe devolver `200` y un token JWT. Acuérdate de
borrar el usuario de prueba.
