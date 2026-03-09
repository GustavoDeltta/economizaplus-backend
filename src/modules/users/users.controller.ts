import type { Request, Response } from 'express';
import { register, login } from './users.service.js';

export async function registerHandler(req: Request, res: Response): Promise<void> {
  const { name, email, password } = req.body as {
    name: string;
    email: string;
    password: string;
  };

  const result = await register({ name, email, password });

  res.status(201).json(result);
}

export async function loginHandler(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as {
    email: string;
    password: string;
  };

  const result = await login({ email, password });

  res.status(200).json(result);
}
