import { env } from "../../shared/env";
import { BadRequestError } from "../../shared/errors/api-erros";
import { PromptBuilderService } from "./PrompBuilderService";
import { GoogleGenAI } from "@google/genai";

const GEMINI_MODEL = "gemini-2.0-flash";

export class AIService {

  private readonly promptBuilder = new PromptBuilderService();

  async generateTips(goals: string[]): Promise<string> {
    if (!goals || goals.length === 0) {
      throw new BadRequestError("Nenhuma meta fornecida");
    }

    const apiKey = env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      throw new BadRequestError("Chave da API do Gemini não configurada");
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = this.promptBuilder.build(goals);

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    if (!response.text) {
      throw new BadRequestError("Resposta inválida da IA");
    }

    return response.text;
  }
}