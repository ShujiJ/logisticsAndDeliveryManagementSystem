import { Server } from "socket.io";

let io: Server;

export const initSocket = (httpServer: any): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // Client joins the chat room for a specific shipment
    socket.on("join_chat", (shipmentId: string | number) => {
      socket.join(`chat:${shipmentId}`);
    });

    // Client leaves the chat room
    socket.on("leave_chat", (shipmentId: string | number) => {
      socket.leave(`chat:${shipmentId}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
