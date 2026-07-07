import { Request, Response, NextFunction } from 'express';
import { query } from '../db/connection';
import crypto from 'crypto';

export const pageViewLogger = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ipHash = crypto
      .createHash('sha256')
      .update(req.ip || '')
      .digest('hex');

    const userId = (req as any).user?.id || null;

    await query(
      `INSERT INTO page_view_logs (url, user_id, user_agent, ip_hash)
       VALUES ($1, $2, $3, $4)`,
      [req.originalUrl, userId, req.get('user-agent'), ipHash]
    );
  } catch (error) {
    console.error('Error logging page view:', error);
  }

  next();
};
