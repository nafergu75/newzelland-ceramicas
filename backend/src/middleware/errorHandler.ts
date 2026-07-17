import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('❌ ERROR CAPTURADO:', {
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    statusCode: err.status || err.statusCode || 500,
    message: err.message,
    code: err.code,
    detail: err.detail,
    constraint: err.constraint,
    stack: err.stack,
  });

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    message: message,
    code: err.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err.detail,
    }),
  });
};

export default errorHandler;
