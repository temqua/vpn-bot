-- CreateTable
CREATE TABLE "VpnUser" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "createDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firstName" TEXT,
    "lastName" TEXT,
    "languageCode" TEXT,
    "telegramId" INTEGER,
    "phone" TEXT,

    CONSTRAINT "VpnUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialLink" (
    "id" SERIAL NOT NULL,
    "link" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VpnUser_username_key" ON "VpnUser"("username");

-- AddForeignKey
ALTER TABLE "SocialLink" ADD CONSTRAINT "SocialLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "VpnUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "VpnUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
