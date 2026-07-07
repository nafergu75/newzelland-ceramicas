import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getProfile, updateProfile, getOrders } from '../controllers/userController';

const router = Router();

router.use(authMiddleware);

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.get('/orders', getOrders);

export default router;
