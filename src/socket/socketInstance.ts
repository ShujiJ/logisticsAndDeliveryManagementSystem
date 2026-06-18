import { Server } from "socket.io";

let io: Server;

export const initSocket = (httpServer: any): Server => {
  const allowedOrigins = [
    "https://ldms-lac.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
  ];

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
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
