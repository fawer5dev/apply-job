-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('FREE', 'PROFESSIONAL');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "accountType" "AccountType" NOT NULL DEFAULT 'FREE';
