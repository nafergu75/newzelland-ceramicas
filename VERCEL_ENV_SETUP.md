# Configuración de Variables de Entorno en Vercel

Para que el API de Vercel funcione correctamente con PostgreSQL, necesitas configurar las siguientes variables de entorno:

## Pasos:

1. Ve a https://vercel.com/dashboard
2. Selecciona el proyecto `newzelland-ceramicas`
3. Ve a **Settings → Environment Variables**
4. Agrega las siguientes variables:

## Variables Requeridas:

### Database (PostgreSQL)
```
DB_HOST=tu_host_postgres
DB_PORT=5432
DB_NAME=nombre_base_datos
DB_USER=usuario_postgres
DB_PASSWORD=contraseña_postgres
DB_SSL=false  (o true si usas SSL)
```

### JWT
```
JWT_SECRET=tu_secreto_jwt_super_seguro
```

### Frontend
```
FRONTEND_URL=https://newzelland-ceramicas.vercel.app
```

## Dónde obtener estos datos:

- **DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD**: Del servidor PostgreSQL donde tienes alojada tu BD
- **JWT_SECRET**: Generar un string aleatorio seguro (ej: `openssl rand -base64 32`)
- **FRONTEND_URL**: La URL de tu aplicación en Vercel

## Después de configurar:

1. El deploy automático se ejecutará
2. Los endpoints ahora usarán datos reales de PostgreSQL
3. El registro y login guardarán usuarios en la BD

## Endpoints disponibles:

- `POST /api/auth/register` - Registro (guarda en BD)
- `POST /api/auth/login` - Login (consulta BD)
- `GET /api/auth/me` - Usuario actual
- `GET /api/account/summary` - Resumen de cuenta
- `GET /api/account/pedidos` - Pedidos del usuario
- `GET /api/account/perfil` - Perfil del usuario

## Testing local:

Para probar localmente, crea un archivo `.env` en la raíz con las mismas variables.
