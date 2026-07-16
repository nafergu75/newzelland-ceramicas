# Plan de Implementación Frontend: Mi Cuenta y Panel Admin
## Newzelland Cerámicas – Fases de Desarrollo

**Fecha de inicio:** 16 de julio de 2026  
**Duración estimada:** 8-10 semanas  
**Prioridad:** MVP → Expansión

---

## FASE 1: Autenticación y Registro (Semanas 1-2)

### 1.1 Componentes a crear

```
src/
├── pages/
│   ├── RegisterPage.tsx         // Formulario de registro
│   ├── LoginPage.tsx            // Formulario de login
│   ├── ForgotPasswordPage.tsx    // Recuperación de contraseña
│   └── ConfirmEmailPage.tsx      // Verificación de email
├── components/
│   ├── FormField.tsx            // Componente reutilizable de input
│   ├── FormValidation.tsx        // Validaciones compartidas
│   └── ErrorMessage.tsx          // Muestra de errores
└── services/
    └── authService.ts            // Llamadas a API de auth
```

### 1.2 Funcionalidades

- [ ] Formulario de registro con validación de campos
- [ ] Validación de email duplicado
- [ ] Envío de email de confirmación
- [ ] Enlace de confirmación de email (token válido 24h)
- [ ] Formulario de login
- [ ] Recuperación de contraseña (email + reset)
- [ ] Persistencia de sesión (JWT + localStorage)
- [ ] Protección de rutas (PrivateRoute component)
- [ ] Mensajes de error contextuales en español

### 1.3 Rutas a agregar

```
/register
/login
/forgot-password
/reset-password/:token
/confirm-email/:token
```

### 1.4 Consideraciones técnicas

- Usar `React Hook Form` para manejo eficiente de formularios
- Implementar `Zod` para validación del lado del cliente
- Context API para gestión de autenticación global
- JWT en header `Authorization: Bearer <token>`
- Refresh tokens para mantener sesiones vivas

---

## FASE 2: Panel del Cliente "Mi Cuenta" (Semanas 3-5)

### 2.1 Estructura de carpetas

```
src/pages/account/
├── AccountDashboard.tsx         // Layout principal con navbar
├── sections/
│   ├── AccountSummary.tsx        // Resumen de cuenta
│   ├── MyOrders.tsx              // Listado de pedidos
│   ├── OrderDetail.tsx           // Detalle de pedido
│   ├── ShippingStatus.tsx        // Estado de envíos
│   ├── Messages.tsx              // Centro de soporte
│   ├── MessageDetail.tsx          // Detalle de conversación
│   └── MyProfile.tsx             // Edición de perfil
└── components/
    ├── AccountSidebar.tsx         // Navegación lateral
    ├── OrderCard.tsx              // Card de pedido
    ├── ShippingTimeline.tsx        // Timeline de estados
    └── MessageThread.tsx           // Conversación
```

### 2.2 Funcionalidades por sección

#### 2.2.1 Resumen de Cuenta
- [ ] Mostrar estadísticas: total facturado, # pedidos, this year, miembro desde
- [ ] Último pedido en destacado con botones (ver detalles, factura, contactar)
- [ ] Envíos pendientes (aviso si hay)
- [ ] Score de seguridad (contraseña robusta, email verificado)

#### 2.2.2 Mis Pedidos
- [ ] Listado paginado de pedidos
- [ ] Filtros: estado, período, ordenación
- [ ] Búsqueda por # pedido
- [ ] Click en pedido → detalle
- [ ] Detalle: productos, dirección, resumen financiero, estado envío

#### 2.2.3 Estado de Envíos
- [ ] Listado de envíos activos y recientes
- [ ] Timeline visual de estados
- [ ] Enlace a tracking externo (transportista)
- [ ] Información de transportista y código de seguimiento

#### 2.2.4 Mensajes y Soporte
- [ ] Bandeja de entrada de tickets
- [ ] Filtros: estado, categoría, período
- [ ] Formulario de nuevo ticket
- [ ] Vista de conversación (thread)
- [ ] Posibilidad de responder
- [ ] Marcar como resuelto

#### 2.2.5 Mi Perfil
- [ ] Vista actual: nombre, email, teléfono, empresa, dirección
- [ ] Edición de datos personales
- [ ] Cambio de contraseña (formulario modal)
- [ ] Descargar mis datos (RGPD)
- [ ] Eliminar mi cuenta (irreversible, con confirmación)

