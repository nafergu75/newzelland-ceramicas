# Setup de Base de Datos - Newzeland Cerámicas

## Opción 1: PostgreSQL Local (Desarrollo)

### 1.1 Instalar PostgreSQL

**Windows:**
1. Descarga desde https://www.postgresql.org/download/windows/
2. Ejecuta el instalador
3. Password de superusuario: anota tu contraseña
4. Port: 5432 (default)
5. Finaliza instalación

**macOS (con Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 1.2 Crear base de datos

```bash
# Conectar a PostgreSQL (te pedirá password)
psql -U postgres

# Dentro de psql:
CREATE DATABASE newzeland_ecommerce;
CREATE USER ecommerce_user WITH PASSWORD 'tu_contraseña_fuerte';
ALTER ROLE ecommerce_user SET client_encoding TO 'utf8';
ALTER ROLE ecommerce_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE ecommerce_user SET default_transaction_deferrable TO on;
GRANT ALL PRIVILEGES ON DATABASE newzeland_ecommerce TO ecommerce_user;
\q
```

### 1.3 Configurar .env local

```bash
cp backend/.env.example backend/.env
```

Edita `backend/.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=newzeland_ecommerce
DB_USER=ecommerce_user
DB_PASSWORD=tu_contraseña_fuerte
JWT_SECRET=generado_con_32_caracteres_random
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### 1.4 Ejecutar migraciones

```bash
cd backend
npm install
npm run migrate
```

---

## Opción 2: Vercel Postgres (Recomendado para Prod)

### 2.1 Conectar Vercel Postgres

```bash
# Login en Vercel
vercel login

# Conectar la BD
vercel postgres connect

# Selecciona: Create a new Postgres DB
# Nombre: newzeland-ecommerce
# Región: más cercana a tu usuario
```

### 2.2 Obtener credentials

```bash
# Los datos se guardan automáticamente en .env.local
cat .env.local

# Debe mostrar:
# POSTGRES_URL=postgresql://...
# POSTGRES_URL_NON_POOLING=postgresql://...
```

### 2.3 Actualizar backend/.env con Vercel Postgres

```
# En producción, Vercel inyecta POSTGRES_URL automáticamente
# Pero para desarrollo local, usa:
DB_HOST=localhost
DB_NAME=newzeland_ecommerce
# O copia el POSTGRES_URL de Vercel
```

---

## Opción 3: Supabase (PostgreSQL + Extras)

### 3.1 Crear cuenta y proyecto

1. Ve a https://supabase.com
2. Sign up con tu email
3. Create new project
4. Nombre: `newzeland-ecommerce`
5. Password: anota bien
6. Region: `eu-west-1` (Europa)

### 3.2 Obtener credenciales

En el dashboard de Supabase:
```
Project URL: https://...supabase.co
API Key (anon): ey...
Database Password: ...
```

### 3.3 Conectar desde backend

Edita `backend/.env`:
```
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=tu_password_supabase
```

Test conexión:
```bash
psql -h db.xxxxx.supabase.co -U postgres -d postgres
```

---

## Estructura de Tablas

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(20),
  whatsapp VARCHAR(20),
  company_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### orders
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### order_items
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_name VARCHAR(255),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2),
  total DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Verificar Conexión

### Localmente:
```bash
cd backend
npm run dev

# Debe mostrar:
# Database connected
# Server listening on port 3000
```

### En Vercel (después de deploy):
```bash
curl https://newzelland-ceramicas.vercel.app/api/health

# Debe responder:
# {"status":"ok","timestamp":"..."}
```

---

## Troubleshooting

### Error: "connect ECONNREFUSED 127.0.0.1:5432"
- PostgreSQL no está corriendo
- Windows: abre Services → busca PostgreSQL → Start
- Linux: `sudo systemctl start postgresql`
- macOS: `brew services start postgresql@15`

### Error: "role does not exist"
- Verifica que el usuario existe: `\du` en psql
- Crea el usuario si no existe

### Error: "database does not exist"
- Verifica que la BD existe: `\l` en psql
- Crea la BD si no existe

### No puedo conectar a Vercel Postgres
- Verifica que Vercel Postgres está activo en tu plan
- No está disponible en free tier de Vercel
