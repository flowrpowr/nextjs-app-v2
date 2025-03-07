/*
  Warnings:

  - You are about to drop the `_LikedTracks` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_LikedTracks" DROP CONSTRAINT "_LikedTracks_A_fkey";

-- DropForeignKey
ALTER TABLE "_LikedTracks" DROP CONSTRAINT "_LikedTracks_B_fkey";

-- DropTable
DROP TABLE "_LikedTracks";

-- CreateTable
CREATE TABLE "_likedTracks" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_likedTracks_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_likedTracks_B_index" ON "_likedTracks"("B");

-- AddForeignKey
ALTER TABLE "_likedTracks" ADD CONSTRAINT "_likedTracks_A_fkey" FOREIGN KEY ("A") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_likedTracks" ADD CONSTRAINT "_likedTracks_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
