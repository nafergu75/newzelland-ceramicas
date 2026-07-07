# Setup de Newzelland Cerámicas E-commerce

## Requisitos Previos
- Node.js 18+
- PostgreSQL 12+

## Instalación

### 1. Base de Datos PostgreSQL
```bash
# En Windows con psql accesible:
set PGPASSWORD=postgres
psql -U postgres -h localhost -c "CREATE DATABASE ecommerce_db;"

# O en PowerShell:
$env:PGPASSWORD="postgres"
psql -U postgres -h localhost -c "CREATE DATABASE ecommerce_db;"
```

### 2. Backend
```bash
cd backend
npm install
npm run migrate   # Ejecutar migraciones
npm run dev       # Iniciar servidor desarrollo (puerto 3000)
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev       # Iniciar servidor (puerto 5173)
```

## Variables de Entorno

### Backend (.env)
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ecommerce_db
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=7d
FRONTEND_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
PORT=3000
NODE_ENV=development
```

## API Endpoints
- POST /api/auth/register - Registrar usuario
- POST /api/auth/login - Login
- GET /api/auth/verify-email?token=... - Verificar email
- GET /api/user/profile - Perfil de usuario (requiere auth)
- PATCH /api/user/profile - Actualizar perfil
- GET /api/user/orders - Órdenes del usuario
- POST /api/checkout - Crear orden
- GET /api/admin/stats/visits - Estadísticas (admin)
- GET /api/admin/stats/downloads
- GET /api/admin/stats/orders

## Testing
1. Ir a http://localhost:5173
2. Registrarse con un email
3. Login
4. Ver dashboard

¡Lista para desarrollo!
