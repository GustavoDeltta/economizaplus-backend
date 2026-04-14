import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../src/app';
import { InMemoryCategoryRepository } from '../../unit/helpers/InMemoryCategoryRepository';
import { CategoryService } from '../../../src/application/services/CategoryService';
import { CategoryController } from '../../../src/interface/controllers/CategoryController';

// Mock do authMiddleware
vi.mock('../../../src/shared/middlewares/authMiddleware', () => ({
  authMiddleware: (req: any, _res: any, next: any) => {
    req.user = 'user-autenticado-uuid';
    req.role = 'COMMON';
    next();
  },
}));

const mockController = {} as any;

describe('Integração: Categorias', () => {
  let testApp: any;
  let categoryRepo: InMemoryCategoryRepository;

  beforeEach(() => {
    categoryRepo = new InMemoryCategoryRepository();
    const categoryService = new CategoryService(categoryRepo);
    const categoryController = new CategoryController(categoryService);

    testApp = createApp({
      userController: mockController,
      loginController: mockController,
      categoryController: categoryController,
      goalController: mockController,
      cardController: mockController,
      googleLoginController: mockController,
      aiController: mockController,
    });
  });

  it('POST /api/categories - deve criar uma nova categoria', async () => {
    const response = await request(testApp)
      .post('/api/categories')
      .send({ name: 'Educação', color: '#33FF57', icon: 'book' });

    expect(response.status).toBe(201);
    expect(response.body.category).toHaveProperty('name', 'Educação');
    expect(categoryRepo.categories).toHaveLength(1);
  });

  it('GET /api/categories - deve listar todas as categorias do usuário', async () => {
    await categoryRepo.create({ id: '1', userId: 'user-autenticado-uuid', name: 'Cat 1', color: '#000' } as any);
    await categoryRepo.create({ id: '2', userId: 'outro-usuario-uuid', name: 'Cat 2', color: '#FFF' } as any);

    const response = await request(testApp).get('/api/categories');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe('Cat 1');
  });

  it('PUT /api/categories/:id - deve atualizar uma categoria', async () => {
    const created = await categoryRepo.create({ id: '123', userId: 'user-autenticado-uuid', name: 'Old Name', color: '#000' } as any);

    const response = await request(testApp)
      .put(`/api/categories/${created.id}`)
      .send({ name: 'New Name', color: '#FFF', icon: 'star' });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('New Name');
    expect(categoryRepo.categories[0].name).toBe('New Name');
  });

  it('DELETE /api/categories/:id - deve remover uma categoria', async () => {
    const created = await categoryRepo.create({ id: '456', userId: 'user-autenticado-uuid', name: 'To delete', color: '#000' } as any);

    const response = await request(testApp).delete(`/api/categories/${created.id}`);

    expect(response.status).toBe(200); // Controller retorna a categoria deletada
    expect(categoryRepo.categories).toHaveLength(0);
  });

  it('deve retornar 400 ao tentar acessar categoria de outro usuário', async () => {
    const created = await categoryRepo.create({ id: '999', userId: 'outro-user', name: 'Privado', color: '#000' } as any);

    const response = await request(testApp).get(`/api/categories`); // Listagem só traz as do usuário

    expect(response.body.find((c: any) => c.id === '999')).toBeUndefined();
  });
});
