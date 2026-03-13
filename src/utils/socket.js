const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "https://dlksoftwaresolutions.co.in/admin",
        "https://dlksoftwaresolutions.co.in",
        "https://www.dlksoftwaresolutions.co.in",
        "https://admin.dlksoftwaresolutions.co.in",
      ],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("⚡ Admin connected:", socket.id);
    
    socket.on("disconnect", () => {
      console.log("🔌 Admin disconnected:", socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initSocket, getIO };
