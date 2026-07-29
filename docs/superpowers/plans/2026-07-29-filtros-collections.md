# Filtros avanzados en /collections — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar el catálogo de series de `catalogo.json` (estático) a una tabla real `collections` en Postgres, y sustituir el filtro simple de `/collections` por un sidebar de filtros multi-selección (checkboxes con recuento) que filtra en cliente, con drawer en móvil y CRUD de administración.

**Architecture:** Backend expone `GET /api/collections` (público, sin query params — devuelve las 90 filas en una respuesta) y `GET/POST/PUT/DELETE /api/admin/collections` (protegido). El frontend carga esa lista una vez y filtra en memoria con `useMemo`; no hay ida y vuelta al servidor por cada click de checkbox. La vista de detalle de serie (`/collections/:slug`) NO se toca — sigue leyendo `catalogo.json` estático (decisión ya tomada en el spec, ver "Fuera de alcance").

**Tech Stack:** Node/Express (`api/index.js`), `pg`, React + TypeScript (Vite), CSS con variables propias (sin Tailwind).

**Nota sobre verificación:** este proyecto no tiene ningún framework de test (no hay Jest/Vitest/Mocha, `grep` confirmado). La verificación en todo el proyecto se hace con `npx tsc --noEmit`, smoke tests por `curl`/`node -e` contra el backend real, y comprobación en navegador (Claude_Browser). Cada tarea usa ese mismo patrón en vez de "escribe el test que falla" — sería inconsistente inventar un framework de test nuevo solo para esta feature.

---

### Task 1: Backend — tabla `collections` y endpoint público

**Files:**
- Modify: `api/index.js:335` (justo después de `ensureProjectsTable();`)
- Modify: `api/index.js` (endpoint público, cerca de `GET /api/catalog`)
- Modify: `api/index.js:2321` (listado de endpoints en `GET /api`)

- [ ] **Step 1: Añadir `ensureCollectionsTable()` justo después de `ensureProjectsTable();` (línea 335)**

Buscar:
```javascript
ensureProjectsTable();
```

Reemplazar por:
```javascript
ensureProjectsTable();

// ============================================
// COLLECTIONS: catálogo de series, migrado desde catalogo.json.
// tipo/formatos/acabados/colores se guardan como array porque ya lo son en
// el dato real (una serie puede ser Pavimento Y Revestimiento a la vez) —
// forzarlos a un solo valor perdería esa información.
// acabado_corte/espesor/estilo no tienen dato real disponible: se crean
// con un valor genérico y `especificaciones_verificadas` marca que faltan
// por revisar desde el admin.
// ============================================

async function ensureCollectionsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS collections (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        imagen_portada VARCHAR(500),
        material VARCHAR(100),
        tipo TEXT[],
        formatos TEXT[],
        acabados TEXT[],
        colores TEXT[],
        precio_consultable BOOLEAN DEFAULT TRUE,
        acabado_corte VARCHAR(100) DEFAULT 'Rectificado',
        espesor DECIMAL(5,2) DEFAULT 10.0,
        estilo VARCHAR(100) DEFAULT 'Moderno',
        especificaciones_verificadas BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_collections_material ON collections(material);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_collections_estilo ON collections(estilo);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);`);
  } catch (error) {
    console.error('Error creando tabla collections:', error.message);
  }
}

ensureCollectionsTable();
```

- [ ] **Step 2: Añadir el endpoint público `GET /api/collections`**

Buscar (añadido en una tarea anterior de esta misma sesión):
```javascript
app.get('/api/catalog', (req, res) => {
  res.json(catalogoData);
});
```

Reemplazar por (añade el nuevo endpoint justo después):
```javascript
app.get('/api/catalog', (req, res) => {
  res.json(catalogoData);
});

// GET /api/collections — catálogo migrado a BD. Sin filtros de query: las
// ~90 filas viajan completas en una respuesta y el filtrado vive en el
// cliente (ver docs/superpowers/specs/2026-07-29-filtros-collections-design.md).
// Alias de columnas (slug->id, imagen_portada->imagen) para que el
// resultado sea estructuralmente compatible con el tipo `Serie` que ya
// consumen SeriesCard/AddToCartBox — cero adaptador en el frontend.
app.get('/api/collections', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        slug AS id,
        nombre,
        descripcion,
        imagen_portada AS imagen,
        material,
        tipo,
        formatos,
        acabados,
        colores,
        precio_consultable,
        acabado_corte,
        espesor,
        estilo,
        especificaciones_verificadas
      FROM collections
      ORDER BY nombre ASC
    `);
    res.json({ collections: result.rows, total: result.rows.length });
  } catch (error) {
    console.error('Error en GET /api/collections:', error);
    res.status(500).json({ error: 'Error obteniendo colecciones' });
  }
});
```

- [ ] **Step 3: Añadir la ruta a la lista de `GET /api`**

Buscar:
```javascript
      'GET /api/catalog',
      'GET /api/projects',
```

Reemplazar por:
```javascript
      'GET /api/catalog',
      'GET /api/collections',
      'GET /api/projects',
```

- [ ] **Step 4: Verificar sintaxis**

Run: `node --check api/index.js`
Expected: sin salida (sintaxis válida)

- [ ] **Step 5: Reiniciar el backend local y comprobar que la tabla se crea**

Run (PowerShell, detener proceso si ya hay uno en el puerto 3000):
```bash
node api/index.js &
sleep 3
curl -s http://localhost:3000/api/health
```
Expected: `{"status":"ok","database":"connected"}`

Run:
```bash
curl -s http://localhost:3000/api/collections
```
Expected: `{"collections":[],"total":0}` (tabla creada pero vacía — se llena en Task 3)

- [ ] **Step 6: Commit**

```bash
git add api/index.js
git commit -m "feat: tabla collections y endpoint público GET /api/collections"
```

---

### Task 2: Backend — CRUD de administración `/api/admin/collections`

**Files:**
- Modify: `api/index.js` (endpoints admin, justo antes de `// GET /api/admin/projects/export`)
- Modify: `api/index.js:2321` (listado de endpoints)

- [ ] **Step 1: Añadir los 5 endpoints admin (listado, detalle interno vía listado, crear, editar, borrar, export CSV)**

Insertar ANTES de la sección `// ============================================\n// PROJECTS / CASOS DE ÉXITO` (buscar ese comentario exacto) el siguiente bloque:

```javascript
// ============================================
// ADMIN: CRUD DE COLLECTIONS
// ============================================

app.get('/api/admin/collections', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, slug, nombre, descripcion, imagen_portada, material, tipo,
             formatos, acabados, colores, precio_consultable, acabado_corte,
             espesor, estilo, especificaciones_verificadas, created_at, updated_at
      FROM collections
      ORDER BY nombre ASC
    `);
    res.json({ collections: result.rows, total: result.rows.length });
  } catch (error) {
    console.error('Error en GET /api/admin/collections:', error);
    res.status(500).json({ error: 'Error al listar colecciones' });
  }
});

