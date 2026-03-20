/*
  Warnings:

  - You are about to drop the column `userId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `user_devices` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `user_protocols` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `user_devices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `user_protocols` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_devices" DROP CONSTRAINT "user_devices_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_protocols" DROP CONSTRAINT "user_protocols_userId_fkey";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "userId",
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "user_devices" DROP COLUMN "userId",
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "user_protocols" DROP COLUMN "userId",
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "user_devices" ADD CONSTRAINT "user_devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_protocols" ADD CONSTRAINT "user_protocols_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
