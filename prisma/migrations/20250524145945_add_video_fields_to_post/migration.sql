/*
  Warnings:

  - You are about to drop the column `uploadedBy` on the `Resource` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "video" TEXT,
ADD COLUMN     "videoPoster" TEXT;

-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "uploadedBy";
