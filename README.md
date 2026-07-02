# Newzelland Cerámicas - Comercializadora Oficial de Practika

Web de comercialización de productos Practika Cerámica: azulejos, porcelánico y revestimientos.

## 📋 Características

- ✨ **Responsive Design** — optimizado para mobile, tablet y desktop
- 🛍️ **Tienda Virtual** — carrito y checkout con Stripe/PayPal
- 📥 **Descarga de Catálogos** — fichas técnicas organizadas por familia (estilo Practika)
- 💬 **WhatsApp Bot** — contacto automático y toma de pedidos
- 🎯 **Filtros Avanzados** — serie, formato, acabado, tipo de producto
- 📱 **Progressive Web App** — funcionamiento offline basic

## 🏗️ Stack Técnico

### Frontend
- **HTML5** — estructura semántica
- **CSS3** — responsive, sin frameworks pesados
- **JavaScript Vanilla** — sin dependencias en cliente
- **GitHub Pages** — hosting gratis

### Backend
- **Node.js + Express** — API para pagos y WhatsApp
- **PostgreSQL** — base de datos de órdenes y mensajes
- **Stripe / PayPal** — procesamiento de pagos
- **WhatsApp Business API** — bot automático
- **Vercel** — hosting del backend

## 📁 Estructura de Carpetas

```
newzelland-ceramicas/
├── index.html                 # Página de inicio
├── productos.html             # Catálogo filtrable
├── descargas.html            # Catálogos y fichas técnicas (★ CRÍTICA)
├── tienda.html               # Carrito y checkout
├── sobre-nosotros.html       # Información empresa
├── contacto.html             # Formulario de contacto
│
├── css/
│   └── styles.css            # Estilos globales
│
├── js/
│   ├── nav.js                # Navegación y utilidades
│   ├── carousel.js           # Carrusel del hero
│   ├── productos.js          # Filtros y grid
│   ├── descargas.js          # Gestión de familias
│   ├── tienda.js             # Checkout
│   ├── carrito.js            # Gestión localStorage
│   └── contacto.js           # Formulario contacto
│
├── data/
│   └── catalogo.json         # Datos de productos (series, formatos, PDFs)
│
├── assets/
│   ├── img/                  # Imágenes de productos
│   ├── descargas/            # PDFs de catálogos y fichas
│   ├── icons/                # Iconos SVG
│   └── logos/                # Logos empresa
│
├── backend/                  # API Node.js (Vercel)
│   ├── package.json
│   ├── server.js
│   ├── routes/
│   │   ├── checkout.js       # Stripe integration
│   │   ├── whatsapp.js       # WhatsApp webhook
│   │   └── orders.js         # CRUD pedidos
│   └── .env
│
└── docs/
    ├── DEPLOY.md             # Instrucciones de deploy
    └── API.md                # Documentación API
```

## 🚀 Deploy

### Frontend (GitHub Pages)

```bash
# Inicializar repo
git init
git add .
git commit -m "Initial commit: Newzelland Cerámicas web"
git branch -M main
git remote add origin https://github.com/tu-usuario/newzelland-ceramicas.git
git push -u origin main
```

Luego habilitar GitHub Pages en repo → Settings → Pages → Deploy from branch: main

### Backend (Vercel)

```bash
cd backend
vercel deploy
```

Configurar variables de entorno en Vercel:
- `STRIPE_KEY` — clave privada de Stripe
- `PAYPAL_ID` — ID de PayPal
- `WHATSAPP_TOKEN` — token de WhatsApp Business API
- `DATABASE_URL` — URL de PostgreSQL
- `ADMIN_EMAIL` — email para notificaciones

## 📦 Dependencias de Producción

Frontend: **ninguna** (vanilla JS)

Backend:
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "stripe": "^12.0.0",
    "pg": "^8.10.0",
    "dotenv": "^16.0.0",
    "axios": "^1.4.0"
  }
}
```

## 🔌 APIs Externas

- **Stripe** — procesamiento de pagos
- **PayPal REST API** — alternativa de pagos
- **WhatsApp Business API** — bot automático
- **SendGrid / Mailgun** — emails transaccionales (opcional)

## 📝 Importante

### Página de Descargas (★ CRÍTICA)

La página `descargas.html` es la más importante del proyecto. Debe:

1. **Mostrar todas las familias de Practika** por tarjetas (Calacata, Atlas, Artic, Provence, Stahl, Keyburn, etc.)
2. **Cada familia** debe tener:
   - Imagen representativa
   - Formatos disponibles
   - Acabados
   - Botones de descarga para fichas técnicas/instalación
3. **Descargas generales** (Catálogo 2024, Novedades, Área Técnica)
4. **Búsqueda** rápida por nombre de familia

### Catálogo JSON

El archivo `data/catalogo.json` contiene la estructura de todos los productos. Actualizar cuando:
- Se agreguen nuevas familias
- Cambien formatos o acabados disponibles
- Se suban nuevas fichas técnicas o PDFs

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias backend
cd backend
npm install

# Levantar servidor local
npm start  # http://localhost:3000

# Frontend corre en localhost:5500 (Live Server)
# o abrir archivos .html directamente en navegador
```

## 👥 Contacto

- **Email:** info@newzelland.es
- **Teléfono:** +34 123 456 789
- **WhatsApp:** +34 123 456 789
- **Ubicación:** Onda, Castellón, España

## 📄 Licencia

© 2024 Newzelland Cerámicas. Todos los derechos reservados.

---

**Generado con Claude Code** — Asistente de desarrollo IA
