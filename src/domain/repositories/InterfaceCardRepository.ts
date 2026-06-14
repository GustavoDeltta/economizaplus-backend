import { Decimal } from "@prisma/client/runtime/client";
import { Card } from "../entities/Card";

export interface InterfaceCardRepository {
  create(card: Card): Promise<Card>;
  update(
    id: string,
    userId: string,
    name: string,
    brand: string,
    last4digits: string,
    limitTotal: Decimal | null,
    limitRemaining: Decimal | null,
    closingDay: number | null,
    dueDay: number | null,
    type: string,
    walletId: string | null,
  ): Promise<Card>;
  delete(id: string, userId: string): Promise<Card | null>;
  findCard(id: string): Promise<Card | null>;
  findAllByUserId(userId: string): Promise<Card[]>;
  findByLast4Digits(userId: string, last4Digits: string): Promise<Card | null>;
  updateLimit(id: string, newLimitRemaining: Decimal, tx?: any): Promise<Card>;
}
