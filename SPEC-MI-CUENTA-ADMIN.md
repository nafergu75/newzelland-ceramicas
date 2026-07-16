# Especificación Funcional: "Mi Cuenta" y Panel de Administración
## Newzelland Cerámicas – Ecommerce B2C

**Versión:** 1.0  
**Fecha:** 16 de julio de 2026  
**Autor:** Análisis de Producto  
**Audiencia:** Equipo de desarrollo, diseño UX/UI, administrador  

---

## 1. VISIÓN GENERAL Y CONTEXTO

### 1.1 Objeto del documento

Este documento especifica el diseño funcional completo de:
- **Panel del cliente ("Mi Cuenta"):** Interfaz donde el usuario registrado gestiona su cuenta, ve sus compras, estado de envíos y se comunica con la empresa.
- **Panel de administración:** Interfaz privada para el propietario del ecommerce, con visibilidad completa sobre clientes, pedidos, facturación y soporte.

### 1.2 Perfil de usuario

| Rol | Perfil | Necesidades clave |
|-----|--------|-------------------|
| **Cliente final** | Particular o empresa | Consultar compras, estado de envío, descargar facturas, contactar soporte |
| **Administrador** | Propietario/responsable único | Gestión de clientes, pedidos, facturación, mensajes de soporte, reportes básicos |

### 1.3 Escala del negocio
- **Volumen esperado:** 50–500 clientes, 100–1000 pedidos/mes
- **Dirección de entrega:** Una única dirección por cliente (simplificación inicial)
- **Tracking:** Híbrido (manual en admin, preparación para integraciones futuras)
- **Usuarios admin:** Solo propietario (sin roles complejos)

---

## 2. MÓDULO DE REGISTRO Y AUTENTICACIÓN

### 2.1 Formulario de registro (alta de usuario)

#### 2.1.1 Campos obligatorios

| Campo | Tipo | Validación | Restricción | Ayuda | Ejemplo |
|-------|------|-----------|-------------|-------|---------|
| **Nombre y Apellidos** | Texto | Min 3 caracteres, solo letras y espacios | Obligatorio | "Ej: Juan García López" | Juan García López |
| **Correo Electrónico** | Email | Formato `usuario@dominio.com`, único en BD | Obligatorio | "Usaremos este correo para enviarte confirmaciones, facturas y avisos" | info@empresa.es |
| **Teléfono** | Teléfono | Formato: +34 600 123 456 o 600123456 | Obligatorio | "Incluye código de país o usa formato español" | +34 600 123 456 |
| **Contraseña** | Contraseña | Min 8 caracteres, recomendable: mayúscula, minúscula, número | Obligatorio | "Recomendamos: mayúsculas, minúsculas, números. Ej: Micontr123" | MiContr123! |
| **Confirmar contraseña** | Contraseña | Debe coincidir con "Contraseña" | Obligatorio | "Escribe de nuevo tu contraseña para confirmar" | MiContr123! |

#### 2.1.2 Campo opcional

| Campo | Tipo | Validación | Descripción |
|-------|------|-----------|-------------|
| **Empresa** | Texto | 3–100 caracteres | Nombre de la empresa (si compra en nombre de esta). Se mostrará en facturas si está completado |

#### 2.1.3 Confirmaciones y aceptaciones

| Elemento | Tipo | Contenido | Obligatorio |
|----------|------|----------|------------|
| **Aceptación de términos y condiciones** | Checkbox | "He leído y acepto los [Términos y Condiciones](link)" | Sí |
| **Aceptación de política de privacidad (RGPD)** | Checkbox | "He leído y acepto la [Política de Privacidad](link) y autorizo el procesamiento de mis datos" | Sí |
| **Boletín informativo (opcional)** | Checkbox | "Deseo recibir información sobre productos y promociones" | No |

#### 2.1.4 Validaciones de campos: Mensajes de error

```
NOMBRE Y APELLIDOS
├─ Vacío: "El nombre es obligatorio"
├─ < 3 caracteres: "El nombre debe tener al menos 3 caracteres"
└─ Caracteres inválidos: "El nombre solo puede contener letras y espacios"

CORREO ELECTRÓNICO
├─ Vacío: "El correo es obligatorio"
├─ Formato inválido: "Por favor, introduce un correo válido (ej: usuario@dominio.com)"
├─ Correo ya registrado: "Este correo ya está registrado en nuestro sistema. ¿[Quieres recuperar tu contraseña?](link)"
└─ En verificación: "Correo registrado. Se ha enviado un enlace de confirmación a [email]"

TELÉFONO
├─ Vacío: "El teléfono es obligatorio"
├─ Formato inválido: "Formato no válido. Usa: +34 600 123 456 o 600 123 456"
└─ Longitud: "El teléfono debe tener 9-15 dígitos"

CONTRASEÑA
├─ Vacío: "La contraseña es obligatoria"
├─ < 8 caracteres: "La contraseña debe tener al menos 8 caracteres"
├─ Sin mayúscula: "Recomendamos incluir al menos una mayúscula (Ej: A, B, C...)"
├─ Sin minúscula: "Recomendamos incluir al menos una minúscula (Ej: a, b, c...)"
├─ Sin número: "Recomendamos incluir al menos un número (Ej: 0, 1, 2...)"
└─ Contraseña débil (amarillo): "Contraseña válida, pero débil. Considera añadir mayúsculas, números o caracteres especiales"

CONFIRMAR CONTRASEÑA
├─ Vacío: "Confirma tu contraseña"
└─ No coincide: "Las contraseñas no coinciden"

TÉRMINOS Y CONDICIONES
└─ No marcado: "Debes aceptar los términos y condiciones para continuar"

POLÍTICA DE PRIVACIDAD
└─ No marcado: "Debes aceptar la política de privacidad para continuar"
```

#### 2.1.5 Flujo de confirmación de correo

1. Usuario completa el formulario y hace clic en "Crear cuenta"
2. Se muestra mensaje: "Cuasi-casi... Revisa tu correo"
3. Se envía email a `usuario@dominio.com` con:
   - Asunto: `Confirma tu correo en Newzelland Cerámicas`
   - Enlace: `https://newzelland.com/confirmar-email?token=XXXXX` (válido 24h)
   - Cuerpo: "Hola [Nombre], haz clic en el botón para confirmar tu correo. Si no solicitaste esta cuenta, ignora este mensaje."
4. Usuario hace clic en el enlace → Correo confirmado → Redirige a login con mensaje "¡Correo verificado! Ahora puedes acceder a tu cuenta"
5. **Reenvío:** Si no recibe el email, opción "¿No recibiste el email? [Reenviar](link)" durante 5 minutos

#### 2.1.6 Flujo de recuperación de contraseña

**Desde la página de login:**

1. Usuario hace clic en "¿Olvidaste tu contraseña?"
2. Introduce su correo → Se envía email con enlace de recuperación
3. Email contiene:
   - Asunto: `Recupera tu contraseña en Newzelland Cerámicas`
   - Enlace: `https://newzelland.com/reset-password?token=XXXXX` (válido 1 hora)
4. Usuario hace clic → Introduce contraseña nueva → Confirma → Redirige a login
5. Mensaje de éxito: "Contraseña actualizada. Ya puedes acceder a tu cuenta"

**Consideración de seguridad:**
- Los tokens de confirmación y reset deben ser únicos, aleatorios y con expiración
- Los tokens no deben revelar información del usuario
- Después de usar un token, debe invalidarse inmediatamente

---

## 3. PANEL DEL CLIENTE ("MI CUENTA")

### 3.1 Estructura general del panel

El panel está organizado en **5 secciones principales** accesibles desde una barra lateral o menú horizontal:

