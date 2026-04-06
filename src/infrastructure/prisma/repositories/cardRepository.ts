import { Card } from "../../../domain/entities/Card";
import { InterfaceCardRepository } from "../../../domain/repositories/InterfaceCardRepository";
import { prisma } from "../client";
import { Prisma } from "../generated/prisma/client";
import { CardType } from "../generated/prisma/enums";
import { BadRequestError } from "../../../shared/errors/api-erros";
import { Decimal } from "@prisma/client/runtime/client";

export class CardRepository implements InterfaceCardRepository {
    async create(card: Card): Promise<Card> {
        const data = await prisma.card.create({
            data: {
                id: card.id,
                userId: card.userId,
                name: card.name,
                brand: card.brand,
                last4Digits: card.last4Digits,
                limitTotal: card.limitTotal ? Prisma.Decimal(card.limitTotal) : null,
                limitRemaining: card.limitRemaining ? Prisma.Decimal(card.limitRemaining) : null,
                closingDay: card.closingDay,
                dueDay: card.dueDay,
                type: card.type as CardType
                
            }
        });
        return new Card(
            data.id, 
            data.userId, 
            data.name,
            data.brand,
            data.last4Digits,
            data.limitTotal,
            data.limitRemaining,
            data.closingDay,
            data.dueDay,
            data.type
        );
    }
    async update(id: string, userId: string, name: string, brand: string, last4Digits: string, limitTotal: Decimal | null, limitRemaining: Decimal | null, closingDay: number | null, dueDay: number | null, type: string): Promise<Card> {
        const card = await prisma.card.findFirst({
            where: { id }
        });
        if(!card) throw new BadRequestError("Cartão nao encontrado");
        if(card.userId !== userId) throw new BadRequestError("Cartão nao pertence ao usuário");
        const data = await prisma.card.update({
            where: {
                id
            },
            data: {
                name,
                brand,
                last4Digits: last4Digits,
                limitTotal,
                limitRemaining,
                closingDay,
                dueDay,
                type: type as CardType
            }
        });
       
        return new Card(
            data.id, 
            data.userId, 
            data.name,
            data.brand,
            data.last4Digits,
            data.limitTotal,
            data.limitRemaining,
            data.closingDay,
            data.dueDay,
            data.type
        );
    }
    async delete(id: string, userId: string): Promise<Card | null> {
        const data = await prisma.card.findFirst({
            where: {
                id,
                userId
            }
        });
        if(!data){
            throw new BadRequestError("Cartão não encontrado ou sem permissão");
        }
        await prisma.card.delete({
            where: { id }
        });
        return data;
    }
    async findCard(id: string): Promise<Card | null> {
        const data = await prisma.card.findUnique({
            where: { id }
        });
        
        if(!data) return null;
        return new Card(
            data.id, 
            data.userId, 
            data.name,
            data.brand,
            data.last4Digits,
            data.limitTotal,
            data.limitRemaining,
            data.closingDay,
            data.dueDay,
            data.type
        );
    }
    async findAllByUserId(userId: string): Promise<Card[]> {
        const data = await prisma.card.findMany({
            where:{ userId }
        });

        return data.map(card => new Card(
            card.id, 
            card.userId, 
            card.name,
            card.brand,
            card.last4Digits,
            card.limitTotal,
            card.limitRemaining,
            card.closingDay,
            card.dueDay,
            card.type
        ));
    }

    async findByLast4Digits(userId: string, last4Digits: string): Promise<Card | null> {
        const data = await prisma.card.findFirst({
            where: {
                userId,
                last4Digits
            }
        });
        if(!data) return null;

        return new Card(
            data.id, 
            data.userId, 
            data.name,
            data.brand,
            data.last4Digits,
            data.limitTotal,
            data.limitRemaining,
            data.closingDay,
            data.dueDay,
            data.type
        );
    }

    async updateLimit(id: string, newLimitRemaining: Decimal, tx?: any): Promise<Card> {
        const client = tx || prisma;
        const data = await client.card.update({
            where: { id },
            data: { limitRemaining: newLimitRemaining }
        });
        return new Card(
            data.id, 
            data.userId, 
            data.name,
            data.brand,
            data.last4Digits,
            data.limitTotal,
            data.limitRemaining,
            data.closingDay,
            data.dueDay,
            data.type
        );
    }
}