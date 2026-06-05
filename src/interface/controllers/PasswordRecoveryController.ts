import { Request, Response } from "express";
import { ForgotPasswordService } from "../../application/services/ForgotPasswordService";
import { ResetPasswordService } from "../../application/services/ResetPasswordService";

export class PasswordRecoveryController {
  constructor(
    private readonly forgotPasswordService: ForgotPasswordService,
    private readonly resetPasswordService: ResetPasswordService
  ) {}

  async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;

    await this.forgotPasswordService.execute(email);

    return res.status(200).json({ 
      message: "Se o e-mail estiver cadastrado, um código de recuperação será enviado." 
    });
  }

  async resetPassword(req: Request, res: Response) {
    const { email, code, newPassword } = req.body;

    await this.resetPasswordService.execute(email, code, newPassword);

    return res.status(200).json({ 
      message: "Senha alterada com sucesso!" 
    });
  }
}
