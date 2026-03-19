import { prisma } from '../client';
import { InterfaceUserRepository } from '../../../domain/repositories/InterfaceUserRepository';
import { User } from '../../../domain/entities/User';

export class userRepository implements InterfaceUserRepository {

  async create(user: User): Promise<User> {
    const data = await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: user.password
      }
    });

    return new User(
      data.id,
      data.name,
      data.email,
      data.passwordHash,
      data.role
    );
  }

  async getProfile(userId: string): Promise<User | null> {
    const data = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!data) return null;

    return new User(
      data.id,
      data.name,
      data.email,
      data.passwordHash,
      data.role
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const data = await prisma.user.findUnique({
      where: { email }
    });

    if (!data) return null;

    return new User(
      data.id,
      data.name,
      data.email,
      data.passwordHash,
      data.role
    );
  }

  async findById(id: string): Promise<User | null> {
    const data = await prisma.user.findUnique({
      where: { id }
    });

    if (!data) return null;

    return new User(
      data.id,
      data.name,
      data.email,
      data.passwordHash,
      data.role
    );
  }

  async findAll(): Promise<User[]> {
    const data = await prisma.user.findMany();

    console.log(data);

    return data.map(user => new User(
      user.id,
      user.name,
      user.email,
      user.passwordHash,
      user.role
    ));
  }

  async update(id: string, name: string, email: string): Promise<User> {
    const data = await prisma.user.update({
      where: { id },
      data: { name, email }
    });
    
    return new User(
      data.id,
      data.name,
      data.email,
      data.passwordHash,
      data.role
    );
  }

  async delete(id: string): Promise<User>{
    const data = await prisma.user.delete({
      where: { id }
    });

    return new User(
      data.id,
      data.name,
      data.email,
      data.passwordHash,
      data.role
    );
  }
}