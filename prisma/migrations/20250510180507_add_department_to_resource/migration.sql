/*
  Warnings:

  - You are about to drop the column `dueDate` on the `Resource` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "dueDate",
ADD COLUMN     "department" TEXT;
