import React, { useState, useEffect } from "react";
import RoomJoin from "./components/RoomJoin";
import Whiteboard from "./components/Whiteboard";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

export default function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("dark") === "true");

  useEffect(() => {
    localStorage.setItem("dark", darkMode);
    document.body.className = darkMode ? "dark" : "light";
  }, [darkMode]);

  return (
    <Router>
      <div className={`app-container ${darkMode ? "dark" : "light"}`}>
        <Routes>
          <Route path="/" element={<RoomJoin />} />
          <Route path="/room/:roomId" element={<Whiteboard darkMode={darkMode} setDarkMode={setDarkMode} />} />
        </Routes>
      </div>
    </Router>
  );
}