```
┌─ Mi Cuenta
│  ├─ Resumen de la cuenta
│  ├─ Mis pedidos
│  ├─ Estado de envíos
│  ├─ Mensajes y soporte
│  └─ Mi perfil
│
└─ Salir (logout)
```

### 3.2 Sección 1: RESUMEN DE LA CUENTA

**Descripción:** Interfaz de bienvenida que muestra un snapshot del estado actual del cliente: último pedido, importe total facturado, envíos pendientes.

#### 3.2.1 Contenido y componentes

```
╔════════════════════════════════════════════════════════════════╗
║  RESUMEN DE LA CUENTA                                          ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  ¡Bienvenido, [Nombre]!                                       ║
║                                                                ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │ 📊 ESTADÍSTICAS DE TU CUENTA                            │  ║
║  ├─────────────────────────────────────────────────────────┤  ║
║  │ Importe total facturado:     €1.245,50                 │  ║
║  │ Número de pedidos:           12                         │  ║
║  │ Compras este año:            €450,00                   │  ║
║  │ Miembro desde:               15 de enero de 2025       │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │ 🚚 TU ÚLTIMO PEDIDO                                     │  ║
║  ├─────────────────────────────────────────────────────────┤  ║
║  │ Número:         #PED-2026-0042                         │  ║
║  │ Fecha:          12 de julio de 2026                    │  ║
║  │ Estado:         En tránsito                            │  ║
║  │ Importe:        €234,50                                │  ║
║  │                                                         │  ║
║  │ [Ver detalles]  [Descargar factura]  [Contactar]      │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │ ⚠️  ENVÍOS PENDIENTES                                   │  ║
║  ├─────────────────────────────────────────────────────────┤  ║
║  │ Tienes 1 envío en preparación                          │  ║
║  │ Pedido #PED-2026-0043 (desde hace 2 días)              │  ║
║  │ [Ver detalles del envío]                               │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │ 🔐 SEGURIDAD DE TU CUENTA                               │  ║
║  ├─────────────────────────────────────────────────────────┤  ║
║  │ ✓ Contraseña robusta                                   │  ║
║  │ ✓ Correo verificado                                    │  ║
║  │ [Editar contraseña]  [Editar perfil]                  │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

#### 3.2.2 Especificación de datos y cálculos

| Elemento | Fuente | Cálculo | Actualización |
|----------|--------|---------|--------------|
| **Importe total facturado** | Base de datos (pedidos) | SUM(Pedidos.total) WHERE estado="pagado" | Tiempo real |
| **Número de pedidos** | Base de datos | COUNT(Pedidos) | Tiempo real |
| **Compras este año** | Base de datos | SUM(Pedidos.total) WHERE YEAR(fecha)=2026 | Tiempo real |
| **Miembro desde** | Base de datos (usuarios) | usuarios.fecha_alta | Estático |
| **Último pedido** | Base de datos (pedidos) | MAX(pedidos.fecha_creacion) | Tiempo real |

#### 3.2.3 Acciones disponibles

| Botón | Destino | Descripción |
|-------|---------|------------|
| **Ver detalles** | Sección "Mis pedidos" → Detalle del pedido | Abre la vista completa del último pedido |
| **Descargar factura** | Genera PDF de la factura | Descarga el PDF del último pedido |
| **Contactar** | Sección "Mensajes y soporte" → Nuevo mensaje | Abre formulario de soporte preseleccionando el tema |
| **Ver detalles del envío** | Sección "Estado de envíos" | Navega al estado del envío |
| **Editar contraseña** | Modal de cambio de contraseña | Permite cambiar la contraseña actual |
| **Editar perfil** | Sección "Mi perfil" | Navega a edición de datos personales |

---

### 3.3 Sección 2: MIS PEDIDOS

**Descripción:** Listado completo de todos los pedidos del cliente, con capacidad de filtrado, búsqueda y acceso a detalles.

#### 3.3.1 Vista de listado

```
╔════════════════════════════════════════════════════════════════╗
║  MIS PEDIDOS                                                   ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  [Buscar por nº pedido...]                                    ║
║                                                                ║
║  FILTROS:                                                      ║
║  ├─ Estado:    [Todos ▼]  [Pagados]  [Entregados]            ║
║  ├─ Periodo:   [Últimos 6 meses ▼]                           ║
║  └─ Ordenar:   [Más recientes ▼]                             ║
║                                                                ║
║  ─────────────────────────────────────────────────────────────║
║  Mostrando 1–10 de 12 pedidos                                ║
║  ─────────────────────────────────────────────────────────────║
║                                                                ║
║  ┌─ #PED-2026-0042 ────────────────────────────────────────┐ ║
║  │ Fecha: 12 de julio de 2026 | Importe: €234,50          │ ║
║  │ Estado: ✓ Pagado  |  Envío: 🚚 En tránsito             │ ║
║  │ [Ver detalles]  [Descargar factura]  [Contactar]       │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  ┌─ #PED-2026-0041 ────────────────────────────────────────┐ ║
║  │ Fecha: 05 de julio de 2026 | Importe: €89,75           │ ║
║  │ Estado: ✓ Pagado  |  Envío: ✓ Entregado               │ ║
║  │ [Ver detalles]  [Descargar factura]  [Contactar]       │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  [Cargar más pedidos...]  o  << 1  2  3  >> [Página siguiente]║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

#### 3.3.2 Especificación de columnas

| Campo | Tipo | Descripción |
|-------|------|------------|
| **Número de pedido** | ID único | Ej: `#PED-2026-0042` (formato consistente) |
| **Fecha de creación** | Fecha | Ej: "12 de julio de 2026" (formato legible) |
| **Importe total** | Moneda | Ej: "€234,50" (incluido IVA) |
| **Estado de pago** | Etiqueta | Opciones: `Pagado` ✓, `Pendiente` ⏳, `Cancelado` ✗ |
| **Estado de envío** | Etiqueta + icono | Opciones: `Pendiente de preparación` ⏰, `En tránsito` 🚚, `Entregado` ✓, `Incidencia` ⚠️ |
| **Acciones** | Botones | Ver detalles, Descargar factura, Contactar soporte |

#### 3.3.3 Filtros y búsqueda

| Filtro | Opciones | Comportamiento |
|--------|----------|-----------------|
| **Búsqueda por nº pedido** | Campo de texto | Busca en tiempo real (typing) |
| **Estado de pago** | Todos / Pagados / Pendientes / Cancelados | Multiselección posible |
| **Período** | Últimos 6 meses / Este año / Últimos 2 años / Personalizado | Rango de fechas |
| **Ordenación** | Más recientes / Más antiguos / Mayor importe / Menor importe | Por defecto: Más recientes |

#### 3.3.4 Vista de detalle del pedido

