import { env } from '../../shared/env';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';

type TokenPayload = {
  id: string;
  role: string;
}

export class JwtService {
  async generateToken(payload: TokenPayload): Promise<string> {
    const options: jwt.SignOptions = {
      expiresIn: env.JWT_EXPIRES_IN as any
    };

    return jwt.sign(
      {
        ...payload,
        jti: randomUUID()
      },
      env.JWT_SECRET,
      options
    );
  }

  async verifyToken(token: string) {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  }

}