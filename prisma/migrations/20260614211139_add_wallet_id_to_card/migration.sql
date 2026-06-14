-- AlterTable
ALTER TABLE "cards" ADD COLUMN     "walletId" TEXT;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
