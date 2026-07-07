import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { createCheckout } from '../controllers/checkoutController';

const router = Router();

router.post('/', authMiddleware, createCheckout);

export default router;
