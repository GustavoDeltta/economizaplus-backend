import { randomUUID } from "crypto";
import { InterfaceUserRepository } from "../../domain/repositories/InterfaceUserRepository";
import { InterfaceGoogleAuthProvider } from "../../domain/repositories/InterfaceGoogleAuthProvider";
import { JwtService } from "../../infrastructure/auth/jwt";
import { PasswordHasher } from "../../infrastructure/auth/hash";
import { User } from "../../domain/entities/User";
import { AuthResponseDTO } from "../DTO/AuthResponseDTO";

export class GoogleLoginService {
  constructor(
    private readonly userRepository: InterfaceUserRepository,
    private readonly googleAuthProvider: InterfaceGoogleAuthProvider,
    private readonly jwtService: JwtService,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async login(idToken: string): Promise<AuthResponseDTO> {
    const googlePayload = await this.googleAuthProvider.verifyToken(idToken);

    let user = await this.userRepository.findByEmail(googlePayload.email);

    if (!user) {
      
      const randomPassword = await this.passwordHasher.hash(randomUUID());

      user = await this.userRepository.create(
        new User(
          randomUUID(),
          googlePayload.name,
          googlePayload.email,
          randomPassword,
          "COMMON",
          "GOOGLE"
        )
      );
    }

    const token = await this.jwtService.generateToken({ id: user.id, role: user.role });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        createdAt: user.createdAt,
      },
    };
  }
}