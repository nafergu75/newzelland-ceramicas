import { Response, NextFunction } from 'express';
import { AuthRequest } from '../models/types';
import { getVisitStats, getDownloadStats, getOrderStats, getTotalStats } from '../services/analyticsService';
import { updateOrderStatus } from '../services/orderService';

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
