import { InterfaceUserRepository } from "../../domain/repositories/InterfaceUserRepository";
import { PasswordHasher } from "../../infrastructure/auth/hash";
import { BadRequestError } from "../../shared/errors/api-erros";

export class ResetPasswordService {
  constructor(
    private readonly userRepository: InterfaceUserRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(email: string, code: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    if (!user || !user.passwordResetCode || !user.passwordResetExpiresAt) {
      throw new BadRequestError("Código inválido ou expirado.");
    }

    // Verificar se o código expirou
    if (new Date() > user.passwordResetExpiresAt) {
      throw new BadRequestError("O código de recuperação expirou.");
    }

    // Verificar se o código bate
    const isCodeValid = await this.passwordHasher.compare(code, user.passwordResetCode);

    if (!isCodeValid) {
      throw new BadRequestError("Código inválido.");
    }

    // Hash da nova senha
    const newPasswordHash = await this.passwordHasher.hash(newPassword);

    // Atualizar senha e limpar campos de reset
    await this.userRepository.updatePassword(user.id, newPasswordHash);
  }
}
