import Groq from "groq-sdk";
import { BadRequestError } from "../../shared/errors/api-erros";
import { PromptBuilderService } from "../services/PrompBuilderService";
import { InterfaceAIGenerationRepository } from "../../domain/repositories/InterfaceAIGenerationRepository";

const GROQ_MODEL = "llama-3.1-8b-instant";

export class AIService {
  private readonly promptBuilder = new PromptBuilderService();

  constructor(
    private readonly aiGenerationRepository: InterfaceAIGenerationRepository
  ) {}

  async generateTips(userId: string, goals: string[]): Promise<string> {
    if (!goals || goals.length === 0) {
      throw new BadRequestError("Nenhuma meta fornecida");
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const prompt = this.promptBuilder.build(goals);

    const response = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.choices[0]?.message?.content;

    if (!text) {
      throw new BadRequestError("Resposta inválida da IA");
    }

    // Strip markdown fences if the model ignores instructions
    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    // Validate that the response is parseable JSON before saving
    try {
      JSON.parse(cleaned);
    } catch {
      throw new BadRequestError(
        "A IA retornou um formato inválido. Tente novamente."
      );
    }

    await this.aiGenerationRepository.save(userId, cleaned);

    return cleaned;
  }

  // Returns the most recent AI generation for the user, or null if none exists
  async getTips(userId: string): Promise<string | null> {
    const generation = await this.aiGenerationRepository.findByUserId(userId);
    return generation?.response ?? null;
  }
}