/*
  Warnings:

  - You are about to drop the `user_messages_delivered` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_messages_delivered" DROP CONSTRAINT "user_messages_delivered_user_id_fkey";

-- DropTable
DROP TABLE "user_messages_delivered";

-- CreateTable
CREATE TABLE "user_delivered_messages" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_delivered_messages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_delivered_messages" ADD CONSTRAINT "user_delivered_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
