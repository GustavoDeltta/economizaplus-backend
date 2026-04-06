import { Decimal } from "@prisma/client/runtime/client";

export class Transaction {
    constructor(
        public id: string | null,
        public userId: string,
        public walletId: string,
        public type: string, // INCOME, EXPENSE, TRANSFER
        public paymentMethod: string, // CASH, CREDIT_CARD, DEBIT_CARD, PIX, BANK_TRANSFER
        public amount: Decimal,
        public transactionDate: Date,
        public categoryId?: string | null,
        public goal_id?: string | null,
        public cardId?: string | null,
        public description?: string | null,
        public isInstallment: boolean = false,
        public installmentNumber?: number | null,
        public totalInstallments?: number | null,
        public parentTransactionId?: string | null,
        public createdAt?: Date
    ) {}
}