app.post('/api/admin/collections', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      slug, nombre, descripcion, imagen_portada, material, tipo, formatos,
      acabados, colores, precio_consultable, acabado_corte, espesor, estilo,
      especificaciones_verificadas,
    } = req.body;

    if (!slug || !nombre) {
      return res.status(400).json({ error: 'Datos incompletos', message: 'slug y nombre son obligatorios' });
    }

    const result = await pool.query(
      `INSERT INTO collections (
        slug, nombre, descripcion, imagen_portada, material, tipo, formatos,
        acabados, colores, precio_consultable, acabado_corte, espesor, estilo,
        especificaciones_verificadas
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING *`,
      [
        slug, nombre, descripcion || null, imagen_portada || null, material || null,
        tipo || [], formatos || [], acabados || [], colores || [],
        precio_consultable !== undefined ? precio_consultable : true,
        acabado_corte || 'Rectificado', espesor || 10.0, estilo || 'Moderno',
        especificaciones_verificadas || false,
      ]
    );
    res.status(201).json({ success: true, collection: result.rows[0] });
  } catch (error) {
    console.error('Error en POST /api/admin/collections:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe una colección con ese slug' });
    }
    res.status(500).json({ error: 'Error al crear la colección' });
  }
});

app.put('/api/admin/collections/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      nombre, descripcion, imagen_portada, material, tipo, formatos, acabados,
      colores, precio_consultable, acabado_corte, espesor, estilo,
      especificaciones_verificadas,
    } = req.body;

    const result = await pool.query(
      `UPDATE collections SET
        nombre = COALESCE($1, nombre),
        descripcion = COALESCE($2, descripcion),
        imagen_portada = COALESCE($3, imagen_portada),
        material = COALESCE($4, material),
        tipo = COALESCE($5, tipo),
        formatos = COALESCE($6, formatos),
        acabados = COALESCE($7, acabados),
        colores = COALESCE($8, colores),
        precio_consultable = COALESCE($9, precio_consultable),
        acabado_corte = COALESCE($10, acabado_corte),
        espesor = COALESCE($11, espesor),
        estilo = COALESCE($12, estilo),
        especificaciones_verificadas = COALESCE($13, especificaciones_verificadas),
        updated_at = NOW()
      WHERE id = $14
      RETURNING *`,
      [
        nombre || null, descripcion || null, imagen_portada || null, material || null,
        tipo || null, formatos || null, acabados || null, colores || null,
        precio_consultable !== undefined ? precio_consultable : null,
        acabado_corte || null, espesor !== undefined ? espesor : null, estilo || null,
        especificaciones_verificadas !== undefined ? especificaciones_verificadas : null,
        req.params.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Colección no encontrada' });
    }
    res.json({ success: true, collection: result.rows[0] });
  } catch (error) {
    console.error('Error en PUT /api/admin/collections/:id:', error);
    res.status(500).json({ error: 'Error al actualizar la colección' });
  }
});

app.delete('/api/admin/collections/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM collections WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Colección no encontrada' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error en DELETE /api/admin/collections/:id:', error);
    res.status(500).json({ error: 'Error al eliminar la colección' });
  }
});

app.get('/api/admin/collections/export', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT slug, nombre, material, tipo, formatos, acabados, acabado_corte,
             espesor, estilo, especificaciones_verificadas, created_at
      FROM collections
      ORDER BY nombre ASC
    `);

    const csv = toCsv(
      result.rows.map((r) => ({
        ...r,
        tipo: (r.tipo || []).join(', '),
        formatos: (r.formatos || []).join(', '),
        acabados: (r.acabados || []).join(', '),
      })),
      [
        { key: 'slug', label: 'Slug' },
        { key: 'nombre', label: 'Nombre' },
        { key: 'material', label: 'Material' },
        { key: 'tipo', label: 'Tipo' },
        { key: 'formatos', label: 'Formatos' },
        { key: 'acabados', label: 'Acabados' },
        { key: 'acabado_corte', label: 'Acabado de corte' },
        { key: 'espesor', label: 'Espesor (mm)' },
        { key: 'estilo', label: 'Estilo' },
        { key: 'especificaciones_verificadas', label: 'Especificaciones verificadas' },
        { key: 'created_at', label: 'Creado' },
      ]
    );

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="collections-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send('﻿' + csv);
  } catch (error) {
    console.error('Error en GET /api/admin/collections/export:', error);
    res.status(500).json({ error: 'Error al exportar colecciones' });
  }
});

```

- [ ] **Step 2: Añadir las rutas a la lista de `GET /api`**

Buscar:
```javascript
      'GET /api/collections',
      'GET /api/projects',
```

Reemplazar por:
```javascript
      'GET /api/collections',
      'GET /api/admin/collections',
      'POST /api/admin/collections',
      'PUT /api/admin/collections/:id',
      'DELETE /api/admin/collections/:id',
      'GET /api/admin/collections/export',
      'GET /api/projects',
```

- [ ] **Step 3: Verificar sintaxis**

Run: `node --check api/index.js`
Expected: sin salida

- [ ] **Step 4: Reiniciar backend y probar el CRUD con curl (login como admin ya usado en la sesión: `test-crm-e3@example.com` / `TestPass123`)**

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"test-crm-e3@example.com","password":"TestPass123"}' | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).token))")

curl -s -X POST http://localhost:3000/api/admin/collections -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"slug":"test-plan","nombre":"Test Plan","material":"Gres","tipo":["Pavimento"],"formatos":["30x60"],"acabados":["Mate"]}'
```
Expected: `{"success":true,"collection":{...,"slug":"test-plan",...}}`

```bash
curl -s http://localhost:3000/api/admin/collections -H "Authorization: Bearer $TOKEN" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).total))"
```
Expected: `1`

```bash
curl -s -X DELETE http://localhost:3000/api/admin/collections/$(curl -s http://localhost:3000/api/admin/collections -H "Authorization: Bearer $TOKEN" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).collections[0].id))") -H "Authorization: Bearer $TOKEN"
```
Expected: `{"success":true}` (limpia el registro de prueba)

- [ ] **Step 5: Commit**

```bash
git add api/index.js
git commit -m "feat: CRUD de admin para collections"
```

---

### Task 3: Script de migración de `catalogo.json` a la tabla

**Files:**
- Create: `scripts/migrate-catalog-to-collections.js`

- [ ] **Step 1: Crear el script**

```javascript
// scripts/migrate-catalog-to-collections.js
// Ejecutar UNA VEZ: node scripts/migrate-catalog-to-collections.js
// Idempotente: ON CONFLICT (slug) DO NOTHING — si se re-ejecuta no pisa
// ediciones ya hechas desde el admin.

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const catalogo = require('../frontend/src/data/catalogo.json');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function migrar() {
  let insertadas = 0;
  let omitidas = 0;

  for (const serie of catalogo.series) {
    const result = await pool.query(
      `INSERT INTO collections (
        slug, nombre, descripcion, imagen_portada, material, tipo, formatos,
        acabados, colores, precio_consultable
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      ON CONFLICT (slug) DO NOTHING
      RETURNING id`,
      [
        serie.id,
        serie.nombre,
        serie.descripcion,
        serie.imagen,
        serie.material,
        serie.tipo,
        serie.formatos,
        serie.acabados,
        serie.colores,
        serie.precio_consultable,
      ]
    );
    if (result.rows.length > 0) {
      insertadas++;
    } else {
      omitidas++;
    }
  }

  console.log(`Migración completada: ${insertadas} insertadas, ${omitidas} ya existían (omitidas).`);
  await pool.end();
}

