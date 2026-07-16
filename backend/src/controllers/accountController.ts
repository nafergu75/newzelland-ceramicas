import { Response, NextFunction } from 'express';
import { AuthRequest } from '../models/types';
import { getUserById } from '../services/userService';

export const getAccountSummary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      totalFacturado: 0,
      totalPedidos: 0,
      pedidosEsteAño: 0,
      miembroDesde: user.createdAt,
      enviosPendientes: 0,
    });
  } catch (error) {
    next(error);
  }
};
