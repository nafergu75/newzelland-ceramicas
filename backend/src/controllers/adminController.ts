import { Response, NextFunction } from 'express';
import { AuthRequest } from '../models/types';
import { getVisitStats, getDownloadStats, getOrderStats, getTotalStats } from '../services/analyticsService';
import { updateOrderStatus } from '../services/orderService';
import { crearAsiento, guardarAsiento, puedeContabilizarse, obtenerAsientos, obtenerAsientoDetalle } from '../services/invoiceService';
import { FacturaExtraida } from '../types/invoice';

export const getVisitAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const stats = await getVisitStats(days);
    return res.json({ byDate: stats });
  } catch (error) {
    next(error);
  }
};

export const getDownloadAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const stats = await getDownloadStats(days);
    return res.json({ byCatalog: stats });
  } catch (error) {
    next(error);
  }
};

export const getOrderAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const stats = await getOrderStats(days);
    const total = await getTotalStats();
    return res.json({ byDate: stats, total });
  } catch (error) {
    next(error);
  }
};

export const updateOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!['pending', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await updateOrderStatus(orderId, status);
    return res.json(order);
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// Contabilización de facturas leídas por el lector OCR del frontend.
// Recibe FacturaExtraida (nuevo schema con tipoDocumento, direccion, observaciones).
// Valida requiereRevision y aplica cuentas contables según dirección.
// ---------------------------------------------------------------------------

export const contabilizarFactura = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const factura: FacturaExtraida = req.body;

    // Validaciones básicas
    if (!factura || typeof factura !== 'object') {
      return res.status(400).json({ message: 'Cuerpo de la petición vacío' });
    }

    // No procesar si requiere revisión
    if (factura.requiereRevision) {
      return res.status(400).json({
        message: 'La factura requiere revisión manual antes de contabilizar',
        observaciones: factura.observaciones
      });
    }

    // Validar que puede contabilizarse
    if (!puedeContabilizarse(factura)) {
      return res.status(400).json({
        message: 'La factura no cumple con los requisitos de contabilización',
        confianza: factura.confianza,
        observaciones: factura.observaciones
      });
    }

    // Validar campos críticos
    if (!factura.totalFactura || factura.totalFactura <= 0) {
      return res.status(400).json({ message: 'La factura no tiene un total válido' });
    }
    if (!Array.isArray(factura.bases) || factura.bases.length === 0) {
      return res.status(400).json({ message: 'La factura no tiene bases imponibles' });
    }
    if (!factura.fecha) {
      return res.status(400).json({ message: 'La factura no tiene fecha' });
    }
    if (!factura.direccion || !['ingreso', 'gasto'].includes(factura.direccion)) {
      return res.status(400).json({ message: 'Dirección no válida (ingreso|gasto)' });
    }

    // Crear y guardar asiento
    const asiento = crearAsiento(factura);
    const resultado = await guardarAsiento(asiento);

    return res.json({
      ok: true,
      id: resultado.id,
      mensaje: `Factura contabilizada como ${factura.direccion === 'ingreso' ? 'venta' : 'compra'}`,
      asiento: {
        id: asiento.id,
        fecha: asiento.fecha,
        total: asiento.total,
        direccion: asiento.direccion,
        confianza: asiento.confianza,
      }
    });
  } catch (error) {
    next(error);
  }
};

export const listarAsientos = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { direccion, estado, desde, hasta, nif } = req.query;

    const asientos = await obtenerAsientos({
      direccion: direccion as 'ingreso' | 'gasto' | undefined,
      estado: estado as string | undefined,
      desde: desde as string | undefined,
      hasta: hasta as string | undefined,
      nif: nif as string | undefined,
    });

    return res.json({ ok: true, count: asientos.length, asientos });
  } catch (error) {
    next(error);
  }
};

export const obtenerAsiento = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'ID de asiento requerido' });
    }

    const asiento = await obtenerAsientoDetalle(id);
    return res.json({ ok: true, asiento });
  } catch (error) {
    if (error instanceof Error && error.message === 'Asiento no encontrado') {
      return res.status(404).json({ message: 'Asiento no encontrado' });
    }
    next(error);
  }
};

// ---------------------------------------------------------------------------
// Modo IA del lector de facturas: proxy hacia el extractor central de Conta API
// (facturascripts-api-node, /companies/:id/invoice-extractor/extract).
// El navegador solo habla con este backend; el token de Conta API vive en .env:
//   CONTA_API_URL      p. ej. http://localhost:3005 (rutas en raíz, sin /api)
//   CONTA_API_TOKEN    JWT de un usuario de Conta API con acceso a la empresa
//   CONTA_COMPANY_ID   id de la empresa en Conta API
//   EMPRESA_NIF        NIF propio para clasificar venta/gasto (B98492259)
//   EMPRESA_NOMBRE     nombre propio para clasificar (Newzeland Center S.L.)
// ---------------------------------------------------------------------------

export const extraerFacturaIA = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { archivoBase64, nombre, mimeType } = req.body || {};
    if (!archivoBase64 || typeof archivoBase64 !== 'string') {
      return res.status(400).json({ message: 'Falta archivoBase64 en el cuerpo de la petición' });
    }

    const baseUrl = process.env.CONTA_API_URL;
    const token = process.env.CONTA_API_TOKEN;
    const companyId = process.env.CONTA_COMPANY_ID;
    if (!baseUrl || !token || !companyId) {
      return res.status(503).json({
        message:
          'Modo IA no configurado: define CONTA_API_URL, CONTA_API_TOKEN y CONTA_COMPANY_ID en el .env del backend.',
      });
    }

    const axios = (await import('axios')).default;
    const resp = await axios.post(
      `${baseUrl.replace(/\/$/, '')}/companies/${companyId}/invoice-extractor/extract`,
      {
        archivoBase64,
        nombre: typeof nombre === 'string' ? nombre : 'factura.pdf',
        mimeType: typeof mimeType === 'string' ? mimeType : 'application/pdf',
        empresaNif: process.env.EMPRESA_NIF || 'B98492259',
        empresaNombre: process.env.EMPRESA_NOMBRE || 'Newzeland Center',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 120000, // la lectura con Claude puede tardar
        maxBodyLength: 25 * 1024 * 1024,
      }
    );

    return res.json(resp.data);
  } catch (error) {
    const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
    if (err.response) {
      // Propagar el mensaje real del extractor (p. ej. "sin crédito en la API")
      return res.status(err.response.status || 502).json({
        message: err.response.data?.message || 'El extractor IA devolvió un error',
        detalle: err.response.data,
      });
    }
    return res.status(502).json({
      message: `No se pudo contactar con el extractor IA: ${err.message || 'error desconocido'}`,
    });
  }
};
