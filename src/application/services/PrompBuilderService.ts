export class PromptBuilderService {
  build(goals: string[]): string {
    return `
O usuário possui os seguintes objetivos financeiros: ${goals.join(", ")}.

Gere dicas práticas, diretas e motivadoras para ajudá-lo a atingir essas metas.

Responda EXCLUSIVAMENTE no seguinte formato JSON:

{
  "sections": [
    {
      "title": "string",
      "tips": [
        {
          "title": "string",
          "description": "string"
        }
      ]
    }
  ],
  "finalTip": "string"
}

Regras:
- NÃO use markdown
- NÃO use texto fora do JSON
- NÃO use símbolos como *, # ou **
- Seja claro e direto
    `.trim();
  }
}
