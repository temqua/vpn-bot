/*
  Warnings:

  - A unique constraint covering the columns `[telegram_username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "users_telegram_username_key" ON "users"("telegram_username");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");
