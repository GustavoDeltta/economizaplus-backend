import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../src/app';
import { AIService } from '../../../src/application/services/AIService';
import { AIController } from '../../../src/interface/controllers/AIController';

// Mock do authMiddleware
vi.mock('../../../src/shared/middlewares/authMiddleware', () => ({
  authMiddleware: (req: any, _res: any, next: any) => {
    req.user = 'user-autenticado-uuid';
    req.role = 'COMMON';
    next();
  },
}));

// Mock do AIService real
const mockAIService = {
  generateTips: vi.fn(),
};

const mockController = {} as any;

describe('Integração: AI - Geração de Dicas', () => {
  let testApp: any;

  beforeEach(() => {
    const aiController = new AIController(mockAIService as any);

    testApp = createApp({
      userController: mockController,
      loginController: mockController,
      categoryController: mockController,
      goalController: mockController,
      cardController: mockController,
      googleLoginController: mockController,
      aiController: aiController,
    });
  });

  it('POST /api/ai/tips - deve retornar dicas geradas pela IA', async () => {
    mockAIService.generateTips.mockResolvedValue(['Dica de teste 1', 'Dica de teste 2']);

    const response = await request(testApp)
      .post('/api/ai/tips')
      .send({ goals: ['Economizar 1000 reais'] });

    expect(response.status).toBe(200);
    expect(response.body.tips).toHaveLength(2);
    expect(response.body.tips[0]).toBe('Dica de teste 1');
  });

  it('POST /api/ai/tips - deve retornar erro ao falhar na geração de dicas', async () => {
    mockAIService.generateTips.mockRejectedValue(new Error('AI Service Down'));

    const response = await request(testApp)
      .post('/api/ai/tips')
      .send({ goals: [] });

    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});
