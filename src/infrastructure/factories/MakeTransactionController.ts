import { TransactionRepository } from "../prisma/repositories/transactionRepository";
import { WalletRepository } from "../prisma/repositories/walletRepository";
import { CardRepository } from "../prisma/repositories/cardRepository";
import { TransactionService } from "../../application/services/TransactionService";
import { TransactionController } from "../../interface/controllers/TransactionController";

export function makeTransactionController() {
    const transactionRepository = new TransactionRepository();
    const walletRepository = new WalletRepository();
    const cardRepository = new CardRepository();
    const service = new TransactionService(transactionRepository, walletRepository, cardRepository);
    const controller = new TransactionController(service);
    return controller;
}
