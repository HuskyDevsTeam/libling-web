-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "thumbnailWebp" TEXT;

-- AlterTable
ALTER TABLE "PropertyImage" ADD COLUMN     "originalKey" TEXT,
ADD COLUMN     "thumbPath" TEXT;
