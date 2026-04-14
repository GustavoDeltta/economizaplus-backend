import { UserController } from "../../interface/controllers/UserController";
import { UserService } from "../../application/services/UserService";
import { userRepository } from "../prisma/repositories/userRepository";
import { PasswordHasher } from "../auth/hash";
import { JwtService } from "../auth/jwt";

export function makeUserController() {
  const repository = new userRepository();
  const hasher = new PasswordHasher();
  const jwtService = new JwtService();
  const service = new UserService(repository, hasher);
  const controller = new UserController(service, jwtService);

  return controller;
}