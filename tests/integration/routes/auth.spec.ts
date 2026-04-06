/**
 * Testes de Integração — Autenticação (Register & Login)
 * 
 * Foco: Fluxos públicos de entrada no sistema.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import { InMemoryUserRepository } from '../../unit/helpers/InMemoryUserRepository';
import { UserService } from '../../../src/application/services/UserService';
import { LoginService } from '../../../src/application/services/LoginService';
import { UserController } from '../../../src/interface/controllers/UserController';
import { LoginController } from '../../../src/interface/controllers/LoginController';
import { PasswordHasher } from '../../../src/infrastructure/auth/hash';
import { JwtService } from '../../../src/infrastructure/auth/jwt';
import { User } from '../../../src/domain/entities/User';
import { createApp } from '../../../src/app';

const mockController = {} as any;

describe('Integração: Autenticação (Register/Login)', () => {
  let testApp: any;
  let userRepo: InMemoryUserRepository;

  beforeEach(() => {
    userRepo = new InMemoryUserRepository();
    const userService = new UserService(userRepo, new PasswordHasher());
    const loginService = new LoginService(userRepo, new JwtService());
    
    const userController = new UserController(userService);
    const loginController = new LoginController(loginService);

    testApp = createApp({
      userController,
      loginController,
      categoryController: mockController,
      goalController: mockController,
      cardController: mockController,
      googleLoginController: mockController,
      aiController: mockController,
    });
  });

  describe('POST /api/users/register', () => {
    it('deve registrar um novo usuário e retornar status 201', async () => {
      const response = await request(testApp).post('/api/users/register').send({
        name: 'Gustavo Deltta',
        email: 'gustavo@economiza.com',
        password: 'Senha@Segura123',
        role: 'COMMON',
      });

      expect(response.status).toBe(201);
      expect(response.body.user).toHaveProperty('name', 'Gustavo Deltta');
    });

    it('deve retornar status 400 ao tentar registrar com e-mail duplicado', async () => {
      const payload = { name: 'Dupli', email: 'd@d.com', password: '123', role: 'COMMON' };
      await userRepo.create({ ...payload, id: '1', passwordHash: 'h' } as any);

      const response = await request(testApp).post('/api/users/register').send(payload);
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/login', () => {
    beforeEach(async () => {
      const senhaHash = await bcrypt.hash('Senha123', 10);
      userRepo.users.push(new User('u-1', 'U1', 'u1@test.com', senhaHash, 'COMMON'));
    });

    it('deve retornar token JWT ao fazer login com credenciais válidas', async () => {
      const response = await request(testApp).post('/api/login').send({
        email: 'u1@test.com',
        password: 'Senha123',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('deve retornar status 400 ao fazer login com senha incorreta', async () => {
      const response = await request(testApp).post('/api/login').send({
        email: 'u1@test.com',
        password: 'SenhaErrada',
      });

      expect(response.status).toBe(400);
    });
  });
});
