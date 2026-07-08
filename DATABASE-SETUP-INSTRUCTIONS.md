# Instrucciones de Setup Base de Datos - FASE 5
**Fecha:** 2026-07-08  
**Base de Datos:** Vercel Postgres (PostgreSQL)

---

## Opción 1: Usar Vercel Postgres (RECOMENDADO)

### PASO 1: Crear base de datos en Vercel

1. **Vercel Dashboard** → Proyecto `newzelland-ceramicas`
2. Ir a **Storage** → **Create Database**
3. Seleccionar **Postgres**
4. Nombre: `newzelland-ecommerce` (o dejar default)
5. Región: `US-East` (o más cercana)
6. Click **Create**

Esperar 1-2 minutos mientras se crea...

### PASO 2: Copiar credenciales

1. Postgres creada → Click en la BD
2. Tab **.env.local** → Copiar:
   ```
   POSTGRES_PRISMA_URL=postgresql://default:xxxxx@ep-cool-db-xxxxx.us-east-1.postgres.vercel-storage.com:5432/verceldb
   POSTGRES_URL_NON_POOLING=postgresql://default:xxxxx@ep-cool-db-xxxxx.us-east-1.postgres.vercel-storage.com:5432/verceldb
   ```

3. O desde **Data** → Copiar manualmente:
   - **Host:** `ep-cool-db-xxxxx.us-east-1.postgres.vercel-storage.com`
   - **Port:** `5432`
   - **Database:** `verceldb`
   - **User:** `default`
   - **Password:** `xxxxx` (oculto inicialmente, copiar desde .env.local)

### PASO 3: Cargar en Vercel Environment Variables

**Settings** → **Environment Variables** → Agregar:

```
DATABASE_URL = postgresql://default:xxxxx@ep-cool-db-xxxxx.us-east-1.postgres.vercel-storage.com:5432/verceldb
```

O desglosado:
```
DB_HOST = ep-cool-db-xxxxx.us-east-1.postgres.vercel-storage.com
DB_PORT = 5432
DB_NAME = verceldb
DB_USER = default
DB_PASSWORD = xxxxx
```

**Guardar y esperar redeploy** (Vercel automático)

### PASO 4: Ejecutar Migraciones

Las migraciones crean las tablas necesarias.

#### Opción A - Local (antes de push):

```bash
# En terminal local
cd C:\Users\NACHO PC\Desktop\newzelland-ceramicas

# Instalar dependencias si no las tienes
cd backend
npm install

# Ejecutar migraciones
npm run migrate
# Output esperado:
# ✓ Migrations ejecutadas correctamente
```

#### Opción B - En Vercel (después del deploy):

```bash
# Via Vercel CLI
vercel env ls
vercel env pull .env.production.local

# O crear script en package.json:
{
  "scripts": {
    "post-install": "npm run migrate"
  }
}

# Y ejecutar en deployment (no automático actualmente)
```

#### Opción C - Manual en la BD:

1. **Vercel Dashboard** → Postgres → **Data** → SQL editor
2. Copiar y ejecutar cada tabla del archivo: `backend/src/db/migrations.ts`

```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  province VARCHAR(100) NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  email_verified_at TIMESTAMP,
  billing_address JSONB,
  shipping_address JSONB,
  phone VARCHAR(20),
  nif VARCHAR(20),
  role VARCHAR(50) DEFAULT 'customer',
  accepts_marketing BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
```

(Repetir para `email_verification_tokens`, `orders`, `page_view_logs`, `catalog_download_logs`)

---

## Opción 2: Usar Base de Datos Externa

### PostgreSQL en otro servidor:

**Parámetros conexión:**
```
DB_HOST = tu-host.ejemplo.com
DB_PORT = 5432
DB_NAME = newzelland_ecommerce
DB_USER = postgres
DB_PASSWORD = tu_password_seguro
```

**Consideraciones:**
- Debe ser accesible desde Vercel (IP allowlist)
- Debe soportar conexiones SSL/TLS
- Backups automáticos recomendados

---

## Opción 3: Desarrollo Local (SQLite - NO producción)

**Para testing local sin Postgres:**

```javascript
// backend/src/db/connection-sqlite.ts
import Database from 'better-sqlite3';

const db = new Database(':memory:'); // o 'app.db'

export const query = (sql, params) => {
  try {
    const stmt = db.prepare(sql);
    return stmt.all(params);
  } catch (error) {
    throw error;
  }
};
```

**Limitación:** SQLite no soporta todos los features (UUID, JSONB)

---

## Estructura de Tablas

### 1. Tabla: users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  province VARCHAR(100) NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  email_verified_at TIMESTAMP,
  billing_address JSONB,        -- JSON para dirección
  shipping_address JSONB,       -- JSON para dirección
  phone VARCHAR(20),
  nif VARCHAR(20),              -- DNI/CIF español
  role VARCHAR(50) DEFAULT 'customer',  -- customer, admin
  accepts_marketing BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

