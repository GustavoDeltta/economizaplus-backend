export interface CreateTransactionDTO {
    walletId: string;
    type: string; // INCOME, EXPENSE, TRANSFER
    paymentMethod: string; // CASH, CREDIT_CARD, DEBIT_CARD, PIX, BANK_TRANSFER
    amount: number;
    transactionDate: Date;
    categoryId?: string;
    goal_id?: string;
    cardId?: string;
    description?: string;
    isInstallment?: boolean;
    totalInstallments?: number;
    destinationWalletId?: string; // Only for TRANSFER
}

export interface TransactionResponseDTO {
    id: string;
    userId: string;
    walletId: string;
    type: string;
    paymentMethod: string;
    amount: number;
    transactionDate: Date;
    description: string | null;
    categoryId: string | null;
    goal_id: string | null;
    cardId: string | null;
    isInstallment: boolean;
    installmentNumber: number | null;
    totalInstallments: number | null;
    parentTransactionId: string | null;
    createdAt: Date;
}
