# Configuración de Base de Datos para Producción

## OPCIÓN A: Vercel Postgres (RECOMENDADA)

### Paso 1: Conectar desde CLI

```bash
cd "C:\Users\NACHO PC\Desktop\newzelland-ceramicas"

# Si no has logueado aún
vercel login

# Conectar base de datos
vercel postgres connect
```

### Paso 2: Seguir las instrucciones en CLI

```
? Select a Postgres database
> Create a new Postgres database

? Name your database: newzeland_ecommerce
? Select a region: us-east-1 (o tu preferencia)
```

### Paso 3: Esperar a que Vercel agregue variables automáticamente

Vercel agregará automáticamente a Environment Variables:
- `POSTGRES_PRISMA_URL` (connection pooling)
- `POSTGRES_URL_NON_POOLING` (para migraciones)

### Paso 4: Mapear variables (IMPORTANTE)

En nuestro código esperamos:
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

Pero Vercel nos da `POSTGRES_URL`. Necesitamos hacer una de dos cosas:

**Opción A1: Usar POSTGRES_URL directamente**
Editar `backend/src/db/connection.ts` para parsear la URL

**Opción A2: Agregar variables manualmente**
En Vercel Dashboard, agregar manualmente los valores parsed

## OPCIÓN B: Usar PostgreSQL Existente

Si tienes una BD en Heroku, AWS RDS, u otro proveedor:
Obtén Host, Port, Database name, Username, Password
Agrégalos en Vercel Dashboard como DB_HOST, DB_PORT, etc.

## Paso 5: Ejecutar Migraciones

```bash
cd backend
npm run migrate
```

## Paso 6: Verificar conexión

```bash
psql postgresql://user:password@host:5432/newzeland_ecommerce
# \dt (ver tablas)
# \q (salir)
```

---

**Proxima paso:** PASO 6 - Configurar SMTP/Email
