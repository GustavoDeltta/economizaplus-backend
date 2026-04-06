import { Decimal } from "@prisma/client/runtime/client";
import { Card } from "../../../src/domain/entities/Card";
import { InterfaceCardRepository } from "../../../src/domain/repositories/InterfaceCardRepository";

export class InMemoryCardRepository implements InterfaceCardRepository {
    public cards: Card[] = [];

    async create(card: Card): Promise<Card> {
        this.cards.push(card);
        return card;
    }

    async update(id: string, userId: string, name: string, brand: string, last4digits: string, limit: Decimal | null, type: string): Promise<Card> {
        const index = this.cards.findIndex(c => c.id === id);
        if (index === -1) throw new Error("Card not found");
        
        const updatedCard = new Card(id, userId, name, brand, last4digits, limit, type);
        this.cards[index] = updatedCard;
        return updatedCard;
    }

    async delete(id: string, userId: string): Promise<Card | null> {
        const index = this.cards.findIndex(c => c.id === id && c.userId === userId);
        if (index === -1) return null;
        const [removed] = this.cards.splice(index, 1);
        return removed;
    }

    async findCard(id: string): Promise<Card | null> {
        return this.cards.find(c => c.id === id) || null;
    }

    async findAllByUserId(userId: string): Promise<Card[]> {
        return this.cards.filter(c => c.userId === userId);
    }

    async findByLast4Digits(userId: string, last4Digits: string): Promise<Card | null> {
        return this.cards.find(c => c.userId === userId && c.last4Digits === last4Digits) || null;
    }
}
