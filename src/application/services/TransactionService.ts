import { InterfaceTransactionRepository } from "../../domain/repositories/InterfaceTransactionRepository";
import { IWalletRepository } from "../../domain/repositories/IWalletRepository";
import { InterfaceCardRepository } from "../../domain/repositories/InterfaceCardRepository";
import { Transaction } from "../../domain/entities/Transaction";
import { CreateTransactionDTO, TransactionResponseDTO } from "../DTO/TransactionDTO";
import { Decimal } from "@prisma/client/runtime/client";
import { BadRequestError } from "../../shared/errors/api-erros";
import { prisma } from "../../infrastructure/prisma/client";

export class TransactionService {
    constructor(
        private transactionRepository: InterfaceTransactionRepository,
        private walletRepository: IWalletRepository,
        private cardRepository: InterfaceCardRepository
    ) {}

    async createTransaction(userId: string, dto: CreateTransactionDTO): Promise<TransactionResponseDTO> {
        return await prisma.$transaction(async (tx) => {
            const wallet = await this.walletRepository.findById(dto.walletId);
            if (!wallet || wallet.userId !== userId) {
                throw new BadRequestError("Carteira não encontrada.");
            }

            const totalAmount = new Decimal(dto.amount);
            
            // Handle Transfer
            if (dto.type === 'TRANSFER') {
                if (!dto.destinationWalletId) {
                    throw new BadRequestError("ID da carteira de destino é obrigatório para transferências.");
                }
                const destination = await this.walletRepository.findById(dto.destinationWalletId);
                if (!destination) {
                    throw new BadRequestError("Carteira de destino não encontrada.");
                }

                if (wallet.balance.lessThan(totalAmount)) {
                    throw new BadRequestError("Saldo insuficiente para transferência.");
                }

                // Debit source
                await this.walletRepository.updateBalance(wallet.id!, wallet.balance.minus(totalAmount), tx);
                // Credit destination
                await this.walletRepository.updateBalance(destination.id!, destination.balance.add(totalAmount), tx);

                // Create out transaction
                const outTransaction = new Transaction(
                    null, userId, wallet.id!, 'TRANSFER', dto.paymentMethod, totalAmount, dto.transactionDate,
                    dto.categoryId, dto.goal_id, dto.cardId, dto.description || `Transferência para ${destination.name}`
                );
                
                const created = await this.transactionRepository.create(outTransaction, tx);

                // Create in transaction
                const inTransaction = new Transaction(
                    null, destination.userId, destination.id!, 'TRANSFER', dto.paymentMethod, totalAmount, dto.transactionDate,
                    dto.categoryId, dto.goal_id, dto.cardId, dto.description || `Transferência de ${wallet.name}`
                );
                await this.transactionRepository.create(inTransaction, tx);

                return this.toDTO(created);
            }

            // Normal Income/Expense
            let newBalance = new Decimal(wallet.balance);
            if (dto.type === 'INCOME') {
                newBalance = newBalance.add(totalAmount);
            } else if (dto.type === 'EXPENSE') {
                if (dto.paymentMethod !== 'CREDIT_CARD') {
                    if (newBalance.lessThan(totalAmount)) {
                        throw new BadRequestError("Saldo insuficiente.");
                    }
                    newBalance = newBalance.minus(totalAmount);
                } else {
                    // Credit Card: Subtract from card limit
                    if (!dto.cardId) {
                        throw new BadRequestError("ID do cartão é obrigatório para pagamento com cartão de crédito.");
                    }
                    const card = await this.cardRepository.findCard(dto.cardId);
                    if (!card || card.userId !== userId) {
                        throw new BadRequestError("Cartão não encontrado.");
                    }
                    if (card.limitRemaining === null) {
                        throw new BadRequestError("O cartão selecionado não possui limite configurado.");
                    }
                    if (card.limitRemaining.lessThan(totalAmount)) {
                        throw new BadRequestError("Limite insuficiente no cartão.");
                    }
                    
                    await this.cardRepository.updateLimit(card.id!, card.limitRemaining.minus(totalAmount), tx);
                }
            }

            // Update balance (only for non-credit card transactions)
            if (dto.type === 'INCOME' || (dto.type === 'EXPENSE' && dto.paymentMethod !== 'CREDIT_CARD')) {
                await this.walletRepository.updateBalance(wallet.id!, newBalance, tx);
            }

            // Installments
            if (dto.isInstallment && dto.totalInstallments && dto.totalInstallments > 1) {
                const installmentAmount = totalAmount.dividedBy(dto.totalInstallments).toDecimalPlaces(2);
                let firstTransaction: Transaction | null = null;
                const installments: Transaction[] = [];

                for (let i = 1; i <= dto.totalInstallments; i++) {
                    const date = new Date(dto.transactionDate);
                    date.setMonth(date.getMonth() + (i - 1));

                    // Adjust last installment
                    let currentAmount = installmentAmount;
                    if (i === dto.totalInstallments) {
                         const usedTotal = installmentAmount.times(dto.totalInstallments - 1);
                         currentAmount = totalAmount.minus(usedTotal);
                    }

                    const transaction = new Transaction(
                        null, userId, dto.walletId, dto.type, dto.paymentMethod, currentAmount, date,
                        dto.categoryId, dto.goal_id, dto.cardId, dto.description, true, i, dto.totalInstallments
                    );

                    if (i === 1) {
                        firstTransaction = await this.transactionRepository.create(transaction, tx);
                    } else {
                        transaction.parentTransactionId = firstTransaction!.id;
                        installments.push(transaction);
                    }
                }
                
                if (installments.length > 0) {
                    await this.transactionRepository.createMany(installments, tx);
                }
                return this.toDTO(firstTransaction!);
            } else {
                const transaction = new Transaction(
                    null, userId, dto.walletId, dto.type, dto.paymentMethod, totalAmount, dto.transactionDate,
                    dto.categoryId, dto.goal_id, dto.cardId, dto.description
                );
                const created = await this.transactionRepository.create(transaction, tx);
                return this.toDTO(created);
            }
        });
    }

