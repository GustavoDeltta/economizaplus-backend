import { randomUUID } from "node:crypto";
import { InterfaceGoalRepository } from "../../domain/repositories/InterfaceGoalRepository";
import { Goal } from "../../domain/entities/Goal";
import { BadRequestError } from "../../shared/errors/api-erros";
import { Decimal } from "@prisma/client/runtime/client";

export class GoalService {
    constructor(private goalRepository: InterfaceGoalRepository) {}

    async createGoal(userId: string, name: string, targetAmount: Decimal, deadline: Date) {

        const goal = new Goal(randomUUID(), userId, name, targetAmount, deadline);

        return this.goalRepository.create(goal);
    }

    async updateGoal(id: string, userId: string, name: string, targetAmount: Decimal, deadline: Date) {
        const existing = await this.goalRepository.findByIdAndUserId(id, userId);
        if (!existing) {
            throw new BadRequestError("Meta não encontrada ou não pertence a você");
        }

        const goal = await this.goalRepository.update(id, name, targetAmount, deadline);
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