import { Router } from 'express';
import {
  register,
  verifyEmail,
  login,
  logout,
} from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.get('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);

export default router;
