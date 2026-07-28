import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import {
  getVisitAnalytics,
  getDownloadAnalytics,
  getOrderAnalytics,
  updateOrder,
  contabilizarFactura,
  listarAsientos,
  obtenerAsiento,
  extraerFacturaIA,
} from '../controllers/adminController';

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get('/stats/visits', getVisitAnalytics);
router.get('/stats/downloads', getDownloadAnalytics);
router.get('/stats/orders', getOrderAnalytics);
router.patch('/orders/:orderId', updateOrder);

// Facturas OCR
router.post('/facturas/contabilizar', contabilizarFactura);
router.post('/facturas/extraer-ia', extraerFacturaIA);
router.get('/asientos', listarAsientos);
router.get('/asientos/:id', obtenerAsiento);

export default router;
