import { describe, it, expect, beforeEach } from 'vitest';
import { CardService } from '../../../../src/application/services/CardService';
import { InMemoryCardRepository } from '../../helpers/InMemoryCardRepository';
import { BadRequestError } from '../../../../src/shared/errors/api-erros';
import { Decimal } from '@prisma/client/runtime/client';

describe('CardService', () => {
  let cardService: CardService;
  let cardRepository: InMemoryCardRepository;

  const USER_A_ID = 'user-a-uuid';
  const USER_B_ID = 'user-b-uuid';
  const LIMIT = new Decimal('2000.00');

  beforeEach(() => {
    cardRepository = new InMemoryCardRepository();
    cardService = new CardService(cardRepository);
  });

  // ─── createCard ────────────────────────────────────────────────────────────

  describe('createCard', () => {
    it('deve cadastrar um cartão com sucesso', async () => {
      const result = await cardService.createCard(USER_A_ID, 'Nubank', 'Mastercard', '1234', LIMIT, 'CREDIT');

      expect(result).toMatchObject({
        userId: USER_A_ID,
        name: 'Nubank',
        last4Digits: '1234',
        type: 'CREDIT'
      });
      expect(result.id).toBeDefined();
    });

    it('deve lançar BadRequestError ao tentar cadastrar cartão com mesmos 4 últimos dígitos para o mesmo usuário', async () => {
      await cardService.createCard(USER_A_ID, 'Inter', 'Mastercard', '9999', LIMIT, 'CREDIT');

      await expect(
        cardService.createCard(USER_A_ID, 'Outro Inter', 'Mastercard', '9999', LIMIT, 'DEBIT'),
      ).rejects.toThrowError(BadRequestError);
    });

    it('deve permitir que usuários diferentes cadastrem cartões com mesmos últimos 4 dígitos', async () => {
      await cardService.createCard(USER_A_ID, 'Card A', 'Visa', '5555', LIMIT, 'CREDIT');
      const resultB = await cardService.createCard(USER_B_ID, 'Card B', 'Visa', '5555', LIMIT, 'CREDIT');

      expect(resultB.userId).toBe(USER_B_ID);
      expect(cardRepository.cards).toHaveLength(2);
    });
  });

  // ─── getAllCardsByUserId ───────────────────────────────────────────────────

  describe('getAllCardsByUserId', () => {
    it('deve listar todos os cartões de um usuário', async () => {
      await cardService.createCard(USER_A_ID, 'Card 1', 'Brand', '1111', null, 'DEBIT');
      await cardService.createCard(USER_A_ID, 'Card 2', 'Brand', '2222', LIMIT, 'CREDIT');
      await cardService.createCard(USER_B_ID, 'Card 3', 'Brand', '3333', null, 'DEBIT');

      const result = await cardService.getAllCardsByUserId(USER_A_ID);

      expect(result).toHaveLength(2);
      expect(result.every(c => c.userId === USER_A_ID)).toBe(true);
    });
  });

  // ─── getCardById ───────────────────────────────────────────────────────────

  describe('getCardById', () => {
    it('deve retornar os detalhes de um cartão específico do usuário', async () => {
      const created = await cardService.createCard(USER_A_ID, 'Meta', 'Brand', '1234', null, 'DEBIT');
      const result = await cardService.getCardById(USER_A_ID, created.id);

      expect(result).toMatchObject({ id: created.id, name: 'Meta' });
    });

    it('deve lançar erro ao tentar buscar cartão inexistente', async () => {
      await expect(cardService.getCardById(USER_A_ID, 'id-fake')).rejects.toThrowError(BadRequestError);
    });

    it('deve lançar erro ao tentar buscar cartão de outro usuário', async () => {
      const created = await cardService.createCard(USER_B_ID, 'Card B', 'Brand', '1234', null, 'DEBIT');
      await expect(cardService.getCardById(USER_A_ID, created.id)).rejects.toThrowError(BadRequestError);
    });
  });

  // ─── updateCard ────────────────────────────────────────────────────────────

  describe('updateCard', () => {
    it('deve atualizar os dados de um cartão', async () => {
      const created = await cardService.createCard(USER_A_ID, 'Original', 'Brand', '1111', null, 'DEBIT');
      const updated = await cardService.updateCard(created.id, USER_A_ID, 'Novo Nome', 'Nova Brand', '2222', LIMIT, 'CREDIT');

      expect(updated.name).toBe('Novo Nome');
      expect(updated.last4Digits).toBe('2222');
      expect(updated.type).toBe('CREDIT');
    });

    it('deve lançar erro ao tentar atualizar cartão de outro usuário', async () => {
      const created = await cardService.createCard(USER_B_ID, 'Card B', 'Brand', '1234', null, 'DEBIT');
      await expect(cardService.updateCard(created.id, USER_A_ID, 'Nome', 'Brand', '1234', null, 'DEBIT')).rejects.toThrowError(BadRequestError);
    });
  });

  // ─── deleteCard ────────────────────────────────────────────────────────────

  describe('deleteCard', () => {
    it('deve deletar um cartão com sucesso', async () => {
      const created = await cardService.createCard(USER_A_ID, 'Card to Delete', 'Brand', '4444', null, 'DEBIT');
      await cardService.deleteCard(USER_A_ID, created.id);

      expect(cardRepository.cards).toHaveLength(0);
    });

    it('deve lançar erro ao tentar deletar cartão de outro usuário', async () => {
      const created = await cardService.createCard(USER_B_ID, 'Protegido', 'Brand', '4444', null, 'DEBIT');
      await expect(cardService.deleteCard(USER_A_ID, created.id)).rejects.toThrowError(BadRequestError);
      expect(cardRepository.cards).toHaveLength(1);
    });
  });
});
