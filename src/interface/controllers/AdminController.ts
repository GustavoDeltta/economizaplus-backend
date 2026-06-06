import { Request, Response } from 'express';
import { AdminService } from '../../application/services/AdminService';

export class AdminController {
  constructor(private adminService: AdminService) {}

  async getStats(req: Request, res: Response) {
    const stats = await this.adminService.getStats();
    return res.json(stats);
  }
}