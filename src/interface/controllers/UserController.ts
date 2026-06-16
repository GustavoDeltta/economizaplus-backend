import { Request, Response } from 'express';
import { UserService } from '../../application/services/UserService';
import { JwtService } from '../../infrastructure/auth/jwt';

export class UserController {
  constructor(private userService: UserService, private jwtService: JwtService) {}
  async create(req: Request, res: Response) {
    const { name, email, password, role } = req.body;
    
    const user = await this.userService.createUser(name, email, password, role);

    const token = await this.jwtService.generateToken({
      id: user.id,
      role: user.role
    });

    return res.status(201).json({ user, token });
  }
  
  async getAll(req: Request, res: Response) {
    const users = await this.userService.getAllUsers();

    return res.json(users);
  }

  async getProfile(req: Request, res: Response) {
    const userId = req.user;
    const profile = await this.userService.getProfile(userId);

    return res.json(profile);
  }

  async update(req: Request, res: Response) {
    const userId = req.user;
    const { name, email } = req.body;
    const updatedUser = await this.userService.updateUser(userId, name, email);

    return res.json(updatedUser);
  }

  async updatePlan(req: Request, res: Response) {
    const userId = req.user;
    const { plan } = req.body;
    await this.userService.updatePlan(userId, plan);
    return res.json({ message: "Plano atualizado com sucesso" });
  }

  async delete(req: Request, res: Response) {
    const userId = req.user;
    const deletedUser = await this.userService.deleteUser(userId);

    return res.json(deletedUser);
  }
}