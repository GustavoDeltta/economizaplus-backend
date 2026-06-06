import { AdminController } from '../../interface/controllers/AdminController';
import { AdminService } from '../../application/services/AdminService';
import { userRepository } from '../prisma/repositories/userRepository';
import { TransactionRepository } from '../prisma/repositories/transactionRepository';

export function makeAdminController(): AdminController {
  const userRepo        = new userRepository();
  const transactionRepo = new TransactionRepository();
  const adminService    = new AdminService(userRepo, transactionRepo);
  return new AdminController(adminService);
}