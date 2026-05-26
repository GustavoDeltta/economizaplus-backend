/*
  Warnings:

  - Added the required column `icon` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `goals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `walletId` to the `goals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "icon" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "goals" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "walletId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
