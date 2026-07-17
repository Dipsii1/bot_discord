-- CreateTable
CREATE TABLE "News" (
    "id" SERIAL NOT NULL,
    "guid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "summary" TEXT,
    "source" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "imageUrl" TEXT,
    "posted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "News_guid_key" ON "News"("guid");

-- CreateIndex
CREATE INDEX "News_source_category_idx" ON "News"("source", "category");

-- CreateIndex
CREATE INDEX "News_publishedAt_idx" ON "News"("publishedAt");