```
╔════════════════════════════════════════════════════════════════╗
║  DETALLE DEL PEDIDO #PED-2026-0042                            ║
║  [◄ Volver a "Mis pedidos"]                                   ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  INFORMACIÓN GENERAL                                           ║
║  ├─ Número de pedido:     #PED-2026-0042                     ║
║  ├─ Fecha de creación:    12 de julio de 2026, 15:23        ║
║  ├─ Estado de pago:       ✓ Pagado (12 de julio de 2026)   ║
║  └─ Forma de pago:        Tarjeta de crédito                ║
║                                                                ║
║  DIRECCIÓN DE ENTREGA                                         ║
║  ├─ Destinatario:         Juan García López                  ║
║  ├─ Dirección:            Calle Principal, 42, 2º A          ║
║  ├─ Código postal:        28001 Madrid                       ║
║  └─ Teléfono:             +34 600 123 456                    ║
║                                                                ║
║  PRODUCTOS EN ESTE PEDIDO                                     ║
║  ┌──────────────────────────────────────────────────────────┐║
║  │ Ardesia C3 (30×60)                                       ││
║  │ Precio/caja: €28,25 (neto)  |  Cajas: 3                 ││
║  │ Metros totales: 4,86 m²  |  Subtotal: €84,75            ││
║  └──────────────────────────────────────────────────────────┘║
║  ┌──────────────────────────────────────────────────────────┐║
║  │ Polaris (60×60)                                          ││
║  │ Precio/caja: €38,90 (neto)  |  Cajas: 4                 ││
║  │ Metros totales: 14,40 m²  |  Subtotal: €155,60          ││
║  └──────────────────────────────────────────────────────────┘║
║                                                                ║
║  RESUMEN FINANCIERO                                           ║
║  ├─ Subtotal (neto):      €240,35                           ║
║  ├─ IVA (21%):            €50,47                            ║
║  ├─ Subtotal con IVA:     €290,82                           ║
║  ├─ Envío:                €0,00 (≤ 500 km desde origen)     ║
║  └─ TOTAL:                €290,82                           ║
║                                                                ║
║  ESTADO DEL ENVÍO                                            ║
║  ├─ Estado actual:        🚚 En tránsito                     ║
║  ├─ Código de seguimiento: XXXXXXXXXXXXX                    ║
║  ├─ Transportista:        DPD                               ║
║  ├─ Última actualización:  12 de julio, 18:45               ║
║  └─ [Ver tracking externo en DPD]                           ║
║                                                                ║
║  ACCIONES                                                      ║
║  ├─ [Descargar factura (PDF)]                               ║
║  ├─ [Contactar soporte sobre este pedido]                   ║
║  └─ [Imprimir]                                              ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

#### 3.3.5 Información a incluir en detalle

| Sección | Campos |
|---------|--------|
| **Información general** | Número, Fecha, Estado de pago, Forma de pago, Método de envío |
| **Dirección de entrega** | Nombre, Dirección, CP, Localidad, Teléfono |
| **Productos** | Nombre serie/formato, Precio/caja (neto), Cantidad cajas, Metros totales, Subtotal línea |
| **Resumen financiero** | Subtotal neto, IVA, Subtotal con IVA, Coste de envío, Total |
| **Estado del envío** | Estado actual, Código de seguimiento, Transportista, Última actualización, Enlace a tracking externo |

---

### 3.4 Sección 3: ESTADO DE ENVÍOS

**Descripción:** Vista dedicada al seguimiento de envíos activos y recientes. Muestra el estado en tiempo real y posibilidad de contactar soporte si hay incidencias.

#### 3.4.1 Vista de envíos

```
╔════════════════════════════════════════════════════════════════╗
║  ESTADO DE ENVÍOS                                              ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  FILTROS:                                                      ║
║  ├─ Estado:  [Todos ▼]  [En tránsito]  [Entregados]         ║
║  └─ Periodo: [Últimos 30 días ▼]                            ║
║                                                                ║
║  ─────────────────────────────────────────────────────────────║
║  Mostrando 1 envío activo                                     ║
║  ─────────────────────────────────────────────────────────────║
║                                                                ║
║  ┌─ ENVÍO #DPD-XXXXXXXXXXXXX ──────────────────────────────┐ ║
║  │ Pedido:               #PED-2026-0042                    │ ║
║  │ Estado:               🚚 En tránsito                     │ ║
║  │ Transportista:        DPD                               │ ║
║  │ Código de seguimiento: DPD123456789                      │ ║
║  │                                                          │ ║
║  │ PROGRESO DEL ENVÍO:                                     │ ║
║  │ ✓ Pedido recibido (12/07, 15:30)                        │ ║
║  │ ✓ En almacén (12/07, 17:00)                            │ ║
║  │ ✓ En tránsito (13/07, 09:15)                           │ ║
║  │ ⏳ En reparto local (Estimado hoy)                      │ ║
║  │ ○ Entregado (Estimado 14/07)                            │ ║
║  │                                                          │ ║
║  │ [Ver tracking en DPD]  [Contactar]                      │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  ENVÍOS RECIENTES ENTREGADOS                                 ║
║  ─────────────────────────────────────────────────────────────║
║                                                                ║
║  ┌─ ENVÍO #DPD-YYYYYYYYYYYYY ──────────────────────────────┐ ║
║  │ Pedido:               #PED-2026-0041                    │ ║
║  │ Estado:               ✓ Entregado (12/07, 16:30)        │ ║
║  │ Transportista:        DPD                               │ ║
║  │ Entregado a:          Juan García López                 │ ║
║  │ Firma:                [Foto de entrega]                 │ ║
║  │ [Ver detalles]                                          │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

#### 3.4.2 Estados de envío

| Estado | Icono | Descripción | Acciones disponibles |
|--------|-------|-------------|----------------------|
| **Pendiente de preparación** | ⏰ | El almacén está preparando el pedido para envío | Contactar soporte |
| **En tránsito** | 🚚 | El transportista está entregando | Ver tracking, Contactar |
| **Entregado** | ✓ | Entregado al destinatario | Ver detalles, Contactar |
| **Incidencia** | ⚠️ | Problema en el envío (dañado, no localizado, etc.) | Contactar soporte (prioritario) |
| **Devuelto** | ↩️ | El envío ha sido devuelto al remitente | Contactar soporte |

#### 3.4.3 Información por estado

| Estado | Información mostrada |
|--------|----------------------|
| **Pendiente de preparación** | Fecha estimada de envío, Número de artículos |
| **En tránsito** | Código de seguimiento, Transportista, Historial de eventos, Estimado de entrega, Enlace a tracking externo |
| **Entregado** | Fecha y hora de entrega, Destinatario, Firma/Foto, Comentarios del repartidor |
| **Incidencia** | Tipo de incidencia, Descripción, Fecha, Opción de contactar soporte |

---

### 3.5 Sección 4: MENSAJES Y SOPORTE

**Descripción:** Centro de comunicación entre cliente y empresa. El cliente puede enviar consultas, ver respuestas y mantener un historial de conversaciones.

#### 3.5.1 Vista de centro de mensajes

