import { User } from "../../../domain/entities/User";
import { BadRequestError, UnauthorizedError } from "../../../shared/errors/api-erros";
import { prisma } from "../client";

export class LoginRepository {
  async findByEmail(email: string): Promise<User | null> {
    const data = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!data){
        throw new BadRequestError("E-mail not found");
    }

    return new User(
      data.id,
      data.name,
      data.email,
      data.passwordHash,
      data.role
    );
  }

  async login(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) throw new UnauthorizedError("E-mail not found");

    if (user.password !== password) throw new UnauthorizedError("Invalid password");
    return user;
  }

  
}