migrar().catch((error) => {
  console.error('Error en la migración:', error);
  process.exit(1);
});
```

- [ ] **Step 2: Ejecutar el script**

Run: `node scripts/migrate-catalog-to-collections.js`
Expected: `Migración completada: 90 insertadas, 0 ya existían (omitidas).`

- [ ] **Step 3: Verificar que el endpoint público ya devuelve las 90 series**

```bash
curl -s http://localhost:3000/api/collections | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const j=JSON.parse(d);console.log('total:',j.total);console.log('primera:',j.collections[0].id, j.collections[0].material)})"
```
Expected: `total: 90` y una serie real (ej. `alpina Porcelánico`)

- [ ] **Step 4: Re-ejecutar el script para confirmar idempotencia**

Run: `node scripts/migrate-catalog-to-collections.js`
Expected: `Migración completada: 0 insertadas, 90 ya existían (omitidas).`

- [ ] **Step 5: Commit**

```bash
git add scripts/migrate-catalog-to-collections.js
git commit -m "feat: script de migración de catalogo.json a la tabla collections"
```

---

### Task 4: Frontend — tipo `Collection` y servicio de datos

**Files:**
- Create: `frontend/src/types/collections.ts`
- Create: `frontend/src/services/collectionsService.ts`

- [ ] **Step 1: Crear el tipo**

```typescript
// frontend/src/types/collections.ts

// Estructuralmente compatible con `Serie` (frontend/src/data/catalog.ts) en
// los campos que consumen SeriesCard/AddToCartBox (id, nombre, imagen,
// material, formatos) — el backend alía slug->id e imagen_portada->imagen
// en GET /api/collections precisamente para esto, sin adaptador aquí.
export interface Collection {
  id: string
  nombre: string
  descripcion: string
  imagen: string
  material: string
  tipo: string[]
  formatos: string[]
  acabados: string[]
  colores: string[]
  precio_consultable: boolean
  acabado_corte: string
  espesor: number
  estilo: string
  especificaciones_verificadas: boolean
}

export interface AdminCollection extends Collection {
  dbId: number
  slug: string
  createdAt: string
  updatedAt: string
}
```

- [ ] **Step 2: Crear el servicio (mismo patrón que `catalogService.ts`: axios directo + `VITE_API_URL`, endpoint público sin auth)**

```typescript
// frontend/src/services/collectionsService.ts
import axios from 'axios'
import type { Collection } from '../types/collections'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export async function getCollections(): Promise<Collection[]> {
  const response = await axios.get<{ collections: Collection[]; total: number }>(`${API_BASE}/collections`)
  return response.data.collections
}
```

- [ ] **Step 3: Verificar TypeScript**

Run: `cd frontend && npx tsc --noEmit`
Expected: sin errores

- [ ] **Step 4: Commit**

```bash
git add frontend/src/types/collections.ts frontend/src/services/collectionsService.ts
git commit -m "feat: tipo Collection y servicio de datos para /api/collections"
```

---

### Task 5: Frontend — ampliar `SeriesCard`/`AddToCartBox` para aceptar `Collection`

**Files:**
- Modify: `frontend/src/components/SeriesCard.tsx:1-13`
- Modify: `frontend/src/components/AddToCartBox.tsx:1-15`

- [ ] **Step 1: Ampliar el tipo de prop en `SeriesCard.tsx`**

Buscar:
```tsx
import { Link } from 'react-router-dom'
import { ArrowRight } from '@phosphor-icons/react'
import { Serie } from '../data/catalog'
import { useReveal } from '../hooks/useReveal'
import AddToCartBox from './AddToCartBox'
import ImageWithFallback from './ImageWithFallback'
import '../styles/components.css'

interface SeriesCardProps {
  serie: Serie
  delay?: number
}
```

Reemplazar por:
```tsx
import { Link } from 'react-router-dom'
import { ArrowRight } from '@phosphor-icons/react'
import { Serie } from '../data/catalog'
import type { Collection } from '../types/collections'
import { useReveal } from '../hooks/useReveal'
import AddToCartBox from './AddToCartBox'
import ImageWithFallback from './ImageWithFallback'
import '../styles/components.css'

interface SeriesCardProps {
  serie: Serie | Collection
  delay?: number
}
```

- [ ] **Step 2: Ampliar el tipo de prop en `AddToCartBox.tsx`**

Buscar:
```tsx
import { useMemo, useState, MouseEvent } from 'react'
import { Minus, Plus, ShoppingCartSimple, Check } from '@phosphor-icons/react'
import type { Serie } from '../data/catalog'
import { getFormatosConTarifa, desglosarPreciosConIVA, TarifaProducto } from '../data/tarifa'
import { useCart } from '../context/CartContext'
import FormatSelectorModal from './FormatSelectorModal'
import '../styles/components.css'

const currency = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })

interface AddToCartBoxProps {
  serie: Serie
  /** Versión reducida para tarjetas de catálogo: solo botón + precio, sin selector de formato. */
  compact?: boolean
}
```

Reemplazar por:
```tsx
import { useMemo, useState, MouseEvent } from 'react'
import { Minus, Plus, ShoppingCartSimple, Check } from '@phosphor-icons/react'
import type { Serie } from '../data/catalog'
import type { Collection } from '../types/collections'
import { getFormatosConTarifa, desglosarPreciosConIVA, TarifaProducto } from '../data/tarifa'
import { useCart } from '../context/CartContext'
import FormatSelectorModal from './FormatSelectorModal'
import '../styles/components.css'

const currency = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })

interface AddToCartBoxProps {
  serie: Serie | Collection
  /** Versión reducida para tarjetas de catálogo: solo botón + precio, sin selector de formato. */
  compact?: boolean
}
```

- [ ] **Step 3: Verificar TypeScript (confirma que ambos componentes siguen compilando con el tipo ampliado — todos los campos que usan `serie.id/nombre/imagen/material/formatos` son compatibles entre `Serie` y `Collection`)**

Run: `cd frontend && npx tsc --noEmit`
Expected: sin errores

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/SeriesCard.tsx frontend/src/components/AddToCartBox.tsx
git commit -m "feat: SeriesCard y AddToCartBox aceptan Serie o Collection"
```

---

### Task 6: Frontend — componente `CollectionsFilters` (checkboxes + recuento)

