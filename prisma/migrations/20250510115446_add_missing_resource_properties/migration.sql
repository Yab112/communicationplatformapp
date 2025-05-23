-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "fileType" TEXT,
ADD COLUMN     "subject" TEXT,
ADD COLUMN     "uploadDate" TIMESTAMP(3),
ADD COLUMN     "uploadedBy" TEXT;
