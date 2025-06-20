import { Button } from "@repo/ui/button";
import { RoomCreationPopupProps } from "@/types/index";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";

export default function RoomCreationPopup({
    onCreate,
    onCancel,
    newRoomName,
    setNewRoomName,
  }: RoomCreationPopupProps) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
        <Card className="w-full max-w-md bg-zinc-800 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-center">
              Create New Room
            </CardTitle>
          </CardHeader>
  
          <CardContent className="space-y-4 p-6">
            <input
              type="text"
              placeholder="Enter Room Name"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              className="w-full p-3 rounded-lg bg-zinc-700 text-white border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && onCreate()}
            />
  
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-yellow-200 hover:bg-yellow-300 text-zinc-900 font-medium"
                onClick={onCreate}
                disabled={!newRoomName.trim()}
              >
                Create
              </Button>
              <Button
                className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-white font-medium"
                onClick={onCancel}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  