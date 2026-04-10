import { PrismaClient } from "../../prisma/generated/prisma";
import { Saving } from "../../../domain/entities/Saving";
import { InterfaceSavingRepository } from "../../../domain/repositories/InterfaceSavingRepository";
import { prisma } from "../client";

export class SavingRepository implements InterfaceSavingRepository {
    async create(saving: Saving, tx?: any): Promise<Saving> {
        const prismaClient = tx || prisma;
        const data = await prismaClient.saving.create({
            data: {
                userId: saving.userId,
                goalId: saving.goalId,
                walletId: saving.walletId,
                amount: saving.amount
            }
        });
        return new Saving(data.id, data.userId, data.goalId, data.walletId, data.amount, data.createdAt);
    }

    async findByGoalId(goalId: string): Promise<Saving[]> {
        const data = await prisma.saving.findMany({
            where: { goalId },
            orderBy: { createdAt: 'desc' }
        });
        return data.map(s => new Saving(s.id, s.userId, s.goalId, s.walletId, s.amount, s.createdAt));
    }
}
