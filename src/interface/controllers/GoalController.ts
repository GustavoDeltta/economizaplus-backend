import { GoalService } from "../../application/services/GoalService";
import { Request, Response } from 'express';

export class GoalController {
    constructor(private goalService: GoalService) { }

    async create(req: Request, res: Response) {
        const userId = req.user as string;
        const { name, targetAmount, deadline } = req.body;

        const parsedDeadline = new Date(deadline);
        if (isNaN(parsedDeadline.getTime())) {
            return res.status(400).json({ error: "Invalid deadline format. Use ISO 8601 format." });
        }

        const goal = await this.goalService.createGoal(userId, name, targetAmount, parsedDeadline);

        return res.status(201).json({ goal });
    }

    async update(req: Request, res: Response) {
        const { id } = req.params as { id: string };
        const { name, targetAmount, deadline } = req.body;

        const parsedDeadline = new Date(deadline);
        if (isNaN(parsedDeadline.getTime())) {
            return res.status(400).json({ error: "Invalid deadline format. Use ISO 8601 format." });
        }

        const userId = req.user as string;

        const updatedGoal = await this.goalService.updateGoal(id, userId, name, targetAmount, parsedDeadline);

        return res.json(updatedGoal);
    }

    async delete(req: Request, res: Response) {
        const { id } = req.params as { id: string };
        const userId = req.user as string;
        await this.goalService.deleteGoal(id, userId);

        return res.status(204).json();
    }

    async getByName(req: Request, res: Response) {
        const { name } = req.params as { name: string };
        const goal = await this.goalService.getGoalByName(name);

        return res.json(goal);
    }

    async getAllByUserId(req: Request, res: Response) {
        const userId = req.user as string;
        const goals = await this.goalService.getAllGoalsByUserId(userId);

        return res.json(goals);
    }
}