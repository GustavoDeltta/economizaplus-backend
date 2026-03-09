import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../../shared/errors/AppError.js';
import { findUserByEmail, createUser } from './users.repository.js';
import type { RegisterDTO, LoginDTO, AuthResponse } from './users.types.js';

const SALT_ROUNDS = 12;

function generateToken(payload: { id: string; email: string; role: string }): string {
  const secret = process.env['JWT_SECRET'];

  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  const expiresIn = (process.env['JWT_EXPIRES_IN'] ?? '7d') as jwt.SignOptions['expiresIn'];

  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

export async function register(data: RegisterDTO): Promise<AuthResponse> {
  const existing = await findUserByEmail(data.email);

  if (existing) {
    throw new AppError('E-mail já cadastrado', 409);
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await createUser({
    name: data.name,
    email: data.email,
    passwordHash,
  });

  const token = generateToken({ id: user.id, email: user.email, role: user.role });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function login(data: LoginDTO): Promise<AuthResponse> {
  const user = await findUserByEmail(data.email);

  if (!user) {
    throw new AppError('Credenciais inválidas', 401);
  }

  const passwordMatch = await bcrypt.compare(data.password, user.passwordHash);

  if (!passwordMatch) {
    throw new AppError('Credenciais inválidas', 401);
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}
