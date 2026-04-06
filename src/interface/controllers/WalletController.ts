import { Request, Response } from "express";
import { WalletService } from "../../application/services/WalletService";

export class WalletController {
    constructor(private walletService: WalletService) {}

    async create(req: Request, res: Response) {
        const userId = req.user as string;
        const wallet = await this.walletService.createWallet(userId, req.body);
        return res.status(201).json(wallet);
    }

    async getAll(req: Request, res: Response) {
        const userId = req.user as string;
        const wallets = await this.walletService.getWalletsByUserId(userId);
        return res.json(wallets);
    }

    async getById(req: Request, res: Response) {
        const userId = req.user as string;
        const { id } = req.params as { id: string };
        const wallet = await this.walletService.getWalletById(userId, id);
        return res.json(wallet);
    }

    async delete(req: Request, res: Response) {
        const userId = req.user as string;
        const { id } = req.params as { id: string };
        await this.walletService.deleteWallet(userId, id);
        return res.status(204).send();
    }
}
