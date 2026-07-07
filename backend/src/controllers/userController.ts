import { Response, NextFunction } from 'express';
import { AuthRequest } from '../models/types';
import { query } from '../db/connection';

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await query(
      `SELECT id, name, email, phone, nif, province, email_verified, billing_address, shipping_address, created_at FROM users WHERE id = $1`,
      [req.user!.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone, nif, billingAddress, shippingAddress } = req.body;

    const result = await query(
      `UPDATE users 
       SET phone = COALESCE($1, phone),
           nif = COALESCE($2, nif),
           billing_address = COALESCE($3, billing_address),
           shipping_address = COALESCE($4, shipping_address),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, name, email, phone, nif, province, email_verified, billing_address, shipping_address`,
      [
        phone || null,
        nif || null,
        billingAddress ? JSON.stringify(billingAddress) : null,
        shippingAddress ? JSON.stringify(shippingAddress) : null,
        req.user!.userId,
      ]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [req.user!.userId, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM orders WHERE user_id = $1`,
      [req.user!.userId]
    );

    return res.json({
      orders: result.rows,
      total: parseInt(countResult.rows[0].total),
    });
  } catch (error) {
    next(error);
  }
};
