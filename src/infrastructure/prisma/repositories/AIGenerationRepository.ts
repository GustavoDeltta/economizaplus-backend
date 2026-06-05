import { AIGeneration } from "../../../domain/entities/AIGeneration";
import { InterfaceAIGenerationRepository } from "../../../domain/repositories/InterfaceAIGenerationRepository";
import { prisma } from "../client";

export class AIGenerationRepository implements InterfaceAIGenerationRepository {
  async save(userId: string, response: string): Promise<AIGeneration> {
    const data = await prisma.aIGeneration.create({
      data: { userId, response },
    });
    return new AIGeneration(data.id, data.userId, data.response, data.createdAt);
  }

  async findByUserId(userId: string): Promise<AIGeneration | null> {
    const data = await prisma.aIGeneration.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!data) return null;

    return new AIGeneration(data.id, data.userId, data.response, data.createdAt);
  }
}