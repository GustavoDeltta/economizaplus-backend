import { AIGeneration } from "../entities/AIGeneration";

export interface InterfaceAIGenerationRepository {
  save(userId: string, response: string): Promise<AIGeneration>;
  findByUserId(userId: string): Promise<AIGeneration | null>;
}