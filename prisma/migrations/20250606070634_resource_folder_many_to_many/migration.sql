/*
  Warnings:

  - You are about to drop the column `folderId` on the `Resource` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Resource" DROP CONSTRAINT "Resource_folderId_fkey";

-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "folderId";

-- AlterTable
ALTER TABLE "ResourceFolder" ADD COLUMN     "resourceCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ResourceFolderResource" (
    "resourceId" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResourceFolderResource_pkey" PRIMARY KEY ("resourceId","folderId")
);

-- AddForeignKey
ALTER TABLE "ResourceFolderResource" ADD CONSTRAINT "ResourceFolderResource_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceFolderResource" ADD CONSTRAINT "ResourceFolderResource_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "ResourceFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
