-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'GOOGLE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "authProvider" "AuthProvider" NOT NULL DEFAULT 'LOCAL',
ADD COLUMN     "passwordResetCode" TEXT,
ADD COLUMN     "passwordResetExpiresAt" TIMESTAMP(3);
