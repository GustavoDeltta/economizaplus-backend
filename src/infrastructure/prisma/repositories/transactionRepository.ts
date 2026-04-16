import { Transaction } from "../../../domain/entities/Transaction";
import { InterfaceTransactionRepository } from "../../../domain/repositories/InterfaceTransactionRepository";
import { prisma } from "../client";
import { TransactionType, PaymentMethod } from "../generated/prisma/client";

export class TransactionRepository implements InterfaceTransactionRepository {
    private getPrisma(tx?: any) {
        return tx || prisma;
    }

    async create(transaction: Transaction, tx?: any): Promise<Transaction> {
        const client = this.getPrisma(tx);
        const data = await client.transaction.create({
            data: {
                userId: transaction.userId,
                walletId: transaction.walletId,
                type: transaction.type as TransactionType,
                paymentMethod: transaction.paymentMethod as PaymentMethod,
                amount: transaction.amount,
                transactionDate: transaction.transactionDate,
                categoryId: transaction.categoryId,
                goal_id: transaction.goal_id,
                cardId: transaction.cardId,
                description: transaction.description,
                isInstallment: transaction.isInstallment,
                installmentNumber: transaction.installmentNumber,
                totalInstallments: transaction.totalInstallments,
                parentTransactionId: transaction.parentTransactionId
            }
        });
        return this.toEntity(data);
    }

    async createMany(transactions: Transaction[], tx?: any): Promise<void> {
        const client = this.getPrisma(tx);
        await client.transaction.createMany({
            data: transactions.map(t => ({
                userId: t.userId,
                walletId: t.walletId,
                type: t.type as TransactionType,
                paymentMethod: t.paymentMethod as PaymentMethod,
                amount: t.amount,
                transactionDate: t.transactionDate,
                categoryId: t.categoryId,
                goal_id: t.goal_id,
                cardId: t.cardId,
                description: t.description,
                isInstallment: t.isInstallment,
                installmentNumber: t.installmentNumber,
                totalInstallments: t.totalInstallments,
                parentTransactionId: t.parentTransactionId
            }))
        });
    }

    async findById(id: string): Promise<Transaction | null> {
        const data = await prisma.transaction.findUnique({ where: { id } });
        if (!data) return null;
        return this.toEntity(data);
    }

    async findByUserId(userId: string): Promise<Transaction[]> {
        const data = await prisma.transaction.findMany({ where: { userId } });
        return data.map(t => this.toEntity(t));
    }

    async findByWalletId(walletId: string): Promise<Transaction[]> {
        const data = await prisma.transaction.findMany({ where: { walletId } });
        return data.map(t => this.toEntity(t));
    }

    async delete(id: string, tx?: any): Promise<Transaction | null> {
        const client = this.getPrisma(tx);
        const data = await client.transaction.delete({ where: { id } });
        if (!data) return null;
        return this.toEntity(data);
    }

    private toEntity(data: any): Transaction {
        return new Transaction(
            data.id,
            data.userId,
            data.walletId,
            data.type,
            data.paymentMethod,
            data.amount,
            data.transactionDate,
            data.categoryId,
            data.goal_id,
            data.cardId,
            data.description,
            data.isInstallment,
            data.installmentNumber,
            data.totalInstallments,
            data.parentTransactionId,
            data.createdAt
        );
    }
}
