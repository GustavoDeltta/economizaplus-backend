import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { UserPayload } from '../../modules/users/users.types.js';
import { AppError } from '../errors/AppError.js';

declare module 'express-serve-static-core' {
  interface Request {
    user?: UserPayload;
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Token não fornecido', 401);
  }

  const token = authHeader.slice(7);

  if (!token) {
    throw new AppError('Token não fornecido', 401);
  }

  const secret = process.env['JWT_SECRET'];
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  try {
    const payload = jwt.verify(token, secret) as UserPayload;
    req.user = payload;
    next();
  } catch {
    throw new AppError('Token inválido ou expirado', 401);
  }
}
