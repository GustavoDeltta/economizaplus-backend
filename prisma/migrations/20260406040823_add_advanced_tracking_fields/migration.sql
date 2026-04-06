/*
  Warnings:

  - You are about to drop the column `limit` on the `cards` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "WalletType" AS ENUM ('CHECKING_ACCOUNT', 'SAVINGS_ACCOUNT', 'CASH', 'INVESTMENT');

-- AlterTable
ALTER TABLE "cards" DROP COLUMN "limit",
ADD COLUMN     "closingDay" INTEGER,
ADD COLUMN     "dueDay" INTEGER,
ADD COLUMN     "limitRemaining" DECIMAL(15,2),
ADD COLUMN     "limitTotal" DECIMAL(15,2);

-- AlterTable
ALTER TABLE "goals" ADD COLUMN     "currentAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "percentageComplete" DECIMAL(15,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "wallets" ADD COLUMN     "type" "WalletType" NOT NULL DEFAULT 'CHECKING_ACCOUNT';
