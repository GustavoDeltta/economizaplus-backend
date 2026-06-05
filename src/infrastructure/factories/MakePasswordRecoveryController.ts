import { ForgotPasswordService } from "../../application/services/ForgotPasswordService";
import { ResetPasswordService } from "../../application/services/ResetPasswordService";
import { PasswordRecoveryController } from "../../interface/controllers/PasswordRecoveryController";
import { PasswordHasher } from "../auth/hash";
import { NodemailerMailProvider } from "../mail/NodemailerMailProvider";
import { userRepository } from "../prisma/repositories/userRepository";

export function makePasswordRecoveryController() {
  const repository = new userRepository();
  const mailProvider = new NodemailerMailProvider();
  const passwordHasher = new PasswordHasher();
  
  const forgotPasswordService = new ForgotPasswordService(
    repository,
    mailProvider,
    passwordHasher
  );
  
  const resetPasswordService = new ResetPasswordService(
    repository,
    passwordHasher
  );
  
  const controller = new PasswordRecoveryController(
    forgotPasswordService,
    resetPasswordService
  );

  return controller;
}
