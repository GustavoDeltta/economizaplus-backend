import { Request, Response } from "express";
import { CardService } from "../../application/services/CardService";

export class CardController{
    constructor(private cardService: CardService){}
    async create(req: Request, res: Response) {
        const userId = req.user as string;
        const { name, brand, last4Digits, limit, type } = req.body;
        
        const card = await this.cardService.createCard(userId, name, brand, last4Digits, limit, type);

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
        const { name, brand, last4digits, limit, type } = req.body;

        const card = await this.cardService.updateCard(id, userId, name, brand, last4digits, limit, type);

        
        return res.json(card);
    }

    async delete(req: Request, res: Response) {
        const userId = req.user as string;
        const { id } = req.params as { id: string };

        await this.cardService.deleteCard(userId, id);

        return res.status(204).json();
    }

}