**Ejemplo de billing_address:**
```json
{
  "street": "Calle Principal 123",
  "city": "Valencia",
  "postalCode": "46001",
  "province": "Valencia",
  "country": "España"
}
```

### 2. Tabla: email_verification_tokens
```sql
CREATE TABLE email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_verification_tokens_user ON email_verification_tokens(user_id);
CREATE INDEX idx_verification_tokens_token ON email_verification_tokens(token);
```

**Duración:** 24 horas  
**Limpieza:** Automática al verificar email

### 3. Tabla: orders
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  billing_address JSONB NOT NULL,
  shipping_address JSONB NOT NULL,
  nif VARCHAR(20) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  items JSONB NOT NULL,         -- Array de productos
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) NOT NULL,
  shipping_surcharge DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',  -- pending, processing, completed, cancelled
  invoice_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
```

**Ejemplo de items:**
```json
[
  {
    "productId": "1",
    "name": "Atlas Gris",
    "quantity": 2,
    "pricePerUnit": 45.99,
    "total": 91.98
  }
]
```

### 4. Tabla: page_view_logs
```sql
CREATE TABLE page_view_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url VARCHAR(500) NOT NULL,
  user_id UUID,                 -- NULL si no autenticado
  user_agent TEXT,
  ip_hash VARCHAR(255),         -- SHA-256 de IP (privacidad)
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_page_views_url ON page_view_logs(url);
CREATE INDEX idx_page_views_user ON page_view_logs(user_id);
CREATE INDEX idx_page_views_timestamp ON page_view_logs(timestamp);
```

### 5. Tabla: catalog_download_logs
```sql
CREATE TABLE catalog_download_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id VARCHAR(100) NOT NULL,
  catalog_name VARCHAR(255) NOT NULL,
  user_id UUID,                 -- NULL si no autenticado
  email VARCHAR(255),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_downloads_catalog ON catalog_download_logs(catalog_id);
CREATE INDEX idx_downloads_user ON catalog_download_logs(user_id);
CREATE INDEX idx_downloads_timestamp ON catalog_download_logs(timestamp);
```

---

## Verificar Conexión

### Test local:
```bash
cd backend
npm run dev

# Logs esperados:
# ✓ Backend running on port 3000
# ✓ Database connected (si migraciones ok)
```

### Test remoto (Vercel):
```bash
# GET /health (prueba conexión)
curl https://newzelland-ceramicas.vercel.app/health

# GET /api/products (usa BD)
curl https://newzelland-ceramicas.vercel.app/api/products
```

### Ver logs de Vercel:
**Dashboard** → **Deployments** → últimas líneas de logs

Buscar:
```
✓ Migrations ejecutadas correctamente
error: connect ECONNREFUSED
error: Cannot connect to database
```

---

## Troubleshooting

### Error: "Cannot connect to database"
```
Verificar:
1. DATABASE_URL en Vercel está cargada
2. Credenciales son exactas (copiar sin espacios)
3. Puerto es 5432
4. IP de Vercel está en allowlist (si BD externa)
```

### Error: "Relation 'users' does not exist"
```
Solución:
1. Ejecutar migraciones: npm run migrate
2. O ejecutar manualmente en SQL editor
3. Verificar que todas las tablas fueron creadas
```

### Error: "SSL certificate problem"
```
Solución:
Verificar que DATABASE_URL incluye: ?sslmode=require
O agregar en código: {ssl: 'require'}
```

### BD lenta / timeouts
```
Revisar:
1. Vercel logs para queries lentas
2. Agregar índices: CREATE INDEX idx_campo ON tabla(campo)
3. Limitar LIMIT en queries
4. Usar connection pooling (ya configurado con Pool)
```

---

## Mantenimiento

### Backups automáticos
- Vercel Postgres hace backups diarios
- Retenidos por 30 días
- Dashboard → Storage → Backups

### Limpiar datos antiguos
```sql
-- Eliminar tokens expirados
DELETE FROM email_verification_tokens WHERE expires_at < NOW();

-- Eliminar logs antiguos (> 90 días)
DELETE FROM page_view_logs WHERE timestamp < NOW() - INTERVAL '90 days';

-- Vaciar después de DELETE
VACUUM;
```

### Monitoreo
- Vercel Dashboard → Storage → Metrics
- Ver uso de storage, conexiones activas
- Alertas si cuota se acerca

---

## Próximo Paso: FASE 6
Ver documento: `EMAIL-SETUP-INSTRUCTIONS.md`

**Base de datos:** ✅ Lista  
**Tablas:** ✅ 5 tablas creadas  
**Índices:** ✅ Optimizados  
**Backups:** ✅ Automáticos en Vercel
