import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../src/app';
import { InMemoryGoalRepository } from '../../unit/helpers/InMemoryGoalRepository';
import { GoalService } from '../../../src/application/services/GoalService';
import { GoalController } from '../../../src/interface/controllers/GoalController';

// Mock do authMiddleware
vi.mock('../../../src/shared/middlewares/authMiddleware', () => ({
  authMiddleware: (req: any, _res: any, next: any) => {
    req.user = 'user-autenticado-uuid';
    req.role = 'COMMON';
    next();
  },
}));

const mockController = {} as any;

describe('Integração: Metas (Goals)', () => {
  let testApp: any;
  let goalRepo: InMemoryGoalRepository;

  beforeEach(() => {
    goalRepo = new InMemoryGoalRepository();
    const goalService = new GoalService(goalRepo);
    const goalController = new GoalController(goalService);

    testApp = createApp({
      userController: mockController,
      loginController: mockController,
      categoryController: mockController,
      goalController: goalController,
      cardController: mockController,
      googleLoginController: mockController,
      aiController: mockController,
    });
  });

  it('POST /api/goals - deve criar uma nova meta', async () => {
    const response = await request(testApp)
      .post('/api/goals')
      .send({
        name: 'Viagem Natal',
        targetAmount: 5000,
        deadline: '2026-12-25'
      });

    expect(response.status).toBe(201);
    expect(response.body.goal).toHaveProperty('name', 'Viagem Natal');
    expect(goalRepo.goals).toHaveLength(1);
  });

  it('GET /api/goals - deve listar as metas do usuário', async () => {
    await goalRepo.create({ id: '1', userId: 'user-autenticado-uuid', name: 'Meta 1', targetAmount: 100, deadline: new Date() } as any);
    await goalRepo.create({ id: '2', userId: 'outro-user', name: 'Meta 2', targetAmount: 200, deadline: new Date() } as any);

    const response = await request(testApp).get('/api/goals');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe('Meta 1');
  });

  it('PUT /api/goals/:id - deve atualizar uma meta', async () => {
    const created = await goalRepo.create({ id: '123', userId: 'user-autenticado-uuid', name: 'Antiga', targetAmount: 100, deadline: new Date() } as any);

    const response = await request(testApp)
      .put(`/api/goals/${created.id}`)
      .send({ name: 'Nova', targetAmount: 200, deadline: '2026-06-01' });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Nova');
    expect(goalRepo.goals[0].name).toBe('Nova');
  });

  it('DELETE /api/goals/:id - deve remover uma meta', async () => {
    const created = await goalRepo.create({ id: '456', userId: 'user-autenticado-uuid', name: 'Suicida', targetAmount: 0, deadline: new Date() } as any);

    const response = await request(testApp).delete(`/api/goals/${created.id}`);

    expect(response.status).toBe(204); // GoalController retorna 204 no delete
    expect(goalRepo.goals).toHaveLength(0);
  });
});
