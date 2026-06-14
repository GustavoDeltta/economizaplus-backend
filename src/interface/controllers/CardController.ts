import { Request, Response } from "express";
import { CardService } from "../../application/services/CardService";
import { Decimal } from "@prisma/client/runtime/client";

export class CardController {
  constructor(private cardService: CardService) {}
  async create(req: Request, res: Response) {
    const userId = req.user as string;
    const {
      name,
      brand,
      last4Digits,
      limitTotal,
      limitRemaining,
      closingDay,
      dueDay,
      type,
      walletId,
    } = req.body;

    const card = await this.cardService.createCard(
      userId,
      name,
      brand,
      last4Digits,
      limitTotal,
      limitRemaining,
      closingDay,
      dueDay,
      type,
      walletId ?? null,
    );

    return res.status(201).json({ card });
  }

  async getAllByUserId(req: Request, res: Response) {
    const userId = req.user as string;

    const cards = await this.cardService.getAllCardsByUserId(userId);

    return res.json(cards);
  }

  async getCardById(req: Request, res: Response) {
    const userId = req.user as string;
    const { id } = req.params as { id: string };

    const card = await this.cardService.getCardById(userId, id);

    return res.json(card);
  }

  async update(req: Request, res: Response) {
    const userId = req.user as string;
    const { id } = req.params as { id: string };
    const {
      name,
      brand,
      last4Digits,
      limitTotal,
      limitRemaining,
      closingDay,
      dueDay,
      type,
      walletId,
    } = req.body;

    const card = await this.cardService.updateCard(
      id,
      userId,
      name,
      brand,
      last4Digits,
      limitTotal,
      limitRemaining,
      closingDay,
      dueDay,
      type,
      walletId ?? null,
    );

    return res.json(card);
  }

  async delete(req: Request, res: Response) {
    const userId = req.user as string;
    const { id } = req.params as { id: string };

    await this.cardService.deleteCard(userId, id);

    return res.status(204).json();
  }

  async payInvoice(req: Request, res: Response) {
    const userId = req.user as string;
    const { id } = req.params as { id: string };
    const { amount } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ message: "Valor inválido" });
    }

    const card = await this.cardService.payInvoice(
      userId,
      id,
      new Decimal(amount),
    );
    return res.json({ card });
  }
}
