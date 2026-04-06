import { Wallet } from "../../../domain/entities/Wallet";
import { IWalletRepository } from "../../../domain/repositories/IWalletRepository";
import { prisma } from "../client";
import { Decimal } from "@prisma/client/runtime/client";
import { WalletType } from "../generated/prisma/enums";

export class WalletRepository implements IWalletRepository {
    private getPrisma(tx?: any) {
        return tx || prisma;
    }

    async create(wallet: Wallet): Promise<Wallet> {
        const data = await prisma.wallet.create({
            data: {
                name: wallet.name,
                type: wallet.type as WalletType,
                balance: wallet.balance,
                userId: wallet.userId
            }
        });
        return new Wallet(data.id, data.userId, data.name, data.type, data.balance, data.createdAt);
    }

    async findById(id: string): Promise<Wallet | null> {
        const data = await prisma.wallet.findUnique({ where: { id } });
        if (!data) return null;
        return new Wallet(data.id, data.userId, data.name, data.type, data.balance, data.createdAt);
    }

    async findByUserId(userId: string): Promise<Wallet[]> {
        const data = await prisma.wallet.findMany({ where: { userId } });
        return data.map(w => new Wallet(w.id, w.userId, w.name, w.type, w.balance, w.createdAt));
    }

    async updateBalance(id: string, newBalance: Decimal, tx?: any): Promise<Wallet> {
        const client = this.getPrisma(tx);
        const data = await client.wallet.update({
            where: { id },
            data: { balance: newBalance }
        });
        return new Wallet(data.id, data.userId, data.name, data.type, data.balance, data.createdAt);
    }

    async delete(id: string): Promise<Wallet | null> {
        const data = await prisma.wallet.delete({ where: { id } });
        if (!data) return null;
        return new Wallet(data.id, data.userId, data.name, data.type, data.balance, data.createdAt);
    }
}
