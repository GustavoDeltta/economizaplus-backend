import { InterfaceUserRepository } from "../../domain/repositories/InterfaceUserRepository";
import { InterfaceMailProvider } from "../../domain/repositories/InterfaceMailProvider";
import { PasswordHasher } from "../../infrastructure/auth/hash";
import { BadRequestError } from "../../shared/errors/api-erros";

export class ForgotPasswordService {
  constructor(
    private readonly userRepository: InterfaceUserRepository,
    private readonly mailProvider: InterfaceMailProvider,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      // Por segurança, não revelamos se o e-mail existe ou não
      return;
    }

    if (user.authProvider === 'GOOGLE') {
      throw new BadRequestError("Este usuário utiliza login via Google. Por favor, recupere sua senha através do Google.");
    }

    // Gerar código de 6 dígitos
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash do código para segurança no banco
    const resetCodeHash = await this.passwordHasher.hash(resetCode);
    
    // Expiração em 15 minutos
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await this.userRepository.updateResetCode(user.id, resetCodeHash, expiresAt);

    // Enviar e-mail
    await this.mailProvider.sendMail(
      email,
      "Recuperação de Senha - Economiza+",
      `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4f46e5;">Economiza+</h1>
        <p>Olá, ${user.name}!</p>
        <p>Você solicitou a recuperação de sua senha. Use o código abaixo para prosseguir:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937; border-radius: 8px;">
          ${resetCode}
        </div>
        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">Este código expira em 15 minutos.</p>
        <p>Se você não solicitou isso, ignore este e-mail.</p>
      </div>
      `
    );
  }
}
