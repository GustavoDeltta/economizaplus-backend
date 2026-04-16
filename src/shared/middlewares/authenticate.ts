import { env } from '../env';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../errors/AppError';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Token não fornecido', 401);
  }

  const token = authHeader.slice(7);

  if (!token) {
    throw new AppError('Token não fornecido', 401);
  }

  const secret = env.JWT_SECRET;

  try {
    const payload = jwt.verify(token, secret) as { id: string; email: string; role: string };
    req.user = payload.id;
    next();
  } catch {
    throw new AppError('Token inválido ou expirado', 401);
  }
}
