-- AlterTable
ALTER TABLE "HomepageBlock" ADD COLUMN     "audioUrl" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "imageSize" SET DEFAULT 'w-[420px] h-[420px] lg:w-[600px] lg:h-[600px]';
