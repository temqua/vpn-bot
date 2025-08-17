/*
  Warnings:

  - You are about to drop the column `paymentDate` on the `payments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payments" DROP COLUMN "paymentDate",
ADD COLUMN     "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
