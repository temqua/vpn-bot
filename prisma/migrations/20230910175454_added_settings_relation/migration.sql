-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "string_value" TEXT,
    "json_value" JSONB,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Settings_id_key" ON "Settings"("id");