### 2.3 Datos necesarios de API

Las siguientes rutas API deben estar disponibles en backend:

```
GET    /api/account/summary        → { totalFacturado, nPedidos, etc }
GET    /api/orders                 → { orders[], pagination }
GET    /api/orders/:id             → { order, items, shipment, invoice }
GET    /api/shipments              → { shipments[], timeline }
GET    /api/support/tickets        → { tickets[], state filters }
POST   /api/support/tickets        → create new ticket
GET    /api/support/tickets/:id    → conversation thread
POST   /api/support/tickets/:id/messages → reply to ticket
GET    /api/profile                → { user, address, company }
PATCH  /api/profile                → update user data
PATCH  /api/profile/password       → change password
GET    /api/profile/export         → download personal data (ZIP)
DELETE /api/profile                → delete account
```

---

## FASE 3: Panel de Administración (Semanas 6-8)

### 3.1 Estructura de carpetas

```
src/pages/admin/
├── AdminDashboard.tsx           // Layout principal
├── sections/
│   ├── Dashboard.tsx             // KPIs y gráficos
│   ├── Customers.tsx             // Listado de clientes
│   ├── CustomerDetail.tsx         // Ficha de cliente
│   ├── Orders.tsx                // Listado de pedidos
│   ├── OrderDetail.tsx           // Edición de pedido
│   ├── Invoices.tsx              // Facturas y reportes
│   ├── SupportMessages.tsx        // Bandeja de soporte
│   ├── MessageDetail.tsx          // Conversación con cliente
│   └── Reports.tsx               // Reportes avanzados
└── components/
    ├── AdminSidebar.tsx           // Nav admin
    ├── KPICard.tsx                // Card de métrica
    ├── DataTable.tsx              // Tabla reutilizable
    ├── FilterBar.tsx              // Filtros comunes
    └── Chart.tsx                  // Gráficos (Chart.js o similar)
```

### 3.2 Funcionalidades por sección

#### 3.2.1 Dashboard
- [ ] KPIs: ingresos totales, # pedidos, clientes nuevos, ticket promedio, tasa conversión
- [ ] Gráfico de ingresos (últimos 6 meses)
- [ ] Estado de pedidos (pie chart: pagados/pendientes/cancelados)
- [ ] Envíos activos (en preparación, en tránsito, incidencias)
- [ ] Mensajes sin responder (alert si > 0)
- [ ] Top 5 clientes

#### 3.2.2 Gestión de Clientes
- [ ] Listado paginado, búsqueda, filtros
- [ ] Ficha completa: datos, resumen comercial, histórico pedidos, mensajes
- [ ] Acciones: editar, activar/desactivar, reenviar email verificación, descargar informe

#### 3.2.3 Gestión de Pedidos
- [ ] Listado con filtros avanzados
- [ ] Detalle y edición de pedido
- [ ] Cambio de estado de pago y envío
- [ ] Generar/reenviar factura
- [ ] Crear devolución
- [ ] Cancelar pedido

#### 3.2.4 Facturas
- [ ] Listado de facturas
- [ ] Descarga de PDF
- [ ] Reportes: ingresos, facturas pendientes, IVA

#### 3.2.5 Centro de Mensajes
- [ ] Bandeja con filtros por estado y categoría
- [ ] Vista de conversación
- [ ] Responder a cliente
- [ ] Marcar como resuelto

#### 3.2.6 Reportes
- [ ] Reportes descargables: ingresos, clientes, pedidos, devoluciones

### 3.3 Rutas protegidas

```
/admin
/admin/dashboard
/admin/customers
/admin/customers/:id
/admin/orders
/admin/orders/:id
/admin/invoices
/admin/support
/admin/support/:id
/admin/reports
```

### 3.4 Protección de rutas

- [ ] Middleware que valida `isAdmin` en JWT
- [ ] Redirect a login si no autenticado
- [ ] Redirect a / si no es admin

---

## FASE 4: Características Avanzadas (Semanas 9-10)

- [ ] Notificaciones en tiempo real (Socket.io para nuevos tickets)
- [ ] Gráficos interactivos (Chart.js, Recharts)
- [ ] Exportación de reportes a Excel
- [ ] Modal de confirmación de acciones destructivas
- [ ] Paginación infinita o lazy loading
- [ ] Búsqueda con debounce
- [ ] Tema oscuro (dark mode)
- [ ] Internacionalización (EN/ES)
- [ ] Accesibilidad (WCAG 2.1)

