import { Request, Response } from "express";
import { TransactionService } from "../../application/services/TransactionService";

export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  async create(req: Request, res: Response) {
    const userId = req.user as string;
    const transaction = await this.transactionService.createTransaction(
      userId,
      req.body,
    );
    return res.status(201).json(transaction);
  }

  async getAll(req: Request, res: Response) {
    const userId = req.user as string;
    const transactions =
      await this.transactionService.getTransactionsByUserId(userId);
    return res.json(transactions);
  }

  async delete(req: Request, res: Response) {
    const userId = req.user as string;
    const { id } = req.params as { id: string };
    await this.transactionService.deleteTransaction(userId, id);
    return res.status(204).send();
  }
}
