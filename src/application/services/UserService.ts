import { InterfaceUserRepository } from '../../domain/repositories/InterfaceUserRepository';
import { User } from '../../domain/entities/User';
import { BadRequestError, NotFoundError } from '../..//helpers/api-erros';
import { randomUUID } from 'crypto';
import { PasswordHasher } from '../../infrastructure/auth/hash';
import { UserResponseDTO } from '../DTO/UserResponseDTO';

export class UserService {
  constructor(private userRepository: InterfaceUserRepository, private passwordHasher: PasswordHasher) {}

  async createUser(name: string, email: string, password: string, role: string) {
    const exists = await this.userRepository.findByEmail(email);

    if (exists) {
      throw new BadRequestError("Usuário já existe");
    }

    const hashedPassword = await this.passwordHasher.hash(password);

    const user = new User(randomUUID(), name, email, hashedPassword, role);

    return this.userRepository.create(user);
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
  }


  async getUserById(id: string) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }

    return user;
  }

  async getAllUsers(): Promise<UserResponseDTO[]> {
  const users = await this.userRepository.findAll();

  return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email
    }));
  }

  async updateUser(id: string, name: string, email: string): Promise<UserResponseDTO> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }

    const updatedUser = await this.userRepository.update(id, name, email);

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email
    };
  }

  async deleteUser(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }
    const deletedUser = await this.userRepository.delete(id);

    return {
      id: deletedUser.id,
      name: deletedUser.name,
      email: deletedUser.email,
      password: deletedUser.password,
      role: deletedUser.role
    };
  }
}