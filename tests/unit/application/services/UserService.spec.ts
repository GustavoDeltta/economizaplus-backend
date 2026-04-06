import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserService } from '../../../../src/application/services/UserService';
import { InMemoryUserRepository } from '../../helpers/InMemoryUserRepository';
import { BadRequestError, NotFoundError } from '../../../../src/shared/errors/api-erros';
import { PasswordHasher } from '../../../../src/infrastructure/auth/hash';

// Mock do PasswordHasher para os testes de unidade serem rápidos (sem bcrypt real)
const mockPasswordHasher: PasswordHasher = {
  hash: vi.fn().mockResolvedValue('senha-hashed'),
  compare: vi.fn().mockResolvedValue(true),
};

describe('UserService', () => {
  let userService: UserService;
  let userRepository: InMemoryUserRepository;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    userService = new UserService(userRepository, mockPasswordHasher);
    vi.clearAllMocks();
  });

  // ─── createUser ────────────────────────────────────────────────────────────

  describe('createUser', () => {
    it('deve criar um usuário com sucesso e retornar os dados persistidos', async () => {
      const result = await userService.createUser(
        'Gustavo Deltta',
        'gustavo@email.com',
        'senhaSegura123',
        'COMMON',
      );

      expect(result).toMatchObject({
        name: 'Gustavo Deltta',
        email: 'gustavo@email.com',
      });
      expect(result.id).toBeDefined();
    });

    it('deve acionar o hash da senha ao criar um usuário', async () => {
      await userService.createUser('Gustavo', 'g@email.com', 'senhaOriginal', 'COMMON');

      expect(mockPasswordHasher.hash).toHaveBeenCalledWith('senhaOriginal');
      expect(mockPasswordHasher.hash).toHaveBeenCalledTimes(1);
    });

    it('deve lançar BadRequestError quando o e-mail já está cadastrado', async () => {
      await userService.createUser('Gustavo', 'gustavo@email.com', 'senha', 'COMMON');

      await expect(
        userService.createUser('Outro Nome', 'gustavo@email.com', 'outraSenha', 'COMMON'),
      ).rejects.toThrowError(BadRequestError);
    });
  });

  // ─── getProfile ────────────────────────────────────────────────────────────

  describe('getProfile', () => {
    it('deve retornar o perfil do usuário sem expor a senha', async () => {
      const created = await userService.createUser('Ana', 'ana@email.com', '12345', 'COMMON');

      const profile = await userService.getProfile(created.id);

      expect(profile).toMatchObject({ name: 'Ana', email: 'ana@email.com' });
      expect(profile).not.toHaveProperty('password');
    });

    it('deve lançar NotFoundError quando o usuário não existe', async () => {
      await expect(userService.getProfile('uuid-inexistente')).rejects.toThrowError(NotFoundError);
    });
  });

  // ─── getAllUsers ────────────────────────────────────────────────────────────

  describe('getAllUsers', () => {
    it('deve retornar uma lista de DTOs de todos os usuários', async () => {
      await userService.createUser('Alice', 'alice@email.com', '123', 'COMMON');
      await userService.createUser('Bob', 'bob@email.com', '456', 'ADMIN');

      const users = await userService.getAllUsers();

      expect(users).toHaveLength(2);
      expect(users[0]).toHaveProperty('id');
      expect(users[0]).toHaveProperty('name');
      expect(users[0]).toHaveProperty('email');
      expect(users[0]).not.toHaveProperty('password');
    });

    it('deve retornar lista vazia quando não há usuários cadastrados', async () => {
      const users = await userService.getAllUsers();
      expect(users).toEqual([]);
    });
  });

  // ─── updateUser ────────────────────────────────────────────────────────────

  describe('updateUser', () => {
    it('deve atualizar o nome e e-mail do usuário com sucesso', async () => {
      const created = await userService.createUser('Carlos', 'carlos@email.com', 'pw', 'COMMON');

      const updated = await userService.updateUser(created.id, 'Carlos Novo', 'novo@email.com');

      expect(updated.name).toBe('Carlos Novo');
      expect(updated.email).toBe('novo@email.com');
    });

    it('deve lançar NotFoundError ao tentar atualizar um usuário inexistente', async () => {
      await expect(
        userService.updateUser('uuid-invalido', 'Nome', 'email@test.com'),
      ).rejects.toThrowError(NotFoundError);
    });
  });

  // ─── deleteUser ────────────────────────────────────────────────────────────

  describe('deleteUser', () => {
    it('deve deletar um usuário com sucesso', async () => {
      const created = await userService.createUser('Diana', 'diana@email.com', 'pw', 'COMMON');

      const deleted = await userService.deleteUser(created.id);

      expect(deleted.id).toBe(created.id);
      expect(userRepository.users).toHaveLength(0);
    });

    it('deve lançar NotFoundError ao tentar deletar um usuário inexistente', async () => {
      await expect(userService.deleteUser('uuid-que-nao-existe')).rejects.toThrowError(
        NotFoundError,
      );
    });
  });
});
