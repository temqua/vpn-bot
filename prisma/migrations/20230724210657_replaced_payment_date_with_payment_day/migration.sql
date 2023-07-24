/*
  Warnings:

  - You are about to drop the column `payment_date` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "payment_date",
ADD COLUMN     "payment_day" INTEGER;
