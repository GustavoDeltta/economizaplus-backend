import { AIService } from "../../application/services/AIService";
import { AIController } from "../../interface/controllers/AIController";
import { AIGenerationRepository } from "../prisma/repositories/AIGenerationRepository";

export function makeAIController(): AIController {
  const repository = new AIGenerationRepository();
  const service = new AIService(repository);
  return new AIController(service);
}