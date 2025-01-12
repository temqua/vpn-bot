/*
  Warnings:

  - You are about to drop the column `parent_id` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "parent_id",
ADD COLUMN     "payer_id" INTEGER;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_payer_id_fkey" FOREIGN KEY ("payer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