---

## Stack Técnico Recomendado

### Dependencias npm a instalar

```bash
npm install react-hook-form zod @hookform/resolvers
npm install react-router-dom
npm install axios
npm install date-fns              # Formatos de fecha
npm install clsx                  # Merge de clases CSS
npm install recharts              # Gráficos
npm install zustand              # Estado global (alternativa a Context)
```

### Estructura de carpetas final

```
frontend/src/
├── pages/
│   ├── RegisterPage.tsx
│   ├── LoginPage.tsx
│   ├── account/
│   │   ├── AccountDashboard.tsx
│   │   └── sections/
│   └── admin/
│       ├── AdminDashboard.tsx
│       └── sections/
├── components/
│   ├── common/
│   ├── forms/
│   ├── account/
│   └── admin/
├── context/
│   ├── AuthContext.tsx
│   └── (otras)
├── services/
│   ├── authService.ts
│   ├── accountService.ts
│   ├── adminService.ts
│   └── api.ts              # Configuración base de axios
├── hooks/
│   ├── useAuth.ts
│   ├── useFetch.ts
│   └── useForm.ts
├── types/
│   ├── auth.ts
│   ├── account.ts
│   ├── admin.ts
│   └── common.ts
├── utils/
│   ├── validation.ts
│   ├── formatters.ts
│   └── api.ts
├── styles/
│   ├── globals.css
│   ├── components.css
│   ├── account.css
│   └── admin.css
└── App.tsx
```

---

## Hitos y Entregables

| Fase | Hito | Fecha Estimada | Entregable |
|------|------|---|---|
| 1 | Auth MVP | Sem 2 | Registro, Login, JWT |
| 2a | Account Summary + Orders | Sem 4 | Mi Cuenta + pedidos funcionales |
| 2b | Messages + Profile | Sem 5 | Soporte y edición de datos |
| 3a | Admin Dashboard + Customers | Sem 7 | Panel admin básico |
| 3b | Admin Orders + Support | Sem 8 | Gestión completa |
| 4 | Polish + Testing | Sem 10 | QA, bug fixes, optimizaciones |

---

## Consideraciones de Backend Paralelas

**Para que el frontend funcione, necesitas estas rutas de API:**

1. **Autenticación** (AuthController)
   - `POST /auth/register`
   - `POST /auth/login`
   - `POST /auth/refresh-token`
   - `POST /auth/forgot-password`
   - `POST /auth/reset-password`
   - `POST /auth/verify-email`

2. **Account** (AccountController)
   - `GET /account/summary`
   - `GET /account/profile`
   - `PATCH /account/profile`
   - `PATCH /account/password`
   - `GET /account/export`
   - `DELETE /account`

3. **Orders** (OrderController)
   - `GET /orders`
   - `GET /orders/:id`

4. **Shipments** (ShipmentController)
   - `GET /shipments`

5. **Support** (SupportController)
   - `GET /support/tickets`
   - `POST /support/tickets`
   - `GET /support/tickets/:id`
   - `POST /support/tickets/:id/messages`
   - `PATCH /support/tickets/:id`

6. **Admin** (AdminController)
   - `GET /admin/customers`
   - `GET /admin/customers/:id`
   - `GET /admin/orders`
   - `GET /admin/orders/:id`
   - `PATCH /admin/orders/:id`
   - `GET /admin/invoices`
   - `POST /admin/support/:id/reply`
   - etc.

---

## Recomendaciones finales

1. **Empieza por Auth:** Sin autenticación, el resto no funciona.
2. **MVP first:** Completa Fase 1-2 antes de admin.
3. **Reutilización:** Crea componentes genéricos (FormField, DataTable, etc) desde el inicio.
4. **Tipado:** Mantén tipos TypeScript actualizados en `src/types/`.
5. **Testing:** Escribe tests para servicios (auth, fetch).
6. **Storybook:** Documenta componentes reutilizables.
7. **Performance:** Lazy-load rutas del admin.
8. **Feedback visual:** Toast notifications para acciones (éxito/error).

---

**Próximo paso:** Vamos a empezar con Fase 1 (Autenticación) y crearemos los componentes paso a paso.