    async getTransactionsByUserId(userId: string): Promise<TransactionResponseDTO[]> {
        const transactions = await this.transactionRepository.findByUserId(userId);
        return transactions.map(t => this.toDTO(t));
    }

    async deleteTransaction(userId: string, transactionId: string): Promise<void> {
        return await prisma.$transaction(async (tx) => {
            const transaction = await this.transactionRepository.findById(transactionId);
            if (!transaction || transaction.userId !== userId) {
                throw new BadRequestError("Transação não encontrada.");
            }

            const wallet = await this.walletRepository.findById(transaction.walletId);
            if (wallet) {
                let newBalance = new Decimal(wallet.balance);
                if (transaction.type === 'INCOME') {
                    newBalance = newBalance.minus(transaction.amount);
                } else if (transaction.type === 'EXPENSE') {
                    if (transaction.paymentMethod !== 'CREDIT_CARD') {
                        newBalance = newBalance.add(transaction.amount);
                    } else if (transaction.cardId) {
                        // Restore credit card limit
                        const card = await this.cardRepository.findCard(transaction.cardId);
                        if (card && card.limitRemaining !== null) {
                            await this.cardRepository.updateLimit(card.id!, card.limitRemaining.add(transaction.amount), tx);
                        }
                    }
                }
                if (transaction.type === 'INCOME' || (transaction.type === 'EXPENSE' && transaction.paymentMethod !== 'CREDIT_CARD')) {
                    await this.walletRepository.updateBalance(wallet.id!, newBalance, tx);
                }
            }
            await this.transactionRepository.delete(transactionId, tx);
        });
    }

    private toDTO(t: Transaction): TransactionResponseDTO {
        return {
            id: t.id!,
            userId: t.userId,
            walletId: t.walletId,
            type: t.type,
            paymentMethod: t.paymentMethod,
            amount: Number(t.amount),
            transactionDate: t.transactionDate,
            description: t.description || null,
            isInstallment: t.isInstallment,
            installmentNumber: t.installmentNumber || null,
            totalInstallments: t.totalInstallments || null,
            parentTransactionId: t.parentTransactionId || null,
            createdAt: t.createdAt || new Date()
        };
    }
}
