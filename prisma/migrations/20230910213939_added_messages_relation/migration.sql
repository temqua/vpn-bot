-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "en" TEXT,
    "ru" TEXT,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "messages_id_key" ON "messages"("id");
