import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { createCheckout, getCheckoutSummary } from '../controllers/checkoutController';

const router = Router();

router.post('/', authMiddleware, createCheckout);
// Resumen de totales: no requiere login (el carrito es previo a la compra)
router.post('/summary', getCheckoutSummary);

export default router;
