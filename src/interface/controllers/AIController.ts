import { Request, Response } from "express";
import { AIService } from "../../application/services/AIService";

export class AIController {
  constructor(private readonly aiService: AIService) {}

  // POST /api/ai/tips — generates and saves a new AI planning
  async generateTips(req: Request, res: Response) {
    const { goals } = req.body;
    const userId = req.user as string;

    const tips = await this.aiService.generateTips(userId, goals);
    return res.status(201).json({ tips });
  }

  // GET /api/ai/tips — retrieves the most recent saved planning
  async getTips(req: Request, res: Response) {
    const userId = req.user as string;

    const tips = await this.aiService.getTips(userId);

    if (!tips) {
      return res.status(404).json({ message: "Nenhum planejamento encontrado" });
    }

    return res.json({ tips });
  }
}