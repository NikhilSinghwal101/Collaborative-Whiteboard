import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./RoomJoin.css";

export default function RoomJoin() {
  const [roomCode, setRoomCode] = useState("");
  const navigate = useNavigate();

  const joinRoom = async () => {
    if (!roomCode) return;
    await axios.post("/api/rooms/join", { roomId: roomCode });
    navigate(`/room/${roomCode}`);
  };

  return (
    <div className="room-join-container">
      <h1 className="title">Collaborative Whiteboard</h1>
      <input
        className="input"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
        placeholder="Enter Room Code"
      />
      <button className="join-button" onClick={joinRoom}>
        Join Room
      </button>
    </div>
  );
}


