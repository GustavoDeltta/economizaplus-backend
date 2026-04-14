import { Decimal } from "@prisma/client/runtime/client";
import { prisma } from "../../infrastructure/prisma/client";
import { InterfaceSavingRepository } from "../../domain/repositories/InterfaceSavingRepository";
import { InterfaceGoalRepository } from "../../domain/repositories/InterfaceGoalRepository";
import { IWalletRepository } from "../../domain/repositories/IWalletRepository";
import { InterfaceTransactionRepository } from "../../domain/repositories/InterfaceTransactionRepository";
import { Saving } from "../../domain/entities/Saving";
import { Transaction } from "../../domain/entities/Transaction";
import { CreateSavingDTO, SavingResponseDTO, UpdatedGoalResponseDTO } from "../DTO/SavingDTO";
import { ResourceNotFoundError, InsufficientBalanceError } from "../../shared/errors/api-erros";

export class SavingService {
    constructor(
        private savingRepository: InterfaceSavingRepository,
        private goalRepository: InterfaceGoalRepository,
        private walletRepository: IWalletRepository,
        private transactionRepository: InterfaceTransactionRepository
    ) {}

    async createSaving(userId: string, dto: CreateSavingDTO): Promise<UpdatedGoalResponseDTO> {
        return await prisma.$transaction(async (tx) => {
            // Step 1: Validation
            const wallet = await this.walletRepository.findById(dto.walletId);
            if (!wallet || wallet.userId !== userId) {
                throw new ResourceNotFoundError("Carteira não encontrada.");
            }

            const goal = await this.goalRepository.findByIdAndUserId(dto.goalId, userId);
            if (!goal) {
                throw new ResourceNotFoundError("Objetivo não encontrado.");
            }

            const amountDecimal = new Decimal(dto.amount);
            if (wallet.balance.lessThan(amountDecimal)) {
                throw new InsufficientBalanceError();
            }

            // Step 2: Update Wallet
            const newWalletBalance = wallet.balance.minus(amountDecimal);
            await this.walletRepository.updateBalance(wallet.id!, newWalletBalance, tx);

            // Step 3: Create Saving Entry
            const saving = new Saving(null, userId, goal.id, wallet.id!, amountDecimal);
            await this.savingRepository.create(saving, tx);

            // Step 4: Update Goal
            const newCurrentAmount = goal.currentAmount.add(amountDecimal);
            let newPercentage = newCurrentAmount.dividedBy(goal.targetAmount).times(100);
            if (newPercentage.gt(100)) newPercentage = new Decimal(100);
            
            const isCompleted = newPercentage.gte(100);

            const updatedGoal = await this.goalRepository.update(
                goal.id,
                goal.name,
                goal.description,
                goal.walletId,
                goal.targetAmount,
                newCurrentAmount,
                newPercentage,
                goal.deadline,
                isCompleted,
                tx
            );

            // Step 5: Create a Transaction Record
            const transaction = new Transaction(
                null,
                userId,
                wallet.id!,
                "EXPENSE",
                "DEBIT_CARD", // Defaulting to DEBIT_CARD as requested
                amountDecimal,
                new Date(),
                null,
                goal.id,
                null,
                `Depósito para o objetivo: ${goal.name}`
            );
            await this.transactionRepository.create(transaction, tx);

            return {
                id: updatedGoal.id,
                name: updatedGoal.name,
                targetAmount: Number(updatedGoal.targetAmount),
                currentAmount: Number(updatedGoal.currentAmount),
                percentageComplete: Number(updatedGoal.percentageComplete),
                isCompleted: updatedGoal.isCompleted
            };
        });
    }

    async listSavingsByGoal(userId: string, goalId: string): Promise<SavingResponseDTO[]> {
        const goal = await this.goalRepository.findByIdAndUserId(goalId, userId);
        if (!goal) {
            throw new ResourceNotFoundError("Objetivo não encontrado.");
        }

        const savings = await this.savingRepository.findByGoalId(goalId);
        return savings.map(s => ({
            id: s.id!,
            goalId: s.goalId,
            walletId: s.walletId,
            amount: Number(s.amount),
            createdAt: s.createdAt!
        }));
    }
}
