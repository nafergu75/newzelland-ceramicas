/**
 * Sistema de carrito por cajas con visualización de metros cuadrados
 * Fuente: tarifa-productos.json (formato, m²/caja, PVP)
 *
 * Fórmula PVP: (coste_caja * 1.25 + 4) * 1.21
 */

class CarritoBoxes {
  constructor() {
    this.items = [];
    this.tarifa = null;
    this.init();
  }

  async init() {
    // Carga la tarifa desde JSON
    try {
      const response = await fetch('/data/tarifa-productos.json');
      const data = await response.json();
      this.tarifa = data.productos;
      console.log(`Tarifa cargada: ${this.tarifa.length} productos`);
    } catch (err) {
      console.error('Error cargando tarifa:', err);
    }
  }

  /**
   * Busca un producto en la tarifa
   * @param {string} formato - Tamaño (ej: "60x60")
   * @param {string} serie - Nombre de la serie (ej: "ATLAS")
   * @returns {object} Producto con datos de metros, coste, PVP
   */
  buscarProducto(formato, serie) {
    if (!this.tarifa) return null;
    return this.tarifa.find(p =>
      p.formato.toUpperCase() === formato.toUpperCase() &&
      p.serie.toUpperCase() === serie.toUpperCase()
    );
  }

  /**
   * Añade un producto al carrito (por cajas)
   * @param {string} formato
   * @param {string} serie
   * @param {number} cajas - Cantidad en cajas
   */
  agregarAlCarrito(formato, serie, cajas) {
    const producto = this.buscarProducto(formato, serie);
    if (!producto) {
      console.error(`Producto no encontrado: ${formato} ${serie}`);
      return false;
    }

    // Busca si ya está en el carrito
    const itemExistente = this.items.find(i => i.id === producto.id);

    if (itemExistente) {
      itemExistente.cajas += cajas;
    } else {
      this.items.push({
        id: producto.id,
        formato: producto.formato,
        serie: producto.serie,
        descripcion: producto.descripcion,
        metros_por_caja: producto.metros_por_caja,
        precio_venta_caja: producto.precio_venta_caja,
        cajas: cajas
      });
    }

    this.guardarCarrito();
    return true;
  }

  /**
   * Calcula metros totales para un item del carrito
   * @param {object} item
   * @returns {number} metros totales
   */
  calcularMetros(item) {
    return item.cajas * item.metros_por_caja;
  }

  /**
   * Calcula subtotal de un item
   * @param {object} item
   * @returns {number} precio total (cajas * pvp)
   */
  calcularSubtotal(item) {
    return item.cajas * item.precio_venta_caja;
  }

  /**
   * Calcula totales del carrito
   * @returns {object} {total_cajas, total_metros, total_precio}
   */
  calcularTotales() {
    return {
      total_cajas: this.items.reduce((sum, i) => sum + i.cajas, 0),
      total_metros: this.items.reduce((sum, i) => sum + this.calcularMetros(i), 0),
      total_precio: this.items.reduce((sum, i) => sum + this.calcularSubtotal(i), 0)
    };
  }

  /**
   * Actualiza cantidad de cajas para un item
   * @param {string} id - ID del producto
   * @param {number} cajas - Nueva cantidad
   */
  actualizarCantidad(id, cajas) {
    const item = this.items.find(i => i.id === id);
    if (item) {
      item.cajas = Math.max(1, cajas);
      this.guardarCarrito();
    }
  }

  /**
   * Elimina un item del carrito
   * @param {string} id - ID del producto
   */
  eliminarDelCarrito(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.guardarCarrito();
  }

  /**
   * Guarda el carrito en localStorage
   */
  guardarCarrito() {
    localStorage.setItem('carrito_newzelland', JSON.stringify(this.items));
    window.dispatchEvent(new CustomEvent('carritoActualizado', { detail: this.items }));
  }

  /**
   * Carga el carrito desde localStorage
   */
  cargarCarrito() {
    const guardado = localStorage.getItem('carrito_newzelland');
    if (guardado) {
      this.items = JSON.parse(guardado);
    }
  }

  /**
   * Limpia el carrito
   */
  vaciarCarrito() {
    this.items = [];
    localStorage.removeItem('carrito_newzelland');
    window.dispatchEvent(new CustomEvent('carritoActualizado', { detail: [] }));
  }

  /**
   * Exporta carrito para envío a pedido
   * @returns {object} Estructura lista para procesar
   */
  exportarPedido() {
    const totales = this.calcularTotales();
    return {
      fecha: new Date().toISOString(),
      items: this.items.map(i => ({
        formato: i.formato,
        serie: i.serie,
        cajas: i.cajas,
        metros_totales: this.calcularMetros(i),
        precio_unitario: i.precio_venta_caja,
        subtotal: this.calcularSubtotal(i)
      })),
      resumen: {
        total_cajas: totales.total_cajas,
        total_metros: Math.round(totales.total_metros * 100) / 100,
        total_precio: Math.round(totales.total_precio * 100) / 100
      }
    };
  }
}

// Instancia global
const carrito = new CarritoBoxes();
carrito.cargarCarrito();
