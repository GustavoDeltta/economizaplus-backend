-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'custom',
ALTER COLUMN "userId" DROP NOT NULL;
