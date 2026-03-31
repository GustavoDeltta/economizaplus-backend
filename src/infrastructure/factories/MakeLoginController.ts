import { LoginService } from "../../application/services/LoginService";
import { LoginController } from "../../interface/controllers/LoginController";
import { JwtService } from "../auth/jwt";
import { userRepository } from "../prisma/repositories/userRepository";

export function makeLoginController() {
  const repository = new userRepository();
  const jwtService = new JwtService();
  const service = new LoginService(repository, jwtService);
  const controller = new LoginController(service);

  return controller;
}