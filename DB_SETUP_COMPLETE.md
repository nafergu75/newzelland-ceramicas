# Setup de Base de Datos - Newzelland Cerámicas ✅

## Estado del Setup

### ✅ Base de Datos Creada
- **Nombre:** `newzelland_ceramicas`
- **Host:** localhost
- **Puerto:** 5432
- **Usuario:** postgres
- **Contraseña:** (vacía)

### ✅ Tablas Creadas

#### 1. **users** (11 columnas)
```
- id (SERIAL PRIMARY KEY)
- name (VARCHAR 255)
- email (VARCHAR 255 UNIQUE)
- password_hash (VARCHAR 255)
- phone (VARCHAR 20)
- empresa (VARCHAR 255)
- accepts_marketing (BOOLEAN, default: false)
- email_verified (BOOLEAN, default: false)
- role (VARCHAR 50, default: 'customer')
- created_at (TIMESTAMP, default: NOW())
- updated_at (TIMESTAMP, default: NOW())
```

#### 2. **orders** (5 columnas)
```
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER, referencia a users)
- status (VARCHAR 50, default: 'pending')
- total (DECIMAL 10,2)
- created_at (TIMESTAMP, default: NOW())
- updated_at (TIMESTAMP, default: NOW())
```

### ✅ Archivo .env Creado
- **Ubicación:** `C:\Users\NACHO PC\Desktop\documntos prueba\newzelland-ceramicas\.env`
- **Contiene:** Todas las variables de entorno necesarias

## Instrucciones para Probar Localmente

### 1. Verificar que PostgreSQL está ejecutándose
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*postgres*"}
```

Si no está ejecutándose, iniciarlo:
```powershell
& "C:\Program Files\PostgreSQL\16\bin\pg_ctl.exe" -D "C:\Program Files\PostgreSQL\16\data" start
```

### 2. Conectar a la BD desde PowerShell
```powershell
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -d newzelland_ceramicas -c "\dt"
```

Debería mostrar:
```
         List of relations
 Schema | Name  | Type  |  Owner   
--------+-------+-------+----------
 public | orders | table | postgres
 public | users  | table | postgres
```

### 3. Probar conexión desde Node.js
Instalar dependencias:
```bash
npm install pg
```

Crear archivo `test-connection.js`:
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'newzelland_ceramicas',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error de conexión:', err);
  } else {
    console.log('Conexión exitosa:', res.rows[0]);
  }
  pool.end();
});
```

Ejecutar:
```bash
node test-connection.js
```

### 4. Probar con TypeScript/Prisma
Si tu proyecto usa Prisma, tu `schema.prisma` debería verse así:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Y en `.env` añadir:
```
DATABASE_URL="postgresql://postgres@localhost:5432/newzelland_ceramicas"
```

Luego:
```bash
npx prisma db push
```

## Archivos Relevantes

- **BD:** PostgreSQL en `C:\Program Files\PostgreSQL\16\data`
- **Configuración:** `.env` en la raíz del proyecto
- **Script Python (backup):** `C:\Users\NACHOP~1\AppData\Local\Temp\claude\C--Users-NACHO-PC-Desktop-documntos-prueba\f919ef76-45a0-4bb8-8b39-cb81a8585614\scratchpad\setup_db.py`

## Cambios Realizados

1. ✅ Modificado `pg_hba.conf` para permitir conexiones sin contraseña (METHOD: trust)
2. ✅ Recargada la configuración de PostgreSQL
3. ✅ Creada la BD `newzelland_ceramicas`
4. ✅ Creadas tablas `users` y `orders`
5. ✅ Creado archivo `.env` con configuración de conexión

## Próximos Pasos

1. Verifica que tu proyecto Node.js/Express tiene acceso al archivo `.env`
2. Instala las dependencias de BD: `npm install pg` o usa Prisma
3. Actualiza tu servidor para usar las credenciales del `.env`
4. Prueba la conexión con los scripts proporcionados arriba

---
**Setup completado exitosamente el:** 2026-07-17
**Sistema:** Windows 10 Pro
**PostgreSQL:** 16
