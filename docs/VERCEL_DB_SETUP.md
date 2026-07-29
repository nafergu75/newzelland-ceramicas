# Base de datos en Vercel (Neon Postgres)

## Cómo se conecta el API

El pool vive en [`api/db-config.js`](../api/db-config.js) y lo comparten el API
(`api/index.js`) y los scripts de `scripts/`. Acepta dos formas de configuración:

1. **`DATABASE_URL`** — una única cadena de conexión. Es lo que usan Neon,
   Supabase, Railway y Vercel Postgres. Tiene prioridad sobre lo demás.
2. **`DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD`** — variables
   sueltas. Es lo que usa el `.env` de desarrollo local.

### Dos trampas con SSL (ya resueltas en el código)

Ambas costaron un fallo en producción, conviene no reintroducirlas:

- **`sslmode` en la cadena anula el objeto `ssl`.** En `pg` 8.22, un
  `?sslmode=require` se interpreta como `verify-full` y descarta la
  configuración `ssl` que se pase aparte. Como los certificados de Neon no
  encadenan con la CA del sistema, la conexión falla. Por eso
  `buildPoolConfig()` elimina `sslmode` de la cadena con `stripSslMode()`.

- **`DB_SSL=false` se filtraba a la rama de `DATABASE_URL`.** Esa variable vale
  `false` en el `.env` local (Postgres sin TLS) y desactivaba el cifrado también
  contra Neon, que responde `connection is insecure`. La rama de `DATABASE_URL`
  fuerza SSL siempre, sin excepción.

## Variables en Vercel

| Scope | Variable | Apunta a | Quién la gestiona |
|---|---|---|---|
| Production | `DATABASE_URL` | rama `ep-old-pine-…-pooler` | manual |
| Production | `DATABASE_URL_UNPOOLED` | rama `ep-old-pine-…` | integración Neon |
| Preview | `DATABASE_URL` | rama `ep-red-feather-…-pooler` | manual |
| Development | `DATABASE_URL` + `_UNPOOLED` | rama `ep-red-feather-…` | integración Neon |

Usa siempre la cadena **pooled** (la que lleva `-pooler` en el host) para el API:
las funciones serverless abren muchas conexiones cortas y la directa agota el
límite. La `_UNPOOLED` se reserva para migraciones y tareas de larga duración.

### Preview no lo gestiona la integración

Aunque Neon esté conectado a Vercel y a GitHub, **la integración solo pobló
Development y Production**. En Preview no creó ninguna variable, porque el
branching automático por preview deployment no está activado.

Consecuencia práctica: si borras `DATABASE_URL` de Preview, los deploys de
preview se quedan **sin base de datos** y devuelven 500. No la borres esperando
que la integración tome el relevo — no lo hará mientras el branching esté
desactivado.

Por eso Preview apunta hoy a la misma rama de desarrollo que Development
(`ep-red-feather`): así un preview nunca escribe sobre los datos reales.

Si en el futuro activas *Create branch for preview deployments* en la
integración, entonces sí conviene borrar la variable manual para que cada PR
reciba su propia rama aislada.

### Development y los scripts locales

La integración puso `DATABASE_URL` en el scope Development. Los scripts de
`scripts/` **no se ven afectados**: cargan `.env` de forma explícita con
`dotenv`, no `.env.local`, que es donde escribe `vercel env pull`. Aun así, ten
presente que si algo carga `.env.local`, `DATABASE_URL` ganará sobre las `DB_*`
y apuntarás a Neon en vez de a tu Postgres local.

## Comandos

```bash
# Ver todas las variables y sus scopes
npx vercel env ls

# Añadir una variable (el valor se lee por stdin, no queda en el historial)
printf 'postgresql://...' | npx vercel env add DATABASE_URL production

# Borrar una variable de un scope concreto
npx vercel env rm DATABASE_URL preview --yes
```

Las variables solo se aplican a deploys **nuevos**: tras cambiarlas hay que
redesplegar (`npx vercel --prod` o un push a `master`).

Las variables creadas por CLI quedan marcadas como *Sensitive*: `vercel env pull`
devuelve `[SENSITIVE]` en lugar del valor. Es intencionado; para comprobar a qué
rama apuntan, mira la consola de Neon.

## Sincronizar datos con producción

Las bases de datos local y de producción son independientes. Tras editar
colecciones en local:

```bash
DATABASE_URL='postgresql://...' NODE_PATH=api/node_modules \
  node scripts/sync-collections-to-prod.js
```

Copia la tabla `collections` local (ya corregida y verificada) a la de destino.
Es idempotente y **no** parte de `catalogo.json`, que es el dato antiguo y
reintroduciría los placeholders rotos.

## Verificación

```bash
# ¿Responde el API en producción?
curl -s -o /dev/null -w "%{http_code}\n" \
  https://newzelland-ceramicas.vercel.app/api/collections

# Auditar imágenes contra la BD de producción (solo lee)
DATABASE_URL='postgresql://...' NODE_PATH=api/node_modules \
  node scripts/check-broken-images.js
```

El resultado esperado hoy es **88 OK / 2 sin foto real / 0 rotas**. Las dos sin
foto (`bigas` y `stahl-c3`) están así a propósito: no existen en el catálogo de
Practika y `ImageWithFallback` les pinta un SVG genérico.
