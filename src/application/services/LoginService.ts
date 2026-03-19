import bcrypt from "bcrypt";
import { BadRequestError } from "../../helpers/api-erros";
import { InterfaceUserRepository } from "../../domain/repositories/InterfaceUserRepository";
import { JwtService } from "../../infrastructure/auth/jwt";

export class LoginService {
  constructor(
    private userRepository: InterfaceUserRepository,
    private jwtService: JwtService
  ) {}
  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new BadRequestError("Invalid credentials");
    };

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new BadRequestError("Invalid credentials");
    };

    const token = await this.jwtService.generateToken
    ({
      id: user.id,
      role: user.role
    });

    return {token, user: user.name};
  }

  // async logout() {
    
  // }
}