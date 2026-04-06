import { CardService } from "../../application/services/CardService";
import { CardController } from "../../interface/controllers/CardController";
import { CardRepository } from "../prisma/repositories/cardRepository";

export function makeCardController(){
    const repository = new CardRepository();
    const service = new CardService(repository);
    const controller = new CardController(service);
    
    return controller;
}