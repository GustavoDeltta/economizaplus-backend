import { Decimal } from "@prisma/client/runtime/client";

export class Wallet {
    constructor(
        public id: string | null,
        public userId: string,
        public name: string,
        public type: string,
        public balance: Decimal,
        public createdAt?: Date
    ) {}
}
