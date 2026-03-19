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
      
      process.env.JWT_PASS!,
      { expiresIn: '8h' }
    );
  }

  async verifyToken(token: string) {
    return jwt.verify(token, process.env.JWT_PASS!) as TokenPayload;
  }

}