import { Request, Response } from 'express';
import { UserService } from '../../application/services/UserService';

export class UserController {
  constructor(private userService: UserService) {}
  async create(req: Request, res: Response) {
    const { name, email, password, role } = req.body;
    
    const user = await this.userService.createUser(name, email, password, role);

    return res.status(201).json({ user });
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

  async delete(req: Request, res: Response) {
    const userId = req.user;
    const deletedUser = await this.userService.deleteUser(userId);
    
    return res.json(deletedUser); 
  }
}