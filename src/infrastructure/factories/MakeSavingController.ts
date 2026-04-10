import { SavingRepository } from "../prisma/repositories/SavingRepository";
import { GoalRepository } from "../prisma/repositories/goalRepository";
import { WalletRepository } from "../prisma/repositories/walletRepository";
import { TransactionRepository } from "../prisma/repositories/transactionRepository";
import { SavingService } from "../../application/services/SavingService";
import { SavingController } from "../../interface/controllers/SavingController";

export function makeSavingController() {
    const savingRepository = new SavingRepository();
    const goalRepository = new GoalRepository();
    const walletRepository = new WalletRepository();
    const transactionRepository = new TransactionRepository();
    const service = new SavingService(
        savingRepository,
        goalRepository,
        walletRepository,
        transactionRepository
    );
    const controller = new SavingController(service);
    return controller;
}
