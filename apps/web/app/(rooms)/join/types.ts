
export interface Room {
  id: string;
  name: string;
  createdAt: string;
}

export interface RoomCardProps {
  room: Room;
  onJoin: (roomId: string) => void;
}

export interface RoomCreationPopupProps {
  onCreate: () => void;
  onCancel: () => void;
  newRoomName: string;
  setNewRoomName: (value: string) => void;
}