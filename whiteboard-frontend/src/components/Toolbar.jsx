import React from "react";

export default function Toolbar({ setColor, setWidth, clearCanvas }) {
  return (
    <div
      // style={{ padding: 10, background: "#eee", display: "flex", gap: 10 }}
      style={{ display: "flex", alignItems: "center", gap: "15px"}}
    >
      {/* <label className="toolbar-label">Color: </label> */}
      {/* <select onChange={e => setColor(e.target.value)}>
        <option value="black">Black</option>
        <option value="red">Red</option>
        <option value="blue">Blue</option>
        <option value="green">Green</option>
      </select> */}

      <label className="toolbar-label">
        🎨
        <input
          type="color"
          onChange={(e) => setColor(e.target.value)}
          className="color-picker"
        />
      </label>
      {/* 
      <label className="toolbar-label">Stroke: </label>
      <input
        type="range"
        min="1"
        max="10"
        onChange={(e) => setWidth(e.target.value)}
      /> */}

      <label className="toolbar-label">
        ✏️
        <input
          type="range"
          min="1"
          max="20"
          defaultValue="2"
          onChange={(e) => setWidth(parseInt(e.target.value))}
          className="stroke-slider"
        />
      </label>

      {/* <button onClick={clearCanvas}>Clear Canvas</button> */}
      <button className="clear-button" onClick={clearCanvas}>
        🧹 Clear
      </button>
    </div>
  );
}
