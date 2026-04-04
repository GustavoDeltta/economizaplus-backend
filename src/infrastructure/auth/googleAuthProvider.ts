import { OAuth2Client } from "google-auth-library";
import { InterfaceGoogleAuthProvider, GooglePayload } from "../../domain/repositories/InterfaceGoogleAuthProvider";
import { UnauthorizedError } from "../../shared/errors/api-erros";

export class GoogleAuthProvider implements InterfaceGoogleAuthProvider {
  private client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  async verifyToken(idToken: string): Promise<GooglePayload> {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.name) {
      throw new UnauthorizedError("Token do Google inválido");
    }

    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  }
}