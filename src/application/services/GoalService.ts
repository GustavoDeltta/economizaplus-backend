import { randomUUID } from "node:crypto";
import { InterfaceGoalRepository } from "../../domain/repositories/InterfaceGoalRepository";
import { Goal } from "../../domain/entities/Goal";
import { BadRequestError } from "../../shared/errors/api-erros";
import { Decimal } from "@prisma/client/runtime/client";

export class GoalService {
    constructor(private goalRepository: InterfaceGoalRepository) {}

    async createGoal(userId: string, name: string, description: string, walletId: string, targetAmount: Decimal | number, deadline: Date) {
        const targetAmountDecimal = new Decimal(targetAmount);
        // New goals start with zero progress
        const currentAmountDecimal = new Decimal(0);
        const percentageComplete = new Decimal(0);

        const goal = new Goal(randomUUID(), userId, name, description, walletId, targetAmountDecimal, currentAmountDecimal, percentageComplete, deadline, false);

        return this.goalRepository.create(goal);
    }

    async updateGoal(id: string, userId: string, name: string, description: string, walletId: string, targetAmount: Decimal | number, currentAmount: Decimal | number, deadline: Date, isCompleted?: boolean) {
        const targetAmountDecimal = new Decimal(targetAmount);
        const currentAmountDecimal = new Decimal(currentAmount);
        
        const existing = await this.goalRepository.findByIdAndUserId(id, userId);
        if (!existing) {
            throw new BadRequestError("Meta não encontrada ou não pertence a você");
        }

        // Calculate percentage complete
        let percentage = new Decimal(0);
        if (targetAmountDecimal.gt(0)) {
            percentage = currentAmountDecimal.div(targetAmountDecimal).mul(100);
            if (percentage.gt(100)) percentage = new Decimal(100);
        }

        // Auto-complete logic
        const autoCompleted = percentage.gte(100);
        const finalIsCompleted = isCompleted !== undefined ? isCompleted : autoCompleted;

        const goal = await this.goalRepository.update(id, name, description, walletId, targetAmountDecimal, currentAmountDecimal, percentage, deadline, finalIsCompleted);
        if (!goal) {
            throw new BadRequestError("Falha na atualização da meta");
        }
        return goal;
    }

    async deleteGoal(id: string, userId: string) {
        const goal = await this.goalRepository.findByIdAndUserId(id, userId);
        if (!goal) {
            throw new BadRequestError("Meta não encontrada para esse usuário");
        }
        await this.goalRepository.delete(id);
    }

    async getGoalByName(name: string) {
        const goal = await this.goalRepository.findByName(name);
        if (!goal) {
            throw new BadRequestError("Meta não encontrada");
        }
        return goal;
    }

    async getAllGoalsByUserId(userId: string) {
        return this.goalRepository.findAllByUserId(userId);
    }
}