export interface CreateWalletDTO {
    name: string;
    type: string;
    balance?: number;
}

export interface WalletResponseDTO {
    id: string;
    name: string;
    type: string;
    balance: number;
    createdAt: Date;
}
