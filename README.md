# Newzelland Cerámicas - E-commerce Platform

Plataforma de e-commerce completa para venta de cerámica premium en España.

## 🚀 Stack Tecnológico

### Backend
- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** para base de datos
- **JWT** para autenticación
- **Nodemailer** para emails
- **PDFKit** para generación de facturas
- **Joi** para validación

### Frontend
- **React 18** + **TypeScript**
- **Vite** como build tool
- **React Router** para navegación
- **Axios** para API calls
- **Recharts** para gráficos

## 📋 Requisitos Previos

- Node.js 18+
- PostgreSQL 12+
- npm o yarn

## 🔧 Instalación Rápida

### 1. Clonar y preparar variables de entorno

```bash
cd newzelland-ceramicas

# Backend
cd backend
cp .env.example .env
# Editar .env con tus credenciales

# Frontend
cd ../frontend
cp .env.example .env
```

### 2. Crear base de datos

En Windows PowerShell o psql:
```bash
$env:PGPASSWORD="postgres"
psql -U postgres -h localhost -c "CREATE DATABASE ecommerce_db;"
```

### 3. Instalar dependencias

```bash
# Backend
cd backend
npm install
npm run migrate

# Frontend (en otra terminal)
cd frontend
npm install
```

### 4. Ejecutar en desarrollo

```bash
# Terminal 1 - Backend (puerto 3000)
cd backend
npm run dev

# Terminal 2 - Frontend (puerto 5173)
cd frontend
npm run dev
```

Abre http://localhost:5173 en tu navegador.

## 📚 Estructura del Proyecto

```
newzelland-ceramicas/
├── backend/
│   ├── src/
│   │   ├── controllers/        # Lógica de rutas
│   │   ├── services/           # Lógica de negocio
│   │   ├── routes/             # Definición de rutas
│   │   ├── middleware/         # Auth, logging, errores
│   │   ├── models/             # TypeScript interfaces
│   │   ├── db/                 # Conexión y migraciones
│   │   └── app.ts              # Servidor Express
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── pages/              # Componentes de páginas
    │   ├── services/           # API client
    │   ├── hooks/              # Custom hooks
    │   ├── App.tsx             # Router principal
    │   └── main.tsx
    ├── index.html
    ├── vite.config.ts
    └── package.json
```

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Login con email/password
- `GET /api/auth/verify-email?token=...` - Verificar email

### Usuario
- `GET /api/user/profile` - Obtener perfil
- `PATCH /api/user/profile` - Actualizar perfil
- `GET /api/user/orders` - Listar órdenes

### Productos
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Detalle producto

### Checkout
- `POST /api/checkout` - Crear orden

### Admin (requiere rol admin)
- `GET /api/admin/stats/visits` - Estadísticas de visitas
- `GET /api/admin/stats/downloads` - Descargas de catálogos
- `GET /api/admin/stats/orders` - Estadísticas de órdenes
- `PATCH /api/admin/orders/:orderId` - Actualizar estado orden

## 🎯 Características Implementadas

✅ Autenticación con JWT y email verification
✅ Registro de usuarios con provincia
✅ Catálogo de productos con 5 artículos de demo
✅ Carrito de compras en localStorage
✅ Checkout con validación de NIF/CIF
✅ Generación de facturas en PDF
✅ Órdenes con seguimiento de estado
✅ Dashboard de usuario con órdenes
✅ Panel de admin con analytics
✅ Logging de visitas y descargas
✅ Rate limiting y seguridad CORS/Helmet
✅ Manejo global de errores
✅ Validación con Joi

## 🚧 Próximos Pasos (Opcionales)

- [ ] Integración Stripe para pagos
- [ ] WhatsApp Business API
- [ ] Más productos en catálogo
- [ ] Filtros avanzados de búsqueda
- [ ] Revisiones y puntuaciones
- [ ] Sistema de cupones/descuentos
- [ ] Estadísticas en tiempo real
- [ ] Notificaciones push
- [ ] Integración con FacturaScripts
- [ ] Deployment a Vercel/Heroku

## 📧 Configurar Emails (Gmail)

1. Ir a https://myaccount.google.com/apppasswords
2. Generar contraseña de aplicación
3. Usar en `SMTP_PASS` del .env

## 🐛 Troubleshooting

**Error: "Cannot find module 'pg'"**
- Ejecutar: `npm install` en la carpeta backend

**Error: "Connection refused" en PostgreSQL**
- Verificar que PostgreSQL está corriendo
- Verificar credenciales en .env

**Error: "CORS blocked"**
- Revisar que `FRONTEND_URL` en backend .env sea correcto

## 📞 Soporte

Para preguntas sobre la implementación, revisar:
- [Express.js docs](https://expressjs.com/)
- [React docs](https://react.dev/)
- [PostgreSQL docs](https://www.postgresql.org/docs/)

---

**Creado con ❤️ usando Claude**
