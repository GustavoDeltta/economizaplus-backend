import { User } from '../entities/User';

export interface InterfaceUserRepository {
  create(user: User): Promise<User>;
  getProfile(userId: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(id: string, name: string, email: string): Promise<User>;
  delete(id: string): Promise<User>;
}