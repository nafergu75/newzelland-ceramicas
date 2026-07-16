import { Router } from 'express';
import { getAccountSummary } from '../controllers/accountController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/summary', authMiddleware, getAccountSummary);

export default router;
