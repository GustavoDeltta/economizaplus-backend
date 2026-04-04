import { GoogleLoginService } from "../../application/services/GoogleLoginService";
import { GoogleAuthProvider } from "../auth/googleAuthProvider";
import { GoogleLoginController } from "../../interface/controllers/GoogleLoginController";
import { userRepository } from "../prisma/repositories/userRepository";
import { JwtService } from "../auth/jwt";
import { PasswordHasher } from "../auth/hash";

export function makeGoogleLoginController(): GoogleLoginController {
  const UserRepository = new userRepository();
  const googleAuthProvider = new GoogleAuthProvider();
  const jwtService = new JwtService();
  const passwordHasher = new PasswordHasher();
  const service = new GoogleLoginService(UserRepository, googleAuthProvider, jwtService, passwordHasher);
  return new GoogleLoginController(service);
}