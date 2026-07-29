# Filtros avanzados en /collections — diseño

Fecha: 2026-07-29
Estado: aprobado

## Contexto

`/collections` muestra las 90 series del catálogo (hoy estático en `frontend/src/data/catalogo.json`) con búsqueda por nombre y un filtro simple de material (botones tipo pill, una sola opción a la vez). Se pide un sidebar de filtros multi-selección al estilo practikaceramica.com/productos, con el catálogo migrado a una tabla real `collections` en Postgres y editable desde `/admin`.

## Decisiones

### 1. Datos: migrar a tabla `collections`, preservando lo real

Correción respecto al esquema propuesto por el usuario: `tipo`, `formatos`, `acabados` y `colores` **ya son arrays por serie** en `catalogo.json` (ej. una serie puede ser Pavimento Y Revestimiento a la vez, o tener varios acabados). Forzarlos a `VARCHAR` de un solo valor perdería esa información real. Se mantienen como `TEXT[]`.

```sql
CREATE TABLE IF NOT EXISTS collections (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,        -- = el `id` actual del catálogo (ej. "alpina")
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  imagen_portada VARCHAR(500),
  material VARCHAR(100),                    -- real: dato único por serie ya en catalogo.json
  tipo TEXT[],                               -- real: array (Pavimento/Revestimiento)
  formatos TEXT[],                           -- real: array
  acabados TEXT[],                           -- real: array (Mate/Brillo/Relieve...)
  colores TEXT[],                            -- real
  precio_consultable BOOLEAN DEFAULT TRUE,
  -- Campos SIN dato real disponible — valor genérico + flag de revisión:
  acabado_corte VARCHAR(100) DEFAULT 'Rectificado',
  espesor DECIMAL(5,2) DEFAULT 10.0,
  estilo VARCHAR(100) DEFAULT 'Moderno',
  especificaciones_verificadas BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collections_material ON collections(material);
CREATE INDEX IF NOT EXISTS idx_collections_estilo ON collections(estilo);
CREATE INDEX IF NOT EXISTS idx_collections_verificadas ON collections(especificaciones_verificadas);
```

Migración: script de una sola ejecución que lee `catalogo.json` (90 series) e inserta cada una con `ON CONFLICT (slug) DO NOTHING` (idempotente, no pisa ediciones ya hechas desde el admin si se re-ejecuta). Igual que `ensureProjectsTable()`, la creación de tabla vive en `api/index.js`; la migración de datos es un script aparte en `scripts/`.

`imagen_portada` reutiliza las URLs ya corregidas (incluidas las 11 servidas ahora desde `/series/*.jpg` tras el fix de imágenes rotas).

### 2. Backend

- `GET /api/collections` — público, sin filtros de query (el filtrado vive en cliente). Devuelve las 90 filas completas en una sola respuesta.
- `GET/POST/PUT/DELETE /api/admin/collections` — CRUD protegido con `authMiddleware` + `adminMiddleware`, mismo patrón que `projects`.
- No se crea `/api/collections/filter-options`: las opciones de cada filtro (y sus recuentos) se calculan en el propio cliente a partir de las 90 filas ya cargadas — un round-trip extra al backend para esto sería redundante.

### 3. Espesor: filtro por rango fijo, no por valor exacto

`espesor` es un decimal (mm); se agrupa en 5 rangos fijos para el filtro (6-8, 8-10, 10-12, 12-15, 15-20 mm), calculados en cliente sobre el valor numérico — no se filtra por igualdad exacta. Mientras la mayoría de series conserve el genérico `10.0`, casi todo caerá en el rango 8-10; es el comportamiento esperado hasta que se editen valores reales desde el admin.

### 4. Frontend: filtrado 100% en cliente

- Un solo `fetch('/api/collections')` al montar la página.
- `useMemo` deriva: (a) las opciones de cada filtro con su recuento a partir del array completo, (b) el array filtrado según los checkboxes activos + búsqueda por texto.
- Cada categoría de filtro es un array de valores seleccionados (`string[]`); un valor activo en varias categorías es intersección AND entre categorías, OR dentro de la misma categoría (ej. Material=Gres AND (Acabado=Mate OR Acabado=Brillo)) — estándar en filtros facetados de ecommerce.

### 5. Componentes nuevos

- `CollectionsFilters.tsx` — sidebar de filtros (checkboxes agrupados por categoría + recuento, búsqueda por texto, botón "Limpiar filtros"). Estilado con las variables CSS existentes (`--space-*`, `--line`, `--ink`, `--radius-card`), sin Tailwind.
- `FilterDrawer.tsx` — envoltorio genérico para mostrar `CollectionsFilters` como panel deslizante en móvil (overlay + transform translateX), reutilizable si más adelante se necesita un drawer en otro sitio.
- `CollectionsPage.tsx` (listado) — se reescribe la vista `!slug` para usar sidebar + grid en vez de los botones de material actuales. La vista de detalle (`slug` presente) no cambia.
- Admin: `CollectionsAdmin.tsx` nuevo, sección en `/admin`, mismo patrón de listado+formulario que `ProjectsAdmin.tsx` — pero usando el `adminService.ts` autenticado (axios con interceptor de token), no axios "pelado" como hace `ProjectsAdmin.tsx` hoy (ese componente tiene un bug de autenticación conocido, pendiente de arreglo aparte; no se replica aquí).

### 6. Layout

- Desktop (`≥ 1024px`): sidebar fijo `260px`, `position: sticky`, grid a la derecha.
- Móvil: sidebar oculto, botón "Filtros" abre `FilterDrawer` (overlay + panel deslizante desde la izquierda).
- Breakpoint y clases siguen el mismo patrón que el resto del sitio (`container`, grid existente en `components.css`).

## Fuera de alcance (explícitamente)

- No se toca la vista de detalle de serie (`/collections/:slug`).
- No se arregla el bug de autenticación de `ProjectsAdmin.tsx` (se evita reproducirlo en el código nuevo, pero no se corrige el existente).
- No se inventan valores realistas de espesor/estilo/corte por serie — quedan como genérico + `especificaciones_verificadas = false`, editables luego desde el admin.
- No se migra `api/data/catalog-fichas.json` (URLs de PDFs) a la tabla — sigue siendo su propio sistema.

## Riesgo conocido

`imagenes` (galería) mencionado en el SQL original del usuario no tiene equivalente real en `catalogo.json` (solo hay `imagen`, una foto de portada) — no se crea esa columna por ahora; se puede añadir después si se decide construir una galería real.
