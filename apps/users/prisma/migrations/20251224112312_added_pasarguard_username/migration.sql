/*
  Warnings:

  - A unique constraint covering the columns `[pasarguard_username]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "pasarguard_username" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_pasarguard_username_key" ON "users"("pasarguard_username");
