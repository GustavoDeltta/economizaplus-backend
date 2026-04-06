import { randomUUID } from "node:crypto";
import { Card } from "../../domain/entities/Card";
import { InterfaceCardRepository } from "../../domain/repositories/InterfaceCardRepository";
import { BadRequestError } from "../../shared/errors/api-erros";
import { Decimal } from "@prisma/client/runtime/client";

export class CardService{
    constructor(private cardRepository: InterfaceCardRepository){}

    async createCard(userId: string, name: string, brand: string, last4Digits: string, limitTotal: Decimal | null, limitRemaining: Decimal | null, closingDay: number | null, dueDay: number | null, type: string) {
        const exists = await this.cardRepository.findByLast4Digits(userId, last4Digits);
        if(exists){
            throw new BadRequestError("Cartão já cadastrado para esse usuário");
        }
        
        // If limitRemaining is not provided, default it to limitTotal
        const remaining = limitRemaining ?? limitTotal;

        const newCard = new Card(randomUUID(), userId, name, brand, last4Digits, limitTotal, remaining, closingDay, dueDay, type);

        return this.cardRepository.create(newCard);
    }

    async getAllCardsByUserId(userId: string) {
        return this.cardRepository.findAllByUserId(userId);
    }

    async getCardById(userId: string, id: string) {
        const exists = await this.cardRepository.findCard(id);
        if(!exists){
            throw new BadRequestError("Cartão não cadastrado");
        }
        if(exists.userId !== userId){
            throw new BadRequestError("Cartão não pertence ao usuário");
        }
        return this.cardRepository.findCard(id);
    }

    async updateCard(id: string, userId:string, name: string, brand: string, last4Digits: string, limitTotal: Decimal | null, limitRemaining: Decimal | null | undefined, closingDay: number | null, dueDay: number | null, type: string) {
        const exists = await this.cardRepository.findCard(id);
        if(!exists){
            throw new BadRequestError("Cartão não cadastrado");
        }
        if(exists.userId !== userId){
            throw new BadRequestError("Cartão não pertence ao usuário");
        }

        // Logical check: If setting limitTotal (or updating it) 
        // and limitRemaining is not provided, initialize it if it's currently null.
        let finalRemaining = limitRemaining;
        if (limitTotal && finalRemaining === undefined) {
             // If we're setting Total for the first time (e.g. migration case from limit -> limitTotal/limitRemaining)
             if (exists.limitRemaining === null) {
                 finalRemaining = limitTotal;
             } else {
                 // Otherwise, we keep the existing remainingValue if it wasn't provided
                 finalRemaining = exists.limitRemaining;
             }
        } else if (finalRemaining === undefined) {
            // If neither is provided, keep old value
             finalRemaining = exists.limitRemaining;
        }

        const card = await this.cardRepository.update(id, userId, name, brand, last4Digits, limitTotal, finalRemaining, closingDay, dueDay, type);

        return card;
    }

    async deleteCard(userId: string, id: string) {
        const exists = await this.cardRepository.findCard(id);
        if(!exists){
            throw new BadRequestError("Cartão não cadastrado");
        }
        if(exists.userId !== userId){
            throw new BadRequestError("Cartão não pertence ao usuário");
        }
        return this.cardRepository.delete(id, userId);
    }
}