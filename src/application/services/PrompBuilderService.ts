export class PromptBuilderService {
  build(goals: string[]): string {
    return `
Você é um assistente especialista em planejamento financeiro pessoal.

O usuário possui os seguintes objetivos financeiros: ${goals.join(", ")}.

Gere dicas práticas, diretas e motivadoras para ajudá-lo a atingir essas metas.

IMPORTANTE: Responda EXCLUSIVAMENTE com um objeto JSON válido, sem nenhum texto antes ou depois, sem blocos de código markdown.

O JSON deve seguir exatamente esta estrutura:
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

Regras obrigatórias:
- Retorne APENAS o JSON puro, sem \`\`\`json, sem \`\`\`, sem introdução, sem conclusão
- NÃO use markdown, asteriscos (*), cerquilha (#) ou negrito (**)
- Escreva todo o conteúdo em português do Brasil
- Seja claro, objetivo e motivador
- Gere pelo menos 2 seções com pelo menos 2 dicas cada
    `.trim();
  }
}