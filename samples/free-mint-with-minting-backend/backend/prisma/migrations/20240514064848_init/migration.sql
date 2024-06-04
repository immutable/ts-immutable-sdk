-- CreateTable
CREATE TABLE "im_assets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetId" TEXT NOT NULL,
    "ownerAddress" TEXT NOT NULL,
    "metadata" TEXT,
    "tokenId" TEXT,
    "contractAddress" TEXT NOT NULL,
    "error" TEXT,
    "mintingStatus" TEXT,
    "metadataId" TEXT,
    "triedCount" INTEGER NOT NULL DEFAULT 0,
    "lastImtblZkevmMintRequestUpdatedId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "im_assets_assetId_contractAddress_key" ON "im_assets"("assetId", "contractAddress");
