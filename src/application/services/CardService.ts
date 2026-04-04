import { randomUUID } from "node:crypto";
import { Card } from "../../domain/entities/Card";
import { InterfaceCardRepository } from "../../domain/repositories/InterfaceCardRepository";
import { BadRequestError } from "../../shared/errors/api-erros";
import { Decimal } from "@prisma/client/runtime/client";

export class CardService{
    constructor(private cardRepository: InterfaceCardRepository){}

    async createCard(userId: string, name: string, brand: string, last4Digits: string, limit: Decimal | null, type: string) {
        const exists = await this.cardRepository.findByLast4Digits(userId, last4Digits);
        if(exists){
            throw new BadRequestError("Cartão já cadastrado para esse usuário");
        }
        
        const newCard = new Card(randomUUID(), userId, name, brand, last4Digits, limit, type);

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

    async updateCard(id: string, userId:string, name: string, brand: string, last4Digits: string, limit: Decimal | null, type: string) {
        const exists = await this.cardRepository.findCard(id);
        if(!exists){
            throw new BadRequestError("Cartão não cadastrado");
        }
        if(exists.userId !== userId){
            throw new BadRequestError("Cartão não pertence ao usuário");
        }

        const card = await this.cardRepository.update(id, userId, name, brand, last4Digits, limit, type);

        
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