**Files:**
- Create: `frontend/src/components/CollectionsFilters.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
// frontend/src/components/CollectionsFilters.tsx
import type { Collection } from '../types/collections'

export interface ActiveFilters {
  material: string[]
  tipo: string[]
  formatos: string[]
  acabados: string[]
  espesor: string[]
  estilo: string[]
}

export const EMPTY_FILTERS: ActiveFilters = {
  material: [],
  tipo: [],
  formatos: [],
  acabados: [],
  espesor: [],
  estilo: [],
}

// Rangos fijos de espesor (mm) — ver spec, sección "Espesor: filtro por rango".
const RANGOS_ESPESOR: Array<{ label: string; min: number; max: number }> = [
  { label: '6-8 mm', min: 6, max: 8 },
  { label: '8-10 mm', min: 8, max: 10 },
  { label: '10-12 mm', min: 10, max: 12 },
  { label: '12-15 mm', min: 12, max: 15 },
  { label: '15-20 mm', min: 15, max: 20 },
]

export function espesorEnRango(espesor: number, rangoLabel: string): boolean {
  const rango = RANGOS_ESPESOR.find((r) => r.label === rangoLabel)
  if (!rango) return false
  return espesor >= rango.min && espesor <= rango.max
}

interface FilterOption {
  value: string
  count: number
}

function contarValoresUnicos(collections: Collection[], campo: 'material' | 'estilo' | 'acabado_corte'): FilterOption[] {
  const counts = new Map<string, number>()
  for (const c of collections) {
    const valor = c[campo]
    if (!valor) continue
    counts.set(valor, (counts.get(valor) || 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value))
}

function contarValoresArray(collections: Collection[], campo: 'tipo' | 'formatos' | 'acabados'): FilterOption[] {
  const counts = new Map<string, number>()
  for (const c of collections) {
    for (const valor of c[campo] || []) {
      counts.set(valor, (counts.get(valor) || 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value))
}

function contarRangosEspesor(collections: Collection[]): FilterOption[] {
  return RANGOS_ESPESOR.map((rango) => ({
    value: rango.label,
    count: collections.filter((c) => espesorEnRango(c.espesor, rango.label)).length,
  }))
}

interface CollectionsFiltersProps {
  collections: Collection[]
  search: string
  onSearchChange: (value: string) => void
  activeFilters: ActiveFilters
  onToggle: (categoria: keyof ActiveFilters, valor: string) => void
  onClear: () => void
}

export default function CollectionsFilters({
  collections,
  search,
  onSearchChange,
  activeFilters,
  onToggle,
  onClear,
}: CollectionsFiltersProps) {
  const hasActiveFilters =
    search.trim() !== '' || Object.values(activeFilters).some((arr) => arr.length > 0)

  const secciones: Array<{ titulo: string; categoria: keyof ActiveFilters; opciones: FilterOption[] }> = [
    { titulo: 'Material', categoria: 'material', opciones: contarValoresUnicos(collections, 'material') },
    { titulo: 'Tipo', categoria: 'tipo', opciones: contarValoresArray(collections, 'tipo') },
    { titulo: 'Formato', categoria: 'formatos', opciones: contarValoresArray(collections, 'formatos') },
    { titulo: 'Acabado', categoria: 'acabados', opciones: contarValoresArray(collections, 'acabados') },
    { titulo: 'Espesor', categoria: 'espesor', opciones: contarRangosEspesor(collections) },
    { titulo: 'Estilo', categoria: 'estilo', opciones: contarValoresUnicos(collections, 'estilo') },
  ]

  return (
    <div className="collections-filters">
      <div className="collections-filters-search">
        <label htmlFor="buscar-serie">Buscar serie</label>
        <input
          id="buscar-serie"
          type="text"
          placeholder="Nombre de la serie..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {secciones.map((seccion) => (
        <div className="collections-filters-section" key={seccion.categoria}>
          <h3>{seccion.titulo}</h3>
          <div className="collections-filters-options">
            {seccion.opciones.map((opcion) => (
              <label key={opcion.value} className="collections-filters-checkbox">
                <input
                  type="checkbox"
                  checked={activeFilters[seccion.categoria].includes(opcion.value)}
                  onChange={() => onToggle(seccion.categoria, opcion.value)}
                />
                <span>{opcion.value}</span>
                <span className="collections-filters-count">({opcion.count})</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {hasActiveFilters && (
        <button type="button" className="secondary collections-filters-clear" onClick={onClear}>
          Limpiar filtros
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

Run: `cd frontend && npx tsc --noEmit`
Expected: sin errores

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/CollectionsFilters.tsx
git commit -m "feat: componente CollectionsFilters (checkboxes multi-selección con recuento)"
```

---

### Task 7: Frontend — componente `FilterDrawer` (móvil)

**Files:**
- Create: `frontend/src/components/FilterDrawer.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
// frontend/src/components/FilterDrawer.tsx
import { ReactNode, useEffect } from 'react'
import { X } from '@phosphor-icons/react'

interface FilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

/** Envoltorio genérico para mostrar contenido (los filtros) como panel
 *  deslizante en móvil. Solo se usa por debajo del breakpoint de escritorio
 *  (ver .filter-drawer-overlay { display: none } a partir de 1024px en CSS). */
export default function FilterDrawer({ isOpen, onClose, children }: FilterDrawerProps) {
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  return (
    <div className={`filter-drawer-overlay ${isOpen ? 'is-open' : ''}`} onClick={onClose}>
      <div
        className="filter-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Filtros"
      >
        <div className="filter-drawer-header">
          <h2>Filtros</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar filtros">
            <X size={20} />
          </button>
        </div>
        <div className="filter-drawer-body">{children}</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

Run: `cd frontend && npx tsc --noEmit`
Expected: sin errores

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/FilterDrawer.tsx
git commit -m "feat: componente FilterDrawer para filtros en móvil"
```

---

### Task 8: Frontend — CSS del sidebar/drawer/checkboxes

**Files:**
- Modify: `frontend/src/styles/components.css` (añadir al final)

- [ ] **Step 1: Añadir los estilos**

Añadir al final de `frontend/src/styles/components.css`:

