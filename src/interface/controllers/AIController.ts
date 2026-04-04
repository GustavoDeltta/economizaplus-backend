import { Request, Response } from "express";
import { AIService } from "../../application/services/AIService";

export class AIController {
  constructor(private readonly aiService: AIService) {}

  async generateTips(req: Request, res: Response) {
    const { goals } = req.body;
    const tips = await this.aiService.generateTips(goals);
    return res.json({ tips });
  }
}
