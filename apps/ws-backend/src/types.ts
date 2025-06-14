
export interface Drawing {
    type: 'pencil' | 'rectangle' | 'circle';
    points?: [number, number][];
    startPoint?: { x: number; y: number };
    width?: number;
    height?: number;
    center?: { x: number; y: number };
    radius?: number;
    color: string;
    size?: number;
    timestamp?: number;
    id?: string;
    [key: string]: any;
  }
  
 export interface WebSocketWithRoom extends WebSocket {
    on(arg0: string, arg1: (message: Buffer) => Promise<void>): unknown;
    ping(): unknown;
    room?: string;
    id: string;
    lastPing?: number;
  }
  
  export interface RoomData {
    clients: Set<WebSocketWithRoom>;
    drawings: Drawing[];
    lastActivity: number;
  }
  