```css
/* ---------- FILTROS DE /collections (sidebar + drawer) ---------- */

.collections-layout {
  display: flex;
  gap: var(--space-8);
  align-items: flex-start;
}

.collections-layout-sidebar {
  display: none;
}

.collections-layout-main {
  flex: 1;
  min-width: 0;
}

@media (min-width: 1024px) {
  .collections-layout-sidebar {
    display: block;
    width: 260px;
    flex-shrink: 0;
    position: sticky;
    top: var(--space-8);
  }
}

.collections-mobile-filter-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
}

@media (min-width: 1024px) {
  .collections-mobile-filter-btn {
    display: none;
  }
}

.collections-filters {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.collections-filters-search label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 600;
  margin-bottom: var(--space-2);
  color: var(--ink);
}

.collections-filters-search input {
  width: 100%;
}

.collections-filters-section h3 {
  font-size: var(--font-size-sm);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--stone);
  margin: 0 0 var(--space-3) 0;
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--line);
}

.collections-filters-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.collections-filters-checkbox {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--ink);
}

.collections-filters-checkbox input[type='checkbox'] {
  width: 16px;
  height: 16px;
  accent-color: var(--accent);
  flex-shrink: 0;
}

.collections-filters-count {
  margin-left: auto;
  color: var(--stone);
  font-size: var(--font-size-xs);
}

.collections-filters-clear {
  width: 100%;
}

/* ---------- Drawer de filtros (móvil) ---------- */

.filter-drawer-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(34, 48, 60, 0.5);
  z-index: 100;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--transition-fast);
}

.filter-drawer-overlay.is-open {
  opacity: 1;
  pointer-events: auto;
}

@media (min-width: 1024px) {
  .filter-drawer-overlay {
    display: none;
  }
}

.filter-drawer {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: min(85vw, 340px);
  background-color: var(--surface);
  box-shadow: var(--shadow-xl);
  transform: translateX(-100%);
  transition: transform var(--transition-base);
  overflow-y: auto;
}

.filter-drawer-overlay.is-open .filter-drawer {
  transform: translateX(0);
}

.filter-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--line);
}

.filter-drawer-header h2 {
  margin: 0;
  font-size: var(--font-size-lg);
}

.filter-drawer-header button {
  background: none;
  border: none;
  color: var(--stone);
  cursor: pointer;
  line-height: 0;
}

.filter-drawer-body {
  padding: var(--space-6);
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/styles/components.css
git commit -m "feat: estilos del sidebar de filtros y drawer móvil"
```

---

### Task 9: Frontend — reescribir el listado en `CollectionsPage.tsx`

**Files:**
- Modify: `frontend/src/pages/CollectionsPage.tsx` (vista listado completa, líneas 1-36 y 153-210 aprox.)

- [ ] **Step 1: Sustituir los imports y el estado del listado (líneas 1-36)**

Buscar:
```tsx
import { useParams, Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { ArrowLeft, FilePdf, WhatsappLogo } from '@phosphor-icons/react'
import Footer from '../components/Footer'
import SeriesCard from '../components/SeriesCard'
import AddToCartBox from '../components/AddToCartBox'
import ImageWithFallback from '../components/ImageWithFallback'
import { series, getSerieById } from '../data/catalog'
import { useCatalogDownload } from '../hooks/useCatalogDownload'

export default function CollectionsPage() {
  const { slug } = useParams<{ slug: string }>()
  const [search, setSearch] = useState('')
  const [material, setMaterial] = useState('')
  const { handleDownload, downloadingKey, downloadError } = useCatalogDownload()

  const serie = slug ? getSerieById(slug) : undefined

  const materials = useMemo(
    () => [...new Set(series.map((s) => s.material.split(',')[0].trim()))].sort(),
    []
  )

  const filteredSeries = useMemo(() => {
    let result = series
    if (material) {
      result = result.filter((s) => s.material.split(',')[0].trim() === material)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (s) => s.nombre.toLowerCase().includes(q) || s.material.toLowerCase().includes(q)
      )
    }
    return result
  }, [search, material])
```

Reemplazar por:
```tsx
import { useParams, Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, FilePdf, WhatsappLogo, Sliders } from '@phosphor-icons/react'
import Footer from '../components/Footer'
import SeriesCard from '../components/SeriesCard'
import AddToCartBox from '../components/AddToCartBox'
import ImageWithFallback from '../components/ImageWithFallback'
import CollectionsFilters, { ActiveFilters, EMPTY_FILTERS, espesorEnRango } from '../components/CollectionsFilters'
import FilterDrawer from '../components/FilterDrawer'
import { series, getSerieById } from '../data/catalog'
import { getCollections } from '../services/collectionsService'
import type { Collection } from '../types/collections'
import { useCatalogDownload } from '../hooks/useCatalogDownload'

export default function CollectionsPage() {
  const { slug } = useParams<{ slug: string }>()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loadingCollections, setLoadingCollections] = useState(true)
  const [search, setSearch] = useState('')
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(EMPTY_FILTERS)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { handleDownload, downloadingKey, downloadError } = useCatalogDownload()

  const serie = slug ? getSerieById(slug) : undefined

  useEffect(() => {
    if (slug) return // vista detalle: no hace falta cargar el listado
    let cancelado = false
    getCollections()
      .then((data) => {
        if (!cancelado) setCollections(data)
      })
      .catch((error) => console.error('Error cargando colecciones:', error))
      .finally(() => {
        if (!cancelado) setLoadingCollections(false)
      })
    return () => {
      cancelado = true
    }
  }, [slug])

  const handleToggleFilter = (categoria: keyof ActiveFilters, valor: string) => {
    setActiveFilters((prev) => {
      const actual = prev[categoria]
      const actualizado = actual.includes(valor)
        ? actual.filter((v) => v !== valor)
        : [...actual, valor]
      return { ...prev, [categoria]: actualizado }
    })
  }

  const handleClearFilters = () => {
    setActiveFilters(EMPTY_FILTERS)
    setSearch('')
  }

  const filteredCollections = useMemo(() => {
    return collections.filter((c) => {
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        if (!c.nombre.toLowerCase().includes(q) && !c.material.toLowerCase().includes(q)) {
          return false
        }
      }
      if (activeFilters.material.length > 0 && !activeFilters.material.includes(c.material)) {
        return false
      }
      if (activeFilters.tipo.length > 0 && !activeFilters.tipo.some((t) => c.tipo.includes(t))) {
        return false
      }
      if (activeFilters.formatos.length > 0 && !activeFilters.formatos.some((f) => c.formatos.includes(f))) {
        return false
      }
      if (activeFilters.acabados.length > 0 && !activeFilters.acabados.some((a) => c.acabados.includes(a))) {
        return false
      }
      if (activeFilters.espesor.length > 0 && !activeFilters.espesor.some((rango) => espesorEnRango(c.espesor, rango))) {
        return false
      }
      if (activeFilters.estilo.length > 0 && !activeFilters.estilo.includes(c.estilo)) {
        return false
      }
      return true
    })
  }, [collections, search, activeFilters])
```

- [ ] **Step 2: Sustituir la vista listado completa (buscar el comentario `// --- Vista listado con búsqueda y filtro por material ---` hasta el cierre de esa sección, antes de `<Footer />` y el cierre del componente)**

Buscar:
```tsx
  // --- Vista listado con búsqueda y filtro por material ---
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1 }}>
        <section className="hero-section plain">
          <div className="hero-content">
            <h1>Colecciones</h1>
            <p>{series.length} series de cerámica y porcelánico. Filtra por material o busca por nombre.</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-8)' }}>
              <input
                type="text"
                placeholder="Buscar serie por nombre"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ maxWidth: '320px' }}
                aria-label="Buscar serie"
              />
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  className={material === '' ? undefined : 'secondary'}
                  onClick={() => setMaterial('')}
                  style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--font-size-sm)' }}
                >
                  Todos
                </button>
                {materials.map((m) => (
                  <button
                    key={m}
                    className={material === m ? undefined : 'secondary'}
                    onClick={() => setMaterial(material === m ? '' : m)}
                    style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--font-size-sm)' }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3">
              {filteredSeries.map((s) => (
                <SeriesCard key={s.id} serie={s} />
              ))}
            </div>

            {filteredSeries.length === 0 && (
              <div style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
                <p>No hay resultados para tu búsqueda.</p>
                <button className="secondary" onClick={() => { setSearch(''); setMaterial('') }}>
                  Limpiar filtros
                </button>
              </div>
            )}
```

