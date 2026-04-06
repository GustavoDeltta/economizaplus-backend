import { Decimal } from "@prisma/client/runtime/client";
import { Goal } from "../../../domain/entities/Goal";
import { InterfaceGoalRepository } from "../../../domain/repositories/InterfaceGoalRepository";
import { prisma } from "../client";

export class GoalRepository implements InterfaceGoalRepository {
    async create(goal: Goal): Promise<Goal> {
        const data = await prisma.goal.create({
            data: {
                userId: goal.userId,
                name: goal.name,
                targetAmount: goal.targetAmount,
                currentAmount: goal.currentAmount,
                percentageComplete: goal.percentageComplete,
                deadline: goal.deadline
            }
        });
        return new Goal(data.id, data.userId, data.name, data.targetAmount, data.currentAmount, data.percentageComplete, data.deadline);
    }

    async update(id: string, name: string, targetAmount: Decimal, currentAmount: Decimal, percentageComplete: Decimal, deadline: Date): Promise<Goal> {
        const data = await prisma.goal.update({
            where: { id },
            data: {
                name,
                targetAmount,
                currentAmount,
                percentageComplete,
                deadline
            }
        });
            return new Goal(
                data.id, 
                data.userId, 
                data.name, 
                data.targetAmount, 
                data.currentAmount,
                data.percentageComplete,
                data.deadline);
    }

    async delete(id: string): Promise<Goal | null> {
        const data = await prisma.goal.delete({
            where: { id }
        });
        if (!data) return null;
        return new Goal(
            data.id, 
            data.userId, 
            data.name, 
            data.targetAmount, 
            data.currentAmount,
            data.percentageComplete,
            data.deadline
        );
    }

    async findByName(name: string): Promise<Goal | null> {
        const data = await prisma.goal.findFirst({
            where: {
                name
            }
        });
        if (!data) return null;
        return new Goal(
            data.id, 
            data.userId, 
            data.name, 
            data.targetAmount, 
            data.currentAmount,
            data.percentageComplete,
            data.deadline);
    }

    async findAllByUserId(userId: string): Promise<Goal[]> {
        const data = await prisma.goal.findMany({
            where: {
                userId
            }
        });
        return data.map(goal => new Goal(
            goal.id, 
            goal.userId, 
            goal.name, 
            goal.targetAmount, 
            goal.currentAmount,
            goal.percentageComplete,
            goal.deadline));
    }

    async findGoal(userId: string): Promise<Goal | null> {
        const data = await prisma.goal.findFirst({
            where: {
                userId
            }
        });
        if (!data) return null;
        return new Goal(
            data.id, 
            data.userId, 
            data.name, 
            data.targetAmount, 
            data.currentAmount,
            data.percentageComplete,
            data.deadline);
    }

    async findByIdAndUserId(id: string, userId: string): Promise<Goal | null> {
        const data = await prisma.goal.findFirst({
            where: {
                id,
                userId
            }
        });
        if (!data) return null;
        return new Goal(
            data.id, 
            data.userId, 
            data.name, 
            data.targetAmount, 
            data.currentAmount,
            data.percentageComplete,
            data.deadline);
    }
}