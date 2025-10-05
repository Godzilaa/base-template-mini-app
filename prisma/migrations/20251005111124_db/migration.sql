-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('BUSINESS', 'WORKER', 'BOTH');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'BOTH',
    "username" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "chainCampaignId" INTEGER NOT NULL,
    "businessOwnerId" TEXT NOT NULL,
    "reviewLink" TEXT NOT NULL,
    "totalPool" TEXT NOT NULL,
    "rewardAmount" TEXT NOT NULL,
    "claimedReviews" INTEGER NOT NULL DEFAULT 0,
    "maxReviews" INTEGER NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'ACTIVE',
    "txHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_submissions" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "proofLink" TEXT NOT NULL,
    "txHash" TEXT,
    "rewardAmount" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_walletAddress_key" ON "users"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "campaigns_chainCampaignId_key" ON "campaigns"("chainCampaignId");

-- CreateIndex
CREATE UNIQUE INDEX "review_submissions_campaignId_workerId_key" ON "review_submissions"("campaignId", "workerId");

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_businessOwnerId_fkey" FOREIGN KEY ("businessOwnerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_submissions" ADD CONSTRAINT "review_submissions_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_submissions" ADD CONSTRAINT "review_submissions_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