```
╔════════════════════════════════════════════════════════════════╗
║  MENSAJES Y SOPORTE                                            ║
║  [+ Nuevo mensaje]                                            ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  FILTROS:                                                      ║
║  ├─ Estado:    [Todos ▼]  [Abiertos]  [Resueltos]           ║
║  └─ Categoría: [Todas ▼]  [Facturación]  [Envíos]           ║
║                                                                ║
║  ─────────────────────────────────────────────────────────────║
║  Tienes 3 conversaciones                                       ║
║  ─────────────────────────────────────────────────────────────║
║                                                                ║
║  ┌─ [ABIERTO] Pregunta sobre factura ──────────────────────┐ ║
║  │ ID:          #SUP-2026-0015                             │ ║
║  │ Categoría:   Facturación                                │ ║
║  │ Fecha:       12 de julio de 2026, 16:45                │ ║
║  │ Último msg:  Hoy, 09:30 (por Newzelland)               │ ║
║  │ Estado:      En curso (Respuesta pendiente)             │ ║
║  │                                                         │ ║
║  │ "¿Puedo cambiar el nombre de la empresa en la factura?"│ ║
║  │ [Ver conversación]                                      │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  ┌─ [RESUELTO] ¿Dónde está mi pedido? ────────────────────┐ ║
║  │ ID:          #SUP-2026-0014                             │ ║
║  │ Categoría:   Envíos                                     │ ║
║  │ Fecha:       08 de julio de 2026, 10:15                │ ║
║  │ Último msg:  11 de julio, 12:00 (por Juan García)      │ ║
║  │ Estado:      Resuelto (Cerrada hace 1 día)             │ ║
║  │                                                         │ ║
║  │ "Hola, no recibo noticias de mi pedido..." [+3 msgs]   │ ║
║  │ [Ver conversación]                                      │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  ┌─ [ABIERTO] Producto dañado ───────────────────────────┐  ║
║  │ ID:          #SUP-2026-0013                             │ ║
║  │ Categoría:   Incidencias / Productos                    │ ║
║  │ Fecha:       05 de julio de 2026, 14:30                │ ║
║  │ Último msg:  05 de julio, 15:00 (por Newzelland)       │ ║
║  │ Estado:      Abierta (Esperando respuesta)              │ ║
║  │                                                         │ ║
║  │ "He recibido una pieza rota. Adjuntas fotos." [+1 msg] │ ║
║  │ [Ver conversación]                                      │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

#### 3.5.2 Formulario de nuevo mensaje

```
╔════════════════════════════════════════════════════════════════╗
║  NUEVO MENSAJE                                                 ║
║  [◄ Volver]                                                   ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  CATEGORÍA *                                                   ║
║  ┌────────────────────────────────────────────────────────┐  ║
║  │ [Selecciona una categoría ▼]                           │  ║
║  │  ├─ Facturación                                        │  ║
║  │  ├─ Envíos y logística                                 │  ║
║  │  ├─ Consulta sobre producto                            │  ║
║  │  ├─ Incidencia (producto dañado, pedido incompleto)   │  ║
║  │  ├─ Devolución / Cambio                                │  ║
║  │  ├─ Cuenta y perfil                                    │  ║
║  │  └─ Otro                                               │  ║
║  └────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  ASUNTO *                                                      ║
║  ┌────────────────────────────────────────────────────────┐  ║
║  │ Ej: "¿Puedo cambiar el nombre en la factura?"         │  ║
║  │ [                                                    ] │  ║
║  └────────────────────────────────────────────────────────┘  ║
║  Mín. 5, máx. 100 caracteres                                 ║
║                                                                ║
║  RELACIONADO CON UN PEDIDO (Opcional)                         ║
║  ┌────────────────────────────────────────────────────────┐  ║
║  │ [Selecciona un pedido ▼]                               │  ║
║  │ (Si tu pregunta es sobre un pedido específico)         │  ║
║  └────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  MENSAJE *                                                     ║
║  ┌────────────────────────────────────────────────────────┐  ║
║  │                                                        │  ║
║  │ Escribe tu mensaje aquí. Sé lo más detallado posible │  ║
║  │ para que podamos ayudarte rápidamente.                 │  ║
║  │                                                        │  ║
║  │                                                        │  ║
║  │ [                                                 ] │  ║
║  │                                                        │  ║
║  │                                                        │  ║
║  │ Min. 10, máx. 5000 caracteres | Caracteres: 0/5000   │  ║
║  └────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  ADJUNTOS (Opcional)                                           ║
║  ├─ Formatos permitidos: JPG, PNG, PDF (máx. 5 MB/archivo)  ║
║  ├─ [Seleccionar archivo]  o  Arrastra archivos aquí       ║
║  └─ Máx. 3 archivos por mensaje                             ║
║                                                                ║
║  ┌────────────────────────────────────────────────────────┐  ║
║  │ [Cancelar]                  [Enviar mensaje]          │  ║
║  └────────────────────────────────────────────────────────┘  ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

#### 3.5.3 Vista de conversación

```
╔════════════════════════════════════════════════════════════════╗
║  CONVERSACIÓN #SUP-2026-0015                                   ║
║  [◄ Volver a mensajes]                                        ║
║                                                                ║
║  INFORMACIÓN GENERAL                                           ║
║  ├─ Categoría: Facturación                                    ║
║  ├─ Estado: En curso                                          ║
║  ├─ Abierta desde: 12 de julio de 2026, 16:45                ║
║  └─ Última actividad: Hoy, 09:30                             ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  MENSAJE 1 (Juan García)                                      ║
║  12 de julio de 2026, 16:45                                  ║
║  ┌────────────────────────────────────────────────────────┐  ║
║  │ Pregunta sobre factura                                │  ║
║  │                                                        │  ║
║  │ "¿Puedo cambiar el nombre de la empresa en la factura?│  ║
║  │ He comprado como empresa pero no aparece el nombre    │  ║
║  │ correcto."                                             │  ║
║  └────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  MENSAJE 2 (Newzelland Cerámicas)                            ║
║  12 de julio de 2026, 18:00                                  ║
║  ┌────────────────────────────────────────────────────────┐  ║
║  │ "Hola Juan, gracias por tu consulta.                  │  ║
║  │                                                        │  ║
║  │ Puedes cambiar el nombre de la empresa en tu perfil.  │  ║
║  │ Dirígete a 'Mi perfil' > 'Empresa' y actualiza los   │  ║
║  │ datos. Las próximas facturas usarán el nombre nuevo. │  ║
║  │                                                        │  ║
║  │ ¿Necesitas que re-emitamos la factura anterior?       │  ║
║  │ Nos encantaría ayudarte.                              │  ║
║  │                                                        │  ║
║  │ Saludos,                                               │  ║
║  │ Equipo Newzelland"                                    │  ║
║  └────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  MENSAJE 3 (Juan García)                                      ║
║  Hoy, 09:30                                                   ║
║  ┌────────────────────────────────────────────────────────┐  ║
║  │ "¡Perfecto! Acabo de actualizar el nombre.            │  ║
║  │ Gracias por la ayuda rápida."                         │  ║
║  └────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  ─────────────────────────────────────────────────────────────║
║                                                                ║
║  TU RESPUESTA                                                  ║
║  ┌────────────────────────────────────────────────────────┐  ║
║  │ [Escribe tu respuesta aquí...]                         │  ║
║  │                                                        │  ║
║  │ [                                                 ] │  ║
║  │                                                        │  ║
║  │                                                        │  ║
║  │ [Cancelar]                        [Enviar respuesta]  │  ║
║  └────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  [Marcar como resuelto]                                       ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

#### 3.5.4 Especificación de mensajes y respuestas

| Elemento | Contenido | Notas |
|----------|----------|-------|
| **ID de conversación** | #SUP-YYYY-NNNN (año + secuencial) | Único e identificador para referencias |
| **Categoría** | Facturación, Envíos, Producto, Incidencias, Devolución, Cuenta, Otro | Obligatorio en nuevo mensaje |
| **Asunto** | Texto libre (5–100 caracteres) | Mostrado en el listado de conversaciones |
| **Estado** | Abierta, En curso, Resuelta, Cerrada | `Abierta`: sin respuesta; `En curso`: respondida; `Resuelta`: cliente confirma solución; `Cerrada`: admin cierra |
| **Tiempo de respuesta esperado** | 24–48 horas | Mostrar en interfaz: "Respuesta esperada en 24 horas" |

---

### 3.6 Sección 5: MI PERFIL

**Descripción:** Edición de datos personales, empresa, dirección de entrega y contraseña.

#### 3.6.1 Vista de perfil

```
╔════════════════════════════════════════════════════════════════╗
║  MI PERFIL                                                     ║
║  [Editar] [Cambiar contraseña] [Descargar mis datos]         ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  DATOS PERSONALES                                              ║
║  ├─ Nombre y apellidos:    Juan García López                  ║
║  ├─ Correo:                juan.garcia@empresa.es             ║
║  ├─ Correo verificado:     ✓ Sí (12 de enero de 2025)        ║
║  ├─ Teléfono:              +34 600 123 456                    ║
║  └─ Miembro desde:         15 de enero de 2025                ║
║                                                                ║
║  DATOS DE EMPRESA (Opcional)                                  ║
║  ├─ Nombre empresa:        García & Asociados S.L.            ║
║  ├─ NIF/CIF:               B12345678                          ║
║  └─ Sector:                Construcción                       ║
║                                                                ║
║  DIRECCIÓN DE ENTREGA                                         ║
║  ├─ Dirección:             Calle Principal, 42, 2º A          ║
║  ├─ CP:                    28001                              ║
║  ├─ Localidad:             Madrid                             ║
║  ├─ Provincia:             Madrid                             ║
║  └─ Notas de entrega:      "Llamar antes de entregar"        ║
║                                                                ║
║  PRIVACIDAD Y COMUNICACIONES                                   ║
║  ├─ □ Recibir newsletter                                      ║
║  ├─ ✓ Recibir notificaciones de pedidos                      ║
║  └─ ✓ Recibir notificaciones de envíos                       ║
║                                                                ║
║  SEGURIDAD                                                     ║
║  ├─ Contraseña:            ●●●●●●●●                          ║
║  ├─ Última actualización:   15 de marzo de 2026              ║
║  └─ [Cambiar contraseña]                                      ║
║                                                                ║
║  ─────────────────────────────────────────────────────────────║
║  [Editar perfil]  [Descargar mis datos (RGPD)]  [Borrar    ║
║  mi cuenta]                                                    ║
║  ─────────────────────────────────────────────────────────────║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

