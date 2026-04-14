import { z } from "zod";

export const CreateSavingSchema = z.object({
    goalId: z.string().uuid(),
    walletId: z.string().uuid(),
    amount: z.number().positive("O valor deve ser maior que zero.")
});

export type CreateSavingDTO = z.infer<typeof CreateSavingSchema>;

export interface SavingResponseDTO {
    id: string;
    goalId: string;
    walletId: string;
    amount: number;
    createdAt: Date;
}

export interface UpdatedGoalResponseDTO {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    percentageComplete: number;
    isCompleted: boolean;
}
