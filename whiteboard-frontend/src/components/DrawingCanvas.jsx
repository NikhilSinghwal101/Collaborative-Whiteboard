import React, { useRef, useEffect, useState } from "react";

export default function DrawingCanvas({ socket, roomId, color, width, canvasRef }) {
  // const canvasRef = useRef(null);   // canvasRef directly pass as a prop from Whiteboard.jsx
  const ctxRef = useRef(null);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctxRef.current = ctx;

    socket.on("draw", drawFromServer);
    socket.on("clear-canvas", () => ctx.clearRect(0, 0, canvas.width, canvas.height));

    return () => {
      socket.off("draw");
      socket.off("clear-canvas");
    };
  }, [canvasRef, socket]);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX, offsetY);
    setDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!drawing) return;
    const { offsetX, offsetY } = nativeEvent;
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.strokeStyle = color;
    ctxRef.current.lineWidth = width;
    ctxRef.current.stroke();
    socket.emit("draw", { roomId, data: { offsetX, offsetY, color, width } });
  };

  const stopDrawing = () => {
    ctxRef.current.closePath();
    setDrawing(false);
  };

  const drawFromServer = ({ offsetX, offsetY, color, width }) => {
    ctxRef.current.strokeStyle = color;
    ctxRef.current.lineWidth = width;
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      style={{ border: "1px solid #ccc" }}
    />
  );
}

//------------------------------------------------------------------------------


// import React, { useEffect, useRef, useState } from "react";
// import { jsPDF } from "jspdf";

// export default function DrawingCanvas({ socket, roomId, color, width, isDarkMode }) {
//   const canvasRef = useRef(null);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [paths, setPaths] = useState([]);
//   const [redoStack, setRedoStack] = useState([]);
//   const [userCursors, setUserCursors] = useState({});
//   const ctxRef = useRef(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight - 60;
//     canvas.style.background = isDarkMode ? "#121212" : "#fff";

//     const ctx = canvas.getContext("2d");
//     ctx.lineCap = "round";
//     ctxRef.current = ctx;

//     socket.on("drawing", onDrawEvent);
//     socket.on("clear-canvas", clearCanvas);
//     socket.on("user-cursor", updateUserCursor);

//     return () => {
//       socket.off("drawing", onDrawEvent);
//       socket.off("clear-canvas", clearCanvas);
//       socket.off("user-cursor", updateUserCursor);
//     };
//   }, [isDarkMode]);

//   const updateUserCursor = ({ id, x, y, color }) => {
//     setUserCursors((prev) => ({ ...prev, [id]: { x, y, color } }));
//     setTimeout(() => {
//       setUserCursors((prev) => {
//         const newCursors = { ...prev };
//         delete newCursors[id];
//         return newCursors;
//       });
//     }, 3000);
//   };

//   const drawPath = (path) => {
//     const ctx = ctxRef.current;
//     ctx.strokeStyle = path.color;
//     ctx.lineWidth = path.width;
//     ctx.beginPath();
//     ctx.moveTo(path.points[0].x, path.points[0].y);
//     path.points.forEach(p => ctx.lineTo(p.x, p.y));
//     ctx.stroke();
//   };

//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   const onDrawEvent = (data) => {
//     drawPath(data);
//     setPaths(prev => [...prev, data]);
//   };

//   const handleMouseDown = (e) => {
//     setIsDrawing(true);
//     const newPath = { color, width, points: [{ x: e.clientX, y: e.clientY }] };
//     setPaths(prev => [...prev, newPath]);
//     setRedoStack([]);
//   };

//   const handleMouseMove = (e) => {
//     if (!isDrawing) {
//       socket.emit("user-cursor", { roomId, x: e.clientX, y: e.clientY });
//       return;
//     }
//     // const canvas = canvasRef.current;
//     const ctx = ctxRef.current;
//     const currentPath = paths[paths.length - 1];
//     const point = { x: e.clientX, y: e.clientY };
//     currentPath.points.push(point);
//     ctx.lineTo(point.x, point.y);
//     ctx.stroke();
//   };

//   const handleMouseUp = () => {
//     setIsDrawing(false);
//     const newPath = paths[paths.length - 1];
//     socket.emit("drawing", { roomId, ...newPath });
//   };

//   const clearCanvas = () => {
//     const canvas = canvasRef.current;
//     ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
//     setPaths([]);
//     setRedoStack([]);
//   };

//   const undo = () => {
//     if (paths.length === 0) return;
//     const newPaths = [...paths];
//     const last = newPaths.pop();
//     setRedoStack([...redoStack, last]);
//     setPaths(newPaths);
//     redraw(newPaths);
//   };

//   const redo = () => {
//     if (redoStack.length === 0) return;
//     const recovered = redoStack.pop();
//     const newPaths = [...paths, recovered];
//     setPaths(newPaths);
//     redraw(newPaths);
//   };

//   const redraw = (allPaths) => {
//     clearCanvas();
//     allPaths.forEach(drawPath);
//   };

//   const saveAsPDF = () => {
//     const canvas = canvasRef.current;
//     const pdf = new jsPDF();
//     const img = canvas.toDataURL("image/png");
//     pdf.addImage(img, "PNG", 10, 10, 180, 150);
//     pdf.save("whiteboard.pdf");
//   };

//   return (
//     <div className="canvas-board">
//       <canvas
//         ref={canvasRef}
//         onMouseDown={handleMouseDown}
//         onMouseMove={handleMouseMove}
//         onMouseUp={handleMouseUp}
//       />
//       {Object.entries(userCursors).map(([id, cursor]) => (
//         <div
//           key={id}
//           style={{
//             position: "absolute",
//             left: cursor.x,
//             top: cursor.y,
//             width: 10,
//             height: 10,
//             backgroundColor: cursor.color,
//             borderRadius: "50%",
//             pointerEvents: "none",
//           }}
//         />
//       ))}
//       <div className="canvas-toolbar-actions">
//         <button onClick={undo}>Undo</button>
//         <button onClick={redo}>Redo</button>
//         <button onClick={saveAsPDF}>Save as PDF</button>
//       </div>
//     </div>
//   );
// }


