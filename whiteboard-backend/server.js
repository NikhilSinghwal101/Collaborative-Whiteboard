const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
const Room = require("./models/Room");
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI);

// Routes
app.post("/api/rooms/join", async (req, res) => {
  const { roomId } = req.body;
  let room = await Room.findOne({ roomId });
  if (!room) {
    room = new Room({ roomId });
    await room.save();
  }
  res.json({ success: true });
});

app.get("/api/rooms/:roomId", async (req, res) => {
  const room = await Room.findOne({ roomId: req.params.roomId });
  if (!room) return res.status(404).json({ error: "Room not found" });
  res.json(room);
});

// Socket events
io.on("connection", (socket) => {
  socket.on("join-room", ({ roomId }) => {
    socket.join(roomId);
    io.to(roomId).emit("user-count", io.sockets.adapter.rooms.get(roomId)?.size || 1);
  });

  socket.on("draw", ({ roomId, data }) => {
    socket.to(roomId).emit("draw", data);
  });

  socket.on("cursor-move", ({ roomId, cursor }) => {
    socket.to(roomId).emit("cursor-move", { socketId: socket.id, cursor });
  });

  socket.on("clear-canvas", ({ roomId }) => {
    socket.to(roomId).emit("clear-canvas");
  });

  socket.on("leave-room", ({ roomId }) => {
    socket.leave(roomId);
    io.to(roomId).emit("user-count", io.sockets.adapter.rooms.get(roomId)?.size || 0);
  });

  socket.on("disconnecting", () => {
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) {
        socket.to(roomId).emit("user-count", io.sockets.adapter.rooms.get(roomId)?.size - 1 || 0);
      }
    }
  });
});

server.listen(4000, () => console.log("Server running on port 4000"));