Reemplazar por:
```tsx
  // --- Vista listado con sidebar de filtros ---
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1 }}>
        <section className="hero-section plain">
          <div className="hero-content">
            <h1>Colecciones</h1>
            <p>{collections.length || series.length} series de cerámica y porcelánico. Filtra por material, tipo, formato y más.</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <button
              type="button"
              className="secondary collections-mobile-filter-btn"
              onClick={() => setDrawerOpen(true)}
            >
              <Sliders size={16} weight="bold" />
              Filtros
            </button>

            <div className="collections-layout">
              <aside className="collections-layout-sidebar">
                <CollectionsFilters
                  collections={collections}
                  search={search}
                  onSearchChange={setSearch}
                  activeFilters={activeFilters}
                  onToggle={handleToggleFilter}
                  onClear={handleClearFilters}
                />
              </aside>

              <FilterDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <CollectionsFilters
                  collections={collections}
                  search={search}
                  onSearchChange={setSearch}
                  activeFilters={activeFilters}
                  onToggle={handleToggleFilter}
                  onClear={handleClearFilters}
                />
              </FilterDrawer>

              <div className="collections-layout-main">
                {loadingCollections ? (
                  <p>Cargando colecciones...</p>
                ) : (
                  <>
                    <div className="grid grid-cols-3">
                      {filteredCollections.map((c) => (
                        <SeriesCard key={c.id} serie={c} />
                      ))}
                    </div>

                    {filteredCollections.length === 0 && (
                      <div style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
                        <p>No hay resultados para tu búsqueda.</p>
                        <button className="secondary" onClick={handleClearFilters}>
                          Limpiar filtros
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
```

- [ ] **Step 3: Verificar que el cierre de la sección (`</div>`, `</section>`) sigue siendo válido**

El bloque original cerraba con:
```tsx
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
```
Esto NO cambia — el reemplazo del Step 2 solo sustituye el contenido interior de `<div className="container">`, la estructura de cierre exterior permanece igual. Confirmar visualmente que las llaves/etiquetas cuadran tras el reemplazo (un `<div className="container">` que ahora contiene `.collections-mobile-filter-btn` + `.collections-layout`, en vez del buscador+botones+grid planos).

- [ ] **Step 4: Verificar que `Sliders` existe en `@phosphor-icons/react`**

Run: `ls frontend/node_modules/@phosphor-icons/react/dist/csr | grep -i "^Sliders"`
Expected: `Sliders.d.ts` y `Sliders.es.js` en el listado

- [ ] **Step 5: Verificar TypeScript**

Run: `cd frontend && npx tsc --noEmit`
Expected: sin errores. Si aparece un error de "unused variable" sobre `materials`/`filteredSeries`/`material`/`setMaterial` antiguos, confirmar que el Step 1 los eliminó todos (ya no deben quedar referencias — el listado ahora usa `collections`/`filteredCollections`/`activeFilters`, no `series`/`filteredSeries`/`material` para la vista de listado; `series`/`getSerieById` se siguen usando SOLO en la vista de detalle, que no se toca).

- [ ] **Step 6: Levantar frontend + backend y comprobar en navegador**

Con backend corriendo (`node api/index.js`) y frontend (`cd frontend && npm run dev`), navegar a `/collections` y comprobar:
- El sidebar aparece a la izquierda en desktop con las 6 secciones de filtro.
- Marcar un checkbox de Material filtra el grid al instante (sin parpadeo de carga).
- Marcar dos checkboxes de la misma categoría (ej. dos materiales) amplía resultados (OR).
- Marcar checkboxes de categorías distintas (ej. Material + Estilo) los combina (AND).
- Buscar por nombre sigue funcionando junto con los filtros.
- "Limpiar filtros" resetea todo.
- Redimensionar a móvil (`resize_window` a `mobile`): el sidebar desaparece, aparece el botón "Filtros", que abre el drawer deslizante con el mismo contenido.
- La vista de detalle (`/collections/alpina`) sigue funcionando exactamente igual que antes (no se ha tocado).

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/CollectionsPage.tsx
git commit -m "feat: sidebar de filtros multi-selección en /collections"
```

---

### Task 10: Admin — CRUD de colecciones

**Files:**
- Modify: `frontend/src/services/adminService.ts` (añadir métodos, final del objeto y de las interfaces)
- Create: `frontend/src/pages/admin/sections/CollectionsAdmin.tsx`
- Modify: `frontend/src/pages/admin/AdminDashboard.tsx`
- Modify: `frontend/src/pages/admin/components/AdminSidebar.tsx`

- [ ] **Step 1: Añadir métodos al `adminService.ts` existente (autenticado — NO replicar el bug de `ProjectsAdmin.tsx`, que usa axios sin el interceptor de token)**

Buscar (el cierre del objeto `adminService`, justo antes de la última línea `}`):
```typescript
  async exportarContactosCrmCsv(): Promise<void> {
    const response = await api.get('/admin/crm/contacts/export', { responseType: 'blob' })
    triggerCsvDownload(response, 'crm-contactos.csv')
  },
}
```

Reemplazar por:
```typescript
  async exportarContactosCrmCsv(): Promise<void> {
    const response = await api.get('/admin/crm/contacts/export', { responseType: 'blob' })
    triggerCsvDownload(response, 'crm-contactos.csv')
  },

  async getAdminCollections(): Promise<{ collections: AdminCollectionRow[]; total: number }> {
    try {
      const response = await api.get('/admin/collections')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener colecciones')
    }
  },

  async crearCollection(datos: Partial<AdminCollectionRow>): Promise<AdminCollectionRow> {
    try {
      const response = await api.post('/admin/collections', datos)
      return response.data.collection
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear la colección')
    }
  },

  async actualizarCollection(id: number, datos: Partial<AdminCollectionRow>): Promise<AdminCollectionRow> {
    try {
      const response = await api.put(`/admin/collections/${id}`, datos)
      return response.data.collection
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar la colección')
    }
  },

  async eliminarCollection(id: number): Promise<void> {
    try {
      await api.delete(`/admin/collections/${id}`)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar la colección')
    }
  },

  async exportarCollectionsCsv(): Promise<void> {
    const response = await api.get('/admin/collections/export', { responseType: 'blob' })
    triggerCsvDownload(response, 'collections.csv')
  },
}
```

- [ ] **Step 2: Añadir la interfaz `AdminCollectionRow` (al final del fichero, junto a `CrmStats`)**

Buscar:
```typescript
export interface CrmStats {
  crmHabilitado: boolean
  totalContactos: number
  nuevosEsteMes: number
  porOrigen: Record<string, number>
  topCampanias: Array<{ utm_campaign: string; contactos: number }>
}
```

Reemplazar por:
```typescript
export interface CrmStats {
  crmHabilitado: boolean
  totalContactos: number
  nuevosEsteMes: number
  porOrigen: Record<string, number>
  topCampanias: Array<{ utm_campaign: string; contactos: number }>
}

