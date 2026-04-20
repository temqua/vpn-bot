/*
  Warnings:

  - You are about to drop the column `createdAt` on the `audit_message_deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `error` on the `audit_message_deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `sentAt` on the `audit_message_deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `success` on the `audit_message_deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `assignedAt` on the `servers_users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "audit_message_deliveries" DROP COLUMN "createdAt",
DROP COLUMN "error",
DROP COLUMN "sentAt",
DROP COLUMN "success",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "servers_users" DROP COLUMN "assignedAt",
ADD COLUMN     "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "audit_bot_api_request_exceptions" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "requestBody" JSONB,
    "requestHeaders" JSONB,

    CONSTRAINT "audit_bot_api_request_exceptions_pkey" PRIMARY KEY ("id")
);
