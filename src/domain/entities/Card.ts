import { Decimal } from "@prisma/client/runtime/client";

export class Card{
    constructor(
        public id: string,
        public userId: string,
        public name: string,
        public brand: string,
        public last4Digits: string,
        public limitTotal: Decimal | null,
        public limitRemaining: Decimal | null,
        public closingDay: number | null,
        public dueDay: number | null,
        public type: string
    ){}
}