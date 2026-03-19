import { UserController } from "../../interface/controllers/UserController";
import { UserService } from "../../application/services/UserService";
import { userRepository } from "../prisma/repositories/userRepository";
import { PasswordHasher } from "../auth/hash";

export function makeUserController() {
  const repository = new userRepository();
  const hasher = new PasswordHasher();
  const service = new UserService(repository, hasher);
  const controller = new UserController(service);

  return controller;
}