#### 3.6.2 Edición de perfil (modal/formulario)

Permite editar los siguientes campos:

| Campo | Editable | Validación | Nota |
|-------|----------|-----------|------|
| Nombre y apellidos | Sí | Min 3, max 100 caracteres | Solo letras y espacios |
| Teléfono | Sí | Formato internacional o español | Revalidar |
| Empresa | Sí | Opcional, 3–100 caracteres | Aparecerá en próximas facturas |
| NIF/CIF | Sí | Opcional, validar formato español | Usar para emisión de facturas |
| Dirección | Sí | Max 200 caracteres | Única dirección de entrega |
| CP | Sí | 5 dígitos | Validar rango español |
| Localidad | Sí | Max 50 caracteres | Autocompleta desde CP |
| Provincia | Sí | Selectable desde lista | Auto-rellenar desde CP |
| Notas de entrega | Sí | Max 250 caracteres | Indicaciones para el repartidor |
| Correo | No | Mostrar pero no editar | Requiere proceso especial de cambio |
| Contraseña | No | Acceso a formulario especial | Modal de cambio de contraseña |

#### 3.6.3 Cambio de contraseña

```
╔════════════════════════════════════════════════════════════════╗
║  CAMBIAR CONTRASEÑA                                            ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  CONTRASEÑA ACTUAL *                                           ║
║  ┌────────────────────────────────────────────────────────┐  ║
║  │ [●●●●●●●●                                           ] │  ║
║  └────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  CONTRASEÑA NUEVA *                                            ║
║  ┌────────────────────────────────────────────────────────┐  ║
║  │ [                                                    ] │  ║
║  │ Recomendaciones: ◐ Mayúscula ◑ Minúscula ◑ Número   │  ║
║  │ Fuerza: [████░░░░░] Fuerte                           │  ║
║  └────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  CONFIRMAR CONTRASEÑA NUEVA *                                  ║
║  ┌────────────────────────────────────────────────────────┐  ║
║  │ [                                                    ] │  ║
║  └────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  ┌────────────────────────────────────────────────────────┐  ║
║  │ [Cancelar]                    [Cambiar contraseña]   │  ║
║  └────────────────────────────────────────────────────────┘  ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

#### 3.6.4 Descargar datos personales (RGPD)

Opción que permite al usuario descargar todos sus datos en formato JSON o CSV:

```
Contenido del descargo:
- Datos personales (nombre, email, teléfono, empresa)
- Dirección de entrega
- Historial de pedidos (números, fechas, importes)
- Historial de envíos
- Mensajes de soporte enviados
- Fecha de última modificación de datos

Formato: "datos_personales_usuario_[fecha].json"
```

#### 3.6.5 Eliminar cuenta

Opción irreversible. Requiere:
1. Confirmación con contraseña
2. Confirmación con checkbox: "Entiendo que esta acción es irreversible"
3. Email de confirmación antes de ejecutar (con enlace de cancelación válido 24h)
4. Mensaje de éxito: "Tu cuenta ha sido eliminada. Tus datos personales se han anonimizado según RGPD."

---

## 4. PANEL DE ADMINISTRACIÓN

### 4.1 Estructura general del panel admin

```
┌─ PANEL DE ADMINISTRACIÓN
│  ├─ Dashboard
│  ├─ Gestión de clientes
│  ├─ Gestión de pedidos
│  ├─ Facturas y facturación
│  ├─ Centro de mensajes (soporte)
│  ├─ Reportes y analytics
│  ├─ Configuración
│  └─ Salir
│
└─ Usuario: ignacio@ifeval.es (Tu cuenta)
```

### 4.2 DASHBOARD (Vista general)

**Descripción:** Resumen ejecutivo con KPIs clave del negocio, gráficos y accesos rápidos.

#### 4.2.1 Contenido del dashboard

```
╔════════════════════════════════════════════════════════════════╗
║  DASHBOARD ADMINISTRATIVO                                      ║
║  Últimos 30 días  [Personalizar período]                      ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  KPIs CLAVE                                                    ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │ Ingresos totales  €12.450,75   ↑ 12% (vs hace 30 días)│  ║
║  │ Pedidos completados  145        ↑ 8%                   │  ║
║  │ Clientes nuevos  12              ↓ 3%                   │  ║
║  │ Ticket promedio  €85,90         ↑ 15%                  │  ║
║  │ Tasa de conversión  2.8%         → 0%                   │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  ESTADO DE PEDIDOS                                             ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │ Pagados:       125  (86%)                               │  ║
║  │ Pendientes:    15   (10%)                               │  ║
║  │ Cancelados:    5    (4%)                                │  ║
║  │ [Ver todos los pedidos]                                 │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  ENVÍOS ACTIVOS                                                ║
║  ├─ Pendiente de preparación:  8                              ║
║  ├─ En tránsito:              12                              ║
║  ├─ Con incidencias:           2  [⚠️ Revisar]               ║
║  └─ [Ver todos los envíos]                                    ║
║                                                                ║
║  MENSAJES DE SOPORTE                                           ║
║  ├─ Nuevos (sin responder):    3  [!!! REVISAR]               ║
║  ├─ En curso:                  5                              ║
║  ├─ Resueltos hoy:             2                              ║
║  └─ [Ver bandeja de entrada]                                  ║
║                                                                ║
║  TOP 5 CLIENTES (por facturación este mes)                    ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │ 1. García & Asociados S.L.           €1.245,50          │  ║
║  │ 2. Constructora Martínez              €890,00            │  ║
║  │ 3. Juan García López (particular)     €456,75            │  ║
║  │ 4. Reforma Integral SA                €345,60            │  ║
║  │ 5. Alicatados Profesionales SL        €312,90            │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  GRÁFICO DE INGRESOS (últimos 6 meses)                        ║
║  │ €14K ┤                ╭─────╮                               ║
║  │      │              ╭─╯     ╰─╮                            ║
║  │ €10K ┤          ╭───╯         ╰───╮ ← Tendencia            ║
║  │      │      ╭───╯                 ╰─╮                      ║
║  │ €5K  ┤  ╭───╯                       ╰                      ║
║  │      │╭─╯                                                  ║
║  │      └┴──────────────────────────────────────────────────  ║
║  │       Jun    Jul    Ago    Sep    Oct    Nov              ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  ACCIONES RÁPIDAS                                              ║
║  ├─ [+ Nuevo pedido manual]  [Ver pedidos]                   ║
║  ├─ [+ Nuevo cliente]        [Ver clientes]                  ║
║  └─ [Ver reportes]           [Configuración]                 ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

---

### 4.3 GESTIÓN DE CLIENTES

#### 4.3.1 Vista de listado de clientes

