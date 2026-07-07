import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import {
  getVisitAnalytics,
  getDownloadAnalytics,
  getOrderAnalytics,
  updateOrder,
} from '../controllers/adminController';

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get('/stats/visits', getVisitAnalytics);
router.get('/stats/downloads', getDownloadAnalytics);
router.get('/stats/orders', getOrderAnalytics);
router.patch('/orders/:orderId', updateOrder);

export default router;