export interface AdminCollectionRow {
  id: number
  slug: string
  nombre: string
  descripcion: string | null
  imagen_portada: string | null
  material: string | null
  tipo: string[]
  formatos: string[]
  acabados: string[]
  colores: string[]
  precio_consultable: boolean
  acabado_corte: string
  espesor: number
  estilo: string
  especificaciones_verificadas: boolean
  created_at: string
  updated_at: string
}
```

- [ ] **Step 3: Verificar TypeScript**

Run: `cd frontend && npx tsc --noEmit`
Expected: sin errores

- [ ] **Step 4: Crear `CollectionsAdmin.tsx`**

```tsx
// frontend/src/pages/admin/sections/CollectionsAdmin.tsx
import { useEffect, useState } from 'react'
import { adminService, AdminCollectionRow } from '../../../services/adminService'

const CAMPOS_ARRAY = ['tipo', 'formatos', 'acabados', 'colores'] as const

interface FormState {
  slug: string
  nombre: string
  descripcion: string
  imagen_portada: string
  material: string
  tipo: string
  formatos: string
  acabados: string
  colores: string
  acabado_corte: string
  espesor: string
  estilo: string
  especificaciones_verificadas: boolean
}

const FORM_VACIO: FormState = {
  slug: '',
  nombre: '',
  descripcion: '',
  imagen_portada: '',
  material: '',
  tipo: '',
  formatos: '',
  acabados: '',
  colores: '',
  acabado_corte: 'Rectificado',
  espesor: '10',
  estilo: 'Moderno',
  especificaciones_verificadas: false,
}

function filaAFormulario(fila: AdminCollectionRow): FormState {
  return {
    slug: fila.slug,
    nombre: fila.nombre,
    descripcion: fila.descripcion || '',
    imagen_portada: fila.imagen_portada || '',
    material: fila.material || '',
    tipo: (fila.tipo || []).join(', '),
    formatos: (fila.formatos || []).join(', '),
    acabados: (fila.acabados || []).join(', '),
    colores: (fila.colores || []).join(', '),
    acabado_corte: fila.acabado_corte,
    espesor: String(fila.espesor),
    estilo: fila.estilo,
    especificaciones_verificadas: fila.especificaciones_verificadas,
  }
}

function formularioAPayload(form: FormState) {
  return {
    slug: form.slug.trim(),
    nombre: form.nombre.trim(),
    descripcion: form.descripcion.trim() || null,
    imagen_portada: form.imagen_portada.trim() || null,
    material: form.material.trim() || null,
    tipo: form.tipo.split(',').map((v) => v.trim()).filter(Boolean),
    formatos: form.formatos.split(',').map((v) => v.trim()).filter(Boolean),
    acabados: form.acabados.split(',').map((v) => v.trim()).filter(Boolean),
    colores: form.colores.split(',').map((v) => v.trim()).filter(Boolean),
    acabado_corte: form.acabado_corte.trim() || 'Rectificado',
    espesor: parseFloat(form.espesor) || 10,
    estilo: form.estilo.trim() || 'Moderno',
    especificaciones_verificadas: form.especificaciones_verificadas,
  }
}

