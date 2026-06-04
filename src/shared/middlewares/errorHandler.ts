import type { ErrorRequestHandler } from 'express';
import { AppError } from '../errors/AppError';
import { ApiErrors } from '../errors/api-erros';
import { resetPrismaClient } from '../../infrastructure/prisma/client';

function isDbConnectionError(err: any): boolean {
  return (
    err?.cause?.code === 'XX000' ||
    err?.code === 'P1001' ||
    err?.message?.includes('ENOTFOUND') ||
    err?.message?.includes('tenant/user') ||
    err?.message?.includes('Connection refused')
  );
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  if (err instanceof ApiErrors) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  if (isDbConnectionError(err)) {
    resetPrismaClient();
    res.status(503).json({
      status: 'error',
      message: 'Serviço temporariamente indisponível. Tente novamente.',
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};
