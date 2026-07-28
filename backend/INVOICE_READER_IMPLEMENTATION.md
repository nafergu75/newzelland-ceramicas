# Implementación del Backend - Lector OCR de Facturas

## 📋 Cambios Realizados

### 1. Tipos TypeScript (`backend/src/types/invoice.ts`)
- ✅ `LineaIva` - Línea de desglose (tipoIVA, base, cuota, confianza)
- ✅ `EntidadComercial` - Proveedor/Cliente (nombre, NIF, confianza)
- ✅ `FacturaExtraida` - Schema completo del OCR (nuevo: tipoDocumento, direccion, observaciones, requiereRevision)
- ✅ `AsientoContable` - Estructura para contabilización

### 2. Servicio de Contabilización (`backend/src/services/invoiceService.ts`)

**Funciones:**

```typescript
crearAsiento(factura: FacturaExtraida): AsientoContable
```
- Convierte FacturaExtraida → AsientoContable
- Aplica reglas contables según dirección:
  - **Ingreso (ventas)**: Cuenta 700/705
  - **Gasto (compras)**: Cuenta 600/621/622
- Genera ID único: `VENT-{timestamp}` o `COMP-{timestamp}`

```typescript
guardarAsiento(asiento: AsientoContable): Promise<{ id: string; ok: boolean }>
```
- Persiste el asiento en BD (pseudoimplementado)
- TODO: Integrar con BD real (PostgreSQL, MongoDB, etc.)

```typescript
puedeContabilizarse(factura: FacturaExtraida): boolean
```
- Valida que factura no requiere revisión
- Valida confianza >= media
- Valida campos críticos (fecha, total, bases)

### 3. Controlador Actualizado (`backend/src/controllers/adminController.ts`)

**Endpoint actualizado:**
```
POST /api/admin/facturas/contabilizar
```

**Validaciones:**
1. ✅ `requiereRevision === false` (si true → error 400)
2. ✅ `confianza !== 'baja'` (si baja → error 400)
3. ✅ Total > 0 y bases presentes
4. ✅ Fecha y dirección válida
5. ✅ Tipo de documento válido

**Flujo:**
```
POST /api/admin/facturas/contabilizar (con FacturaExtraida)
    ↓
Validar requiereRevision
    ↓
Validar campos críticos
    ↓
crearAsiento(factura) → AsientoContable
    ↓
guardarAsiento(asiento) → BD
    ↓
{ ok: true, id, mensaje, asiento }
```

### 4. Ruta Configurada (`backend/src/routes/admin.ts`)
- Línea 19: `router.post('/facturas/contabilizar', contabilizarFactura)`
- Middleware: `authMiddleware, adminMiddleware`

---

## 🔄 Flujo Completo (Frontend → Backend)

```
1. Usuario arrastra factura
   └─ InvoiceIncomeReader.tsx / InvoiceExpenseReader.tsx
   
2. OCR Procesa archivo
   └─ imagePreprocessing.ts → invoiceOcrService.ts → invoiceParser.ts
   
3. Validación
   └─ invoiceValidation.ts → FacturaExtraida con requiereRevision flag
   
4. UI muestra resultados
   └─ Si requiereRevision=false → Botón "Contabilizar" activo
   └─ Si requiereRevision=true → Botón deshabilitado
   
5. Usuario hace clic en "Contabilizar"
   └─ POST /api/admin/facturas/contabilizar (FacturaExtraida sin textoExtraido)
   
6. Backend valida
   └─ No permitir si requiereRevision=true
   └─ No permitir si confianza='baja'
   
7. Crear asiento contable
   └─ crearAsiento() → determina cuentas según dirección
   └─ guardarAsiento() → persiste en BD
   
8. Respuesta al cliente
   └─ { ok: true, id, mensaje, asiento }
```

---

## 💾 Estructura de BD Propuesta

### Tabla: `asientos_contables`
```sql
CREATE TABLE asientos_contables (
  id VARCHAR PRIMARY KEY,           -- VENT-{ts} / COMP-{ts}
  fecha DATE NOT NULL,
  descripcion VARCHAR,
  entidad VARCHAR,
  nif VARCHAR,
  total DECIMAL(10, 2),
  moneda CHAR(3),
  direccion VARCHAR(10),            -- ingreso|gasto
  confianza VARCHAR(10),            -- alta|media|baja
  estado VARCHAR(20) DEFAULT 'registrado',  -- registrado|validado|error
  createdAt TIMESTAMP DEFAULT NOW(),
  INDEX(fecha, direccion)
);
```

### Tabla: `asiento_lineas`
```sql
CREATE TABLE asiento_lineas (
  id AUTO_INCREMENT PRIMARY KEY,
  asiento_id VARCHAR NOT NULL,
  cuenta VARCHAR(10),               -- 700|705|600|621|622
  base DECIMAL(10, 2),
  tipoIVA TINYINT,
  cuota DECIMAL(10, 2),
  FOREIGN KEY (asiento_id) REFERENCES asientos_contables(id)
);
```

### Tabla: `asiento_observaciones`
```sql
CREATE TABLE asiento_observaciones (
  id AUTO_INCREMENT PRIMARY KEY,
  asiento_id VARCHAR NOT NULL,
  observacion TEXT,
  FOREIGN KEY (asiento_id) REFERENCES asientos_contables(id)
);
```

---

## 🎯 Próximos Pasos

1. **Integración BD Real**
   ```typescript
   // En invoiceService.ts
   export async function guardarAsiento(asiento) {
     const db = await getDb(); // Conexión a PostgreSQL/MongoDB
     const result = await db.asientos_contables.insertOne(asiento);
     // Grabar líneas, observaciones, auditoría
   }
   ```

2. **Auditoría**
   - Registrar usuario, IP, timestamp
   - Guardar factura original (textoExtraido)

3. **Validaciones Adicionales**
   - Verificar NIF con API AEAT
   - Detectar duplicados
   - Alertar si importes anómalos

4. **Reportes**
   - GET `/api/admin/asientos` - Listar asientos
   - GET `/api/admin/asientos/{id}` - Detalle
   - GET `/api/admin/asientos/stats` - Resumen por período

---

## ✅ Compilación

```bash
cd backend
npx tsc --noEmit
# ✅ 0 errores
```

## 🧪 Testing (Curl)

```bash
# Factura válida (debe contabilizarse)
curl -X POST http://localhost:3000/api/admin/facturas/contabilizar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
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

# Respuesta esperada
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

---

**Estado:** ✅ Implementación completada y lista para integración BD
