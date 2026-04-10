import { Request, Response } from "express";
import { SavingService } from "../../application/services/SavingService";
import { CreateSavingSchema } from "../../application/DTO/SavingDTO";

export class SavingController {
    constructor(private savingService: SavingService) {}

    async create(req: Request, res: Response) {
        const userId = req.user as string;
        
        // Validation with Zod
        const validatedData = CreateSavingSchema.parse(req.body);

        const result = await this.savingService.createSaving(userId, validatedData);
        return res.status(201).json(result);
    }

    async getByGoal(req: Request, res: Response) {
        const userId = req.user as string;
        const { goalId } = req.params as { goalId: string };

        const savings = await this.savingService.listSavingsByGoal(userId, goalId);
        return res.json(savings);
    }
}