export default function CollectionsAdmin() {
  const [collections, setCollections] = useState<AdminCollectionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(FORM_VACIO)
  const [saving, setSaving] = useState(false)

  const cargar = async () => {
    try {
      setLoading(true)
      const data = await adminService.getAdminCollections()
      setCollections(data.collections)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const handleNuevo = () => {
    setEditingId(null)
    setForm(FORM_VACIO)
    setShowForm(true)
  }

  const handleEditar = (fila: AdminCollectionRow) => {
    setEditingId(fila.id)
    setForm(filaAFormulario(fila))
    setShowForm(true)
  }

  const handleGuardar = async () => {
    try {
      setSaving(true)
      const payload = formularioAPayload(form)
      if (editingId) {
        await adminService.actualizarCollection(editingId, payload)
      } else {
        await adminService.crearCollection(payload)
      }
      setShowForm(false)
      await cargar()
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Eliminar esta colección?')) return
    try {
      await adminService.eliminarCollection(id)
      await cargar()
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  if (loading) return <p>Cargando colecciones...</p>
  if (error) return <p style={{ color: '#c62828' }}>Error: {error}</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Colecciones ({collections.length})</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => adminService.exportarCollectionsCsv()}
            style={{ padding: '8px 16px', backgroundColor: '#f5f5f5', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}
          >
            Exportar CSV
          </button>
          <button
            onClick={handleNuevo}
            style={{ padding: '8px 16px', backgroundColor: '#1a1a1a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            + Nueva colección
          </button>
        </div>
      </div>

      {showForm && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3 style={{ marginTop: 0 }}>{editingId ? 'Editar colección' : 'Nueva colección'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label>
              Slug
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} disabled={!!editingId} style={{ width: '100%' }} />
            </label>
            <label>
              Nombre
              <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} style={{ width: '100%' }} />
            </label>
            <label>
              Material
              <input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} style={{ width: '100%' }} />
            </label>
            <label>
              Tipo (separado por comas)
              <input value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} placeholder="Pavimento, Revestimiento" style={{ width: '100%' }} />
            </label>
            <label>
              Formatos (separado por comas)
              <input value={form.formatos} onChange={(e) => setForm({ ...form, formatos: e.target.value })} placeholder="30x60, 60x60" style={{ width: '100%' }} />
            </label>
            <label>
              Acabados (separado por comas)
              <input value={form.acabados} onChange={(e) => setForm({ ...form, acabados: e.target.value })} placeholder="Mate, Brillo" style={{ width: '100%' }} />
            </label>
            <label>
              Colores (separado por comas)
              <input value={form.colores} onChange={(e) => setForm({ ...form, colores: e.target.value })} style={{ width: '100%' }} />
            </label>
            <label>
              Imagen de portada (URL)
              <input value={form.imagen_portada} onChange={(e) => setForm({ ...form, imagen_portada: e.target.value })} style={{ width: '100%' }} />
            </label>
            <label>
              Acabado de corte
              <input value={form.acabado_corte} onChange={(e) => setForm({ ...form, acabado_corte: e.target.value })} style={{ width: '100%' }} />
            </label>
            <label>
              Espesor (mm)
              <input type="number" value={form.espesor} onChange={(e) => setForm({ ...form, espesor: e.target.value })} style={{ width: '100%' }} />
            </label>
            <label>
              Estilo
              <input value={form.estilo} onChange={(e) => setForm({ ...form, estilo: e.target.value })} style={{ width: '100%' }} />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={form.especificaciones_verificadas}
                onChange={(e) => setForm({ ...form, especificaciones_verificadas: e.target.checked })}
              />
              Especificaciones verificadas
            </label>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
            <button onClick={handleGuardar} disabled={saving} style={{ padding: '10px 20px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ padding: '10px 20px', backgroundColor: '#f5f5f5', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #eee' }}>
            <th style={{ textAlign: 'left', padding: '12px' }}>Nombre</th>
            <th style={{ textAlign: 'left', padding: '12px' }}>Material</th>
            <th style={{ textAlign: 'left', padding: '12px' }}>Estilo</th>
            <th style={{ textAlign: 'center', padding: '12px' }}>Verificado</th>
            <th style={{ textAlign: 'right', padding: '12px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {collections.map((c) => (
            <tr key={c.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
              <td style={{ padding: '12px' }}>{c.nombre}</td>
              <td style={{ padding: '12px' }}>{c.material}</td>
              <td style={{ padding: '12px' }}>{c.estilo}</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>{c.especificaciones_verificadas ? '✓' : '—'}</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>
                <button onClick={() => handleEditar(c)} style={{ marginRight: '8px', padding: '6px 12px', cursor: 'pointer' }}>
                  Editar
                </button>
                <button onClick={() => handleEliminar(c.id)} style={{ padding: '6px 12px', color: '#c62828', cursor: 'pointer' }}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 5: Verificar TypeScript (nota: `CAMPOS_ARRAY` se define pero no se usa — es intencionadamente documental; eliminarlo si `tsc`/eslint se queja de variable sin uso)**

Run: `cd frontend && npx tsc --noEmit`
Expected: si aparece error de `CAMPOS_ARRAY` no usado, borrar esa línea del fichero (no aporta nada, era una nota mental redundante con `formularioAPayload`).

- [ ] **Step 6: Wiring en `AdminDashboard.tsx`**

Buscar:
```tsx
const ProjectsAdmin = lazy(() => import('./sections/ProjectsAdmin'))
const CRMDashboard = lazy(() => import('./sections/CRMDashboard'))
```

Reemplazar por:
```tsx
const ProjectsAdmin = lazy(() => import('./sections/ProjectsAdmin'))
const CollectionsAdmin = lazy(() => import('./sections/CollectionsAdmin'))
const CRMDashboard = lazy(() => import('./sections/CRMDashboard'))
```

Buscar:
```tsx
type ActiveSection = 'dashboard' | 'clientes' | 'cliente-detalle' | 'descargas-catalogo' | 'proyectos' | 'crm' | 'pedidos' | 'pedido-detalle' | 'facturas' | 'lector-facturas' | 'lector-ingresos' | 'lector-gastos' | 'soporte' | 'ticket-detalle' | 'reportes'
```

Reemplazar por:
```tsx
type ActiveSection = 'dashboard' | 'clientes' | 'cliente-detalle' | 'descargas-catalogo' | 'proyectos' | 'colecciones' | 'crm' | 'pedidos' | 'pedido-detalle' | 'facturas' | 'lector-facturas' | 'lector-ingresos' | 'lector-gastos' | 'soporte' | 'ticket-detalle' | 'reportes'
```

Buscar:
```tsx
            {activeSection === 'proyectos' && <ProjectsAdmin />}
            {activeSection === 'crm' && <CRMDashboard />}
```

Reemplazar por:
```tsx
            {activeSection === 'proyectos' && <ProjectsAdmin />}
            {activeSection === 'colecciones' && <CollectionsAdmin />}
            {activeSection === 'crm' && <CRMDashboard />}
```

- [ ] **Step 7: Wiring en `AdminSidebar.tsx`**

Buscar:
```tsx
import { SignOut, ChartLine, Users, ShoppingCart, FileText, ChatDots, FileArrowDown, Scan, DownloadSimple, Image, EnvelopeSimple } from '@phosphor-icons/react'
```

Reemplazar por:
```tsx
import { SignOut, ChartLine, Users, ShoppingCart, FileText, ChatDots, FileArrowDown, Scan, DownloadSimple, Image, EnvelopeSimple, SquaresFour } from '@phosphor-icons/react'
```

Buscar:
```tsx
    { id: 'proyectos', label: 'Proyectos', icon: Image },
    { id: 'crm', label: 'CRM / Email', icon: EnvelopeSimple },
```

Reemplazar por:
```tsx
    { id: 'proyectos', label: 'Proyectos', icon: Image },
    { id: 'colecciones', label: 'Colecciones', icon: SquaresFour },
    { id: 'crm', label: 'CRM / Email', icon: EnvelopeSimple },
```

- [ ] **Step 8: Verificar TypeScript**

Run: `cd frontend && npx tsc --noEmit`
Expected: sin errores

- [ ] **Step 9: Verificar en navegador (login como `test-crm-e3@example.com` / `TestPass123`, ir a `/admin`, sección "Colecciones")**

- Listado muestra las 90 colecciones migradas.
- "+ Nueva colección" abre el formulario, crear una de prueba, confirmar que aparece en la tabla.
- "Editar" precarga los datos, guardar cambios, confirmar que se reflejan en la tabla.
- "Eliminar" borra la fila de prueba tras confirmar.
- "Exportar CSV" descarga un fichero.

- [ ] **Step 10: Commit**

```bash
git add frontend/src/services/adminService.ts frontend/src/pages/admin/sections/CollectionsAdmin.tsx frontend/src/pages/admin/AdminDashboard.tsx frontend/src/pages/admin/components/AdminSidebar.tsx
git commit -m "feat: sección de admin CRUD para collections"
```

---

### Task 11: Verificación final end-to-end

**Files:** ninguno (solo verificación)

- [ ] **Step 1: Build de producción completo**

Run: `cd frontend && npm run build`
Expected: `✓ built in ...` sin errores

- [ ] **Step 2: `tsc --noEmit` limpio**

Run: `cd frontend && npx tsc --noEmit`
Expected: sin salida

- [ ] **Step 3: Backend arranca sin errores con la tabla ya poblada**

```bash
node --check api/index.js
node api/index.js &
sleep 3
curl -s http://localhost:3000/api/health
curl -s http://localhost:3000/api/collections | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log('total:',JSON.parse(d).total))"
```
Expected: `{"status":"ok","database":"connected"}` y `total: 90`

- [ ] **Step 4: Recorrido completo en navegador**

- `/collections`: sidebar con 6 filtros + recuento, filtrado instantáneo, combinación AND/OR correcta, búsqueda, "Limpiar filtros", drawer en móvil.
- `/collections/alpina` (detalle): funciona exactamente igual que antes de esta feature.
- `/admin` → "Colecciones": listado, crear, editar, eliminar, exportar CSV.
- Consola del navegador sin errores en ninguna de las páginas anteriores.

- [ ] **Step 5: Commit final si hubo ajustes sueltos durante la verificación**

```bash
git status
# Si hay cambios pendientes de pasos anteriores no commiteados, revisar y commitear
```
