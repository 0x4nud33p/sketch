-- DropForeignKey
ALTER TABLE "Drawing" DROP CONSTRAINT "Drawing_id_fkey";

-- AddForeignKey
ALTER TABLE "Drawing" ADD CONSTRAINT "Drawing_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