```
╔════════════════════════════════════════════════════════════════╗
║  GESTIÓN DE CLIENTES                                           ║
║  [+ Nuevo cliente]                                             ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  BÚSQUEDA Y FILTROS                                            ║
║  ├─ Buscar por nombre, email, teléfono:  [        ]           ║
║  ├─ Estado:        [Todos ▼]  [Activos]  [Inactivos]         ║
║  ├─ Ordenar:       [Nombre A-Z ▼]  [Últimos registrados]    ║
║  └─ Por página:    [10 ▼]                                     ║
║                                                                ║
║  ─────────────────────────────────────────────────────────────║
║  Mostrando 1–10 de 142 clientes                               ║
║  ─────────────────────────────────────────────────────────────║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ Nombre          │ Email            │ Teléfono  │ Pedidos ║
║  ├──────────────────────────────────────────────────────────┤ ║
║  │ Juan García L.  │ juan@empresa.es  │ +34 600.. │  12 ✓  ║
║  │ García & Asoc.  │ info@garcia.es   │ +34 912.. │  24 ✓  ║
║  │ Constr. Martín. │ obra@cnstruc.es  │ +34 633.. │   8 ✓  ║
║  │ María López A.  │ maria@mail.es    │ +34 678.. │   3 ✓  ║
║  │ ...             │ ...              │ ...       │ ... ✓  ║
║  │                 │ [Editar] [✓/✗]   │ [X]      │        ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  [◄ Atrás]  << 1  2  3  4  5 >>  [Siguiente ►]               ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

#### 4.3.2 Ficha de cliente (vista detallada)

```
╔════════════════════════════════════════════════════════════════╗
║  CLIENTE: Juan García López                                    ║
║  [Editar]  [Desactivar]  [Reenviar email verificación]       ║
║  [Volver a clientes]                                           ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  DATOS PERSONALES                                              ║
║  ├─ Nombre:             Juan García López                     ║
║  ├─ Email:              juan@empresa.es  (✓ Verificado)      ║
║  ├─ Teléfono:           +34 600 123 456                      ║
║  ├─ Empresa:            García & Asociados S.L.              ║
║  ├─ NIF/CIF:            B12345678                            ║
║  ├─ Registro:           15 de enero de 2025                   ║
║  ├─ Última actividad:   12 de julio de 2026                  ║
║  └─ Estado:             ✓ Activo                              ║
║                                                                ║
║  RESUMEN COMERCIAL                                             ║
║  ├─ Total facturado:    €3.245,75                            ║
║  ├─ Número de pedidos:  12                                    ║
║  ├─ Ticket promedio:    €270,48                              ║
║  ├─ Frecuencia:         2-3 pedidos/mes                       ║
║  └─ Cliente desde:      18 meses                              ║
║                                                                ║
║  HISTORIAL DE PEDIDOS (últimos 5)                             ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ #PED-2026-0042  │  12/07/2026  │  €234,50  │ Entregado ║
║  │ #PED-2026-0038  │  28/06/2026  │  €456,75  │ Entregado ║
║  │ #PED-2026-0031  │  15/06/2026  │  €789,00  │ Entregado ║
║  │ #PED-2026-0025  │  01/06/2026  │  €345,60  │ Entregado ║
║  │ #PED-2026-0020  │  18/05/2026  │  €420,90  │ Entregado ║
║  │ [Ver todos los pedidos de este cliente]                  ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  DIRECCIÓN DE ENTREGA                                         ║
║  ├─ Dirección:   Calle Principal, 42, 2º A                  ║
║  ├─ CP:          28001  Madrid                              ║
║  ├─ Localidad:   Madrid                                      ║
║  └─ Notas:       "Llamar antes de entregar"                 ║
║                                                                ║
║  MENSAJES DE SOPORTE                                           ║
║  ├─ Total recibidos:  5                                       ║
║  ├─ Últimos 3:                                                ║
║  │  - #SUP-2026-0015 (12 jul): Pregunta sobre factura      ║
║  │  - #SUP-2026-0014 (08 jul): ¿Dónde está mi pedido?     ║
║  │  - #SUP-2026-0013 (05 jul): Producto dañado            ║
║  └─ [Ver todas las conversaciones]                            ║
║                                                                ║
║  ACCIONES                                                      ║
║  ├─ [Editar datos]                                            ║
║  ├─ [Desactivar cuenta]                                       ║
║  ├─ [Reenviar email de verificación]                          ║
║  ├─ [Descargar informe de compras (PDF)]                      ║
║  └─ [Eliminar cuenta (RGPD)]                                  ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

---

### 4.4 GESTIÓN DE PEDIDOS

#### 4.4.1 Listado de pedidos

```
╔════════════════════════════════════════════════════════════════╗
║  GESTIÓN DE PEDIDOS                                            ║
║  [+ Nuevo pedido manual]                                      ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  FILTROS Y BÚSQUEDA                                            ║
║  ├─ Buscar por nº pedido:      [      ]                       ║
║  ├─ Estado pago:               [Todos ▼]  [Pagados]          ║
║  ├─ Estado envío:              [Todos ▼]  [En tránsito]      ║
║  ├─ Período:                   [Últimos 30 días ▼]           ║
║  ├─ Cliente:                   [Todos ▼]                      ║
║  └─ Ordenar:                   [Más recientes ▼]             ║
║                                                                ║
║  ─────────────────────────────────────────────────────────────║
║  Mostrando 1–20 de 145 pedidos                                ║
║  ─────────────────────────────────────────────────────────────║
║                                                                ║
║  ┌────────────────────────────────────────────────────────────┐║
║  │ Nº Pedido      │ Cliente          │ Total    │ Pago | Envío║
║  ├────────────────────────────────────────────────────────────┤║
║  │ #PED-2026-0042 │ Juan García L.   │ €234,50  │ ✓ P  │🚚 ET ║
║  │ #PED-2026-0041 │ García & Asoc.   │ €456,75  │ ✓ P  │✓ TE ║
║  │ #PED-2026-0040 │ Constr. Martín.  │ €789,00  │ ✓ P  │ 🚚 ET ║
║  │ #PED-2026-0039 │ María López      │ €123,45  │ ⏳ Pe │ ⏰ PP ║
║  │ ...            │ ...              │ ...      │ ... │ ...  ║
║  │                │ [Ver] [Editar]   │          │     │      ║
║  └────────────────────────────────────────────────────────────┘║
║                                                                ║
║  LEYENDA: P=Pagado, Pe=Pendiente | PP=Preparación, ET=En    ║
║  tránsito, TE=Entregado, Inc=Incidencia                      ║
║                                                                ║
║  [◄ Atrás]  << 1 2 3 >>  [Siguiente ►]                       ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

#### 4.4.2 Detalle y edición de pedido

```
╔════════════════════════════════════════════════════════════════╗
║  PEDIDO #PED-2026-0042                                         ║
║  [Editar]  [Generar factura]  [Reenviar email]  [Volver]     ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  INFORMACIÓN GENERAL                                           ║
║  ├─ Número:        #PED-2026-0042                            ║
║  ├─ Cliente:       Juan García López                         ║
║  ├─ Fecha:         12 de julio de 2026, 15:23               ║
║  ├─ Estado pago:   ✓ Pagado (12 de julio, 15:45)           ║
║  ├─ Forma pago:    Tarjeta de crédito                       ║
║  └─ Notas internas: [Importante: cliente requiere factura   ║
║                      con nombre de empresa]                   ║
║                                                                ║
║  ENVÍO Y DIRECCIÓN                                            ║
║  ├─ Método envío:     DPD                                     ║
║  ├─ Estado envío:     🚚 En tránsito                         ║
║  ├─ Código tracking:  DPD123456789                            ║
║  ├─ Transportista:    DPD                                     ║
║  ├─ Dirección:        Calle Principal, 42, 2º A, 28001      ║
║  └─ [Editar estado del envío]                                ║
║                                                                ║
║  PRODUCTOS                                                     ║
║  ┌────────────────────────────────────────────────────────────┐║
║  │ Ardesia C3 (30×60)                                         ││
║  │ Precio/caja (neto): €28,25  |  Cajas: 3  |  Subtotal: €  ││
║  │ [Editar]  [Eliminar producto]                             ││
║  │                                                            ││
║  │ Polaris (60×60)                                            ││
║  │ Precio/caja (neto): €38,90  |  Cajas: 2  |  Subtotal: €  ││
║  │ [Editar]  [Eliminar producto]                             ││
║  │                                                            ││
║  │ [+ Añadir producto]                                        ││
║  └────────────────────────────────────────────────────────────┘║
║                                                                ║
║  RESUMEN FINANCIERO                                           ║
║  ├─ Subtotal (neto):    €240,35                             ║
║  ├─ IVA (21%):          €50,47                              ║
║  ├─ Subtotal + IVA:     €290,82                             ║
║  ├─ Envío:              €0,00                               ║
║  ├─ Descuentos:         €0,00                               ║
║  └─ TOTAL:              €290,82                             ║
║                                                                ║
║  ACCIONES                                                      ║
║  ├─ [Descargar factura (PDF)]                               ║
║  ├─ [Reenviar email de confirmación]                         ║
║  ├─ [Crear devolución]                                       ║
║  ├─ [Cancelar pedido]                                        ║
║  └─ [Imprimir]                                               ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

