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
                description: goal.description,
                walletId: goal.walletId,
                targetAmount: goal.targetAmount,
                currentAmount: goal.currentAmount,
                percentageComplete: goal.percentageComplete,
                deadline: goal.deadline,
                isCompleted: goal.isCompleted
            }
        });
        return new Goal(data.id, data.userId, data.name, data.description, data.walletId, data.targetAmount, data.currentAmount, data.percentageComplete, data.deadline, data.isCompleted);
    }

    async update(id: string, name: string, description: string, walletId: string, targetAmount: Decimal, currentAmount: Decimal, percentageComplete: Decimal, deadline: Date, isCompleted: boolean, tx?: any): Promise<Goal> {
        const prismaClient = tx || prisma;
        const data = await prismaClient.goal.update({
            where: { id },
            data: {
                name,
                description,
                walletId,
                targetAmount,
                currentAmount,
                percentageComplete,
                deadline,
                isCompleted
            }
        });
            return new Goal(
                data.id, 
                data.userId, 
                data.name, 
                data.description,
                data.walletId,
                data.targetAmount, 
                data.currentAmount,
                data.percentageComplete,
                data.deadline,
                data.isCompleted);
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
            data.description,
            data.walletId,
            data.targetAmount, 
            data.currentAmount,
            data.percentageComplete,
            data.deadline,
            data.isCompleted
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
            data.description,
            data.walletId,
            data.targetAmount, 
            data.currentAmount,
            data.percentageComplete,
            data.deadline,
            data.isCompleted);
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
            goal.description,
            goal.walletId,
            goal.targetAmount, 
            goal.currentAmount,
            goal.percentageComplete,
            goal.deadline,
            goal.isCompleted));
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
            data.description,
            data.walletId,
            data.targetAmount, 
            data.currentAmount,
            data.percentageComplete,
            data.deadline,
            data.isCompleted);
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
            data.description,
            data.walletId,
            data.targetAmount, 
            data.currentAmount,
            data.percentageComplete,
            data.deadline,
            data.isCompleted);
    }
}