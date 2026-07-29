# Esquema de base de datos

## Autocuración del esquema

`api/index.js` crea todo su esquema solo. Apuntar `DATABASE_URL` a una base de
datos vacía (otra rama de Neon, un entorno nuevo) y desplegar es suficiente:
**no hay que ejecutar ningún script a mano**.

De ello se encarga `initializeDatabaseSchema()`, que llama en orden a las ocho
funciones `ensureXTable()`. Todo son `CREATE TABLE` / `CREATE INDEX` /
`ADD COLUMN` con `IF NOT EXISTS`, así que repetirlo en cada arranque en frío no
cuesta nada ni pisa datos existentes.

La promesa se guarda en `esquemaListo` y un middleware la espera antes de
atender cualquier petición: así ninguna llega con el esquema a medio crear.
Solo bloquea en el primer arranque en frío; después es un `await` sobre una
promesa ya resuelta.

### Por qué el orden importa

Las `ensure*()` se lanzaban antes **en paralelo y sin `await`**, y cada una
captura su propio error limitándose a un `console.error`. Contra una base de
datos nueva eso rompía en cascada sin que se notara:

- `users` y `orders` no tenían `ensure*()` — se daban por creadas porque en
  desarrollo las hizo el backend Express antiguo (`backend/src/db/migrations.ts`,
  hoy sin desplegar).
- Casi todas las demás declaran `user_id INTEGER REFERENCES users(id)`: sin
  `users`, fallaban.
- `ensureAccountTables()` empieza con `ALTER TABLE orders ADD COLUMN ...`: sin
  `orders`, lanzaba antes de crear `support_tickets` y `support_ticket_messages`.

El API arrancaba igual, con el esquema a medias, y el síntoma aparecía mucho
después: `relation "users" does not exist` al intentar hacer login.

Ahora la secuencia es `users` → `orders` → resto, y al terminar se compara con
`TABLAS_ESPERADAS` y se deja constancia en los logs:

```
Esquema listo: 10/10 tablas.
```

Si algo faltara, en su lugar aparece `Esquema INCOMPLETO. Faltan N: ...`, para
enterarse por los logs y no porque un endpoint reviente en producción.

### El script manual sigue existiendo

[`scripts/create-users-table.js`](../scripts/create-users-table.js) hace lo
mismo para `users` y `orders` desde fuera del API. Ya no hace falta en un
despliegue normal; sirve para preparar una base de datos antes de desplegar,
o para depurar sin levantar el backend.

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
