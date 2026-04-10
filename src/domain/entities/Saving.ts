import { Decimal } from "@prisma/client/runtime/client";

export class Saving {
    constructor(
        public id: string | null,
        public userId: string,
        public goalId: string,
        public walletId: string,
        public amount: Decimal,
        public createdAt?: Date
    ){}
}
