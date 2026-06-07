import { Request, Response } from 'express';
import { AdminService, AdminUpdateUserDTO } from '../../application/services/AdminService';

export class AdminController {
  constructor(private adminService: AdminService) {}

  async getStats(req: Request, res: Response) {
    const stats = await this.adminService.getStats();
    return res.json(stats);
  }

  async getAllUsers(req: Request, res: Response) {
    const users = await this.adminService.getAllUsers();
    return res.json(users);
  }

  async getUserById(req: Request, res: Response) {
    const id = req.params.id as string;
    const user = await this.adminService.getUserById(id);
    return res.json(user);
  }

  async updateUser(req: Request, res: Response) {
    const id = req.params.id as string;
    const dto: AdminUpdateUserDTO = req.body;
    const updated = await this.adminService.updateUser(id, dto);
    return res.json(updated);
  }

  async deleteUser(req: Request, res: Response) {
    const id = req.params.id as string;
    await this.adminService.deleteUser(id);
    return res.status(204).send();
  }
}