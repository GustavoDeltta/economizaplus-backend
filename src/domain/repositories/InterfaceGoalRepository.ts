import { Decimal } from "@prisma/client/runtime/client";
import { Goal } from "../entities/Goal";

export interface InterfaceGoalRepository {
    create(goal: Goal): Promise<Goal>;
    findByName(name: string): Promise<Goal | null>;
    findGoal(id: string): Promise<Goal | null>;
    findByIdAndUserId(id: string, userId: string): Promise<Goal | null>;
    findAllByUserId(userId: string): Promise<Goal[]>;
    update(id: string, name: string, targetAmount: Decimal, currentAmount: Decimal, percentageComplete: Decimal, deadline: Date): Promise<Goal>;
    delete(id: string): Promise<Goal | null>;
}