---

### 4.5 FACTURAS Y FACTURACIÓN

#### 4.5.1 Listado de facturas

```
╔════════════════════════════════════════════════════════════════╗
║  FACTURAS Y FACTURACIÓN                                        ║
║  [+ Generar factura manual]                                   ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  FILTROS                                                       ║
║  ├─ Período:   [Últimos 6 meses ▼]                           ║
║  ├─ Cliente:   [Todos ▼]                                     ║
║  ├─ Estado:    [Todas ▼]  [Pagadas]  [Pendientes]           ║
║  └─ Ordenar:   [Más recientes ▼]                            ║
║                                                                ║
║  ─────────────────────────────────────────────────────────────║
║  Mostrando 1–10 de 142 facturas | Total facturado: €28.456,75║
║  ─────────────────────────────────────────────────────────────║
║                                                                ║
║  ┌────────────────────────────────────────────────────────────┐║
║  │ Nº Factura  │ Cliente          │ Importe    │ Estado      ║
║  ├────────────────────────────────────────────────────────────┤║
║  │ FAC-2026-045│ Juan García L.   │ €234,50    │ ✓ Pagada   ║
║  │ FAC-2026-044│ García & Asoc.   │ €456,75    │ ✓ Pagada   ║
║  │ FAC-2026-043│ Constr. Martín.  │ €789,00    │ ✓ Pagada   ║
║  │ FAC-2026-042│ María López      │ €123,45    │ ⏳ Pendiente║
║  │ ...         │ ...              │ ...        │ ...        ║
║  │             │ [Descargar] [Re] │            │            ║
║  └────────────────────────────────────────────────────────────┘║
║                                                                ║
║  REPORTES DE FACTURACIÓN                                       ║
║  ├─ [Ingresos por mes (PDF)]                                 ║
║  ├─ [Facturas pendientes (Excel)]                            ║
║  ├─ [Libro de registro (PDF/Excel)]                          ║
║  └─ [IVA recaudado (mes/año)]                                ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

---

### 4.6 CENTRO DE MENSAJES (SOPORTE)

#### 4.6.1 Bandeja de entrada de mensajes

```
╔════════════════════════════════════════════════════════════════╗
║  CENTRO DE MENSAJES / SOPORTE                                  ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  FILTROS Y BÚSQUEDA                                            ║
║  ├─ Estado:    [Todos ▼]  [Nuevos]  [En curso]  [Resueltos]║
║  ├─ Categoría: [Todas ▼]  [Facturación]  [Envíos]           ║
║  ├─ Período:   [Últimas 2 semanas ▼]                        ║
║  └─ Ordenar:   [Más recientes ▼]  [Más antiguos]           ║
║                                                                ║
║  ─────────────────────────────────────────────────────────────║
║  Nuevos sin responder: 3 (!!!)  |  En curso: 5  | Resueltos:║
║  42                                                            ║
║  ─────────────────────────────────────────────────────────────║
║                                                                ║
║  ┌────────────────────────────────────────────────────────────┐║
║  │ [!] #SUP-2026-0015 | Facturación | Juan García L.       ║
║  │ "¿Puedo cambiar el nombre de la empresa en la factura?"  ║
║  │ Abierta hace 2 horas  |  [Responder]                     ║
║  │                                                           ║
║  │ [ ] #SUP-2026-0016 | Envíos | María López                ║
║  │ "¿Dónde está mi pedido #PED-2026-0042?"                  ║
║  │ Abierta hace 4 horas  |  1 respuesta pendiente           ║
║  │                                                           ║
║  │ [!] #SUP-2026-0017 | Incidencias | Constr. Martín.      ║
║  │ "He recibido una pieza rota. Adjunto fotos."            ║
║  │ Abierta hace 1 día  |  SIN RESPONDER [⚠️]  |[Responder]  ║
║  │                                                           ║
║  │ [✓] #SUP-2026-0014 | Envíos | Juan García L.            ║
║  │ "¿Dónde está mi pedido?" / "Gracias por la ayuda"       ║
║  │ Cerrada hace 1 día  | 2 mensajes                         ║
║  │                                                           ║
║  │ ...                                                       ║
║  │ [Ver] [Responder]                                         ║
║  └────────────────────────────────────────────────────────────┘║
║                                                                ║
║  [◄ Atrás]  << 1 2 3 >>  [Siguiente ►]                       ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

#### 4.6.2 Vista de conversación (como admin)

