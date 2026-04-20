/*
  Warnings:

  - You are about to drop the `audit_message_deliveries` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "audit_message_deliveries" DROP CONSTRAINT "audit_message_deliveries_user_id_fkey";

-- DropTable
DROP TABLE "audit_message_deliveries";

-- CreateTable
CREATE TABLE "user_messages_delivered" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_messages_delivered_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_messages_delivered" ADD CONSTRAINT "user_messages_delivered_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
