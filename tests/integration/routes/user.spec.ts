import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../src/app';
import { InMemoryUserRepository } from '../../unit/helpers/InMemoryUserRepository';
import { UserService } from '../../../src/application/services/UserService';
import { UserController } from '../../../src/interface/controllers/UserController';
import { PasswordHasher } from '../../../src/infrastructure/auth/hash';

// Mock do authMiddleware
let mockRole = 'COMMON';
vi.mock('../../../src/shared/middlewares/authMiddleware', () => ({
  authMiddleware: (req: any, _res: any, next: any) => {
    req.user = 'user-autenticado-uuid';
    req.role = mockRole;
    next();
  },
}));

const mockController = {} as any;

describe('Integração: Usuários (Users)', () => {
  let testApp: any;
  let userRepo: InMemoryUserRepository;

  beforeEach(() => {
    userRepo = new InMemoryUserRepository();
    const userService = new UserService(userRepo, new PasswordHasher());
    const userController = new UserController(userService);

    testApp = createApp({
      userController: userController,
      loginController: mockController,
      categoryController: mockController,
      goalController: mockController,
      cardController: mockController,
      googleLoginController: mockController,
      aiController: mockController,
    });
    mockRole = 'COMMON';
  });

  it('GET /api/users/profile - deve retornar o perfil logado', async () => {
    await userRepo.create({ id: 'user-autenticado-uuid', name: 'Logado', email: 'log@test.com', passwordHash: 'hash', role: 'COMMON' } as any);

    const response = await request(testApp).get('/api/users/profile');

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Logado');
    expect(response.body).not.toHaveProperty('passwordHash');
  });

  it('PUT /api/users/profile - deve atualizar o perfil', async () => {
    await userRepo.create({ id: 'user-autenticado-uuid', name: 'Original', email: 'orig@test.com', passwordHash: 'hash', role: 'COMMON' } as any);

    const response = await request(testApp)
      .put('/api/users/profile')
      .send({ name: 'Atualizado', email: 'atualizado@test.com' });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Atualizado');
    expect(userRepo.users[0].name).toBe('Atualizado');
  });

  it('DELETE /api/users/profile - deve remover o perfil logado', async () => {
    await userRepo.create({ id: 'user-autenticado-uuid', name: 'Delete-me', email: 'del@test.com', passwordHash: 'hash', role: 'COMMON' } as any);

    const response = await request(testApp).delete('/api/users/profile');

    expect(response.status).toBe(200);
    expect(userRepo.users).toHaveLength(0);
  });

  it('GET /api/users - deve listar todos para ADMIN somente', async () => {
    mockRole = 'ADMIN';
    await userRepo.create({ id: '1', name: 'U1', email: 'e1', passwordHash: 'h', role: 'COMMON' } as any);
    await userRepo.create({ id: '2', name: 'U2', email: 'e2', passwordHash: 'h', role: 'ADMIN' } as any);

    const response = await request(testApp).get('/api/users');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  // Nota: O teste de falha de role seria melhor testado na integração real do middleware, 
  // mas como o roleMiddleware apenas checa req.role populado pelo authMiddleware (que estamos mockando),
  // se mudarmos mockRole para 'COMMON' e tentarmos acessar /api/users, o roleMiddleware deve barrar.
  it('GET /api/users - deve retornar 403 para usuário comum', async () => {
    mockRole = 'COMMON';
    const response = await request(testApp).get('/api/users');
    
    // O roleMiddleware retorna erro do errorHandler, que deve virar algo como 403 Unauthorized dependendo da implementação
    expect(response.status).toBe(403);
  });
});
