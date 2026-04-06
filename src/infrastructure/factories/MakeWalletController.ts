import { WalletRepository } from "../prisma/repositories/walletRepository";
import { WalletService } from "../../application/services/WalletService";
import { WalletController } from "../../interface/controllers/WalletController";

export function makeWalletController() {
    const repository = new WalletRepository();
    const service = new WalletService(repository);
    const controller = new WalletController(service);
    return controller;
}
