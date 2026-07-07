import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.details,
    });
  }

  if (err.code === '23505') {
    return res.status(409).json({
      error: 'Resource already exists',
    });
  }

  return res.status(500).json({
    error: 'Internal server error',
  });
};
