import { Decimal } from "@prisma/client/runtime/client";

export class Card{
    constructor(
        public id: string,
        public userId: string,
        public name: string,
        public brand: string,
        public last4Digits: string,
        public limit: Decimal | null,
        public type: string
    ){}
}