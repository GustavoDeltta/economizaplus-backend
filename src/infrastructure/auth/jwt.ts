import { env } from '../../shared/env';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';

type TokenPayload = {
  id: string;
  role: string;
}

export class JwtService {
  async generateToken(payload: TokenPayload): Promise<string> {
    return jwt.sign(
      {
        ...payload,
        jti: randomUUID()
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );
  }

  async verifyToken(token: string) {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  }

}