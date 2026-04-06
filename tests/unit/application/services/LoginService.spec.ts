import { describe, it, expect, beforeEach, vi } from 'vitest';
import bcrypt from 'bcrypt';
import { LoginService } from '../../../../src/application/services/LoginService';
import { InMemoryUserRepository } from '../../helpers/InMemoryUserRepository';
import { BadRequestError } from '../../../../src/shared/errors/api-erros';
import { User } from '../../../../src/domain/entities/User';
import { JwtService } from '../../../../src/infrastructure/auth/jwt';

// Mock do JwtService para não depender de JWT_SECRET em ambiente de teste
const mockJwtService: JwtService = {
  generateToken: vi.fn().mockResolvedValue('token-jwt-falso'),
  verifyToken: vi.fn(),
};

describe('LoginService', () => {
  let loginService: LoginService;
  let userRepository: InMemoryUserRepository;

  const SENHA_TEXTO = 'SenhaCorreta123';
  let senhaHash: string;

  beforeEach(async () => {
    userRepository = new InMemoryUserRepository();
    loginService = new LoginService(userRepository, mockJwtService);
    vi.clearAllMocks();

    // Cria a senha hash apenas uma vez para todos os testes
    senhaHash = await bcrypt.hash(SENHA_TEXTO, 10);
  });

  async function criarUsuarioComSenhaHash(email: string = 'usuario@email.com') {
    const user = new User('user-uuid-1', 'Usuário Teste', email, senhaHash, 'COMMON');
    await userRepository.create(user);
    return user;
  }

  // ─── login ─────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('deve realizar login com sucesso e retornar token e nome do usuário', async () => {
      await criarUsuarioComSenhaHash();

      const result = await loginService.login('usuario@email.com', SENHA_TEXTO);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.token).toBe('token-jwt-falso');
      expect(result.user).toBe('Usuário Teste');
    });

    it('deve solicitar a geração do token com o id e role corretos', async () => {
      const user = await criarUsuarioComSenhaHash();

      await loginService.login('usuario@email.com', SENHA_TEXTO);

      expect(mockJwtService.generateToken).toHaveBeenCalledWith({
        id: user.id,
        role: user.role,
      });
    });

    it('deve lançar BadRequestError quando o e-mail não está cadastrado', async () => {
      await expect(
        loginService.login('naoexiste@email.com', 'qualquerSenha'),
      ).rejects.toThrowError(BadRequestError);
    });

    it('deve lançar BadRequestError quando a senha está incorreta', async () => {
      await criarUsuarioComSenhaHash();

      await expect(
        loginService.login('usuario@email.com', 'SenhaErrada999'),
      ).rejects.toThrowError(BadRequestError);
    });

    it('não deve revelar se o erro é de e-mail ou senha (mensagem genérica de segurança)', async () => {
      await criarUsuarioComSenhaHash();

      const erroEmailInvalido = await loginService
        .login('naoexiste@email.com', 'senha')
        .catch((e) => e);

      const erroSenhaInvalida = await loginService
        .login('usuario@email.com', 'SenhaErrada')
        .catch((e) => e);

      // Ambos devem ter a mesma mensagem para não revelar qual dado está errado
      expect(erroEmailInvalido.message).toBe(erroSenhaInvalida.message);
    });
  });
});
