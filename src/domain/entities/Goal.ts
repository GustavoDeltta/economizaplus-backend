import { Decimal } from "@prisma/client/runtime/client";

export class Goal {
    constructor(
        public id: string,
        public userId: string,
        public name: string,
        public targetAmount: Decimal,
        public deadline: Date
    ){}
}