import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../src/app';
import { InMemoryCardRepository } from '../../unit/helpers/InMemoryCardRepository';
import { CardService } from '../../../src/application/services/CardService';
import { CardController } from '../../../src/interface/controllers/CardController';

// Mocks dos outros controllers (para não explodir o createApp)
const mockController = {
  create: vi.fn(),
  getAll: vi.fn(),
  getProfile: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  login: vi.fn(),
  getAllByUserId: vi.fn(),
  generateTips: vi.fn(),
  getCardById: vi.fn(),
} as any;

// Mock do authMiddleware
vi.mock('../../../src/shared/middlewares/authMiddleware', () => ({
  authMiddleware: (req: any, _res: any, next: any) => {
    req.user = 'user-autenticado-uuid';
    req.role = 'COMMON';
    next();
  },
}));

describe('Integração: Cartões (Cards)', () => {
  let testApp: any;
  let cardRepo: InMemoryCardRepository;

  beforeEach(() => {
    cardRepo = new InMemoryCardRepository();
    const cardService = new CardService(cardRepo);
    const cardController = new CardController(cardService);

    testApp = createApp({
      userController: mockController,
      loginController: mockController,
      categoryController: mockController,
      goalController: mockController,
      cardController: cardController,
      googleLoginController: mockController,
      aiController: mockController,
    });
  });

  it('POST /api/cards - deve criar um novo cartão', async () => {
    const response = await request(testApp)
      .post('/api/cards')
      .send({
        name: 'Cartão de Teste',
        brand: 'Visa',
        last4Digits: '9999',
        limit: 1000,
        type: 'CREDIT'
      });

    expect(response.status).toBe(201);
    expect(response.body.card).toHaveProperty('name', 'Cartão de Teste');
    expect(cardRepo.cards).toHaveLength(1);
  });

  it('GET /api/cards - deve listar cartões do usuário', async () => {
    await request(testApp)
      .post('/api/cards')
      .send({ name: 'C1', brand: 'B', last4Digits: '1111', type: 'DEBIT' });

    const response = await request(testApp).get('/api/cards');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(1);
  });

  it('PUT /api/cards/:id - deve atualizar um cartão', async () => {
    const created = await request(testApp)
      .post('/api/cards')
      .send({ name: 'Old', brand: 'B', last4Digits: '1111', type: 'DEBIT' });

    const id = created.body.card.id;

    const response = await request(testApp)
      .put(`/api/cards/${id}`)
      .send({ name: 'New', brand: 'V', last4Digits: '2222', limit: 500, type: 'CREDIT' });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('New');
  });

  it('DELETE /api/cards/:id - deve remover um cartão', async () => {
    const created = await request(testApp)
      .post('/api/cards')
      .send({ name: 'To delete', brand: 'B', last4Digits: '1111', type: 'DEBIT' });

    const id = created.body.card.id;

    const response = await request(testApp).delete(`/api/cards/${id}`);

    expect(response.status).toBe(204);
    expect(cardRepo.cards).toHaveLength(0);
  });
});
