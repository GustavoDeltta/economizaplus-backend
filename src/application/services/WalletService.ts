import { IWalletRepository } from "../../domain/repositories/IWalletRepository";
import { Wallet } from "../../domain/entities/Wallet";
import { CreateWalletDTO, WalletResponseDTO } from "../DTO/WalletDTO";
import { Decimal } from "@prisma/client/runtime/client";
import { BadRequestError } from "../../shared/errors/api-erros";

export class WalletService {
    constructor(private walletRepository: IWalletRepository) {}

    async createWallet(userId: string, dto: CreateWalletDTO): Promise<WalletResponseDTO> {
        const wallet = new Wallet(null, userId, dto.name, dto.type, new Decimal(dto.balance || 0));
        const created = await this.walletRepository.create(wallet);
        return this.toDTO(created);
    }

    async getWalletsByUserId(userId: string): Promise<WalletResponseDTO[]> {
        const wallets = await this.walletRepository.findByUserId(userId);
        return wallets.map(this.toDTO);
    }

    async getWalletById(userId: string, id: string): Promise<WalletResponseDTO> {
        const wallet = await this.walletRepository.findById(id);
        if (!wallet || wallet.userId !== userId) {
            throw new BadRequestError("Carteira não encontrada.");
        }
        return this.toDTO(wallet);
    }

    async deleteWallet(userId: string, id: string): Promise<void> {
        const wallet = await this.walletRepository.findById(id);
        if (!wallet || wallet.userId !== userId) {
            throw new BadRequestError("Carteira não encontrada.");
        }
        await this.walletRepository.delete(id);
    }

    private toDTO(wallet: Wallet): WalletResponseDTO {
        return {
            id: wallet.id!,
            name: wallet.name,
            type: wallet.type,
            balance: Number(wallet.balance),
            createdAt: wallet.createdAt!
        };
    }
}
