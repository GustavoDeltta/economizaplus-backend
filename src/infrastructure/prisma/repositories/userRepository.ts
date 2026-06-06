import { prisma } from '../client';
import { InterfaceUserRepository } from '../../../domain/repositories/InterfaceUserRepository';
import { User } from '../../../domain/entities/User';
 
export class userRepository implements InterfaceUserRepository {
 
  private toEntity(data: any): User {
    return new User(
      data.id,
      data.name,
      data.email,
      data.passwordHash,
      data.role,
      data.authProvider,
      data.passwordResetCode,
      data.passwordResetExpiresAt,
      data.plan      ?? 'BASIC',    
      data.createdAt ?? new Date(), 
    );
  }
 
  async create(user: User): Promise<User> {
    const data = await prisma.user.create({
      data: {
        id:           user.id,
        name:         user.name,
        email:        user.email,
        passwordHash: user.password,
        role:         user.role as any,
        authProvider: user.authProvider as any,
      },
    });
    return this.toEntity(data);
  }
 
  async getProfile(userId: string): Promise<User | null> {
    const data = await prisma.user.findUnique({ where: { id: userId } });
    if (!data) return null;
    return this.toEntity(data);
  }
 
  async findByEmail(email: string): Promise<User | null> {
    const data = await prisma.user.findUnique({ where: { email } });
    if (!data) return null;
    return this.toEntity(data);
  }
 
  async findById(id: string): Promise<User | null> {
    const data = await prisma.user.findUnique({ where: { id } });
    if (!data) return null;
    return this.toEntity(data);
  }
 
  async findAll(): Promise<User[]> {
    const data = await prisma.user.findMany();
    return data.map(u => this.toEntity(u));
  }
 
  async update(id: string, name: string, email: string): Promise<User> {
    const data = await prisma.user.update({ where: { id }, data: { name, email } });
    return this.toEntity(data);
  }
 
  async updateResetCode(userId: string, codeHash: string | null, expiresAt: Date | null): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data:  { passwordResetCode: codeHash, passwordResetExpiresAt: expiresAt },
    });
  }
 
  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data:  { passwordHash, passwordResetCode: null, passwordResetExpiresAt: null },
    });
  }
 
  async delete(id: string): Promise<User> {
    const data = await prisma.user.delete({ where: { id } });
    return this.toEntity(data);
  }
}