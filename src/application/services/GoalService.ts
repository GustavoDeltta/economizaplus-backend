import { randomUUID } from "node:crypto";
import { InterfaceGoalRepository } from "../../domain/repositories/InterfaceGoalRepository";
import { Goal } from "../../domain/entities/Goal";
import { BadRequestError } from "../../helpers/api-erros";
import { Decimal } from "@prisma/client/runtime/client";

export class GoalService {
    constructor(private goalRepository: InterfaceGoalRepository) {}

    async createGoal(userId: string, name: string, targetAmount: Decimal, deadline: Date) {

        const exists = await this.goalRepository.findGoal(userId);

        if (exists) {
            throw new BadRequestError("Meta já existe para este usuário");
        }

        const goal = new Goal(randomUUID(), userId, name, targetAmount, deadline);

        return this.goalRepository.create(goal);
    }

    async updateGoal(id: string, name: string, targetAmount: Decimal, deadline: Date) {
        const goal = await this.goalRepository.update(id, name, targetAmount, deadline);
        if (!goal) {
            throw new BadRequestError("Meta não encontrada");
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