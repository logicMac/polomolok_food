import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
export declare const initializeSocket: (server: HTTPServer) => SocketIOServer;
export declare const getIO: () => SocketIOServer;
export declare const emitOrderUpdate: (orderId: string, orderData: any) => void;
export declare const emitDriverLocation: (orderId: string, location: {
    latitude: number;
    longitude: number;
}) => void;
//# sourceMappingURL=socket.d.ts.map