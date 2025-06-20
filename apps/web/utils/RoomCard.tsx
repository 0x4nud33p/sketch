import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui/card";
import { RoomCardProps } from "@/types/index";

export default function RoomCard({ room, onJoin }: RoomCardProps) {
  return (
    <Card
      className="bg-zinc-700 hover:bg-zinc-600 transition-colors cursor-pointer border-zinc-600"
      onClick={() => onJoin(room.id)}
    >
      <CardHeader>
        <CardTitle className="text-lg font-semibold truncate">
          {room.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-zinc-400">
          Created: {new Date(room.createdAt).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}
