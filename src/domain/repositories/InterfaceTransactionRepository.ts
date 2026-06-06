import { Transaction } from "../entities/Transaction";

export interface InterfaceTransactionRepository {
    create(transaction: Transaction, tx?: any): Promise<Transaction>;
    findById(id: string): Promise<Transaction | null>;
    findByUserId(userId: string): Promise<Transaction[]>;
    findByWalletId(walletId: string): Promise<Transaction[]>;
    delete(id: string, tx?: any): Promise<Transaction | null>;
    findAll(): Promise<Transaction[]>;
    createMany(transactions: Transaction[], tx?: any): Promise<void>;
}
