import { AIService } from "../../application/services/AIService";
import { AIController } from "../../interface/controllers/AIController";

export function makeAIController(): AIController {
  const service = new AIService();
  return new AIController(service);
}