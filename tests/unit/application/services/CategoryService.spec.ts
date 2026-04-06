import { describe, it, expect, beforeEach } from 'vitest';
import { CategoryService } from '../../../../src/application/services/CategoryService';
import { InMemoryCategoryRepository } from '../../helpers/InMemoryCategoryRepository';
import { BadRequestError } from '../../../../src/shared/errors/api-erros';
import { Category } from '../../../../src/domain/entities/Category';

describe('CategoryService', () => {
  let categoryService: CategoryService;
  let categoryRepository: InMemoryCategoryRepository;

  const USER_A_ID = 'user-a-uuid';
  const USER_B_ID = 'user-b-uuid';

  beforeEach(() => {
    categoryRepository = new InMemoryCategoryRepository();
    categoryService = new CategoryService(categoryRepository);
  });

  // ─── createCategory ────────────────────────────────────────────────────────

  describe('createCategory', () => {
    it('deve criar uma nova categoria com sucesso', async () => {
      const result = await categoryService.createCategory(USER_A_ID, 'Alimentação', '#FF5733');

      expect(result).toMatchObject({
        name: 'Alimentação',
        color: '#FF5733',
      });
      expect(result.id).toBeDefined();
    });

    it('deve lançar BadRequestError quando a categoria já existe para o mesmo usuário', async () => {
      await categoryService.createCategory(USER_A_ID, 'Alimentação', '#FF5733');

      await expect(
        categoryService.createCategory(USER_A_ID, 'Alimentação', '#00FF00'),
      ).rejects.toThrowError(BadRequestError);
    });

    it('deve permitir que usuários diferentes criem categorias com o mesmo nome', async () => {
      await categoryService.createCategory(USER_A_ID, 'Alimentação', '#FF5733');
      const resultB = await categoryService.createCategory(USER_B_ID, 'Alimentação', '#0000FF');

      expect(resultB.name).toBe('Alimentação');
    });
  });

  // ─── updateCategory ────────────────────────────────────────────────────────

  describe('updateCategory', () => {
    it('deve atualizar uma categoria existente com sucesso', async () => {
      const created = await categoryService.createCategory(USER_A_ID, 'Transporte', '#FFFF00');

      const updated = await categoryService.updateCategory(
        created.id!,
        USER_A_ID,
        'Transporte Público',
        '#AAAAAA',
      );

      expect(updated.name).toBe('Transporte Público');
      expect(updated.color).toBe('#AAAAAA');
    });

    it('deve lançar BadRequestError ao tentar atualizar categoria inexistente', async () => {
      await expect(
        categoryService.updateCategory('id-inexistente', USER_A_ID, 'Nova', '#FFF'),
      ).rejects.toThrowError(BadRequestError);
    });

    it('deve lançar BadRequestError quando usuário B tenta atualizar categoria do usuário A (validação de propriedade)', async () => {
      const created = await categoryService.createCategory(USER_A_ID, 'Lazer', '#123456');

      await expect(
        categoryService.updateCategory(created.id!, USER_B_ID, 'Invadido', '#000'),
      ).rejects.toThrowError(BadRequestError);
    });
  });

  // ─── deleteCategory ────────────────────────────────────────────────────────

  describe('deleteCategory', () => {
    it('deve deletar uma categoria com sucesso', async () => {
      const created = await categoryService.createCategory(USER_A_ID, 'Saúde', '#00FF00');

      const deleted = await categoryService.deleteCategory(created.id!, USER_A_ID);

      expect(deleted.name).toBe('Saúde');
      expect(categoryRepository.categories).toHaveLength(0);
    });

    it('deve lançar BadRequestError ao tentar deletar categoria inexistente', async () => {
      await expect(
        categoryService.deleteCategory('id-que-nao-existe', USER_A_ID),
      ).rejects.toThrowError(BadRequestError);
    });

    it('deve lançar BadRequestError quando usuário B tenta deletar categoria do usuário A (validação de propriedade)', async () => {
      const created = await categoryService.createCategory(USER_A_ID, 'Investimentos', '#8800FF');

      await expect(
        categoryService.deleteCategory(created.id!, USER_B_ID),
      ).rejects.toThrowError(BadRequestError);

      // Garante que a categoria ainda existe no repositório
      expect(categoryRepository.categories).toHaveLength(1);
    });
  });

  // ─── getCategoryByName ─────────────────────────────────────────────────────

  describe('getCategoryByName', () => {
    it('deve retornar uma categoria quando encontrada pelo nome', async () => {
      await categoryService.createCategory(USER_A_ID, 'Educação', '#0055FF');

      const result = await categoryService.getCategoryByName(USER_A_ID, 'Educação');

      expect(result.name).toBe('Educação');
    });

    it('deve lançar BadRequestError quando a categoria não é encontrada pelo nome', async () => {
      await expect(
        categoryService.getCategoryByName(USER_A_ID, 'NomeInexistente'),
      ).rejects.toThrowError(BadRequestError);
    });
  });

  // ─── getAllCategoriesByUserId ───────────────────────────────────────────────

  describe('getAllCategoriesByUserId', () => {
    it('deve retornar uma lista vazia quando o usuário não possui categorias', async () => {
      const result = await categoryService.getAllCategoriesByUserId(USER_A_ID);

      expect(result).toEqual([]);
    });

    it('deve retornar todas as categorias do usuário corretamente', async () => {
      await categoryService.createCategory(USER_A_ID, 'Categoria 1', '#111');
      await categoryService.createCategory(USER_A_ID, 'Categoria 2', '#222');
      await categoryService.createCategory(USER_B_ID, 'Categoria do B', '#333');

      const result = await categoryService.getAllCategoriesByUserId(USER_A_ID);

      expect(result).toHaveLength(2);
      expect(result.every((c) => c.id)).toBe(true);
    });

    it('deve retornar DTOs sem expor o userId nas respostas', async () => {
      await categoryService.createCategory(USER_A_ID, 'Moradia', '#ABCDEF');

      const [category] = await categoryService.getAllCategoriesByUserId(USER_A_ID);

      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('color');
      expect(category).not.toHaveProperty('userId');
    });
  });
});
