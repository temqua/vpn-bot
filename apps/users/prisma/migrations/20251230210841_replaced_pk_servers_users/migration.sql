/*
  Warnings:

  - The primary key for the `servers_users` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "servers_users" DROP CONSTRAINT "servers_users_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "servers_users_pkey" PRIMARY KEY ("id");
