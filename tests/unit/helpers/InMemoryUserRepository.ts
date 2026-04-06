import { User } from '../../../src/domain/entities/User';
import { InterfaceUserRepository } from '../../../src/domain/repositories/InterfaceUserRepository';

export class InMemoryUserRepository implements InterfaceUserRepository {
  public users: User[] = [];

  async create(user: User): Promise<User> {
    this.users.push(user);
    return user;
  }

  async getProfile(userId: string): Promise<User | null> {
    return this.users.find((u) => u.id === userId) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email === email) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) ?? null;
  }

  async findAll(): Promise<User[]> {
    return this.users;
  }

  async update(id: string, name: string, email: string): Promise<User> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('Usuário não encontrado no repositório em memória');
    this.users[index] = { ...this.users[index], name, email };
    return this.users[index];
  }

  async delete(id: string): Promise<User> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('Usuário não encontrado no repositório em memória');
    const [removed] = this.users.splice(index, 1);
    return removed;
  }
}
