-- AlterTable
ALTER TABLE "plans" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'RUB';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'RUB';