```
╔════════════════════════════════════════════════════════════════╗
║  CONVERSACIÓN #SUP-2026-0017                                   ║
║  [◄ Volver a bandeja]                                         ║
║                                                                ║
║  [ABIERTA] Incidencia | Producto dañado | Constr. Martínez  ║
║  ID: #SUP-2026-0017 | Desde: 5 de julio de 2026, 14:30      ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  MENSAJE 1 (Cliente: Constr. Martínez)                        ║
║  5 de julio de 2026, 14:30                                   ║
║  ┌────────────────────────────────────────────────────────────┐║
║  │ Producto dañado                                            ││
║  │                                                            ││
║  │ "He recibido la pieza (Ardesia C3, 30x60, caja de 3)    ││
║  │ rota. Adjunto fotos del daño.                            ││
║  │                                                            ││
║  │ Necesito que me enviéis una reposición urgente."         ││
║  │                                                            ││
║  │ [Foto 1] [Foto 2] [Foto 3]                               ││
║  └────────────────────────────────────────────────────────────┘║
║                                                                ║
║  ─────────────────────────────────────────────────────────────║
║  [!! SIN RESPONDER] ← Estado actual                           ║
║  ─────────────────────────────────────────────────────────────║
║                                                                ║
║  TU RESPUESTA (Admin)                                          ║
║  ┌────────────────────────────────────────────────────────────┐║
║  │ Asunto: RE: Producto dañado                              ││
║  │                                                            ││
║  │ [Escribe tu respuesta aquí...]                           ││
║  │                                                            ││
║  │ Hola, lamentamos mucho el inconveniente. Procederemos    ││
║  │ inmediatamente con la reposición de la caja dañada.      ││
║  │ Recibirás un email de confirmación con número de envío   ││
║  │ en las próximas 2 horas.                                 ││
║  │                                                            ││
║  │ Sentimos el inconveniente,                                ││
║  │ Equipo Newzelland                                         ││
║  │                                                            ││
║  │ [Adjuntar archivo]                                        ││
║  │                                                            ││
║  │ [Borrador]  [Enviar]  [Marcar como resuelto]            ││
║  └────────────────────────────────────────────────────────────┘║
║                                                                ║
║  INFORMACIÓN ASOCIADA                                          ║
║  ├─ Pedido relacionado: #PED-2026-0040                       ║
║  ├─ Cliente: Constructora Martínez                           ║
║  ├─ Email: obra@cnstruc.es                                  ║
║  └─ Teléfono: +34 633 445 566                               ║
║                                                                ║
║  ACCIONES                                                      ║
║  ├─ [Crear nota interna]                                     ║
║  ├─ [Asignar a agente] (si hubiera varios)                  ║
║  └─ [Marcar como spam]                                       ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

---

### 4.7 REPORTES Y ANALYTICS

Reportes disponibles para descarga:

| Reporte | Contenido | Formato | Frecuencia |
|---------|----------|---------|------------|
| **Ingresos por período** | Ingresos diarios/mensuales, tendencias | PDF/Excel | Mensual |
| **Top clientes** | Ranking por volumen de compra, frecuencia | PDF/Excel | Mensual |
| **Pedidos abiertos** | Pedidos no entregados, preparación | PDF | Semanal |
| **Facturas pendientes** | Facturas sin pagar, vencimiento próximo | PDF/Excel | Quincenal |
| **IVA recaudado** | Resumen de IVA por mes/trimestre/año | PDF/Excel | Mensual |
| **Análisis de envíos** | Estados de envío, incidencias, transportistas | PDF | Mensual |
| **Tasa de devolución** | Devoluciones vs total de pedidos | PDF | Mensual |
| **Clientes nuevos** | Nuevos registros por período | PDF/Excel | Mensual |

---

## 5. SEGURIDAD Y CONSIDERACIONES LEGALES

### 5.1 Seguridad de la contraseña

- **Requisito mínimo:** 8 caracteres
- **Recomendación:** Mayúscula, minúscula, número
- **Hash:** bcrypt con salt (mínimo 12 rondas)
- **Cambio obligatorio:** Cada 90 días (recordatorio opcional)
- **Histórico:** No permitir reutilización de últimas 3 contraseñas

### 5.2 Validación y verificación de correo

- **Verificación obligatoria** antes de acceso completo a la cuenta
- **Token de confirmación:** 24 horas de validez
- **Cambio de email:** Requiere verificación del nuevo email
- **Recordatorio:** Email de re-verificación si correo no confirmado después de 7 días

### 5.3 Cumplimiento RGPD

#### 5.3.1 Derechos de los usuarios

- **Derecho de acceso:** Opción "Descargar mis datos" en Mi Perfil (JSON/CSV)
- **Derecho al olvido:** Opción "Eliminar mi cuenta" (anonimización de datos)
- **Portabilidad:** Descarga en formato abierto (JSON/CSV)
- **Rectificación:** Edición de datos personales en cualquier momento
- **Consentimiento:** Checkbox explícito en registro para RGPD + newsletter

#### 5.3.2 Política de privacidad (página obligatoria)

Debe contener:
- Responsable del tratamiento: Nombre y email de contacto
- Fines del tratamiento: Gestión de pedidos, facturas, soporte
- Base legal: Contrato (ejecución de pedidos), consentimiento (newsletter)
- Destinatarios: Transportistas, sistema de pagos, proveedores
- Derechos del usuario: Acceso, rectificación, olvido, portabilidad
- Plazo de conservación: X años (definir según legislación)
- Contacto de protección de datos

#### 5.3.3 Política de cookies

- Cookies de sesión (técnicas): Necesarias, sin consentimiento
- Cookies de análisis (Google Analytics): Consentimiento previo (banner)
- Cookies de marketing: Consentimiento previo (banner)

---

## 6. UX/UI Y COPY RECOMENDADO

### 6.1 Mensajes de confirmación

| Situación | Mensaje |
|-----------|---------|
| Registro exitoso | "¡Bienvenido, [Nombre]! Hemos enviado un email de confirmación. Revisa tu buzón de entrada." |
| Email verificado | "✓ Correo verificado. Ya puedes acceder a tu cuenta." |
| Pedido creado | "✓ Pedido #[NÚMERO] creado. Recibirás un email de confirmación en unos momentos." |
| Mensaje enviado | "✓ Tu mensaje se ha enviado. Te responderemos en las próximas 24-48 horas." |
| Contraseña actualizada | "✓ Contraseña actualizada correctamente." |
| Perfil actualizado | "✓ Tu perfil ha sido actualizado." |

### 6.2 Mensajes de alerta/aviso

| Situación | Mensaje |
|-----------|---------|
| Envío con incidencia | "⚠️ Hay una incidencia en tu envío. [Contacta con soporte](link)" |
| Soporte sin respuesta | "⏳ Tu mensaje #[ID] lleva sin respuesta más de 24 horas. [Enviar recordatorio](link)" |
| Pedido pendiente de pago | "⏳ Tu pedido #[NÚMERO] está pendiente de pago. [Completar pago](link)" |
| Contraseña débil | "💡 Tu contraseña es débil. Recomendamos actualizar a una más segura." |

### 6.3 Elementos visuales

| Elemento | Descripción |
|----------|------------|
| **Iconos de estado** | ✓ (verde), ⏳ (amarillo), ✗ (rojo), 🚚 (envío), ⚠️ (alerta) |
| **Código de colores** | Verde (éxito), Amarillo (en curso), Rojo (error/urgente), Gris (inactivo) |
| **Botones principales** | Verde (#4CAF50) para acciones positivas (comprar, guardar) |
| **Botones secundarios** | Gris (anular, volver) |
| **Bordes y espacios** | 8px de mínimo, border-radius: 6–8px |

---

## 7. ROADMAP TÉCNICO Y CONSIDERACIONES

### 7.1 Arquitectura de datos sugerida

**Tablas principales:**
- `users` (nombre, email, teléfono, empresa, estado)
- `user_address` (dirección única por usuario)
- `orders` (pedido, estado pago, estado envío)
- `order_items` (productos en cada pedido)
- `shipments` (seguimiento de envíos, transportista)
- `support_tickets` (conversaciones de soporte)
- `support_messages` (mensajes dentro de cada ticket)
- `invoices` (facturas, relación con pedidos)

### 7.2 APIs externas a considerar (futuro)

- **Transportistas:** DPD, MRW, Seur (para tracking automático)
- **Pasarela de pagos:** Stripe, Adyen (ya integrada probablemente)
- **Email marketing:** Mailchimp, SendGrid (para newsletter)
- **Almacén:** Integraciones con sistemas de logística (en el futuro)

### 7.3 Seguridad y auditoría

- Logs de acceso admin (quién, cuándo, qué cambió)
- Encriptación de datos sensibles (teléfono, NIF/CIF)
- Rate limiting en login (máx 5 intentos/15 minutos)
- Session timeout (30 minutos de inactividad)

---

## 8. PRÓXIMOS PASOS

1. **Validar esta especificación** con tu equipo de desarrollo
2. **Priorizar MVP:** Registro + Mi Cuenta + Panel Admin básico
3. **Definir timeline:** Desarrollo (6–8 semanas estimadas)
4. **Wireframes:** Convertir estos flujos en wireframes Figma/Adobe XD
5. **Base de datos:** Crear esquema ER basado en esta especificación
6. **API REST:** Endpoints según cada sección
7. **Componentes React:** Reutilizables por sección (Cards, Forms, Tables)

---

**Documento completado: 16 de julio de 2026**  
**Versión:** 1.0  
**Próxima revisión:** Después del MVP (ajustes según feedback)
