import { describe, it, expect, beforeEach } from 'vitest';
import { GoalService } from '../../../../src/application/services/GoalService';
import { InMemoryGoalRepository } from '../../helpers/InMemoryGoalRepository';
import { BadRequestError } from '../../../../src/shared/errors/api-erros';
import { Decimal } from '@prisma/client/runtime/client';

describe('GoalService', () => {
  let goalService: GoalService;
  let goalRepository: InMemoryGoalRepository;

  const USER_A_ID = 'user-a-uuid';
  const USER_B_ID = 'user-b-uuid';
  const TARGET_AMOUNT = new Decimal('5000.00');
  const DEADLINE = new Date('2026-12-31');

  beforeEach(() => {
    goalRepository = new InMemoryGoalRepository();
    goalService = new GoalService(goalRepository);
  });

  // ─── createGoal ────────────────────────────────────────────────────────────

  describe('createGoal', () => {
    it('deve criar uma meta financeira com sucesso', async () => {
      const result = await goalService.createGoal(USER_A_ID, 'Viagem Europa', TARGET_AMOUNT, DEADLINE);

      expect(result).toMatchObject({
        userId: USER_A_ID,
        name: 'Viagem Europa',
      });
      expect(result.id).toBeDefined();
    });

    it('deve permitir criar múltiplas metas para o mesmo usuário', async () => {
      await goalService.createGoal(USER_A_ID, 'Comprar Carro', TARGET_AMOUNT, DEADLINE);
      
      const result = await goalService.createGoal(USER_A_ID, 'Trocar Celular', TARGET_AMOUNT, DEADLINE);

      expect(result.userId).toBe(USER_A_ID);
      expect(result.name).toBe('Trocar Celular');
      expect(goalRepository.goals).toHaveLength(2);
    });

    it('deve permitir que usuários diferentes criem metas simultaneamente', async () => {
      await goalService.createGoal(USER_A_ID, 'Meta A', TARGET_AMOUNT, DEADLINE);
      const resultB = await goalService.createGoal(USER_B_ID, 'Meta B', TARGET_AMOUNT, DEADLINE);

      expect(resultB.userId).toBe(USER_B_ID);
      expect(goalRepository.goals).toHaveLength(2);
    });
  });

  // ─── updateGoal ────────────────────────────────────────────────────────────

  describe('updateGoal', () => {
    it('deve atualizar uma meta com sucesso', async () => {
      const created = await goalService.createGoal(USER_A_ID, 'Meta Original', TARGET_AMOUNT, DEADLINE);
      const newAmount = new Decimal('10000.00');
      const newDeadline = new Date('2027-06-30');

      const updated = await goalService.updateGoal(
        created.id,
        USER_A_ID,
        'Meta Atualizada',
        newAmount,
        newDeadline,
      );

      expect(updated.name).toBe('Meta Atualizada');
      expect(updated.targetAmount).toEqual(newAmount);
    });

    it('deve lançar BadRequestError quando a meta não pertence ao usuário (validação de propriedade)', async () => {
      const created = await goalService.createGoal(USER_A_ID, 'Minha Meta', TARGET_AMOUNT, DEADLINE);

      await expect(
        goalService.updateGoal(created.id, USER_B_ID, 'Invadida', TARGET_AMOUNT, DEADLINE),
      ).rejects.toThrowError(BadRequestError);
    });

    it('deve lançar BadRequestError quando a meta não existe', async () => {
      await expect(
        goalService.updateGoal('id-invalido', USER_A_ID, 'Nome', TARGET_AMOUNT, DEADLINE),
      ).rejects.toThrowError(BadRequestError);
    });
  });

  // ─── deleteGoal ────────────────────────────────────────────────────────────

  describe('deleteGoal', () => {
    it('deve deletar uma meta com sucesso', async () => {
      const created = await goalService.createGoal(USER_A_ID, 'Meta para deletar', TARGET_AMOUNT, DEADLINE);

      await goalService.deleteGoal(created.id, USER_A_ID);

      expect(goalRepository.goals).toHaveLength(0);
    });

    it('deve lançar BadRequestError quando usuário B tenta deletar meta do usuário A (validação de propriedade)', async () => {
      const created = await goalService.createGoal(USER_A_ID, 'Meta Protegida', TARGET_AMOUNT, DEADLINE);

      await expect(goalService.deleteGoal(created.id, USER_B_ID)).rejects.toThrowError(
        BadRequestError,
      );

      // Meta deve continuar existindo
      expect(goalRepository.goals).toHaveLength(1);
    });

    it('deve lançar BadRequestError ao tentar deletar meta inexistente', async () => {
      await expect(goalService.deleteGoal('uuid-invalido', USER_A_ID)).rejects.toThrowError(
        BadRequestError,
      );
    });
  });

  // ─── getGoalByName ─────────────────────────────────────────────────────────

  describe('getGoalByName', () => {
    it('deve retornar a meta quando encontrada pelo nome', async () => {
      await goalService.createGoal(USER_A_ID, 'Reserva de Emergência', TARGET_AMOUNT, DEADLINE);

      const result = await goalService.getGoalByName('Reserva de Emergência');

      expect(result.name).toBe('Reserva de Emergência');
    });

    it('deve lançar BadRequestError quando não encontrada pelo nome', async () => {
      await expect(goalService.getGoalByName('Meta Inexistente')).rejects.toThrowError(
        BadRequestError,
      );
    });
  });

  // ─── getAllGoalsByUserId ────────────────────────────────────────────────────

  describe('getAllGoalsByUserId', () => {
    it('deve retornar todas as metas de um usuário específico', async () => {
      await goalService.createGoal(USER_A_ID, 'Meta A', TARGET_AMOUNT, DEADLINE);
      await goalService.createGoal(USER_B_ID, 'Meta B', TARGET_AMOUNT, DEADLINE);

      const result = await goalService.getAllGoalsByUserId(USER_A_ID);

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe(USER_A_ID);
    });

    it('deve retornar lista vazia quando o usuário não possui metas', async () => {
      const result = await goalService.getAllGoalsByUserId(USER_A_ID);
      expect(result).toEqual([]);
    });
  });
});
