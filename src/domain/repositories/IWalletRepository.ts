import { Wallet } from "../entities/Wallet";
import { Decimal } from "@prisma/client/runtime/client";

export interface IWalletRepository {
    create(wallet: Wallet): Promise<Wallet>;
    findById(id: string): Promise<Wallet | null>;
    findByUserId(userId: string): Promise<Wallet[]>;
    updateBalance(id: string, newBalance: Decimal, tx?: any): Promise<Wallet>;
    delete(id: string): Promise<Wallet | null>;
}
