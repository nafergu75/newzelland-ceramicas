# 📊 Setup de PostgreSQL - Lector OCR

## 1️⃣ Instalación de PostgreSQL

### Windows (Recomendado: PostgreSQL 15+)
```bash
# Descargar desde https://www.postgresql.org/download/windows/
# O usar Chocolatey:
choco install postgresql

# Iniciar servicio (automático por defecto)
```

### Docker (Alternativa)
```bash
docker run --name newzelland-postgres \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=postgres123 \
  -e POSTGRES_DB=newzelland \
  -p 5432:5432 \
  -d postgres:15-alpine
```

---

## 2️⃣ Configuración de Variables de Entorno

Editar `.env` en `backend/`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=newzelland
DB_USER=admin
DB_PASSWORD=postgres123
```

---

## 3️⃣ Crear Base de Datos

```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear BD (en psql shell):
CREATE DATABASE newzelland;
\c newzelland

# O via línea de comandos:
createdb -U postgres -h localhost newzelland
```

---

## 4️⃣ Ejecutar Migraciones

```bash
cd backend

# Instalar dependencias si no están
npm install

# Ejecutar migraciones
npx ts-node src/db/migrations.ts
```

**Salida esperada:**
```
✓ Migrations ejecutadas correctamente
```

---

## 5️⃣ Verificar Tablas Creadas

```bash
psql -U admin -h localhost -d newzelland

# Ver tablas:
\dt

# Ver estructura:
\d asientos_contables
\d asiento_lineas
\d asiento_observaciones
```

**Tablas creadas:**
```
asientos_contables      - Encabezados de asientos
asiento_lineas          - Líneas por asiento (base, IVA, cuota)
asiento_observaciones   - Observaciones/alertas por asiento
```

---

## 🔍 Esquema de Tablas

### `asientos_contables`
```sql
id              VARCHAR(50) PRIMARY KEY     -- VENT-{ts} / COMP-{ts}
fecha           DATE NOT NULL               -- 2026-07-17
descripcion     VARCHAR(255)                -- "factura 2024-001"
entidad         VARCHAR(255)                -- "Proveedor S.L."
nif             VARCHAR(20)                 -- "12345678Z"
total           DECIMAL(12,2)               -- 1210.50
moneda          CHAR(3)                     -- EUR
direccion       VARCHAR(10)                 -- ingreso|gasto
confianza       VARCHAR(10)                 -- alta|media|baja
estado          VARCHAR(20)                 -- registrado|validado|error
usuario_id      UUID                        -- Usuario que contabilizó
observaciones   TEXT                        -- Concatenadas con \n
created_at      TIMESTAMP                   -- Auto
updated_at      TIMESTAMP                   -- Auto

Índices:
  - fecha, direccion, usuario_id, estado, nif
```

### `asiento_lineas`
```sql
id              SERIAL PRIMARY KEY
asiento_id      VARCHAR(50) FK              -- → asientos_contables
cuenta          VARCHAR(20)                 -- 700, 705, 600, 621, 622
base            DECIMAL(12,2)               -- 1000.00
tipo_iva        SMALLINT                    -- 21, 10, 4
cuota           DECIMAL(12,2)               -- 210.00
confianza       DECIMAL(3,2)                -- 0.95 (del OCR)
created_at      TIMESTAMP                   -- Auto

Índices:
  - asiento_id, cuenta
```

### `asiento_observaciones`
```sql
id              SERIAL PRIMARY KEY
asiento_id      VARCHAR(50) FK              -- → asientos_contables
observacion     TEXT                        -- "No se detectó NIF"
created_at      TIMESTAMP                   -- Auto

Índices:
  - asiento_id
```

---

## 🧪 Testing API

### 1. Contabilizar factura
```bash
curl -X POST http://localhost:3000/api/admin/facturas/contabilizar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -d '{
    "tipoDocumento": "factura",
    "direccion": "gasto",
    "numeroFactura": "2024-001",
    "fecha": "2026-07-17",
    "entidad": {"nombre": "Proveedor S.L.", "nif": "12345678Z", "confianza": 1},
    "bases": [{"tipoIVA": 21, "base": 1000, "cuota": 210, "confianza": 0.95}],
    "totalFactura": 1210,
    "moneda": "EUR",
    "confianza": "alta",
    "requiereRevision": false,
    "observaciones": []
  }'
```

**Respuesta:**
```json
{
  "ok": true,
  "id": "COMP-1721236800000",
  "mensaje": "Factura contabilizada como compra",
  "asiento": {
    "id": "COMP-1721236800000",
    "fecha": "2026-07-17",
    "total": 1210,
    "direccion": "gasto",
    "confianza": "alta"
  }
}
```

### 2. Listar asientos
```bash
curl http://localhost:3000/api/admin/asientos?direccion=gasto \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

**Parámetros opcionales:**
- `?direccion=ingreso|gasto`
- `?estado=registrado|validado|error`
- `?desde=2026-07-01&hasta=2026-07-31`
- `?nif=12345678Z`

### 3. Obtener detalle
```bash
curl http://localhost:3000/api/admin/asientos/COMP-1721236800000 \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

**Respuesta:**
```json
{
  "ok": true,
  "asiento": {
    "id": "COMP-1721236800000",
    "fecha": "2026-07-17",
    "descripcion": "factura 2024-001",
    "entidad": "Proveedor S.L.",
    "nif": "12345678Z",
    "total": 1210,
    "direccion": "gasto",
    "confianza": "alta",
    "lineas": [
      {
        "id": 1,
        "asiento_id": "COMP-1721236800000",
        "cuenta": "600",
        "base": 1000,
        "tipo_iva": 21,
        "cuota": 210,
        "confianza": 0.95
      }
    ],
    "observaciones": []
  }
}
```

---

## 🚀 Endpoints Disponibles

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/admin/facturas/contabilizar` | Contabilizar factura OCR | ✅ |
| GET | `/api/admin/asientos` | Listar asientos | ✅ |
| GET | `/api/admin/asientos/:id` | Obtener detalle | ✅ |

---

## 📋 Checklist de Setup

- [ ] PostgreSQL instalado y corriendo
- [ ] BD `newzelland` creada
- [ ] Variables `.env` configuradas
- [ ] Migraciones ejecutadas (`npx ts-node src/db/migrations.ts`)
- [ ] Tablas verificadas en `psql`
- [ ] Backend iniciado (`npm run dev`)
- [ ] Test POST `/api/admin/facturas/contabilizar`
- [ ] Test GET `/api/admin/asientos`

---

## ⚡ Troubleshooting

### Error: `connect ECONNREFUSED`
```
PostgreSQL no está corriendo
→ Iniciar servicio: services.msc (Windows) o `pg_ctl start` (macOS/Linux)
```

### Error: `FATAL: database "newzelland" does not exist`
```
BD no creada
→ Ejecutar: createdb -U postgres -h localhost newzelland
```

### Error: `permission denied for schema public`
```
Usuario sin permisos
→ Ejecutar en psql:
GRANT ALL PRIVILEGES ON SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;
```

### Error en migraciones: `table already exists`
```
Tablas ya existen (seguro)
→ Las migraciones usan CREATE TABLE IF NOT EXISTS
→ Ejecutar de nuevo es seguro
```

---

## 🔐 Seguridad (Producción)

```env
DB_PASSWORD=contraseña_fuerte_32_caracteres_aleatorios
DB_HOST=db.produccion.com
DB_SSL=require
```

En `connection.ts`:
```typescript
const pool = new Pool({
  // ...
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
});
```

---

**Estado:** ✅ PostgreSQL integrado y listo
