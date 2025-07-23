import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import jsPDF from "jspdf";
import DrawingCanvas from "./DrawingCanvas";
import Toolbar from "./Toolbar";
import "./RoomJoin.css";

const socket = io("http://localhost:4000");

export default function Whiteboard({ darkMode, setDarkMode }) {
  const canvasRef = useRef(null);
  const { roomId } = useParams();
  const [color, setColor] = useState("black");
  const [width, setWidth] = useState(2);
  const [userCount, setUserCount] = useState(1);
  const [joinAnimation, setJoinAnimation] = useState(false);

  useEffect(() => {
    socket.emit("join-room", { roomId });
    socket.on("user-count", (count) => {
      setUserCount(count);
      setJoinAnimation(true);
      setTimeout(() => setJoinAnimation(false), 1000);
    });

    return () => {
      socket.emit("leave-room", { roomId });
    };
  }, [roomId]);

  // const saveCanvas = () => {
  //   const canvas = document.querySelector("canvas");
  //   const link = document.createElement("a");
  //   link.download = `whiteboard-${roomId}.png`;
  //   link.href = canvas.toDataURL("image/png");
  //   link.click();
  // };

  const saveAsPDF = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const imgData = canvas.toDataURL("image/png");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Optional: preserve aspect ratio
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

    const newWidth = imgWidth * ratio;
    const newHeight = imgHeight * ratio;

    pdf.addImage(imgData, "PNG", 10, 10, newWidth, newHeight);
    pdf.save("whiteboard.pdf");
  };

  return (
    <div className="canvas-container">
      <div className="canvas-toolbar">
        <Toolbar
          setColor={setColor}
          setWidth={setWidth}
          clearCanvas={() => socket.emit("clear-canvas", { roomId })}
        />
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "🌞 Light" : "🌙 Dark"}
          </button>
          {/* <button onClick={saveCanvas}>💾 Save</button> */}
          <button onClick={saveAsPDF}>💾 Save</button>
          <span className={joinAnimation ? "pulse" : ""}>👥 {userCount}</span>
        </div>
      </div>
      <div className="canvas-board">
        <DrawingCanvas
          socket={socket}
          roomId={roomId}
          color={color}
          width={width}
          canvasRef={canvasRef}
        />
      </div>
    </div>
  );
}

//-------------------------------------------------------------

// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import io from "socket.io-client";
// import DrawingCanvas from "./DrawingCanvas";
// import Toolbar from "./Toolbar";

// const socket = io("http://localhost:4000");
// const joinSound = new Audio("/join.mp3");
// const leaveSound = new Audio("/leave.mp3");

// export default function Whiteboard() {
//   const { roomId } = useParams();
//   const [color, setColor] = useState("black");
//   const [width, setWidth] = useState(2);
//   const [userCount, setUserCount] = useState(1);
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [userMessage, setUserMessage] = useState("");

//   useEffect(() => {
//     socket.emit("join-room", { roomId });
//     socket.on("user-count", (count) => {
//       setUserCount(count);
//       joinSound.play();
//       showTemporaryMessage("+1 user joined");
//     });

//     socket.on("user-left", (count) => {
//       setUserCount(count);
//       leaveSound.play();
//       showTemporaryMessage("-1 user left");
//     });

//     return () => {
//       socket.emit("leave-room", { roomId });
//     };
//   }, [roomId]);

//   const showTemporaryMessage = (msg) => {
//     setUserMessage(msg);
//     setTimeout(() => setUserMessage(""), 3000);
//   };

//   return (
//     <div className={`app-container ${isDarkMode ? "dark" : "light"}`}>
//       <Toolbar
//         setColor={setColor}
//         setWidth={setWidth}
//         clearCanvas={() => socket.emit("clear-canvas", { roomId })}
//         isDarkMode={isDarkMode}
//         toggleDarkMode={() => setIsDarkMode((prev) => !prev)}
//       />
//       <div className="canvas-meta">
//         <p>🧑 Users Online: {userCount}</p>
//         {userMessage && <span className="user-msg">{userMessage}</span>}
//       </div>
//       <DrawingCanvas
//         socket={socket}
//         roomId={roomId}
//         color={color}
//         width={width}
//         isDarkMode={isDarkMode}
//       />
//     </div>
//   );
// }
