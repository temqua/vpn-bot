-- CreateEnum
CREATE TYPE "SpendingCategory" AS ENUM ('Nalog', 'Servers');

-- CreateTable
CREATE TABLE "spendings" (
    "id" TEXT NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "category" "SpendingCategory" NOT NULL,
    "description" TEXT,

    CONSTRAINT "spendings_pkey" PRIMARY KEY ("id")
);
