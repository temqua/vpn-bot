-- CreateEnum
CREATE TYPE "device_os" AS ENUM ('Android', 'iOS');

-- CreateEnum
CREATE TYPE "desktop_os" AS ENUM ('Windows', 'macOS', 'Linux');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "telegram_id" INTEGER,
    "telegram_link" TEXT NOT NULL,
    "phone" TEXT,
    "create_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "first_name" TEXT,
    "last_name" TEXT,
    "language_code" TEXT DEFAULT 'ru',
    "desktop_os" "desktop_os" NOT NULL,
    "device_os" "device_os" NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
