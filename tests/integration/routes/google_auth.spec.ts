import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../src/app';
import { InMemoryUserRepository } from '../../unit/helpers/InMemoryUserRepository';
import { GoogleLoginService } from '../../../src/application/services/GoogleLoginService';
import { GoogleLoginController } from '../../../src/interface/controllers/GoogleLoginController';
import { JwtService } from '../../../src/infrastructure/auth/jwt';
import { PasswordHasher } from '../../../src/infrastructure/auth/hash';

// Mock GoogleAuthProvider interface
const mockGoogleProvider = {
  verifyToken: vi.fn(),
};

const mockController = {} as any;

describe('Integração: Google Login', () => {
  let testApp: any;
  let userRepo: InMemoryUserRepository;

  beforeEach(() => {
    userRepo = new InMemoryUserRepository();
    const googleLoginService = new GoogleLoginService(
      userRepo,
      mockGoogleProvider as any,
      new JwtService(),
      new PasswordHasher()
    );

    const googleLoginController = new GoogleLoginController(googleLoginService);

    testApp = createApp({
      userController: mockController,
      loginController: mockController,
      categoryController: mockController,
      goalController: mockController,
      cardController: mockController,
      googleLoginController: googleLoginController,
      aiController: mockController,
    });
  });

  it('POST /api/login/google - deve realizar login bem sucedido e retornar token', async () => {
    mockGoogleProvider.verifyToken.mockResolvedValue({
      sub: 'google-123',
      email: 'novo@google.com',
      name: 'Google User',
    });

    const response = await request(testApp)
      .post('/api/login/google')
      .send({ idToken: 'valid-google-token' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toBe('Google User');

    expect(userRepo.users).toHaveLength(1);
    expect(userRepo.users[0].email).toBe('novo@google.com');
  });

  it('POST /api/login/google - deve retornar erro ao falhar na verificação do token Google', async () => {
    mockGoogleProvider.verifyToken.mockRejectedValue(new Error('Google Auth Failed'));

    const response = await request(testApp)
      .post('/api/login/google')
      .send({ idToken: 'invalid-token' });

    // Pelo errorHandler global, isso deve virar um 400 ou 500
    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});
